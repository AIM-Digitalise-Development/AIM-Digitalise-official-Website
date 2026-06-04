import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import { adminLogout } from '../api/adminAuth'

const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, role, logout } = useAuth()

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
      navigate(ROUTES.HOME)     // redirect to public home
    }
  }

  if (!ready || !isAuthenticated || role !== 'admin') {
    return null
  }

  // Exact menu items from the screenshot
  const menuItems = [
    { route: ROUTES.ADMIN.DASHBOARD, label: 'Dashboard', icon: 'dashboard', color: '#10b981' },
    { route: ROUTES.ADMIN.USERS, label: 'Clients', icon: 'clients', color: '#f59e0b' },
    { route: ROUTES.ADMIN.PARTNERS, label: 'Partners', icon: 'partners', color: '#8b5cf6' },
    { route: ROUTES.ADMIN.SETTINGS, label: 'Subscription', icon: 'subscription', color: '#ef4444' },
    { route: ROUTES.ADMIN.ANALYTICS, label: 'Accounts', icon: 'accounts', color: '#ec4899' },
    { route: null, label: 'Employee', icon: 'employee', color: '#3b82f6' },
    { route: null, label: 'Projects', icon: 'projects', color: '#f43f5e' },
    { route: null, label: 'Compliance', icon: 'compliance', color: '#8b5cf6' },
  ]

  const renderIcon = (type, isActive) => {
    const iconClass = `w-4 h-4 ${isActive ? 'text-[#38b34a]' : ''}`
    if (type === 'dashboard') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>
    if (type === 'clients') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="8" r="3.5" /><path d="M4 18c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" /><path d="M16 11h5m-2.5-2.5v5" /></svg>
    if (type === 'partners') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    if (type === 'subscription') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 11h18" /></svg>
    if (type === 'accounts') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M4 7h16v10H4z" /><path d="M7 11h4" /></svg>
    if (type === 'employee') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="3.5" /><path d="M5 19c0-3 3-5 7-5s7 2 7 5" /></svg>
    if (type === 'projects') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
    if (type === 'compliance') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 3l7 3v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" /></svg>
    return null
  }

  return (
    <div className="h-screen w-screen bg-[#eaecf4] flex flex-col lg:flex-row select-none overflow-hidden">
      
      {/* Sidebar Container with Isolated Scroll */}
      <aside className="w-full lg:w-72 shrink-0 bg-[#b0b2ba] border-r border-slate-300/60 p-5 flex flex-col justify-between shadow-lg relative z-25 overflow-y-auto h-auto lg:h-full">
        <div>
          {/* Custom Vector NEXGN Logo */}
          <div className="bg-white rounded-xl py-3 px-4 shadow-md border border-slate-200/50 flex flex-col items-center justify-center">
            <div className="flex items-center">
              <span className="text-3xl font-black tracking-tight text-slate-800">NEX</span>
              <span className="text-3xl font-black tracking-tight text-red-600">GN</span>
              <span className="text-[10px] font-bold text-slate-400 align-super ml-0.5 mt-[-10px]">&reg;</span>
            </div>
            <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-center font-sans">
              Solution Changing To Next Generation
            </span>
          </div>

          {/* ADMIN capsule */}
          <div className="mt-4 mx-auto w-[135px] rounded-lg bg-white text-[#ff6600] text-center py-1.5 text-xs font-black tracking-[0.5em] shadow-md border border-slate-200/30">
            ADMIN
          </div>

          {/* Sidebar Menu Items */}
          <nav className="mt-6 space-y-3.5">
            {menuItems.map((item) => {
              const isActive = item.route ? location.pathname === item.route : false
              const commonClasses =
                'w-full flex items-center gap-3.5 rounded-full px-5 py-3.5 text-sm transition-all cursor-pointer relative shadow-sm border select-none'

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => item.route && navigate(item.route)}
                  className={`${commonClasses} ${
                    isActive
                      ? 'bg-white border-slate-200 text-[#38b34a] shadow-slate-400/20 font-bold'
                      : 'bg-[#f3f4f6]/95 border-slate-200/30 text-slate-700 hover:border-slate-300 hover:bg-white transition-all font-semibold'
                  }`}
                >
                  {/* High fidelity SVG curved arc active indicator */}
                  {isActive ? (
                    <svg 
                      className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-[52px] h-[52px] text-[#38b34a] pointer-events-none z-10" 
                      viewBox="0 0 48 48" 
                      fill="none"
                      aria-hidden="true"
                    >
                      <path 
                        d="M 28 4 A 20 20 0 0 0 28 44" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        strokeLinecap="round" 
                      />
                    </svg>
                  ) : null}

                  {/* Icon Box */}
                  <span
                    className="w-7 h-7 rounded-md bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0"
                    style={{ color: isActive ? '#38b34a' : item.color }}
                  >
                    {renderIcon(item.icon, isActive)}
                  </span>
                  
                  {/* Label */}
                  <span className="text-sm tracking-wide">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 py-3 text-red-600 text-sm font-bold cursor-pointer shadow-sm transition-colors active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Isolated Scroll */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#f3f5fa] h-full overflow-hidden">
        
        {/* Sticky Top Header Bar */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3.5">
            {/* Hamburger button */}
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 cursor-pointer transition-colors active:scale-95">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-slate-500">
              Welcome back! Here's your business overview for June 2026.
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Dynamic Date display with calendar icon */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50/70 border border-slate-200/40 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Wed, 03 Jun 2026</span>
            </div>

            {/* Notification Bell Icon */}
            <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer relative active:scale-95">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Dot */}
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
            </button>

            {/* Profile Avatar Image */}
            <div className="w-10 h-10 rounded-full border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white cursor-pointer hover:scale-105 active:scale-95 transition-all">
              <svg className="w-7 h-7 mt-1.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
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