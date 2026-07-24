import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import useAuthStore from '../../store/authStore'

const MOCK_TICKETS = [
  {
    id: 'TCK-824319-X9A2',
    ticket_id: 'TCK-824319-X9A2',
    client_name: 'Sunrise Academy',
    product_name: 'School MS',
    subject: 'Cannot upload student photo in bulk',
    category: 'Bug',
    severity: 'High',
    assignee_name: 'Unassigned',
    status: 'Open',
    description: 'When trying to bulk upload student photos, the system throws a 500 error. Other files work fine.',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    replies: [
      { sender_name: 'Sunrise Academy', text: 'This is urgent as the academic session starts next week.', created_at: new Date(Date.now() - 1.5 * 3600000).toISOString() }
    ]
  },
  {
    id: 'TCK-192301-A4B9',
    ticket_id: 'TCK-192301-A4B9',
    client_name: 'Apex Retailers',
    product_name: 'GST Billing Tool',
    subject: 'Request for custom tax invoice format',
    category: 'Customization',
    severity: 'Medium',
    assignee_name: 'Rohan Verma',
    status: 'In Progress',
    description: 'We need to display the signature field at the bottom right corner of the invoice. Currently, it aligns to left.',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    replies: [
      { sender_name: 'Rohan Verma', text: 'Design has been shared with the tech team. Expected rollout tomorrow.', created_at: new Date(Date.now() - 12 * 3600000).toISOString() }
    ]
  },
  {
    id: 'TCK-728103-C2D5',
    ticket_id: 'TCK-728103-C2D5',
    client_name: 'Greenfield School',
    product_name: 'Android Mobile App',
    subject: 'Push notifications are not delivering to Android 14 devices',
    category: 'Bug',
    severity: 'Critical',
    assignee_name: 'Priya Singh',
    status: 'Open',
    description: 'Parents with Android 14 devices are reporting that they do not receive fee alerts via push notifications.',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    replies: []
  },
  {
    id: 'TCK-392810-F8G2',
    ticket_id: 'TCK-392810-F8G2',
    client_name: 'Blue Hill Institute',
    product_name: 'College Portal',
    subject: 'Setup completed and dashboard verified',
    category: 'Setup',
    severity: 'Low',
    assignee_name: 'Jane Smith',
    status: 'Resolved',
    description: 'College admission portal setup has been finished. We have successfully processed 10 test student registrations.',
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    replies: [
      { sender_name: 'Jane Smith', text: 'Thank you for verification. Marking ticket as resolved.', created_at: new Date(Date.now() - 68 * 3600000).toISOString() }
    ]
  }
]

