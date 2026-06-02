import ContactForm from '../../components/website/contact/ContactForm'
import OfficeInfo from '../../components/website/contact/OfficeInfo'
import MapLocation from '../../components/website/contact/MapLocation'
import PageHero from '../../components/website/common/PageHero'

const Contact = () => {
  return (
    <div className="page-shell animate-fade-in">
      <PageHero
        badge="Get In Touch"
        title="Contact"
        highlight="AIM Digitalise"
        description="Reach our sales, technical, and support teams across India and the USA. We typically respond within one business day."
      />
      <section className="section-muted py-16 md:py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
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
