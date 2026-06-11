import { motion } from 'framer-motion'

const TestimonialsSection = () => {
  return (
    <section className="py-24 section-white border-b border-aim-border relative overflow-hidden">
      <div className="ambient-glows" aria-hidden />

      <div className="container-custom relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="badge-pill mx-auto w-fit">
            <span className="badge-pill-dot" />
            Google Reviews
          </div>
          <h2 className="heading-display">
            Loved by Our Clients
          </h2>
          <div className="divider-brand" />
          <p className="text-lg copy-on-dark-muted">
            Read verified customer experiences and feedback pulled live from our Google Maps listing.
          </p>
        </div>

        {/* Live Google Reviews Widget Container */}
        <motion.div 
          className="w-full rounded-3xl border border-white/10 bg-aim-navy-card/40 backdrop-blur-sm p-4 shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <iframe 
            src="https://widgets.sociablekit.com/google-reviews/iframe/25412616" 
            frameBorder="0" 
            width="100%" 
            height="500"
            title="Google Reviews Live Feed"
            className="w-full rounded-2xl bg-transparent"
          />
        </motion.div>

      </div>
    </section>
  )
}

export default TestimonialsSection