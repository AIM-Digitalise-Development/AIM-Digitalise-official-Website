import { Outlet, Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const PartnerLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-green-900 text-white">
        <div className="p-4 text-xl font-bold border-b border-green-800">Partner Portal</div>
        <nav className="p-4 space-y-2">
          <Link to={ROUTES.PARTNER.DASHBOARD} className="block px-4 py-2 rounded hover:bg-green-800">Dashboard</Link>
          <Link to={ROUTES.PARTNER.ORDERS} className="block px-4 py-2 rounded hover:bg-green-800">Orders</Link>
          <Link to={ROUTES.PARTNER.PAYOUTS} className="block px-4 py-2 rounded hover:bg-green-800">Payouts</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default PartnerLayout