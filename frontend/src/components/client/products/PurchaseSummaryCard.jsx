const PurchaseSummaryCard = ({ activeProduct }) => {
  const rows = [
    { label: 'Product Category', value: activeProduct?.category || activeProduct?.product_category, isUpper: true },
    { label: 'Processing Fee', value: activeProduct?.processing_fee ? `₹${Number(activeProduct.processing_fee).toLocaleString('en-IN')}` : null },
    { label: 'Monthly Subscription', value: activeProduct?.monthly_subscription ? `₹${Number(activeProduct.monthly_subscription).toLocaleString('en-IN')}` : null },
    { label: 'Purchased Date', value: activeProduct?.created_at || activeProduct?.purchase_date ? new Date(activeProduct.created_at || activeProduct.purchase_date).toLocaleDateString('en-IN') : null },
    { label: 'Activated Date', value: activeProduct?.activated_at ? new Date(activeProduct.activated_at).toLocaleDateString('en-IN') : null },
  ]

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #ebedf0' }}>
      <div className="px-5 py-3.5 flex items-center gap-2.5" style={{ borderBottom: '1px solid #ebedf0' }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#ede9fe' }}>
          <svg className="w-3.5 h-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h4 className="text-[13px] font-semibold text-gray-800">Purchase Summary</h4>
      </div>
      
      <div className="px-5 pb-2">
        {rows.map((row, i) => (
          <div key={row.label} className="flex items-center justify-between py-2.5" style={i < rows.length ? { borderBottom: '1px solid #f3f4f6' } : {}}>
            <span className="text-gray-400 text-[12px]">{row.label}</span>
            <span className={`text-gray-700 text-[12px] font-semibold text-right ${row.isUpper ? 'uppercase' : ''}`}>
              {row.value || '—'}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between py-2.5">
          <span className="text-gray-400 text-[12px]">Payment Status</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
            (activeProduct?.payment_status || '').toLowerCase() === 'paid'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-amber-50 text-amber-600'
          }`}>
            {activeProduct?.payment_status || 'Unpaid'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PurchaseSummaryCard
