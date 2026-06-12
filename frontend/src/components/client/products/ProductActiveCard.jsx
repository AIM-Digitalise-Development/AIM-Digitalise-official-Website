const ProductActiveCard = ({ activeProduct }) => {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a2e3d 0%, #1f3a4f 50%, #264d66 100%)' }}>
      <div className="p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-white/40 mb-1">Active Product</p>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {activeProduct?.product_name || activeProduct?.name || '—'}
            </h3>
            <span className="text-white/40 text-[11px] font-medium block mt-1 uppercase tracking-wider">
              {activeProduct?.category || activeProduct?.product_category || 'NEXGN'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-md uppercase tracking-wide"
            style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {activeProduct?.status || 'Active'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 pt-5 mt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { label: 'Processing Fee', value: `₹${Number(activeProduct?.processing_fee || 0).toLocaleString('en-IN')}` },
            { label: 'Monthly Subscription', value: `₹${Number(activeProduct?.monthly_subscription || 0).toLocaleString('en-IN')}` },
            { label: 'Payment Status', value: activeProduct?.payment_status || 'Unpaid', isStatus: true },
          ].map((item) => (
            <div key={item.label}>
              <span className="text-white/30 text-[10px] uppercase font-medium tracking-wider block">{item.label}</span>
              {item.isStatus ? (
                <span className={`inline-block text-[12px] font-semibold uppercase mt-1.5 ${
                  (item.value || '').toLowerCase() === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                }`}>{item.value}</span>
              ) : (
                <span className="text-lg font-bold mt-1 block text-white">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductActiveCard
