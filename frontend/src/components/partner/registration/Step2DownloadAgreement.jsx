import { getAgreementDownloadUrl } from '../../../api/partner'

const Step2DownloadAgreement = ({ partnerData, onContinue, onBack }) => {
  const downloadUrl = getAgreementDownloadUrl()

  const handleDownload = () => {
    window.open(downloadUrl, '_blank')
  }

  return (
    <div className="space-y-6">
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
            'Download the Partner Agreement PDF below',
            'Print and sign the agreement',
            'Scan or photograph the signed agreement',
            'Upload it in the next step along with payment',
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

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        className="w-full py-4 rounded-xl border-2 border-aim-gold/50 bg-aim-gold/10 text-aim-gold font-black text-sm tracking-wide hover:bg-aim-gold/20 hover:border-aim-gold hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Partner Agreement PDF
      </button>

      {/* Continue button */}
      <button
        type="button"
        onClick={onContinue}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-black text-sm tracking-wide shadow-lg shadow-aim-gold/20 hover:shadow-aim-gold/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
      >
        I've Signed the Agreement → Proceed to Upload &amp; Pay
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full py-2.5 rounded-xl border border-white/10 text-aim-copy-muted text-sm hover:text-white hover:border-white/20 transition-all"
      >
        ← Back
      </button>
    </div>
  )
}

export default Step2DownloadAgreement
