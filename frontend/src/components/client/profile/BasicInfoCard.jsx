const BasicInfoCard = ({ displayUser }) => {
  const rows = [
    { label: 'Client ID', value: displayUser?.client_id },
    { label: 'Full Name', value: displayUser?.client_name || displayUser?.name },
    { label: 'Email Address', value: displayUser?.email },
    { label: 'Contact No', value: displayUser?.contact_number || displayUser?.contact_no || displayUser?.mobile || displayUser?.phone },
  ]

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #ebedf0' }}>
      <div className="px-5 py-3.5 flex items-center gap-2.5" style={{ borderBottom: '1px solid #ebedf0' }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#dbeafe' }}>
          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h4 className="text-[13px] font-semibold text-gray-800">Basic Information</h4>
      </div>
      
      <div className="px-5 pb-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <span className="text-gray-400 text-[12px]">{row.label}</span>
            <span className="text-gray-700 text-[12px] font-semibold text-right ml-4 break-all max-w-[200px]">
              {row.value || '—'}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between py-2.5">
          <span className="text-gray-400 text-[12px]">Status</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
            (displayUser?.status || 'Active').toLowerCase() === 'active'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-amber-50 text-amber-600'
          }`}>
            {displayUser?.status || 'Active'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default BasicInfoCard
