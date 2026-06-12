const OrgDetailsCard = ({ displayUser }) => {
  const rows = [
    { label: 'Company / Organization', value: displayUser?.company_name || displayUser?.school_name || displayUser?.organization || displayUser?.company },
    { label: 'School Short Name', value: displayUser?.school_short_name },
    { label: 'Academic Session', value: displayUser?.school_session || displayUser?.session },
    { label: 'Total Students', value: displayUser?.total_students },
    { label: 'GSTIN', value: displayUser?.gstin },
  ]

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #ebedf0' }}>
      <div className="px-5 py-3.5 flex items-center gap-2.5" style={{ borderBottom: '1px solid #ebedf0' }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#ede9fe' }}>
          <svg className="w-3.5 h-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h4 className="text-[13px] font-semibold text-gray-800">Organization Details</h4>
      </div>
      
      <div className="px-5 pb-2">
        {rows.map((row, i) => (
          <div key={row.label} className="flex items-center justify-between py-2.5" style={i < rows.length - 1 ? { borderBottom: '1px solid #f3f4f6' } : {}}>
            <span className="text-gray-400 text-[12px]">{row.label}</span>
            <span className="text-gray-700 text-[12px] font-semibold text-right ml-4">
              {row.value || '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrgDetailsCard
