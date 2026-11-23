import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import StepIndicator from '../../components/partner/registration/StepIndicator'
import Step1RegistrationForm from '../../components/partner/registration/Step1RegistrationForm'
import Step2DownloadAgreement from '../../components/partner/registration/Step2DownloadAgreement'
import Step3UploadAndPay from '../../components/partner/registration/Step3UploadAndPay'
import RegistrationSuccess from '../../components/partner/registration/RegistrationSuccess'
import { checkPartnerStatus, fetchStep2Data } from '../../api/partner'
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
  const [step1FormFiles, setStep1FormFiles] = useState(null)   // from step 1 files
  const [verifyData, setVerifyData] = useState(null)     // from step 3 API
  const [formEmail, setFormEmail] = useState('')
  const [locationCountry, setLocationCountry] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem('mimic_location') || 'IN' : 'IN')
  )

  const handleToggleCountry = (newCountry) => {
    setLocationCountry(newCountry)
    if (typeof window !== 'undefined') {
      localStorage.setItem('mimic_location', newCountry)
    }
    const isNep = newCountry === 'NP'

    // Update partnerData if already on step 2 or 3
    setPartnerData((prev) => {
      if (!prev) return prev
      const currentId = prev.partner_id || ''
      const updatedId = isNep
        ? (currentId.startsWith('PIDIN') ? currentId.replace('PIDIN', 'PIDNP') : (currentId || 'PIDNP26051'))
        : (currentId.startsWith('PIDNP') ? currentId.replace('PIDNP', 'PIDIN') : (currentId || 'PIDIN26051'))
      return {
        ...prev,
        country: isNep ? 'Nepal' : 'India',
        country_code: newCountry,
        partner_id: updatedId,
      }
    })

    // Update step 1 form values if present
    setStep1FormValues((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        country: isNep ? 'Nepal' : 'India',
        state: '',
      }
    })
  }

  // ── Auto-resume via status API when arriving from login page ──
  useEffect(() => {
    const resumeId = location.state?.resumePartnerId
    if (resumeId) {
      const doResume = async () => {
        try {
          const res = await checkPartnerStatus(resumeId.trim())
          const data = res.data
          if (data?.success) {
            const stepData = data.data
            const currentStep = stepData.current_step
            setPartnerData({
              partner_id: stepData.partner_id || resumeId,
              partner_name: stepData.partner_name,
              organization_name: stepData.organization_name,
              email: stepData.email,
              country: stepData.country,
              payment_status: stepData.payment_status || 'pending',
              registration_status: stepData.registration_status || 'pending',
              signed_agreement_path: stepData.signed_agreement_path,
            })
            setFormEmail(stepData.email || '')
            if (currentStep >= 4) {
              setStep(3) // all done, show step 3 which will handle redirect
            } else {
              setStep(Math.max(currentStep, 2)) // at least step 2
            }
          } else {
            // Fallback: just go to step 3 as before
            setPartnerData({ partner_id: resumeId, registration_status: 'pending' })
            setStep(location.state.resumeStep || 3)
          }
        } catch {
          // If status check fails, fall back to old behavior
          setPartnerData({ partner_id: resumeId, registration_status: 'pending' })
          setStep(location.state.resumeStep || 3)
        }
      }
      doResume()
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

  const handleStep1Success = (data, formValues, formFiles) => {
    const isMaster = data?.rank === 'master' || data?.partner_type === 'master' || formValues?.is_master_partner === 'yes'
    setPartnerData({
      ...data,
      country: data?.country || formValues?.country || 'India',
      country_code: data?.country_code || (formValues?.country === 'Nepal' ? 'NP' : 'IN'),
      is_master_partner: isMaster ? 'yes' : 'no',
      rank: isMaster ? 'master' : 'associate',
      partner_type: isMaster ? 'master' : 'associate',
    })
    setStep1FormValues(formValues)
    setStep1FormFiles(formFiles)
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

      <div className="h-screen bg-aim-navy flex flex-col justify-center overflow-hidden relative">
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

        {/* Top corner links */}
        <div className="absolute top-4 left-6 z-20">
          <Link to={ROUTES.HOME} className="group">
            <img 
              src={plogo} 
              alt="AIM Digitalise Logo" 
              className="h-10 w-auto object-contain rounded-lg border border-white/10 shadow-lg transition-transform duration-300 group-hover:scale-[1.02]" 
            />
          </Link>
        </div>
        <div className="absolute top-4 right-6 z-20">
          <Link
            to={ROUTES.PARTNER.LOGIN}
            className="text-xs font-semibold text-aim-copy-muted hover:text-aim-gold transition-colors"
          >
            Already a partner? Login →
          </Link>
        </div>

        {/* Main Content Area - Center Card, scrollable form internally */}
        <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-6 overflow-hidden">
          <div className="w-full max-w-4xl max-h-[calc(100vh-60px)] flex flex-col">
            
            {isSuccess ? (
              <div className="relative rounded-3xl border border-white/10 bg-aim-navy-card/75 backdrop-blur-2xl p-8 shadow-2xl shadow-black/85 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-aim-gold/8 rounded-full blur-2xl pointer-events-none" />
                <RegistrationSuccess partnerData={partnerData} verifyData={verifyData} step1FormValues={step1FormValues} />
              </div>
            ) : (
              <div className="relative rounded-3xl border border-white/10 bg-aim-navy-card/75 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl shadow-black/85 flex flex-col overflow-hidden max-h-[calc(100vh-60px)]">
                {/* Ambient glows inside card */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-aim-gold/8 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-aim-purple/8 rounded-full blur-2xl pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 mb-3 shrink-0 flex flex-col items-center text-center">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap justify-center">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-aim-gold/10 border border-aim-gold/20">
                      <span className="w-1 h-1 rounded-full bg-aim-gold animate-pulse" />
                      <span className="text-aim-gold text-[9px] font-black uppercase tracking-widest">Become a Partner</span>
                    </div>

                    {/* Location Simulator Toggle for Testing (commented out for production upload) */}
                    {/*
                    <div className="inline-flex items-center gap-1 bg-aim-navy-light/90 border border-white/10 rounded-full p-0.5 shadow-md">
                      <span className="text-[9px] font-mono font-bold text-aim-copy-muted pl-2 pr-1">
                        Test Region:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleCountry('IN')}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          locationCountry === 'IN'
                            ? 'bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-black shadow-sm'
                            : 'text-aim-copy-muted hover:text-white'
                        }`}
                        title="Simulate India (Razorpay Online Gateway)"
                      >
                        🇮🇳 India
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleCountry('NP')}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          locationCountry === 'NP'
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black shadow-sm ring-1 ring-emerald-400/40'
                            : 'text-aim-copy-muted hover:text-white'
                        }`}
                        title="Simulate Nepal (Offline Cash Payment to Admin)"
                      >
                        🇳🇵 Nepal (Offline Cash)
                      </button>
                    </div>
                    */}
                  </div>

                  <h1 className="text-lg sm:text-xl font-black text-white mb-0.5 tracking-tight leading-none">
                    {currentTitle.heading}
                  </h1>
                  <p className="text-[10px] text-aim-copy-muted leading-tight">{currentTitle.sub}</p>
                </div>

                {/* Step indicator */}
                <div className="relative z-10 mb-2.5 shrink-0">
                  <StepIndicator currentStep={step} />
                </div>

                {/* Step content - Internally Scrollable */}
                <div className="relative z-10 flex-grow overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {step === 1 && (
                    <Step1RegistrationForm 
                      onSuccess={handleStep1Success}
                      initialValues={step1FormValues}
                      initialFiles={step1FormFiles}
                      partnerData={partnerData}
                      mimicCountry={locationCountry}
                      onCountryChange={handleToggleCountry}
                    />
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

      </div>
    </>
  )
}

export default PartnerRegister
