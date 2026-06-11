import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../ui/Button'
import Card from '../../ui/Card'
import { ROUTES } from '../../../constants/routes'

const subscriptionModels = {
  websites: [
    {
      name: 'Static Informative Website',
      badge: 'Static Plan',
      price: '₹2,000',
      priceSuffix: ' Setup + ₹999/mo',
      description: 'Ideal for small businesses seeking an elegant, fast, and secure corporate brochure page.',
      features: [
        'Up to 5 Pages Corporate Look',
        'Clean, fast static layouts',
        'Assigned Relationship Manager',
        'Free ESS Software (1 year)',
        '100% Data Security & Ownership'
      ],
      ctaText: 'Activate Plan',
      recommended: false
    },
    {
      name: 'NEXGN Institute Pro',
      badge: 'Educational ERP',
      price: '₹1,000',
      priceSuffix: ' Setup + ₹10/student/mo',
      description: 'All-in-one school, college, and training center management system to control fee collection, timetables, and parent notifications.',
      features: [
        'Student & Staff Database',
        'Fee Collection with payment links',
        'Class timetables & Exam scorecards',
        'Parent Notification system',
        'Free ESS Software (1 year)'
      ],
      ctaText: 'Activate Plan',
      recommended: true
    },
    {
      name: 'E-Commerce Single Seller',
      badge: 'Online Shop',
      price: '₹5,000',
      priceSuffix: ' Setup + ₹2,499/mo',
      description: 'Full single seller marketplace solution with catalog management and automated invoicing systems.',
      features: [
        'Razorpay, Paytm & Stripe payment setup',
        'Digital catalog & inventory dashboard',
        'Order tracking & auto invoices',
        'Free ESS Software (1 year)',
        '100% Data Security & Ownership'
      ],
      ctaText: 'Activate Plan',
      recommended: false
    }
  ],
  software: [
    {
      name: 'NEXGN Accounts & Billing',
      badge: 'Financials',
      price: '₹2,000',
      priceSuffix: ' Setup + ₹799/mo',
      description: 'Quick GST-compliant invoicing, purchase orders, expense tracking, and customer ledgers on a secure cloud.',
      features: [
        'GST-Compliant Invoicing templates',
        'Expense tracking & customer ledger sheets',
        'Auto billing reminders (SMS/WhatsApp)',
        'Free ESS Software (1 year)',
        '100% Data Security & Ownership'
      ],
      ctaText: 'Activate Plan',
      recommended: false
    },
    {
      name: 'NEXGN ERP Pro',
      badge: 'All-In-One Workspace',
      price: '₹1,000',
      priceSuffix: ' Setup + ₹10/mo/student',
      description: 'Fully integrated HRMS, inventory, purchase order logs, sales pipelines, and customer relationship manager.',
      features: [
        'Integrated HRMS + Inventory + CRM',
        'Sales pipeline & target tracking widgets',
        'Custom print templates for PO/Quotes',
        'Free ESS Software (1 year)',
        '100% Data Security & Ownership'
      ],
      ctaText: 'Activate Plan',
      recommended: true
    },
    {
      name: 'NEXGN Hotel & Hospital Pro',
      badge: 'Industry Custom',
      price: '₹4,000',
      priceSuffix: ' Setup + ₹1,499/mo',
      description: 'Dedicated software workflows for hotel property reservation or clinical EMR, doctor scheduler and pharmacy stock.',
      features: [
        'Clinical EMR, appointments & OPD bills',
        'Hotel booking calendar & housekeeping logs',
        'Integrated Restaurant/Pharmacy POS',
        'Free ESS Software (1 year)',
        '100% Data Security & Ownership'
      ],
      ctaText: 'Activate Plan',
      recommended: false
    }
  ]
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

const PricingCard = () => {
  const [tier, setTier] = useState('websites')

  const currentModels = subscriptionModels[tier]

  return (
    <section className="py-24 section-white relative">
      <div className="ambient-glows" aria-hidden />

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="badge-pill mx-auto w-fit">
            <span className="badge-pill-dot" />
            Pricing &amp; Subscriptions
          </div>
          <h2 className="heading-display">
            Flexible Subscription Models
          </h2>
          <div className="divider-brand" />
          <p className="text-lg copy-on-dark-muted">
            India's first monthly subscription based website and software with 100% data security &amp; ownership.
          </p>

          {/* Tier Switcher */}
          <div className="flex justify-center mt-10">
            <div className="bg-aim-navy-light/60 border border-white/10 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setTier('websites')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  tier === 'websites'
                    ? 'bg-aim-gold text-aim-navy shadow-md'
                    : 'text-aim-copy-muted hover:text-white'
                }`}
              >
                SaaS Website Plans
              </button>
              <button
                onClick={() => setTier('software')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  tier === 'software'
                    ? 'bg-aim-gold text-aim-navy shadow-md'
                    : 'text-aim-copy-muted hover:text-white'
                }`}
              >
                SaaS Software Solutions
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 items-stretch"
          variants={containerVariants}
          initial="hidden"
          key={tier}
          animate="show"
          viewport={{ once: true }}
        >
          {currentModels.map((model) => (
            <motion.div key={model.name} variants={itemVariants} className="flex">
              <Card
                padding="lg"
                className={`flex flex-col justify-between w-full relative ${
                  model.recommended ? 'border-2 border-aim-gold/60 shadow-2xl shadow-aim-gold/15' : ''
                }`}
              >
                {model.recommended && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                    <span className="bg-aim-gold text-aim-navy text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg">
                      {model.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-6 text-left">
                  <div>
                    {!model.recommended && (
                      <span className="inline-block text-[10px] uppercase font-bold text-aim-copy-muted tracking-widest mb-1">
                        {model.badge}
                      </span>
                    )}
                    <h3 className="text-2xl font-bold text-white">{model.name}</h3>
                    <p className="text-aim-copy-muted text-xs mt-2 leading-relaxed min-h-[40px]">
                      {model.description}
                    </p>
                    <div className="mt-4 flex items-baseline text-white">
                      <span className="text-4xl font-extrabold tracking-tight">{model.price}</span>
                      <span className="ml-1 text-sm font-semibold text-aim-copy-muted">{model.priceSuffix}</span>
                    </div>
                  </div>

                  <ul className="space-y-3.5 border-t border-white/10 pt-6">
                    {model.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-aim-highlight shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-aim-copy text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <Link to={ROUTES.SAAS_SOFTWARE} className="block w-full">
                    <Button
                      variant={model.recommended ? 'primary' : 'outline'}
                      size="lg"
                      className="w-full text-sm font-bold cursor-pointer"
                    >
                      {model.ctaText}
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default PricingCard