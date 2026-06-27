import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../hooks/useAuth'
import { adminLogin, getAdminProfile } from '../../api/adminAuth'
import { employeeLogin } from '../../api/employee'
import { getErrorMessage } from '../../utils/errors'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { ROUTES } from '../../constants/routes'
import plogo from '../../assets/images/plogo.jpeg'

const roleCopy = {
  employee: {
    label: 'Employee Login',
    description: 'Sign in to access your self-service portal, log timesheets, and manage tasks.',
  },
  admin: {
    label: 'Admin Login',
    description: 'Administrative terminal. Access users, system settings, and analytics.',
  },
}

export default function GeneralLogin() {
  const { login, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'employee'

  const [activeRole, setActiveRole] = useState(initialRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync state if search parameter change occurs
  useEffect(() => {
    const r = searchParams.get('role')
    if (r === 'admin' || r === 'employee') {
      setActiveRole(r)
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') {
        navigate(ROUTES.ADMIN.DASHBOARD, { replace: true })
      } else {
        navigate(ROUTES.EMPLOYEE.DASHBOARD, { replace: true })
      }
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

  const header = useMemo(() => roleCopy[activeRole] || roleCopy.employee, [activeRole])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (activeRole === 'admin') {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email.')
        return
      }
      if (!password) {
        setError('Please enter your password.')
        return
      }
    } else {
      if (!email) {
        setError('Please enter your Employee ID.')
        return
      }
      if (!password) {
        setError('Please enter your Date of Birth.')
        return
      }
    }

    try {
      setError('')
      setIsSubmitting(true)

      if (activeRole === 'admin') {
        const res = await adminLogin(email, password)
        const token =
          res?.data?.data?.token ||
          res?.data?.access_token ||
          res?.data?.accessToken ||
          res?.data?.token ||
          res?.data?.data?.access_token ||
          res?.data?.data?.accessToken ||
          ''

        if (!token) {
          setError('Login succeeded but token was not returned.')
          setIsSubmitting(false)
          return
        }

        localStorage.setItem('access_token', token)

        let fetchedUser = res?.data?.data?.admin || res?.data?.admin
        if (!fetchedUser) {
          try {
            const profileResponse = await getAdminProfile()
            fetchedUser = profileResponse.data?.data || profileResponse.data || {}
          } catch (profileErr) {
            fetchedUser = {}
          }
        }

        const adminUser = {
          ...fetchedUser,
          role: 'admin',
        }

        login(adminUser, token)
        navigate(ROUTES.ADMIN.DASHBOARD)
      } else {
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
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>AIM Digitalise | Login</title>
        <meta name="description" content="Sign in to AIM Digitalise Admin or Employee Portal." />
      </Helmet>

      <div className="h-screen bg-aim-navy flex flex-col relative overflow-hidden">
        {/* Background decorations with image & glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1920&q=80')" }}
          />
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-aim-gold/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-aim-purple/12 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '12s' }} />
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
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-aim-purple/15 rounded-full blur-3xl pointer-events-none" />

              {/* Role Toggle Tabs */}
              <div className="flex rounded-2xl bg-aim-navy p-1.5 mb-8 border border-white/5 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRole('employee')
                    setError('')
                  }}
                  className={`flex-1 text-center py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    activeRole === 'employee'
                      ? 'bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-bold shadow-lg shadow-aim-gold/25'
                      : 'text-aim-copy-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRole('admin')
                    setError('')
                  }}
                  className={`flex-1 text-center py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    activeRole === 'admin'
                      ? 'bg-gradient-to-r from-aim-purple to-aim-purple/80 text-white font-bold shadow-lg shadow-aim-purple/25'
                      : 'text-aim-copy-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  Admin
                </button>
              </div>

              {/* Header Title & Description */}
              <div className="relative z-10 text-center mb-8">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${
                  activeRole === 'admin' 
                    ? 'bg-aim-purple/15 border border-aim-purple/30 text-aim-purple-light' 
                    : 'bg-aim-gold/15 border border-aim-gold/30 text-aim-gold'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${activeRole === 'admin' ? 'bg-aim-purple' : 'bg-aim-gold'} animate-ping`} />
                  {activeRole} ACCESS
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mb-3">
                  {header.label}
                </h1>
                <p className="text-xs text-aim-copy-muted leading-relaxed max-w-[290px] mx-auto">
                  {header.description}
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {error && (
                  <div className="p-3.5 rounded-xl border border-red-500/25 bg-red-500/10 text-red-400 text-xs font-semibold text-center animate-shake">
                    {error}
                  </div>
                )}

                {activeRole === 'employee' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-aim-copy-muted uppercase tracking-widest block">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-aim-copy-muted">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                          </svg>
                        </span>
                        <input
                          type="email"
                          placeholder="name@aimdigitalise.com"
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
                        Password
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-aim-copy-muted">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </span>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full bg-aim-navy/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/50 focus:ring-1 focus:ring-aim-gold/25 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-3">
                  <Button
                    type="submit"
                    variant={activeRole === 'admin' ? 'primary' : 'primary'}
                    className={`w-full py-3.5 text-sm font-black uppercase tracking-wider rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                      activeRole === 'admin'
                        ? 'bg-gradient-to-r from-aim-purple to-aim-purple/80 text-white shadow-aim-purple/20 hover:shadow-aim-purple/40'
                        : 'bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy shadow-aim-gold/20 hover:shadow-aim-gold/40'
                    }`}
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
              <Link
                to={ROUTES.DEMO.PORTAL}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-100"
                style={{ background: 'rgba(56,179,74,0.12)', color: '#38b34a', border: '1px solid rgba(56,179,74,0.3)' }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#38b34a' }} />
                Try Demo Portal
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
