import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PartnerLoginForm from '../../components/partner/auth/PartnerLoginForm'
import { ROUTES } from '../../constants/routes'

const PartnerLogin = () => {
  return (
    <>
      <Helmet>
        <title>Partner Login | AIM Digitalise</title>
        <meta name="description" content="Sign in to the AIM Digitalise Partner Portal to manage your earnings, orders, and payouts." />
      </Helmet>

      <div className="min-h-screen bg-aim-navy flex flex-col">
        {/* Background decorations */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-aim-gold/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-aim-purple/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
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
              to={ROUTES.PARTNER.REGISTER}
              className="text-xs font-semibold text-aim-copy-muted hover:text-aim-gold transition-colors"
            >
              Not a partner? Register →
            </Link>
          </div>
        </header>

        {/* Main */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="relative rounded-2xl border border-white/10 bg-aim-navy-card/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/60">
              {/* Ambient glows */}
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-aim-gold/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-40 h-40 bg-aim-purple/10 rounded-full blur-2xl pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 text-center mb-8">
                {/* Partner badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-aim-gold/10 border border-aim-gold/20 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-aim-gold animate-pulse" />
                  <span className="text-aim-gold text-[10px] font-bold uppercase tracking-widest">Partner Portal</span>
                </div>
                <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Welcome Back</h1>
                <p className="text-xs text-aim-copy-muted leading-relaxed">
                  Sign in to manage your earnings, orders, and payouts.
                </p>
              </div>

              {/* Form */}
              <div className="relative z-10">
                <PartnerLoginForm />
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-aim-copy-muted mt-6">
              Having trouble?{' '}
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

export default PartnerLogin
