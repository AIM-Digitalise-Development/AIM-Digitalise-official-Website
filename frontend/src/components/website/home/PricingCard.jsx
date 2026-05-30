import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../../ui/Button'
import Card from '../../ui/Card'

const engagementModels = {
  growth: [
    {
      name: 'Advisory & Strategy',
      badge: 'Discovery Phase',
      price: '$150',
      priceSuffix: '/hr',
      description: 'Ideal for tech roadmapping, cloud security audits, architecture design, and technical scoping.',
      features: [
        'Chief Solutions Architect lead',
        'Detailed system design diagrams',
        'Codebase & security audits',
        'SOC2 compliance roadmapping',
        'Flexible hourly engagements'
      ],
      ctaText: 'Schedule Audit',
      recommended: false
    },
    {
      name: 'Dedicated Developer Pod',
      badge: 'Most Popular',
      price: '$8,500',
      priceSuffix: '/mo per dev',
      description: 'Retain dedicated, full-time senior engineers fully managed by a PM and QA. Perfect for building products.',
      features: [
        'Dedicated senior engineers',
        'Shared PM & QA oversight',
        'Daily standups & weekly demos',
        'Immediate scale capability',
        'Full IP ownership'
      ],
      ctaText: 'Assemble Squad',
      recommended: true
    },
    {
      name: 'Fixed-Scope Projects',
      badge: 'Turnkey Delivery',
      price: 'Custom Scope',
      priceSuffix: '',
      description: 'We deliver your defined product end-to-end. Best for MVP launches or well-defined feature additions.',
      features: [
        'Guaranteed milestone delivery',
        'Complete wireframes & specs',
        'Rigorous automated testing',
        '30 days post-launch support',
        'Fixed budget timeline'
      ],
      ctaText: 'Request Scoping',
      recommended: false
    }
  ],
  enterprise: [
    {
      name: 'Advisory & Strategy',
      badge: 'Enterprise Architecture',
      price: '$250',
      priceSuffix: '/hr',
      description: 'On-demand technical executive advisory, systems modernization plans, and disaster recovery audits.',
      features: [
        'Principal Architect & Partner lead',
        'Zero-Trust network architecture',
        'Legacy migration path design',
        'DR & business continuity specs',
        'Priority SLA consultation'
      ],
      ctaText: 'Consult Architect',
      recommended: false
    },
    {
      name: 'Dedicated Development Center',
      badge: 'Scaling Teams',
      price: '$12,000',
      priceSuffix: '/mo per dev',
      description: 'Elite developers, designers, QAs, and delivery managers dedicated entirely to your enterprise systems.',
      features: [
        '100% Dedicated senior developers',
        'Dedicated QA & Lead PM',
        'Enterprise grade security compliance',
        'Continuous uptime SLA support',
        '24/7 Priority engineering response'
      ],
      ctaText: 'Initiate Center',
      recommended: true
    },
    {
      name: 'Enterprise Fixed Delivery',
      badge: 'Defined Scope',
      price: 'Custom SLA',
      priceSuffix: '',
      description: 'Large-scale digital transformations, migration projects, and product rewrites handled with strict delivery agreements.',
      features: [
        'SLA-backed milestone delivery',
        'Full DevOps & security integration',
        'Multi-stage staging deployments',
        '90 days post-launch warranty',
        'Detailed transition training'
      ],
      ctaText: 'Contact Enterprise Sales',
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
  const [tier, setTier] = useState('growth')

  const currentModels = engagementModels[tier]

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background glow top left */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Partnership Models
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Flexible Engagement Models
          </h2>
          <p className="text-lg text-slate-400">
            Choose the alignment model that fits your company size, timeline, and engineering requirements.
          </p>

          {/* Tier Switcher */}
          <div className="flex justify-center mt-10">
            <div className="bg-slate-900/80 border border-slate-800 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setTier('growth')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  tier === 'growth'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Growth Stage & Startups
              </button>
              <button
                onClick={() => setTier('enterprise')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  tier === 'enterprise'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Enterprise Systems
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
                className={`flex flex-col justify-between w-full relative bg-slate-900/20 border-slate-800/80 ${
                  model.recommended ? 'border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/5' : ''
                }`}
              >
                {model.recommended && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg">
                      {model.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-6 text-left">
                  <div>
                    {!model.recommended && (
                      <span className="inline-block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">
                        {model.badge}
                      </span>
                    )}
                    <h3 className="text-2xl font-bold text-white">{model.name}</h3>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed min-h-[40px]">
                      {model.description}
                    </p>
                    <div className="mt-4 flex items-baseline text-white">
                      <span className="text-4xl font-extrabold tracking-tight">{model.price}</span>
                      <span className="ml-1 text-sm font-semibold text-slate-500">{model.priceSuffix}</span>
                    </div>
                  </div>

                  <ul className="space-y-3.5 border-t border-slate-800/60 pt-6">
                    {model.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/60">
                  <Button
                    variant={model.recommended ? 'primary' : 'outline'}
                    size="lg"
                    className="w-full text-sm font-bold"
                  >
                    {model.ctaText}
                  </Button>
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