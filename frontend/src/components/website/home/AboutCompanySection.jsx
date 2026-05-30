import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '../../../constants/routes'
import Button from '../../ui/Button'

const AboutCompanySection = () => {
  // Primary: online fallback — replace with '/src/assets/images/team_group_photo.png' once copied locally
  const [imageSrc, setImageSrc] = useState('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80')

  const handleImageError = () => {
    setImageSrc('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80')
  }

  return (
    <section className="relative py-24 overflow-hidden bg-slate-950 bg-grid-pattern border-t border-slate-900">
      {/* Ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Team Group Photo */}
          <motion.div 
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Glow backing */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-40 transform rotate-2"></div>
            
            {/* Image Glass Frame */}
            <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-3 shadow-2xl overflow-hidden group">
              <img
                src={imageSrc}
                onError={handleImageError}
                alt="AIM Digitalise Team"
                className="rounded-2xl w-full h-[550px] lg:h-[650px] object-cover shadow-inner transition-transform duration-750 group-hover:scale-[1.03]"
                loading="lazy"
                width="600"
                height="400"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 justify-center">
                <span className="text-xs font-semibold text-slate-300 tracking-wider">AIM Digitalise Pvt. Ltd. Team</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Copy Details */}
          <motion.div 
            className="lg:col-span-7 space-y-6 text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                About Our Company
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                Where Expertise Meets <span className="text-gradient">Innovation</span>
              </h2>
            </div>

            {/* Paragraphs */}
            <div className="space-y-4 text-slate-400 text-sm leading-relaxed max-w-3xl">
              <p>
                At AIM Digitalise Pvt. Ltd., we take immense pride in being one of India’s most trusted performance digital marketing agencies, where expertise meets innovation. Our team of highly skilled professionals is ready to curve your business ideas into a reality that will drive growth and success. As a leading digital marketing agency, we are committed to staying ahead of the market trends, bringing the latest and greatest marketing technologies to our clients, and changing.
              </p>
              <p>
                In the dynamic and vast world of digital marketing, having an exceptional product or service is the most important step towards achieving something. A product with the right traffic, consistently flowing in, can elevate a business to new heights of success. At AIM Digitalise Pvt. Ltd., we specialize in connecting businesses with their potential clients, ensuring they are getting the right audiences.
              </p>
              <p>
                Our mission goes beyond individual success stories. We aim to create a complete and inclusive digital ecosystem for India, offering a variety of digital solutions tailored to meet the unique needs of businesses across various industries. Whether it’s digital marketing, social media marketing, search engine optimization, Website Development, or innovative content creation, our team is equipped to handle it all.
              </p>
              <p>
                As a digital marketing company that leads with passion and purpose, we don’t just help businesses grow—we empower them to compete in the market. By leveraging data-driven strategies, advanced analytics, and a deep understanding of market trends.
              </p>
              <p>
                Choose AIM Digitalise Pvt. Ltd. as your trusted partner and embark on a journey to redefine your digital presence. Together, we will shape a future where businesses thrive with unmatched success, audiences connect with brands on a deeper level, and India unleashes its boundless digital potential, setting new benchmarks in the global digital landscape.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link to={ROUTES.ABOUT}>
                <Button size="lg" className="btn-primary cursor-pointer font-bold">
                  <span>Learn More About Us</span>
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default AboutCompanySection
