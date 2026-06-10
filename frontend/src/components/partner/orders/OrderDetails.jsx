import OrderStatusBadge from './OrderStatusBadge'

const OrderDetails = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null

  const isSchool = !!order.school_name
  const isInstPro = order.product_name === 'NEXGN Institute Pro'
  const calculatedSub = (isInstPro && (!order.monthly_subscription || Number(order.monthly_subscription) === 0))
    ? 10 * (parseInt(order.total_students, 10) || 0)
    : order.monthly_subscription || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-aim-navy/95 p-6 shadow-2xl shadow-black/80 z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-aim-gold/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-black text-white">{order.client_name}</h3>
              <OrderStatusBadge status={order.payment_status} />
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                order.is_active 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {order.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-aim-copy-muted text-xs font-mono mt-1">Client ID: {order.client_id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-aim-copy-muted hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-5 text-sm">
          {/* Client Info Block */}
          <div className="space-y-2">
            <span className="text-[10px] text-aim-gold uppercase tracking-wider font-extrabold block">Client Information</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-white/5 bg-white/5">
              <div>
                <span className="text-[10px] text-aim-copy-muted uppercase block">Contact Name</span>
                <span className="text-white font-medium">{order.client_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-aim-copy-muted uppercase block">Email Address</span>
                <span className="text-white font-medium break-all">{order.email || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-aim-copy-muted uppercase block">Contact Number</span>
                <span className="text-white font-medium">{order.contact_number || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-aim-copy-muted uppercase block">Company / School</span>
                <span className="text-white font-medium">{order.company_name || order.school_name || '—'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-aim-copy-muted uppercase block">GSTIN</span>
                <span className="text-white font-medium font-mono">{order.gstin || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Product Details Block */}
          <div className="space-y-2">
            <span className="text-[10px] text-aim-gold uppercase tracking-wider font-extrabold block">Product Details</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-white/5 bg-white/5">
              <div className="col-span-2 sm:col-span-3">
                <span className="text-[10px] text-aim-copy-muted uppercase block">Product Purchased</span>
                <span className="text-white font-bold">{order.product_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-aim-copy-muted uppercase block">Category</span>
                <span className="text-white font-medium">{order.product_category || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-aim-copy-muted uppercase block">Processing Fee</span>
                <span className="text-white font-extrabold">₹{Number(order.processing_fee || 0).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-aim-copy-muted uppercase block">Monthly Subscription</span>
                <span className="text-aim-gold font-extrabold">₹{Number(calculatedSub).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Institute Details (Condition-based) */}
          {isSchool && (
            <div className="space-y-2">
              <span className="text-[10px] text-aim-gold uppercase tracking-wider font-extrabold block">Institute Specifics</span>
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-white/5 bg-white/5">
                <div>
                  <span className="text-[10px] text-aim-copy-muted uppercase block">School Short Name</span>
                  <span className="text-white font-medium">{order.school_short_name || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-aim-copy-muted uppercase block">Academic Session</span>
                  <span className="text-white font-medium">{order.school_session || '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-aim-copy-muted uppercase block">Total Students</span>
                  <span className="text-white font-medium">{order.total_students || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Address Details */}
          <div className="space-y-2">
            <span className="text-[10px] text-aim-gold uppercase tracking-wider font-extrabold block">Location & Address</span>
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-white/5 bg-white/5">
              <div className="col-span-2">
                <span className="text-[10px] text-aim-copy-muted uppercase block">Address</span>
                <span className="text-white font-medium text-xs leading-relaxed">{order.address || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-aim-copy-muted uppercase block">District</span>
                <span className="text-white font-medium">{order.district || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-aim-copy-muted uppercase block">State & PIN</span>
                <span className="text-white font-medium">{order.state || '—'} - {order.pin_code || '—'}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-2 border-t border-white/5 text-[10px] text-aim-copy-muted flex flex-col sm:flex-row sm:justify-between gap-1.5">
            <div>
              <span>Sold By: </span>
              <span className="text-white font-semibold">{order.partner?.name || '—'}</span>
              {order.partner?.organization && (
                <span> ({order.partner.organization})</span>
              )}
            </div>
            <div>
              <span>Date Sold: </span>
              <span className="text-white font-semibold">
                {order.created_at ? new Date(order.created_at).toLocaleString('en-IN') : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 text-aim-copy-muted text-xs hover:text-white hover:border-white/20 transition-all cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails