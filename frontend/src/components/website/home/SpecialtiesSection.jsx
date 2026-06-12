import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ROUTES } from '../../../constants/routes'
import bkImage from '../../../assets/images/bk.jpeg'

const stats = [
  { value: '500+', label: 'Clients served', accent: 'gold' },
  { value: '9+', label: 'Core strengths', accent: 'purple' },
  { value: '98%', label: 'Client satisfaction', accent: 'gold' },
]

const specialties = [
  {
    num: '01',
    title: 'AIM-Digitalise: A Digital-First Partner',
    desc: 'Your digital future starts now. AIM-Digitalise is a full-spectrum IT partner creating web, mobile, and digital experiences that drive real business results. From strategy to launch and beyond, we help you grow with technology that works as hard as you do.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    ),          
    featured: true,
  },
  {
    num: '02',
    title: 'Premium Quality',
    desc: 'Rigorous standards on every deliverable — no compromises.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
  {
    num: '03',
    title: 'Custom Web Development',
    desc: 'Tailored solutions that turn visitors into loyal customers.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    ),
  },
  {
    num: '04',
    title: 'Transparency',
    desc: 'Clear pricing, honest timelines, and proactive communication.',
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    ),
  },
  {
    num: '05',
    title: 'Creative Experts',
    desc: 'Design and content teams ahead of every digital trend.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    ),
  },
  {
    num: '06',
    title: 'Grow Your Business',
    desc: 'SEO, ads, and funnels engineered for scalable revenue.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    ),
  },

]

const BouncingIcon = ({ children, delay, reduceMotion, isPurple }) => (
  <motion.div
    className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border shadow-lg bg-aim-navy-light/80 ${
      isPurple
        ? 'border-aim-purple/50 text-white shadow-aim-purple/15'
        : 'border-aim-gold/50 text-aim-text-accent shadow-aim-gold/15'
    }`}
    {...(reduceMotion
      ? {}
      : {
          animate: { y: [0, -14, 0] },
          transition: {
            duration: 2.2,
            repeat: Infinity,
            ease: [0.34, 1.56, 0.64, 1],
            delay,
          },
        })}
    whileHover={{ scale: 1.08, rotate: 3 }}
  >
    <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {children}
    </svg>
  </motion.div>
)

const SpecialtyCard = ({ item, index, reduceMotion }) => {
  const isPurple = index % 2 === 1
  const isFeatured = item.featured

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 90 }}
      className={`group relative overflow-hidden rounded-3xl border card-elevated transition-shadow duration-300 ${
        isFeatured
          ? 'md:col-span-2 md:row-span-2 max-h-[320px] md:max-h-[380px] border-aim-gold/30 shadow-xl shadow-aim-gold/10 bg-[#050f24] flex items-center justify-center'
          : 'p-6 border-white/10 hover:shadow-xl hover:shadow-aim-gold/10'
      } ${isPurple && !isFeatured ? 'hover:border-aim-purple/40' : 'hover:border-aim-gold/40'}`}
    >
      {isFeatured ? (
        <img
          src={bkImage}
          alt="AIM Digitalise"
          className="w-full h-full object-fill block"
        />
      ) : (
        <>
          <div
            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
              isPurple ? 'from-aim-purple via-aim-purple-light to-transparent' : 'from-aim-gold via-aim-gold-light to-transparent'
            } opacity-80`}
          />

          <div
            className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl pointer-events-none ${
              isPurple ? 'bg-aim-purple/15' : 'bg-aim-gold/15'
            }`}
          />

          <div className="relative flex flex-col h-full gap-4">
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-black tracking-widest text-on-navy-muted">
                {item.num}
              </span>
              <BouncingIcon delay={index * 0.15} reduceMotion={reduceMotion} isPurple={isPurple}>
                {item.icon}
              </BouncingIcon>
            </div>

            <div className="flex-grow">
              <h3
                className="font-bold text-white mb-2 group-hover:text-aim-highlight transition-colors text-lg sm:text-xl"
              >
                {item.title}
              </h3>
              <p className="text-on-navy-muted leading-relaxed text-sm">
                {item.desc}
              </p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}

const SpecialtiesSection = () => {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative py-20 md:py-28 overflow-hidden section-muted border-t border-white/10">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-aim-gold/40 to-transparent" />
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-aim-gold/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-aim-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container-custom z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-14 md:mb-20">
          <motion.div
            className="lg:col-span-5 space-y-6"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="badge-pill w-fit">
              <span className="badge-pill-dot" />
              Specialties &amp; Expertise
            </div>
            <h2 className="heading-display text-left text-3xl sm:text-4xl lg:text-5xl leading-tight">
              Why Partner With{' '}
              <span className="text-gradient">AIM Digitalise?</span>
            </h2>
            <div className="divider-brand !mx-0 !max-w-[12rem]" />
            <p className="copy-on-dark-muted text-base">
              We combine enterprise discipline with agency agility — robust digital standards, sharp strategy, and
              hands-on development that accelerates your growth.
            </p>
          </motion.div>

          <motion.div
            className="lg:col-span-7 flex flex-col gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className={`relative text-center p-5 sm:p-6 rounded-2xl border-2 card-elevated overflow-hidden ${
                    stat.accent === 'purple'
                      ? 'border-aim-purple/30 shadow-lg shadow-aim-purple/15'
                      : 'border-aim-gold/30 shadow-lg shadow-aim-gold/15'
                  } ${!reduceMotion ? (i === 1 ? 'animate-bounce-gentle-delayed' : 'animate-bounce-gentle') : ''}`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <p className="text-2xl sm:text-3xl font-black text-white">
                    {stat.value}
                  </p>
                  <p className="text-[11px] sm:text-xs font-semibold text-aim-copy-muted uppercase tracking-wider mt-1">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Highlights in the gap next to the main details */}
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-aim-navy-light/40 mt-10">
              <span className="text-[10px] font-black text-aim-gold uppercase tracking-widest block mr-1">Core Benefits:</span>
              {[
                { word: 'RECURRING INCOME', color: 'from-aim-gold to-aim-gold-light text-aim-navy' },
                { word: 'ENTERTENMENT', color: 'from-aim-purple to-aim-purple/80 text-white border border-aim-purple/20' },
                { word: 'RECOGNISATION', color: 'from-aim-gold to-aim-gold-light text-aim-navy' },
              ].map((item, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black tracking-wider shadow-md bg-gradient-to-r ${item.color}`}
                >
                  {item.word}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {specialties.map((item, index) => (
            <SpecialtyCard key={item.num} item={item} index={index} reduceMotion={reduceMotion} />
          ))}
        </div>

        <motion.div
          className="mt-14 md:mt-16 cta-panel p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-left"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative z-10 space-y-2 max-w-xl">
            <p className="text-sm font-bold uppercase tracking-wider text-aim-highlight">Ready to scale?</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              Let&apos;s build your next chapter together.
            </h3>
            <p className="copy-on-dark-muted text-sm">
              Talk to our team about web, marketing, ERP, or digital signature solutions tailored to your industry.
            </p>
          </div>
          <Link
            to={ROUTES.PARTNER.REGISTER}
            className="relative z-10 shrink-0 btn-primary px-8 py-3.5 text-center font-black uppercase tracking-wider text-xs shadow-lg shadow-aim-gold/25 hover:shadow-aim-gold/45 transition-all duration-200"
          >
            Register Now
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default SpecialtiesSection
