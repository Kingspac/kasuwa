import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Only lets admins see the page. This is for a good experience only:
// the real protection is on the server, which checks the role on every request.
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="center-box">
        <span className="spinner" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (user.role !== 'admin') {
    return (
      <div className="wrap page center-col">
        <h1 className="h1">Admins only</h1>
        <p className="muted">Your account cannot open this page.</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    )
  }
  return children
}
