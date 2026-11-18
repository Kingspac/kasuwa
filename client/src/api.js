// All communication with the server lives in this one file.
const BASE = import.meta.env.VITE_API_URL || ''
const KEY = 'ks-token'

export const getToken = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}
export const setToken = (t) => {
  try {
    localStorage.setItem(KEY, t)
  } catch {
    /* storage unavailable */
  }
}
export const clearToken = () => {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* storage unavailable */
  }
}

// One wrapper for every request: adds the token, parses JSON, and turns
// failures into Error objects with a readable message.
async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* empty or non-JSON response */
  }

  if (!res.ok) {
    // An expired token: clear it and tell the app to log the user out.
    if (res.status === 401 && token) {
      clearToken()
      window.dispatchEvent(new Event('auth:logout'))
    }
    throw new Error((data && data.message) || 'Something went wrong')
  }
  return data
}

// Build "?a=1&b=2" and skip empty values.
const qs = (params = {}) => {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') sp.set(k, v)
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  me: () => request('/api/auth/me'),
  products: (params) => request(`/api/products${qs(params)}`),
  product: (id) => request(`/api/products/${id}`),
  createOrder: (body) => request('/api/orders', { method: 'POST', body }),
  myOrders: () => request('/api/orders/mine'),
  order: (id) => request(`/api/orders/${id}`),
  cancelOrder: (id) => request(`/api/orders/${id}/cancel`, { method: 'POST' }),
}
