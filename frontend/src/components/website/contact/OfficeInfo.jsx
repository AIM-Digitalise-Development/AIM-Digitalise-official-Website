const offices = [
  {
    label: 'Corporate Office',
    region: 'India',
    regionClass: 'bg-aim-gold/10 text-aim-gold border-aim-gold/20',
    address: '#139, 3rd Floor, Rajdanga Main Road, Kolkata - 700107',
  },
  {
    label: 'Branch Office',
    region: 'India',
    regionClass: 'bg-aim-gold/10 text-aim-gold border-aim-gold/20',
    address: '21/1F, Fern Road, 1st Floor Lalvilla, Ballygunge Kolkata - 700019',
  },
  {
    label: 'Corporate Office Nepal',
    region: 'Nepal',
    regionClass: 'bg-aim-purple/10 text-aim-purple border-aim-purple/20',
    address: 'ward 5, Dhangadhi Submetropolitan city Kailali,Sudurpaschim Pradesh Nepal',
  },
]

export default function OfficeInfo() {
  return (
  <div className="card-elevated p-8 relative overflow-hidden group text-left">
    {/* Inner glows */}
    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-aim-purple/5 rounded-full blur-3xl pointer-events-none" />
    
    <h2 className="text-2xl font-black text-white tracking-tight mb-6 relative z-10">Office Locations</h2>
    <div className="space-y-4 relative z-10">
      {offices.map((office) => (
        <div
          key={`${office.label}-${office.region}-${office.address}`}
          className="p-4 rounded-2xl border border-aim-border bg-aim-navy-muted/10 hover:bg-aim-navy-muted/20 hover:border-aim-gold/25 transition-all duration-300 flex items-start gap-3.5 group/loc"
        >
          <div className="p-2.5 rounded-xl bg-aim-navy/60 border border-white/5 text-aim-gold group-hover/loc:bg-aim-gold/10 group-hover/loc:text-aim-gold transition-colors shrink-0 mt-0.5">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-bold text-white uppercase tracking-wider">{office.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${office.regionClass}`}>
                {office.region}
              </span>
            </div>
            <p className="text-aim-copy-muted text-xs leading-relaxed">{office.address}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Direct Contacts Block */}
    <div className="mt-8 pt-6 border-t border-aim-border space-y-4 text-xs sm:text-sm relative z-10">
      {/* Email */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-aim-navy/40 border border-white/5 flex items-center justify-center text-aim-gold shrink-0">
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-wider leading-none mb-1">Email Support</p>
          <a href="mailto:support@aimdigitalise.com" className="link-brand font-bold text-xs truncate block">
            support@aimdigitalise.com
          </a>
        </div>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-aim-navy/40 border border-white/5 flex items-center justify-center text-aim-gold shrink-0">
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-wider leading-none mb-1">Sales Hotline</p>
          <a href="tel:+919875592050" className="link-brand font-bold text-xs truncate block">
            +91 98755 92050
          </a>
        </div>
      </div>

      {/* Hours */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-aim-navy/40 border border-white/5 flex items-center justify-center text-aim-gold shrink-0">
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-bold text-aim-copy-muted uppercase tracking-wider leading-none mb-1">Office Hours</p>
          <p className="text-white font-bold text-xs">10:00 AM – 7:00 PM IST (Mon - Sat)</p>
        </div>
      </div>
    </div>
  </div>
  )
}
