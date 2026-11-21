import { useEffect, useState } from 'react'
import { api } from '../api'
import { CATEGORIES } from '../format'

// Used for both "Add product" (initial = null) and "Edit product".
export default function ProductForm({ initial, onSaved, onClose }) {
  const [f, setF] = useState(() =>
    initial
      ? {
          name: initial.name,
          category: initial.category,
          price: String(initial.price),
          stock: String(initial.stock),
          description: initial.description || '',
          maker: initial.maker || '',
          handmade: !!initial.handmade,
          featured: !!initial.featured,
          images: (initial.images || []).join('\n'),
          sizes: (initial.sizes || []).join(', '),
        }
      : {
          name: '',
          category: CATEGORIES[0],
          price: '',
          stock: '',
          description: '',
          maker: '',
          handmade: false,
          featured: false,
          images: '',
          sizes: '',
        },
  )
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Close on Escape and stop the page behind from scrolling.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    const prev = document.body.style.overflow
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    const price = Number(f.price)
    const stock = Number(f.stock)
    if (!f.name.trim()) return setError('Enter the product name')
    if (f.price === '' || !(price >= 0)) return setError('Enter a valid price')
    if (f.stock === '' || !Number.isInteger(stock) || stock < 0) {
      return setError('Stock must be a whole number (0 or more)')
    }

    // Turn the text boxes back into the lists the server expects.
    const payload = {
      name: f.name.trim(),
      category: f.category,
      price,
      stock,
      description: f.description.trim(),
      maker: f.maker.trim(),
      handmade: f.handmade,
      featured: f.featured,
      images: f.images.split('\n').map((s) => s.trim()).filter(Boolean),
      sizes: f.sizes.split(',').map((s) => s.trim()).filter(Boolean),
    }

    setBusy(true)
    setError('')
    try {
      if (initial) await api.updateProduct(initial._id, payload)
      else await api.createProduct(payload)
      onSaved()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="adm-overlay" onClick={onClose}>
      <form className="adm-modal form" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="adm-modal-head">
          <h2>{initial ? 'Edit product' : 'Add product'}</h2>
          <button type="button" className="x-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <label>Name
          <input value={f.name} onChange={(e) => set('name', e.target.value)} maxLength={120} autoFocus />
        </label>
        <label>Category
          <select value={f.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <div className="two">
          <label>Price (₦)
            <input type="number" inputMode="decimal" min="0" value={f.price} onChange={(e) => set('price', e.target.value)} />
          </label>
          <label>Stock
            <input type="number" inputMode="numeric" min="0" step="1" value={f.stock} onChange={(e) => set('stock', e.target.value)} />
          </label>
        </div>
        <label>Description
          <textarea value={f.description} onChange={(e) => set('description', e.target.value)} maxLength={2000} />
        </label>
        <label>Maker (optional)
          <input value={f.maker} onChange={(e) => set('maker', e.target.value)} maxLength={60} placeholder="e.g. Amina Tailoring, Kano" />
        </label>
        <label>Photo links, one per line
          <textarea value={f.images} onChange={(e) => set('images', e.target.value)} placeholder={'/products/ankara-set.jpg\nhttps://...'} />
          <span className="hint">Use a web link, or a file you put in client/public/products (like /products/name.jpg).</span>
        </label>
        <label>Sizes, separated by commas
          <input value={f.sizes} onChange={(e) => set('sizes', e.target.value)} placeholder="S, M, L, XL (leave empty for one size)" />
        </label>
        <div className="check-row">
          <label className="check">
            <input type="checkbox" checked={f.handmade} onChange={(e) => set('handmade', e.target.checked)} /> Handmade
          </label>
          <label className="check">
            <input type="checkbox" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} /> Featured on home page
          </label>
        </div>

        {error && <p className="alert" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Saving...' : initial ? 'Save changes' : 'Add product'}
        </button>
      </form>
    </div>
  )
}
