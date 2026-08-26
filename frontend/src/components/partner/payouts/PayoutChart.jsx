const PayoutChart = ({ monthlyBreakdown = [] }) => {
  const defaultData = [
    { month: 'Dec', value: 8000, display: '₹8,000', sales: 160000 },
    { month: 'Jan', value: 14000, display: '₹14,000', sales: 280000 },
    { month: 'Feb', value: 12000, display: '₹12,000', sales: 240000 },
    { month: 'Mar', value: 18000, display: '₹18,000', sales: 360000 },
    { month: 'Apr', value: 15000, display: '₹15,000', sales: 300000 },
    { month: 'May', value: 22000, display: '₹22,000', sales: 440000 }
  ]

  const formatMonthLabel = (mStr) => {
    if (!mStr) return ''
    if (mStr.includes('-')) {
      const [year, month] = mStr.split('-')
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const mIdx = parseInt(month, 10) - 1
      return monthNames[mIdx] ? `${monthNames[mIdx]} '${year.slice(2)}` : mStr
    }
    return mStr
  }

  const chartData = monthlyBreakdown && monthlyBreakdown.length > 0
    ? [...monthlyBreakdown].reverse().map(item => ({
        month: formatMonthLabel(item.month),
        value: Number(item.commission || 0),
        display: `₹${Number(item.commission || 0).toLocaleString('en-IN')}`,
        sales: Number(item.total_sales || 0),
        orders: item.order_count || 0
      }))
    : defaultData

  const values = chartData.map(d => d.value)
  const maxValue = Math.max(...values, 100)
  const minValue = Math.min(...values)
  const avgValue = values.reduce((a, b) => a + b, 0) / (values.length || 1)

  return (
    <div className="rounded-2xl border border-white/10 bg-aim-navy-light/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Commission Trajectory</span>
          <span className="text-sm font-black text-white">Monthly Commission & Downline Sales</span>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-aim-gold/10 border border-aim-gold/20 text-aim-gold font-bold">
          Aggregated Cycles
        </span>
      </div>

      {/* Chart Bars Wrapper */}
      <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2 border-b border-white/10">
        {chartData.map((item, idx) => {
          const pct = Math.max((item.value / maxValue) * 100, 8)

          return (
            <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none bg-[#131722] border border-white/10 px-3 py-1.5 rounded-xl text-[10px] text-white shadow-2xl z-20 whitespace-nowrap text-center">
                <p className="font-black text-emerald-400">Commission: {item.display}</p>
                <p className="text-aim-copy-muted text-[9px]">Downline Sales: ₹{item.sales.toLocaleString('en-IN')}</p>
                {item.orders ? <p className="text-gray-400 text-[9px]">{item.orders} Orders</p> : null}
              </div>

              {/* Bar */}
              <div 
                className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-purple-600/60 via-purple-500 to-aim-gold transition-all duration-700 ease-out group-hover:from-purple-500 group-hover:to-aim-gold-light relative overflow-hidden"
                style={{ height: `${pct}%` }}
              >
                {/* Highlight line on hover */}
                <div className="absolute inset-y-0 left-0 w-px bg-white/20" />
              </div>

              {/* X Axis Label */}
              <span className="text-[10px] text-aim-copy-muted font-bold mt-2 h-4 truncate max-w-[60px] text-center">
                {item.month}
              </span>
            </div>
          )
        })}
      </div>

      {/* Y Axis reference indicator */}
      <div className="flex justify-between text-[9px] text-aim-copy-muted font-mono pt-1">
        <span>Min: ₹{Math.round(minValue).toLocaleString('en-IN')}</span>
        <span>Avg: ₹{Math.round(avgValue).toLocaleString('en-IN')}</span>
        <span>Max: ₹{Math.round(maxValue).toLocaleString('en-IN')}</span>
      </div>
    </div>
  )
}

export default PayoutChart