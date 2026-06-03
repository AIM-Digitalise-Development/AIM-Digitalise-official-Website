import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import OrderFilters from '../../components/partner/orders/OrderFilters'
import OrderCard from '../../components/partner/orders/OrderCard'
import OrderDetails from '../../components/partner/orders/OrderDetails'

const MOCK_ORDERS = [
  { 
    id: 'ORD-4821', 
    client: 'TechCorp India', 
    amount: '₹12,500', 
    commission: '₹1,875', 
    status: 'Active', 
    date: '15 May 2026', 
    category: 'NEXGN SaaS',
    clientContact: 'billing@techcorpindia.com',
    details: 'Enterprise deployment of NEXGN Institute SaaS for 200 users. Includes premium HR and attendance modules, automatic tax configurations, and monthly updates.'
  },
  { 
    id: 'ORD-4820', 
    client: 'Spark Solutions', 
    amount: '₹8,200', 
    commission: '₹1,230', 
    status: 'Pending', 
    date: '12 May 2026', 
    category: 'SaaS Suite',
    clientContact: 'hr@sparksolutions.in',
    details: 'Employee management suite setup. Subscription pending initial payment confirmation from bank gate.'
  },
  { 
    id: 'ORD-4819', 
    client: 'NexaRetail Ltd', 
    amount: '₹21,000', 
    commission: '₹3,150', 
    status: 'Completed', 
    date: '28 Apr 2026', 
    category: 'Custom Software',
    clientContact: 'operations@nexaretail.com',
    details: 'Custom inventory control application and point-of-sale software integration with barcode scanners.'
  },
  { 
    id: 'ORD-4818', 
    client: 'BlueSky Academics', 
    amount: '₹15,000', 
    commission: '₹2,250', 
    status: 'Active', 
    date: '20 Apr 2026', 
    category: 'NEXGN School Pro',
    clientContact: 'admin@bluesky.edu.in',
    details: 'NEXGN Institute School Management system for academic tracker, online examination portals, and fees collector.'
  },
  { 
    id: 'ORD-4817', 
    client: 'Zenith Logistics', 
    amount: '₹5,500', 
    commission: '₹825', 
    status: 'Cancelled', 
    date: '10 Apr 2026', 
    category: 'Tracking API',
    clientContact: 'support@zenithlogistics.com',
    details: 'Vehicle tracking API integration. Order cancelled by user due to shifting priorities.'
  }
]

const PartnerOrders = () => {
  const [filters, setFilters] = useState({ search: '', status: 'All' })
  const [selectedOrder, setSelectedOrder] = useState(null)

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    const matchesSearch = 
      order.client.toLowerCase().includes(filters.search.toLowerCase()) || 
      order.id.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesStatus = 
      filters.status === 'All' || 
      order.status.toLowerCase() === filters.status.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const totalOrders = filteredOrders.length
  const activeOrders = filteredOrders.filter(o => o.status === 'Active').length
  const totalCommission = filteredOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, curr) => acc + parseInt(curr.commission.replace(/[^\d]/g, '')), 0)

  return (
    <>
      <Helmet>
        <title>Client Orders | AIM Partner</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white">Client Orders</h1>
          <p className="text-aim-copy-muted text-xs mt-1">
            Track client subscriptions, software orders, and commissions attributed to you.
          </p>
        </div>

        {/* Mini stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Filtered Orders</span>
            <p className="text-2xl font-black text-white mt-1">{totalOrders}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Active Subscriptions</span>
            <p className="text-2xl font-black text-green-400 mt-1">{activeOrders}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Attributed Commissions</span>
            <p className="text-2xl font-black text-aim-gold mt-1">₹{totalCommission.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters & Actions */}
        <OrderFilters onFilterChange={handleFilterChange} />

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onClick={() => setSelectedOrder(order)} 
              />
            ))
          ) : (
            <div className="text-center py-12 rounded-2xl border border-white/5 bg-aim-navy-light/20">
              <span className="text-4xl">🔍</span>
              <h3 className="text-white font-bold mt-3">No orders found</h3>
              <p className="text-aim-copy-muted text-xs mt-1">Try modifying your search or status filter options.</p>
            </div>
          )}
        </div>

        {/* Details Modal */}
        <OrderDetails 
          order={selectedOrder} 
          isOpen={!!selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      </div>
    </>
  )
}

export default PartnerOrders