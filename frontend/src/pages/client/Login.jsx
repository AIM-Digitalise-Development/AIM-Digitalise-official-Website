import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { clientLogin } from '../../api/clientPortal'
import { useClientAuthStore } from '../../store/clientAuthStore'
import { ROUTES } from '../../constants/routes'
import plogo from '../../assets/images/plogo.jpeg'

const inputCls =
  'w-full bg-aim-navy/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/50 focus:ring-1 focus:ring-aim-gold/25 transition-all shadow-inner'

const ClientLogin = () => {
  const navigate = useNavigate()
  const { isClientAuthenticated, clientLogin: storeLogin } = useClientAuthStore()
  
  const [clientId, setClientId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isClientAuthenticated) {
      navigate(ROUTES.CLIENT.PORTAL, { replace: true })
    }
  }, [isClientAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!clientId.trim()) {
      setError('Enter your Client ID.')
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await clientLogin(clientId.trim(), password)
      
      const success = res?.success || res?.data?.success || (res?.token && true)
      if (!success) {
        setError(res?.message || 'Login failed. Please check your credentials.')
        setLoading(false)
        return
      }

      const token = res?.token || res?.data?.token || ''
      const client = res?.client || res?.data?.client || res?.data?.user || {}

      if (!token) {
        setError('Login succeeded but session token is missing.')
        setLoading(false)
        return
      }

      storeLogin(client, token)
      navigate(ROUTES.CLIENT.PORTAL)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message
      setError(msg || 'Invalid credentials or server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Client Login | AIM Digitalise</title>
        <meta name="description" content="Sign in to the AIM Digitalise Client Portal to view your purchased products and profile." />
      </Helmet>

      <div className="min-h-screen bg-aim-navy flex flex-col relative overflow-hidden">
        {/* Background decorations with slow animated glows & image */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1920&q=80')" }}
          />
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-aim-gold/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-aim-purple/12 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '14s' }} />
          <div className="absolute inset-0 bg-grid-pattern opacity-25" />
        </div>

        {/* Top bar with plogo.jpeg */}
        <header className="relative z-10 border-b border-white/5 bg-aim-navy/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
              <img 
                src={plogo} 
                alt="AIM Digitalise Logo" 
                className="h-10 sm:h-12 w-auto object-contain rounded-lg border border-white/10 shadow-lg shadow-black/30 transition-transform duration-300 group-hover:scale-[1.02]" 
              />
            </Link>
            <Link
              to={ROUTES.SUBSCRIPTION}
              className="text-xs font-semibold text-aim-copy-muted hover:text-aim-gold transition-colors"
            >
              ← View Subscriptions
            </Link>
          </div>
        </header>

        {/* Main */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="relative rounded-3xl border border-white/10 bg-aim-navy-card/75 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl shadow-black/80 transition-all duration-300">
              {/* Internal Ambient glows */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-aim-gold/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-aim-purple/15 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 text-center mb-8">
                {/* Client badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-aim-gold/10 border border-aim-gold/20 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-aim-gold animate-pulse" />
                  <span className="text-aim-gold text-[10px] font-black uppercase tracking-widest">Client Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Client Login</h1>
                <p className="text-xs text-aim-copy-muted leading-relaxed">
                  Sign in to access and manage your cloud subscription accounts.
                </p>
              </div>

              {/* Form */}
              <div className="relative z-10">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3.5 rounded-xl border border-red-500/25 bg-red-500/10 text-red-400 text-xs font-semibold text-center animate-shake">
                      {error}
                    </div>
                  )}

                  {/* Client ID */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-aim-copy-muted uppercase tracking-widest block">
                      Client ID
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-aim-copy-muted">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="CLI-XXXX"
                        className={`${inputCls} pl-10`}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-aim-copy-muted uppercase tracking-widest block">
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
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-aim-copy-muted hover:text-white transition-colors cursor-pointer"
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
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-black text-sm uppercase tracking-wider shadow-lg shadow-aim-gold/20 hover:shadow-aim-gold/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
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
                        'Sign In'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-aim-copy-muted mt-8">
              Having trouble?{' '}
              <a href="mailto:support@aimdigitalise.com" className="text-aim-gold hover:text-aim-gold-light transition-colors font-bold underline underline-offset-4">
                Contact Technical Support
              </a>
            </p>
          </div>
        </main>
      </div>
    </>
  )
}

export default ClientLogin
