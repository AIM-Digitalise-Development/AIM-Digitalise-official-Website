import StatsWidget from '../../components/admin/dashboard/StatsWidget'
import RevenueChart from '../../components/admin/dashboard/RevenueChart'
import RecentActivity from '../../components/admin/dashboard/RecentActivity'

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <StatsWidget />
      <div className="grid lg:grid-cols-2 gap-6">
        <RevenueChart />
        <RecentActivity />
      </div>
    </div>
  )
}

export default AdminDashboard