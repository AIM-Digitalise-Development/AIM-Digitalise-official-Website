import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { getAdminProposals, sendProposalEmail } from '../../api/proposals'
import officialBrochureImg from '../../assets/doc/OfficialBrochure.jpg'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'

const AdminProposals = () => {
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'PENDING' | 'SENT'
  const [sendingId, setSendingId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [selectedProposal, setSelectedProposal] = useState(null)

  const fetchProposals = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAdminProposals()
      if (res && res.data) {
        setProposals(Array.isArray(res.data) ? res.data : [])
      } else if (Array.isArray(res)) {
        setProposals(res)
      } else {
        setProposals([])
      }
    } catch (err) {
      console.error('Failed to fetch proposals:', err)
      setError(err.message || 'Failed to load proposals list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [])

  // Action: Send Proposal Email
  const handleSendEmail = async (proposal) => {
    setSendingId(proposal.id)
    try {
      const res = await sendProposalEmail(proposal.id)
      const now = new Date().toISOString()
      const updatedList = proposals.map(p =>
        p.id === proposal.id
          ? { ...p, email_sent: true, sent_at: now, updated_at: now }
          : p
      )
      setProposals(updatedList)

      // Also update selected proposal if open in drawer
      if (selectedProposal && selectedProposal.id === proposal.id) {
        setSelectedProposal(prev => ({
          ...prev,
          email_sent: true,
          sent_at: now,
          updated_at: now,
        }))
      }

      setToastMessage({
        type: 'success',
        text: res?.message || `Proposal email successfully dispatched to ${proposal.email}!`
      })
    } catch (err) {
      setToastMessage({
        type: 'error',
        text: err.message || `Failed to dispatch proposal email to ${proposal.email}`
      })
    } finally {
      setSendingId(null)
      setTimeout(() => setToastMessage(null), 5000)
    }
  }

  // Handle PDF view/download
  const handleDownloadProposalPdf = (proposal) => {
    if (proposal.proposal_letter_path && !proposal.proposal_letter_path.includes('proposal_')) {
      const pdfUrl = proposal.proposal_letter_path.startsWith('http')
        ? proposal.proposal_letter_path
        : `${API_BASE_URL.replace('/api', '')}/${proposal.proposal_letter_path}`
      window.open(pdfUrl, '_blank')
    } else {
      const link = document.createElement('a')
      link.href = officialBrochureImg
      link.download = `NEXGN_Proposal_${proposal.school_name.replace(/\s+/g, '_')}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Stats calculation
  const totalCount = proposals.length
  const pendingCount = proposals.filter(p => !p.email_sent).length
  const sentCount = proposals.filter(p => p.email_sent).length
  const todayDateStr = new Date().toISOString().split('T')[0]
  const todayCount = proposals.filter(p => (p.created_at || '').startsWith(todayDateStr)).length

  // Filtered proposals
  const filteredProposals = proposals.filter(p => {
    const term = searchTerm.toLowerCase().trim()
    const matchesSearch =
      !term ||
      (p.school_name && p.school_name.toLowerCase().includes(term)) ||
      (p.principal_name && p.principal_name.toLowerCase().includes(term)) ||
      (p.email && p.email.toLowerCase().includes(term)) ||
      (p.contact_no && p.contact_no.toLowerCase().includes(term)) ||
      (p.address && p.address.toLowerCase().includes(term))

    if (statusFilter === 'PENDING') return matchesSearch && !p.email_sent
    if (statusFilter === 'SENT') return matchesSearch && p.email_sent
    return matchesSearch
  })

  return (
    <>
      <Helmet>
        <title>Proposals Management | Admin Panel</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Toast Notification Alert */}
        {toastMessage && (
          <div
            className={`p-4 rounded-2xl border shadow-lg flex items-center justify-between gap-3 text-sm font-semibold transition-all ${toastMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{toastMessage.type === 'success' ? '✉️' : '⚠️'}</span>
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-2 gap-3 min-h-[48px]">
          <div>
            <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Proposals Management</h1>

          </div>

          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">NEXGN SaaS Institutional Sales Desk</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProposals}
              disabled={loading}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className={loading ? 'animate-spin inline-block' : ''}>🔄</span>
              <span>Refresh</span>
            </button>
            <span className="px-3.5 py-2 border border-emerald-200 bg-emerald-50/80 rounded-xl text-xs font-bold text-[#38b34a] shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#38b34a] animate-pulse" />
              <span>Live Proposals</span>
            </span>
          </div>
        </div>

        {/* Pending Dispatch Banner Alert */}
        {pendingCount > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-md">
                ⚡
              </div>
              <div>
                <h4 className="text-sm font-black text-[#1e3e6b]">
                  {pendingCount} Proposal {pendingCount === 1 ? 'Request Requires' : 'Requests Require'} Email Dispatch
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  Clients have verified their email ID. Click &ldquo;Send Email ✉️&rdquo; beside any pending institution to transmit their official proposal.
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow"
            >
              View Pending ({pendingCount})
            </button>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Requests</span>
              <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
                📑
              </span>
            </div>
            <div className="text-3xl font-black text-[#1e3e6b]">{loading ? '...' : totalCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">All submitted website proposals</div>
          </div>

          <div
            onClick={() => setStatusFilter('PENDING')}
            className="bg-white rounded-3xl border border-amber-200/90 p-5 shadow-sm space-y-2 cursor-pointer hover:border-amber-400 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Dispatch</span>
              <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform">
                ⏳
              </span>
            </div>
            <div className="text-3xl font-black text-amber-600">{loading ? '...' : pendingCount}</div>
            <div className="text-[11px] font-semibold text-amber-700">Awaiting admin email dispatch</div>
          </div>

          <div
            onClick={() => setStatusFilter('SENT')}
            className="bg-white rounded-3xl border border-emerald-200/90 p-5 shadow-sm space-y-2 cursor-pointer hover:border-emerald-400 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Emails Dispatched</span>
              <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform">
                ✓
              </span>
            </div>
            <div className="text-3xl font-black text-[#38b34a]">{loading ? '...' : sentCount}</div>
            <div className="text-[11px] font-semibold text-emerald-700">Commercial PDF delivered to client</div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Inquiries</span>
              <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg font-bold">
                📅
              </span>
            </div>
            <div className="text-3xl font-black text-purple-700">{loading ? '...' : todayCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Submitted today ({todayDateStr})</div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-5">

          {/* Controls Bar: Search & Status Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by School Name, Contact Person, Phone..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#38b34a] focus:bg-white transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1">Filter:</span>
              {[
                { key: 'ALL', label: `All (${totalCount})` },
                { key: 'PENDING', label: `Pending (${pendingCount})` },
                { key: 'SENT', label: `Sent (${sentCount})` },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${statusFilter === f.key
                      ? 'bg-[#1e3e6b] text-white border-[#1e3e6b] shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Focused Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 rounded-l-xl w-16"># ID</th>
                  <th className="py-3.5 px-4">School / College Name</th>
                  <th className="py-3.5 px-4">Contact Person Name &amp; Number</th>
                  <th className="py-3.5 px-4">Delivery Status</th>
                  <th className="py-3.5 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                      <span className="animate-spin inline-block mr-2 text-base">🔄</span>
                      Loading proposals database...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-red-500 font-bold">
                      ⚠️ {error}
                    </td>
                  </tr>
                ) : filteredProposals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      No proposal requests match the selected search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProposals.map((proposal) => {
                    const isSending = sendingId === proposal.id
                    const createdFormatted = proposal.created_at
                      ? new Date(proposal.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : '—'

                    return (
                      <tr key={proposal.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* 1. ID */}
                        <td className="py-4 px-4 font-mono font-bold text-slate-500">
                          #{proposal.id}
                        </td>

                        {/* 2. School / College Name */}
                        <td className="py-4 px-4">
                          <div className="font-black text-[#1e3e6b] text-sm group-hover:text-[#38b34a] transition-colors">
                            {proposal.school_name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <span>📅 Requested:</span>
                            <span className="font-mono text-slate-500">{createdFormatted}</span>
                          </div>
                        </td>

                        {/* 3. Contact Person & Number */}
                        <td className="py-4 px-4 space-y-1">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                            <span>👤</span>
                            <span>{proposal.principal_name}</span>
                          </div>
                          <div className="text-xs font-mono font-bold text-slate-600 flex items-center gap-1.5">
                            <span>📞</span>
                            <a href={`tel:${proposal.contact_no}`} className="hover:text-blue-600 hover:underline">
                              {proposal.contact_no}
                            </a>
                          </div>
                        </td>

                        {/* 4. Delivery Status */}
                        <td className="py-4 px-4">
                          {proposal.email_sent ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200 shadow-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                SENT
                              </span>
                              {proposal.sent_at && (
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {new Date(proposal.sent_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider border border-amber-200 shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              PENDING
                            </span>
                          )}
                        </td>

                        {/* 5. Actions: Eye button & Send Option */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Eye button (Opens side door drawer) */}
                            <button
                              type="button"
                              onClick={() => setSelectedProposal(proposal)}
                              className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-200 transition-all text-sm font-bold cursor-pointer shadow-xs active:scale-95"
                              title="View Full Institution & Campus Details (Opens Side Panel)"
                            >
                              👁️
                            </button>

                            {/* Send / Resend Email Option */}
                            <button
                              type="button"
                              disabled={isSending}
                              onClick={() => handleSendEmail(proposal)}
                              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${proposal.email_sent
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                                  : 'bg-gradient-to-r from-emerald-600 to-[#38b34a] hover:from-emerald-700 hover:to-emerald-600 text-white shadow-emerald-500/20'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {isSending ? (
                                <>
                                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                                  <span>Sending...</span>
                                </>
                              ) : (
                                <>
                                  <span>✉️</span>
                                  <span>{proposal.email_sent ? 'Resend' : 'Send'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>
              Showing <strong className="text-slate-800">{filteredProposals.length}</strong> of <strong className="text-slate-800">{totalCount}</strong> proposal requests
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Sent: {sentCount}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Pending: {pendingCount}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            SIDE DOOR DRAWER: Opens smoothly from the right side
        ════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {selectedProposal && (
            <div className="fixed inset-0 z-[100] overflow-hidden">
              {/* Dark Blur Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setSelectedProposal(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
              />

              {/* Sliding Door Drawer Container */}
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 26, stiffness: 240 }}
                  className="pointer-events-auto w-screen max-w-lg"
                >
                  <div className="flex h-full flex-col overflow-y-auto bg-white shadow-2xl border-l border-slate-200 text-slate-800 text-xs">

                    {/* Drawer Top Header */}
                    <div className="p-6 border-b border-slate-200 bg-slate-50/70 shrink-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#1e3e6b]/10 text-[#1e3e6b] text-[10px] font-black uppercase tracking-wider font-mono">
                            Proposal #{selectedProposal.id}
                          </div>
                          <h2 className="text-xl font-black text-[#1e3e6b] leading-tight">
                            {selectedProposal.school_name}
                          </h2>
                          <p className="text-xs text-slate-500 font-medium">Complete Institution &amp; Commercial Proposal Record</p>
                        </div>
                        <button
                          onClick={() => setSelectedProposal(null)}
                          className="w-9 h-9 rounded-xl bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer shadow-xs"
                          aria-label="Close Drawer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Status pill strip */}
                      <div className="mt-4 flex items-center gap-2">
                        {selectedProposal.email_sent ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            Email Dispatched
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            Pending Admin Dispatch
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-mono">
                          {selectedProposal.created_at ? new Date(selectedProposal.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </span>
                      </div>
                    </div>

                    {/* Drawer Content Body */}
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">

                      {/* Section 1: Contact Person & Communication */}
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-1.5 font-sans">
                          Contact Person Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Principal / Trustee Name</span>
                            <span className="font-extrabold text-slate-800 text-sm block">👤 {selectedProposal.principal_name}</span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Contact Number</span>
                            <a
                              href={`tel:${selectedProposal.contact_no}`}
                              className="font-mono font-bold text-slate-800 text-sm block hover:text-blue-600 hover:underline"
                            >
                              📞 {selectedProposal.contact_no}
                            </a>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1 sm:col-span-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Verified Email ID</span>
                              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ OTP Verified</span>
                            </div>
                            <a
                              href={`mailto:${selectedProposal.email}`}
                              className="font-mono font-bold text-blue-600 text-sm block hover:underline"
                            >
                              ✉️ {selectedProposal.email}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Campus Address & Location */}
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-1.5 font-sans">
                          Campus &amp; Institutional Address
                        </h3>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                          <div className="flex items-start gap-2.5">
                            <span className="text-lg shrink-0">🏛️</span>
                            <div>
                              <div className="font-bold text-slate-800">{selectedProposal.school_name}</div>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedProposal.address}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Proposal Document & Commercial Terms */}
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-1.5 font-sans">
                          Commercial Proposal Letter &amp; PDF
                        </h3>
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-emerald-200/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-md">
                                📑
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800">NEXGN Official Commercial Proposal</h4>
                                <p className="text-[11px] text-slate-500">Includes pricing tier, SLA, and software scope</p>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownloadProposalPdf(selectedProposal)}
                            className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-300"
                          >
                            <span>📥</span>
                            <span>Download / Preview Proposal Document</span>
                          </button>
                        </div>
                      </div>

                      {/* Section 4: Email Dispatch History */}
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-1.5 font-sans">
                          Dispatch Timeline
                        </h3>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5 font-mono text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Website Request Date:</span>
                            <span className="font-bold text-slate-700">
                              {selectedProposal.created_at ? new Date(selectedProposal.created_at).toLocaleString('en-IN') : '—'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Email Delivery:</span>
                            <span className={`font-bold ${selectedProposal.email_sent ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {selectedProposal.email_sent ? 'SENT' : 'PENDING DISPATCH'}
                            </span>
                          </div>
                          {selectedProposal.sent_at && (
                            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                              <span className="text-slate-500">Dispatched Timestamp:</span>
                              <span className="font-bold text-emerald-700">
                                {new Date(selectedProposal.sent_at).toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Drawer Bottom Actions */}
                    <div className="p-6 border-t border-slate-200 bg-white shrink-0 space-y-2">
                      <button
                        type="button"
                        disabled={sendingId === selectedProposal.id}
                        onClick={() => handleSendEmail(selectedProposal)}
                        className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 ${selectedProposal.email_sent
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-gradient-to-r from-emerald-600 to-[#38b34a] hover:from-emerald-700 hover:to-emerald-600 text-white shadow-emerald-500/20'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {sendingId === selectedProposal.id ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                            <span>Dispatching Email to {selectedProposal.email}...</span>
                          </>
                        ) : (
                          <>
                            <span>✉️</span>
                            <span>{selectedProposal.email_sent ? 'Resend Proposal Email' : 'Send Proposal Email to Client'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default AdminProposals
