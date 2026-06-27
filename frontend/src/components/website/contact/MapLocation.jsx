const MapLocation = () => (
  <div className="card-elevated overflow-hidden flex flex-col min-h-[350px]">
    <div className="p-6 border-b border-aim-border">
      <h2 className="text-xl font-bold text-aim-copy">Kolkata Headquarters</h2>
      <p className="text-sm text-aim-copy-muted mt-1">Rajdanga Main Road — Corporate Office</p>
    </div>
    <div className="relative flex-1 min-h-[300px] bg-aim-navy-light">
      <iframe
        src="https://maps.google.com/maps?q=22.5134763,88.392694&z=16&output=embed"
        className="w-full h-full border-0 absolute inset-0 opacity-85 hover:opacity-100 transition-opacity"
        title="AIM Digitalise Headquarters Map"
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
    <div className="p-4 bg-aim-navy-card border-t border-aim-border text-center">
      <a
        href="https://maps.app.goo.gl/xRATJmKbeJnG5yaQA"
        target="_blank"
        rel="noopener noreferrer"
        className="link-brand text-sm inline-flex items-center gap-1.5 font-semibold hover:text-aim-gold transition-colors"
      >
        <span>Open in Google Maps</span>
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  </div>
)

export default MapLocation
