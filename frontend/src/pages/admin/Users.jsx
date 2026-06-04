import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { getAdminClients } from '../../api/admin/partners'

const AdminUsers = () => {
  const [clients, setClients] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/50 pb-4.5 gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Manage Clients</h1>
            <p className="text-sm font-semibold text-slate-400 mt-1">
              View and track client accounts, subscription software instances, attributed partners, and billing fees.
            </p>
          </div>
          <button
            onClick={fetchClients}
            disabled={loading}
            className="px-4 py-2 border border-slate-200 hover:border-[#38b34a] hover:bg-[#38b34a]/5 hover:text-[#38b34a] bg-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer text-slate-600 shadow-sm"
          >
            {loading ? 'Refreshing...' : 'Refresh Clients'}
          </button>
        </div>

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
    </>
  )
}

export default AdminUsers