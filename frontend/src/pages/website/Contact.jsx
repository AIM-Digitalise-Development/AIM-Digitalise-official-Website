import ContactForm from '../../components/website/contact/ContactForm'
import OfficeInfo from '../../components/website/contact/OfficeInfo'
import MapLocation from '../../components/website/contact/MapLocation'

const Contact = () => {
  return (
    <div className="page-shell animate-fade-in">
      {/* Compact Title Section */}
      <section className="relative pt-10 pb-6 border-b border-white/10 overflow-hidden">
        <div className="ambient-glows" aria-hidden />
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
            <div className="space-y-2">
              <div className="badge-pill w-fit text-[10px] py-1 px-2.5 uppercase tracking-widest">
                <span className="badge-pill-dot" />
                Get In Touch
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Contact <span className="text-gradient">AIM Digitalise</span>
              </h1>
              <p className="text-xs sm:text-sm text-aim-copy-muted max-w-2xl leading-relaxed">
                Reach our sales, technical, and support teams across India and the USA. We typically respond within one business day.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="section-muted py-16 md:py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <ContactForm />
            <div className="space-y-8">
              <OfficeInfo />
              <MapLocation />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