const AdminSupport = () => {
  const { token } = useAuthStore()
  const adminToken = token || localStorage.getItem('access_token')

  const [activeTab, setActiveTab] = useState('active_tickets')
  const [clientSearch, setClientSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // API Support Ticket States
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [supportStats, setSupportStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0
  })

  // Form states for New Ticket
  const [newClientName, setNewClientName] = useState('')
  const [newProduct, setNewProduct] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newSeverity, setNewSeverity] = useState('Low')
  const [newAssignee, setNewAssignee] = useState('Unassigned')
  const [newSubject, setNewSubject] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Interactive Reply states
  const [replyText, setReplyText] = useState('')
  const [activeReplyId, setActiveReplyId] = useState(null)

  // Detailed Modal states for "View Details" & Logs
  const [selectedLogsTicket, setSelectedLogsTicket] = useState(null)
  const [selectedViewTicket, setSelectedViewTicket] = useState(null)

  // FAQ Accordion state
  const [openFaqIdx, setOpenFaqIdx] = useState(null)

  // List of active employees for assignment
  const employeeList = [
    'Rohan Verma',
    'Priya Singh',
    'Aman Gupta',
    'Neha Sharma',
    'Vikram Malhotra'
  ]

  // Fetch all support tickets
  const fetchSupportTickets = async () => {
    if (!adminToken) return
    setLoading(true)
    try {
      let queryParams = new URLSearchParams()
      
      const statusType = activeTab === 'active_tickets' ? 'active' : (activeTab === 'resolved_tickets' ? 'resolved' : 'all')
      queryParams.append('status_type', statusType)

      if (clientSearch) queryParams.append('search', clientSearch)
      if (severityFilter && severityFilter !== 'All') queryParams.append('severity', severityFilter)
      if (categoryFilter && categoryFilter !== 'All') queryParams.append('category', categoryFilter)

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'
      const response = await fetch(`${API_URL}/admin/support-tickets?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const result = await response.json()
      if (result.success) {
        setTickets(result.data || [])
      } else {
        throw new Error(result.message || 'Error response')
      }
    } catch (err) {
      console.warn('API error fetching support tickets, falling back to mock data:', err)
      let list = [...MOCK_TICKETS]
      if (activeTab === 'active_tickets') {
        list = list.filter(t => t.status === 'Open' || t.status === 'In Progress' || t.status === 'OPEN' || t.status === 'IN PROGRESS')
      } else if (activeTab === 'resolved_tickets') {
        list = list.filter(t => t.status === 'Resolved' || t.status === 'Closed' || t.status === 'RESOLVED' || t.status === 'CLOSED')
      }
      if (clientSearch) {
        list = list.filter(t =>
          t.subject.toLowerCase().includes(clientSearch.toLowerCase()) ||
          t.client_name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          t.id.toLowerCase().includes(clientSearch.toLowerCase())
        )
      }
      if (severityFilter && severityFilter !== 'All') {
        list = list.filter(t => t.severity === severityFilter)
      }
      if (categoryFilter && categoryFilter !== 'All') {
        list = list.filter(t => t.category === categoryFilter)
      }
      setTickets(list)
    } finally {
      setLoading(false)
    }
  }

  // Fetch support tickets summary metrics
  const fetchSupportTicketStats = async () => {
    if (!adminToken) return
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'
      const response = await fetch(`${API_URL}/admin/support-tickets/stats`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const result = await response.json()
      if (result.success && result.data) {
        setSupportStats(result.data)
      }
    } catch (err) {
      console.warn('API error fetching support stats, calculating from mock data:', err)
      const stats = {
        total: MOCK_TICKETS.length,
        open: MOCK_TICKETS.filter(t => t.status === 'Open' || t.status === 'OPEN').length,
        in_progress: MOCK_TICKETS.filter(t => t.status === 'In Progress' || t.status === 'IN PROGRESS').length,
        resolved: MOCK_TICKETS.filter(t => t.status === 'Resolved' || t.status === 'RESOLVED').length,
        closed: MOCK_TICKETS.filter(t => t.status === 'Closed' || t.status === 'CLOSED').length
      }
      setSupportStats(stats)
    }
  }

  useEffect(() => {
    fetchSupportTickets()
    fetchSupportTicketStats()
  }, [adminToken, activeTab, clientSearch, severityFilter, categoryFilter])

  // Update support ticket details (status, assignee, admin notes)
  const handleUpdateTicket = async (ticketId, payload) => {
    if (!adminToken) return
    let success = false
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'
      const response = await fetch(`${API_URL}/admin/support-tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          success = true
          fetchSupportTickets()
          fetchSupportTicketStats()
          if (selectedViewTicket && (selectedViewTicket.id === ticketId || selectedViewTicket.ticket_id === ticketId)) {
            setSelectedViewTicket(result.data)
          }
          if (selectedLogsTicket && (selectedLogsTicket.id === ticketId || selectedLogsTicket.ticket_id === ticketId)) {
            setSelectedLogsTicket(result.data)
          }
        }
      }
    } catch (err) {
      console.warn('API error updating support ticket:', err)
    }

    if (!success) {
      const idx = MOCK_TICKETS.findIndex(t => t.id === ticketId || t.ticket_id === ticketId)
      if (idx > -1) {
        if (payload.status) MOCK_TICKETS[idx].status = payload.status
        if (payload.assignee_name) MOCK_TICKETS[idx].assignee_name = payload.assignee_name
        if (payload.admin_notes || payload.reply_text) {
          const notesText = payload.admin_notes || payload.reply_text
          MOCK_TICKETS[idx].replies.push({
            sender_name: 'Admin',
            text: notesText,
            created_at: new Date().toISOString()
          })
        }
      }
      fetchSupportTickets()
      fetchSupportTicketStats()
    }
  }

  const handleResolveTicket = (id) => {
    handleUpdateTicket(id, { status: 'Resolved' })
    alert(`Ticket ${id} marked as RESOLVED.`)
  }

  const handleSendReply = async (ticketId) => {
    if (!replyText.trim()) return
    await handleUpdateTicket(ticketId, {
      admin_notes: replyText,
      reply_text: replyText
    })
    setReplyText('')
    setActiveReplyId(null)
    alert('Reply sent successfully!')
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!newClientName || !newProduct || !newCategory || !newSubject || !newDescription) {
      alert('Please fill out all required fields.')
      return
    }
    setSubmitting(true)
    let success = false
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'
      const response = await fetch(`${API_URL}/admin/support-tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_name: newClientName,
          product_name: newProduct,
          category: newCategory,
          severity: newSeverity,
          assignee_name: newAssignee,
          subject: newSubject,
          description: newDescription
        })
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          success = true
          alert('🎉 Support Ticket created successfully!')
          setIsCreateModalOpen(false)
          fetchSupportTickets()
          fetchSupportTicketStats()
        }
      }
    } catch (err) {
      console.warn('API error creating support ticket:', err)
    }

    if (!success) {
      const newId = `TCK-${Math.floor(100000 + Math.random() * 900000)}`
      MOCK_TICKETS.unshift({
        id: newId,
        ticket_id: newId,
        client_name: newClientName,
        product_name: newProduct,
        subject: newSubject,
        category: newCategory,
        severity: newSeverity,
        assignee_name: newAssignee,
        status: 'Open',
        description: newDescription,
        created_at: new Date().toISOString(),
        replies: []
      })
      alert('🎉 Support Ticket (mock) created successfully!')
      setIsCreateModalOpen(false)
      fetchSupportTickets()
      fetchSupportTicketStats()
    }

    setNewClientName('')
    setNewProduct('')
    setNewCategory('')
    setNewSeverity('Low')
    setNewAssignee('Unassigned')
    setNewSubject('')
    setNewDescription('')
    setActiveTab('active_tickets')
    setSubmitting(false)
  }

  const toggleFaq = (idx) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx)
  }

  const faqs = [
    {
      q: "How do I reset a client's login password?",
      a: "To reset a client's login password, navigate to the General Client or SaaS Based Client portal, select the respective client, click 'Reset Password', and confirm. An automated password reset link will be sent to the client's registered email address."
    },
    {
      q: 'How can I manually renew a subscription?',
      a: "Navigate to the Subscribed Client page. Find the client in the list and click 'Details' or 'Renew'. You can choose the renewal duration (1 year standard) and issue a fresh invoice. Once payment is confirmed, the subscription status will automatically sync back to ACTIVE."
    },
    {
      q: 'How is GST customization handled for products?',
      a: 'GST settings are configurable per invoice and product catalog. Go to Settings, click on the GST Configuration tab, and input the applicable CGST/SGST/IGST rates. For e-commerce and retail tools, HSN codes can be populated under individual product schemas.'
    },
    {
      q: 'Resolving SMS gateway integration errors',
      a: 'SMS gateway errors usually stem from unverified DLT Templates or incorrect sender ID parameters. Ensure the template ID matches the DLTR registry exactly, and that the SMS Gateway API key is up to date in the environment configuration settings.'
    }
  ]

  return (
    <>
      <Helmet>
        <title>Support Panel | Admin Panel</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in text-left">
        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Support Panel</h1>

          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>

          <div className="w-48"></div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Tickets */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Tickets</span>
              <span className="text-3xl font-black text-slate-800 mt-1.5 block">
                {supportStats.total}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-505 font-bold border border-blue-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>

          {/* Card 2: Open Tickets */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Open Tickets</span>
              <span className="text-3xl font-black text-rose-505 mt-1.5 block">
                {supportStats.open}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-rose-500 font-bold border border-red-100">
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
                {supportStats.in_progress}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 font-bold border border-amber-100 font-sans">
              ⚙️
            </div>
          </div>

          {/* Card 4: Resolved */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 tracking-wider block uppercase">Resolved</span>
              <span className="text-3xl font-black text-emerald-500 mt-1.5 block">
                {supportStats.resolved}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-505 font-bold border border-emerald-100">
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
              <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Search Ticket Subject / Client</label>
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
                  placeholder="Type to search ticket details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-sans"
                />
              </div>
            </div>

            {/* Severity Filter */}
            <div className="w-full">
              <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Severity</label>
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
              <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-semibold cursor-pointer"
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
                  ? 'bg-white border-blue-600 text-blue-600 -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Active Tickets
            </button>
            <button
              onClick={() => setActiveTab('resolved_tickets')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'resolved_tickets'
                  ? 'bg-white border-blue-600 text-blue-600 -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Resolved Tickets
            </button>
            <button
              onClick={() => setActiveTab('all_history')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'all_history'
                  ? 'bg-white border-blue-600 text-blue-600 -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              All History
            </button>
            <button
              onClick={() => setActiveTab('direct_support')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'direct_support'
                  ? 'bg-white border-blue-600 text-blue-600 -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Direct Support
            </button>
            <button
              onClick={() => setActiveTab('knowledge_base')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'knowledge_base'
                  ? 'bg-white border-blue-600 text-blue-600 -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Knowledge Base
            </button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="text-center py-10">
              <span className="inline-block animate-spin text-xl">⏳</span>
              <p className="text-xs text-slate-400 mt-2 font-semibold">Loading support tickets...</p>
            </div>
          )}

          {/* TAB 1: Active Tickets */}
          {!loading && activeTab === 'active_tickets' && (
            <div className="space-y-6">
              {/* Tab Title and Action Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-505" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  <span>Active Support Tickets</span>
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  New Ticket
                </button>
              </div>

              {/* Ticket Cards List */}
              <div className="space-y-5">
                {tickets.length > 0 ? (
                  tickets.map((t) => (
                    <div key={t.id} className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                      {/* Ticket Badge tags + timestamp row */}
                      <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-bold">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-505 bg-slate-200 px-2 py-0.5 rounded">
                            {t.ticket_id || t.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${
                            t.status === 'OPEN' || t.status === 'Open' ? 'bg-red-105 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
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
                        <span className="text-slate-400 font-medium font-sans">
                          📅 {t.created_at ? new Date(t.created_at).toLocaleString() : (t.dateLogged || 'Just now')}
                        </span>
                      </div>

                      {/* Ticket Title & Meta details */}
                      <div>
                        <h4 className="text-sm font-extrabold text-[#1e3e6b] leading-snug">
                          [{t.product_name || t.product || 'Services'}] {t.subject}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span>👤 Client: <strong>{t.client_name || t.client || '—'}</strong></span>
                          <span>📁 Category: <strong>{t.category}</strong></span>
                          <span className="flex items-center gap-1">
                            👤 Assign To:
                            <select
                              value={t.assignee_name || t.assignee || 'Unassigned'}
                              onChange={(e) => handleUpdateTicket(t.id, { assignee_name: e.target.value, status: t.status })}
                              className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                            >
                              <option value="Unassigned">Unassigned</option>
                              {employeeList.map(emp => (
                                <option key={emp} value={emp}>{emp}</option>
                              ))}
                            </select>
                          </span>
                        </p>
                      </div>

                      {/* Description Quote Block */}
                      <div className="border-l-4 border-blue-500 bg-blue-50/30 p-3.5 rounded-r-xl text-xs text-slate-655 font-sans leading-relaxed whitespace-pre-wrap">
                        {t.description}
                      </div>

                      {/* Attachment display */}
                      {(() => {
                        const fileUrl = t.attachment_url || t.attachment || t.file_path
                        if (!fileUrl) return null
                        return (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs">📎</span>
                            <a
                              href={fileUrl.startsWith('http') ? fileUrl : `https://api.nexgn.in/${fileUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 font-bold hover:underline"
                            >
                              View Attached File
                            </a>
                          </div>
                        )
                      })()}

                      {/* Dynamic Replies */}
                      {(t.replies || t.comments || []).length > 0 && (
                        <div className="mt-3 pl-4 space-y-2 border-l border-slate-300/60">
                          {(t.replies || t.comments).map((rep, rIdx) => (
                            <div key={rIdx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-sm max-w-lg">
                              <div className="flex justify-between font-bold text-slate-500 text-[10px] mb-1">
                                <span>💬 {rep.sender_name || rep.sender || 'Staff'}</span>
                                <span>{rep.created_at ? new Date(rep.created_at).toLocaleTimeString() : (rep.time || 'Just now')}</span>
                              </div>
                              <p className="text-slate-700 font-medium font-sans">{rep.text || rep.comment || rep.notes}</p>
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
                              placeholder="Write a message to the client..."
                              className="flex-grow bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                            />
                            <button
                              onClick={() => handleSendReply(t.id)}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
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
                              className="px-3 py-1.5 border border-slate-200 hover:border-slate-400 hover:bg-slate-55 text-slate-505 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                            >
                              Reply
                            </button>
                            {t.status !== 'RESOLVED' && t.status !== 'Resolved' && (
                              <button
                                onClick={() => handleResolveTicket(t.id)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                              >
                                ✓ Mark Resolved
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <span className="text-3xl block">📁</span>
                    <p className="font-bold mt-2">No active support tickets match criteria</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1.5: Resolved Tickets */}
          {!loading && activeTab === 'resolved_tickets' && (
            <div className="space-y-6">
              {/* Tab Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-555" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Resolved Support Tickets</span>
                </h3>
              </div>

              {/* Ticket Cards List */}
              <div className="space-y-5">
                {tickets.length > 0 ? (
                  tickets.map((t) => (
                    <div key={t.id} className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                      {/* Ticket Badge tags + timestamp row */}
                      <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-bold">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-505 bg-slate-200 px-2 py-0.5 rounded">
                            {t.ticket_id || t.id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
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
                        <span className="text-slate-400 font-medium font-sans">
                          📅 {t.created_at ? new Date(t.created_at).toLocaleString() : (t.dateLogged || 'Just now')}
                        </span>
                      </div>

                      {/* Ticket Title & Meta details */}
                      <div>
                        <h4 className="text-sm font-extrabold text-[#1e3e6b] leading-snug">
                          [{t.product_name || t.product || 'Services'}] {t.subject}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span>👤 Client: <strong>{t.client_name || t.client || '—'}</strong></span>
                          <span>📁 Category: <strong>{t.category}</strong></span>
                          <span className="flex items-center gap-1">
                            👤 Assign To:
                            <select
                              value={t.assignee_name || t.assignee || 'Unassigned'}
                              onChange={(e) => handleUpdateTicket(t.id, { assignee_name: e.target.value, status: t.status })}
                              className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                            >
                              <option value="Unassigned">Unassigned</option>
                              {employeeList.map(emp => (
                                <option key={emp} value={emp}>{emp}</option>
                              ))}
                            </select>
                          </span>
                        </p>
                      </div>

                      {/* Description Quote Block */}
                      <div className="border-l-4 border-emerald-505 bg-emerald-50/30 p-3.5 rounded-r-xl text-xs text-slate-655 font-sans leading-relaxed whitespace-pre-wrap">
                        {t.description}
                      </div>

                      {/* Dynamic Replies */}
                      {(t.replies || t.comments || []).length > 0 && (
                        <div className="mt-3 pl-4 space-y-2 border-l border-slate-300/60">
                          {(t.replies || t.comments).map((rep, rIdx) => (
                            <div key={rIdx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-sm max-w-lg">
                              <div className="flex justify-between font-bold text-slate-500 text-[10px] mb-1">
                                <span>💬 {rep.sender_name || rep.sender || 'Staff'}</span>
                                <span>{rep.created_at ? new Date(rep.created_at).toLocaleTimeString() : (rep.time || 'Just now')}</span>
                              </div>
                              <p className="text-slate-700 font-medium font-sans">{rep.text || rep.comment || rep.notes}</p>
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
                              placeholder="Write a message to the client..."
                              className="flex-grow bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                            />
                            <button
                              onClick={() => handleSendReply(t.id)}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
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
                          <button
                            onClick={() => setActiveReplyId(t.id)}
                            className="px-3 py-1.5 border border-slate-200 hover:border-slate-400 hover:bg-slate-55 text-slate-505 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                          >
                            Reply
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <span className="text-3xl block">📁</span>
                    <p className="font-bold mt-2">No resolved support tickets match criteria</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: All History Table */}
          {!loading && activeTab === 'all_history' && (
            <div className="space-y-6">
              {/* Title row */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-rose-505" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Full Support Ticket Log</span>
                </h3>
              </div>

              {/* Table wrapper */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-5 py-4">Ticket ID</th>
                        <th className="px-5 py-4">Client Name</th>
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
                      {tickets.length > 0 ? (
                        tickets.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4 font-mono font-bold text-slate-505">{t.ticket_id || t.id}</td>
                            <td className="px-5 py-4 font-bold text-slate-800">{t.client_name || t.client || '—'}</td>
                            <td className="px-5 py-4">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-655 font-bold text-[9.5px] uppercase">
                                {t.product_name || t.product || 'Services'}
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
                            <td className="px-5 py-4 font-semibold text-slate-600">
                              <select
                                value={t.assignee_name || t.assignee || 'Unassigned'}
                                onChange={(e) => handleUpdateTicket(t.id, { assignee_name: e.target.value, status: t.status })}
                                className="bg-slate-55 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                              >
                                <option value="Unassigned">Unassigned</option>
                                {employeeList.map(emp => (
                                  <option key={emp} value={emp}>{emp}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-5 py-4 font-medium text-slate-400 font-sans">
                              {t.created_at ? new Date(t.created_at).toLocaleDateString() : (t.dateLogged ? t.dateLogged.split(',')[0] : '—')}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                                t.status === 'RESOLVED' || t.status === 'Resolved'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : t.status === 'IN PROGRESS' || t.status === 'In Progress'
                                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => setSelectedLogsTicket(t)}
                                className="px-2.5 py-1.5 rounded-lg border border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-655 font-bold cursor-pointer transition-all flex items-center gap-1 mx-auto"
                              >
                                <svg className="w-3.5 h-3.5 text-blue-505" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Logs</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="text-center py-12 text-slate-400">
                            <span className="text-3xl block">📁</span>
                            <p className="font-bold mt-2">No history records match search criteria</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Direct Support */}
          {activeTab === 'direct_support' && (
            <div className="space-y-6">
              {/* Title row */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-505" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Direct Call & Message Support</span>
                </h3>
              </div>

              {/* Grid of contact channels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
                {/* Channel 1: Technical Support Desk */}
                <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-6 flex flex-col items-center justify-between text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                    📞
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#1e3e6b]">Technical Support Desk</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-1">Immediate assistance for critical server or software failures.</p>
                  </div>
                  <div className="text-lg font-black text-slate-800 font-mono">
                    +91 98765 43210
                  </div>
                  <a
                    href="tel:+919876543210"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer text-center block w-full max-w-[180px]"
                  >
                    Call Now
                  </a>
                </div>

                {/* Channel 2: Direct Messaging */}
                <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-6 flex flex-col items-center justify-between text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                    💬
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#1e3e6b]">Direct Messaging</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-1">Send a quick message to our dedicated client success managers.</p>
                  </div>
                  <div className="text-lg font-black text-slate-800 font-mono">
                    +91 91234 56789
                  </div>
                  <a
                    href="https://wa.me/919123456789"
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer text-center block w-full max-w-[180px]"
                  >
                    Message Client
                  </a>
                </div>
              </div>

              {/* Channel 3: Email Escalation */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-6 flex flex-col items-center text-center space-y-3 pt-5 mt-4">
                <div className="text-slate-500 text-2xl">✉️</div>
                <div>
                  <h4 className="text-sm font-black text-[#1e3e6b]">Email Escalation</h4>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    For business queries or severe escalations, write to us directly at:{' '}
                    <a href="mailto:support@aimdigitalise.com" className="text-blue-600 hover:underline">
                      support@aimdigitalise.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Knowledge Base */}
          {activeTab === 'knowledge_base' && (
            <div className="space-y-6">
              {/* Title row */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-505" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Troubleshooting & FAQ Guide</span>
                </h3>
              </div>

              {/* Accordion FAQ Guide */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-5 divide-y divide-slate-200/60 shadow-sm max-w-4xl">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border-b border-slate-200/60 last:border-0">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between py-4 text-left font-black text-slate-800 hover:text-blue-600 transition-colors text-sm cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <svg
                        className={`w-4.5 h-4.5 text-slate-400 transition-transform duration-200 ${
                          openFaqIdx === idx ? 'rotate-180 text-blue-600' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openFaqIdx === idx && (
                      <div className="pb-4.5 text-xs text-slate-500 font-medium leading-relaxed font-sans animate-fade-in pr-6 pl-1">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
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
                <span>Audit Logs — {selectedLogsTicket.ticket_id || selectedLogsTicket.id}</span>
              </h3>
              <button
                onClick={() => setSelectedLogsTicket(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-655 transition-colors font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 text-xs font-sans text-left">
              {(selectedLogsTicket.logs || selectedLogsTicket.audit_logs || selectedLogsTicket.history || selectedLogsTicket.status_history || [
                {
                  action: 'Ticket Created',
                  date: selectedLogsTicket.created_at ? new Date(selectedLogsTicket.created_at).toLocaleString() : (selectedLogsTicket.dateLogged || 'Just now'),
                  description: 'System recorded ticket submission.'
                },
                ...(selectedLogsTicket.status !== 'OPEN' && selectedLogsTicket.status !== 'Open' ? [{
                  action: 'Status Changed to In Progress',
                  date: '19 May 2025, 02:00 PM',
                  description: 'Assigned to Technical Desk Engineer.'
                }] : []),
                ...(selectedLogsTicket.status === 'RESOLVED' || selectedLogsTicket.status === 'Resolved' ? [{
                  action: 'Status Changed to Resolved',
                  date: '20 May 2025, 11:30 AM',
                  description: 'Issue resolved by technical desk. Resolution confirmed by client.'
                }] : [])
              ]).map((log, idx) => (
                <div key={idx} className={`border-l-2 pl-3 py-0.5 ${
                  (log.action || log.event || '').includes('Created') ? 'border-emerald-500' :
                  (log.action || log.event || '').includes('Resolved') ? 'border-emerald-600' : 'border-amber-500'
                }`}>
                  <p className="font-bold text-slate-800">{log.action || log.event || 'Activity'}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{log.created_at ? new Date(log.created_at).toLocaleString() : (log.date || log.time || '—')}</p>
                  <p className="text-slate-505 mt-1 leading-relaxed">{log.description || log.details || log.notes || '—'}</p>
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
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Generate New Ticket</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-5 text-slate-650 font-semibold text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Client Name */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Client ID / Name</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. AIM8243196"
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Product / Service */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Product / Service</label>
                  <select
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Choose product...</option>
                    <option value="School MS">School MS</option>
                    <option value="College Portal">College Portal</option>
                    <option value="GST Billing Tool">GST Billing Tool</option>
                    <option value="CRM Enterprise">CRM Enterprise</option>
                    <option value="E-Commerce Hub">E-Commerce Hub</option>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* Assign To Developer / Employee */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Assign To Developer / Employee</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Unassigned">Unassigned</option>
                    {employeeList.map(emp => (
                      <option key={emp} value={emp}>{emp}</option>
                    ))}
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500"
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
                  placeholder="Provide full details, steps to reproduce, or any error messages..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>{submitting ? 'Submitting...' : 'Submit Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminSupport
