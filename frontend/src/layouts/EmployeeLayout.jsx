import { Outlet, Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const EmployeeLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 text-slate-800">
        <div className="p-4 text-xl font-bold border-b border-slate-200 text-slate-900">Employee Portal</div>
        <nav className="p-4 space-y-2">
          <Link to={ROUTES.EMPLOYEE.DASHBOARD} className="block px-4 py-2 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">Dashboard</Link>
          <Link to={ROUTES.EMPLOYEE.TASKS} className="block px-4 py-2 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">Tasks</Link>
          <Link to={ROUTES.EMPLOYEE.TIMESHEET} className="block px-4 py-2 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">Timesheet</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default EmployeeLayout