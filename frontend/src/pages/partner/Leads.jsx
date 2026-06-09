import { useState } from 'react'
import { Helmet } from 'react-helmet-async'

const INITIAL_LEADS = [
  { id: 1, date: '2026-06-01', name: 'Metro Multispeciality Hospital', email: 'purchase@metrohospitals.in', phone: '+91 99330 11223', product: 'NEXGN Hospital MS', value: 85000, status: 'Proposal Sent' },
  { id: 2, date: '2026-05-24', name: 'Apex Engineering Works', email: 'sales@apexeng.com', phone: '+91 88776 65544', product: 'NexGen ERP Standard', value: 50000, status: 'Won' },
  { id: 3, date: '2026-05-18', name: 'Doons Public School', email: 'info@doonspublicschool.edu.in', phone: '+91 77665 44332', product: 'NEXGN School Suite', value: 45000, status: 'Negotiating' },
  { id: 4, date: '2026-05-10', name: 'Zenith Retail Outlets', email: 'franchise@zenithretail.co.in', phone: '+91 91122 33445', product: 'Retail Billing & GST POS', value: 24000, status: 'New' },
  { id: 5, date: '2026-04-28', name: 'Pioneer Logistics Services', email: 'operations@pioneerlog.com', phone: '+91 85566 77889', product: 'NexGen ERP Enterprise', value: 120000, status: 'Lost' },
]

const PartnerLeads = () => {
  const [leads, setLeads] = useState(INITIAL_LEADS)
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Form states
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    product: 'NexGen ERP Standard',
    value: '',
    status: 'New'
  })

  // Calculations
  const totalLeads = leads.length
  const wonLeads = leads.filter(l => l.status === 'Won').length
  const hotLeads = leads.filter(l => l.status === 'Proposal Sent' || l.status === 'Negotiating').length
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0

  const handleAddLead = (e) => {
    e.preventDefault()
    if (!newLead.name || !newLead.email || !newLead.value) return

    const leadObj = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone || '—',
      product: newLead.product,
      value: Number(newLead.value),
      status: newLead.status
    }

    setLeads([leadObj, ...leads])
    setSuccessMessage(`Lead for "${newLead.name}" has been registered successfully!`)
    setNewLead({
      name: '',
      email: '',
      phone: '',
      product: 'NexGen ERP Standard',
      value: '',
      status: 'New'
    })
    setShowAddForm(false)
    setTimeout(() => setSuccessMessage(''), 5000)
  }

  const handleStatusChange = (leadId, newStatus) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
  }

  const filteredLeads = leads.filter(l => {
    return (
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.product.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <>
      <Helmet>
        <title>Leads Registry | AIM Partner</title>
      </Helmet>

      <div className="space-y-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Leads Registry</h1>
            <p className="text-aim-copy-muted text-xs mt-1">
              Register and track prospective clients to protect your attribution and commissions.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-gradient-to-r from-aim-gold to-aim-gold-light hover:brightness-110 text-aim-navy rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-aim-gold/15"
          >
            {showAddForm ? 'Cancel Registration' : 'Register New Lead'}
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-bold animate-pulse">
            ✅ {successMessage}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Registered Leads</span>
            <p className="text-2xl font-black text-white mt-1">{totalLeads}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Deals Won</span>
            <p className="text-2xl font-black text-green-400 mt-1">{wonLeads}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Hot Prospects</span>
            <p className="text-2xl font-black text-yellow-400 mt-1">{hotLeads}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Conversion Rate</span>
            <p className="text-2xl font-black text-aim-gold mt-1">{conversionRate}%</p>
          </div>
        </div>

        {/* Add Lead Form Section */}
        {showAddForm && (
          <div className="rounded-2xl border border-white/10 bg-aim-navy-card/80 p-6 shadow-xl max-w-xl mx-auto">
            <h3 className="text-sm font-black text-white mb-4 border-b border-white/5 pb-2">Register Lead details</h3>
            <form onSubmit={handleAddLead} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1">Company / Client Name *</label>
                  <input
                    type="text"
                    required
                    value={newLead.name}
                    onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                    placeholder="e.g. Zenith Tech"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-aim-gold font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1">Primary Email *</label>
                  <input
                    type="email"
                    required
                    value={newLead.email}
                    onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="e.g. buyer@zenith.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-aim-gold font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={newLead.phone}
                    onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="e.g. +91 99999 88888"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-aim-gold font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1">Est. Deal Value (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newLead.value}
                    onChange={e => setNewLead({ ...newLead, value: e.target.value })}
                    placeholder="e.g. 50000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-aim-gold font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1">Product Interest</label>
                  <select
                    value={newLead.product}
                    onChange={e => setNewLead({ ...newLead, product: e.target.value })}
                    className="w-full bg-aim-navy border border-white/10 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-aim-gold font-sans"
                  >
                    <option value="NexGen ERP Standard">NexGen ERP Standard</option>
                    <option value="NexGen ERP Enterprise">NexGen ERP Enterprise</option>
                    <option value="NEXGN School Suite">NEXGN School Suite</option>
                    <option value="NEXGN Hospital MS">NEXGN Hospital MS</option>
                    <option value="Retail Billing & GST POS">Retail Billing & GST POS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1">Lead Stage</label>
                  <select
                    value={newLead.status}
                    onChange={e => setNewLead({ ...newLead, status: e.target.value })}
                    className="w-full bg-aim-navy border border-white/10 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-aim-gold font-sans"
                  >
                    <option value="New">New Lead</option>
                    <option value="Contacted">Contacted / Pitching</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiating">Negotiating</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-bold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Register Lead
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lead list registry controls */}
        <div className="bg-aim-navy-light/20 border border-white/5 p-4 rounded-xl flex items-center justify-between">
          <div className="relative flex-grow max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search leads by name, email, or product..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-aim-gold font-sans font-semibold"
            />
          </div>
        </div>

        {/* Leads registry table */}
        <div className="rounded-2xl border border-white/10 bg-aim-navy-card/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px] font-semibold">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-aim-copy-muted uppercase tracking-wider">
                  <th className="px-6 py-4">Register Date</th>
                  <th className="px-6 py-4">Client Contact</th>
                  <th className="px-6 py-4">Product of Interest</th>
                  <th className="px-6 py-4 text-right">Estimated Deal Value</th>
                  <th className="px-6 py-4 text-center">Status badge</th>
                  <th className="px-6 py-4 text-center">Update Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/95">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-white/50">{new Date(lead.date).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white text-xs">{lead.name}</p>
                        <p className="text-[10px] text-aim-copy-muted font-medium">{lead.email}</p>
                        <p className="text-[10px] text-aim-copy-muted font-medium">{lead.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-aim-purple/20 text-aim-purple-light border border-aim-purple/20 text-[9px] font-black uppercase tracking-wider">
                          {lead.product}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-aim-gold text-xs">₹{lead.value.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          lead.status === 'Won' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                          lead.status === 'Lost' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                          lead.status === 'Negotiating' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                          lead.status === 'Proposal Sent' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                          'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={lead.status}
                          onChange={e => handleStatusChange(lead.id, e.target.value)}
                          className="bg-aim-navy border border-white/10 rounded px-1.5 py-1 text-[10px] text-white focus:outline-none focus:border-aim-gold cursor-pointer"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Proposal Sent">Proposal Sent</option>
                          <option value="Negotiating">Negotiating</option>
                          <option value="Won">Mark Won</option>
                          <option value="Lost">Mark Lost</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-aim-copy-muted">
                      <p className="font-bold">No leads found in registration registry</p>
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

export default PartnerLeads
