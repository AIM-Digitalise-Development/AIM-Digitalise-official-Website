import { useState } from 'react'

const WithdrawForm = ({ availableBalance = 5200, onWithdrawSubmitted }) => {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleWithdraw = (e) => {
    e.preventDefault()
    const numAmt = parseFloat(amount)

    if (isNaN(numAmt) || numAmt <= 0) {
      setError('Please enter a valid amount.')
      return
    }
    if (numAmt < 500) {
      setError('Minimum withdrawal request is ₹500.')
      return
    }
    if (numAmt > availableBalance) {
      setError(`Insufficient balance. Maximum available is ₹${availableBalance.toLocaleString()}.`)
      return
    }

    setLoading(true)
    setError('')
    
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setAmount('')
      if (onWithdrawSubmitted) {
        onWithdrawSubmitted(numAmt)
      }
    }, 1200)
  }

  const inputCls = 'w-full bg-aim-navy-light border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/60 focus:ring-1 focus:ring-aim-gold/30 transition-all'

  return (
    <form onSubmit={handleWithdraw} className="space-y-4">
      {success && (
        <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-semibold text-center animate-fade-in">
          Withdrawal request submitted successfully!
        </div>
      )}
      {error && (
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold text-center animate-fade-in">
          {error}
        </div>
      )}

      {/* Available Balance Box */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-aim-gold/15 bg-aim-gold/5">
        <div>
          <span className="text-[10px] text-aim-gold uppercase tracking-wider block">Available Balance</span>
          <span className="text-xl font-black text-aim-gold">₹{availableBalance.toLocaleString()}</span>
        </div>
        <div className="text-[10px] text-aim-copy-muted max-w-[150px] text-right font-medium">
          Payout requests are processed within 2-3 business days.
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-[10px] font-bold text-aim-copy-muted uppercase tracking-wider mb-1.5">
          Request Payout Amount (INR)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-aim-copy-muted font-bold text-sm">
            ₹
          </span>
          <input
            type="number"
            min="500"
            step="100"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setError('')
              setSuccess(false)
            }}
            placeholder="Enter amount (Min: ₹500)"
            className={`${inputCls} pl-8`}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-black text-xs tracking-wider uppercase shadow-md shadow-aim-gold/15 hover:shadow-aim-gold/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
      >
        {loading ? 'Submitting request...' : 'Request Payout'}
      </button>
    </form>
  )
}

export default WithdrawForm