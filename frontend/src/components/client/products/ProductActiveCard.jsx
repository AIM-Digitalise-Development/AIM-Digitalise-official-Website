import React from 'react'

const ProductActiveCard = ({ activeProduct }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-[#101730] border border-white/10 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
      {/* Interactive floating glows */}
      <div className="absolute -right-16 -bottom-16 w-52 h-52 bg-aim-gold/15 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition duration-500" />
      <div className="absolute -left-16 -top-16 w-52 h-52 bg-aim-purple/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition duration-500" />
      
      <div className="relative z-10 flex flex-col justify-between space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-2xl font-black tracking-tight">{activeProduct?.product_name || activeProduct?.name || '—'}</h3>
            <span className="text-aim-copy-muted text-xs font-bold block mt-1 uppercase tracking-widest font-mono">
              {activeProduct?.category || activeProduct?.product_category || 'NEXGN'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-wider shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {activeProduct?.status || 'Active'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-5 border-t border-white/10">
          <div>
            <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">Processing Fee</span>
            <span className="text-lg font-black mt-0.5 block text-white">₹{Number(activeProduct?.processing_fee || 0).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">Monthly Subscription</span>
            <span className="text-lg font-black mt-0.5 block text-white">₹{Number(activeProduct?.monthly_subscription || 0).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-aim-copy-muted text-[9px] uppercase font-bold tracking-wider block">Payment Status</span>
            <span className={`inline-block text-xs font-black uppercase mt-1.5 ${
              (activeProduct?.payment_status || '').toLowerCase() === 'paid' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {activeProduct?.payment_status || 'Unpaid'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductActiveCard
