import { motion } from 'framer-motion'
import Card from '../../ui/Card'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CTO, TechStart Solutions',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
    content: 'AIM Digitalise has been instrumental in helping us streamline our business operations and improve our bottom line. Their team of experts is always available to help us with any questions or concerns we may have.',
    rating: 5,
    logo: 'TechStart'
  },
  {
    name: 'Michael Chen',
    role: 'VP of Engineering, InnovateCo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    content: 'The engineering caliber at AIM is unmatched. They integrated an automated LLM agents system into our customer helpdesk that resolved 42% of support tickets automatically on day one. They are now our preferred dev partner.',
    rating: 5,
    logo: 'InnovateCo'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Founder & CEO, CreativeLab',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
    content: 'We hired AIM to audit our AWS security infrastructure and prepare us for SOC2 compliance. Their cloud team resolved over 40 security issues within weeks, allowing us to pass our audit with zero non-conformities.',
    rating: 5,
    logo: 'CreativeLab'
  }
]

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

const TestimonialsSection = () => {
  return (
    <section className="py-24 section-white border-b border-slate-200/80 relative">
      <div className="ambient-glows" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="badge-pill">
            <span className="badge-pill-dot-red" />
            Testimonials
          </div>
          <h2 className="heading-display">
            Trusted by Engineering Leaders
          </h2>
          <div className="divider-brand" />
          <p className="text-lg copy-on-dark-muted">
            Hear from the technology directors, founders, and product executives who partner with AIM.
          </p>
        </div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8 "
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <Card padding="lg" className="h-full relative bg-aim-navy-light border-slate-200 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Rating Stars */}
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>

                  {/* Feedback text */}
                  <p className="text-aim-copy text-sm leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                </div>

                {/* Profile info */}
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-md"
                  />
                  <div className="text-left">
                    <p className="font-bold text-white text-sm">{testimonial.name}</p>
                    <p className="text-xs text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default TestimonialsSection