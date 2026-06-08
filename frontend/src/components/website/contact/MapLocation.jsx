const MapLocation = () => (
  <div className="card-elevated overflow-hidden">
    <div className="p-6 border-b border-aim-border">
      <h2 className="text-xl font-bold text-aim-copy">Kolkata headquarters</h2>
      <p className="text-sm text-aim-copy-muted mt-1">Rajdanga Main Road — corporate office</p>
    </div>
    <div className="relative h-64 bg-gradient-to-br from-aim-gold/5 via-aim-navy-light to-aim-purple/5 flex items-center justify-center">
      <div className="absolute inset-0 bg-grid-pattern opacity-40" aria-hidden />
      <div className="relative text-center px-6 space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-aim-navy-card border-2 border-aim-gold/40 flex items-center justify-center shadow-brand-gold animate-bounce-gentle">
          <svg className="w-6 h-6 text-aim-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-aim-copy-muted">
          Interactive map integration can be added here
        </p>
        <a
          href="https://maps.google.com/?q=Rajdanga+Main+Road+Kolkata"
          target="_blank"
          rel="noopener noreferrer"
          className="link-brand text-sm inline-block font-semibold"
        >
          Open in Google Maps →
        </a>
      </div>
    </div>
  </div>
)

export default MapLocation
