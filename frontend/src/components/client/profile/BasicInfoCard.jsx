import React from 'react'

const Icons = {
  clientId: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.333 0 4 .667 4 2v1H5v-1c0-1.333 2.667-2 4-2z" />
    </svg>
  ),
  name: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  email: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  contact: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  status: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
}

const BasicInfoCard = ({ displayUser }) => {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:bg-white/10/30 transition duration-300 space-y-4">
      <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-aim-gold to-aim-gold-light uppercase tracking-wider block">
        Basic Information
      </span>
      <div className="space-y-3.5">
        {[
          { icon: Icons.clientId, label: 'Client ID', value: displayUser?.client_id },
          { icon: Icons.name, label: 'Name', value: displayUser?.client_name || displayUser?.name },
          { icon: Icons.email, label: 'Email Address', value: displayUser?.email, isEmail: true },
          { icon: Icons.contact, label: 'Contact No', value: displayUser?.contact_number || displayUser?.contact_no || displayUser?.mobile || displayUser?.phone },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 text-aim-copy-muted">
              <span className="text-aim-gold">{row.icon}</span>
              <span className="text-xs font-medium">{row.label}</span>
            </div>
            <span className={`text-xs font-bold text-white text-right break-all ml-4 ${row.isEmail ? 'max-w-[200px]' : ''}`}>
              {row.value || '—'}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-aim-copy-muted">
            <span className="text-aim-gold">{Icons.status}</span>
            <span className="text-xs font-medium">Status</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            (displayUser?.status || 'Active').toLowerCase() === 'active'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
          }`}>
            {displayUser?.status || 'Active'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default BasicInfoCard
