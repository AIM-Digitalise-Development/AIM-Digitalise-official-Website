import { Outlet, Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const CustomerLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 text-slate-800">
        <div className="p-4 text-xl font-bold border-b border-slate-200 text-slate-900">My Account</div>
        <nav className="p-4 space-y-2">
          <Link to={ROUTES.CUSTOMER.DASHBOARD} className="block px-4 py-2 rounded hover:bg-red-50 hover:text-red-600 transition-colors">Dashboard</Link>
          <Link to={ROUTES.CUSTOMER.ORDERS} className="block px-4 py-2 rounded hover:bg-red-50 hover:text-red-600 transition-colors">Orders</Link>
          <Link to={ROUTES.CUSTOMER.PROFILE} className="block px-4 py-2 rounded hover:bg-red-50 hover:text-red-600 transition-colors">Profile</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default CustomerLayout