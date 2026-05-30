import { motion } from 'framer-motion'

const awards = [
  {
    icon: '🏆',
    title: 'Best Digital Marketing Agency',
    body: 'Recognized as one of the top performance digital marketing agencies in India for delivering exceptional results.',
    year: '2023',
    org: 'India Digital Awards',
    color: 'from-yellow-500/20 to-amber-500/10',
    border: 'border-yellow-500/30',
    badge: 'text-yellow-400',
  },
  {
    icon: '🥇',
    title: 'Excellence in Web Development',
    body: 'Awarded for outstanding website design and development services that transformed client digital presence.',
    year: '2022',
    org: 'Tech India Summit',
    color: 'from-indigo-500/20 to-blue-500/10',
    border: 'border-indigo-500/30',
    badge: 'text-indigo-400',
  },
  {
    icon: '🌟',
    title: 'Top Emerging Agency',
    body: 'Honored as one of the fastest-growing digital agencies in India, setting benchmarks in the industry.',
    year: '2022',
    org: 'Startup India Recognition',
    color: 'from-purple-500/20 to-pink-500/10',
    border: 'border-purple-500/30',
    badge: 'text-purple-400',
  },
  {
    icon: '🎖️',
    title: 'Best Digital Signature Partner',
    body: 'Recognized as the leading direct controller for eMudra, Capricorn, and other top DSC authorities.',
    year: '2023',
    org: 'Controller of Certifying Authorities',
    color: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/30',
    badge: 'text-emerald-400',
  },
  {
    icon: '🚀',
    title: 'Innovation in SEO & SEM',
    body: 'Awarded for pioneering data-driven SEO strategies that delivered measurable business impact for clients.',
    year: '2023',
    org: 'Digital Marketing Excellence',
    color: 'from-pink-500/20 to-rose-500/10',
    border: 'border-pink-500/30',
    badge: 'text-pink-400',
  },
  {
    icon: '💡',
    title: 'Client Satisfaction Award',
    body: 'Achieved a 98%+ client satisfaction rate, recognized by industry bodies for transparent and honest business practices.',
    year: '2024',
    org: 'Business Excellence Council',
    color: 'from-cyan-500/20 to-sky-500/10',
    border: 'border-cyan-500/30',
    badge: 'text-cyan-400',
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
    <section className="relative py-24 overflow-hidden bg-slate-950 border-t border-slate-900">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-500/5 rounded-full blur-3xl" />
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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold uppercase tracking-widest mb-4">
            🏆 Awards & Recognition
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Our{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400">
              Achievements
            </span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
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
              className={`relative group bg-gradient-to-br ${award.color} border ${award.border} rounded-2xl p-6 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden`}
            >
              {/* Decorative glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/[0.02] rounded-2xl" />

              <div className="flex items-start gap-4">
                <div className="text-4xl shrink-0">{award.icon}</div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base leading-snug">{award.title}</h3>
                  <p className={`text-xs font-semibold uppercase tracking-widest ${award.badge}`}>
                    {award.org} · {award.year}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-slate-400 text-sm leading-relaxed">{award.body}</p>

              {/* Bottom ribbon */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${award.color} opacity-60`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default AwardsRecognition
