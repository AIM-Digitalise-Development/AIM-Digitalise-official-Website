const orders = [
  { id: 'ORD-4821', client: 'TechCorp India', amount: '₹12,500', status: 'Active', statusColor: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { id: 'ORD-4820', client: 'Spark Solutions', amount: '₹8,200', status: 'Pending', statusColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  { id: 'ORD-4819', client: 'NexaRetail Ltd', amount: '₹21,000', status: 'Completed', statusColor: 'text-aim-copy-muted bg-white/5 border-white/10' },
]

const RecentOrders = () => (
  <div className="rounded-2xl border border-white/10 bg-aim-navy-light/60 p-6 space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted">Recent Orders</p>
      <span className="text-[10px] text-aim-gold font-semibold cursor-pointer hover:underline">View all →</span>
    </div>
    <div className="space-y-3">
      {orders.map(({ id, client, amount, status, statusColor }) => (
        <div key={id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
          <div>
            <p className="text-white text-xs font-semibold">{client}</p>
            <p className="text-aim-copy-muted text-[10px] mt-0.5">{id}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-white font-bold text-xs">{amount}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
              {status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default RecentOrders