import { Link, useNavigate } from 'react-router-dom'
import { fmt } from '../format'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import ProductImage from '../components/ProductImage'
import OrderSummary from '../components/OrderSummary'

export default function Cart() {
  const { items, subtotal, setQty, remove } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const checkout = () =>
    user ? navigate('/checkout') : navigate('/login', { state: { from: '/checkout' } })

  if (items.length === 0) {
    return (
      <div className="wrap page center-col">
        <h1 className="h1">Your cart is empty</h1>
        <p className="muted">Find something you love in the shop.</p>
        <Link to="/shop" className="btn btn-primary">Start shopping</Link>
      </div>
    )
  }

  return (
    <div className="wrap page">
      <h1 className="h1">Your cart</h1>
      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((i) => (
            <li key={i.key} className="cart-row">
              <Link to={`/product/${i.productId}`} className="cart-img">
                <ProductImage item={i} />
              </Link>
              <div className="cart-info">
                <Link to={`/product/${i.productId}`} className="cart-name">{i.name}</Link>
                {i.size && <p className="muted small">Size: {i.size}</p>}
                <p className="muted small">{fmt(i.price)} each</p>
                <div className="stepper small-step">
                  <button type="button" onClick={() => setQty(i.key, i.qty - 1)} aria-label="Decrease">−</button>
                  <span>{i.qty}</span>
                  <button type="button" onClick={() => setQty(i.key, i.qty + 1)} aria-label="Increase">+</button>
                </div>
              </div>
              <div className="cart-end">
                <b>{fmt(i.price * i.qty)}</b>
                <button type="button" className="linklike danger" onClick={() => remove(i.key)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>

        <div>
          <OrderSummary items={items} subtotal={subtotal} />
          <button type="button" className="btn btn-primary btn-block" onClick={checkout}>
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  )
}
