// src/layouts/RootLayout.jsx

import { useEffect, useRef, useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import AdminEmployeeLoginModal from '../components/auth/AdminEmployeeLoginModal'
import logo from '../assets/images/logo.png';
import useUIStore from '../store/uiStore'

const getSubIcon = (path) => {
  if (path.includes('saas-software') || path.includes('subscription')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
  if (path.includes('coding-classes')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    )
  }
  if (path.includes('digital-marketing')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    )
  }
  if (path.includes('digital-signature')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    )
  }
  if (path.includes('who-we-are')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  }
  if (path.includes('what-we-do')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  }
  if (path.includes('success-story')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

const RootLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openMobileDropdown, setOpenMobileDropdown] = useState('') // '' | 'About Us' | 'Services'
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

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setOpenMobileDropdown('')
    }
  }, [isMobileMenuOpen])

  const navLinks = [
    { name: 'Home', path: ROUTES.HOME },
    { 
      name: 'About Us', 
      path: ROUTES.ABOUT,
      subLinks: [
        { name: 'Who We Are?', path: `${ROUTES.ABOUT}#who-we-are`, desc: 'Discover our origin, team expertise & core mission.' },
        { name: 'What We Do?', path: `${ROUTES.ABOUT}#what-we-do`, desc: 'Explore our technology stacks, solutions & controllers.' },
        { name: 'Our Success Story', path: `${ROUTES.ABOUT}#success-story`, desc: 'Take a look at our timeline, achievements & satisfaction rate.' },
      ]
    },
    { 
      name: 'Services', 
      path: ROUTES.CUSTOM_DEVELOPMENT,
      subLinks: [
        { name: 'SaaS Based Software', path: ROUTES.SAAS_SOFTWARE, desc: 'Flexible flat-rate cloud software systems.' },
        { name: 'Custom Development', path: ROUTES.CUSTOM_DEVELOPMENT, desc: 'Web development, AI integrations & IT systems.' },
        { name: 'Digital Marketing', path: ROUTES.DIGITAL_MARKETING, desc: 'SEO, SEM, social media growth & branding.' },
        { name: 'Digital Signature', path: ROUTES.DIGITAL_SIGNATURE, desc: 'Secure DSC issuance and e-sign integrations.' },
        { name: 'Coding Classes', path: ROUTES.CODING_CLASSES, desc: 'Learn programming, design principles & architecture.' },
      ]
    },
    { name: 'Portfolio', path: ROUTES.PORTFOLIO },
    { name: 'Career', path: ROUTES.CAREER },
    { name: 'Contact Us', path: ROUTES.CONTACT },
  ]
  
  const isActive = (path) => location.pathname === path

  const isLinkActive = (link) => {
    if (link.subLinks) {
      return link.subLinks.some(sub => location.pathname === sub.path)
    }
    return location.pathname === link.path
  }

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
              <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group">
                <img 
                  src={logo} 
                  alt="AIM Logo" 
                  className="w-12 h-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                />
                <span className={`font-sans font-black text-sm sm:text-base tracking-wide transition-colors duration-300 ${
                  theme === 'dark'
                    ? 'text-white group-hover:text-aim-gold'
                    : 'text-slate-800 group-hover:text-blue-600'
                }`}>
                  AIM Digitalise <span className="text-[10px] font-normal tracking-normal uppercase opacity-75 sm:inline hidden">Pvt. Ltd.</span>
                </span>
              </Link>
              
              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center justify-center flex-1">
                <div className={`flex items-center gap-1 xl:gap-2 rounded-full px-2 py-1 transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-white/5' 
                    : 'bg-slate-100/80'
                }`}>
                  {navLinks.map((link) => {
                    if (link.subLinks) {
                      return (
                        <div 
                          key={link.name}
                          className="relative group py-2"
                        >
                          <button
                            type="button"
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap ${
                              isLinkActive(link) 
                                ? theme === 'dark'
                                  ? 'text-aim-highlight bg-aim-navy-card shadow-md'
                                  : 'text-blue-600 bg-white shadow-md'
                                : theme === 'dark'
                                  ? 'text-aim-copy-muted hover:text-aim-highlight hover:bg-white/10'
                                  : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
                            }`}
                          >
                            <span>{link.name}</span>
                            <svg 
                              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180 opacity-70" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor" 
                              strokeWidth="2.5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {/* Dropdown Menu */}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                            <div className={`rounded-2xl border p-2 shadow-xl ${
                              theme === 'dark'
                                ? 'bg-aim-navy/95 border-white/10 shadow-black/40 backdrop-blur-xl'
                                : 'bg-white border-slate-200 shadow-slate-200/80 backdrop-blur-xl'
                            }`}>
                              {link.subLinks.map((sub) => (
                                <Link
                                  key={sub.name}
                                  to={sub.path}
                                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                                    location.pathname === sub.path
                                      ? theme === 'dark'
                                        ? 'bg-white/5 text-aim-highlight'
                                        : 'bg-blue-50 text-blue-600'
                                      : theme === 'dark'
                                        ? 'text-aim-copy hover:bg-white/5 hover:text-white'
                                        : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                                  }`}
                                >
                                  <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                                    theme === 'dark' ? 'bg-white/5 text-aim-gold' : 'bg-blue-50 text-blue-500'
                                  }`}>
                                    {getSubIcon(sub.path)}
                                  </div>
                                  <div className="text-left font-sans">
                                    <div className="text-sm font-semibold leading-tight">{sub.name}</div>
                                    <div className={`text-[11px] mt-1 leading-normal ${
                                      theme === 'dark' ? 'text-aim-copy-muted' : 'text-slate-400'
                                    }`}>{sub.desc}</div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return (
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
                    )
                  })}
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
                  Partner Portal
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
                  {navLinks.map((link) => {
                    if (link.subLinks) {
                      const isOpen = openMobileDropdown === link.name
                      return (
                        <div key={link.name} className="space-y-1">
                          <button
                            type="button"
                            onClick={() => setOpenMobileDropdown(isOpen ? '' : link.name)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                              isLinkActive(link)
                                ? theme === 'dark'
                                  ? 'bg-aim-gold/15 text-aim-highlight font-semibold'
                                  : 'bg-blue-50 text-blue-600 font-semibold'
                                : theme === 'dark'
                                  ? 'text-aim-copy-muted hover:bg-white/5'
                                  : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{link.name}</span>
                            <svg 
                              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor" 
                              strokeWidth="2.5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {/* Sub-links accordion */}
                          <div className={`pl-4 space-y-1 transition-all duration-300 overflow-hidden ${
                            isOpen ? 'max-h-60 opacity-100 py-1' : 'max-h-0 opacity-0 pointer-events-none'
                          }`}>
                            {link.subLinks.map((sub) => (
                              <Link
                                key={sub.name}
                                to={sub.path}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setOpenMobileDropdown('');
                                }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  location.pathname === sub.path
                                    ? theme === 'dark'
                                      ? 'bg-white/10 text-aim-highlight'
                                      : 'bg-blue-100 text-blue-700'
                                    : theme === 'dark'
                                      ? 'text-aim-copy-muted hover:bg-white/5'
                                      : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <div className={theme === 'dark' ? 'text-aim-gold' : 'text-blue-500'}>
                                  {getSubIcon(sub.path)}
                                </div>
                                <span>{sub.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    return (
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
                    )
                  })}
                  
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
      <footer className={`py-8 mt-auto relative overflow-hidden border-t transition-colors duration-300 ${
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
                  { name: 'Custom Development', path: ROUTES.CUSTOM_DEVELOPMENT },
                  { name: 'SaaS Based Software', path: ROUTES.SAAS_SOFTWARE },
                  { name: 'Portfolio', path: ROUTES.PORTFOLIO },
                  { name: 'Career', path: ROUTES.CAREER },
                  { name: 'Contact Us', path: ROUTES.CONTACT },
                  { name: 'Available Location', path: '/available-location' },
                  { name: 'Download Portfolio', path: '/download-portfolio' },
                  { name: 'Privacy Policy', path: '/privacy-policy' },

                  
                ].map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className={`flex items-center gap-3 pb-2 group text-[13px] font-medium transition-colors ${
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
                    <span>Corporate Office Nepal</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                      theme === 'dark'
                        ? 'bg-aim-purple/15 text-aim-purple-light border-aim-purple/30'
                        : 'bg-purple-50 text-purple-600 border-purple-200'
                    }`}>Nepal</span>
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
                    <span>ward 5, Dhangadhi Submetropolitan city Kailali,Sudurpaschim Pradesh Nepal</span>
                  </p>
                </div>

                {/* <div className={`flex items-center gap-2 py-2 px-3 rounded-lg border shadow-sm ${
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
                </div> */}

                
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
                  { label: 'Sales Support', value: '+91 62909 02922', href: 'tel:+916290902922' },
                  { label: 'Technical Support', value: '033 6618 2659', href: 'tel:03366182659' },
                  { label: 'Nepal Support', value: '+977 9858422178', href: 'tel:+9779858422178' },
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
                <div className={`text-[11px] font-bold uppercase tracking-widest pl-1 ${
                  theme === 'dark' ? 'text-on-navy-muted' : 'text-slate-400'
                }`}>
                  GST NO: <span className={theme === 'dark' ? 'text-white' : 'text-slate-700'}>19ABCCA9672L1Z0</span>
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
              <div className={`mt-15 ${
                theme === 'dark'
                  ? 'border-white/10 bg-aim-navy-light/50 text-on-navy-muted'
                  : 'border-slate-200 bg-white text-slate-500'
              }`}>
               <div className={`flex items-center gap-1 py-1 px-1 rounded-lg border shadow-sm ${
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
                </div>
            </div>

          </div>

          <div className={`border-t mt-3 pt-8 text-center text-xs ${
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