import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ROUTES } from '../../../constants/routes'
import Button from '../../ui/Button'

/** Working team/office photos — picsum seed as last-resort fallback */
const teamPhoto = (unsplashPath, seed) => ({
  primary: `https://images.unsplash.com/${unsplashPath}?auto=format&fit=crop&w=700&h=700&q=80`,
  backup: `https://picsum.photos/seed/aim-${seed}/700/700`,
})

const PHOTOS = {
  collab: teamPhoto('photo-1522071820081-009f0129c71c', 'collab'),
  meeting: teamPhoto('photo-1517245386807-bb43a82c5c73', 'meeting'),
  planning: teamPhoto('photo-1552664730-d307ca884978', 'planning'),
  standup: teamPhoto('photo-1553877522-43269d4ea984', 'standup'),
  dev: teamPhoto('photo-1551434678-e076c223a692', 'dev'),
  workshop: teamPhoto('photo-1556761175-5973dc0f32e7', 'workshop'),
  office: teamPhoto('photo-1521737716868-97479f5de454', 'office'),
  huddle: teamPhoto('photo-1551837224-22afb7bbfcfe', 'huddle'),
}

const floatingImages = [
  { ...PHOTOS.collab, alt: 'Team collaboration', position: 'top-[2%] left-[0%] lg:left-[2%]', size: 'w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60', delay: 0, bounceClass: 'animate-bounce-gentle' },
  { ...PHOTOS.meeting, alt: 'Team meeting', position: 'top-[4%] right-[0%] lg:right-[2%]', size: 'w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64', delay: 0.25, bounceClass: 'animate-bounce-gentle-delayed' },
  { ...PHOTOS.standup, alt: 'Team standup', position: 'top-[36%] left-[0%]', size: 'w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56', delay: 0.5, bounceClass: 'animate-bounce-gentle' },
  { ...PHOTOS.dev, alt: 'Development team', position: 'top-[32%] right-[0%]', size: 'w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60', delay: 0.75, bounceClass: 'animate-bounce-gentle-delayed' },
  { ...PHOTOS.huddle, alt: 'Professional team meeting', position: 'bottom-[12%] left-[2%] lg:left-[5%]', size: 'w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60', delay: 0.1, bounceClass: 'animate-bounce-gentle-delayed' },
  { ...PHOTOS.workshop, alt: 'Team workshop', position: 'bottom-[8%] right-[2%] lg:right-[5%]', size: 'w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64', delay: 0.4, bounceClass: 'animate-bounce-gentle' },
  { ...PHOTOS.planning, alt: 'Strategy session', position: 'bottom-[1%] left-[16%] xl:left-[14%]', size: 'hidden md:block w-40 h-40 lg:w-48 lg:h-48 xl:w-52 xl:h-52', delay: 0.9, bounceClass: 'animate-bounce-gentle' },
  { ...PHOTOS.office, alt: 'Business team collaboration', position: 'bottom-[2%] right-[14%] xl:right-[12%]', size: 'hidden md:block w-40 h-40 lg:w-48 lg:h-48 xl:w-52 xl:h-52', delay: 0.65, bounceClass: 'animate-bounce-gentle-delayed' },
]

const BouncePhoto = ({ sources, alt, className }) => {
  const list = useMemo(() => sources.filter(Boolean), [sources])
  const [idx, setIdx] = useState(0)

  return (
    <img
      src={list[idx]}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
      onError={() => setIdx((i) => (i < list.length - 1 ? i + 1 : i))}
    />
  )
}

const bounceMotion = (delay, reduceMotion) =>
  reduceMotion
    ? {}
    : {
        animate: { y: [0, -32, 0] },
        transition: {
          duration: 2.4,
          repeat: Infinity,
          ease: [0.34, 1.45, 0.64, 1],
          delay,
        },
      }

