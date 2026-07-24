import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../store/authStore'

const MOCK_SUBMISSIONS = [
  {
    id: 'KYC-1721029193291',
    client_id: 'AIM8243196',
    legal_name: 'Silver Oak Global School',
    website_url: 'https://silveroakschool.in',
    legal_business_type: 'Society',
    entity_pan: 'SLOKS9018A',
    signatory_name: 'Mrs. Geeta Kapur',
    designation: 'Secretary',
    aadhaar_number: '987654123019',
    beneficiary_name: 'SILVER OAK SOCIETY SCHOOL AC',
    account_number: '30090812903',
    ifsc_code: 'HDFC0000210',
    bank_name: 'HDFC Bank Ltd.',
    preferred_gateway: 'Razorpay',
    pan_card_doc: 'PAN_Copy_SilverOak.pdf',
    cancelled_cheque_doc: 'Cheque_SilverOak.pdf',
    trust_deed_doc: 'Trust_Deed_SilverOak.pdf',
    aadhaar_doc: 'Aadhaar_Mrs_Geeta.pdf',
    status: 'approved',
    created_at: '2026-07-10T11:45:00.000Z',
    admin_notes: 'All document checks passed. Razorpay sub-merchant id generated.'
  },
  {
    id: 'KYC-1721034182903',
    client_id: 'AIM9820138',
    legal_name: 'Vikas Junior College',
    website_url: 'https://vikascollege.org',
    legal_business_type: 'Educational Trust / NGO',
    entity_pan: 'VKEDU9903Z',
    signatory_name: 'Mr. Vikas Rao',
    designation: 'Principal Trustee',
    aadhaar_number: '456012903482',
    beneficiary_name: 'VIKAS EDUCATIONAL FOUNDATION',
    account_number: '982710298371',
    ifsc_code: 'ICIC0000007',
    bank_name: 'ICICI Bank Ltd.',
    preferred_gateway: 'Razorpay',
    pan_card_doc: 'PAN_Vikas_Trust.pdf',
    cancelled_cheque_doc: 'Cancelled_Cheque_Vikas.pdf',
    trust_deed_doc: 'Trust_Deed_Vikas.pdf',
    aadhaar_doc: 'Aadhaar_Mr_Vikas.pdf',
    status: 'rejected',
    created_at: '2026-07-12T09:30:00.000Z',
    admin_notes: 'PAN card upload is blurry. Trust registration certificate was missing. Please re-upload.'
  }
]

