import { Outlet, Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const EmployeeLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-blue-900 text-white">
        <div className="p-4 text-xl font-bold border-b border-blue-800">Employee Portal</div>
        <nav className="p-4 space-y-2">
          <Link to={ROUTES.EMPLOYEE.DASHBOARD} className="block px-4 py-2 rounded hover:bg-blue-800">Dashboard</Link>
          <Link to={ROUTES.EMPLOYEE.TASKS} className="block px-4 py-2 rounded hover:bg-blue-800">Tasks</Link>
          <Link to={ROUTES.EMPLOYEE.TIMESHEET} className="block px-4 py-2 rounded hover:bg-blue-800">Timesheet</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default EmployeeLayout