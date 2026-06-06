import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { getAdminPartners, approvePartner, rejectPartner, getAdminPartnerDocuments } from '../../api/admin/partners'

const AdminPartners = () => {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Selection and Modal State
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [activeTab, setActiveTab] = useState('show_partner') // 'show_partner' | 'partner_sales' | 'partner_commission' | 'partner_reports'
  const [activeSubTab, setActiveSubTab] = useState('info') // 'info' | 'docs'
  const [documentViewer, setDocumentViewer] = useState(null) // { name, filename, label }

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Helper to build document download/view URL from Laravel storage host
  const getDocumentUrl = (filePath) => {
    if (!filePath) return ''
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath
    const base = import.meta.env.VITE_PARTNER_API_URL || 'https://api.nexgn.in/api'
    const host = base.replace(/\/api$/, '')

    // Check if path has /storage/ prefix
    if (filePath.startsWith('storage/') || filePath.startsWith('/storage/')) {
      return `${host}${filePath.startsWith('/') ? '' : '/'}${filePath}`
    }
    return `${host}/storage/${filePath}`
  }

  const getDocumentFilename = (partner, key) => {
    if (!partner) return ''
    return partner[key] || partner.documents?.[key] || ''
  }

  const isPdf = (filename) => {
    if (!filename) return false
    return filename.toLowerCase().endsWith('.pdf')
  }

  const isImage = (filename) => {
    if (!filename) return false
    const ext = filename.toLowerCase().split('.').pop()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  }

  // Fetch partners on load
  const fetchPartners = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getAdminPartners()
      if (res.data) {
        // Extract partners array supporting all possible response shapes
        const list = res.data.data?.all_partners || res.data.data || res.data.partners || (Array.isArray(res.data) ? res.data : [])
        setPartners(Array.isArray(list) ? list : [])
      } else {
        setError('No data received from the backend API.')
      }
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.message || err.message
      setError(`Failed to connect to backend: ${msg}.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  // Approve partner — POST /api/admin/partners/{id}/approve
  const handleApprove = async (id) => {
    try {
      const res = await approvePartner(id)
      if (res.data?.success) {
        // Update locally
        setPartners(prev => prev.map(p => p.id === id ? { ...p, registration_status: 'active', is_active: true } : p))
        if (selectedPartner?.id === id) {
          setSelectedPartner(prev => ({ ...prev, registration_status: 'active', is_active: true }))
        }
      } else {
        alert(res.data?.message || 'Approval failed.')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message
      alert(`Cannot approve: ${msg}`)
    }
  }

  // Reject partner — POST /api/admin/partners/{id}/reject  (requires reason)
  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason (required):')
    if (!reason || !reason.trim()) {
      alert('Rejection reason is required.')
      return
    }
    try {
      const res = await rejectPartner(id, reason.trim())
      if (res.data?.success) {
        setPartners(prev => prev.map(p => p.id === id ? { ...p, registration_status: 'rejected', is_active: false } : p))
        if (selectedPartner?.id === id) {
          setSelectedPartner(prev => ({ ...prev, registration_status: 'rejected', is_active: false }))
        }
      } else {
        alert(res.data?.message || 'Rejection failed.')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message
      alert(`Cannot reject: ${msg}`)
    }
  }

  // Filtered partners
  const filteredPartners = partners.filter(p => {
    const name = p.partner_name || p.name || ''
    const org = p.organization_name || p.organization || ''
    const email = p.email || ''
    const pid = p.partner_id || ''

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      org.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      pid.toLowerCase().includes(search.toLowerCase())

    const status = p.registration_status || 'pending'
    const matchesStatus =
      statusFilter === 'All' ||
      status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Stats computation
  const totalCount = partners.length
  const pendingCount = partners.filter(p => (p.registration_status || 'pending') === 'pending').length
  const activeCount = partners.filter(p => p.registration_status === 'active').length

  const getStatusBadge = (status) => {
    const norm = status?.toLowerCase() || 'pending'
    if (norm === 'active') return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (norm === 'pending') return 'bg-amber-100 text-amber-800 border-amber-200'
    return 'bg-rose-100 text-rose-800 border-rose-200'
  }

  return (
    <>
      <Helmet>
        <title>Manage Partners | Admin Panel</title>
      </Helmet>

      <div className="space-y-6 select-none animate-fade-in text-slate-700">
        {/* Header containing page title, centered company header */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          {/* Left Side: Page Title */}
          <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Partner</h1>

          {/* Center: Company Banner */}
          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>

          <div className="w-48"></div>
        </div>

        {/* White container card for tabs and active page content */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
          
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            <button
              onClick={() => setActiveTab('show_partner')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'show_partner'
                  ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Show Partner
            </button>
            <button
              onClick={() => setActiveTab('partner_sales')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'partner_sales'
                  ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Partner Sales
            </button>
            <button
              onClick={() => setActiveTab('partner_commission')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'partner_commission'
                  ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Partner Commission
            </button>
            <button
              onClick={() => setActiveTab('partner_reports')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'partner_reports'
                  ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Partner Reports
            </button>
          </div>

          {/* Tab 1 Content: Show Partner */}
          {activeTab === 'show_partner' && (
            <div className="space-y-6">
              {/* Card Subheader */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Show Partner</span>
                </h3>
              </div>

              {loading ? (
                <div className="text-center py-10 font-bold">
                  <span className="inline-block animate-spin mr-2">🔄</span> Loading partners data...
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
                  {error}
                </div>
              ) : partners.length > 0 ? (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Applications</span>
                        <span className="text-3xl font-black text-slate-800 mt-1.5 block">{totalCount}</span>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 font-bold border border-blue-100">
                        👥
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Review</span>
                        <span className="text-3xl font-black text-amber-500 mt-1.5 block">{pendingCount}</span>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 font-bold border border-amber-100">
                        ⏳
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Partners</span>
                        <span className="text-3xl font-black text-emerald-500 mt-1.5 block">{activeCount}</span>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold border border-emerald-100">
                        ✅
                      </div>
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by ID, name, organization, or email..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-sans"
                      />
                    </div>

                    <div className="w-full md:w-48 shrink-0">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-semibold"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  {/* Partners Table Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="px-6 py-4">Partner ID</th>
                            <th className="px-6 py-4">Partner Name</th>
                            <th className="px-6 py-4">Organization</th>
                            <th className="px-6 py-4">Contact Info</th>
                            <th className="px-6 py-4">RM Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {filteredPartners.length > 0 ? (
                            filteredPartners.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold text-slate-500">{p.partner_id}</td>
                                <td className="px-6 py-4">
                                  <p className="font-bold text-slate-800 text-sm">{p.partner_name}</p>
                                  <p className="text-[10px] text-slate-400">{p.email}</p>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-600">{p.organization_name}</td>
                                <td className="px-6 py-4 font-medium">{p.contact_no}</td>
                                <td className="px-6 py-4 text-slate-500">{p.rm_name}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${getStatusBadge(p.registration_status)}`}>
                                    {p.registration_status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() => { setSelectedPartner(p); setActiveSubTab('info'); setDocumentViewer(null) }}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#38b34a] hover:bg-[#38b34a]/5 hover:text-[#38b34a] transition-all font-bold cursor-pointer"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center py-12 text-slate-400">
                                <span className="text-3xl block">📁</span>
                                <p className="font-bold mt-2">No partners found matching criteria</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty state matching Screenshot 4 exactly */
                <div className="border border-slate-200/60 bg-slate-50/50 rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-4 shadow-inner min-h-[260px]">
                  {/* Waving hand icon */}
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/60 shadow-sm flex items-center justify-center shrink-0">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
                      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
                      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4.5" />
                      <path d="M6 10V8a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v9a7 7 0 0 0 7 7h3a7 7 0 0 0 7-7v-6" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-400 font-sans">
                    List of all registered partners will be displayed here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Inactive Tab Placeholders */}
          {activeTab !== 'show_partner' && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3.5">
              <span className="text-4xl">🤝</span>
              <h4 className="text-base font-bold text-slate-800 capitalize">{activeTab.replace('partner_', 'Partner ')} Records</h4>
              <p className="text-xs text-slate-400 font-medium max-w-sm leading-relaxed font-sans">
                Partner sales statistics, commission ratios, reports logs, and payout balances will be displayed here.
              </p>
            </div>
          )}

        </div>

        {/* Detailed Modal / Sidebar Drawer */}
        {selectedPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedPartner(null)} />

            {/* Modal Box */}
            <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl z-10 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black text-slate-800">{selectedPartner.partner_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusBadge(selectedPartner.registration_status)}`}>
                      {selectedPartner.registration_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{selectedPartner.partner_id} • {selectedPartner.organization_name}</p>
                </div>
                <button onClick={() => setSelectedPartner(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
                     {/* Tabs */}
              <div className="flex gap-4 border-b border-slate-100 my-4 shrink-0">
                <button
                  onClick={() => { setActiveSubTab('info'); setDocumentViewer(null) }}
                  className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition ${activeSubTab === 'info' ? 'border-[#38b34a] text-[#38b34a]' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Registration Info
                </button>
                <button
                  onClick={() => setActiveSubTab('docs')}
                  className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition ${activeSubTab === 'docs' ? 'border-[#38b34a] text-[#38b34a]' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Submitted Documents
                </button>
              </div>

              {/* Body Content - Scrollable */}
              <div className="flex-grow overflow-y-auto min-h-0 py-2 space-y-4">
                {activeSubTab === 'info' ? (
                  <div className="space-y-4 text-xs">
                    {/* General section */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">RM Name</span>
                        <span className="text-slate-800 font-bold text-sm">{selectedPartner.rm_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Contact No</span>
                        <span className="text-slate-800 font-bold text-sm">{selectedPartner.contact_no}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Email Address</span>
                        <span className="text-slate-800 font-semibold">{selectedPartner.email}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Registration Date</span>
                        <span className="text-slate-800 font-semibold">{new Date(selectedPartner.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                      <span className="text-[10px] text-[#ff6600] uppercase tracking-wider font-bold block">Address Details</span>
                      <p className="text-slate-700 font-semibold">{selectedPartner.address_line1}</p>
                      {selectedPartner.address_line2 && <p className="text-slate-700">{selectedPartner.address_line2}</p>}
                      <div className="grid grid-cols-3 gap-2 pt-1.5 text-[11px] text-slate-500 font-semibold">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-medium">District</span>
                          {selectedPartner.district}
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-medium">State</span>
                          {selectedPartner.state}
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-medium">Pin Code</span>
                          {selectedPartner.pin_code}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Document buttons list */}
                    <div className="grid grid-cols-2 gap-3.5">
                      {[
                        { key: 'pan_card_path', label: 'PAN Card Doc' },
                        { key: 'id_proof_path', label: 'ID Proof Doc' },
                        { key: 'organization_proof_path', label: 'Organization Proof' },
                        { key: 'signed_agreement_path', label: 'Signed Contract PDF' }
                      ].map((doc) => {
                        const filename = getDocumentFilename(selectedPartner, doc.key)
                        const isSelected = documentViewer?.name === doc.key

                        return (
                          <button
                            key={doc.key}
                            onClick={() => setDocumentViewer({ name: doc.key, filename, label: doc.label })}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${isSelected
                                ? 'border-[#38b34a] bg-[#38b34a]/5'
                                : filename
                                  ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                  : 'border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed'
                              }`}
                            disabled={!filename}
                          >
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">{doc.label}</span>
                              <span className={`text-xs font-mono mt-0.5 block truncate max-w-[180px] ${filename ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                {filename ? filename.split('/').pop() : 'Not uploaded'}
                              </span>
                            </div>
                            <span className="text-xl">{filename ? '📁' : '❌'}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Document Viewer Frame */}
                    {documentViewer && documentViewer.filename && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3.5 animate-fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff6600]">{documentViewer.label} Preview</h4>
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{documentViewer.filename}</span>
                        </div>

                        {/* Real Document Viewer Canvas */}
                        <div className="rounded-lg bg-white border border-slate-200/60 shadow-inner overflow-hidden flex flex-col items-center justify-center p-2">
                          {isPdf(documentViewer.filename) ? (
                            <embed
                              src={getDocumentUrl(documentViewer.filename)}
                              type="application/pdf"
                              className="w-full h-80 rounded-md"
                            />
                          ) : isImage(documentViewer.filename) ? (
                            <img
                              src={getDocumentUrl(documentViewer.filename)}
                              alt={documentViewer.label}
                              className="max-h-80 max-w-full object-contain rounded-md"
                            />
                          ) : (
                            <div className="py-10 text-center space-y-2">
                              <span className="text-4xl">📄</span>
                              <p className="text-xs font-bold text-slate-700">{documentViewer.label}</p>
                              <p className="text-[10px] text-slate-400">File format cannot be previewed inline.</p>
                            </div>
                          )}

                          <div className="w-full pt-3 border-t border-slate-100 flex justify-end gap-2 px-2 shrink-0 mt-2">
                            <a
                              href={getDocumentUrl(documentViewer.filename)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-white font-bold text-[10px] hover:bg-slate-900 transition flex items-center gap-1.5 cursor-pointer text-center"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Open in New Tab
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-between items-center gap-3.5 shrink-0">
                <div className="flex gap-2 flex-wrap">
                  {/* Approve button — only if not already active */}
                  {selectedPartner.registration_status !== 'active' && (
                    <button
                      onClick={() => handleApprove(selectedPartner.id)}
                      className="px-4 py-2 rounded-xl bg-[#38b34a] hover:bg-[#2d913c] text-white text-xs font-bold shadow-sm shadow-[#38b34a]/15 hover:shadow-[#38b34a]/30 transition cursor-pointer"
                    >
                      ✅ Approve &amp; Activate
                    </button>
                  )}
                  {/* Reject button — only if not already rejected */}
                  {selectedPartner.registration_status !== 'rejected' && (
                    <button
                      onClick={() => handleReject(selectedPartner.id)}
                      className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 text-xs font-bold transition cursor-pointer"
                    >
                      ❌ Reject Partner
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default AdminPartners
