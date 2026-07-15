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
        path: '/client/portal/support',
        routeKey: 'SUPPORT',
        label: 'Help & Support',
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
    ]
  },
  {
    title: 'ADD-ONS',
    items: [
      {
        path: '/client/portal/customization',
        routeKey: 'CUSTOMIZATION',
        label: 'Customizations',
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        ),
      },
      {
        path: '/client/portal/addon-services',
        routeKey: 'ADDON_SERVICES',
        label: 'Add-on Services',
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
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
      {
        path: '/client/portal/pg-kyc',
        routeKey: 'PG_KYC',
        label: 'PG-KYC',
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

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
      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xs p-6 text-center text-slate-800">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100 text-2xl">
              🚪
            </div>
            <h3 className="text-base font-black text-slate-800 mb-2">Sign Out</h3>
            <p className="text-xs text-slate-500 mb-6">Do you want to sign out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-grow py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                No
              </button>
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false)
                  handleLogout()
                }}
                className="flex-grow py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-all active:scale-[0.98]"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

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

          {/* Avatar Link to Profile */}
          <Link
            to="/client/portal/profile"
            onClick={() => setIsSidebarOpen(false)}
            className="block w-[72px] h-[72px] rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-md hover:opacity-90 transition-opacity cursor-pointer focus:outline-none"
            style={{ background: 'linear-gradient(135deg, #1a3c5e 0%, #2a6f97 100%)' }}
            title="View Profile"
          >
            {initials}
          </Link>
          <Link
            to="/client/portal/profile"
            onClick={() => setIsSidebarOpen(false)}
            className="block hover:text-indigo-600 transition-colors mt-3"
            title="View Profile"
          >
            <h3 className="text-[15px] font-bold text-gray-800 truncate">{displayName}</h3>
          </Link>
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
                          ? 'text-indigo-600 bg-indigo-50/60 font-bold border-r-2 border-indigo-500 rounded-r-none'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <span className={active ? 'text-indigo-600' : 'text-gray-400'}>
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
            onClick={() => setIsLogoutModalOpen(true)}
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
        {/* Top Header - Mockup Brand Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger button for sidebar toggle on mobile */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer transition-colors active:scale-95 lg:hidden shrink-0"
              aria-label="Open Sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Brand Name */}
            <div className="flex items-baseline gap-1 select-none font-sans">
              <span className="text-base sm:text-lg font-black text-[#1e3e6b] tracking-tight">AIM</span>
              <span className="text-base sm:text-lg font-black text-[#dc2626] tracking-tight">Digitalise</span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-805 tracking-wide ml-0.5">Private Limited</span>
            </div>
          </div>

          {/* Social Icons Section */}
          <div className="flex items-center gap-2">
            {[
              { 
                name: 'Facebook',
                url: 'https://facebook.com',
                icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                  </svg>
                )
              },
              { 
                name: 'Instagram',
                url: 'https://instagram.com',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01"/>
                  </svg>
                )
              },
              { 
                name: 'Skype',
                url: 'https://skype.com',
                icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-1.87-.58-3.6-1.57-5.02.05-.32.07-.65.07-.98 0-3.31-2.69-6-6-6-.33 0-.66.02-.98.07C12.1 1.08 10.37.5 8.5.5c-4.97 0-9 4.03-9 9 0 1.87.58 3.6 1.57 5.02-.05.32-.07.65-.07.98 0 3.31 2.69 6 6 6 .33 0 .66-.02.98-.07 1.42.99 3.15 1.57 5.02 1.57 4.97 0 9-4.03 9-9zm-10.74 3.48c-2.26 0-3.23-1.07-3.23-2.14 0-.84.62-1.35 1.34-1.35.98 0 1.07.74 1.54 1.15.46.39 1 .63 1.51.63.78 0 1.25-.43 1.25-1 0-.6-.35-.85-1.57-1.15-1.92-.47-3.08-1-3.08-2.67 0-1.86 1.5-2.62 3.12-2.62 1.94 0 2.94 1 2.94 1.88 0 .81-.53 1.3-1.32 1.3-.87 0-.93-.65-1.42-1.03-.43-.32-.88-.51-1.39-.51-.69 0-1 .34-1 .8 0 .52.37.74 1.48 1 1.95.46 3.18.99 3.18 2.76.01 1.96-1.47 2.93-3.12 2.93z"/>
                  </svg>
                )
              },
              { 
                name: 'LinkedIn',
                url: 'https://linkedin.com',
                icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                )
              },
              { 
                name: 'Twitter',
                url: 'https://twitter.com',
                icon: (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                )
              }
            ].map(social => (
              <a 
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
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
