const AddressCard = ({ displayUser }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #ebedf0' }}>
      <div className="px-5 py-3.5 flex items-center gap-2.5" style={{ borderBottom: '1px solid #ebedf0' }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#fef3c7' }}>
          <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h4 className="text-[13px] font-semibold text-gray-800">Location & Address</h4>
      </div>
      
      <div className="px-5 pb-2">
        <div className="py-2.5" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <span className="text-gray-400 text-[12px] block">Street Address</span>
          <span className="text-gray-700 text-[12px] font-semibold leading-relaxed mt-0.5 block">
            {displayUser?.address || '—'}
          </span>
        </div>
        <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <span className="text-gray-400 text-[12px]">City & State</span>
          <span className="text-gray-700 text-[12px] font-semibold text-right">
            {[displayUser?.city || displayUser?.district, displayUser?.state].filter(Boolean).join(', ') || '—'}
          </span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-gray-400 text-[12px]">PIN Code</span>
          <span className="text-gray-700 text-[12px] font-semibold">
            {displayUser?.pin_code || displayUser?.zip || '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default AddressCard
