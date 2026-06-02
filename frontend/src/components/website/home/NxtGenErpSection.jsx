import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '../../ui/Card'
import Button from '../../ui/Button'

const erpTabs = [
  {
    id: 'overview',
    label: 'Overview & Cloud Model',
    videoPath: '/src/assets/videos/erp_overview.mp4',
    fallbackVideo: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-loop-41852-large.mp4',
    title: 'Cloud-Based Operations Suite',
    description: 'Designed and developed by AIM Digitalise Pvt. Ltd. to cater to small and medium-scale industries. Providing a comprehensive suite of features to streamline various business operations on a subscription licensing model at a highly competitive lower price.',
    features: [
      { name: 'Subscription-Based licensing', desc: 'Lower, predictable monthly cost' },
      { name: 'User-Friendly Interface', desc: 'No extensive team training required' },
      { name: 'Industry-Specific Solutions', desc: 'Custom modules built around your segment' },
      { name: 'Secure Cloud Platform', desc: 'Hosted securely with automated backups' }
    ]
  },
  {
    id: 'inventory',
    label: 'Inventory & Vendor Relations',
    videoPath: '/src/assets/videos/inventory_mgmt.mp4',
    fallbackVideo: 'https://assets.mixkit.co/videos/preview/mixkit-data-center-server-racks-interstitial-40439-large.mp4',
    title: 'Integrated Vendor & Stock Pipelines',
    description: 'Track inventory lifecycles with absolute transparency. Integrate vendor profiles directly, build automatic re-order triggers, and analyze procurement streams instantly.',
    features: [
      { name: 'Vendor Profiles & SLAs', desc: 'Monitor delivery compliance & records' },
      { name: 'Stock level analytics', desc: 'Avoid running low or overstocking assets' },
      { name: 'Month-wise Purchase Reports', desc: 'Track spending fluctuations monthly' },
      { name: 'Vendor-wise Purchase Reports', desc: 'Analyze pricing tiers per suppliers' }
    ]
  },
  {
    id: 'hr_finance',
    label: 'HR Management & Sales Reports',
    videoPath: '/src/assets/videos/hr_payroll.mp4',
    fallbackVideo: 'https://assets.mixkit.co/videos/preview/mixkit-working-with-business-analytics-and-financial-charts-40186-large.mp4',
    title: 'HR Compliance & Advanced Performance Reports',
    description: 'Track employee attendance, manage leaves, and automate compliance with payroll systems. Make informed decisions with executive-level sales reports and MTD/YTD tracking.',
    features: [
      { name: 'Automated HR & Payroll', desc: 'Automate salary releases & tax compliances' },
      { name: 'Performance & Attendance', desc: 'Track leave cycles & employee output stats' },
      { name: 'Granular Sales Reports', desc: 'Branch-wise, executive-wise, & product-wise sales' },
      { name: 'MTD & YTD Financial Reporting', desc: 'Sales, revenue tracking & performance metrics' }
    ]
  }
]

const NxtGenErpSection = () => {
  const [activeTab, setActiveTab] = useState(0)
  const currentTab = erpTabs[activeTab]

  return (
    <section className="relative py-24 overflow-hidden section-tinted bg-grid-pattern">
      <div className="ambient-glows" aria-hidden />

      <div className="relative container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="badge-pill">
            <span className="badge-pill-dot-red" />
            Enterprise Solutions
          </div>
          <h2 className="heading-display">
            Meet <span className="text-gradient">NxtGen ERP</span>
          </h2>
          <p className="text-lg copy-on-dark-muted">
            A comprehensive, cloud-based ERP ecosystem designed and developed by <span className="text-white font-semibold">AIM Digitalise Pvt. Ltd.</span> to streamline operations for small and medium-scale industries.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Interactive Tab Info */}
          <div className="lg:col-span-6 space-y-8 text-left">
            
            {/* Tab Selectors */}
            <div className="flex flex-col sm:flex-row gap-2 bg-aim-navy-light/60 p-1.5 rounded-2xl border border-white/10">
              {erpTabs.map((tab, idx) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    activeTab === idx
                      ? 'bg-aim-gold text-aim-navy shadow-lg shadow-aim-gold/20'
                      : 'text-aim-copy-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Info details */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {currentTab.title}
                  </h3>
                  <p className="text-aim-copy text-sm leading-relaxed">
                    {currentTab.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {currentTab.features.map((feature, i) => (
                    <Card
                      key={i}
                      padding="sm"
                      className="p-4 flex gap-3 text-left hover:border-aim-gold/30 hover:shadow-md transition-all duration-200"
                    >
                      <div className="p-1 rounded bg-aim-gold/15 text-aim-highlight shrink-0 h-7 w-7 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{feature.name}</h4>
                        <p className="text-aim-copy-muted text-[11px] mt-0.5 leading-snug">{feature.desc}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* General CTA */}
            <div className="flex gap-4">
              <Button variant="primary" size="lg" className="cursor-pointer">
                <span>Book ERP Demo</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <Button variant="secondary" size="lg" className="cursor-pointer">
                <span>Read Case Study</span>
              </Button>
            </div>
          </div>

          {/* Right Column: Video Playback Screen */}
          <div className="lg:col-span-6 relative">
            {/* Glowing blur behind screen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-red-500/10 rounded-3xl blur-2xl opacity-60"></div>

            <div className="relative bg-white border border-slate-200 rounded-3xl p-4 shadow-2xl overflow-hidden">
              
              {/* Fake Window Header bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4 px-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-red-500/85"></span>
                  <span className="w-3 h-3 rounded-full bg-blue-500/85"></span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">NxtGen_ERP_{currentTab.id}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
              </div>

              {/* Video Player */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 aspect-video relative">
                {/* 
                  Keying the video element to the tab id forces React to reconstruct it 
                  so that it immediately downloads and plays the correct fallback 
                  or local stream when the active tab is switched.
                */}
                <video
                  key={currentTab.id}
                  className="w-full h-full object-cover shadow-inner"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                >
                  <source src={currentTab.videoPath} type="video/mp4" />
                  <source src={currentTab.fallbackVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Bottom tag */}
              <div className="mt-4 flex items-center justify-between px-2 text-[10px] text-slate-400">
                <span>Designed &amp; Developed by AIM Digitalise Pvt. Ltd.</span>
                <span>Active Model: Cloud-Subscription</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NxtGenErpSection
