import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const management = [
  {
    id: 'md',
    name: 'Mr. Rajesh Kumar',
    designation: 'Managing Director & CEO',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    badge: 'Founder',
    badgeColor: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
    accentFrom: 'from-indigo-500',
    accentTo: 'to-purple-500',
    borderHover: 'hover:border-indigo-500/50',
    shortBio:
      'Visionary entrepreneur with 10+ years in digital marketing and technology. Leads AIM Digitalise with a passion for innovation and client success.',
    message:
      `At AIM Digitalise, we believe every business deserves a digital presence that reflects its true potential. Our journey since 2020 has been defined by relentless innovation, honest partnerships, and a deep commitment to our clients' growth. We don't just build digital solutions—we build relationships, trust, and futures. I am proud of our young and energetic team who treat every client's challenge as their own, and I remain committed to leading this organization with integrity and purpose.`,
    social: { linkedin: '#', twitter: '#' },
  },
  {
    id: 'director',
    name: 'Ms. Priya Sharma',
    designation: 'Director – Operations & Strategy',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    badge: 'Co-Founder',
    badgeColor: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
    accentFrom: 'from-purple-500',
    accentTo: 'to-pink-500',
    borderHover: 'hover:border-purple-500/50',
    shortBio:
      `Operations strategist and co-founder driving AIM Digitalise's growth with data-driven decision making and team excellence.`,
    message:
      `Building a successful digital agency means building a culture of excellence, accountability, and continuous learning. At AIM Digitalise, our operations are driven by a simple principle: deliver what we promise, and then go beyond. Every project we undertake is an opportunity to raise the bar higher. Our team's dedication to providing premium-quality services at transparent, fair pricing is what sets us apart. I am honoured to be part of this incredible journey toward a digitally empowered India.`,
    social: { linkedin: '#', twitter: '#' },
  },
  {
    id: 'technical',
    name: 'Mr. Ankit Verma',
    designation: 'Chief Technology Officer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    badge: 'CTO',
    badgeColor: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
    accentFrom: 'from-cyan-500',
    accentTo: 'to-blue-500',
    borderHover: 'hover:border-cyan-500/50',
    shortBio:
      `Technology leader with expertise in web, mobile, and cloud solutions. Architects AIM's technical vision and drives digital transformation.`,
    message:
      `Technology is the backbone of every great digital solution. At AIM Digitalise, we stay ahead of the curve by embracing the most advanced and cutting-edge technologies available. Our development team is committed to building scalable, secure, and high-performing solutions tailored to each client's unique needs. Whether it's a dynamic website, a mobile app, or a comprehensive digital marketing infrastructure, we engineer it with precision and passion. I am excited about the future we are building together.`,
    social: { linkedin: '#', twitter: '#' },
  },
]

const ManagementDesk = () => {
  const [activeId, setActiveId] = useState('md')
  const active = management.find((m) => m.id === activeId)

  return (
    <section className="relative py-24 overflow-hidden bg-slate-950 bg-grid-pattern border-t border-slate-900">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container-custom z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">
            👔 Leadership
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Management{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Desk
            </span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Meet the visionary leaders driving AIM Digitalise forward — passionate about innovation, integrity, and your success.
          </p>
        </motion.div>

        {/* Management Tabs + Message Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Leader Cards */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {management.map((person, i) => (
              <motion.button
                key={person.id}
                onClick={() => setActiveId(person.id)}
                className={`w-full text-left group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 overflow-hidden
                  ${activeId === person.id
                    ? 'bg-slate-800/80 border-slate-600/80 shadow-lg'
                    : `bg-slate-900/40 border-slate-800/60 ${person.borderHover} hover:bg-slate-800/40`
                  }`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                whileHover={{ x: activeId === person.id ? 0 : 4 }}
              >
                {/* Active indicator bar */}
                {activeId === person.id && (
                  <motion.div
                    layoutId="activeBar"
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b ${person.accentFrom} ${person.accentTo}`}
                  />
                )}

                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${person.accentFrom} ${person.accentTo} opacity-30 blur-sm scale-110 transition-opacity duration-300 ${activeId === person.id ? 'opacity-50' : 'opacity-0 group-hover:opacity-30'}`}
                  />
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="relative w-14 h-14 rounded-xl object-cover border border-slate-700/80"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm truncate">{person.name}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${person.badgeColor}`}>
                      {person.badge}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5 truncate">{person.designation}</p>
                </div>

                {/* Chevron */}
                <svg
                  className={`w-4 h-4 shrink-0 transition-all duration-300 ${activeId === person.id ? 'text-indigo-400 rotate-90' : 'text-slate-600 group-hover:text-slate-400'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            ))}
          </div>

          {/* Right: Active Leader Message */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {active && (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className={`relative rounded-3xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl`}
                >
                  {/* Top accent bar */}
                  <div className={`h-1 w-full bg-gradient-to-r ${active.accentFrom} ${active.accentTo}`} />

                  {/* Corner glow */}
                  <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br ${active.accentFrom} ${active.accentTo} opacity-5 blur-3xl pointer-events-none`} />

                  <div className="p-8">
                    {/* Leader header */}
                    <div className="flex items-center gap-5 mb-7">
                      <div className="relative shrink-0">
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${active.accentFrom} ${active.accentTo} opacity-40 blur-md scale-110`} />
                        <img
                          src={active.avatar}
                          alt={active.name}
                          className="relative w-20 h-20 rounded-2xl object-cover border-2 border-slate-700 shadow-xl"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">{active.name}</h3>
                        <p className={`text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r ${active.accentFrom} ${active.accentTo}`}>
                          {active.designation}
                        </p>
                        <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-md">{active.shortBio}</p>
                      </div>
                    </div>

                    {/* Quote decoration */}
                    <div className="relative">
                      <svg
                        className={`absolute -top-3 -left-1 w-10 h-10 opacity-20 bg-clip-text`}
                        style={{ color: 'rgb(99,102,241)' }}
                        fill="currentColor" viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>

                      <div className="pl-8">
                        <p className="text-slate-300 text-sm leading-[1.9] italic">
                          {active.message}
                        </p>
                      </div>
                    </div>

                    {/* Social links */}
                    <div className="flex items-center gap-3 mt-7 pt-6 border-t border-slate-800/60">
                      <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Connect</span>
                      <a
                        href={active.social.linkedin}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/40 text-slate-400 hover:text-blue-400 transition-all duration-200"
                        aria-label="LinkedIn"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                      <a
                        href={active.social.twitter}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-sky-600/20 border border-slate-700 hover:border-sky-500/40 text-slate-400 hover:text-sky-400 transition-all duration-200"
                        aria-label="Twitter"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.635L18.245 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ManagementDesk
