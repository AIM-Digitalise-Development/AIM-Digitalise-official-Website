import { useEffect, useState } from 'react'
import { getCommissionReport } from '../../../api/partner'

const PayoutStatus = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCommissionReport()
      .then((res) => {
        if (res.data?.success) setData(res.data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`
  const breakdown = data?.monthly_breakdown?.slice(0, 3) || []

  return (
    <div className="rounded-2xl border border-white/10 bg-aim-navy-light/60 p-6 space-y-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted">Commission Overview</p>

      {/* Total commission card */}
      <div className="rounded-xl border border-aim-gold/20 bg-aim-gold/5 p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-aim-gold/70 uppercase tracking-wider font-semibold">Total Commission</p>
          {loading ? (
            <div className="h-7 w-24 bg-white/5 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-black text-aim-gold mt-1">{fmt(data?.total_commission)}</p>
          )}
          <p className="text-[10px] text-aim-copy-muted mt-1">
            Rate: {data?.commission_rate || '10%'} · Orders: {data?.total_orders ?? 0}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-aim-gold/10 border border-aim-gold/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-aim-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-wider">Monthly Breakdown</p>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-white/5 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : breakdown.length === 0 ? (
          <p className="text-aim-copy-muted text-xs py-2 text-center">No paid orders yet.</p>
        ) : (
          breakdown.map((item) => (
            <div key={item.month} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
              <p className="text-aim-copy-muted text-xs">{item.month} ({item.order_count} orders)</p>
              <div className="flex items-center gap-3">
                <p className="text-white font-semibold text-xs">{fmt(item.commission)}</p>
                <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">
                  Earned
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PayoutStatus