const AdminPgKyc = () => {
  const { token } = useAuthStore()
  const adminToken = token || localStorage.getItem('access_token')

  const [submissions, setSubmissions] = useState([])
  const [selectedKyc, setSelectedKyc] = useState(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  // Overall Stats state
  const [pgKycStats, setPgKycStats] = useState({
    total: 0,
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0
  })

  // Fetch all KYC Applications
  const fetchSubmissions = async () => {
    if (!adminToken) return
    setLoading(true)
    try {
      let queryParams = new URLSearchParams()
      if (search) queryParams.append('search', search)
      if (statusFilter && statusFilter !== 'All') queryParams.append('status', statusFilter)

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'
      const response = await fetch(`${API_URL}/admin/pg-kyc/applications?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const result = await response.json()
      if (result.success) {
        setSubmissions(result.data || [])
      } else {
        throw new Error(result.message || 'Error response')
      }
    } catch (err) {
      console.warn('API error fetching PG-KYC submissions, falling back to mock data:', err)
      let list = [...MOCK_SUBMISSIONS]
      if (search) {
        list = list.filter(s =>
          s.legal_name.toLowerCase().includes(search.toLowerCase()) ||
          s.signatory_name.toLowerCase().includes(search.toLowerCase())
        )
      }
      if (statusFilter && statusFilter !== 'All') {
        list = list.filter(s => s.status === statusFilter)
      }
      setSubmissions(list)
    } finally {
      setLoading(false)
    }
  }

  // Fetch overall stats counts
  const fetchKycStats = async () => {
    if (!adminToken) return
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'
      const response = await fetch(`${API_URL}/admin/pg-kyc/stats`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const result = await response.json()
      if (result.success && result.data) {
        setPgKycStats(result.data)
      }
    } catch (err) {
      console.warn('API error fetching PG-KYC stats, calculating from mock data:', err)
      const stats = {
        total: MOCK_SUBMISSIONS.length,
        pending: MOCK_SUBMISSIONS.filter(s => s.status === 'pending').length,
        under_review: MOCK_SUBMISSIONS.filter(s => s.status === 'under_review').length,
        approved: MOCK_SUBMISSIONS.filter(s => s.status === 'approved').length,
        rejected: MOCK_SUBMISSIONS.filter(s => s.status === 'rejected').length
      }
      setPgKycStats(stats)
    }
  }

  useEffect(() => {
    fetchSubmissions()
    fetchKycStats()
  }, [adminToken, search, statusFilter])

  // Update status (e.g. approved / rejected / under_review)
  const handleUpdateKycStatus = async (kycId, newStatus) => {
    if (!adminToken) return
    setUpdating(true)
    let success = false
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'
      const response = await fetch(`${API_URL}/admin/pg-kyc/applications/${kycId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: reviewNotes
        })
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          success = true
          alert(`KYC Onboarding status updated to ${newStatus.toUpperCase()}`)
          setShowDrawer(false)
          setSelectedKyc(null)
          setReviewNotes('')
          fetchSubmissions()
          fetchKycStats()
        }
      }
    } catch (err) {
      console.warn('API error updating KYC status:', err)
    }

    if (!success) {
      const idx = MOCK_SUBMISSIONS.findIndex(s => s.id === kycId)
      if (idx > -1) {
        MOCK_SUBMISSIONS[idx].status = newStatus
        MOCK_SUBMISSIONS[idx].admin_notes = reviewNotes
      }
      alert(`KYC Onboarding status (mock) updated to ${newStatus.toUpperCase()}`)
      setShowDrawer(false)
      setSelectedKyc(null)
      setReviewNotes('')
      fetchSubmissions()
      fetchKycStats()
    }
    setUpdating(false)
  }

  return (
    <>
      <Helmet>
        <title>Client PG-KYC Management | Admin Portal</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">PG-KYC Applications</h1>
          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>
          <div className="w-40 flex justify-end">
            <button onClick={() => { fetchSubmissions(); fetchKycStats(); }} className="px-4 py-2 border border-slate-200 hover:border-blue-600 hover:text-blue-600 bg-white rounded-xl text-xs font-bold cursor-pointer shadow-sm">
              ↺ Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Total Submissions</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block font-mono">{pgKycStats.total}</span>
          </div>
          <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-amber-500 uppercase block tracking-wider">Pending Review</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block font-mono">{pgKycStats.pending}</span>
          </div>
          <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-emerald-500 uppercase block tracking-wider">Approved</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">{pgKycStats.approved}</span>
          </div>
          <div className="bg-rose-50/50 border border-rose-100 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-rose-500 uppercase block tracking-wider">Rejected</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block font-mono">{pgKycStats.rejected}</span>
          </div>
        </div>

        {/* Main Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-end mb-6 text-xs font-semibold">
            <div className="flex-1 w-full space-y-1">
              <label className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Search Merchant</label>
              <input
                type="text"
                placeholder="Search by legal entity name or signatory..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-semibold"
              />
            </div>
            <div className="w-full sm:w-44 space-y-1">
              <label className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Review Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-semibold cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-16 bg-slate-50/20 rounded-2xl border border-slate-100 shadow-inner">
              <span className="inline-block animate-spin text-2xl">⏳</span>
              <p className="text-xs text-slate-400 font-bold mt-2">Loading applications list...</p>
            </div>
          )}

          {/* Table */}
          {!loading && submissions.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-slate-50/20 rounded-2xl border border-slate-100 shadow-inner">
              <span className="text-4xl block">🛡️</span>
              <p className="font-bold mt-2">No KYC Applications found</p>
            </div>
          ) : (
            !loading && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-5 py-4">Client ID</th>
                        <th className="px-5 py-4">Merchant Business Name</th>
                        <th className="px-5 py-4">Signatory Name</th>
                        <th className="px-5 py-4 text-center">Preferred Gateway</th>
                        <th className="px-5 py-4 text-center">Submitted Date</th>
                        <th className="px-5 py-4 text-center">Status</th>
                        <th className="px-5 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {submissions.map((kyc) => (
                        <tr key={kyc.id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4 font-mono font-bold text-slate-505">{kyc.client_id || kyc.id}</td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-800 text-sm">{kyc.legal_name || kyc.businessName}</p>
                            <a href={kyc.website_url || kyc.websiteUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 font-bold hover:underline">{kyc.website_url || kyc.websiteUrl}</a>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-800">{kyc.signatory_name || kyc.signatoryName}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{kyc.designation || kyc.signatoryDesignation}</p>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="px-2.5 py-1 rounded bg-[#e2e8f0] text-slate-700 font-bold text-[10px] uppercase">
                              {kyc.preferred_gateway || kyc.preferredGateway || 'Razorpay'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center text-slate-505">
                            {kyc.created_at ? new Date(kyc.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Just now')}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${
                              kyc.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                              kyc.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                              kyc.status === 'under_review' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                              'bg-rose-100 text-rose-800 border-rose-200'
                            }`}>
                              {kyc.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => { setSelectedKyc(kyc); setReviewNotes(kyc.admin_notes || kyc.adminNotes || ''); setShowDrawer(true) }}
                              className="px-3.5 py-1.5 bg-[#1e3e6b] hover:bg-[#152e51] text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors shadow-sm"
                            >
                              Review App
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>

        {/* DETAILS DRAWER */}
        <AnimatePresence>
          {showDrawer && selectedKyc && (
            <div className="fixed inset-0 z-50 flex items-center justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900"
                onClick={() => setShowDrawer(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="relative w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-hidden z-10 bg-white border-l border-slate-200"
              >
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between bg-slate-50 border-b border-slate-200">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">KYC Dossier Review</span>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">{selectedKyc.legal_name || selectedKyc.businessName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-blue-600 font-bold font-mono">{selectedKyc.client_id || selectedKyc.id}</span>
                      <span className="text-slate-300">•</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${
                        selectedKyc.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        selectedKyc.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        selectedKyc.status === 'under_review' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                        'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {selectedKyc.status}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setShowDrawer(false)} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-lg">✕</button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-xs text-left">
                  {/* Entity Profile */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-blue-600 uppercase tracking-wider block text-[10px]">Merchant Legal Identity</h4>
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Legal Entity Name</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedKyc.legal_name || selectedKyc.businessName}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Entity Type</span>
                        <p className="text-slate-800 font-semibold mt-0.5 capitalize">{selectedKyc.legal_business_type || selectedKyc.businessType}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Entity PAN ID</span>
                        <p className="text-slate-800 font-semibold mt-0.5 font-mono uppercase">{selectedKyc.entity_pan || selectedKyc.panNumber}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Website Domain</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedKyc.website_url || selectedKyc.websiteUrl}</p>
                      </div>
                    </div>
                  </div>

                  {/* Signatory Profile */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-blue-600 uppercase tracking-wider block text-[10px]">Authorized Signatory</h4>
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Full Name</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedKyc.signatory_name || selectedKyc.signatoryName}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Designation</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedKyc.designation || selectedKyc.signatoryDesignation}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Aadhaar Card ID</span>
                        <p className="text-slate-800 font-semibold mt-0.5 font-mono">{selectedKyc.aadhaar_number || selectedKyc.signatoryAadhaar}</p>
                      </div>
                    </div>
                  </div>

                  {/* Settlement Bank */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-blue-600 uppercase tracking-wider block text-[10px]">Settlement Bank Coordinates</h4>
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Beneficiary Holder</span>
                        <p className="text-slate-800 font-semibold mt-0.5 uppercase">{selectedKyc.beneficiary_name || selectedKyc.bankAccountName}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Bank Name</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedKyc.bank_name || selectedKyc.bankName}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Account Number</span>
                        <p className="text-slate-800 font-semibold mt-0.5 font-mono">{selectedKyc.account_number || selectedKyc.bankAccountNumber}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">IFSC Routing Code</span>
                        <p className="text-slate-800 font-semibold mt-0.5 font-mono uppercase">{selectedKyc.ifsc_code || selectedKyc.bankIfsc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Files Checklist */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-blue-600 uppercase tracking-wider block text-[10px]">Documents Verification Checklist</h4>
                    <div className="grid grid-cols-2 gap-3.5">
                      {/* Document 1: Trust PAN */}
                      <div className="p-3 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-700 text-[10px]">Legal PAN Document</p>
                          <p className="text-[8.5px] text-slate-400 font-mono truncate max-w-[130px]">{selectedKyc.pan_card_doc || 'pan_card_doc'}</p>
                        </div>
                        {selectedKyc.pan_card_doc_url || selectedKyc.pan_card_doc ? (
                          <a
                            href={selectedKyc.pan_card_doc_url || `https://api.nexgn.in/${selectedKyc.pan_card_doc}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-600 font-bold hover:underline shrink-0"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="text-[9px] text-slate-450 shrink-0">Not Attached</span>
                        )}
                      </div>

                      {/* Document 2: Cancelled Cheque */}
                      <div className="p-3 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-700 text-[10px]">Cancelled Cheque Copy</p>
                          <p className="text-[8.5px] text-slate-400 font-mono truncate max-w-[130px]">{selectedKyc.cancelled_cheque_doc || 'cancelled_cheque_doc'}</p>
                        </div>
                        {selectedKyc.cancelled_cheque_doc_url || selectedKyc.cancelled_cheque_doc ? (
                          <a
                            href={selectedKyc.cancelled_cheque_doc_url || `https://api.nexgn.in/${selectedKyc.cancelled_cheque_doc}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-600 font-bold hover:underline shrink-0"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="text-[9px] text-slate-450 shrink-0">Not Attached</span>
                        )}
                      </div>

                      {/* Document 3: Trust Deed */}
                      <div className="p-3 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-700 text-[10px]">Trust Deed Document</p>
                          <p className="text-[8.5px] text-slate-400 font-mono truncate max-w-[130px]">{selectedKyc.trust_deed_doc || 'trust_deed_doc'}</p>
                        </div>
                        {selectedKyc.trust_deed_doc_url || selectedKyc.trust_deed_doc ? (
                          <a
                            href={selectedKyc.trust_deed_doc_url || `https://api.nexgn.in/${selectedKyc.trust_deed_doc}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-600 font-bold hover:underline shrink-0"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="text-[9px] text-slate-450 shrink-0">Not Attached</span>
                        )}
                      </div>

                      {/* Document 4: Signatory Aadhaar */}
                      <div className="p-3 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-700 text-[10px]">Signatory Aadhaar ID</p>
                          <p className="text-[8.5px] text-slate-400 font-mono truncate max-w-[130px]">{selectedKyc.aadhaar_doc || 'aadhaar_doc'}</p>
                        </div>
                        {selectedKyc.aadhaar_doc_url || selectedKyc.aadhaar_doc ? (
                          <a
                            href={selectedKyc.aadhaar_doc_url || `https://api.nexgn.in/${selectedKyc.aadhaar_doc}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-600 font-bold hover:underline shrink-0"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="text-[9px] text-slate-450 shrink-0">Not Attached</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Notes Input */}
                  <div className="space-y-1.5 pt-2">
                    <label className="font-bold text-slate-500 uppercase block tracking-wider text-[10px]">Review Notes & Feedback</label>
                    <textarea
                      value={reviewNotes}
                      onChange={e => setReviewNotes(e.target.value)}
                      placeholder="Add review notes, reasons for rejection, or sub-merchant identifier tags..."
                      rows="3"
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-semibold text-slate-700"
                    />
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-200 flex gap-3">
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateKycStatus(selectedKyc.id, 'rejected')}
                    className="flex-1 py-2.5 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm text-center disabled:opacity-50"
                  >
                    ❌ Reject Application
                  </button>
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateKycStatus(selectedKyc.id, 'approved')}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm text-center disabled:opacity-50"
                  >
                    {updating ? 'Processing...' : '✅ Approve & Onboard'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default AdminPgKyc
