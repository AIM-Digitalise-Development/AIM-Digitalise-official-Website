import { motion } from 'framer-motion'

const values = [
  {
    icon: '🤝',
    title: 'Honesty & Transparency',
    desc: 'We believe in doing business fairly and transparently. We keep our word and build relationships built on trust.',
    color: 'from-indigo-500/10 to-indigo-500/5',
    border: 'border-indigo-500/25',
    accent: 'text-indigo-400',
  },
  {
    icon: '🚀',
    title: 'Innovation First',
    desc: 'We bring the latest and most advanced digital technologies to our clients to keep their brands ahead of the curve.',
    color: 'from-purple-500/10 to-purple-500/5',
    border: 'border-purple-500/25',
    accent: 'text-purple-400',
  },
  {
    icon: '💎',
    title: 'Premium Quality',
    desc: 'Providing our clients with premium-quality service is the foundation of our company — no compromises.',
    color: 'from-pink-500/10 to-pink-500/5',
    border: 'border-pink-500/25',
    accent: 'text-pink-400',
  },
  {
    icon: '🌍',
    title: 'Client-Centric',
    desc: 'We treat every client\'s business like our own, developing strategic and personalized ideas to make their brand stand out.',
    color: 'from-emerald-500/10 to-emerald-500/5',
    border: 'border-emerald-500/25',
    accent: 'text-emerald-400',
  },
  {
    icon: '📈',
    title: 'Result Driven',
    desc: 'We are laser-focused on delivering measurable results — every strategy is backed by data and driven by performance.',
    color: 'from-yellow-500/10 to-yellow-500/5',
    border: 'border-yellow-500/25',
    accent: 'text-yellow-400',
  },
  {
    icon: '🔒',
    title: 'Integrity',
    desc: 'We act with sincerity and integrity in all that we do, building long-term partnerships that go beyond transactions.',
    color: 'from-cyan-500/10 to-cyan-500/5',
    border: 'border-cyan-500/25',
    accent: 'text-cyan-400',
  },
]

const ValuesSection = () => {
  return (
    <section className="relative py-24 overflow-hidden bg-slate-950 border-t border-slate-900">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container-custom z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold uppercase tracking-widest mb-4">
            What We Stand For
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Our Core{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
              Values
            </span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              className={`group relative bg-gradient-to-br ${v.color} border ${v.border} rounded-2xl p-6 hover:shadow-xl transition-all duration-300`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <div className="text-3xl mb-3">{v.icon}</div>
              <h3 className={`font-bold text-white text-base mb-2`}>{v.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ValuesSection