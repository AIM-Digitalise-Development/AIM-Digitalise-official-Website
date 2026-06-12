const PurchaseInfoCard = ({ activeProduct }) => {
  const infoRows = [
    { label: 'Product Name', value: activeProduct?.product_name || activeProduct?.name },
    { label: 'Product Category', value: activeProduct?.category || activeProduct?.product_category, isUpper: true },
    { label: 'Processing Fee', value: activeProduct?.processing_fee ? `₹${Number(activeProduct.processing_fee).toLocaleString('en-IN')}` : null },
    { label: 'Monthly Subscription', value: activeProduct?.monthly_subscription ? `₹${Number(activeProduct.monthly_subscription).toLocaleString('en-IN')}` : null },
  ]

  const dateRows = [
    { label: 'Date Purchased', value: activeProduct?.created_at || activeProduct?.purchase_date ? new Date(activeProduct.created_at || activeProduct.purchase_date).toLocaleDateString('en-IN') : null },
    { label: 'Date Activated', value: activeProduct?.activated_at ? new Date(activeProduct.activated_at).toLocaleDateString('en-IN') : null },
  ]

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #ebedf0' }}>
      <div className="px-5 py-3.5 flex items-center gap-2.5" style={{ borderBottom: '1px solid #ebedf0' }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#e8f5f0' }}>
          <svg className="w-3.5 h-3.5" style={{ color: '#1a6b54' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h4 className="text-[13px] font-semibold text-gray-800">Purchase Information</h4>
      </div>
      
      <div className="px-5 pb-2">
        {infoRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <span className="text-gray-400 text-[12px]">{row.label}</span>
            <span className={`text-gray-700 text-[12px] font-semibold text-right ml-4 ${row.isUpper ? 'uppercase' : ''}`}>
              {row.value || '—'}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <span className="text-gray-400 text-[12px]">Payment Status</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
            (activeProduct?.payment_status || '').toLowerCase() === 'paid'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-amber-50 text-amber-600'
          }`}>
            {activeProduct?.payment_status || 'Unpaid'}
          </span>
        </div>
        {dateRows.map((row, i) => (
          <div key={row.label} className="flex items-center justify-between py-2.5" style={i < dateRows.length - 1 ? { borderBottom: '1px solid #f3f4f6' } : {}}>
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

export default PurchaseInfoCard
