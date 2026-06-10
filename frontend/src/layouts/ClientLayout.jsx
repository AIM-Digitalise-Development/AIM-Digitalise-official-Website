import { useEffect, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useClientAuthStore } from '../store/clientAuthStore'
import { clientLogout as apiLogout } from '../api/clientPortal'
import logoImg from '../assets/images/plogo.jpeg'

const navItems = [
  {
    path: ROUTES.CLIENT.PORTAL,
    label: 'My Products',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    path: ROUTES.CLIENT.PROFILE,
    label: 'My Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

const ClientLayout = () => {
  const { isClientAuthenticated, clientUser, clientToken, clientLogout } = useClientAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Force dark mode on dashboard frame
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

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

  return (
    <div className="flex h-screen w-screen bg-[#070b19] overflow-hidden select-none text-aim-copy font-sans">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar navigation panel */}
      <aside className={`w-64 shrink-0 bg-aim-navy border-r border-white/5 flex flex-col h-full fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Company Logo Wrapper */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-2">
          <Link to={ROUTES.HOME} className="flex-1 flex items-center justify-center bg-white rounded-xl py-1.5 px-3 border border-white/10 h-14 shadow-md">
            <img src={logoImg} alt="AIM Client Logo" className="max-h-11 object-contain" />
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

        {/* Client identity badge */}
        {clientUser && (
          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aim-gold/30 to-aim-purple/30 border border-aim-gold/20 flex items-center justify-center shrink-0">
                <span className="text-aim-gold font-black text-sm">
                  {(clientUser.client_name || clientUser.name || 'C').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-bold truncate">
                  {clientUser.client_name || clientUser.name || 'Client'}
                </p>
                <p className="text-aim-copy-muted text-[10px] font-mono truncate">
                  {clientUser.client_id || 'Client ID'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted px-3 mb-3">Portal Menu</p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
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

        {/* Bottom logout option */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-aim-copy-muted hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main dashboard view frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        
        {/* Top Header Navbar */}
        <header className="h-16 border-b border-white/5 bg-aim-navy/20 backdrop-blur-xl flex items-center px-6 shrink-0 justify-between">
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
            <h2 className="text-white text-sm font-bold capitalize">
              {navItems.find((n) => isActive(n.path))?.label || 'Client Portal'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-aim-copy-muted font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connected</span>
          </div>
        </header>

        {/* Nested Content Outlet */}
        <main className="flex-1 p-6 overflow-y-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ClientLayout
