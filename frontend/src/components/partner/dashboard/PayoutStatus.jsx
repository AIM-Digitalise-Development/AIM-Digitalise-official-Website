const PayoutStatus = () => (
  <div className="rounded-2xl border border-white/10 bg-aim-navy-light/60 p-6 space-y-4">
    <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted">Payout Status</p>

    {/* Next payout */}
    <div className="rounded-xl border border-aim-gold/20 bg-aim-gold/5 p-4 flex items-center justify-between">
      <div>
        <p className="text-[10px] text-aim-gold/70 uppercase tracking-wider font-semibold">Next Payout</p>
        <p className="text-2xl font-black text-aim-gold mt-1">₹12,340</p>
        <p className="text-[10px] text-aim-copy-muted mt-1">Scheduled: 15 Jun 2026</p>
      </div>
      <div className="w-12 h-12 rounded-xl bg-aim-gold/10 border border-aim-gold/20 flex items-center justify-center">
        <svg className="w-5 h-5 text-aim-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
    </div>

    {/* History */}
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-wider">Recent Payouts</p>
      {[
        { date: 'May 2026', amount: '₹9,800', status: 'Paid' },
        { date: 'Apr 2026', amount: '₹7,200', status: 'Paid' },
        { date: 'Mar 2026', amount: '₹11,500', status: 'Paid' },
      ].map(({ date, amount, status }) => (
        <div key={date} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
          <p className="text-aim-copy-muted text-xs">{date}</p>
          <div className="flex items-center gap-3">
            <p className="text-white font-semibold text-xs">{amount}</p>
            <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">
              {status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default PayoutStatus