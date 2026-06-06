import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats } from '../../../api/partner'
import { ROUTES } from '../../../constants/routes'

const statusStyle = (status, isActive) => {
  if (isActive) return 'text-green-400 bg-green-500/10 border-green-500/20'
  if (status === 'paid') return 'text-aim-gold bg-aim-gold/10 border-aim-gold/20'
  return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
}

const RecentOrders = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        if (res.data?.success) {
          setActivities(res.data.data.recent_activities?.slice(0, 5) || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-2xl border border-white/10 bg-aim-navy-light/60 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted">Recent Activity</p>
        <Link to={ROUTES.PARTNER.ORDERS} className="text-[10px] text-aim-gold font-semibold hover:underline">
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-white/5 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-aim-copy-muted text-xs py-4 text-center">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {activities.map((act, i) => {
            const statusCls = statusStyle(act.payment_status, act.is_active)
            return (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-semibold truncate">{act.client_name}</p>
                  <p className="text-aim-copy-muted text-[10px] mt-0.5 truncate">{act.product_name}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <p className="text-white font-bold text-xs">₹{Number(act.amount || 0).toLocaleString('en-IN')}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusCls}`}>
                    {act.payment_status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default RecentOrders