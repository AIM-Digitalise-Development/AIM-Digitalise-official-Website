import React from 'react'

const NetworkSummaryCards = ({ summary = {} }) => {
  const cards = [
    {
      title: 'Direct Partners',
      value: summary?.total_subordinates ?? 0,
      subtext: 'Direct Level-1 partners',
      icon: (
        <svg className="w-5 h-5 text-aim-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgGlow: 'from-aim-gold/15 to-transparent',
      borderColor: 'border-aim-gold/30',
      badge: 'Direct Tier',
      badgeColor: 'bg-aim-gold/10 text-aim-gold border-aim-gold/20',
    },
    {
      title: 'Direct Masters',
      value: summary?.total_masters ?? 0,
      subtext: 'Master rank sub-partners',
      icon: (
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 16l3-8 4 5 4-5 3 8H5z" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="8" cy="8" r="1" />
          <circle cx="16" cy="8" r="1" />
        </svg>
      ),
      bgGlow: 'from-purple-500/15 to-transparent',
      borderColor: 'border-purple-500/30',
      badge: 'Master Rank',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    },
    {
      title: 'Direct Associates',
      value: summary?.total_associates ?? 0,
      subtext: 'Associate rank sub-partners',
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      bgGlow: 'from-blue-500/15 to-transparent',
      borderColor: 'border-blue-500/30',
      badge: 'Associate Rank',
      badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    },
    {
      title: 'Total Downline',
      value: summary?.total_downline ?? 0,
      subtext: 'Cumulative downline network',
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      bgGlow: 'from-indigo-500/15 to-transparent',
      borderColor: 'border-indigo-500/30',
      badge: 'Full Tree',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    },
    {
      title: 'Downline Sales Revenue',
      value: `₹${Number(summary?.total_downline_revenue || 0).toLocaleString('en-IN')}`,
      subtext: 'Total team sales volume',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGlow: 'from-emerald-500/15 to-transparent',
      borderColor: 'border-emerald-500/30',
      badge: 'Cumulative',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      isRevenue: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`relative overflow-hidden rounded-2xl bg-[#131722]/80 backdrop-blur-md border ${card.borderColor} p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}
        >
          {/* Subtle Ambient Gradient */}
          <div className={`absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-gradient-to-br ${card.bgGlow} blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60`} />

          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              {card.icon}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
              {card.badge}
            </span>
          </div>

          <div>
            <p className="text-xs text-aim-copy-muted font-medium uppercase tracking-wider">{card.title}</p>
            <h3 className={`text-xl sm:text-2xl font-black text-white mt-1 tracking-tight truncate ${card.isRevenue ? 'text-emerald-400' : ''}`}>
              {card.value}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1 truncate">{card.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NetworkSummaryCards
