import { Outlet, Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const CustomerLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-purple-900 text-white">
        <div className="p-4 text-xl font-bold border-b border-purple-800">My Account</div>
        <nav className="p-4 space-y-2">
          <Link to={ROUTES.CUSTOMER.DASHBOARD} className="block px-4 py-2 rounded hover:bg-purple-800">Dashboard</Link>
          <Link to={ROUTES.CUSTOMER.ORDERS} className="block px-4 py-2 rounded hover:bg-purple-800">Orders</Link>
          <Link to={ROUTES.CUSTOMER.PROFILE} className="block px-4 py-2 rounded hover:bg-purple-800">Profile</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default CustomerLayout