import AnalyticsChart from '../../components/admin/analytics/AnalyticsChart'
import MetricsGrid from '../../components/admin/analytics/MetricsGrid'

const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
      <MetricsGrid />
      <AnalyticsChart />
    </div>
  )
}

export default AdminAnalytics