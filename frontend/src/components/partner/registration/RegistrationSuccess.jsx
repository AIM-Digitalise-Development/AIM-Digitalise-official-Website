import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'

const RegistrationSuccess = ({ partnerData, verifyData, step1FormValues }) => {
  const token = verifyData?.data?.token || verifyData?.token || ''
  const partner = verifyData?.data?.partner || verifyData?.partner || {}
  const isNepal = partnerData?.country === 'Nepal' || partnerData?.country_code === 'NP' || partner?.country === 'Nepal' || verifyData?.data?.currency === 'NPR' || verifyData?.offline

  return (
    <div className="text-center space-y-5">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-aim-gold/20 to-aim-purple/20 border-2 border-aim-gold/40 flex items-center justify-center shadow-xl shadow-aim-gold/10">
          <svg className="w-8 h-8 text-aim-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-black text-white mb-1.5">Registration Application Complete! 🎉</h2>
        <p className="text-aim-copy-muted text-xs leading-relaxed max-w-md mx-auto">
          {isNepal ? (
            <span>
              Your signed agreement and registration details have been submitted. Account is now <span className="text-aim-gold font-bold">awaiting admin cash verification &amp; activation</span>.
            </span>
          ) : (
            <span>
              Your registration and online payment are complete. Your account is now <span className="text-aim-gold font-bold">pending admin activation</span>.
            </span>
          )}
        </p>
      </div>

      {/* Details card */}
      <div className="rounded-2xl border border-white/10 bg-aim-navy-light/60 p-4 text-left space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted">Account Details</p>
          <span className="text-[10px] font-bold text-aim-gold px-2 py-0.5 rounded-full bg-aim-gold/10 border border-aim-gold/20">
            {isNepal ? '🇳🇵 Nepal Region' : '🇮🇳 India Region'}
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          {[
            { label: 'Partner ID', value: partnerData?.partner_id || partner?.partner_id || partner?.id || '—' },
            { label: 'Name', value: partner?.partner_name || partner?.name || partnerData?.partner_name || step1FormValues?.partner_name || '—' },
            { label: 'Email', value: partner?.email || partnerData?.email || step1FormValues?.email || '—' },
            { label: 'Organization', value: partner?.organization_name || partner?.organization || partnerData?.organization_name || step1FormValues?.organization_name || '—' },
            { label: 'Registration Fee', value: isNepal ? 'NPR 18,080 (incl. 13% VAT)' : '₹5,900 (incl. 18% GST)' },
            { label: 'Payment Method', value: isNepal ? '💵 Offline Cash (Pay to Admin)' : '💳 Razorpay Online' },
            { label: 'Account Status', value: isNepal ? '⏳ Cash Verification Pending' : '⏳ Pending Admin Activation' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-0.5">
              <span className="text-aim-copy-muted text-xs">{label}</span>
              <span className="text-white font-semibold">{value}</span>
            </div>
          ))}
        </div>

        {isNepal && (
          <div className="mt-3 p-3 rounded-xl border border-aim-gold/30 bg-aim-gold/5 space-y-1">
            <p className="text-[11px] font-bold text-aim-gold">📌 What happens next for Nepal Partners?</p>
            <p className="text-[10px] text-aim-copy-muted leading-relaxed">
              Please pay the <strong className="text-white">NPR 18,080</strong> registration fee in cash to your designated AIM Digitalise Relationship Manager or Admin. Once received, the Super Admin will approve and activate your account. You can then sign in directly with your Partner ID.
            </p>
          </div>
        )}

        {token && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-[10px] text-aim-copy-muted mb-1 uppercase tracking-widest">Auth Token</p>
            <code className="text-[9px] text-aim-gold/80 break-all font-mono leading-relaxed">
              {token.substring(0, 60)}...
            </code>
          </div>
        )}
      </div>

      {/* CTA */}
      <Link
        to={ROUTES.PARTNER.LOGIN}
        className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-black text-sm tracking-wide shadow-lg shadow-aim-gold/20 hover:shadow-aim-gold/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-center"
      >
        Go to Partner Login →
      </Link>

      <Link
        to={ROUTES.HOME}
        className="block text-xs text-aim-copy-muted hover:text-aim-highlight transition-colors"
      >
        ← Back to Home
      </Link>
    </div>
  )
}

export default RegistrationSuccess
