import { Suspense, lazy } from 'react'
import { Helmet } from 'react-helmet-async' // Install: npm install react-helmet-async

// Critical components (above the fold - NO lazy loading)
import HeroSection from '../../components/website/home/HeroSection'
import FeaturesGrid from '../../components/website/home/FeaturesGrid'
import AboutCompanySection from '../../components/website/home/AboutCompanySection'
import NxtGenErpSection from '../../components/website/home/NxtGenErpSection'
import CTASection from '../../components/website/home/CTASection'

// Lazy loaded components (below the fold)
const TestimonialsSection = lazy(() => import('../../components/website/home/TestimonialsSection'))
const PricingCard = lazy(() => import('../../components/website/home/PricingCard'))
const LatestNews = lazy(() => import('../../components/website/home/LatestNews'))
const SpecialtiesSection = lazy(() => import('../../components/website/home/SpecialtiesSection'))
const OurClientsSection = lazy(() => import('../../components/website/home/OurClientsSection'))

// Skeleton loaders
import { SectionSkeleton } from '../../components/common/Skeleton'

const Home = () => {
  return (
    <>
      {/* SEO Optimization */}
      <Helmet>
        <title>AIM Innovations | Enterprise Software Engineering & IT Consulting</title>
        <meta name="description" content="AIM Innovations designs, builds, and scales custom software systems, cloud architectures, and intelligence-driven AI platforms for global enterprises." />
        <meta name="keywords" content="IT consulting, software engineering, cloud architecture, custom software development, AI integrations, DevOps" />
        <link rel="canonical" href="https://aiminnovations.com/" />
      </Helmet>

      {/* Critical Content - Loads Immediately */}
      <HeroSection />
      <FeaturesGrid />
      <AboutCompanySection />
      <NxtGenErpSection />

      {/* Below Fold Content - Lazy Loaded */}
      <Suspense fallback={<SectionSkeleton />}>
        <SpecialtiesSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <OurClientsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="500px" />}>
        <PricingCard />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="400px" />}>
        <LatestNews />
      </Suspense>

      {/* Critical CTA - Always visible */}
      <CTASection />
    </>
  )
}

export default Home