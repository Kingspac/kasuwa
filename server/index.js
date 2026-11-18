import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import HttpError from './utils/HttpError.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'

const {
  MONGO_URI,
  JWT_SECRET,
  CLIENT_URL = 'http://localhost:5173',
  PORT = 5000,
} = process.env

if (!MONGO_URI || !JWT_SECRET) {
  console.error('Set MONGO_URI and JWT_SECRET in server/.env')
  process.exit(1)
}

const app = express()
// On Render the app sits behind a proxy; this lets rate limiting see real IPs.
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1)

const allowed = CLIENT_URL.split(',').map((s) => s.trim())

app.use(helmet()) // safer HTTP headers
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowed.includes(origin)
        ? cb(null, true)
        : cb(new HttpError(403, 'Origin not allowed')),
  }),
)
app.use(express.json({ limit: '50kb' }))

// Slow down password guessing on login/register.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Try again in a few minutes.' },
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }))

// One place that turns every error into a clean JSON response.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request' })
  }
  if (err.status) return res.status(err.status).json({ message: err.message })
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors)[0].message })
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid value or id' })
  if (err.code === 11000) return res.status(409).json({ message: 'That already exists' })
  console.error(err)
  res.status(500).json({ message: 'Server error' })
})

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`API running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })
