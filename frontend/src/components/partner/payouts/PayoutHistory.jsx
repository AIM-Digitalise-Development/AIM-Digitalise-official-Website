const PayoutHistory = ({ payouts = [] }) => {
  const defaultPayouts = [
    { id: 'PAY-8921', date: '30 May 2026', amount: '₹9,800', method: 'Bank Transfer', status: 'Paid' },
    { id: 'PAY-8920', date: '15 May 2026', amount: '₹12,400', method: 'Bank Transfer', status: 'Paid' },
    { id: 'PAY-8919', date: '30 Apr 2026', amount: '₹7,200', method: 'Bank Transfer', status: 'Paid' },
    { id: 'PAY-8918', date: '15 Apr 2026', amount: '₹11,500', method: 'Bank Transfer', status: 'Paid' },
    { id: 'PAY-8917', date: '30 Mar 2026', amount: '₹6,400', method: 'Bank Transfer', status: 'Paid' }
  ]

  const list = payouts.length > 0 ? payouts : defaultPayouts

  return (
    <div className="rounded-2xl border border-white/10 bg-aim-navy-light/40 overflow-hidden">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Transaction Ledger</span>
          <span className="text-sm font-black text-white">Payout History Log</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-aim-copy-muted font-bold uppercase tracking-wider">
              <th className="px-5 py-3">Payout ID</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/90">
            {list.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-3.5 font-mono">{item.id}</td>
                <td className="px-5 py-3.5">{item.date}</td>
                <td className="px-5 py-3.5 text-aim-copy-muted">{item.method}</td>
                <td className="px-5 py-3.5 text-right font-black">{item.amount}</td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                    item.status === 'Paid'
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PayoutHistory