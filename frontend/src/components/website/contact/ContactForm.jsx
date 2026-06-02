import Button from '../../ui/Button'

const ContactForm = () => (
  <div className="card-elevated p-8 md:p-10">
    <h2 className="text-2xl font-bold text-slate-900 mb-2">Send us a message</h2>
    <p className="text-slate-600 text-sm mb-8">
      Tell us about your project, timeline, and goals. Our team will get back to you shortly.
    </p>
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Full name
        </label>
        <input id="contact-name" type="text" placeholder="Your name" className="input-brand" />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Business email
        </label>
        <input id="contact-email" type="email" placeholder="you@company.com" className="input-brand" />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Message
        </label>
        <textarea
          id="contact-message"
          placeholder="How can we help?"
          className="input-brand min-h-[140px] resize-y"
          rows={5}
        />
      </div>
      <Button type="submit" className="btn-primary w-full sm:w-auto">
        Send Message
      </Button>
    </form>
  </div>
)

export default ContactForm
