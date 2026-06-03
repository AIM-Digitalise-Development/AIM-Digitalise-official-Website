const EarningsWidget = () => (
  <div className="rounded-2xl border border-white/10 bg-aim-navy-light/60 p-6 space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted">Total Earnings</p>
      <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
    <div>
      <p className="text-3xl font-black text-white">₹52,340</p>
      <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        +12.5% from last month
      </p>
    </div>
    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
      {[{ label: 'This Month', val: '₹8,400' }, { label: 'Pending', val: '₹1,200' }].map(({ label, val }) => (
        <div key={label}>
          <p className="text-[10px] text-aim-copy-muted uppercase tracking-wider">{label}</p>
          <p className="text-white font-bold text-sm mt-0.5">{val}</p>
        </div>
      ))}
    </div>
  </div>
)

export default EarningsWidget