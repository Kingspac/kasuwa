import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { api } from '../api'
import { fmt, fmtDate, shortId } from '../format'
import ProductImage from '../components/ProductImage'

const STEPS = ['pending', 'processing', 'shipped', 'delivered']

export default function OrderDetail() {
  const { id } = useParams()
  const location = useLocation()
  const placed = !!(location.state && location.state.placed)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .order(id)
      .then((d) => !cancelled && setOrder(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return
    setBusy(true)
    setError('')
    try {
      setOrder(await api.cancelOrder(id))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="center-box"><span className="spinner" /></div>
  }
  if (!order) {
    return (
      <div className="wrap page center-col">
        <p className="alert">{error || 'Order not found'}</p>
        <Link to="/orders" className="btn btn-primary">My orders</Link>
      </div>
    )
  }

  const step = STEPS.indexOf(order.status)
  const canCancel = order.status === 'pending' && order.paymentStatus === 'unpaid'

  return (
    <div className="wrap page">
      <Link to="/orders" className="back">← My orders</Link>
      {placed && (
        <div className="success">
          <b>🎉 Order placed!</b>
          <span>Thank you. We will reach you on your phone to confirm delivery.</span>
        </div>
      )}

      <div className="order-head">
        <h1 className="h1">Order {shortId(order._id)}</h1>
        <span className={`status ${order.status}`}>{order.status}</span>
      </div>
      <p className="muted">Placed on {fmtDate(order.createdAt)}</p>

      {order.status === 'cancelled' ? (
        <p className="alert">This order was cancelled.</p>
      ) : (
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s} className={i <= step ? 'done' : ''}>
              <span>{i < step ? '✓' : i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      )}

      <div className="cart-layout">
        <ul className="cart-list">
          {order.items.map((i, n) => (
            <li key={n} className="cart-row">
              <div className="cart-img"><ProductImage item={i} /></div>
              <div className="cart-info">
                <p className="cart-name">{i.name}</p>
                {i.size && <p className="muted small">Size: {i.size}</p>}
                <p className="muted small">{fmt(i.price)} × {i.qty}</p>
              </div>
              <div className="cart-end"><b>{fmt(i.price * i.qty)}</b></div>
            </li>
          ))}
        </ul>

        <aside className="summary">
          <h2>Summary</h2>
          <div className="row"><span>Subtotal</span><b>{fmt(order.subtotal)}</b></div>
          <div className="row"><span>Shipping</span><b>{order.shippingFee === 0 ? 'Free' : fmt(order.shippingFee)}</b></div>
          <div className="row total"><span>Total</span><b>{fmt(order.total)}</b></div>
          <p className="muted small">
            Payment: {order.paymentMethod === 'cod' ? 'Pay on delivery' : 'Paystack'} ({order.paymentStatus})
          </p>
          <h2 className="mt">Delivery</h2>
          <p className="small">
            {order.shipping.fullName}<br />
            {order.shipping.address}<br />
            {order.shipping.city}, {order.shipping.state}<br />
            {order.shipping.phone}
          </p>
          {error && <p className="alert">{error}</p>}
          {canCancel && (
            <button type="button" className="btn btn-ghost btn-block danger-btn" disabled={busy} onClick={cancel}>
              {busy ? 'Cancelling...' : 'Cancel order'}
            </button>
          )}
        </aside>
      </div>
    </div>
  )
}
