import { motion } from 'framer-motion'

const certifications = [
  {
    name: 'eMudra Authorized Partner',
    logo: '🔐',
    category: 'Digital Signature Certificate',
    description: 'Direct controller & authorized reseller for eMudra DSC across India.',
    accent: 'text-aim-gold',
  },
  {
    name: 'Capricorn CA Partner',
    logo: '♑',
    category: 'Digital Signature Certificate',
    description: 'Certified direct partner for Capricorn Certifying Authority DSC solutions.',
    accent: 'text-aim-gold',
  },
  {
    name: 'Sify Technologies Partner',
    logo: '🌐',
    category: 'Digital Signature Certificate',
    description: 'Authorized reseller and controller for Sify DSC & digital authentication.',
    accent: 'text-aim-purple',
  },
  {
    name: 'V-Sign Certified',
    logo: '✅',
    category: 'Digital Signature Certificate',
    description: 'Certified direct controller for V-Sign digital signature certificates.',
    accent: 'text-aim-gold',
  },
  {
    name: 'PantaSign Authorized',
    logo: '🖊️',
    category: 'Digital Signature Certificate',
    description: 'Authorized partner offering PantaSign DSC services with full support.',
    accent: 'text-aim-purple',
  },
  {
    name: 'ID Sign Partner',
    logo: '🪪',
    category: 'Digital Signature Certificate',
    description: 'Official ID Sign direct controller for digital identity verification.',
    accent: 'text-aim-purple',
  },
  {
    name: 'Google Partner',
    logo: '🔍',
    category: 'Digital Marketing',
    description: 'Certified Google Ads partner for SEM, PPC and paid advertising campaigns.',
    accent: 'text-aim-purple',
  },
  {
    name: 'Meta Business Partner',
    logo: '📘',
    category: 'Social Media Marketing',
    description: 'Certified Meta Business partner for Facebook & Instagram ad campaigns.',
    accent: 'text-aim-gold',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
}

const OurCertifications = () => {
  return (
    <section className="relative py-24 overflow-hidden section-tinted bg-grid-pattern">
      <div className="ambient-glows" aria-hidden />
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-blue-500/3 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-[400px] h-[200px] bg-red-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative container-custom z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="badge-pill mx-auto w-fit mb-4">
            <span className="badge-pill-dot" />
            Verified & Certified
          </div>
          <h2 className="heading-display">
            Our <span className="text-gradient">Certifications</span>
          </h2>
          <div className="divider-brand" />
          <p className="mt-4 text-aim-copy-muted max-w-xl mx-auto text-sm leading-relaxed">
            We are officially certified and authorized by leading national and global bodies, ensuring the highest standards of service.
          </p>
        </motion.div>

        {/* Certifications Grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {certifications.map((cert) => (
            <motion.div
              key={cert.name}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative card-elevated rounded-2xl p-5 overflow-hidden"
            >
              {/* Shine on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.04] to-transparent rounded-2xl pointer-events-none" />

              <div className="text-4xl mb-3">{cert.logo}</div>
              <h3 className="font-bold text-white text-sm leading-tight mb-1">{cert.name}</h3>
              <span className={`text-xs font-semibold uppercase tracking-wider ${cert.accent} block mb-2`}>
                {cert.category}
              </span>
              <p className="text-aim-copy-muted text-xs leading-relaxed">{cert.description}</p>

              {/* Certified badge */}
              <div className={`mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-aim-border text-xs font-semibold ${cert.accent}`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Certified
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default OurCertifications
