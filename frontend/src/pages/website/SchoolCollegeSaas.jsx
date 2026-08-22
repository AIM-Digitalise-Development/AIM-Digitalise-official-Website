import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import useUIStore from '../../store/uiStore'
import nexgnLogo from '../../assets/images/nexgnlogo.png'
import nexgnVideo from '../../assets/videos/nexgn.mp4'

// Official Documents
import nexgnProposalLetterPdf from '../../assets/doc/NEXGN Proposal Letter.pdf'
import nexgnBrochurePdf2 from '../../assets/doc/Front page.pdf'
import nexgnBrochurePdf from '../../assets/doc/Inside page.pdf'

// ─────────────────────────────────────────────────────────────
// DATA: Detailed 25+ modules for the "See More" Feature Modal
// ─────────────────────────────────────────────────────────────
const DETAILED_FEATURES = {
  school: [
    {
      category: '📚 Academic & Curriculum Governance',
      items: [
        'CBSE, ICSE & State Board CCE Report Cards with Automated Grading Rubrics',
        'Subject-wise Class Teacher Roll Call & Instant Parent SMS Dispatch',
        'Daily Homework & Assignment Upload Console with PDF / Media Attachments',
        'Dynamic Class Timetable Creator with Automated Teacher Substitution Alerts',
        'Student Promotion Engine for New Academic Session Roll-Over',
      ],
    },
    {
      category: '💳 Fee Collection & Financial Accounting',
      items: [
        'Multi-Tier Fee Structure (Tuition, Transport, Development, Lab & Fine Heads)',
        '1-Tap Razorpay, UPI & NetBanking Payment Gateway Integration for Parents',
        'Automated WhatsApp & SMS Fee Due Reminders with Instant PDF Receipts',
        'Real-time Fee Defaulter Lists & Installment Management Engine',
        'Daily Cashier Counter Collection Reports & Tally ERP XML Export',
      ],
    },
    {
      category: '👥 Student & Staff HR Administration',
      items: [
        '360° Digital Student Master Profile with Birth Certificate & Aadhaar Vault',
        'Transfer Certificate (TC), Character & Bonafide Certificate Generator',
        'Biometric Face / Fingerprint Machine Integration for Teacher Attendance',
        'Staff Leave Application Portal, Monthly Payroll Processing & Payslip Generator',
        'Parent-Teacher Meeting (PTM) Scheduler & Online Complaint Redressal Desk',
      ],
    },
    {
      category: '🚌 Transport, Fleet & Safety',
      items: [
        'Live GPS School Bus Tracking with Route Geofencing for Parents',
        'Driver & Helper License Registry with Vehicle Fuel & Maintenance Logs',
        'Visitor Entry Gate Pass Generator with Photo Capture & OTP Verification',
        'RFID Card Gate Tap Notifications for Arrival & Departure',
      ],
    },
    {
      category: '📱 Mobile Apps & Digital Portals',
      items: [
        'Parent Mobile App (Android & iOS) for Homework, Fees & Marks',
        'Teacher Suite App for Instant Roll Call & Marksheet Entry on Smartphone',
        'Trustee & Principal Executive Dashboard with Daily Revenue Widgets',
        'Digital Library Portal with Barcode Book Issue & Return Counter',
      ],
    },
  ],
  college: [
    {
      category: '🏛️ Degree & Choice-Based Credit System (CBCS)',
      items: [
        'CBCS Semester Grading, SGPA & CGPA Automated Calculation Rules',
        'Departmental Course & Elective Subject Enrollment Management',
        'HOD & Dean Approval Workflows for Student Credits & Internships',
        'University Examination Hall Ticket & Admit Card Dispatch Portal',
        'Degree Certificate & Provisional Transcript Generator',
      ],
    },
    {
      category: '💳 Higher Education Fees & Financial Audits',
      items: [
        'Semester-wise & Year-wise Fee Payment Schedule Engines',
        'Government Scholarship & Concession Tracking (SC/ST/OBC/Merit)',
        'Multi-Counter Cash Collection & Bank Draft Reconciliation Reports',
        'Comprehensive Multi-Branch Financial Ledger with Audit Logs',
        'Automated Fee Clearance Verification before Exam Admit Cards',
      ],
    },
    {
      category: '🏨 Hostel, Mess & Campus Infrastructure',
      items: [
        'Hostel Room & Bed Allocation Engine with Floor Map View',
        'Mess Monthly Billing & Meal Attendance Log Integration',
        'Campus Library Digital Repository for Thesis, Research Papers & E-Books',
        'Sports Complex & Auditorium Booking Management',
      ],
    },
    {
      category: '💼 Placement Cell & Industry Interface',
      items: [
        'Campus Placement Drive Registration & Student Resume Vault',
        'Recruiter Portal for Shortlisting Candidates & Interview Scheduling',
        'Alumni Association Directory & Contribution Tracking',
        'Industry Internship Logbook & Faculty Mentor Review Portal',
      ],
    },
    {
      category: '🛡️ UGC, NAAC & Regulatory Compliance',
      items: [
        '1-Click NAAC Accreditation Data Export & SSR Report Building',
        'UGC & AICTE Compliance Metrics & Faculty Qualification Audits',
        'Anti-Ragging Committee Complaint Register & Incident Tracking',
        'Super-Admin Multi-College Group Governance Dashboard',
      ],
    },
  ],
}

