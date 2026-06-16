import { motion } from 'framer-motion'

const values = [
  {
    icon: '🤝',
    title: 'Honesty & Transparency',
    desc: 'We believe in doing business fairly and transparently. We keep our word and build relationships built on trust.',
    color: 'from-blue-50/70 via-blue-50/20 to-transparent',
    border: 'border-blue-200',
    accent: 'text-blue-600',
  },
  {
    icon: '🚀',
    title: 'Innovation First',
    desc: 'We bring the latest and most advanced digital technologies to our clients to keep their brands ahead of the curve.',
    color: 'from-blue-50/70 via-blue-50/20 to-transparent',
    border: 'border-blue-200',
    accent: 'text-blue-600',
  },
  {
    icon: '💎',
    title: 'RECURRING INCOME',
    desc: 'We create new income streams for our clients through the services we offer.',
    color: 'from-red-50/70 via-red-50/20 to-transparent',
    border: 'border-red-200',
    accent: 'text-red-600',
  },
  {
    icon: '🌍',
    title: 'Client-Centric',
    desc: 'We treat every client\'s business like our own, developing strategic and personalized ideas to make their brand stand out.',
    color: 'from-blue-50/70 via-blue-50/20 to-transparent',
    border: 'border-blue-200',
    accent: 'text-blue-600',
  },
  {
    icon: '📈',
    title: 'Result Driven',
    desc: 'We are laser-focused on delivering measurable results — every strategy is backed by data and driven by performance.',
    color: 'from-red-50/70 via-red-50/20 to-transparent',
    border: 'border-red-200',
    accent: 'text-red-600',
  },
  {
    icon: '🔒',
    title: 'Integrity',
    desc: 'We act with sincerity and integrity in all that we do, building long-term partnerships that go beyond transactions.',
    color: 'from-blue-50/70 via-blue-50/20 to-transparent',
    border: 'border-blue-200',
    accent: 'text-blue-600',
  },
]

const ValuesSection = () => {
  return (
    <section className="relative py-24 overflow-hidden section-white">
      <div className="ambient-glows" aria-hidden />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative container-custom z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="badge-pill mx-auto w-fit mb-4">
            <span className="badge-pill-dot-red" />
            What We Stand For
          </div>
          <h2 className="heading-display">
            Our Core <span className="text-gradient">Values</span>
          </h2>
          <div className="divider-brand" />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              className="group relative card-elevated rounded-2xl p-6 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <div className="text-3xl mb-3">{v.icon}</div>
              <h3 className="font-bold text-white text-base mb-2">{v.title}</h3>
              <p className="text-aim-copy-muted text-sm leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ValuesSection