import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { CATEGORIES } from '../format'
import ProductCard from '../components/ProductCard'

// The price form is remounted (via key) whenever the URL values change.
function PriceFilter({ min, max, onApply }) {
  const [lo, setLo] = useState(min)
  const [hi, setHi] = useState(max)
  return (
    <form
      className="price-form"
      onSubmit={(e) => {
        e.preventDefault()
        onApply(lo, hi)
      }}
    >
      <input type="number" inputMode="numeric" min="0" placeholder="Min ₦" value={lo}
        onChange={(e) => setLo(e.target.value)} aria-label="Minimum price" />
      <input type="number" inputMode="numeric" min="0" placeholder="Max ₦" value={hi}
        onChange={(e) => setHi(e.target.value)} aria-label="Maximum price" />
      <button type="submit" className="btn btn-ghost">Apply</button>
    </form>
  )
}

export default function Shop() {
  // The URL is the single source of truth for all filters.
  const [params, setParams] = useSearchParams()
  const query = params.toString()
  const urlQ = params.get('q') || ''
  const category = params.get('category') || ''
  const sort = params.get('sort') || 'newest'
  const min = params.get('min') || ''
  const max = params.get('max') || ''

  const [q, setQ] = useState(urlQ)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  // Change one or more URL params. Any filter change goes back to page 1.
  const update = (changes) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [k, v] of Object.entries(changes)) {
        if (v) next.set(k, v)
        else next.delete(k)
      }
      if (!('page' in changes)) next.delete('page')
      return next
    })

  // Keep the search box in step with the URL (e.g. "Clear filters").
  useEffect(() => {
    setQ(urlQ)
  }, [urlQ])

  // Debounce: wait 400ms after typing stops before searching.
  useEffect(() => {
    if (q.trim() === urlQ) return
    const id = setTimeout(() => update({ q: q.trim() }), 400)
    return () => clearTimeout(id)
  }, [q]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch whenever the URL changes. "cancelled" ignores stale responses.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    const p = new URLSearchParams(query)
    api
      .products({
        search: p.get('q'),
        category: p.get('category'),
        sort: p.get('sort'),
        minPrice: p.get('min'),
        maxPrice: p.get('max'),
        page: p.get('page'),
        limit: 12,
      })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [query, reload])

  const filtered = !!(urlQ || category || min || max)
  const goPage = (n) => {
    update({ page: n > 1 ? String(n) : '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="wrap page">
      <h1 className="h1">Shop</h1>

      <div className="toolbar">
        <input className="search" type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search ankara, beads, jeans..." aria-label="Search products" />
        <select value={sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })}
          aria-label="Sort products">
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      <div className="chips">
        <button type="button" className={!category ? 'on' : ''} onClick={() => update({ category: '' })}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className={category === c ? 'on' : ''} onClick={() => update({ category: c })}>
            {c}
          </button>
        ))}
      </div>

      <PriceFilter key={`${min}-${max}`} min={min} max={max} onApply={(lo, hi) => update({ min: lo, max: hi })} />

      {error && (
        <div className="alert center-col">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => setReload((k) => k + 1)}>Try again</button>
        </div>
      )}

      {loading && (
        <div className="grid">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skel" />
          ))}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <p className="muted count">{data.total} {data.total === 1 ? 'product' : 'products'}</p>
          {data.products.length === 0 ? (
            <div className="empty">
              <p>No products match your search.</p>
              {filtered && (
                <button type="button" className="btn btn-primary" onClick={() => setParams({})}>Clear filters</button>
              )}
            </div>
          ) : (
            <div className="grid">
              {data.products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
          {data.pages > 1 && (
            <nav className="pager" aria-label="Pagination">
              <button type="button" className="btn btn-ghost" disabled={data.page <= 1} onClick={() => goPage(data.page - 1)}>← Prev</button>
              <span>Page {data.page} of {data.pages}</span>
              <button type="button" className="btn btn-ghost" disabled={data.page >= data.pages} onClick={() => goPage(data.page + 1)}>Next →</button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
