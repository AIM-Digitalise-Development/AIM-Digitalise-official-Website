import { motion } from 'framer-motion'
import Button from '../../ui/Button'
import useUIStore from '../../../store/uiStore'

const CTASection = () => {
  const openAppointmentModal = useUIStore((state) => state.openAppointmentModal)

  return (
    <section className="py-24 section-muted relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/6 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="cta-panel p-12 md:p-16"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6 pt-2">
            <div className="badge-pill mx-auto w-fit">
              <span className="badge-pill-dot" />
              Get Started
            </div>
            <h2 className="heading-display">
              Ready to Accelerate Your{' '}
              <span className="text-gradient">Technology Roadmap?</span>
            </h2>
            <div className="divider-brand" />
            <p className="text-lg copy-on-dark-muted">
              Partner with an elite software engineering and architecture consultancy. Let&apos;s build something scalable together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                variant="primary"
                size="lg"
                className="btn-primary cursor-pointer"
                onClick={openAppointmentModal}
              >
                Book a Strategy Call
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="btn-outline-brand"
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
