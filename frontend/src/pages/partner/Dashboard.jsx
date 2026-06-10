import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { usePartnerAuthStore } from '../../store/partnerAuthStore'
import { getPartnerProfile } from '../../api/partner'
import EarningsWidget from '../../components/partner/dashboard/EarningsWidget'
import PartnerStats from '../../components/partner/dashboard/PartnerStats'
import RecentOrders from '../../components/partner/dashboard/RecentOrders'
import PayoutStatus from '../../components/partner/dashboard/PayoutStatus'

const PartnerDashboard = () => {
  const { partnerUser, setPartnerUser, profileFetched } = usePartnerAuthStore()
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

  return (
    <>
      <Helmet>
        <title>Partner Dashboard | AIM Digitalise</title>
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
            {[
              { label: 'Email', value: displayUser.email },
              { label: 'Contact', value: displayUser.contact_no || displayUser.contact },
              { label: 'Payment Status', value: displayUser.payment_status || '—' },
              { label: 'Last Login', value: displayUser.last_login_at ? new Date(displayUser.last_login_at).toLocaleDateString('en-IN') : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] text-aim-copy-muted uppercase tracking-wider font-semibold">{label}</p>
                <p className="text-white text-xs font-semibold mt-1 truncate">{value || '—'}</p>
              </div>
            ))}
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