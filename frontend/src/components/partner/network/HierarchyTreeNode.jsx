import React, { useState, useEffect } from 'react'
import RankBadge, { getRankConfig } from './RankBadge'

const HierarchyTreeNode = ({
  node,
  isRoot = false,
  level = 0,
  onSelectPartner,
  searchTerm = '',
  selectedRank = 'all',
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!node) return null

  const hasChildren = Array.isArray(node.children) && node.children.length > 0
  const rankConfig = getRankConfig(node.rank)
  const sales = node.sales_summary || {
    total_sales: 0,
    total_revenue: 0,
    active_clients: 0,
  }

  // Check if current node matches search
  const query = (searchTerm || '').toLowerCase().trim()
  const nameMatch = (node.partner_name || node.name || '').toLowerCase().includes(query)
  const idMatch = (node.partner_id || '').toLowerCase().includes(query)
  const orgMatch = (node.organization_name || '').toLowerCase().includes(query)
  const isMatch = query === '' || nameMatch || idMatch || orgMatch

  // Rank filter
  const rankFilterMatch = selectedRank === 'all' || (node.rank || '').toLowerCase() === selectedRank.toLowerCase()

  // Auto-expand if child or node matches search
  useEffect(() => {
    if (query) {
      setIsExpanded(true)
    }
  }, [query])

  return (
    <div className="relative flex flex-col items-start w-full">
      {/* Node Card Container */}
      <div className="flex items-start gap-2 w-full max-w-2xl">
        {/* Card Box */}
        <div
          className={`relative flex-1 rounded-2xl border transition-all duration-300 ${
            isRoot
              ? 'bg-gradient-to-br from-[#1a1f33] to-[#121524] border-aim-gold/40 shadow-lg shadow-aim-gold/5'
              : 'bg-[#131722]/90 hover:bg-[#181d2c] border-white/10 hover:border-white/20'
          } ${isMatch ? '' : 'opacity-40'} ${rankConfig.glowClass} p-4 sm:p-5`}
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/5">
            <div className="flex items-center gap-3 min-w-0">
              {/* Partner Avatar / Initial */}
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rankConfig.avatarBg} border flex items-center justify-center shrink-0 font-black text-sm shadow-md`}
              >
                {(node.partner_name || node.name || 'P').charAt(0).toUpperCase()}
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-bold text-white truncate">
                    {node.partner_name || node.name || 'Partner Name'}
                  </h4>
                  {isRoot && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-aim-gold text-aim-navy shadow-sm">
                      You (Root)
                    </span>
                  )}
                </div>
                <p className="text-xs text-aim-copy-muted truncate">
                  {node.organization_name || 'Organization'}
                </p>
              </div>
            </div>

            {/* Rank Badge & Action */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <RankBadge rank={node.rank} size="xs" />
              <button
                onClick={() => onSelectPartner && onSelectPartner(node)}
                title="View Partner Details"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Info & Sales Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-1 text-xs">
            <div className="bg-white/[0.02] p-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Partner ID</span>
              <span className="font-mono font-bold text-white text-xs truncate block">{node.partner_id || '—'}</span>
            </div>
            <div className="bg-white/[0.02] p-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Sales Count</span>
              <span className="font-bold text-white text-xs block">{sales.total_sales ?? 0}</span>
            </div>
            <div className="bg-white/[0.02] p-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Revenue</span>
              <span className="font-bold text-emerald-400 text-xs truncate block">₹{Number(sales.total_revenue || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-white/[0.02] p-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Active Clients</span>
              <span className="font-bold text-aim-gold text-xs block">{sales.active_clients ?? 0}</span>
            </div>
          </div>

          {/* Expand / Collapse Action Footer if has children */}
          {hasChildren && (
            <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-white/5">
              <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-aim-gold/70" />
                {node.children.length} direct subordinate{node.children.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-aim-gold hover:text-white border border-white/10 transition-all cursor-pointer"
              >
                <span>{isExpanded ? 'Collapse Branch' : 'Expand Branch'}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recursive Children with Tree Branch Visual Lines */}
      {hasChildren && isExpanded && (
        <div className="relative pl-6 sm:pl-10 mt-4 space-y-4 w-full border-l-2 border-dashed border-aim-gold/20 ml-4 sm:ml-6">
          {node.children
            .filter((child) => rankFilterMatch ? true : (child.rank || '').toLowerCase() === selectedRank.toLowerCase())
            .map((childNode, index) => (
              <div key={childNode.id || childNode.partner_id || index} className="relative">
                {/* Horizontal branch line connecting to parent */}
                <div className="absolute -left-6 sm:-left-10 top-6 w-6 sm:w-10 h-0.5 border-t-2 border-dashed border-aim-gold/20 pointer-events-none" />
                <HierarchyTreeNode
                  node={childNode}
                  isRoot={false}
                  level={level + 1}
                  onSelectPartner={onSelectPartner}
                  searchTerm={searchTerm}
                  selectedRank={selectedRank}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default HierarchyTreeNode
