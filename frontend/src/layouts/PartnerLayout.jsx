import { useEffect, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { usePartnerAuthStore } from '../store/partnerAuthStore'
import { partnerLogout as apiLogout } from '../api/partner'
import logoImg from '../assets/images/plogo.jpeg'

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
    path: ROUTES.PARTNER.LEADS,
    label: 'Lead Management',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    path: ROUTES.PARTNER.DEMO,
    label: 'Demo Slots',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    path: ROUTES.PARTNER.ORDERS,
    label: 'Client Details',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 112-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    path: ROUTES.PARTNER.DUE_RENEWAL,
    label: 'Due Renewal',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    path: ROUTES.PARTNER.PAYOUTS,
    label: 'Payout',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    path: ROUTES.PARTNER.SUPPORT,
    label: 'Support',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
]

const PartnerLayout = () => {
  const { isPartnerAuthenticated, partnerUser, partnerLogout } = usePartnerAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

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

  const getPartnerTypeLabel = (user) => {
    if (user?.partner_type) {
      const pt = user.partner_type.toLowerCase()
      if (pt.includes('premium')) return 'Premium Partner'
      if (pt.includes('master')) return 'Master Partner'
      if (pt.includes('associate')) return 'Associate Partner'
      return user.partner_type.charAt(0).toUpperCase() + user.partner_type.slice(1) + ' Partner'
    }
    if (user?.name?.toLowerCase().includes('hadid') || user?.partner_name?.toLowerCase().includes('hadid')) {
      return 'Premium Partner'
    }
    return 'Associate Partner'
  }

  return (
    <div className="flex h-screen w-screen bg-[#0f1117] overflow-hidden select-none">
      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#13151f] rounded-3xl border border-white/10 shadow-2xl w-full max-w-xs p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20 text-2xl">
              🚪
            </div>
            <h3 className="text-base font-black text-white mb-2">Sign Out</h3>
            <p className="text-xs text-gray-400 mb-6">Do you want to sign out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/5 cursor-pointer transition-colors"
              >
                No
              </button>
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false)
                  handleLogout()
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-all active:scale-[0.98]"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 shrink-0 bg-aim-navy border-r border-white/5 flex flex-col h-full fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo / Brand */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-2">
          <Link to={ROUTES.HOME} className="flex-1 flex items-center justify-center bg-white rounded-xl py-1.5 px-3 border border-white/10 h-14 shadow-md">
            <img src={logoImg} alt="AIM Partner Logo" className="max-h-11 object-contain" />
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 -mr-2 text-aim-copy-muted hover:text-white lg:hidden rounded-lg focus:outline-none cursor-pointer"
            aria-label="Close Sidebar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted px-3 mb-3">Navigation</p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
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
            onClick={() => setIsLogoutModalOpen(true)}
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
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-white/5 bg-aim-navy/50 backdrop-blur flex items-center px-6 shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              {/* Hamburger button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 mr-2 text-aim-copy-muted hover:text-white lg:hidden rounded-lg focus:outline-none cursor-pointer"
                aria-label="Open Sidebar"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-white text-sm font-semibold capitalize">
                {navItems.find((n) => isActive(n.path))?.label || 'Partner Portal'}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-aim-copy-muted font-semibold shrink-0 ml-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="truncate max-w-[150px] sm:max-w-none">{getPartnerTypeLabel(partnerUser)}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default PartnerLayout