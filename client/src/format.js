export const CATEGORIES = [
  'Native Wear',
  'Jeans & Denim',
  'Beads & Jewelry',
  'Bags & Accessories',
  'Footwear',
]

export const CATEGORY_EMOJI = {
  'Native Wear': '👘',
  'Jeans & Denim': '👖',
  'Beads & Jewelry': '📿',
  'Bags & Accessories': '👜',
  Footwear: '👡',
}

const money = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})
export const fmt = (n) => money.format(n)

// Display ONLY. The server calculates the real shipping fee and total.
export const SHIPPING_FEE = 2500
export const FREE_SHIPPING_OVER = 50000
export const shippingFor = (subtotal) =>
  subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export const shortId = (id) => `#${String(id).slice(-6).toUpperCase()}`

// A stable warm colour for each product, used when it has no photo yet.
export const hueOf = (name = '') => {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return 10 + (h % 40)
}

export const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
]
