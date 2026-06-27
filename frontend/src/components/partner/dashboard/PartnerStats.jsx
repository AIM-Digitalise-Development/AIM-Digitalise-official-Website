import { useEffect, useState } from 'react'
import { getDashboardStats } from '../../../api/partner'
import { usePartnerAuthStore } from '../../../store/partnerAuthStore'

const PartnerStats = () => {
  const { dashboardStats, setDashboardStats } = usePartnerAuthStore()
  const [stats, setStats] = useState(dashboardStats)
  const [loading, setLoading] = useState(!dashboardStats)

  useEffect(() => {
    if (dashboardStats) {
      setStats(dashboardStats)
    }

    getDashboardStats()
      .then((res) => {
        if (res.data?.success) {
          const newData = res.data.data
          if (JSON.stringify(newData) !== JSON.stringify(dashboardStats)) {
            setStats(newData)
            setDashboardStats(newData)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const info = stats?.partner_info

  const statCards = [
    {
      label: 'Total Clients',
      value: loading ? '...' : (info?.total_clients ?? 0),
      icon: '📦',
      color: 'text-aim-gold',
      bg: 'bg-aim-gold/10 border-aim-gold/20',
    },
    {
      label: 'Total Commission',
      value: loading ? '...' : `₹${Number(info?.total_revenue || 0).toLocaleString('en-IN')}`,
      icon: '💰',
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
    },
    {
      label: 'Total Renued Clients',
      value: 0,
      icon: '🏷️',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Total Renued Commission',
      value: loading ? '...' : `₹${Number(info?.total_renewed_commission || 0).toLocaleString('en-IN')}`,
      icon: '✅',
      color: info?.is_active ? 'text-green-400' : 'text-yellow-400',
      bg: info?.is_active ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20',
    },
  ]

  return (
    <div className="rounded-2xl border border-white/10 bg-aim-navy-light/60 p-6 space-y-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted">Partner Stats</p>
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ label, value, icon, color, bg }) => (
          <div key={label} className={`rounded-xl border p-4 ${bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{icon}</span>
            </div>
            <p className={`text-lg font-black truncate ${color}`}>{value}</p>
            <p className="text-[10px] text-aim-copy-muted uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PartnerStats