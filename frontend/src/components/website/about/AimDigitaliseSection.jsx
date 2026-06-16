import { useState } from 'react'
import { motion } from 'framer-motion'

import abtImg from '../../../assets/images/abt_img.jpg'
import portfolioPdf from '../../../assets/doc/AIM Digitalise Portfolio-1 (1).pdf'

const AimDigitaliseSection = () => {
  const [imgSrc, setImgSrc] = useState(abtImg)

  const stats = [
    { value: '5+', label: 'Years of Experience' },
    { value: '500+', label: 'Clients Served' },
    { value: '50+', label: 'Team Experts' },
    { value: '1000+', label: 'Projects Delivered' },
  ]

  return (
    <section className="relative py-24 overflow-hidden section-white bg-mesh-brand bg-grid-pattern">
      <div className="ambient-glows" aria-hidden />

      <div className="relative container-custom z-10">
        <motion.div
          className="text-center mb-16 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="badge-pill mx-auto w-fit">
            <span className="badge-pill-dot" />
            Who We Are
          </div>
          <h1 className="heading-display text-4xl sm:text-5xl">
            About <span className="text-gradient">AIM Digitalise</span>
          </h1>
          <div className="divider-brand" />
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-14 items-start">
          {/* ── Left Column: Image + Download ── */}
          <motion.div
            className="lg:col-span-5 flex flex-col gap-5"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Glow backing */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-aim-gold/10 to-aim-purple/10 rounded-3xl blur-2xl opacity-50 rotate-2" />
              
              {/* Glass Image Frame */}
              <div className="relative card-elevated rounded-3xl p-3 overflow-hidden group">
                <img
                  src={imgSrc}
                  onError={() =>
                    setImgSrc(
                      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
                    )
                  }
                  alt="AIM Digitalise Team"
                  className="rounded-2xl w-full h-[420px] lg:h-[500px] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 justify-center">
                  <span className="text-xs font-semibold text-slate-300 tracking-wider">
                    AIM Digitalise Pvt. Ltd.
                  </span>
                </div>
              </div>
            </div>

            {/* Download Portfolio Button */}
            <motion.a
              href={portfolioPdf}
              download="AIM_Digitalise_Portfolio.pdf"
              className="group flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-aim-gold to-aim-gold-dark hover:from-aim-gold-dark hover:to-aim-gold text-white font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(245,166,35,0.2)] hover:shadow-[0_0_40px_rgba(245,166,35,0.35)] transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Our Portfolio
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.a>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="glass-card glass-card-hover p-4 text-center rounded-2xl"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                >
                  <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-aim-gold to-aim-purple">
                    {stat.value}
                  </div>
                  <div className="text-aim-copy-muted text-xs mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Right Column: Company Description ── */}
          <motion.div
            className="lg:col-span-7 space-y-5 text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="space-y-4 text-aim-copy-muted text-sm leading-relaxed">
              <p className="text-base leading-loose text-aim-copy-muted">
                <span className="font-bold text-white">AIM Digitalise Pvt. Ltd.</span>, comprising experts who are
                perfectly aligned with your business goals, proudly represents one of the largest performance digital
                marketing agencies in India. With a relentless focus on innovation, we bring the latest and most
                advanced marketing technologies to our clients, ensuring their brands stay ahead in the ever-evolving
                digital landscape.
              </p>

              <p className="leading-loose text-aim-copy-muted">
                Our team at AIM Digitalise Pvt. Ltd., the best digital solution company in India, works for clients to
                create and implement sustainable business solutions to increase their company performance and value.
                Founded in the year <span className="text-aim-gold font-semibold">2020</span>, we're a young,
                energetic team and we strive to give our clients the best. We treat clients business like our own and
                we develop strategic and innovative ideas to make clients' brands stand out from the rest.
              </p>

              <p className="leading-loose text-aim-copy-muted">
                We thrive to build a nation where digitalization can help to raise the idea from concept to execution.
                We make every vision into reality. We are passionate and dedicated on our work and we treat each
                project individually where our team makes sure to offer unique, personalized solution. We are determined
                to extend a complete digital platform with support and solutions throughout our country India.
              </p>

              {/* Services Highlight */}
              <div className="card-elevated rounded-2xl p-5 mt-2">
                <p className="text-aim-copy-muted text-sm leading-loose">
                  AIM Digitalise Pvt. Ltd. offers services like{' '}
                  <span className="text-white font-semibold">Website Design & Development</span>,{' '}
                  <span className="text-white font-semibold">Software Development</span>,{' '}
                  <span className="text-white font-semibold">Mobile App Development</span>,{' '}
                  <span className="text-white font-semibold">Graphics Design</span>,{' '}
                  <span className="text-white font-semibold">Digital Signature (DSC/DC)</span> — where we are the leader
                  as direct controller of <em>eMudra, ID Sign, Sify, V-Sign, PantaSign</em> and{' '}
                  <em>Capricorn</em>. Also{' '}
                  <span className="text-white font-semibold">Digital Marketing</span> — SEO, SEM, PPC, SMM and more.
                </p>
              </div>

              {/* <p className="leading-loose text-aim-copy-muted">
                We are in belief that we together with our clients can reach the next level of success and business
                growth. We believe in doing business with honesty, integrity, and sincerity and provide clients with
                the best of digital services to optimize their business needs and objectives. Providing our clients
                with premium quality service is the foundation of our company. We have a worldwide client base ranging
                from India to all across. We believe in keeping our word and doing business fairly and transparently —
                that is the very vital point that we claim a reasonably lower price in exchange for our service.
              </p> */}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['Performance Marketing', 'Web Development', 'Digital Signature', 'SEO & SEM', 'SMM', 'Mobile Apps', 'Graphics Design', 'PPC'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-aim-gold/10 border border-aim-gold/20 text-aim-gold hover:bg-aim-gold/20 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AimDigitaliseSection
