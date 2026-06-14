import { useState, useEffect } from 'react'
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom'
import logoImg from '../../assets/images/plogo.jpeg'

/* ─────────────────────── DEMO DATA ─────────────────────── */
const DEMO_USER = { name: 'Demo Admin', role: 'demo', email: 'demo@nexgn.in' }

const navGroups = [
  {
    title: 'OVERVIEW',
    items: [
      { path: '/demo', label: 'Dashboard', icon: 'dashboard', exact: true },
      { path: '/demo/saas-clients', label: 'SaaS Clients', icon: 'clients' },
      { path: '/demo/subscription', label: 'Subscribed Client', icon: 'subscription' },
      { path: '/demo/users', label: 'General Client', icon: 'general_client' },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { path: '/demo/accounts', label: 'Accounts', icon: 'accounts' },
      { path: '/demo/employee', label: 'Employee', icon: 'employee' },
      { path: '/demo/projects', label: 'Projects', icon: 'projects' },
      { path: '/demo/compliance', label: 'Compliance', icon: 'compliance' },
    ],
  },
  {
    title: 'GROWTH',
    items: [
      { path: '/demo/partners', label: 'Partner', icon: 'partners' },
      { path: '/demo/reports', label: 'Reports', icon: 'reports' },
      { path: '/demo/support', label: 'Support', icon: 'support' },
      { path: '/demo/settings', label: 'Settings', icon: 'settings' },
    ],
  },
]

const renderIcon = (type, isActive) => {
  const c = `w-[18px] h-[18px] ${isActive ? 'text-[#38b34a]' : ''}`
  switch (type) {
    case 'dashboard': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
    case 'clients': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="9" cy="8" r="3.5"/><path d="M4 18c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"/><path d="M16 11h5m-2.5-2.5v5"/></svg>
    case 'subscription': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 11h18"/></svg>
    case 'general_client': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="8" r="3.5"/><path d="M5 19c0-3 3-5 7-5s7 2 7 5"/><path d="M17 11l1.5 1.5L21 10"/></svg>
    case 'accounts': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 7h16v10H4z"/><path d="M7 11h4"/></svg>
    case 'employee': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="8" r="3.5"/><path d="M5 19c0-3 3-5 7-5s7 2 7 5"/></svg>
    case 'projects': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
    case 'compliance': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 3l7 3v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"/></svg>
    case 'partners': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 11V6a2 2 0 00-2-2 2 2 0 00-2 2v5M14 10V4a2 2 0 00-2-2 2 2 0 00-2 2v6M10 10.5V6a2 2 0 00-2-2 2 2 0 00-2 2v4.5M6 10V8a2 2 0 00-2-2 2 2 0 00-2 2v9a7 7 0 007 7h3a7 7 0 007-7v-6"/></svg>
    case 'reports': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
    case 'support': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    case 'settings': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    default: return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="4"/></svg>
  }
}

const DemoPortal = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    document.documentElement.classList.add('dark')
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => { clearInterval(t); document.documentElement.classList.remove('dark') }
  }, [])

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path) && !(exact === undefined && path === '/demo' && location.pathname !== '/demo')

  const dateStr = (() => {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${days[now.getDay()]}, ${String(now.getDate()).padStart(2,'0')} ${months[now.getMonth()]} ${now.getFullYear()}`
  })()

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: '#0f1117' }}>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden" />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`w-[230px] shrink-0 flex flex-col h-full fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#13151f', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-300 lg:hidden rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <img src={logoImg} alt="AIM Logo" className="h-8 w-8 rounded-lg object-cover" />
          <div>
            <p className="text-[13px] font-black text-white leading-tight">AIM Digitalise</p>
            <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: 'linear-gradient(90deg,#38b34a,#22d3ee)', color: '#000' }}>DEMO</span>
          </div>
        </div>

        {/* User Section */}
        <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0" style={{ background: 'linear-gradient(135deg,#38b34a,#22d3ee)' }}>D</div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white truncate">{DEMO_USER.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{DEMO_USER.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] px-3 mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{group.title}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.exact
                    ? location.pathname === item.path
                    : location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] font-semibold transition-all duration-150 ${active ? 'text-[#38b34a]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      style={active ? { background: 'rgba(56,179,74,0.12)', color: '#38b34a' } : {}}
                    >
                      <span className={active ? 'text-[#38b34a]' : 'text-gray-500'}>{renderIcon(item.icon, active)}</span>
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/demo/punch-in" onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer"
            style={{ background: 'linear-gradient(90deg,#38b34a22,#22d3ee22)', color: '#38b34a', border: '1px solid #38b34a33' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"/></svg>
            Employee Punch In
          </Link>
          <button
            onClick={() => { document.documentElement.classList.remove('dark'); navigate('/') }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Exit Demo
          </button>
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <header className="px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0" style={{ background: '#13151f', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 cursor-pointer transition-colors lg:hidden shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div className="hidden md:flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(56,179,74,0.12)', color: '#38b34a', border: '1px solid rgba(56,179,74,0.3)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#38b34a' }} />
              Demo Mode — All data is simulated
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-gray-500 bg-white/5 rounded-lg px-3 py-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              {dateStr}
            </div>
            <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors cursor-pointer relative">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500 border border-[#13151f]" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-gray-300 hidden sm:inline">{DEMO_USER.name}</span>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black" style={{ background: 'linear-gradient(135deg,#38b34a,#22d3ee)' }}>D</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto" style={{ background: '#0f1117' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DemoPortal
