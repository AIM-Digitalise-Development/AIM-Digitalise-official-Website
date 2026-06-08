import { motion } from 'framer-motion'

const awards = [
  {
    icon: '🏆',
    title: 'Best Digital Marketing Agency',
    body: 'Recognized as one of the top performance digital marketing agencies in India for delivering exceptional results.',
    year: '2023',
    org: 'India Digital Awards',
    badge: 'text-aim-gold',
  },
  {
    icon: '🥇',
    title: 'Excellence in Web Development',
    body: 'Awarded for outstanding website design and development services that transformed client digital presence.',
    year: '2022',
    org: 'Tech India Summit',
    badge: 'text-aim-purple',
  },
  {
    icon: '🌟',
    title: 'Top Emerging Agency',
    body: 'Honored as one of the fastest-growing digital agencies in India, setting benchmarks in the industry.',
    year: '2022',
    org: 'Startup India Recognition',
    badge: 'text-aim-purple',
  },
  {
    icon: '🎖️',
    title: 'Best Digital Signature Partner',
    body: 'Recognized as the leading direct controller for eMudra, Capricorn, and other top DSC authorities.',
    year: '2023',
    org: 'Controller of Certifying Authorities',
    badge: 'text-aim-gold',
  },
  {
    icon: '🚀',
    title: 'Innovation in SEO & SEM',
    body: 'Awarded for pioneering data-driven SEO strategies that delivered measurable business impact for clients.',
    year: '2023',
    org: 'Digital Marketing Excellence',
    badge: 'text-aim-purple',
  },
  {
    icon: '💡',
    title: 'Client Satisfaction Award',
    body: 'Achieved a 98%+ client satisfaction rate, recognized by industry bodies for transparent and honest business practices.',
    year: '2024',
    org: 'Business Excellence Council',
    badge: 'text-aim-gold',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const AwardsRecognition = () => {
  return (
    <section className="relative py-24 overflow-hidden section-white">
      <div className="ambient-glows" aria-hidden />
      <div className="relative container-custom z-10">
        <motion.div
          className="text-center mb-14 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="badge-pill mx-auto w-fit">
            <span className="badge-pill-dot-red" />
            Awards & Recognition
          </div>
          <h2 className="heading-display">
            Our <span className="text-gradient">Achievements</span>
          </h2>
          <div className="divider-brand" />
          <p className="mt-4 text-aim-copy-muted max-w-xl mx-auto text-sm leading-relaxed">
            Proudly recognised by leading industry bodies for innovation, excellence and our unwavering commitment to client success.
          </p>
        </motion.div>

        {/* Awards Grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {awards.map((award) => (
            <motion.div
              key={award.title}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative group card-elevated p-6 overflow-hidden shadow-md"
            >
              {/* Decorative glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/[0.02] rounded-2xl" />

              <div className="flex items-start gap-4">
                <div className="text-4xl shrink-0">{award.icon}</div>
                <div className="space-y-1">
                  <h3 className="font-bold text-aim-copy text-base leading-snug">{award.title}</h3>
                  <p className={`text-xs font-bold uppercase tracking-widest ${award.badge}`}>
                    {award.org} · {award.year}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-aim-copy-muted text-sm leading-relaxed">{award.body}</p>

              {/* Bottom ribbon */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-aim-gold to-aim-purple opacity-80" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default AwardsRecognition
