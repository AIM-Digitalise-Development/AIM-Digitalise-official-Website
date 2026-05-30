import EarningsWidget from '../../components/partner/dashboard/EarningsWidget'
import PartnerStats from '../../components/partner/dashboard/PartnerStats'

const PartnerDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
      <EarningsWidget />
      <PartnerStats />
    </div>
  )
}

export default PartnerDashboard