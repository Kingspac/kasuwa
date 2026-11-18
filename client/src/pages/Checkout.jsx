import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { STATES } from '../format'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import OrderSummary from '../components/OrderSummary'

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [f, setF] = useState({ fullName: user.name, phone: '', address: '', city: '', state: '' })
  const [payment, setPayment] = useState('cod')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (items.length === 0) {
    return (
      <div className="wrap page center-col">
        <h1 className="h1">Nothing to check out</h1>
        <Link to="/shop" className="btn btn-primary">Go to shop</Link>
      </div>
    )
  }

  const set = (e) => setF({ ...f, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      // We send ONLY ids, sizes and quantities. The server decides prices.
      const order = await api.createOrder({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty, size: i.size })),
        shipping: f,
        paymentMethod: payment,
      })
      navigate(`/orders/${order._id}`, { replace: true, state: { placed: true } })
      clear()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="wrap page">
      <h1 className="h1">Checkout</h1>
      <div className="cart-layout">
        <form className="form card-box" onSubmit={submit}>
          <h2>Delivery details</h2>
          <label>Full name
            <input name="fullName" value={f.fullName} onChange={set} autoComplete="name" required />
          </label>
          <label>Phone number
            <input name="phone" type="tel" value={f.phone} onChange={set} autoComplete="tel" placeholder="08012345678" required />
          </label>
          <label>Address
            <input name="address" value={f.address} onChange={set} autoComplete="street-address" required />
          </label>
          <div className="two">
            <label>City
              <input name="city" value={f.city} onChange={set} autoComplete="address-level2" required />
            </label>
            <label>State
              <select name="state" value={f.state} onChange={set} required>
                <option value="">Choose...</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          <h2>Payment</h2>
          <label className="radio">
            <input type="radio" name="pay" checked={payment === 'cod'} onChange={() => setPayment('cod')} />
            <span><b>Pay on delivery</b><small>Pay cash or transfer when your order arrives.</small></span>
          </label>
          <label className="radio disabled">
            <input type="radio" name="pay" disabled />
            <span><b>Card or bank transfer (Paystack)</b><small>Coming soon.</small></span>
          </label>

          {error && <p className="alert" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Placing order...' : 'Place order'}
          </button>
        </form>

        <OrderSummary items={items} subtotal={subtotal} showItems />
      </div>
    </div>
  )
}
