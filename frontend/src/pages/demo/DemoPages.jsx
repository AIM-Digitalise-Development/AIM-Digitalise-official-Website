/* Generic demo pages with rich placeholder data */

const sections = {
  'saas-clients': {
    title: '🏫 SaaS Clients',
    subtitle: 'Manage all SaaS-based school clients',
    data: [
      { name: 'Greenwood Public School', plan: 'Annual Enterprise', students: 420, status: 'Active', mrr: '₹4,200', joined: 'Mar 2025', contact: 'principal@greenwood.edu' },
      { name: 'Bright Minds Academy', plan: 'Quarterly Pro', students: 310, status: 'Active', mrr: '₹3,100', joined: 'Jun 2025', contact: 'admin@brightminds.edu' },
      { name: 'St. Xavier High School', plan: 'Annual Enterprise', students: 580, status: 'Active', mrr: '₹5,800', joined: 'Jan 2025', contact: 'office@stxavier.edu' },
      { name: 'Sunrise International', plan: 'Monthly Basic', students: 190, status: 'Trial', mrr: '₹1,900', joined: 'Jun 2026', contact: 'info@sunrise.edu' },
      { name: 'Pioneer Learning Hub', plan: 'Annual Pro', students: 260, status: 'Active', mrr: '₹2,600', joined: 'Feb 2025', contact: 'admin@pioneer.edu' },
      { name: 'Lotus Valley School', plan: 'Quarterly Basic', students: 145, status: 'Expired', mrr: '₹1,450', joined: 'Aug 2024', contact: 'info@lotusvalley.edu' },
    ],
  },
}

const DemoGenericPage = ({ section = 'saas-clients' }) => {
  const s = sections[section] || sections['saas-clients']

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-4 border-b border-white/5">
        <h1 className="text-2xl font-black text-white">{s.title}</h1>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">{s.subtitle}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: s.data.length, color: '#3b82f6' },
          { label: 'Active', value: s.data.filter(d => d.status === 'Active').length, color: '#38b34a' },
          { label: 'Trial/Expired', value: s.data.filter(d => d.status !== 'Active').length, color: '#f59e0b' },
        ].map(c => (
          <div key={c.label} className="rounded-2xl p-4 text-center" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-3xl font-black" style={{ color: c.color }}>{c.value}</p>
            <p className="text-[11px] text-gray-500 font-bold mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-black text-white">Client Directory</h3>
            <button className="px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer" style={{ background: 'rgba(56,179,74,0.15)', color: '#38b34a', border: '1px solid rgba(56,179,74,0.3)' }}>+ Add Client</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                {['School Name', 'Plan', 'Students', 'Monthly Revenue', 'Status', 'Contact', 'Joined'].map(h => (
                  <th key={h} className="px-4 py-3 font-black text-gray-500 uppercase tracking-wider text-[9px] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {s.data.map((row, i) => (
                <tr key={i} className="hover:bg-white/3 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>{row.name[0]}</div>
                      <span className="font-bold text-white whitespace-nowrap">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap">{row.plan}</td>
                  <td className="px-4 py-3.5 font-bold text-white">{row.students}</td>
                  <td className="px-4 py-3.5 font-black text-[#38b34a]">{row.mrr}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${row.status === 'Active' ? 'text-green-400 bg-green-400/10' : row.status === 'Trial' ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'}`}>{row.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-[10px]">{row.contact}</td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{row.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Individual page exports ─── */
export const DemoSaasClients = () => <DemoGenericPage section="saas-clients" />

export const DemoComingSoon = ({ title, icon = '🚧' }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="pb-4 border-b border-white/5">
      <h1 className="text-2xl font-black text-white">{icon} {title}</h1>
      <p className="text-[12px] text-gray-500 mt-0.5 font-medium">This section contains demo data</p>
    </div>
    <div className="rounded-2xl p-16 text-center" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-xl font-black text-white mb-2">{title}</h2>
      <p className="text-[13px] text-gray-500 max-w-md mx-auto">This is a demo portal. In the live version, this section would display real-time data from your database.</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {['View Reports', 'Export Data', 'Configure', 'Manage'].map(btn => (
          <button key={btn} className="px-4 py-2 rounded-xl text-[12px] font-bold cursor-pointer transition-all hover:scale-105" style={{ background: 'rgba(56,179,74,0.12)', color: '#38b34a', border: '1px solid rgba(56,179,74,0.3)' }}>{btn}</button>
        ))}
      </div>
    </div>
  </div>
)

export default DemoGenericPage
