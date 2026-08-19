import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import nexgnBrochurePdf from '../../../assets/doc/Inside page.pdf'
import nexgnBrochurePdf2 from '../../../assets/doc/Front page.pdf'
import nexgnProposalLetterPdf from '../../../assets/doc/NEXGN Proposal Letter.pdf'
import nexgnLogo from '../../../assets/images/nexgnlogo.png'

// Newly added portal screenshot images
import admin1 from '../../../assets/images/admin1.png'
import admin2 from '../../../assets/images/admin2.png'
import student1 from '../../../assets/images/student1.png'
import student2 from '../../../assets/images/student2.png'
import teacher1 from '../../../assets/images/teacher1.png'
import teacher2 from '../../../assets/images/teacher2.png'

const PREVIEW_GALLERY = {
  admin: {
    title: 'Admin Master Portal',
    subtitle: 'Complete institutional governance, fee register, analytics & employee control',
    icon: '👑',
    color: 'from-amber-500 to-yellow-400',
    badge: 'Admin Control Center',
    images: [
      { src: admin1, caption: 'Admin Dashboard & Real-Time Operational Overview' },
      { src: admin2, caption: 'Institutional Analytics, Fee Ledger & Reports Hub' },
    ],
  },
  teacher: {
    title: 'Teacher & Faculty Portal',
    subtitle: 'Daily attendance marking, gradebook management & timetable scheduler',
    icon: '👨‍🏫',
    color: 'from-blue-500 to-cyan-400',
    badge: 'Faculty Classroom Suite',
    images: [
      { src: teacher1, caption: 'Classroom Attendance & Live Roll Call Registry' },
      { src: teacher2, caption: 'Marksheet Entry & Examination Gradebook Console' },
    ],
  },
  student: {
    title: 'Student & Parent App Portal',
    subtitle: 'Instant fee payments, digital receipt downloads, timetable & progress tracker',
    icon: '🎓',
    color: 'from-emerald-500 to-teal-400',
    badge: 'Parent & Student Dashboard',
    images: [
      { src: student1, caption: 'Student Dashboard, Attendance Stats & Notices' },
      { src: student2, caption: 'Digital Fee Receipts, Timetable & Academic Progress' },
    ],
  },
}

const NexgnInstituteSection = () => {
  const [showContactModal, setShowContactModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showBrochureModal, setShowBrochureModal] = useState(false)
  const [activePortalTab, setActivePortalTab] = useState('admin')
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const handleOpenPreview = (portalKey = 'admin') => {
    setActivePortalTab(portalKey)
    setActiveImageIndex(0)
    setShowPreviewModal(true)
  }

  const handleDownloadDoc = (brochureNum = 1) => {
    const link = document.createElement('a')
    if (brochureNum === 1 || brochureNum === '1') {
      link.href = nexgnProposalLetterPdf
      link.download = 'NEXGN_Institute_Brochure_1.pdf'
    } else {
      link.href = nexgnBrochurePdf
      link.download = 'NEXGN_Institute_Brochure_2.pdf'
    }
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const currentGallery = PREVIEW_GALLERY[activePortalTab] || PREVIEW_GALLERY.admin
  const currentImage = currentGallery.images[activeImageIndex] || currentGallery.images[0]

  return (
    <section className="relative py-20 bg-aim-navy overflow-hidden border-b border-white/5">
      {/* Background Glows & Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-aim-purple/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-aim-gold/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      </div>

      <div className="relative container-custom z-10">
        {/* Top Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-aim-gold/15 to-amber-500/10 border border-aim-gold/30 text-aim-gold text-xs font-black uppercase tracking-widest shadow-lg shadow-aim-gold/5">
            <span className="w-2 h-2 rounded-full bg-aim-gold animate-ping" />
            <span>India's No. 1 School & College Management Ecosystem</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            <span className="text-[#facc15]">NE</span>
            <span className="text-[#ef4444]">X</span>
            <span className="text-[#facc15]">GN</span>{' '}
            <span className="text-white">by</span>{' '}
            <span className="bg-gradient-to-r from-white via-slate-200 to-aim-gold bg-clip-text text-transparent">
              AIM Digitalise
            </span>
          </h2>

          <p className="text-sm sm:text-base text-aim-copy-muted max-w-2xl mx-auto leading-relaxed">
            Empower your educational institution with India's most advanced, secure, and intuitive cloud-based management platform. Built to automate admissions, fee collection, smart attendance, and examination workflows effortlessly.
          </p>
        </div>

        {/* 2-Column Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* LEFT CARD: NEXGN Institute Pro (School Management System) */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative rounded-3xl bg-aim-navy-card/85 border border-white/10 p-7 sm:p-9 flex flex-col justify-between shadow-2xl backdrop-blur-xl hover:border-aim-gold/40 transition-all duration-300 hover:shadow-aim-gold/10 hover:-translate-y-1"
          >
            {/* Top Accent Pill */}
            <div className="absolute top-0 right-8 -translate-y-1/2 px-3.5 py-1 rounded-full bg-aim-gold text-aim-navy text-[10px] font-black uppercase tracking-wider shadow-md">
              Most Popular
            </div>

            <div className="space-y-6">
              {/* Product Title & Image Preview Button */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shadow-inner">
                      🏫
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-aim-gold transition-colors">
                        NEXGN Institute Pro
                      </h3>
                      <p className="text-xs font-bold text-aim-gold uppercase tracking-wider">
                        School & College Management System
                      </p>
                    </div>
                  </div>

                  {/* 🖼️ IMAGE PREVIEW BUTTON */}
                  <button
                    onClick={() => handleOpenPreview('admin')}
                    className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-aim-gold/20 via-amber-500/20 to-aim-gold/20 hover:from-aim-gold hover:to-amber-400 text-aim-gold hover:text-aim-navy border border-aim-gold/40 hover:border-transparent text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-aim-gold/30 hover:scale-105 flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="Click to preview Admin, Teacher & Student portal screenshots"
                  >
                    <span className="text-sm">🖼️</span>
                    <span>Image Preview</span>
                  </button>
                </div>
              </div>

              {/* Elaboration / Project Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                An all-in-one institutional ERP built to streamline complete academic, administrative, and financial workflows. Designed for schools, coaching institutes, and colleges seeking effortless digitization without complex hardware.
              </p>

              {/* Quick Portal UI Thumbnails Preview Strip */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-aim-copy-muted uppercase tracking-wider flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Interactive UI Screenshots:</span>
                  </span>
                  <span className="text-[10px] text-aim-gold font-bold">Click to view full screen</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'admin', img: admin1, label: 'Admin Desk', icon: '👑', color: 'border-amber-500/40 hover:border-aim-gold' },
                    { key: 'teacher', img: teacher1, label: 'Faculty App', icon: '👨‍🏫', color: 'border-blue-500/40 hover:border-blue-400' },
                    { key: 'student', img: student1, label: 'Student Portal', icon: '🎓', color: 'border-emerald-500/40 hover:border-emerald-400' },
                  ].map((thumb) => (
                    <button
                      key={thumb.key}
                      onClick={() => handleOpenPreview(thumb.key)}
                      className={`group/thumb relative rounded-xl overflow-hidden border bg-aim-navy-light/60 p-1.5 text-left transition-all duration-200 hover:scale-[1.03] cursor-pointer shadow-sm ${thumb.color}`}
                    >
                      <div className="h-14 sm:h-16 w-full rounded-lg overflow-hidden relative bg-black/40">
                        <img
                          src={thumb.img}
                          alt={thumb.label}
                          className="w-full h-full object-cover object-top group-hover/thumb:scale-110 transition-transform duration-300 opacity-80 group-hover/thumb:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                          <span className="text-[9px] font-bold text-white truncate flex items-center gap-1">
                            <span>{thumb.icon}</span>
                            <span>{thumb.label}</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  { icon: '🎓', text: 'Student Admissions & Lifecycle' },
                  { icon: '💳', text: 'Auto Fee Collection & Receipts' },
                  { icon: '📅', text: 'Smart Attendance & Timetable' },
                  { icon: '📊', text: 'Exam Gradebooks & Report Cards' },
                  { icon: '💬', text: 'Parent SMS & WhatsApp Alerts' },
                  { icon: '📚', text: 'Digital Library & ID Card Maker' },
                ].map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300"
                  >
                    <span className="text-sm">{feat.icon}</span>
                    <span className="font-semibold truncate">{feat.text}</span>
                  </div>
                ))}
              </div>

              {/* 2 Brochure Downloads & Preview Trigger */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-aim-copy-muted uppercase tracking-widest block">
                    Official Brochures & Downloads:
                  </span>
                  <button
                    onClick={() => setShowBrochureModal(true)}
                    className="text-[10px] font-bold text-aim-gold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>👁️</span>
                    <span>Preview Both</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Brochure 1 Download */}
                  <button
                    onClick={() => handleDownloadDoc(1)}
                    className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer hover:border-aim-gold/40 shadow-sm group/btn"
                    title="Download NEXGN Brochure 1 (PDF)"
                  >
                    <span className="text-aim-gold group-hover/btn:scale-110 transition-transform">📥</span>
                    <span>Download Brochure 1</span>
                  </button>

                  {/* Brochure 2 Download */}
                  <button
                    onClick={() => handleDownloadDoc(2)}
                    className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 text-xs font-bold transition-all cursor-pointer hover:border-aim-gold/40 shadow-sm group/btn"
                    title="Download NEXGN Brochure 2 (PDF)"
                  >
                    <span className="text-amber-400 group-hover/btn:scale-110 transition-transform">📥</span>
                    <span>Download Brochure 2</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Action Button: Redirects to SaaS based software */}
            <div className="pt-6 mt-6 border-t border-white/10">
              <Link
                to="/saas-software?plan=15"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-aim-gold via-amber-400 to-aim-gold text-aim-navy font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-aim-gold/20 hover:shadow-aim-gold/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>🚀</span>
                <span>Activate Your Plan</span>
                <span className="text-base font-bold">→</span>
              </Link>
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* RIGHT CARD: NEXGN Institute Pro Plus (Enterprise Multi-Campus System) */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative rounded-3xl bg-aim-navy-card/85 border border-white/10 p-7 sm:p-9 flex flex-col justify-between shadow-2xl backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-purple-500/10 hover:-translate-y-1"
          >
            {/* Top Accent Pill */}
            <div className="absolute top-0 right-8 -translate-y-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
              ✨ Enterprise Plus
            </div>

            <div className="space-y-6">
              {/* Product Title & Image Preview Button */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl shadow-inner">
                      🏛️
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-purple-400 transition-colors flex items-center gap-2">
                        <span>NEXGN Institute Pro Plus</span>
                      </h3>
                      <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                        Next-Gen AI & Multi-Campus Enterprise ERP
                      </p>
                    </div>
                  </div>

                  {/* 🖼️ IMAGE PREVIEW BUTTON */}
                  <button
                    onClick={() => handleOpenPreview('admin')}
                    className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-purple-500/20 hover:from-purple-600 hover:to-indigo-600 text-purple-300 hover:text-white border border-purple-500/40 hover:border-transparent text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-purple-500/30 hover:scale-105 flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="Click to preview Enterprise ERP UI screenshots"
                  >
                    <span className="text-sm">🖼️</span>
                    <span>Image Preview</span>
                  </button>
                </div>
              </div>

              {/* Elaboration / Project Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Enterprise-grade governance suite built for multi-branch school chains, colleges, and university groups. Includes AI student retention insights, live GPS fleet management, and custom white-label mobile applications.
              </p>

              {/* Key Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[
                  { icon: '🏢', text: 'Multi-Campus Central Dashboard' },
                  { icon: '🤖', text: 'AI Academic Performance Predictor' },
                  { icon: '🚌', text: 'Live GPS Bus Tracking & Route Alert' },
                  { icon: '📱', text: 'Custom White-Label Mobile Apps' },
                  { icon: '🔒', text: 'Biometric + RFID Gate Pass Sync' },
                  { icon: '🛡️', text: 'Deep Financial Audit & Tally Sync' },
                ].map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300"
                  >
                    <span className="text-sm">{feat.icon}</span>
                    <span className="font-semibold truncate">{feat.text}</span>
                  </div>
                ))}
              </div>

              {/* 2 Brochure Downloads & Preview Trigger */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-aim-copy-muted uppercase tracking-widest block">
                    Enterprise Brochures & Downloads:
                  </span>
                  <button
                    onClick={() => setShowBrochureModal(true)}
                    className="text-[10px] font-bold text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>👁️</span>
                    <span>Preview Both</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Brochure 1 Download */}
                  <button
                    onClick={() => handleDownloadDoc(1)}
                    className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer hover:border-purple-500/40 shadow-sm group/btn"
                    title="Download NEXGN Brochure 1 (PDF)"
                  >
                    <span className="text-purple-400 group-hover/btn:scale-110 transition-transform">📥</span>
                    <span>Download Brochure 1</span>
                  </button>

                  {/* Brochure 2 Download */}
                  <button
                    onClick={() => handleDownloadDoc(2)}
                    className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-300 text-xs font-bold transition-all cursor-pointer hover:border-purple-500/40 shadow-sm group/btn"
                    title="Download NEXGN Brochure 2 (PDF)"
                  >
                    <span className="text-indigo-400 group-hover/btn:scale-110 transition-transform">📥</span>
                    <span>Download Brochure 2</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Action Button: Triggers Contact Phone Modal */}
            <div className="pt-6 mt-6 border-t border-white/10">
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>⚡</span>
                <span>Activate Your Plan</span>
                <span className="text-base font-bold">→</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 📖 2 BROCHURES PREVIEW MODAL (With download button on bottom right)  */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showBrochureModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
              onClick={() => setShowBrochureModal(false)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-6xl bg-aim-navy-card/95 border border-white/20 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[92vh]"
            >
              {/* Modal Top Header */}
              <div className="px-6 py-4 border-b border-white/10 bg-slate-900/80 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-aim-gold/20 border border-aim-gold/40 flex items-center justify-center text-xl">
                    📚
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>NEXGN Official Documentation & Brochures</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-aim-gold/20 text-aim-gold text-[10px] font-black uppercase border border-aim-gold/30">
                        2 Files Available
                      </span>
                    </h3>
                    <p className="text-xs text-aim-copy-muted">
                      Preview the comprehensive product brochure and institutional proposal letter.
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowBrochureModal(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold flex items-center justify-center transition-colors cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {/* 2-Brochures Grid Container with Previews & Single Bottom Right Download Button */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/90 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* ── BROCHURE 1: NEXGN Proposal Letter.pdf ── */}
                <div className="relative rounded-2xl border border-white/15 bg-aim-navy/95 p-4 sm:p-5 flex flex-col justify-between shadow-xl overflow-hidden group">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-aim-gold text-[10px] font-black uppercase border border-aim-gold/30 inline-block mb-1">
                          Brochure 1 of 2
                        </span>
                        <h4 className="text-base font-black text-white">NEXGN Institute Brochure 1</h4>
                        <p className="text-[11px] text-slate-400">Institutional overview, features specification & offerings</p>
                      </div>
                      <span className="text-2xl">📑</span>
                    </div>

                    {/* PDF Preview Frame / Viewer */}
                    <div className="relative w-full h-64 sm:h-72 lg:h-80 rounded-xl overflow-hidden border border-white/10 bg-slate-900 shadow-inner">
                      <iframe
                        src={`${nexgnBrochurePdf2}#toolbar=0&navpanes=0&scrollbar=0`}
                        title="NEXGN Brochure 1 Preview"
                        className="w-full h-full rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Bottom Bar with Exactly ONE Download Button on Bottom Right */}
                  <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-400">
                      <span>Format: </span><strong className="text-white font-mono">PDF (275 KB)</strong>
                    </div>

                    {/* 📥 SINGLE BOTTOM RIGHT DOWNLOAD BUTTON */}
                    <button
                      onClick={() => handleDownloadDoc(1)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-aim-gold to-amber-400 hover:from-amber-400 hover:to-aim-gold text-aim-navy font-black text-xs uppercase tracking-wider shadow-lg shadow-aim-gold/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>📥</span>
                      <span>Download Brochure 1</span>
                    </button>
                  </div>
                </div>

                {/* ── BROCHURE 2: Inside page.pdf ── */}
                <div className="relative rounded-2xl border border-white/15 bg-aim-navy/95 p-4 sm:p-5 flex flex-col justify-between shadow-xl overflow-hidden group">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase border border-purple-500/30 inline-block mb-1">
                          Brochure 2 of 2
                        </span>
                        <h4 className="text-base font-black text-white">NEXGN Institute Brochure 2</h4>
                        <p className="text-[11px] text-slate-400">Complete multi-page product modules & visual breakdown</p>
                      </div>
                      <span className="text-2xl">📖</span>
                    </div>

                    {/* PDF Preview Frame / Viewer */}
                    <div className="relative w-full h-64 sm:h-72 lg:h-80 rounded-xl overflow-hidden border border-white/10 bg-slate-900 shadow-inner">
                      <iframe
                        src={`${nexgnBrochurePdf}#toolbar=0&navpanes=0&scrollbar=0`}
                        title="NEXGN Brochure 2 Preview"
                        className="w-full h-full rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Bottom Bar with Exactly ONE Download Button on Bottom Right */}
                  <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-400">
                      <span>Format: </span><strong className="text-white font-mono">PDF (7.2 MB)</strong>
                    </div>

                    {/* 📥 SINGLE BOTTOM RIGHT DOWNLOAD BUTTON */}
                    <button
                      onClick={() => handleDownloadDoc(2)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>📥</span>
                      <span>Download Brochure 2</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Bottom Footer */}
              <div className="px-6 py-3.5 bg-slate-900/90 border-t border-white/10 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-400">
                  AIM Digitalise Pvt. Ltd. · All Official Rights Reserved
                </span>
                <button
                  onClick={() => setShowBrochureModal(false)}
                  className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 🖼️ HIGH-END IMAGE PREVIEW & UI GALLERY LIGHTBOX MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
              onClick={() => setShowPreviewModal(false)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-5xl bg-aim-navy-card/95 border border-white/20 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[92vh]"
            >
              {/* Modal Top Header */}
              <div className="px-6 py-4 border-b border-white/10 bg-slate-900/60 flex flex-wrap items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-aim-gold/15 border border-aim-gold/30 flex items-center justify-center text-xl">
                    🖼️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">
                        NEXGN Institute Pro – Live Portal Preview
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-aim-gold/20 text-aim-gold text-[10px] font-black uppercase border border-aim-gold/30">
                        {currentGallery.badge}
                      </span>
                    </div>
                    <p className="text-xs text-aim-copy-muted">{currentGallery.subtitle}</p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold flex items-center justify-center transition-colors cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Portal Tabs Selector (Admin, Teacher, Student) */}
              <div className="px-6 py-3 bg-aim-navy-light/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'admin', label: '👑 Admin Portal', count: '2 Views' },
                    { id: 'teacher', label: '👨‍🏫 Teacher Portal', count: '2 Views' },
                    { id: 'student', label: '🎓 Student / Parent Portal', count: '2 Views' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActivePortalTab(tab.id)
                        setActiveImageIndex(0)
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${activePortalTab === tab.id
                        ? 'bg-gradient-to-r from-aim-gold to-amber-400 text-aim-navy border-aim-gold shadow-lg shadow-aim-gold/20'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                        }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${activePortalTab === tab.id ? 'bg-aim-navy/20 text-aim-navy' : 'bg-white/10 text-slate-400'
                          }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Sub-image toggle buttons */}
                <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                  {currentGallery.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeImageIndex === idx
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      Screen {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Screenshot Viewer Container */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/90 flex flex-col items-center justify-center min-h-[350px]">
                <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
                  {/* Browser Mockup Top Bar */}
                  <div className="px-4 py-2 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                      <span className="text-[11px] font-mono text-slate-400 ml-2">
                        https://nexgn.in/{activePortalTab}/dashboard
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-aim-gold">
                      {activeImageIndex + 1} / {currentGallery.images.length}
                    </span>
                  </div>

                  {/* Screenshot Image */}
                  <div className="relative bg-slate-900 flex items-center justify-center overflow-hidden">
                    <motion.img
                      key={`${activePortalTab}-${activeImageIndex}`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      src={currentImage.src}
                      alt={currentImage.caption}
                      className="w-full h-auto max-h-[58vh] object-contain rounded-b-xl"
                    />

                    {/* Left / Right Nav Arrows */}
                    {currentGallery.images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev === 0 ? currentGallery.images.length - 1 : prev - 1
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white font-bold flex items-center justify-center transition-all cursor-pointer hover:scale-110 shadow-xl"
                          title="Previous screenshot"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev === currentGallery.images.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white font-bold flex items-center justify-center transition-all cursor-pointer hover:scale-110 shadow-xl"
                          title="Next screenshot"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {/* Image Caption Footer Bar */}
                  <div className="px-5 py-3 bg-slate-900 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{currentGallery.icon}</span>
                      <span className="text-xs font-bold text-white">{currentImage.caption}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Full HD Web & Mobile Responsive View
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Bottom Action Bar */}
              <div className="px-6 py-4 bg-aim-navy-card border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBrochureModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📚</span>
                    <span>View 2 Brochures</span>
                  </button>

                  <button
                    onClick={() => handleDownloadDoc('proposal')}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-amber-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📑</span>
                    <span>Proposal Letter</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="px-4 py-2 rounded-xl border border-white/15 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close Preview
                  </button>
                  <Link
                    to="/saas-software?plan=15"
                    onClick={() => setShowPreviewModal(false)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-aim-gold to-amber-400 text-aim-navy font-black text-xs uppercase tracking-wider shadow-lg shadow-aim-gold/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🚀</span>
                    <span>Activate Plan</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ENTERPRISE CONTACT MODAL (For Pro Plus Plan Activation) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => setShowContactModal(false)}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-aim-navy-card border border-white/15 rounded-3xl p-7 text-white shadow-2xl z-10 space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-2xl">
                    📞
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Contact Enterprise Desk</h3>
                    <p className="text-xs text-purple-400 font-bold">NEXGN Institute Pro Plus</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="space-y-4 text-xs text-slate-300">
                <p className="leading-relaxed">
                  To activate your <strong className="text-white">NEXGN Institute Pro Plus Enterprise Plan</strong> or schedule a customized multi-campus demo, please reach out to our dedicated solutions team:
                </p>

                <div className="space-y-2.5">
                  <a
                    href="tel:+919876543210"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-aim-gold/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📞</span>
                      <div>
                        <span className="text-[10px] text-aim-copy-muted block font-bold uppercase tracking-wider">Enterprise Helpline</span>
                        <span className="text-sm font-black text-white group-hover:text-aim-gold transition-colors">+91 9876543210</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-aim-gold bg-aim-gold/10 px-2.5 py-1 rounded-lg border border-aim-gold/20">Call Now</span>
                  </a>

                  <a
                    href="tel:+917999874836"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-400/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📱</span>
                      <div>
                        <span className="text-[10px] text-aim-copy-muted block font-bold uppercase tracking-wider">Technical Sales Desk</span>
                        <span className="text-sm font-black text-white group-hover:text-purple-400 transition-colors">+91 7999874836</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">Call Desk</span>
                  </a>

                  <a
                    href="mailto:support@aimdigitalise.com?subject=Inquiry%20for%20NEXGN%20Institute%20Pro%20Plus"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">✉️</span>
                      <div>
                        <span className="text-[10px] text-aim-copy-muted block font-bold uppercase tracking-wider">Official Email Support</span>
                        <span className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">support@aimdigitalise.com</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">Email Us</span>
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default NexgnInstituteSection
