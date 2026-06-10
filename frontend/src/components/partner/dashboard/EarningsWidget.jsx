import { useState, useEffect } from 'react'
import { getCommissionReport } from '../../../api/partner'
import { usePartnerAuthStore } from '../../../store/partnerAuthStore'

const EarningsWidget = () => {
  const { commissionReport, setCommissionReport } = usePartnerAuthStore()
  const [data, setData] = useState(commissionReport)
  const [loading, setLoading] = useState(!commissionReport)

  useEffect(() => {
    if (commissionReport) {
      setData(commissionReport)
    }

    getCommissionReport()
      .then((res) => {
        if (res.data?.success) {
          const newData = res.data.data
          if (JSON.stringify(newData) !== JSON.stringify(commissionReport)) {
            setData(newData)
            setCommissionReport(newData)
          }
        }
      })
      .catch(() => {}) // graceful fail — show skeleton
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  // Last month commission from breakdown
  const lastMonth = data?.monthly_breakdown?.[0]
  const prevMonth = data?.monthly_breakdown?.[1]
  const growthPct = lastMonth && prevMonth && prevMonth.commission > 0
    ? (((lastMonth.commission - prevMonth.commission) / prevMonth.commission) * 100).toFixed(1)
    : null

  return (
    <div className="rounded-2xl border border-white/10 bg-aim-navy-light/60 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted">Commission Earnings</p>
        <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-32 bg-white/5 animate-pulse rounded-lg" />
        ) : (
          <p className="text-3xl font-black text-white">{fmt(data?.total_commission)}</p>
        )}
        {growthPct && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${Number(growthPct) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={Number(growthPct) >= 0 ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
            </svg>
            {Math.abs(growthPct)}% vs last month
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
        {[
          { label: 'Total Sales', val: loading ? '...' : fmt(data?.total_sales) },
          { label: 'Rate', val: loading ? '...' : (data?.commission_rate || '10%') },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="text-[10px] text-aim-copy-muted uppercase tracking-wider">{label}</p>
            <p className="text-white font-bold text-sm mt-0.5">{val}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EarningsWidget