import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { purchaseApi } from '../../api'
import { ROUTES } from '../../constants/routes'
import nexgnLogo from '../../assets/images/nexgnlogo.png'

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
  { id: 'nexgn', label: 'SaaS Based CLOUD', color: 'green' },
  { id: 'static', label: 'STATIC', color: 'sky' },
  { id: 'dynamic', label: 'DYNAMIC', color: 'teal' },
  { id: 'ecommerce', label: 'E-COMMERCE', color: 'orange' },
  { id: 'mobile', label: 'MOBILE APP', color: 'indigo' }
]

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

const SaasBasedSoftware = () => {
  const queryParams = new URLSearchParams(window.location.search)
  const initialPlanId = parseInt(queryParams.get('plan'), 10) || 9
  const initialPlan = subscriptionPlans.find(p => p.id === initialPlanId) || subscriptionPlans.find(p => p.id === 9)

  const [products, setProducts] = useState(subscriptionPlans)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [activeCategory, setActiveCategory] = useState(initialPlan.category)
  const [activePlanId, setActivePlanId] = useState(initialPlan.id)

  const [partners, setPartners] = useState([])
  const [paymentStep, setPaymentStep] = useState('idle')
  const [checkoutData, setCheckoutData] = useState(emptyCheckout())
  const [apiError, setApiError] = useState('')
  const [successData, setSuccessData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customProcessingFee, setCustomProcessingFee] = useState(0)
  const [customMonthlySubscription, setCustomMonthlySubscription] = useState(0)

  const nameInputRef = useRef(null)

  const activePlan = products.find(plan => plan.id === activePlanId) || products[0]
  const filteredPlans = products.filter(plan => plan.category === activeCategory)
  const isInstitutePro = activePlan?.id === 15

  // Fetch Subcategories and Products from backend
  useEffect(() => {
    setLoadingProducts(true)
    purchaseApi.fetchSubcategoriesWithProducts()
      .then(result => {
        if (result.success && result.data?.length) {
          const allProducts = []

          const mapCategory = (categoryName, categoryId) => {
            const name = (categoryName || '').toLowerCase()
            const id = Number(categoryId)
            if (name.includes('saas') || name.includes('nexgn') || id === 1) return 'nexgn'
            if (name.includes('static') || id === 2) return 'static'
            if (name.includes('dynamic') || id === 3) return 'dynamic'
            if (name.includes('e-commerce') || name.includes('ecommerce') || id === 4) return 'ecommerce'
            if (name.includes('mobile') || name.includes('android') || name.includes('ios') || id === 5) return 'mobile'
            return 'nexgn'
          }

          const formatSecurityDeposit = (fee) => `₹${fee}/-`
          const formatMonthlySubscription = (sub, perPerson) => {
            if (perPerson === true || perPerson === 1) return `₹${sub}/-/student/month`
            return `₹${sub}/-`
          }

          result.data.forEach(sub => {
            if (sub.products && Array.isArray(sub.products)) {
              sub.products.forEach(p => {
                allProducts.push({
                  ...p,
                  category: mapCategory(p.category_name || sub.category_name, p.category_id || sub.category_id),
                  categoryLabel: (p.category_name || sub.category_name || '').toUpperCase(),
                  securityDeposit: formatSecurityDeposit(p.processing_fee),
                  monthlySubscription: formatMonthlySubscription(p.monthly_subscription, p.per_person),
                })
              })
            }
          })

          if (allProducts.length) {
            setProducts(allProducts)
            const queryParams = new URLSearchParams(window.location.search)
            const paramId = parseInt(queryParams.get('plan'), 10)
            const matched = allProducts.find(p => p.id === paramId) || allProducts.find(p => p.id === 9) || allProducts[0]
            if (matched) {
              setActivePlanId(matched.id)
              setActiveCategory(matched.category)
            }
          }
        }
      })
      .catch(err => console.error('Failed to load products from API:', err))
      .finally(() => setLoadingProducts(false))
  }, [])

  useEffect(() => {
    if (activePlan) {
      setCustomProcessingFee(activePlan.processing_fee || 0)
      setCustomMonthlySubscription(activePlan.id === 15 ? 0 : (activePlan.monthly_subscription || 0))
    }
  }, [activePlanId, activePlan])

  useEffect(() => {
    if (isInstitutePro && activePlan) {
      setCustomMonthlySubscription((activePlan.monthly_subscription || 10) * (parseInt(checkoutData.total_students, 10) || 0))
    }
  }, [checkoutData.total_students, isInstitutePro, activePlan])

  useEffect(() => {
    purchaseApi.fetchPartners()
      .then(result => {
        if (result.success && result.data?.length) {
          setPartners(result.data)
          setCheckoutData(prev => ({ ...prev, partner_id: result.data[0].partner_id }))
        }
      })
      .catch(err => console.error('Could not load partners:', err))
  }, [])

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId)
    const firstPlan = products.find(plan => plan.category === catId)
    if (firstPlan) setActivePlanId(firstPlan.id)
  }

  const handlePlanSelect = (id) => {
    setActivePlanId(id)
    setPaymentStep('idle')
    setApiError('')
    setSuccessData(null)
  }

  const handleActivateClick = () => {
    setPaymentStep('form')
    setApiError('')
    setSuccessData(null)
    setTimeout(() => {
      if (nameInputRef.current) nameInputRef.current.focus()
    }, 400)
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

    const payload = {
      client_name: checkoutData.client_name,
      contact_number: checkoutData.contact_number,
      email: checkoutData.email,
      partner_id: checkoutData.partner_id,
      district: checkoutData.district,
      state: checkoutData.state,
      pin_code: checkoutData.pin_code,
      address: checkoutData.address,
      product_id: activePlan.id,
      product_name: activePlan.name,
      product_category: activePlan.category,
      processing_fee: customProcessingFee,
      monthly_subscription: customMonthlySubscription,
    }

    if (isInstitutePro) {
      payload.school_name = checkoutData.school_name
      payload.school_short_name = checkoutData.school_short_name
      payload.school_session = checkoutData.school_session
      payload.total_students = parseInt(checkoutData.total_students, 10)
      if (checkoutData.gstin) payload.gstin = checkoutData.gstin
    } else {
      payload.company_name = checkoutData.company_name || null
      if (checkoutData.gstin) payload.gstin = checkoutData.gstin
    }

    if (!checkoutData.partner_id) {
      setApiError('Please select a Relationship Manager / Partner. If the list is empty, no active partners are available yet.')
      setPaymentStep('form')
      setIsSubmitting(false)
      return
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
              order_id: orderResult.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            })
            if (verifyResult.success) {
              setSuccessData(verifyResult)
              setPaymentStep('success')
              setCheckoutData(emptyCheckout(partners[0]?.partner_id || ''))
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
      const errData = err.response?.data
      let errorDetail
      if (errData?.errors && typeof errData.errors === 'object') {
        errorDetail = Object.entries(errData.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ')
      } else {
        errorDetail = errData?.message || err.message || 'Something went wrong'
      }
      setApiError('Server error: ' + errorDetail)
      setPaymentStep('form')
      setIsSubmitting(false)
    }
  }

  const getCategoryTabStyles = (catId) => {
    if (activeCategory !== catId) {
      return 'card-elevated text-aim-copy-muted hover:text-aim-gold hover:border-aim-gold/40 hover:bg-aim-gold/5 transition-all duration-200'
    }
    return 'border-aim-purple/50 bg-aim-purple/10 text-aim-purple dark:text-aim-purple-light shadow-md font-black ring-2 ring-aim-purple/20 scale-[1.02]'
  }

  const getCategoryButtonActiveStyles = (catId) => {
    return 'bg-aim-gold/15 dark:bg-aim-gold/10 border-aim-gold/40 text-aim-gold shadow-lg scale-[1.01] ring-2 ring-aim-gold/20'
  }

  const getCategoryNumberStyles = (catId, isActive) => {
    if (!isActive) return 'bg-aim-navy-muted/15 text-aim-copy-muted'
    return 'bg-aim-gold text-white font-bold'
  }

  return (
    <>
      <Helmet>
        <title>AIM Digitalise | SaaS Based Software Plans</title>
        <meta name="description" content="India's 1st SaaS based website and software with 100% data security & ownership. Clean layouts, quick activation." />
        <meta name="keywords" content="saas website, saas software, dynamic website price, saas software billing, android mobile app development, e-commerce website packages, India" />
        <link rel="canonical" href="https://aimdigitalise.com/saas-software" />
      </Helmet>
      <div className="flex items-center justify-center py-[0]"> 
             <img src={nexgnLogo} alt="NEXGN Logo" className="h-36 w-auto object-contain" />
             
      </div>


      <div className="relative min-h-screen text-aim-copy py-12 px-4 sm:px-6 lg:px-8 bg-grid-pattern transition-colors duration-300">
        
        {/* Ambient Halos */}
        <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-aim-gold/5 dark:bg-aim-gold/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-aim-purple/5 dark:bg-aim-purple/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          
          {/* Header & Slogan Block */}
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <nav className="flex justify-center items-center gap-2 text-xs font-semibold text-aim-copy-muted tracking-wider uppercase">
                <a href="/" className="hover:text-aim-gold transition">Home</a>
                <span className="text-aim-copy-muted">/</span>
                <span className="text-aim-copy-muted/60">SaaS Based Software</span>
              </nav>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-aim-copy uppercase">
                SaaS-Based Website &amp; Software <span className="text-gradient">Solutions</span>
              </h1>
            </div>

            {/* Slogan Banner */}
            
          </div>

          {/* MAIN GRID BLOCK */}
          <div className="space-y-6">
            
            {/* 1. Horizontal Category Nav Tabs */}
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto p-1.5 rounded-2xl card-elevated transition-colors duration-300">
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
                <div className="card-elevated rounded-2xl p-4 sm:p-5 space-y-4 transition-colors duration-300">
                  <div className="flex justify-between items-center pb-3 border-b border-aim-border">
                    <h3 className="text-xs font-black tracking-widest text-aim-copy-muted uppercase">
                      Select Package
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-aim-gold/10 border border-aim-gold/20 text-aim-gold uppercase">
                      {activeCategory} List
                    </span>
                  </div>

                  {/* NEXGN SaaS Logo Header shown only in SaaS tab */}
                  {activeCategory === 'nexgn' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center py-2.5 px-3 bg-aim-navy-muted/10 rounded-xl border border-aim-border text-center select-none"
                    >
                      <img src={nexgnLogo} alt="NEXGN Logo" className="h-16 w-auto object-contain" />
                      <p className="text-[8px] font-bold text-aim-gold uppercase tracking-widest mt-0.5">
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
                            : 'card-elevated text-aim-copy-muted hover:text-aim-gold hover:bg-aim-gold/5'
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

                {/* TRUST & GUARANTEE CALLOUT WIDGET */}
                <div className="card-elevated rounded-2xl p-5 space-y-4 transition-colors duration-300">
                  <div className="pb-3 border-b border-aim-border">
                    <h4 className="text-xs font-black tracking-widest text-aim-gold uppercase">
                      AIM SaaS Guarantees
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {/* Ownership */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-aim-gold/10 border border-aim-gold/20 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-aim-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-aim-copy">100% Code &amp; IP Ownership</h5>
                        <p className="text-[11px] text-aim-copy-muted leading-normal mt-0.5">Product source code, layout designs, and user databases belong completely to AIM Digitalise pvt. ltd.</p>
                      </div>
                    </div>

                    {/* Lock-ins */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-aim-purple/10 border border-aim-purple/20 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-aim-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-aim-copy">Zero Locked Contracts</h5>
                        <p className="text-[11px] text-aim-copy-muted leading-normal mt-0.5">Scale packages up or down, pause ongoing development modules, or cancel subscriptions on a simple monthly/quartarlt/half-yearly/yearly cycle.</p>
                      </div>
                    </div>

                    {/* Support */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-aim-gold/10 border border-aim-gold/20 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-aim-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-aim-copy">24/7 Priority Consultant Support</h5>
                        <p className="text-[11px] text-aim-copy-muted leading-normal mt-0.5">Get direct assistance via phone or WhatsApp. Speak to our relationship advisors about customized software requirements.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-aim-border flex justify-between items-center text-[11px] text-aim-copy-muted font-semibold">
                    <span>Need Custom Portals?</span>
                    <a 
                      href="https://wa.me/916290902922" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition flex items-center gap-1 font-bold"
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
                <div className="card-elevated rounded-3xl overflow-hidden h-full flex flex-col justify-between transition-colors duration-300">
                  
                  {/* Content area */}
                  <div className="p-6 sm:p-8 space-y-6 flex-grow">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-aim-border">
                      <div>
                        <span className="inline-block text-[9px] uppercase font-black text-aim-gold bg-aim-gold/10 px-2.5 py-0.5 rounded-md border border-aim-gold/20 mb-1.5">
                          {activePlan.categoryLabel} SaaS Package
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-aim-copy leading-tight tracking-tight">
                          {activePlan.name}
                        </h2>
                      </div>
                    </div>

                    {/* Pricing grid */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-aim-navy-muted/5 border border-aim-border">
                      <div>
                        <span className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">One-Time Setup Fee</span>
                        <span className="text-lg sm:text-xl font-black text-aim-copy tracking-tight">{activePlan.securityDeposit}</span>
                      </div>
                      <div className="border-l border-aim-border pl-4">
                        <span className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">SaaS Monthly Subscription</span>
                        <span className="text-lg sm:text-xl font-black text-aim-gold tracking-tight">{activePlan.monthlySubscription}</span>
                      </div>
                    </div>

                    {/* Detail blocks */}
                    <div className="space-y-5 text-sm leading-relaxed">
                      
                      {/* Description */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-aim-gold uppercase tracking-widest flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-aim-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Plan Description
                        </h4>
                        <p className="text-aim-copy-muted font-medium text-justify">{activePlan.description}</p>
                      </div>

                      {/* Customization Details */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-aim-gold uppercase tracking-widest flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-aim-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Customization Details
                        </h4>
                        <p className="text-aim-copy-muted font-medium text-justify">{activePlan.customization}</p>
                      </div>

                      {/* Complimentary Benefits */}
                      <div className="space-y-1 p-3.5 rounded-xl bg-aim-purple/5 border border-aim-border">
                        <h4 className="text-xs font-black text-aim-gold uppercase tracking-widest flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-aim-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                          Complimentary Software
                        </h4>
                        <p className="text-aim-copy-muted font-medium text-justify mt-1">{activePlan.complimentary}</p>
                      </div>

                    </div>
                  </div>

                  {/* Bottom details block sticky footer */}
                  <div className="p-6 sm:p-8 bg-aim-navy-light/20 border-t border-aim-border space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-aim-copy-muted">
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
                          className="text-xs font-bold text-aim-copy-muted hover:text-aim-gold flex items-center gap-1.5 transition"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Agreement
                        </a>

                        <a href={ROUTES.CLIENT.LOGIN} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-aim-copy-muted hover:text-aim-gold transition">
                          Login
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* ── CHECKOUT / PAYMENT SECTION ── */}
          <div className="pt-16 border-t border-aim-border scroll-mt-24">
            <div className="max-w-3xl mx-auto">
              <div className="card-elevated rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-colors duration-300">
                <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-aim-gold/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="space-y-6 relative z-10">
                  {/* Static IDLE prompt always displayed on page */}
                  <div className="text-center space-y-4 py-6">
                    <span className="text-[10px] font-black tracking-widest text-aim-gold uppercase bg-aim-gold/10 px-3 py-1 rounded-full border border-aim-gold/20">
                      PURCHASE &amp; ACTIVATE
                    </span>
                    <h3 className="text-2xl font-black text-aim-copy tracking-tight mt-2">
                      Ready to <span className="text-gradient">Get Started?</span>
                    </h3>
                    <p className="text-sm text-aim-copy-muted max-w-lg mx-auto">
                      Select a plan above then click <strong>Activate Your Plan</strong> to complete your registration and make the one-time setup fee payment securely via Razorpay.
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
                </div>
              </div>
            </div>
          </div>

          {/* ── CHECKOUT MODAL DIALOG ── */}
          <AnimatePresence>
            {paymentStep !== 'idle' && (
              <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    if (paymentStep !== 'processing') {
                      setPaymentStep('idle')
                      setApiError('')
                    }
                  }}
                  className="fixed inset-0 bg-slate-950/75 backdrop-blur-md cursor-default"
                />

                {/* Modal Container */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[95vh] overflow-y-auto text-left"
                >
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (paymentStep !== 'processing') {
                        setPaymentStep('idle')
                        setApiError('')
                      }
                    }}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-aim-copy-muted hover:text-white transition cursor-pointer z-20"
                    aria-label="Close checkout modal"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-aim-gold/5 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="space-y-6 relative z-10">

                    {/* PROCESSING SPINNER */}
                    {paymentStep === 'processing' && (
                      <div className="flex flex-col items-center justify-center py-16 gap-5">
                        <div className="w-14 h-14 rounded-full border-4 border-aim-navy-light border-t-aim-gold animate-spin"></div>
                        <p className="text-sm font-semibold text-aim-copy-muted animate-pulse">Processing your request…</p>
                      </div>
                    )}

                    {/* SUCCESS SCREEN */}
                    {paymentStep === 'success' && successData && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-6 py-8 text-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center">
                          <svg className="w-9 h-9 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-aim-copy">Payment Successful! 🎉</h3>
                          <p className="text-sm text-aim-copy-muted mt-1">Your SaaS software account has been provisioned. Check your email for details.</p>
                        </div>
                        <div className="w-full grid sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-aim-gold/10 border border-aim-gold/20 text-left">
                            <span className="text-[10px] font-black text-aim-gold uppercase tracking-widest block mb-1">Your Client ID</span>
                            <span className="text-xl font-black text-aim-copy tracking-widest">{successData.client_id}</span>
                          </div>
                          <div className="p-4 rounded-2xl bg-aim-purple/10 border border-aim-purple/20 text-left">
                            <span className="text-[10px] font-black text-aim-copy-muted uppercase tracking-widest block mb-1">Default Password</span>
                            <span className="text-xl font-black text-aim-copy tracking-mono">{successData.default_password}</span>
                          </div>
                        </div>
                        <p className="text-xs text-aim-copy-muted max-w-sm">
                          Please save these credentials. Your Relationship Manager will contact you shortly.
                        </p>
                        <button
                          onClick={() => { setPaymentStep('idle'); setSuccessData(null) }}
                          className="text-xs font-bold text-aim-gold hover:text-aim-highlight underline underline-offset-2 transition cursor-pointer"
                        >
                          Purchase another plan →
                        </button>
                      </motion.div>
                    )}

                    {/* CHECKOUT FORM */}
                    {paymentStep === 'form' && (
                      <>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-aim-border">
                          <div>
                            <span className="text-[10px] font-black tracking-widest text-aim-gold uppercase bg-aim-gold/10 px-3 py-1 rounded-full border border-aim-gold/20">
                              COMPLETE REGISTRATION
                            </span>
                            <h3 className="text-xl font-black text-aim-copy tracking-tight mt-2">
                              {activePlan.name}
                            </h3>
                            <p className="text-xs text-aim-copy-muted mt-0.5">
                              One-Time Setup Fee: <span className="font-black text-aim-gold">{activePlan.securityDeposit}</span>
                              &nbsp;·&nbsp;Then {isInstitutePro 
                                ? `₹${(10 * (parseInt(checkoutData.total_students, 10) || 0)).toLocaleString('en-IN')}/mo (${checkoutData.total_students || 0} students)`
                                : (activePlan.monthlySubscription.startsWith('₹') ? '' : '₹') + activePlan.monthlySubscription + (activePlan.monthlySubscription.includes('month') ? '' : '/mo')
                              }
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setPaymentStep('idle'); setApiError('') }}
                            className="text-xs font-bold text-aim-copy-muted hover:text-red-500 dark:hover:text-red-400 transition cursor-pointer border border-aim-border hover:border-red-300 dark:hover:border-red-500/40 px-3 py-1.5 rounded-lg mr-8"
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
                              className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600 dark:text-red-400 flex items-start gap-2"
                            >
                              <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              {apiError}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <form onSubmit={handleCheckoutSubmit} className="space-y-5">

                          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
                            {/* Left Column: Billing Details */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-[10px] font-black text-aim-copy-muted uppercase tracking-widest mb-3">Billing Details</h4>
                                <div className="grid sm:grid-cols-2 gap-3.5">
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                      Client Name <span className="text-aim-gold">*</span>
                                    </label>
                                    <input
                                      ref={nameInputRef}
                                      type="text"
                                      name="client_name"
                                      value={checkoutData.client_name}
                                      onChange={handleCheckoutChange}
                                      placeholder="Full name"
                                      required
                                      className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                      Contact Number <span className="text-aim-gold">*</span>
                                    </label>
                                    <input
                                      type="tel"
                                      name="contact_number"
                                      value={checkoutData.contact_number}
                                      onChange={handleCheckoutChange}
                                      placeholder="+91 XXXXX XXXXX"
                                      required
                                      className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                    />
                                  </div>
                                  <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                      Email Address <span className="text-aim-gold">*</span>
                                    </label>
                                    <input
                                      type="email"
                                      name="email"
                                      value={checkoutData.email}
                                      onChange={handleCheckoutChange}
                                      placeholder="name@company.com"
                                      required
                                      className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                    />
                                  </div>

                                  {/* Conditional fields for Institute Pro (id=15) vs others */}
                                  {!isInstitutePro ? (
                                    <div className="space-y-1.5 sm:col-span-2">
                                      <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                        Company Name
                                      </label>
                                      <input
                                        type="text"
                                        name="company_name"
                                        value={checkoutData.company_name}
                                        onChange={handleCheckoutChange}
                                        placeholder="Your organization"
                                        className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                      />
                                    </div>
                                  ) : (
                                    <>
                                      <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                          School Name <span className="text-aim-gold">*</span>
                                        </label>
                                        <input
                                          type="text"
                                          name="school_name"
                                          value={checkoutData.school_name}
                                          onChange={handleCheckoutChange}
                                          required
                                          placeholder="Full school name"
                                          className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                          Short Name <span className="text-aim-gold">*</span> <span className="text-aim-copy-muted normal-case font-normal">(max 8 chars)</span>
                                        </label>
                                        <input
                                          type="text"
                                          name="school_short_name"
                                          maxLength="8"
                                          value={checkoutData.school_short_name}
                                          onChange={handleCheckoutChange}
                                          required
                                          placeholder="e.g. STMARY"
                                          className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                          Current Session <span className="text-aim-gold">*</span> <span className="text-aim-copy-muted normal-case font-normal">(max 10 chars)</span>
                                        </label>
                                        <input
                                          type="text"
                                          name="school_session"
                                          maxLength="10"
                                          value={checkoutData.school_session}
                                          onChange={handleCheckoutChange}
                                          required
                                          placeholder="2025-26"
                                          className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Column: Address details, RM, GST & Total Students */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-[10px] font-black text-aim-copy-muted uppercase tracking-widest mb-3">Address & RM Details</h4>
                                <div className="grid sm:grid-cols-2 gap-3.5">
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                      District <span className="text-aim-gold">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      name="district"
                                      value={checkoutData.district}
                                      onChange={handleCheckoutChange}
                                      required
                                      placeholder="e.g. Kolkata"
                                      className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                      State <span className="text-aim-gold">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      name="state"
                                      value={checkoutData.state}
                                      onChange={handleCheckoutChange}
                                      required
                                      placeholder="e.g. West Bengal"
                                      className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                      PIN Code <span className="text-aim-gold">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      name="pin_code"
                                      value={checkoutData.pin_code}
                                      onChange={handleCheckoutChange}
                                      required
                                      placeholder="700001"
                                      className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                    />
                                  </div>

                                  {/* Total Students & GSTIN conditional slots */}
                                  {isInstitutePro ? (
                                    <>
                                      <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                          Total Students <span className="text-aim-gold">*</span>
                                        </label>
                                        <input
                                          type="number"
                                          name="total_students"
                                          min="1"
                                          value={checkoutData.total_students}
                                          onChange={handleCheckoutChange}
                                          required
                                          placeholder="e.g. 450"
                                          className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                        />
                                      </div>
                                      <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                          GSTIN <span className="text-aim-copy-muted normal-case font-normal">(optional)</span>
                                        </label>
                                        <input
                                          type="text"
                                          name="gstin"
                                          value={checkoutData.gstin}
                                          onChange={handleCheckoutChange}
                                          placeholder="22AAAAA0000A1Z5"
                                          className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                        GSTIN <span className="text-aim-copy-muted normal-case font-normal">(optional)</span>
                                      </label>
                                      <input
                                        type="text"
                                        name="gstin"
                                        value={checkoutData.gstin}
                                        onChange={handleCheckoutChange}
                                        placeholder="22AAAAA0000A1Z5"
                                        className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                      />
                                    </div>
                                  )}

                                  {/* Custom Price Adjustments */}
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                      One-Time Setup Fee (₹) <span className="text-aim-gold">*</span>
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      value={customProcessingFee}
                                      onChange={(e) => setCustomProcessingFee(Number(e.target.value))}
                                      required
                                      className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                      Monthly Subscription (₹) <span className="text-aim-gold">*</span>
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      value={customMonthlySubscription}
                                      onChange={(e) => setCustomMonthlySubscription(Number(e.target.value))}
                                      required
                                      disabled={isInstitutePro}
                                      className="input-brand text-sm bg-aim-navy-light border-white/10 text-white focus:border-aim-gold disabled:opacity-50"
                                    />
                                  </div>

                                  {/* Select Relationship Manager */}
                                  <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                      Select Relationship Manager <span className="text-aim-gold">*</span>
                                    </label>
                                    <div className="relative">
                                      <select
                                        name="partner_id"
                                        value={checkoutData.partner_id}
                                        onChange={handleCheckoutChange}
                                        required
                                        className="input-brand text-sm appearance-none cursor-pointer bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                      >
                                        <option value="">Select your RM / Partner</option>
                                        {partners.map(p => (
                                          <option key={p.id} value={p.partner_id} className="bg-slate-900 text-white">
                                            {p.partner_name} — {p.partner_id}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-aim-copy-muted">
                                        <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Full Address */}
                                  <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-widest block">
                                      Full Address <span className="text-aim-gold">*</span>
                                    </label>
                                    <textarea
                                      name="address"
                                      value={checkoutData.address}
                                      onChange={handleCheckoutChange}
                                      required
                                      rows="2"
                                      placeholder="Street, building, locality…"
                                      className="input-brand text-sm transition resize-none bg-aim-navy-light border-white/10 text-white focus:border-aim-gold"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>


                          {/* Pay Button */}
                          <div className="pt-4 border-t border-white/10">
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
                                <span>Pay {activePlan.securityDeposit} Setup Fee via Razorpay</span>
                              )}
                            </Button>
                            <p className="text-center text-[11px] text-aim-copy-muted mt-2">
                              Secured by Razorpay · Your data is encrypted
                            </p>
                          </div>

                        </form>
                      </>
                    )}

                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}

export default SaasBasedSoftware
