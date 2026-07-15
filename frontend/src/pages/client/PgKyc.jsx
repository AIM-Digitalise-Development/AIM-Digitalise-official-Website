import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'

const ClientPgKyc = () => {
  const [activeSubTab, setActiveSubTab] = useState('comparison')
  const [kycData, setKycData] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState({
    pan: null,
    trustDeed: null,
    signatoryId: null,
    cheque: null,
  })

  const [form, setForm] = useState({
    businessName: '',
    websiteUrl: '',
    businessType: 'trust',
    panNumber: '',
    signatoryName: '',
    signatoryDesignation: 'trustee',
    signatoryAadhaar: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankName: '',
    preferredGateway: 'razorpay'
  })

  // Load existing KYC status
  useEffect(() => {
    const saved = localStorage.getItem('aim_client_pg_kyc')
    if (saved) {
      setKycData(JSON.parse(saved))
    }
  }, [])

  const handleUploadMock = (docType, fileName) => {
    setUploadStatus(prev => ({
      ...prev,
      [docType]: fileName
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Verify files
    if (!uploadStatus.pan || !uploadStatus.cheque) {
      alert('Please upload at least the PAN Card and Cancelled Cheque to proceed.')
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      const payload = {
        ...form,
        uploads: uploadStatus,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        adminNotes: '',
        id: 'KYC-' + Date.now()
      }
      localStorage.setItem('aim_client_pg_kyc', JSON.stringify(payload))
      setKycData(payload)
      setSubmitting(false)
    }, 1500)
  }

  const handleResetKyc = () => {
    if (window.confirm('Are you sure you want to discard this application and start over?')) {
      localStorage.removeItem('aim_client_pg_kyc')
      setKycData(null)
      setUploadStatus({
        pan: null,
        trustDeed: null,
        signatoryId: null,
        cheque: null,
      })
    }
  }

  return (
    <>
      <Helmet>
        <title>Payment Gateway KYC Onboarding | Client Portal</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Payment Gateway Integration</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Activate instant online fee collection directly on your school/college website & mobile app.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveSubTab('comparison')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'comparison'
                ? 'border-[#ef4444] text-[#ef4444]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            ⚖️ Gateway Comparison & Benefits
          </button>
          <button
            onClick={() => setActiveSubTab('kyc_form')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'kyc_form'
                ? 'border-[#ef4444] text-[#ef4444]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            📋 Documentation & KYC Form
          </button>
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
              {/* Introduction Card */}
              <div className="bg-gradient-to-br from-[#1e3e6b] to-[#152e51] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
                <h3 className="text-xl font-extrabold tracking-tight">Why Activate a Local Payment Gateway?</h3>
                <p className="text-slate-200 text-sm mt-2 max-w-2xl leading-relaxed">
                  By completing your PG-KYC, we integrate robust merchant billing layers (Razorpay, Cashfree, etc.) into your dynamic portals. Parents can pay academic and admission fees online via UPI, NetBanking, Debit/Credit Cards, or Wallets with instant payment settlement.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 border-t border-white/10 pt-6">
                  <div>
                    <span className="text-2xl">⚡</span>
                    <h5 className="font-bold text-sm mt-1">2% Transaction Rate</h5>
                    <p className="text-xs text-slate-300 mt-0.5">Industry standard flat rates on domestic payment modes.</p>
                  </div>
                  <div>
                    <span className="text-2xl">🏦</span>
                    <h5 className="font-bold text-sm mt-1">T+2 Settlement</h5>
                    <p className="text-xs text-slate-300 mt-0.5">Funds settled securely directly into your registered bank account.</p>
                  </div>
                  <div>
                    <span className="text-2xl">🛡️</span>
                    <h5 className="font-bold text-sm mt-1">PCI-DSS Compliant</h5>
                    <p className="text-xs text-slate-300 mt-0.5">Top-tier encryption keeps student payment records secure.</p>
                  </div>
                </div>
              </div>

              {/* Gateway Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Razorpay */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">Razorpay (Recommended)</span>
                      <span className="text-emerald-500 font-bold text-xs">99.9% Up</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-800">Advanced checkout routing</h4>
                    <p className="text-slate-500 text-xs mt-2 leading-relaxed">Best-in-class checkout interface with native UPI intents, auto-retry logic, and premium receipt reconciliation tools.</p>
                    <ul className="text-xs text-slate-600 mt-4 space-y-2 font-medium">
                      <li>✅ Flat 2.0% transaction fee</li>
                      <li>✅ Supporting Credit Card, NetBanking, GPay, PhonePe</li>
                      <li>✅ Automated payment refunds management</li>
                    </ul>
                  </div>
                  <button onClick={() => { setActiveSubTab('kyc_form'); setForm(prev => ({ ...prev, preferredGateway: 'razorpay' })) }} className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                    Apply for Razorpay
                  </button>
                </div>

                {/* Cashfree */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="px-3 py-1 bg-[#10b981]/10 text-[#10b981] rounded-full text-[10px] font-black uppercase tracking-wider">Cashfree Payments</span>
                      <span className="text-emerald-500 font-bold text-xs">99.7% Up</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-800">Lowest payout lag</h4>
                    <p className="text-slate-500 text-xs mt-2 leading-relaxed">Offers excellent split-payment configuration and customized fee routing across multiple school bank departments.</p>
                    <ul className="text-xs text-slate-600 mt-4 space-y-2 font-medium">
                      <li>✅ Flat 1.95% transaction fee</li>
                      <li>✅ Built-in split settlement channels</li>
                      <li>✅ T+1 settlement cycle option</li>
                    </ul>
                  </div>
                  <button onClick={() => { setActiveSubTab('kyc_form'); setForm(prev => ({ ...prev, preferredGateway: 'cashfree' })) }} className="w-full mt-6 py-2.5 bg-[#10b981] hover:bg-[#0e9f6e] text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                    Apply for Cashfree
                  </button>
                </div>

                {/* Paytm Business */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider">Paytm Business</span>
                      <span className="text-slate-400 font-bold text-xs">Legacy Setup</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-800">Deep wallet integration</h4>
                    <p className="text-slate-500 text-xs mt-2 leading-relaxed">Ideal if a large percentage of your clientele uses mobile Paytm Wallets or standard QR code banking.</p>
                    <ul className="text-xs text-slate-600 mt-4 space-y-2 font-medium">
                      <li>✅ Flat 2.0% transaction fee</li>
                      <li>✅ Paytm Postpaid Support</li>
                      <li>✅ Soundbox notifications integration</li>
                    </ul>
                  </div>
                  <button onClick={() => { setActiveSubTab('kyc_form'); setForm(prev => ({ ...prev, preferredGateway: 'paytm' })) }} className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                    Apply for Paytm
                  </button>
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
            >
              {kycData ? (
                /* KYC SUBMISSION STATE STATUS DISPLAY */
                <div className="bg-white border border-slate-200/80 rounded-3xl shadow-md p-8 text-center space-y-6 max-w-xl mx-auto">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl shadow-sm border border-slate-100 bg-slate-50">
                    {kycData.status === 'pending' && '⏳'}
                    {kycData.status === 'approved' && '✅'}
                    {kycData.status === 'rejected' && '❌'}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">{kycData.id}</span>
                    <h3 className="text-xl font-black text-slate-800 mt-1">KYC Onboarding Application</h3>
                    <div className="mt-3 flex justify-center">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase border ${
                        kycData.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        kycData.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {kycData.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-100/80 text-xs text-left space-y-3 font-medium text-slate-600">
                    <p><strong>Merchant Name:</strong> {kycData.businessName}</p>
                    <p><strong>Website:</strong> {kycData.websiteUrl}</p>
                    <p><strong>Preferred Gateway:</strong> <span className="capitalize font-bold text-slate-800">{kycData.preferredGateway}</span></p>
                    <p><strong>Submitted On:</strong> {new Date(kycData.submittedAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    {kycData.adminNotes && (
                      <div className="mt-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-amber-800">
                        <span className="font-bold uppercase tracking-wider text-[10px] block">Reviewer Notes:</span>
                        <p className="mt-1 font-normal leading-relaxed">{kycData.adminNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 justify-center pt-4">
                    <button
                      onClick={handleResetKyc}
                      className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Discard & Start Fresh
                    </button>
                    {kycData.status === 'approved' && (
                      <button
                        onClick={() => alert('Launching Payment Gateway Dashboard API...')}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Launch Gateway Console
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* KYC DOCUMENTATION INPUT FORM */
                <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-md space-y-8">
                  {/* Step Header */}
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800">Documentation & KYC Form</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Please provide accurate legal data to create your official merchant account. Incorrect details will cause registration rejection.</p>
                  </div>

                  {/* Section 1: Business Profile */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-indigo-500 tracking-wider">1. Legal Entity & Website Profile</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">School / Trust Legal Name *</label>
                        <input
                          type="text"
                          required
                          name="businessName"
                          value={form.businessName}
                          onChange={handleInputChange}
                          placeholder="e.g. St. Xavier Trust"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Website URL (For Fee Page) *</label>
                        <input
                          type="url"
                          required
                          name="websiteUrl"
                          value={form.websiteUrl}
                          onChange={handleInputChange}
                          placeholder="e.g. https://stxaviers.edu"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Legal Business Type *</label>
                        <select
                          name="businessType"
                          value={form.businessType}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                        >
                          <option value="trust">Educational Trust / NGO</option>
                          <option value="society">Registered Society</option>
                          <option value="proprietorship">Sole Proprietorship</option>
                          <option value="partnership">Partnership Firm</option>
                          <option value="pvt_ltd">Private Limited Company</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Trust/Entity PAN Number *</label>
                        <input
                          type="text"
                          required
                          name="panNumber"
                          value={form.panNumber}
                          onChange={handleInputChange}
                          placeholder="e.g. ABCDE1234F"
                          maxLength="10"
                          pattern="[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold uppercase font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Authorized Signatory */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black uppercase text-indigo-500 tracking-wider">2. Authorized Signatory Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Signatory Name (As on Aadhaar) *</label>
                        <input
                          type="text"
                          required
                          name="signatoryName"
                          value={form.signatoryName}
                          onChange={handleInputChange}
                          placeholder="e.g. Dr. Ramesh Kumar"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Designation *</label>
                        <input
                          type="text"
                          required
                          name="signatoryDesignation"
                          value={form.signatoryDesignation}
                          onChange={handleInputChange}
                          placeholder="e.g. Chairman / Principal"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Aadhaar Card Number *</label>
                        <input
                          type="text"
                          required
                          name="signatoryAadhaar"
                          value={form.signatoryAadhaar}
                          onChange={handleInputChange}
                          placeholder="e.g. 123456789012"
                          maxLength="12"
                          pattern="[0-9]{12}"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Bank Account */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black uppercase text-indigo-500 tracking-wider">3. Settlement Bank Account Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Beneficiary Name (Account Name) *</label>
                        <input
                          type="text"
                          required
                          name="bankAccountName"
                          value={form.bankAccountName}
                          onChange={handleInputChange}
                          placeholder="e.g. ST XAVIER EDUCATIONAL SOCIETY"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold uppercase"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Bank Account Number *</label>
                        <input
                          type="text"
                          required
                          name="bankAccountNumber"
                          value={form.bankAccountNumber}
                          onChange={handleInputChange}
                          placeholder="e.g. 98765432109"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">IFSC Code *</label>
                        <input
                          type="text"
                          required
                          name="bankIfsc"
                          value={form.bankIfsc}
                          onChange={handleInputChange}
                          placeholder="e.g. SBIN0001234"
                          maxLength="11"
                          pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold uppercase font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Bank Name *</label>
                        <input
                          type="text"
                          required
                          name="bankName"
                          value={form.bankName}
                          onChange={handleInputChange}
                          placeholder="e.g. State Bank of India"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Document Checklist */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black uppercase text-indigo-500 tracking-wider">4. Documentation Upload Checklist</h4>
                    <p className="text-[11px] text-slate-400 font-medium">Click on each slot below to simulate uploading the document file. PDF, PNG, or JPEG acceptable.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Document 1: Trust PAN */}
                      <div
                        onClick={() => handleUploadMock('pan', 'Trust_PAN_Card.pdf')}
                        className={`p-4 border rounded-2xl text-center cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center justify-center space-y-2 ${
                          uploadStatus.pan
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 border-dashed hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span className="text-2xl">{uploadStatus.pan ? '📄' : '📤'}</span>
                        <span className="text-[10px] font-bold block leading-tight">Trust / Entity PAN Card *</span>
                        {uploadStatus.pan && <span className="text-[9px] text-emerald-600 font-mono mt-1 truncate max-w-full">{uploadStatus.pan}</span>}
                      </div>

                      {/* Document 2: Cancelled Cheque */}
                      <div
                        onClick={() => handleUploadMock('cheque', 'Cancelled_Cheque_Copy.png')}
                        className={`p-4 border rounded-2xl text-center cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center justify-center space-y-2 ${
                          uploadStatus.cheque
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 border-dashed hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span className="text-2xl">{uploadStatus.cheque ? '📄' : '📤'}</span>
                        <span className="text-[10px] font-bold block leading-tight">Cancelled Cheque copy *</span>
                        {uploadStatus.cheque && <span className="text-[9px] text-emerald-600 font-mono mt-1 truncate max-w-full">{uploadStatus.cheque}</span>}
                      </div>

                      {/* Document 3: Incorporation Certificate / Trust Deed */}
                      <div
                        onClick={() => handleUploadMock('trustDeed', 'Trust_Deed_Registry.pdf')}
                        className={`p-4 border rounded-2xl text-center cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center justify-center space-y-2 ${
                          uploadStatus.trustDeed
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 border-dashed hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span className="text-2xl">{uploadStatus.trustDeed ? '📄' : '📤'}</span>
                        <span className="text-[10px] font-bold block leading-tight">Trust Deed / NGO Deed</span>
                        {uploadStatus.trustDeed && <span className="text-[9px] text-emerald-600 font-mono mt-1 truncate max-w-full">{uploadStatus.trustDeed}</span>}
                      </div>

                      {/* Document 4: Signatory Aadhaar */}
                      <div
                        onClick={() => handleUploadMock('signatoryId', 'Signatory_Aadhaar_ID.jpg')}
                        className={`p-4 border rounded-2xl text-center cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center justify-center space-y-2 ${
                          uploadStatus.signatoryId
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 border-dashed hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span className="text-2xl">{uploadStatus.signatoryId ? '📄' : '📤'}</span>
                        <span className="text-[10px] font-bold block leading-tight">Signatory Aadhaar ID</span>
                        {uploadStatus.signatoryId && <span className="text-[9px] text-emerald-600 font-mono mt-1 truncate max-w-full">{uploadStatus.signatoryId}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Gateway Selection */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black uppercase text-indigo-500 tracking-wider">5. Preferred Billing Channel Gateway</h4>
                    <div className="flex gap-4">
                      {['razorpay', 'cashfree', 'paytm'].map(pg => (
                        <label key={pg} className={`flex-1 p-3.5 border rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                          form.preferredGateway === pg ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}>
                          <input
                            type="radio"
                            name="preferredGateway"
                            value={pg}
                            checked={form.preferredGateway === pg}
                            onChange={handleInputChange}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs font-bold capitalize">{pg} gateway</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm cursor-pointer disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <span className="inline-block animate-spin">⏳</span>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit KYC Profile</span>
                      )}
                    </button>
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
