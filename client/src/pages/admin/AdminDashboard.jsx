import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { fmt, fmtDate, shortId } from '../../format'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api
      .adminStats()
      .then((d) => !cancelled && setStats(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [reload])

  return (
    <>
      {loading && (
        <div className="center-box"><span className="spinner" /></div>
      )}
      {error && (
        <div className="alert center-col">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => setReload((k) => k + 1)}>Try again</button>
        </div>
      )}

      {stats && (
        <>
          <div className="adm-stats">
            <div className="adm-stat hl"><span>Sales</span><b>{fmt(stats.revenue)}</b></div>
            <div className="adm-stat"><span>Orders</span><b>{stats.orders}</b></div>
            <div className="adm-stat"><span>Pending</span><b>{stats.statusCounts.pending}</b></div>
            <div className="adm-stat"><span>Products</span><b>{stats.productCount}</b></div>
            <div className="adm-stat"><span>Customers</span><b>{stats.customerCount}</b></div>
          </div>

          <div className="adm-grid cols">
            <section className="adm-card">
              <h2>Orders by status</h2>
              <div className="adm-list">
                {STATUSES.map((s) => (
                  <div key={s} className="adm-item">
                    <span className={`status ${s}`}>{s}</span>
                    <b>{stats.statusCounts[s]}</b>
                  </div>
                ))}
              </div>
              <p className="muted small">Sales do not include cancelled orders.</p>
            </section>

            <section className="adm-card">
              <h2>Low stock (5 or fewer)</h2>
              {stats.lowStock.length === 0 ? (
                <p className="muted">Everything is well stocked.</p>
              ) : (
                <div className="adm-list">
                  {stats.lowStock.map((p) => (
                    <div key={p._id} className="adm-item">
                      <span>{p.name}<br /><small>{p.category}</small></span>
                      <span className={`stock-chip ${p.stock === 0 ? 'out' : 'low'}`}>
                        {p.stock === 0 ? 'Sold out' : `${p.stock} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ marginTop: 10 }}><Link to="/admin/products" className="adm-link">Manage products →</Link></p>
            </section>
          </div>

          <section className="adm-card" style={{ marginTop: 16 }}>
            <h2>Recent orders</h2>
            {stats.recent.length === 0 ? (
              <p className="muted">No orders yet.</p>
            ) : (
              <div className="adm-list">
                {stats.recent.map((o) => (
                  <div key={o._id} className="adm-item">
                    <span>
                      <b>{shortId(o._id)}</b> · {o.user ? o.user.name : 'Deleted user'}
                      <br /><small>{fmtDate(o.createdAt)}</small>
                    </span>
                    <span style={{ textAlign: 'right' }}>
                      <b>{fmt(o.total)}</b><br />
                      <span className={`status ${o.status}`}>{o.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p style={{ marginTop: 10 }}><Link to="/admin/orders" className="adm-link">All orders →</Link></p>
          </section>
        </>
      )}
    </>
  )
}
