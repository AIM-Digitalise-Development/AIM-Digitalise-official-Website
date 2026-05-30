import { motion } from 'framer-motion'

const specialties = [
  {
    title: 'Cutting-edge Technology',
    desc: 'We use the latest cutting-edge technology for web design to favor the speed and compatibility to all the device.',
    color: 'from-blue-500/10 to-indigo-500/10',
    borderColor: 'group-hover:border-blue-500/50',
    iconColor: 'text-blue-400',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    )
  },
  {
    title: 'Quality',
    desc: 'We ensure the quality standards of our service.',
    color: 'from-emerald-500/10 to-teal-500/10',
    borderColor: 'group-hover:border-emerald-500/50',
    iconColor: 'text-emerald-400',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )
  },
  {
    title: 'Custom Web Development',
    desc: 'Our team help the client develop a custom web develop solution aimed at enhancing consumer advocacy.',
    color: 'from-purple-500/10 to-pink-500/10',
    borderColor: 'group-hover:border-purple-500/50',
    iconColor: 'text-purple-400',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    title: 'Transparency',
    desc: 'Transparent, Affordable, Flexible and Proactive are the keywords of our success.',
    color: 'from-amber-500/10 to-orange-500/10',
    borderColor: 'group-hover:border-amber-500/50',
    iconColor: 'text-amber-400',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )
  },
  {
    title: 'Creative Experts',
    desc: 'Our team of creative experts is always at the fore front of the ever-changing web.',
    color: 'from-pink-500/10 to-rose-500/10',
    borderColor: 'group-hover:border-pink-500/50',
    iconColor: 'text-pink-400',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    )
  },
  {
    title: 'Grow Your Business',
    desc: 'We are passionate about seeing business grow by applying the latest and most effective web design and digital strategies.',
    color: 'from-cyan-500/10 to-blue-500/10',
    borderColor: 'group-hover:border-cyan-500/50',
    iconColor: 'text-cyan-400',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  },
  {
    title: 'Prime Focus',
    desc: 'Considering clients as the prime focus, we feel them from their perspective to make sure our efforts engage them.',
    color: 'from-rose-500/10 to-red-500/10',
    borderColor: 'group-hover:border-rose-500/50',
    iconColor: 'text-rose-400',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
      </svg>
    )
  },
  {
    title: 'End-to-end Solution',
    desc: 'The end-to-end solution we engineer accelerates efficiency and fuel growth for our clients.',
    color: 'from-violet-500/10 to-fuchsia-500/10',
    borderColor: 'group-hover:border-violet-500/50',
    iconColor: 'text-violet-400',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    )
  },
  {
    title: 'Carefully Inferences',
    desc: 'We don’t assume. We arrive at solutions through careful inferences.',
    color: 'from-emerald-500/10 to-teal-500/10',
    borderColor: 'group-hover:border-emerald-500/50',
    iconColor: 'text-emerald-400',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  }
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
}

const SpecialtiesSection = () => {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden border-t border-slate-900">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Specialties &amp; Expertise
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Why Partner With AIM Digitalise?
          </h2>
          <p className="text-lg text-slate-400">
            We offer robust digital standards, strategic insights, and customized development to accelerate your company's growth.
          </p>
        </div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {specialties.map((item, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`group relative p-6 rounded-2xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-sm transition-all duration-300 hover:bg-slate-900/50 hover:shadow-2xl hover:shadow-indigo-500/5 ${item.borderColor}`}
            >
              {/* Top ambient glow on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

              <div className="relative z-10 flex flex-col h-full space-y-4">
                {/* Icon wrapper */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-slate-800/50 border border-slate-700/50 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-colors duration-300 ${item.iconColor}`}>
                  {item.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors duration-300">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed flex-grow">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default SpecialtiesSection
