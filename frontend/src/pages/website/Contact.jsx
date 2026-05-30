import ContactForm from '../../components/website/contact/ContactForm'
import OfficeInfo from '../../components/website/contact/OfficeInfo'
import MapLocation from '../../components/website/contact/MapLocation'

const Contact = () => {
  return (
    <div className="container-custom py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600">Get in touch with our team</p>
      </div>
      <div className="grid md:grid-cols-2 gap-12">
        <ContactForm />
        <div>
          <OfficeInfo />
          <MapLocation />
        </div>
      </div>
    </div>
  )
}

export default Contact