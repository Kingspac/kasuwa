import { Router } from 'express'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { auth, adminOnly } from '../middleware/auth.js'
import { ORDER_STATUSES } from '../constants.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()
// Every route in this file needs a logged-in ADMIN. The server enforces this,
// so hiding buttons in the browser is only for convenience, never for security.
router.use(auth, adminOnly)

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [byStatus, revenueRows, productCount, customerCount, lowStock, recent] =
      await Promise.all([
        // How many orders are in each status.
        Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        // Sum of order totals, ignoring cancelled orders.
        Order.aggregate([
          { $match: { status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Product.countDocuments(),
        User.countDocuments({ role: 'customer' }),
        Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(8).select('name stock category'),
        Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name'),
      ])

    const statusCounts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]))
    for (const row of byStatus) statusCounts[row._id] = row.count

    res.json({
      orders: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      statusCounts,
      revenue: revenueRows[0] ? revenueRows[0].total : 0,
      productCount,
      customerCount,
      lowStock,
      recent,
    })
  }),
)

export default router
