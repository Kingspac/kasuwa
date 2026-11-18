import { Router } from 'express'
import mongoose from 'mongoose'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { auth, adminOnly } from '../middleware/auth.js'
import { ORDER_STATUSES, shippingFor } from '../constants.js'
import HttpError from '../utils/HttpError.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()
router.use(auth) // every order route needs a logged-in user

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

function parseShipping(input) {
  const s = input || {}
  const shipping = {
    fullName: text(s.fullName, 80),
    phone: text(s.phone, 20),
    address: text(s.address, 200),
    city: text(s.city, 60),
    state: text(s.state, 60),
  }
  const labels = { fullName: 'full name', phone: 'phone number', address: 'address', city: 'city', state: 'state' }
  for (const key of Object.keys(labels)) {
    if (!shipping[key]) throw new HttpError(400, `Please enter your ${labels[key]}`)
  }
  if (!/^[+\d][\d\s-]{6,18}$/.test(shipping.phone)) {
    throw new HttpError(400, 'Enter a valid phone number')
  }
  return shipping
}

// Put the units of every item in an order back into stock.
const restock = (order) =>
  Promise.all(
    order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })),
  )

const checkId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Order not found')
}

// Create an order. The client sends ONLY product ids and quantities. Prices,
// shipping and totals are calculated here from the database, never trusted
// from the browser.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { items, shipping, paymentMethod = 'paystack' } = req.body || {}
    if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, 'Your cart is empty')
    if (items.length > 30) throw new HttpError(400, 'Too many items in one order')
    if (!['paystack', 'cod'].includes(paymentMethod)) {
      throw new HttpError(400, 'Choose a valid payment method')
    }
    const address = parseShipping(shipping)

    // 1) Validate the cart and merge duplicate lines (same product + size).
    const wanted = new Map()
    for (const it of items) {
      const qty = Number(it && it.qty)
      if (!it || !mongoose.isValidObjectId(it.productId) || !Number.isInteger(qty) || qty < 1 || qty > 20) {
        throw new HttpError(400, 'Invalid item in your cart')
      }
      const size = text(it.size, 10)
      const key = `${it.productId}|${size}`
      const prev = wanted.get(key)
      wanted.set(key, { productId: String(it.productId), size, qty: (prev ? prev.qty : 0) + qty })
    }

    // 2) Load the real products and build the order lines from them.
    const ids = [...new Set([...wanted.values()].map((w) => w.productId))]
    const found = await Product.find({ _id: { $in: ids } })
    const byId = new Map(found.map((p) => [String(p._id), p]))

    const lines = []
    for (const w of wanted.values()) {
      const p = byId.get(w.productId)
      if (!p) throw new HttpError(404, 'An item in your cart is no longer available')
      if (p.sizes.length && !p.sizes.includes(w.size)) {
        throw new HttpError(400, `Please choose a size for "${p.name}"`)
      }
      lines.push({
        product: p._id,
        name: p.name,
        price: p.price,
        image: p.images[0] || '',
        size: p.sizes.length ? w.size : '',
        qty: w.qty,
      })
    }

    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0)
    const shippingFee = shippingFor(subtotal)

    // 3) Reserve stock with an ATOMIC update (only succeeds while enough stock
    //    remains). If anything fails, give back what we already reserved.
    const reserved = []
    try {
      for (const l of lines) {
        const ok = await Product.findOneAndUpdate(
          { _id: l.product, stock: { $gte: l.qty } },
          { $inc: { stock: -l.qty } },
        )
        if (!ok) throw new HttpError(409, `Sorry, "${l.name}" does not have enough stock`)
        reserved.push(l)
      }
      const order = await Order.create({
        user: req.user._id,
        items: lines,
        shipping: address,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
        paymentMethod,
      })
      res.status(201).json(order)
    } catch (err) {
      await Promise.all(
        reserved.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: l.qty } })),
      )
      throw err
    }
  }),
)

// My orders (newest first). Defined BEFORE '/:id' so "mine" is not read as an id.
router.get(
  '/mine',
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(orders)
  }),
)

// Admin: all orders, optional ?status=pending
router.get(
  '/',
  adminOnly,
  asyncHandler(async (req, res) => {
    const filter = ORDER_STATUSES.includes(req.query.status) ? { status: req.query.status } : {}
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('user', 'name email')
    res.json(orders)
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    checkId(req.params.id)
    const order = await Order.findById(req.params.id)
    const mine = order && String(order.user) === String(req.user._id)
    // Hide other people's orders by answering "not found".
    if (!order || (!mine && req.user.role !== 'admin')) throw new HttpError(404, 'Order not found')
    res.json(order)
  }),
)

// A customer can cancel only while the order is pending and unpaid.
router.post(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    checkId(req.params.id)
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: 'pending', paymentStatus: 'unpaid' },
      { status: 'cancelled' },
      { new: true },
    )
    if (!order) throw new HttpError(400, 'This order can no longer be cancelled')
    await restock(order)
    res.json(order)
  }),
)

// Admin: move an order through pending > processing > shipped > delivered, or cancel.
router.put(
  '/:id/status',
  adminOnly,
  asyncHandler(async (req, res) => {
    checkId(req.params.id)
    const { status } = req.body || {}
    if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, 'Invalid status')

    const update = { status }
    // Cash on delivery counts as paid once it is delivered.
    if (status === 'delivered') update.paymentStatus = 'paid'

    // The filter makes sure a cancelled order can never be changed again,
    // which also guarantees we restock only once.
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, status: { $ne: 'cancelled' } },
      update,
      { new: true },
    )
    if (!order) throw new HttpError(400, 'Order not found or already cancelled')
    if (status === 'cancelled') await restock(order)
    res.json(order)
  }),
)

export default router
