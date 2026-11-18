// Run with: npm run seed
// Replaces ALL products with sample data and creates/updates the admin user.
// Sample data only. Replace with your real products from the admin page later.
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Product from './models/Product.js'
import User from './models/User.js'

const products = [
  { name: 'Ankara Two-Piece Set', category: 'Native Wear', price: 28500, stock: 12, sizes: ['S', 'M', 'L', 'XL'], featured: true, handmade: true, maker: 'Amina Tailoring, Kano', description: 'Bold Ankara top and wrapper skirt, tailored to fit and lined for comfort.' },
  { name: "Men's Senator Kaftan", category: 'Native Wear', price: 35000, stock: 9, sizes: ['M', 'L', 'XL', 'XXL'], featured: true, handmade: true, maker: 'Danladi Fashion House, Kaduna', description: 'Classic senator kaftan with neat hand embroidery on the chest and cuffs.' },
  { name: 'Adire Indigo Wrap Skirt', category: 'Native Wear', price: 18000, stock: 15, sizes: ['S', 'M', 'L'], handmade: true, maker: 'Folake Dye Works, Abeokuta', description: 'Hand-dyed Adire cloth in deep indigo patterns. Every piece is unique.' },
  { name: 'Embroidered Agbada (3-Piece)', category: 'Native Wear', price: 85000, stock: 4, sizes: ['L', 'XL', 'XXL'], featured: true, handmade: true, maker: 'Oba Stitches, Ibadan', description: 'Full agbada set with cap, inner top and trousers. Made for weddings and big days.' },
  { name: 'Ankara Head Tie (Gele)', category: 'Native Wear', price: 6500, stock: 30, handmade: true, maker: 'Amina Tailoring, Kano', description: 'Pre-folded Ankara gele that holds its shape. Ready to wear.' },
  { name: 'Slim-Fit Denim Jeans', category: 'Jeans & Denim', price: 22000, stock: 20, sizes: ['30', '32', '34', '36'], description: 'Stretch denim, slim fit, mid-blue wash. Comfortable all day.' },
  { name: 'High-Waist Mom Jeans', category: 'Jeans & Denim', price: 24500, stock: 14, sizes: ['S', 'M', 'L', 'XL'], featured: true, description: 'Relaxed high-waist cut in soft washed denim.' },
  { name: 'Classic Denim Jacket', category: 'Jeans & Denim', price: 30000, stock: 8, sizes: ['S', 'M', 'L', 'XL'], description: 'Heavy-duty denim jacket with brass buttons. Pairs with everything.' },
  { name: 'Handmade Beaded Bracelet', category: 'Beads & Jewelry', price: 3500, stock: 40, featured: true, handmade: true, maker: 'Ngozi Beads, Enugu', description: 'Glass beads strung by hand on strong elastic. Bright, colourful and light.' },
  { name: 'Waist Beads (Set of 3)', category: 'Beads & Jewelry', price: 4500, stock: 25, handmade: true, maker: 'Ngozi Beads, Enugu', description: 'Three strands of traditional waist beads with a secure clasp.' },
  { name: 'Coral Bead Necklace', category: 'Beads & Jewelry', price: 12000, stock: 6, featured: true, handmade: true, maker: 'Edo Heritage Crafts, Benin City', description: 'Rich coral-red beads in the traditional royal style.' },
  { name: 'Cowrie Shell Anklet', category: 'Beads & Jewelry', price: 3000, stock: 22, handmade: true, maker: 'Ngozi Beads, Enugu', description: 'Cowrie shells and beads on an adjustable cord.' },
  { name: 'Handwoven Raffia Tote Bag', category: 'Bags & Accessories', price: 9500, stock: 11, handmade: true, maker: 'Ijebu Weavers, Ogun', description: 'Strong handwoven raffia with leather handles. Roomy for market days.' },
  { name: 'Hausa Cap (Hand-Embroidered)', category: 'Bags & Accessories', price: 7500, stock: 18, handmade: true, maker: 'Kano Cap Makers', description: 'Traditional fila cap with fine hand embroidery.' },
  { name: 'Hand-Stitched Leather Slippers', category: 'Footwear', price: 11000, stock: 16, sizes: ['40', '41', '42', '43', '44', '45'], handmade: true, maker: 'Kano Leatherworks', description: 'Soft leather slippers, cut and stitched by hand. Gets better with wear.' },
]

await mongoose.connect(process.env.MONGO_URI)

await Product.deleteMany({})
await Product.insertMany(products)
console.log(`Seeded ${products.length} products`)

const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env
if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  const email = ADMIN_EMAIL.toLowerCase().trim()
  const password = await bcrypt.hash(ADMIN_PASSWORD, 10)
  const existing = await User.findOne({ email })
  if (existing) {
    existing.role = 'admin'
    existing.password = password
    await existing.save()
  } else {
    await User.create({ name: 'Kasuwa Admin', email, password, role: 'admin' })
  }
  console.log(`Admin ready: ${email}`)
}

await mongoose.disconnect()
