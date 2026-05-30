import WelcomeMessage from '../../components/customer/dashboard/WelcomeMessage'
import RecentOrders from '../../components/customer/dashboard/RecentOrders'
import RecommendedProducts from '../../components/customer/dashboard/RecommendedProducts'

const CustomerDashboard = () => {
  return (
    <div className="space-y-6">
      <WelcomeMessage />
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentOrders />
        <RecommendedProducts />
      </div>
    </div>
  )
}

export default CustomerDashboard