import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import useUIStore from '../../store/uiStore'
import nexgnLogo from '../../assets/images/nexgnlogo.png'
import nexgnVideo from '../../assets/videos/craete_a_video_where_kids_tea.mp4'

import { sendProposalOtp, verifyProposalOtp, submitProposal } from '../../api/proposals'
import { createPublicIdCardOrder, verifyPublicIdCardPayment } from '../../api/publicIdCardService'

// Official Documents
import officialBrochureImg from '../../assets/doc/OfficialBrochure.jpg'
import officialBrochureImg1 from '../../assets/doc/Official Brochure1.jpg'
import nexgnBrochureFrontPdf from '../../assets/doc/Front page.pdf'
import nexgnBrochureInsidePdf from '../../assets/doc/Inside page.pdf'
import dciImg from '../../assets/doc/DCI.jpg'
import dciImg1 from '../../assets/doc/DCI1.jpg'

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
    size: '550 KB (2 Pages)',
    type: 'image',
    pages: [
      { name: 'Page 1', file: officialBrochureImg, filename: 'NEXGN_Official_Brochure_Page1.jpg', type: 'image' },
      { name: 'Page 2', file: officialBrochureImg1, filename: 'NEXGN_Official_Brochure_Page2.jpg', type: 'image' },
    ],
    file: officialBrochureImg,
    filename: 'NEXGN_Official_Brochure.jpg',
    desc: 'Official institutional brochure detailing software scope, commercial pricing terms, onboarding timeline, and SLA commitments.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'front',
    title: 'NEXGN Features Brochure',
    badge: 'Features Brochure',
    size: '15.2 MB (2 Parts)',
    type: 'pdf',
    pages: [
      { name: 'Part 1: Front Page', file: nexgnBrochureFrontPdf, filename: 'NEXGN_Brochure_Part1_Front.pdf', type: 'pdf' },
      { name: 'Part 2: Inside Page', file: nexgnBrochureInsidePdf, filename: 'NEXGN_Brochure_Part2_Inside.pdf', type: 'pdf' },
    ],
    file: nexgnBrochureFrontPdf,
    filename: 'NEXGN_Brochure_Part1_Front.pdf',
    desc: 'Executive product overview, core architecture presentation, and detailed 25+ inside module breakdown for board review.',
    badgeColor: 'bg-amber-500/20 text-aim-gold border-aim-gold/30',
  },
  {
    id: 'inside',
    title: 'NEXGN DCI Brochure',
    badge: 'DCI Brochure',
    size: '390 KB (2 Pages)',
    type: 'image',
    pages: [
      { name: 'Page 1', file: dciImg, filename: 'NEXGN_DCI_Brochure_Page1.jpg', type: 'image' },
      { name: 'Page 2', file: dciImg1, filename: 'NEXGN_DCI_Brochure_Page2.jpg', type: 'image' },
    ],
    file: dciImg,
    filename: 'NEXGN_DCI_Brochure.jpg',
    desc: 'Digital Campus Infrastructure (DCI) specifications covering smart gate RFID, biometric sync, fee automation, and mobile apps.',
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
  const [activeDocPageIndex, setActiveDocPageIndex] = useState(0)
  const openAppointmentModal = useUIStore((state) => state.openAppointmentModal)
  const currentPreviewDoc = OFFICIAL_DOCUMENTS.find((d) => d.id === activePreviewDocId) || OFFICIAL_DOCUMENTS[0]
  const currentPage = currentPreviewDoc.pages?.[activeDocPageIndex] || currentPreviewDoc.pages?.[0] || { file: currentPreviewDoc.file, filename: currentPreviewDoc.filename, name: 'Document', type: currentPreviewDoc.type }

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
    contact_no: '',
    otp: '',
  })
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpNotice, setOtpNotice] = useState('')
  const [proposalError, setProposalError] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false)
  const [proposalSuccess, setProposalSuccess] = useState(false)

  // ── Feature Explorer Modal State ──
  const [featureModal, setFeatureModal] = useState(null) // 'school' | 'college' | null

  // ── Standalone Type A ID Card State (Non-clients) ──
  const [idCardQuantity, setIdCardQuantity] = useState(100)
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false)
  const [idCardForm, setIdCardForm] = useState({
    client_name: '',
    institution_name: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    state: '',
    pin_code: '',
  })
  const [idCardSubmitting, setIdCardSubmitting] = useState(false)
  const [idCardError, setIdCardError] = useState('')
  const [idCardSuccessData, setIdCardSuccessData] = useState(null)

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
      document.body.appendChild(script)
    })
  }

  const handleOpenIdCardModal = () => {
    setIdCardError('')
    setIdCardSuccessData(null)
    setIsIdCardModalOpen(true)
  }

  const handleIdCardOrderSubmit = async (e) => {
    e.preventDefault()
    setIdCardError('')

    if (!idCardForm.client_name || !idCardForm.institution_name || !idCardForm.email || !idCardForm.phone || !idCardForm.address || !idCardForm.district || !idCardForm.state || !idCardForm.pin_code) {
      setIdCardError('Please complete all required fields.')
      return
    }

    const qty = Math.max(1, parseInt(idCardQuantity) || 1)
    setIdCardSubmitting(true)

    try {
      const orderRes = await createPublicIdCardOrder({
        ...idCardForm,
        quantity: qty,
      })

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to create order.')
      }

      // Handle simulated payment mode
      if (orderRes.simulated) {
        const verifyRes = await verifyPublicIdCardPayment({
          order_id: orderRes.order_id,
          razorpay_payment_id: 'sim_pay_' + Date.now(),
          razorpay_order_id: orderRes.order_id,
          razorpay_signature: 'sim_signature_' + Date.now()
        })

        if (verifyRes.success) {
          setIdCardSuccessData(verifyRes.data)
        } else {
          setIdCardError(verifyRes.message || 'Payment simulation failed.')
        }
        setIdCardSubmitting(false)
        return
      }

      // Live Razorpay payment
      await loadRazorpayScript()

      const options = {
        key: orderRes.key,
        amount: Math.round(orderRes.amount * 100),
        currency: orderRes.currency || 'INR',
        name: 'AIM Digitalise',
        description: 'Type A (Super PVC) ID Card Order',
        order_id: orderRes.order_id,
        handler: async (response) => {
          try {
            const verifyRes = await verifyPublicIdCardPayment({
              order_id: orderRes.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })

            if (verifyRes.success) {
              setIdCardSuccessData(verifyRes.data)
            } else {
              setIdCardError(verifyRes.message || 'Payment verification failed.')
            }
          } catch (err) {
            setIdCardError('Verification error: ' + (err.response?.data?.message || err.message))
          } finally {
            setIdCardSubmitting(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIdCardError('Payment process cancelled.')
            setIdCardSubmitting(false)
          }
        },
        prefill: {
          name: idCardForm.client_name,
          email: idCardForm.email,
          contact: idCardForm.phone,
        },
        theme: {
          color: '#10b981',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        setIdCardError('Payment failed: ' + (response.error?.description || 'Transaction error'))
        setIdCardSubmitting(false)
      })
      rzp.open()

    } catch (err) {
      setIdCardError(err.response?.data?.message || err.message || 'Order failed.')
      setIdCardSubmitting(false)
    }
  }

  // ── Handlers ──
  const handleSelectDoc = (docId) => {
    setActivePreviewDocId(docId)
    setActiveDocPageIndex(0)
  }

  const handleDownloadDoc = (docId, pageIndex = null) => {
    const doc = OFFICIAL_DOCUMENTS.find((d) => d.id === docId) || OFFICIAL_DOCUMENTS[0]
    if (pageIndex !== null && doc.pages?.[pageIndex]) {
      const p = doc.pages[pageIndex]
      const link = document.createElement('a')
      link.href = p.file
      link.download = p.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }
    if (doc.pages && doc.pages.length) {
      doc.pages.forEach((p, idx) => {
        setTimeout(() => {
          const link = document.createElement('a')
          link.href = p.file
          link.download = p.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }, idx * 200)
      })
    } else {
      const link = document.createElement('a')
      link.href = doc.file
      link.download = doc.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const openProposalModal = () => {
    setProposalFormData({ school_name: '', address: '', principal_name: '', email: '', contact_no: '', otp: '' })
    setOtpSent(false)
    setOtpVerified(false)
    setOtpNotice('')
    setProposalError('')
    setIsSendingOtp(false)
    setIsVerifyingOtp(false)
    setIsSubmittingProposal(false)
    setProposalSuccess(false)
    setIsProposalModalOpen(true)
  }

  const handleSendOtp = async () => {
    setProposalError('')
    if (!proposalFormData.email || !proposalFormData.email.includes('@')) {
      setProposalError('Please enter a valid Email ID first.')
      return
    }
    setIsSendingOtp(true)
    setOtpNotice('')
    try {
      await sendProposalOtp(proposalFormData.email.trim())
      setOtpSent(true)
      setOtpNotice('✉️ Verification OTP has been sent to your Email ID. Please check your inbox.')
    } catch (err) {
      setProposalError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    setProposalError('')
    if (!proposalFormData.otp || proposalFormData.otp.trim().length !== 4) {
      setProposalError('Please enter the 4-digit OTP.')
      return
    }
    setIsVerifyingOtp(true)
    try {
      const res = await verifyProposalOtp(proposalFormData.email.trim(), proposalFormData.otp.trim())
      setOtpVerified(true)
      setOtpNotice(res.message || '✅ Email ID verified successfully!')
    } catch (err) {
      setProposalError(err.message || 'Invalid or expired OTP.')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleProposalSubmit = async (e) => {
    e.preventDefault()
    setProposalError('')
    if (!proposalFormData.school_name || !proposalFormData.address || !proposalFormData.principal_name || !proposalFormData.contact_no) {
      setProposalError('Please fill all required fields.')
      return
    }
    if (!otpVerified) {
      setProposalError('Please verify your Email ID with OTP before requesting proposal.')
      return
    }
    setIsSubmittingProposal(true)
    try {
      await submitProposal({
        school_name: proposalFormData.school_name.trim(),
        address: proposalFormData.address.trim(),
        principal_name: proposalFormData.principal_name.trim(),
        email: proposalFormData.email.trim(),
        contact_no: proposalFormData.contact_no.trim(),
      })
      // Note: Proposal is not downloaded automatically. Admin will review and send it via email from the admin portal.
      setProposalSuccess(true)
      setTimeout(() => {
        setIsProposalModalOpen(false)
      }, 4000)
    } catch (err) {
      setProposalError(err.message || 'Failed to submit proposal request. Please try again.')
    } finally {
      setIsSubmittingProposal(false)
    }
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
                    to="/saas-software?plan=15&register=true"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {['A to Z Features Available', 'Fully Automated & 100% Customizable', 'If Anyone claim any core Features not Available then Software will be 100% free', '5 Layer Support System with assigned 1 Dedicated RM'].map((f, i) => (
                      <div key={i} className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] sm:text-xs text-slate-200 flex items-start gap-2 leading-snug">
                        <span className="text-aim-gold font-bold shrink-0 mt-0.5">✓</span>
                        <span className="whitespace-normal break-words">{f}</span>
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
              <div className="inline-flex items-center justify-center px-6 py-3 rounded-2xl  ">
                <img src={nexgnLogo} alt="NEXGN" className="h-16 sm:h-40 md:h-24 w-auto object-contain" />
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
                        <p className="text-xs font-bold text-aim-gold uppercase tracking-wider">Nexgn Institute Pro</p>
                        <div className="h-4" />
                        <h3 className="text-xl font-black text-white">SCHOOL MANAGEMENT<br />Cloud Software</h3>
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
                    to="/saas-software?plan=15&register=true"
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
                        <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Nexgn Institute Pro Plus</p>
                        <div className="h-4" />
                        <h3 className="text-xl font-black text-white">COLLEGE MANAGEMENT<br />Cloud Software</h3>
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
                    to="/saas-software?plan=15&register=true"
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
            STANDALONE SMART ID CARD SERVICE SECTION (Type A SUPER PVC - Non-Clients)
        ══════════════════════════════════════════════════════════ */}
        <section className="py-16 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-white/10">
          <div className="container-custom relative z-10 space-y-10">
            
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/30 shadow-sm">
                <span>🪪</span> Standalone Printing Service (No SaaS Subscription Required)
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Student ID Card Printing — <span className="text-emerald-400">Type A (Super PVC)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Designed for non-client institutions, schools, colleges, institutes &amp; organizations who only require high-durability, ready-to-use smart ID cards. Select student quantity, calculate live cost, and order directly.
              </p>
            </div>

            {/* Standalone Card Box */}
            <div className="max-w-4xl mx-auto rounded-3xl bg-aim-navy-card/95 border border-emerald-500/30 p-6 sm:p-9 shadow-2xl hover:border-emerald-400 transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                
                {/* Left Column: Product Info & Live Estimator */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl">🪪</div>
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">SUPER PVC</span>
                        <h3 className="text-lg font-black text-white mt-1">Students &amp; Teachers ID Card (Type A)</h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ready Card (20 mm Multi color Ribbon, PVC supper Card, Card Holder &amp; clip). High durability gloss finish. Thermal dye-sublimation print quality with long life span.
                  </p>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span> 20mm Multi-Color Premium Printed Ribbon
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span> High Durability Waterproof Super PVC Gloss Card
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span> Protective Transparent Card Holder &amp; Metal Clip Included
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span> Free Student Photo &amp; Data Template Format Included
                    </div>
                  </div>

                  {/* Quantity & Live Price Estimator */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quantity (Students / Staff)</label>
                        <span className="text-[10px] text-slate-500">Rate: ₹60.00 / card</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={idCardQuantity}
                          onChange={(e) => setIdCardQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-24 px-3 py-1.5 text-center font-bold text-sm bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-emerald-400 font-mono shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-2.5 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Estimated Cost</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          (Subtotal: ₹{(Math.max(1, parseInt(idCardQuantity) || 1) * 60).toLocaleString('en-IN')} + 18% GST)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-emerald-400 font-mono">
                          ₹{((Math.max(1, parseInt(idCardQuantity) || 1) * 60) * 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenIdCardModal}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider text-center shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🪪</span>
                    <span>Order Super PVC ID Cards Now</span>
                    <span>→</span>
                  </button>

                </div>

                {/* Right Column: Visual Card Highlight */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 text-center space-y-4 shadow-inner">
                  <div className="relative w-48 h-64 rounded-2xl bg-gradient-to-b from-emerald-600 via-slate-800 to-slate-900 p-4 border-2 border-emerald-400/40 shadow-2xl flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-400 text-slate-950 text-[8px] font-black uppercase">TYPE A</div>
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-700/80 border border-white/20 flex items-center justify-center text-xl mt-2">👤</div>
                    <div className="space-y-1">
                      <div className="h-2 w-3/4 bg-emerald-400/80 rounded mx-auto"></div>
                      <div className="h-1.5 w-1/2 bg-slate-400 rounded mx-auto"></div>
                      <div className="h-1.5 w-2/3 bg-slate-500 rounded mx-auto"></div>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between text-[8px] font-mono text-slate-400">
                      <span>SUPER PVC</span>
                      <span>₹60.00 / Card</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Premium Finished Ready Cards</h4>
                    <p className="text-[11px] text-slate-400">Includes 20mm multicolor lanyard ribbon, heavy-duty pouch &amp; clip.</p>
                  </div>
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
                      onClick={() => handleSelectDoc(doc.id)}
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
                          onClick={(e) => { e.stopPropagation(); handleSelectDoc(doc.id) }}
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

              {/* Right: Embedded PDF / Image viewer */}
              <div className="lg:col-span-7 flex flex-col rounded-3xl overflow-hidden border border-white/15 bg-aim-navy-card/95 shadow-2xl">
                <div className="px-4 py-3 bg-slate-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{currentPage.type === 'image' ? '🖼️' : '📑'}</span>
                    <span className="text-xs font-bold text-white truncate">{currentPreviewDoc.title}</span>
                  </div>

                  {/* Page Selector Tabs if multi-page */}
                  {currentPreviewDoc.pages && currentPreviewDoc.pages.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                      {currentPreviewDoc.pages.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => setActiveDocPageIndex(pIdx)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${activeDocPageIndex === pIdx
                            ? 'bg-aim-gold text-aim-navy font-black shadow'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <a
                      href={currentPage.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-bold text-slate-200"
                    >
                      🔗 Open Fullscreen
                    </a>
                    <button
                      onClick={() => currentPreviewDoc.id === 'proposal' ? openProposalModal() : handleDownloadDoc(currentPreviewDoc.id, activeDocPageIndex)}
                      className="px-3 py-1 rounded bg-gradient-to-r from-aim-gold to-amber-400 text-aim-navy text-[11px] font-black uppercase cursor-pointer hover:scale-105 transition-all"
                    >
                      📥 Download
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-h-[460px] max-h-[620px] bg-slate-950 p-2 sm:p-3 flex items-center justify-center overflow-hidden">
                  {currentPage.type === 'image' ? (
                    <div className="w-full h-full min-h-[460px] max-h-[600px] overflow-y-auto flex items-center justify-center p-2 bg-black/40 rounded-xl">
                      <img
                        key={`${currentPreviewDoc.id}-${activeDocPageIndex}`}
                        src={currentPage.file}
                        alt={`${currentPreviewDoc.title} - ${currentPage.name}`}
                        className="max-h-[560px] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-300 hover:scale-[1.01]"
                      />
                    </div>
                  ) : (
                    <iframe
                      key={`${currentPreviewDoc.id}-${activeDocPageIndex}`}
                      src={`${currentPage.file}#toolbar=1&navpanes=0&scrollbar=1`}
                      title={`${currentPreviewDoc.title} - ${currentPage.name}`}
                      className="w-full h-full min-h-[460px] rounded-xl bg-white shadow-inner"
                    />
                  )}
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
              <Link to="/saas-software?plan=15&register=true" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-aim-gold via-amber-400 to-aim-gold text-aim-navy font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
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
                <p className="text-xs text-slate-300">Provide your institution details to receive the official commercial proposal PDF on your email.</p>
              </div>

              {proposalSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="text-5xl animate-bounce">🎉</div>
                  <h4 className="text-lg font-black text-emerald-400">Proposal Request Submitted!</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto">
                    Thank you! Your institutional proposal request has been logged. Our administration desk will review your details and send the official proposal with commercial pricing directly to your verified email.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                    ✓ Request Received • Proposal Will Be Sent to Your Email
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProposalSubmit} className="space-y-4">

                  {proposalError && (
                    <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                      <span className="shrink-0 font-bold">⚠️</span>
                      <span>{proposalError}</span>
                    </div>
                  )}

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
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-200">
                        Official Email ID <span className="text-aim-gold">*</span>
                      </label>
                      {otpVerified ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <span>✓</span> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-300 font-semibold">(Requires OTP Verification)</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        disabled={otpVerified}
                        placeholder="official@school.edu.in"
                        value={proposalFormData.email}
                        onChange={(e) => setProposalFormData({ ...proposalFormData, email: e.target.value })}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-aim-gold transition-colors disabled:opacity-60 disabled:bg-white/[0.02]"
                      />
                      {!otpVerified && (
                        <button
                          type="button"
                          disabled={isSendingOtp || !proposalFormData.email}
                          onClick={handleSendOtp}
                          className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 text-aim-gold border border-amber-500/30 text-xs font-bold whitespace-nowrap hover:bg-amber-500/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          {isSendingOtp ? (
                            <>
                              <span className="w-3 h-3 border-2 border-aim-gold border-t-transparent rounded-full animate-spin inline-block" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            otpSent ? 'Resend OTP' : 'Send OTP'
                          )}
                        </button>
                      )}
                    </div>

                    {/* OTP input row */}
                    {otpSent && !otpVerified && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="4-Digit OTP"
                            value={proposalFormData.otp}
                            onChange={(e) => setProposalFormData({ ...proposalFormData, otp: e.target.value })}
                            className="w-32 px-4 py-2 rounded-xl bg-white/10 border border-aim-gold text-white text-xs tracking-widest font-mono text-center focus:outline-none placeholder:text-slate-500 placeholder:tracking-normal"
                          />
                          <button
                            type="button"
                            disabled={isVerifyingOtp || !proposalFormData.otp || proposalFormData.otp.trim().length !== 4}
                            onClick={handleVerifyOtp}
                            className="px-4 py-2 rounded-xl bg-aim-gold text-aim-navy text-xs font-black uppercase tracking-wider hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-1.5"
                          >
                            {isVerifyingOtp ? (
                              <>
                                <span className="w-3 h-3 border-2 border-aim-navy border-t-transparent rounded-full animate-spin inline-block" />
                                <span>Verifying...</span>
                              </>
                            ) : (
                              'VERIFY'
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {otpNotice && (
                      <div className={`p-2.5 rounded-xl text-xs font-medium font-mono border ${
                        otpVerified 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}>
                        {otpNotice}
                      </div>
                    )}
                  </div>

                  {/* Contact No */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">Contact No <span className="text-aim-gold">*</span></label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={proposalFormData.contact_no}
                      onChange={(e) => setProposalFormData({ ...proposalFormData, contact_no: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-aim-gold transition-colors"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 space-y-1.5">
                    <button
                      type="submit"
                      disabled={!otpVerified || isSubmittingProposal}
                      className={`w-full py-3.5 rounded-2xl text-aim-navy font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        !otpVerified || isSubmittingProposal
                          ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed border border-white/10'
                          : 'bg-gradient-to-r from-aim-gold via-amber-400 to-aim-gold shadow-2xl shadow-aim-gold/30 hover:scale-[1.02] active:scale-95 cursor-pointer'
                      }`}
                    >
                      {isSubmittingProposal ? (
                        <>
                          <span className="w-4 h-4 border-2 border-aim-navy border-t-transparent rounded-full animate-spin inline-block" />
                          <span>Submitting Proposal Request...</span>
                        </>
                      ) : (
                        'Get Proposal With Commercial'
                      )}
                    </button>
                    {!otpVerified && (
                      <p className="text-[11px] text-center text-slate-400 font-medium">
                        * Please verify your email with OTP above to enable proposal download.
                      </p>
                    )}
                  </div>
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
                    to="/saas-software?plan=15&register=true"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-aim-gold to-amber-400 text-aim-navy font-black text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-lg"
                  >
                    🚀 Activate Plan
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── Standalone Type A ID Card Purchase Modal ── */}
        {isIdCardModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#071226] border border-emerald-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6"
            >
              {/* Close */}
              <button
                onClick={() => setIsIdCardModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors text-sm font-bold cursor-pointer"
              >✕</button>

              {idCardSuccessData ? (
                /* Success Receipt View */
                <div className="space-y-6 text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-3xl mx-auto">
                    ✅
                  </div>
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">Order Confirmed &amp; Paid</span>
                    <h3 className="text-2xl font-black text-white">ID Card Order Confirmation</h3>
                    <p className="text-xs text-slate-300">Thank you! Your order for Type A Super PVC ID cards has been successfully placed.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 text-left space-y-3 font-sans text-xs">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-400">Order Reference #:</span>
                      <strong className="text-emerald-400 font-mono font-bold">{idCardSuccessData.order_number}</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-400">Institution / Client:</span>
                      <strong className="text-white">{idCardSuccessData.institution_name} ({idCardSuccessData.client_name})</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-400">Card Specification:</span>
                      <strong className="text-white">Type A - SUPER PVC (₹60.00 / card)</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-400">Quantity Ordered:</span>
                      <strong className="text-white font-mono">{idCardSuccessData.quantity} Cards</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-400">Subtotal:</span>
                      <strong className="text-slate-200 font-mono">₹{parseFloat(idCardSuccessData.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-400">GST (18%):</span>
                      <strong className="text-slate-200 font-mono">₹{parseFloat(idCardSuccessData.gst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-white font-bold">Total Amount Paid:</span>
                      <strong className="text-emerald-400 text-base font-mono font-black">₹{parseFloat(idCardSuccessData.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsIdCardModalOpen(false)}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                  >
                    Done &amp; Close Receipt
                  </button>
                </div>
              ) : (
                /* Order Form View */
                <form onSubmit={handleIdCardOrderSubmit} className="space-y-5">
                  <div className="border-b border-white/10 pb-4 space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                      Standalone Purchase
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Order Type A (Super PVC) ID Cards
                    </h3>
                    <p className="text-xs text-slate-300">
                      Enter your shipping and billing details below. Our team will contact you to collect photo templates and data.
                    </p>
                  </div>

                  {idCardError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
                      ⚠️ {idCardError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">Institution / Organization Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. St. Mark International Academy"
                        value={idCardForm.institution_name}
                        onChange={(e) => setIdCardForm({ ...idCardForm, institution_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">Contact Person Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={idCardForm.client_name}
                        onChange={(e) => setIdCardForm({ ...idCardForm, client_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="official@school.edu.in"
                        value={idCardForm.email}
                        onChange={(e) => setIdCardForm({ ...idCardForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">Phone / WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={idCardForm.phone}
                        onChange={(e) => setIdCardForm({ ...idCardForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-slate-300 font-bold block">Full Delivery Address *</label>
                      <textarea
                        required
                        rows="2"
                        placeholder="Campus address where cards will be delivered"
                        value={idCardForm.address}
                        onChange={(e) => setIdCardForm({ ...idCardForm, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">District *</label>
                      <input
                        type="text"
                        required
                        placeholder="District"
                        value={idCardForm.district}
                        onChange={(e) => setIdCardForm({ ...idCardForm, district: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">State *</label>
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={idCardForm.state}
                        onChange={(e) => setIdCardForm({ ...idCardForm, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-slate-300 font-bold block">PIN Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="6-digit PIN code"
                        value={idCardForm.pin_code}
                        onChange={(e) => setIdCardForm({ ...idCardForm, pin_code: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Card Quantity:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={idCardQuantity}
                          onChange={(e) => setIdCardQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 px-2 py-1 text-center font-bold text-xs bg-slate-800 border border-white/20 rounded-lg text-white font-mono"
                        />
                        <span>Cards @ ₹60.00</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span>Subtotal:</span>
                      <span className="font-mono">₹{(Math.max(1, parseInt(idCardQuantity) || 1) * 60).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span>GST (18%):</span>
                      <span className="font-mono">₹{((Math.max(1, parseInt(idCardQuantity) || 1) * 60) * 0.18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="border-t border-white/10 pt-2 flex justify-between items-center font-bold text-sm text-white">
                      <span>Grand Total Amount Due:</span>
                      <span className="text-emerald-400 font-mono text-base font-black">
                        ₹{((Math.max(1, parseInt(idCardQuantity) || 1) * 60) * 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={idCardSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {idCardSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Processing Order &amp; Gateway...</span>
                      </>
                    ) : (
                      <>
                        <span>💳</span>
                        <span>Pay ₹{((Math.max(1, parseInt(idCardQuantity) || 1) * 60) * 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2 })} &amp; Confirm Order</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default SchoolCollegeSaas
