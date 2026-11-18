import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import HttpError from '../utils/HttpError.js'
import asyncHandler from '../utils/asyncHandler.js'

// Reads "Authorization: Bearer <token>", verifies it, and loads the user from
// the database so deleted users or changed roles are respected immediately.
export const auth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) throw new HttpError(401, 'Please log in')

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new HttpError(401, 'Session expired. Please log in again.')
  }

  const user = await User.findById(payload.id)
  if (!user) throw new HttpError(401, 'Please log in again')
  req.user = user
  next()
})

// Use AFTER auth: blocks anyone who is not an admin.
export const adminOnly = (req, _res, next) =>
  req.user && req.user.role === 'admin'
    ? next()
    : next(new HttpError(403, 'Admins only'))
