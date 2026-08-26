import React from 'react'
import RankBadge, { getRankConfig } from './RankBadge'

const PartnerDetailModal = ({ partner, isOpen, onClose }) => {
  if (!isOpen || !partner) return null

  const rankConfig = getRankConfig(partner.rank)
  const sales = partner.sales_summary || {
    total_sales: 0,
    total_revenue: 0,
    active_clients: 0,
  }

  const childCount = partner.children ? partner.children.length : (partner.total_subordinates ?? 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#131722] border border-white/10 shadow-2xl overflow-hidden p-6 sm:p-7 transition-all">
        {/* Top Header Background Glow */}
        <div className={`absolute top-0 left-0 right-0 h-28 bg-gradient-to-b ${rankConfig.avatarBg} opacity-20 pointer-events-none`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10 z-10"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="relative flex items-start gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${rankConfig.avatarBg} border flex items-center justify-center shrink-0 shadow-lg text-xl font-black`}>
            {(partner.partner_name || partner.name || 'P').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <RankBadge rank={partner.rank} size="xs" />
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                partner.is_active
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${partner.is_active ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                {partner.is_active ? 'Active Partner' : 'Inactive'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white truncate">
              {partner.partner_name || partner.name || 'Unknown Partner'}
            </h3>
            <p className="text-xs text-aim-gold font-medium truncate">
              {partner.organization_name || 'Organization Name'}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-4">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Partner ID</p>
              <p className="text-white font-bold font-mono mt-0.5">{partner.partner_id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Parent / RM ID</p>
              <p className="text-aim-copy-muted font-bold font-mono mt-0.5">{partner.parent_partner_id || 'Primary Account'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Email Address</p>
              <p className="text-white font-medium truncate mt-0.5">{partner.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Contact Number</p>
              <p className="text-white font-medium mt-0.5">{partner.contact_no || 'N/A'}</p>
            </div>
          </div>

          {/* Sales Performance Summary */}
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-gray-300 mb-2">Sales & Business Summary</p>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-center">
                <p className="text-[10px] text-blue-300 uppercase tracking-wider font-semibold">Total Sales</p>
                <p className="text-lg font-black text-white mt-0.5">{sales.total_sales ?? 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                <p className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Total Revenue</p>
                <p className="text-lg font-black text-emerald-400 mt-0.5">₹{Number(sales.total_revenue || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
                <p className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold">Active Clients</p>
                <p className="text-lg font-black text-white mt-0.5">{sales.active_clients ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Direct Downline count */}
          <div className="p-3.5 rounded-xl bg-aim-gold/5 border border-aim-gold/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-aim-gold/10 text-aim-gold flex items-center justify-center font-bold text-sm border border-aim-gold/20">
                👥
              </div>
              <div>
                <p className="text-xs font-bold text-white">Direct Subordinates</p>
                <p className="text-[10px] text-gray-400">Team members registered directly under this partner</p>
              </div>
            </div>
            <span className="text-base font-black text-aim-gold px-3 py-1 bg-white/5 rounded-lg border border-white/10">
              {childCount}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default PartnerDetailModal
