import { useEffect, useState } from 'react'
import { api } from '../../api'
import { fmt, fmtDate, shortId } from '../../format'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [filter, setFilter] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [busyId, setBusyId] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api
      .adminOrders(filter)
      .then((d) => !cancelled && setOrders(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [filter, reload])

  const change = async (order, status) => {
    if (status === order.status) return
    if (status === 'cancelled' && !window.confirm('Cancel this order? The items go back into stock.')) return
    setBusyId(order._id)
    setError('')
    try {
      const updated = await api.setOrderStatus(order._id, status)
      // Keep the populated customer, which the update response does not include.
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? { ...updated, user: o.user } : o)),
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId('')
    }
  }

  return (
    <>
      <div className="chips">
        <button type="button" className={!filter ? 'on' : ''} onClick={() => setFilter('')}>All</button>
        {STATUSES.map((s) => (
          <button key={s} type="button" className={filter === s ? 'on' : ''} onClick={() => setFilter(s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert center-col">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => setReload((k) => k + 1)}>Try again</button>
        </div>
      )}
      {loading && (
        <div className="center-box"><span className="spinner" /></div>
      )}
      {!loading && !error && orders.length === 0 && (
        <p className="empty">No orders here yet.</p>
      )}

      <div className="adm-list">
        {orders.map((o) => (
          <article key={o._id} className="adm-order">
            <div className="adm-order-head">
              <div>
                <b>{shortId(o._id)}</b>
                <span className="muted small"> · {fmtDate(o.createdAt)}</span>
              </div>
              <select
                value={o.status}
                disabled={busyId === o._id || o.status === 'cancelled'}
                onChange={(e) => change(o, e.target.value)}
                aria-label="Order status"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <p className="adm-cust">
              {o.user ? `${o.user.name} (${o.user.email})` : 'Deleted user'}<br />
              {o.shipping.fullName}, {o.shipping.phone}<br />
              {o.shipping.address}, {o.shipping.city}, {o.shipping.state}
            </p>

            <div className="adm-lines">
              {o.items.map((i, n) => (
                <span key={n}>
                  {i.qty} × {i.name}{i.size ? ` (${i.size})` : ''} — {fmt(i.price * i.qty)}
                </span>
              ))}
            </div>

            <div className="adm-total">
              <span>Total ({o.paymentMethod === 'cod' ? 'Pay on delivery' : 'Paystack'}, {o.paymentStatus})</span>
              <span>{fmt(o.total)}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
