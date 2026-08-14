import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  getGeneralClients,
  getGeneralClientById,
  createGeneralClient,
  deleteGeneralClient,
  createQuotation,
  sendQuotation,
  getCountryTaxes,
  updateCountryTax,
  setCountryPrice,
  getPublicProductsForCountry,
  getSubscriptionClients,
} from '../../api/admin/generalClients'

const countryFlags = {
  IN: '🇮🇳',
  NP: '🇳🇵',
  BT: '🇧🇹',
}

const AdminUsers = () => {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState('clients') // 'clients' | 'show_clients' | 'pricing' | 'follow_up' | 'due_payment' | 'payment_report'

  // Loading & Alert Messages
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  // ============================================================
  // 1. GENERAL CLIENTS STATE
  // ============================================================
  const [generalClients, setGeneralClients] = useState([])
  const [loadingGenClients, setLoadingGenClients] = useState(false)
  const [genClientSearch, setGenClientSearch] = useState('')
  const [showAddClientModal, setShowAddClientModal] = useState(false)

  // Add Client Form State
  const [clientForm, setClientForm] = useState({
    client_name: '',
    company_name: '',
    email: '',
    contact_number: '',
    alt_contact_number: '',
    address: '',
    district: '',
    state: '',
    pin_code: '',
    country_code: 'IN',
    gst_type: 'Intra-State', // Intra-State (CGST+SGST) or Inter-State (IGST)
    gstin: '',
    lead_source: 'Website',
    referred_by: 'Direct',
    software_requirements: '',
  })

  // Quotations List Modal State
  const [showQuotationsListModal, setShowQuotationsListModal] = useState(false)
  const [selectedClientQuotations, setSelectedClientQuotations] = useState([])

  // ============================================================
  // 2. QUOTATION BUILDER STATE
  // ============================================================
  const [selectedGenClient, setSelectedGenClient] = useState(null)
  const [showQuotationBuilder, setShowQuotationBuilder] = useState(false)
  const [quotationForm, setQuotationForm] = useState({
    quotation_date: new Date().toISOString().substring(0, 10),
    quotation_number: '',
    po_number: '',
    po_date: '',
    discount_description: '',
    payment_terms: 'Due on Receipt',
    gst_type: 'Intra-State',
    gstin: '',
    anexture: 'NO',
  })
  const [quotationItems, setQuotationItems] = useState([])

  // ============================================================
  // 3. COUNTRY TAXES & PRICING OVERRIDES STATE
  // ============================================================
  const [taxes, setTaxes] = useState([])
  const [editingTax, setEditingTax] = useState(null)
  const [taxForm, setTaxForm] = useState({ tax_rate: '', tax_name: '' })

  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [priceForm, setPriceForm] = useState({
    country_code: 'NP',
    currency: 'NPR',
    processing_fee: '',
    monthly_subscription: '',
  })

  // Subscription Clients
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(false)

  // Load Initial Data
  useEffect(() => {
    fetchGeneralClientsList()
    fetchCountryTaxesList()
    fetchProductsList()
    fetchSubscriptionClientsList()
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      fetchCurrentPriceForCountry(selectedProduct.id, priceForm.country_code)
    }
  }, [selectedProduct, priceForm.country_code])

  // Fetch General Clients
  const fetchGeneralClientsList = async () => {
    setLoadingGenClients(true)
    try {
      const res = await getGeneralClients()
      const result = res.data
      if (result.success) {
        setGeneralClients(result.data || [])
      }
    } catch (err) {
      console.error('Error fetching general clients:', err)
    } finally {
      setLoadingGenClients(false)
    }
  }

  // Fetch Country Taxes
  const fetchCountryTaxesList = async () => {
    try {
      const res = await getCountryTaxes()
      const result = res.data
      if (result.success) {
        setTaxes(result.data || [])
      }
    } catch (err) {
      console.error('Error fetching country taxes:', err)
    }
  }

  // Fetch Products Catalog
  const fetchProductsList = async () => {
    try {
      const res = await getPublicProductsForCountry('IN')
      const result = res.data
      if (result.success && result.data) {
        const allProds = []
        result.data.forEach((subCat) => {
          if (subCat.products) {
            allProds.push(...subCat.products)
          }
        })
        setProducts(allProds)
        if (allProds.length > 0 && !selectedProduct) {
          setSelectedProduct(allProds[0])
        }
      }
    } catch (err) {
      console.error('Error fetching products catalog:', err)
    }
  }

  // Fetch Subscription Clients
  const fetchSubscriptionClientsList = async () => {
    setLoadingClients(true)
    try {
      const res = await getSubscriptionClients()
      const result = res.data
      if (result.success && result.data && result.data.all_clients) {
        setClients(result.data.all_clients)
      }
    } catch (err) {
      console.error('Error fetching subscription clients:', err)
    } finally {
      setLoadingClients(false)
    }
  }

  // Fetch Price for selected country product
  const fetchCurrentPriceForCountry = async (productId, countryCode) => {
    try {
      const res = await getPublicProductsForCountry(countryCode)
      const result = res.data
      if (result.success && result.data) {
        let foundProd = null
        result.data.forEach((subCat) => {
          const match = subCat.products?.find((p) => p.id === productId)
          if (match) foundProd = match
        })
        if (foundProd) {
          const tax = foundProd.tax || {}
          setPriceForm((prev) => ({
            ...prev,
            processing_fee: tax.subtotal ?? foundProd.processing_fee ?? '',
            monthly_subscription: foundProd.monthly_subscription ?? '',
            currency: foundProd.currency || (countryCode === 'NP' ? 'NPR' : countryCode === 'BT' ? 'BTN' : 'INR'),
          }))
        }
      }
    } catch (err) {
      console.error('Error fetching country price:', err)
    }
  }

  // ============================================================
  // HANDLERS: GENERAL CLIENT CREATION & MANAGEMENT
  // ============================================================
  const handleCreateGeneralClient = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setMessage(null)

    try {
      const res = await createGeneralClient(clientForm)
      const result = res.data
      if (result.success) {
        setMessage(`✅ General Client "${result.data.client_name}" created with ID: ${result.data.client_id}`)
        setShowAddClientModal(false)
        setClientForm({
          client_name: '',
          company_name: '',
          email: '',
          contact_number: '',
          alt_contact_number: '',
          address: '',
          district: '',
          state: '',
          pin_code: '',
          country_code: 'IN',
          gst_type: 'Intra-State',
          gstin: '',
          lead_source: 'Website',
          referred_by: 'Direct',
          software_requirements: '',
        })
        fetchGeneralClientsList()
        // Automatically switch to Show Clients tab to see newly created client
        setActiveTab('show_clients')
      } else {
        setErrorMsg(result.message || 'Failed to create general client')
      }
    } catch (err) {
      setErrorMsg('Error creating general client: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // Delete Client Handler
  const handleDeleteGeneralClient = async (client) => {
    if (!window.confirm(`Are you sure you want to remove client "${client.client_name}" (${client.client_id})?`)) return

    setLoading(true)
    setErrorMsg(null)
    setMessage(null)
    try {
      const res = await deleteGeneralClient(client.id)
      if (res.data?.success || res.data?.status === 'success') {
        setMessage(`✅ Client "${client.client_name}" deleted successfully.`)
        fetchGeneralClientsList()
      } else {
        setErrorMsg(res.data?.message || 'Failed to delete client.')
      }
    } catch (err) {
      setErrorMsg('Error deleting client: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // Open Quotation Builder UI
  const handleOpenQuotationBuilder = (client) => {
    setSelectedGenClient(client)
    const todayStr = new Date().toISOString().substring(0, 10)
    const dateSeq = new Date().toLocaleDateString('en-GB').replace(/\//g, '')
    const randSeq = Math.floor(100 + Math.random() * 900)

    setQuotationForm({
      quotation_date: todayStr,
      quotation_number: `AIM-${dateSeq}-${randSeq}`,
      po_number: '',
      po_date: '',
      discount_description: '',
      payment_terms: 'Due on Receipt',
      gst_type: client.gst_type || 'Intra-State',
      gstin: client.gstin || '',
      anexture: 'NO',
    })
    setQuotationItems([])
    setShowQuotationBuilder(true)
  }

  // Add Product from Catalog to Line Items
  const handleAddCatalogProductToQuotation = (prod) => {
    const defaultDesc = prod.name.includes('Website')
      ? 'Completely corporate looking informative dynamic website pages with customer enquiry form, social media integration, call/email integration, and google map integration. Admin login details.'
      : `Scope and specifications for ${prod.name}`

    const newItem = {
      product_id: prod.id,
      product_name: prod.name,
      hsn: '9983',
      qty: 1,
      unit: 'Unit',
      selling_price: prod.price !== undefined ? prod.price : prod.processing_fee || 0,
      discount_percentage: 0,
      description: prod.description || defaultDesc,
    }
    setQuotationItems((prev) => [...prev, newItem])
  }

  const handleAddEmptyItem = () => {
    setQuotationItems((prev) => [
      ...prev,
      {
        product_id: null,
        product_name: '',
        hsn: '9983',
        qty: 1,
        unit: 'Unit',
        selling_price: 0,
        discount_percentage: 0,
        description: '',
      },
    ])
  }

  const handleRemoveItem = (index) => {
    setQuotationItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleItemChange = (index, field, value) => {
    setQuotationItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  // Calculate Quotation Totals Live
  const computeQuotationTotals = () => {
    let subtotal = 0
    quotationItems.forEach((item) => {
      const qty = parseFloat(item.qty) || 0
      const price = parseFloat(item.selling_price) || 0
      const disc = parseFloat(item.discount_percentage) || 0
      const discPrice = price * (1 - disc / 100)
      subtotal += qty * discPrice
    })

    subtotal = Math.round(subtotal * 100) / 100

    const isIndia = (selectedGenClient?.country_code || 'IN') === 'IN'
    const isIntra = quotationForm.gst_type === 'Intra-State'

    let cgst = 0,
      sgst = 0,
      igst = 0,
      taxTotal = 0

    if (isIndia) {
      if (isIntra) {
        cgst = Math.round(subtotal * 0.09 * 100) / 100
        sgst = Math.round(subtotal * 0.09 * 100) / 100
        taxTotal = cgst + sgst
      } else {
        igst = Math.round(subtotal * 0.18 * 100) / 100
        taxTotal = igst
      }
    } else {
      taxTotal = Math.round(subtotal * 0.18 * 100) / 100
    }

    const grandTotal = Math.round((subtotal + taxTotal) * 100) / 100

    return { subtotal, cgst, sgst, igst, taxTotal, grandTotal }
  }

  // Save Quotation / Generate & Copy Payment Link
  const handleSaveQuotation = async (e, sendImmediately = false) => {
    if (e) e.preventDefault()
    if (!selectedGenClient) return

    setLoading(true)
    setErrorMsg(null)
    setMessage(null)

    const payload = {
      ...quotationForm,
      items: quotationItems,
    }

    try {
      const res = await createQuotation(selectedGenClient.id, payload)
      const result = res.data
      if (result.success) {
        const quotationId = result.data.id
        setMessage(`✅ Quotation "${result.data.quotation_number}" created successfully!`)

        if (sendImmediately) {
          try {
            const sendRes = await sendQuotation(quotationId)
            const sendResult = sendRes.data
            if (sendResult.success) {
              const payUrl =
                sendResult.payment_url || `${window.location.origin}/general-quotation-pay.html?uuid=${result.data.uuid}`

              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(payUrl)
                alert(`📋 Quotation saved & Payment Link copied to clipboard!\n\nPayment Link: ${payUrl}`)
              } else {
                alert(`📋 Quotation saved! Payment Link:\n\n${payUrl}`)
              }
              setMessage(`📋 Quotation "${result.data.quotation_number}" saved & Payment Link copied to clipboard!`)
            }
          } catch (sendErr) {
            console.error('Error sending quotation:', sendErr)
          }
        }

        setShowQuotationBuilder(false)
        fetchGeneralClientsList()
      } else {
        setErrorMsg(result.message || 'Failed to save quotation')
      }
    } catch (err) {
      setErrorMsg('Error saving quotation: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // View Client's Previous Quotations
  const handleViewClientQuotations = async (client) => {
    setSelectedGenClient(client)
    try {
      const res = await getGeneralClientById(client.id)
      const result = res.data
      if (result.success && result.data) {
        setSelectedClientQuotations(result.data.quotations || [])
        setShowQuotationsListModal(true)
      }
    } catch (err) {
      console.error('Error fetching client quotations:', err)
    }
  }

  // Edit Country Tax Rate
  const handleEditTaxClick = (tax) => {
    setEditingTax(tax)
    setTaxForm({ tax_rate: tax.tax_rate, tax_name: tax.tax_name })
  }

  const handleUpdateTax = async (e) => {
    e.preventDefault()
    if (!editingTax) return

    setLoading(true)
    setMessage(null)
    setErrorMsg(null)

    try {
      const res = await updateCountryTax(editingTax.id, {
        tax_rate: parseFloat(taxForm.tax_rate),
        tax_name: taxForm.tax_name,
        is_active: true,
      })
      const result = res.data
      if (result.success) {
        setMessage(`✅ ${editingTax.country_name} Tax updated to ${result.data.tax_name} (${result.data.tax_rate}%) successfully!`)
        setEditingTax(null)
        fetchCountryTaxesList()
      } else {
        setErrorMsg(result.message || 'Failed to update tax')
      }
    } catch (err) {
      setErrorMsg('Error updating tax: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // Set Product Country Price Override
  const handleSetCountryPrice = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return

    setLoading(true)
    setMessage(null)
    setErrorMsg(null)

    try {
      const res = await setCountryPrice(selectedProduct.id, {
        country_code: priceForm.country_code,
        currency: priceForm.currency,
        processing_fee: parseFloat(priceForm.processing_fee),
        monthly_subscription: parseFloat(priceForm.monthly_subscription),
      })
      const result = res.data
      if (result.success) {
        setMessage(
          `🎉 Saved custom fee for "${selectedProduct.name}" in ${priceForm.country_code} (${priceForm.currency} ${priceForm.processing_fee})!`
        )
        fetchCurrentPriceForCountry(selectedProduct.id, priceForm.country_code)
      } else {
        setErrorMsg(result.message || 'Failed to set country price')
      }
    } catch (err) {
      setErrorMsg('Error setting country price: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const totals = computeQuotationTotals()

  // General Clients filtered list
  const filteredGeneralClients = generalClients.filter((c) => {
    const q = genClientSearch.toLowerCase()
    return (
      !q ||
      (c.client_name && c.client_name.toLowerCase().includes(q)) ||
      (c.client_id && c.client_id.toLowerCase().includes(q)) ||
      (c.company_name && c.company_name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.state && c.state.toLowerCase().includes(q)) ||
      (c.contact_number && c.contact_number.toLowerCase().includes(q))
    )
  })

  return (
    <>
      <Helmet>
        <title>General Clients | Admin Panel</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Page Header */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          <div>
            <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight flex items-center gap-2">
              <span>General Clients</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Manage Tax Rates, Product Country Prices, and General Clients with dynamic Quotations & Payment Links.
            </p>
          </div>

          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchGeneralClientsList()}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span>🔄</span>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Global Alert Banners */}
        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-extrabold text-sm">
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-900 font-extrabold text-sm">
              ✕
            </button>
          </div>
        )}

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
          {/* Top Tabs Switcher */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            {/* 1. Clients Tab */}
            <button
              onClick={() => {
                setActiveTab('clients')
                setShowQuotationBuilder(false)
              }}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'clients'
                  ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-transparent'
              }`}
            >
              Clients
            </button>

            {/* 2. Show Clients Tab */}
            <button
              onClick={() => {
                setActiveTab('show_clients')
                setShowQuotationBuilder(false)
              }}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'show_clients'
                  ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-transparent'
              }`}
            >
              Show Clients
            </button>

            {/* 3. Country Taxes Tab */}
            <button
              onClick={() => {
                setActiveTab('pricing')
                setShowQuotationBuilder(false)
              }}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'pricing'
                  ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-transparent'
              }`}
            >
              🌐 Country Taxes & Pricing Overrides
            </button>

            {/* 4. Follow Up Tab */}
            <button
              onClick={() => setActiveTab('follow_up')}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'follow_up'
                  ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-transparent'
              }`}
            >
              📞 Follow Up
            </button>

            {/* 5. Due Payment Tab */}
            <button
              onClick={() => setActiveTab('due_payment')}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'due_payment'
                  ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-transparent'
              }`}
            >
              ⚠️ Due Payment
            </button>

            {/* 6. Payment Report Tab */}
            <button
              onClick={() => setActiveTab('payment_report')}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'payment_report'
                  ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-transparent'
              }`}
            >
              📑 Payment Report
            </button>
          </div>

          {/* TAB 1: CLIENTS (3 Action Cards: Add Client, Bulk Upload, Remove Client) */}
          {activeTab === 'clients' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Clients</span>
                </h3>
                <button
                  onClick={() => setActiveTab('show_clients')}
                  className="text-xs font-bold text-[#38b34a] hover:bg-emerald-50 rounded-xl px-3 py-1.5 border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Clients ({generalClients.length})</span>
                  <span>→</span>
                </button>
              </div>

              {/* 3 Gradient Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
                {/* 1. Add Client Gradient Card */}
                <div
                  onClick={() => setShowAddClientModal(true)}
                  className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center min-h-[190px] hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
                  <div className="w-14 h-14 rounded-2xl bg-teal-100/90 flex items-center justify-center shadow-md mb-4 shrink-0">
                    <svg className="w-7 h-7 text-[#0d9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span className="text-lg font-extrabold tracking-tight">Add Client</span>
                  <span className="text-xs text-purple-200 mt-1 font-medium">Single Entry Form</span>
                </div>

                {/* 2. Bulk Upload Gradient Card */}
                <div
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.csv, .xlsx, .xls'
                    input.onchange = (e) => {
                      const file = e.target.files[0]
                      if (file) {
                        alert(`✅ Selected file "${file.name}" for bulk upload. Processing records...`)
                      }
                    }
                    input.click()
                  }}
                  className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center min-h-[190px] hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-100/90 flex items-center justify-center shadow-md mb-4 shrink-0">
                    <svg className="w-7 h-7 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <span className="text-lg font-extrabold tracking-tight">Bulk Upload</span>
                  <span className="text-xs text-emerald-100 mt-1 font-medium">Upload CSV / Excel File</span>
                </div>

                {/* 3. Remove Client Gradient Card */}
                <div
                  onClick={() => {
                    setActiveTab('show_clients')
                    setMessage('💡 Manage or remove clients directly from the Show Clients directory table.')
                  }}
                  className="bg-gradient-to-br from-[#f59e0b] to-[#ea580c] rounded-2xl p-6 text-white shadow-lg flex flex-col items-center justify-center min-h-[190px] hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
                  <div className="w-14 h-14 rounded-2xl bg-pink-100/90 flex items-center justify-center shadow-md mb-4 shrink-0">
                    <svg className="w-7 h-7 text-[#db2777]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <span className="text-lg font-extrabold tracking-tight">Remove Client</span>
                  <span className="text-xs text-amber-100 mt-1 font-medium">Manage & Delete Client Entries</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHOW CLIENTS (Client Details & Quotation Creation) */}
          {activeTab === 'show_clients' && (
            <div>
              {!showQuotationBuilder ? (
                /* General Clients Directory View */
                <div className="space-y-6 animate-fade-in">
                  {/* Action Bar & Stats Summary */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Show Clients Directory</h2>
                      <p className="text-xs text-slate-500 font-medium">
                        View client details, specifications, and build custom Quotations with online payment links.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchGeneralClientsList()}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <span>🔄 Refresh</span>
                      </button>
                      <button
                        onClick={() => setShowAddClientModal(true)}
                        className="px-4 py-2 bg-[#38b34a] hover:bg-[#329f42] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                      >
                        <span>➕ Add Client</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-4 border border-blue-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">Total General Clients</span>
                        <span className="text-2xl font-black text-slate-800 mt-1 block">
                          {loadingGenClients ? '...' : generalClients.length}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                        👥
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-slate-50 rounded-2xl p-4 border border-purple-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider block">Quotations Built</span>
                        <span className="text-2xl font-black text-purple-700 mt-1 block">
                          {generalClients.reduce((acc, c) => acc + (c.quotations_count || c.quotations?.length || 0), 0)}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
                        📝
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-slate-50 rounded-2xl p-4 border border-emerald-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Country Distribution</span>
                        <span className="text-2xl font-black text-emerald-700 mt-1 block">
                          {generalClients.filter((c) => c.country_code === 'IN').length} IN / {generalClients.filter((c) => c.country_code !== 'IN').length} Int.
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                        🌐
                      </div>
                    </div>
                  </div>

                  {/* Search Filter */}
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                      type="text"
                      placeholder="Search General Clients by Name, ID, Company, Email, Phone, or State..."
                      value={genClientSearch}
                      onChange={(e) => setGenClientSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-sans"
                    />
                  </div>

                  {/* General Clients Table */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="px-6 py-4">Client Info</th>
                            <th className="px-6 py-4">Contact Person</th>
                            <th className="px-6 py-4">Location / Country</th>
                            <th className="px-6 py-4">GST Type</th>
                            <th className="px-6 py-4">Custom Requirements</th>
                            <th className="px-6 py-4 text-center">Quotations</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {loadingGenClients ? (
                            <tr>
                              <td colSpan="7" className="text-center py-10 font-bold text-slate-400">
                                <span className="inline-block animate-spin mr-2">🔄</span> Loading General Clients...
                              </td>
                            </tr>
                          ) : filteredGeneralClients.length > 0 ? (
                            filteredGeneralClients.map((c) => (
                              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="font-bold text-slate-800 text-sm">{c.client_name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">ID: {c.client_id}</p>
                                  {c.company_name && <p className="text-[11px] text-slate-500 font-semibold mt-0.5">🏢 {c.company_name}</p>}
                                </td>
                                <td className="px-6 py-4">
                                  <p className="font-bold text-slate-700">📞 {c.contact_number || 'N/A'}</p>
                                  <p className="text-[10px] text-slate-400">✉️ {c.email || 'N/A'}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                    <span>{countryFlags[c.country_code] || '🌐'}</span>
                                    <span>{c.country_code}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400">
                                    {c.district ? `${c.district}, ` : ''}
                                    {c.state || 'N/A'}
                                  </p>
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${
                                      c.gst_type === 'Intra-State'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                    }`}
                                  >
                                    {c.gst_type} ({c.gst_type === 'Intra-State' ? 'CGST+SGST' : 'IGST'})
                                  </span>
                                  {c.gstin && <p className="text-[10px] text-slate-400 font-mono mt-1">GSTIN: {c.gstin}</p>}
                                </td>
                                <td className="px-6 py-4 max-w-[220px]">
                                  {c.software_requirements ? (
                                    <p className="text-[11px] text-slate-600 truncate" title={c.software_requirements}>
                                      {c.software_requirements}
                                    </p>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px]">None noted</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() => handleViewClientQuotations(c)}
                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-sm"
                                  >
                                    📋 {c.quotations_count || c.quotations?.length || 0} Quotation(s)
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleOpenQuotationBuilder(c)}
                                      className="px-3.5 py-1.5 bg-[#38b34a] hover:bg-[#329f42] text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1"
                                    >
                                      <span>📝 Create Quotation</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteGeneralClient(c)}
                                      title="Remove Client"
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center py-12 text-slate-400">
                                <span className="text-3xl block">📁</span>
                                <p className="font-bold mt-2">No General Clients found matching search</p>
                                <button
                                  onClick={() => setShowAddClientModal(true)}
                                  className="mt-3 px-4 py-2 bg-[#38b34a] text-white rounded-xl text-xs font-bold"
                                >
                                  + Create New General Client
                                </button>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* Dynamic Quotation Builder UI */
                <div className="space-y-6 animate-fade-in">
                  {/* Builder Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-200 gap-3">
                    <div>
                      <h2 className="text-xl font-black text-[#1e3e6b]">📄 Create Dynamic Quotation for General Client</h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Client: <strong className="text-slate-800">{selectedGenClient?.client_name}</strong> | ID:{' '}
                        <code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{selectedGenClient?.client_id}</code> | State:{' '}
                        {selectedGenClient?.state || 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowQuotationBuilder(false)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      ← Back to Show Clients Directory
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (2 Cols): Client Details + Quotation Details + Line Items */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Box 1: Client Details Summary */}
                      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">Client Details:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Client Name & ID</label>
                            <input
                              type="text"
                              readOnly
                              value={`${selectedGenClient?.client_name || ''} | ID: ${selectedGenClient?.client_id || ''}`}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Contact Person</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedGenClient?.client_name || ''}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Contact No.</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedGenClient?.contact_number || ''}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Alt Contact No.</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedGenClient?.alt_contact_number || 'N/A'}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Email Address</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedGenClient?.email || ''}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Address</label>
                            <input
                              type="text"
                              readOnly
                              value={`${selectedGenClient?.address || ''}, ${selectedGenClient?.district || ''}, ${selectedGenClient?.state || ''}`}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Lead Source</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedGenClient?.lead_source || 'Website'}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Referred By</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedGenClient?.referred_by || 'Direct'}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-700"
                            />
                          </div>
                          <div className="flex items-end">
                            <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wider uppercase border border-emerald-200">
                              [FOLLOWUP ACTIVE]
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Box 2: Quotation Details Form */}
                      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">Quotation Parameters:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Quotation Date</label>
                            <input
                              type="date"
                              value={quotationForm.quotation_date}
                              onChange={(e) => setQuotationForm({ ...quotationForm, quotation_date: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-[#38b34a]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Quotation Number</label>
                            <input
                              type="text"
                              value={quotationForm.quotation_number}
                              onChange={(e) => setQuotationForm({ ...quotationForm, quotation_number: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-700 focus:border-[#38b34a]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Payment Terms</label>
                            <select
                              value={quotationForm.payment_terms}
                              onChange={(e) => setQuotationForm({ ...quotationForm, payment_terms: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-[#38b34a]"
                            >
                              <option value="Due on Receipt">Due on Receipt</option>
                              <option value="50% Advance, 50% Delivery">50% Advance, 50% Delivery</option>
                              <option value="Net 15 Days">Net 15 Days</option>
                              <option value="Net 30 Days">Net 30 Days</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">P.O. Number</label>
                            <input
                              type="text"
                              placeholder="Optional PO number"
                              value={quotationForm.po_number}
                              onChange={(e) => setQuotationForm({ ...quotationForm, po_number: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-[#38b34a]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">P.O. Date</label>
                            <input
                              type="date"
                              value={quotationForm.po_date}
                              onChange={(e) => setQuotationForm({ ...quotationForm, po_date: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-[#38b34a]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">GST Tax Supply Type</label>
                            <select
                              value={quotationForm.gst_type}
                              onChange={(e) => setQuotationForm({ ...quotationForm, gst_type: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-[#38b34a]"
                            >
                              <option value="Intra-State">Intra-State (CGST 9% + SGST 9%)</option>
                              <option value="Inter-State">Inter-State (IGST 18%)</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Client GSTIN / Tax ID</label>
                            <input
                              type="text"
                              placeholder="e.g. 07AAAAA0000A1Z5"
                              value={quotationForm.gstin}
                              onChange={(e) => setQuotationForm({ ...quotationForm, gstin: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-700 focus:border-[#38b34a]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Discount Description</label>
                            <input
                              type="text"
                              placeholder="Special offer / seasonal discount"
                              value={quotationForm.discount_description}
                              onChange={(e) => setQuotationForm({ ...quotationForm, discount_description: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-[#38b34a]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Annexure Included?</label>
                            <select
                              value={quotationForm.anexture}
                              onChange={(e) => setQuotationForm({ ...quotationForm, anexture: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-[#38b34a]"
                            >
                              <option value="NO">NO</option>
                              <option value="YES">YES</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Box 3: Line Items Table */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Quotation Line Items</h3>
                          <button
                            type="button"
                            onClick={handleAddEmptyItem}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 shadow-sm transition-all"
                          >
                            ➕ Add Custom Line Item
                          </button>
                        </div>

                        {quotationItems.length === 0 ? (
                          <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 space-y-2">
                            <span className="text-3xl block">📦</span>
                            <p className="text-xs font-bold">No items added to quotation yet.</p>
                            <p className="text-[11px] text-slate-400">
                              Click products from the catalog on the right or click "Add Custom Line Item" above.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {quotationItems.map((item, idx) => {
                              const qty = parseFloat(item.qty) || 0
                              const price = parseFloat(item.selling_price) || 0
                              const disc = parseFloat(item.discount_percentage) || 0
                              const itemTotal = Math.round(qty * price * (1 - disc / 100) * 100) / 100

                              return (
                                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 relative">
                                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                    <span className="text-xs font-black text-blue-600">Item #{idx + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(idx)}
                                      className="text-rose-500 hover:text-rose-700 text-xs font-bold hover:underline"
                                    >
                                      🗑️ Remove Item
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                                    <div className="sm:col-span-2">
                                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Product Title</label>
                                      <input
                                        type="text"
                                        value={item.product_name}
                                        onChange={(e) => handleItemChange(idx, 'product_name', e.target.value)}
                                        placeholder="e.g. Corporate Website / Mobile App"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-500 block mb-1">HSN / SAC Code</label>
                                      <input
                                        type="text"
                                        value={item.hsn}
                                        onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono font-bold text-slate-700"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Unit</label>
                                      <input
                                        type="text"
                                        value={item.unit}
                                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-700"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Quantity</label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={item.qty}
                                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Selling Price (₹)</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={item.selling_price}
                                        onChange={(e) => handleItemChange(idx, 'selling_price', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Discount (%)</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={item.discount_percentage}
                                        onChange={(e) => handleItemChange(idx, 'discount_percentage', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Line Amount</label>
                                      <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 font-black text-emerald-700 text-xs flex items-center justify-between">
                                        <span>₹{itemTotal.toLocaleString('en-IN')}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Scope & Specifications / Description</label>
                                    <textarea
                                      rows="2"
                                      value={item.description}
                                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                      placeholder="Detailed specifications of features included in this line item..."
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:border-[#38b34a]"
                                    ></textarea>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column (1 Col): Product Catalog Quick-Add + Totals Summary & Actions */}
                    <div className="space-y-6">
                      {/* Catalog Quick Picker */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                          <span>Catalog Quick-Add</span>
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">{products.length} Products</span>
                        </h3>
                        <p className="text-[11px] text-slate-500">Click any product below to instantly add it into the quotation line items:</p>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {products.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleAddCatalogProductToQuotation(p)}
                              className="w-full text-left bg-white hover:bg-blue-50/70 border border-slate-200 rounded-xl p-2.5 transition-all shadow-sm group cursor-pointer"
                            >
                              <p className="font-bold text-xs text-slate-800 group-hover:text-blue-700">{p.name}</p>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                                <span>Fee: ₹{p.processing_fee || p.price || 0}</span>
                                <span className="font-black text-blue-600 group-hover:underline">+ Add Item</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Totals Summary Box */}
                      <div className="bg-white border-2 border-[#1e3e6b]/20 rounded-2xl p-5 shadow-lg space-y-4">
                        <h3 className="text-sm font-black text-[#1e3e6b] uppercase tracking-wider border-b border-slate-100 pb-2">
                          Quotation Financial Summary
                        </h3>

                        <div className="space-y-2 text-xs font-medium text-slate-600">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span className="font-bold text-slate-800">₹{totals.subtotal.toLocaleString('en-IN')}</span>
                          </div>

                          {(selectedGenClient?.country_code || 'IN') === 'IN' ? (
                            quotationForm.gst_type === 'Intra-State' ? (
                              <>
                                <div className="flex justify-between text-slate-500 text-[11px]">
                                  <span>CGST (9%):</span>
                                  <span>₹{totals.cgst.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 text-[11px]">
                                  <span>SGST (9%):</span>
                                  <span>₹{totals.sgst.toLocaleString('en-IN')}</span>
                                </div>
                              </>
                            ) : (
                              <div className="flex justify-between text-slate-500 text-[11px]">
                                <span>IGST (18%):</span>
                                <span>₹{totals.igst.toLocaleString('en-IN')}</span>
                              </div>
                            )
                          ) : (
                            <div className="flex justify-between text-slate-500 text-[11px]">
                              <span>Export Tax (18%):</span>
                              <span>₹{totals.taxTotal.toLocaleString('en-IN')}</span>
                            </div>
                          )}

                          <div className="flex justify-between text-slate-700 font-bold border-t border-slate-100 pt-2">
                            <span>Total Tax:</span>
                            <span>₹{totals.taxTotal.toLocaleString('en-IN')}</span>
                          </div>

                          <div className="flex justify-between items-center border-t-2 border-slate-200 pt-3 text-base font-black text-slate-900">
                            <span>Grand Total:</span>
                            <span className="text-xl text-[#38b34a]">₹{totals.grandTotal.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Save & Actions */}
                        <div className="space-y-2.5 pt-2">
                          <button
                            type="button"
                            disabled={loading || quotationItems.length === 0}
                            onClick={(e) => handleSaveQuotation(e, false)}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            {loading ? 'Saving...' : '💾 Save Draft Quotation'}
                          </button>

                          <button
                            type="button"
                            disabled={loading || quotationItems.length === 0}
                            onClick={(e) => handleSaveQuotation(e, true)}
                            className="w-full py-3.5 bg-gradient-to-r from-[#38b34a] to-emerald-600 hover:from-[#329f42] hover:to-emerald-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                          >
                            {loading ? 'Processing...' : '⚡ Save & Send Payment Link'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COUNTRY TAXES & PRICING OVERRIDES */}
          {activeTab === 'pricing' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Column 1: Manage Country Tax Rates */}
                <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
                  <div>
                    <h2 className="text-base font-black text-[#1e3e6b]">1. Manage Country Tax Rates</h2>
                    <p className="text-xs text-slate-500">
                      Configure baseline tax rates (GST, VAT, Sales Tax) per country.
                    </p>
                  </div>

                  {taxes.length === 0 ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold">
                      ⚠️ Loading / No Tax Records Found.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {taxes.map((tax) => (
                        <div
                          key={tax.id}
                          className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{countryFlags[tax.country_code] || '🌐'}</span>
                            <div>
                              <p className="text-xs font-black text-slate-800">
                                {tax.country_name} ({tax.country_code})
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                Currency: {tax.currency} ({tax.currency_symbol}) | Tax Label: {tax.tax_id_label}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-black">
                              {tax.tax_name} {tax.tax_rate}%
                            </span>
                            <button
                              onClick={() => handleEditTaxClick(tax)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                            >
                              Edit Rate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Edit Tax Form */}
                  {editingTax && (
                    <form onSubmit={handleUpdateTax} className="bg-white border-2 border-blue-200 rounded-2xl p-4 space-y-3 mt-4">
                      <h3 className="text-xs font-black text-blue-700">
                        Edit Tax Rate for {editingTax.country_name} ({editingTax.country_code})
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Tax System Name</label>
                          <input
                            type="text"
                            value={taxForm.tax_name}
                            onChange={(e) => setTaxForm({ ...taxForm, tax_name: e.target.value })}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Tax Rate (%)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={taxForm.tax_rate}
                            onChange={(e) => setTaxForm({ ...taxForm, tax_rate: e.target.value })}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-[#38b34a] text-white rounded-xl text-xs font-bold hover:bg-[#329f42]"
                        >
                          {loading ? 'Saving...' : 'Save New Tax Rate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTax(null)}
                          className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Column 2: Set Country-Specific Product Processing Fees */}
                <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
                  <div>
                    <h2 className="text-base font-black text-[#1e3e6b]">2. Set Country Product Processing Fee</h2>
                    <p className="text-xs text-slate-500">
                      Override product pricing & recurring subscription fees for specific target countries.
                    </p>
                  </div>

                  <form onSubmit={handleSetCountryPrice} className="space-y-4 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Select Product</label>
                      <select
                        value={selectedProduct?.id || ''}
                        onChange={(e) => {
                          const found = products.find((p) => p.id === parseInt(e.target.value, 10))
                          setSelectedProduct(found)
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Default Fee: ₹{p.processing_fee || p.price || 0})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Target Country</label>
                        <select
                          value={priceForm.country_code}
                          onChange={(e) => {
                            const code = e.target.value
                            const currMap = { IN: 'INR', NP: 'NPR', BT: 'BTN' }
                            setPriceForm({ ...priceForm, country_code: code, currency: currMap[code] || 'INR' })
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
                        >
                          <option value="NP">🇳🇵 Nepal (NP)</option>
                          <option value="BT">🇧🇹 Bhutan (BT)</option>
                          <option value="IN">🇮🇳 India (IN)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Currency Code</label>
                        <input
                          type="text"
                          value={priceForm.currency}
                          onChange={(e) => setPriceForm({ ...priceForm, currency: e.target.value })}
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Custom Processing Fee</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Enter processing fee"
                          value={priceForm.processing_fee}
                          onChange={(e) => setPriceForm({ ...priceForm, processing_fee: e.target.value })}
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Monthly Subscription Fee</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Enter monthly sub fee"
                          value={priceForm.monthly_subscription}
                          onChange={(e) => setPriceForm({ ...priceForm, monthly_subscription: e.target.value })}
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#38b34a] hover:bg-[#329f42] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      {loading ? 'Updating...' : 'Save Country Fee Override'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Section 3: Subscription Paying Clients */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-black text-[#1e3e6b]">3. Subscription Paying Clients (Product Orders)</h2>
                  <button
                    onClick={() => fetchSubscriptionClientsList()}
                    disabled={loadingClients}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    {loadingClients ? '🔄 Fetching...' : '🔄 Refresh Subscription Clients'}
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-semibold">
                  Total Active Subscription Clients Loaded: <span className="text-blue-600 font-bold">{clients.length}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {clients.map((cli) => (
                    <div key={cli.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{cli.name || cli.client_name}</p>
                        <p className="text-[10px] text-slate-400">{cli.email}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {cli.plan || 'Active Sub'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FOLLOW UP */}
          {activeTab === 'follow_up' && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3.5 animate-fade-in">
              <span className="text-4xl">📞</span>
              <h4 className="text-base font-bold text-slate-800">Follow Up Reminders</h4>
              <p className="text-xs text-slate-400 font-medium max-w-sm leading-relaxed">
                Active follow-up schedules, client feedback timelines, and partner support logs are synced with General Clients.
              </p>
            </div>
          )}

          {/* TAB 5: DUE PAYMENT */}
          {activeTab === 'due_payment' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-rose-500 text-lg">⚠️</span>
                  <span>Due Payments & Payment Links</span>
                </h3>
              </div>
              <div className="p-8 text-center text-slate-400 text-xs">
                All outstanding general client payments generate an instant Razorpay link when sent.
              </div>
            </div>
          )}

          {/* TAB 6: PAYMENT REPORT */}
          {activeTab === 'payment_report' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-blue-500 text-lg">📑</span>
                  <span>Payment History & Quotation Reports</span>
                </h3>
              </div>
              <div className="p-8 text-center text-slate-400 text-xs">
                View previous general client receipts and payment verification records.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD GENERAL CLIENT MODAL */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl p-6 text-slate-800 overflow-y-auto max-h-[90vh] space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#1e3e6b]">➕ Create New General Client</h3>
                <p className="text-xs text-slate-400">Record a non-subscription general client for custom quotations.</p>
              </div>
              <button
                onClick={() => setShowAddClientModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGeneralClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Client / Person Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={clientForm.client_name}
                    onChange={(e) => setClientForm({ ...clientForm, client_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Enterprises Pvt Ltd"
                    value={clientForm.company_name}
                    onChange={(e) => setClientForm({ ...clientForm, company_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@company.com"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Contact Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 9876543210"
                    value={clientForm.contact_number}
                    onChange={(e) => setClientForm({ ...clientForm, contact_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Alt Contact Number</label>
                  <input
                    type="text"
                    placeholder="Secondary phone"
                    value={clientForm.alt_contact_number}
                    onChange={(e) => setClientForm({ ...clientForm, alt_contact_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Country</label>
                  <select
                    value={clientForm.country_code}
                    onChange={(e) => setClientForm({ ...clientForm, country_code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="IN">🇮🇳 India (IN)</option>
                    <option value="NP">🇳🇵 Nepal (NP)</option>
                    <option value="BT">🇧🇹 Bhutan (BT)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">District / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Gurugram"
                    value={clientForm.district}
                    onChange={(e) => setClientForm({ ...clientForm, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Haryana"
                    value={clientForm.state}
                    onChange={(e) => setClientForm({ ...clientForm, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Street Address</label>
                  <input
                    type="text"
                    placeholder="Plot 45, Industrial Area Phase II"
                    value={clientForm.address}
                    onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">GST Tax Type</label>
                  <select
                    value={clientForm.gst_type}
                    onChange={(e) => setClientForm({ ...clientForm, gst_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="Intra-State">Intra-State (CGST + SGST)</option>
                    <option value="Inter-State">Inter-State (IGST)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    value={clientForm.gstin}
                    onChange={(e) => setClientForm({ ...clientForm, gstin: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Lead Source</label>
                  <select
                    value={clientForm.lead_source}
                    onChange={(e) => setClientForm({ ...clientForm, lead_source: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Partner">Partner</option>
                    <option value="Cold Call">Cold Call</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Referred By</label>
                  <input
                    type="text"
                    placeholder="Direct / Employee Name / Partner ID"
                    value={clientForm.referred_by}
                    onChange={(e) => setClientForm({ ...clientForm, referred_by: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Software Requirements / Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Describe custom software requirements, timeline, or requested features..."
                    value={clientForm.software_requirements}
                    onChange={(e) => setClientForm({ ...clientForm, software_requirements: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#38b34a] hover:bg-[#329f42] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  {loading ? 'Creating...' : '➕ Create General Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CLIENT QUOTATIONS HISTORY MODAL */}
      {showQuotationsListModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl p-6 text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#1e3e6b]">📋 Quotations History</h3>
                <p className="text-xs text-slate-400">
                  Client: <strong>{selectedGenClient?.client_name}</strong> (ID: {selectedGenClient?.client_id})
                </p>
              </div>
              <button
                onClick={() => setShowQuotationsListModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {selectedClientQuotations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No quotations generated for this client yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Quotation No.</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Payment Terms</th>
                      <th className="px-4 py-3 text-right">Grand Total</th>
                      <th className="px-4 py-3 text-center">Payment Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedClientQuotations.map((q) => (
                      <tr key={q.id}>
                        <td className="px-4 py-3 font-mono font-bold text-blue-600">{q.quotation_number}</td>
                        <td className="px-4 py-3 text-slate-500">{q.quotation_date}</td>
                        <td className="px-4 py-3">{q.payment_terms}</td>
                        <td className="px-4 py-3 text-right font-black text-emerald-700">
                          ₹{Number(q.grand_total || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={async () => {
                              const payUrl = `${window.location.origin}/general-quotation-pay.html?uuid=${q.uuid}`
                              if (navigator.clipboard) {
                                await navigator.clipboard.writeText(payUrl)
                                alert(`📋 Payment Link copied to clipboard:\n\n${payUrl}`)
                              } else {
                                alert(`📋 Payment Link:\n\n${payUrl}`)
                              }
                            }}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold"
                          >
                            🔗 Copy Pay Link
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowQuotationsListModal(false)}
                className="px-5 py-2 border border-slate-300 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminUsers