import { useEffect, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useClientAuthStore } from '../store/clientAuthStore'
import { clientLogout as apiLogout } from '../api/clientPortal'
import { checkSubscriptionStatus } from '../utils/subscription'
import logoImg from '../assets/images/plogo.jpeg'

const navGroups = [
  {
    title: 'MAIN',
    items: [
      {
        path: '/client/portal',
        routeKey: 'PORTAL',
        label: 'Dashboard',
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        path: '/client/portal/profile',
        routeKey: 'PROFILE',
        label: 'My Profile',
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
    ]
  },
  {
    title: 'BILLING',
    items: [
      {
        path: '/client/portal/subscription',
        routeKey: 'SUBSCRIPTION',
        label: 'Subscription',
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
      },
    ]
  },
]

const ClientLayout = () => {
  const { isClientAuthenticated, clientUser, clientToken, clientLogout, profileData, productData } = useClientAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Guard routing
  useEffect(() => {
    if (!isClientAuthenticated) {
      navigate(ROUTES.CLIENT.LOGIN, { replace: true })
    }
  }, [isClientAuthenticated, navigate])

  if (!isClientAuthenticated) return null

  const handleLogout = async () => {
    try {
      if (clientToken) {
        await apiLogout(clientToken)
      }
    } catch (_) {}
    clientLogout()
    navigate(ROUTES.CLIENT.LOGIN)
  }

  const isActive = (path) => location.pathname === path
  const displayName = clientUser?.client_name || clientUser?.name || 'Client'
  const displayId = clientUser?.client_id || ''
  const initials = displayName.charAt(0).toUpperCase()

  // Get current page title
  const getCurrentTitle = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (isActive(item.path)) return item.label
      }
    }
    return 'Client Portal'
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden select-none" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", background: '#f5f6fa' }}>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`w-[250px] shrink-0 flex flex-col h-full fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static bg-white ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
        style={{ borderRight: '1px solid #ebedf0' }}
      >
        {/* Profile Section */}
        <div className="px-5 pt-6 pb-5 text-center" style={{ borderBottom: '1px solid #ebedf0' }}>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 lg:hidden rounded-lg"
            aria-label="Close Sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Avatar */}
          <div className="w-[72px] h-[72px] rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-md" 
            style={{ background: 'linear-gradient(135deg, #1a3c5e 0%, #2a6f97 100%)' }}
          >
            {initials}
          </div>
          <h3 className="text-[15px] font-bold text-gray-800 mt-3 truncate">{displayName}</h3>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5 font-mono">{displayId}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-5">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 px-3 mb-2">{group.title}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                        active
                          ? 'text-[#1a6b54] bg-[#e8f5f0]'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <span className={active ? 'text-[#1a6b54]' : 'text-gray-400'}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: Logo + Logout */}
        <div className="px-4 py-4 space-y-3" style={{ borderTop: '1px solid #ebedf0' }}>
          <Link to={ROUTES.HOME} className="flex items-center justify-center py-1.5">
            <img src={logoImg} alt="AIM Logo" className="max-h-8 object-contain" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 cursor-pointer"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Header - Dark Teal/Navy */}
        <header className="h-[56px] flex items-center px-6 shrink-0 justify-between text-white"
          style={{ background: 'linear-gradient(90deg, #1a2e3d 0%, #1f3a4f 100%)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 -ml-1 text-white/60 hover:text-white lg:hidden rounded-lg cursor-pointer"
              aria-label="Open Sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-[14px] font-semibold text-white/90">{getCurrentTitle()}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Status */}
            <div className="flex items-center gap-1.5 text-[11px] text-white/50 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </div>
            {/* Bell Icon */}
            <button className="p-1.5 text-white/50 hover:text-white/90 transition-colors relative cursor-pointer">
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            {/* Mini Avatar */}
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[11px] font-bold text-white/80">
              {initials}
            </div>
          </div>
        </header>

        {/* Subscription Alert Banner */}
        {(() => {
          const subStatus = checkSubscriptionStatus(profileData, productData)
          if (!subStatus.isPaid) return null

          if (subStatus.isExpired) {
            return (
              <div className="px-6 py-2.5 text-[12px] flex items-center justify-between font-medium shrink-0" style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#dc2626' }}>
                <div className="flex items-center gap-2">
                  <span>🚨</span>
                  <span>Subscription expired on {subStatus.planEndDate?.toLocaleDateString('en-IN') || '—'}. Please renew immediately.</span>
                </div>
                <Link to={ROUTES.CLIENT.SUBSCRIPTION} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-[10px] uppercase font-bold tracking-wider ml-4 whitespace-nowrap">
                  Renew Now
                </Link>
              </div>
            )
          }

          if (subStatus.isNearExpiry) {
            return (
              <div className="px-6 py-2.5 text-[12px] flex items-center justify-between font-medium shrink-0" style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a', color: '#d97706' }}>
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Plan ending in {subStatus.daysRemaining} day{subStatus.daysRemaining > 1 ? 's' : ''}. Renew to avoid disruption.</span>
                </div>
                <Link to={ROUTES.CLIENT.SUBSCRIPTION} className="px-3 py-1 text-white rounded-md transition-colors text-[10px] uppercase font-bold tracking-wider ml-4 whitespace-nowrap" style={{ background: '#d97706' }}>
                  Renew Now
                </Link>
              </div>
            )
          }

          return null
        })()}

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto" style={{ background: '#f5f6fa' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ClientLayout
