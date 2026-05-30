import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

// Complete detailed plan information for all 16 plans
const subscriptionPlans = [
  {
    id: 1,
    category: 'static',
    categoryLabel: 'STATIC',
    name: 'Single Page Basic Corporate Look Website',
    securityDeposit: '₹1000/-',
    monthlySubscription: '₹599/-',
    description: `Our "Single Page Basic Corporate Look Website" plan delivers a streamlined, professional design tailored for corporate branding. Featuring essential sections like About Us, Services, Testimonials, and Contact, the website ensures a seamless user experience with responsive, mobile-friendly functionality. This plan is ideal for businesses seeking an elegant yet straightforward online presence, combining aesthetics with performance to effectively highlight your brand and core offerings and perfect for startups and small enterprises aiming for professionalism.`,
    customization: `Tailor your website with advanced features like custom tool integration, seamless payment gateway setup, business email configuration, and scalable plan upgrades to ensure a professional and future-ready online presence, all available at additional costs from the subsequent billing cycle.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 2,
    category: 'static',
    categoryLabel: 'STATIC',
    name: 'Static Informative Corporate Look Website',
    securityDeposit: '₹2000/-',
    monthlySubscription: '₹999/-',
    description: `Our "Static Informative Corporate Look Website" plan provides a multi-page framework (up to 5 pages) to comprehensively represent your enterprise. Designed with a clean, classic architecture, it features dedicated sections for your company history, service details, portfolio highlights, and contact tools. This plan delivers a fast, stable, and highly secure digital brochure ideal for businesses focusing on clear information delivery.`,
    customization: `Add advanced custom widgets, interactive contact elements, secure SMTP forms, custom map integrations, and additional static pages tailored to your layout. Extra items can be provisioned at nominal fees.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 3,
    category: 'dynamic',
    categoryLabel: 'DYNAMIC',
    name: 'Dynamic Informative Corporate Look Website',
    securityDeposit: '₹3000/-',
    monthlySubscription: '₹1499/-',
    description: `Our "Dynamic Informative Corporate Look Website" features a robust Content Management System (CMS) enabling your team to edit text, upload images, manage service categories, and publish blog articles on the fly. Ideal for growing businesses that regularly update their offerings, news, or achievements and require a flexible platform without relying on ongoing developer support.`,
    customization: `Integrate custom database models, dynamic FAQ toggles, multi-category blogs, newsletter signups (Mailchimp/Sendgrid), and role-based CMS credentials for your marketing team.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 4,
    category: 'dynamic',
    categoryLabel: 'DYNAMIC',
    name: 'Dynamic Tool-Base Corporate Look Website',
    securityDeposit: '₹4500/-',
    monthlySubscription: '₹1999/-',
    description: `Our "Dynamic Tool-Base Corporate Look Website" goes beyond simple text by adding functional tools such as loan calculators, custom price estimators, registration portals, or client logins. Built for service firms, consultants, and agencies that want to engage users with interactive utilities that add value and capture high-intent leads.`,
    customization: `Customize equations, logic flows, API connections for external data, client dashboard portals, custom PDF reports generation, and webhook triggers to sync leads with your internal CRM.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 5,
    category: 'ecommerce',
    categoryLabel: 'E-COMMERCE',
    name: 'E-Commerce Single Seller Website',
    securityDeposit: '₹5000/-',
    monthlySubscription: '₹2499/-',
    description: `Our "E-Commerce Single Seller Website" provides everything you need to sell products online. Features include an intuitive digital catalog, interactive shopping cart, secure payment gateway integrations (Razorpay, Paytm, Stripe), order tracking, automated email/SMS invoices, and an extensive admin dashboard to manage inventory and sales.`,
    customization: `Configure customized coupon codes, bulk discount logic, custom product variants (size, color), localized shipping rate APIs, and integration with third-party delivery partners.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 6,
    category: 'ecommerce',
    categoryLabel: 'E-COMMERCE',
    name: 'E-Commerce Multi-Seller Market Place',
    securityDeposit: '₹10000/-',
    monthlySubscription: '₹4999/-',
    description: `Our "E-Commerce Multi-Seller Market Place" is a comprehensive Amazon-like platform. It allows multiple independent vendors to register, create their own storefronts, list products, and manage orders. The platform admin controls commissions, vendor approvals, global payouts, and overall marketplace logistics.`,
    customization: `Custom vendor commission structures, split payment routing, vendor micro-sites, advanced vendor reviews, bulk vendor product import tools, and automated payout schedule configurations.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 7,
    category: 'mobile',
    categoryLabel: 'MOBILE APP',
    name: 'Android Mobile Application',
    securityDeposit: '₹8000/-',
    monthlySubscription: '₹3999/-',
    description: `Our "Android Mobile Application" delivers a responsive, fast-loading native-like app built for the Android ecosystem. Includes push notification systems, local storage, API integration, and full setup to deploy the application directly onto the Google Play Store.`,
    customization: `GPS location services, camera integration, biometric login (fingerprint), custom widgets, offline caching, and analytics tools like Firebase or Mixpanel.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 8,
    category: 'mobile',
    categoryLabel: 'MOBILE APP',
    name: 'Android + iOS Mobile Application',
    securityDeposit: '₹15000/-',
    monthlySubscription: '₹6999/-',
    description: `Our "Android + iOS Mobile Application" delivers a dual-platform mobile solution. Built using cutting-edge cross-platform technology (React Native / Flutter), it ensures unified performance, styling, and database sync across both Google Play Store and Apple App Store.`,
    customization: `Apple Sign-in integration, advanced push notifications, in-app purchases, camera/media manipulation tools, background location tracking, and iPad/tablet visual optimizations.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 9,
    category: 'nexgn',
    categoryLabel: 'Based NEXGN SOFTWARE',
    name: 'NEXGN Accounts & Billing',
    securityDeposit: '₹2000/-',
    monthlySubscription: '₹799/-',
    description: `Our "NEXGN Accounts & Billing" is a secure cloud application built for quick GST-compliant invoicing, purchase orders, expenses tracking, and customer ledgers. Ideal for service companies and traders looking to automate their daily accounting entries.`,
    customization: `Custom invoice templates, barcode scanning integration, multi-currency support, custom GST slabs, and automatic billing reminders via SMS/WhatsApp.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 10,
    category: 'nexgn',
    categoryLabel: 'Based NEXGN SOFTWARE',
    name: 'NEXGN Payroll',
    securityDeposit: '₹2500/-',
    monthlySubscription: '₹899/-',
    description: `Our "NEXGN Payroll" simplifies payroll calculations by automatically managing employee salaries, attendance integrations, leaves, bonuses, deductions, and tax compliance. Generates professional payslips instantly and exports PF/ESI files.`,
    customization: `Custom leave policies, multi-tier salary structures, biometric attendance machine integration, customizable shift timings, and department-wise payroll expense reports.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 11,
    category: 'nexgn',
    categoryLabel: 'Based NEXGN SOFTWARE',
    name: 'NEXGN ERP Pro',
    securityDeposit: '₹5000/-',
    monthlySubscription: '₹1999/-',
    description: `Our "NEXGN ERP Pro" integrates HRMS, inventory management, purchase orders, sales pipelines, and customer relationship management (CRM) into one unified cloud workspace. Best suited for medium enterprises looking to eliminate siloed software.`,
    customization: `Role-based permission schemas, custom fields on client profiles, inventory reorder notifications, dynamic sales target widgets, and custom print layouts for PO/Quotes.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 12,
    category: 'nexgn',
    categoryLabel: 'Based NEXGN SOFTWARE',
    name: 'NEXGN ERP Premium Plus',
    securityDeposit: '₹8000/-',
    monthlySubscription: '₹3499/-',
    description: `Our "NEXGN ERP Premium Plus" offers our most comprehensive enterprise ERP. It adds multi-branch synchronization, warehouse stock routing, automated production/manufacturing steps, customizable management dashboards, and full API keys for external apps.`,
    customization: `Multi-warehouse stock transfers, raw material bill of materials (BOM) trackers, custom webhooks, dedicated database instances, and enterprise reporting charts.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 13,
    category: 'nexgn',
    categoryLabel: 'Based NEXGN SOFTWARE',
    name: 'NEXGN Hotel Pro',
    securityDeposit: '₹4000/-',
    monthlySubscription: '₹1499/-',
    description: `Our "NEXGN Hotel Pro" is a dedicated property management system (PMS) built for hotels and guest houses. It streamlines room booking calendars, guest check-in/check-out cards, room service orders, housekeeping statuses, and restaurant POS billing.`,
    customization: `Room category mapping, seasonal pricing engines, OTA booking sync channels, custom restaurant menu setups, and daily occupancy audits.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 14,
    category: 'nexgn',
    categoryLabel: 'Based NEXGN SOFTWARE',
    name: 'NEXGN Hospital Plus',
    securityDeposit: '₹6000/-',
    monthlySubscription: '₹2499/-',
    description: `Our "NEXGN Hospital Plus" manages clinical and hospital operations seamlessly. Tracks Electronic Medical Records (EMR), doctor appointments, OPD/IPD billings, pharmacy stock, lab test result releases, and ward occupancy.`,
    customization: `Custom prescription templates, laboratory test profiles, doctor referral trackers, insurance TPA claim logs, and automated SMS appointment reminders.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 15,
    category: 'nexgn',
    categoryLabel: 'Based NEXGN SOFTWARE',
    name: 'NEXGN Institute Pro',
    securityDeposit: '₹4000/-',
    monthlySubscription: '₹1499/-',
    description: `Our "NEXGN Institute Pro" is an all-in-one school, college, and training center management app. Controls student databases, fee collection registers with payment link dispatch, class timetables, exam scorecard generation, and parent notifications.`,
    customization: `Custom exam grading rubrics, parent portal access, digital library catalogue, dynamic ID card generation, and online admission application portals.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  },
  {
    id: 16,
    category: 'nexgn',
    categoryLabel: 'Based NEXGN SOFTWARE',
    name: 'NEXGN Parking Pro',
    securityDeposit: '₹3000/-',
    monthlySubscription: '₹1199/-',
    description: `Our "NEXGN Parking Pro" is a specialized application for parking plazas and operators. Tracks parking lot capacities, prints QR-coded thermal tickets, calculates parking duration tariffs dynamically, and integrates with RFID gate readers.`,
    customization: `Custom tariff calculations (hourly, slab-based, or passes), multiple entry/exit terminal sync, valet logs, and operator shift cash reports.`,
    complimentary: `Get the Employee Self-Service (ESS) software absolutely free for one year, complete with individual employee logins for attendance and leave management. After the first year, the price will be ₹199/month, instead of ₹27,500 on a monthly subscriptions basis.`,
    support: `Dedicated Relationship Manager will be Assigned`
  }
]

const categories = [
  { id: 'static', label: 'STATIC', color: 'sky' },
  { id: 'dynamic', label: 'DYNAMIC', color: 'teal' },
  { id: 'ecommerce', label: 'E-COMMERCE', color: 'orange' },
  { id: 'mobile', label: 'MOBILE APP', color: 'indigo' },
  { id: 'nexgn', label: 'NEXGN SaaS', color: 'green' }
]

const MonthlySubscription = () => {
  const [activeCategory, setActiveCategory] = useState('static')
  const [activePlanId, setActivePlanId] = useState(1)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    planId: '1',
    message: ''
  })
  const [formStatus, setFormStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formSectionRef = useRef(null)
  const nameInputRef = useRef(null)

  const activePlan = subscriptionPlans.find(plan => plan.id === activePlanId) || subscriptionPlans[0]
  const filteredPlans = subscriptionPlans.filter(plan => plan.category === activeCategory)

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId)
    const firstPlan = subscriptionPlans.find(plan => plan.category === catId)
    if (firstPlan) {
      setActivePlanId(firstPlan.id)
      setFormData(prev => ({
        ...prev,
        planId: firstPlan.id.toString()
      }))
    }
  }

  const handlePlanSelect = (id) => {
    setActivePlanId(id)
    setFormData(prev => ({
      ...prev,
      planId: id.toString()
    }))
  }

  const handleActivateClick = () => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth' })
      setFormData(prev => ({
        ...prev,
        planId: activePlanId.toString()
      }))
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus()
        }
      }, 800)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.phone) {
      setFormStatus({ type: 'error', message: 'Please fill in all required fields (Name, Email, Phone).' })
      return
    }

    setIsSubmitting(true)
    setFormStatus({ type: '', message: '' })

    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      const chosenPlan = subscriptionPlans.find(p => p.id.toString() === formData.planId)
      
      setFormStatus({
        type: 'success',
        message: `Thank you, ${formData.name}! Your interest in the "${chosenPlan ? chosenPlan.name : 'Selected Plan'}" package has been registered. An onboarding manager will contact you at ${formData.phone} or ${formData.email} within 24 hours.`
      })
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        planId: formData.planId,
        message: ''
      })
    } catch (err) {
      setFormStatus({ type: 'error', message: 'An error occurred. Please try again later.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Active styles helpers for category tabs
  const getCategoryTabStyles = (catId) => {
    if (activeCategory !== catId) {
      return 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900/70'
    }
    switch (catId) {
      case 'static': return 'border-sky-500/50 bg-sky-500/10 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.15)] font-bold'
      case 'dynamic': return 'border-teal-500/50 bg-teal-500/10 text-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.15)] font-bold'
      case 'ecommerce': return 'border-orange-500/50 bg-orange-500/10 text-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.15)] font-bold'
      case 'mobile': return 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)] font-bold'
      case 'nexgn': return 'border-green-500/50 bg-green-500/10 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.15)] font-bold'
      default: return 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400'
    }
  }

  const getCategoryButtonActiveStyles = (catId) => {
    switch (catId) {
      case 'static': return 'bg-sky-500/10 border-sky-500/40 text-white shadow-lg shadow-sky-500/5'
      case 'dynamic': return 'bg-teal-500/10 border-teal-500/40 text-white shadow-lg shadow-teal-500/5'
      case 'ecommerce': return 'bg-orange-500/10 border-orange-500/40 text-white shadow-lg shadow-orange-500/5'
      case 'mobile': return 'bg-indigo-500/10 border-indigo-500/40 text-white shadow-lg shadow-indigo-500/5'
      case 'nexgn': return 'bg-green-500/10 border-green-500/40 text-white shadow-lg shadow-green-500/5'
      default: return 'bg-indigo-500/10 border-indigo-500/40 text-white'
    }
  }

  const getCategoryNumberStyles = (catId, isActive) => {
    if (!isActive) return 'bg-slate-850 text-slate-400'
    switch (catId) {
      case 'static': return 'bg-sky-500 text-slate-950 font-black'
      case 'dynamic': return 'bg-teal-500 text-slate-950 font-black'
      case 'ecommerce': return 'bg-orange-500 text-slate-950 font-black'
      case 'mobile': return 'bg-indigo-500 text-slate-950 font-black'
      case 'nexgn': return 'bg-green-500 text-slate-950 font-black'
      default: return 'bg-indigo-500 text-slate-950'
    }
  }

  return (
    <>
      <Helmet>
        <title>Monthly Subscription Plans | AIM Digitalise</title>
        <meta name="description" content="India's 1st monthly subscription based website and software with 100% data security & ownership. Clean layouts, quick activation." />
        <meta name="keywords" content="monthly subscription website, dynamic website price, saas software billing, android mobile app development, e-commerce website packages, India" />
        <link rel="canonical" href="https://aimdigitalise.com/subscription" />
      </Helmet>

      <div className="relative min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 bg-grid-pattern">
        
        {/* Ambient Halos */}
        <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          
          {/* Header & Slogan Block */}
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <nav className="flex justify-center items-center gap-2 text-xs font-semibold text-slate-500 tracking-wider uppercase">
                <a href="/" className="hover:text-indigo-400 transition">Home</a>
                <span className="text-slate-700">/</span>
                <span className="text-slate-400">Monthly Subscriptions</span>
              </nav>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white uppercase">
                Website & Software <span className="text-gradient">On Monthly Subscriptions</span>
              </h1>
            </div>

            {/* Slogan Banner */}
            <div className="w-full bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl shadow-xl backdrop-blur-md max-w-4xl mx-auto">
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-slate-200 tracking-wide uppercase">
                INDIA'S 1st MONTHLY SUBSCRIPTION BASED WEBSITE WITH{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 font-extrabold">
                  100% DATA SECURITY & OWNERSHIP
                </span>
              </h2>
            </div>
          </div>

          {/* MAIN GRID BLOCK */}
          <div className="space-y-6">
            
            {/* 1. Horizontal Category Nav Tabs */}
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto p-1.5 rounded-2xl bg-slate-900/20 border border-slate-900/80 backdrop-blur-sm">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 border cursor-pointer ${getCategoryTabStyles(cat.id)}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* 2. Interactive Split Pane Layout */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: FILTERED PLANS LIST + TRUST WIDGET (4 columns) */}
              <div className="lg:col-span-5 flex flex-col gap-5 justify-start">
                
                {/* Selector Card */}
                <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                    <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
                      Select Package
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 uppercase">
                      {activeCategory} List
                    </span>
                  </div>

                  {/* NEXGN SaaS Logo Header shown only in SaaS tab */}
                  {activeCategory === 'nexgn' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center py-2.5 px-3 bg-slate-950/80 rounded-xl border border-green-500/15 text-center select-none"
                    >
                      <span className="text-lg font-black tracking-tight text-white">
                        NEX<span className="text-green-500">G</span>N
                      </span>
                      <p className="text-[8px] font-bold text-green-400 uppercase tracking-widest mt-0.5">
                        Solutions Changing to Next Generation
                      </p>
                    </motion.div>
                  )}

                  <div className="space-y-2.5">
                    {filteredPlans.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => handlePlanSelect(plan.id)}
                        className={`w-full flex items-center gap-3.5 p-3.5 text-left rounded-xl border text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                          activePlanId === plan.id
                            ? getCategoryButtonActiveStyles(activeCategory)
                            : 'bg-slate-900/10 border-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 hover:border-slate-850'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                          getCategoryNumberStyles(activeCategory, activePlanId === plan.id)
                        }`}>
                          {plan.id}
                        </span>
                        <span className="line-clamp-2 leading-snug">{plan.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* TRUST & GUARANTEE CALLOUT WIDGET (Fills the blank space dynamically) */}
                <div className="bg-gradient-to-br from-slate-900/40 to-slate-900/10 border border-slate-850 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="pb-3 border-b border-slate-900">
                    <h4 className="text-xs font-black tracking-widest text-indigo-400 uppercase">
                      AIM Subscription Guarantees
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {/* Ownership */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200">100% Code & IP Ownership</h5>
                        <p className="text-[11px] text-slate-400 leading-normal mt-0.5">Your source code, layout designs, and user databases belong completely to you upon contract terms completion.</p>
                      </div>
                    </div>

                    {/* Lock-ins */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200">Zero Locked Contracts</h5>
                        <p className="text-[11px] text-slate-400 leading-normal mt-0.5">Scale packages up or down, pause ongoing development modules, or cancel subscriptions on a simple monthly cycle.</p>
                      </div>
                    </div>

                    {/* Support */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200">24/7 Priority Consultant Support</h5>
                        <p className="text-[11px] text-slate-400 leading-normal mt-0.5">Get direct assistance via phone or whatsapp. Speak to our relationship advisors about customized software requirements.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[11px] text-slate-400 font-semibold">
                    <span>Need Custom Portals?</span>
                    <a 
                      href="https://wa.me/916290902922" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.727-1.465L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.967C16.589 1.972 14.118.948 11.49.947 6.054.947 1.632 5.318 1.63 10.749c-.002 1.683.456 3.32 1.32 4.756L1.93 20.916l5.717-1.499c.001 0 .001 0 0 0z" />
                      </svg>
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: DETAIL VIEWER PANEL (7 columns) */}
              <div className="lg:col-span-7">
                <Card padding="none" className="glass-card overflow-hidden border-slate-800/80 shadow-2xl h-full flex flex-col justify-between">
                  
                  {/* Content area */}
                  <div className="p-6 sm:p-8 space-y-6 flex-grow">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-900">
                      <div>
                        <span className="inline-block text-[9px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20 mb-1.5">
                          {activePlan.categoryLabel} Package
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                          {activePlan.name}
                        </h2>
                      </div>
                    </div>

                    {/* Pricing grid */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-900">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Security Deposit</span>
                        <span className="text-lg sm:text-xl font-black text-slate-200 tracking-tight">{activePlan.securityDeposit}</span>
                      </div>
                      <div className="border-l border-slate-850 pl-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Monthly Subscription</span>
                        <span className="text-lg sm:text-xl font-black text-indigo-400 tracking-tight">{activePlan.monthlySubscription}</span>
                      </div>
                    </div>

                    {/* Detail blocks */}
                    <div className="space-y-5 text-sm leading-relaxed">
                      
                      {/* Description */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Plan Description
                        </h4>
                        <p className="text-slate-300 font-medium text-justify">{activePlan.description}</p>
                      </div>

                      {/* Customization Details */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Customization Details
                        </h4>
                        <p className="text-slate-300 font-medium text-justify">{activePlan.customization}</p>
                      </div>

                      {/* Complimentary Benefits */}
                      <div className="space-y-1 p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/10">
                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                          Complimentary Software
                        </h4>
                        <p className="text-slate-300 font-medium text-justify mt-1">{activePlan.complimentary}</p>
                      </div>

                    </div>
                  </div>

                  {/* Bottom details block sticky footer */}
                  <div className="p-6 sm:p-8 bg-slate-950/40 border-t border-slate-900 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Support Desk: {activePlan.support}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
                      <Button
                        variant="primary"
                        onClick={handleActivateClick}
                        className="w-full sm:w-auto font-black px-8 py-3 rounded-xl shadow-lg cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
                      >
                        Activate Your Plan
                      </Button>
                      
                      <div className="flex gap-6 items-center">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            alert(`Initiating agreement guidelines download for Plan ${activePlan.id}: ${activePlan.name}`)
                          }}
                          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Agreement
                        </a>

                        <a href="/login" className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition">
                          Login
                        </a>
                      </div>
                    </div>
                  </div>

                </Card>
              </div>

            </div>
          </div>

          {/* GET IN TOUCH WITH US LEAD CAPTURE FORM */}
          <div ref={formSectionRef} className="pt-16 border-t border-slate-900/80 scroll-mt-24">
            <div className="max-w-3xl mx-auto">
              <Card padding="lg" className="glass-card border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="space-y-6 relative z-10">
                  <div className="text-center space-y-2">
                    <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/25">
                      GET IN TOUCH
                    </span>
                    <h3 className="text-2xl font-black text-white tracking-tight mt-2">
                      Get In Touch <span className="text-gradient">With Us</span>
                    </h3>
                    <p className="text-sm text-slate-400 max-w-lg mx-auto">
                      Fill out this subscription request, and our technical onboarding specialists will be in contact with your team within 24 hours.
                    </p>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Full Name <span className="text-indigo-400 font-black">*</span>
                        </label>
                        <input
                          ref={nameInputRef}
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          placeholder="Your Name"
                          required
                          className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder:text-slate-600 text-sm transition rounded-xl"
                        />
                      </div>

                      {/* Email input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Email Address <span className="text-indigo-400 font-black">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          placeholder="name@company.com"
                          required
                          className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder:text-slate-600 text-sm transition rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Phone input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Phone Number <span className="text-indigo-400 font-black">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleFormChange}
                          placeholder="+91 XXXXX XXXXX"
                          required
                          className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder:text-slate-600 text-sm transition rounded-xl"
                        />
                      </div>

                      {/* Company Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Company / Business Name
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleFormChange}
                          placeholder="Your Organization"
                          className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder:text-slate-600 text-sm transition rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Selected Plan Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Selected Plan
                      </label>
                      <div className="relative">
                        <select
                          name="planId"
                          value={formData.planId}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 text-sm transition appearance-none cursor-pointer rounded-xl"
                        >
                          {subscriptionPlans.map((plan) => (
                            <option key={plan.id} value={plan.id.toString()} className="bg-slate-950 text-slate-100">
                              {plan.id}. {plan.name} ({plan.monthlySubscription}/mo)
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Message Textarea */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Additional Requirements
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleFormChange}
                        rows="4"
                        placeholder="Detail any custom features, domain configurations, preferred timelines, or integration needs..."
                        className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder:text-slate-600 text-sm transition resize-none rounded-xl"
                      />
                    </div>

                    {/* Feedback states */}
                    <AnimatePresence mode="wait">
                      {formStatus.message && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className={`p-4 rounded-xl border text-sm ${
                            formStatus.type === 'success'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {formStatus.type === 'success' ? (
                              <svg className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            )}
                            <p>{formStatus.message}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        variant="primary"
                        className="w-full font-black py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm uppercase tracking-wider"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Registering Details...</span>
                          </>
                        ) : (
                          <span>Submit Subscription Inquiry</span>
                        )}
                      </Button>
                    </div>

                  </form>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default MonthlySubscription
