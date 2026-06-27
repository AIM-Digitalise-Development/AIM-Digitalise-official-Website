import { useState } from 'react'
import Button from '../../ui/Button'

const ContactForm = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid business email.')
      return
    }
    if (!message.trim()) {
      setError('Please write your message.')
      return
    }

    setError('')
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      setName('')
      setEmail('')
      setMessage('')
    }, 1200)
  }

  return (
    <div className="card-elevated p-8 md:p-10 relative overflow-hidden group">
      {/* Visual top accent glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-aim-gold/10 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:bg-aim-gold/15" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-aim-purple/10 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:bg-aim-purple/15" />

      {!submitted ? (
        <div className="animate-fade-in duration-300">
          <h2 className="text-2xl font-black text-white tracking-tight mb-2 text-left">Send us a message</h2>
          <p className="text-aim-copy-muted text-xs sm:text-sm mb-6 leading-relaxed text-left">
            Have a product specification, project inquiry, or scaling challenge? Write to us and our solutions engineering team will get back to you shortly.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-xl border border-red-500/25 bg-red-500/10 text-red-400 text-xs font-semibold text-center animate-shake">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="contact-name" className="block text-[10px] font-black text-aim-copy-muted uppercase tracking-widest">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-aim-copy-muted">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-aim-navy/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/50 focus:ring-1 focus:ring-aim-gold/25 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="contact-email" className="block text-[10px] font-black text-aim-copy-muted uppercase tracking-widest">
                Business Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-aim-copy-muted">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </span>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-aim-navy/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/50 focus:ring-1 focus:ring-aim-gold/25 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="contact-message" className="block text-[10px] font-black text-aim-copy-muted uppercase tracking-widest">
                Your Message
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-4 text-aim-copy-muted">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </span>
                <textarea
                  id="contact-message"
                  placeholder="Tell us details about the system or design you want..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-aim-navy/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/50 focus:ring-1 focus:ring-aim-gold/25 transition-all shadow-inner min-h-[140px] resize-y"
                  rows={5}
                />
              </div>
            </div>

            <div className="pt-2 text-left">
              <Button
                type="submit"
                isLoading={loading}
                className="w-full py-3.5 text-sm font-black uppercase tracking-wider rounded-xl bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy shadow-lg shadow-aim-gold/10 hover:shadow-aim-gold/20 cursor-pointer transition-all active:scale-[0.99]"
              >
                Send Inquiry
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center py-10 space-y-4 animate-fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <svg className="w-8 h-8 animate-bounce-gentle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-white">Message Sent Successfully!</h3>
          <p className="text-aim-copy-muted text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            Thank you for contacting AIM Digitalise. Our engineering consultation lead has received your email and will contact you within 24 hours.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => setSubmitted(false)}
              variant="secondary"
              size="sm"
              className="cursor-pointer"
            >
              Send Another Message
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactForm
