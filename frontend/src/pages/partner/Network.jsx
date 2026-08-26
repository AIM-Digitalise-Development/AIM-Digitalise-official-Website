import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { getPartnerSubordinates, getPartnerProfile } from '../../api/partner'
import { usePartnerAuthStore } from '../../store/partnerAuthStore'
import RankBadge, { getRankConfig } from '../../components/partner/network/RankBadge'
import NetworkSummaryCards from '../../components/partner/network/NetworkSummaryCards'
import HierarchyTreeNode from '../../components/partner/network/HierarchyTreeNode'
import SubordinatesTable from '../../components/partner/network/SubordinatesTable'
import PartnerDetailModal from '../../components/partner/network/PartnerDetailModal'

const PartnerNetwork = () => {
  const { 
    partnerUser, 
    setPartnerUser, 
    subordinatesData, 
    setSubordinatesData 
  } = usePartnerAuthStore()

  const [loading, setLoading] = useState(!subordinatesData)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('tree') // 'tree' | 'table'
  const [treeSearch, setTreeSearch] = useState('')
  const [treeRankFilter, setTreeRankFilter] = useState('all')
  const [selectedPartner, setSelectedPartner] = useState(null)

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
    else if (!subordinatesData) setLoading(true)
    setError(null)

    try {
      // Parallel fetch profile + subordinates
      const [subRes, profRes] = await Promise.allSettled([
        getPartnerSubordinates(),
        getPartnerProfile(),
      ])

      if (subRes.status === 'fulfilled' && subRes.value.data?.success) {
        setSubordinatesData(subRes.value.data.data)
      } else if (!subordinatesData) {
        setError(subRes.value?.data?.message || 'Failed to fetch subordinates hierarchy')
      }

      if (profRes.status === 'fulfilled' && profRes.value.data?.success) {
        setPartnerUser(profRes.value.data.data)
      }
    } catch (err) {
      if (!subordinatesData) {
        setError(err.message || 'Error loading partner network')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const currentPartner = {
    id: subordinatesData?.partner?.id || partnerUser?.id || 2,
    partner_id: subordinatesData?.partner?.partner_id || partnerUser?.partner_id || 'PIDIN26052',
    name: subordinatesData?.partner?.name || partnerUser?.partner_name || partnerUser?.name || 'Partner',
    rank: subordinatesData?.partner?.rank || partnerUser?.rank || partnerUser?.partner_rank || partnerUser?.partner_type || 'associate',
  }

  const summary = subordinatesData?.summary || {
    total_subordinates: 0,
    total_masters: 0,
    total_associates: 0,
    total_downline: 0,
    total_downline_revenue: 0,
  }

  const hierarchyTree = subordinatesData?.hierarchy_tree || {
    id: currentPartner.id,
    partner_id: currentPartner.partner_id,
    partner_name: currentPartner.name,
    organization_name: partnerUser?.organization_name || partnerUser?.organization || 'My Organization',
    email: partnerUser?.email || '',
    contact_no: partnerUser?.contact_no || '',
    rank: currentPartner.rank,
    is_active: true,
    sales_summary: {
      total_sales: 0,
      total_revenue: 0,
      active_clients: 0,
    },
    children: [],
  }

  const allSubordinates = subordinatesData?.all_subordinates || []
  const rankConfig = getRankConfig(currentPartner.rank)

  return (
    <>
      <Helmet>
        <title>My Network & Hierarchy Tree | AIM Partner</title>
      </Helmet>

      <div className="space-y-6 pb-12">
        {/* Header Profile & Rank Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#131722] via-[#161a29] to-[#121522] border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-aim-gold/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${rankConfig.avatarBg} border flex items-center justify-center shrink-0 font-black text-2xl sm:text-3xl shadow-xl`}>
                {(currentPartner.name || partnerUser?.name || 'P').charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    {currentPartner.name || partnerUser?.partner_name || 'My Network'}
                  </h1>
                  <RankBadge rank={currentPartner.rank} size="sm" />
                </div>
                
                <p className="text-xs sm:text-sm text-aim-gold font-medium">
                  {partnerUser?.organization_name || partnerUser?.organization || 'AIM Partner Network'}
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="font-mono text-gray-300 font-bold">{currentPartner.partner_id}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-aim-copy-muted">
                  {partnerUser?.email && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {partnerUser.email}
                    </span>
                  )}
                  {partnerUser?.contact_no && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {partnerUser.contact_no}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="flex items-center gap-3 self-start md:self-center">
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-200 border border-white/10 hover:border-aim-gold/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg
                  className={`w-4 h-4 text-aim-gold ${refreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh Network'}
              </button>
            </div>
          </div>
        </div>

        {/* 5 KPI Summary Cards */}
        <NetworkSummaryCards summary={summary} />

        {/* View Switcher & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          {/* Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-[#131722] border border-white/10 self-start">
            <button
              onClick={() => setActiveTab('tree')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tree'
                  ? 'bg-aim-gold text-aim-navy shadow-md shadow-aim-gold/20'
                  : 'text-aim-copy-muted hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Hierarchy Tree View
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-aim-gold text-aim-navy shadow-md shadow-aim-gold/20'
                  : 'text-aim-copy-muted hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Direct Subordinates Table ({allSubordinates.length})
            </button>
          </div>

          {/* Hierarchy Legend */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-aim-copy-muted text-[11px] font-semibold uppercase tracking-wider">Ranks:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-bold">
              👑 Master
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px] font-bold">
              🛡️ Associate
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-bold">
              💎 Premium
            </span>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="p-12 text-center rounded-3xl bg-[#131722]/60 border border-white/10">
            <div className="w-10 h-10 border-2 border-aim-gold/30 border-t-aim-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-white">Loading partner hierarchy tree...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-sm text-red-400 font-semibold">{error}</p>
            <button
              onClick={() => fetchData(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Tab 1: Hierarchy Tree View */}
        {!loading && activeTab === 'tree' && (
          <div className="space-y-4">
            {/* Tree View Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#131722]/80 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
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
                  value={treeSearch}
                  onChange={(e) => setTreeSearch(e.target.value)}
                  placeholder="Filter tree by partner name, ID, or organization..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-aim-copy-muted focus:outline-none focus:border-aim-gold/50 transition-all"
                />
              </div>

              {/* Rank Filter Pill Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['all', 'master', 'associate', 'premium'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTreeRankFilter(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                      treeRankFilter === r
                        ? 'bg-aim-gold text-aim-navy'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {r === 'all' ? 'All Ranks' : r}
                  </button>
                ))}
              </div>
            </div>

            {/* Tree Canvas */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#131722]/50 border border-white/10 backdrop-blur-xl overflow-x-auto min-h-[400px]">
              <HierarchyTreeNode
                node={hierarchyTree}
                isRoot={true}
                level={0}
                onSelectPartner={(partner) => setSelectedPartner(partner)}
                searchTerm={treeSearch}
                selectedRank={treeRankFilter}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Direct Subordinates Table View */}
        {!loading && activeTab === 'table' && (
          <SubordinatesTable
            subordinates={allSubordinates}
            onSelectPartner={(partner) => setSelectedPartner(partner)}
          />
        )}

        {/* Partner Details Modal */}
        <PartnerDetailModal
          partner={selectedPartner}
          isOpen={!!selectedPartner}
          onClose={() => setSelectedPartner(null)}
        />
      </div>
    </>
  )
}

export default PartnerNetwork
