import { useEffect, useState } from 'react'
import { api } from '../../api'
import { fmt } from '../../format'
import ProductImage from '../../components/ProductImage'
import ProductForm from '../../components/ProductForm'

export default function AdminProducts() {
  const [q, setQ] = useState('')
  const [term, setTerm] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [form, setForm] = useState(null) // null = closed, { product } = open

  // Wait until typing stops before searching.
  useEffect(() => {
    const id = setTimeout(() => {
      setTerm(q.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(id)
  }, [q])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api
      .products({ search: term, page, limit: 10 })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [term, page, reload])

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    try {
      await api.deleteProduct(p._id)
      // If that was the last item on this page, go back one page.
      if (data && data.products.length === 1 && page > 1) setPage(page - 1)
      else setReload((k) => k + 1)
    } catch (err) {
      setError(err.message)
    }
  }

  const saved = () => {
    setForm(null)
    setReload((k) => k + 1)
  }

  const stockChip = (n) => (
    <span className={`stock-chip ${n === 0 ? 'out' : n <= 5 ? 'low' : ''}`}>
      {n === 0 ? 'Sold out' : `${n} in stock`}
    </span>
  )

  return (
    <>
      <div className="adm-toolbar">
        <input className="search" type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search products..." aria-label="Search products" />
        <button type="button" className="btn btn-primary" onClick={() => setForm({ product: null })}>
          + Add product
        </button>
      </div>

      {error && (
        <div className="alert center-col">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => setReload((k) => k + 1)}>Try again</button>
        </div>
      )}
      {loading && !data && (
        <div className="center-box"><span className="spinner" /></div>
      )}

      {data && (
        <>
          <p className="muted count">{data.total} {data.total === 1 ? 'product' : 'products'}</p>
          {data.products.length === 0 ? (
            <p className="empty">No products found.</p>
          ) : (
            <div className="adm-list">
              {data.products.map((p) => (
                <div key={p._id} className="adm-prod">
                  <div className="adm-thumb"><ProductImage item={p} /></div>
                  <div className="adm-prod-info">
                    <b>{p.name}</b>
                    <small>{p.category} · {fmt(p.price)}</small>
                    <div>{stockChip(p.stock)}{p.featured && <span className="stock-chip">Featured</span>}</div>
                  </div>
                  <div className="adm-actions">
                    <button type="button" className="mini-btn" onClick={() => setForm({ product: p })}>Edit</button>
                    <button type="button" className="mini-btn danger" onClick={() => remove(p)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {data.pages > 1 && (
            <nav className="pager" aria-label="Pagination">
              <button type="button" className="btn btn-ghost" disabled={data.page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
              <span>Page {data.page} of {data.pages}</span>
              <button type="button" className="btn btn-ghost" disabled={data.page >= data.pages} onClick={() => setPage(page + 1)}>Next →</button>
            </nav>
          )}
        </>
      )}

      {form && (
        <ProductForm initial={form.product} onSaved={saved} onClose={() => setForm(null)} />
      )}
    </>
  )
}
