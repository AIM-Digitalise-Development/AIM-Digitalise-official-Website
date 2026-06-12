const InfoRow = ({ label, value, isLast }) => (
  <div className="flex items-center justify-between py-2.5" style={!isLast ? { borderBottom: '1px solid #f3f4f6' } : {}}>
    <span className="text-gray-400 text-[12px]">{label}</span>
    <span className="text-gray-700 text-[12px] font-semibold text-right ml-4 truncate max-w-[220px]">{value || '—'}</span>
  </div>
)

const BillingDetailsCard = ({ displayUser }) => {
  const rows = [
    { label: 'Client Name', value: displayUser?.client_name || displayUser?.name },
    { label: 'Client ID', value: displayUser?.client_id },
    { label: 'Email Address', value: displayUser?.email },
    { label: 'Contact Number', value: displayUser?.contact_number || displayUser?.contact_no || displayUser?.mobile || displayUser?.phone },
    { label: 'Company / Organization', value: displayUser?.company_name || displayUser?.school_name || displayUser?.organization || displayUser?.company },
    { label: 'GSTIN', value: displayUser?.gstin },
  ]

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #ebedf0' }}>
      <div className="px-5 py-3.5 flex items-center gap-2.5" style={{ borderBottom: '1px solid #ebedf0' }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#e8f5f0' }}>
          <svg className="w-3.5 h-3.5" style={{ color: '#1a6b54' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h4 className="text-[13px] font-semibold text-gray-800">Billing Details</h4>
      </div>
      
      <div className="px-5 pb-2">
        {rows.map((row, i) => (
          <InfoRow key={row.label} {...row} isLast={i === rows.length - 1} />
        ))}
        <div className="py-2.5" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <span className="text-gray-400 text-[12px] block">Address</span>
          <span className="text-gray-700 text-[12px] font-semibold mt-0.5 block leading-relaxed">{displayUser?.address || '—'}</span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-gray-400 text-[12px]">City / PIN Code</span>
          <span className="text-gray-700 text-[12px] font-semibold">
            {[displayUser?.city || displayUser?.district, displayUser?.pin_code || displayUser?.zip].filter(Boolean).join(' – ') || '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default BillingDetailsCard
