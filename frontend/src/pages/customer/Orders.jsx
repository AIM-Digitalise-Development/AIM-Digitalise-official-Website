import OrderHistory from '../../components/customer/orders/OrderHistory'

const CustomerOrders = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
      <OrderHistory />
    </div>
  )
}

export default CustomerOrders