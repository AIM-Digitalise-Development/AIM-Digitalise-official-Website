import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { getAdminClients } from '../../api/admin/partners'
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
  const [summary, setSummary] = useState({
    total_clients: 0,
    active_subscriptions: 0,
    total_revenue: 0
  })

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
                        <th className="px-6 py-4">Sub ID</th>
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Plan</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4">Start Date</th>
                        <th className="px-6 py-4">End Date</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {loading ? (
                        <tr>
                          <td colSpan="9" className="text-center py-10 font-bold">
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
                            <td className="px-6 py-4 font-bold text-blue-600">
                              {sub.product_category?.toUpperCase()}
                            </td>
                            <td className="px-6 py-4 text-right font-black text-slate-800 text-sm">
                              ₹{Number(sub.processing_fee || 0).toLocaleString('en-IN')}.00
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-500">{formatDate(sub.created_at)}</td>
                            <td className="px-6 py-4 font-medium text-slate-500">{getEndDate(sub.created_at)}</td>
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
                                onClick={() => alert(`Showing details for ${sub.client_name}`)}
                                className="px-3 py-1.5 rounded-lg border border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-600 font-bold cursor-pointer transition-all flex items-center gap-1 mx-auto"
                              >
                                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Details</span>
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
