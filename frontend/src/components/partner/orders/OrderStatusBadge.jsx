const OrderStatusBadge = ({ status }) => {
  const normalized = status?.toLowerCase() || 'pending'
  
  let styles = 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
  let dotColor = 'bg-yellow-400'

  if (normalized === 'active') {
    styles = 'bg-green-500/10 border-green-500/20 text-green-400'
    dotColor = 'bg-green-400'
  } else if (normalized === 'completed') {
    styles = 'bg-white/5 border-white/10 text-aim-copy-muted'
    dotColor = 'bg-aim-copy-muted'
  } else if (normalized === 'cancelled' || normalized === 'failed') {
    styles = 'bg-red-500/10 border-red-500/20 text-red-400'
    dotColor = 'bg-red-400'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      {status}
    </span>
  )
}

export default OrderStatusBadge