import { motion } from 'framer-motion'

const certifications = [
  {
    name: 'eMudra Authorized Partner',
    logo: '🔐',
    category: 'Digital Signature Certificate',
    description: 'Direct controller & authorized reseller for eMudra DSC across India.',
    color: 'from-blue-500/15 to-cyan-500/10',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
  },
  {
    name: 'Capricorn CA Partner',
    logo: '♑',
    category: 'Digital Signature Certificate',
    description: 'Certified direct partner for Capricorn Certifying Authority DSC solutions.',
    color: 'from-indigo-500/15 to-violet-500/10',
    border: 'border-indigo-500/30',
    accent: 'text-indigo-400',
  },
  {
    name: 'Sify Technologies Partner',
    logo: '🌐',
    category: 'Digital Signature Certificate',
    description: 'Authorized reseller and controller for Sify DSC & digital authentication.',
    color: 'from-purple-500/15 to-pink-500/10',
    border: 'border-purple-500/30',
    accent: 'text-purple-400',
  },
  {
    name: 'V-Sign Certified',
    logo: '✅',
    category: 'Digital Signature Certificate',
    description: 'Certified direct controller for V-Sign digital signature certificates.',
    color: 'from-emerald-500/15 to-teal-500/10',
    border: 'border-emerald-500/30',
    accent: 'text-emerald-400',
  },
  {
    name: 'PantaSign Authorized',
    logo: '🖊️',
    category: 'Digital Signature Certificate',
    description: 'Authorized partner offering PantaSign DSC services with full support.',
    color: 'from-orange-500/15 to-amber-500/10',
    border: 'border-orange-500/30',
    accent: 'text-orange-400',
  },
  {
    name: 'ID Sign Partner',
    logo: '🪪',
    category: 'Digital Signature Certificate',
    description: 'Official ID Sign direct controller for digital identity verification.',
    color: 'from-pink-500/15 to-rose-500/10',
    border: 'border-pink-500/30',
    accent: 'text-pink-400',
  },
  {
    name: 'Google Partner',
    logo: '🔍',
    category: 'Digital Marketing',
    description: 'Certified Google Ads partner for SEM, PPC and paid advertising campaigns.',
    color: 'from-red-500/15 to-orange-500/10',
    border: 'border-red-500/30',
    accent: 'text-red-400',
  },
  {
    name: 'Meta Business Partner',
    logo: '📘',
    category: 'Social Media Marketing',
    description: 'Certified Meta Business partner for Facebook & Instagram ad campaigns.',
    color: 'from-blue-500/15 to-indigo-500/10',
    border: 'border-blue-400/30',
    accent: 'text-blue-300',
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
    <section className="relative py-24 overflow-hidden bg-slate-950 bg-grid-pattern border-t border-slate-900">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-indigo-500/6 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-[400px] h-[200px] bg-purple-500/6 rounded-full blur-3xl" />
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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">
            ✅ Verified & Certified
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Our{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              Certifications
            </span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
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
              className={`group relative bg-gradient-to-br ${cert.color} border ${cert.border} rounded-2xl p-5 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden`}
            >
              {/* Shine on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.04] to-transparent rounded-2xl pointer-events-none" />

              <div className="text-4xl mb-3">{cert.logo}</div>
              <h3 className="font-bold text-white text-sm leading-tight mb-1">{cert.name}</h3>
              <span className={`text-xs font-semibold uppercase tracking-wider ${cert.accent} block mb-2`}>
                {cert.category}
              </span>
              <p className="text-slate-400 text-xs leading-relaxed">{cert.description}</p>

              {/* Certified badge */}
              <div className={`mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border ${cert.border} text-xs font-medium ${cert.accent}`}>
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
