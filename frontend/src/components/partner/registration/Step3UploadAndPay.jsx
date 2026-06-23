import { useState } from 'react'
import { completeRegistration, createOrder, verifyPayment } from '../../../api/partner'

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
]

const inputCls =
  'w-full bg-aim-navy-light border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/60 focus:ring-1 focus:ring-aim-gold/30 transition-all'

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(true); return }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(s)
  })

const Step3UploadAndPay = ({ partnerData, formEmail, onSuccess, onBack }) => {
  const [signedFile, setSignedFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [amount, setAmount] = useState(1000)
  const [status, setStatus] = useState('') // progress message
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

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

  const handleSubmit = async () => {
    if (!signedFile) { setFileError('Please select the signed agreement'); return }
    setLoading(true)
    setError('')
    setIsOffline(false)
    try {
      // 3a: Upload signed agreement
      setStatus('Uploading signed agreement...')
      const uploadFd = new FormData()
      uploadFd.append('partner_id', partnerData.partner_id)
      uploadFd.append('email', partnerData.email || formEmail)
      uploadFd.append('signed_agreement', signedFile)
      const uploadRes = await completeRegistration(uploadFd)
      if (!uploadRes.data?.success) throw new Error(uploadRes.data?.message || 'Upload failed')

      // 3b: Create order
      setStatus('Creating payment order...')
      const orderRes = await createOrder({ partner_id: partnerData.partner_id, amount, currency })
      if (!orderRes.data?.success) throw new Error(orderRes.data?.message || 'Order creation failed')
      const orderData = orderRes.data

      // 3c: Simulate or real Razorpay
      if (orderData.simulated) {
        setStatus('Processing simulated payment...')
        const verifyRes = await verifyPayment({
          partner_id: partnerData.partner_id,
          razorpay_payment_id: `sim_pay_${Date.now()}`,
          razorpay_order_id: orderData.order_id,
          razorpay_signature: `sim_sig_${Date.now()}`,
          amount: orderData.amount,
          currency: orderData.currency,
        })
        if (!verifyRes.data?.success) throw new Error(verifyRes.data?.message || 'Verification failed')
        setStatus('')
        onSuccess(verifyRes.data)
      } else {
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
              const verifyRes = await verifyPayment({
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
      }
    } catch (err) {
      const isConnectionRefused = !err.response || err.message === 'Failed to fetch' || err.message?.includes('NetworkError')
      if (isConnectionRefused) {
        setIsOffline(true)
        setError('Network Error: Connection Refused. The partner API server at https://api.nexgn.in/api appears to be offline.')
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
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium space-y-3">
          <p>{error}</p>
          {isOffline && (
            <div className="pt-3 border-t border-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-aim-copy-muted text-[11px] leading-relaxed">
                Your local backend is offline. You can simulate a successful agreement upload and payment registration instead.
              </span>
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-aim-gold text-aim-navy font-bold text-[11px] hover:bg-aim-gold-light transition cursor-pointer"
              >
                Simulate Success
              </button>
            </div>
          )}
        </div>
      )}
      {status && (
        <div className="p-3 rounded-xl border border-aim-gold/20 bg-aim-gold/10 text-aim-gold text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          {status}
        </div>
      )}

      {/* Upload signed agreement */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-aim-copy-muted mb-3">
          Upload Signed Agreement <span className="text-aim-gold">*</span>
        </p>
        <label className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 transition-all ${signedFile
            ? 'border-aim-gold/60 bg-aim-gold/5'
            : 'border-white/10 hover:border-aim-gold/30 hover:bg-white/5'
          }`}>
          <svg className="w-6 h-6 text-aim-gold/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <div className="flex-1 min-w-0">
            {signedFile ? (
              <>
                <p className="text-white text-sm font-semibold truncate">{signedFile.name}</p>
                <p className="text-aim-copy-muted text-xs">{(signedFile.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <p className="text-aim-copy-muted text-sm">Click to upload signed agreement</p>
                <p className="text-aim-copy-muted text-xs mt-0.5">PDF, JPG, PNG — max 5 MB</p>
              </>
            )}
          </div>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
        </label>
        {fileError && <p className="mt-1.5 text-red-400 text-xs">{fileError}</p>}
      </div>

      {/* Payment details */}
      <div className="rounded-2xl border border-white/10 bg-aim-navy-light/60 p-5 space-y-4">
        <p className="text-xs font-black uppercase tracking-widest text-aim-copy-muted">Payment Details</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-aim-copy-muted mb-1.5">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={inputCls}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-aim-navy">
                  {c.symbol} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-aim-copy-muted mb-1.5">
              Amount ({selectedCurrency.symbol})
            </label>
            <input
              type="number"
              value={amount}
              readOnly
              className={`${inputCls} opacity-60 cursor-not-allowed`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-white/10">
          <span className="text-sm text-aim-copy-muted">Registration Fee</span>
          <span className="text-xl font-black text-aim-gold">
            {selectedCurrency.symbol} {amount.toLocaleString()} {currency}
          </span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-black text-sm tracking-wide shadow-lg shadow-aim-gold/20 hover:shadow-aim-gold/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
      >
        {loading
          ? 'Processing...'
          : `Upload & Pay ${selectedCurrency.symbol}${amount.toLocaleString()} ${currency}`}
      </button>

      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="w-full py-2.5 rounded-xl border border-white/10 text-aim-copy-muted text-sm hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
      >
        ← Back
      </button>
    </div>
  )
}

export default Step3UploadAndPay
