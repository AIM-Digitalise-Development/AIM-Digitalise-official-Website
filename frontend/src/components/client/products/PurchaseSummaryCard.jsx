import React from 'react'

const PurchaseSummaryCard = ({ activeProduct }) => {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition duration-300 space-y-4">
      <h4 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-aim-gold to-aim-gold-light uppercase tracking-wider block border-b border-white/5 pb-2 flex items-center gap-2">
        <svg className="w-5 h-5 text-aim-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Purchase Summary
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
        {[
          { label: 'Product Category', value: activeProduct?.category || activeProduct?.product_category, isUpper: true },
          { label: 'Processing Fee', value: activeProduct?.processing_fee ? `₹${Number(activeProduct.processing_fee).toLocaleString('en-IN')}` : null },
          { label: 'Monthly Subscription', value: activeProduct?.monthly_subscription ? `₹${Number(activeProduct.monthly_subscription).toLocaleString('en-IN')}` : null },
        ].map((col) => (
          <div key={col.label} className="space-y-1">
            <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">{col.label}</span>
            <span className={`text-white font-bold block ${col.isUpper ? 'uppercase' : ''}`}>{col.value || '—'}</span>
          </div>
        ))}
        <div className="space-y-1">
          <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">Payment Status</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
            (activeProduct?.payment_status || '').toLowerCase() === 'paid'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            {activeProduct?.payment_status || 'Unpaid'}
          </span>
        </div>
        {[
          { label: 'Purchased Date', value: activeProduct?.created_at || activeProduct?.purchase_date ? new Date(activeProduct.created_at || activeProduct.purchase_date).toLocaleDateString('en-IN') : null },
          { label: 'Activated Date', value: activeProduct?.activated_at ? new Date(activeProduct.activated_at).toLocaleDateString('en-IN') : null },
        ].map((col) => (
          <div key={col.label} className="space-y-1">
            <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">{col.label}</span>
            <span className="text-white font-bold block">{col.value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PurchaseSummaryCard
