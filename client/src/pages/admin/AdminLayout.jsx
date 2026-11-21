import { NavLink, Outlet } from 'react-router-dom'
import '../../admin.css'

// The frame for all admin pages. <Outlet /> is where the chosen page appears.
export default function AdminLayout() {
  return (
    <div className="wrap page">
      <h1 className="h1">Admin</h1>
      <nav className="adm-tabs">
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/products">Products</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
