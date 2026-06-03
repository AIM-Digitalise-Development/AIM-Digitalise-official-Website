import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { partnerLogin } from '../../../api/partner'
import { usePartnerAuthStore } from '../../../store/partnerAuthStore'
import { ROUTES } from '../../../constants/routes'

const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/60 focus:ring-1 focus:ring-aim-gold/30 transition-all'

const PartnerLoginForm = () => {
  const navigate = useNavigate()
  const { partnerLogin: storeLogin } = usePartnerAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) { setError('Enter a valid email address.'); return }
    if (!password) { setError('Enter your password.'); return }

    setLoading(true)
    setError('')
    try {
      const res = await partnerLogin(email, password)
      const d = res.data

      if (!d?.success) { setError(d?.message || 'Login failed'); return }

      const token = d?.data?.token || d?.token || ''
      const user = d?.data?.partner || d?.partner || {}

      if (!token) { setError('Login succeeded but no token returned.'); return }

      storeLogin(user, token)
      navigate(ROUTES.PARTNER.DASHBOARD)
    } catch (err) {
      const msg = err?.response?.data?.message
      setError(msg || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-aim-copy-muted uppercase tracking-wider mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-aim-copy-muted">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="partner@example.com"
            className={`${inputCls} pl-10`}
            autoFocus
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-semibold text-aim-copy-muted uppercase tracking-wider mb-1.5">
          Password
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-aim-copy-muted">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${inputCls} pl-10 pr-10`}
            required
          />
          <button
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
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-black text-sm tracking-wide shadow-lg shadow-aim-gold/20 hover:shadow-aim-gold/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Signing In...
          </span>
        ) : (
          'Sign In to Partner Portal'
        )}
      </button>

      {/* Register link */}
      <p className="text-center text-xs text-aim-copy-muted">
        New partner?{' '}
        <Link to={ROUTES.PARTNER.REGISTER} className="text-aim-gold hover:text-aim-gold-light font-semibold transition-colors">
          Register here →
        </Link>
      </p>
    </form>
  )
}

export default PartnerLoginForm
