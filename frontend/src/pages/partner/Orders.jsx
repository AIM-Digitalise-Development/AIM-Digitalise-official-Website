import OrderCard from '../../components/partner/orders/OrderCard'

const PartnerOrders = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
      <div className="grid gap-4">
        <OrderCard />
      </div>
    </div>
  )
}

export default PartnerOrders