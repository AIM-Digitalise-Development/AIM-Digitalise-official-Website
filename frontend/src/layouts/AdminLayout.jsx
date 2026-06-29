import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import { adminLogout } from '../api/adminAuth'
import logoImg from '../assets/images/plogo.jpeg'

const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, role, logout, user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  // Wait for Zustand persist rehydration and force dark mode
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
    document.documentElement.classList.add('dark')
  }, [])

  // Protect the route: if not authenticated as admin, redirect home
  useEffect(() => {
    if (ready && (!isAuthenticated || role !== 'admin')) {
      navigate(ROUTES.HOME, { replace: true })
    }
  }, [ready, isAuthenticated, role, navigate])

  const handleLogout = async () => {
    try {
      await adminLogout()       // destroy server session
    } catch (error) {
      console.error('Logout API call failed', error)
    } finally {
      logout()                  // clear Zustand store + localStorage
      navigate(`${ROUTES.AUTH.LOGIN}?role=admin`)     // redirect to admin login tab
    }
  }

  if (!ready || !isAuthenticated || role !== 'admin') {
    return null
  }

  // Exact menu items from the screenshot
  const menuItems = [
    { route: ROUTES.ADMIN.DASHBOARD, label: 'Dashboard', icon: 'dashboard', color: '#10b981' },
    { route: ROUTES.ADMIN.SAAS_CLIENTS, label: 'SaaS Based Client', icon: 'clients', color: '#38b34a' },
    { route: ROUTES.ADMIN.SUBSCRIBED_CLIENTS, label: 'Subscribed Client', icon: 'subscription', color: '#ef4444' },
    { route: ROUTES.ADMIN.USERS, label: 'General Client', icon: 'general_client', color: '#f97316' },
    { route: ROUTES.ADMIN.ANALYTICS, label: 'Accounts', icon: 'accounts', color: '#ec4899' },
    { route: ROUTES.ADMIN.EMPLOYEE, label: 'Employee', icon: 'employee', color: '#3b82f6' },
    { route: null, label: 'Projects', icon: 'projects', color: '#f43f5e' },
    { route: ROUTES.ADMIN.COMPLIANCE, label: 'Compliance', icon: 'compliance', color: '#8b5cf6' },
    { route: ROUTES.ADMIN.PARTNERS, label: 'Partner', icon: 'partners', color: '#38b34a' },
    { route: null, label: 'Reports', icon: 'reports', color: '#f59e0b' },
    { route: ROUTES.ADMIN.SUPPORT, label: 'Support', icon: 'support', color: '#06b6d4' },
    { route: ROUTES.ADMIN.SETTINGS, label: 'Settings', icon: 'settings', color: '#6366f1' },
  ]

  const renderIcon = (type, isActive) => {
    const iconClass = `w-4.5 h-4.5 ${isActive ? 'text-[#38b34a]' : ''}`
    if (type === 'dashboard') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>
    if (type === 'clients') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="8" r="3.5" /><path d="M4 18c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" /><path d="M16 11h5m-2.5-2.5v5" /></svg>
    if (type === 'products') return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    )
    if (type === 'partners') return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4.5" />
        <path d="M6 10V8a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v9a7 7 0 0 0 7 7h3a7 7 0 0 0 7-7v-6" />
      </svg>
    )
    if (type === 'subscription') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 11h18" /></svg>
    if (type === 'general_client') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="3.5" /><path d="M5 19c0-3 3-5 7-5s7 2 7 5" /><path d="M17 11l1.5 1.5L21 10" /></svg>
    if (type === 'accounts') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M4 7h16v10H4z" /><path d="M7 11h4" /></svg>
    if (type === 'employee') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="3.5" /><path d="M5 19c0-3 3-5 7-5s7 2 7 5" /></svg>
    if (type === 'projects') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
    if (type === 'compliance') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 3l7 3v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" /></svg>
    if (type === 'reports') return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )
    if (type === 'support') return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
    if (type === 'settings') return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )
    return null
  }

  return (
    <div className="h-screen w-screen bg-[#eaecf4] flex select-none overflow-hidden">
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

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar — fixed height, no scroll on the aside itself */}
      <aside className={`w-56 shrink-0 bg-[#b0b2ba] border-r border-slate-300/60 flex flex-col shadow-lg fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>

        {/* ── STICKY TOP: Logo + ADMIN badge ── */}
        <div className="shrink-0 p-3 pb-2">
          {/* Logo */}
          <div className="bg-white rounded-xl py-1.5 px-3 shadow-md border border-slate-200/50 flex items-center justify-between h-14 gap-2">
            <img src={logoImg} alt="NEXGN Logo" className="max-h-12 object-contain" />
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 text-slate-500 hover:text-slate-700 lg:hidden rounded-lg focus:outline-none cursor-pointer"
              aria-label="Close Sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* ADMIN capsule */}
          <div className="mt-3 mx-auto w-[110px] rounded-lg bg-white text-[#ff6600] text-center py-1 text-[10px] font-black tracking-[0.4em] shadow-md border border-slate-200/30">
            ADMIN
          </div>
        </div>

        {/* ── SCROLLABLE MIDDLE: Nav Items only ── */}
        <nav className="flex-grow overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-400/40 scrollbar-track-transparent">
          {menuItems.map((item) => {
            const isActive = item.route ? location.pathname === item.route : false
            const commonClasses =
              'w-full flex items-center gap-2.5 rounded-full px-3.5 py-2.5 text-xs transition-all cursor-pointer relative shadow-sm border select-none'

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.route) {
                    navigate(item.route)
                    setIsSidebarOpen(false)
                  }
                }}
                className={`${commonClasses} ${isActive
                    ? 'bg-white border-slate-200 text-[#38b34a] shadow-slate-400/20 font-bold'
                    : 'bg-[#f3f4f6]/95 border-slate-200/30 text-slate-700 hover:border-slate-300 hover:bg-white transition-all font-semibold'
                  }`}
              >
                {/* Active navigation left border arc style */}
                {isActive ? (
                  <div
                    className="absolute inset-0 rounded-full border-[3px] border-[#38b34a] pointer-events-none"
                    style={{ clipPath: 'polygon(0 0, 45% 0, 45% 100%, 0 100%)' }}
                  />
                ) : null}

                {/* Icon Box */}
                <span
                  className="w-6 h-6 rounded-md bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0"
                  style={{ color: isActive ? '#38b34a' : item.color }}
                >
                  {renderIcon(item.icon, isActive)}
                </span>

                {/* Label */}
                <span className="text-xs tracking-wide">
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* ── STICKY BOTTOM: Logout ── */}
        <div className="shrink-0 p-3 pt-2">
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 py-2 text-red-600 text-xs font-bold cursor-pointer shadow-sm transition-colors active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Isolated Scroll */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#f3f5fa] h-full overflow-hidden">

        {/* Sticky Top Header Bar */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            {/* Hamburger button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 cursor-pointer transition-colors active:scale-95 lg:hidden shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-slate-400 font-sans truncate hidden md:inline-block">
              {(() => {
                if (location.pathname === ROUTES.ADMIN.DASHBOARD) return "Welcome back! Here's your business overview for June 2026."
                if (location.pathname === ROUTES.ADMIN.USERS) return "Manage your client accounts."
                if (location.pathname === ROUTES.ADMIN.SAAS_CLIENTS) return "Manage SaaS clients and deliveries."
                if (location.pathname === ROUTES.ADMIN.SUBSCRIBED_CLIENTS) return "Manage client subscriptions, customization requests, and payment reports."
                if (location.pathname === ROUTES.ADMIN.PRODUCTS) return "Manage your products, categories, sub-categories, and discounts."
                if (location.pathname === ROUTES.ADMIN.SETTINGS) return "Manage your products, categories, sub-categories, and discounts."
                if (location.pathname === ROUTES.ADMIN.ANALYTICS) return "Manage financial records and statements."
                if (location.pathname === ROUTES.ADMIN.PARTNERS) return "Manage partner accounts and sales."
                if (location.pathname === ROUTES.ADMIN.EMPLOYEE) return "Manage your employees, attendance, leave, and payroll."
                if (location.pathname === ROUTES.ADMIN.COMPLIANCE) return "Review corporate compliance, audit logs, and tax filings."
                return "Manage your company overview."
              })()}
            </span>
            <span className="text-sm font-bold text-slate-800 font-sans md:hidden">
              {(() => {
                const matchedItem = menuItems.find(item => item.route === location.pathname)
                return matchedItem ? matchedItem.label : 'Admin Portal'
              })()}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Dynamic Date display with calendar icon formatted as Fri, 05 Jun 2026 */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50/70 border border-slate-200/40 rounded-lg px-3 py-2 hidden sm:flex">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {(() => {
                  const d = new Date()
                  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  const dayName = days[d.getDay()]
                  const dateNum = String(d.getDate()).padStart(2, '0')
                  const monthName = months[d.getMonth()]
                  const year = d.getFullYear()
                  return `${dayName}, ${dateNum} ${monthName} ${year}`
                })()}
              </span>
            </div>

            {/* Notification Bell Icon */}
            <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer relative active:scale-95">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Dot */}
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
            </button>

            {/* Profile Avatar & Name next to it */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700 font-sans hidden sm:inline-block">
                {user?.name || user?.username || 'Admin'}
              </span>
              <button
                type="button"
                className="w-10 h-10 rounded-full border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white cursor-pointer active:scale-95 transition-all outline-none"
                onClick={() => navigate(ROUTES.ADMIN.SETTINGS)}
              >
                {user?.profile_image ? (
                  <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-7 h-7 mt-1.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content Workspace - Independent Scroll Container */}
        <main className="flex-grow p-6 overflow-y-auto bg-[#f3f5fa]">
          <Outlet />
        </main>
      </div>

    </div>
  )
}

export default AdminLayout