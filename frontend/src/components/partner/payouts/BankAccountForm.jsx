import { useState } from 'react'

const BankAccountForm = () => {
  const [form, setForm] = useState({
    beneficiaryName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    accountType: 'Savings'
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccess(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSuccess(true)
    }, 1000)
  }

  const labelCls = 'block text-[10px] font-bold text-aim-copy-muted uppercase tracking-wider mb-1.5'
  const inputCls = 'w-full bg-aim-navy-light border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/60 focus:ring-1 focus:ring-aim-gold/30 transition-all'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-semibold text-center animate-fade-in">
          Bank account updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Beneficiary Name</label>
          <input
            name="beneficiaryName"
            value={form.beneficiaryName}
            onChange={handleChange}
            placeholder=""
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Account Type</label>
          <select
            name="accountType"
            value={form.accountType}
            onChange={handleChange}
            className={inputCls}
          >
            <option value="Savings" className="bg-aim-navy">Savings Account</option>
            <option value="Current" className="bg-aim-navy">Current Account</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Account Number</label>
          <input
            name="accountNumber"
            value={form.accountNumber}
            onChange={handleChange}
            placeholder="348201938592"
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>IFSC Code</label>
          <input
            name="ifscCode"
            value={form.ifscCode}
            onChange={handleChange}
            placeholder="SBIN0001842"
            required
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Bank Name & Branch</label>
        <input
          name="bankName"
          value={form.bankName}
          onChange={handleChange}
          placeholder="State Bank of India - Kolkata Branch"
          required
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-black text-xs tracking-wider uppercase shadow-md shadow-aim-gold/15 hover:shadow-aim-gold/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
      >
        {saving ? 'Saving details...' : 'Save Bank Account Details'}
      </button>
    </form>
  )
}

export default BankAccountForm