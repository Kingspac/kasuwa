// Copy only the allowed keys from an object. This stops a client from sending
// extra fields (like "role" or "user") that we never meant to accept.
export default function pick(obj, keys) {
  const out = {}
  if (!obj || typeof obj !== 'object') return out
  for (const key of keys) {
    if (obj[key] !== undefined) out[key] = obj[key]
  }
  return out
}
