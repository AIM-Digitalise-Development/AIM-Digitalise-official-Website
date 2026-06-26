import { useState } from 'react'
import AgreementDoc from './AgreementDoc'

const Step2DownloadAgreement = ({ partnerData, step1FormValues, onContinue, onBack }) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [pdfError, setPdfError] = useState('')

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

  const handleDownload = async () => {
    setGeneratingPdf(true)
    setPdfError('')
    try {
      const html2pdf = window.html2pdf
      if (!html2pdf) {
        throw new Error('The PDF engine is still loading. Please try again in a few seconds.')
      }

      // Target the print-optimized container
      const element = document.getElementById('agreement-pdf-container')
      if (!element) {
        throw new Error('Agreement element not found')
      }

      const opt = {
        margin: 0,
        filename: `AIM_Partner_Agreement_${partnerData?.partner_id || 'Draft'}.pdf`,
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
    } catch (err) {
      console.error('PDF generation failed:', err)
      setPdfError(err.message || 'Failed to generate PDF. Please try again.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Invisible but properly rendered container for PDF generation */}
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

      {/* Partner info card */}
      <div className="rounded-2xl border border-white/10 bg-aim-navy-light/60 p-5 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted mb-3">Registration Details</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-aim-copy-muted text-xs block">Partner ID</span>
            <span className="text-white font-bold">#{partnerData?.partner_id}</span>
          </div>
          <div>
            <span className="text-aim-copy-muted text-xs block">Status</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-semibold border border-yellow-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              {partnerData?.registration_status || 'Pending'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-aim-copy-muted text-xs block">Email</span>
            <span className="text-white font-medium">{partnerData?.email}</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-2xl border border-aim-gold/20 bg-aim-gold/5 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-aim-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-bold text-aim-gold">Next Steps</p>
        </div>
        <ol className="space-y-2 text-sm text-aim-copy-muted list-none">
          {[
            'Review and sign the Partner Agreement',
            'Download the completed PDF document below',
            'Scan or photograph the signed agreement pages',
            'Upload it in the next step to finish registration',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-aim-gold/15 border border-aim-gold/30 text-aim-gold text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>

      {pdfError && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold">
          {pdfError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* View button */}
        <button
          type="button"
          onClick={() => setShowPreviewModal(true)}
          className="w-full py-3.5 rounded-xl border border-aim-gold/50 bg-aim-navy-light text-aim-gold font-bold text-xs tracking-wide hover:bg-aim-gold/5 hover:border-aim-gold hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Agreement
        </button>

        {/* Download button */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={generatingPdf}
          className="w-full py-3.5 rounded-xl border border-aim-gold/50 bg-aim-gold/15 text-aim-gold font-bold text-xs tracking-wide hover:bg-aim-gold/25 hover:border-aim-gold hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {generatingPdf ? (
            <span className="flex items-center gap-1">
              <span className="animate-spin">🔄</span> Saving...
            </span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* Continue button */}
      <button
        type="button"
        onClick={onContinue}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-black text-sm tracking-wide shadow-lg shadow-aim-gold/20 hover:shadow-aim-gold/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
      >
        I've Signed the Agreement → Proceed to Upload &amp; Pay
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full py-2.5 rounded-xl border border-white/10 text-aim-copy-muted text-sm hover:text-white hover:border-white/20 transition-all cursor-pointer"
      >
        ← Back
      </button>

      {/* --- PREVIEW MODAL OVERLAY --- */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-aim-navy-card/95 p-6 shadow-2xl z-10 flex flex-col max-h-[85vh] text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-base font-black text-white">Agreement Document Preview</h3>
                <p className="text-[10px] text-aim-copy-muted mt-0.5">Previewing your personalized Partnership Agreement</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-aim-copy-muted hover:text-white p-1 text-xl font-bold cursor-pointer transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-grow my-4 overflow-y-auto max-h-[60vh] rounded-xl border border-white/10 bg-slate-950 p-2 scrollbar-thin scrollbar-thumb-white/10">
              <AgreementDoc partnerData={combinedData} />
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10 flex justify-end gap-3 shrink-0">
              <button
                onClick={handleDownload}
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
    </div>
  )
}

export default Step2DownloadAgreement
