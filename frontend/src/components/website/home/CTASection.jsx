import { motion } from 'framer-motion'
import Button from '../../ui/Button'

const CTASection = () => {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background glow in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800/80 rounded-3xl p-12 md:p-16 text-center shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {/* Subtle grid pattern inside card */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Ready to Accelerate Your{' '}
              <span className="text-gradient">Technology Roadmap?</span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Partner with an elite software engineering and architecture consultancy. Let's build something scalable together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                variant="primary"
                size="lg"
                className="btn-primary"
              >
                Book a Strategy Call
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-700 text-slate-300 hover:bg-slate-800/30 hover:text-white cursor-pointer"
              >
                Explore Case Studies
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection