import OrderStatusBadge from './OrderStatusBadge'

const OrderDetails = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-aim-navy-card/95 p-6 shadow-2xl shadow-black/80 z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-aim-gold/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-white">{order.client}</h3>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-aim-copy-muted text-xs font-mono mt-1">{order.id}</p>
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
        <div className="py-4 space-y-4 text-sm">
          {/* Order Specs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Order Date</span>
              <span className="text-white font-medium">{order.date}</span>
            </div>
            <div>
              <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Service Category</span>
              <span className="text-white font-medium">{order.category || 'NEXGN Software'}</span>
            </div>
            <div>
              <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Total Amount</span>
              <span className="text-white font-black">{order.amount}</span>
            </div>
            <div>
              <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Your Commission</span>
              <span className="text-aim-gold font-black">{order.commission || '₹1,875 (15%)'}</span>
            </div>
          </div>

          {/* Client Details */}
          <div className="p-3 rounded-xl border border-white/5 bg-white/5 space-y-1.5">
            <span className="text-[10px] text-aim-gold uppercase tracking-wider font-bold block">Client Information</span>
            <p className="text-xs text-white">Contact: <span className="text-aim-copy-muted">{order.clientContact || 'hr@techcorpindia.com'}</span></p>
            <p className="text-xs text-white">Status: <span className="text-aim-copy-muted">Subscription Active</span></p>
          </div>

          {/* Description */}
          <div>
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block mb-1">Service Details</span>
            <p className="text-xs text-aim-copy-muted leading-relaxed">
              {order.details || 'Enterprise SaaS software deployment with 24/7 priority support and custom integrations. Includes monthly maintenance and analytics dashboard access.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 text-aim-copy-muted text-xs hover:text-white hover:border-white/20 transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails