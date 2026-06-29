import { useState, useEffect } from 'react'
import { registerPartner, fetchRMOptions } from '../../../api/partner'

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh',
]

const FieldGroup = ({ label, required, children }) => (
  <div>
    <label className="block text-[10px] font-semibold text-aim-copy-muted uppercase tracking-wider mb-0.5">
      {label} {required && <span className="text-aim-gold">*</span>}
    </label>
    {children}
  </div>
)

const inputCls =
  'w-full bg-aim-navy-light border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/60 focus:ring-1 focus:ring-aim-gold/30 transition-all'

const Step1RegistrationForm = ({ onSuccess, initialValues, initialFiles, partnerData }) => {
  const [form, setForm] = useState(
    initialValues || {
      organization_name: '', rm_type: '', rm_id: '', partner_name: '', contact_no: '',
      email: '', address_line1: '', address_line2: '', district: '',
      pin_code: '', state: '', country: 'India',
      password: '', password_confirmation: '',
    }
  )
  const [files, setFiles] = useState(
    initialFiles || { pan_card: null, id_proof: null, organization_proof: null }
  )
  const [rmOptions, setRmOptions] = useState([])
  const [loadingRmOptions, setLoadingRmOptions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const loadRM = async () => {
      setLoadingRmOptions(true)
      try {
        const res = await fetchRMOptions()
        if (res.data?.success) {
          setRmOptions(res.data.data || [])
        }
      } catch (err) {
        console.error('Failed to load RM options:', err)
      } finally {
        setLoadingRmOptions(false)
      }
    }
    loadRM()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'rm_selection') {
      if (!value) {
        setForm((p) => ({ ...p, rm_id: '', rm_type: '' }))
      } else {
        const [type, id] = value.split('-')
        setForm((p) => ({ ...p, rm_type: type, rm_id: id }))
      }
    } else {
      setForm((p) => ({ ...p, [name]: value }))
    }
  }

  const handleFile = (e) => setFiles((p) => ({ ...p, [e.target.name]: e.target.files[0] || null }))

  const handleSimulateSuccess = () => {
    onSuccess({
      partner_id: `PIDIN${Math.floor(10000 + Math.random() * 89999)}`,
      email: form.email || 'partner@example.com',
      partner_name: form.partner_name || 'Simulated Partner',
      organization_name: form.organization_name || 'Simulated Organization',
      registration_status: 'pending',
    }, form, files)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.rm_id || !form.rm_type) {
      setError('Please select a Relationship Manager.')
      setIsOffline(false)
      return
    }
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.')
      setIsOffline(false)
      return
    }
    if (!files.pan_card || !files.id_proof || !files.organization_proof) {
      setError('Please upload all 3 required documents.')
      setIsOffline(false)
      return
    }

    // Skip API registration if account was already created with the same email
    if (partnerData && partnerData.partner_id && form.email === initialValues?.email) {
      onSuccess(partnerData, form, files)
      return
    }

    setLoading(true)
    setError('')
    setIsOffline(false)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v) })
      const res = await registerPartner(fd)
      if (res.data?.success) {
        onSuccess(res.data.data, form, files)
      } else {
        setError(res.data?.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      const isConnectionRefused = !err.response || err.message === 'Failed to fetch' || err.message?.includes('NetworkError')
      if (isConnectionRefused) {
        setIsOffline(true)
        setError('Network Error: Connection Refused. The partner API server at https://api.nexgn.in/api appears to be offline.')
      } else {
        const msg = err?.response?.data?.message
        const errors = err?.response?.data?.errors
        if (errors) {
          setError(Object.values(errors).flat().join(' '))
        } else {
          setError(msg || 'Network error. Check your connection.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const FileUpload = ({ name, label }) => (
    <FieldGroup label={label} required>
      <label className={`flex items-center gap-3 cursor-pointer ${inputCls} hover:border-aim-gold/40`}>
        <svg className="w-4 h-4 text-aim-gold/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span className={files[name] ? 'text-white text-xs truncate' : 'text-aim-copy-muted text-xs'}>
          {files[name] ? files[name].name : `Upload ${label} (PDF / JPG / PNG)`}
        </span>
        <input type="file" name={name} accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} className="hidden" />
      </label>
    </FieldGroup>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium space-y-3">
          <p>{error}</p>
          {isOffline && (
            <div className="pt-3 border-t border-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-aim-copy-muted text-[11px] leading-relaxed">
                It looks like your local backend server is not running. You can proceed with a simulated local session instead.
              </span>
              <button
                type="button"
                onClick={handleSimulateSuccess}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-aim-gold text-aim-navy font-bold text-[11px] hover:bg-aim-gold-light transition cursor-pointer"
              >
                Use Simulation Mode
              </button>
            </div>
          )}
        </div>
      )}

      {/* Organization & RM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldGroup label="Organization Name" required>
          <input name="organization_name" value={form.organization_name} onChange={handleChange} required placeholder="AIM Pvt. Ltd." className={inputCls} />
        </FieldGroup>
        <FieldGroup label="Relationship Manager (RM)" required>
          <select
            name="rm_selection"
            value={form.rm_type && form.rm_id ? `${form.rm_type}-${form.rm_id}` : ''}
            onChange={handleChange}
            required
            disabled={loadingRmOptions}
            className={`${inputCls} bg-aim-navy`}
          >
            <option value="" className="bg-aim-navy text-aim-copy-muted">
              {loadingRmOptions ? 'Loading RM options...' : 'Select RM *'}
            </option>
            {rmOptions.map((option) => (
              <option key={`${option.type}-${option.id}`} value={`${option.type}-${option.id}`} className="bg-aim-navy text-white">
                {option.type === 'admin' ? '👑 ' : '🤝 '}
                {option.name} {option.partner_id ? `(${option.partner_id})` : ''}
              </option>
            ))}
          </select>
          {rmOptions.length === 0 && !loadingRmOptions && (
            <p className="text-aim-gold text-[10px] mt-1 font-bold">No Super Admins or Master/Premium partners available.</p>
          )}
          {rmOptions.length > 0 && (
            <p className="text-slate-400 text-[8px] mt-0.5 font-bold">
              👑 Super Admin | 🤝 Master/Premium Partner
            </p>
          )}
        </FieldGroup>
      </div>

      {/* Partner Name & Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldGroup label="Partner Name" required>
          <input name="partner_name" value={form.partner_name} onChange={handleChange} required placeholder="Full Name" className={inputCls} />
        </FieldGroup>
        <FieldGroup label="Contact Number" required>
          <input name="contact_no" value={form.contact_no} onChange={handleChange} required placeholder="9876543210" className={inputCls} />
        </FieldGroup>
      </div>

      {/* Email */}
      <FieldGroup label="Email Address" required>
        <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="partner@example.com" className={inputCls} />
      </FieldGroup>

      {/* Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldGroup label="Address Line 1" required>
          <input name="address_line1" value={form.address_line1} onChange={handleChange} required placeholder="Street / Building" className={inputCls} />
        </FieldGroup>
        <FieldGroup label="Address Line 2">
          <input name="address_line2" value={form.address_line2} onChange={handleChange} placeholder="Area / Landmark (optional)" className={inputCls} />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FieldGroup label="District" required>
          <input name="district" value={form.district} onChange={handleChange} required placeholder="District" className={inputCls} />
        </FieldGroup>
        <FieldGroup label="Pin Code" required>
          <input name="pin_code" value={form.pin_code} onChange={handleChange} required placeholder="700107" className={inputCls} />
        </FieldGroup>
        <FieldGroup label="State" required>
          <select name="state" value={form.state} onChange={handleChange} required className={inputCls}>
            <option value="" className="bg-aim-navy text-aim-copy-muted">Select State</option>
            {INDIA_STATES.map((s) => <option key={s} value={s} className="bg-aim-navy text-white">{s}</option>)}
          </select>
        </FieldGroup>
      </div>

      {/* Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldGroup label="Password" required>
          <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Min. 8 characters"  className={inputCls} />
         {/* <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-aim-copy-muted hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {showPassword ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </>
              )}
            </svg>
          </button> */}
          
        </FieldGroup>
        <FieldGroup label="Confirm Password" required>
          <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} required placeholder="Repeat password" className={inputCls} />
        </FieldGroup>
      </div>

      {/* Documents */}
      <div className="pt-1.5 border-t border-white/10">
        <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">Required Documents</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FileUpload name="pan_card" label="PAN Card" />
          <FileUpload name="id_proof" label="ID Proof" />
          <FileUpload name="organization_proof" label="Org. Proof" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-black text-xs tracking-wide shadow-lg shadow-aim-gold/20 hover:shadow-aim-gold/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Submitting Registration...
          </span>
        ) : (
          'Submit Registration & Continue →'
        )}
      </button>
    </form>
  )
}

export default Step1RegistrationForm
