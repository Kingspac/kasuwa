// Shared values used by the models, routes and (later) the seed data.
export const CATEGORIES = [
  'Native Wear',
  'Jeans & Denim',
  'Beads & Jewelry',
  'Bags & Accessories',
  'Footwear',
]

export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

// Shipping is calculated on the SERVER so a customer cannot change it.
export const SHIPPING_FEE = 2500
export const FREE_SHIPPING_OVER = 50000
export const shippingFor = (subtotal) =>
  subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE
