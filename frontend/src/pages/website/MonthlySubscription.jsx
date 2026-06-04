import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { purchaseApi } from '../../api'

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
    securityDeposit: '₹1000/-',
    monthlySubscription: '₹10/-/student/month',
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

// ─── Razorpay helper ──────────────────────────────────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(true); return }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
    document.body.appendChild(s)
  })

const emptyCheckout = (partnerId = '') => ({
  client_name: '',
  contact_number: '',
  email: '',
  company_name: '',
  gstin: '',
  school_name: '',
  school_short_name: '',
  school_session: '',
  total_students: '',
  partner_id: partnerId,
  district: '',
  state: '',
  pin_code: '',
  address: '',
})

const MonthlySubscription = () => {
  const [activeCategory, setActiveCategory] = useState('static')
  const [activePlanId, setActivePlanId] = useState(1)

  // ── Checkout / payment state ─────────────────────────────────────────
  const [partners, setPartners] = useState([])
  const [paymentStep, setPaymentStep] = useState('idle') // idle | form | processing | success
  const [checkoutData, setCheckoutData] = useState(emptyCheckout())
  const [apiError, setApiError] = useState('')
  const [successData, setSuccessData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formSectionRef = useRef(null)
  const nameInputRef = useRef(null)

  const activePlan = subscriptionPlans.find(plan => plan.id === activePlanId) || subscriptionPlans[0]
  const filteredPlans = subscriptionPlans.filter(plan => plan.category === activeCategory)
  const isInstitutePro = activePlan.id === 15

  // Fetch RM partners on mount
  useEffect(() => {
    purchaseApi.fetchPartners()
      .then(result => {
        if (result.success && result.data?.length) {
          setPartners(result.data)
          setCheckoutData(prev => ({ ...prev, partner_id: result.data[0].id }))
        }
      })
      .catch(err => console.error('Could not load partners:', err))
  }, [])

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId)
    const firstPlan = subscriptionPlans.find(plan => plan.category === catId)
    if (firstPlan) setActivePlanId(firstPlan.id)
  }

  const handlePlanSelect = (id) => {
    setActivePlanId(id)
    // Reset the form when a different plan is chosen so fields stay relevant
    setPaymentStep('idle')
    setApiError('')
    setSuccessData(null)
  }

  const handleActivateClick = () => {
    setPaymentStep('form')
    setApiError('')
    setSuccessData(null)
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    setTimeout(() => {
      if (nameInputRef.current) nameInputRef.current.focus()
    }, 600)
  }

  const handleCheckoutChange = (e) => {
    const { name, value } = e.target
    setCheckoutData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setApiError('')
    setPaymentStep('processing')

    // Build API payload
    const processingFeeNum = parseInt(activePlan.securityDeposit.replace(/[^\d]/g, ''), 10) || 0
    const monthlySubscriptionNum = parseInt(activePlan.monthlySubscription.replace(/[^\d]/g, ''), 10) || 0
    const payload = {
      client_name: checkoutData.client_name,
      contact_number: checkoutData.contact_number,
      email: checkoutData.email,
      partner_id: parseInt(checkoutData.partner_id, 10),
      district: checkoutData.district,
      state: checkoutData.state,
      pin_code: checkoutData.pin_code,
      address: checkoutData.address,
      product_id: activePlan.id,
      product_name: activePlan.name,
      product_category: activePlan.category,
      processing_fee: processingFeeNum,
      monthly_subscription: monthlySubscriptionNum,
    }

    if (isInstitutePro) {
      payload.school_name = checkoutData.school_name
      payload.school_short_name = checkoutData.school_short_name
      payload.school_session = checkoutData.school_session
      payload.total_students = parseInt(checkoutData.total_students, 10)
      if (checkoutData.gstin) payload.gstin = checkoutData.gstin
    } else {
      payload.company_name = checkoutData.company_name
      if (checkoutData.gstin) payload.gstin = checkoutData.gstin
    }

    try {
      const orderResult = await purchaseApi.createOrder(payload)

      if (!orderResult.success) {
        setApiError(orderResult.message || 'Failed to create order. Please try again.')
        setPaymentStep('form')
        setIsSubmitting(false)
        return
      }

      await loadRazorpayScript()

      const options = {
        key: orderResult.key,
        amount: Math.round(orderResult.amount * 100),
        currency: orderResult.currency,
        name: 'AIM Digitalise',
        description: `${activePlan.name} — Processing Fee`,
        order_id: orderResult.order_id,
        handler: async (response) => {
          try {
            const verifyResult = await purchaseApi.verifyPayment({
              order_id: orderResult.order_data.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            })
            if (verifyResult.success) {
              setSuccessData(verifyResult)
              setPaymentStep('success')
              setCheckoutData(emptyCheckout(partners[0]?.id || ''))
            } else {
              setApiError(verifyResult.message || 'Payment verification failed.')
              setPaymentStep('form')
            }
          } catch (err) {
            setApiError('Payment verification failed: ' + err.message)
            setPaymentStep('form')
          }
          setIsSubmitting(false)
        },
        modal: {
          ondismiss: () => {
            setApiError('Payment was cancelled.')
            setPaymentStep('form')
            setIsSubmitting(false)
          },
        },
        prefill: {
          name: checkoutData.client_name,
          email: checkoutData.email,
          contact: checkoutData.contact_number,
        },
        theme: { color: '#2563eb' },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (resp) => {
        setApiError('Payment failed: ' + (resp.error?.description || 'Unknown error'))
        setPaymentStep('form')
        setIsSubmitting(false)
      })
      rzp.open()
    } catch (err) {
      console.error('Order creation error response:', err.response?.data)
      const serverMsg = err.response?.data?.errors || err.response?.data?.message
      const errorDetail = typeof serverMsg === 'object'
        ? Object.values(serverMsg).flat().join(' ')
        : (serverMsg || err.message || 'Something went wrong')
      setApiError('Failed to initiate payment: ' + errorDetail)
      setPaymentStep('form')
      setIsSubmitting(false)
    }
  }

  // Active styles helpers for category tabs
  const getCategoryTabStyles = (catId) => {
    if (activeCategory !== catId) {
      return 'bg-white dark:bg-aim-navy border-slate-200 dark:border-white/10 text-slate-600 dark:text-aim-copy-muted hover:text-blue-600 dark:hover:text-aim-gold hover:border-blue-500 dark:hover:border-aim-gold/40 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200'
    }
    switch (catId) {
      case 'static': return 'border-sky-300 bg-sky-50/70 dark:bg-sky-950/40 dark:border-sky-800/80 text-sky-800 dark:text-sky-400 shadow-md shadow-sky-100 dark:shadow-none font-black ring-2 ring-sky-300/20 scale-[1.02]'
      case 'dynamic': return 'border-teal-300 bg-teal-50/70 dark:bg-teal-950/40 dark:border-teal-800/80 text-teal-800 dark:text-teal-400 shadow-md shadow-teal-100 dark:shadow-none font-black ring-2 ring-teal-300/20 scale-[1.02]'
      case 'ecommerce': return 'border-orange-300 bg-orange-50/70 dark:bg-orange-950/40 dark:border-orange-800/80 text-orange-800 dark:text-orange-400 shadow-md shadow-orange-100 dark:shadow-none font-black ring-2 ring-orange-300/20 scale-[1.02]'
      case 'mobile': return 'border-blue-300 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-800/80 text-blue-800 dark:text-blue-400 shadow-md shadow-blue-100 dark:shadow-none font-black ring-2 ring-blue-300/20 scale-[1.02]'
      case 'nexgn': return 'border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-400 shadow-md shadow-emerald-100 dark:shadow-none font-black ring-2 ring-emerald-300/20 scale-[1.02]'
      default: return 'border-blue-300 bg-blue-50 text-blue-600'
    }
  }

  const getCategoryButtonActiveStyles = (catId) => {
    switch (catId) {
      case 'static': return 'bg-sky-50/70 dark:bg-sky-950/25 border-sky-300 dark:border-sky-800/50 text-sky-850 dark:text-sky-400 shadow-lg shadow-sky-100 dark:shadow-none scale-[1.01] ring-2 ring-sky-300/30'
      case 'dynamic': return 'bg-teal-50/70 dark:bg-teal-950/25 border-teal-300 dark:border-teal-800/50 text-teal-855 dark:text-teal-400 shadow-lg shadow-teal-100 dark:shadow-none scale-[1.01] ring-2 ring-teal-300/30'
      case 'ecommerce': return 'bg-orange-50/70 dark:bg-orange-950/25 border-orange-300 dark:border-orange-800/50 text-orange-855 dark:text-orange-400 shadow-lg shadow-orange-100 dark:shadow-none scale-[1.01] ring-2 ring-orange-300/30'
      case 'mobile': return 'bg-blue-50/70 dark:bg-blue-950/25 border-blue-300 dark:border-blue-800/50 text-blue-855 dark:text-blue-400 shadow-lg shadow-blue-100 dark:shadow-none scale-[1.01] ring-2 ring-blue-300/30'
      case 'nexgn': return 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-300 dark:border-emerald-800/50 text-emerald-855 dark:text-emerald-400 shadow-lg shadow-emerald-100 dark:shadow-none scale-[1.01] ring-2 ring-emerald-300/30'
      default: return 'bg-blue-50 border-blue-200 text-blue-700'
    }
  }

  const getCategoryNumberStyles = (catId, isActive) => {
    if (!isActive) return 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-aim-copy-muted'
    switch (catId) {
      case 'static': return 'bg-sky-500 text-white font-bold'
      case 'dynamic': return 'bg-teal-500 text-white font-bold'
      case 'ecommerce': return 'bg-orange-500 text-white font-bold'
      case 'mobile': return 'bg-blue-600 text-white font-bold'
      case 'nexgn': return 'bg-emerald-500 text-white font-bold'
      default: return 'bg-blue-600 text-white'
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

      <div className="relative min-h-screen bg-white dark:bg-[#0B1B3A] text-slate-800 dark:text-aim-copy py-12 px-4 sm:px-6 lg:px-8 bg-grid-pattern transition-colors duration-300">
        
        {/* Ambient Halos */}
        <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          
          {/* Header & Slogan Block */}
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <nav className="flex justify-center items-center gap-2 text-xs font-semibold text-slate-500 tracking-wider uppercase">
                <a href="/" className="hover:text-blue-600 transition">Home</a>
                <span className="text-slate-700">/</span>
                <span className="text-slate-400">Monthly Subscriptions</span>
              </nav>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
                Website & Software <span className="text-gradient">On Monthly Subscriptions</span>
              </h1>
            </div>

            {/* Slogan Banner */}
            <div className="w-full bg-white dark:bg-aim-navy-card border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-sm max-w-4xl mx-auto transition-colors duration-300">
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 dark:text-white tracking-wide uppercase">
                INDIA'S 1st MONTHLY SUBSCRIPTION BASED WEBSITE WITH{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-red-500 to-blue-600 font-extrabold">
                  100% DATA SECURITY & OWNERSHIP
                </span>
              </h2>
            </div>
          </div>

          {/* MAIN GRID BLOCK */}
          <div className="space-y-6">
            
            {/* 1. Horizontal Category Nav Tabs */}
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto p-1.5 rounded-2xl bg-white dark:bg-aim-navy-card border border-slate-200 dark:border-white/10 shadow-sm transition-colors duration-300">
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
                <div className="bg-white dark:bg-aim-navy-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm transition-colors duration-300">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
                    <h3 className="text-xs font-black tracking-widest text-slate-500 dark:text-aim-copy-muted uppercase">
                      Select Package
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 text-blue-600 dark:text-aim-gold uppercase">
                      {activeCategory} List
                    </span>
                  </div>

                  {/* NEXGN SaaS Logo Header shown only in SaaS tab */}
                  {activeCategory === 'nexgn' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center py-2.5 px-3 bg-slate-50 dark:bg-aim-navy rounded-xl border border-blue-200/50 dark:border-white/5 text-center select-none"
                    >
                      <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
                        NEX<span className="text-blue-600 dark:text-aim-gold">G</span>N
                      </span>
                      <p className="text-[8px] font-bold text-blue-600 dark:text-aim-gold uppercase tracking-widest mt-0.5">
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
                            : 'bg-white dark:bg-aim-navy border border-slate-200 dark:border-white/10 text-slate-600 dark:text-aim-copy-muted hover:text-blue-600 dark:hover:text-aim-gold hover:bg-slate-50 dark:hover:bg-white/5'
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
                <div className="bg-slate-50 dark:bg-aim-navy-card border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm transition-colors duration-300">
                  <div className="pb-3 border-b border-slate-100 dark:border-white/5">
                    <h4 className="text-xs font-black tracking-widest text-blue-600 dark:text-aim-gold uppercase">
                      AIM Subscription Guarantees
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {/* Ownership */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-blue-600 dark:text-aim-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-white">100% Code & IP Ownership</h5>
                        <p className="text-[11px] text-slate-600 dark:text-aim-copy-muted leading-normal mt-0.5">Your source code, layout designs, and user databases belong completely to you upon contract terms completion.</p>
                      </div>
                    </div>

                    {/* Lock-ins */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-white/5 border border-emerald-200 dark:border-white/10 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-white">Zero Locked Contracts</h5>
                        <p className="text-[11px] text-slate-600 dark:text-aim-copy-muted leading-normal mt-0.5">Scale packages up or down, pause ongoing development modules, or cancel subscriptions on a simple monthly cycle.</p>
                      </div>
                    </div>

                    {/* Support */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-blue-600 dark:text-aim-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-white">24/7 Priority Consultant Support</h5>
                        <p className="text-[11px] text-slate-600 dark:text-aim-copy-muted leading-normal mt-0.5">Get direct assistance via phone or whatsapp. Speak to our relationship advisors about customized software requirements.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-[11px] text-slate-500 dark:text-aim-copy-muted font-semibold">
                    <span>Need Custom Portals?</span>
                    <a 
                      href="https://wa.me/916290902922" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition flex items-center gap-1"
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
                <div className="bg-white dark:bg-aim-navy-card border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col justify-between transition-colors duration-300">
                  
                  {/* Content area */}
                  <div className="p-6 sm:p-8 space-y-6 flex-grow">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-150 dark:border-white/5">
                      <div>
                        <span className="inline-block text-[9px] uppercase font-black text-blue-600 dark:text-aim-gold bg-blue-50 dark:bg-white/5 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-white/10 mb-1.5">
                          {activePlan.categoryLabel} Package
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                          {activePlan.name}
                        </h2>
                      </div>
                    </div>

                    {/* Pricing grid */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-aim-navy border border-slate-200 dark:border-white/10">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">Security Deposit</span>
                        <span className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight">{activePlan.securityDeposit}</span>
                      </div>
                      <div className="border-l border-slate-200 dark:border-white/10 pl-4">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">Monthly Subscription</span>
                        <span className="text-lg sm:text-xl font-black text-blue-600 dark:text-aim-gold tracking-tight">{activePlan.monthlySubscription}</span>
                      </div>
                    </div>

                    {/* Detail blocks */}
                    <div className="space-y-5 text-sm leading-relaxed">
                      
                      {/* Description */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-blue-600 dark:text-aim-gold uppercase tracking-widest flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-blue-600 dark:text-aim-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Plan Description
                        </h4>
                        <p className="text-slate-600 dark:text-aim-copy-muted font-medium text-justify">{activePlan.description}</p>
                      </div>

                      {/* Customization Details */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-blue-600 dark:text-aim-gold uppercase tracking-widest flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-blue-600 dark:text-aim-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Customization Details
                        </h4>
                        <p className="text-slate-600 dark:text-aim-copy-muted font-medium text-justify">{activePlan.customization}</p>
                      </div>

                      {/* Complimentary Benefits */}
                      <div className="space-y-1 p-3.5 rounded-xl bg-blue-50/50 dark:bg-white/5 border border-blue-200/60 dark:border-white/10">
                        <h4 className="text-xs font-black text-blue-600 dark:text-aim-gold uppercase tracking-widest flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-blue-600 dark:text-aim-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                          Complimentary Software
                        </h4>
                        <p className="text-slate-600 dark:text-aim-copy-muted font-medium text-justify mt-1">{activePlan.complimentary}</p>
                      </div>

                    </div>
                  </div>

                  {/* Bottom details block sticky footer */}
                  <div className="p-6 sm:p-8 bg-slate-50 dark:bg-aim-navy border-t border-slate-200 dark:border-white/10 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-aim-copy-muted">
                      <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="text-xs font-bold text-slate-600 dark:text-aim-copy-muted hover:text-blue-600 dark:hover:text-aim-gold flex items-center gap-1.5 transition"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Agreement
                        </a>

                        <a href="/login" className="text-xs font-semibold text-slate-500 dark:text-aim-copy-muted hover:text-blue-600 dark:hover:text-aim-gold transition">
                          Login
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* ── CHECKOUT / PAYMENT SECTION ──────────────────────────────── */}
          <div ref={formSectionRef} className="pt-16 border-t border-slate-200 dark:border-white/10 scroll-mt-24">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-aim-navy-card border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-colors duration-300">
                <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="space-y-6 relative z-10">

                  {/* ── IDLE: prompt to click Activate ── */}
                  {paymentStep === 'idle' && (
                    <div className="text-center space-y-4 py-6">
                      <span className="text-[10px] font-black tracking-widest text-blue-600 dark:text-aim-gold uppercase bg-blue-50 dark:bg-white/5 px-3 py-1 rounded-full border border-blue-200 dark:border-white/10">
                        PURCHASE &amp; ACTIVATE
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
                        Ready to <span className="text-gradient">Get Started?</span>
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-aim-copy-muted max-w-lg mx-auto">
                        Select a plan above then click <strong>Activate Your Plan</strong> to complete your registration and make the one-time processing fee payment securely via Razorpay.
                      </p>
                      <div className="pt-2">
                        <Button
                          variant="primary"
                          onClick={handleActivateClick}
                          className="font-black px-10 py-3 rounded-xl shadow-lg cursor-pointer text-sm uppercase tracking-wider"
                        >
                          Activate — {activePlan.name}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* ── PROCESSING SPINNER ── */}
                  {paymentStep === 'processing' && (
                    <div className="flex flex-col items-center justify-center py-16 gap-5">
                      <div className="w-14 h-14 rounded-full border-4 border-blue-100 dark:border-white/5 border-t-blue-600 dark:border-t-aim-gold animate-spin"></div>
                      <p className="text-sm font-semibold text-slate-600 dark:text-aim-copy-muted">Processing your request…</p>
                    </div>
                  )}

                  {/* ── SUCCESS SCREEN ── */}
                  {paymentStep === 'success' && successData && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-6 py-8 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center">
                        <svg className="w-9 h-9 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Payment Successful! 🎉</h3>
                        <p className="text-sm text-slate-600 dark:text-aim-copy-muted mt-1">Your subscription has been activated. Check your email for details.</p>
                      </div>
                      <div className="w-full grid sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-aim-navy border border-blue-200 dark:border-white/10 text-left">
                          <span className="text-[10px] font-black text-blue-500 dark:text-aim-gold uppercase tracking-widest block mb-1">Your Client ID</span>
                          <span className="text-xl font-black text-blue-700 dark:text-white tracking-widest">{successData.client_id}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aim-navy border border-slate-200 dark:border-white/10 text-left">
                          <span className="text-[10px] font-black text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block mb-1">Default Password</span>
                          <span className="text-xl font-black text-slate-700 dark:text-white tracking-mono">{successData.default_password}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-aim-copy-muted max-w-sm">
                        Please save these credentials. Your dedicated Relationship Manager will contact you shortly.
                      </p>
                      <button
                        onClick={() => { setPaymentStep('idle'); setSuccessData(null) }}
                        className="text-xs font-bold text-blue-600 dark:text-aim-gold hover:text-blue-800 dark:hover:text-aim-highlight underline underline-offset-2 transition cursor-pointer"
                      >
                        Purchase another plan →
                      </button>
                    </motion.div>
                  )}

                  {/* ── CHECKOUT FORM ── */}
                  {paymentStep === 'form' && (
                    <>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                        <div>
                          <span className="text-[10px] font-black tracking-widest text-blue-600 dark:text-aim-gold uppercase bg-blue-50 dark:bg-white/5 px-3 py-1 rounded-full border border-blue-200 dark:border-white/10">
                            COMPLETE REGISTRATION
                          </span>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
                            {activePlan.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-aim-copy-muted mt-0.5">
                            Processing Fee: <span className="font-black text-blue-600 dark:text-aim-gold">{activePlan.securityDeposit}</span>
                            &nbsp;·&nbsp;Then {activePlan.monthlySubscription.startsWith('₹') ? '' : '₹'}{activePlan.monthlySubscription}{activePlan.monthlySubscription.includes('month') ? '' : '/mo'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setPaymentStep('idle'); setApiError('') }}
                          className="text-xs font-bold text-slate-500 dark:text-aim-copy-muted hover:text-red-500 dark:hover:text-red-400 transition cursor-pointer border border-slate-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/40 px-3 py-1.5 rounded-lg"
                        >
                          ✕ Change Plan
                        </button>
                      </div>

                      {/* Error banner */}
                      <AnimatePresence>
                        {apiError && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-400 flex items-start gap-2"
                          >
                            <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {apiError}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <form onSubmit={handleCheckoutSubmit} className="space-y-5">

                        {/* ── Section: Billing Details ── */}
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 dark:text-aim-copy-muted uppercase tracking-widest mb-3">Billing Details</h4>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">
                                Client Name <span className="text-blue-600 dark:text-aim-gold">*</span>
                              </label>
                              <input
                                ref={nameInputRef}
                                type="text"
                                name="client_name"
                                value={checkoutData.client_name}
                                onChange={handleCheckoutChange}
                                placeholder="Full name"
                                required
                                className="input-brand text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">
                                Contact Number <span className="text-blue-600 dark:text-aim-gold">*</span>
                              </label>
                              <input
                                type="tel"
                                name="contact_number"
                                value={checkoutData.contact_number}
                                onChange={handleCheckoutChange}
                                placeholder="+91 XXXXX XXXXX"
                                required
                                className="input-brand text-sm"
                              />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">
                                Email Address <span className="text-blue-600 dark:text-aim-gold">*</span>
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={checkoutData.email}
                                onChange={handleCheckoutChange}
                                placeholder="name@company.com"
                                required
                                className="input-brand text-sm"
                              />
                            </div>

                            {/* Conditional fields for Institute Pro (id=15) vs others */}
                            {!isInstitutePro ? (
                              <>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">
                                    Company Name
                                  </label>
                                  <input
                                    type="text"
                                    name="company_name"
                                    value={checkoutData.company_name}
                                    onChange={handleCheckoutChange}
                                    placeholder="Your organization"
                                    className="input-brand text-sm"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">
                                    GSTIN <span className="text-slate-400 normal-case font-normal">(optional)</span>
                                  </label>
                                  <input
                                    type="text"
                                    name="gstin"
                                    value={checkoutData.gstin}
                                    onChange={handleCheckoutChange}
                                    placeholder="22AAAAA0000A1Z5"
                                    className="input-brand text-sm"
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">
                                    School Name <span className="text-blue-600 dark:text-aim-gold">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    name="school_name"
                                    value={checkoutData.school_name}
                                    onChange={handleCheckoutChange}
                                    required
                                    placeholder="Full school name"
                                    className="input-brand text-sm"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">
                                    Short Name <span className="text-blue-600 dark:text-aim-gold">*</span> <span className="text-slate-400 normal-case font-normal">(max 8 chars)</span>
                                  </label>
                                  <input
                                    type="text"
                                    name="school_short_name"
                                    maxLength="8"
                                    value={checkoutData.school_short_name}
                                    onChange={handleCheckoutChange}
                                    required
                                    placeholder="e.g. STMARY"
                                    className="input-brand text-sm"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">
                                    Current Session <span className="text-blue-600 dark:text-aim-gold">*</span> <span className="text-slate-400 normal-case font-normal">(max 10 chars)</span>
                                  </label>
                                  <input
                                    type="text"
                                    name="school_session"
                                    maxLength="10"
                                    value={checkoutData.school_session}
                                    onChange={handleCheckoutChange}
                                    required
                                    placeholder="2025-26"
                                    className="input-brand text-sm"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">
                                    Total Students <span className="text-blue-600 dark:text-aim-gold">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    name="total_students"
                                    min="1"
                                    value={checkoutData.total_students}
                                    onChange={handleCheckoutChange}
                                    required
                                    placeholder="e.g. 450"
                                    className="input-brand text-sm"
                                  />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                  <label className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">
                                    GSTIN <span className="text-slate-400 normal-case font-normal">(optional)</span>
                                  </label>
                                  <input
                                    type="text"
                                    name="gstin"
                                    value={checkoutData.gstin}
                                    onChange={handleCheckoutChange}
                                    placeholder="22AAAAA0000A1Z5"
                                    className="input-brand text-sm"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* ── Section: Relationship Manager ── */}
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 dark:text-aim-copy-muted uppercase tracking-widest mb-3">Select Relationship Manager</h4>
                          <div className="relative">
                            <select
                              name="partner_id"
                              value={checkoutData.partner_id}
                              onChange={handleCheckoutChange}
                              required
                              className="input-brand text-sm appearance-none cursor-pointer"
                            >
                              <option value="">Select your RM / Partner</option>
                              {partners.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.partner_name} — {p.organization_name}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                          </div>
                        </div>

                        {/* ── Section: Address ── */}
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 dark:text-aim-copy-muted uppercase tracking-widest mb-3">Address Details</h4>
                          <div className="grid sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">
                                District <span className="text-blue-600 dark:text-aim-gold">*</span>
                              </label>
                              <input
                                type="text"
                                name="district"
                                value={checkoutData.district}
                                onChange={handleCheckoutChange}
                                required
                                placeholder="e.g. Kolkata"
                                className="input-brand text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">
                                State <span className="text-blue-600 dark:text-aim-gold">*</span>
                              </label>
                              <input
                                type="text"
                                name="state"
                                value={checkoutData.state}
                                onChange={handleCheckoutChange}
                                required
                                placeholder="e.g. West Bengal"
                                className="input-brand text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">
                                PIN Code <span className="text-blue-600 dark:text-aim-gold">*</span>
                              </label>
                              <input
                                type="text"
                                name="pin_code"
                                value={checkoutData.pin_code}
                                onChange={handleCheckoutChange}
                                required
                                placeholder="700001"
                                className="input-brand text-sm"
                              />
                            </div>
                            <div className="space-y-1.5 sm:col-span-3">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-aim-copy-muted uppercase tracking-widest block">
                                Full Address <span className="text-blue-600 dark:text-aim-gold">*</span>
                              </label>
                              <textarea
                                name="address"
                                value={checkoutData.address}
                                onChange={handleCheckoutChange}
                                required
                                rows="3"
                                placeholder="Street, building, locality…"
                                className="input-brand text-sm transition resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* ── Pay Button ── */}
                        <div className="pt-2">
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            variant="primary"
                            className="w-full font-black py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm uppercase tracking-wider"
                          >
                            {isSubmitting ? (
                              <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Opening Payment Gateway…</span>
                              </>
                            ) : (
                              <span>Pay {activePlan.securityDeposit} Processing Fee via Razorpay</span>
                            )}
                          </Button>
                          <p className="text-center text-[11px] text-slate-400 mt-2">
                            Secured by Razorpay · Your data is encrypted
                          </p>
                        </div>

                      </form>
                    </>
                  )}

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default MonthlySubscription
