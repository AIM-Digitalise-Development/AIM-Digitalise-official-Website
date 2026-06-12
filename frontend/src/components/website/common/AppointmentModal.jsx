import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useUIStore from '../../../store/uiStore'
import Button from '../../ui/Button'
import Input from '../../ui/Input'

const SERVICES_OPTIONS = [
  'Custom Software Engineering',
  'SaaS Product Development',
  'Digital Marketing Strategy',
  'Digital Signature Certificate (DSC)',
  'Coding Classes / Training',
  'General IT Consulting'
]

const TIME_SLOTS = [
  'Morning (10:00 AM - 1:00 PM)',
  'Afternoon (1:00 PM - 4:00 PM)',
  'Evening (4:00 PM - 7:00 PM)'
]

const AppointmentModal = () => {
  const { appointmentModalOpen, closeAppointmentModal } = useUIStore()
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    timeSlot: 'Morning (10:00 AM - 1:00 PM)',
    service: 'Custom Software Engineering',
    message: ''
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleClose = () => {
    closeAppointmentModal()
    // Small delay to reset form state after exit animation completes
    setTimeout(() => {
      setFormSubmitted(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        timeSlot: 'Morning (10:00 AM - 1:00 PM)',
        service: 'Custom Software Engineering',
        message: ''
      })
      setErrors({})
    }, 300)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const tempErrors = {}

    if (!formData.name.trim()) tempErrors.name = 'Full name is required'
    if (!formData.email.trim() || !formData.email.includes('@')) {
      tempErrors.email = 'A valid email address is required'
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      tempErrors.phone = 'A valid 10-digit phone number is required'
    }
    if (!formData.date) tempErrors.date = 'Appointment date is required'

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors)
      return
    }

    setErrors({})
    setFormSubmitted(true)
    console.log('Booking appointment:', formData)
  }

  // Calculate today's date in YYYY-MM-DD format for calendar minimum selection
  const todayDateString = new Date().toISOString().split('T')[0]

  return (
    <AnimatePresence>
      {appointmentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left z-10"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-aim-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-aim-purple/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-aim-copy-muted hover:text-white transition cursor-pointer"
              aria-label="Close scheduling modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {!formSubmitted ? (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="badge-pill w-fit text-[9px] py-0.5 px-2 uppercase tracking-widest">
                    <span className="badge-pill-dot" />
                    Secure Meeting
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Schedule Strategy Consultation</h3>
                  <p className="text-xs text-aim-copy-muted leading-relaxed">
                    Reserve a session directly with our project architects. We will audit your requirements and explore potential designs.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Row 1: Name and Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      error={errors.name}
                      placeholder=""
                      className="bg-aim-navy-light/80 border-white/10 text-white text-sm"
                    />
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      placeholder=""
                      className="bg-aim-navy-light/80 border-white/10 text-white text-sm"
                    />
                  </div>

                  {/* Row 2: Phone and Service dropdown */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      error={errors.phone}
                      placeholder="e.g. +91 9876543210"
                      className="bg-aim-navy-light/80 border-white/10 text-white text-sm"
                    />
                    <div className="space-y-1.5 text-left">
                      <label className="block text-sm font-semibold text-aim-copy">Service Category</label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        className="w-full bg-aim-navy-light border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-aim-gold focus:ring-1 focus:ring-aim-gold text-sm transition outline-none cursor-pointer"
                      >
                        {SERVICES_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-slate-900 text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Date and Time Slot */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="block text-sm font-semibold text-aim-copy">Preferred Date</label>
                      <input
                        type="date"
                        name="date"
                        min={todayDateString}
                        value={formData.date}
                        onChange={handleInputChange}
                        className={`w-full bg-aim-navy-light border rounded-xl px-4 py-2.5 text-white focus:border-aim-gold focus:ring-1 focus:ring-aim-gold text-sm transition outline-none cursor-pointer ${
                          errors.date ? 'border-red-400' : 'border-white/10'
                        }`}
                      />
                      {errors.date && (
                        <p className="mt-1 text-xs text-red-400 font-medium">{errors.date}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-sm font-semibold text-aim-copy">Preferred Time Slot</label>
                      <select
                        name="timeSlot"
                        value={formData.timeSlot}
                        onChange={handleInputChange}
                        className="w-full bg-aim-navy-light border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-aim-gold focus:ring-1 focus:ring-aim-gold text-sm transition outline-none cursor-pointer"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot} className="bg-slate-900 text-white">
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Details / Brief Requirements */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-sm font-semibold text-aim-copy">Brief description of request (Optional)</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Share details about what you want to achieve..."
                      className="w-full bg-aim-navy-light/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-aim-gold focus:ring-1 focus:ring-aim-gold text-sm transition resize-none outline-none"
                    />
                  </div>

                  <Button type="submit" className="w-full py-3 text-sm font-bold cursor-pointer transition-all duration-300">
                    Confirm Consultation Request
                  </Button>
                </form>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 px-4 space-y-5"
              >
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto shadow-brand-emerald">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white">Consultation Reserved!</h4>
                  <p className="text-xs text-aim-copy-muted leading-relaxed max-w-md mx-auto">
                    We have received your appointment details. Our SOLUTIONS ARCHITECT will review your selected date <strong className="text-white">({formData.date})</strong> during the <strong className="text-white">{formData.timeSlot.split(' ')[0]}</strong> slot and reach out with a meeting link within 12 hours.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    onClick={handleClose}
                    className="w-full sm:w-auto px-8 cursor-pointer font-bold text-xs"
                  >
                    Got it, Close
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AppointmentModal
