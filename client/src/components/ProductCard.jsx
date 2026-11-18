import { Link } from 'react-router-dom'
import { fmt } from '../format'
import ProductImage from './ProductImage'

export default function ProductCard({ product: p }) {
  return (
    <Link to={`/product/${p._id}`} className="pcard">
      <div className="pthumb">
        <ProductImage item={p} />
        <div className="tags">
          {p.handmade && <span className="tag hand">Handmade</span>}
          {p.stock === 0 && <span className="tag out">Sold out</span>}
          {p.stock > 0 && p.stock <= 5 && <span className="tag low">Only {p.stock} left</span>}
        </div>
      </div>
      <div className="pbody">
        <h3>{p.name}</h3>
        <p className="maker">{p.maker || p.category}</p>
        <p className="price">{fmt(p.price)}</p>
      </div>
    </Link>
  )
}
