import React, { useState, useMemo } from 'react'
import RankBadge from './RankBadge'

const SubordinatesTable = ({ subordinates = [], onSelectPartner }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [rankFilter, setRankFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name') // name | sales | revenue | subordinates
  const [sortOrder, setSortOrder] = useState('asc')

  const filteredAndSorted = useMemo(() => {
    return subordinates
      .filter((sub) => {
        // Search
        const query = searchTerm.toLowerCase().trim()
        const matchName = (sub.partner_name || '').toLowerCase().includes(query)
        const matchOrg = (sub.organization_name || '').toLowerCase().includes(query)
        const matchId = (sub.partner_id || '').toLowerCase().includes(query)
        const matchEmail = (sub.email || '').toLowerCase().includes(query)
        const searchOk = !query || matchName || matchOrg || matchId || matchEmail

        // Rank
        const rankOk = rankFilter === 'all' || (sub.rank || '').toLowerCase() === rankFilter.toLowerCase()

        // Status
        const statusOk =
          statusFilter === 'all' ||
          (statusFilter === 'active' && sub.is_active) ||
          (statusFilter === 'inactive' && !sub.is_active)

        return searchOk && rankOk && statusOk
      })
      .sort((a, b) => {
        let valA, valB
        if (sortBy === 'name') {
          valA = (a.partner_name || '').toLowerCase()
          valB = (b.partner_name || '').toLowerCase()
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
        }
        if (sortBy === 'sales') {
          valA = a.sales_summary?.total_sales || 0
          valB = b.sales_summary?.total_sales || 0
        } else if (sortBy === 'revenue') {
          valA = a.sales_summary?.total_revenue || 0
          valB = b.sales_summary?.total_revenue || 0
        } else if (sortBy === 'subordinates') {
          valA = a.total_subordinates || 0
          valB = b.total_subordinates || 0
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA
      })
  }, [subordinates, searchTerm, rankFilter, statusFilter, sortBy, sortOrder])

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#131722]/80 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="w-4 h-4 text-aim-copy-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search partner name, ID, org, or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-aim-copy-muted focus:outline-none focus:border-aim-gold/50 focus:ring-1 focus:ring-aim-gold/50 transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5">
          {/* Rank Filter */}
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-aim-gold/50 cursor-pointer"
          >
            <option value="all" className="bg-[#131722] text-white">All Ranks</option>
            <option value="master" className="bg-[#131722] text-purple-400">Master Partners</option>
            <option value="associate" className="bg-[#131722] text-blue-400">Associate Partners</option>
            <option value="premium" className="bg-[#131722] text-emerald-400">Premium Partners</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-aim-gold/50 cursor-pointer"
          >
            <option value="all" className="bg-[#131722] text-white">All Status</option>
            <option value="active" className="bg-[#131722] text-green-400">Active</option>
            <option value="inactive" className="bg-[#131722] text-red-400">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-white/10 bg-[#131722]/80 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider text-aim-copy-muted">
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">
                    <span>Partner & Org</span>
                    {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white text-center" onClick={() => handleSort('sales')}>
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Sales</span>
                    {sortBy === 'sales' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white text-right" onClick={() => handleSort('revenue')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Revenue</span>
                    {sortBy === 'revenue' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white text-center" onClick={() => handleSort('subordinates')}>
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Sub-Team</span>
                    {sortBy === 'subordinates' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
              {filteredAndSorted.length > 0 ? (
                filteredAndSorted.map((sub) => (
                  <tr
                    key={sub.id || sub.partner_id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Partner & Org */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-aim-gold font-black text-xs shrink-0">
                          {(sub.partner_name || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white group-hover:text-aim-gold transition-colors truncate">
                            {sub.partner_name || 'Partner Name'}
                          </p>
                          <p className="text-[11px] text-aim-copy-muted truncate">
                            {sub.organization_name || 'Organization'} • <span className="font-mono text-gray-400">{sub.partner_id}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Rank Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <RankBadge rank={sub.rank} size="xs" />
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="text-white text-xs">{sub.contact_no || '—'}</p>
                      <p className="text-[11px] text-aim-copy-muted truncate max-w-[140px]">{sub.email || '—'}</p>
                    </td>

                    {/* Sales */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap font-bold text-white">
                      {sub.sales_summary?.total_sales ?? 0}
                    </td>

                    {/* Revenue */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-black text-emerald-400">
                      ₹{Number(sub.sales_summary?.total_revenue || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Subordinates count */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-bold text-gray-300">
                        {sub.total_subordinates ?? 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          sub.is_active
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sub.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                        {sub.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectPartner && onSelectPartner(sub)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-aim-gold/10 text-gray-300 hover:text-aim-gold border border-white/10 hover:border-aim-gold/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        View Info
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-aim-copy-muted">
                    <p className="text-sm font-semibold">No direct subordinates found matching the filters.</p>
                    <p className="text-xs mt-1 text-gray-500">Try adjusting your search terms or filter selection.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SubordinatesTable
