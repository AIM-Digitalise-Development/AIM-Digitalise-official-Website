import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
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

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="rounded-2xl border border-white/10 bg-aim-navy-light/60 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted">Commission Earnings</p>
        <Link 
          to={ROUTES.PARTNER.PAYOUTS}
          className="text-xs font-bold text-aim-gold hover:text-aim-gold-light hover:underline transition-colors flex items-center gap-1"
        >
          <span>View Full Ledger</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div>
        {loading ? (
          <div className="h-8 w-32 bg-white/5 animate-pulse rounded-lg" />
        ) : (
          <p className="text-3xl font-black text-emerald-400">{fmt(data?.total_commission)}</p>
        )}
        <p className="text-[11px] text-aim-copy-muted mt-1">
          Net calculated commission from downline sales
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
        {[
          { label: 'Downline Sales', val: loading ? '...' : `₹${Number(data?.total_sales || 0).toLocaleString('en-IN')}` },
          { label: 'Paid Cycles', val: loading ? '...' : `${data?.total_orders || 0} Orders` },
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