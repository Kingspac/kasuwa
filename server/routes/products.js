import { Router } from 'express'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import { auth, adminOnly } from '../middleware/auth.js'
import { CATEGORIES } from '../constants.js'
import HttpError from '../utils/HttpError.js'
import asyncHandler from '../utils/asyncHandler.js'
import pick from '../utils/pick.js'

const router = Router()

const FIELDS = ['name', 'description', 'price', 'category', 'images', 'sizes', 'stock', 'featured', 'handmade', 'maker']
const SORTS = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
}

// Escape special characters so a search like "a+b(" cannot break the regex.
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

router.get('/categories', (_req, res) => res.json(CATEGORIES))

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=&featured=true
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, category, minPrice, maxPrice, sort, featured } = req.query
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit) || 12))

    const filter = {}
    if (typeof search === 'string' && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), 'i')
      filter.$or = [{ name: rx }, { description: rx }, { category: rx }]
    }
    if (typeof category === 'string' && CATEGORIES.includes(category)) {
      filter.category = category
    }
    const price = {}
    if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))) {
      price.$gte = Number(minPrice)
    }
    if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) {
      price.$lte = Number(maxPrice)
    }
    if (Object.keys(price).length) filter.price = price
    if (featured === 'true') filter.featured = true

    const order = typeof sort === 'string' && Object.hasOwn(SORTS, sort) ? SORTS[sort] : SORTS.newest

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(order)
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ])
    res.json({ products, page, pages: Math.max(1, Math.ceil(total / limit)), total })
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Product not found')
    const product = await Product.findById(req.params.id)
    if (!product) throw new HttpError(404, 'Product not found')
    res.json(product)
  }),
)

// ---- Admin only below ----
router.post(
  '/',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const product = await Product.create(pick(req.body, FIELDS))
    res.status(201).json(product)
  }),
)

router.put(
  '/:id',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Product not found')
    const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body, FIELDS), {
      new: true,
      runValidators: true,
    })
    if (!product) throw new HttpError(404, 'Product not found')
    res.json(product)
  }),
)

router.delete(
  '/:id',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Product not found')
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) throw new HttpError(404, 'Product not found')
    res.json({ message: 'Deleted' })
  }),
)

export default router
