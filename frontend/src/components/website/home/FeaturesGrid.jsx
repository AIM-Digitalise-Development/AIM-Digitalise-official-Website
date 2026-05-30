import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── SVG Icons per sub-service ─────────────────────────────── */
const icons = {
  seo: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="28" cy="28" r="16" stroke="#6366f1" strokeWidth="4"/>
      <line x1="39" y1="39" x2="54" y2="54" stroke="#6366f1" strokeWidth="4" strokeLinecap="round"/>
      <path d="M24 28h8M28 24v8" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  static: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <rect x="8" y="14" width="48" height="36" rx="4" stroke="#6366f1" strokeWidth="4"/>
      <line x1="8" y1="24" x2="56" y2="24" stroke="#a5b4fc" strokeWidth="3"/>
      <rect x="16" y="30" width="14" height="10" rx="2" fill="#6366f1" fillOpacity=".3" stroke="#6366f1" strokeWidth="2"/>
      <line x1="34" y1="32" x2="48" y2="32" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round"/>
      <line x1="34" y1="36" x2="44" y2="36" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  dynamic: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <rect x="6" y="10" width="52" height="36" rx="5" stroke="#6366f1" strokeWidth="4"/>
      <path d="M6 20h52" stroke="#a5b4fc" strokeWidth="2.5"/>
      <path d="M20 34l6-6 6 6 6-10" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="18" y="48" width="28" height="4" rx="2" fill="#6366f1" fillOpacity=".5"/>
    </svg>
  ),
  ecommerce: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="32" cy="32" r="24" stroke="#6366f1" strokeWidth="4"/>
      <path d="M20 26h4l3 12h10l3-8H24" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="30" cy="41" r="2" fill="#6366f1"/>
      <circle cx="38" cy="41" r="2" fill="#6366f1"/>
    </svg>
  ),
  webapp: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <rect x="8" y="12" width="48" height="32" rx="4" stroke="#6366f1" strokeWidth="4"/>
      <path d="M8 22h48" stroke="#a5b4fc" strokeWidth="2.5"/>
      <path d="M20 32l4-4 4 4 4-8" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="24" y="44" width="16" height="4" rx="2" fill="#6366f1" fillOpacity=".5"/>
    </svg>
  ),
  hybrid: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <rect x="14" y="8" width="24" height="40" rx="4" stroke="#6366f1" strokeWidth="3.5"/>
      <rect x="32" y="16" width="22" height="34" rx="4" stroke="#a5b4fc" strokeWidth="3" strokeDasharray="4 2"/>
      <circle cx="26" cy="44" r="2.5" fill="#6366f1"/>
    </svg>
  ),

  seosem: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="28" cy="28" r="14" stroke="#6366f1" strokeWidth="4"/>
      <path d="M38 38l10 10" stroke="#a5b4fc" strokeWidth="4" strokeLinecap="round"/>
      <text x="18" y="32" fontSize="10" fill="#6366f1" fontWeight="bold">SEM</text>
    </svg>
  ),
  content: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="32" cy="32" r="22" fill="#f59e0b" fillOpacity=".15" stroke="#f59e0b" strokeWidth="3"/>
      <path d="M22 28h20M22 32h14M22 36h16" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="44" cy="22" r="6" fill="#f59e0b" fillOpacity=".3" stroke="#f59e0b" strokeWidth="2"/>
      <text x="41" y="25" fontSize="7" fill="#f59e0b" fontWeight="bold">C</text>
    </svg>
  ),
  social: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="32" cy="32" r="22" fill="#3b82f6" fillOpacity=".12" stroke="#3b82f6" strokeWidth="3"/>
      <circle cx="32" cy="26" r="5" stroke="#3b82f6" strokeWidth="2.5"/>
      <circle cx="22" cy="38" r="4" stroke="#60a5fa" strokeWidth="2"/>
      <circle cx="42" cy="38" r="4" stroke="#60a5fa" strokeWidth="2"/>
      <line x1="27" y1="29" x2="24" y2="34" stroke="#60a5fa" strokeWidth="2"/>
      <line x1="37" y1="29" x2="40" y2="34" stroke="#60a5fa" strokeWidth="2"/>
    </svg>
  ),
  mailing: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="32" cy="32" r="22" fill="#6366f1" fillOpacity=".1" stroke="#6366f1" strokeWidth="3"/>
      <rect x="18" y="22" width="28" height="20" rx="3" stroke="#6366f1" strokeWidth="2.5"/>
      <path d="M18 26l14 9 14-9" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M34 36l6 6M30 36l-6 6" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  graphics: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="32" cy="32" r="22" fill="#ec4899" fillOpacity=".12" stroke="#ec4899" strokeWidth="3"/>
      <rect x="20" y="22" width="10" height="14" rx="2" fill="#ec4899" fillOpacity=".3" stroke="#ec4899" strokeWidth="2"/>
      <rect x="34" y="26" width="10" height="10" rx="2" fill="#f472b6" fillOpacity=".3" stroke="#f472b6" strokeWidth="2"/>
      <path d="M20 40h24" stroke="#ec4899" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="32" cy="32" r="22" fill="#22c55e" fillOpacity=".15" stroke="#22c55e" strokeWidth="3"/>
      <path d="M22 32c0-5.523 4.477-10 10-10s10 4.477 10 10c0 2.21-.72 4.254-1.93 5.908L42 44l-6.5-1.5A9.96 9.96 0 0132 42c-5.523 0-10-4.477-10-10z" stroke="#22c55e" strokeWidth="2.5"/>
      <path d="M27 31l2 2 4-4" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  emudhra: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="32" cy="32" r="22" fill="#6366f1" fillOpacity=".1" stroke="#6366f1" strokeWidth="3"/>
      <text x="20" y="37" fontSize="14" fill="#6366f1" fontWeight="bold">e</text>
      <path d="M30 28h14M30 32h10M30 36h12" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  capricorn: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="32" cy="32" r="22" fill="#64748b" fillOpacity=".12" stroke="#64748b" strokeWidth="3"/>
      <path d="M24 42c0-8 4-14 8-14s8 6 8 14" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"/>
      <path d="M32 28v-8" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  pantasign: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="32" cy="32" r="22" fill="#f59e0b" fillOpacity=".12" stroke="#f59e0b" strokeWidth="3"/>
      <path d="M22 32h8l4-8 4 16 4-8h4" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  vsign: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="32" cy="32" r="22" fill="#3b82f6" fillOpacity=".12" stroke="#3b82f6" strokeWidth="3"/>
      <path d="M22 24l10 16 10-16" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  idsign: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="32" cy="32" r="22" fill="#22c55e" fillOpacity=".12" stroke="#22c55e" strokeWidth="3"/>
      <path d="M26 38c0-8 4-12 8-12" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="32" cy="26" r="4" stroke="#22c55e" strokeWidth="2.5"/>
      <path d="M20 40a10 10 0 0124 0" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  sify: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="32" cy="32" r="22" fill="#06b6d4" fillOpacity=".12" stroke="#06b6d4" strokeWidth="3"/>
      <path d="M24 36c2-4 6-6 10-4" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round"/>
      <path d="M30 28c2-2 6-2 8 0" stroke="#a5f3fc" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M26 40c2-6 8-10 14-6" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2"/>
    </svg>
  ),

  taxation: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <rect x="14" y="10" width="36" height="44" rx="4" stroke="#6366f1" strokeWidth="3.5"/>
      <path d="M22 22h20M22 28h14M22 34h10" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M34 42l4-4-4-4" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  accounting: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <circle cx="32" cy="32" r="22" fill="#06b6d4" fillOpacity=".12" stroke="#06b6d4" strokeWidth="3"/>
      <path d="M24 38V26h16v12" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 38h24" stroke="#a5f3fc" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M28 26v-4h8v4" stroke="#06b6d4" strokeWidth="2"/>
    </svg>
  ),
  payroll: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <rect x="10" y="18" width="44" height="30" rx="5" stroke="#f59e0b" strokeWidth="3.5"/>
      <circle cx="32" cy="33" r="7" stroke="#f59e0b" strokeWidth="2.5"/>
      <path d="M32 29v4l3 2" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="18" cy="33" r="3" fill="#fbbf24" fillOpacity=".3" stroke="#f59e0b" strokeWidth="2"/>
      <circle cx="46" cy="33" r="3" fill="#fbbf24" fillOpacity=".3" stroke="#f59e0b" strokeWidth="2"/>
    </svg>
  ),
  hospital: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <rect x="10" y="20" width="44" height="34" rx="3" stroke="#ef4444" strokeWidth="3.5"/>
      <path d="M26 20V14h12v6" stroke="#ef4444" strokeWidth="3"/>
      <path d="M32 30v8M28 34h8" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  school: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <path d="M8 28l24-14 24 14" stroke="#8b5cf6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="16" y="28" width="32" height="22" rx="2" stroke="#8b5cf6" strokeWidth="3"/>
      <rect x="26" y="36" width="12" height="14" rx="2" fill="#8b5cf6" fillOpacity=".2" stroke="#8b5cf6" strokeWidth="2"/>
    </svg>
  ),
  crm: (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      <rect x="10" y="14" width="44" height="36" rx="5" stroke="#0ea5e9" strokeWidth="3.5"/>
      <circle cx="24" cy="30" r="6" stroke="#0ea5e9" strokeWidth="2.5"/>
      <path d="M14 44c0-6 4-10 10-10" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M36 24h10M36 30h8M36 36h10" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
}

