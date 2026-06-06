import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'

const RegistrationSuccess = ({ partnerData, verifyData }) => {
  const token = verifyData?.token || ''
  const partner = verifyData?.partner || {}

  return (
    <div className="text-center space-y-6">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-aim-gold/20 to-aim-purple/20 border-2 border-aim-gold/40 flex items-center justify-center shadow-xl shadow-aim-gold/10">
          <svg className="w-10 h-10 text-aim-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black text-white mb-2">Registration Complete! 🎉</h2>
        <p className="text-aim-copy-muted text-sm leading-relaxed max-w-sm mx-auto">
          Your registration and payment are complete. Your account is now <span className="text-aim-gold font-semibold">pending admin approval</span>. You'll be able to log in once an admin activates your account.
        </p>
      </div>

      {/* Details card */}
      <div className="rounded-2xl border border-white/10 bg-aim-navy-light/60 p-5 text-left space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted">Account Details</p>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Partner ID', value: partnerData?.partner_id || partner?.partner_id || '—' },
            { label: 'Name', value: partner?.name || partnerData?.partner_name || '—' },
            { label: 'Email', value: partner?.email || partnerData?.email || '—' },
            { label: 'Organization', value: partner?.organization || partnerData?.organization_name || '—' },
            { label: 'Account Status', value: 'Pending Admin Activation' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-aim-copy-muted text-xs">{label}</span>
              <span className="text-white font-semibold">{value}</span>
            </div>
          ))}
        </div>
        {token && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-[10px] text-aim-copy-muted mb-1.5 uppercase tracking-widest">Auth Token</p>
            <code className="text-[10px] text-aim-gold/80 break-all font-mono leading-relaxed">
              {token.substring(0, 60)}...
            </code>
          </div>
        )}
      </div>

      {/* CTA */}
      <Link
        to={ROUTES.PARTNER.LOGIN}
        className="block w-full py-4 rounded-xl bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-black text-sm tracking-wide shadow-lg shadow-aim-gold/20 hover:shadow-aim-gold/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-center"
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
