import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getAdminClients,
  updateClientDelivery,
  getAdminSubscriptions,
  activateSubscription,
  deactivateSubscription,
  getAdminCustomizationRequests,
  setCustomizationAmount,
  updateCustomizationStatus,
  getAdminClientById,
} from '../../api/admin/partners'
import { isSaasClient } from '../../utils/subscription'

// ─── Shared style helpers ─────────────────────────────────────────────────────
const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400'

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminSaasClients = () => {
  // ── Flash ─────────────────────────────────────────────────────────────────
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const flashSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3500) }
  const flashError = (msg) => { setError(msg); setTimeout(() => setError(null), 4000) }

  // ── Active Tab ─────────────────────────────────────────────────────────────
  const [activePageTab, setActivePageTab] = useState('show_clients')

  // ── CLIENTS ────────────────────────────────────────────────────────────────
  const [clients, setClients] = useState([])
  const [summary, setSummary] = useState(null)
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientSearch, setClientSearch] = useState('')
  const [productFilter, setProductFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedClientDetails, setSelectedClientDetails] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [dossierTab, setDossierTab] = useState('profile')

  const handleDownloadInvoice = (payment, clientDetails) => {
    const today = new Date(payment.created_at || Date.now())
    const invoiceDate = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const invoiceNumber = `INV-${today.getTime()}-${Math.floor(Math.random() * 1000)}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #1e293b; }
            .bill-container { max-width: 800px; margin: 0 auto; padding: 30px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; }
            .bill-header { text-align: center; border-bottom: 2px solid #1e3c5e; padding-bottom: 20px; margin-bottom: 20px; }
            .bill-title { font-size: 24px; font-weight: bold; color: #1e3c5e; }
            .bill-subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
            .bill-info { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; font-size: 13px; }
            .bill-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .bill-table th { background: #1e3c5e; color: white; padding: 12px; text-align: left; font-size: 13px; }
            .bill-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .bill-total { text-align: right; padding: 20px; background: #f8fafc; border-radius: 8px; margin-top: 20px; font-size: 14px; }
            .bill-footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="bill-container">
            <div class="bill-header">
              <div class="bill-title">🎓 AIM Digitalise</div>
              <div class="bill-subtitle">Payment Receipt / Tax Invoice</div>
            </div>
            <div class="bill-info">
              <div>
                <strong>Client:</strong> ${clientDetails.client_name || clientDetails.company_name}<br/>
                <strong>Client ID:</strong> ${clientDetails.client_id}<br/>
                <strong>School/Org:</strong> ${clientDetails.company_name}
              </div>
              <div>
                <strong>Invoice #:</strong> ${invoiceNumber}<br/>
                <strong>Payment ID:</strong> ${payment.razorpay_payment_id || 'simulated_pay'}<br/>
                <strong>Date:</strong> ${invoiceDate}
              </div>
            </div>
            <table class="bill-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Cycle</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Subscription Service Fees</strong><br/>
                    <span style="font-size: 11px; color:#64748b;">Period: ${payment.period_start ? formatDate(payment.period_start) : '—'} to ${payment.period_end ? formatDate(payment.period_end) : '—'}</span>
                  </td>
                  <td style="text-transform: capitalize;">${payment.cycle}</td>
                  <td style="text-align: right;">₹ ${parseFloat(payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
            <div class="bill-total">
              <strong>Total Paid (incl. GST):</strong> <span style="font-size: 18px; color: #2563eb; font-weight: bold; margin-left: 10px;">₹ ${parseFloat(payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="bill-footer">
              <p>This is a system generated transaction invoice copy served for verification.</p>
              <p>AIM Digitalise Private Limited • support@aimdigitalise.com</p>
            </div>
          </div>
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Receipt_${payment.razorpay_payment_id || 'invoice'}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const triggerMockReminder = (client) => {
    alert(`✉️ Payment reminder sent successfully to ${client.client_name} (${client.email}) for ₹${Number(client.total_due_amount || 2500).toLocaleString()}.`)
  }

  const [loadingClientDetail, setLoadingClientDetail] = useState(false)

  const handleFetchClientDetails = async (clientId) => {
    setLoadingClientDetail(true)
    setError(null)
    try {
      const res = await getAdminClientById(clientId)
      if (res.data?.success) {
        setSelectedClientDetails(res.data.data)
        setDossierTab('profile')
        setShowDetailsModal(true)
      } else {
        flashError(res.data?.message || 'Failed to fetch client details')
      }
    } catch (err) {
      flashError(err.message || 'Error fetching client details')
    } finally {
      setLoadingClientDetail(false)
    }
  }

  const handleUpdateDeliveryDays = async (clientId, days) => {
    try {
      const res = await updateClientDelivery(clientId, days)
      if (res.data?.success) {
        flashSuccess(`Delivery set to ${days} days`)
        fetchClients()
        // If this client is currently selected, update their details modal too
        if (selectedClientDetails && selectedClientDetails.id === clientId) {
          // Temporarily set details from local updates, or refetch
          const detailsRes = await getAdminClientById(clientId)
          if (detailsRes.data?.success) {
            setSelectedClientDetails(detailsRes.data.data)
          }
        }
      } else {
        flashError(res.data?.message || 'Failed to update delivery')
      }
    } catch (err) {
      flashError(err.message)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return '—'
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (e) {
      return '—'
    }
  }

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '—'
    const val = typeof amount === 'string' ? parseFloat(amount) : amount
    return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  }

  const fetchClients = async () => {
    setClientsLoading(true); setError(null)
    try {
      const res = await getAdminClients()
      if (res.data?.success) {
        const all = Array.isArray(res.data.data?.all_clients) ? res.data.data.all_clients : []
        const filtered = all.filter(c => isSaasClient(c))
        setClients(filtered)
        setSummary({
          total_clients: filtered.length,
          active_clients: filtered.filter(c => c.is_active).length,
          total_revenue: filtered.reduce((acc, c) => acc + (Number(c.processing_fee) || 0), 0),
        })
      } else { setError(res.data?.message || 'Failed to fetch clients') }
    } catch (err) { setError(err.message) }
    finally { setClientsLoading(false) }
  }


  useEffect(() => { fetchClients() }, [])

  const filteredClients = clients.filter(c => {
    const matchesProduct = productFilter === 'All' || c.product_category === productFilter
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'ACTIVE' ? c.is_active : !c.is_active)

    const q = clientSearch.toLowerCase()
    const matchesSearch =
      (c.client_name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.client_id || '').toString().includes(q) ||
      (c.product_name || '').toLowerCase().includes(q) ||
      (c.partner_name || '').toLowerCase().includes(q)

    return matchesProduct && matchesStatus && matchesSearch
  })

  // ── DELIVERY MODAL ─────────────────────────────────────────────────────────
  const [deliveryModal, setDeliveryModal] = useState(false)
  const [deliveryClient, setDeliveryClient] = useState(null)
  const [deliveryDays, setDeliveryDays] = useState('')
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
    if (activePageTab === 'customization') fetchCustomizationRequestsData(customizationFilters)
  }, [activePageTab])

  // ── CUSTOMIZATION ──────────────────────────────────────────────────────────
  const [customizationRequests, setCustomizationRequests] = useState([])
  const [loadingCustomization, setLoadingCustomization] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showAmountModal, setShowAmountModal] = useState(false)
  const [amountForm, setAmountForm] = useState({ amount: '', admin_notes: '' })
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusForm, setStatusForm] = useState({ status: '', admin_notes: '' })
  const [customizationFilters, setCustomizationFilters] = useState({ status: '', search: '' })
  const [customizationStats, setCustomizationStats] = useState({
    total: 0,
    pending: 0,
    amount_set: 0,
    approved: 0,
    rejected: 0
  })

  const fetchCustomizationRequestsData = async (filters = {}) => {
    setLoadingCustomization(true)
    try {
      const res = await getAdminCustomizationRequests(filters)
      if (res.data?.success) {
        let requests = []
        if (Array.isArray(res.data.data?.requests)) {
          requests = res.data.data.requests
        } else if (Array.isArray(res.data.data)) {
          requests = res.data.data
        }
        setCustomizationRequests(requests)
        setCustomizationStats({
          total: requests.length,
          pending: requests.filter(r => r.status === 'pending').length,
          amount_set: requests.filter(r => r.status === 'amount_set').length,
          approved: requests.filter(r => r.status === 'approved').length,
          rejected: requests.filter(r => r.status === 'rejected').length
        })
      } else {
        flashError(res.data?.message || 'Failed to fetch customization requests')
      }
    } catch (err) {
      console.error(err)
      flashError('Failed to fetch customization requests: ' + err.message)
    } finally {
      setLoadingCustomization(false)
    }
  }

  const handleSetAmount = async (e) => {
    e.preventDefault()
    setLoadingCustomization(true)
    try {
      const res = await setCustomizationAmount(
        selectedRequest.id,
        parseFloat(amountForm.amount),
        amountForm.admin_notes
      )
      if (res.data?.success) {
        flashSuccess(`Amount ₹${amountForm.amount} set successfully!`)
        setShowAmountModal(false)
        setAmountForm({ amount: '', admin_notes: '' })
        fetchCustomizationRequestsData(customizationFilters)
        setSelectedRequest(null)
      } else {
        flashError(res.data?.message || 'Failed to set amount')
      }
    } catch (err) {
      flashError('Failed to set amount: ' + err.message)
    } finally {
      setLoadingCustomization(false)
    }
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    setLoadingCustomization(true)
    try {
      const res = await updateCustomizationStatus(
        selectedRequest.id,
        statusForm.status,
        statusForm.admin_notes
      )
      if (res.data?.success) {
        flashSuccess(`Status updated to ${statusForm.status}!`)
        setShowStatusModal(false)
        setStatusForm({ status: '', admin_notes: '' })
        fetchCustomizationRequestsData(customizationFilters)
        setSelectedRequest(null)
      } else {
        flashError(res.data?.message || 'Failed to update status')
      }
    } catch (err) {
      flashError('Failed to update status: ' + err.message)
    } finally {
      setLoadingCustomization(false)
    }
  }

  const parseCustomizationText = (text) => {
    if (!text) return { title: 'Custom Upgrade', description: '' }
    const match = text.match(/^\[(.*?)\]\s*(?:\(Target Rollout:\s*(.*?)\))?\s*\n*([\s\S]*)$/)
    if (match) {
      return {
        title: match[1],
        rollout: match[2] || '',
        description: match[3].trim()
      }
    }
    return { title: 'Custom Upgrade', description: text }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { color: 'text-amber-600 bg-amber-50 border-amber-100', text: 'Pending' },
      'amount_set': { color: 'text-blue-600 bg-blue-50 border-blue-100', text: 'Amount Set' },
      'approved': { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', text: 'Approved' },
      'rejected': { color: 'text-rose-600 bg-rose-50 border-rose-100', text: 'Rejected' }
    }
    return badges[status?.toLowerCase()] || { color: 'text-amber-600 bg-amber-50 border-amber-100', text: status || 'Pending' }
  }

  const formatAmount = (amount) => {
    if (!amount) return '—'
    return `₹ ${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const truncateText = (text, maxLength = 100) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // ── SUBSCRIPTIONS ──────────────────────────────────────────────────────────
  const [subscriptions, setSubscriptions] = useState([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false)
  const [subSearch, setSubSearch] = useState('')
  const [togglingSubId, setTogglingSubId] = useState(null)

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

      {/* ══ SET AMOUNT MODAL ══════════════════════════════════════════════════════ */}
      {showAmountModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-slate-200/80">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2"><span className="text-[#3b82f6]">💵</span> Set Customization Quote</h3>
              <button onClick={() => { setShowAmountModal(false); setSelectedRequest(null); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-xl cursor-pointer">×</button>
            </div>
            <div className="mb-1 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Client</p>
              <p className="font-black text-slate-800">{selectedRequest.client?.name || selectedRequest.client_display_id}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">Description</p>
              <p className="text-slate-600 line-clamp-3 font-normal mt-0.5">{selectedRequest.customization_text}</p>
            </div>
            <form onSubmit={handleSetAmount} className="space-y-4 mt-4 text-xs font-bold">
              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase tracking-wider block">Quote Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={amountForm.amount}
                  onChange={e => setAmountForm({ ...amountForm, amount: e.target.value })}
                  placeholder="Enter quote amount in INR..."
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase tracking-wider block">Admin Notes</label>
                <textarea
                  value={amountForm.admin_notes}
                  onChange={e => setAmountForm({ ...amountForm, admin_notes: e.target.value })}
                  placeholder="Notes shown to the client on invoice..."
                  rows="3"
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAmountModal(false); setSelectedRequest(null); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 cursor-pointer">Set Quote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ UPDATE STATUS MODAL ══════════════════════════════════════════════════ */}
      {showStatusModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-slate-200/80">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2"><span className="text-[#8b5cf6]">⚙️</span> Update Request Status</h3>
              <button onClick={() => { setShowStatusModal(false); setSelectedRequest(null); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-xl cursor-pointer">×</button>
            </div>
            <div className="mb-1 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Client</p>
              <p className="font-black text-slate-800">{selectedRequest.client?.name || selectedRequest.client_display_id}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">Current Status</p>
              <p className="text-slate-600 font-black mt-0.5 capitalize">{selectedRequest.status}</p>
            </div>
            <form onSubmit={handleUpdateStatus} className="space-y-4 mt-4 text-xs font-bold">
              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase tracking-wider block">New Status</label>
                <select
                  required
                  value={statusForm.status}
                  onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Select Status...</option>
                  <option value="pending">Pending</option>
                  <option value="amount_set">Amount Set</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase tracking-wider block">Admin Notes</label>
                <textarea
                  value={statusForm.admin_notes}
                  onChange={e => setStatusForm({ ...statusForm, admin_notes: e.target.value })}
                  placeholder="Notes about this status update..."
                  rows="3"
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowStatusModal(false); setSelectedRequest(null); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 cursor-pointer">Update</button>
              </div>
            </form>
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
            {activePageTab === 'show_clients' && <button onClick={fetchClients} disabled={clientsLoading} className="px-4 py-2 border border-slate-200 hover:border-[#38b34a] hover:text-[#38b34a] bg-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-sm">{clientsLoading ? 'Loading...' : '↺ Refresh'}</button>}
            {activePageTab === 'subscriptions' && <button onClick={fetchSubscriptions} disabled={subscriptionsLoading} className="px-4 py-2 border border-slate-200 hover:border-blue-400 hover:text-blue-600 bg-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-sm">{subscriptionsLoading ? 'Loading...' : '↺ Refresh'}</button>}
          </div>
        </div>

        {/* Flash messages */}
        {error && <div className="p-3 rounded-xl border border-red-400/20 bg-red-50 text-red-600 text-sm font-semibold flex items-center gap-2">⚠️ {error}</div>}
        {successMsg && <div className="p-3 rounded-xl border border-emerald-400/20 bg-emerald-50 text-emerald-700 text-sm font-semibold flex items-center gap-2">✅ {successMsg}</div>}

        {/* Main card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">

          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            {[
              { id: 'show_clients', label: 'Client List' },
              { id: 'follow_up', label: 'Follow Up' },
              { id: 'customization', label: 'Customization' },
              { id: 'renewal', label: 'Next Renewal' },
              { id: 'due_payment', label: 'Due Payment' },
              { id: 'payment_report', label: 'Payment Report' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePageTab(tab.id)}
                className={`px-5 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t-2 ${activePageTab === tab.id
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
              {/* Filters Panel Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-5 items-end mb-6">
                {/* Product wise search */}
                <div className="w-full md:flex-grow">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Product Wise Search</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <select
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-semibold"
                    >
                      <option value="All">All Categories</option>
                      <option value="static">Static Websites</option>
                      <option value="dynamic">Dynamic Websites</option>
                      <option value="ecommerce">E-Commerce</option>
                      <option value="mobile">Mobile Apps</option>
                    </select>
                  </div>
                </div>

                {/* Client Search */}
                <div className="w-full md:flex-grow">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Client Name / Search</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Type to search client..."
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="w-full md:w-56 shrink-0">
                  <label className="block text-[9.5px] font-black text-slate-550 uppercase tracking-widest mb-1.5 font-sans">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-semibold"
                  >
                    <option value="All">All Statuses</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
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
                              <p className="font-bold text-slate-800 text-sm">{c.company_name || '—'}</p>
                              <p className="text-[10px] text-slate-400">{c.client_name || ''}</p>
                            </td>
                            <td className="px-5 py-4 font-semibold text-slate-700">{c.product_name || '—'}</td>
                            <td className="px-5 py-4 text-slate-500">{c.partner_name || '—'}</td>
                            <td className="px-5 py-4 text-right font-black text-slate-800">
                              ₹{Number(c.processing_fee || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <input
                                type="number"
                                min="0"
                                defaultValue={c.delivery_after != null ? c.delivery_after : 0}
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value, 10)
                                  if (!isNaN(val) && val !== c.delivery_after) {
                                    handleUpdateDeliveryDays(c.id, val)
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = parseInt(e.target.value, 10)
                                    if (!isNaN(val) && val !== c.delivery_after) {
                                      handleUpdateDeliveryDays(c.id, val)
                                      e.target.blur()
                                    }
                                  }
                                }}
                                className="w-16 px-1.5 py-0.5 text-center font-bold border border-slate-200 hover:border-slate-300 rounded focus:outline-none focus:border-[#38b34a] text-[10px]"
                              />
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${c.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                                }`}>
                                {c.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleFetchClientDetails(c.id)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold cursor-pointer flex items-center justify-center"
                                  title="View Details"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => openDeliveryModal(c)}
                                  className="px-2 py-1.5 rounded-lg border border-slate-200 hover:border-[#38b34a] hover:bg-[#38b34a]/5 hover:text-[#38b34a] transition-all font-bold cursor-pointer text-[10px]"
                                >
                                  🚚 Delivery
                                </button>
                              </div>
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
            <div className="space-y-6">
              {/* Customization Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-[#8b5cf6]">🎨</span> Client Customization Requests
                </h3>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl text-center shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Requests</span>
                  <span className="text-2xl font-black text-slate-800 mt-1 block font-mono">{customizationStats.total}</span>
                </div>
                <div className="bg-amber-50/50 border border-amber-100/60 p-4.5 rounded-2xl text-center shadow-sm">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Pending</span>
                  <span className="text-2xl font-black text-amber-600 mt-1 block font-mono">{customizationStats.pending}</span>
                </div>
                <div className="bg-blue-50/50 border border-blue-100/60 p-4.5 rounded-2xl text-center shadow-sm">
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Amount Set</span>
                  <span className="text-2xl font-black text-blue-600 mt-1 block font-mono">{customizationStats.amount_set}</span>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100/60 p-4.5 rounded-2xl text-center shadow-sm">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Approved</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">{customizationStats.approved}</span>
                </div>
                <div className="bg-rose-50/50 border border-rose-100/60 p-4.5 rounded-2xl text-center shadow-sm">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Rejected</span>
                  <span className="text-2xl font-black text-rose-600 mt-1 block font-mono">{customizationStats.rejected}</span>
                </div>
              </div>

              {/* Filters Panel */}
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-end text-xs font-semibold shadow-sm">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-slate-400 block font-bold uppercase tracking-wider">Search</label>
                  <input
                    type="text"
                    placeholder="Client ID, name, school or description..."
                    value={customizationFilters.search}
                    onChange={e => setCustomizationFilters({ ...customizationFilters, search: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-semibold"
                  />
                </div>
                <div className="w-full sm:w-44 space-y-1">
                  <label className="text-slate-400 block font-bold uppercase tracking-wider">Status</label>
                  <select
                    value={customizationFilters.status}
                    onChange={e => setCustomizationFilters({ ...customizationFilters, status: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-semibold"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="amount_set">Amount Set</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => fetchCustomizationRequestsData(customizationFilters)}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-[#1e3e6b] hover:bg-[#152e51] text-white font-bold rounded-xl cursor-pointer transition-colors shadow-sm text-xs"
                  >
                    🔍 Filter
                  </button>
                  <button
                    onClick={() => {
                      setCustomizationFilters({ status: '', search: '' })
                      fetchCustomizationRequestsData({ status: '', search: '' })
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 font-bold rounded-xl cursor-pointer transition-colors text-xs"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Customization requests table */}
              {loadingCustomization ? (
                <div className="text-center py-12 font-bold text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm animate-pulse">
                  <span className="inline-block animate-spin mr-2">🔄</span>Loading requests...
                </div>
              ) : customizationRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-50/20 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-4xl block">⚙️</span>
                  <p className="font-bold mt-2">No customization requests found</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="px-5 py-4">Client</th>
                          <th className="px-5 py-4">Request Details</th>
                          <th className="px-5 py-4">Quote Cost</th>
                          <th className="px-5 py-4 text-center">Status</th>
                          <th className="px-5 py-4 text-center">Submitted</th>
                          <th className="px-5 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {customizationRequests.map((request) => {
                          const parsed = parseCustomizationText(request.customization_text)
                          const statusBadge = getStatusBadge(request.status)
                          const clientName = request.client?.name || request.client_display_id || 'N/A'
                          const clientId = request.client?.id || request.client_display_id || 'N/A'
                          const schoolName = request.client?.school_name || ''

                          return (
                            <tr key={request.id} className="hover:bg-slate-50/50">
                              <td className="px-5 py-4">
                                <p className="font-bold text-slate-800 text-sm">{clientName}</p>
                                <p className="text-[10px] text-slate-400">
                                  ID: {clientId} {schoolName && `• ${schoolName}`}
                                </p>
                              </td>
                              <td className="px-5 py-4 max-w-[280px]">
                                <div className="font-bold text-slate-800">{parsed.title}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                  {parsed.description}
                                </div>
                                {parsed.rollout && (
                                  <div className="text-[9px] text-blue-500 font-bold mt-1">
                                    📅 Expected Rollout: {parsed.rollout}
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-4 font-mono font-black text-slate-800">
                                {request.amount ? formatAmount(request.amount) : '—'}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${statusBadge.color}`}>
                                  {statusBadge.text}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center text-slate-400 font-sans">
                                {request.submitted_at ? new Date(request.submitted_at).toLocaleDateString('en-IN') : (request.created_at ? new Date(request.created_at).toLocaleDateString('en-IN') : '—')}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(request)
                                      setAmountForm({ amount: request.amount || '', admin_notes: request.admin_notes || '' })
                                      setShowAmountModal(true)
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#38b34a] hover:bg-[#38b34a]/5 hover:text-[#38b34a] transition-all font-bold cursor-pointer text-[10px]"
                                  >
                                    💵 Set Quote
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(request)
                                      setStatusForm({ status: request.status || '', admin_notes: request.admin_notes || '' })
                                      setShowStatusModal(true)
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-bold cursor-pointer text-[10px]"
                                  >
                                    ⚙️ Status
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          {activePageTab === 'renewal' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">🔄 Renewals &amp; Products Management</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-5 py-4">Client</th>
                      <th className="px-5 py-4">Product</th>
                      <th className="px-5 py-4">Expiration</th>
                      <th className="px-5 py-4 text-right">Subscription Price</th>
                      <th className="px-5 py-4 text-center">Days Left</th>
                      <th className="px-5 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {clients.filter(c => c.valid_until).map(c => {
                      const daysLeft = Math.ceil((new Date(c.valid_until) - new Date()) / (1000 * 60 * 60 * 24))
                      const isExpired = daysLeft <= 0
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3 font-bold text-slate-800">{c.company_name}</td>
                          <td className="px-5 py-3">{c.product_name}</td>
                          <td className="px-5 py-3 text-slate-400">{new Date(c.valid_until).toLocaleDateString('en-IN')}</td>
                          <td className="px-5 py-3 text-right font-black">₹{Number(c.monthly_subscription || 0).toLocaleString('en-IN')}/mo</td>
                          <td className="px-5 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              isExpired 
                                ? 'bg-rose-100 text-rose-800 border-rose-200' 
                                : daysLeft <= 30 
                                  ? 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}>
                              {isExpired ? 'Expired' : `${daysLeft} Days`}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button onClick={() => alert(`Initiating renewal for ${c.company_name}`)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer text-[10px]">Renew</button>
                              <button onClick={() => alert(`Adding product to ${c.company_name}`)} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold cursor-pointer text-[10px]">+ Add Product</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activePageTab === 'due_payment' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">⚠️ Outstanding Client Payments</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-5 py-4">Client ID</th>
                      <th className="px-5 py-4">Client</th>
                      <th className="px-5 py-4 text-right">Outstanding</th>
                      <th className="px-5 py-4">Due Date</th>
                      <th className="px-5 py-4">Unpaid Cycles</th>
                      <th className="px-5 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {clients.filter(c => Number(c.total_due_amount) > 0).map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3 font-mono font-bold text-slate-500">{c.client_id}</td>
                        <td className="px-5 py-3 font-bold text-slate-800">{c.company_name}</td>
                        <td className="px-5 py-3 text-right font-black text-rose-600">₹{Number(c.total_due_amount || 0).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3 text-slate-400">{c.valid_until ? new Date(c.valid_until).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="px-5 py-3">
                          {c.unpaid_months?.map(m => (
                            <span key={m} className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold text-[9px] mr-1 inline-block">
                              {m}
                            </span>
                          ))}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button onClick={() => triggerMockReminder(c)} className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded font-bold cursor-pointer text-[10px]">Send Reminder</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activePageTab === 'payment_report' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">📄 Payment History &amp; Invoices</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-5 py-4">Transaction ID</th>
                      <th className="px-5 py-4">Client</th>
                      <th className="px-5 py-4 text-right">Amount</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Cycle</th>
                      <th className="px-5 py-4 text-center">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {clients.flatMap(c => (c.payments || []).map(p => ({ ...p, client: c }))).map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3 font-mono font-bold text-slate-500">{p.razorpay_payment_id || 'simulated_pay'}</td>
                        <td className="px-5 py-3 font-bold text-slate-800">{p.client?.company_name}</td>
                        <td className="px-5 py-3 text-right font-black text-emerald-600">₹{Number(p.amount || 0).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3 text-slate-400">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-3 text-slate-600 font-semibold capitalize">{p.cycle}</td>
                        <td className="px-5 py-3 text-center">
                          <button onClick={() => handleDownloadInvoice(p, p.client)} className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer transition-colors">📥 Download</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ══ CLIENT DETAILS MODAL (SIDE DRAWER) ════════════════════════════════════ */}
      <AnimatePresence>
        {showDetailsModal && selectedClientDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900"
              onClick={() => setShowDetailsModal(false)}
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-hidden z-10 bg-white border-l border-slate-200"
            >
              {loadingClientDetail && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center font-bold text-slate-600 text-xs">
                  ⏳ Updating details...
                </div>
              )}

              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between bg-slate-50 border-b border-slate-200">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Client Details Dossier</span>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">{selectedClientDetails.company_name || selectedClientDetails.school_name}</h3>
                  <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-blue-600 font-bold font-mono tracking-wider">{selectedClientDetails.client_id}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] text-slate-500 font-medium">Connected Person: <strong className="text-slate-700">{selectedClientDetails.client_name}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${
                      selectedClientDetails.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedClientDetails.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer ml-3 flex-shrink-0"
                >
                  ✕
                </button>
              </div>

                  {/* Dossier Tabs */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 border-b border-slate-200 px-6 py-3 z-10 shrink-0">
                    {[
                      { id: 'profile', label: 'Company Profile', icon: '🏢' },
                      { id: 'school', label: 'School Metrics', icon: '🏫' },
                      { id: 'product', label: 'Product & Logistics', icon: '📦' },
                      { id: 'ledger', label: 'Payments Ledger', icon: '💳' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setDossierTab(t.id)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          dossierTab === t.id
                            ? 'bg-[#1e3e6b] text-white border-[#1e3e6b] shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Scrollable body */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
                    <AnimatePresence mode="wait">
                      {dossierTab === 'profile' && (
                        <motion.div
                          key="profile"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-6"
                        >
                          {/* Profile Section */}
                          <div>
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">Client / Company Profile</h4>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[11px]">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Email Address</span>
                                <p className="text-slate-800 font-medium mt-1 select-text">{selectedClientDetails.email}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Phone Number</span>
                                <p className="text-slate-800 font-medium mt-1 select-text">{selectedClientDetails.contact_number || selectedClientDetails.phone || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Client / Company Name</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.company_name || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Connected Person</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.client_name || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">GSTIN</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.gstin || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Portal Password</span>
                                <p className="text-slate-800 font-medium mt-1 font-mono">{selectedClientDetails.default_password || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Registration Date</span>
                                <p className="text-slate-800 font-medium mt-1">{formatDate(selectedClientDetails.created_at)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Associated Partner Section */}
                          {selectedClientDetails.partner && (
                            <>
                              <div className="border-t border-slate-100" />
                              <div>
                                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">Associated Marketing Partner</h4>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[11px]">
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Partner ID</span>
                                    <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.partner.partner_id}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Partner Name</span>
                                    <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.partner.name}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Email Address</span>
                                    <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.partner.email}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Contact Number</span>
                                    <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.partner.contact}</p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>
                      )}

                      {dossierTab === 'school' && (
                        <motion.div
                          key="school"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-6"
                        >
                          {/* School Registry Section */}
                          <div>
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">School Registration Metrics</h4>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[11px]">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">School Name</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.school_name || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Short Name</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.school_short_name || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Academic Session</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.school_session || '—'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Total Students</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.total_students != null ? selectedClientDetails.total_students : selectedClientDetails.student_count || '—'}</p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Residence Address</span>
                                <p className="text-slate-800 font-medium mt-1 leading-relaxed">
                                  {selectedClientDetails.address
                                    ? `${selectedClientDetails.address}, ${selectedClientDetails.district || ''}, ${selectedClientDetails.state || ''} - ${selectedClientDetails.pin_code || ''}`
                                    : '—'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {dossierTab === 'product' && (
                        <motion.div
                          key="product"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-6"
                        >
                          {/* Product Pricing & Logistics Section */}
                          <div>
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">Product & Logistics Information</h4>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[11px]">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Product Category</span>
                                <p className="text-blue-600 font-bold mt-1 uppercase">{selectedClientDetails.product_category}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Product Name</span>
                                <p className="text-slate-800 font-medium mt-1">{selectedClientDetails.product_name}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Setup Processing Fee</span>
                                <p className="text-slate-800 font-medium mt-1">{formatCurrency(selectedClientDetails.processing_fee)}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Monthly Subscription</span>
                                <p className="text-slate-800 font-medium mt-1">{formatCurrency(selectedClientDetails.monthly_subscription)}/mo</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Delivery Limit Date</span>
                                <p className="text-slate-800 font-medium mt-1">{formatDate(selectedClientDetails.delivery_date || selectedClientDetails.valid_until)}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Delivery Offset Days</span>
                                <div className="flex items-center gap-1.5 mt-1 font-sans">
                                  <input
                                    type="number"
                                    min="0"
                                    defaultValue={selectedClientDetails.delivery_after != null ? selectedClientDetails.delivery_after : 0}
                                    onBlur={(e) => {
                                      const val = parseInt(e.target.value, 10)
                                      if (!isNaN(val) && val !== selectedClientDetails.delivery_after) {
                                        handleUpdateDeliveryDays(selectedClientDetails.id, val)
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const val = parseInt(e.target.value, 10)
                                        if (!isNaN(val) && val !== selectedClientDetails.delivery_after) {
                                          handleUpdateDeliveryDays(selectedClientDetails.id, val)
                                          e.target.blur()
                                        }
                                      }
                                    }}
                                    className="w-14 px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-800 text-center font-bold rounded text-xs focus:outline-none focus:border-blue-500"
                                  />
                                  <span className="text-slate-400 text-[10px]">days</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-100" />

                          {/* Customizations Section */}
                          <div>
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">Customizations & Upgrades</h4>
                            {selectedClientDetails.customizations && selectedClientDetails.customizations.length > 0 ? (
                              <div className="space-y-3 font-sans">
                                {selectedClientDetails.customizations.map((cust, idx) => (
                                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[10px]">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                                      <span className="font-bold text-slate-700">{cust.customization_text}</span>
                                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 uppercase text-[9px]">{cust.status}</span>
                                    </div>
                                    {cust.admin_notes && <p className="text-slate-500 italic">Notes: {cust.admin_notes}</p>}
                                    <div className="flex justify-between items-center text-slate-500">
                                      <span>Quote Cost: <strong className="text-slate-700">{cust.amount ? formatCurrency(cust.amount) : 'Not Quoted'}</strong></span>
                                      <span>Submitted: {new Date(cust.submitted_at).toLocaleDateString('en-IN')}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic text-[11px] font-sans">No customization requests recorded.</p>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {dossierTab === 'ledger' && (
                        <motion.div
                          key="ledger"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-6"
                        >
                          {/* Subscription Payment ledger history */}
                          <div>
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">Subscription Payments & Receipts Ledger</h4>
                            {selectedClientDetails.payments && selectedClientDetails.payments.length > 0 ? (
                              <div className="space-y-3 font-sans">
                                {selectedClientDetails.payments.map((p, index) => {
                                  const start = p.period_covered?.start_date_formatted || (p.period_start ? formatDate(p.period_start) : '—')
                                  const end = p.period_covered?.end_date_formatted || (p.period_end ? formatDate(p.period_end) : '—')
                                  const formattedTotal = p.amount_formatted || formatCurrency(p.amount)
                                  const formattedGst = p.gst_amount_formatted || formatCurrency(p.gst_amount)
                                  const formattedSubtotal = p.amount_before_gst_formatted || formatCurrency(p.amount_before_gst || p.amount)

                                  return (
                                    <div key={index} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[10px]">
                                      <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                                        <span className="font-bold text-slate-500">Payment ID: <span className="font-mono text-blue-600">{p.payment_id || p.razorpay_payment_id}</span></span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-black border border-emerald-200 uppercase text-[9px]">{p.payment_status || p.status || 'Paid'}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-slate-600">
                                        <p><strong className="text-slate-700">Cycle:</strong> <span className="capitalize">{p.cycle_label || p.cycle}</span> ({p.months_paid || p.cycle_months || '—'} mo)</p>
                                        <p><strong className="text-slate-700">Period:</strong> {start} → {end}</p>
                                        <p className="col-span-2"><strong className="text-slate-700">Breakdown:</strong> {formattedSubtotal} + GST ({p.gst_percentage || 18}%): {formattedGst}</p>
                                        <p className="text-emerald-700 font-bold col-span-2"><strong>Total Paid:</strong> {formattedTotal}</p>
                                      </div>
                                      <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-slate-200">
                                        <span className="text-slate-400">Date: {p.payment_date_formatted || formatDate(p.payment_date || p.created_at)}</span>
                                        <button
                                          onClick={() => handleDownloadInvoice(p, selectedClientDetails)}
                                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded font-bold cursor-pointer text-[9px] transition-all"
                                        >
                                          📥 Receipt
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic text-[11px] font-sans">No payments logged yet.</p>
                            )}
                          </div>

                          <div className="border-t border-slate-100" />

                          {/* Add-on Services Payment History */}
                          <div>
                            <h4 className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-3.5 block font-sans">Add-on Services Payment History</h4>
                            {selectedClientDetails.addon_payments && selectedClientDetails.addon_payments.length > 0 ? (
                              <div className="space-y-3 font-sans">
                                {selectedClientDetails.addon_payments.map((p, idx) => (
                                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[10px]">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-black border border-violet-200 uppercase text-[9px]">{p.addon_type}</span>
                                        {p.recipient_type && (
                                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                            p.recipient_type === 'teacher' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          }`}>{p.recipient_type === 'teacher' ? '👨‍🏫 Staff' : '👥 Students'}</span>
                                        )}
                                      </div>
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-black border border-emerald-200 uppercase text-[9px]">{p.payment_status || 'Paid'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-slate-600">
                                      <p><strong className="text-slate-700">Count:</strong> {p.recipient_type === 'teacher' ? (p.teacher_count || '—') : (p.student_count || '—')}</p>
                                      <p><strong className="text-slate-700">Period:</strong> {p.start_date_formatted || '—'} → {p.end_date_formatted || '—'}</p>
                                      <p><strong className="text-slate-700">Subtotal:</strong> {p.subtotal_formatted || '—'}</p>
                                      <p><strong className="text-slate-700">GST:</strong> +{p.gst_amount_formatted || '—'}</p>
                                      <p className="text-emerald-700 font-bold col-span-2"><strong>Total Paid:</strong> {p.amount_formatted || formatCurrency(p.amount)}</p>
                                    </div>
                                    <div className="pt-1 border-t border-dashed border-slate-200 text-slate-400">
                                      Date: {p.payment_date_formatted || '—'} · ID: <span className="font-mono text-blue-600">{p.payment_id || '—'}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic text-[11px] font-sans">No add-on service payments recorded.</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

              {/* Footer */}
              <div className="px-6 py-4 flex justify-end bg-slate-50 border-t border-slate-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer transition-all"
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  )
}


export default AdminSaasClients
