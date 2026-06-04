import { useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { usePartnerAuthStore } from '../store/partnerAuthStore'
import { partnerLogout as apiLogout } from '../api/partner'

const navItems = [
  {
    path: ROUTES.PARTNER.DASHBOARD,
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: ROUTES.PARTNER.ORDERS,
    label: 'Orders',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    path: ROUTES.PARTNER.PAYOUTS,
    label: 'Payouts',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
]

const PartnerLayout = () => {
  const { isPartnerAuthenticated, partnerUser, partnerLogout } = usePartnerAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Always force dark mode on Partner portal mount
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Route guard
  useEffect(() => {
    if (!isPartnerAuthenticated) {
      navigate(ROUTES.PARTNER.LOGIN, { replace: true })
    }
  }, [isPartnerAuthenticated, navigate])

  if (!isPartnerAuthenticated) return null

  const handleLogout = async () => {
    try { await apiLogout() } catch (_) { /* ignore if token expired */ }
    partnerLogout()
    navigate(ROUTES.PARTNER.LOGIN)
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-aim-navy border-r border-white/5 flex flex-col">
        {/* Logo / Brand */}
        <div className="p-6 border-b border-white/5">
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
            <span className="bg-gradient-to-br from-aim-gold via-aim-gold-light to-aim-purple w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-aim-navy shadow-md shadow-aim-gold/30">
              A
            </span>
            <div>
              <p className="text-white font-black text-sm leading-none">AIM</p>
              <p className="text-aim-copy-muted text-[10px] font-medium tracking-widest uppercase">Partner Portal</p>
            </div>
          </Link>
        </div>

        {/* Partner info */}
        {partnerUser && (
          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aim-gold/30 to-aim-purple/30 border border-aim-gold/20 flex items-center justify-center shrink-0">
                <span className="text-aim-gold font-black text-sm">
                  {(partnerUser.name || partnerUser.partner_name || 'P').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">
                  {partnerUser.name || partnerUser.partner_name || 'Partner'}
                </p>
                <p className="text-aim-copy-muted text-[10px] truncate">
                  {partnerUser.organization || partnerUser.organization_name || ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted px-3 mb-3">Navigation</p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-aim-gold/10 text-aim-gold border border-aim-gold/20 shadow-sm shadow-aim-gold/10'
                  : 'text-aim-copy-muted hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className={isActive(item.path) ? 'text-aim-gold' : 'text-aim-copy-muted'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-aim-copy-muted hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-white/5 bg-aim-navy/50 backdrop-blur flex items-center px-6 shrink-0">
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-white text-sm font-semibold capitalize">
                {navItems.find((n) => isActive(n.path))?.label || 'Partner Portal'}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-aim-copy-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Active Partner
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default PartnerLayout