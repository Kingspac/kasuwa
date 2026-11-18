import { fmt, shippingFor } from '../format'
import ProductImage from './ProductImage'

// Shared by the cart and checkout pages.
export default function OrderSummary({ items, subtotal, showItems = false }) {
  const shipping = items.length ? shippingFor(subtotal) : 0
  return (
    <aside className="summary">
      <h2>Order summary</h2>
      {showItems && (
        <ul className="mini-list">
          {items.map((i) => (
            <li key={i.key}>
              <div className="mini-img">
                <ProductImage item={i} />
              </div>
              <span>
                {i.name}
                {i.size ? ` (${i.size})` : ''} × {i.qty}
              </span>
              <b>{fmt(i.price * i.qty)}</b>
            </li>
          ))}
        </ul>
      )}
      <div className="row">
        <span>Subtotal</span>
        <b>{fmt(subtotal)}</b>
      </div>
      <div className="row">
        <span>Shipping</span>
        <b>{shipping === 0 ? 'Free' : fmt(shipping)}</b>
      </div>
      <div className="row total">
        <span>Total</span>
        <b>{fmt(subtotal + shipping)}</b>
      </div>
      <p className="muted small">Final prices are confirmed by the server when you place the order.</p>
    </aside>
  )
}
