import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSupportStore } from '../../store/supportStore'
import { useClientAuthStore } from '../../store/clientAuthStore'

const ClientSupport = () => {
  const { clientUser, profileData } = useClientAuthStore()
  const { tickets, ticketReplies, auditLogs, addTicket, addReply } = useSupportStore()

  const clientName = profileData?.client_name || clientUser?.client_name || clientUser?.name || 'Client'
  const schoolName = profileData?.company_name || profileData?.school_name || profileData?.organization || 'Academic Institute'

  // Filter tickets for this client only
  const clientTickets = tickets.filter(t => t.client.toLowerCase() === clientName.toLowerCase())

  // States
  const [activeTab, setActiveTab] = useState('active_tickets')
  const [clientSearch, setClientSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Form states
  const [newProduct, setNewProduct] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newSeverity, setNewSeverity] = useState('Low')
  const [newSubject, setNewSubject] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Reply states
  const [replyText, setReplyText] = useState('')
  const [activeReplyId, setActiveReplyId] = useState(null)

  // Audit logs modal
  const [selectedLogsTicket, setSelectedLogsTicket] = useState(null)

  // Counts calculated specifically for this client
  const totalTicketsCount = clientTickets.length
  const openTicketsCount = clientTickets.filter(t => t.status === 'OPEN').length
  const inProgressTicketsCount = clientTickets.filter(t => t.status === 'IN PROGRESS').length
  const resolvedTicketsCount = clientTickets.filter(t => t.status === 'RESOLVED').length

  const handleSendReply = (ticketId) => {
    if (!replyText.trim()) return
    addReply(ticketId, {
      sender: clientName,
      text: replyText,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    })
    setReplyText('')
    setActiveReplyId(null)
    alert('Reply sent successfully!')
  }

  const handleCreateTicket = (e) => {
    e.preventDefault()
    if (!newProduct || !newCategory || !newSubject || !newDescription) {
      alert('Please fill out all required fields.')
      return
    }
    const createdTicket = {
      id: `TK-${Math.floor(7000 + Math.random() * 999)}`,
      client: clientName,
      product: newProduct,
      subject: newSubject,
      category: newCategory,
      severity: newSeverity,
      dateLogged: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + `, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'OPEN',
      description: newDescription
    }
    addTicket(createdTicket)
    
    // Reset
    setNewProduct('')
    setNewCategory('')
    setNewSeverity('Low')
    setNewSubject('')
    setNewDescription('')
    
    alert('Support Ticket submitted successfully!')
    setIsCreateModalOpen(false)
    setActiveTab('active_tickets')
  }

  // Filter client tickets based on search, severity, and category
  const filteredTickets = clientTickets.filter(t => {
    const matchesSearch = 
      t.subject.toLowerCase().includes(clientSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(clientSearch.toLowerCase())
      
    const matchesSeverity = severityFilter === 'All' || t.severity === severityFilter
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter
    
    return matchesSearch && matchesSeverity && matchesCategory
  })

  const activeSupportTickets = filteredTickets.filter(t => t.status === 'OPEN' || t.status === 'IN PROGRESS')
  const resolvedSupportTickets = filteredTickets.filter(t => t.status === 'RESOLVED')

  return (
    <>
      <Helmet>
        <title>Help & Support | Client Portal</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
        
        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px] border-b border-slate-200/85">
          <h1 className="text-3xl font-black text-[#1a6b54] tracking-tight">Help & Support</h1>

          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1a6b54] uppercase tracking-tight">{schoolName}</h2>
            <p className="text-xs font-bold text-slate-500">Academic Session: 2026-2027</p>
          </div>

          <div className="w-48"></div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Tickets */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">My Total Tickets</span>
              <span className="text-3xl font-black text-slate-800 mt-1.5 block">
                {totalTicketsCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>

          {/* Card 2: Open Tickets */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Open Tickets</span>
              <span className="text-3xl font-black text-rose-500 mt-1.5 block">
                {openTicketsCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-rose-500 border border-red-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Card 3: In Progress */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">In Progress</span>
              <span className="text-3xl font-black text-amber-500 mt-1.5 block">
                {inProgressTicketsCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 font-sans">
              ⚙️
            </div>
          </div>

          {/* Card 4: Resolved */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Resolved</span>
              <span className="text-3xl font-black text-emerald-500 mt-1.5 block">
                {resolvedTicketsCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Support Panel White Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
          
          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 pb-6 border-b border-slate-100 items-end">
            {/* Search Input */}
            <div className="w-full">
              <label className="block text-[9.5px] font-black text-slate-505 uppercase tracking-widest mb-1.5 font-sans">Search Ticket Subject</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Type to search ticket subject..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-sans"
                />
              </div>
            </div>

            {/* Severity Filter */}
            <div className="w-full">
              <label className="block text-[9.5px] font-black text-slate-505 uppercase tracking-widest mb-1.5 font-sans">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-semibold cursor-pointer"
              >
                <option value="All">All Severities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="w-full">
              <label className="block text-[9.5px] font-black text-slate-505 uppercase tracking-widest mb-1.5 font-sans">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-505 focus:ring-2 focus:ring-blue-505/10 transition-all font-semibold cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Bug">Bug</option>
                <option value="Setup">Setup</option>
                <option value="Billing">Billing</option>
                <option value="Inquiry">Inquiry</option>
                <option value="Customization">Customization</option>
              </select>
            </div>
          </div>

          {/* Navigation Tabs Row */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            <button
              onClick={() => setActiveTab('active_tickets')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'active_tickets'
                  ? 'bg-white border-[#1a6b54] text-[#1a6b54] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Active Tickets
            </button>
            <button
              onClick={() => setActiveTab('resolved_tickets')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'resolved_tickets'
                  ? 'bg-white border-[#1a6b54] text-[#1a6b54] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Resolved Tickets
            </button>
            <button
              onClick={() => setActiveTab('all_history')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'all_history'
                  ? 'bg-white border-[#1a6b54] text-[#1a6b54] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Ticket History
            </button>
          </div>

          {/* TAB 1: Active Tickets */}
          {activeTab === 'active_tickets' && (
            <div className="space-y-6">
              {/* Tab Title and Action Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#1a6b54]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  <span>Active Support Tickets</span>
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-[#1a6b54] hover:bg-[#13503f] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Raise Ticket
                </button>
              </div>

              {/* Ticket Cards List */}
              <div className="space-y-5">
                {activeSupportTickets.length > 0 ? (
                  activeSupportTickets.map((t) => (
                    <div key={t.id} className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                      {/* Ticket Badge tags + timestamp row */}
                      <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-bold">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                            {t.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${
                            t.status === 'OPEN' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {t.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${
                            t.severity === 'Critical' || t.severity === 'High'
                              ? 'bg-rose-50 text-rose-600 border border-rose-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {t.severity} Severity
                          </span>
                        </div>
                        <span className="text-slate-400 font-medium font-sans">📅 {t.dateLogged}</span>
                      </div>

                      {/* Ticket Title & Meta details */}
                      <div>
                        <h4 className="text-sm font-extrabold text-[#1a6b54] leading-snug">
                          [{t.product}] {t.subject}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span>📁 Category: <strong>{t.category}</strong></span>
                          <span>🛠️ Assignee: <strong className="text-slate-605">{t.assignee || 'Unassigned'}</strong></span>
                        </p>
                      </div>

                      {/* Description Quote Block */}
                      <div className="border-l-4 border-teal-605 bg-teal-50/30 p-3.5 rounded-r-xl text-xs text-slate-600 font-sans leading-relaxed">
                        {t.description}
                      </div>

                      {/* Dynamic Replies */}
                      {ticketReplies[t.id] && ticketReplies[t.id].length > 0 && (
                        <div className="mt-3 pl-4 space-y-2 border-l border-slate-300/60">
                          {ticketReplies[t.id].map((rep, rIdx) => (
                            <div key={rIdx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-sm max-w-lg">
                              <div className="flex justify-between font-bold text-slate-500 text-[10px] mb-1">
                                <span>💬 {rep.sender}</span>
                                <span>{rep.time}</span>
                              </div>
                              <p className="text-slate-700 font-medium font-sans">{rep.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action buttons row */}
                      <div className="flex justify-end items-center gap-2 pt-2.5 border-t border-slate-100">
                        {activeReplyId === t.id ? (
                          <div className="w-full flex items-center gap-2 mt-1">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a message to support..."
                              className="flex-grow bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs focus:outline-none focus:border-teal-500"
                            />
                            <button
                              onClick={() => handleSendReply(t.id)}
                              className="px-3.5 py-1.5 bg-[#1a6b54] hover:bg-[#13503f] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              Send
                            </button>
                            <button
                              onClick={() => {
                                setActiveReplyId(null)
                                setReplyText('')
                              }}
                              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold rounded-xl text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setActiveReplyId(t.id)}
                              className="px-3 py-1.5 border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-505 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                            >
                              Add Reply
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedLogsTicket(t)}
                              className="px-3 py-1.5 border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-505 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                            >
                              Check Logs
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 bg-slate-50 border border-slate-200/60 rounded-2xl">
                     <span className="text-3xl block">📁</span>
                     <p className="font-bold mt-2">No active support tickets logged</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1.5: Resolved Tickets */}
          {activeTab === 'resolved_tickets' && (
            <div className="space-y-6">
              {/* Tab Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Resolved Support Tickets</span>
                </h3>
              </div>

              {/* Ticket Cards List */}
              <div className="space-y-5">
                {resolvedSupportTickets.length > 0 ? (
                  resolvedSupportTickets.map((t) => (
                    <div key={t.id} className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-bold">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                            {t.id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-205">
                            {t.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${
                            t.severity === 'Critical' || t.severity === 'High'
                              ? 'bg-rose-50 text-rose-600 border border-rose-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {t.severity} Severity
                          </span>
                        </div>
                        <span className="text-slate-400 font-medium font-sans">📅 {t.dateLogged}</span>
                      </div>

                      <div>
                        <h4 className="text-sm font-extrabold text-[#1a6b54] leading-snug">
                          [{t.product}] {t.subject}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span>📁 Category: <strong>{t.category}</strong></span>
                          <span>🛠️ Assignee: <strong className="text-slate-605">{t.assignee || 'Unassigned'}</strong></span>
                        </p>
                      </div>

                      <div className="border-l-4 border-emerald-500 bg-emerald-50/30 p-3.5 rounded-r-xl text-xs text-slate-600 font-sans leading-relaxed">
                        {t.description}
                      </div>

                      {ticketReplies[t.id] && ticketReplies[t.id].length > 0 && (
                        <div className="mt-3 pl-4 space-y-2 border-l border-slate-300/60">
                          {ticketReplies[t.id].map((rep, rIdx) => (
                            <div key={rIdx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-sm max-w-lg">
                              <div className="flex justify-between font-bold text-slate-505 text-[10px] mb-1">
                                <span>💬 {rep.sender}</span>
                                <span>{rep.time}</span>
                              </div>
                              <p className="text-slate-700 font-medium font-sans">{rep.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-end items-center gap-2 pt-2.5 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSelectedLogsTicket(t)}
                          className="px-3 py-1.5 border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-505 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                        >
                          Check Logs
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 bg-slate-50 border border-slate-200/60 rounded-2xl">
                    <span className="text-3xl block">📁</span>
                    <p className="font-bold mt-2">No resolved support tickets found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Full History Table */}
          {activeTab === 'all_history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>My Ticket Logs History</span>
                </h3>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-5 py-4">Ticket ID</th>
                        <th className="px-5 py-4">Product</th>
                        <th className="px-5 py-4">Subject</th>
                        <th className="px-5 py-4">Category</th>
                        <th className="px-5 py-4">Severity</th>
                        <th className="px-5 py-4">Assignee</th>
                        <th className="px-5 py-4">Date Logged</th>
                        <th className="px-5 py-4 text-center">Status</th>
                        <th className="px-5 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredTickets.length > 0 ? (
                        filteredTickets.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4 font-mono font-bold text-slate-505">{t.id}</td>
                            <td className="px-5 py-4">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[9.5px] uppercase">
                                {t.product}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-medium max-w-xs truncate">{t.subject}</td>
                            <td className="px-5 py-4 font-semibold text-slate-500">{t.category}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2 py-0.5 rounded border text-[9.5px] font-black uppercase tracking-wider ${
                                t.severity === 'Critical' || t.severity === 'High'
                                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                                  : t.severity === 'Medium'
                                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              }`}>
                                {t.severity}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-bold text-slate-600">{t.assignee || 'Unassigned'}</td>
                            <td className="px-5 py-4 font-medium text-slate-400 font-sans">{t.dateLogged.split(',')[0]}</td>
                            <td className="px-5 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                                t.status === 'RESOLVED'
                                  ? 'bg-emerald-100 text-emerald-805 border border-emerald-200'
                                  : t.status === 'IN PROGRESS'
                                  ? 'bg-amber-100 text-amber-805 border border-amber-200'
                                  : 'bg-red-100 text-red-805 border border-red-200'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => setSelectedLogsTicket(t)}
                                className="px-2.5 py-1.5 rounded-lg border border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-600 font-bold cursor-pointer transition-all flex items-center gap-1 mx-auto"
                              >
                                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Logs</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-12 text-slate-400">
                            <span className="text-3xl block">📁</span>
                            <p className="font-bold mt-2">No ticket logs found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Audit Logs Modal */}
      {selectedLogsTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 max-w-md w-full animate-fade-in text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <span>Audit Logs — {selectedLogsTicket.id}</span>
              </h3>
              <button
                onClick={() => setSelectedLogsTicket(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 text-xs">
              {(auditLogs[selectedLogsTicket.id] || [
                {
                  action: 'Ticket Created',
                  date: selectedLogsTicket.dateLogged,
                  description: 'System recorded ticket submission from client portal.'
                },
                ...(selectedLogsTicket.status !== 'OPEN' ? [{
                  action: 'Status Changed to In Progress',
                  date: '19 May 2025, 02:00 PM',
                  description: 'Assigned to Technical Desk Engineer.'
                }] : []),
                ...(selectedLogsTicket.status === 'RESOLVED' ? [{
                  action: 'Status Changed to Resolved',
                  date: '20 May 2025, 11:30 AM',
                  description: 'Issue resolved by technical desk. Resolution confirmed by client.'
                }] : [])
              ]).map((log, logIdx) => (
                <div key={logIdx} className={`border-l-2 pl-3 py-0.5 ${
                  log.action.includes('Created') ? 'border-emerald-500' :
                  log.action.includes('Resolved') ? 'border-green-500' : 'border-amber-500'
                }`}>
                  <p className="font-bold text-slate-800">{log.action}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{log.date}</p>
                  <p className="text-slate-500 mt-1 leading-relaxed">{log.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLogsTicket(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#1a6b54]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Raise New Support Ticket</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition-colors font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-5 text-slate-650 font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Client Name (Locked) */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Client Name (Locked)</label>
                  <input
                    type="text"
                    disabled
                    value={clientName}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>

                {/* Product / Service */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Product / Service</label>
                  <select
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="">Choose product...</option>
                    <option value="School MS">School MS</option>
                    <option value="College Portal">College Portal</option>
                    <option value="GST Billing Tool">GST Billing Tool</option>
                    <option value="CRM Enterprise">CRM Enterprise</option>
                    <option value="E-Commerce Hub">E-Commerce Hub</option>
                    <option value="NEXGN Institute Pro">NEXGN Institute Pro</option>
                    <option value="Android Mobile App">Android Mobile App</option>
                  </select>
                </div>

                {/* Issue Category */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Issue Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="">Choose category...</option>
                    <option value="Bug">Bug</option>
                    <option value="Setup">Setup</option>
                    <option value="Billing">Billing</option>
                    <option value="Inquiry">Inquiry</option>
                    <option value="Customization">Customization</option>
                  </select>
                </div>

                {/* Severity Level */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Severity Level</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Ticket Subject */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Ticket Subject</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  required
                  placeholder="Brief summary of the issue"
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Detailed Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                  rows="4"
                  placeholder="Provide full details of your issue, how to reproduce it, or any error messages..."
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-teal-500"
                ></textarea>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Attachments (Optional)</label>
                <input
                  type="file"
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer cursor-pointer"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-205 hover:bg-slate-50 text-slate-550 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1a6b54] hover:bg-[#13503f] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default ClientSupport
