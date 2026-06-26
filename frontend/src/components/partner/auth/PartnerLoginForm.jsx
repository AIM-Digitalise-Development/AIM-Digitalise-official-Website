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
  const [login, setLogin] = useState('')   // accepts Partner ID (PIDIN...) or email
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!login) { setError('Enter your Partner ID (PIDIN...) or email address.'); return }
    if (!password) { setError('Enter your password.'); return }

    setLoading(true)
    setError('')
    try {
      const res = await partnerLogin(login, password)
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* Partner ID or Email */}
      <div>
        <label className="block text-xs font-semibold text-aim-copy-muted uppercase tracking-wider mb-1.5">
          Partner ID
        </label>
        <input
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="ENTER YOUR PARTNER ID OR EMAIL"
          className={inputCls}
          autoFocus
          required
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-semibold text-aim-copy-muted uppercase tracking-wider mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${inputCls} pr-10`}
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

      {/* Checkbox and Forgot Password */}
      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-aim-copy-muted hover:text-white transition-colors">
          <input
            type="checkbox"
            className="rounded border-white/10 bg-white/5 text-aim-gold focus:ring-0 focus:ring-offset-0"
          />
          Stay logged in
        </label>
        <a
          href="#forgot"
          onClick={(e) => {
            e.preventDefault()
            alert('Please contact support at support@aimdigitalise.com to reset your password.')
          }}
          className="text-rose-500 font-bold hover:underline"
        >
          Forgot password?
        </a>
      </div>

      {/* Policy Agreement Disclaimer */}
      <p className="text-[11px] text-aim-copy-muted leading-relaxed text-center pt-2">
        By continuing, you agree to AIM Digitalise's{' '}
        <span className="font-bold text-orange-500 cursor-pointer hover:underline">Terms of Use</span> and{' '}
        <span className="font-bold text-orange-500 cursor-pointer hover:underline">Privacy Policy</span>.
      </p>


      {/* Log In Button (Centered with Gold theme) */}
      <div className="flex justify-center pt-3">
        <button
          type="submit"
          disabled={loading}
          className="w-32 py-2.5 rounded-lg bg-gradient-to-r from-aim-gold to-aim-gold-light hover:from-aim-gold-light hover:to-aim-gold text-aim-navy font-black text-sm tracking-wide shadow-md transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
         
      </div>
      <p className="text-center text-[11px] text-aim-copy-muted mb-6">
                    Don't have an account? <Link to={ROUTES.PARTNER.REGISTER} className="text-rose-500 hover:text-rose-400 font-bold transition-colors">Register Now</Link>
                  </p>
    </form>
  )
}

export default PartnerLoginForm
