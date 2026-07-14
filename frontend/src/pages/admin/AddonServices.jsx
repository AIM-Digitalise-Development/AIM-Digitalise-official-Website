import { useState, useEffect, useMemo } from 'react'
import { getAdminClients, getAdminClientById } from '../../api/admin/partners'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtCurrency = (v) => {
  if (v === undefined || v === null) return '—'
  const n = typeof v === 'string' ? parseFloat(v) : v
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

const ADDON_COLORS = {
  Transportation: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '🚌' },
  Hostel: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', icon: '🏢' },
  'Previous Year Backup': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: '💾' },
  'Domain Services': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '🌐' },
  'ID Card Type A': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '🪪' },
  'ID Card Type B': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', icon: '🪪' },
  'ID Card Type C': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: '🪪' },
}

const addonColor = (type) => ADDON_COLORS[type] || { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '🔌' }

// ─── Component ────────────────────────────────────────────────────────────────
const AdminAddonServices = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addonRows, setAddonRows] = useState([])   // flat list: { client info + one addon payment }
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // ── Catalog (static service definitions shown to admin) ────────────────────
  const catalog = [
    { icon: '🌐', label: 'Domain Services', category: 'Domain', desc: "Client's own live domain integration on website & Software. Secure SSL setup included.", price: '₹7,300/year' },
    { icon: '🪪', label: 'ID Card Type A (Super PVC)', category: 'ID Cards', desc: 'Ready Card — 20mm multi-color ribbon, PVC Super Card, Card Holder & clip.', price: '₹60 / card' },
    { icon: '🪪', label: 'ID Card Type B (Regular PVC)', category: 'ID Cards', desc: 'Ready Card — 16mm single-color ribbon, PVC Regular Card, Card Holder & clip.', price: '₹42 / card' },
    { icon: '🪪', label: 'ID Card Type C (Laminated)', category: 'ID Cards', desc: 'Single-color Ribbon, Gum Pasting Laminated Card with Card Holder & clip.', price: '₹37 / card' },
    { icon: '🚌', label: 'Transportation Services', category: 'Transit', desc: 'GPS-enabled transportation logging, route tracking, SMS alerts & fee management.', price: '₹36 / student / year' },
    { icon: '🏢', label: 'Hostel Services', category: 'Hostel', desc: 'Dormitory allocation, mess billing, warden controls & entry log tracking.', price: '₹60 / student / year' },
    { icon: '💾', label: 'Previous Year Data Backup', category: 'Archives', desc: 'Secure archival backup DB. Retrieve historical records, attendance & audit logs.', price: '₹36 / student / year' },
  ]

  // ── Fetch all clients + their addon payments ───────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError(null)
      try {
        const clientsRes = await getAdminClients()
        const clients = clientsRes?.all_clients || clientsRes?.data?.all_clients || []

        // Fetch details for each client in parallel (capped to avoid hammering)
        const detailResults = await Promise.allSettled(
          clients.map((c) => getAdminClientById(c.id))
        )

        const rows = []
        detailResults.forEach((result, idx) => {
          if (result.status !== 'fulfilled') return
          const d = result.value
          const clientInfo = {
            client_id: d?.client_id || clients[idx]?.client_id,
            client_name: d?.client_name || clients[idx]?.client_name,
            company_name: d?.company_name || clients[idx]?.company_name || '',
            school_name: d?.school_name || '',
          }
          const payments = d?.addon_payments || []
          payments.forEach((p) => {
            rows.push({ ...clientInfo, ...p })
          })
        })

        setAddonRows(rows)
      } catch (err) {
        setError('Failed to load addon service data: ' + (err.message || 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // ── Derived filter values ──────────────────────────────────────────────────
  const addonTypes = useMemo(() => {
    const types = new Set(addonRows.map((r) => r.addon_type).filter(Boolean))
    return ['All', ...Array.from(types)]
  }, [addonRows])

  const filtered = useMemo(() => {
    return addonRows.filter((r) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        r.client_id?.toLowerCase().includes(q) ||
        r.client_name?.toLowerCase().includes(q) ||
        r.company_name?.toLowerCase().includes(q) ||
        r.school_name?.toLowerCase().includes(q) ||
        r.addon_type?.toLowerCase().includes(q)
      const matchType = typeFilter === 'All' || r.addon_type === typeFilter
      const matchStatus = statusFilter === 'All' || (r.payment_status || 'paid') === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [addonRows, search, typeFilter, statusFilter])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalRevenue = useMemo(() =>
    addonRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
    [addonRows]
  )
  const uniqueClients = useMemo(() =>
    new Set(addonRows.map((r) => r.client_id)).size,
    [addonRows]
  )
  const typeBreakdown = useMemo(() => {
    const map = {}
    addonRows.forEach((r) => {
      if (!r.addon_type) return
      map[r.addon_type] = (map[r.addon_type] || 0) + 1
    })
    return map
  }, [addonRows])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto pb-12 select-none" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Add-on Services Overview</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">All client add-on service subscriptions & payment ledger</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-[10px] font-black text-blue-700 uppercase tracking-wider">
          🔌 {addonRows.length} total transactions
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs font-semibold text-rose-700">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: fmtCurrency(totalRevenue), icon: '💰', color: 'emerald' },
          { label: 'Active Clients', value: uniqueClients, icon: '🏫', color: 'blue' },
          { label: 'Total Transactions', value: addonRows.length, icon: '🧾', color: 'violet' },
          { label: 'Service Types', value: Object.keys(typeBreakdown).length, icon: '🔌', color: 'amber' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`bg-white rounded-2xl border border-${color}-100 p-4 shadow-sm`}>
            <span className="text-2xl">{icon}</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">{label}</p>
            <p className={`text-xl font-black text-${color}-600 mt-0.5`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* ── Service Catalog ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <span className="text-base">📋</span>
          <h2 className="text-sm font-black text-slate-800">Available Add-on Services Catalog</h2>
          <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
            {catalog.length} services
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
          {catalog.map((svc) => {
            const c = addonColor(svc.label.split(' ').slice(0, 2).join(' '))
            return (
              <div key={svc.label} className={`rounded-xl border ${c.border} ${c.bg} p-4 flex flex-col gap-2`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xl">{svc.icon}</span>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                    {svc.category}
                  </span>
                </div>
                <h3 className="text-[11px] font-black text-slate-800 leading-snug">{svc.label}</h3>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium flex-1">{svc.desc}</p>
                <div className="pt-2 border-t border-white/60 flex items-center justify-between">
                  <span className={`text-xs font-black ${c.text}`}>{svc.price}</span>
                  <span className="text-[9px] font-bold text-slate-400 bg-white/70 px-2 py-0.5 rounded-full">
                    {typeBreakdown[svc.label.split(' (')[0]] || 0} clients
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Payment Transactions Table ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header + Filters */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-base">🧾</span>
            <h2 className="text-sm font-black text-slate-800">Add-on Payment Ledger</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search client, type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 font-medium w-44"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 font-bold"
            >
              {addonTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 font-bold"
            >
              <option value="All">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <span className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <span className="text-xs font-bold text-slate-500">Fetching addon service data from all clients…</span>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-black uppercase tracking-wider text-[9px]">
                  <th className="px-4 py-3 whitespace-nowrap">#</th>
                  <th className="px-4 py-3 whitespace-nowrap">Client</th>
                  <th className="px-4 py-3 whitespace-nowrap">Add-on Type</th>
                  <th className="px-4 py-3 whitespace-nowrap text-center">Count</th>
                  <th className="px-4 py-3 whitespace-nowrap">Period Covered</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Subtotal</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">GST</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Total Paid</th>
                  <th className="px-4 py-3 whitespace-nowrap">Payment ID</th>
                  <th className="px-4 py-3 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 whitespace-nowrap text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-14 text-center text-slate-400 font-bold">
                      {addonRows.length === 0
                        ? '📭 No add-on service payments recorded yet across all clients.'
                        : '🔍 No results match your search or filters.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, i) => {
                    const col = addonColor(row.addon_type)
                    return (
                      <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-3 text-slate-400 font-bold font-mono">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-black text-slate-800 text-[11px] leading-tight">
                            {row.company_name || row.school_name || row.client_name}
                          </div>
                          <div className="text-slate-400 font-mono text-[9px] mt-0.5">{row.client_id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black border ${col.bg} ${col.text} ${col.border}`}>
                            <span>{col.icon}</span>
                            {row.addon_type}
                          </span>
                          {row.recipient_type && (
                            <span className={`ml-1.5 inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              row.recipient_type === 'teacher'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {row.recipient_type === 'teacher' ? '👨‍🏫 Staff' : '👥 Students'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-black text-violet-600">
                          {row.recipient_type === 'teacher'
                            ? row.teacher_count || row.student_count || '—'
                            : row.student_count || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-[10px]">
                          <span className="font-bold text-blue-600">{row.start_date_formatted || '—'}</span>
                          <span className="text-slate-300 mx-1">→</span>
                          <span className="font-bold text-rose-500">{row.end_date_formatted || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 font-medium">
                          {row.subtotal_formatted || fmtCurrency(row.subtotal)}
                        </td>
                        <td className="px-4 py-3 text-right text-amber-600 font-medium">
                          +{row.gst_amount_formatted || fmtCurrency(row.gst_amount)}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-emerald-600">
                          {row.amount_formatted || fmtCurrency(row.amount)}
                        </td>
                        <td className="px-4 py-3 font-mono text-[9px] text-slate-500 max-w-[120px] truncate">
                          {row.payment_id || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-medium">
                          {row.payment_date_formatted || '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            (row.payment_status || 'paid') === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {(row.payment_status || 'paid') === 'paid' ? '✓ Paid' : row.payment_status || 'Paid'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer summary row */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-slate-500">
              Showing {filtered.length} of {addonRows.length} transactions
            </span>
            <span className="text-[10px] font-black text-emerald-700">
              Filtered Total: {fmtCurrency(filtered.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0))}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAddonServices
