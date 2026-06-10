import React from 'react'

const Icons = {
  address: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  org: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  tag: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
}

const AddressCard = ({ displayUser }) => {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:bg-white/10/30 transition duration-300 space-y-4">
      <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-aim-gold to-aim-gold-light uppercase tracking-wider block">
        Location & Address
      </span>
      <div className="space-y-3.5">
        <div className="flex flex-col gap-1 border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2 text-aim-copy-muted">
            <span className="text-aim-gold">{Icons.address}</span>
            <span className="text-xs font-medium">Street Address</span>
          </div>
          <span className="text-xs font-bold text-white leading-relaxed mt-1">
            {displayUser?.address || '—'}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2 text-aim-copy-muted">
            <span className="text-aim-gold">{Icons.org}</span>
            <span className="text-xs font-medium">City & State</span>
          </div>
          <span className="text-xs font-bold text-white text-right">
            {[displayUser?.city || displayUser?.district, displayUser?.state].filter(Boolean).join(', ') || '—'}
          </span>
        </div>
        <div className="flex items-center justify-between last:border-0">
          <div className="flex items-center gap-2 text-aim-copy-muted">
            <span className="text-aim-gold">{Icons.tag}</span>
            <span className="text-xs font-medium">PIN Code</span>
          </div>
          <span className="text-xs font-bold text-white">
            {displayUser?.pin_code || displayUser?.zip || '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default AddressCard
