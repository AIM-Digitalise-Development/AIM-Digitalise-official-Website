import { motion } from 'framer-motion'

const pillars = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    label: 'Integrity',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: 'Innovation',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Collaboration',
    color: 'text-red-600 bg-red-50 border-red-200',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    label: 'Impact',
    color: 'text-red-600 bg-red-50 border-red-200',
  },
]

const MissionVision = () => {
  return (
    <section className="relative py-24 overflow-hidden section-muted">
      <div className="ambient-glows" aria-hidden />
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[250px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container-custom z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold uppercase tracking-widest mb-4">
            Our Purpose
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
            Mission &{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-blue-500 to-red-600">
              Vision
            </span>
          </h2>
        </motion.div>

        {/* Mission + Vision Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-14">
          {/* Mission */}
          <motion.div
            className="relative group rounded-3xl p-8 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50/10 border border-slate-200 shadow-xl hover:shadow-blue-500/5 transition-shadow duration-300"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -3 }}
          >
            {/* Corner deco */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-500/[0.03] rounded-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">Our Mission</span>
                  <h3 className="text-xl font-black text-slate-900">What Drives Us</h3>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our mission at AIM Digitalise Pvt. Ltd. is to empower businesses across India and the globe by delivering
                cutting-edge digital solutions that drive real, measurable growth. We are committed to creating a complete
                and inclusive digital ecosystem — raising ideas from concept to execution — with honesty, integrity, and
                sincerity at the heart of every service we deliver.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed mt-3">
                We treat every client's business as our own, combining strategic thinking, innovation, and consistency to
                help brands stand out in the ever-evolving digital landscape. Our mission is to ensure every business,
                regardless of size, has access to premium digital services at a fair and transparent price.
              </p>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            className="relative group rounded-3xl p-8 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-red-50/10 border border-slate-200 shadow-xl hover:shadow-red-500/5 transition-shadow duration-300"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -3 }}
          >
            {/* Corner deco */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-red-500/[0.03] rounded-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <span className="text-red-600 text-xs font-bold uppercase tracking-widest">Our Vision</span>
                  <h3 className="text-xl font-black text-slate-900">Where We're Headed</h3>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our vision is to build a digitally empowered India where every business — from startups to enterprises —
                can harness the full power of technology to reach the next level of success. We envision a future where
                digitalization bridges the gap between ideas and execution, making every vision a reality.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed mt-3">
                We aspire to be the most trusted digital partner for businesses worldwide, consistently setting new benchmarks
                in performance marketing, technology solutions, and customer-centric service. Together with our clients, we
                aim to shape a future where businesses thrive and India unleashes its boundless digital potential.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Core Pillars */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {pillars.map((p, i) => (
            <motion.div
              key={p.label}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${p.color} text-center`}
              whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
            >
              <div className={`p-2.5 rounded-xl border ${p.color}`}>{p.icon}</div>
              <span className="font-bold text-slate-800 text-sm">{p.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default MissionVision