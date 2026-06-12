import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { clientLogin } from '../../api/clientPortal'
import { useClientAuthStore } from '../../store/clientAuthStore'
import { ROUTES } from '../../constants/routes'
import plogo from '../../assets/images/plogo.jpeg'

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

      <div className="min-h-screen flex flex-col" style={{ background: '#f5f6fa', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
        {/* Top bar - dark teal matching dashboard header */}
        <header className="text-white" style={{ background: 'linear-gradient(90deg, #1a2e3d 0%, #1f3a4f 100%)' }}>
          <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
              <img 
                src={plogo} 
                alt="AIM Digitalise Logo" 
                className="h-9 sm:h-10 w-auto object-contain rounded-md bg-white p-1 shadow-sm transition-transform duration-300 group-hover:scale-[1.02]" 
              />
            </Link>
            <Link
              to={ROUTES.SUBSCRIPTION}
              className="text-[11px] font-medium text-white/50 hover:text-white/80 transition-colors"
            >
              ← View Subscriptions
            </Link>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-[400px]">
            {/* Card */}
            <div className="bg-white rounded-xl p-8 sm:p-9 shadow-sm" style={{ border: '1px solid #ebedf0' }}>
              {/* Header */}
              <div className="text-center mb-7">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md mb-5" style={{ background: '#e8f5f0' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#1a6b54' }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#1a6b54' }}>Client Portal</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1.5">Welcome Back</h1>
                <p className="text-[12px] text-gray-400 leading-relaxed">
                  Sign in to access your subscription dashboard.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg text-[12px] font-medium text-center" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                    {error}
                  </div>
                )}

                {/* Client ID */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                    Client ID
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="CLI-XXXX"
                      className="w-full rounded-lg px-4 py-3 text-[13px] text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a6b54]/30 transition-all pl-10"
                      style={{ background: '#f5f6fa', border: '1px solid #ebedf0' }}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg px-4 py-3 text-[13px] text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a6b54]/30 transition-all pl-10 pr-10"
                      style={{ background: '#f5f6fa', border: '1px solid #ebedf0' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
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
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg text-white font-bold text-[13px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-90 active:scale-[0.99]"
                    style={{ background: 'linear-gradient(135deg, #1a3c5e 0%, #2a6f97 100%)' }}
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

            {/* Footer note */}
            <p className="text-center text-[11px] text-gray-400 mt-6">
              Having trouble?{' '}
              <a href="mailto:support@aimdigitalise.com" className="transition-colors font-semibold underline underline-offset-4 hover:text-gray-600" style={{ color: '#1a6b54' }}>
                Contact Support
              </a>
            </p>
          </div>
        </main>
      </div>
    </>
  )
}

export default ClientLogin
