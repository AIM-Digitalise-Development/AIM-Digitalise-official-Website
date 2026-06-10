import React from 'react'

const Icons = {
  billing: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 033 3z" />
    </svg>
  ),
}

const BillingDetailsCard = ({ displayUser }) => {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition duration-300 space-y-4">
      <h4 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-aim-gold to-aim-gold-light uppercase tracking-wider block border-b border-white/5 pb-2 flex items-center gap-2">
        {Icons.billing}
        Billing Details
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
        <div className="space-y-1">
          <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">Client Name</span>
          <span className="text-white font-bold block truncate max-w-full">{displayUser?.client_name || displayUser?.name || '—'}</span>
        </div>
        <div className="space-y-1">
          <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">Client ID</span>
          <span className="text-white font-bold block truncate max-w-full font-mono">{displayUser?.client_id || '—'}</span>
        </div>
        <div className="space-y-1">
          <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">Email Address</span>
          <span className="text-white font-bold block truncate max-w-full break-all">{displayUser?.email || '—'}</span>
        </div>
        <div className="space-y-1">
          <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">Contact Number</span>
          <span className="text-white font-bold block truncate max-w-full">{displayUser?.contact_number || displayUser?.contact_no || displayUser?.mobile || displayUser?.phone || '—'}</span>
        </div>
        <div className="space-y-1">
          <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">Company / Organization</span>
          <span className="text-white font-bold block truncate max-w-full">{displayUser?.company_name || displayUser?.school_name || displayUser?.organization || displayUser?.company || '—'}</span>
        </div>
        <div className="space-y-1">
          <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">GSTIN</span>
          <span className="text-white font-bold block truncate max-w-full">{displayUser?.gstin || '—'}</span>
        </div>
        <div className="space-y-1 md:col-span-2">
          <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">Address Details</span>
          <span className="text-white font-bold block leading-relaxed break-words">{displayUser?.address || '—'}</span>
        </div>
        <div className="space-y-1">
          <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">City / District</span>
          <span className="text-white font-bold block truncate max-w-full">{displayUser?.city || displayUser?.district || '—'}</span>
        </div>
        <div className="space-y-1">
          <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">PIN Code</span>
          <span className="text-white font-bold block truncate max-w-full">{displayUser?.pin_code || displayUser?.zip || '—'}</span>
        </div>
      </div>
    </div>
  )
}

export default BillingDetailsCard