/* ─── Tab Data ──────────────────────────────────────────────── */
const tabs = [
  {
    id: 'web',
    label: 'Website & App Development',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    cards: [
      { key: 'seo',       label: '100% SEO Friendly\n& Responsive' },
      { key: 'static',    label: 'Static or Informative\nWebsite' },
      { key: 'dynamic',   label: 'Dynamic or Tool\nBased Website' },
      { key: 'ecommerce', label: 'E-Commerce Website',  highlight: true },
      { key: 'webapp',    label: 'Web App Development' },
      { key: 'hybrid',    label: 'Hybrid App\nDevelopment' },
    ]
  },
  {
    id: 'marketing',
    label: 'UX/UI Design & Digital Marketing',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    cards: [
      { key: 'seosem',   label: 'SEO / SEM / PPC\nMarketing' },
      { key: 'content',  label: 'Content Marketing' },
      { key: 'social',   label: 'Social Media\nMarketing' },
      { key: 'mailing',  label: 'Mass Mailing' },
      { key: 'graphics', label: 'Logo, Brochure,\nBusiness Card, Flex -\nGraphics Design' },
      { key: 'whatsapp', label: 'WhatsApp Marketing' },
    ]
  },
  {
    id: 'signature',
    label: 'Digital Signature',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    cards: [
      { key: 'emudhra',  label: 'E Mudhra' },
      { key: 'capricorn',label: 'Capricorn' },
      { key: 'pantasign',label: 'Pantasign' },
      { key: 'vsign',    label: 'V Sign' },
      { key: 'idsign',   label: 'ID Sign' },
      { key: 'sify',     label: 'Sify' },
    ]
  },
  {
    id: 'software',
    label: 'Software Service',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    cards: [
      { key: 'taxation',   label: 'Taxation Software' },
      { key: 'accounting', label: 'Accounting Software' },
      { key: 'payroll',    label: 'Payroll Software -\nGreytHR' },
      { key: 'hospital',   label: 'Hospital Management\nSoftware' },
      { key: 'school',     label: 'School Management\nSystem' },
      { key: 'crm',        label: 'CRM Software' },
    ]
  }
]

/* ─── Component ─────────────────────────────────────────────── */
const FeaturesGrid = () => {
  const [activeTab, setActiveTab] = useState(0)
  const current = tabs[activeTab]

  // Primary: online fallback — replace with '/src/assets/images/developer_coding.png' once copied locally
  const [imgSrc, setImgSrc] = useState('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=700&q=80')

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden border-t border-slate-900">
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Capabilities
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Core Services &amp; Solutions
          </h2>
          <p className="text-lg text-slate-400">
            We deliver elite-level engineering services designed to scale your operations, secure your data, and elevate your technology stack.
          </p>
        </div>

        {/* Main layout */}
        <div className="grid lg:grid-cols-12 gap-10 items-center">

          {/* ── Left Column: Photo behind + Tab Pills overlapping right edge ── */}
          <div className="lg:col-span-5 relative" style={{ minHeight: '420px' }}>
            {/* Glow backing */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 to-purple-600/10 rounded-[40px] blur-3xl opacity-60 pointer-events-none" />

            {/* Developer image — takes up left 70% of the panel */}
            <div
              className="absolute left-0 top-0 bottom-0 rounded-tr-[64px] rounded-bl-[64px] rounded-tl-2xl rounded-br-2xl overflow-hidden border border-slate-800/80 shadow-2xl"
              style={{ width: '68%' }}
            >
              <img
                src={imgSrc}
                onError={() => setImgSrc('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=700&q=80')}
                alt="AIM Developer Workspace"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              {/* Right-to-left fade so tabs read clearly */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-950/20 to-slate-950/70" />
            </div>

            {/* Tab pills — anchored to right, vertically centred, overlapping image */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 space-y-2.5 z-10" style={{ width: '62%' }}>
              {tabs.map((tab, i) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-left transition-all duration-200 cursor-pointer border backdrop-blur-md ${
                    activeTab === i
                      ? 'bg-indigo-700/95 border-indigo-500 text-white shadow-xl shadow-indigo-500/30'
                      : 'bg-slate-900/90 border-slate-700/70 text-slate-300 hover:border-indigo-500/50 hover:text-white hover:bg-slate-800/95'
                  }`}
                >
                  <span className={`shrink-0 ${activeTab === i ? 'text-white' : 'text-indigo-400'}`}>
                    {tab.icon}
                  </span>
                  <span className="leading-snug">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Right Column: 6-Card Sub-Service Grid ── */}
          <div className="lg:col-span-7 lg:pl-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-5"
              >
                {current.cards.map((card) => (
                  <div
                    key={card.key}
                    className={`group flex flex-col items-center gap-4 p-5 rounded-2xl border bg-slate-900/30 backdrop-blur-sm cursor-pointer transition-all duration-300
                      hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10
                      ${card.highlight
                        ? 'border-indigo-500/60 shadow-md shadow-indigo-500/10'
                        : 'border-slate-700/60 hover:border-indigo-500/40'
                      }`}
                  >
                    {/* Icon circle */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center p-2 transition-transform duration-300 group-hover:scale-110
                      ${card.highlight
                        ? 'bg-indigo-500/10 border border-indigo-500/30'
                        : 'bg-slate-800/60 border border-slate-700/50 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30'
                      }`}
                    >
                      {icons[card.key]}
                    </div>

                    {/* Label */}
                    <p className={`text-center text-[11px] font-bold uppercase tracking-wider leading-snug whitespace-pre-line transition-colors duration-200
                      ${card.highlight ? 'text-indigo-400' : 'text-slate-300 group-hover:text-indigo-300'}`}
                    >
                      {card.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  )
}

export default FeaturesGrid