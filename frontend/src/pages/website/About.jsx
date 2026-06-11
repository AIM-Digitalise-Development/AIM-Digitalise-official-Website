import { Suspense, lazy } from 'react'
import { Helmet } from 'react-helmet-async'
import { SectionSkeleton } from '../../components/common/Skeleton'

// Critical above-the-fold (loaded immediately)
import AimDigitaliseSection from '../../components/website/about/AimDigitaliseSection'
import MissionVision from '../../components/website/about/MissionVision'

// Lazy-loaded below the fold
const AwardsRecognition = lazy(() => import('../../components/website/about/AwardsRecognition'))
const OurCertifications = lazy(() => import('../../components/website/about/OurCertifications'))
const ValuesSection     = lazy(() => import('../../components/website/about/ValuesSection'))
const ManagementDesk    = lazy(() => import('../../components/website/about/ManagementDesk'))

const About = () => {
  return (
    <>
      {/* SEO */}
      <Helmet>
        <title>AIM Digitalise | About Us</title>
        <meta
          name="description"
          content="Learn about AIM Digitalise Pvt. Ltd. – one of India's largest performance digital marketing agencies founded in 2020. Our mission, vision, certifications, awards, and leadership team."
        />
        <meta
          name="keywords"
          content="AIM Digitalise, digital marketing agency India, about us, digital signature, SEO, web development, mission vision"
        />
        <link rel="canonical" href="https://aimdigitalise.com/about" />
      </Helmet>

      {/* 1. About AIM Digitalise – hero with image + description + portfolio download */}
      <div id="who-we-are" className="scroll-mt-20">
        <AimDigitaliseSection />
      </div>

      {/* 2. Mission & Vision */}
      <div id="what-we-do" className="scroll-mt-20">
        <MissionVision />
      </div>

      {/* 3. Awards & Recognition */}
      <div id="success-story" className="scroll-mt-20">
        <Suspense fallback={<SectionSkeleton height="500px" />}>
          <AwardsRecognition />
        </Suspense>
      </div>

      {/* 4. Our Certifications */}
      <Suspense fallback={<SectionSkeleton height="600px" />}>
        <OurCertifications />
      </Suspense>

      {/* 5. Core Values */}
      <Suspense fallback={<SectionSkeleton height="400px" />}>
        <ValuesSection />
      </Suspense>

      {/* 6. Management Desk */}
      <Suspense fallback={<SectionSkeleton height="500px" />}>
        <ManagementDesk />
      </Suspense>
    </>
  )
}

export default About