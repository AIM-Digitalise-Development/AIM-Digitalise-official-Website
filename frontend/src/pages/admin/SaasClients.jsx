import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  getAdminClients,
  updateClientDelivery,
  getAdminSubscriptions,
  activateSubscription,
  deactivateSubscription,
} from '../../api/admin/partners'

// ─── Shared style helpers ─────────────────────────────────────────────────────
const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400'

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminSaasClients = () => {
  // ── Flash ─────────────────────────────────────────────────────────────────
  const [error,      setError]      = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const flashSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3500) }
  const flashError   = (msg) => { setError(msg);      setTimeout(() => setError(null),      4000) }

  // ── Active Tab ─────────────────────────────────────────────────────────────
  const [activePageTab, setActivePageTab] = useState('show_clients')

  // ── CLIENTS ────────────────────────────────────────────────────────────────
  const [clients,        setClients]        = useState([])
  const [summary,        setSummary]        = useState(null)
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientSearch,   setClientSearch]   = useState('')

  const fetchClients = async () => {
    setClientsLoading(true); setError(null)
    try {
      const res = await getAdminClients()
      if (res.data?.success) {
        const all      = Array.isArray(res.data.data?.all_clients) ? res.data.data.all_clients : []
        const filtered = all.filter(c => c.product_category === 'nexgn')
        setClients(filtered)
        setSummary({
          total_clients:  filtered.length,
          active_clients: filtered.filter(c => c.is_active).length,
          total_revenue:  filtered.reduce((acc, c) => acc + (Number(c.processing_fee) || 0), 0),
        })
      } else { setError(res.data?.message || 'Failed to fetch clients') }
    } catch (err) { setError(err.message) }
    finally { setClientsLoading(false) }
  }

  useEffect(() => { fetchClients() }, [])

  const filteredClients = clients.filter(c => {
    const q = clientSearch.toLowerCase()
    return (
      (c.client_name  || '').toLowerCase().includes(q) ||
      (c.email        || '').toLowerCase().includes(q) ||
      (c.client_id    || '').toString().includes(q) ||
      (c.product_name || '').toLowerCase().includes(q) ||
      (c.partner_name || '').toLowerCase().includes(q)
    )
  })

  // ── DELIVERY MODAL ─────────────────────────────────────────────────────────
  const [deliveryModal,  setDeliveryModal]  = useState(false)
  const [deliveryClient, setDeliveryClient] = useState(null)
  const [deliveryDays,   setDeliveryDays]   = useState('')
  const [deliverySaving, setDeliverySaving] = useState(false)

  const openDeliveryModal = (client) => {
    setDeliveryClient(client)
    setDeliveryDays(client.delivery_after != null ? String(client.delivery_after) : '')
    setDeliveryModal(true)
  }
  const saveDelivery = async () => {
    const days = parseInt(deliveryDays, 10)
    if (isNaN(days) || days < 0) { flashError('Enter a valid number (0 or more)'); return }
    setDeliverySaving(true)
    try {
      const res = await updateClientDelivery(deliveryClient.id, days)
      if (res.data?.success) { flashSuccess(`Delivery set to ${days} days`); setDeliveryModal(false); fetchClients() }
      else flashError(res.data?.message || 'Failed to update delivery')
    } catch (err) { flashError(err.message) }
    finally { setDeliverySaving(false) }
  }

  useEffect(() => {
    if (activePageTab === 'subscriptions') fetchSubscriptions()
  }, [activePageTab])

  // ── SUBSCRIPTIONS ──────────────────────────────────────────────────────────
  const [subscriptions,        setSubscriptions]        = useState([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false)
  const [subSearch,            setSubSearch]            = useState('')
  const [togglingSubId,        setTogglingSubId]        = useState(null)

  const fetchSubscriptions = async () => {
    setSubscriptionsLoading(true)
    try {
      const res = await getAdminSubscriptions()
      if (res.data?.success) setSubscriptions(Array.isArray(res.data.data) ? res.data.data : [])
      else flashError(res.data?.message || 'Failed to fetch subscriptions')
    } catch (err) { flashError(err.message) }
    finally { setSubscriptionsLoading(false) }
  }

  const toggleSubscription = async (sub) => {
    setTogglingSubId(sub.id)
    try {
      const res = sub.is_active ? await deactivateSubscription(sub.id) : await activateSubscription(sub.id)
      if (res.data?.success) { flashSuccess(`Subscription ${sub.is_active ? 'deactivated' : 'activated'}`); fetchSubscriptions() }
      else flashError(res.data?.message || 'Failed')
    } catch (err) { flashError(err.message) }
    finally { setTogglingSubId(null) }
  }

  const filteredSubs = subscriptions.filter(s => {
    const q = subSearch.toLowerCase()
    return (s.client_name || '').toLowerCase().includes(q) || (s.product_name || '').toLowerCase().includes(q) || (s.billing_cycle || '').toLowerCase().includes(q)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet><title>SaaS Based Clients | Admin Panel</title></Helmet>

      {/* ══ DELIVERY MODAL ══════════════════════════════════════════════════════ */}
      {deliveryModal && deliveryClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-slate-200/80">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2"><span className="text-purple-500">🚚</span> Edit Delivery After</h3>
              <button onClick={() => setDeliveryModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-xl cursor-pointer">×</button>
            </div>
            <div className="mb-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-400 font-semibold">Client</p>
              <p className="text-sm font-black text-slate-800">{deliveryClient.client_name}</p>
              <p className="text-[10px] text-slate-400">{deliveryClient.email}</p>
            </div>
            <div className="mt-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Delivery After (days)</label>
              <input type="number" min="0" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} className={inputCls} autoFocus />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeliveryModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button onClick={saveDelivery} disabled={deliverySaving} className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 disabled:opacity-50 cursor-pointer">{deliverySaving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}



      {/* ══ PAGE BODY ═════════════════════════════════════════════════════════════ */}
      <div className="space-y-6 select-none text-slate-700 animate-fade-in">

        {/* Header */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">SaaS Based Clients</h1>
          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>
          <div className="w-40 flex justify-end">
            {activePageTab === 'show_clients'   && <button onClick={fetchClients}       disabled={clientsLoading}       className="px-4 py-2 border border-slate-200 hover:border-[#38b34a] hover:text-[#38b34a] bg-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-sm">{clientsLoading ? 'Loading...' : '↺ Refresh'}</button>}
            {activePageTab === 'subscriptions'  && <button onClick={fetchSubscriptions} disabled={subscriptionsLoading} className="px-4 py-2 border border-slate-200 hover:border-blue-400 hover:text-blue-600 bg-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-sm">{subscriptionsLoading ? 'Loading...' : '↺ Refresh'}</button>}
          </div>
        </div>

        {/* Flash messages */}
        {error      && <div className="p-3 rounded-xl border border-red-400/20 bg-red-50 text-red-600 text-sm font-semibold flex items-center gap-2">⚠️ {error}</div>}
        {successMsg && <div className="p-3 rounded-xl border border-emerald-400/20 bg-emerald-50 text-emerald-700 text-sm font-semibold flex items-center gap-2">✅ {successMsg}</div>}

        {/* Main card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">

          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            {[
              { id: 'show_clients',   label: 'Client List'       },
              { id: 'subscriptions',  label: 'Subscriptions'     },
              { id: 'follow_up',      label: 'Follow Up'         },
              { id: 'customization',  label: 'Customization'     },
              { id: 'renewal',        label: 'Next Renewal'      },
              { id: 'due_payment',    label: 'Due Payment'       },
              { id: 'payment_report', label: 'Payment Report'    },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePageTab(tab.id)}
                className={`px-5 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t-2 ${
                  activePageTab === tab.id
                    ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB: CLIENTS ──────────────────────────────────────────────────── */}
          {activePageTab === 'show_clients' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
                  <div><span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total SaaS Clients</span><span className="text-3xl font-black text-blue-500 mt-1.5 block">{clientsLoading ? '...' : (summary?.total_clients ?? 0)}</span></div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">👥</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
                  <div><span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Subscriptions</span><span className="text-3xl font-black text-emerald-500 mt-1.5 block">{clientsLoading ? '...' : (summary?.active_clients ?? 0)}</span></div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">✅</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
                  <div><span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span><span className="text-3xl font-black text-amber-600 mt-1.5 block">{clientsLoading ? '...' : `₹${(summary?.total_revenue ?? 0).toLocaleString('en-IN')}`}</span></div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center border border-yellow-100">₹</div>
                </div>
              </div>
              {/* Search */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></span>
                <input type="text" value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="Search by ID, name, email, product, or partner..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all" />
              </div>
              {/* Table */}
              {clientsLoading ? (
                <div className="text-center py-12 font-bold text-slate-400">
                  <span className="inline-block animate-spin mr-2">🔄</span>Loading...
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="text-4xl block">👥</span>
                  <p className="font-bold mt-2">No clients found</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="px-5 py-4">Client ID</th>
                          <th className="px-5 py-4">Client Details</th>
                          <th className="px-5 py-4">Product</th>
                          <th className="px-5 py-4">Partner</th>
                          <th className="px-5 py-4 text-right">Setup Fee</th>
                          <th className="px-5 py-4 text-center">Delivery Days</th>
                          <th className="px-5 py-4 text-center">Status</th>
                          <th className="px-5 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredClients.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50/50">
                            <td className="px-5 py-4 font-mono font-bold text-slate-500">{c.client_id || '—'}</td>
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-800 text-sm">{c.client_name || '—'}</p>
                              <p className="text-[10px] text-slate-400">{c.email || ''}</p>
                            </td>
                            <td className="px-5 py-4 font-semibold text-slate-700">{c.product_name || '—'}</td>
                            <td className="px-5 py-4 text-slate-500">{c.partner_name || '—'}</td>
                            <td className="px-5 py-4 text-right font-black text-slate-800">
                              ₹{Number(c.processing_fee || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="px-5 py-4 text-center font-bold text-slate-700">
                              {c.delivery_after != null ? `${c.delivery_after} Days` : '—'}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                                c.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                              }`}>
                                {c.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <button
                                onClick={() => openDeliveryModal(c)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#38b34a] hover:bg-[#38b34a]/5 hover:text-[#38b34a] transition-all font-bold cursor-pointer text-[10px]"
                              >
                                🚚 Delivery Days
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: SUBSCRIPTIONS ────────────────────────────────────────────── */}
          {activePageTab === 'subscriptions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2"><span className="text-teal-500">🔁</span> Client Subscriptions</h3>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></span>
                <input type="text" value={subSearch} onChange={e => setSubSearch(e.target.value)} placeholder="Search by client, product, or billing cycle..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all" />
              </div>
              {subscriptionsLoading ? <div className="text-center py-12 font-bold text-slate-400"><span className="inline-block animate-spin mr-2">🔄</span>Loading...</div>
              : filteredSubs.length === 0 ? <div className="text-center py-12 text-slate-400"><span className="text-4xl block">🔁</span><p className="font-bold mt-2">No subscriptions found</p></div>
              : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead><tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-5 py-4">Client</th><th className="px-5 py-4">Product</th><th className="px-5 py-4 text-center">Billing Cycle</th><th className="px-5 py-4 text-right">Amount</th><th className="px-5 py-4 text-center">Start</th><th className="px-5 py-4 text-center">End</th><th className="px-5 py-4 text-center">Status</th><th className="px-5 py-4 text-center">Toggle</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredSubs.map(sub => (
                          <tr key={sub.id} className="hover:bg-slate-50/50">
                            <td className="px-5 py-4"><p className="font-bold text-slate-800 text-sm">{sub.client_name || '—'}</p><p className="text-[10px] text-slate-400">{sub.client_email || ''}</p></td>
                            <td className="px-5 py-4 font-semibold text-slate-700">{sub.product_name || '—'}</td>
                            <td className="px-5 py-4 text-center"><span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-black uppercase">{sub.billing_cycle || '—'}</span></td>
                            <td className="px-5 py-4 text-right font-black text-slate-800">₹{Number(sub.amount || 0).toLocaleString('en-IN')}</td>
                            <td className="px-5 py-4 text-center text-slate-500">{sub.start_date ? new Date(sub.start_date).toLocaleDateString('en-IN') : '—'}</td>
                            <td className="px-5 py-4 text-center text-slate-500">{sub.end_date ? new Date(sub.end_date).toLocaleDateString('en-IN') : '—'}</td>
                            <td className="px-5 py-4 text-center"><span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${sub.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>{sub.is_active ? 'Active' : 'Inactive'}</span></td>
                            <td className="px-5 py-4 text-center"><button onClick={() => toggleSubscription(sub)} disabled={togglingSubId === sub.id} className={`px-3 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer disabled:opacity-50 border transition-all hover:scale-105 active:scale-95 shadow-sm ${sub.is_active ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200/60' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200/60'}`}>{togglingSubId === sub.id ? '...' : sub.is_active ? '⏸️ Deactivate' : '▶️ Activate'}</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Static placeholder tabs ─────────────────────────────────────── */}
          {activePageTab === 'follow_up' && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <span className="text-4xl">📞</span><h4 className="text-base font-bold text-slate-800">Follow Up Reminders</h4>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">Active follow-up schedules, client feedback timelines, and partner support logs will appear here.</p>
            </div>
          )}
          {activePageTab === 'customization' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">⚙️ Client Customization Requests</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm">
                <table className="w-full text-left text-xs"><thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider"><th className="px-5 py-4">Request ID</th><th className="px-5 py-4">Client</th><th className="px-5 py-4">Module</th><th className="px-5 py-4">Submitted</th><th className="px-5 py-4">Est. Delivery</th><th className="px-5 py-4 text-center">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50/50"><td className="px-5 py-3 font-mono font-bold text-slate-500">REQ-2026-004</td><td className="px-5 py-3 font-bold text-slate-800">Sunrise Academy</td><td className="px-5 py-3">Custom Certificate Template</td><td className="px-5 py-3 text-slate-400">12 May 2026</td><td className="px-5 py-3 text-slate-400">20 Jun 2026</td><td className="px-5 py-3 text-center"><span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">In Progress</span></td></tr>
                    <tr className="hover:bg-slate-50/50"><td className="px-5 py-3 font-mono font-bold text-slate-500">REQ-2026-003</td><td className="px-5 py-3 font-bold text-slate-800">Greenfield School</td><td className="px-5 py-3">WhatsApp Alert Gateway</td><td className="px-5 py-3 text-slate-400">08 May 2026</td><td className="px-5 py-3 text-slate-400">10 Jun 2026</td><td className="px-5 py-3 text-center"><span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">Pending</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activePageTab === 'renewal' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">🔄 Renewals &amp; Products Management</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm">
                <table className="w-full text-left text-xs"><thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider"><th className="px-5 py-4">Client</th><th className="px-5 py-4">Product</th><th className="px-5 py-4">Expiration</th><th className="px-5 py-4 text-right">Cost</th><th className="px-5 py-4 text-center">Days Left</th><th className="px-5 py-4 text-center">Actions</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50/50"><td className="px-5 py-3 font-bold text-slate-800">Greenfield School</td><td className="px-5 py-3">School MS (Silver)</td><td className="px-5 py-3 text-slate-400">11 Jun 2026</td><td className="px-5 py-3 text-right font-black">₹30,000</td><td className="px-5 py-3 text-center"><span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">5 Days</span></td><td className="px-5 py-3 text-center"><div className="flex gap-2 justify-center"><button className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold cursor-pointer text-[10px]">Renew</button><button className="px-2.5 py-1 bg-blue-600 text-white rounded font-bold cursor-pointer text-[10px]">+ Add Product</button></div></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activePageTab === 'due_payment' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">⚠️ Outstanding Client Payments</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm">
                <table className="w-full text-left text-xs"><thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider"><th className="px-5 py-4">Invoice ID</th><th className="px-5 py-4">Client</th><th className="px-5 py-4 text-right">Outstanding</th><th className="px-5 py-4">Due Date</th><th className="px-5 py-4 text-center">Status</th><th className="px-5 py-4 text-center">Action</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50/50"><td className="px-5 py-3 font-mono font-bold text-slate-500">INV-2026-089</td><td className="px-5 py-3 font-bold text-slate-800">Blue Hill Institute</td><td className="px-5 py-3 text-right font-black text-rose-600">₹15,000</td><td className="px-5 py-3 text-slate-400">28 May 2026</td><td className="px-5 py-3 text-center"><span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200 animate-pulse">Overdue</span></td><td className="px-5 py-3 text-center"><button className="px-3 py-1.5 bg-orange-500 text-white rounded font-bold cursor-pointer text-[10px]">Send Reminder</button></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activePageTab === 'payment_report' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">📄 Payment History &amp; Invoices</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm">
                <table className="w-full text-left text-xs"><thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider"><th className="px-5 py-4">Transaction ID</th><th className="px-5 py-4">Client</th><th className="px-5 py-4 text-right">Amount</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Method</th><th className="px-5 py-4 text-center">Invoice</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50/50"><td className="px-5 py-3 font-mono font-bold text-slate-500">TXN-98014529</td><td className="px-5 py-3 font-bold text-slate-800">Sunrise Academy</td><td className="px-5 py-3 text-right font-black text-emerald-600">₹45,000</td><td className="px-5 py-3 text-slate-400">10 Apr 2026</td><td className="px-5 py-3 text-slate-600 font-semibold">UPI / Razorpay</td><td className="px-5 py-3 text-center"><button className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer">📥 Download</button></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default AdminSaasClients
