import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../hooks/useAuth'
import { employeeLogin } from '../../api/employee'
import { getErrorMessage } from '../../utils/errors'
import Button from '../../components/ui/Button'
import { ROUTES } from '../../constants/routes'
import plogo from '../../assets/images/plogo.jpeg'

export default function EmployeeLogin() {
  const { login, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated as employee
  useEffect(() => {
    if (isAuthenticated && role === 'employee') {
      navigate(ROUTES.EMPLOYEE.DASHBOARD, { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  useEffect(() => {
    // Prevent page-level scrolling
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      // Restore scrolling on unmount
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your Employee ID.')
      return
    }
    if (!password) {
      setError('Please enter your Date of Birth.')
      return
    }

    try {
      setError('')
      setIsSubmitting(true)

      const res = await employeeLogin(email, password)
      const token =
        res?.data?.data?.token ||
        res?.data?.token ||
        res?.data?.access_token ||
        res?.data?.accessToken ||
        res?.data?.data?.access_token ||
        res?.data?.data?.accessToken ||
        ''

      const employeeData = res?.data?.data?.employee || res?.data?.employee

      if (!token) {
        setError('Login succeeded but token was not returned.')
        setIsSubmitting(false)
        return
      }

      const userData = {
        ...employeeData,
        role: 'employee',
      }

      login(userData, token)
      navigate(ROUTES.EMPLOYEE.DASHBOARD)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>AIM Digitalise | Employee Login</title>
        <meta name="description" content="Sign in to AIM Digitalise Employee Portal." />
      </Helmet>

      <div className="h-screen bg-aim-navy flex flex-col relative overflow-hidden">
        {/* Background decorations with image & glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1920&q=80')" }}
          />
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-aim-gold/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-aim-gold/12 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '12s' }} />
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        </div>

        {/* Top bar with plogo.jpeg */}
        <header className="relative z-10 border-b border-white/5 bg-aim-navy/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
              <img 
                src={plogo} 
                alt="AIM Digitalise" 
                className="h-10 sm:h-12 w-auto object-contain rounded-lg border border-white/10 shadow-lg shadow-black/30 transition-transform duration-300 group-hover:scale-[1.02]" 
              />
            </Link>
            <Link
              to={ROUTES.HOME}
              className="text-xs font-semibold text-aim-copy-muted hover:text-aim-gold transition-all duration-200 flex items-center gap-1 hover:-translate-x-1"
            >
              <span>← Back to Home</span>
            </Link>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            
            {/* Main Interactive Login Card */}
            <div className="relative rounded-3xl border border-white/10 bg-aim-navy-card/75 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl shadow-black/80 transition-all duration-300 -translate-y-1.5">
              {/* Internal Accent Glows */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-aim-gold/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-aim-gold/15 rounded-full blur-3xl pointer-events-none" />

              {/* Header Title & Description */}
              <div className="relative z-10 text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 bg-aim-gold/15 border border-aim-gold/30 text-aim-gold">
                  <span className="w-1.5 h-1.5 rounded-full bg-aim-gold animate-ping" />
                  EMPLOYEE ACCESS
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mb-3">
                  Employee Login
                </h1>
                <p className="text-xs text-aim-copy-muted leading-relaxed max-w-[290px] mx-auto">
                  Sign in to access your self-service portal, log timesheets, and manage tasks.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {error && (
                  <div className="p-3.5 rounded-xl border border-red-500/25 bg-red-500/10 text-red-400 text-xs font-semibold text-center animate-shake">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-aim-copy-muted uppercase tracking-widest block">
                    Employee ID
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-aim-copy-muted">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2H5z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. AIM260001"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="w-full bg-aim-navy/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/50 focus:ring-1 focus:ring-aim-gold/25 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-aim-copy-muted uppercase tracking-widest block">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-aim-copy-muted">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </span>
                    <input
                      type="date"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-aim-navy/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/50 focus:ring-1 focus:ring-aim-gold/25 transition-all shadow-inner [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3.5 text-sm font-black uppercase tracking-wider rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy shadow-aim-gold/20 hover:shadow-aim-gold/40"
                    isLoading={isSubmitting}
                  >
                    Sign In
                  </Button>
                </div>
              </form>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-aim-copy-muted mt-8">
              Having trouble?{' '}
              <a href="mailto:support@aimdigitalise.com" className="text-aim-gold hover:text-aim-gold-light transition-colors font-bold underline underline-offset-4">
                Contact Technical Support
              </a>
            </p>
            {/* Demo Portal Link */}
            <div className="mt-4 text-center">
              
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
