import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { fmt } from '../format'
import { useCart } from '../context/CartContext'
import ProductImage from '../components/ProductImage'

export default function Product() {
  const { id } = useParams()
  const { add } = useCart()
  const [p, setP] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [sizeError, setSizeError] = useState(false)
  const [added, setAdded] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setSize('')
    setQty(1)
    api
      .product(id)
      .then((d) => !cancelled && setP(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
      clearTimeout(timer.current)
    }
  }, [id])

  if (loading) {
    return (
      <div className="center-box">
        <span className="spinner" />
      </div>
    )
  }
  if (error || !p) {
    return (
      <div className="wrap page center-col">
        <p className="alert">{error || 'Product not found'}</p>
        <Link to="/shop" className="btn btn-primary">Back to shop</Link>
      </div>
    )
  }

  const soldOut = p.stock === 0
  const maxQty = Math.min(p.stock, 10)

  const addToCart = () => {
    if (p.sizes.length && !size) {
      setSizeError(true)
      return
    }
    add(p, size, qty)
    setAdded(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdded(false), 2500)
  }

  return (
    <div className="wrap page">
      <Link to="/shop" className="back">← Back to shop</Link>
      <div className="detail">
        <div className="detail-img">
          <ProductImage item={p} />
        </div>

        <div className="detail-info">
          <p className="eyebrow dark">{p.category}</p>
          <h1 className="h1">{p.name}</h1>
          <p className="big-price">{fmt(p.price)}</p>
          {p.handmade && (
            <p className="made">🧵 Handmade{p.maker ? ` by ${p.maker}` : ''}</p>
          )}
          <p className="desc">{p.description || 'No description yet.'}</p>

          {p.sizes.length > 0 && (
            <div className="field">
              <p className="label">Size</p>
              <div className="sizes">
                {p.sizes.map((s) => (
                  <button key={s} type="button" className={size === s ? 'on' : ''}
                    onClick={() => { setSize(s); setSizeError(false) }}>
                    {s}
                  </button>
                ))}
              </div>
              {sizeError && <p className="err">Please choose a size.</p>}
            </div>
          )}

          {!soldOut && (
            <div className="field">
              <p className="label">Quantity</p>
              <div className="stepper">
                <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty(Math.min(maxQty, qty + 1))} aria-label="Increase">+</button>
              </div>
              {p.stock <= 5 && <p className="low-note">Only {p.stock} left in stock</p>}
            </div>
          )}

          <button type="button" className="btn btn-primary btn-block" disabled={soldOut} onClick={addToCart}>
            {soldOut ? 'Sold out' : added ? '✓ Added to cart' : 'Add to cart'}
          </button>
          {added && <Link to="/cart" className="goto-cart">View cart →</Link>}
        </div>
      </div>
    </div>
  )
}
