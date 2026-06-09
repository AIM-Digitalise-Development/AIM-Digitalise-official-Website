// src/layouts/RootLayout.jsx

import { useEffect, useRef, useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import AdminEmployeeLoginModal from '../components/auth/AdminEmployeeLoginModal'
import logo from '../assets/images/logo.png';
import useUIStore from '../store/uiStore'

const RootLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isFooterLoginMenuOpen, setIsFooterLoginMenuOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loginModalRole, setLoginModalRole] = useState('employee')
  const footerLoginMenuRef = useRef(null)
  const location = useLocation()
  const { theme, setTheme } = useUIStore()
  
  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const navLinks = [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'About Us', path: ROUTES.ABOUT },
    { name: 'Monthly Subscription', path: ROUTES.SUBSCRIPTION },
    { name: 'Services', path: ROUTES.SERVICES },
    { name: 'Coding Classes', path: ROUTES.CODING_CLASSES },
    { name: 'Portfolio', path: ROUTES.PORTFOLIO },
    { name: 'Career', path: ROUTES.CAREER },
    { name: 'Contact Us', path: ROUTES.CONTACT },
  ]
  
  const isActive = (path) => location.pathname === path

  useEffect(() => {
    if (!isFooterLoginMenuOpen) return

    const onMouseDown = (e) => {
      const target = e?.target
      if (!footerLoginMenuRef.current) return
      if (target && footerLoginMenuRef.current.contains(target)) return
      setIsFooterLoginMenuOpen(false)
    }

    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [isFooterLoginMenuOpen])

  return (
    <div className={`min-h-screen flex flex-col website-root transition-colors duration-300 ${theme === 'dark' ? 'dark bg-mesh-brand' : 'bg-white'}`}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full">
        <div className={`transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-aim-navy/95 dark:bg-aim-navy/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' 
            : 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm shadow-slate-200/80'
        }`}>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-aim-gold/40 dark:via-aim-gold/50 to-transparent pointer-events-none" aria-hidden />
          <nav className="container-custom py-3">
            <div className="flex justify-between items-center gap-4">
              {/* Logo */}
              <Link to="/" className="flex-shrink-0 group">
                <img 
                  src={logo} 
                  alt="AIM Logo" 
                  className="w-12 h-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                />
              </Link>
              
              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center justify-center flex-1">
                <div className={`flex items-center gap-1 xl:gap-2 rounded-full px-2 py-1 transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-white/5' 
                    : 'bg-slate-100/80'
                }`}>
                  {navLinks.map((link) => (
                    <Link 
                      key={link.name} 
                      to={link.path} 
                      className={`relative px-3 py-2 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap ${
                        isActive(link.path) 
                          ? theme === 'dark'
                            ? 'text-aim-highlight bg-aim-navy-card shadow-md'
                            : 'text-blue-600 bg-white shadow-md'
                          : theme === 'dark'
                            ? 'text-aim-copy-muted hover:text-aim-highlight hover:bg-white/10'
                            : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center gap-3">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    theme === 'dark'
                      ? 'hover:bg-white/10 text-aim-copy-muted'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
                
                <Link
                  to="/partner/login"
                  className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap ${
                    theme === 'dark'
                      ? 'bg-aim-gold text-aim-navy hover:bg-aim-gold-dark'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Partner Login
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    theme === 'dark'
                      ? 'hover:bg-white/10 text-aim-copy-muted'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                  aria-label="Toggle menu"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="lg:hidden mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                <div className="space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive(link.path)
                          ? theme === 'dark'
                            ? 'bg-aim-gold/15 text-aim-highlight'
                            : 'bg-blue-50 text-blue-600'
                          : theme === 'dark'
                            ? 'text-aim-copy-muted hover:bg-white/5'
                            : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  
                  <div className="pt-4 mt-2 border-t border-slate-200 dark:border-white/10 space-y-2">
                    <button
                      onClick={() => {
                        setTheme(theme === 'dark' ? 'light' : 'dark')
                        setIsMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                        theme === 'dark'
                          ? 'border-white/10 text-aim-copy-muted hover:bg-white/5'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {theme === 'dark' ? (
                        <>
                          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                          </svg>
                          Light Mode
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                          Dark Mode
                        </>
                      )}
                    </button>
                    
                    <Link
                      to="/partner/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block text-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-aim-gold text-aim-navy hover:bg-aim-gold-dark'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Partner Login
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-grow relative">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className={`py-16 mt-auto relative overflow-hidden border-t transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-aim-navy-light/90 border-white/10 text-on-navy'
          : 'bg-slate-100 border-slate-200 text-slate-700'
      }`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-30 dark:opacity-50 pointer-events-none" aria-hidden />
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          theme === 'dark' ? 'bg-aim-gold/10' : 'bg-blue-500/5'
        }`} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          theme === 'dark' ? 'bg-aim-purple/12' : 'bg-purple-500/5'
        }`} />
        <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none ${
          theme === 'dark' ? 'dark:from-aim-gold/30 dark:via-aim-purple/30 dark:to-aim-gold/30' : ''
        }`} aria-hidden />

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            
            {/* Column 1: Quick Links */}
            <div>
              <h3 className={`text-xs font-black tracking-widest uppercase mb-6 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  theme === 'dark' ? 'bg-aim-gold' : 'bg-blue-500'
                }`}></span>
                QUICK LINKS
              </h3>
              <ul className="space-y-2.5">
                {[
                  { name: 'Home', path: ROUTES.HOME },
                  { name: 'About Us', path: ROUTES.ABOUT },
                  { name: 'Our Services', path: ROUTES.SERVICES },
                  { name: 'Portfolio', path: ROUTES.PORTFOLIO },
                  { name: 'Career', path: ROUTES.CAREER },
                  { name: 'Contact Us', path: ROUTES.CONTACT },
                  { name: 'Available Location', path: '/available-location' },
                  { name: 'Download Portfolio', path: '/download-portfolio' },
                  { name: 'Privacy Policy', path: '/privacy-policy' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className={`flex items-center gap-2 group text-[13px] font-medium transition-colors ${
                      theme === 'dark'
                        ? 'text-aim-copy hover:text-aim-highlight'
                        : 'text-slate-600 hover:text-blue-600'
                    }`}>
                      <svg className={`w-3 h-3 transition-all group-hover:translate-x-0.5 ${
                        theme === 'dark'
                          ? 'text-aim-highlight/70 group-hover:text-aim-highlight'
                          : 'text-blue-400 group-hover:text-blue-600'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Address */}
            <div>
              <h3 className={`text-xs font-black tracking-widest uppercase mb-6 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  theme === 'dark' ? 'bg-aim-gold' : 'bg-blue-500'
                }`}></span>
                ADDRESS
              </h3>
              <div className="space-y-4 text-[13px]">
                <div className={`p-3 rounded-xl border shadow-sm ${
                  theme === 'dark'
                    ? 'border-white/10 bg-aim-navy-light/50'
                    : 'border-slate-200 bg-white'
                }`}>
                  <div className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    <span>Corporate Office</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                      theme === 'dark'
                        ? 'bg-aim-gold/15 text-aim-gold border-aim-gold/30'
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>India</span>
                  </div>
                  <p className={`mt-2 leading-relaxed flex gap-2 ${
                    theme === 'dark' ? 'text-on-navy-muted' : 'text-slate-500'
                  }`}>
                    <svg className={`w-4 h-4 shrink-0 mt-0.5 ${
                      theme === 'dark' ? 'text-aim-gold/80' : 'text-amber-500'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>#139, 3rd Floor, Rajdanga Main Road, Kolkata - 700107</span>
                  </p>
                </div>

                <div className={`p-3 rounded-xl border shadow-sm ${
                  theme === 'dark'
                    ? 'border-white/10 bg-aim-navy-light/50'
                    : 'border-slate-200 bg-white'
                }`}>
                  <div className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    <span>Branch Office</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                      theme === 'dark'
                        ? 'bg-aim-gold/15 text-aim-gold border-aim-gold/30'
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>India</span>
                  </div>
                  <p className={`mt-2 leading-relaxed flex gap-2 ${
                    theme === 'dark' ? 'text-on-navy-muted' : 'text-slate-500'
                  }`}>
                    <svg className={`w-4 h-4 shrink-0 mt-0.5 ${
                      theme === 'dark' ? 'text-aim-gold/80' : 'text-amber-500'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>21/1F, Fern Road, 1st Floor Lalvilla, Ballygunge Kolkata - 700019</span>
                  </p>
                </div>

                <div className={`p-3 rounded-xl border shadow-sm ${
                  theme === 'dark'
                    ? 'border-white/10 bg-aim-navy-light/50'
                    : 'border-slate-200 bg-white'
                }`}>
                  <div className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    <span>Branch Office</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                      theme === 'dark'
                        ? 'bg-aim-purple/15 text-aim-purple-light border-aim-purple/30'
                        : 'bg-purple-50 text-purple-600 border-purple-200'
                    }`}>USA</span>
                  </div>
                  <p className={`mt-2 leading-relaxed flex gap-2 ${
                    theme === 'dark' ? 'text-on-navy-muted' : 'text-slate-500'
                  }`}>
                    <svg className={`w-4 h-4 shrink-0 mt-0.5 ${
                      theme === 'dark' ? 'text-aim-purple-light/80' : 'text-purple-500'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>5916 Frio Dr, Midland, TX 79707, USA</span>
                  </p>
                </div>

                <div className={`flex items-center gap-2 py-2 px-3 rounded-lg border shadow-sm ${
                  theme === 'dark'
                    ? 'border-white/10 bg-aim-navy-light/50 text-on-navy-muted'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}>
                  <svg className={`w-4 h-4 shrink-0 ${
                    theme === 'dark' ? 'text-aim-gold/80' : 'text-amber-500'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Office Timings: 10 a.m to 7 p.m</span>
                </div>

                <div className={`text-[11px] font-bold uppercase tracking-widest pl-1 ${
                  theme === 'dark' ? 'text-on-navy-muted' : 'text-slate-400'
                }`}>
                  GST NO: <span className={theme === 'dark' ? 'text-white' : 'text-slate-700'}>19ABCCA9672L1Z0</span>
                </div>
              </div>
            </div>

            {/* Column 3: Support */}
            <div>
              <h3 className={`text-xs font-black tracking-widest uppercase mb-6 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  theme === 'dark' ? 'bg-aim-gold' : 'bg-blue-500'
                }`}></span>
                SUPPORT
              </h3>
              <div className="space-y-4 text-[13px]">
                {[
                  { label: 'Sales Support', value: '+91 98755 92050', href: 'tel:+919875592050' },
                  { label: 'Technical Support', value: '033 6618 2659', href: 'tel:03366182659' },
                  { label: 'USA Support', value: '+1 (210) 209-9575', href: 'tel:+12102099575' },
                ].map((item) => (
                  <div key={item.label}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      theme === 'dark' ? 'text-aim-copy-muted' : 'text-slate-400'
                    }`}>{item.label}</span>
                    <a href={item.href} className={`inline-flex items-center gap-2 mt-1 transition-colors ${
                      theme === 'dark'
                        ? 'text-white/90 hover:text-aim-gold'
                        : 'text-slate-700 hover:text-blue-600'
                    }`}>
                      <svg className={`w-3.5 h-3.5 ${
                        theme === 'dark' ? 'text-aim-gold/80' : 'text-amber-500'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="font-semibold">{item.value}</span>
                    </a>
                  </div>
                ))}

                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    theme === 'dark' ? 'text-aim-copy-muted' : 'text-slate-400'
                  }`}>Whatsapp</span>
                  <a href="https://wa.me/916290902922" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 mt-1 transition-colors ${
                    theme === 'dark'
                      ? 'text-white/90 hover:text-aim-gold'
                      : 'text-slate-700 hover:text-blue-600'
                  }`}>
                    <svg className={`w-3.5 h-3.5 ${
                      theme === 'dark' ? 'text-aim-gold/80' : 'text-amber-500'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-semibold">+91 62909 02922</span>
                  </a>
                </div>

                <div className={`pt-3 border-t ${
                  theme === 'dark' ? 'border-white/10' : 'border-slate-200'
                }`}>
                  <a href="mailto:support@aimdigitalise.com" className={`inline-flex items-center gap-2 transition-colors ${
                    theme === 'dark'
                      ? 'text-on-navy-muted hover:text-aim-gold'
                      : 'text-slate-500 hover:text-blue-600'
                  }`}>
                    <svg className={`w-3.5 h-3.5 ${
                      theme === 'dark' ? 'text-aim-gold/80' : 'text-amber-500'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>support@aimdigitalise.com</span>
                  </a>
                </div>

                <div className="pt-1 relative" ref={footerLoginMenuRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFooterLoginMenuOpen((v) => !v)
                    }}
                    className={`inline-flex items-center gap-1.5 transition-colors font-semibold group cursor-pointer ${
                      theme === 'dark'
                        ? 'text-white/90 hover:text-aim-gold'
                        : 'text-slate-700 hover:text-blue-600'
                    }`}
                    aria-haspopup="menu"
                    aria-expanded={isFooterLoginMenuOpen}
                  >
                    <svg
                      className={`w-3 h-3 transition-all group-hover:translate-x-0.5 ${
                        theme === 'dark'
                          ? 'text-aim-gold/70 group-hover:text-aim-gold'
                          : 'text-blue-400 group-hover:text-blue-600'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Login</span>
                  </button>

                  {isFooterLoginMenuOpen && (
                    <div
                      role="menu"
                      className={`absolute right-0 mt-2 w-52 rounded-xl border shadow-xl overflow-hidden ${
                        theme === 'dark'
                          ? 'bg-aim-navy-card border-white/10 shadow-brand-gold/10'
                          : 'bg-white border-slate-200 shadow-lg'
                      }`}
                    >
                      <button
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          setLoginModalRole('employee')
                          setIsFooterLoginMenuOpen(false)
                          setIsLoginModalOpen(true)
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-semibold transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-on-navy-muted hover:text-white hover:bg-white/5'
                            : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        Employee Login
                      </button>
                      <button
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          setLoginModalRole('admin')
                          setIsFooterLoginMenuOpen(false)
                          setIsLoginModalOpen(true)
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-semibold transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-on-navy-muted hover:text-white hover:bg-aim-purple/10'
                            : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        Admin Login
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Column 4: Follow Us */}
            <div>
              <h3 className={`text-xs font-black tracking-widest uppercase mb-6 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  theme === 'dark' ? 'bg-aim-gold' : 'bg-blue-500'
                }`}></span>
                FOLLOW US
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Facebook', href: 'https://facebook.com', label: 'FB' },
                  { name: 'Google', href: 'https://google.com', label: 'G' },
                  { name: 'Linkedin', href: 'https://linkedin.com', label: 'LN' },
                  { name: 'Instagram', href: 'https://instagram.com', label: 'IG' },
                  { name: 'YouTube', href: 'https://youtube.com', label: 'YT' },
                  { name: 'Quora', href: 'https://quora.com', label: 'Q' },
                  { name: 'X', href: 'https://x.com', label: 'X' },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-300 text-xs font-semibold ${
                      theme === 'dark'
                        ? 'border-white/10 bg-aim-navy-light/50 text-on-navy-muted hover:text-aim-gold hover:border-aim-gold/40 hover:bg-white/5'
                        : 'border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold shrink-0 ${
                      theme === 'dark'
                        ? 'bg-aim-gold/10 text-aim-gold'
                        : 'bg-blue-50 text-blue-600'
                    }`}>{item.label}</span>
                    <span>{item.name}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>

          <div className={`border-t mt-16 pt-8 text-center text-xs ${
            theme === 'dark'
              ? 'border-white/10 text-on-navy-muted'
              : 'border-slate-200 text-slate-400'
          }`}>
            <p>Copyright Update© 2026. All Rights Reserved by AIM Digitalise Pvt. Ltd.</p>
          </div>
        </div>
      </footer>

      <AdminEmployeeLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialRole={loginModalRole}
      />
    </div>
  )
}

export default RootLayout