import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import PageHero from '../../components/website/common/PageHero'

const marketingServices = [
  {
    title: 'Search Engine Optimization (SEO)',
    description: 'Dominate organic search results. We perform extensive keyword audits, optimize on-page structure, speed up load times, and implement high-authority link building campaigns.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    highlights: ['Keyword Strategy', 'Technical SEO', 'On-Page Optimization', 'Authority Backlinks'],
    accent: 'gold',
  },
  {
    title: 'Pay-Per-Click Advertising (PPC)',
    description: 'Acquire high-intent traffic instantly. We design, deploy, and manage highly optimized ad campaigns across Google Ads, Meta Ads, and LinkedIn to maximize your ROI.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    highlights: ['Google Ads', 'Meta Paid Social', 'Retargeting Funnels', 'A/B Testing Ad Copies'],
    accent: 'purple',
  },
  {
    title: 'Social Media Management (SMM)',
    description: 'Cultivate a thriving, loyal community. We build custom content calendars, manage accounts, design premium graphics, and run interactive social media campaigns.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    highlights: ['Instagram & LinkedIn', 'Graphic Design & Copy', 'Community Management', 'Influencer Collabs'],
    accent: 'gold',
  },
  {
    title: 'Brand Placement & Analytics',
    description: 'Track and refine your marketing roadmap. We configure advanced Google Analytics (GA4) pipelines, generate monthly ROI reports, and optimize user conversion rates.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm9 0V4a2 2 0 022-2h2a2 2 0 022 2v15a2 2 0 02-2 2h-2a2 2 0 02-2-2z" />
      </svg>
    ),
    highlights: ['GA4 Dashboards', 'Conversion Tracking', 'Competitor Audits', 'Monthly Strategy Reviews'],
    accent: 'purple',
  },
]

const iconWrap = (accent) =>
  accent === 'purple'
    ? 'p-3.5 rounded-xl bg-aim-purple/10 text-aim-purple border border-aim-purple/20'
    : 'p-3.5 rounded-xl bg-aim-gold/10 text-aim-gold border border-aim-gold/20'

const DigitalMarketing = () => {
  return (
    <>
      <Helmet>
        <title>AIM Digitalise | Digital Marketing Services</title>
        <meta name="description" content="Accelerate your brand growth with AIM Digitalise's elite digital marketing services, covering SEO optimization, Google Ads, SMM, and analytics." />
      </Helmet>

      <div className="page-shell">
        <PageHero
          badge="Brand Positioning & Growth"
          title="Vibrant Digital"
          highlight="Marketing Services"
          description="We blend data-driven optimization with premium creative execution to scale your search visibility, social engagement, and customer acquisition rates."
        />

        <section className="section-muted py-16 md:py-20">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {marketingServices.map((service, i) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card hover padding="lg" className="h-full flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className={iconWrap(service.accent)}>{service.icon}</div>
                        <h3 className="text-2xl font-bold text-aim-copy text-left">{service.title}</h3>
                      </div>
                      <p className="text-aim-copy-muted text-sm leading-relaxed text-left">{service.description}</p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-2">
                      {service.highlights.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-lg bg-aim-navy-muted/10 border border-aim-border text-aim-copy-muted text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="cta-panel max-w-5xl mx-auto p-10 md:p-12">
              <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />
              <div className="relative z-10 space-y-6 pt-2">
                <h2 className="text-3xl font-bold text-aim-copy">Ready to scale your brand value?</h2>
                <p className="text-aim-copy-muted max-w-2xl mx-auto text-sm leading-relaxed">
                  Book a consultation with our digital marketing directors. We will audit your competitors, suggest targeted keyword roadmaps, and propose budget-optimized campaign funnels.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button variant="primary" size="lg" className="btn-primary cursor-pointer">
                    Request Free Marketing Audit
                  </Button>
                  <a href="https://wa.me/916290902922" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg" className="btn-outline-brand cursor-pointer">
                      Speak to an Expert
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default DigitalMarketing
