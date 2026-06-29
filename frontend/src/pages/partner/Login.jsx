import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PartnerLoginForm from '../../components/partner/auth/PartnerLoginForm'
import AgreementDoc from '../../components/partner/registration/AgreementDoc'
import { ROUTES } from '../../constants/routes'
import { checkPartnerStatus } from '../../api/partner'
import plogo from '../../assets/images/plogo.jpeg'
import logo from '../../assets/images/logo.png'

const PartnerLogin = () => {
  const navigate = useNavigate()
  const [completePartnerId, setCompletePartnerId] = useState('')
  const [completeError, setCompleteError] = useState('')
  const [completeSuccess, setCompleteSuccess] = useState('')
  const [completeLoading, setCompleteLoading] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const loadPdfLibraries = () => {
    return new Promise((resolve, reject) => {
      if (window.html2canvas && window.jspdf) {
        resolve({ html2canvas: window.html2canvas, jspdf: window.jspdf })
        return
      }

      const loadScript = (src, checkGlobal) => {
        return new Promise((res, rej) => {
          if (window[checkGlobal]) {
            res()
            return
          }
          const existing = document.querySelector(`script[src*="${src.split('/').pop()}"]`)
          if (existing) {
            existing.onload = () => res()
            existing.onerror = () => rej(new Error(`Failed to load ${src}`))
            return
          }
          const script = document.createElement('script')
          script.src = src
          script.onload = () => res()
          script.onerror = () => rej(new Error(`Failed to load ${src}`))
          document.body.appendChild(script)
        })
      }

      Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf'),
        loadScript('https://cdn.jsdelivr.net/npm/html2canvas-pro@latest/dist/html2canvas.min.js', 'html2canvas')
      ])
        .then(() => resolve({ html2canvas: window.html2canvas, jspdf: window.jspdf }))
        .catch(reject)
    })
  }

  const handleDownloadBlank = async () => {
    setGeneratingPdf(true)
    setPdfError('')
    try {
      const { html2canvas, jspdf } = await loadPdfLibraries()
      if (!html2canvas || !jspdf) {
        throw new Error('Could not load the PDF libraries. Please check your network connection.')
      }

      const jsPDF = jspdf.jsPDF || window.jsPDF
      if (!jsPDF) {
        throw new Error('PDF generator engine not found.')
      }

      const element = document.getElementById('blank-agreement-container')
      if (!element) {
        throw new Error('Agreement template not found')
      }

      const pages = element.querySelectorAll('.agreement-page')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i]
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        })
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        if (i > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
      }

      pdf.save('AIM_Blank_Partner_Agreement.pdf')
    } catch (err) {
      console.error('Blank PDF generation failed:', err)
      setPdfError('Failed to generate agreement PDF. Please try again.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handleCompleteSubmit = async (e) => {
    e.preventDefault()
    if (!completePartnerId.trim()) {
      setCompleteError('Please enter your Partner ID.')
      return
    }

    setCompleteLoading(true)
    setCompleteError('')
    setCompleteSuccess('')

    try {
      const res = await checkPartnerStatus(completePartnerId.trim())
      const data = res.data
      if (data?.success) {
        const currentStep = data.data?.current_step
        if (currentStep === 1) {
          setCompleteError('Step 1 registration not completed yet. Please fill out the registration form.')
        } else {
          setCompleteSuccess(`Redirecting to step ${currentStep}...`)
          setTimeout(() => {
            navigate(ROUTES.PARTNER.REGISTER, {
              state: {
                resumePartnerId: completePartnerId.trim().toUpperCase(),
                resumeStep: currentStep >= 4 ? 3 : currentStep
              }
            })
          }, 1000)
        }
      } else {
        setCompleteError(data?.message || 'Partner ID not found. Please register first.')
      }
    } catch (err) {
      setCompleteError(err?.message || 'Error verifying Partner ID. Please try again.')
    } finally {
      setCompleteLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Partner Login | AIM Digitalise</title>
        <meta name="description" content="Sign in to the AIM Digitalise Partner Portal to manage your earnings, orders, and payouts." />
      </Helmet>

      <div className="min-h-screen bg-aim-navy flex flex-col relative overflow-hidden font-sans">
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
        <header className="relative z-10 border-b border-white/5 bg-aim-navy/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
              <img 
                src={plogo} 
                alt="AIM Digitalise Logo" 
                className="h-10 sm:h-12 w-auto object-contain rounded-lg border border-white/10 shadow-lg shadow-black/30 transition-transform duration-300 group-hover:scale-[1.02]" 
              />
            </Link>
            <Link
              to={ROUTES.PARTNER.REGISTER}
              className="text-xs font-semibold text-aim-copy-muted hover:text-aim-gold transition-colors"
            >
              Not a partner? Register →
            </Link>
          </div>
        </header>

        {/* Hidden Blank Agreement for Client-side Downloading */}
        <div style={{ position: 'absolute', left: '0', top: '0', width: '210mm', height: '0', overflow: 'hidden', opacity: 0, pointerEvents: 'none', zIndex: -9999 }}>
          <div id="blank-agreement-container">
            <AgreementDoc partnerData={{}} forPdf={true} />
          </div>
        </div>

        {/* Main Grid Card Layout */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-5xl">
            <div className="relative rounded-3xl border border-white/10 bg-aim-navy-card/85 backdrop-blur-2xl shadow-2xl shadow-black/90 overflow-hidden transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-12 font-sans">
                {/* Left Column (Login Form) */}
                <div className="col-span-12 md:col-span-6 p-4 sm:p-7 pt-[0px] sm:pt-[25px] flex flex-col justify-start bg-aim-navy-card/95">
                              {/* <div style={{color:'white'}} className="grid grid-cols-1 md:grid-cols-12 font-sans p-4">Partner Portal</div> */}
              {/* Header Title & Description */}
              <div className="relative z-10 text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 bg-aim-gold/15 border border-aim-gold/30 text-aim-gold">
                  <span className="w-1 h-1 rounded-full bg-aim-gold animate-ping " />
                  PARTNER Partner
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-none mb-1.5">
                  Welcome Back
                </h1>
                <p className="text-[11px] text-aim-copy-muted leading-relaxed max-w-[290px] mx-auto">
                  Sign in to the Partner Portal to manage your earnings, orders, and payouts.
                </p>
              </div>

                  <div className="flex justify-center mb-7 shrink-5">
                    <img src={logo} alt="AIM Digitalise" className="h-9 sm:h-11 w-auto object-contain" />
                  </div>
                  
                  

                  <PartnerLoginForm />
                </div>

                {/* Right Column (Associate Partner Benefits & Step 3 Resumer Form) */}
                <div className="col-span-12 md:col-span-6 p-4 sm:p-7 bg-gradient-to-br from-aim-gold/20 via-aim-purple/35 to-aim-navy-card/90 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10">
                  <div className="space-y-3">
                    <h2 className="text-center text-sm sm:text-base font-black text-aim-gold tracking-wide italic">
                      "Associate Partner"
                    </h2>

                    {/* Wrapper card box for lists */}
                    <div className="rounded-2xl border border-white/5 bg-aim-navy-light/45 p-3.5 space-y-3 shadow-inner">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-aim-gold mb-1.5">
                          Opportunities:
                        </h3>
                        <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-300 leading-normal font-medium font-sans">
                          <li>AIM Digitalise offers customized digital solution, SEO-friendly, fully responsive websites and custom software on a monthly rental model for all segment of businesses.</li>
                          <li>Lifetime commission facilities: A 10% monthly commission is awarded for first 12 months per onboarded client, then 5% for Lifetime, as long as the deal exists. Extra rewards for top-performing partners.</li>
                          <li>The partner is only responsible for sales and customer retention, excluding development, deployment, implementation, debugging, technical support, updates, and renewals.</li>
                          <li>You will be awarded with our Authorized Partner certificate.</li>
                          <li>You will be also promoted as our Authorized Partner on our official website getting you more reachability from our end.</li>
                        </ul>
                      </div>

                      <div className="border-t border-white/5 pt-2">
                        <h3 className="text-[11px] font-black uppercase tracking-wider text-aim-gold mb-1">
                          Partner Eligibility Criteria:
                        </h3>
                        <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-300 leading-normal font-medium font-sans">
                          <li>Operate an active business unit.</li>
                          <li>Minimum 3 years of proven B2B sales experience.</li>
                          <li>Non-Refundable Processing Fee: ₹1,000 (Domestic, previously <s >₹25,000</s>).</li>
                          <li>Non-Refundable Processing Fee: $500 (International, previously <s >$1,000</s>).</li>
                        </ul>
                      </div>
                    </div>

                    {/* View and Download Action Buttons Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setShowPreviewModal(true)}
                        className="py-2 rounded-xl border border-aim-gold/50 bg-aim-navy-light text-aim-gold font-bold text-xs tracking-wide hover:bg-aim-gold/5 hover:border-aim-gold hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Agreement
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadBlank}
                        disabled={generatingPdf}
                        className="py-2 rounded-xl border border-aim-gold/50 bg-aim-gold/15 text-aim-gold font-bold text-xs tracking-wide hover:bg-aim-gold/25 hover:border-aim-gold hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {generatingPdf ? (
                          <span className="w-3 h-3 border-2 border-aim-gold border-t-transparent animate-spin rounded-full" />
                        ) : (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        )}
                        Download Agreement
                      </button>
                    </div>
                    {pdfError && <p className="text-center text-[10px] text-red-400 font-semibold">{pdfError}</p>}
                  </div>

                  <div className="border-t border-white/10 pt-3 mt-3">
                    <form onSubmit={handleCompleteSubmit} className="space-y-2">
                      <h3 className="text-[11px] font-black text-aim-gold uppercase tracking-wider leading-none">
                        Complete your registration.
                      </h3>
                      <p className="text-[9.5px] text-slate-300 leading-tight font-medium">
                        If you did not complete the signup process after Step 1, enter your Partner ID below to resume and proceed to the upload &amp; payment page.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-2 mt-0.5">
                        <input
                          type="text"
                          value={completePartnerId}
                          onChange={(e) => setCompletePartnerId(e.target.value)}
                          placeholder="ENTER YOUR PARTNER ID"
                          className="flex-1 bg-aim-navy-light/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-aim-gold font-sans tracking-wide disabled:opacity-50"
                          required
                          disabled={completeLoading}
                        />

                        <button
                          type="submit"
                          disabled={completeLoading}
                          className="sm:w-28 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wider uppercase transition-colors shadow-md shadow-blue-900/20 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {completeLoading ? (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              Wait...
                            </span>
                          ) : 'Submit'}
                        </button>
                      </div>

                      {completeError && (
                        <p className="text-[10px] text-red-400 font-semibold mt-1">{completeError}</p>
                      )}
                      {completeSuccess && (
                        <p className="text-[10px] text-emerald-400 font-semibold mt-1">{completeSuccess}</p>
                      )}
                    </form>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-aim-copy-muted mt-8">
              Having trouble?{' '}
              <a href="mailto:support@aimdigitalise.com" className="text-aim-gold hover:text-aim-gold-light transition-colors font-bold underline underline-offset-4">
                Contact Technical Support
              </a>
            </p>
          </div>
        </main>
      </div>

      {/* --- BLANK AGREEMENT PREVIEW MODAL OVERLAY --- */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          {/* Style override to cleanly fit the agreement pages in the preview box */}
          <style>{`
            .agreement-preview-box .agreement-page {
              width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
              min-height: 480px !important;
              padding: 1.5rem 1.5rem 3.5rem 1.5rem !important;
              box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1) !important;
            }
            .agreement-preview-box #agreement-doc-container,
            .agreement-preview-box #agreement-pdf-container,
            .agreement-preview-box .agreement-doc-wrapper {
              width: 100% !important;
              max-width: 100% !important;
            }
          `}</style>

          <div className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-aim-navy-card/95 p-6 shadow-2xl z-10 flex flex-col max-h-[85vh] text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-base font-black text-white font-sans">Blank Agreement Document Preview</h3>
                <p className="text-[10px] text-aim-copy-muted mt-0.5 font-sans">Previewing the empty Partnership Agreement contract template</p>
              </div>
              <button 
                onClick={() => setShowPreviewModal(false)} 
                className="text-aim-copy-muted hover:text-white p-1 text-xl font-bold cursor-pointer transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-grow my-4 overflow-y-auto max-h-[60vh] rounded-xl border border-white/10 bg-slate-950 p-2 scrollbar-thin scrollbar-thumb-white/10 agreement-preview-box">
              <AgreementDoc partnerData={{}} forPdf={false} />
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10 flex justify-end gap-3 shrink-0">
              <button
                onClick={handleDownloadBlank}
                disabled={generatingPdf}
                className="px-5 py-2.5 rounded-xl bg-aim-gold text-aim-navy font-black text-xs hover:bg-aim-gold-light hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {generatingPdf ? 'Generating PDF...' : 'Download Agreement'}
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-aim-copy-muted hover:text-white transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PartnerLogin
