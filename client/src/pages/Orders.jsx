import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { fmt, fmtDate, shortId } from '../format'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api
      .myOrders()
      .then((d) => !cancelled && setOrders(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [reload])

  return (
    <div className="wrap page">
      <h1 className="h1">My orders</h1>
      {loading && (
        <div className="center-box"><span className="spinner" /></div>
      )}
      {error && (
        <div className="alert center-col">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => setReload((k) => k + 1)}>Try again</button>
        </div>
      )}
      {!loading && !error && orders.length === 0 && (
        <div className="empty">
          <p>You have not placed any orders yet.</p>
          <Link to="/shop" className="btn btn-primary">Start shopping</Link>
        </div>
      )}
      <ul className="order-list">
        {orders.map((o) => (
          <li key={o._id}>
            <Link to={`/orders/${o._id}`} className="order-card">
              <div>
                <b>{shortId(o._id)}</b>
                <p className="muted small">
                  {fmtDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} items
                </p>
              </div>
              <div className="order-right">
                <span className={`status ${o.status}`}>{o.status}</span>
                <b>{fmt(o.total)}</b>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
