import React from 'react'

const Icons = {
  products: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  clientId: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.333 0 4 .667 4 2v1H5v-1c0-1.333 2.667-2 4-2z" />
    </svg>
  ),
  org: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  category: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 01-2-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  paymentStatus: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h2a2 2 0 002 2" />
    </svg>
  ),
  calendar: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
}

const PurchaseInfoCard = ({ activeProduct }) => {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:bg-white/10/30 transition duration-300 space-y-4">
      <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-aim-gold to-aim-gold-light uppercase tracking-wider block">
        Purchase Information
      </span>
      <div className="space-y-3.5">
        {[
          { icon: Icons.products, label: 'Product Name', value: activeProduct?.product_name || activeProduct?.name },
          { icon: Icons.category, label: 'Product Category', value: activeProduct?.category || activeProduct?.product_category, isUpper: true },
          { icon: Icons.clientId, label: 'Processing Fee', value: activeProduct?.processing_fee ? `₹${Number(activeProduct.processing_fee).toLocaleString('en-IN')}` : null },
          { icon: Icons.products, label: 'Monthly Subscription', value: activeProduct?.monthly_subscription ? `₹${Number(activeProduct.monthly_subscription).toLocaleString('en-IN')}` : null },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 text-aim-copy-muted">
              <span className="text-aim-gold">{row.icon}</span>
              <span className="text-xs font-medium">{row.label}</span>
            </div>
            <span className={`text-xs font-bold text-white text-right ml-4 ${row.isUpper ? 'uppercase' : ''}`}>
              {row.value || '—'}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
          <div className="flex items-center gap-2 text-aim-copy-muted">
            <span className="text-aim-gold">{Icons.paymentStatus}</span>
            <span className="text-xs font-medium">Payment Status</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            (activeProduct?.payment_status || '').toLowerCase() === 'paid'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            {activeProduct?.payment_status || 'Unpaid'}
          </span>
        </div>
        {[
          { icon: Icons.calendar, label: 'Date Purchased', value: activeProduct?.created_at || activeProduct?.purchase_date ? new Date(activeProduct.created_at || activeProduct.purchase_date).toLocaleDateString('en-IN') : null },
          { icon: Icons.calendar, label: 'Date Activated', value: activeProduct?.activated_at ? new Date(activeProduct.activated_at).toLocaleDateString('en-IN') : null },
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

export default PurchaseInfoCard
