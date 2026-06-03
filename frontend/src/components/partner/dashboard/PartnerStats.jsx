const stats = [
  { label: 'Total Orders', value: '156', icon: '📦', color: 'text-aim-gold', bg: 'bg-aim-gold/10 border-aim-gold/20' },
  { label: 'Active Clients', value: '24', icon: '👥', color: 'text-aim-purple-light', bg: 'bg-aim-purple/10 border-aim-purple/20' },
  { label: 'Commission Rate', value: '15%', icon: '💹', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { label: 'Referrals', value: '38', icon: '🔗', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
]

const PartnerStats = () => (
  <div className="rounded-2xl border border-white/10 bg-aim-navy-light/60 p-6 space-y-4">
    <p className="text-[10px] font-black uppercase tracking-widest text-aim-copy-muted">Partner Stats</p>
    <div className="grid grid-cols-2 gap-3">
      {stats.map(({ label, value, icon, color, bg }) => (
        <div key={label} className={`rounded-xl border p-4 ${bg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">{icon}</span>
          </div>
          <p className={`text-2xl font-black ${color}`}>{value}</p>
          <p className="text-[10px] text-aim-copy-muted uppercase tracking-wider mt-1">{label}</p>
        </div>
      ))}
    </div>
  </div>
)

export default PartnerStats