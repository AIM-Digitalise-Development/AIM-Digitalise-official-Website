import React from 'react'

const Icons = {
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
  session: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  students: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  gstin: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
}

const OrgDetailsCard = ({ displayUser }) => {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:bg-white/10/30 transition duration-300 space-y-4">
      <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-aim-gold to-aim-gold-light uppercase tracking-wider block">
        Organization Details
      </span>
      <div className="space-y-3.5">
        {[
          { icon: Icons.org, label: 'Company / Organization', value: displayUser?.company_name || displayUser?.school_name || displayUser?.organization || displayUser?.company },
          { icon: Icons.tag, label: 'School Short Name', value: displayUser?.school_short_name },
          { icon: Icons.session, label: 'Academic Session', value: displayUser?.school_session || displayUser?.session },
          { icon: Icons.students, label: 'Total Students', value: displayUser?.total_students },
          { icon: Icons.gstin, label: 'GSTIN', value: displayUser?.gstin },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 text-aim-copy-muted">
              <span className="text-aim-gold">{row.icon}</span>
              <span className="text-xs font-medium">{row.label}</span>
            </div>
            <span className="text-xs font-bold text-white text-right ml-4">
              {row.value || '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrgDetailsCard
