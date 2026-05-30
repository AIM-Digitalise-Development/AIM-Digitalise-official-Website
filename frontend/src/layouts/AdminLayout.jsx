import { Outlet, Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4 text-xl font-bold border-b border-gray-800">Admin Panel</div>
        <nav className="p-4 space-y-2">
          <Link to={ROUTES.ADMIN.DASHBOARD} className="block px-4 py-2 rounded hover:bg-gray-800">Dashboard</Link>
          <Link to={ROUTES.ADMIN.USERS} className="block px-4 py-2 rounded hover:bg-gray-800">Users</Link>
          <Link to={ROUTES.ADMIN.SETTINGS} className="block px-4 py-2 rounded hover:bg-gray-800">Settings</Link>
          <Link to={ROUTES.ADMIN.ANALYTICS} className="block px-4 py-2 rounded hover:bg-gray-800">Analytics</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout