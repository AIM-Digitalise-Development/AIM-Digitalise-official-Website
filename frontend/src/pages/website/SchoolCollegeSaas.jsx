import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import useUIStore from '../../store/uiStore'
import nexgnLogo from '../../assets/images/nexgnlogo.png'

// Official Documents
import nexgnProposalLetterPdf from '../../assets/doc/NEXGN Proposal Letter.pdf'
import nexgnBrochurePdf2 from '../../assets/doc/Front page.pdf'
import nexgnBrochurePdf from '../../assets/doc/Inside page.pdf'

// UI Screenshots
import admin1 from '../../assets/images/admin1.png'
import admin2 from '../../assets/images/admin2.png'
import teacher1 from '../../assets/images/teacher1.png'
import teacher2 from '../../assets/images/teacher2.png'
import student1 from '../../assets/images/student1.png'
import student2 from '../../assets/images/student2.png'

// Live Portals Data for Screenshot Switcher
const PORTAL_SHOWCASE = {
  admin: {
    id: 'admin',
    label: '👑 Admin & Trustee Portal',
    title: 'Institutional Governance & Financial Ledger',
    subtitle: 'Fee collections, student admissions, live audits, and multi-campus analytics.',
    badge: 'Admin Control Center',
    badgeColor: 'bg-amber-500/20 text-aim-gold border-aim-gold/30',
    images: [
      { src: admin1, title: 'Master Operational Dashboard', desc: 'Real-time student strength, revenue collections, and today’s live attendance overview.' },
      { src: admin2, title: 'Institutional Analytics & Financial Ledger', desc: 'Detailed fee registers, payment settlements, expense ledger, and audit reports.' },
    ],
    features: [
      'Automated daily collection & reconciliation',
      'Digital student admissions & TC generator',
      'Multi-branch super-admin governance',
      'Automated staff payroll & biometric sync',
    ],
  },
  teacher: {
    id: 'teacher',
    label: '👨‍🏫 Faculty & Teacher Suite',
    title: 'Classroom Attendance & Digital Gradebook',
    subtitle: 'Mark daily attendance, enter exam marks, broadcast homework, and manage lecture timetables.',
    badge: 'Faculty Classroom Suite',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    images: [
      { src: teacher1, title: 'Live Roll Call & Attendance Registry', desc: 'Instant 10-second attendance marking with automated parent SMS & WhatsApp alerts.' },
      { src: teacher2, title: 'Marksheet Entry & Examination Gradebook', desc: 'Subject-wise marks entry console with automated CGPA, rank, and grading rubrics.' },
    ],
    features: [
      'Fast in-app roll call with instant SMS alerts',
      'CBSE, ICSE & University grading calculation',
      '1-Tap digital homework & syllabus broadcast',
      'Class timetable with substitution alerts',
    ],
  },
  student: {
    id: 'student',
    label: '🎓 Parent & Student Mobile App',
    title: '1-Tap Fee Payment & Live Bus Tracking',
    subtitle: 'Instant digital fee receipts, real-time bus map, digital report cards, and school notices.',
    badge: 'Parent & Student Experience',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    images: [
      { src: student1, title: 'Student Academic Dashboard', desc: 'Daily attendance percentage, homework assignments, upcoming events, and teacher remarks.' },
      { src: student2, title: 'Digital Fee Receipts & Report Cards', desc: 'Instant online fee payment with downloadable tax receipts and board-compliant report cards.' },
    ],
    features: [
      'Instant UPI, QR code & Card fee payments',
      'Live GPS school bus map with arrival ETA',
      'Downloadable digital marksheet PDFs',
      'Emergency holiday & exam push notifications',
    ],
  },
}

// 12 Advance Modules split into 2 distinct columns
const LEFT_MODULES = [
  {
    icon: '🎓',
    title: 'Paperless Digital Admissions',
    badge: 'Student CRM',
    color: 'border-blue-500/30 text-blue-400',
    desc: 'Online registration portal with document uploads, automatic roll number allocation, printable ID card maker, and Transfer Certificate (TC) generator.',
    perks: ['Lead-to-enrolled pipeline', 'Bulk ID card maker', 'Encrypted student archive'],
  },
  {
    icon: '📊',
    title: 'CBSE, ICSE & University Exams',
    badge: 'Exam Hub',
    color: 'border-purple-500/30 text-purple-400',
    desc: 'Automate grading rules, CGPA/GPA calculations, rank list generation, and print official high-resolution report cards in 1 click.',
    perks: ['Pre-configured board rubrics', 'Faculty marks lock', '1-Click bulk PDF marksheets'],
  },
  {
    icon: '📱',
    title: 'Mobile-Ready Soft App',
    badge: 'Soft App / PWA',
    color: 'border-teal-500/30 text-teal-400',
    desc: 'Lightweight, fast-loading Soft App accessible instantly on any smartphone, tablet, or browser with your institution’s branding and zero app store download friction.',
    perks: ['Instant mobile browser access', 'Custom institution branding', '1-Tap fee pay & notices'],
  },
  {
    icon: '📚',
    title: 'Digital Library & Barcode System',
    badge: 'Resource Hub',
    color: 'border-amber-500/30 text-amber-400',
    desc: 'Complete cataloging with barcode scanning for 5-second book checkout, automated overdue fine calculation, and e-book archives.',
    perks: ['Barcode scanner compatible', 'Automatic fine ledger', 'Digital question banks'],
  },
  {
    icon: '💬',
    title: 'Omnichannel Parent WhatsApp API',
    badge: 'Communication',
    color: 'border-sky-500/30 text-sky-400',
    desc: 'Send automated fee reminders, exam results, and emergency weather notices directly through official verified WhatsApp business templates.',
    perks: ['Official WhatsApp API', 'Emergency bulk SMS', 'Digital interactive noticeboard'],
  },
  {
    icon: '🤖',
    title: 'AI Student Insights & Retention',
    badge: 'AI Analytics',
    color: 'border-pink-500/30 text-pink-400',
    desc: 'AI-powered early warning flags for struggling students, predictive dropout forecasting, and automated data exports for accreditation audits.',
    perks: ['Early academic warnings', 'Enrollment forecasting', 'NAAC / CBSE audit export'],
  },
]

const RIGHT_MODULES = [
  {
    icon: '💳',
    title: 'Automated Fee Engine',
    badge: 'Finance Hub',
    color: 'border-amber-500/30 text-amber-400',
    desc: 'Instant UPI/Card payment gateway integration, automatic fine calculation, split installments, and automated WhatsApp PDF receipts.',
    perks: ['Zero cash leakage', 'Instant GST invoices', 'Bank reconciliation'],
  },
  {
    icon: '📅',
    title: 'RFID & Biometric Attendance',
    badge: 'Gate & Class Sync',
    color: 'border-emerald-500/30 text-emerald-400',
    desc: 'Sync gate RFID smart cards and biometric fingerprint readers. Parents receive immediate notification the second their child taps in or out.',
    perks: ['Instant parent arrival alerts', '10-Second roll call', 'Monthly defaulter lists'],
  },
  {
    icon: '🚌',
    title: 'Live GPS Bus Fleet Tracking',
    badge: 'Safety & Fleet',
    color: 'border-rose-500/30 text-rose-400',
    desc: 'Real-time GPS vehicle tracking for parents and transport supervisors. Geofenced stoppage alarms, driver app, and speed violation alerts.',
    perks: ['Parent live map view', 'Stoppage ETA countdown', 'Speed alarm alerts'],
  },
  {
    icon: '🏢',
    title: 'Hostel, Bed & Mess Management',
    badge: 'Campus Living',
    color: 'border-indigo-500/30 text-indigo-400',
    desc: 'Interactive room and bed inventory allocation, digital warden out-pass approvals, daily mess menu tracking, and utility billing.',
    perks: ['Bed allocation map', 'Digital out-pass system', 'Mess meal billing'],
  },
  {
    icon: '💼',
    title: 'Staff Payroll, HRMS & Timetable',
    badge: 'HR & Timetable',
    color: 'border-green-500/30 text-green-400',
    desc: 'Generate salary slips with EPF/ESI tax deductions, link biometric timesheets to payroll, and auto-generate master conflict-free timetables.',
    perks: ['1-Click salary slips', 'Biometric payroll sync', 'Substitution alert system'],
  },
  {
    icon: '🛡️',
    title: 'Multi-Campus Central Governance',
    badge: 'Super-Admin',
    color: 'border-purple-500/30 text-purple-400',
    desc: 'Unified super-admin console to monitor revenue, staff performance, and student admissions across 10+ branch locations seamlessly.',
    perks: ['Single super-admin login', 'Consolidated financial audits', 'Cross-campus comparisons'],
  },
]

