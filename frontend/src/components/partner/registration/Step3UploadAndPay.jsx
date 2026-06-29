import { useState } from 'react'
import { uploadSignedAgreement, createOrder, completePayment } from '../../../api/partner'

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
]

const loadRazorpay = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK. Please check your internet connection.'))
    document.body.appendChild(script)
  })
}

const Step3UploadAndPay = ({ partnerData, formEmail, onSuccess, onBack }) => {
  const [signedFile, setSignedFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [amount, setAmount] = useState(1000)
  const [status, setStatus] = useState('') // progress message
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  // Track whether agreement has been uploaded
  const [agreementUploaded, setAgreementUploaded] = useState(
    !!partnerData?.signed_agreement_path
  )
  const [uploadLoading, setUploadLoading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const valid = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!valid.includes(file.type)) {
      setFileError('Only PDF, JPG, or PNG allowed')
      setSignedFile(null)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File must be under 5 MB')
      setSignedFile(null)
      return
    }
    setFileError('')
    setSignedFile(file)
  }

  const handleSimulatePayment = () => {
    onSuccess({
      success: true,
      token: `sim_token_${Math.random().toString(36).substring(2)}${Date.now()}`,
      partner: {
        id: partnerData?.partner_id || 'SIM-1234',
        name: partnerData?.partner_name || 'Simulated Partner',
        email: partnerData?.email || formEmail || 'partner@example.com',
        organization: partnerData?.organization_name || 'Simulated Organization',
      }
    })
  }

  // ── Step 3a: Upload signed agreement ──
  const handleUploadAgreement = async () => {
    if (!signedFile) {
      setFileError('Please select the signed agreement')
      return
    }
    setUploadLoading(true)
    setError('')
    setIsOffline(false)
    try {
      const fd = new FormData()
      fd.append('partner_id', partnerData.partner_id)
      fd.append('signed_agreement', signedFile)
      const res = await uploadSignedAgreement(fd)
      if (res.data?.success) {
        setAgreementUploaded(true)
        setStatus('✅ Signed agreement uploaded successfully! Proceed with payment below.')
      } else {
        const msg = res.data?.message
        const errors = res.data?.errors
        if (errors) {
          setError(Object.values(errors).flat().join(' '))
        } else {
          setError(msg || 'Upload failed')
        }
      }
    } catch (err) {
      const isConnectionRefused = !err.response || err.message === 'Failed to fetch' || err.message?.includes('NetworkError')
      if (isConnectionRefused) {
        setIsOffline(true)
        setError('Network Error: Connection Refused. The partner API server appears to be offline.')
      } else {
        setError(err?.response?.data?.message || err.message || 'Upload failed')
      }
    } finally {
      setUploadLoading(false)
    }
  }

  // ── Step 3b: Payment (create order + Razorpay + verify) ──
  const handlePayment = async () => {
    if (!agreementUploaded) {
      setError('Please upload the signed agreement first before making payment.')
      return
    }

    setLoading(true)
    setError('')
    setIsOffline(false)
    try {
      // Create Razorpay order
      setStatus('Creating payment order...')
      const orderRes = await createOrder({
        partner_id: partnerData.partner_id,
        amount: 1000,
        currency: 'INR'
      })
      if (!orderRes.data?.success) throw new Error(orderRes.data?.message || 'Order creation failed')
      const orderData = orderRes.data

      // Handle simulated payment
      if (orderData.simulated) {
        setStatus('Processing simulated payment...')
        const verifyRes = await completePayment({
          partner_id: partnerData.partner_id,
          razorpay_payment_id: `sim_pay_${Date.now()}`,
          razorpay_order_id: orderData.order_id,
          razorpay_signature: `sim_sig_${Date.now()}`,
          amount: 1000,
          currency: 'INR',
        })
        if (!verifyRes.data?.success) throw new Error(verifyRes.data?.message || 'Verification failed')
        setStatus('')
        onSuccess(verifyRes.data)
        return
      }

      // Real Razorpay
      setStatus('Loading payment gateway...')
      await loadRazorpay()
      setStatus('')

      const options = {
        key: orderData.key,
        amount: Math.round(orderData.amount * 100),
        currency: orderData.currency,
        name: orderData.organization || 'AIM Digitalise',
        description: `Partner Registration – ${orderData.partner_name || ''}`,
        order_id: orderData.order_id,
        handler: async (response) => {
          setLoading(true)
          setStatus('Verifying payment...')
          try {
            const verifyRes = await completePayment({
              partner_id: partnerData.partner_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: orderData.amount,
              currency: orderData.currency,
            })
            if (verifyRes.data?.success) {
              setStatus('')
              onSuccess(verifyRes.data)
            } else {
              setError(verifyRes.data?.message || 'Payment verification failed')
            }
          } catch (err) {
            setError(err?.response?.data?.message || 'Payment verification failed')
          } finally {
            setLoading(false)
          }
        },
        modal: { ondismiss: () => { setError('Payment cancelled'); setLoading(false) } },
        prefill: { name: orderData.partner_name, email: orderData.partner_email },
        theme: { color: '#D4AF37' },
      }
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (r) => {
        setError('Payment failed: ' + (r.error?.description || 'Unknown error'))
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      const isConnectionRefused = !err.response || err.message === 'Failed to fetch' || err.message?.includes('NetworkError')
      if (isConnectionRefused) {
        setIsOffline(true)
        setError('Network Error: Connection Refused. The partner API server appears to be offline.')
      } else {
        const msg = err?.response?.data?.message || err?.response?.data?.errors
        setError(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : (msg || err.message || 'Something went wrong'))
      }
    } finally {
      if (!loading) setLoading(false)
      setStatus('')
    }
  }

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0]

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold space-y-2">
          <p>{error}</p>
          {isOffline && (
            <div className="pt-2 border-t border-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-aim-copy-muted text-[10px] leading-tight">
                Your local backend is offline. You can simulate success instead.
              </span>
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-aim-gold text-aim-navy font-bold text-[10px] hover:bg-aim-gold-light transition cursor-pointer"
              >
                Simulate Success
              </button>
            </div>
          )}
        </div>
      )}
      {status && (
        <div className="p-2.5 rounded-xl border border-aim-gold/20 bg-aim-gold/10 text-aim-gold text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          {status}
        </div>
      )}

      {/* Grid container to split modal in middle: Left = Upload Signed Agreement, Right = Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Left Column: Upload Signed Agreement */}
        <div className={`col-span-12 md:col-span-6 rounded-2xl border-2 p-4 flex flex-col justify-between transition-all ${
          agreementUploaded
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-white/10 bg-aim-navy-light/30'
        }`}>
          <div>
            <div className="flex items-center gap-1.5 pb-1.5 border-b border-white/5 mb-3">
              {agreementUploaded ? (
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-aim-gold/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
              <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted">
                {agreementUploaded ? '✅ Signed Contract Uploaded' : 'Upload Signed Agreement'}
                {!agreementUploaded && <span className="text-aim-gold ml-0.5">*</span>}
              </p>
            </div>

            {!agreementUploaded ? (
              <div className="space-y-2">
                <label className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 border-dashed px-3 py-4.5 transition-all ${
                  signedFile
                    ? 'border-aim-gold/60 bg-aim-gold/5'
                    : 'border-white/10 hover:border-aim-gold/30 hover:bg-white/5'
                  }`}>
                  <svg className="w-5 h-5 text-aim-gold/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    {signedFile ? (
                      <>
                        <p className="text-white text-xs font-semibold truncate">{signedFile.name}</p>
                        <p className="text-aim-copy-muted text-[10px]">{(signedFile.size / 1024).toFixed(1)} KB</p>
                      </>
                    ) : (
                      <>
                        <p className="text-aim-copy-muted text-xs">Click to select file</p>
                        <p className="text-aim-copy-muted text-[9px] mt-0.5">PDF, JPG, PNG (max 5MB)</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" disabled={uploadLoading} />
                </label>
                {fileError && <p className="text-red-400 text-[10px] font-semibold">{fileError}</p>}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-emerald-400 text-xs font-semibold leading-relaxed">
                  Signed contract has been successfully uploaded! Complete payment details on the right side to proceed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Payment Details */}
        <div className={`col-span-12 md:col-span-6 rounded-2xl border border-white/10 bg-aim-navy-light/60 p-4 flex flex-col justify-between transition-all ${
          agreementUploaded ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted pb-1.5 border-b border-white/5 mb-3">
              Payment Details
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-aim-copy-muted uppercase tracking-wider mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-aim-navy border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/60 focus:ring-1 focus:ring-aim-gold/30 transition-all"
                  disabled={loading}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-aim-navy text-xs">
                      {c.symbol} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-semibold text-aim-copy-muted uppercase tracking-wider mb-1">
                  Amount ({selectedCurrency.symbol})
                </label>
                <input
                  type="number"
                  value={amount}
                  readOnly
                  className="w-full bg-aim-navy border border-white/10 rounded-xl px-3 py-2 text-xs text-white/70 placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/60 focus:ring-1 focus:ring-aim-gold/30 transition-all opacity-60 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2.5 border-t border-white/10 mt-4 shrink-0">
            <span className="text-xs text-aim-copy-muted">Registration Fee</span>
            <span className="text-base font-black text-aim-gold">
              {selectedCurrency.symbol} {amount.toLocaleString()} {currency}
            </span>
          </div>
        </div>

      </div>

      {/* Down section: unified actions */}
      <div className="space-y-2 pt-2">
        {!agreementUploaded ? (
          <button
            type="button"
            onClick={handleUploadAgreement}
            disabled={uploadLoading || !signedFile}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-md shadow-blue-900/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
          >
            {uploadLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Uploading Signed Agreement...
              </span>
            ) : (
              'Upload Signed Agreement'
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-black text-sm tracking-wide shadow-lg shadow-aim-gold/20 hover:shadow-aim-gold/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin text-aim-navy" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing Fee...
              </span>
            ) : (
              `Pay ${selectedCurrency.symbol}${amount.toLocaleString()} ${currency} & Complete Registration`
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onBack}
          disabled={loading || uploadLoading}
          className="w-full py-2 rounded-xl border border-white/10 text-aim-copy-muted text-xs hover:text-white hover:border-white/20 transition-all disabled:opacity-40 cursor-pointer"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}

export default Step3UploadAndPay
