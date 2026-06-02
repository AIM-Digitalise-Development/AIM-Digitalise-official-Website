import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import { adminLogout } from '../api/adminAuth'

const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, role, logout } = useAuth()

  // Wait for Zustand persist rehydration
  const [ready, setReady] = useState(false)
  useEffect(() => {
    // Zustand's persist middleware hydrates asynchronously.
    // We can assume after first render the store is ready.
    setReady(true)
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
      // Proceed with client-side logout anyway
    } finally {
      logout()                  // clear Zustand store + localStorage
      navigate(ROUTES.HOME)     // redirect to public home
    }
  }

  // Don't render the admin shell until we're sure user is allowed
  if (!ready || !isAuthenticated || role !== 'admin') {
    return null // or a loading spinner
  }

  const menuItems = [
    { route: ROUTES.ADMIN.DASHBOARD, label: 'Dashboard', icon: 'dashboard', color: '#4CAF50' },
    { route: ROUTES.ADMIN.USERS, label: 'Clients', icon: 'clients', color: '#FF9800' },
    { route: ROUTES.ADMIN.SETTINGS, label: 'Subscription', icon: 'subscription', color: '#ff6666' },
    { route: ROUTES.ADMIN.ANALYTICS, label: 'Accounts', icon: 'accounts', color: '#E91E63' },
    { route: null, label: 'Employee', icon: 'employee', color: '#2196F3' },
    { route: null, label: 'Projects', icon: 'projects', color: '#E91E63' },
    { route: null, label: 'Compliance', icon: 'compliance', color: '#9C27B0' },
    { route: null, label: 'Partner', icon: 'partner', color: '#FF5722' },
    { route: null, label: 'Reports', icon: 'reports', color: '#ebba19' },
    { route: null, label: 'Support', icon: 'support', color: '#3150db' },
    { route: null, label: 'Settings', icon: 'settings', color: '#607D8B' },
  ]

  const renderIcon = (type) => {
    const iconClass = 'w-[15px] h-[15px]'
    if (type === 'dashboard') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></svg>
    if (type === 'clients') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3" /><path d="M4 18c0-2.8 2.2-5 5-5s5 2.2 5 5" /><path d="M17 8h3M18.5 6.5v3" /></svg>
    if (type === 'subscription') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></svg>
    if (type === 'accounts') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 7h16v10H4z" /><path d="M7 11h5" /></svg>
    if (type === 'employee') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7.5" r="3" /><path d="M5 19c0-3.2 3-5.5 7-5.5s7 2.3 7 5.5" /></svg>
    if (type === 'projects') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 8h7l2 2h9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
    if (type === 'compliance') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" /></svg>
    if (type === 'partner') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 12l-3 3a2.5 2.5 0 0 0 0 3.5 2.5 2.5 0 0 0 3.5 0l3.5-3.5" /><path d="M15 12l3-3a2.5 2.5 0 0 0 0-3.5 2.5 2.5 0 0 0-3.5 0L11 9" /></svg>
    if (type === 'reports') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 3h9l3 3v15H6z" /><path d="M9 12h6M9 16h6" /></svg>
    if (type === 'support') return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 1 1 4.8 2.4c-.9.7-1.4 1.3-1.4 2.6" /><circle cx="12" cy="17" r=".8" fill="currentColor" stroke="none" /></svg>
    return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.8 1.8 0 1 1-3.6 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.8 1.8 0 1 1 0-3.6h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4a1.8 1.8 0 1 1 3.6 0v.2a1 1 0 0 0 .6.9h.1a1 1 0 0 0 1.1-.2l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6H20a1.8 1.8 0 1 1 0 3.6h-.2a1 1 0 0 0-.9.6z" /></svg>
  }

  return (
    <div className="min-h-screen bg-[#eaecf4] p-2 lg:p-4">
      <div className="mx-auto flex max-w-[1600px] gap-0">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 rounded-l-[16px] rounded-r-none bg-[#aeb0b8] border border-slate-300/70 p-4 shadow-lg shadow-slate-400/30 flex flex-col relative z-10">
          <div className="rounded-xl bg-transparent py-2">
            <img
              src="https://picsum.photos/seed/nexgn-logo/220/80"
              alt="NEXGN logo placeholder"
              className="w-[160px] h-20 mx-auto object-cover rounded-[4px] shadow-sm"
            />
          </div>
          <div className="mt-2 mx-auto w-[145px] rounded-lg bg-white text-[#ff6600] text-center py-2 text-sm font-black tracking-[0.5em] shadow-md">
            ADMIN
          </div>

          <nav className="mt-4 space-y-2 pr-0">
            {menuItems.map((item) => {
              const isActive = item.route ? location.pathname === item.route : false
              const commonClasses =
                'w-full flex items-center gap-3 rounded-full px-4 py-3 text-sm border transition cursor-pointer relative'

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => item.route && navigate(item.route)}
                  className={`${commonClasses} ${
                    isActive
                      ? 'bg-[#f8f9fc] border-[#e4e7ec] text-[#1f2937] shadow-sm'
                      : 'bg-[#f2f4f7] border-transparent text-[#2b2f38] hover:border-[#d6d9df]'
                  }`}
                >
                  {isActive ? (
                    <span className="absolute -right-5 top-0 h-full w-8 bg-[#f3f5fa]" aria-hidden />
                  ) : null}
                  {isActive ? (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-[3px] border-[#38b34a] border-r-transparent border-b-transparent" />
                  ) : null}
                  <span
                    className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center"
                    style={{ color: item.color }}
                  >
                    {renderIcon(item.icon)}
                  </span>
                  <span
                    className={`text-base ${
                      isActive ? 'text-[#2ca746] font-bold' : 'text-[#222733] font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Logout button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#efc9c9] bg-[#fdf3f3] py-2.5 text-[#d74d4d] text-base font-medium cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 rounded-r-[16px] rounded-l-none border border-l-0 border-slate-200/80 bg-[#f3f5fa] p-4 lg:p-5 shadow-inner shadow-white/70">
          <div className="rounded-xl bg-white/85 border border-slate-200/70 px-4 py-3 mb-4 text-sm text-slate-500 shadow-sm">
            Welcome back! Here&apos;s your business overview.
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout