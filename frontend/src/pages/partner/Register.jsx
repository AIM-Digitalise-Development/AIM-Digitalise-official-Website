import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import StepIndicator from '../../components/partner/registration/StepIndicator'
import Step1RegistrationForm from '../../components/partner/registration/Step1RegistrationForm'
import Step2DownloadAgreement from '../../components/partner/registration/Step2DownloadAgreement'
import Step3UploadAndPay from '../../components/partner/registration/Step3UploadAndPay'
import RegistrationSuccess from '../../components/partner/registration/RegistrationSuccess'
import { ROUTES } from '../../constants/routes'
import plogo from '../../assets/images/plogo.jpeg'

const STEP_TITLES = [
  { step: 1, heading: 'Partner Registration', sub: 'Fill in your organization and personal details' },
  { step: 2, heading: 'Download Agreement', sub: 'Download, print, sign and prepare to upload' },
  { step: 3, heading: 'Upload & Complete Payment', sub: 'Upload signed agreement and pay registration fee' },
]

const PartnerRegister = () => {
  const location = useLocation()
  const [step, setStep] = useState(1)
  const [partnerData, setPartnerData] = useState(null)   // from step 1 API
  const [step1FormValues, setStep1FormValues] = useState(null) // from step 1 inputs
  const [verifyData, setVerifyData] = useState(null)     // from step 3 API
  const [formEmail, setFormEmail] = useState('')

  useEffect(() => {
    if (location.state?.resumePartnerId) {
      setPartnerData({
        partner_id: location.state.resumePartnerId,
        email: location.state.resumeEmail,
        registration_status: 'pending'
      })
      setFormEmail(location.state.resumeEmail || '')
      setStep(location.state.resumeStep || 3)
    }
  }, [location])

  useEffect(() => {
    // Prevent page-level scrolling
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      // Restore scrolling on unmount
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  const currentTitle = STEP_TITLES.find((t) => t.step === step) || STEP_TITLES[0]
  const isSuccess = step === 4

  const handleStep1Success = (data, formValues) => {
    setPartnerData(data)
    setStep1FormValues(formValues)
    setFormEmail(data?.email || '')
    setStep(2)
  }

  const handleStep3Success = (data) => {
    setVerifyData(data)
    setStep(4)
  }

  return (
    <>
      <Helmet>
        <title>AIM Partner | Registration</title>
        <meta name="description" content="Register as an AIM Digitalise Partner. Complete the 3-step process to join our partner network." />
      </Helmet>

      <div className="h-screen bg-aim-navy flex flex-col justify-between overflow-hidden relative">
        {/* Background decorations with image & glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1920&q=80')" }}
          />
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-aim-gold/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '9s' }} />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-aim-purple/12 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '13s' }} />
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        </div>

        {/* Top bar with plogo.jpeg */}
        <header className="relative z-10 border-b border-white/5 bg-aim-navy/40 backdrop-blur-md shrink-0">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
              <img 
                src={plogo} 
                alt="AIM Digitalise Logo" 
                className="h-10 sm:h-12 w-auto object-contain rounded-lg border border-white/10 shadow-lg shadow-black/30 transition-transform duration-300 group-hover:scale-[1.02]" 
              />
            </Link>
            <Link
              to={ROUTES.PARTNER.LOGIN}
              className="text-xs font-semibold text-aim-copy-muted hover:text-aim-gold transition-colors flex items-center gap-1"
            >
              Already a partner? Login →
            </Link>
          </div>
        </header>

        {/* Main Content Area - Center Card, scrollable form internally */}
        <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-6 overflow-hidden">
          <div className="w-full max-w-2xl max-h-[calc(100vh-140px)] flex flex-col">
            
            {isSuccess ? (
              <div className="relative rounded-3xl border border-white/10 bg-aim-navy-card/75 backdrop-blur-2xl p-8 shadow-2xl shadow-black/85 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-aim-gold/8 rounded-full blur-2xl pointer-events-none" />
                <RegistrationSuccess partnerData={partnerData} verifyData={verifyData} />
              </div>
            ) : (
              <div className="relative rounded-3xl border border-white/10 bg-aim-navy-card/75 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/85 flex flex-col overflow-hidden max-h-[calc(100vh-150px)]">
                {/* Ambient glows inside card */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-aim-gold/8 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-aim-purple/8 rounded-full blur-2xl pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 mb-5 shrink-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aim-gold/10 border border-aim-gold/20 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-aim-gold animate-pulse" />
                    <span className="text-aim-gold text-[10px] font-black uppercase tracking-widest">Become a Partner</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight leading-none">
                    {currentTitle.heading}
                  </h1>
                  <p className="text-[11px] text-aim-copy-muted leading-tight">{currentTitle.sub}</p>
                </div>

                {/* Step indicator */}
                <div className="relative z-10 mb-6 shrink-0">
                  <StepIndicator currentStep={step} />
                </div>

                {/* Step content - Internally Scrollable */}
                <div className="relative z-10 flex-grow overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {step === 1 && (
                    <Step1RegistrationForm onSuccess={handleStep1Success} />
                  )}
                  {step === 2 && (
                    <Step2DownloadAgreement
                      partnerData={partnerData}
                      step1FormValues={step1FormValues}
                      onContinue={() => setStep(3)}
                      onBack={() => setStep(1)}
                    />
                  )}
                  {step === 3 && (
                    <Step3UploadAndPay
                      partnerData={partnerData}
                      formEmail={formEmail}
                      onSuccess={handleStep3Success}
                      onBack={() => setStep(2)}
                    />
                  )}
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Footer shrink-0 */}
        <footer className="relative z-10 py-4 border-t border-white/5 bg-aim-navy/40 backdrop-blur-md shrink-0">
          <p className="text-center text-[10px] text-aim-copy-muted">
            Need registration help?{' '}
            <a href="mailto:support@aimdigitalise.com" className="text-aim-gold hover:text-aim-gold-light transition-colors font-bold underline underline-offset-4">
              Contact Support Desk
            </a>
          </p>
        </footer>
      </div>
    </>
  )
}

export default PartnerRegister