// Official Documents List
const OFFICIAL_DOCUMENTS = [
  {
    id: 'proposal',
    title: 'NEXGN Official Proposal Letter',
    badge: 'Official Proposal',
    size: '275 KB',
    file: nexgnProposalLetterPdf,
    filename: 'NEXGN_Proposal_Letter.pdf',
    desc: 'Official institutional letter detailing software scope, commercial pricing terms, onboarding timeline, and SLA commitments.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'front',
    title: 'NEXGN Brochure (Part 1: Front Page)',
    badge: 'Brochure Part 1',
    size: '7.9 MB',
    file: nexgnBrochurePdf2,
    filename: 'NEXGN_Brochure_Part1_Front.pdf',
    desc: 'Executive product overview, core architecture presentation, and flagship feature highlights for board review.',
    badgeColor: 'bg-amber-500/20 text-aim-gold border-aim-gold/30',
  },
  {
    id: 'inside',
    title: 'NEXGN Brochure (Part 2: Inside Page)',
    badge: 'Brochure Part 2',
    size: '7.3 MB',
    file: nexgnBrochurePdf,
    filename: 'NEXGN_Brochure_Part2_Inside.pdf',
    desc: 'Complete detailed module breakdown covering fees, admissions, gradebook, RFID attendance, GPS transport, and mobile apps.',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
]

const FAQS = [
  {
    q: 'What is the primary difference between School and College software configurations in NEXGN?',
    a: 'School configurations focus on K-12 requirements: CBSE/ICSE grading, 10-second classroom roll calls, parent WhatsApp diaries, and school bus GPS tracking. College configurations include semester-wise credit scoring (CBCS/CGPA), HOD and Dean administration, hostel bed allocation, and NAAC/UGC compliance exports.',
  },
  {
    q: 'How fast can our institution migrate to the NEXGN Cloud SaaS platform?',
    a: 'Our dedicated migration team can upload all your existing student, staff, and historical fee records in under 48 hours with 100% data fidelity and zero downtime.',
  },
  {
    q: 'Do we need to invest in on-premise servers or specialized IT hardware?',
    a: 'No! NEXGN is a 100% cloud-native SaaS system hosted on high-availability Tier-4 cloud infrastructure. It runs effortlessly on any standard laptop, tablet, or smartphone without server maintenance costs.',
  },
  {
    q: 'Can parents pay fees online directly through UPI, Cards, and NetBanking?',
    a: 'Yes. NEXGN includes pre-integrated payment gateways. Automated fee reminders sent via WhatsApp and SMS contain instant 1-tap payment links with instant GST-compliant PDF receipts.',
  },
  {
    q: 'How do parents and students access the system on mobile devices?',
    a: 'NEXGN provides an instant, lightweight Soft App (Mobile-Responsive Web App / PWA) that works seamlessly on any Android smartphone, iPhone, or tablet without needing heavy downloads from app stores. Parents and students simply open their dedicated portal link with school branding to view attendance, homework, and pay fees in 1 tap.',
  },
]

const SchoolCollegeSaas = () => {
  const [activePortalTab, setActivePortalTab] = useState('admin')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activePreviewDocId, setActivePreviewDocId] = useState('proposal')
  const [openFaq, setOpenFaq] = useState(0)
  const openAppointmentModal = useUIStore((state) => state.openAppointmentModal)

  const currentPortal = PORTAL_SHOWCASE[activePortalTab] || PORTAL_SHOWCASE.admin
  const currentImage = currentPortal.images[activeImageIndex] || currentPortal.images[0]
  const currentPreviewDoc = OFFICIAL_DOCUMENTS.find((d) => d.id === activePreviewDocId) || OFFICIAL_DOCUMENTS[0]

  const handleDownloadDoc = (docId) => {
    const doc = OFFICIAL_DOCUMENTS.find((d) => d.id === docId) || OFFICIAL_DOCUMENTS[0]
    const link = document.createElement('a')
    link.href = doc.file
    link.download = doc.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <Helmet>
        <title>School Management Software &amp; College ERP SaaS | NEXGN by AIM Digitalise</title>
        <meta
          name="description"
          content="India's leading Cloud-Based School Management Software & College ERP SaaS platform. Automated fee collection, RFID smart attendance, CBSE/ICSE report cards, bus GPS tracking, and custom mobile apps."
        />
        <meta
          name="keywords"
          content="School Management Software, College Management Software, Cloud Based School ERP, School SaaS, College ERP System, Institute ERP Software India, NEXGN Institute Pro, School Fee Collection Software, Student Attendance App"
        />
        <link rel="canonical" href="https://aimdigitalise.com/school-college-saas" />
      </Helmet>

      <div className="page-shell bg-aim-navy text-slate-100 min-h-screen overflow-x-hidden">
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* 1. HERO SECTION: 2-PART SPLIT (LEFT: VALUE & CTAS | RIGHT: LIVE UI CONSOLE) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <section className="relative pt-10 pb-16 overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#050914] via-aim-navy to-[#070d22]">
          {/* Ambient Glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 left-1/4 w-[600px] h-[400px] bg-aim-gold/15 rounded-full blur-[140px]" />
            <div className="absolute top-1/3 right-0 w-[500px] h-[400px] bg-purple-600/15 rounded-full blur-[140px]" />
            <div className="absolute inset-0 bg-grid-pattern opacity-15" />
          </div>

          <div className="container-custom relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* ── LEFT PART: Main Headline, Value Prop & Fast CTAs (7 Cols) ── */}
              <div className="lg:col-span-6 space-y-6 text-left">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-aim-gold/40 shadow-xl backdrop-blur-md">
                  <img src={nexgnLogo} alt="NEXGN Logo" className="h-4.5 w-auto object-contain" />
                  <span className="w-1.5 h-1.5 rounded-full bg-aim-gold animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-aim-gold">
                    India's #1 School &amp; College ERP SaaS
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.12]">
                  <span className="text-aim-gold">School</span> &amp;{' '}
                  <span className="text-purple-400">College</span> <br />
                  <span className="bg-gradient-to-r from-white via-slate-100 to-aim-gold bg-clip-text text-transparent">
                    Cloud Management Software
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                  Complete 360° cloud operating ecosystem for modern K-12 Schools, Colleges, and Multi-Campus Universities. Automate admissions, online fee collection, RFID smart attendance, CBSE/ICSE report cards, and live school bus GPS tracking.
                </p>

                {/* Primary CTA Button Group */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={openAppointmentModal}
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-aim-gold via-amber-400 to-aim-gold text-aim-navy font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl shadow-aim-gold/30 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>🚀</span>
                    <span>Book Free Live Demo</span>
                    <span>→</span>
                  </button>

                  <Link
                    to="/saas-software?plan=15"
                    className="px-6 py-3.5 rounded-2xl bg-purple-600/90 hover:bg-purple-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-purple-600/25 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 border border-purple-500/40"
                  >
                    <span>⚡</span>
                    <span>Activate Plan (₹10/Student)</span>
                  </Link>

                  <button
                    onClick={() => handleDownloadDoc('proposal')}
                    className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-bold text-xs tracking-wide border border-white/15 transition-all cursor-pointer shadow-sm hover:border-aim-gold/40 flex items-center gap-1.5"
                    title="Download Official Proposal PDF"
                  >
                    <span>📑</span>
                    <span>Proposal (PDF)</span>
                  </button>
                </div>

                {/* 4 Trust Metric Cards */}
                <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { stat: '50+', label: 'Institutes', icon: '🏫' },
                    { stat: '100%', label: 'Cloud SaaS', icon: '☁️' },
                    { stat: '10 Sec', label: 'Attendance', icon: '⚡' },
                    { stat: '24/7', label: 'Support SLA', icon: '🛡️' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center gap-2 shadow-sm"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className="text-sm font-black text-white font-mono leading-tight">{item.stat}</div>
                        <div className="text-[10px] text-aim-copy-muted">{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── RIGHT PART: Live Interactive Portal UI Console (5 Cols) ── */}
              <div className="lg:col-span-6 space-y-4">
                <div className="rounded-3xl p-4 sm:p-5 bg-aim-navy-card/95 border border-white/15 shadow-2xl backdrop-blur-xl space-y-4">
                  {/* Selector Tabs */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.values(PORTAL_SHOWCASE).map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActivePortalTab(tab.id)
                            setActiveImageIndex(0)
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border ${activePortalTab === tab.id
                            ? 'bg-gradient-to-r from-aim-gold to-amber-400 text-aim-navy border-aim-gold shadow-md'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                      {currentPortal.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${activeImageIndex === idx
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        >
                          Screen {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Browser Mockup Window */}
                  <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black shadow-xl">
                    <div className="px-3 py-1.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                        <span className="text-[10px] font-mono text-slate-400 ml-2">
                          https://nexgn.in/{activePortalTab}/dashboard
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-aim-gold">Live HD Console</span>
                    </div>

                    {/* Screenshot */}
                    <div className="relative bg-slate-950 flex items-center justify-center min-h-[240px] sm:min-h-[300px]">
                      <motion.img
                        key={`${activePortalTab}-${activeImageIndex}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        src={currentImage.src}
                        alt={currentImage.title}
                        className="w-full h-auto max-h-[42vh] object-contain"
                      />
                    </div>

                    {/* Caption */}
                    <div className="px-3 py-2 bg-slate-900 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <div className="text-white font-bold truncate">
                        <span className="text-aim-gold mr-1.5">✨</span>
                        <span>{currentImage.title}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">100% Cloud Responsive</span>
                    </div>
                  </div>

                  {/* Highlight bullets */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {currentPortal.features.map((feat, i) => (
                      <div key={i} className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-slate-200 flex items-center gap-1.5">
                        <span className="text-aim-gold font-bold">✓</span>
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* 2. MAIN 2-PART SPLIT: SCHOOL MANAGEMENT (LEFT) vs COLLEGE MANAGEMENT (RIGHT) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 relative overflow-hidden bg-slate-950/90 border-b border-white/10">
          <div className="container-custom relative z-10 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-aim-gold/10 text-aim-gold text-xs font-bold uppercase tracking-widest border border-aim-gold/20">
                <span>🎯 Core Education Verticals</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Designed for <span className="text-aim-gold">Schools</span> &amp;{' '}
                <span className="text-purple-400">Colleges</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Choose the edition perfectly optimized for your academic level, board compliance, and student operations.
              </p>
            </div>

            {/* 2-Column Split: Left Card = School Software | Right Card = College Software */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* LEFT PART: SCHOOL MANAGEMENT SOFTWARE */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <div className="rounded-3xl bg-aim-navy-card/95 border border-amber-500/30 p-7 sm:p-9 flex flex-col justify-between shadow-2xl hover:border-aim-gold transition-all duration-300 space-y-6">
                <div className="space-y-5">
                  {/* Top Pill & Title */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-13 h-13 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl shadow-inner">
                        🏫
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white">School Management Software</h3>
                        <p className="text-xs font-bold text-aim-gold uppercase tracking-wider">
                          K-12, High Schools &amp; Coaching Academies
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-aim-gold text-aim-navy text-[10px] font-black uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    Engineered specifically for CBSE, ICSE, and State Board schools. Automates daily classroom roll calls with instant parent SMS, CBSE report cards, parent WhatsApp diary, live bus GPS tracking, and installment fee collections.
                  </p>

                  {/* 6 Key Feature Checkpoints */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {[
                      'Daily 10-Second Attendance Roll Call',
                      'CBSE / ICSE Board Report Cards',
                      'Parent WhatsApp & SMS Diary',
                      'Live GPS School Bus Fleet Tracking',
                      'Installment Fee Engine & Receipts',
                      'Digital Library & Student ID Cards',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-200">
                        <span className="text-aim-gold font-bold">✓</span>
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Document downloads strip */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                    <span className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-wider block">
                      Official School Brochures &amp; Proposal:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadDoc('proposal')}
                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>📥</span>
                        <span>Proposal Letter</span>
                      </button>
                      <button
                        onClick={() => handleDownloadDoc('front')}
                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-aim-gold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>📥</span>
                        <span>Brochure 1 (PDF)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Left Card Bottom Action */}
                <div className="pt-5 border-t border-white/10">
                  <Link
                    to="/saas-software?plan=15"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-aim-gold via-amber-400 to-aim-gold text-aim-navy font-black text-xs sm:text-sm uppercase tracking-wider text-center shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🚀</span>
                    <span>Activate School Plan (₹10/Student)</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* RIGHT PART: COLLEGE MANAGEMENT SOFTWARE */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <div className="rounded-3xl bg-aim-navy-card/95 border border-purple-500/30 p-7 sm:p-9 flex flex-col justify-between shadow-2xl hover:border-purple-400 transition-all duration-300 space-y-6">
                <div className="space-y-5">
                  {/* Top Pill & Title */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-13 h-13 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-3xl shadow-inner">
                        🏛️
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white">College Management Software</h3>
                        <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                          Degree Colleges, Universities &amp; Institutes
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                      Enterprise Suite
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    Customized for higher education colleges and university groups. Powers semester-wise credit scoring (CBCS/CGPA), HOD &amp; Dean administration, hostel bed allocation, campus placement drives, and NAAC/UGC compliance exports.
                  </p>

                  {/* 6 Key Feature Checkpoints */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {[
                      'Semester CBCS / CGPA Grading System',
                      'HOD, Dean & Faculty Administration',
                      'Hostel Bed & Mess Billing Engine',
                      'Campus Placement Drive Tracker',
                      'Multi-Branch Financial Audit & Tally',
                      'UGC & NAAC Compliance Reports',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-200">
                        <span className="text-purple-400 font-bold">✓</span>
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Document downloads strip */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                    <span className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-wider block">
                      Official College Brochures &amp; Proposal:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadDoc('proposal')}
                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>📥</span>
                        <span>Proposal Letter</span>
                      </button>
                      <button
                        onClick={() => handleDownloadDoc('inside')}
                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-purple-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>📥</span>
                        <span>Brochure 2 (PDF)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Card Bottom Action */}
                <div className="pt-5 border-t border-white/10">
                  <button
                    onClick={openAppointmentModal}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider text-center shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>⚡</span>
                    <span>Request College Walkthrough &amp; Quote</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* 3. 12 ADVANCE CLOUD MODULES: 2-COLUMN SPLIT (LEFT ACADEMICS | RIGHT OPS & FINANCE) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <section className="py-24 relative overflow-hidden bg-aim-navy border-b border-white/10">
          <div className="container-custom relative z-10 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                <span>⚡ 12 Comprehensive Advance Modules</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Everything Provided in <span className="text-aim-gold">One Unified Cloud</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Explore our full suite of enterprise modules designed to replace manual registers and multiple disconnected tools.
              </p>
            </div>

            {/* 2-Column Split for 12 Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* ── LEFT COLUMN: Academics, Admissions & Student Apps ── */}
              <div className="space-y-4">
                <div className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs font-black text-blue-300 uppercase tracking-wider">
                  <span>🎓 Academics, Admissions &amp; Student Portals</span>
                  <span>Modules</span>
                </div>

                <div className="space-y-4">
                  {LEFT_MODULES.map((mod, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-aim-navy-card/90 border border-white/10 hover:border-aim-gold/40 transition-all duration-200 shadow-md space-y-2.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{mod.icon}</span>
                          <h4 className="text-base font-black text-white group-hover:text-aim-gold transition-colors">{mod.title}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${mod.color}`}>
                          {mod.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">{mod.desc}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {mod.perks.map((p, pIdx) => (
                          <span key={pIdx} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 font-medium">
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── RIGHT COLUMN: Finance, Fleet, Security & Governance ── */}
              <div className="space-y-4">
                <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs font-black text-aim-gold uppercase tracking-wider">
                  <span>💳 Fees, Attendance, Safety &amp; Governance</span>
                  <span>Modules</span>
                </div>

                <div className="space-y-4">
                  {RIGHT_MODULES.map((mod, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-aim-navy-card/90 border border-white/10 hover:border-aim-gold/40 transition-all duration-200 shadow-md space-y-2.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{mod.icon}</span>
                          <h4 className="text-base font-black text-white group-hover:text-aim-gold transition-colors">{mod.title}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${mod.color}`}>
                          {mod.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">{mod.desc}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {mod.perks.map((p, pIdx) => (
                          <span key={pIdx} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 font-medium">
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* 4. DOCUMENTATION & PROPOSAL PREVIEW HUB: 2-PART SPLIT */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 relative overflow-hidden bg-slate-950/90 border-b border-white/10">
          <div className="container-custom relative z-10 max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-black text-aim-gold uppercase tracking-widest">
                📑 Official Institutional Documents &amp; Proposal Pack
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Live Interactive Document Viewer
              </h3>
              <p className="text-xs text-slate-400">
                Inspect our institutional proposal letter and brochures directly online before downloading.
              </p>
            </div>

            {/* 2-Part Document Split: Left = Doc Selector & Specs | Right = Live Embedded PDF Frame */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* ── LEFT PART (5 Cols): Doc Selector Cards ── */}
              <div className="lg:col-span-5 space-y-3.5">
                {OFFICIAL_DOCUMENTS.map((doc) => {
                  const isSelected = activePreviewDocId === doc.id
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setActivePreviewDocId(doc.id)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${isSelected
                        ? 'bg-aim-navy border-aim-gold shadow-xl shadow-aim-gold/10 scale-[1.02]'
                        : 'bg-aim-navy-card/90 border-white/10 hover:border-white/25 hover:bg-white/[0.04]'
                        }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${doc.badgeColor}`}>
                            {doc.badge}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">{doc.size}</span>
                        </div>
                        <h4 className="text-sm font-black text-white">{doc.title}</h4>
                        <p className="text-xs text-slate-300 leading-snug">{doc.desc}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActivePreviewDocId(doc.id)
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${isSelected ? 'bg-aim-gold text-aim-navy font-black' : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                          👁️ View Online
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadDoc(doc.id)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                          title="Download PDF"
                        >
                          📥 Download
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ── RIGHT PART (7 Cols): Embedded Live PDF Viewer ── */}
              <div className="lg:col-span-7 flex flex-col rounded-3xl overflow-hidden border border-white/15 bg-aim-navy-card/95 shadow-2xl">
                <div className="px-4 py-3 bg-slate-900 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📑</span>
                    <span className="text-xs font-bold text-white truncate">{currentPreviewDoc.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={currentPreviewDoc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-bold text-slate-200"
                    >
                      🔗 Open Fullscreen
                    </a>
                    <button
                      onClick={() => handleDownloadDoc(currentPreviewDoc.id)}
                      className="px-3 py-1 rounded bg-gradient-to-r from-aim-gold to-amber-400 text-aim-navy text-[11px] font-black uppercase"
                    >
                      📥 Download
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-h-[460px] bg-slate-950 p-2 sm:p-3">
                  <iframe
                    key={currentPreviewDoc.id}
                    src={`${currentPreviewDoc.file}#toolbar=1&navpanes=0&scrollbar=1`}
                    title={currentPreviewDoc.title}
                    className="w-full h-full min-h-[460px] rounded-xl bg-white shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* 5. FAQS & BOTTOM CONVERSION CTA BANNER */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 relative overflow-hidden bg-aim-navy border-b border-white/10">
          <div className="container-custom relative z-10 max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-black text-aim-gold uppercase tracking-widest">
                ❓ Clear Answers
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Frequently Asked <span className="text-aim-gold">Questions</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all bg-aim-navy-card/90 overflow-hidden shadow-md ${
                      isOpen ? 'border-aim-gold/50 shadow-lg shadow-aim-gold/5' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      className="w-full p-5 text-left flex items-start justify-between gap-3 font-bold text-sm sm:text-base text-white hover:text-aim-gold transition-colors cursor-pointer"
                    >
                      <span className="leading-snug">{faq.q}</span>
                      <span className={`text-aim-gold text-xl shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>
                        +
                      </span>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* FINAL HERO CONVERSION CTA BANNER */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-aim-navy via-[#070e22] to-[#040814]">
          {/* Ambient Lighting */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-aim-gold/15 via-purple-600/10 to-transparent rounded-full blur-[140px]" />
          </div>

          <div className="container-custom relative z-10 max-w-4xl mx-auto text-center space-y-8">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-aim-gold/15 border border-aim-gold/40 text-aim-gold text-xs font-black uppercase tracking-wider shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-aim-gold animate-ping" />
              <span>🚀 Rapid 48-Hour Onboarding &amp; Zero Downtime</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Transform Your Campus Into a <br />
                <span className="bg-gradient-to-r from-aim-gold via-amber-200 to-white bg-clip-text text-transparent">
                  Smart Digital Institute
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
                Join forward-thinking schools, colleges, and coaching academies that automate fee collection, smart RFID attendance, CBSE/ICSE report cards, and parent communications.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link
                to="/saas-software?plan=15"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-aim-gold via-amber-400 to-aim-gold text-aim-navy font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-aim-gold/25 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>⚡</span>
                <span>Activate Your Plan (₹10/Student)</span>
                <span>→</span>
              </Link>

              <a
                href="https://wa.me/916290902922?text=Hello%20AIM%20Digitalise,%20I%20am%20interested%20in%20a%20demo%20of%20NEXGN%20School%20ERP."
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/25 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 border border-emerald-400/30"
              >
                <span>💬</span>
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* 3 Micro-Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 max-w-2xl mx-auto text-xs text-slate-300">
              <div className="flex items-center justify-center gap-2">
                <span className="text-aim-gold font-bold">✓</span>
                <span>Zero Local Server Costs</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-aim-gold font-bold">✓</span>
                <span>Free Data Migration</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-aim-gold font-bold">✓</span>
                <span>Dedicated Staff Training</span>
              </div>
            </div>

            {/* Helpline Contact Strip */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>📞 Sales:</span>
                <a href="tel:+916290902922" className="text-white font-bold hover:text-aim-gold">+91 62909 02922</a>
              </div>
              <div className="flex items-center gap-2">
                <span>🏢 Enterprise:</span>
                <a href="tel:+919876543210" className="text-white font-bold hover:text-aim-gold">+91 9876543210</a>
              </div>
              <div className="flex items-center gap-2">
                <span>✉️ Email:</span>
                <a href="mailto:support@aimdigitalise.com" className="text-white font-bold hover:text-aim-gold">support@aimdigitalise.com</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default SchoolCollegeSaas
