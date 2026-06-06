import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { getAdminClients } from '../../api/admin/partners'

const AdminUsers = () => {
  const [clients, setClients] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activePageTab, setActivePageTab] = useState('add_clients')

  const fetchClients = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAdminClients()
      if (res.data?.success) {
        setClients(res.data.data.all_clients || [])
        setSummary(res.data.data.summary || null)
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

  // Filter clients locally
  const filteredClients = clients.filter((client) => {
    const name = client.client_name || ''
    const email = client.email || ''
    const cid = client.client_id || ''
    const prod = client.product_name || ''
    const partner = client.partner_name || ''

    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      cid.toString().toLowerCase().includes(search.toLowerCase()) ||
      prod.toLowerCase().includes(search.toLowerCase()) ||
      partner.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <>
      <Helmet>
        <title>Manage Clients | Admin Panel</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Header containing page title, centered company header and right action */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          {/* Left Side: Page Title */}
          <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Clients</h1>

          {/* Center: Company Banner */}
          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>

          {/* Right Side: Refresh button (aligned to right, visible on show clients tab) */}
          <div className="w-48 flex justify-end">
            {activePageTab === 'show_clients' && (
              <button
                onClick={fetchClients}
                disabled={loading}
                className="px-4 py-2 border border-slate-200 hover:border-[#38b34a] hover:bg-[#38b34a]/5 hover:text-[#38b34a] bg-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer text-slate-600 shadow-sm"
              >
                {loading ? 'Refreshing...' : 'Refresh Clients'}
              </button>
            )}
          </div>
        </div>

        {/* White container card for tab control and content */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
          
          {/* Tab Selection Row */}
          <div className="flex items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            <button
              onClick={() => setActivePageTab('add_clients')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activePageTab === 'add_clients'
                  ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Add Clients
            </button>
            <button
              onClick={() => setActivePageTab('show_clients')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activePageTab === 'show_clients'
                  ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Show Clients
            </button>
            <button
              onClick={() => setActivePageTab('follow_up')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activePageTab === 'follow_up'
                  ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Follow Up
            </button>
          </div>

          {/* Tab Content 1: Add Clients */}
          {activePageTab === 'add_clients' && (
            <div className="space-y-6">
              {/* Card Title Row with Icons */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  {/* Person plus symbol */}
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Clients</span>
                </h3>
                {/* Blue filter funnel */}
                <button className="text-blue-500 hover:text-blue-600 p-1 cursor-pointer">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
                {/* Bulk Upload Gradient Card */}
                <div className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center min-h-[190px] hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-100/90 flex items-center justify-center shadow-md mb-4 shrink-0">
                    <svg className="w-7 h-7 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold tracking-tight">Bulk Upload</span>
                </div>

                {/* Single Entry Gradient Card */}
                <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center min-h-[190px] hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
                  <div className="w-14 h-14 rounded-2xl bg-teal-100/90 flex items-center justify-center shadow-md mb-4 shrink-0">
                    <svg className="w-7 h-7 text-[#0d9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold tracking-tight">Single Entry</span>
                </div>

                {/* Remove Client Gradient Card */}
                <div className="bg-gradient-to-br from-[#f59e0b] to-[#ea580c] rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center min-h-[190px] hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
                  <div className="w-14 h-14 rounded-2xl bg-pink-100/90 flex items-center justify-center shadow-md mb-4 shrink-0">
                    <svg className="w-7 h-7 text-[#db2777]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold tracking-tight">Remove Client</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Show Clients List */}
          {activePageTab === 'show_clients' && (
            <div className="space-y-6">
              {/* Error alert */}
              {error && (
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-center justify-between">
                  <span>{error}</span>
                  <button onClick={fetchClients} className="text-xs font-bold underline hover:no-underline">Try Again</button>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Clients</span>
                    <span className="text-3xl font-black text-slate-800 mt-1.5 block">
                      {loading ? '...' : (summary?.total_clients ?? 0)}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 font-bold border border-blue-100">
                    👥
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Subscriptions</span>
                    <span className="text-3xl font-black text-emerald-500 mt-1.5 block">
                      {loading ? '...' : (summary?.active_clients ?? 0)}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold border border-emerald-100">
                    ✅
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
                    <span className="text-3xl font-black text-aim-gold mt-1.5 block">
                      {loading ? '...' : `₹${(summary?.total_revenue ?? 0).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-500 font-bold border border-yellow-100">
                    ₹
                  </div>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by ID, name, email, product, or partner name..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Clients Table Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Client ID</th>
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4">Product Instance</th>
                        <th className="px-6 py-4">Attributed Partner</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Processing Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="text-center py-10 font-bold">
                            <span className="inline-block animate-spin mr-2">🔄</span> Loading clients list...
                          </td>
                        </tr>
                      ) : filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-slate-500">{client.client_id}</td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800 text-sm">{client.client_name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{client.email || '—'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase tracking-wide">
                                {client.product_name?.substring(0, 32)}
                                {client.product_name?.length > 32 ? '...' : ''}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-600">{client.partner_name || '—'}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${
                                client.is_active
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border-rose-200'
                              }`}>
                                {client.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-black text-slate-800 text-sm">
                              ₹{Number(client.processing_fee || 0).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-12 text-slate-400">
                            <span className="text-3xl block">📁</span>
                            <p className="font-bold mt-2">No clients found matching search</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 3: Follow Up */}
          {activePageTab === 'follow_up' && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3.5">
              <span className="text-4xl">📞</span>
              <h4 className="text-base font-bold text-slate-800">Follow Up Reminders</h4>
              <p className="text-xs text-slate-400 font-medium max-w-sm leading-relaxed font-sans">
                Active follow-up schedules, client feedback timelines, and partner support logs will be displayed here.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AdminUsers