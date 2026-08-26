import React from 'react'

export const getRankConfig = (rank) => {
  const normalized = (rank || '').toLowerCase().trim()
  
  if (normalized.includes('premium')) {
    return {
      name: 'Premium Partner',
      shortName: 'Premium',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
      pillClass: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30',
      glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.15)] border-emerald-500/30',
      textColor: 'text-emerald-400',
      gradientText: 'from-emerald-400 to-teal-200',
      dotColor: 'bg-emerald-400',
      avatarBg: 'from-emerald-500/30 via-teal-500/20 to-emerald-700/30 text-emerald-300 border-emerald-500/30',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    }
  }

  if (normalized.includes('master')) {
    return {
      name: 'Master Partner',
      shortName: 'Master',
      badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30 shadow-purple-500/10',
      pillClass: 'from-purple-500/20 to-pink-500/10 text-purple-300 border-purple-500/30',
      glowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.15)] border-purple-500/30',
      textColor: 'text-purple-400',
      gradientText: 'from-purple-400 via-pink-400 to-amber-300',
      dotColor: 'bg-purple-400',
      avatarBg: 'from-purple-600/30 via-indigo-600/20 to-pink-600/30 text-purple-200 border-purple-500/30',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 16l3-8 4 5 4-5 3 8H5z" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="8" cy="8" r="1" />
          <circle cx="16" cy="8" r="1" />
        </svg>
      ),
    }
  }

  // Default: Associate Partner
  return {
    name: 'Associate Partner',
    shortName: 'Associate',
    badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30 shadow-blue-500/10',
    pillClass: 'from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30',
    glowClass: 'shadow-[0_0_15px_rgba(59,130,246,0.15)] border-blue-500/30',
    textColor: 'text-blue-400',
    gradientText: 'from-blue-400 to-cyan-300',
    dotColor: 'bg-blue-400',
    avatarBg: 'from-blue-600/30 via-sky-600/20 to-cyan-600/30 text-blue-200 border-blue-500/30',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  }
}

const RankBadge = ({ rank, size = 'sm', showIcon = true, className = '' }) => {
  const config = getRankConfig(rank)

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 gap-1 font-semibold',
    sm: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
    md: 'text-sm px-3.5 py-1.5 gap-2 font-black',
    lg: 'text-base px-4 py-2 gap-2 font-black tracking-wide',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm transition-all ${config.badgeClass} ${sizeClasses[size] || sizeClasses.sm} ${className}`}
    >
      {showIcon && <span className="shrink-0">{config.icon}</span>}
      <span className="capitalize">{config.name}</span>
    </span>
  )
}

export default RankBadge