const FloatingPhoto = ({ image, reduceMotion }) => (
  <motion.div
    className={`absolute ${image.position} ${image.size} z-10`}
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ type: 'spring', stiffness: 120, damping: 14, delay: image.delay * 0.15 }}
  >
    <motion.div className="relative w-full h-full" {...bounceMotion(image.delay, reduceMotion)}>
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-aim-gold/30 to-aim-purple/25 blur-2xl opacity-70 -z-10" aria-hidden />
      <div className="relative w-full h-full rounded-2xl md:rounded-3xl p-2 bg-aim-navy-light border-2 border-white/15 shadow-2xl shadow-aim-gold/20 ring-2 ring-aim-gold/15 overflow-hidden">
        <BouncePhoto
          sources={[image.primary, image.backup, PHOTOS.meeting.primary]}
          alt={image.alt}
          className="w-full h-full object-cover rounded-xl md:rounded-2xl min-h-[80px] bg-slate-100"
        />
      </div>
    </motion.div>
  </motion.div>
)

const AboutCompanySection = () => {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative py-16 md:py-28 overflow-hidden section-tinted bg-grid-pattern">
      <div className="ambient-glows" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-aim-gold/10 via-transparent to-aim-purple/10 pointer-events-none" aria-hidden />

      <div className="relative container-custom max-w-[90rem] z-10">
        <div className="flex lg:hidden gap-4 mb-10 overflow-x-auto pb-2 px-1 snap-x">
          {floatingImages.slice(0, 5).map((item, i) => (
            <motion.div
              key={item.alt}
              className={`snap-center shrink-0 w-32 h-32 rounded-2xl overflow-hidden border-2 border-white shadow-xl ${!reduceMotion ? (i % 2 ? 'animate-bounce-gentle-delayed' : 'animate-bounce-gentle') : ''}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <BouncePhoto sources={[item.primary, item.backup]} alt={item.alt} className="w-full h-full object-cover bg-slate-100" />
            </motion.div>
          ))}
        </div>

        <div className="relative min-h-[680px] md:min-h-[900px] lg:min-h-[960px] flex items-center justify-center px-2">
          {floatingImages.map((item) => (
            <div key={item.alt} className="hidden lg:contents">
              <FloatingPhoto image={item} reduceMotion={reduceMotion} />
            </div>
          ))}
          <div className="hidden md:block lg:hidden absolute inset-0 pointer-events-none">
            {floatingImages.slice(0, 6).map((item) => (
              <FloatingPhoto key={`md-${item.alt}`} image={item} reduceMotion={reduceMotion} />
            ))}
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(94%,38rem)] aspect-square max-h-[85%] rounded-full bg-aim-gold/5 blur-2xl shadow-[0_0_80px_rgba(245,166,35,0.12)] pointer-events-none z-0" aria-hidden />

          <motion.article
            className="relative z-20 w-full max-w-2xl mx-auto text-center px-4 sm:px-8 py-8 rounded-3xl bg-aim-navy-light/80 backdrop-blur-sm border border-white/15 shadow-lg"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="space-y-5 md:space-y-6">
              <div className="badge-pill mx-auto w-fit">
                <span className="badge-pill-dot-red" />
                About Our Company
              </div>
              <h2 className="heading-display text-3xl sm:text-4xl md:text-[2.75rem]">
                Where Expertise Meets <span className="text-gradient">Innovation</span>
              </h2>
              <div className="divider-brand" />
              <div className="space-y-4 copy-on-dark text-sm sm:text-base text-left sm:text-center max-h-[42vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
                <p>At AIM Digitalise Pvt. Ltd., we take immense pride in being one of India&apos;s most trusted performance digital marketing agencies, where expertise meets innovation.</p>
                <p>We specialize in connecting businesses with their potential clients through digital marketing, SEO, web development, and content creation.</p>
                <p>Our mission is to build an inclusive digital ecosystem for India — empowering brands with data-driven strategies and measurable growth.</p>
              </div>
              <Link to={ROUTES.ABOUT}>
                <Button size="lg" className="btn-primary font-bold">
                  Learn More About Us
                  <svg className="w-5 h-5 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </Link>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  )
}

export default AboutCompanySection
