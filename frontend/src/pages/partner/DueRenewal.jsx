import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { usePartnerAuthStore } from '../../store/partnerAuthStore'

const INITIAL_RENEWALS = [
  { id: 1, clientName: 'Metro Multispeciality Hospital', email: 'purchase@metrohospitals.in', phone: '+91 99330 11223', product: 'NEXGN Hospital MS', originalPurchaseDate: '2025-06-15', renewalDueDate: '2026-06-15', amount: 85000, status: 'Due in 5 Days' },
  { id: 2, clientName: 'Apex Engineering Works', email: 'sales@apexeng.com', phone: '+91 88776 65544', product: 'NexGen ERP Standard', originalPurchaseDate: '2025-06-02', renewalDueDate: '2026-06-02', amount: 50000, status: 'Overdue' },
  { id: 3, clientName: 'Doons Public School', email: 'info@doonspublicschool.edu.in', phone: '+91 77665 44332', product: 'NEXGN School Suite', originalPurchaseDate: '2025-06-22', renewalDueDate: '2026-06-22', amount: 45000, status: 'Due in 12 Days' },
  { id: 4, clientName: 'Zenith Retail Outlets', email: 'franchise@zenithretail.co.in', phone: '+91 91122 33445', product: 'Retail Billing & GST POS', originalPurchaseDate: '2025-07-08', renewalDueDate: '2026-07-08', amount: 24000, status: 'Active' },
  { id: 5, clientName: 'Pioneer Logistics Services', email: 'operations@pioneerlog.com', phone: '+91 85566 77889', product: 'NexGen ERP Enterprise', originalPurchaseDate: '2025-05-28', renewalDueDate: '2026-05-28', amount: 120000, status: 'Grace Period' },
]

const PartnerDueRenewal = () => {
  const { renewals, setRenewals } = usePartnerAuthStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [remindedIds, setRemindedIds] = useState([])
  const [toastMessage, setToastMessage] = useState('')

  // Initialize store if null
  useEffect(() => {
    if (!renewals) {
      setRenewals(INITIAL_RENEWALS)
    }
  }, [renewals, setRenewals])

  const currentRenewals = renewals || INITIAL_RENEWALS

  // Calculations
  const totalRenewals = currentRenewals.length
  const overdueCount = currentRenewals.filter(r => r.status === 'Overdue' || r.status === 'Grace Period').length
  const activeCount = currentRenewals.filter(r => r.status === 'Active').length
  const projectedCommissions = currentRenewals.reduce((acc, r) => acc + (r.amount * 0.15), 0) // Mock 15% partner commission

  const handleSendReminder = (id, clientName) => {
    if (remindedIds.includes(id)) return
    setRemindedIds([...remindedIds, id])
    setToastMessage(`Renewal reminder email successfully dispatched to ${clientName}!`)
    setTimeout(() => setToastMessage(''), 4000)
  }

  const filteredRenewals = currentRenewals.filter(r => {
    const matchesSearch = 
      r.clientName.toLowerCase().includes(search.toLowerCase()) ||
      r.product.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = 
      statusFilter === 'All' ||
      (statusFilter === 'Overdue' && (r.status === 'Overdue' || r.status === 'Grace Period')) ||
      (statusFilter === 'Due Soon' && r.status.includes('Due')) ||
      (statusFilter === 'Active' && r.status === 'Active')

    return matchesSearch && matchesStatus
  })

  return (
    <>
      <Helmet>
        <title>Due Renewals | AIM Partner</title>
      </Helmet>

      <div className="space-y-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Due Renewals</h1>
            <p className="text-aim-copy-muted text-xs mt-1">
              Track subscriptions due for renewal soon and trigger reminders to secure recurring commissions.
            </p>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-4 rounded-xl border border-aim-gold/30 bg-aim-gold/10 text-aim-gold text-xs font-bold animate-pulse">
            🔔 {toastMessage}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Total Subscriptions</span>
            <p className="text-2xl font-black text-white mt-1">{totalRenewals}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Overdue / Grace</span>
            <p className="text-2xl font-black text-red-400 mt-1">{overdueCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Active Accounts</span>
            <p className="text-2xl font-black text-green-400 mt-1">{activeCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Projected Commissions (15%)</span>
            <p className="text-2xl font-black text-aim-gold mt-1">₹{projectedCommissions.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-aim-navy-light/20 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by client, email, or product..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-aim-gold font-sans font-semibold"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {['All', 'Overdue', 'Due Soon', 'Active'].map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-aim-gold text-aim-navy'
                    : 'bg-white/5 text-aim-copy-muted hover:text-white border border-white/5'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Renewals Table */}
        <div className="rounded-2xl border border-white/10 bg-aim-navy-card/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px] font-semibold">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-aim-copy-muted uppercase tracking-wider">
                  <th className="px-6 py-4">Client Details</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Purchase Date</th>
                  <th className="px-6 py-4">Renewal Due</th>
                  <th className="px-6 py-4 text-right">Renewal Value</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/95">
                {filteredRenewals.length > 0 ? (
                  filteredRenewals.map(renewal => (
                    <tr key={renewal.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white text-xs">{renewal.clientName}</p>
                        <p className="text-[10px] text-aim-copy-muted font-medium">{renewal.email}</p>
                        <p className="text-[10px] text-aim-copy-muted font-medium">{renewal.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-aim-purple/20 text-aim-purple-light border border-aim-purple/20 text-[9px] font-black uppercase tracking-wider">
                          {renewal.product}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-white/50">{new Date(renewal.originalPurchaseDate).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4 font-mono text-white/50">{new Date(renewal.renewalDueDate).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4 text-right font-black text-aim-gold text-xs">₹{renewal.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          renewal.status === 'Active' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                          renewal.status === 'Overdue' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                          renewal.status === 'Grace Period' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                          'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                        }`}>
                          {renewal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleSendReminder(renewal.id, renewal.clientName)}
                          disabled={renewal.status === 'Active'}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            renewal.status === 'Active'
                              ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                              : remindedIds.includes(renewal.id)
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-aim-gold text-aim-navy hover:brightness-110 shadow-sm shadow-aim-gold/15'
                          }`}
                        >
                          {remindedIds.includes(renewal.id) ? 'Reminder Sent ✓' : 'Send Reminder'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-aim-copy-muted">
                      <p className="font-bold">No renewals found matching current selection</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default PartnerDueRenewal
