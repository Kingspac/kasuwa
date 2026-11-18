import mongoose from 'mongoose'
import { CATEGORIES } from '../constants.js'

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [120, 'Name is too long'],
    },
    description: { type: String, trim: true, maxlength: [2000, 'Description is too long'], default: '' },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: CATEGORIES, message: 'Choose a valid category' },
    },
    images: { type: [String], default: [] }, // image URLs
    sizes: { type: [String], default: [] }, // empty = one size, no choice needed
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
      validate: { validator: Number.isInteger, message: 'Stock must be a whole number' },
    },
    featured: { type: Boolean, default: false },
    handmade: { type: Boolean, default: false },
    maker: { type: String, trim: true, maxlength: [60, 'Maker name is too long'], default: '' },
  },
  { timestamps: true },
)

// Indexes make the common queries (filter by category/price, newest first) fast.
productSchema.index({ category: 1, price: 1 })
productSchema.index({ createdAt: -1 })

export default mongoose.model('Product', productSchema)
