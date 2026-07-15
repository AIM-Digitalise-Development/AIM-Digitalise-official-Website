import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'

const MOCK_SUBMISSIONS = [
  {
    id: 'KYC-1721029193291',
    businessName: 'Silver Oak Global School',
    websiteUrl: 'https://silveroakschool.in',
    businessType: 'society',
    panNumber: 'SLOKS9018A',
    signatoryName: 'Mrs. Geeta Kapur',
    signatoryDesignation: 'Secretary',
    signatoryAadhaar: '987654123019',
    bankAccountName: 'SILVER OAK SOCIETY SCHOOL AC',
    bankAccountNumber: '30090812903',
    bankIfsc: 'HDFC0000210',
    bankName: 'HDFC Bank Ltd.',
    preferredGateway: 'razorpay',
    uploads: { pan: 'PAN_Copy_SilverOak.pdf', cheque: 'Cheque_SilverOak.pdf' },
    status: 'approved',
    submittedAt: '2026-07-10T11:45:00.000Z',
    adminNotes: 'All document checks passed. Razorpay sub-merchant id generated.'
  },
  {
    id: 'KYC-1721034182903',
    businessName: 'Vikas Junior College',
    websiteUrl: 'https://vikascollege.org',
    businessType: 'trust',
    panNumber: 'VKEDU9903Z',
    signatoryName: 'Mr. Vikas Rao',
    signatoryDesignation: 'Principal Trustee',
    signatoryAadhaar: '456012903482',
    bankAccountName: 'VIKAS EDUCATIONAL FOUNDATION',
    bankAccountNumber: '982710298371',
    bankIfsc: 'ICIC0000007',
    bankName: 'ICICI Bank Ltd.',
    preferredGateway: 'cashfree',
    uploads: { pan: 'PAN_Vikas_Trust.pdf', cheque: 'Cancelled_Cheque_Vikas.pdf' },
    status: 'rejected',
    submittedAt: '2026-07-12T09:30:00.000Z',
    adminNotes: 'PAN card upload is blurry. Trust registration certificate was missing. Please re-upload.'
  }
]

