import PayoutHistory from '../../components/partner/payouts/PayoutHistory'

const PartnerPayouts = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
      <PayoutHistory />
    </div>
  )
}

export default PartnerPayouts