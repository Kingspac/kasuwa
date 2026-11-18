import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
export const useCart = () => useContext(CartContext)

const KEY = 'ks-cart'
const MAX_QTY = 20

const read = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(read)

  // Save the cart whenever it changes, so a refresh does not empty it.
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable */
    }
  }, [items])

  // One cart line = one product + one size.
  const add = useCallback((product, size, qty) => {
    setItems((prev) => {
      const key = `${product._id}|${size}`
      const limit = Math.min(product.stock, MAX_QTY)
      const found = prev.find((i) => i.key === key)
      if (found) {
        return prev.map((i) =>
          i.key === key
            ? { ...i, qty: Math.min(limit, i.qty + qty), stock: product.stock, price: product.price }
            : i,
        )
      }
      return [
        ...prev,
        {
          key,
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0] || '',
          category: product.category,
          size,
          qty: Math.min(limit, qty),
          stock: product.stock,
        },
      ]
    })
  }, [])

  const setQty = useCallback((key, qty) => {
    setItems((prev) =>
      prev.map((i) =>
        i.key === key ? { ...i, qty: Math.max(1, Math.min(i.stock, MAX_QTY, qty)) } : i,
      ),
    )
  }, [])

  const remove = useCallback((key) => setItems((prev) => prev.filter((i) => i.key !== key)), [])
  const clear = useCallback(() => setItems([]), [])

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items])
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items])

  const value = useMemo(
    () => ({ items, count, subtotal, add, setQty, remove, clear }),
    [items, count, subtotal, add, setQty, remove, clear],
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
