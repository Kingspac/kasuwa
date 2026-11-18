import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { CATEGORIES, CATEGORY_EMOJI } from '../format'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .products({ featured: 'true', limit: 8 })
      .then((d) => !cancelled && setFeatured(d.products))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <section className="hero">
        <div className="wrap hero-in">
          <p className="eyebrow">Handcrafted · Native · Nigerian</p>
          <h1>Fashion with a story, made by hand.</h1>
          <p className="hero-sub">
            Ankara, Adire and senator wear, beaded jewelry, denim and leather goods. Pay on delivery available.
          </p>
          <Link to="/shop" className="btn btn-light">Shop the collection</Link>
        </div>
      </section>

      <section className="wrap block">
        <h2 className="h2">Shop by category</h2>
        <div className="tiles">
          {CATEGORIES.map((c) => (
            <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`} className="tile">
              <span>{CATEGORY_EMOJI[c]}</span>
              <b>{c}</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap block">
        <div className="block-head">
          <h2 className="h2">Featured pieces</h2>
          <Link to="/shop" className="more">View all →</Link>
        </div>
        {error && <p className="alert">{error}</p>}
        {loading ? (
          <div className="grid">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skel" />
            ))}
          </div>
        ) : (
          <div className="grid">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="wrap block perks">
        <div><b>🧵 Made by hand</b><p>Every handmade piece names its maker.</p></div>
        <div><b>💵 Pay on delivery</b><p>Order now and pay when it arrives.</p></div>
        <div><b>📦 Track your order</b><p>See every step from pending to delivered.</p></div>
      </section>
    </>
  )
}
