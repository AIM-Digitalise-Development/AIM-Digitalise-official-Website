import OrderStatusBadge from './OrderStatusBadge'

const OrderCard = ({ order, onClick }) => {
  if (!order) return null

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl border border-white/10 bg-aim-navy-light/40 hover:bg-aim-navy-light/60 p-5 transition-all duration-300 hover:scale-[1.01] hover:border-aim-gold/30 hover:shadow-lg hover:shadow-aim-gold/5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-aim-gold/5 to-transparent rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h4 className="text-white font-bold text-base group-hover:text-aim-gold transition-colors">
            {order.client_name}
          </h4>
          <OrderStatusBadge status={order.payment_status} />
        </div>
        <div className="flex items-center gap-4 text-[11px] text-aim-copy-muted font-medium">
          <span className="font-mono">ID: {order.client_id}</span>
          <span>•</span>
          <span>{order.product_name}</span>
          {order.created_at && (
            <>
              <span>•</span>
              <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-2 shrink-0">
        <div>
          <span className="text-[10px] text-aim-copy-muted block sm:text-right uppercase tracking-wider">Processing Fee</span>
          <p className="text-white font-black text-sm sm:text-right">
            ₹{Number(order.processing_fee || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-aim-gold/80 block sm:text-right uppercase tracking-wider font-semibold">Monthly Subscription</span>
          <p className="text-aim-gold font-black text-sm">
            ₹{Number(order.monthly_subscription || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default OrderCard