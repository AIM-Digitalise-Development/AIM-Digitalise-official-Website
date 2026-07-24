import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useClientAuthStore } from '../../store/clientAuthStore'
import razorpayImg from '../../assets/images/razorpay.png'

const ClientPgKyc = () => {
  const { clientToken, clientUser } = useClientAuthStore()
  const [activeSubTab, setActiveSubTab] = useState('comparison')

  // Dynamic API states
  const [kycData, setKycData] = useState(null)
  const [loadingPgKyc, setLoadingPgKyc] = useState(false)
  const [submittingPgKyc, setSubmittingPgKyc] = useState(false)
  const [isKycSubmitted, setIsKycSubmitted] = useState(false)

  const [form, setForm] = useState({
    legal_name: '',
    website_url: '',
    legal_business_type: 'Educational Trust / NGO',
    entity_pan: '',
    signatory_name: '',
    designation: 'trustee',
    aadhaar_number: '',
    beneficiary_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    preferred_gateway: 'Razorpay'
  })

  const [uploadStatus, setUploadStatus] = useState({
    pan_card_doc: null,
    cancelled_cheque_doc: null,
    trust_deed_doc: null,
    aadhaar_doc: null
  })

  // Fetch PG-KYC Application from API
  const fetchPgKycApplication = async () => {
    if (!clientToken) return
    setLoadingPgKyc(true)
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'
      const response = await fetch(`${API_URL}/client/pg-kyc`, {
        headers: { 'Authorization': `Bearer ${clientToken}` }
      })
      
      if (response.status === 401) {
        console.error('Session expired')
        return
      }

      const result = await response.json()
      if (result.success && result.data) {
        setKycData(result.data)
        const isSubmitted = ['pending', 'approved', 'rejected', 'under_review'].includes(result.data.status)
        setIsKycSubmitted(isSubmitted)
        
        setForm({
          legal_name: result.data.legal_name || '',
          website_url: result.data.website_url || '',
          legal_business_type: result.data.legal_business_type || 'Educational Trust / NGO',
          entity_pan: result.data.entity_pan || '',
          signatory_name: result.data.signatory_name || '',
          designation: result.data.designation || 'trustee',
          aadhaar_number: result.data.aadhaar_number || '',
          beneficiary_name: result.data.beneficiary_name || '',
          account_number: result.data.account_number || '',
          ifsc_code: result.data.ifsc_code || '',
          bank_name: result.data.bank_name || '',
          preferred_gateway: 'Razorpay'
        })
      }
    } catch (err) {
      console.error('Fetch PG-KYC error:', err)
    } finally {
      setLoadingPgKyc(false)
    }
  }

  useEffect(() => {
    fetchPgKycApplication()
  }, [clientToken])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (docType, file) => {
    setUploadStatus(prev => ({
      ...prev,
      [docType]: file
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isKycSubmitted) {
      alert('KYC profile has already been submitted. You cannot submit again.')
      return
    }

    // Mandatory document validation
    const hasPan = uploadStatus.pan_card_doc || kycData?.pan_card_doc
    const hasCheque = uploadStatus.cancelled_cheque_doc || kycData?.cancelled_cheque_doc
    const hasAadhaar = uploadStatus.aadhaar_doc || kycData?.aadhaar_doc

    if (!hasPan || !hasCheque || !hasAadhaar) {
      alert('Please upload all mandatory documents: PAN Card, Cancelled Cheque, and Signatory Aadhaar ID.')
      return
    }

    setSubmittingPgKyc(true)

    try {
      const formData = new FormData()
      Object.keys(form).forEach(key => {
        formData.append(key, form[key])
      })

      if (uploadStatus.pan_card_doc) formData.append('pan_card_doc', uploadStatus.pan_card_doc)
      if (uploadStatus.cancelled_cheque_doc) formData.append('cancelled_cheque_doc', uploadStatus.cancelled_cheque_doc)
      if (uploadStatus.trust_deed_doc) formData.append('trust_deed_doc', uploadStatus.trust_deed_doc)
      if (uploadStatus.aadhaar_doc) formData.append('aadhaar_doc', uploadStatus.aadhaar_doc)

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'
      const response = await fetch(`${API_URL}/client/pg-kyc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${clientToken}`
        },
        body: formData
      })

      if (response.status === 401) {
        console.error('Session expired')
        setSubmittingPgKyc(false)
        return
      }

      const result = await response.json()

      if (result.success) {
        alert('🎉 PG-KYC application submitted successfully!')
        setKycData(result.data)
        setIsKycSubmitted(true)
        fetchPgKycApplication()
      } else {
        alert(result.message || 'Failed to submit PG-KYC profile.')
      }
    } catch (err) {
      console.error('Submit PG-KYC error:', err)
      alert('An error occurred while submitting PG-KYC profile.')
    } finally {
      setSubmittingPgKyc(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Payment Gateway KYC Onboarding | Client Portal</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in max-w-5xl mx-auto pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/80 pb-5 gap-4">
          <div className="text-left">
            <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Payment Gateway Integration</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Activate instant online fee collection directly on your school/college website & mobile app.</p>
          </div>
          {/* Pill Capsule Subtab Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-2xl shrink-0 self-start md:self-auto shadow-inner border border-slate-200/40">
            <button
              onClick={() => setActiveSubTab('comparison')}
              className={`py-2 px-4 rounded-xl text-xs font-black tracking-tight transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'comparison'
                  ? 'bg-white text-[#1e3e6b] shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>⚖️</span> Gateway Info
            </button>
            <button
              onClick={() => setActiveSubTab('kyc_form')}
              className={`py-2 px-4 rounded-xl text-xs font-black tracking-tight transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'kyc_form'
                  ? 'bg-white text-[#1e3e6b] shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>📝</span> Onboarding Form
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <AnimatePresence mode="wait">
          {activeSubTab === 'comparison' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Premium Gradient Hero Card */}
              <div className="bg-gradient-to-br from-[#1e3e6b] via-[#19345a] to-[#122846] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden text-left">
                <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-blue-400/5 rounded-full blur-3xl"></div>
                <h3 className="text-xl font-extrabold tracking-tight relative z-10">Why Activate a Local Payment Gateway?</h3>
                <p className="text-slate-200/95 text-xs font-medium mt-2.5 max-w-3xl leading-relaxed relative z-10">
                  By completing your PG-KYC, we integrate robust merchant billing layers into your dynamic portals. Parents can pay academic and admission fees online via UPI, NetBanking, Debit/Credit Cards, or Wallets with instant payment settlement.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 border-t border-white/10 pt-6 relative z-10">
                  <div className="flex gap-3 items-center">
                    <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-lg">⚡</span>
                    <div>
                      <h5 className="font-bold text-xs">2% Transaction Rate</h5>
                      <p className="text-[10px] text-slate-300 mt-0.5">Industry standard flat rates on domestic payment modes.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-lg">🏦</span>
                    <div>
                      <h5 className="font-bold text-xs">T+2 Settlement</h5>
                      <p className="text-[10px] text-slate-300 mt-0.5">Funds settled securely directly into your registered bank account.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-lg">🛡️</span>
                    <div>
                      <h5 className="font-bold text-xs">PCI-DSS Compliant</h5>
                      <p className="text-[10px] text-slate-300 mt-0.5">Top-tier encryption keeps student payment records secure.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side-by-side Premium Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto text-left">
                {/* Razorpay Feature Details Card */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-100">Razorpay (Recommended)</span>
                      <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        99.9% Uptime
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-slate-800 tracking-tight">Advanced checkout routing</h4>
                    <p className="text-slate-500 text-xs mt-2.5 leading-relaxed font-medium">Best-in-class checkout interface with native UPI intents, auto-retry logic, and premium receipt reconciliation tools.</p>
                    
                    <ul className="text-xs text-slate-600 mt-6 space-y-3.5 font-bold">
                      <li className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                        <span>Flat 2.0% transaction fee</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                        <span>Credit Card, NetBanking, GPay, PhonePe</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                        <span>Automated refunds management</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => { setActiveSubTab('kyc_form') }}
                    className="w-full mt-8 py-3 bg-[#1e3e6b] hover:bg-[#122846] text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-blue-900/10 hover:scale-[1.01]"
                  >
                    Start KYC Onboarding
                  </button>
                </div>

                {/* Styled Logo Card with gradient background */}
                <div className="relative flex justify-center items-center p-8 bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 border border-slate-200 rounded-3xl h-full min-h-[300px] shadow-inner overflow-hidden group">
                  {/* Glowing background shapes */}
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-500"></div>
                  <div className="absolute -left-12 -top-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-500"></div>
                  
                  <img
                    src={razorpayImg}
                    alt="Razorpay Payment Gateway"
                    className="max-h-40 object-contain hover:scale-[1.04] transition-transform duration-500 relative z-10 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.04)]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'kyc_form' && (
            <motion.div
              key="kyc_form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {loadingPgKyc ? (
                <div className="text-center py-24 bg-white border border-slate-200 rounded-3xl shadow-sm">
                  <span className="inline-block animate-spin text-3xl">⏳</span>
                  <p className="text-slate-400 font-bold mt-3 text-sm">Loading KYC Onboarding profile...</p>
                </div>
              ) : (
                /* KYC DOCUMENTATION INPUT FORM */
                <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-8 text-left">
                  {/* Step Header */}
                  <div className="flex justify-between items-center pb-5 border-b border-slate-100 gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Documentation & KYC Form</h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">Please provide accurate legal data to create your official merchant account. Incorrect details will cause registration rejection.</p>
                    </div>
                    {kycData && (
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border tracking-wider shrink-0 ${
                        kycData.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        kycData.status === 'rejected' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                        'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {kycData.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {/* Reviewer notes banner */}
                  {kycData?.adminNotes && (
                    <div className="p-4.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
                      <span className="text-lg">⚠️</span>
                      <div>
                        <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Reviewer Remarks</span>
                        <p className="font-medium text-slate-700">{kycData.adminNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* Section 1: Business Profile */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">1. Legal Entity & Website Profile</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/40">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">School / Trust Legal Name *</label>
                        <input
                          type="text"
                          required
                          name="legal_name"
                          value={form.legal_name}
                          onChange={handleInputChange}
                          disabled={isKycSubmitted}
                          placeholder="e.g. St. Xavier Trust"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Website URL (For Fee Page) *</label>
                        <input
                          type="url"
                          required
                          name="website_url"
                          value={form.website_url}
                          onChange={handleInputChange}
                          disabled={isKycSubmitted}
                          placeholder="e.g. https://stxaviers.edu"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Legal Business Type *</label>
                        <select
                          name="legal_business_type"
                          value={form.legal_business_type}
                          onChange={handleInputChange}
                          disabled={isKycSubmitted}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition-all font-semibold disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                          <option value="Educational Trust / NGO">Educational Trust / NGO</option>
                          <option value="Registered Society">Registered Society</option>
                          <option value="Sole Proprietorship">Sole Proprietorship</option>
                          <option value="Partnership Firm">Partnership Firm</option>
                          <option value="Private Limited Company">Private Limited Company</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Trust/Entity PAN Number *</label>
                        <input
                          type="text"
                          required
                          name="entity_pan"
                          value={form.entity_pan}
                          onChange={handleInputChange}
                          disabled={isKycSubmitted}
                          placeholder="e.g. ABCDE1234F"
                          maxLength="10"
                          pattern="[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold uppercase font-mono disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Authorized Signatory */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">2. Authorized Signatory Details</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/40">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Signatory Name (As on Aadhaar) *</label>
                        <input
                          type="text"
                          required
                          name="signatory_name"
                          value={form.signatory_name}
                          onChange={handleInputChange}
                          disabled={isKycSubmitted}
                          placeholder="e.g. Dr. Ramesh Kumar"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Designation *</label>
                        <input
                          type="text"
                          required
                          name="designation"
                          value={form.designation}
                          onChange={handleInputChange}
                          disabled={isKycSubmitted}
                          placeholder="e.g. Chairman / Principal"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Aadhaar Card Number *</label>
                        <input
                          type="text"
                          required
                          name="aadhaar_number"
                          value={form.aadhaar_number}
                          onChange={handleInputChange}
                          disabled={isKycSubmitted}
                          placeholder="e.g. 123456789012"
                          maxLength="12"
                          pattern="[0-9]{12}"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold font-mono disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Bank Account */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">3. Settlement Bank Account Details</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/40">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Beneficiary Name (Account Name) *</label>
                        <input
                          type="text"
                          required
                          name="beneficiary_name"
                          value={form.beneficiary_name}
                          onChange={handleInputChange}
                          disabled={isKycSubmitted}
                          placeholder="e.g. ST XAVIER EDUCATIONAL SOCIETY"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold uppercase disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Bank Account Number *</label>
                        <input
                          type="text"
                          required
                          name="account_number"
                          value={form.account_number}
                          onChange={handleInputChange}
                          disabled={isKycSubmitted}
                          placeholder="e.g. 98765432109"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold font-mono disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">IFSC Code *</label>
                        <input
                          type="text"
                          required
                          name="ifsc_code"
                          value={form.ifsc_code}
                          onChange={handleInputChange}
                          disabled={isKycSubmitted}
                          placeholder="e.g. SBIN0001234"
                          maxLength="11"
                          pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold uppercase font-mono disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Bank Name *</label>
                        <input
                          type="text"
                          required
                          name="bank_name"
                          value={form.bank_name}
                          onChange={handleInputChange}
                          disabled={isKycSubmitted}
                          placeholder="e.g. State Bank of India"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Document Checklist */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">4. Documentation Upload Checklist</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">Click on each slot below to upload the document file. PDF, PNG, or JPEG acceptable.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Document 1: Trust PAN */}
                      <label className={`p-4 border rounded-2xl text-center cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center justify-center space-y-2.5 min-h-[140px] ${
                        uploadStatus.pan_card_doc
                          ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800 shadow-sm'
                          : kycData?.pan_card_doc
                            ? 'bg-blue-50/50 border-blue-200 text-blue-800'
                            : isKycSubmitted
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                              : 'bg-slate-55/40 border-slate-200 border-dashed hover:bg-slate-100/50 text-slate-500'
                      }`}>
                        <span className="text-2xl">
                          {uploadStatus.pan_card_doc || kycData?.pan_card_doc ? '📄' : '📤'}
                        </span>
                        <span className="text-[10px] font-bold block leading-tight">Trust / Entity PAN Card *</span>
                        <span className="text-[8.5px] font-mono mt-1 truncate max-w-full text-slate-400">
                          {uploadStatus.pan_card_doc
                            ? uploadStatus.pan_card_doc.name
                            : kycData?.pan_card_doc
                              ? '✓ Document On File'
                              : isKycSubmitted
                                ? 'Not Attached'
                                : 'Choose File'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileChange('pan_card_doc', e.target.files[0] || null)}
                          className="hidden"
                          disabled={isKycSubmitted}
                        />
                      </label>

                      {/* Document 2: Cancelled Cheque */}
                      <label className={`p-4 border rounded-2xl text-center cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center justify-center space-y-2.5 min-h-[140px] ${
                        uploadStatus.cancelled_cheque_doc
                          ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800 shadow-sm'
                          : kycData?.cancelled_cheque_doc
                            ? 'bg-blue-50/50 border-blue-200 text-blue-800'
                            : isKycSubmitted
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                              : 'bg-slate-55/40 border-slate-200 border-dashed hover:bg-slate-100/50 text-slate-500'
                      }`}>
                        <span className="text-2xl">
                          {uploadStatus.cancelled_cheque_doc || kycData?.cancelled_cheque_doc ? '📄' : '📤'}
                        </span>
                        <span className="text-[10px] font-bold block leading-tight">Cancelled Cheque copy *</span>
                        <span className="text-[8.5px] font-mono mt-1 truncate max-w-full text-slate-400">
                          {uploadStatus.cancelled_cheque_doc
                            ? uploadStatus.cancelled_cheque_doc.name
                            : kycData?.cancelled_cheque_doc
                              ? '✓ Document On File'
                              : isKycSubmitted
                                ? 'Not Attached'
                                : 'Choose File'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileChange('cancelled_cheque_doc', e.target.files[0] || null)}
                          className="hidden"
                          disabled={isKycSubmitted}
                        />
                      </label>

                      {/* Document 3: Trust Deed */}
                      <label className={`p-4 border rounded-2xl text-center cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center justify-center space-y-2.5 min-h-[140px] ${
                        uploadStatus.trust_deed_doc
                          ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800 shadow-sm'
                          : kycData?.trust_deed_doc
                            ? 'bg-blue-50/50 border-blue-200 text-blue-800'
                            : isKycSubmitted
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                              : 'bg-slate-55/40 border-slate-200 border-dashed hover:bg-slate-100/50 text-slate-500'
                      }`}>
                        <span className="text-2xl">
                          {uploadStatus.trust_deed_doc || kycData?.trust_deed_doc ? '📄' : '📤'}
                        </span>
                        <span className="text-[10px] font-bold block leading-tight">Trust Deed / NGO Deed</span>
                        <span className="text-[8.5px] font-mono mt-1 truncate max-w-full text-slate-400">
                          {uploadStatus.trust_deed_doc
                            ? uploadStatus.trust_deed_doc.name
                            : kycData?.trust_deed_doc
                              ? '✓ Document On File'
                              : isKycSubmitted
                                ? 'Not Attached'
                                : 'Choose File'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileChange('trust_deed_doc', e.target.files[0] || null)}
                          className="hidden"
                          disabled={isKycSubmitted}
                        />
                      </label>

                      {/* Document 4: Signatory Aadhaar */}
                      <label className={`p-4 border rounded-2xl text-center cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center justify-center space-y-2.5 min-h-[140px] ${
                        uploadStatus.aadhaar_doc
                          ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800 shadow-sm'
                          : kycData?.aadhaar_doc
                            ? 'bg-blue-50/50 border-blue-200 text-blue-800'
                            : isKycSubmitted
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                              : 'bg-slate-55/40 border-slate-200 border-dashed hover:bg-slate-100/50 text-slate-500'
                      }`}>
                        <span className="text-2xl">
                          {uploadStatus.aadhaar_doc || kycData?.aadhaar_doc ? '📄' : '📤'}
                        </span>
                        <span className="text-[10px] font-bold block leading-tight">Signatory Aadhaar ID *</span>
                        <span className="text-[8.5px] font-mono mt-1 truncate max-w-full text-slate-400">
                          {uploadStatus.aadhaar_doc
                            ? uploadStatus.aadhaar_doc.name
                            : kycData?.aadhaar_doc
                              ? '✓ Document On File'
                              : isKycSubmitted
                                ? 'Not Attached'
                                : 'Choose File'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileChange('aadhaar_doc', e.target.files[0] || null)}
                          className="hidden"
                          disabled={isKycSubmitted}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Section 5: Preferred Billing Channel Gateway */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">5. Preferred Billing Channel Gateway</h4>
                    </div>
                    <div className="border border-slate-200/80 rounded-2xl p-5 bg-gradient-to-r from-slate-50 via-white to-indigo-50/5 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shrink-0">
                          <svg className="w-5 h-5 text-indigo-650" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">Razorpay Merchant Gateway</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">Fully integrated checkout routing with native UPI intents and instant settlements.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 self-end md:self-auto">
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-indigo-50 border border-indigo-200 text-indigo-750 tracking-wider">
                          Primary billing channel
                        </span>
                        {/* <div className="px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
                          <img src={razorpayImg} alt="Razorpay Logo" className="h-5 object-contain" />
                        </div> */}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col items-end gap-2">
                    <button
                      type="submit"
                      disabled={isKycSubmitted || submittingPgKyc}
                      className={`px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                        isKycSubmitted
                          ? 'bg-emerald-600 text-white cursor-not-allowed opacity-90'
                          : submittingPgKyc
                            ? 'bg-indigo-400 text-white cursor-not-allowed animate-pulse'
                            : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-lg shadow-blue-500/10 hover:scale-[1.01]'
                      }`}
                    >
                      {isKycSubmitted ? (
                        <>
                          <span>✅ Submitted</span>
                        </>
                      ) : submittingPgKyc ? (
                        <>
                          <span className="inline-block animate-spin">⏳</span>
                          <span>Submitting Profile...</span>
                        </>
                      ) : (
                        <span>Submit KYC Profile</span>
                      )}
                    </button>
                    {isKycSubmitted && (
                      <p className="text-[10px] text-slate-400 font-bold">
                        Your KYC profile has been submitted. You cannot submit again.
                      </p>
                    )}
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default ClientPgKyc
