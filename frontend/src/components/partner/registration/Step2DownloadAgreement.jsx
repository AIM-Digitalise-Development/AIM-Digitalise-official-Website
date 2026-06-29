import { useState, useEffect } from 'react'
import AgreementDoc from './AgreementDoc'
import { fetchStep2Data, downloadAgreementPdf } from '../../../api/partner'

const Step2DownloadAgreement = ({ partnerData, step1FormValues, onContinue, onBack }) => {
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [pdfError, setPdfError] = useState('')

  // Server agreement state
  const [agreementHtml, setAgreementHtml] = useState('')
  const [isStep2Completed, setIsStep2Completed] = useState(false)
  const [loadingStep2, setLoadingStep2] = useState(false)
  const [step2Error, setStep2Error] = useState('')
  const [downloadSuccess, setDownloadSuccess] = useState('')

  const partnerId = partnerData?.partner_id

  const combinedData = {
    partner_id: partnerData?.partner_id || 'Draft',
    partner_name: step1FormValues?.partner_name || partnerData?.partner_name || '',
    organization_name: step1FormValues?.organization_name || partnerData?.organization_name || '',
    contact_no: step1FormValues?.contact_no || partnerData?.contact_no || '',
    email: step1FormValues?.email || partnerData?.email || '',
    address_line1: step1FormValues?.address_line1 || '',
    address_line2: step1FormValues?.address_line2 || '',
    district: step1FormValues?.district || '',
    state: step1FormValues?.state || '',
    pin_code: step1FormValues?.pin_code || '',
  }

  // Fetch Step 2 data from server on mount
  useEffect(() => {
    if (!partnerId) return
    const loadStep2 = async () => {
      setLoadingStep2(true)
      setStep2Error('')
      try {
        const res = await fetchStep2Data(partnerId)
        const data = res.data
        if (data?.success) {
          setAgreementHtml(data.data?.agreement_html || '')
          setIsStep2Completed(data.data?.step_2_completed || false)
        } else {
          // Not critical — we can still show the local AgreementDoc
          console.warn('Step 2 data fetch returned non-success:', data?.message)
        }
      } catch (err) {
        console.warn('Failed to fetch Step 2 data from server, using local fallback:', err.message)
      } finally {
        setLoadingStep2(false)
      }
    }
    loadStep2()
  }, [partnerId])

  // Download PDF from server, with client-side fallback
  const handleDownload = async () => {
    setGeneratingPdf(true)
    setPdfError('')
    setDownloadSuccess('')

    try {
      // Try server-side download first
      const blob = await downloadAgreementPdf(partnerId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `AIM_Partner_Agreement_${partnerId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setDownloadSuccess('✅ Agreement downloaded! Check your email for the PDF copy.')
      setIsStep2Completed(true)
    } catch (serverErr) {
      console.warn('Server download failed, trying client-side PDF generation:', serverErr.message)

      // Fallback: client-side html2pdf
      try {
        const html2pdf = window.html2pdf
        if (!html2pdf) {
          throw new Error('The PDF engine is still loading. Please try again in a few seconds.')
        }

        const element = document.getElementById('agreement-pdf-container')
        if (!element) {
          throw new Error('Agreement element not found')
        }

        const opt = {
          margin: 0,
          filename: `AIM_Partner_Agreement_${partnerId || 'Draft'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        }

        await html2pdf().from(element).set(opt).save()
        setDownloadSuccess('✅ Agreement downloaded (offline mode). Please sign and upload in Step 3.')
        setIsStep2Completed(true)
      } catch (clientErr) {
        console.error('Client-side PDF generation also failed:', clientErr)
        setPdfError(clientErr.message || 'Failed to generate PDF. Please try again.')
      }
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handleDownloadAndContinue = async () => {
    await handleDownload()
    // Only proceed if download was successful
    if (!pdfError) {
      onContinue()
    }
  }

  return (
    <div className="space-y-5">
      {/* Scope-specific Stylesheet to override hardcoded PDF styles for screen preview box */}
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

      {/* Invisible but properly rendered container for PDF generation (client-side fallback) */}
      <div
        style={{
          position: 'absolute',
          left: '0',
          top: '0',
          width: '210mm',
          height: '0',
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -9999
        }}
      >
        <AgreementDoc partnerData={combinedData} forPdf={true} />
      </div>

      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Registration Details */}
        <div className="col-span-12 md:col-span-5 min-w-0 overflow-hidden">
          <div className="rounded-2xl border border-white/10 bg-aim-navy-light/60 p-4 space-y-3 h-full">
            <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted pb-1.5 border-b border-white/5">
              Registration Details
            </p>
            
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-aim-copy-muted text-[10px] block uppercase tracking-wider font-semibold">Partner ID</span>
                <span className="text-white font-bold text-sm tracking-wide">{partnerData?.partner_id}</span>
              </div>
              
              <div>
                <span className="text-aim-copy-muted text-[10px] block uppercase tracking-wider font-semibold">Partner Name</span>
                <span className="text-white font-semibold">{combinedData.partner_name}</span>
              </div>

              <div>
                <span className="text-aim-copy-muted text-[10px] block uppercase tracking-wider font-semibold">Organization</span>
                <span className="text-white font-semibold">{combinedData.organization_name}</span>
              </div>

              <div>
                <span className="text-aim-copy-muted text-[10px] block uppercase tracking-wider font-semibold">Contact &amp; Email</span>
                <span className="text-white block font-medium">{combinedData.contact_no}</span>
                <span className="text-slate-300 block text-[11px] truncate">{combinedData.email}</span>
              </div>

              <div>
                <span className="text-aim-copy-muted text-[10px] block uppercase tracking-wider font-semibold">Location / Address</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {combinedData.address_line1}
                  {combinedData.address_line2 && <span className="block">{combinedData.address_line2}</span>}
                  <span className="block">{combinedData.district}, {combinedData.state} - {combinedData.pin_code}</span>
                </p>
              </div>

              <div className="pt-1.5">
                <span className="text-aim-copy-muted text-[10px] block uppercase tracking-wider font-semibold mb-1">Status</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  isStep2Completed 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isStep2Completed ? 'bg-emerald-400' : 'bg-yellow-400 animate-pulse'}`} />
                  {isStep2Completed ? 'Agreement Downloaded' : 'Pending Download'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Agreement Preview */}
        <div className="col-span-12 md:col-span-7 flex flex-col space-y-1.5 min-w-0 overflow-hidden">
          <label className="block text-[10px] font-bold text-aim-gold uppercase tracking-wider">
            Agreement Document Preview
          </label>
          <div className="flex-1 w-full max-w-full rounded-xl border border-white/10 bg-slate-950 p-3 overflow-y-auto min-h-[220px] max-h-[300px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent agreement-preview-box">
            {loadingStep2 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <svg className="w-5 h-5 animate-spin text-aim-gold/60" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-xs text-aim-copy-muted font-sans">Loading agreement contract...</span>
              </div>
            ) : agreementHtml ? (
              <div
                className="prose prose-sm max-w-none text-[11px] leading-relaxed"
                style={{ color: '#1e293b' }}
                dangerouslySetInnerHTML={{ __html: agreementHtml }}
              />
            ) : (
              <AgreementDoc partnerData={combinedData} />
            )}
          </div>
        </div>
      </div>

      {step2Error && (
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold">
          {step2Error}
        </div>
      )}

      {pdfError && (
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold">
          {pdfError}
        </div>
      )}

      {downloadSuccess && (
        <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
          {downloadSuccess}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Single Main Download & Continue button */}
        <button
          type="button"
          onClick={isStep2Completed ? onContinue : handleDownloadAndContinue}
          disabled={generatingPdf || !partnerId}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-black text-sm tracking-wide shadow-lg shadow-aim-gold/20 hover:shadow-aim-gold/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {generatingPdf ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Downloading Agreement...
            </span>
          ) : isStep2Completed ? (
            <>
              Proceed to Next Step →
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Agreement &amp; Proceed to Next Step →
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={generatingPdf}
          className="w-full py-2 rounded-xl border border-white/10 text-aim-copy-muted text-xs hover:text-white hover:border-white/20 transition-all cursor-pointer disabled:opacity-50"
        >
          ← Back
        </button>
      </div>

      {!isStep2Completed && (
        <p className="text-center text-aim-gold/80 text-[10px] font-semibold">
          ⚠️ Please download the agreement before proceeding to Step 3.
        </p>
      )}
    </div>
  )
}

export default Step2DownloadAgreement
