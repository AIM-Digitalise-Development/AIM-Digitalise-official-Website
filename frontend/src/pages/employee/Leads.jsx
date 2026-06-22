import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getLeads,
  getLeadStats,
  createLead,
  updateLead,
  updateLeadStatus,
  addLeadActivity,
  bulkAssignLeads,
  deleteLead,
  sendDemoEmail
} from '../../api/leads'

export default function EmployeeLeads() {
  // Stats and Listing State
  const [stats, setStats] = useState(null)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Query / Filter State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [followUpToday, setFollowUpToday] = useState(false)
  const [pendingFollowUp, setPendingFollowUp] = useState(false)
  const [page, setPage] = useState(1)

  // Selection state for Bulk Actions
  const [selectedLeadIds, setSelectedLeadIds] = useState([])

  // Modal / Drawer State
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null) // null for create, lead object for edit
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusLead, setStatusLead] = useState(null)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [activityLead, setActivityLead] = useState(null)
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false)
  const [selectedDrawerLead, setSelectedDrawerLead] = useState(null) // Slide-over detail drawer

  // Mail Modal State
  const [isMailModalOpen, setIsMailModalOpen] = useState(false)
  const [mailLead, setMailLead] = useState(null)
  const [mailForm, setMailForm] = useState({
    email: '',
    subject: 'Exclusive Demo: AIM Digitalise School ERP & Management Software'
  })
  const [sendingMail, setSendingMail] = useState(false)

  // Form states
  const [leadForm, setLeadForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_alternate_phone: '',
    company_name: '',
    address: '',
    city: '',
    state: '',
    pin_code: '',
    country: 'India',
    lead_source: 'Website',
    lead_status: 'new',
    lead_priority: 'medium',
    notes: '',
    product_interest: 'Institute Pro',
    budget: '',
    expected_close_date: ''
  })

  const [statusForm, setStatusForm] = useState({
    status: 'new',
    notes: '',
    lost_reason: ''
  })

  const [activityForm, setActivityForm] = useState({
    activity_type: 'call',
    description: '',
    notes: '',
    scheduled_date: ''
  })

  const [bulkAssignForm, setBulkAssignForm] = useState({
    assigned_to: '2', // Defaults to Jane Smith
    notes: ''
  })

  const [saving, setSaving] = useState(false)

  // 1. Fetch Stats & Leads
  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const res = await getLeadStats()
      if (res.data?.success) {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching lead stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const loadLeads = async () => {
    try {
      setLoading(true)
      setError('')
      const params = {
        page,
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        follow_up_today: followUpToday || undefined,
        pending_follow_up: pendingFollowUp || undefined
      }
      const res = await getLeads(params)
      if (res.data?.success) {
        setLeads(res.data.data?.data || [])
      }
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError(err?.response?.data?.message || 'Could not load leads from server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeads()
  }, [search, statusFilter, priorityFilter, followUpToday, pendingFollowUp, page])

  useEffect(() => {
    loadStats()
  }, [])

  // Auto-sync Drawer Lead details if updated
  useEffect(() => {
    if (selectedDrawerLead) {
      const updated = leads.find(l => l.id === selectedDrawerLead.id)
      if (updated) setSelectedDrawerLead(updated)
    }
  }, [leads])

  // Helper trigger alerts
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // 2. Action Handlers
  const openCreateModal = () => {
    setEditingLead(null)
    setLeadForm({
      client_name: '',
      client_email: '',
      client_phone: '',
      client_alternate_phone: '',
      company_name: '',
      address: '',
      city: '',
      state: '',
      pin_code: '',
      country: 'India',
      lead_source: 'Website',
      lead_status: 'new',
      lead_priority: 'medium',
      notes: '',
      product_interest: 'Institute Pro',
      budget: '',
      expected_close_date: ''
    })
    setIsCreateEditOpen(true)
  }

  const openEditModal = (lead) => {
    setEditingLead(lead)
    setLeadForm({
      client_name: lead.client_name || '',
      client_email: lead.client_email || '',
      client_phone: lead.client_phone || '',
      client_alternate_phone: lead.client_alternate_phone || '',
      company_name: lead.company_name || '',
      address: lead.address || '',
      city: lead.city || '',
      state: lead.state || '',
      pin_code: lead.pin_code || '',
      country: lead.country || 'India',
      lead_source: lead.lead_source || 'Website',
      lead_status: lead.lead_status || 'new',
      lead_priority: lead.lead_priority || 'medium',
      notes: lead.notes || '',
      product_interest: lead.product_interest || 'Institute Pro',
      budget: lead.budget || '',
      expected_close_date: lead.expected_close_date || ''
    })
    setIsCreateEditOpen(true)
  }

  const handleCreateEditSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (editingLead) {
        await updateLead(editingLead.id, leadForm)
        triggerSuccess('Lead updated successfully.')
      } else {
        await createLead(leadForm)
        triggerSuccess('Lead created successfully.')
      }
      setIsCreateEditOpen(false)
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to submit lead form.')
    } finally {
      setSaving(false)
    }
  }

  const openStatusModal = (lead) => {
    setStatusLead(lead)
    setStatusForm({
      status: lead.lead_status || 'new',
      notes: '',
      lost_reason: lead.lost_reason || ''
    })
    setIsStatusModalOpen(true)
  }

  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    if (statusForm.status === 'lost' && !statusForm.lost_reason.trim()) {
      alert('Lost reason is required when marking a lead as lost.')
      return
    }
    try {
      setSaving(true)
      await updateLeadStatus(statusLead.id, statusForm)
      triggerSuccess('Lead status updated successfully.')
      setIsStatusModalOpen(false)
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to update lead status.')
    } finally {
      setSaving(false)
    }
  }

  const openActivityModal = (lead) => {
    setActivityLead(lead)
    setActivityForm({
      activity_type: 'call',
      description: '',
      notes: '',
      scheduled_date: ''
    })
    setIsActivityModalOpen(true)
  }

  const handleActivitySubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await addLeadActivity(activityLead.id, activityForm)
      triggerSuccess('Lead activity logged successfully.')
      setIsActivityModalOpen(false)
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to log lead activity.')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkAssign = async (e) => {
    e.preventDefault()
    if (selectedLeadIds.length === 0) return
    try {
      setSaving(true)
      await bulkAssignLeads({
        lead_ids: selectedLeadIds,
        assigned_to: Number(bulkAssignForm.assigned_to),
        notes: bulkAssignForm.notes
      })
      triggerSuccess(`${selectedLeadIds.length} lead(s) reassigned successfully.`)
      setIsBulkAssignOpen(false)
      setSelectedLeadIds([])
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to perform bulk assignment.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return
    try {
      await deleteLead(id)
      triggerSuccess('Lead deleted successfully.')
      if (selectedDrawerLead?.id === id) {
        setSelectedDrawerLead(null)
      }
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to delete lead.')
    }
  }

  const openMailModal = (lead) => {
    setMailLead(lead)
    setMailForm({
      email: lead.client_email || '',
      subject: 'Exclusive Demo: AIM Digitalise School ERP & Management Software'
    })
    setIsMailModalOpen(true)
  }

  const handleSendMailSubmit = async (e) => {
    e.preventDefault()
    if (!mailForm.email.trim()) {
      alert('Recipient email address is required.')
      return
    }
    try {
      setSendingMail(true)
      await sendDemoEmail(mailLead.id, mailForm)
      triggerSuccess(`School software demo email sent to ${mailForm.email} successfully.`)
      setIsMailModalOpen(false)
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to send demo email.')
    } finally {
      setSendingMail(false)
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeadIds(leads.map(l => l.id))
    } else {
      setSelectedLeadIds([])
    }
  }

  const handleSelectLead = (id) => {
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Formatting utils
  const getStatusBadge = (status) => {
    const badges = {
      new: 'bg-gray-400/10 text-gray-450 border-gray-400/25',
      contacted: 'bg-blue-400/10 text-blue-400 border-blue-400/25',
      qualified: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/25',
      proposal: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/25',
      negotiation: 'bg-amber-400/10 text-amber-400 border-amber-400/25',
      converted: 'bg-green-400/10 text-green-450 border-green-400/25',
      lost: 'bg-red-400/10 text-red-450 border-red-400/25',
      junk: 'bg-red-500/10 text-red-300 border-red-550/25'
    }
    const label = status?.toUpperCase() || 'NEW'
    const c = badges[status] || badges.new
    return <span className={`inline-flex text-[9px] font-black uppercase tracking-wider border rounded-md px-2 py-0.5 ${c}`}>{label}</span>
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-500/15 text-red-400 border-red-500/30',
      high: 'bg-orange-400/10 text-orange-400 border-orange-400/25',
      medium: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/25',
      low: 'bg-blue-400/10 text-blue-400 border-blue-400/25'
    }
    const label = priority?.toUpperCase() || 'MEDIUM'
    const c = badges[priority] || badges.medium
    return <span className={`inline-flex text-[9px] font-black uppercase tracking-wider border rounded-md px-2 py-0.5 ${c}`}>{label}</span>
  }

  const getActivityIcon = (type) => {
    const icons = {
      call: '📞',
      email: '✉️',
      meeting: '🤝',
      follow_up: '📅',
      note: '📝'
    }
    return icons[type] || '📝'
  }

  return (
    <div className="space-y-6 select-none animate-fade-in text-gray-400 font-sans text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Lead Management</h1>
          <p className="text-xs text-gray-500 mt-1 font-semibold">Track client acquisitions, follow up on pipelines, and schedule sales activities.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#38b34a] hover:bg-[#38b34a]/85 text-black rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          ➕ Add New Lead
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-[#38b34a] rounded-xl text-xs font-bold text-center animate-fade-in">
          {successMsg}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#1a1d2b] to-[#1e2235] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Pipeline Total</p>
            <p className="text-2xl font-black text-white mt-1 leading-none">
              {statsLoading ? '...' : stats?.summary?.total_leads || 0}
            </p>
          </div>
          <span className="text-2xl">📋</span>
        </div>
        <div className="bg-gradient-to-br from-[#1a1d2b] to-[#1e2235] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Active Pipelines</p>
            <p className="text-2xl font-black text-[#38b34a] mt-1 leading-none">
              {statsLoading ? '...' : stats?.summary?.active_leads || 0}
            </p>
          </div>
          <span className="text-2xl">⚡</span>
        </div>
        <div className="bg-gradient-to-br from-[#1a1d2b] to-[#1e2235] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Converted Won</p>
            <p className="text-2xl font-black text-cyan-400 mt-1 leading-none">
              {statsLoading ? '...' : stats?.summary?.converted_leads || 0}
            </p>
          </div>
          <span className="text-2xl">🏆</span>
        </div>
        <div className="bg-gradient-to-br from-[#1a1d2b] to-[#1e2235] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Conversion Rate</p>
            <p className="text-2xl font-black text-yellow-400 mt-1 leading-none">
              {statsLoading ? '...' : stats?.summary?.conversion_rate || '0%'}
            </p>
          </div>
          <span className="text-2xl">🎯</span>
        </div>
      </div>

      {/* Follow-up Reminders Alert Block */}
      {!statsLoading && (stats?.follow_ups?.today > 0 || stats?.follow_ups?.pending > 0) && (
        <div className="bg-[#1e2235]/40 border border-amber-500/20 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white">Daily Follow-up Reminders</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                You have <strong className="text-amber-400">{stats?.follow_ups?.today} follow-ups scheduled today</strong> and <strong className="text-red-400">{stats?.follow_ups?.pending} overdue pending action</strong>.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {stats?.follow_ups?.today > 0 && (
              <button
                onClick={() => { setFollowUpToday(true); setPendingFollowUp(false); }}
                className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
              >
                Show Today's
              </button>
            )}
            {stats?.follow_ups?.pending > 0 && (
              <button
                onClick={() => { setPendingFollowUp(true); setFollowUpToday(false); }}
                className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
              >
                Show Pending Overdue
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Section */}
      <div className="bg-[#1a1d2b] rounded-2xl border border-white/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-550">🔍</span>
          <input
            type="text"
            placeholder="Search leads by name, email, product, or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white/3 border border-white/5 hover:border-white/10 focus:border-[#38b34a] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none placeholder-gray-600 transition-colors"
          />
        </div>

        {/* Action / Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-white/3 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] cursor-pointer font-bold"
          >
            <option value="" className="bg-[#13151f]">All Statuses</option>
            <option value="new" className="bg-[#13151f]">New</option>
            <option value="contacted" className="bg-[#13151f]">Contacted</option>
            <option value="qualified" className="bg-[#13151f]">Qualified</option>
            <option value="proposal" className="bg-[#13151f]">Proposal</option>
            <option value="negotiation" className="bg-[#13151f]">Negotiation</option>
            <option value="converted" className="bg-[#13151f]">Converted</option>
            <option value="lost" className="bg-[#13151f]">Lost</option>
            <option value="junk" className="bg-[#13151f]">Junk</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="bg-white/3 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] cursor-pointer font-bold"
          >
            <option value="" className="bg-[#13151f]">All Priorities</option>
            <option value="urgent" className="bg-[#13151f]">Urgent</option>
            <option value="high" className="bg-[#13151f]">High</option>
            <option value="medium" className="bg-[#13151f]">Medium</option>
            <option value="low" className="bg-[#13151f]">Low</option>
          </select>

          {/* Quick flags toggles */}
          {(followUpToday || pendingFollowUp) ? (
            <button
              onClick={() => { setFollowUpToday(false); setPendingFollowUp(false); }}
              className="px-3.5 py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Clear Filter Flags ✕
            </button>
          ) : null}
        </div>
      </div>

      {/* Bulk Action Toggle Bar */}
      <AnimatePresence>
        {selectedLeadIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-[#1a1d2b] border border-[#38b34a]/30 rounded-2xl flex items-center justify-between"
          >
            <span className="text-xs text-white font-bold">
              ⚡ {selectedLeadIds.length} lead(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsBulkAssignOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-[#38b34a] to-cyan-550 text-black font-black rounded-xl text-[11px] uppercase tracking-wider transition-all shadow cursor-pointer active:scale-95"
              >
                Bulk Reassign
              </button>
              <button
                onClick={() => setSelectedLeadIds([])}
                className="px-3 py-2 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Listing Table */}
      <div className="bg-[#1a1d2b] rounded-2xl border border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: '#13151f', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={leads.length > 0 && selectedLeadIds.length === leads.length}
                    onChange={handleSelectAll}
                    className="rounded text-[#38b34a] focus:ring-0 focus:ring-offset-0 bg-white/5 border border-white/10 cursor-pointer"
                  />
                </th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Lead Details</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Pipeline Status</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Demo Status</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Next Follow-up</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-xs font-black text-gray-500 uppercase tracking-wider animate-pulse">
                    Loading Leads registry...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <span className="text-2xl block mb-2">📁</span>
                    <p className="text-xs font-bold text-white">No leads found</p>
                    <p className="text-[11px] text-gray-550 mt-1">Try modifying your query search criteria or filter flags.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id)
                  const followUpText = lead.follow_up_date
                    ? new Date(lead.follow_up_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : 'No follow-up set'
                  
                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-white/1.5 transition-colors ${isSelected ? 'bg-white/1' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectLead(lead.id)}
                          className="rounded text-[#38b34a] focus:ring-0 focus:ring-offset-0 bg-white/5 border border-white/10 cursor-pointer"
                        />
                      </td>

                      {/* Lead Details */}
                      <td className="p-4">
                        <div className="text-left">
                          <button
                            onClick={() => setSelectedDrawerLead(lead)}
                            className="font-bold text-white text-xs hover:text-[#38b34a] transition-colors leading-none cursor-pointer block"
                          >
                            {lead.client_name}
                          </button>
                          <span className="text-[9px] font-bold text-cyan-400 font-mono tracking-wider block mt-1">{lead.lead_id}</span>
                          {lead.created_at && (
                            <span className="text-[9px] text-gray-550 block mt-0.5">
                              📅 {new Date(lead.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">{lead.client_phone}</span>
                        </div>
                      </td>

                      {/* Pipeline Status — Product + Status badge */}
                      <td className="p-4">
                        <div className="text-left space-y-1">
                          <span className="text-[10px] text-gray-400 font-bold block">{lead.product_interest || 'N/A'}</span>
                          {getStatusBadge(lead.lead_status)}
                        </div>
                      </td>

                      {/* Demo Status */}
                      <td className="p-4">
                        <div className="text-left space-y-1">
                          {lead.demo_status ? (
                            <>
                              <span className={`inline-flex text-[9px] font-black uppercase tracking-wider border rounded-md px-2 py-0.5 ${
                                lead.demo_status === 'assigned'
                                  ? 'bg-blue-400/10 text-blue-400 border-blue-400/25'
                                  : lead.demo_status === 'completed'
                                  ? 'bg-green-400/10 text-green-400 border-green-400/25'
                                  : lead.demo_status === 'scheduled'
                                  ? 'bg-amber-400/10 text-amber-400 border-amber-400/25'
                                  : 'bg-gray-400/10 text-gray-400 border-gray-400/25'
                              }`}>{lead.demo_status}</span>
                              {lead.demo_status === 'assigned' && lead.demo_link && (
                                <a
                                  href={lead.demo_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[9px] text-blue-400 hover:text-blue-300 font-bold block underline truncate max-w-[120px]"
                                  title={lead.demo_link}
                                >
                                  🔗 Demo Link
                                </a>
                              )}
                              {lead.demo_slot && (
                                <span className="text-[9px] text-amber-400 font-bold block">🕐 {lead.demo_slot}</span>
                              )}
                            </>
                          ) : (
                            <span className="text-[9px] text-gray-600 font-bold">—</span>
                          )}
                        </div>
                      </td>

                      {/* Next Follow-up */}
                      <td className="p-4">
                        <div className="text-left space-y-0.5">
                          {lead.lead_status === 'converted' || lead.is_converted ? (
                            <>
                              <span className="inline-flex text-[9px] font-black uppercase tracking-wider border rounded-md px-2 py-0.5 bg-green-400/10 text-green-400 border-green-400/25">Sold Out</span>
                              {lead.budget && (
                                <span className="text-[10px] text-emerald-400 font-bold block">₹{Number(lead.budget).toLocaleString()}</span>
                              )}
                              {lead.expected_close_date && (
                                <span className="text-[9px] text-gray-400 font-semibold block">📅 {new Date(lead.expected_close_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              )}
                              {lead.invoice_no && (
                                <span className="text-[9px] text-cyan-400 font-bold font-mono block">Inv: {lead.invoice_no}</span>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="text-xs font-semibold text-gray-300">{followUpText}</p>
                              {lead.budget && (
                                <span className="text-[10px] text-emerald-400 font-bold block">₹{Number(lead.budget).toLocaleString()}</span>
                              )}
                            </>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => setSelectedDrawerLead(lead)}
                            title="View details log"
                            className="p-1 text-gray-500 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => openEditModal(lead)}
                            title="Edit details"
                            className="p-1 text-gray-500 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => openStatusModal(lead)}
                            title="Change status"
                            className="p-1 text-gray-500 hover:text-[#38b34a] hover:bg-white/5 rounded transition-all cursor-pointer"
                          >
                            🔄
                          </button>
                          <button
                            onClick={() => openMailModal(lead)}
                            title="Send School Software Demo"
                            className="p-1 text-gray-500 hover:text-yellow-400 hover:bg-white/5 rounded transition-all cursor-pointer"
                          >
                            ✉️
                          </button>
                          <button
                            onClick={() => openActivityModal(lead)}
                            title="Log Activity"
                            className="p-1 text-gray-500 hover:text-cyan-400 hover:bg-white/5 rounded transition-all cursor-pointer"
                          >
                            ⏱️
                          </button>
                          {!lead.is_converted && (
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              title="Delete Lead"
                              className="p-1 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded transition-all cursor-pointer"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────── SLIDE OVER DRAWER: DETAILS ─────────────────────── */}
      <AnimatePresence>
        {selectedDrawerLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDrawerLead(null)}
              className="absolute inset-0 bg-black cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-hidden"
              style={{ background: '#13151f', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between" style={{ background: '#1a1d2b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h3 className="text-base font-black text-white">{selectedDrawerLead.client_name}</h3>
                  <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-cyan-400 font-bold font-mono tracking-wider">{selectedDrawerLead.lead_id}</span>
                    <span>•</span>
                    {getStatusBadge(selectedDrawerLead.lead_status)}
                    {getPriorityBadge(selectedDrawerLead.lead_priority)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDrawerLead(null)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                
                {/* Actions Toolbar */}
                <div className="flex items-center gap-2 flex-wrap border-b border-white/5 pb-4">
                  <button
                    onClick={() => openStatusModal(selectedDrawerLead)}
                    className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 transition-all cursor-pointer"
                  >
                    🔄 Update Status
                  </button>
                  <button
                    onClick={() => openActivityModal(selectedDrawerLead)}
                    className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 transition-all cursor-pointer"
                  >
                    ⏱️ Log Activity
                  </button>
                  <button
                    onClick={() => openMailModal(selectedDrawerLead)}
                    className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 transition-all cursor-pointer"
                  >
                    ✉️ Send School Demo
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDrawerLead(null)
                      openEditModal(selectedDrawerLead)
                    }}
                    className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 transition-all cursor-pointer"
                  >
                    ✏️ Edit Lead
                  </button>
                  {!selectedDrawerLead.is_converted && (
                    <button
                      onClick={() => handleDeleteLead(selectedDrawerLead.id)}
                      className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold border border-red-500/20 transition-all cursor-pointer"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>

                {/* Details grid */}
                <div className="bg-[#1a1d2b] p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#38b34a]">Lead Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Email Address</p>
                      <p className="text-xs font-bold text-white mt-1 select-text">{selectedDrawerLead.client_email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Phone Number</p>
                      <p className="text-xs font-bold text-white mt-1 select-text">{selectedDrawerLead.client_phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Company Name</p>
                      <p className="text-xs font-bold text-white mt-1">{selectedDrawerLead.company_name || 'Individual'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Product Interest</p>
                      <p className="text-xs font-bold text-cyan-400 mt-1">{selectedDrawerLead.product_interest || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Budget Size</p>
                      <p className="text-xs font-bold text-[#38b34a] mt-1 font-mono">
                        {selectedDrawerLead.budget ? `₹${Number(selectedDrawerLead.budget).toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Expected Close Date</p>
                      <p className="text-xs font-bold text-white mt-1">{selectedDrawerLead.expected_close_date || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Lead Source</p>
                      <p className="text-xs font-bold text-white mt-1 capitalize">{selectedDrawerLead.lead_source || 'Website'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Created By</p>
                      <p className="text-xs font-bold text-white mt-1">
                        {selectedDrawerLead.employee ? `${selectedDrawerLead.employee.full_name || selectedDrawerLead.employee.name || `${selectedDrawerLead.employee.first_name || ''} ${selectedDrawerLead.employee.last_name || ''}`.trim()} (${selectedDrawerLead.employee.employee_id})` : 'System / Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Assigned Agent</p>
                      <p className="text-xs font-bold text-white mt-1">
                        {selectedDrawerLead.assigned_to ? `ID: ${selectedDrawerLead.assigned_to}` : 'Unassigned'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Client Residence Address</p>
                      <p className="text-xs font-bold text-gray-300 mt-1 leading-relaxed">
                        {selectedDrawerLead.address || ''} {selectedDrawerLead.city || ''} {selectedDrawerLead.state || ''} {selectedDrawerLead.pin_code || ''}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Initial Notes</p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed bg-[#13151f] p-3 rounded-xl border border-white/5">
                        {selectedDrawerLead.notes || 'No notes provided.'}
                      </p>
                    </div>
                    {selectedDrawerLead.lost_reason && (
                      <div className="sm:col-span-2">
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Reason for Loss</p>
                        <p className="text-xs text-red-300 mt-1 leading-relaxed bg-red-500/5 p-3 rounded-xl border border-red-500/10 font-bold">
                          {selectedDrawerLead.lost_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activities log timeline */}
                <div className="space-y-4 text-left">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Activity Timeline Log</h4>
                  
                  {(!selectedDrawerLead.activities || selectedDrawerLead.activities.length === 0) ? (
                    <p className="text-[11px] text-gray-600 font-bold italic p-6 text-center bg-[#1a1d2b] rounded-2xl border border-white/5">
                      No customer engagement activities logged yet.
                    </p>
                  ) : (
                    <div className="relative pl-6 space-y-5 border-l-2 border-white/5 ml-3">
                      {selectedDrawerLead.activities.map((act) => (
                        <div key={act.id} className="relative">
                          <span className="absolute -left-[33px] top-0 w-6 h-6 rounded-full bg-[#1a1d2b] border border-white/10 flex items-center justify-center text-xs">
                            {getActivityIcon(act.activity_type)}
                          </span>
                          <div>
                            <div className="flex items-center justify-between gap-3">
                              <h5 className="text-xs font-bold text-white capitalize">{act.description || act.activity_type}</h5>
                              <span className="text-[9px] font-bold text-gray-550">
                                {new Date(act.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {act.notes && (
                              <p className="text-[11px] text-gray-450 mt-1.5 leading-relaxed bg-[#1a1d2b] p-3 rounded-xl border border-white/5">
                                {act.notes}
                              </p>
                            )}
                            {act.scheduled_date && (
                              <div className="inline-flex items-center gap-1.5 text-[9px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded mt-2 border border-amber-500/15">
                                📅 Next Action: {new Date(act.scheduled_date).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 flex items-center justify-end shrink-0" style={{ background: '#1a1d2b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => setSelectedDrawerLead(null)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-xs font-bold text-white rounded-xl transition-colors cursor-pointer"
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────── MODAL: CREATE / EDIT LEAD ─────────────────────── */}
      <AnimatePresence>
        {isCreateEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateEditOpen(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col justify-between rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: '#13151f', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between" style={{ background: '#1a1d2b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h3 className="text-base font-black text-white">{editingLead ? 'Edit Lead Parameters' : 'Register New Pipeline Lead'}</h3>
                  <p className="text-[10px] text-gray-550 font-bold uppercase tracking-wider mt-0.5">Fill out all contact records</p>
                </div>
                <button onClick={() => setIsCreateEditOpen(false)} className="text-gray-550 hover:text-white text-sm cursor-pointer">✕</button>
              </div>

              {/* Scrollable Form body */}
              <form onSubmit={handleCreateEditSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Client Name */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={leadForm.client_name}
                      onChange={(e) => setLeadForm({ ...leadForm, client_name: e.target.value })}
                      placeholder="Enter full name"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-bold"
                    />
                  </div>

                  {/* Client Phone */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Client Mobile *</label>
                    <input
                      type="text"
                      required
                      value={leadForm.client_phone}
                      onChange={(e) => setLeadForm({ ...leadForm, client_phone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-bold"
                    />
                  </div>

                  {/* Client Email */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Email Address</label>
                    <input
                      type="email"
                      value={leadForm.client_email}
                      onChange={(e) => setLeadForm({ ...leadForm, client_email: e.target.value })}
                      placeholder="e.g. client@example.com"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  {/* Alternate Phone */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Alternate Mobile</label>
                    <input
                      type="text"
                      value={leadForm.client_alternate_phone}
                      onChange={(e) => setLeadForm({ ...leadForm, client_alternate_phone: e.target.value })}
                      placeholder="Backup mobile number"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Company Name</label>
                    <input
                      type="text"
                      value={leadForm.company_name}
                      onChange={(e) => setLeadForm({ ...leadForm, company_name: e.target.value })}
                      placeholder="Organization / Institution"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-semibold"
                    />
                  </div>

                  {/* Product Interest */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Product Interest</label>
                    <input
                      type="text"
                      value={leadForm.product_interest}
                      onChange={(e) => setLeadForm({ ...leadForm, product_interest: e.target.value })}
                      placeholder="e.g. Institute Pro, ERP, Web Design"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-semibold"
                    />
                  </div>

                  {/* Budget */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Pipeline Budget (INR)</label>
                    <input
                      type="number"
                      value={leadForm.budget}
                      onChange={(e) => setLeadForm({ ...leadForm, budget: e.target.value })}
                      placeholder="e.g. 150000"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-mono font-bold"
                    />
                  </div>

                  {/* Close date */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Expected Close Date</label>
                    <input
                      type="date"
                      value={leadForm.expected_close_date}
                      onChange={(e) => setLeadForm({ ...leadForm, expected_close_date: e.target.value })}
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-bold [color-scheme:dark]"
                    />
                  </div>

                  {/* Source, Priority, Status */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Lead Source</label>
                    <select
                      value={leadForm.lead_source}
                      onChange={(e) => setLeadForm({ ...leadForm, lead_source: e.target.value })}
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] cursor-pointer font-bold"
                    >
                      <option value="Website" className="bg-[#13151f]">Website</option>
                      <option value="Referral" className="bg-[#13151f]">Referral</option>
                      <option value="Cold Call" className="bg-[#13151f]">Cold Call</option>
                      <option value="SMM" className="bg-[#13151f]">Social Media</option>
                      <option value="Campaign" className="bg-[#13151f]">Marketing Campaign</option>
                      <option value="Other" className="bg-[#13151f]">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Lead Priority</label>
                    <select
                      value={leadForm.lead_priority}
                      onChange={(e) => setLeadForm({ ...leadForm, lead_priority: e.target.value })}
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] cursor-pointer font-bold"
                    >
                      <option value="low" className="bg-[#13151f]">Low</option>
                      <option value="medium" className="bg-[#13151f]">Medium</option>
                      <option value="high" className="bg-[#13151f]">High</option>
                      <option value="urgent" className="bg-[#13151f]">Urgent</option>
                    </select>
                  </div>

                  {!editingLead && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Initial Pipeline Status</label>
                      <select
                        value={leadForm.lead_status}
                        onChange={(e) => setLeadForm({ ...leadForm, lead_status: e.target.value })}
                        className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] cursor-pointer font-bold"
                      >
                        <option value="new" className="bg-[#13151f]">New</option>
                        <option value="contacted" className="bg-[#13151f]">Contacted</option>
                        <option value="qualified" className="bg-[#13151f]">Qualified</option>
                      </select>
                    </div>
                  )}

                  {/* Addressing fields */}
                  <div className="sm:col-span-2 pt-2 border-t border-white/5">
                    <h4 className="text-[10px] font-black text-[#38b34a] uppercase tracking-widest mb-3">Residence Setup</h4>
                  </div>
                  
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Street Address</label>
                    <input
                      type="text"
                      value={leadForm.address}
                      onChange={(e) => setLeadForm({ ...leadForm, address: e.target.value })}
                      placeholder="Building, street name"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">City</label>
                    <input
                      type="text"
                      value={leadForm.city}
                      onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                      placeholder="City"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">State</label>
                      <input
                        type="text"
                        value={leadForm.state}
                        onChange={(e) => setLeadForm({ ...leadForm, state: e.target.value })}
                        placeholder="State"
                        className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Pin Code</label>
                      <input
                        type="text"
                        value={leadForm.pin_code}
                        onChange={(e) => setLeadForm({ ...leadForm, pin_code: e.target.value })}
                        placeholder="Zip"
                        className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-mono"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Lead Description / Notes</label>
                    <textarea
                      value={leadForm.notes}
                      onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                      rows="3"
                      placeholder="Requirements, customer context..."
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] leading-relaxed"
                    />
                  </div>
                </div>
              </form>

              {/* Actions Footer */}
              <div className="px-6 py-4 flex items-center justify-end gap-3 shrink-0" style={{ background: '#1a1d2b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateEditOpen(false)}
                  disabled={saving}
                  className="px-4 py-2.5 border border-white/10 hover:border-white/20 text-xs font-bold text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEditSubmit}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#38b34a] text-black hover:bg-[#38b34a]/85 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving ? 'Saving...' : editingLead ? 'Save Changes' : 'Register Lead'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────── MODAL: CHANGE STATUS ─────────────────────── */}
      <AnimatePresence>
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStatusModalOpen(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
              style={{ background: '#13151f', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between" style={{ background: '#1a1d2b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h3 className="text-base font-black text-white">Update Lead Status</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{statusLead?.client_name}</p>
                </div>
                <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-550 hover:text-white text-sm cursor-pointer">✕</button>
              </div>

              {/* Form */}
              <form onSubmit={handleStatusSubmit} className="p-6 space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Choose Status *</label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] cursor-pointer font-bold"
                  >
                    <option value="new" className="bg-[#13151f]">New</option>
                    <option value="contacted" className="bg-[#13151f]">Contacted</option>
                    <option value="qualified" className="bg-[#13151f]">Qualified</option>
                    <option value="proposal" className="bg-[#13151f]">Proposal</option>
                    <option value="negotiation" className="bg-[#13151f]">Negotiation</option>
                    <option value="converted" className="bg-[#13151f]">Converted</option>
                    <option value="lost" className="bg-[#13151f]">Lost</option>
                    <option value="junk" className="bg-[#13151f]">Junk</option>
                  </select>
                </div>

                {statusForm.status === 'lost' && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-[9px] font-black text-red-400 uppercase tracking-widest block">Reason for Loss *</label>
                    <textarea
                      required
                      value={statusForm.lost_reason}
                      onChange={(e) => setStatusForm({ ...statusForm, lost_reason: e.target.value })}
                      placeholder="Why was the lead lost? (e.g. competitor pricing, budget cuts, unresponsive)"
                      rows="2"
                      className="w-full bg-white/3 border border-red-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 leading-relaxed font-bold"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Status Notes / Remarks</label>
                  <textarea
                    value={statusForm.notes}
                    onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                    placeholder="Log summary of status update discussion"
                    rows="3"
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] leading-relaxed"
                  />
                </div>
              </form>

              {/* Actions */}
              <div className="px-6 py-4 flex items-center justify-end gap-3 shrink-0" style={{ background: '#1a1d2b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2.5 border border-white/10 hover:border-white/20 text-xs font-bold text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusSubmit}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#38b34a] text-black hover:bg-[#38b34a]/85 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────── MODAL: LOG ACTIVITY ─────────────────────── */}
      <AnimatePresence>
        {isActivityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsActivityModalOpen(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
              style={{ background: '#13151f', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between" style={{ background: '#1a1d2b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h3 className="text-base font-black text-white">Log Engagement Activity</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{activityLead?.client_name}</p>
                </div>
                <button onClick={() => setIsActivityModalOpen(false)} className="text-gray-550 hover:text-white text-sm cursor-pointer">✕</button>
              </div>

              {/* Form */}
              <form onSubmit={handleActivitySubmit} className="p-6 space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Activity Type *</label>
                  <select
                    value={activityForm.activity_type}
                    onChange={(e) => setActivityForm({ ...activityForm, activity_type: e.target.value })}
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] cursor-pointer font-bold"
                  >
                    <option value="call" className="bg-[#13151f]">📞 Phone Call</option>
                    <option value="email" className="bg-[#13151f]">✉️ Email Sent</option>
                    <option value="meeting" className="bg-[#13151f]">🤝 Face-to-Face Meeting</option>
                    <option value="follow_up" className="bg-[#13151f]">📅 Follow-up Action</option>
                    <option value="note" className="bg-[#13151f]">📝 Internal CRM Note</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Activity Title *</label>
                  <input
                    type="text"
                    required
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                    placeholder="e.g. Discovery Call with Director"
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Scheduled Date / Time</label>
                  <input
                    type="datetime-local"
                    value={activityForm.scheduled_date}
                    onChange={(e) => setActivityForm({ ...activityForm, scheduled_date: e.target.value })}
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-mono [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Activity Notes / Detail</label>
                  <textarea
                    value={activityForm.notes}
                    onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                    placeholder="Log conversation summary, next steps, feedback..."
                    rows="3"
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] leading-relaxed"
                  />
                </div>
              </form>

              {/* Actions */}
              <div className="px-6 py-4 flex items-center justify-end gap-3 shrink-0" style={{ background: '#1a1d2b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2.5 border border-white/10 hover:border-white/20 text-xs font-bold text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivitySubmit}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#38b34a] text-black hover:bg-[#38b34a]/85 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Logging...' : 'Log Activity'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────── MODAL: BULK REASSIGN ─────────────────────── */}
      <AnimatePresence>
        {isBulkAssignOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBulkAssignOpen(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
              style={{ background: '#13151f', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between" style={{ background: '#1a1d2b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h3 className="text-base font-black text-white">Bulk Reassign Leads</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Transfering {selectedLeadIds.length} lead(s)</p>
                </div>
                <button onClick={() => setIsBulkAssignOpen(false)} className="text-gray-550 hover:text-white text-sm cursor-pointer">✕</button>
              </div>

              {/* Form */}
              <form onSubmit={handleBulkAssign} className="p-6 space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Choose Target Agent *</label>
                  <select
                    value={bulkAssignForm.assigned_to}
                    onChange={(e) => setBulkAssignForm({ ...bulkAssignForm, assigned_to: e.target.value })}
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] cursor-pointer font-bold"
                  >
                    <option value="2" className="bg-[#13151f]">Jane Smith (AIM260002)</option>
                    <option value="3" className="bg-[#13151f]">Raj Patel (AIM260003)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Assignment Notes / Reason</label>
                  <textarea
                    value={bulkAssignForm.notes}
                    onChange={(e) => setBulkAssignForm({ ...bulkAssignForm, notes: e.target.value })}
                    placeholder="Why are you reassigning these leads? (e.g. workload balancing, location matching)"
                    rows="3"
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] leading-relaxed"
                  />
                </div>
              </form>

              {/* Actions */}
              <div className="px-6 py-4 flex items-center justify-end gap-3 shrink-0" style={{ background: '#1a1d2b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setIsBulkAssignOpen(false)}
                  disabled={saving}
                  className="px-4 py-2.5 border border-white/10 hover:border-white/20 text-xs font-bold text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAssign}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#38b34a] text-black hover:bg-[#38b34a]/85 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Reassigning...' : 'Transfer Leads'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────── MODAL: SEND EMAIL DEMO ─────────────────────── */}
      <AnimatePresence>
        {isMailModalOpen && mailLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMailModalOpen(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[90vh] flex flex-col justify-between rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: '#13151f', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between" style={{ background: '#1a1d2b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h3 className="text-base font-black text-white">Send School Software Demo</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Configure and preview the demo email for {mailLead.client_name}</p>
                </div>
                <button onClick={() => setIsMailModalOpen(false)} className="text-gray-550 hover:text-white text-sm cursor-pointer">✕</button>
              </div>

              {/* Scrollable Modal Content */}
              <form onSubmit={handleSendMailSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-4 text-left">
                {/* Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Recipient Email *</label>
                    <input
                      type="email"
                      required
                      value={mailForm.email}
                      onChange={(e) => setMailForm({ ...mailForm, email: e.target.value })}
                      placeholder="e.g. client@example.com"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-bold"
                    />
                    {!mailForm.email.trim() && (
                      <span className="text-[10px] text-yellow-500 font-bold block mt-1">⚠️ Recipient email is required to send the demo.</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Subject Line</label>
                    <input
                      type="text"
                      readOnly
                      value={mailForm.subject}
                      className="w-full bg-white/1.5 border border-white/3 text-gray-450 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none cursor-not-allowed font-semibold"
                    />
                  </div>
                </div>

                {/* Live Email Preview Canvas */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[9px] font-black text-[#38b34a] uppercase tracking-widest block">Live Email Preview (As Received by Client)</label>
                  <div className="border border-white/5 rounded-2xl bg-white text-gray-800 p-6 overflow-hidden shadow-inner max-h-[380px] overflow-y-auto font-sans leading-relaxed select-text">
                    
                    {/* Simulated Mail Client Header */}
                    <div className="border-b border-gray-100 pb-3 mb-4 text-xs text-gray-400">
                      <p><strong className="text-gray-500">From:</strong> AIM Digitalise Sales &lt;sales@aimdigitalise.com&gt;</p>
                      <p className="mt-1"><strong className="text-gray-500">To:</strong> {mailForm.email || '[Client Email Address]'}</p>
                      <p className="mt-1"><strong className="text-gray-500">Subject:</strong> {mailForm.subject}</p>
                    </div>

                    {/* Email Newsletter Banner */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl p-4 text-center mb-6">
                      <h2 className="text-lg font-black tracking-tight text-[#38b34a]">AIM DIGITALISE</h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nexgn Educational Technology</p>
                    </div>

                    {/* Greeting */}
                    <p className="text-xs text-gray-750 font-bold">Dear {mailLead.client_name || 'Client'},</p>
                    
                    {/* Intro */}
                    <p className="text-xs text-gray-600 mt-3">
                      Thank you for your interest in our solutions. We are excited to present an interactive demo of our flagship product, the <strong>AIM School Management & ERP Software</strong>.
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Our system is tailored to reduce manual work and automate administrative tasks for schools and colleges, letting your educators focus on what matters most.
                    </p>

                    {/* Highlight Box / Features list */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 my-5 space-y-2.5">
                      <p className="text-[10px] font-black uppercase text-[#38b34a] tracking-wider mb-1">Key System Modules Included:</p>
                      
                      <div className="flex items-start gap-2.5">
                        <span className="text-sm">🏫</span>
                        <div>
                          <p className="text-xs font-bold text-gray-800">Student Lifecycle & Records</p>
                          <p className="text-[11px] text-gray-500 font-semibold leading-normal">Digital admissions, profiles, custom enrollment registers, and certificates.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-sm">💳</span>
                        <div>
                          <p className="text-xs font-bold text-gray-800">Smart Fees & Billing System</p>
                          <p className="text-[11px] text-gray-500 font-semibold leading-normal">Automated invoices, online payment integrations, late fee triggers, and digital receipts.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-sm">📊</span>
                        <div>
                          <p className="text-xs font-bold text-gray-800">Exams & Digital Report Cards</p>
                          <p className="text-[11px] text-gray-500 font-semibold leading-normal">Marks sheets entry, grade calculations, and multi-format report card generation.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-sm">👥</span>
                        <div>
                          <p className="text-xs font-bold text-gray-800">Bio-Metric Attendance & HR</p>
                          <p className="text-[11px] text-gray-500 font-semibold leading-normal">Employee rosters, holiday registers, bio-metric syncing, and automated payroll slips.</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="text-center my-6">
                      <a
                        href="#demo-link"
                        onClick={(e) => e.preventDefault()}
                        className="inline-block bg-[#38b34a] hover:bg-[#38b34a]/90 text-white font-bold text-xs uppercase tracking-wide px-5 py-3 rounded-lg shadow-md transition-all decoration-none"
                      >
                        ⚡ Access Live Demo Portal
                      </a>
                      <p className="text-[9px] text-gray-400 mt-2 font-semibold">Username: admin | Password: admin123</p>
                    </div>

                    {/* Video Tour Callout */}
                    <p className="text-xs text-gray-650 text-center font-medium">
                      Prefer a quick overview? <a href="#video-tour" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline font-bold">Watch our 5-minute video walkthrough ➔</a>
                    </p>

                    {/* Footer */}
                    <div className="border-t border-gray-100 pt-4 mt-6 text-[10px] text-gray-400 text-center space-y-1">
                      <p className="font-bold text-gray-600">AIM Digitalise Technologies Pvt Ltd</p>
                      <p className="font-medium">Kolkata, India | Support: +91 98765 43210</p>
                      <p className="font-medium">Website: <a href="https://aimdigitalise.com" onClick={(e) => e.preventDefault()} className="text-blue-500">www.aimdigitalise.com</a></p>
                    </div>

                  </div>
                </div>
              </form>

              {/* Actions Footer */}
              <div className="px-6 py-4 flex items-center justify-end gap-3 shrink-0" style={{ background: '#1a1d2b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setIsMailModalOpen(false)}
                  disabled={sendingMail}
                  className="px-4 py-2.5 border border-white/10 hover:border-white/20 text-xs font-bold text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMailSubmit}
                  disabled={sendingMail || !mailForm.email.trim()}
                  className="px-5 py-2.5 bg-[#38b34a] text-black hover:bg-[#38b34a]/85 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {sendingMail ? '✉️ Sending...' : '✉️ Send Demo Mail'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