// ─────────────────────────────────────────────────────────────
// DATA: 12 Advance Modules
// ─────────────────────────────────────────────────────────────
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
    desc: 'Lightweight, fast-loading Soft App accessible instantly on any smartphone, tablet, or browser with your institution\'s branding and zero app store download friction.',
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

// ─────────────────────────────────────────────────────────────
// DATA: Official Documents
// ─────────────────────────────────────────────────────────────
const OFFICIAL_DOCUMENTS = [
  {
    id: 'proposal',
    title: 'NEXGN Official Brochure',
    badge: 'Official Brochure',
    size: '275 KB',
    file: nexgnProposalLetterPdf,
    filename: 'NEXGN_Proposal_Letter.pdf',
    desc: 'Official institutional letter detailing software scope, commercial pricing terms, onboarding timeline, and SLA commitments.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'front',
    title: 'NEXGN Features Brochure',
    badge: 'Brochure Part 1',
    size: '7.9 MB',
    file: nexgnBrochurePdf2,
    filename: 'NEXGN_Brochure_Part1_Front.pdf',
    desc: 'Executive product overview, core architecture presentation, and flagship feature highlights for board review.',
    badgeColor: 'bg-amber-500/20 text-aim-gold border-aim-gold/30',
  },
  {
    id: 'inside',
    title: 'NEXGN DCI Brochure',
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
    a: 'NEXGN provides an instant, lightweight Soft App (Mobile-Responsive Web App / PWA) that works seamlessly on any Android smartphone, iPhone, or tablet without needing heavy downloads from app stores.',
  },
]

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
const SchoolCollegeSaas = () => {
  const [openFaq, setOpenFaq] = useState(0)
  const [activePreviewDocId, setActivePreviewDocId] = useState('proposal')
  const openAppointmentModal = useUIStore((state) => state.openAppointmentModal)
  const currentPreviewDoc = OFFICIAL_DOCUMENTS.find((d) => d.id === activePreviewDocId) || OFFICIAL_DOCUMENTS[0]

  // Video player state
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)

  // ── Proposal Modal State ──
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false)
  const [proposalFormData, setProposalFormData] = useState({
    school_name: '',
    address: '',
    principal_name: '',
    email: '',
    phone: '',
    otp: '',
  })
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpNotice, setOtpNotice] = useState('')
  const [proposalSuccess, setProposalSuccess] = useState(false)

  // ── Feature Explorer Modal State ──
  const [featureModal, setFeatureModal] = useState(null) // 'school' | 'college' | null

  // ── Handlers ──
  const handleDownloadDoc = (docId) => {
    const doc = OFFICIAL_DOCUMENTS.find((d) => d.id === docId) || OFFICIAL_DOCUMENTS[0]
    const link = document.createElement('a')
    link.href = doc.file
    link.download = doc.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openProposalModal = () => {
    setProposalFormData({ school_name: '', address: '', principal_name: '', email: '', phone: '', otp: '' })
    setOtpSent(false)
    setOtpVerified(false)
    setOtpNotice('')
    setProposalSuccess(false)
    setIsProposalModalOpen(true)
  }

  const handleSendOtp = () => {
    if (!proposalFormData.email || !proposalFormData.email.includes('@')) {
      alert('Please enter a valid Email ID first.')
      return
    }
    setOtpSent(true)
    setOtpNotice('✉️ Demo OTP: 4829 has been sent to your Email ID.')
  }

  const handleVerifyOtp = () => {
    if (proposalFormData.otp && proposalFormData.otp.trim().length === 4) {
      setOtpVerified(true)
      setOtpNotice('✅ Email verified successfully!')
    } else {
      alert('Please enter the 4-digit OTP.')
    }
  }

  const handleProposalSubmit = (e) => {
    e.preventDefault()
    if (!proposalFormData.school_name || !proposalFormData.phone) {
      alert('Please fill all required fields.')
      return
    }
    handleDownloadDoc('proposal')
    setProposalSuccess(true)
    setTimeout(() => {
      setIsProposalModalOpen(false)
    }, 2800)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) { videoRef.current.pause() } else { videoRef.current.play() }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  return (
    <>
      <Helmet>
        <title>School Management Software &amp; College ERP SaaS | NEXGN by AIM Digitalise</title>
        <meta name="description" content="India's leading Cloud-Based School Management Software & College ERP SaaS platform. Automated fee collection, RFID smart attendance, CBSE/ICSE report cards, bus GPS tracking, and custom mobile apps." />
        <meta name="keywords" content="School Management Software, College Management Software, Cloud Based School ERP, School SaaS, NEXGN Institute Pro, School Fee Collection Software" />
        <link rel="canonical" href="https://aimdigitalise.com/school-college-saas" />
      </Helmet>

      <div className="page-shell bg-aim-navy text-slate-100 min-h-screen overflow-x-hidden">

        {/* ══════════════════════════════════════════════════════════
            SECTION 1: HERO — Left: Value + CTAs | Right: Video Demo
        ══════════════════════════════════════════════════════════ */}
        <section className="relative pt-10 pb-16 overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#050914] via-aim-navy to-[#070d22]">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 left-1/4 w-[600px] h-[400px] bg-aim-gold/15 rounded-full blur-[140px]" />
            <div className="absolute top-1/3 right-0 w-[500px] h-[400px] bg-purple-600/15 rounded-full blur-[140px]" />
          </div>

          <div className="container-custom relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

              {/* LEFT: Headlines & CTAs */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-aim-gold/40 shadow-xl backdrop-blur-md">
                  <img src={nexgnLogo} alt="NEXGN" className="h-8 sm:h-9 w-auto object-contain" />
                  <span className="w-1.5 h-1.5 rounded-full bg-aim-gold animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-aim-gold">India's #1 School &amp; College ERP SaaS</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.12] uppercase">
                  <span className="text-aim-gold">SCHOOL</span> &amp; <span className="text-purple-400">COLLEGE</span>
                  <br />
                  <span className="bg-gradient-to-r from-white via-slate-100 to-aim-gold bg-clip-text text-transparent">
                    MANAGEMENT SOFTWARE
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Complete 360° cloud operating ecosystem for K-12 Schools, Colleges, and Multi-Campus Universities. Automate admissions, online fee collection, RFID attendance, CBSE/ICSE report cards, and live school bus GPS tracking.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={openAppointmentModal}
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-aim-gold via-amber-400 to-aim-gold text-aim-navy font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl shadow-aim-gold/30 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>🚀</span><span>Book Free Live Demo</span><span>→</span>
                  </button>

                  <Link
                    to="/saas-software?plan=15"
                    className="px-6 py-3.5 rounded-2xl bg-purple-600/90 hover:bg-purple-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-purple-600/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-purple-500/40"
                  >
                    <span>⚡</span><span>SaaS Cloud Software</span>
                  </Link>

                  <button
                    onClick={openProposalModal}
                    className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-bold text-xs tracking-wide border border-white/15 transition-all cursor-pointer hover:border-aim-gold/40 flex items-center gap-1.5"
                  >
                    <span>📑</span><span>Proposal (PDF)</span>
                  </button>
                </div>

                {/* Trust Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {[
                    { stat: '50+', label: 'Institutes', icon: '🏫' },
                    { stat: '100%', label: 'Cloud SaaS', icon: '☁️' },
                    { stat: '10 Sec', label: 'Attendance', icon: '⚡' },
                    { stat: '24/7', label: 'Support SLA', icon: '🛡️' },
                  ].map((item, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className="text-sm font-black text-white font-mono">{item.stat}</div>
                        <div className="text-[10px] text-slate-400">{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: Video Demo Console */}
              <div>
                <div className="rounded-3xl p-4 sm:p-5 bg-aim-navy-card/95 border border-white/15 shadow-2xl backdrop-blur-xl space-y-4">
                  {/* Browser bar */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <span className="text-xs font-mono text-slate-400 ml-1">nexgn.in/school-erp/live-demo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aim-gold opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-aim-gold" />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-aim-gold">📹 Live Demo Tour</span>
                    </div>
                  </div>

                  {/* Video player */}
                  <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
                    <video
                      ref={videoRef}
                      src={nexgnVideo}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-auto max-h-[360px] object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between">
                      <div className="flex gap-2">
                        <button onClick={togglePlay} className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold">
                          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                        </button>
                        <button onClick={toggleMute} className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold">
                          {isMuted ? '🔇 Unmute' : '🔊 Sound On'}
                        </button>
                      </div>
                      <span className="text-[10px] font-mono text-slate-300 bg-black/60 px-2 py-1 rounded border border-white/10">NEXGN ERP 4K Tour</span>
                    </div>
                  </div>

                  {/* Feature bullets */}
                  <div className="grid grid-cols-2 gap-2">
                    {['360° School & College ERP Operations', 'Live RFID & Biometric Attendance Sync', 'Automated Online Fee Collection & Receipts', 'Parent WhatsApp & SMS Notifications'].map((f, i) => (
                      <div key={i} className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-slate-200 flex items-center gap-1.5">
                        <span className="text-aim-gold font-bold">✓</span>
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 2: Designed for Schools & Colleges
            10 features each (9 checkpoints + 1 "See More" button)
        ══════════════════════════════════════════════════════════ */}
        <section className="py-20 relative overflow-hidden bg-slate-950/90 border-b border-white/10">
          <div className="container-custom relative z-10 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-white/[0.05] border border-aim-gold/40 shadow-2xl backdrop-blur-md">
                <img src={nexgnLogo} alt="NEXGN" className="h-16 sm:h-20 md:h-24 w-auto object-contain" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Designed for <span className="text-aim-gold">Schools</span> &amp; <span className="text-purple-400">Colleges</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">Choose the edition optimized for your academic level, board compliance, and student operations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

              {/* ── SCHOOL CARD ── */}
              <div className="rounded-3xl bg-aim-navy-card/95 border border-amber-500/30 p-7 sm:p-9 flex flex-col gap-6 shadow-2xl hover:border-aim-gold transition-all duration-300">
                <div className="space-y-5 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl">🏫</div>
                      <div>
                        <p className="text-xs font-bold text-aim-gold uppercase tracking-wider">Product Edition</p>
                        <h3 className="text-xl font-black text-white">SCHOOL MANAGEMENT SOFTWARE</h3>
                        <p className="text-xs font-bold text-aim-gold uppercase tracking-wider">K-12, High Schools &amp; Coaching Academies</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-aim-gold text-aim-navy text-[10px] font-black uppercase tracking-wider shrink-0">Most Popular</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Engineered for CBSE, ICSE, and State Board schools. Automates daily classroom roll calls with instant parent SMS, CBSE report cards, parent WhatsApp diary, live bus GPS tracking, and installment fee collections.
                  </p>

                  {/* 9 features + See More button (10 total) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      'Daily 10-Second Attendance Roll Call',
                      'CBSE / ICSE Board Report Cards',
                      'Parent WhatsApp & SMS Diary',
                      'Live GPS School Bus Fleet Tracking',
                      'Installment Fee Engine & Receipts',
                      'Premium Library & Student ID Cards',
                      'Student TC & Admission Generator',
                      'Online Exam & Mock Test Portal',
                      'Teacher Payroll & Biometric Sync',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-200">
                        <span className="text-aim-gold font-bold flex-shrink-0">✓</span>
                        <span className="truncate">{item}</span>
                      </div>
                    ))}

                    {/* 10th item: See More */}
                    <button
                      onClick={() => setFeatureModal('school')}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-black text-aim-gold uppercase tracking-wider transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      ⚡ See More Features (+25) →
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-5">
                  <Link
                    to="/saas-software?plan=15"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-aim-gold via-amber-400 to-aim-gold text-aim-navy font-black text-xs sm:text-sm uppercase tracking-wider text-center shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🚀</span><span>Activate School Plan (₹10/Student)</span><span>→</span>
                  </Link>
                </div>
              </div>

              {/* ── COLLEGE CARD ── */}
              <div className="rounded-3xl bg-aim-navy-card/95 border border-purple-500/30 p-7 sm:p-9 flex flex-col gap-6 shadow-2xl hover:border-purple-400 transition-all duration-300">
                <div className="space-y-5 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-3xl">🏛️</div>
                      <div>
                        <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Product Edition</p>
                        <h3 className="text-xl font-black text-white">COLLEGE MANAGEMENT SOFTWARE</h3>
                        <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Degree Colleges, Universities &amp; Institutes</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">Enterprise Suite</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Customized for higher education colleges and university groups. Powers semester-wise CBCS/CGPA grading, HOD &amp; Dean administration, hostel bed allocation, campus placement drives, and NAAC/UGC compliance exports.
                  </p>

                  {/* 9 features + See More button (10 total) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      'Semester CBCS / CGPA Grading System',
                      'HOD, Dean & Faculty Administration',
                      'Hostel Bed & Mess Billing Engine',
                      'Campus Placement Drive Tracker',
                      'Multi-Branch Financial Audit & Tally',
                      'UGC & NAAC Compliance Reports',
                      'Research Paper & Thesis Library',
                      'Student Elective & Credit Manager',
                      'Online University Exam Portal',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-200">
                        <span className="text-purple-400 font-bold flex-shrink-0">✓</span>
                        <span className="truncate">{item}</span>
                      </div>
                    ))}

                    {/* 10th item: See More */}
                    <button
                      onClick={() => setFeatureModal('college')}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-black text-purple-300 uppercase tracking-wider transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      ⚡ See More Features (+25) →
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-5">
                  <Link
                    to="/saas-software?plan=15"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider text-center shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer border border-purple-500/30"
                  >
                    <span>🚀</span><span>Activate College Suite</span><span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 3: 12 Master Operational Modules
        ══════════════════════════════════════════════════════════ */}
        <section className="py-20 relative overflow-hidden bg-slate-900/60 border-b border-white/10">
          <div className="container-custom relative z-10 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/20">
                ⚡ Complete Institutional Ecosystem
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                12 Master <span className="text-aim-gold">Operational Modules</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">From pre-admission leads to graduation alumni networks, NEXGN digitizes every administrative workflow.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Left col */}
              <div className="space-y-4">
                <div className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs font-black text-blue-300 uppercase tracking-wider">
                  <span>🎓 Academics, Admissions &amp; Student Portals</span>
                  <span>Modules</span>
                </div>
                {LEFT_MODULES.map((mod, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-aim-navy-card/90 border border-white/10 hover:border-aim-gold/40 transition-all shadow-md space-y-2.5 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{mod.icon}</span>
                        <h4 className="text-base font-black text-white group-hover:text-aim-gold transition-colors">{mod.title}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${mod.color}`}>{mod.badge}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{mod.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {mod.perks.map((p, j) => (
                        <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300">✓ {p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right col */}
              <div className="space-y-4">
                <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs font-black text-aim-gold uppercase tracking-wider">
                  <span>💳 Fees, Attendance, Safety &amp; Governance</span>
                  <span>Modules</span>
                </div>
                {RIGHT_MODULES.map((mod, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-aim-navy-card/90 border border-white/10 hover:border-aim-gold/40 transition-all shadow-md space-y-2.5 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{mod.icon}</span>
                        <h4 className="text-base font-black text-white group-hover:text-aim-gold transition-colors">{mod.title}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${mod.color}`}>{mod.badge}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{mod.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {mod.perks.map((p, j) => (
                        <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300">✓ {p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 4: Brochures PDF Viewer
        ══════════════════════════════════════════════════════════ */}
        <section className="py-20 relative overflow-hidden bg-slate-950/90 border-b border-white/10">
          <div className="container-custom relative z-10 max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-black text-aim-gold uppercase tracking-widest">📑 Official Institutional Documents &amp; Proposal Pack</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">Live Interactive Document Viewer</h3>
              <p className="text-xs text-slate-400">Inspect our institutional proposal letter and brochures directly online before downloading.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left: Doc selector */}
              <div className="lg:col-span-5 space-y-3.5">
                {OFFICIAL_DOCUMENTS.map((doc) => {
                  const isSelected = activePreviewDocId === doc.id
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setActivePreviewDocId(doc.id)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${isSelected ? 'bg-aim-navy border-aim-gold shadow-xl shadow-aim-gold/10 scale-[1.02]' : 'bg-aim-navy-card/90 border-white/10 hover:border-white/25 hover:bg-white/[0.04]'}`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${doc.badgeColor}`}>{doc.badge}</span>
                          <span className="text-slate-400 font-mono text-[10px]">{doc.size}</span>
                        </div>
                        <h4 className="text-sm font-black text-white">{doc.title}</h4>
                        <p className="text-xs text-slate-300 leading-snug">{doc.desc}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActivePreviewDocId(doc.id) }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${isSelected ? 'bg-aim-gold text-aim-navy font-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                          👁️ View Online
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); doc.id === 'proposal' ? openProposalModal() : handleDownloadDoc(doc.id) }}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          📥 Download
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Right: Embedded PDF viewer */}
              <div className="lg:col-span-7 flex flex-col rounded-3xl overflow-hidden border border-white/15 bg-aim-navy-card/95 shadow-2xl">
                <div className="px-4 py-3 bg-slate-900 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📑</span>
                    <span className="text-xs font-bold text-white truncate">{currentPreviewDoc.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={currentPreviewDoc.file} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-bold text-slate-200">
                      🔗 Open Fullscreen
                    </a>
                    <button
                      onClick={() => currentPreviewDoc.id === 'proposal' ? openProposalModal() : handleDownloadDoc(currentPreviewDoc.id)}
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

        {/* ══════════════════════════════════════════════════════════
            SECTION 5: FAQs
        ══════════════════════════════════════════════════════════ */}
        <section className="py-20 relative overflow-hidden bg-aim-navy border-b border-white/10">
          <div className="container-custom relative z-10 max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-black text-aim-gold uppercase tracking-widest">❓ Clear Answers</span>
              <h2 className="text-2xl sm:text-4xl font-black text-white">Frequently Asked <span className="text-aim-gold">Questions</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div key={idx} className={`rounded-2xl border transition-all bg-aim-navy-card/90 overflow-hidden shadow-md ${isOpen ? 'border-aim-gold/50' : 'border-white/10 hover:border-white/20'}`}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      className="w-full p-5 text-left flex items-start justify-between gap-3 font-bold text-sm text-white hover:text-aim-gold transition-colors cursor-pointer"
                    >
                      <span className="leading-snug">{faq.q}</span>
                      <span className={`text-aim-gold text-xl shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>+</span>
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

        {/* ══════════════════════════════════════════════════════════
            SECTION 6: Final CTA Banner
        ══════════════════════════════════════════════════════════ */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-aim-navy via-[#070e22] to-[#040814]">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-aim-gold/15 via-purple-600/10 to-transparent rounded-full blur-[140px]" />
          </div>
          <div className="container-custom relative z-10 max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-aim-gold/15 border border-aim-gold/40 text-aim-gold text-xs font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-aim-gold animate-ping" />
              <span>🚀 Rapid 48-Hour Onboarding &amp; Zero Downtime</span>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Transform Your Campus Into a <br />
                <span className="bg-gradient-to-r from-aim-gold via-amber-200 to-white bg-clip-text text-transparent">Smart Digital Institute</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Join forward-thinking schools, colleges, and coaching academies that automate fee collection, smart RFID attendance, CBSE/ICSE report cards, and parent communications.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <Link to="/saas-software?plan=15" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-aim-gold via-amber-400 to-aim-gold text-aim-navy font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <span>⚡</span><span>Activate Your Plan</span><span>→</span>
              </Link>
              <a
                href="https://wa.me/916290902922?text=Hello%20AIM%20Digitalise,%20I%20am%20interested%20in%20a%20demo%20of%20NEXGN%20School%20ERP."
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-emerald-400/30"
              >
                <span>💬</span><span>Chat on WhatsApp</span>
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 max-w-2xl mx-auto text-xs text-slate-300">
              {['Zero Local Server Costs', 'Free Data Migration', 'Dedicated Staff Training'].map((p, i) => (
                <div key={i} className="flex items-center justify-center gap-2">
                  <span className="text-aim-gold font-bold">✓</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* ══════════════════════════════════════════════════════════
          MODAL 1: 📑 Proposal Request Form
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isProposalModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ duration: 0.22 }}
              className="relative w-full max-w-lg bg-[#0b1329] border border-aim-gold/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5"
            >
              {/* Close */}
              <button
                onClick={() => setIsProposalModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors text-sm font-bold"
              >✕</button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aim-gold/10 border border-aim-gold/30 text-aim-gold text-[11px] font-black uppercase tracking-wider">
                  📄 Official Commercial Proposal
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">Get Proposal With Commercial</h3>
                <p className="text-xs text-slate-300">Provide your institution details to download the official commercial proposal PDF.</p>
              </div>

              {proposalSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="text-5xl">🎉</div>
                  <h4 className="text-lg font-black text-emerald-400">Proposal Downloading!</h4>
                  <p className="text-xs text-slate-300">The NEXGN Official Proposal (PDF) with commercial pricing is now downloading to your device.</p>
                </div>
              ) : (
                <form onSubmit={handleProposalSubmit} className="space-y-4">

                  {/* School Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">School / College Name <span className="text-aim-gold">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Greenwood High School"
                      value={proposalFormData.school_name}
                      onChange={(e) => setProposalFormData({ ...proposalFormData, school_name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-aim-gold transition-colors"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">Address <span className="text-aim-gold">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Full campus address, City, State & PIN"
                      value={proposalFormData.address}
                      onChange={(e) => setProposalFormData({ ...proposalFormData, address: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-aim-gold transition-colors"
                    />
                  </div>

                  {/* Principal Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">School Management / Principal Name <span className="text-aim-gold">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name of Principal / Trustee / Administrator"
                      value={proposalFormData.principal_name}
                      onChange={(e) => setProposalFormData({ ...proposalFormData, principal_name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-aim-gold transition-colors"
                    />
                  </div>

                  {/* Email + OTP */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">Email ID (OTP verify) <span className="text-aim-gold">*</span></label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        disabled={otpVerified}
                        placeholder="official@school.edu.in"
                        value={proposalFormData.email}
                        onChange={(e) => setProposalFormData({ ...proposalFormData, email: e.target.value })}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-aim-gold transition-colors disabled:opacity-60"
                      />
                      {!otpVerified && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 text-aim-gold border border-amber-500/30 text-xs font-bold whitespace-nowrap hover:bg-amber-500/30 transition-colors cursor-pointer"
                        >
                          {otpSent ? 'Resend OTP' : 'Send OTP'}
                        </button>
                      )}
                    </div>

                    {/* OTP input row */}
                    {otpSent && !otpVerified && (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="4-Digit OTP"
                          value={proposalFormData.otp}
                          onChange={(e) => setProposalFormData({ ...proposalFormData, otp: e.target.value })}
                          className="w-32 px-4 py-2 rounded-xl bg-white/10 border border-aim-gold text-white text-xs tracking-widest font-mono text-center focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="px-4 py-2 rounded-xl bg-aim-gold text-aim-navy text-xs font-black uppercase tracking-wider hover:scale-105 transition-all cursor-pointer"
                        >
                          Verify
                        </button>
                      </div>
                    )}
                    {otpNotice && (
                      <p className={`text-[11px] font-bold font-mono ${otpVerified ? 'text-emerald-400' : 'text-amber-300'}`}>{otpNotice}</p>
                    )}
                  </div>

                  {/* Contact No */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">Contact No <span className="text-aim-gold">*</span></label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={proposalFormData.phone}
                      onChange={(e) => setProposalFormData({ ...proposalFormData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-aim-gold transition-colors"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-aim-gold via-amber-400 to-aim-gold text-aim-navy font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl shadow-aim-gold/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer mt-2"
                  >
                    Get Proposal With Commercial
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          MODAL 2: 🚀 Feature Explorer (School / College)
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {featureModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ duration: 0.22 }}
              className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto bg-[#070d22] border border-amber-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6"
            >
              {/* Close */}
              <button
                onClick={() => setFeatureModal(null)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors text-sm font-bold"
              >✕</button>

              <div className="border-b border-white/10 pb-4 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aim-gold/10 text-aim-gold text-[11px] font-black uppercase tracking-wider border border-aim-gold/30">
                  {featureModal === 'school' ? '🏫 School ERP' : '🏛️ College ERP'} — Complete Module Specification
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {featureModal === 'school' ? 'SCHOOL' : 'COLLEGE'} MANAGEMENT SOFTWARE — All Features
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">Detailed 360° breakdown of all 25+ modules included in the NEXGN ERP cloud subscription.</p>
              </div>

              <div className="space-y-5">
                {(DETAILED_FEATURES[featureModal] || []).map((cat, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <h4 className="text-sm font-black text-aim-gold">{cat.category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {cat.items.map((item, j) => (
                        <div key={j} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-200">
                          <span className="text-emerald-400 font-bold mt-0.5 shrink-0">✓</span>
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-slate-400">⚡ All features available with 100% data security &amp; zero downtime setup.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setFeatureModal(null); openProposalModal() }}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    📑 Get Proposal PDF
                  </button>
                  <Link
                    to="/saas-software?plan=15"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-aim-gold to-amber-400 text-aim-navy font-black text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-lg"
                  >
                    🚀 Activate Plan
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default SchoolCollegeSaas
