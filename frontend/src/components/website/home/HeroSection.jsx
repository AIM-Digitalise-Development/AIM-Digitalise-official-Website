import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../../ui/Button'
import Input from '../../ui/Input'
import nexgnVideo from '../../../assets/videos/nexgn.mp4'

const HeroSection = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }
    setError('')
    setIsSubmitted(true)
    console.log('Submitting email for discovery consultation:', email)
  }

  return (
    <section className="relative overflow-hidden pt-14 pb-20 md:pt-18 md:pb-28 bg-mesh-brand bg-grid-pattern section-white border-b border-white/10">
      <div className="ambient-glows" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            className="lg:col-span-7 space-y-8 text-left"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              <div className="badge-pill">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aim-gold opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-aim-gold to-aim-purple" />
                </span>
                AIM Digitalise PVT. LTD.
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
              Digital Nation तो{' '}
                <span className="text-gradient">
                  Developed Nation
                </span>
              </h1>
              <p className="text-lg copy-on-dark-muted max-w-2xl">
                We design, engineer, and scale custom software systems, resilient cloud infrastructures, 
                and intelligent AI-driven applications for market leaders.
              </p>
            </div>

            {/* CTA / Contact Intake */}
            <div className="max-w-md">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="Enter your business email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={error}
                        className="bg-aim-navy-light/80 border-white/15 text-white placeholder-slate-400 focus:border-aim-gold focus:ring-1 focus:ring-aim-gold h-12"
                        icon={
                          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        }
                      />
                    </div>
                    <Button type="submit" size="lg" className="btn-primary h-12">
                      <span>Get Free Consultation</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </div>
                  <p className="text-xs text-aim-copy-muted">
                    Get an engineering-led architecture audit. No pushy sales calls.
                  </p>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-aim-gold/10 border border-aim-gold/30 text-aim-gold"
                >
                  <p className="font-semibold mb-1">🎉 Thank you for reaching out!</p>
                  <p className="text-sm text-on-navy-muted">Our chief solutions architect will email you within 24 hours to schedule your strategy call.</p>
                </motion.div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80',
                    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=64&h=64&q=80',
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=64&h=64&q=80'
                  ].map((url, i) => (
                    <img 
                      key={i} 
                      src={url} 
                      alt="Consultant Avatar"
                      className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-md"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-bold text-white">Trust Score 4.9/5</p>
                  <p className="text-on-navy-muted text-xs">Based on 150+ Enterprise projects</p>
                </div>
              </div>
              
              <div className="h-px sm:h-8 w-full sm:w-px bg-white/10"></div>
              
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-on-navy-muted uppercase tracking-widest">
                <span>ISO 27001 Certified</span>
                <span>•</span>
                <span>DPIIT Certified</span>
              </div>
            </div>
          </motion.div>

          {/* Right Preview Card / Graphic */}
          <motion.div 
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-aim-gold/15 to-aim-purple/15 rounded-3xl blur-2xl opacity-50 transform rotate-3"></div>
            
            {/* Main Interactive Interface Preview */}
            <motion.div 
              className="relative card-elevated border border-white/10 rounded-3xl p-4 shadow-2xl ring-1 ring-aim-black/20"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 px-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-aim-gold/90"></span>
                  <span className="w-3 h-3 rounded-full bg-white/30 border border-white/20"></span>
                  <span className="w-3 h-3 rounded-full bg-aim-purple/90"></span>
                </div>
                <span className="text-[10px] text-on-navy-muted font-mono tracking-widest">aim-architecture-audit</span>
                <span className="w-4 h-4 text-slate-400">
                  <svg fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"></path></svg>
                </span>
              </div>
              
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-aim-navy-light/50 p-2">
                <video
                  className="rounded-xl w-full h-auto shadow-inner object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src={nexgnVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              
              {/* Overlay Glass Badge */}
              <div className="absolute -bottom-6 -left-6 bg-aim-navy-light/95 backdrop-blur border border-aim-gold/30 rounded-2xl p-4 shadow-xl flex items-center gap-3 max-w-[200px]">
                <div className="p-2.5 rounded-lg bg-aim-gold/15 text-aim-gold">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[11px] text-on-navy-muted font-bold uppercase tracking-wider">Infrastructure</p>
                  <p className="text-xs font-black text-white">99.99% Uptime Verified</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection