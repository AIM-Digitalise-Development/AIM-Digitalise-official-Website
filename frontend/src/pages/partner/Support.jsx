import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { usePartnerAuthStore } from '../../store/partnerAuthStore'

const INITIAL_TICKETS = [
  { id: 'TKT-8910', date: '2026-06-09', title: 'ERP Billing Module GST Calculation Error', category: 'Product Issue', priority: 'High', status: 'Open' },
  { id: 'TKT-8854', date: '2026-06-08', title: 'Hospital MS License Key Activation Issue', category: 'Activation Delay', priority: 'High', status: 'In Progress' },
  { id: 'TKT-8622', date: '2026-06-02', title: 'Payout processing delay query', category: 'Payout Issue', priority: 'Low', status: 'Resolved' },
]

const PartnerSupport = () => {
  const { tickets, setTickets } = usePartnerAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Initialize store if null
  useEffect(() => {
    if (!tickets) {
      setTickets(INITIAL_TICKETS)
    }
  }, [tickets, setTickets])

  const currentTickets = tickets || INITIAL_TICKETS
  
  // Form state
  const [newTicket, setNewTicket] = useState({
    title: '',
    category: 'Product Issue',
    priority: 'Medium',
    description: '',
  })

  // Stats calculations
  const totalTickets = currentTickets.length
  const openTicketsCount = currentTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length
  const resolvedTicketsCount = currentTickets.filter(t => t.status === 'Resolved').length

  const handleCreateTicket = (e) => {
    e.preventDefault()
    if (!newTicket.title || !newTicket.description) return

    const newTicketObj = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      title: newTicket.title,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'Open'
    }

    setTickets([newTicketObj, ...currentTickets])
    setSuccessMessage(`Support Ticket "${newTicketObj.id}" has been created successfully!`)
    setNewTicket({
      title: '',
      category: 'Product Issue',
      priority: 'Medium',
      description: '',
    })
    setShowForm(false)
    setTimeout(() => setSuccessMessage(''), 5000)
  }

  return (
    <>
      <Helmet>
        <title>Help & Support | AIM Partner</title>
      </Helmet>

      <div className="space-y-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Help & Support</h1>
            <p className="text-aim-copy-muted text-xs mt-1">
              Submit support tickets for client installation issues, license inquiries, or payout questions.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gradient-to-r from-aim-gold to-aim-gold-light hover:brightness-110 text-aim-navy rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-aim-gold/15"
          >
            {showForm ? 'Cancel Request' : 'Create Support Ticket'}
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-bold animate-pulse">
            ✅ {successMessage}
          </div>
        )}

        {/* Support Stats strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Total Tickets</span>
            <p className="text-2xl font-black text-white mt-1">{totalTickets}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Open Tickets</span>
            <p className="text-2xl font-black text-yellow-400 mt-1">{openTicketsCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Resolved Issues</span>
            <p className="text-2xl font-black text-green-400 mt-1">{resolvedTicketsCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Average Response Time</span>
            <p className="text-2xl font-black text-aim-gold mt-1">1.5 hrs</p>
          </div>
        </div>

        {/* Create Ticket Form Section */}
        {showForm && (
          <div className="rounded-2xl border border-white/10 bg-aim-navy-card/80 p-6 shadow-xl max-w-xl mx-auto">
            <h3 className="text-sm font-black text-white mb-4 border-b border-white/5 pb-2">File a Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1">Issue Subject / Title *</label>
                <input
                  type="text"
                  required
                  value={newTicket.title}
                  onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="e.g. License activation failed for Zenith Tech"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-aim-gold font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full bg-aim-navy border border-white/10 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-aim-gold font-sans"
                  >
                    <option value="Product Issue">Product Issue</option>
                    <option value="Activation Delay">Activation Delay</option>
                    <option value="Payout Issue">Payout Issue</option>
                    <option value="General Query">General Query</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full bg-aim-navy border border-white/10 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-aim-gold font-sans"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows="4"
                  value={newTicket.description}
                  onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Please describe the issue in detail, including Client ID, error messages, and steps to reproduce."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-aim-gold font-sans"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-bold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Submit Support Ticket
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Support Ticket History Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-aim-navy-card/40 overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/5">
                <h3 className="text-xs font-black uppercase tracking-wider text-aim-copy-muted">Ticket History & Progress</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px] font-semibold">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-aim-copy-muted uppercase tracking-wider">
                      <th className="px-6 py-4">Ticket ID</th>
                      <th className="px-6 py-4">Submission Date</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-center">Priority</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/95">
                    {currentTickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-white/50">{ticket.id}</td>
                        <td className="px-6 py-4 font-mono text-white/50">{new Date(ticket.date).toLocaleDateString('en-IN')}</td>
                        <td className="px-6 py-4 font-bold text-white text-xs">{ticket.title}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] text-aim-copy-muted">{ticket.category}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                            ticket.priority === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            ticket.priority === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            ticket.status === 'Resolved' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                            ticket.status === 'In Progress' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Contact Support Information Info card */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-aim-navy-card/60 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-black text-white">Direct Support Hotline</h3>
                <p className="text-[10px] text-aim-copy-muted mt-0.5">Reach out to our customer care and tech support.</p>
              </div>
              <div className="space-y-3 text-xs font-semibold text-aim-copy-muted">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-xl">📞</span>
                  <div>
                    <p className="text-white text-xs font-bold">+91 1800-419-5880</p>
                    <p className="text-[9px] text-aim-copy-muted">Toll-Free Helpline</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-xl">✉️</span>
                  <div>
                    <p className="text-white text-xs font-bold">partner-support@aimdigitalise.com</p>
                    <p className="text-[9px] text-aim-copy-muted">Standard Email Support</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-xl">🕒</span>
                  <div>
                    <p className="text-white text-xs font-bold">Mon - Sat: 9:30 AM - 6:30 PM</p>
                    <p className="text-[9px] text-aim-copy-muted">Response within 2 Hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-aim-gold/10 to-aim-purple/10 p-5 border border-white/5">
              <h4 className="text-xs font-black text-aim-gold uppercase tracking-wider mb-2">Partner Guidelines</h4>
              <p className="text-[10px] leading-relaxed text-aim-copy-muted">
                When raising tickets on behalf of a client, ensure that you provide their Client ID (e.g. CLI-4820) so the technical support staff can quickly look up the server and license keys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PartnerSupport
