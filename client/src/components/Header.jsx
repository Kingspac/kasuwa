import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Header() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="header">
      <div className="wrap header-in">
        <Link to="/" className="brand" onClick={close}>
          Kasuwa<i>.</i>
        </Link>

        <nav className={`nav${open ? ' open' : ''}`}>
          <NavLink to="/shop" onClick={close}>Shop</NavLink>
          {user && <NavLink to="/orders" onClick={close}>My orders</NavLink>}
          {user && user.role === 'admin' && (
            <NavLink to="/admin" onClick={close}>Admin</NavLink>
          )}
          {user ? (
            <button
              type="button"
              className="linklike"
              onClick={() => {
                close()
                logout()
              }}
            >
              Log out ({user.name.split(' ')[0]})
            </button>
          ) : (
            <NavLink to="/login" onClick={close}>Log in</NavLink>
          )}
        </nav>

        <Link to="/cart" className="cart-btn" aria-label={`Cart, ${count} items`} onClick={close}>
          🛍️{count > 0 && <b>{count}</b>}
        </Link>
        <button
          type="button"
          className="burger"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>
    </header>
  )
}
