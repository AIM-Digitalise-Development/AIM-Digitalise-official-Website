import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAdminClients, getAdminClientById, updateClientDelivery } from '../../api/admin/partners'
import { isSaasClient } from '../../utils/subscription'

const AdminSubscribedClients = () => {
  const [productFilter, setProductFilter] = useState('All')
  const [clientSearch, setClientSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'client_list')

  useEffect(() => {
    if (tabParam && tabParam !== 'products') {
      setActiveTab(tabParam)
    } else if (tabParam === 'products') {
      setActiveTab('client_list')
    }
  }, [tabParam])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [selectedClientDetails, setSelectedClientDetails] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [loadingClientDetail, setLoadingClientDetail] = useState(false)
  const [dossierTab, setDossierTab] = useState('profile')

  const flashSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3500) }
  const flashError = (msg) => { setError(msg); setTimeout(() => setError(null), 4000) }

  const [summary, setSummary] = useState({
    total_clients: 0,
    active_subscriptions: 0,
    total_revenue: 0
  })

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '—'
    const val = typeof amount === 'string' ? parseFloat(amount) : amount
    return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  }

  const handleFetchClientDetails = async (clientId) => {
    setLoadingClientDetail(true)
    setError(null)
    try {
      const res = await getAdminClientById(clientId)
      if (res.data?.success) {
        setSelectedClientDetails(res.data.data)
        setDossierTab('profile')
        setShowDetailsModal(true)
      } else {
        flashError(res.data?.message || 'Failed to fetch client details')
      }
    } catch (err) {
      flashError(err.message || 'Error fetching client details')
    } finally {
      setLoadingClientDetail(false)
    }
  }

  const handleUpdateDeliveryDays = async (clientId, days) => {
    try {
      const res = await updateClientDelivery(clientId, days)
      if (res.data?.success) {
        flashSuccess(`Delivery set to ${days} days`)
        fetchClients()
        // If this client is currently selected, update their details modal too
        if (selectedClientDetails && selectedClientDetails.id === clientId) {
          const detailsRes = await getAdminClientById(clientId)
          if (detailsRes.data?.success) {
            setSelectedClientDetails(detailsRes.data.data)
          }
        }
      } else {
        flashError(res.data?.message || 'Failed to update delivery')
      }
    } catch (err) {
      flashError(err.message)
    }
  }

  const handleDownloadInvoice = (payment, clientDetails) => {
    const today = new Date(payment.created_at || Date.now())
    const invoiceDate = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const invoiceNumber = `INV-${today.getTime()}-${Math.floor(Math.random() * 1000)}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #1e293b; }
            .bill-container { max-width: 800px; margin: 0 auto; padding: 30px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; }
            .bill-header { text-align: center; border-bottom: 2px solid #1e3c5e; padding-bottom: 20px; margin-bottom: 20px; }
            .bill-title { font-size: 24px; font-weight: bold; color: #1e3c5e; }
            .bill-subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
            .bill-info { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; font-size: 13px; }
            .bill-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .bill-table th { background: #1e3c5e; color: white; padding: 12px; text-align: left; font-size: 13px; }
            .bill-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .bill-total { text-align: right; padding: 20px; background: #f8fafc; border-radius: 8px; margin-top: 20px; font-size: 14px; }
            .bill-footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="bill-container">
            <div class="bill-header">
              <div class="bill-title">🎓 AIM Digitalise</div>
              <div class="bill-subtitle">Payment Receipt / Tax Invoice</div>
            </div>
            <div class="bill-info">
              <div>
                <strong>Client:</strong> ${clientDetails.client_name || clientDetails.company_name}<br/>
                <strong>Client ID:</strong> ${clientDetails.client_id}<br/>
                <strong>School/Org:</strong> ${clientDetails.company_name}
              </div>
              <div>
                <strong>Invoice #:</strong> ${invoiceNumber}<br/>
                <strong>Payment ID:</strong> ${payment.razorpay_payment_id || 'simulated_pay'}<br/>
                <strong>Date:</strong> ${invoiceDate}
              </div>
            </div>
            <table class="bill-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Cycle</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Subscription Service Fees</strong><br/>
                    <span style="font-size: 11px; color:#64748b;">Period: ${payment.period_start ? formatDate(payment.period_start) : '—'} to ${payment.period_end ? formatDate(payment.period_end) : '—'}</span>
                  </td>
                  <td style="text-transform: capitalize;">${payment.cycle}</td>
                  <td style="text-align: right;">₹ ${parseFloat(payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
            <div class="bill-total">
              <strong>Total Paid (incl. GST):</strong> <span style="font-size: 18px; color: #2563eb; font-weight: bold; margin-left: 10px;">₹ ${parseFloat(payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="bill-footer">
              <p>This is a system generated transaction invoice copy served for verification.</p>
              <p>AIM Digitalise Private Limited • support@aimdigitalise.com</p>
            </div>
          </div>
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Receipt_${payment.razorpay_payment_id || 'invoice'}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const fetchClients = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAdminClients()
      if (res.data?.success) {
        const all = res.data.data.all_clients || []
        // Filter out nexgn (SaaS Based Clients)
        const filtered = all.filter(c => !isSaasClient(c))
        setClients(filtered)

        // Calculate summary metrics (subscribed clients only)
        const total = filtered.length
        const active = filtered.filter(c => c.is_active).length
        const revenue = filtered.reduce((acc, c) => acc + (Number(c.processing_fee) || 0), 0)

        setSummary({
          total_clients: total,
          active_subscriptions: active,
          total_revenue: revenue
        })
      } else {
        setError(res.data?.message || 'Failed to fetch clients list')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching clients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return '—'
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (e) {
      return '—'
    }
  }

  const getEndDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return '—'
      d.setFullYear(d.getFullYear() + 1)
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (e) {
      return '—'
    }
  }

  // Filter subscription rows
  const filteredSubs = clients.filter(sub => {
    const matchesProduct = productFilter === 'All' || sub.product_category === productFilter
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'ACTIVE' ? sub.is_active : !sub.is_active)

    const name = sub.client_name || ''
    const email = sub.email || ''
    const cid = sub.client_id || ''
    const prod = sub.product_name || ''
    const partner = sub.partner_name || ''
    const searchLower = clientSearch.toLowerCase()

    const matchesSearch =
      name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      cid.toString().toLowerCase().includes(searchLower) ||
      prod.toLowerCase().includes(searchLower) ||
      partner.toLowerCase().includes(searchLower)

    return matchesProduct && matchesStatus && matchesSearch
  })

  return (
    <>
      <Helmet>
        <title>Subscription | Admin Panel</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          {/* Left Title */}
          <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">
            Subscription
          </h1>

          {/* Center Branding */}
          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>

          {/* Right Side: Refresh button */}
          <div className="w-48 flex justify-end">
            {activeTab === 'client_list' && (
              <button
                onClick={fetchClients}
                disabled={loading}
                className="px-4 py-2 border border-slate-200 hover:border-[#ef4444] hover:bg-[#ef4444]/5 hover:text-[#ef4444] bg-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer text-slate-600 shadow-sm"
              >
                {loading ? 'Refreshing...' : 'Refresh Clients'}
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel Card */}
        {activeTab === 'client_list' && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex flex-col md:flex-row gap-5 items-end">
            {/* Product dropdown */}
            <div className="w-full md:flex-grow">
              <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Product Wise Search</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-semibold"
                >
                  <option value="All">All Categories</option>
                  <option value="static">Static Websites</option>
                  <option value="dynamic">Dynamic Websites</option>
                  <option value="ecommerce">E-Commerce</option>
                  <option value="mobile">Mobile Apps</option>
                </select>
              </div>
            </div>

            {/* Client Search */}
            <div className="w-full md:flex-grow">
              <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Client Name / Search</label>
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
                  placeholder="Type to search client..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-sans"
                />
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="w-full md:w-56 shrink-0">
              <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-semibold"
              >
                <option value="All">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
        )}

        {/* Content Card Panel */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">

          {/* Navigation Tabs Row */}
          <div className="flex border-b border-slate-200 mb-6 gap-2">
            <button
              onClick={() => handleTabChange('client_list')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${activeTab === 'client_list'
                ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
                }`}
            >
              Client List
            </button>
            <button
              onClick={() => handleTabChange('customization')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${activeTab === 'customization'
                ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
                }`}
            >
              Customization
            </button>
            <button
              onClick={() => handleTabChange('due_payment')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${activeTab === 'due_payment'
                ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
                }`}
            >
              Due Payment
            </button>
            <button
              onClick={() => handleTabChange('payment_report')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${activeTab === 'payment_report'
                ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
                }`}
            >
              Payment Report
            </button>
            <button
              onClick={() => handleTabChange('next_renewal')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${activeTab === 'next_renewal'
                ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
                }`}
            >
              Next Renewal
            </button>
          </div>

          {/* Tab 1 Content: Client List Table */}
          {activeTab === 'client_list' && (
            <div className="space-y-6">
              {/* Error alert */}
              {error && (
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-center justify-between animate-fade-in">
                  <span>{error}</span>
                  <button onClick={fetchClients} className="text-xs font-bold underline hover:no-underline">Try Again</button>
                </div>
              )}

              {/* Stats Cards Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Card 1: Total Client */}
                <div className="group bg-gradient-to-br from-white to-indigo-50/20 rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex items-center justify-between overflow-hidden relative animate-slide-up [animation-delay:100ms]">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-125 transition-all duration-500"></div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Total Subscribed Clients</span>
                    <span className="text-3xl font-black text-slate-800 mt-1.5 block tracking-tight">
                      {loading ? (
                        <span className="inline-block animate-pulse">...</span>
                      ) : (
                        summary.total_clients
                      )}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-500 mt-1 block">Custom portfolios</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl font-bold border border-indigo-100 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm">
                    👥
                  </div>
                </div>

                {/* Card 2: Active Subscriptions */}
                <div className="group bg-gradient-to-br from-white to-emerald-50/20 rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 flex items-center justify-between overflow-hidden relative animate-slide-up [animation-delay:200ms]">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-125 transition-all duration-500"></div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Active Subscriptions</span>
                    <span className="text-3xl font-black text-emerald-600 mt-1.5 block tracking-tight">
                      {loading ? (
                        <span className="inline-block animate-pulse">...</span>
                      ) : (
                        summary.active_subscriptions
                      )}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 mt-1 block">
                      {loading ? '...' : `${((summary.active_subscriptions / (summary.total_clients || 1)) * 100).toFixed(0)}% retention rate`}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl font-bold border border-emerald-100 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                    🛡️
                  </div>
                </div>

                {/* Card 3: Total Revenue */}
                <div className="group bg-gradient-to-br from-white to-amber-50/20 rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300 flex items-center justify-between overflow-hidden relative animate-slide-up [animation-delay:300ms]">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:scale-125 transition-all duration-500"></div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Total Revenue</span>
                    <span className="text-3xl font-black text-aim-gold mt-1.5 block tracking-tight">
                      {loading ? (
                        <span className="inline-block animate-pulse">...</span>
                      ) : (
                        `₹${summary.total_revenue.toLocaleString('en-IN')}`
                      )}
                    </span>
                    <span className="text-[10px] font-bold text-aim-gold mt-1 block">Recurring fees collected</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-aim-gold flex items-center justify-center text-xl font-bold border border-amber-100 group-hover:scale-110 group-hover:bg-aim-gold group-hover:text-white transition-all duration-300 shadow-sm">
                    ₹
                  </div>
                </div>
              </div>


              {/* Table Subtitle Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>Subscription Client List</span>
                </h3>
                <button
                  type="button"
                  onClick={() => alert('Exporting subscriptions...')}
                  className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export List</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Client ID</th>
                        <th className="px-6 py-4">Client Details</th>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Partner</th>
                        <th className="px-6 py-4 text-right">Setup Fee</th>
                        <th className="px-6 py-4 text-center">Delivery Days</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="text-center py-10 font-bold">
                            <span className="inline-block animate-spin mr-2">🔄</span> Loading subscriptions...
                          </td>
                        </tr>
                      ) : filteredSubs.length > 0 ? (
                        filteredSubs.map((sub) => (
                          <tr key={sub.client_id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-slate-500">{sub.client_id}</td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800 text-sm">{sub.company_name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{sub.client_name || '—'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded bg-[#e2e8f0] text-slate-700 font-bold text-[10px] uppercase">
                                {sub.product_name}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {sub.partner_name || '—'}
                            </td>
                            <td className="px-6 py-4 text-right font-black text-slate-800 text-sm">
                              ₹{Number(sub.processing_fee || 0).toLocaleString('en-IN')}.00
                            </td>
                            <td className="px-6 py-4 text-center">
                              <input
                                type="number"
                                min="0"
                                defaultValue={sub.delivery_after != null ? sub.delivery_after : 0}
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value, 10)
                                  if (!isNaN(val) && val !== sub.delivery_after) {
                                    handleUpdateDeliveryDays(sub.id, val)
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = parseInt(e.target.value, 10)
                                    if (!isNaN(val) && val !== sub.delivery_after) {
                                      handleUpdateDeliveryDays(sub.id, val)
                                      e.target.blur()
                                    }
                                  }
                                }}
                                className="w-16 px-1.5 py-0.5 text-center font-bold border border-slate-200 hover:border-slate-300 rounded focus:outline-none focus:border-[#38b34a] text-[10px]"
                              />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${sub.is_active
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border-rose-200'
                                }`}>
                                {sub.is_active ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleFetchClientDetails(sub.id)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold cursor-pointer flex items-center justify-center mx-auto"
                                title="View Details"
                              >
                                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-12 text-slate-400">
                            <span className="text-3xl block">📁</span>
                            <p className="font-bold mt-2">No subscriptions match search criteria</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ CLIENT DETAILS MODAL (SIDE DRAWER) ════════════════════════════════════ */}
          <AnimatePresence>
            {showDetailsModal && selectedClientDetails && (
              <div className="fixed inset-0 z-50 flex items-center justify-end">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900"
                  onClick={() => setShowDetailsModal(false)}
                />

                {/* Slide-over panel */}
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'tween', duration: 0.3 }}
                  className="relative w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-hidden z-10 bg-white border-l border-slate-200"
                >
                  {loadingClientDetail && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center font-bold text-slate-600 text-xs">
                      ⏳ Updating details...
                    </div>
                  )}

                  {/* Header */}
                  <div className="px-6 py-5 flex items-center justify-between bg-slate-50 border-b border-slate-200">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Client Details Dossier</span>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">{selectedClientDetails.company_name || selectedClientDetails.school_name}</h3>
                      <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-blue-600 font-bold font-mono tracking-wider">{selectedClientDetails.client_id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] text-slate-500 font-medium">Connected Person: <strong className="text-slate-700">{selectedClientDetails.client_name}</strong></span>
                        <span className="text-slate-300">•</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${
                          selectedClientDetails.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {selectedClientDetails.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer ml-3 flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Dossier Tabs */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 border-b border-slate-200 px-6 py-3 z-10 shrink-0">
                    {[
                      { id: 'profile', label: 'Company Profile', icon: '🏢' },
                      { id: 'school', label: 'School Metrics', icon: '🏫' },
                      { id: 'product', label: 'Product & Logistics', icon: '📦' },
                      { id: 'ledger', label: 'Payments Ledger', icon: '💳' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setDossierTab(t.id)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          dossierTab === t.id
                            ? 'bg-[#1e3e6b] text-white border-[#1e3e6b] shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Scrollable body */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
                    <AnimatePresence mode="wait">
                      {dossierTab === 'profile' && (
                        <motion.div
                          key="profile"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-6"
                        >
                          {/* Profile Section */}
                          <div>
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">Client / Company Profile</h4>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[11px]">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Email Address</span>
                                <p className="text-slate-800 font-medium mt-1 select-text">{selectedClientDetails.email}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Phone Number</span>
                                <p className="text-slate-800 font-medium mt-1 select-text">{selectedClientDetails.contact_number || selectedClientDetails.phone || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Client / Company Name</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.company_name || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Connected Person</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.client_name || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">GSTIN</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.gstin || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Portal Password</span>
                                <p className="text-slate-800 font-medium mt-1 font-mono">{selectedClientDetails.default_password || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Registration Date</span>
                                <p className="text-slate-800 font-medium mt-1">{formatDate(selectedClientDetails.created_at)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Associated Partner Section */}
                          {selectedClientDetails.partner && (
                            <>
                              <div className="border-t border-slate-100" />
                              <div>
                                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">Associated Marketing Partner</h4>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[11px]">
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Partner ID</span>
                                    <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.partner.partner_id}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Partner Name</span>
                                    <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.partner.name}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Email Address</span>
                                    <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.partner.email}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Contact Number</span>
                                    <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.partner.contact}</p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>
                      )}

                      {dossierTab === 'school' && (
                        <motion.div
                          key="school"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-6"
                        >
                          {/* School Registry Section */}
                          <div>
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">School Registration Metrics</h4>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[11px]">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">School Name</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.school_name || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Short Name</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.school_short_name || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Academic Session</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.school_session || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Total Students</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.total_students != null ? selectedClientDetails.total_students : selectedClientDetails.student_count || '—'}</p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Residence Address</span>
                                <p className="text-slate-800 font-medium mt-1 leading-relaxed">
                                  {selectedClientDetails.address
                                    ? `${selectedClientDetails.address}, ${selectedClientDetails.district || ''}, ${selectedClientDetails.state || ''} - ${selectedClientDetails.pin_code || ''}`
                                    : '—'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {dossierTab === 'product' && (
                        <motion.div
                          key="product"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-6"
                        >
                          {/* Product Pricing & Logistics Section */}
                          <div>
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">Product & Logistics Information</h4>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[11px]">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Product Category</span>
                                <p className="text-blue-600 font-bold mt-1 uppercase">{selectedClientDetails.product_category}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Product Name</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.product_name}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Setup Processing Fee</span>
                                <p className="text-slate-800 font-medium mt-1">{formatCurrency(selectedClientDetails.processing_fee)}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Monthly Subscription</span>
                                <p className="text-slate-800 font-medium mt-1">{formatCurrency(selectedClientDetails.monthly_subscription)}/mo</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Delivery Limit Date</span>
                                <p className="text-slate-800 font-medium mt-1">{formatDate(selectedClientDetails.delivery_date || selectedClientDetails.valid_until)}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Delivery Offset Days</span>
                                <div className="flex items-center gap-1.5 mt-1 font-sans">
                                  <input
                                    type="number"
                                    min="0"
                                    defaultValue={selectedClientDetails.delivery_after != null ? selectedClientDetails.delivery_after : 0}
                                    onBlur={(e) => {
                                      const val = parseInt(e.target.value, 10)
                                      if (!isNaN(val) && val !== selectedClientDetails.delivery_after) {
                                        handleUpdateDeliveryDays(selectedClientDetails.id, val)
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const val = parseInt(e.target.value, 10)
                                        if (!isNaN(val) && val !== selectedClientDetails.delivery_after) {
                                          handleUpdateDeliveryDays(selectedClientDetails.id, val)
                                          e.target.blur()
                                        }
                                      }
                                    }}
                                    className="w-14 px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-800 text-center font-bold rounded text-xs focus:outline-none focus:border-blue-500"
                                  />
                                  <span className="text-slate-400 text-[10px]">days</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-100" />

                          {/* Customizations Section */}
                          <div>
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">Customizations & Upgrades</h4>
                            {selectedClientDetails.customizations && selectedClientDetails.customizations.length > 0 ? (
                              <div className="space-y-3 font-sans">
                                {selectedClientDetails.customizations.map((cust, idx) => (
                                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[10px]">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                                      <span className="font-bold text-slate-700">{cust.customization_text}</span>
                                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 uppercase text-[9px]">{cust.status}</span>
                                    </div>
                                    {cust.admin_notes && <p className="text-slate-500 italic">Notes: {cust.admin_notes}</p>}
                                    <div className="flex justify-between items-center text-slate-500">
                                      <span>Quote Cost: <strong className="text-slate-700">{cust.amount ? formatCurrency(cust.amount) : 'Not Quoted'}</strong></span>
                                      <span>Submitted: {new Date(cust.submitted_at).toLocaleDateString('en-IN')}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic text-[11px] font-sans">No customization requests recorded.</p>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {dossierTab === 'ledger' && (
                        <motion.div
                          key="ledger"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-6"
                        >
                          {/* Subscription Payment ledger history */}
                          <div>
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">Subscription Payments & Receipts Ledger</h4>
                            {selectedClientDetails.payments && selectedClientDetails.payments.length > 0 ? (
                              <div className="space-y-3 font-sans">
                                {selectedClientDetails.payments.map((p, index) => {
                                  const start = p.period_covered?.start_date_formatted || (p.period_start ? formatDate(p.period_start) : '—')
                                  const end = p.period_covered?.end_date_formatted || (p.period_end ? formatDate(p.period_end) : '—')
                                  const formattedTotal = p.amount_formatted || formatCurrency(p.amount)
                                  const formattedGst = p.gst_amount_formatted || formatCurrency(p.gst_amount)
                                  const formattedSubtotal = p.amount_before_gst_formatted || formatCurrency(p.amount_before_gst || p.amount)

                                  return (
                                    <div key={index} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[10px]">
                                      <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                                        <span className="font-bold text-slate-500">Payment ID: <span className="font-mono text-blue-600">{p.payment_id || p.razorpay_payment_id}</span></span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-black border border-emerald-200 uppercase text-[9px]">{p.payment_status || p.status || 'Paid'}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-slate-600">
                                        <p><strong className="text-slate-700">Cycle:</strong> <span className="capitalize">{p.cycle_label || p.cycle}</span> ({p.months_paid || p.cycle_months || '—'} mo)</p>
                                        <p><strong className="text-slate-700">Period:</strong> {start} → {end}</p>
                                        <p className="col-span-2"><strong className="text-slate-700">Breakdown:</strong> {formattedSubtotal} + GST ({p.gst_percentage || 18}%): {formattedGst}</p>
                                        <p className="text-emerald-700 font-bold col-span-2"><strong>Total Paid:</strong> {formattedTotal}</p>
                                      </div>
                                      <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-slate-200">
                                        <span className="text-slate-400">Date: {p.payment_date_formatted || formatDate(p.payment_date || p.created_at)}</span>
                                        <button
                                          onClick={() => handleDownloadInvoice(p, selectedClientDetails)}
                                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded font-bold cursor-pointer text-[9px] transition-all"
                                        >
                                          📥 Receipt
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic text-[11px] font-sans">No payments logged yet.</p>
                            )}
                          </div>

                          <div className="border-t border-slate-100" />

                          {/* Add-on Services Payment History */}
                          <div>
                            <h4 className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-3.5 block font-sans">Add-on Services Payment History</h4>
                            {selectedClientDetails.addon_payments && selectedClientDetails.addon_payments.length > 0 ? (
                              <div className="space-y-3 font-sans">
                                {selectedClientDetails.addon_payments.map((p, idx) => (
                                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[10px]">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-black border border-violet-200 uppercase text-[9px]">{p.addon_type}</span>
                                        {p.recipient_type && (
                                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                            p.recipient_type === 'teacher' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          }`}>{p.recipient_type === 'teacher' ? '👨‍🏫 Staff' : '👥 Students'}</span>
                                        )}
                                      </div>
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-black border border-emerald-200 uppercase text-[9px]">{p.payment_status || 'Paid'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-slate-600">
                                      <p><strong className="text-slate-700">Count:</strong> {p.recipient_type === 'teacher' ? (p.teacher_count || '—') : (p.student_count || '—')}</p>
                                      <p><strong className="text-slate-700">Period:</strong> {p.start_date_formatted || '—'} → {p.end_date_formatted || '—'}</p>
                                      <p><strong className="text-slate-700">Subtotal:</strong> {p.subtotal_formatted || '—'}</p>
                                      <p><strong className="text-slate-700">GST:</strong> +{p.gst_amount_formatted || '—'}</p>
                                      <p className="text-emerald-700 font-bold col-span-2"><strong>Total Paid:</strong> {p.amount_formatted || formatCurrency(p.amount)}</p>
                                    </div>
                                    <div className="pt-1 border-t border-dashed border-slate-200 text-slate-400">
                                      Date: {p.payment_date_formatted || '—'} · ID: <span className="font-mono text-blue-600">{p.payment_id || '—'}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic text-[11px] font-sans">No add-on service payments recorded.</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 flex justify-end bg-slate-50 border-t border-slate-200">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer transition-all"
                    >
                      Close Panel
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Inactive Tab Placeholders */}
          {activeTab !== 'client_list' && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3.5">
              <span className="text-4xl">📄</span>
              <h4 className="text-base font-bold text-slate-800 capitalize">{activeTab.replace('_', ' ')} Tab Content</h4>
              <p className="text-xs text-slate-400 font-medium max-w-sm leading-relaxed font-sans">
                Dynamic configuration, custom fields, billing details, and reports for this tab will be displayed here.
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default AdminSubscribedClients
