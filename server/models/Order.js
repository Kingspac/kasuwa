import mongoose from 'mongoose'
import { ORDER_STATUSES } from '../constants.js'

// An order line is a SNAPSHOT: we copy the name and price at purchase time, so
// later price changes or deleted products never change an old order.
const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: '' },
    size: { type: String, default: '' },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [itemSchema], required: true },
    shipping: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['paystack', 'cod'], required: true },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    paymentRef: { type: String, default: '' }, // filled in Part 3 (Paystack)
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
  },
  { timestamps: true },
)

export default mongoose.model('Order', orderSchema)
