import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PartnerLoginForm from '../../components/partner/auth/PartnerLoginForm'
import { ROUTES } from '../../constants/routes'
import plogo from '../../assets/images/plogo.jpeg'

const PartnerLogin = () => {
  return (
    <>
      <Helmet>
        <title>Partner Login | AIM Digitalise</title>
        <meta name="description" content="Sign in to the AIM Digitalise Partner Portal to manage your earnings, orders, and payouts." />
      </Helmet>

      <div className="min-h-screen bg-aim-navy flex flex-col relative overflow-hidden">
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

        {/* Main */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="relative rounded-3xl border border-white/10 bg-aim-navy-card/75 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl shadow-black/80 transition-all duration-300">
              {/* Internal Ambient glows */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-aim-gold/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-aim-purple/15 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 text-center mb-8">
                {/* Partner badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-aim-gold/10 border border-aim-gold/20 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-aim-gold animate-pulse" />
                  <span className="text-aim-gold text-[10px] font-black uppercase tracking-widest">Partner Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Welcome Back</h1>
                <p className="text-xs text-aim-copy-muted leading-relaxed">
                  Sign in to manage your earnings, client orders, and payout schedules.
                </p>
              </div>

              {/* Form */}
              <div className="relative z-10">
                <PartnerLoginForm />
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-aim-copy-muted mt-8">
              Having trouble?质量{' '}
              <a href="mailto:support@aimdigitalise.com" className="text-aim-gold hover:text-aim-gold-light transition-colors font-bold underline underline-offset-4">
                Contact Technical Support
              </a>
            </p>
          </div>
        </main>
      </div>
    </>
  )
}

export default PartnerLogin
