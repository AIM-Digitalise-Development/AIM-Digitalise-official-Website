import React, { useState, useMemo } from 'react'
import RankBadge from '../network/RankBadge'

const CommissionDetailsTable = ({ commissionDetails = [], myRank = 'master' }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [cycleFilter, setCycleFilter] = useState('all')
  const [selectedTx, setSelectedTx] = useState(null)

  const filteredList = useMemo(() => {
    return (commissionDetails || []).filter((item) => {
      const query = searchTerm.toLowerCase().trim()
      const matchClient = (item.client_name || '').toLowerCase().includes(query)
      const matchClientId = (item.client_display_id || '').toLowerCase().includes(query)
      const matchSeller = (item.seller_name || '').toLowerCase().includes(query)
      const matchSellerId = (item.seller_id || '').toLowerCase().includes(query)
      const searchOk = !query || matchClient || matchClientId || matchSeller || matchSellerId

      const cycleOk = cycleFilter === 'all' || (item.cycle || '').toLowerCase() === cycleFilter.toLowerCase()

      return searchOk && cycleOk
    })
  }, [commissionDetails, searchTerm, cycleFilter])

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#131722]/80 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="relative flex-1">
          <svg
            className="w-4 h-4 text-aim-copy-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client name, client ID, seller name, or seller PID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-aim-copy-muted focus:outline-none focus:border-aim-gold/50 focus:ring-1 focus:ring-aim-gold/50 transition-all"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2.5">
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-aim-gold/50 cursor-pointer"
          >
            <option value="all" className="bg-[#131722] text-white">All Billing Cycles</option>
            <option value="monthly" className="bg-[#131722] text-white">Monthly Subscriptions</option>
            <option value="yearly" className="bg-[#131722] text-white">Yearly Subscriptions</option>
          </select>
        </div>
      </div>

      {/* Commission Ledger Table */}
      <div className="rounded-2xl border border-white/10 bg-[#131722]/80 backdrop-blur-md overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-white">Downline Commission Breakdown</h3>
            <p className="text-[11px] text-aim-copy-muted mt-0.5">
              Itemized payouts calculated from subscription cycles across your downline network.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-aim-gold/10 text-aim-gold border border-aim-gold/20 self-start sm:self-center">
            {filteredList.length} Transaction{filteredList.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-aim-copy-muted">
                <th className="py-3 px-4">Date & Tx ID</th>
                <th className="py-3 px-4">Client Details</th>
                <th className="py-3 px-4">Direct Seller (Downline)</th>
                <th className="py-3 px-4 text-right">Subscription Paid</th>
                <th className="py-3 px-4 text-center">My Rate</th>
                <th className="py-3 px-4 text-right">My Commission</th>
                <th className="py-3 px-4 text-center">Downline Chain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
              {filteredList.length > 0 ? (
                filteredList.map((item) => {
                  const downlines = item.downline_commissions || []

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                      {/* Date & Tx ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-white text-xs block">#TX-{item.id}</span>
                        <span className="text-[11px] text-aim-copy-muted block mt-0.5">
                          {item.payment_date ? new Date(item.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </span>
                      </td>

                      {/* Client Details */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white group-hover:text-aim-gold transition-colors truncate">
                          {item.client_name || 'Client'}
                        </p>
                        <p className="text-[11px] text-aim-copy-muted font-mono truncate">
                          {item.client_display_id || '—'}
                        </p>
                      </td>

                      {/* Direct Seller */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-bold text-white truncate">{item.seller_name || 'Seller'}</p>
                            <p className="text-[10px] text-aim-copy-muted font-mono">{item.seller_id || '—'}</p>
                          </div>
                          {item.seller_rank && <RankBadge rank={item.seller_rank} size="xs" />}
                        </div>
                      </td>

                      {/* Subscription Paid */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-bold text-white block">
                          ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-aim-copy-muted">
                          {item.cycle || 'Monthly'}
                        </span>
                      </td>

                      {/* My Commission Rate */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold text-xs">
                          {item.my_commission_rate || '—'}
                        </span>
                      </td>

                      {/* My Commission Earned */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-black text-emerald-400 text-sm block">
                          +₹{Number(item.my_commission_earned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Downline Chain Action / Preview */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {downlines.length > 0 ? (
                          <button
                            onClick={() => setSelectedTx(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-aim-gold/10 text-aim-gold border border-white/10 hover:border-aim-gold/30 text-xs font-bold transition-all cursor-pointer"
                          >
                            <span>{downlines.length} in Chain</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-gray-500 text-xs font-medium">Direct Sale</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-aim-copy-muted">
                    <p className="text-sm font-semibold">No commission transactions found matching the filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Downline Commission Chain Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#131722] border border-white/10 shadow-2xl p-6 sm:p-7 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-aim-gold">Transaction Details</span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Commission Chain for {selectedTx.client_name}
                </h3>
                <p className="text-xs text-aim-copy-muted">
                  Client ID: <span className="font-mono text-gray-300 font-bold">{selectedTx.client_display_id}</span> • Subscription: <span className="text-white font-bold">₹{Number(selectedTx.amount || 0).toLocaleString('en-IN')}</span> ({selectedTx.cycle})
                </p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              >
                ✕
              </button>
            </div>

            {/* My Earning Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-aim-gold/10 border border-aim-gold/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-aim-gold uppercase tracking-wider">You (Receiver)</span>
                <p className="text-sm font-black text-white">Your Net Override Commission</p>
                <p className="text-xs text-aim-copy-muted">Calculated at {selectedTx.my_commission_rate} rate</p>
              </div>
              <span className="text-xl font-black text-emerald-400">
                +₹{Number(selectedTx.my_commission_earned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Subordinates Breakdown List */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-2.5">
                Downline Subordinate Earnings in Chain:
              </p>

              <div className="space-y-2">
                {(selectedTx.downline_commissions || []).map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-aim-gold shrink-0">
                        {(sub.partner_name || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">{sub.partner_name}</p>
                          <RankBadge rank={sub.rank} size="xs" />
                        </div>
                        <p className="text-[10px] text-aim-copy-muted font-mono mt-0.5">
                          {sub.partner_id} • Rate: <span className="text-purple-300 font-bold">{sub.commission_rate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-white block">
                        ₹{Number(sub.commission_earned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-gray-400">Earned</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Chain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommissionDetailsTable
