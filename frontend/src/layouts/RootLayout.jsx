import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const RootLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50">
        <nav className="container-custom py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
                A
              </span>
              <span>AIM<span className="text-indigo-500">.</span></span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex space-x-4 xl:space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`text-xs xl:text-sm font-medium transition-colors duration-200 py-1 border-b-2 ${
                    isActive(link.path) 
                      ? 'text-indigo-400 border-indigo-500' 
                      : 'text-slate-400 hover:text-white border-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition">
                Login
              </Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-sm">
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-400 hover:text-white focus:outline-none p-1 cursor-pointer"
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

          {/* Mobile dropdown menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-slate-800 space-y-3 animate-fade-in">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block text-base font-medium px-2 py-1.5 rounded-lg ${
                    isActive(link.path)
                      ? 'bg-indigo-600/10 text-indigo-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-primary text-center py-2 text-sm"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>
      
      <main className="flex-grow relative">
        <Outlet />
      </main>
      
      <footer className="bg-[#080d1a] border-t border-slate-900/80 text-slate-400 py-16 mt-auto relative overflow-hidden">
        {/* Modern subtle ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            
            {/* Column 1: Quick Links */}
            <div>
              <h3 className="text-xs font-black tracking-widest text-slate-100 uppercase mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
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
                    <Link to={link.path} className="text-slate-400 hover:text-white transition flex items-center gap-2 group text-[13px] font-medium">
                      <svg className="w-3 h-3 text-red-500/70 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
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
              <h3 className="text-xs font-black tracking-widest text-slate-100 uppercase mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                ADDRESS
              </h3>
              <div className="space-y-4 text-[13px]">
                {/* Corporate Office */}
                <div className="p-3 rounded-xl border border-slate-800/40 bg-slate-900/10">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 uppercase tracking-wider">
                    <span>Corporate Office</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">India</span>
                  </div>
                  <p className="mt-2 text-slate-400 leading-relaxed flex gap-2">
                    <svg className="w-4 h-4 text-red-500/80 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>#139, 3rd Floor, Rajdanga Main Road, Kolkata - 700107</span>
                  </p>
                </div>

                {/* Branch Office Kolkata */}
                <div className="p-3 rounded-xl border border-slate-800/40 bg-slate-900/10">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 uppercase tracking-wider">
                    <span>Branch Office</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">India</span>
                  </div>
                  <p className="mt-2 text-slate-400 leading-relaxed flex gap-2">
                    <svg className="w-4 h-4 text-red-500/80 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>21/1F, Fern Road, 1st Floor Lalvilla, Ballygunge Kolkata - 700019</span>
                  </p>
                </div>

                {/* Branch Office USA */}
                <div className="p-3 rounded-xl border border-slate-800/40 bg-slate-900/10">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 uppercase tracking-wider">
                    <span>Branch Office</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">USA</span>
                  </div>
                  <p className="mt-2 text-slate-400 leading-relaxed flex gap-2">
                    <svg className="w-4 h-4 text-red-500/80 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>5916 Frio Dr, Midland, TX 79707, USA</span>
                  </p>
                </div>

                {/* Office Timings */}
                <div className="flex items-center gap-2 py-2 px-3 rounded-lg border border-slate-850 bg-slate-900/5 text-slate-400">
                  <svg className="w-4 h-4 text-red-500/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Office Timings: 10 a.m to 7 p.m</span>
                </div>

                {/* GST NO */}
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                  GST NO: <span className="text-slate-300 font-mono">19ABCCA9672L1Z0</span>
                </div>
              </div>
            </div>

            {/* Column 3: Support */}
            <div>
              <h3 className="text-xs font-black tracking-widest text-slate-100 uppercase mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                SUPPORT
              </h3>
              <div className="space-y-4 text-[13px]">
                {[
                  { label: 'Sales Support', value: '+91 98755 92050', href: 'tel:+919875592050', type: 'phone' },
                  { label: 'Technical Support', value: '033 6618 2659', href: 'tel:03366182659', type: 'phone' },
                  { label: 'USA Support', value: '+1 (210) 209-9575', href: 'tel:+12102099575', type: 'phone' },
                ].map((item) => (
                  <div key={item.label} className="group">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{item.label}</span>
                    <a href={item.href} className="inline-flex items-center gap-2 mt-1 text-slate-300 hover:text-white transition-colors">
                      <svg className="w-3.5 h-3.5 text-red-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="font-semibold">{item.value}</span>
                    </a>
                  </div>
                ))}

                {/* Whatsapp */}
                <div className="group">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Whatsapp</span>
                  <a href="https://wa.me/916290902922" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-1 text-slate-300 hover:text-white transition-colors">
                    <svg className="w-3.5 h-3.5 text-red-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-semibold">+91 62909 02922</span>
                  </a>
                </div>

                {/* Email Support */}
                <div className="pt-3 border-t border-slate-800/40">
                  <a href="mailto:support@aimdigitalise.com" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <svg className="w-3.5 h-3.5 text-red-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>support@aimdigitalise.com</span>
                  </a>
                </div>

                {/* Login */}
                <div className="pt-1">
                  <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors font-semibold group">
                    <svg className="w-3 h-3 text-red-500/70 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Login</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Column 4: Follow Us */}
            <div>
              <h3 className="text-xs font-black tracking-widest text-slate-100 uppercase mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                FOLLOW US
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Facebook', href: 'https://facebook.com', label: 'FB', hoverColor: 'hover:text-blue-400 hover:border-blue-500/30' },
                  { name: 'Google', href: 'https://google.com', label: 'G', hoverColor: 'hover:text-red-400 hover:border-red-500/30' },
                  { name: 'Linkedin', href: 'https://linkedin.com', label: 'LN', hoverColor: 'hover:text-sky-400 hover:border-sky-500/30' },
                  { name: 'Instagram', href: 'https://instagram.com', label: 'IG', hoverColor: 'hover:text-pink-400 hover:border-pink-500/30' },
                  { name: 'YouTube', href: 'https://youtube.com', label: 'YT', hoverColor: 'hover:text-red-500 hover:border-red-500/30' },
                  { name: 'Quora', href: 'https://quora.com', label: 'Q', hoverColor: 'hover:text-red-400 hover:border-red-500/30' },
                  { name: 'X', href: 'https://x.com', label: 'X', hoverColor: 'hover:text-slate-200 hover:border-slate-300/30' },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-2 rounded-lg border border-slate-800/80 bg-slate-900/10 hover:bg-slate-900/60 transition-all duration-300 ${item.hoverColor} text-xs font-semibold text-slate-400`}
                  >
                    <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-800 text-[9px] text-slate-300 font-bold shrink-0">{item.label}</span>
                    <span>{item.name}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>

          <div className="border-t border-slate-900 mt-16 pt-8 text-center text-xs text-slate-500">
            <p>Copyright Update© 2024. All Rights Reserved by AIM Digitalise Pvt. Ltd.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default RootLayout