const AdminPgKyc = () => {
  const [submissions, setSubmissions] = useState([])
  const [selectedKyc, setSelectedKyc] = useState(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Load and merge submissions
  const loadSubmissions = () => {
    const list = [...MOCK_SUBMISSIONS]
    const saved = localStorage.getItem('aim_client_pg_kyc')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Check if already in mock to replace or add
      const idx = list.findIndex(x => x.id === parsed.id)
      if (idx > -1) {
        list[idx] = parsed
      } else {
        list.unshift(parsed)
      }
    }
    setSubmissions(list)
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  const handleUpdateKycStatus = (kycId, newStatus) => {
    const updated = submissions.map(item => {
      if (item.id === kycId) {
        return {
          ...item,
          status: newStatus,
          adminNotes: reviewNotes
        }
      }
      return item
    })
    setSubmissions(updated)
    
    // If it's the client's current submission, update localStorage
    const saved = localStorage.getItem('aim_client_pg_kyc')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.id === kycId) {
        const payload = {
          ...parsed,
          status: newStatus,
          adminNotes: reviewNotes
        }
        localStorage.setItem('aim_client_pg_kyc', JSON.stringify(payload))
      }
    }

    alert(`KYC Submission updated to ${newStatus.toUpperCase()}`)
    setShowDrawer(false)
    setSelectedKyc(null)
    setReviewNotes('')
  }

  // Stats
  const totalCount = submissions.length
  const pendingCount = submissions.filter(s => s.status === 'pending').length
  const approvedCount = submissions.filter(s => s.status === 'approved').length
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length

  // Filter list
  const filteredList = submissions.filter(s => {
    const matchesSearch = s.businessName.toLowerCase().includes(search.toLowerCase()) || s.signatoryName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <Helmet>
        <title>Client PG-KYC Management | Admin Portal</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">PG-KYC Applications</h1>
          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>
          <div className="w-40 flex justify-end">
            <button onClick={loadSubmissions} className="px-4 py-2 border border-slate-200 hover:border-[#38b34a] hover:text-[#38b34a] bg-white rounded-xl text-xs font-bold cursor-pointer shadow-sm">
              ↺ Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Total Submissions</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block font-mono">{totalCount}</span>
          </div>
          <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-amber-500 uppercase block tracking-wider">Pending Review</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block font-mono">{pendingCount}</span>
          </div>
          <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-emerald-500 uppercase block tracking-wider">Approved</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">{approvedCount}</span>
          </div>
          <div className="bg-rose-50/50 border border-rose-100 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-rose-500 uppercase block tracking-wider">Rejected</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block font-mono">{rejectedCount}</span>
          </div>
        </div>

        {/* Main Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-end mb-6 text-xs font-semibold">
            <div className="flex-1 w-full space-y-1">
              <label className="text-slate-400 block font-bold uppercase tracking-wider">Search Merchant</label>
              <input
                type="text"
                placeholder="Search by legal entity name or signatory..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-semibold"
              />
            </div>
            <div className="w-full sm:w-44 space-y-1">
              <label className="text-slate-400 block font-bold uppercase tracking-wider">Review Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-semibold"
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredList.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-slate-50/20 rounded-2xl border border-slate-100 shadow-inner">
              <span className="text-4xl block">🛡️</span>
              <p className="font-bold mt-2">No KYC Applications found</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-5 py-4">Application ID</th>
                      <th className="px-5 py-4">Merchant Business Name</th>
                      <th className="px-5 py-4">Signatory Name</th>
                      <th className="px-5 py-4 text-center">Preferred Gateway</th>
                      <th className="px-5 py-4 text-center">Submitted Date</th>
                      <th className="px-5 py-4 text-center">Status</th>
                      <th className="px-5 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredList.map((kyc) => (
                      <tr key={kyc.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-mono font-bold text-slate-500">{kyc.id}</td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 text-sm">{kyc.businessName}</p>
                          <a href={kyc.websiteUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 font-bold hover:underline">{kyc.websiteUrl}</a>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800">{kyc.signatoryName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{kyc.signatoryDesignation}</p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="px-2.5 py-1 rounded bg-[#e2e8f0] text-slate-700 font-bold text-[10px] uppercase">
                            {kyc.preferredGateway}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center text-slate-500">
                          {new Date(kyc.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${
                            kyc.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            kyc.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            'bg-rose-100 text-rose-800 border-rose-200'
                          }`}>
                            {kyc.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => { setSelectedKyc(kyc); setReviewNotes(kyc.adminNotes || ''); setShowDrawer(true) }}
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
                    <h3 className="text-lg font-black text-slate-900 leading-tight">{selectedKyc.businessName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-blue-600 font-bold font-mono">{selectedKyc.id}</span>
                      <span className="text-slate-300">•</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${
                        selectedKyc.status === 'pending' ? 'bg-amber-105 text-amber-800 border-amber-200' :
                        selectedKyc.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {selectedKyc.status}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setShowDrawer(false)} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-lg">✕</button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-xs">
                  {/* Entity Profile */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-blue-600 uppercase tracking-wider block text-[10px]">Merchant Legal Identity</h4>
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Legal Entity Name</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedKyc.businessName}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Entity Type</span>
                        <p className="text-slate-800 font-semibold mt-0.5 capitalize">{selectedKyc.businessType}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Entity PAN ID</span>
                        <p className="text-slate-800 font-semibold mt-0.5 font-mono uppercase">{selectedKyc.panNumber}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Website Domain</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedKyc.websiteUrl}</p>
                      </div>
                    </div>
                  </div>

                  {/* Signatory Profile */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-blue-600 uppercase tracking-wider block text-[10px]">Authorized Signatory</h4>
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Full Name</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedKyc.signatoryName}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Designation</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedKyc.signatoryDesignation}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Aadhaar Card ID</span>
                        <p className="text-slate-800 font-semibold mt-0.5 font-mono">{selectedKyc.signatoryAadhaar}</p>
                      </div>
                    </div>
                  </div>

                  {/* Settlement Bank */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-blue-600 uppercase tracking-wider block text-[10px]">Settlement Bank Coordinates</h4>
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Beneficiary Holder</span>
                        <p className="text-slate-800 font-semibold mt-0.5 uppercase">{selectedKyc.bankAccountName}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Bank Name</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedKyc.bankName}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Account Number</span>
                        <p className="text-slate-800 font-semibold mt-0.5 font-mono">{selectedKyc.bankAccountNumber}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">IFSC Routing Code</span>
                        <p className="text-slate-800 font-semibold mt-0.5 font-mono uppercase">{selectedKyc.bankIfsc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Files Checklist */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-blue-600 uppercase tracking-wider block text-[10px]">Documents Verification Checklist</h4>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="p-3 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-700 text-[10px]">Legal PAN Document</p>
                          <p className="text-[9px] text-slate-400 font-mono truncate max-w-[150px]">{selectedKyc.uploads.pan || 'Not uploaded'}</p>
                        </div>
                        <button onClick={() => alert('Downloading Mock file: ' + selectedKyc.uploads.pan)} className="text-[10px] text-blue-600 font-bold hover:underline">Download</button>
                      </div>
                      <div className="p-3 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-700 text-[10px]">Cancelled Cheque Copy</p>
                          <p className="text-[9px] text-slate-400 font-mono truncate max-w-[150px]">{selectedKyc.uploads.cheque || 'Not uploaded'}</p>
                        </div>
                        <button onClick={() => alert('Downloading Mock file: ' + selectedKyc.uploads.cheque)} className="text-[10px] text-blue-600 font-bold hover:underline">Download</button>
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
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 text-xs focus:outline-none focus:border-[#38b34a] focus:ring-1 focus:ring-[#38b34a] resize-none font-semibold text-slate-700"
                    />
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-200 flex gap-3">
                  <button
                    onClick={() => handleUpdateKycStatus(selectedKyc.id, 'rejected')}
                    className="flex-1 py-2.5 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm text-center"
                  >
                    ❌ Reject Application
                  </button>
                  <button
                    onClick={() => handleUpdateKycStatus(selectedKyc.id, 'approved')}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm text-center"
                  >
                    ✅ Approve & Onboard
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
