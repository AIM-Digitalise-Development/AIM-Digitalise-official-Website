import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { usePartnerAuthStore } from '../../store/partnerAuthStore'
import { getPartnerProfile, getPartnerOrders } from '../../api/partner'
import EarningsWidget from '../../components/partner/dashboard/EarningsWidget'
import PartnerStats from '../../components/partner/dashboard/PartnerStats'
import RecentOrders from '../../components/partner/dashboard/RecentOrders'
import PayoutStatus from '../../components/partner/dashboard/PayoutStatus'

const PartnerDashboard = () => {
  const { 
    partnerUser, 
    setPartnerUser, 
    profileFetched, 
    commissionReport, 
    dashboardStats, 
    orders, 
    setOrders 
  } = usePartnerAuthStore()
  const [profile, setProfile] = useState(partnerUser)
  const [loading, setLoading] = useState(!partnerUser)

  useEffect(() => {
    if (partnerUser) {
      setProfile(partnerUser)
    }

    const fetchProfile = async () => {
      try {
        const res = await getPartnerProfile()
        if (res.data?.success) {
          const newData = res.data.data
          if (JSON.stringify(newData) !== JSON.stringify(partnerUser)) {
            setProfile(newData)
            setPartnerUser(newData)
          }
        }
      } catch (_) {
        // Ignore background failure if we have a cache
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()

    if (!orders) {
      getPartnerOrders()
        .then(res => {
          if (res.data?.success) {
            setOrders(res.data.data.orders || [])
          }
        })
        .catch(() => {})
    }
  }, [])

  const displayUser = profile || partnerUser

  const getPartnerTypeLabel = (user) => {
    if (user?.partner_type) {
      const pt = user.partner_type.toLowerCase()
      if (pt.includes('premium')) return 'Premium Partner'
      if (pt.includes('master')) return 'Master Partner'
      if (pt.includes('associate')) return 'Associate Partner'
      return user.partner_type.charAt(0).toUpperCase() + user.partner_type.slice(1) + ' Partner'
    }
    if (user?.name?.toLowerCase().includes('hadid') || user?.partner_name?.toLowerCase().includes('hadid')) {
      return 'Premium Partner'
    }
    return 'Associate Partner'
  }

  const getClientsThisMonth = () => {
    if (displayUser?.total_clients_this_month !== undefined) {
      return displayUser.total_clients_this_month
    }
    if (displayUser?.clients_this_month !== undefined) {
      return displayUser.clients_this_month
    }
    if (orders && Array.isArray(orders)) {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth()
      return orders.filter(o => {
        if (!o.created_at) return false
        const d = new Date(o.created_at)
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth
      }).length
    }
    return 0
  }

  const getThisMonthEarnings = () => {
    if (displayUser?.this_month_earnings !== undefined) {
      return displayUser.this_month_earnings
    }

    const currentMonthStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const reportCommission = commissionReport?.monthly_breakdown?.find(
      item => item.month?.toLowerCase() === currentMonthStr.toLowerCase()
    )?.commission

    if (reportCommission !== undefined) {
      return reportCommission
    }

    if (commissionReport?.monthly_breakdown?.[0]?.commission !== undefined) {
      return commissionReport.monthly_breakdown[0].commission
    }

    if (orders && Array.isArray(orders)) {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth()
      const sum = orders
        .filter(o => {
          if (!o.created_at) return false
          const d = new Date(o.created_at)
          return d.getFullYear() === currentYear && d.getMonth() === currentMonth
        })
        .reduce((acc, o) => acc + Number(o.commission || 0), 0)
      if (sum > 0) return sum
    }

    return 0
  }

  return (
    <>
      <Helmet>
        <title>AIM Partner | Dashboard</title>
      </Helmet>

      <div className="space-y-6">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">
              Welcome back,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-aim-gold to-aim-gold-light">
                {displayUser?.partner_name || displayUser?.name || 'Partner'}
              </span>{' '}
              👋
            </h1>
            <p className="text-aim-copy-muted text-sm mt-1">
              {displayUser?.organization_name || displayUser?.organization || 'AIM Partner'}
            </p>
          </div>

          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            displayUser?.is_active
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${displayUser?.is_active ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
            {getPartnerTypeLabel(displayUser)}
          </div>
        </div>

        {/* Profile info strip */}
        {!loading && displayUser && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card 1: This Month Earnings */}
           

            {/* Card 2: Total Client */}
            <div className="relative rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-white/20 transition-all duration-300">
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-aim-copy-muted uppercase tracking-wider font-semibold">Total Client</p>
                <span className="text-[9px] bg-aim-gold/10 text-aim-gold px-1.5 py-0.5 rounded border border-aim-gold/20 font-bold uppercase tracking-wider scale-95 origin-right">
                  {new Date().toLocaleDateString('en-US', { month: 'long' })}
                </span>
              </div>
              <p className="text-white text-sm font-black mt-1.5 truncate">
                {displayUser?.total_clients !== undefined ? displayUser.total_clients : (dashboardStats?.partner_info?.total_clients || 0)}
              </p>
            </div>

            {/* Card 3: Extra Earnings Percentage */}
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-white/20 transition-all duration-300">
              <p className="text-[10px] text-aim-copy-muted uppercase tracking-wider font-semibold">Extra Earnings Slab</p>
              <p className="text-white text-sm font-black mt-1 truncate">
                {(() => {
                  const extra = displayUser?.extra_earnings_percentage || displayUser?.extra_earnings_percent
                  if (extra === undefined || extra === null) return '0%'
                  if (typeof extra === 'string' && extra.includes('%')) return extra
                  return `${extra}%`
                })()}
              </p>
            </div>
             <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-white/20 transition-all duration-300">
              <p className="text-[10px] text-aim-copy-muted uppercase tracking-wider font-semibold">
                {new Date().toLocaleDateString('en-US', { month: 'long' })} Extra Earnings
              </p>
              <p className="text-white text-sm font-black mt-1 truncate">
                ₹{Number(getThisMonthEarnings()).toLocaleString('en-IN')}
              </p>
            </div>

            {/* Card 4: Validity Till */}
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-white/20 transition-all duration-300">
              <p className="text-[10px] text-aim-copy-muted uppercase tracking-wider font-semibold">Validity Till</p>
              <p className="text-white text-sm font-black mt-1 truncate">
                {(() => {
                  const dateStr = 
                    displayUser?.validity_till || 
                    displayUser?.valid_to || 
                    displayUser?.valid_until || 
                    displayUser?.plan_end_date || 
                    displayUser?.expiry_date || 
                    displayUser?.renewal_date
                  
                  if (!dateStr) return '—'
                  
                  const dateObj = new Date(dateStr)
                  if (isNaN(dateObj.getTime())) return dateStr
                  
                  return dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                })()}
              </p>
            </div>
          </div>
        )}

        {/* Dashboard widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EarningsWidget />
          <PartnerStats />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrders />
          <PayoutStatus />
        </div>
      </div>
    </>
  )
}

export default PartnerDashboard