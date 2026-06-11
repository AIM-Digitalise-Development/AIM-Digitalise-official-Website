import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  getAdminClients,
  getAdminProducts,
  updateClientDelivery,
  updateProductDiscounts,
} from '../../api/admin/partners'

const AdminSaasClients = () => {
  const [clients, setClients] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [search, setSearch] = useState('')
  const [activePageTab, setActivePageTab] = useState('show_clients')

  // ── Products state ────────────────────────────────────────────────────────
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)

  // ── Delivery modal state ──────────────────────────────────────────────────
  const [deliveryModal, setDeliveryModal] = useState(false)
  const [deliveryClient, setDeliveryClient] = useState(null)
  const [deliveryDays, setDeliveryDays] = useState('')
  const [deliverySaving, setDeliverySaving] = useState(false)

  // ── Discounts modal state ─────────────────────────────────────────────────
  const [discountModal, setDiscountModal] = useState(false)
  const [discountProduct, setDiscountProduct] = useState(null)
  const [discounts, setDiscounts] = useState({
    monthly_discount: 0,
    quarterly_discount: 0,
    half_yearly_discount: 0,
    annual_discount: 0,
  })
  const [discountSaving, setDiscountSaving] = useState(false)

  // ── Flash helpers ─────────────────────────────────────────────────────────
  const flashSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3500)
  }
  const flashError = (msg) => {
    setError(msg)
    setTimeout(() => setError(null), 4000)
  }

  // ── Fetch clients ─────────────────────────────────────────────────────────
  const fetchClients = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAdminClients()
      if (res.data?.success) {
        const all = res.data.data.all_clients || []
        const filtered = all.filter(c => c.product_category === 'nexgn')
        setClients(filtered)
        setSummary({
          total_clients: filtered.length,
          active_clients: filtered.filter(c => c.is_active).length,
          total_revenue: filtered.reduce((acc, c) => acc + (Number(c.processing_fee) || 0), 0),
        })
      } else {
        setError(res.data?.message || 'Failed to fetch clients list')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching clients')
    } finally {
      setLoading(false)
    }
  }

  // ── Fetch products ────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    setProductsLoading(true)
    try {
      const res = await getAdminProducts()
      if (res.data?.success) {
        setProducts(res.data.data || [])
      } else {
        flashError(res.data?.message || 'Failed to fetch products')
      }
    } catch (err) {
      flashError(err.message || 'Error fetching products')
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => { fetchClients() }, [])

  useEffect(() => {
    if (activePageTab === 'products') fetchProducts()
  }, [activePageTab])

  // ── Filtered client list ──────────────────────────────────────────────────
  const filteredClients = clients.filter(client => {
    const q = search.toLowerCase()
    return (
      (client.client_name || '').toLowerCase().includes(q) ||
      (client.email || '').toLowerCase().includes(q) ||
      (client.client_id || '').toString().toLowerCase().includes(q) ||
      (client.product_name || '').toLowerCase().includes(q) ||
      (client.partner_name || '').toLowerCase().includes(q)
    )
  })

  // ── Open delivery modal ───────────────────────────────────────────────────
  const openDeliveryModal = (client) => {
    setDeliveryClient(client)
    setDeliveryDays(client.delivery_after !== null && client.delivery_after !== undefined ? String(client.delivery_after) : '')
    setDeliveryModal(true)
  }

  // ── Save delivery ─────────────────────────────────────────────────────────
  const saveDelivery = async () => {
    const days = parseInt(deliveryDays, 10)
    if (isNaN(days) || days < 0) {
      flashError('Enter a valid number of days (0 or more)')
      return
    }
    setDeliverySaving(true)
    try {
      const res = await updateClientDelivery(deliveryClient.id, days)
      if (res.data?.success) {
        flashSuccess(`Delivery set to ${days} days for ${deliveryClient.client_name}`)
        setDeliveryModal(false)
        fetchClients()
      } else {
        flashError(res.data?.message || 'Failed to update delivery')
      }
    } catch (err) {
      flashError(err.message || 'Error updating delivery')
    } finally {
      setDeliverySaving(false)
    }
  }

  // ── Open discounts modal ──────────────────────────────────────────────────
  const openDiscountModal = (product) => {
    setDiscountProduct(product)
    setDiscounts({
      monthly_discount: product.pricing?.monthly?.discount_percentage || 0,
      quarterly_discount: product.pricing?.quarterly?.discount_percentage || 0,
      half_yearly_discount: product.pricing?.half_yearly?.discount_percentage || 0,
      annual_discount: product.pricing?.annual?.discount_percentage || 0,
    })
    setDiscountModal(true)
  }

  // ── Save discounts ────────────────────────────────────────────────────────
  const saveDiscounts = async () => {
    setDiscountSaving(true)
    try {
      const res = await updateProductDiscounts(discountProduct.id, discounts)
      if (res.data?.success) {
        flashSuccess(`Discounts updated for ${discountProduct.name}`)
        setDiscountModal(false)
        fetchProducts()
      } else {
        flashError(res.data?.message || 'Failed to update discounts')
      }
    } catch (err) {
      flashError(err.message || 'Error updating discounts')
    } finally {
      setDiscountSaving(false)
    }
  }

  // ── Discount field helper ─────────────────────────────────────────────────
  const DiscountInput = ({ label, field, icon }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        <span>{icon}</span>{label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          max="100"
          value={discounts[field]}
          onChange={e => setDiscounts(prev => ({ ...prev, [field]: Number(e.target.value) }))}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all"
        />
        <span className="text-slate-500 font-bold text-sm">%</span>
      </div>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>SaaS Based Clients | Admin Panel</title>
      </Helmet>

      {/* ── Delivery Modal ─────────────────────────────────────────────── */}
      {deliveryModal && deliveryClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-slate-200/80">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <span className="text-purple-500 text-lg">🚚</span> Edit Delivery After
              </h3>
              <button
                onClick={() => setDeliveryModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors text-lg font-bold cursor-pointer"
              >×</button>
            </div>

            <div className="mb-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-400 font-semibold">Client</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">{deliveryClient.client_name}</p>
              <p className="text-[10px] text-slate-400 font-medium">{deliveryClient.email}</p>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Delivery After (days)
              </label>
              <input
                type="number"
                min="0"
                value={deliveryDays}
                onChange={e => setDeliveryDays(e.target.value)}
                placeholder="e.g. 7"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                autoFocus
              />
              <p className="text-[10px] text-slate-400 font-medium">
                How many days after payment should delivery happen?
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeliveryModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
              >Cancel</button>
              <button
                onClick={saveDelivery}
                disabled={deliverySaving}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer"
              >{deliverySaving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Discounts Modal ────────────────────────────────────────────── */}
      {discountModal && discountProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-200/80">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <span className="text-blue-500 text-lg">🏷️</span> Edit Discounts
              </h3>
              <button
                onClick={() => setDiscountModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors text-lg font-bold cursor-pointer"
              >×</button>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-400 font-semibold">Product</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">{discountProduct.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">
                Base price: ₹{Number(discountProduct.monthly_subscription || 0).toLocaleString('en-IN')}/mo
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DiscountInput label="Monthly" field="monthly_discount" icon="📅" />
              <DiscountInput label="Quarterly" field="quarterly_discount" icon="📆" />
              <DiscountInput label="Half-Yearly" field="half_yearly_discount" icon="🗓️" />
              <DiscountInput label="Annual" field="annual_discount" icon="🎯" />
            </div>

            <p className="text-[10px] text-slate-400 font-medium mt-3">
              Discounts are applied as % off the total subscription amount for the chosen billing cycle.
            </p>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDiscountModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
              >Cancel</button>
              <button
                onClick={saveDiscounts}
                disabled={discountSaving}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
              >{discountSaving ? 'Saving...' : 'Save Discounts'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Header */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">SaaS Based Clients</h1>
          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>
          <div className="w-48 flex justify-end">
            {activePageTab === 'show_clients' && (
              <button
                onClick={fetchClients}
                disabled={loading}
                className="px-4 py-2 border border-slate-200 hover:border-[#38b34a] hover:bg-[#38b34a]/5 hover:text-[#38b34a] bg-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer text-slate-600 shadow-sm"
              >
                {loading ? 'Refreshing...' : 'Refresh Clients'}
              </button>
            )}
            {activePageTab === 'products' && (
              <button
                onClick={fetchProducts}
                disabled={productsLoading}
                className="px-4 py-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 bg-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer text-slate-600 shadow-sm"
              >
                {productsLoading ? 'Refreshing...' : 'Refresh Products'}
              </button>
            )}
          </div>
        </div>

        {/* Flash messages */}
        {error && (
          <div className="p-3 rounded-xl border border-red-400/20 bg-red-50 text-red-600 text-sm font-semibold flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl border border-emerald-400/20 bg-emerald-50 text-emerald-700 text-sm font-semibold flex items-center gap-2">
            ✅ {successMsg}
          </div>
        )}

        {/* White container card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">

          {/* Tab Row */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            {[
              { id: 'show_clients', label: 'Show Clients' },
              { id: 'products', label: '🏷️ Products & Discounts' },
              { id: 'follow_up', label: 'Follow Up' },
              { id: 'customization', label: 'Customization' },
              { id: 'renewal', label: 'Renewal / Add Product' },
              { id: 'due_payment', label: 'Due Payment' },
              { id: 'payment_report', label: 'Payment Report' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePageTab(tab.id)}
                className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                  activePageTab === tab.id
                    ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
                }`}
              >{tab.label}</button>
            ))}
          </div>

          {/* ─ Tab: Show Clients ────────────────────────────────────────── */}
          {activePageTab === 'show_clients' && (
            <div className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-center justify-between">
                  <span>{error}</span>
                  <button onClick={fetchClients} className="text-xs font-bold underline hover:no-underline">Try Again</button>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total SaaS Clients</span>
                    <span className="text-3xl font-black text-slate-800 mt-1.5 block">{loading ? '...' : (summary?.total_clients ?? 0)}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 font-bold border border-blue-100">👥</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Subscriptions</span>
                    <span className="text-3xl font-black text-emerald-500 mt-1.5 block">{loading ? '...' : (summary?.active_clients ?? 0)}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold border border-emerald-100">✅</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
                    <span className="text-3xl font-black text-aim-gold mt-1.5 block">
                      {loading ? '...' : `₹${(summary?.total_revenue ?? 0).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-500 font-bold border border-yellow-100">₹</div>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by ID, name, email, product, or partner..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Clients Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Client ID</th>
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4">Product Instance</th>
                        <th className="px-6 py-4">Attributed Partner</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Delivery After</th>
                        <th className="px-6 py-4 text-right">Processing Fee</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="text-center py-10 font-bold">
                            <span className="inline-block animate-spin mr-2">🔄</span> Loading clients...
                          </td>
                        </tr>
                      ) : filteredClients.length > 0 ? (
                        filteredClients.map(client => (
                          <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-slate-500">{client.client_id}</td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800 text-sm">{client.client_name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{client.email || '—'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase tracking-wide">
                                {client.product_name?.substring(0, 32)}{client.product_name?.length > 32 ? '...' : ''}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-600">{client.partner_name || '—'}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${
                                client.is_active
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border-rose-200'
                              }`}>
                                {client.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {client.delivery_after !== null && client.delivery_after !== undefined ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                                  {client.delivery_after} days
                                </span>
                              ) : (
                                <span className="text-slate-300 font-semibold text-[10px]">— Not set</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right font-black text-slate-800 text-sm">
                              ₹{Number(client.processing_fee || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => openDeliveryModal(client)}
                                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors text-[10px] cursor-pointer whitespace-nowrap"
                              >
                                🚚 Edit Delivery
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-12 text-slate-400">
                            <span className="text-3xl block">📁</span>
                            <p className="font-bold mt-2">No clients found matching search</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─ Tab: Products & Discounts ──────────────────────────────── */}
          {activePageTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-blue-500 text-lg">🏷️</span>
                  <span>Products &amp; Subscription Discounts</span>
                </h3>
              </div>

              {productsLoading ? (
                <div className="text-center py-12 text-slate-400 font-bold">
                  <span className="inline-block animate-spin mr-2">🔄</span> Loading products...
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="text-3xl block">📦</span>
                  <p className="font-bold mt-2">No products found</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Product Name</th>
                          <th className="px-6 py-4 text-right">Base Price/mo</th>
                          <th className="px-6 py-4 text-center">Monthly %</th>
                          <th className="px-6 py-4 text-center">Quarterly %</th>
                          <th className="px-6 py-4 text-center">Half-Yearly %</th>
                          <th className="px-6 py-4 text-center">Annual %</th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {products.map(product => (
                          <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800 text-sm">{product.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">ID: {product.id}</p>
                            </td>
                            <td className="px-6 py-4 text-right font-black text-slate-800">
                              ₹{Number(product.monthly_subscription || 0).toLocaleString('en-IN')}
                            </td>
                            {[
                              product.pricing?.monthly?.discount_percentage,
                              product.pricing?.quarterly?.discount_percentage,
                              product.pricing?.half_yearly?.discount_percentage,
                              product.pricing?.annual?.discount_percentage,
                            ].map((pct, i) => (
                              <td key={i} className="px-6 py-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                                  (pct || 0) > 0
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                }`}>
                                  {pct || 0}%
                                </span>
                              </td>
                            ))}
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => openDiscountModal(product)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-[10px] cursor-pointer whitespace-nowrap"
                              >
                                🏷️ Edit Discounts
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Info card */}
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2 text-sm">📊 Billing Cycle Discounts</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-blue-700 font-semibold">
                  <div>📅 <strong>Monthly</strong> — Pay monthly</div>
                  <div>📆 <strong>Quarterly</strong> — 3 months upfront</div>
                  <div>🗓️ <strong>Half-Yearly</strong> — 6 months upfront</div>
                  <div>🎯 <strong>Annual</strong> — 12 months upfront</div>
                </div>
              </div>
            </div>
          )}

          {/* ─ Tab: Follow Up ────────────────────────────────────────────── */}
          {activePageTab === 'follow_up' && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3.5">
              <span className="text-4xl">📞</span>
              <h4 className="text-base font-bold text-slate-800">Follow Up Reminders</h4>
              <p className="text-xs text-slate-400 font-medium max-w-sm leading-relaxed font-sans">
                Active follow-up schedules, client feedback timelines, and partner support logs will be displayed here.
              </p>
            </div>
          )}

          {/* ─ Tab: Customization ──────────────────────────────────────── */}
          {activePageTab === 'customization' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-purple-500 text-lg">⚙️</span>
                  <span>Client Customization Requests</span>
                </h3>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Request ID</th>
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4">Requested Module</th>
                        <th className="px-6 py-4">Submission Date</th>
                        <th className="px-6 py-4">Est. Delivery</th>
                        <th className="px-6 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-500">REQ-2026-004</td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">Sunrise Academy</td>
                        <td className="px-6 py-4">Custom Certificate Template Generation</td>
                        <td className="px-6 py-4 text-slate-400">12 May 2026</td>
                        <td className="px-6 py-4 text-slate-400">20 June 2026</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider bg-purple-100 text-purple-800 border-purple-200">In Progress</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-500">REQ-2026-003</td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">Greenfield School</td>
                        <td className="px-6 py-4">Automated WhatsApp Alert Gateway</td>
                        <td className="px-6 py-4 text-slate-400">08 May 2026</td>
                        <td className="px-6 py-4 text-slate-400">10 June 2026</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider bg-amber-100 text-amber-800 border-amber-200">Pending</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─ Tab: Renewal ──────────────────────────────────────────────── */}
          {activePageTab === 'renewal' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-emerald-500 text-lg">🔄</span>
                  <span>Renewals &amp; Products Management</span>
                </h3>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4">Current Active Product</th>
                        <th className="px-6 py-4">Expiration Date</th>
                        <th className="px-6 py-4 text-right">Renewal Cost</th>
                        <th className="px-6 py-4 text-center">Days Remaining</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">Greenfield School</td>
                        <td className="px-6 py-4">School MS (Silver Plan)</td>
                        <td className="px-6 py-4 text-slate-400">11 Jun 2026</td>
                        <td className="px-6 py-4 text-right font-black text-slate-800">₹30,000.00</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">5 Days Left</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 transition-colors cursor-pointer">Renew</button>
                            <button className="px-2.5 py-1 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors cursor-pointer">+ Add Product</button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─ Tab: Due Payment ──────────────────────────────────────────── */}
          {activePageTab === 'due_payment' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <span>Outstanding Client Payments</span>
                </h3>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Invoice ID</th>
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4 text-right">Outstanding Amount</th>
                        <th className="px-6 py-4">Due Date</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-500">INV-2026-089</td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">Blue Hill Institute</td>
                        <td className="px-6 py-4 text-right font-black text-rose-600">₹15,000.00</td>
                        <td className="px-6 py-4 text-slate-400">28 May 2026</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 animate-pulse">Overdue</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="px-3 py-1.5 bg-[#ff6600] text-white rounded font-bold hover:bg-[#e05500] transition-colors text-xs cursor-pointer">Send Reminder</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─ Tab: Payment Report ──────────────────────────────────────── */}
          {activePageTab === 'payment_report' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-blue-500 text-lg">📄</span>
                  <span>Payment History &amp; Invoice Reports</span>
                </h3>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Transaction ID</th>
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4 text-right">Amount Received</th>
                        <th className="px-6 py-4">Receipt Date</th>
                        <th className="px-6 py-4">Payment Method</th>
                        <th className="px-6 py-4 text-center">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-500">TXN-98014529</td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">Sunrise Academy</td>
                        <td className="px-6 py-4 text-right font-black text-emerald-600">₹45,000.00</td>
                        <td className="px-6 py-4 text-slate-400">10 Apr 2026</td>
                        <td className="px-6 py-4 text-slate-600 font-semibold">UPI / Razorpay</td>
                        <td className="px-6 py-4 text-center">
                          <button className="text-blue-600 hover:text-blue-800 font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer">
                            📥 Download
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default AdminSaasClients
