import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { auth } from '../middleware/auth.js'
import HttpError from '../utils/HttpError.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role })
const isText = (...values) => values.every((v) => typeof v === 'string' && v.trim())

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {}
    if (!isText(name, email) || typeof password !== 'string' || !password) {
      throw new HttpError(400, 'Name, email and password are required')
    }
    if (password.length < 6 || password.length > 72) {
      throw new HttpError(400, 'Password must be 6 to 72 characters')
    }
    const exists = await User.findOne({ email: email.toLowerCase().trim() })
    if (exists) throw new HttpError(409, 'An account with this email already exists')

    const hash = await bcrypt.hash(password, 10) // never store plain passwords
    // role is NOT read from the request body, so nobody can sign up as admin.
    const user = await User.create({ name, email, password: hash })
    res.status(201).json({ token: sign(user._id), user: publicUser(user) })
  }),
)

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {}
    if (!isText(email) || typeof password !== 'string' || !password) {
      throw new HttpError(400, 'Email and password are required')
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    const ok = user && (await bcrypt.compare(password, user.password))
    // Same message for "no such email" and "wrong password" on purpose.
    if (!ok) throw new HttpError(401, 'Invalid email or password')
    res.json({ token: sign(user._id), user: publicUser(user) })
  }),
)

router.get('/me', auth, (req, res) => res.json({ user: publicUser(req.user) }))

export default router
