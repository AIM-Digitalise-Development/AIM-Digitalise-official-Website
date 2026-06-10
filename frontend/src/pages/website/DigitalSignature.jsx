import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import PageHero from '../../components/website/common/PageHero'

const dscOfferings = [
  {
    title: 'Class 3 Digital Signature (DSC)',
    description: 'The standard and most secure DSC type required for MCA company incorporation, GST registration, Income Tax filing, e-tendering, patent filings, and trademark applications.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    features: ['Signature Only', 'Encryption Only', 'Signature & Encryption Combo', '2-Year Validity Option'],
    accent: 'purple',
  },
  {
    title: 'DGFT Digital Signature',
    description: 'Specifically crafted for importers and exporters. Seamlessly sign documents on the Directorate General of Foreign Trade portal to accelerate shipping license processing.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5A2.5 2.5 0 0019 9.5V8a2 2 0 012-2h.055M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    features: ['Custom Exporter Code Sync', 'Govt Portal Integration', 'Fast Verification', 'Secure HSM Cryptography'],
    accent: 'gold',
  },
  {
    title: 'Paperless Video Verification',
    description: 'Obtain your digital signature completely online. No physical document submissions required. Complete video verification via mobile or laptop within 10 minutes.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    features: ['10-Min Aadhaar KYC', 'Instant Mobile OTP Verification', 'Convenient Video Recording Link', 'Rapid CA Approval'],
    accent: 'purple',
  },
  {
    title: 'FIPS Secure USB Tokens',
    description: 'We supply certified, high-grade cryptographic USB tokens (ePass2003 Auto / HYP2003) to securely store your private keys and prevent unauthorized document signatures.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2a2 2 0 002-2v-5a2 2 0 00-2-2h-2m-6 9v3m-6-3h2a2 2 0 002-2v-5a2 2 0 00-2-2H4a2 2 0 00-2 2v5a2 2 0 002 2m4-9v3m4-3h2a2 2 0 002-2V4a2 2 0 00-2-2h-2a2 2 0 00-2 2v3m-6 3h2a2 2 0 002-2V4a2 2 0 00-2-2H4a2 2 0 00-2 2v3m10 5h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2" />
      </svg>
    ),
    features: ['FIPS 140-2 Level 3 Compliant', 'Auto-install Drivers', 'Password Protected Storage', 'Compatible with Windows & macOS'],
    accent: 'gold',
  },
]

const dscSteps = [
  { step: '01', title: 'Aadhaar e-KYC', desc: 'Provide your Aadhaar number and verify with mobile OTP to fetch paperless KYC details.' },
  { step: '02', title: 'Video Recording', desc: 'Record a quick 20-second video speaking your name and showing your physical PAN card.' },
  { step: '03', title: 'CA Approval', desc: 'The Certifying Authority audits and approves the application credentials within 30 minutes.' },
  { step: '04', title: 'USB Token Delivery', desc: 'Your signature is downloaded onto a secure USB cryptographic token and dispatched to you.' },
]

const iconWrap = (accent) =>
  accent === 'purple'
    ? 'p-3.5 rounded-xl bg-aim-purple/10 text-aim-purple border border-aim-purple/20'
    : 'p-3.5 rounded-xl bg-aim-gold/10 text-aim-gold border border-aim-gold/20'

const DigitalSignature = () => {
  return (
    <>
      <Helmet>
        <title>Digital Signature Certificates (DSC) | AIM Digitalise</title>
        <meta name="description" content="Secure your business operations with Class 3 Digital Signature Certificates (DSC) and DGFT tokens from AIM Digitalise. Quick paperless registration." />
      </Helmet>

      <div className="page-shell">
        <PageHero
          badge="Compliance & Trust"
          title="Secure Digital"
          highlight="Signature Certificates"
          description="We issue government-authorized, legally compliant Class 3 DSC and DGFT cryptographic tokens for businesses, directors, and organizations."
        />

        <section className="section-muted py-16 md:py-20">
          <div className="container-custom">
            
            {/* Offerings Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-24">
              {dscOfferings.map((dsc, i) => (
                <motion.div
                  key={dsc.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card hover padding="lg" className="h-full flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className={iconWrap(dsc.accent)}>{dsc.icon}</div>
                        <h3 className="text-2xl font-bold text-aim-copy text-left">{dsc.title}</h3>
                      </div>
                      <p className="text-aim-copy-muted text-sm leading-relaxed text-left">{dsc.description}</p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-2">
                      {dsc.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1 rounded-lg bg-aim-navy-muted/10 border border-aim-border text-aim-copy-muted text-xs font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Steps Section */}
            <div className="mb-24 text-center space-y-12">
              <div className="space-y-3">
                <span className="badge-pill mx-auto">Registration Process</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">How to Get Your DSC in 4 Steps</h2>
                <div className="divider-brand" />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {dscSteps.map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="card-elevated p-6 rounded-2xl border border-aim-border flex flex-col justify-between text-left relative overflow-hidden"
                  >
                    <div className="absolute top-2 right-4 text-4xl sm:text-5xl font-black text-white/5 font-mono select-none">
                      {item.step}
                    </div>
                    <div className="space-y-4">
                      <span className="w-8 h-8 rounded-lg bg-aim-gold/15 border border-aim-gold/30 text-aim-gold flex items-center justify-center font-bold text-xs">
                        {item.step}
                      </span>
                      <h4 className="text-lg font-bold text-white mt-4">{item.title}</h4>
                      <p className="text-aim-copy-muted text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Panel */}
            <div className="cta-panel max-w-5xl mx-auto p-10 md:p-12">
              <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />
              <div className="relative z-10 space-y-6 pt-2">
                <h2 className="text-3xl font-bold text-aim-copy">Need DSC assistance?</h2>
                <p className="text-aim-copy-muted max-w-2xl mx-auto text-sm leading-relaxed">
                  Our dedicated DSC executives can guide you through online verification, answer video setup queries, and organize express token shipping options.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a href="https://wa.me/916290902922" target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" size="lg" className="btn-primary cursor-pointer">
                      Apply DSC Online Now
                    </Button>
                  </a>
                  <Button variant="outline" size="lg" className="btn-outline-brand cursor-pointer">
                    View Fee Structure
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default DigitalSignature
