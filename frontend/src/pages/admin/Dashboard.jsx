import StatCardsGrid from '../../components/admin/dashboard/StatCardsGrid'
import CompanyHeader from '../../components/admin/dashboard/CompanyHeader'
import PaymentCollection from '../../components/admin/dashboard/PaymentCollection'
import SalesAnalytics from '../../components/admin/dashboard/SalesAnalytics'
import TodoList from '../../components/admin/dashboard/TodoList'

const AdminDashboard = () => {
  const statCards = [
    { label: 'Monthly Client Gain', value: 22, gradient: 'from-sky-500 to-blue-600', icon: 'trend' },
    { label: 'Total Schools', value: 22, gradient: 'from-emerald-500 to-teal-500', icon: 'school' },
    { label: 'Total Students', value: '4,657', gradient: 'from-orange-500 to-amber-500', icon: 'student' },
    { label: 'Undelivered Clients', value: 23, gradient: 'from-violet-500 to-purple-500', icon: 'box' },
  ]

  const payments = [
    { label: 'Cash Received', value: '₹16,860.00', meta: 'As on 20/01/2025' },
    { label: 'Online Received', value: '₹0.00', meta: 'As on 20/01/2025' },
    { label: 'Total Received', value: '₹16,860.00', meta: 'As on 20/01/2025' },
    { label: 'This Year Due', value: '₹710,699.00', meta: 'FY 2025-26' },
  ]

  const quickStats = [
    { label: 'Due Payment', value: 78, color: 'bg-blue-600' },
    { label: 'Customization', value: 103, color: 'bg-emerald-600' },
    { label: 'GST Bill', value: 147, color: 'bg-orange-600' },
    { label: 'Birthdays', value: 0, color: 'bg-violet-600' },
  ]

  const bars = [140, 190, 175, 210, 198, 226, 183, 219, 235, 201, 214, 246]

  const legend = [
    { label: 'Total Sales (₹)', color: 'blue' },
    { label: 'School MS', color: 'amber' },
    { label: 'Other Products', color: 'emerald' },
  ]

  const todos = [
    { task: 'ddl', status: 'Overdue', priority: 'Medium' },
  ]

  const handleAddTask = () => {
    // TODO: open modal or inline form
    console.log('Add task clicked')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tight text-slate-800">Dashboard</h1>
        <div className="text-sm text-slate-500 font-semibold">Tue, 12 Jun 2026</div>
      </div>

      <CompanyHeader
        companyName="AIM Digitalise pvt. ltd."
        financialYear="2026-2027"
      />

      <StatCardsGrid stats={statCards} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <PaymentCollection payments={payments} quickStats={quickStats} />
        <SalesAnalytics
          title="Sales Analytics - FY 2025-26"
          bars={bars}
          legend={legend}
        />
      </div>

      <TodoList todos={todos} onAddTask={handleAddTask} />
    </div>
  )
}

export default AdminDashboard