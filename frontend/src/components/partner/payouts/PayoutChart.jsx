const PayoutChart = () => {
  const data = [
    { month: 'Dec', value: 8000, display: '₹8K' },
    { month: 'Jan', value: 14000, display: '₹14K' },
    { month: 'Feb', value: 12000, display: '₹12K' },
    { month: 'Mar', value: 18000, display: '₹18K' },
    { month: 'Apr', value: 15000, display: '₹15K' },
    { month: 'May', value: 22000, display: '₹22K' }
  ]

  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="rounded-2xl border border-white/10 bg-aim-navy-light/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Earnings Trajectory</span>
          <span className="text-sm font-black text-white">Monthly Attributed Revenue</span>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-aim-gold/10 border border-aim-gold/20 text-aim-gold font-bold">
          Last 6 Months
        </span>
      </div>

      {/* Chart Bars Wrapper */}
      <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2 border-b border-white/10">
        {data.map((item) => {
          const pct = (item.value / maxValue) * 100

          return (
            <div key={item.month} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none bg-aim-navy-card border border-white/10 px-2 py-1 rounded text-[10px] text-white font-mono shadow-xl z-10">
                {item.display}
              </div>

              {/* Bar */}
              <div 
                className="w-full rounded-t-lg bg-gradient-to-t from-aim-purple/60 via-aim-purple to-aim-gold transition-all duration-700 ease-out group-hover:from-aim-purple group-hover:to-aim-gold-light relative overflow-hidden"
                style={{ height: `${pct}%` }}
              >
                {/* Highlight line on hover */}
                <div className="absolute inset-y-0 left-0 w-px bg-white/20" />
              </div>

              {/* X Axis Label */}
              <span className="text-[10px] text-aim-copy-muted font-bold mt-2 h-4">
                {item.month}
              </span>
            </div>
          )
        })}
      </div>

      {/* Y Axis reference indicator */}
      <div className="flex justify-between text-[9px] text-aim-copy-muted font-mono pt-1">
        <span>Min: ₹8,000</span>
        <span>Avg: ₹14,833</span>
        <span>Max: ₹22,000</span>
      </div>
    </div>
  )
}

export default PayoutChart