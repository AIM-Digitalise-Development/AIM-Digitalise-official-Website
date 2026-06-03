import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import StepIndicator from '../../components/partner/registration/StepIndicator'
import Step1RegistrationForm from '../../components/partner/registration/Step1RegistrationForm'
import Step2DownloadAgreement from '../../components/partner/registration/Step2DownloadAgreement'
import Step3UploadAndPay from '../../components/partner/registration/Step3UploadAndPay'
import RegistrationSuccess from '../../components/partner/registration/RegistrationSuccess'
import { ROUTES } from '../../constants/routes'

const STEP_TITLES = [
  { step: 1, heading: 'Partner Registration', sub: 'Fill in your organization and personal details' },
  { step: 2, heading: 'Download Agreement', sub: 'Download, print, sign and prepare to upload' },
  { step: 3, heading: 'Upload & Complete Payment', sub: 'Upload signed agreement and pay registration fee' },
]

const PartnerRegister = () => {
  const [step, setStep] = useState(1)
  const [partnerData, setPartnerData] = useState(null)   // from step 1 API
  const [verifyData, setVerifyData] = useState(null)     // from step 3 API
  const [formEmail, setFormEmail] = useState('')

  const currentTitle = STEP_TITLES.find((t) => t.step === step) || STEP_TITLES[0]
  const isSuccess = step === 4

  const handleStep1Success = (data) => {
    setPartnerData(data)
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
        <title>Partner Registration | AIM Digitalise</title>
        <meta name="description" content="Register as an AIM Digitalise Partner. Complete the 3-step process to join our partner network." />
      </Helmet>

      <div className="min-h-screen bg-aim-navy flex flex-col">
        {/* Background decorations */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-aim-gold/6 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-aim-purple/8 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-25" />
        </div>

        {/* Top bar */}
        <header className="relative z-10 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 text-white font-black text-xl">
              <span className="bg-gradient-to-br from-aim-gold via-aim-gold-light to-aim-purple w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-aim-navy shadow-md shadow-aim-gold/30">
                A
              </span>
              <span>AIM<span className="text-transparent bg-clip-text bg-gradient-to-r from-aim-gold to-aim-purple">.</span></span>
            </Link>
            <Link
              to={ROUTES.PARTNER.LOGIN}
              className="text-xs font-semibold text-aim-copy-muted hover:text-aim-gold transition-colors"
            >
              Already a partner? Login →
            </Link>
          </div>
        </header>

        {/* Main */}
        <main className="relative z-10 flex-1 flex items-start justify-center px-4 py-10">
          <div className="w-full max-w-2xl">

            {/* Success state — no card wrapper needed */}
            {isSuccess ? (
              <div className="relative rounded-2xl border border-white/10 bg-aim-navy-card/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/60">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-aim-gold/8 rounded-full blur-2xl pointer-events-none" />
                <RegistrationSuccess partnerData={partnerData} verifyData={verifyData} />
              </div>
            ) : (
              <div className="relative rounded-2xl border border-white/10 bg-aim-navy-card/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/60">
                {/* Ambient glows */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-aim-gold/8 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-aim-purple/8 rounded-full blur-2xl pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 mb-8">
                  {/* Partner badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-aim-gold/10 border border-aim-gold/20 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-aim-gold animate-pulse" />
                    <span className="text-aim-gold text-[10px] font-bold uppercase tracking-widest">Become a Partner</span>
                  </div>
                  <h1 className="text-2xl font-black text-white mb-1 tracking-tight">
                    {currentTitle.heading}
                  </h1>
                  <p className="text-xs text-aim-copy-muted">{currentTitle.sub}</p>
                </div>

                {/* Step indicator */}
                <div className="relative z-10 mb-8">
                  <StepIndicator currentStep={step} />
                </div>

                {/* Step content */}
                <div className="relative z-10">
                  {step === 1 && (
                    <Step1RegistrationForm onSuccess={handleStep1Success} />
                  )}
                  {step === 2 && (
                    <Step2DownloadAgreement
                      partnerData={partnerData}
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

            {/* Footer */}
            <p className="text-center text-xs text-aim-copy-muted mt-6">
              Need help?{' '}
              <a href="mailto:support@aimdigitalise.com" className="text-aim-gold hover:text-aim-gold-light transition-colors">
                Contact Support
              </a>
            </p>
          </div>
        </main>
      </div>
    </>
  )
}

export default PartnerRegister
