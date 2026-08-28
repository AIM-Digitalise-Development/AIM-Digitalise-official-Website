import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getGeneralClients,
  getGeneralClientById,
  createGeneralClient,
  updateGeneralClient,
  updateGeneralClientStatus,
  deleteGeneralClient,
  getGeneralServices,
  createGeneralService,
  updateGeneralService,
  deleteGeneralService,
  createQuotation,
  sendQuotation,
  getAdminInvoiceDownloadUrl,
  getCountryTaxes,
  updateCountryTax,
  setCountryPrice,
  getPublicProductsForCountry,
  getSubscriptionClients,
} from '../../api/admin/generalClients'

export const normalizeService = (srv) => {
  if (!srv || typeof srv !== 'object') return srv
  return {
    ...srv,
    id: srv.id || srv._id || srv.service_id,
    name: srv.name || srv.service_name || srv.title || srv.serviceName || srv.service_title || 'General Service',
    hsn: srv.hsn || srv.hsn_code || srv.hsn_sac || srv.sac || srv.hsnCode || '998314',
    unit: srv.unit || srv.unit_name || srv.unitType || 'Unit',
    selling_price: Number(srv.selling_price ?? srv.price ?? srv.standard_rate ?? srv.standardRate ?? srv.rate ?? srv.amount ?? srv.cost ?? 0),
    category: srv.category || srv.category_name || srv.type || 'Web Development',
    description: srv.description || srv.service_description || srv.details || srv.desc || '',
    is_active: srv.is_active !== undefined ? srv.is_active : true,
  }
}

const numberToIndianWords = (num) => {
  if (!num || isNaN(num)) return 'Zero Rupees Only'
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const inWords = (n) => {
    let str = ''
    if (n > 99) {
      str += a[Math.floor(n / 100)] + 'Hundred '
      n %= 100
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10]
    } else if (n > 0) {
      str += a[n]
    }
    return str
  }

  let n = Math.floor(num)
  if (n === 0) return 'Zero Rupees Only'
  let crore = Math.floor(n / 10000000)
  n %= 10000000
  let lakh = Math.floor(n / 100000)
  n %= 100000
  let thousand = Math.floor(n / 1000)
  n %= 1000
  let remainder = n

  let res = ''
  if (crore > 0) res += inWords(crore) + 'Crore '
  if (lakh > 0) res += inWords(lakh) + 'Lakh '
  if (thousand > 0) res += inWords(thousand) + 'Thousand '
  if (remainder > 0) res += inWords(remainder)

  return 'INR ' + res.trim() + ' Only'
}

const countryFlags = {
  IN: '🇮🇳',
  NP: '🇳🇵',
  BT: '🇧🇹',
}

const LEAD_SOURCE_OPTIONS = [
  'Website',
  'Referral',
  'Walk-in',
  'Partner',
  'Cold Call',
  'Social Media',
  'Google Ads',
  'Email Campaign',
  'Exhibition/Event',
  'Other',
]

const REFERRED_BY_OPTIONS = [
  'Direct',
  'Kathmandu Branch',
  'Delhi HQ',
  'Branch Executive',
  'Partner Agent',
  'Social Media Campaign',
  'Employee Referral',
  'Other',
]

const SOLD_BY_OPTIONS = [
  'Admin Sales Team',
  'Rahul Verma',
  'Pooja Mehta',
  'Anil Shrestha',
  'Sunil Sharma',
  'Direct Sales',
  'Self / Online',
]

const BRANCH_OPTIONS = [
  'Head Office (Gurugram)',
  'Kathmandu Branch',
  'Bhutan Branch',
  'Delhi Branch',
  'Mumbai Branch',
  'Bangalore Branch',
  'Online Portal',
]

const STATUS_OPTIONS = [
  'Attended',
  'Quotation Sent',
  'Pursuing to Purchase',
  'Order Closed',
  'Not Interested',
]

const STATUS_STYLES = {
  'Attended': 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20',
  'Quotation Sent': 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
  'Pursuing to Purchase': 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20',
  'Order Closed': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  'Not Interested': 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
}

const STATUS_ICONS = {
  'Attended': '👋',
  'Quotation Sent': '📨',
  'Pursuing to Purchase': '🎯',
  'Order Closed': '🎉',
  'Not Interested': '⏸️',
}

const AdminUsers = () => {
  // Navigation Tab State (Default: show_clients)
  const [activeTab, setActiveTab] = useState('show_clients') // 'show_clients' | 'services' | 'pricing' | 'follow_up' | 'due_payment' | 'payment_report'

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
  const [statusFilter, setStatusFilter] = useState('All')

  // Pagination State for Thousands of Clients
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Add / Edit Client Form State
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [showEditClientModal, setShowEditClientModal] = useState(false)
  const [showViewClientModal, setShowViewClientModal] = useState(false)
  const [viewingClient, setViewingClient] = useState(null)
  const [editingClientId, setEditingClientId] = useState(null)
  const [dossierTab, setDossierTab] = useState('profile') // 'profile' | 'services' | 'sales' | 'quotations'
  const [copiedClientId, setCopiedClientId] = useState(false)

  const initialClientForm = {
    client_name: '',
    company_name: '',
    contact_person: '',
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
    sold_by_name: 'Admin Sales Team',
    branch_name: 'Head Office (Gurugram)',
    status: 'Attended',
    next_followup_date: '',
    software_requirements: '',
    selected_services: [],
  }

  const [clientForm, setClientForm] = useState(initialClientForm)
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false)
  const [serviceSearchTerm, setServiceSearchTerm] = useState('')

  // ============================================================
  // 2. GENERAL SERVICES CATALOG STATE
  // ============================================================
  const [generalServices, setGeneralServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [showServicesCatalogModal, setShowServicesCatalogModal] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [serviceCatalogSearch, setServiceCatalogSearch] = useState('')
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All')
  const [serviceForm, setServiceForm] = useState({
    name: '',
    hsn: '998314',
    unit: 'Unit',
    selling_price: '',
    category: 'Web Development',
    description: '',
    is_active: true,
  })

  // Quotations List Modal & Document Viewer State
  const [showQuotationsListModal, setShowQuotationsListModal] = useState(false)
  const [selectedClientQuotations, setSelectedClientQuotations] = useState([])
  const [showQuotationDocModal, setShowQuotationDocModal] = useState(false)
  const [viewingQuotationDoc, setViewingQuotationDoc] = useState(null)
  const [copiedPayLink, setCopiedPayLink] = useState(false)

  // ============================================================
  // 3. QUOTATION BUILDER STATE
  // ============================================================
  const [selectedGenClient, setSelectedGenClient] = useState(null)
  const [showQuotationBuilder, setShowQuotationBuilder] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('services') // 'services'
  const [sidebarServiceSearch, setSidebarServiceSearch] = useState('')
  const [sidebarCategoryFilter, setSidebarCategoryFilter] = useState('All')
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
  // 4. COUNTRY TAXES & PRICING OVERRIDES STATE
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

  // Load Primary Initial Data
  useEffect(() => {
    fetchGeneralClientsList()
    fetchGeneralServicesList()
  }, [])

  // Lazy Load Secondary Catalogs only when relevant tabs are accessed
  useEffect(() => {
    if (activeTab === 'pricing') {
      if (taxes.length === 0) fetchCountryTaxesList()
      if (products.length === 0) fetchProductsList()
    }
    if ((activeTab === 'due_payment' || activeTab === 'payment_report') && clients.length === 0) {
      fetchSubscriptionClientsList()
    }
  }, [activeTab])

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
      const rawData = res.data?.data || res.data?.clients || (Array.isArray(res.data) ? res.data : [])
      setGeneralClients(Array.isArray(rawData) ? rawData : [])
    } catch (err) {
      console.error('Error fetching general clients:', err)
    } finally {
      setLoadingGenClients(false)
    }
  }

  // Fetch General Services with complete normalization
  const fetchGeneralServicesList = async () => {
    setLoadingServices(true)
    try {
      const res = await getGeneralServices()
      const rawData = res.data?.data || res.data?.services || (Array.isArray(res.data) ? res.data : [])
      const normalized = (Array.isArray(rawData) ? rawData : []).map(normalizeService)
      setGeneralServices(normalized)
    } catch (err) {
      console.error('Error fetching general services:', err)
    } finally {
      setLoadingServices(false)
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
  // MULTI-SELECT CHECKBOX DROPDOWN LOGIC
  // ============================================================
  const toggleServiceSelection = (serviceName) => {
    setClientForm((prev) => {
      const current = prev.selected_services || []
      let updated = []
      if (current.includes(serviceName)) {
        updated = current.filter((s) => s !== serviceName)
      } else {
        updated = [...current, serviceName]
      }
      return {
        ...prev,
        selected_services: updated,
        software_requirements: updated.join(', '),
      }
    })
  }

  const removeSelectedService = (serviceName) => {
    setClientForm((prev) => {
      const updated = (prev.selected_services || []).filter((s) => s !== serviceName)
      return {
        ...prev,
        selected_services: updated,
        software_requirements: updated.join(', '),
      }
    })
  }

  // ============================================================
  // HANDLERS: GENERAL CLIENT CREATION & EDITING
  // ============================================================
  const handleOpenAddClientModal = () => {
    setClientForm(initialClientForm)
    setShowAddClientModal(true)
  }

  const handleCreateGeneralClient = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setMessage(null)

    const payload = {
      ...clientForm,
      software_requirements: (clientForm.selected_services || []).join(', ') || clientForm.software_requirements,
    }

    try {
      const res = await createGeneralClient(payload)
      const result = res.data
      if (result.success) {
        setMessage(`✅ General Client "${result.data.client_name}" created with ID: ${result.data.client_id}`)
        setShowAddClientModal(false)
        setClientForm(initialClientForm)
        fetchGeneralClientsList()
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

  const handleOpenEditClientModal = (client) => {
    setEditingClientId(client.id)
    const existingServices = client.software_requirements
      ? client.software_requirements.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    setClientForm({
      client_name: client.client_name || '',
      company_name: client.company_name || '',
      contact_person: client.contact_person || client.client_name || '',
      email: client.email || '',
      contact_number: client.contact_number || '',
      alt_contact_number: client.alt_contact_number || '',
      address: client.address || '',
      district: client.district || '',
      state: client.state || '',
      pin_code: client.pin_code || '',
      country_code: client.country_code || 'IN',
      gst_type: client.gst_type || 'Intra-State',
      gstin: client.gstin || '',
      lead_source: client.lead_source || 'Website',
      referred_by: client.referred_by || 'Direct',
      sold_by_name: client.sold_by_name || 'Admin Sales Team',
      branch_name: client.branch_name || 'Head Office (Gurugram)',
      status: client.status || 'Attended',
      next_followup_date: client.next_followup_date || '',
      software_requirements: client.software_requirements || '',
      selected_services: existingServices,
    })
    setShowEditClientModal(true)
  }

  const handleUpdateGeneralClient = async (e) => {
    e.preventDefault()
    if (!editingClientId) return

    setLoading(true)
    setErrorMsg(null)
    setMessage(null)

    const payload = {
      ...clientForm,
      software_requirements: (clientForm.selected_services || []).join(', ') || clientForm.software_requirements,
    }

    try {
      const res = await updateGeneralClient(editingClientId, payload)
      const result = res.data
      if (result.success) {
        setMessage(`✅ Client "${clientForm.client_name}" updated successfully!`)
        setShowEditClientModal(false)
        setEditingClientId(null)
        fetchGeneralClientsList()
      } else {
        setErrorMsg(result.message || 'Failed to update general client')
      }
    } catch (err) {
      setErrorMsg('Error updating general client: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // Inline Status Change Handler
  const handleInlineStatusChange = async (client, newStatus) => {
    try {
      const res = await updateGeneralClientStatus(client.id, newStatus)
      if (res.data?.success) {
        setMessage(`✅ Status for "${client.client_name}" updated to: ${newStatus}`)
        // Update local state immediately
        setGeneralClients((prev) =>
          prev.map((c) => (c.id === client.id ? { ...c, status: newStatus } : c))
        )
      }
    } catch (err) {
      setErrorMsg('Failed to update status: ' + (err.response?.data?.message || err.message))
    }
  }

  // View Client Modal Handler
  const handleOpenViewClientModal = (client) => {
    setViewingClient(client)
    setShowViewClientModal(true)
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

  // ============================================================
  // HANDLERS: GENERAL SERVICES CATALOG
  // ============================================================
  const handleOpenAddServiceModal = () => {
    setEditingServiceId(null)
    setServiceForm({
      name: '',
      hsn: '998314',
      unit: 'Unit',
      selling_price: '',
      category: 'Web Development',
      description: '',
      is_active: true,
    })
    setShowAddServiceModal(true)
  }

  const handleEditServiceClick = (service) => {
    setEditingServiceId(service.id)
    setServiceForm({
      name: service.name || service.service_name || '',
      hsn: service.hsn || '998314',
      unit: service.unit || 'Unit',
      selling_price: service.selling_price || service.price || '',
      category: service.category || 'General',
      description: service.description || '',
      is_active: service.is_active !== undefined ? service.is_active : true,
    })
    setShowAddServiceModal(true)
  }

  const handleSaveService = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setMessage(null)

    try {
      if (editingServiceId) {
        const res = await updateGeneralService(editingServiceId, serviceForm)
        if (res.data?.success) {
          setMessage(`✅ Service "${serviceForm.name}" updated successfully!`)
          setShowAddServiceModal(false)
          fetchGeneralServicesList()
        } else {
          setErrorMsg(res.data?.message || 'Failed to update service')
        }
      } else {
        const res = await createGeneralService(serviceForm)
        if (res.data?.success) {
          setMessage(`✅ New Service "${serviceForm.name}" added to catalog!`)
          setShowAddServiceModal(false)
          fetchGeneralServicesList()
        } else {
          setErrorMsg(res.data?.message || 'Failed to create service')
        }
      }
    } catch (err) {
      setErrorMsg('Error saving service: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteService = async (service) => {
    if (!window.confirm(`Are you sure you want to delete service "${service.name}" from catalog?`)) return
    try {
      const res = await deleteGeneralService(service.id)
      if (res.data?.success) {
        setMessage(`✅ Service "${service.name}" removed from catalog.`)
        fetchGeneralServicesList()
      }
    } catch (err) {
      setErrorMsg('Error deleting service: ' + (err.response?.data?.message || err.message))
    }
  }

  // ============================================================
  // HANDLERS: QUOTATION BUILDER WITH PRE-SELECTED SERVICES
  // ============================================================
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

    // Pre-populate quotation items from client's selected services / software requirements!
    const prefilledItems = []
    const rawRequirements = client.software_requirements
      ? client.software_requirements.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    rawRequirements.forEach((reqName) => {
      // Find matching service in generalServices
      const matchService = generalServices.find(
        (s) => s.name.toLowerCase() === reqName.toLowerCase() || s.name.toLowerCase().includes(reqName.toLowerCase())
      )

      // Or find matching product
      const matchProduct = products.find(
        (p) => p.name.toLowerCase() === reqName.toLowerCase() || p.name.toLowerCase().includes(reqName.toLowerCase())
      )

      if (matchService) {
        prefilledItems.push({
          product_id: matchService.id,
          product_name: matchService.name,
          hsn: matchService.hsn || '998314',
          qty: 1,
          unit: matchService.unit || 'Unit',
          selling_price: matchService.selling_price || matchService.price || 0,
          discount_percentage: 0,
          description: matchService.description || `Scope and technical specifications for ${matchService.name}`,
        })
      } else if (matchProduct) {
        prefilledItems.push({
          product_id: matchProduct.id,
          product_name: matchProduct.name,
          hsn: '998314',
          qty: 1,
          unit: 'Unit',
          selling_price: matchProduct.processing_fee || matchProduct.price || 0,
          discount_percentage: 0,
          description: matchProduct.description || `Scope and features for ${matchProduct.name}`,
        })
      } else {
        prefilledItems.push({
          product_id: null,
          product_name: reqName,
          hsn: '998314',
          qty: 1,
          unit: 'Unit',
          selling_price: 0,
          discount_percentage: 0,
          description: `Custom specifications and scope for ${reqName}`,
        })
      }
    })

    setQuotationItems(prefilledItems)
    setShowQuotationBuilder(true)
  }

  // Add Service from General Services Catalog to Line Items
  const handleAddGeneralServiceToQuotation = (service) => {
    const newItem = {
      product_id: service.id,
      product_name: service.name,
      hsn: service.hsn || '998314',
      qty: 1,
      unit: service.unit || 'Unit',
      selling_price: service.selling_price || service.price || 0,
      discount_percentage: 0,
      description: service.description || `Scope and technical specifications for ${service.name}`,
    }
    setQuotationItems((prev) => [...prev, newItem])
  }

  // Add Product from Catalog to Line Items
  const handleAddCatalogProductToQuotation = (prod) => {
    const defaultDesc = prod.name.includes('Website')
      ? 'Completely corporate looking informative dynamic website pages with customer enquiry form, social media integration, call/email integration, and google map integration. Admin login details.'
      : `Scope and specifications for ${prod.name}`

    const newItem = {
      product_id: prod.id,
      product_name: prod.name,
      hsn: '998314',
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
        hsn: '998314',
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

  // Save Quotation / Direct Document View
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
        const quotationData = result.data
        setMessage(`✅ Quotation "${quotationData.quotation_number}" created successfully!`)

        let payUrl = `${window.location.origin}/general-quotation-pay.html?uuid=${quotationData.uuid || ('quotation-' + quotationData.id)}`
        if (sendImmediately) {
          try {
            const sendRes = await sendQuotation(quotationData.id)
            if (sendRes?.data?.payment_url) {
              payUrl = sendRes.data.payment_url
            }
          } catch (sendErr) {
            console.error('Error sending quotation:', sendErr)
          }
        }

        // Open Quotation Document Viewer directly without copy-paste requirement!
        handleOpenQuotationDoc({
          ...quotationData,
          items: quotationItems,
          client: selectedGenClient,
          payment_url: payUrl,
          subtotal: totals.subtotal,
          tax_total: totals.taxTotal,
          cgst: totals.cgst,
          sgst: totals.sgst,
          igst: totals.igst,
          grand_total: totals.grandTotal,
        }, selectedGenClient)

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

  // Open Full Official Quotation Document Viewer
  const handleOpenQuotationDoc = (quotation, clientObj = null) => {
    const client = clientObj || selectedGenClient || viewingClient || quotation.client || {}
    const items = (quotation.items || []).map((item) => ({
      product_name: item.product_name || item.name || item.service_name || 'Service Item',
      hsn: item.hsn || item.hsn_code || '998314',
      qty: Number(item.qty || item.quantity || 1),
      unit: item.unit || 'Unit',
      selling_price: Number(item.selling_price || item.price || item.unit_price || 0),
      discount_percentage: Number(item.discount_percentage || item.discount || 0),
      description: item.description || '',
    }))

    const calcSubtotal = items.reduce((sum, it) => sum + (it.qty * it.selling_price * (1 - it.discount_percentage / 100)), 0)
    const isIntra = (quotation.gst_type || client.gst_type || 'Intra-State') === 'Intra-State'
    const isIndia = (client.country_code || 'IN') === 'IN'

    let cgst = 0, sgst = 0, igst = 0, taxTotal = 0
    if (isIndia) {
      if (isIntra) {
        cgst = Math.round(calcSubtotal * 0.09 * 100) / 100
        sgst = Math.round(calcSubtotal * 0.09 * 100) / 100
        taxTotal = cgst + sgst
      } else {
        igst = Math.round(calcSubtotal * 0.18 * 100) / 100
        taxTotal = igst
      }
    } else {
      taxTotal = Math.round(calcSubtotal * 0.18 * 100) / 100
    }
    const grandTotal = Number(quotation.grand_total || quotation.total_amount) || Math.round((calcSubtotal + taxTotal) * 100) / 100

    const targetUuid = quotation.uuid || `quotation-${quotation.id}`
    const payUrl = quotation.payment_url || `${window.location.origin}/general-quotation-pay.html?uuid=${targetUuid}`

    setViewingQuotationDoc({
      ...quotation,
      client,
      items,
      subtotal: Number(quotation.subtotal) || calcSubtotal,
      cgst: quotation.cgst !== undefined ? Number(quotation.cgst) : cgst,
      sgst: quotation.sgst !== undefined ? Number(quotation.sgst) : sgst,
      igst: quotation.igst !== undefined ? Number(quotation.igst) : igst,
      tax_total: Number(quotation.tax_total) || taxTotal,
      grand_total: grandTotal,
      payment_url: payUrl,
    })
    setShowQuotationDocModal(true)
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

  // Country Taxes & Overrides Handlers
  const handleEditTaxClick = (tax) => {
    setEditingTax(tax)
    setTaxForm({ tax_rate: tax.tax_rate, tax_name: tax.tax_name })
  }

  const handleUpdateTax = async (e) => {
    e.preventDefault()
    if (!editingTax) return
    setLoading(true)
    setErrorMsg(null)
    setMessage(null)

    try {
      const res = await updateCountryTax(editingTax.id, {
        tax_rate: parseFloat(taxForm.tax_rate),
        tax_name: taxForm.tax_name,
      })
      const result = res.data
      if (result.success) {
        setMessage(`✅ Tax for ${editingTax.country_name} updated to ${taxForm.tax_rate}% (${taxForm.tax_name})`)
        setEditingTax(null)
        fetchCountryTaxesList()
      } else {
        setErrorMsg(result.message || 'Failed to update tax')
      }
    } catch (err) {
      setErrorMsg('Error updating country tax: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSetCountryPrice = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return
    setLoading(true)
    setErrorMsg(null)
    setMessage(null)

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

  // Reset pagination when search or status filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [genClientSearch, statusFilter])

  // General Clients filtered list with useMemo for high-performance with thousands of records
  const filteredGeneralClients = useMemo(() => {
    const q = genClientSearch.trim().toLowerCase()
    return generalClients.filter((c) => {
      const matchesSearch =
        !q ||
        (c.client_name && c.client_name.toLowerCase().includes(q)) ||
        (c.client_id && c.client_id.toLowerCase().includes(q)) ||
        (c.company_name && c.company_name.toLowerCase().includes(q)) ||
        (c.contact_person && c.contact_person.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.state && c.state.toLowerCase().includes(q)) ||
        (c.district && c.district.toLowerCase().includes(q)) ||
        (c.sold_by_name && c.sold_by_name.toLowerCase().includes(q)) ||
        (c.branch_name && c.branch_name.toLowerCase().includes(q)) ||
        (c.software_requirements && c.software_requirements.toLowerCase().includes(q)) ||
        (c.contact_number && c.contact_number.toLowerCase().includes(q))

      const matchesStatus = statusFilter === 'All' || c.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [generalClients, genClientSearch, statusFilter])

  // Paginated general clients slice
  const totalClientsCount = filteredGeneralClients.length
  const totalPages = Math.max(1, Math.ceil(totalClientsCount / pageSize))
  const paginatedGeneralClients = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize
    return filteredGeneralClients.slice(startIdx, startIdx + pageSize)
  }, [filteredGeneralClients, currentPage, pageSize])

  // Format Date Helper
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <>
      <Helmet>
        <title>General Clients | Admin Portal</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in font-sans">
        {/* Page Header */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          <div>
            <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight flex items-center gap-2">
              <span>General Clients Directory</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Client Management, Service Catalog, Quotation Builder, and Razorpay Invoicing Portal.
            </p>
          </div>

          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddServiceModal}
              className="px-3.5 py-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-xl text-xs font-bold text-purple-800 shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span>📦</span>
              <span>+ Add Service Entry</span>
            </button>

            <button
              onClick={() => {
                fetchGeneralClientsList()
                fetchGeneralServicesList()
              }}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span>🔄</span>
              <span>Refresh</span>
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
          {/* Top Tabs Switcher (Quick Actions removed as requested) */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            {/* 1. Show Clients Tab */}
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
              👥 Show Clients ({generalClients.length})
            </button>

            {/* 2. Service Catalog Tab */}
            <button
              onClick={() => {
                setActiveTab('services')
                setShowQuotationBuilder(false)
              }}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'services'
                  ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-transparent'
              }`}
            >
              📦 Service Catalog ({generalServices.length})
            </button>

            {/* 4. Country Taxes Tab */}
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
              🌐 Country Taxes & Pricing
            </button>

            {/* 5. Follow Up Tab */}
            <button
              onClick={() => {
                setActiveTab('follow_up')
                setShowQuotationBuilder(false)
              }}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'follow_up'
                  ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-transparent'
              }`}
            >
              📞 Follow Up Schedule
            </button>

            {/* 6. Due Payment Tab */}
            <button
              onClick={() => {
                setActiveTab('due_payment')
                setShowQuotationBuilder(false)
              }}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'due_payment'
                  ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-transparent'
              }`}
            >
              ⚠️ Due Payment
            </button>

            {/* 7. Payment Report Tab */}
            <button
              onClick={() => {
                setActiveTab('payment_report')
                setShowQuotationBuilder(false)
              }}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'payment_report'
                  ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-transparent'
              }`}
            >
              📑 Payment Report
            </button>
          </div>

          {/* TAB 1: SHOW CLIENTS (Main General Clients Directory with Exact Excel Structure) */}
          {activeTab === 'show_clients' && (
            <div>
              {!showQuotationBuilder ? (
                <div className="space-y-6 animate-fade-in">
                  {/* Action Bar & Stats Summary */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span>Directory: For General Client</span>
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Manage general client profiles, service requirements, executive assignments, and generate official quotations.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleOpenAddServiceModal}
                        className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <span>📦 + Add Service</span>
                      </button>

                      <button
                        onClick={handleOpenAddClientModal}
                        className="px-4 py-2 bg-[#38b34a] hover:bg-[#329f42] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <span>➕ Add Client</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-4 border border-blue-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">Total Clients</span>
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
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider block">Service Catalog</span>
                        <span className="text-2xl font-black text-purple-700 mt-1 block">
                          {generalServices.length} Services
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
                        📦
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-slate-50 rounded-2xl p-4 border border-amber-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block">Quotations Built</span>
                        <span className="text-2xl font-black text-amber-700 mt-1 block">
                          {generalClients.reduce((acc, c) => acc + (c.quotations_count || c.quotations?.length || 0), 0)}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg">
                        📝
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-slate-50 rounded-2xl p-4 border border-emerald-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Closed Orders</span>
                        <span className="text-2xl font-black text-emerald-700 mt-1 block">
                          {generalClients.filter((c) => c.status === 'Order Closed').length} Closed
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                        🎉
                      </div>
                    </div>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                      <input
                        type="text"
                        placeholder="Search by Client Name, ID, Company, Service, Executive, Branch..."
                        value={genClientSearch}
                        onChange={(e) => setGenClientSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Filter Status:</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#38b34a]"
                      >
                        <option value="All">All Statuses ({generalClients.length})</option>
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st} ({generalClients.filter((c) => c.status === st).length})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* General Clients Table (Exact Excel Schema Pattern) */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
                    <div className="bg-slate-100/80 px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <span>📋 For General Client</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                          {totalClientsCount} Total Found
                        </span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-slate-500">
                          Showing {totalClientsCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalClientsCount)} of {totalClientsCount}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                          <span>Rows:</span>
                          <select
                            value={pageSize}
                            onChange={(e) => {
                              setPageSize(Number(e.target.value))
                              setCurrentPage(1)
                            }}
                            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none"
                          >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-500 font-extrabold uppercase tracking-wider text-[11px]">
                            {/* Column 1: Client ID */}
                            <th className="px-5 py-3.5">
                              <div>Client ID</div>
                              <div className="text-[9px] text-slate-400 font-semibold normal-case">Reg Date</div>
                            </th>

                            {/* Column 2: Client Details */}
                            <th className="px-5 py-3.5">
                              <div>Client Details</div>
                              <div className="text-[9px] text-slate-400 font-semibold normal-case">Contact Person / Info</div>
                            </th>

                            {/* Column 3: Service Details */}
                            <th className="px-5 py-3.5">
                              <div>Service Details</div>
                              <div className="text-[9px] text-slate-400 font-semibold normal-case">Requested Services</div>
                            </th>

                            {/* Column 4: Sold By */}
                            <th className="px-5 py-3.5">
                              <div>Sold By</div>
                              <div className="text-[9px] text-slate-400 font-semibold normal-case">Executive / Branch</div>
                            </th>

                            {/* Column 5: Status */}
                            <th className="px-5 py-3.5 text-center">
                              <div>Status</div>
                              <div className="text-[9px] text-slate-400 font-semibold normal-case">5 Lifecycle ENUMs</div>
                            </th>

                            {/* Column 6: Next Follow-up Date */}
                            <th className="px-5 py-3.5 text-center">
                              <div>Next Follow-up Date</div>
                              <div className="text-[9px] text-slate-400 font-semibold normal-case">Schedule Badge</div>
                            </th>

                            {/* Column 7: Action */}
                            <th className="px-5 py-3.5 text-center">
                              <div>Action</div>
                              <div className="text-[9px] text-slate-400 font-semibold normal-case">View / Edit / Quote</div>
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {loadingGenClients ? (
                            <tr>
                              <td colSpan="7" className="text-center py-12 font-bold text-slate-400">
                                <span className="inline-block animate-spin mr-2">🔄</span> Loading General Clients...
                              </td>
                            </tr>
                          ) : paginatedGeneralClients.length > 0 ? (
                            paginatedGeneralClients.map((c) => {
                              const servicesList = c.software_requirements
                                ? c.software_requirements.split(',').map((s) => s.trim()).filter(Boolean)
                                : []

                              return (
                                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                                  {/* Column 1: Client ID & Reg Date */}
                                  <td className="px-5 py-4 align-top">
                                    <span className="font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 block w-fit text-[11px]">
                                      {c.client_id || `GC-${c.id}`}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium block mt-1.5 flex items-center gap-1">
                                      📅 {formatDateDisplay(c.reg_date || c.created_at || '2026-08-10')}
                                    </span>
                                  </td>

                                  {/* Column 2: Client Details */}
                                  <td className="px-5 py-4 align-top max-w-[200px]">
                                    <p className="font-extrabold text-slate-800 text-sm leading-snug">{c.client_name}</p>
                                  </td>

                                  {/* Column 3: Service Details */}
                                  <td className="px-5 py-4 align-top max-w-[240px]">
                                    {servicesList.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {servicesList.map((srv, sIdx) => (
                                          <span
                                            key={sIdx}
                                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold border border-slate-200"
                                            title={srv}
                                          >
                                            {srv}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 italic text-[11px]">No specific service noted</span>
                                    )}
                                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                      <span>{countryFlags[c.country_code] || '🌐'} {c.country_code}</span>
                                      <span>·</span>
                                      <span>{c.gst_type || 'Intra-State'}</span>
                                    </div>
                                  </td>

                                  {/* Column 4: Sold By (Executive & Branch Name) */}
                                  <td className="px-5 py-4 align-top">
                                    <p className="font-bold text-slate-800 text-[12px] flex items-center gap-1">
                                      <span>👤</span>
                                      <span>{c.sold_by_name || 'Admin Sales Team'}</span>
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                                      <span>🏛️</span>
                                      <span>{c.branch_name || 'Head Office (Gurugram)'}</span>
                                    </p>
                                    <span className="text-[9px] text-slate-400 block mt-0.5">
                                      Source: {c.lead_source || 'Website'}
                                    </span>
                                  </td>

                                  {/* Column 5: Status (5 ENUMs Inline Changer) */}
                                  <td className="px-5 py-4 align-top text-center">
                                    <div className="inline-block relative">
                                      <select
                                        value={c.status || 'Attended'}
                                        onChange={(e) => handleInlineStatusChange(c, e.target.value)}
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase border tracking-wider cursor-pointer shadow-sm focus:outline-none focus:ring-2 appearance-none pr-7 pl-3 ${
                                          STATUS_STYLES[c.status] || STATUS_STYLES['Attended']
                                        }`}
                                      >
                                        {STATUS_OPTIONS.map((st) => (
                                          <option key={st} value={st} className="bg-white text-slate-800 normal-case font-bold">
                                            {STATUS_ICONS[st]} {st}
                                          </option>
                                        ))}
                                      </select>
                                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] opacity-70">
                                        ▼
                                      </span>
                                    </div>
                                  </td>

                                  {/* Column 6: Next Follow-up Date */}
                                  <td className="px-5 py-4 align-top text-center">
                                    {c.next_followup_date ? (
                                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold inline-flex items-center gap-1 shadow-sm">
                                        <span>📅</span>
                                        <span>{formatDateDisplay(c.next_followup_date)}</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 text-[10px] italic">Not scheduled</span>
                                    )}
                                  </td>

                                  {/* Column 7: Dedicated Action Icon Buttons */}
                                  <td className="px-5 py-4 align-top text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {/* 1. View Client Icon Button */}
                                      <button
                                        onClick={() => handleOpenViewClientModal(c)}
                                        title="View Client Dossier"
                                        className="p-2 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold cursor-pointer flex items-center justify-center text-slate-600 shadow-sm"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                      </button>

                                      {/* 2. Edit Client Icon Button */}
                                      <button
                                        onClick={() => handleOpenEditClientModal(c)}
                                        title="Edit Client"
                                        className="p-2 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-all font-bold cursor-pointer flex items-center justify-center text-slate-600 shadow-sm"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>

                                      {/* 3. Create Quotation Icon Button */}
                                      <button
                                        onClick={() => handleOpenQuotationBuilder(c)}
                                        title="Create Quotation"
                                        className="p-2 rounded-xl border border-[#38b34a]/30 bg-[#38b34a]/10 text-[#38b34a] hover:bg-[#38b34a] hover:text-white transition-all font-bold cursor-pointer flex items-center justify-center shadow-sm"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      </button>

                                      {/* 4. Delete Icon Button */}
                                      <button
                                        onClick={() => handleDeleteGeneralClient(c)}
                                        title="Remove Client"
                                        className="p-2 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all font-bold cursor-pointer flex items-center justify-center text-slate-400 shadow-sm"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>

                                    {/* Compact Quotation History Link */}
                                    <div className="mt-1.5">
                                      <button
                                        onClick={() => handleViewClientQuotations(c)}
                                        className="text-[10px] text-slate-500 hover:text-blue-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <span>📋 {c.quotations_count || c.quotations?.length || 0} Quotation(s) Built</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center py-16 text-slate-400">
                                <span className="text-4xl block mb-2">📁</span>
                                <p className="font-bold text-sm">No General Clients found matching your criteria</p>
                                <p className="text-xs text-slate-400 mt-1">Try changing your search query or status filter.</p>
                                <button
                                  onClick={handleOpenAddClientModal}
                                  className="mt-4 px-5 py-2.5 bg-[#38b34a] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#329f42]"
                                >
                                  + Create New General Client
                                </button>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Toolbar */}
                    {totalPages > 1 && (
                      <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <span className="text-slate-500 font-medium">
                          Page <strong className="text-slate-800 font-bold">{currentPage}</strong> of <strong className="text-slate-800 font-bold">{totalPages}</strong>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 transition-all shadow-sm"
                            title="First Page"
                          >
                            ⏮️ First
                          </button>
                          <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 transition-all shadow-sm"
                          >
                            ◀ Prev
                          </button>

                          {/* Dynamic page numbers */}
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2))
                            .map((p, idx, arr) => (
                              <React.Fragment key={p}>
                                {idx > 0 && arr[idx - 1] !== p - 1 && (
                                  <span className="px-1 text-slate-400">...</span>
                                )}
                                <button
                                  onClick={() => setCurrentPage(p)}
                                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                                    currentPage === p
                                      ? 'bg-[#38b34a] text-white shadow-sm'
                                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {p}
                                </button>
                              </React.Fragment>
                            ))}

                          <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 transition-all shadow-sm"
                          >
                            Next ▶
                          </button>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 transition-all shadow-sm"
                            title="Last Page"
                          >
                            Last ⏭️
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Dynamic Quotation Builder UI */
                <div className="space-y-6 animate-fade-in">
                  {/* Builder Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-200 gap-3">
                    <div>
                      <h2 className="text-xl font-black text-[#1e3e6b] flex items-center gap-2">
                        <span>📄 Dynamic Quotation Builder for General Client</span>
                      </h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Client: <strong className="text-slate-800">{selectedGenClient?.client_name}</strong> | ID:{' '}
                        <code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold">
                          {selectedGenClient?.client_id || `GC-${selectedGenClient?.id}`}
                        </code>{' '}
                        | Executive: <strong className="text-slate-700">{selectedGenClient?.sold_by_name || 'Admin Sales'}</strong> | Branch:{' '}
                        {selectedGenClient?.branch_name || 'Head Office'}
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
                      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center justify-between">
                          <span>Client Details:</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Status: {selectedGenClient?.status || 'Attended'}
                          </span>
                        </h3>
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
                              value={selectedGenClient?.contact_person || selectedGenClient?.client_name || ''}
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
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Email Address</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedGenClient?.email || ''}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Sold By Executive</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedGenClient?.sold_by_name || 'Admin Sales Team'}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Branch</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedGenClient?.branch_name || 'Head Office (Gurugram)'}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-700"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Box 2: Quotation Parameters Form */}
                      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
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
                          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                            Quotation Line Items ({quotationItems.length})
                          </h3>
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
                              Click any item from the catalog on the right or click "Add Custom Line Item" above.
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
                                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Product / Service Title</label>
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
                                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Line Total</label>
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

                    {/* Right Column (1 Col): Dynamic Services Catalog Quick-Add Sidebar + Totals */}
                    <div className="space-y-6">
                      {/* Sidebar Services Catalog Card */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <span>📦</span>
                              <span>Services Database ({generalServices.length})</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 font-medium">Click to add services to line items</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleOpenAddServiceModal}
                            className="text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg border border-purple-200 flex items-center gap-1 transition-all"
                          >
                            <span>+ New</span>
                          </button>
                        </div>

                        {/* Quick Search in Quotation Sidebar */}
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                          <input
                            type="text"
                            placeholder="Search catalog services..."
                            value={sidebarServiceSearch}
                            onChange={(e) => setSidebarServiceSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        {/* Services List */}
                        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                          {(() => {
                            const filteredSidebarServices = generalServices.filter((srv) => {
                              const q = sidebarServiceSearch.trim().toLowerCase()
                              return !q || (srv.name && srv.name.toLowerCase().includes(q)) || (srv.category && srv.category.toLowerCase().includes(q)) || (srv.description && srv.description.toLowerCase().includes(q))
                            })

                            if (filteredSidebarServices.length === 0) {
                              return (
                                <div className="text-center py-8 text-slate-400 text-xs space-y-1">
                                  <span className="text-2xl block">🔍</span>
                                  <p className="font-bold">No services matching search</p>
                                  <button
                                    type="button"
                                    onClick={handleOpenAddServiceModal}
                                    className="text-purple-600 font-bold hover:underline text-[11px]"
                                  >
                                    + Add New Service to Catalog
                                  </button>
                                </div>
                              )
                            }

                            return filteredSidebarServices.map((srv) => (
                              <div
                                key={srv.id}
                                className="bg-white border border-slate-200 rounded-xl p-3 transition-all shadow-sm hover:border-purple-400 hover:shadow-md space-y-1.5"
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <p className="font-extrabold text-xs text-slate-800 leading-snug">
                                    {srv.name || srv.service_name || 'Service Item'}
                                  </p>
                                  <span className="text-[10px] font-mono text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded shrink-0">
                                    {srv.hsn || '998314'}
                                  </span>
                                </div>

                                {srv.description && (
                                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                    {srv.description}
                                  </p>
                                )}

                                <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-100">
                                  <span className="font-black text-purple-700">
                                    ₹{Number(srv.selling_price || srv.price || 0).toLocaleString('en-IN')}{' '}
                                    <span className="text-[10px] font-normal text-slate-400">/ {srv.unit || 'Unit'}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddGeneralServiceToQuotation(srv)}
                                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                  >
                                    <span>+ Add to Quote</span>
                                  </button>
                                </div>
                              </div>
                            ))
                          })()}
                        </div>
                      </div>

                      {/* Totals Summary Box */}
                      <div className="bg-white border-2 border-[#1e3e6b]/20 rounded-2xl p-5 shadow-lg space-y-4">
                        <h3 className="text-sm font-black text-[#1e3e6b] uppercase tracking-wider border-b border-slate-100 pb-2">
                          Financial Summary
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
                            className="w-full py-3 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>💾</span>
                            <span>{loading ? 'Saving...' : 'Save & View Quotation Document'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={loading || quotationItems.length === 0}
                            onClick={(e) => handleSaveQuotation(e, true)}
                            className="w-full py-3.5 bg-gradient-to-r from-[#38b34a] to-emerald-600 hover:from-[#329f42] hover:to-emerald-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>⚡</span>
                            <span>{loading ? 'Processing...' : 'Save & Generate Payment Link'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SERVICE CATALOG (General Services Management) */}
          {activeTab === 'services' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span>📦 General Services Catalog</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-bold">
                      {generalServices.length} Total Services
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure services available for client selection and automated line-item pre-filling in Quotations.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddServiceModal}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>➕ Add New Service</span>
                </button>
              </div>

              {/* Service Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search services by title, category, HSN code, or keywords..."
                    value={serviceCatalogSearch}
                    onChange={(e) => setServiceCatalogSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Category:</label>
                  <select
                    value={serviceCategoryFilter}
                    onChange={(e) => setServiceCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-500"
                  >
                    <option value="All">All Categories</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Software">Software & ERP</option>
                    <option value="API Integration">API Integration</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Maintenance">Maintenance & AMC</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {/* Services Grid (Using normalized fields so service names and prices are never blank) */}
              {(() => {
                const filteredCatalogServices = generalServices.filter((srv) => {
                  const q = serviceCatalogSearch.trim().toLowerCase()
                  const matchesSearch =
                    !q ||
                    (srv.name && srv.name.toLowerCase().includes(q)) ||
                    (srv.category && srv.category.toLowerCase().includes(q)) ||
                    (srv.description && srv.description.toLowerCase().includes(q)) ||
                    (srv.hsn && String(srv.hsn).includes(q))
                  const matchesCategory =
                    serviceCategoryFilter === 'All' || srv.category === serviceCategoryFilter
                  return matchesSearch && matchesCategory
                })

                if (filteredCatalogServices.length === 0) {
                  return (
                    <div className="text-center py-16 bg-slate-50/60 rounded-3xl border border-slate-200 text-slate-400 space-y-2">
                      <span className="text-4xl block">📦</span>
                      <p className="font-bold text-sm">No services found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search filter or add a new service.</p>
                      <button
                        onClick={handleOpenAddServiceModal}
                        className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm"
                      >
                        + Add New Service
                      </button>
                    </div>
                  )
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCatalogServices.map((srv) => (
                      <div
                        key={srv.id}
                        className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200">
                              {srv.category || 'Service'}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                              HSN: {srv.hsn || '998314'}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-sm leading-snug">
                            {srv.name || srv.service_name || 'General Service'}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                            {srv.description || 'Standard service scope and deliverables.'}
                          </p>
                        </div>

                        <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Standard Rate:</span>
                            <span className="text-base font-black text-purple-700">
                              ₹{Number(srv.selling_price || srv.price || 0).toLocaleString('en-IN')}
                              <span className="text-[11px] font-normal text-slate-400"> / {srv.unit || 'Unit'}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditServiceClick(srv)}
                              className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
                              title="Edit Service"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteService(srv)}
                              className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
                              title="Delete Service"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

          {/* TAB 4: COUNTRY TAXES & PRICING OVERRIDES */}
          {activeTab === 'pricing' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Column 1: Manage Country Tax Rates */}
                <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
                  <div>
                    <h2 className="text-base font-black text-[#1e3e6b]">1. Country Baseline Tax Rates</h2>
                    <p className="text-xs text-slate-500">
                      Configure baseline tax rates (GST, VAT, Sales Tax) per country.
                    </p>
                  </div>

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

                {/* Column 2: Set Country Product Processing Fee */}
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
            </div>
          )}

          {/* TAB 5: FOLLOW UP SCHEDULE */}
          {activeTab === 'follow_up' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span>📞 Follow-up Pipeline & Reminders</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Clients with active next follow-up dates sorted by upcoming timeline.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {generalClients.filter((c) => Boolean(c.next_followup_date)).length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No clients currently have scheduled follow-up dates. Edit a client to set their next follow-up date.
                  </div>
                ) : (
                  generalClients
                    .filter((c) => Boolean(c.next_followup_date))
                    .sort((a, b) => new Date(a.next_followup_date) - new Date(b.next_followup_date))
                    .map((c) => (
                      <div
                        key={c.id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800 text-sm">{c.client_name}</span>
                            <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {c.client_id || `GC-${c.id}`}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                STATUS_STYLES[c.status] || STATUS_STYLES['Attended']
                              }`}
                            >
                              {c.status || 'Attended'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Executive: <strong>{c.sold_by_name || 'Admin Sales'}</strong> · Branch: {c.branch_name || 'Head Office'} · Phone: {c.contact_number}
                          </p>
                          {c.software_requirements && (
                            <p className="text-[11px] text-slate-600 italic">
                              Requirements: {c.software_requirements}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Scheduled Date:</span>
                            <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-black inline-flex items-center gap-1">
                              📅 {formatDateDisplay(c.next_followup_date)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenQuotationBuilder(c)}
                              className="px-3 py-1.5 bg-[#38b34a] hover:bg-[#329f42] text-white text-xs font-bold rounded-xl shadow-sm"
                            >
                              📝 Quote
                            </button>
                            <button
                              onClick={() => handleOpenEditClientModal(c)}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm hover:bg-slate-50"
                            >
                              ✏️ Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: DUE PAYMENT */}
          {activeTab === 'due_payment' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-rose-500 text-lg">⚠️</span>
                  <span>Due Payments & Quotation Payment Links</span>
                </h3>
              </div>
              <div className="p-8 text-center text-slate-400 text-xs">
                All outstanding general client quotations can be sent with direct Razorpay online payment links.
              </div>
            </div>
          )}

          {/* TAB 7: PAYMENT REPORT */}
          {activeTab === 'payment_report' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-blue-500 text-lg">📑</span>
                  <span>Payment History & Tax Invoice Archive</span>
                </h3>
              </div>
              <div className="p-8 text-center text-slate-400 text-xs">
                Paid general quotations automatically generate official Tax Invoice PDFs for immediate client download.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: ADD GENERAL CLIENT MODAL (with Multi-Select Checkbox) */}
      {/* ============================================================ */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl p-6 text-slate-800 overflow-y-auto max-h-[90vh] space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#1e3e6b]">➕ Create New General Client</h3>
                <p className="text-xs text-slate-400">Record client details, executive assignments, and required services.</p>
              </div>
              <button
                onClick={() => setShowAddClientModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGeneralClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={clientForm.client_name}
                    onChange={(e) => setClientForm({ ...clientForm, client_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Enterprises Pvt Ltd"
                    value={clientForm.company_name}
                    onChange={(e) => setClientForm({ ...clientForm, company_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. Ramesh Kumar"
                    value={clientForm.contact_person}
                    onChange={(e) => setClientForm({ ...clientForm, contact_person: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Alt Contact Number</label>
                  <input
                    type="text"
                    placeholder="Secondary phone"
                    value={clientForm.alt_contact_number}
                    onChange={(e) => setClientForm({ ...clientForm, alt_contact_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Country</label>
                  <select
                    value={clientForm.country_code}
                    onChange={(e) => setClientForm({ ...clientForm, country_code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Haryana"
                    value={clientForm.state}
                    onChange={(e) => setClientForm({ ...clientForm, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Street Address</label>
                  <input
                    type="text"
                    placeholder="Plot 45, Industrial Area Phase II"
                    value={clientForm.address}
                    onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pin Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 122001"
                    value={clientForm.pin_code}
                    onChange={(e) => setClientForm({ ...clientForm, pin_code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">GST Tax Type</label>
                  <select
                    value={clientForm.gst_type}
                    onChange={(e) => setClientForm({ ...clientForm, gst_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Lead Source</label>
                  <select
                    value={clientForm.lead_source}
                    onChange={(e) => setClientForm({ ...clientForm, lead_source: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  >
                    {LEAD_SOURCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Referred By</label>
                  <select
                    value={clientForm.referred_by}
                    onChange={(e) => setClientForm({ ...clientForm, referred_by: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  >
                    {REFERRED_BY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Sold By (Executive)</label>
                  <select
                    value={clientForm.sold_by_name}
                    onChange={(e) => setClientForm({ ...clientForm, sold_by_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  >
                    {SOLD_BY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Branch Name</label>
                  <select
                    value={clientForm.branch_name}
                    onChange={(e) => setClientForm({ ...clientForm, branch_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  >
                    {BRANCH_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Initial Status</label>
                  <select
                    value={clientForm.status}
                    onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_ICONS[st]} {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={clientForm.next_followup_date}
                    onChange={(e) => setClientForm({ ...clientForm, next_followup_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                {/* Multi-Select Checkbox Dropdown for Services (Module 3) */}
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 flex items-center justify-between">
                    <span>Select Required Services (Multi-Select Dropdown) *</span>
                    <span className="text-purple-600 font-bold">
                      {(clientForm.selected_services || []).length} Selected
                    </span>
                  </label>

                  {/* Multi-Select Input Container */}
                  <div className="relative">
                    <div
                      onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 min-h-[46px] cursor-pointer flex flex-wrap items-center gap-1.5 hover:border-purple-300 transition-all"
                    >
                      {(clientForm.selected_services || []).length > 0 ? (
                        (clientForm.selected_services || []).map((srv, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1"
                          >
                            <span>{srv}</span>
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation()
                                removeSelectedService(srv)
                              }}
                              className="text-purple-600 hover:text-purple-900 font-extrabold text-sm ml-1"
                            >
                              ✕
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs">
                          Click to choose services from database catalog...
                        </span>
                      )}
                      <span className="ml-auto text-slate-400 text-xs">
                        {serviceDropdownOpen ? '▲' : '▼'}
                      </span>
                    </div>

                    {/* Dropdown Options Popup */}
                    {serviceDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2 animate-fade-in max-h-60 overflow-y-auto">
                        <input
                          type="text"
                          placeholder="Filter services..."
                          value={serviceSearchTerm}
                          onChange={(e) => setServiceSearchTerm(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                        />

                        <div className="space-y-1 pt-1">
                          {generalServices
                            .filter((s) => !serviceSearchTerm || s.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()))
                            .map((service) => {
                              const isChecked = (clientForm.selected_services || []).includes(service.name)
                              return (
                                <label
                                  key={service.id}
                                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                    isChecked ? 'bg-purple-50 text-purple-900' : 'hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleServiceSelection(service.name)}
                                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
                                  />
                                  <div className="flex-1 flex justify-between items-center">
                                    <span>{service.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      ₹{(service.selling_price || service.price || 0).toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </label>
                              )
                            })}
                        </div>
                      </div>
                    )}
                  </div>
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

      {/* ============================================================ */}
      {/* MODAL 2: EDIT GENERAL CLIENT MODAL */}
      {/* ============================================================ */}
      {showEditClientModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl p-6 text-slate-800 overflow-y-auto max-h-[90vh] space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#1e3e6b]">✏️ Edit Client Profile</h3>
                <p className="text-xs text-slate-400">Update general client details, requirements, executive, and status.</p>
              </div>
              <button
                onClick={() => setShowEditClientModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateGeneralClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.client_name}
                    onChange={(e) => setClientForm({ ...clientForm, client_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={clientForm.company_name}
                    onChange={(e) => setClientForm({ ...clientForm, company_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={clientForm.contact_person}
                    onChange={(e) => setClientForm({ ...clientForm, contact_person: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Contact Number *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.contact_number}
                    onChange={(e) => setClientForm({ ...clientForm, contact_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Alt Contact Number</label>
                  <input
                    type="text"
                    value={clientForm.alt_contact_number}
                    onChange={(e) => setClientForm({ ...clientForm, alt_contact_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Country</label>
                  <select
                    value={clientForm.country_code}
                    onChange={(e) => setClientForm({ ...clientForm, country_code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
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
                    value={clientForm.district}
                    onChange={(e) => setClientForm({ ...clientForm, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">State</label>
                  <input
                    type="text"
                    value={clientForm.state}
                    onChange={(e) => setClientForm({ ...clientForm, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Street Address</label>
                  <input
                    type="text"
                    value={clientForm.address}
                    onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pin Code</label>
                  <input
                    type="text"
                    value={clientForm.pin_code}
                    onChange={(e) => setClientForm({ ...clientForm, pin_code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">GST Tax Type</label>
                  <select
                    value={clientForm.gst_type}
                    onChange={(e) => setClientForm({ ...clientForm, gst_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  >
                    <option value="Intra-State">Intra-State (CGST + SGST)</option>
                    <option value="Inter-State">Inter-State (IGST)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={clientForm.gstin}
                    onChange={(e) => setClientForm({ ...clientForm, gstin: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Lead Source</label>
                  <select
                    value={clientForm.lead_source}
                    onChange={(e) => setClientForm({ ...clientForm, lead_source: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  >
                    {LEAD_SOURCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Referred By</label>
                  <select
                    value={clientForm.referred_by}
                    onChange={(e) => setClientForm({ ...clientForm, referred_by: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  >
                    {REFERRED_BY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Sold By (Executive)</label>
                  <select
                    value={clientForm.sold_by_name}
                    onChange={(e) => setClientForm({ ...clientForm, sold_by_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  >
                    {SOLD_BY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Branch Name</label>
                  <select
                    value={clientForm.branch_name}
                    onChange={(e) => setClientForm({ ...clientForm, branch_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  >
                    {BRANCH_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Client Status</label>
                  <select
                    value={clientForm.status}
                    onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_ICONS[st]} {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={clientForm.next_followup_date}
                    onChange={(e) => setClientForm({ ...clientForm, next_followup_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#38b34a]"
                  />
                </div>

                {/* Multi-Select Checkbox Dropdown for Services */}
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 flex items-center justify-between">
                    <span>Select Required Services (Multi-Select Dropdown)</span>
                    <span className="text-purple-600 font-bold">
                      {(clientForm.selected_services || []).length} Selected
                    </span>
                  </label>

                  <div className="relative">
                    <div
                      onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 min-h-[46px] cursor-pointer flex flex-wrap items-center gap-1.5 hover:border-purple-300 transition-all"
                    >
                      {(clientForm.selected_services || []).length > 0 ? (
                        (clientForm.selected_services || []).map((srv, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1"
                          >
                            <span>{srv}</span>
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation()
                                removeSelectedService(srv)
                              }}
                              className="text-purple-600 hover:text-purple-900 font-extrabold text-sm ml-1"
                            >
                              ✕
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs">
                          Click to choose services from database catalog...
                        </span>
                      )}
                      <span className="ml-auto text-slate-400 text-xs">
                        {serviceDropdownOpen ? '▲' : '▼'}
                      </span>
                    </div>

                    {serviceDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2 animate-fade-in max-h-60 overflow-y-auto">
                        <input
                          type="text"
                          placeholder="Filter services..."
                          value={serviceSearchTerm}
                          onChange={(e) => setServiceSearchTerm(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                        />

                        <div className="space-y-1 pt-1">
                          {generalServices
                            .filter((s) => !serviceSearchTerm || s.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()))
                            .map((service) => {
                              const isChecked = (clientForm.selected_services || []).includes(service.name)
                              return (
                                <label
                                  key={service.id}
                                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                    isChecked ? 'bg-purple-50 text-purple-900' : 'hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleServiceSelection(service.name)}
                                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
                                  />
                                  <div className="flex-1 flex justify-between items-center">
                                    <span>{service.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      ₹{(service.selling_price || service.price || 0).toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </label>
                              )
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditClientModal(false)}
                  className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#38b34a] hover:bg-[#329f42] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  {loading ? 'Updating...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ══ CLIENT DETAILS MODAL (SIDE DRAWER - SaaS Style) ═════════ */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showViewClientModal && viewingClient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900"
              onClick={() => setShowViewClientModal(false)}
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-hidden z-10 bg-white border-l border-slate-200"
            >
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between bg-slate-50 border-b border-slate-200">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">General Client Dossier</span>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {viewingClient.company_name || viewingClient.client_name}
                  </h3>
                  <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(viewingClient.client_id || `GC-${viewingClient.id}`)
                        setCopiedClientId(true)
                        setTimeout(() => setCopiedClientId(false), 2000)
                      }}
                      title="Click to copy Client ID"
                      className="flex items-center gap-1 text-[10px] text-blue-600 font-bold font-mono tracking-wider bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg hover:bg-blue-100 transition-all cursor-pointer"
                    >
                      {viewingClient.client_id || `GC-${viewingClient.id}`}
                      <span className="text-[9px] ml-0.5">{copiedClientId ? '✅' : '📋'}</span>
                    </button>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Contact: <strong className="text-slate-700">{viewingClient.contact_person || viewingClient.client_name}</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase whitespace-nowrap ${
                      STATUS_STYLES[viewingClient.status] || STATUS_STYLES['Attended']
                    }`}>
                      {STATUS_ICONS[viewingClient.status]} {viewingClient.status || 'Attended'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewClientModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer ml-3 flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Dossier Navigation Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 border-b border-slate-200 px-6 py-3 z-10 shrink-0">
                {[
                  { id: 'profile', label: 'Company Profile', icon: '🏢' },
                  { id: 'services', label: 'Requested Services', icon: '📦' },
                  { id: 'sales', label: 'Sales & Branch', icon: '👤' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDossierTab(t.id)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
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
                      <div>
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">Client / Company Profile</h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[11px]">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Client Name</span>
                            <p className="text-slate-800 font-bold mt-1">{viewingClient.client_name}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Company / Organization</span>
                            <p className="text-slate-800 font-medium mt-1">{viewingClient.company_name || '—'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Connected Person</span>
                            <p className="text-slate-800 font-medium mt-1">{viewingClient.contact_person || viewingClient.client_name}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Email Address</span>
                            <p className="text-slate-800 font-medium mt-1 select-text">{viewingClient.email || '—'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Phone Number</span>
                            <p className="text-slate-800 font-medium mt-1 select-text">{viewingClient.contact_number || '—'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Alternate Phone</span>
                            <p className="text-slate-800 font-medium mt-1 select-text">{viewingClient.alt_contact_number || '—'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">GST Type</span>
                            <p className="text-slate-800 font-medium mt-1">{viewingClient.gst_type || 'Intra-State'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">GSTIN</span>
                            <p className="text-slate-800 font-mono font-bold mt-1">{viewingClient.gstin || '—'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Country</span>
                            <p className="text-slate-800 font-medium mt-1 flex items-center gap-1">
                              <span>{countryFlags[viewingClient.country_code] || '🌐'}</span>
                              <span>{viewingClient.country_code || 'IN'}</span>
                            </p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Registration Date</span>
                            <p className="text-slate-800 font-medium mt-1">{formatDateDisplay(viewingClient.reg_date || viewingClient.created_at)}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Full Address</span>
                            <p className="text-slate-800 font-medium mt-1 leading-relaxed">
                              {viewingClient.address
                                ? `${viewingClient.address}, ${viewingClient.district || ''}, ${viewingClient.state || ''} - ${viewingClient.pin_code || ''}`
                                : '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {dossierTab === 'services' && (
                    <motion.div
                      key="services"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-6"
                    >
                      <div>
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">Requested Services & Requirements</h4>
                        {viewingClient.software_requirements ? (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {viewingClient.software_requirements.split(',').map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                                >
                                  <span>📦</span>
                                  <span>{s.trim()}</span>
                                </span>
                              ))}
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1 mt-4">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Scope Notes</span>
                              <p className="text-slate-700 font-medium leading-relaxed">
                                {viewingClient.software_requirements}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic text-xs">No specific service requested yet.</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {dossierTab === 'sales' && (
                    <motion.div
                      key="sales"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-6"
                    >
                      <div>
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3.5 block font-sans">Sales & Executive Assignment</h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[11px]">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Executive (Sold By)</span>
                            <p className="text-slate-800 font-bold mt-1 flex items-center gap-1">
                              <span>👤</span>
                              <span>{viewingClient.sold_by_name || 'Admin Sales Team'}</span>
                            </p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Assigned Branch</span>
                            <p className="text-slate-800 font-medium mt-1 flex items-center gap-1">
                              <span>🏛️</span>
                              <span>{viewingClient.branch_name || 'Head Office (Gurugram)'}</span>
                            </p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Lead Source</span>
                            <p className="text-slate-800 font-medium mt-1">{viewingClient.lead_source || 'Website'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Referred By</span>
                            <p className="text-slate-800 font-medium mt-1">{viewingClient.referred_by || 'Direct'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Lifecycle Status</span>
                            <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                              STATUS_STYLES[viewingClient.status] || STATUS_STYLES['Attended']
                            }`}>
                              {STATUS_ICONS[viewingClient.status]} {viewingClient.status || 'Attended'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Next Follow-up Date</span>
                            <p className="text-slate-800 font-bold mt-1 text-blue-700">
                              📅 {formatDateDisplay(viewingClient.next_followup_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sticky Drawer Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <button
                  onClick={() => {
                    setShowViewClientModal(false)
                    handleViewClientQuotations(viewingClient)
                  }}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>📋</span>
                  <span>Quotations ({viewingClient.quotations_count || viewingClient.quotations?.length || 0})</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowViewClientModal(false)
                      handleOpenEditClientModal(viewingClient)
                    }}
                    className="px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <span>✏️</span>
                    <span>Edit Client</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowViewClientModal(false)
                      handleOpenQuotationBuilder(viewingClient)
                    }}
                    className="px-4 py-2 bg-[#38b34a] hover:bg-[#329f42] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>📝</span>
                    <span>Create Quotation</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL 4: ADD / EDIT SERVICE ENTRY MODAL (Module 1) */}
      {/* ============================================================ */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-purple-900">
                  {editingServiceId ? '✏️ Edit Service Entry' : '📦 Add Service Entry'}
                </h3>
                <p className="text-xs text-slate-400">Manage items in your general service catalog.</p>
              </div>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Service Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Corporate Informative Website"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">HSN / SAC Code</label>
                  <input
                    type="text"
                    placeholder="998314"
                    value={serviceForm.hsn}
                    onChange={(e) => setServiceForm({ ...serviceForm, hsn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Billing Unit</label>
                  <select
                    value={serviceForm.unit}
                    onChange={(e) => setServiceForm({ ...serviceForm, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-purple-500"
                  >
                    <option value="Unit">Unit</option>
                    <option value="Setup">Setup</option>
                    <option value="Month">Month</option>
                    <option value="Year">Year</option>
                    <option value="Project">Project</option>
                    <option value="Hour">Hour</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Standard Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="25000"
                    value={serviceForm.selling_price}
                    onChange={(e) => setServiceForm({ ...serviceForm, selling_price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-purple-500"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Software">Software & ERP</option>
                    <option value="API Integration">API Integration</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Maintenance">Maintenance & AMC</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Scope & Specifications / Description</label>
                <textarea
                  rows="3"
                  placeholder="Detailed feature list, technical specifications, and inclusions..."
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-purple-500"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  {loading ? 'Saving...' : editingServiceId ? '💾 Save Service' : '➕ Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: CLIENT QUOTATIONS HISTORY MODAL */}
      {/* ============================================================ */}
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
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Payment Terms</th>
                      <th className="px-4 py-3 text-right">Grand Total</th>
                      <th className="px-4 py-3 text-center">Actions & Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedClientQuotations.map((q) => {
                      const calcTotal = () => {
                        if (!q) return 0
                        const candidates = [q.grand_total, q.total_amount, q.grandTotal, q.total, q.amount, q.net_amount, q.final_amount]
                        for (const val of candidates) {
                          if (val !== undefined && val !== null && !isNaN(Number(val)) && Number(val) > 0) {
                            return Number(val)
                          }
                        }
                        if (Array.isArray(q.items) && q.items.length > 0) {
                          return q.items.reduce((sum, item) => {
                            const qty = Number(item.qty || item.quantity || 1)
                            const price = Number(item.selling_price || item.price || item.unit_price || 0)
                            const disc = Number(item.discount_percentage || item.discount || 0)
                            return sum + Math.round(qty * price * (1 - disc / 100) * 100) / 100
                          }, 0)
                        }
                        return 0
                      }

                      const totalAmt = calcTotal()
                      const isPaid = q.status === 'paid' || q.is_paid === true

                      return (
                        <tr key={q.id}>
                          <td className="px-4 py-3 font-mono font-bold text-blue-600">{q.quotation_number || `QUO-${q.id}`}</td>
                          <td className="px-4 py-3 text-slate-500">
                            {q.quotation_date ? String(q.quotation_date).split('T')[0] : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            {isPaid ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ✅ Paid
                              </span>
                            ) : q.status === 'sent' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                                📨 Sent
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                                📝 {q.status || 'Draft'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-600">{q.payment_terms || 'Due on Receipt'}</td>
                          <td className="px-4 py-3 text-right font-black text-emerald-700 text-sm">
                            ₹{totalAmt.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Direct View Quotation Document */}
                              <button
                                type="button"
                                onClick={() => {
                                  setShowQuotationsListModal(false)
                                  handleOpenQuotationDoc(q, selectedGenClient)
                                }}
                                className="px-3 py-1.5 bg-[#1e3e6b] hover:bg-[#152e50] text-white rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                              >
                                <span>👁️</span>
                                <span>View Document</span>
                              </button>

                              {isPaid && (
                                <a
                                  href={getAdminInvoiceDownloadUrl(q.id)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow-sm transition-all"
                                >
                                  📥 Tax Invoice PDF
                                </a>
                              )}

                              <button
                                type="button"
                                title="Copy Payment Link"
                                onClick={async () => {
                                  let payUrl = q.payment_url || q.pay_url
                                  if (!payUrl && q.id) {
                                    try {
                                      const sendRes = await sendQuotation(q.id)
                                      if (sendRes?.data?.payment_url) {
                                        payUrl = sendRes.data.payment_url
                                        q.payment_url = payUrl
                                      }
                                    } catch (_) {}
                                  }
                                  if (!payUrl) {
                                    const targetUuid = q.uuid || `quotation-uuid-${q.id}`
                                    payUrl = `${window.location.origin}/general-quotation-pay.html?uuid=${targetUuid}`
                                  }
                                  if (navigator.clipboard && navigator.clipboard.writeText) {
                                    await navigator.clipboard.writeText(payUrl)
                                    alert(`📋 Payment Link copied to clipboard:\n\n${payUrl}`)
                                  }
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                🔗
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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

      {/* ============================================================ */}
      {/* MODAL 6: OFFICIAL QUOTATION DOCUMENT VIEWER (Print Ready) */}
      {/* ============================================================ */}
      {showQuotationDocModal && viewingQuotationDoc && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-fade-in print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col text-slate-800 overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
            {/* Modal Controls Top Bar (Hidden on Print) */}
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Official Quotation Document
                </span>
                <span className="font-mono text-xs font-bold text-slate-300">
                  #{viewingQuotationDoc.quotation_number || `QUO-${viewingQuotationDoc.id}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>🖨️</span>
                  <span>Print / Save PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const payUrl = viewingQuotationDoc.payment_url || `${window.location.origin}/general-quotation-pay.html?uuid=${viewingQuotationDoc.uuid || ('quotation-' + viewingQuotationDoc.id)}`
                    navigator.clipboard.writeText(payUrl)
                    setCopiedPayLink(true)
                    setTimeout(() => setCopiedPayLink(false), 2500)
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{copiedPayLink ? '✅' : '🔗'}</span>
                  <span>{copiedPayLink ? 'Link Copied!' : 'Copy Pay Link'}</span>
                </button>

                <a
                  href={viewingQuotationDoc.payment_url || `${window.location.origin}/general-quotation-pay.html?uuid=${viewingQuotationDoc.uuid || ('quotation-' + viewingQuotationDoc.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>🌐</span>
                  <span>Public View</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowQuotationDocModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition-colors ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Body (A4 Style Paper) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100/60 print:p-0 print:bg-white print:overflow-visible font-sans">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0 max-w-3xl mx-auto">
                {/* 1. Letterhead & Brand Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-slate-800">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1e3e6b] to-blue-700 text-white font-black flex items-center justify-center text-xl shadow-md">
                        A
                      </div>
                      <div>
                        <h1 className="text-xl font-black text-[#1e3e6b] tracking-tight uppercase">AIM Digitalise Pvt. Ltd.</h1>
                        <p className="text-[11px] font-bold text-slate-500">Corporate Web, Software & Digital Transformation Solutions</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-relaxed pt-1">
                      <p>Corporate Office: Head Office (Gurugram) / New Delhi, India</p>
                      <p>GSTIN: <strong>07AAACA1234A1Z5</strong> | CIN: <strong>U72900DL2026PTC123456</strong></p>
                      <p>Email: <span className="text-blue-600">contact@aimdigitalise.com</span> | Web: <strong>www.aimdigitalise.com</strong></p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right space-y-1.5 bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-none border-slate-200 w-full sm:w-auto">
                    <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-[#1e3e6b] text-white">
                      OFFICIAL QUOTATION
                    </span>
                    <div className="text-xs pt-1 space-y-0.5">
                      <p className="font-mono font-black text-slate-800 text-sm">
                        #{viewingQuotationDoc.quotation_number || `QUO-${viewingQuotationDoc.id}`}
                      </p>
                      <p className="text-slate-500 font-medium">
                        Date: <strong>{formatDateDisplay(viewingQuotationDoc.quotation_date)}</strong>
                      </p>
                      <p className="text-slate-500 font-medium">
                        Payment Terms: <strong>{viewingQuotationDoc.payment_terms || 'Due on Receipt'}</strong>
                      </p>
                      <p className="text-slate-500 font-medium">
                        Status:{' '}
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          viewingQuotationDoc.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {viewingQuotationDoc.status || 'Draft'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Client / Billing Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                      QUOTATION FOR (BILL TO):
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {viewingQuotationDoc.client?.company_name || viewingQuotationDoc.client?.client_name || 'Valued Client'}
                    </h3>
                    {viewingQuotationDoc.client?.contact_person && (
                      <p className="text-slate-600 font-medium">
                        Attn: <strong>{viewingQuotationDoc.client.contact_person}</strong>
                      </p>
                    )}
                    <p className="text-slate-600">{viewingQuotationDoc.client?.email || '—'}</p>
                    <p className="text-slate-600">{viewingQuotationDoc.client?.contact_number || '—'}</p>
                    {viewingQuotationDoc.client?.address && (
                      <p className="text-slate-500 pt-0.5 leading-snug">
                        {viewingQuotationDoc.client.address}
                        {viewingQuotationDoc.client.district ? `, ${viewingQuotationDoc.client.district}` : ''}
                        {viewingQuotationDoc.client.state ? `, ${viewingQuotationDoc.client.state}` : ''}
                        {viewingQuotationDoc.client.pin_code ? ` - ${viewingQuotationDoc.client.pin_code}` : ''}
                      </p>
                    )}
                    {viewingQuotationDoc.client?.gstin && (
                      <p className="font-mono text-slate-700 font-bold pt-1">
                        GSTIN: {viewingQuotationDoc.client.gstin}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                      EXECUTIVE & ORDER METADATA:
                    </span>
                    <p className="text-slate-700">
                      Sold / Prepared By: <strong>{viewingQuotationDoc.client?.sold_by_name || 'Admin Sales Team'}</strong>
                    </p>
                    <p className="text-slate-700">
                      Branch: <strong>{viewingQuotationDoc.client?.branch_name || 'Head Office (Gurugram)'}</strong>
                    </p>
                    <p className="text-slate-700">
                      Tax Regime: <strong>{viewingQuotationDoc.gst_type || viewingQuotationDoc.client?.gst_type || 'Intra-State'}</strong>
                    </p>
                    <p className="text-slate-700">
                      Country: <strong>{countryFlags[viewingQuotationDoc.client?.country_code] || '🇮🇳'} {viewingQuotationDoc.client?.country_code || 'IN'}</strong>
                    </p>
                    {viewingQuotationDoc.po_number && (
                      <p className="text-slate-700">
                        PO Number: <strong>{viewingQuotationDoc.po_number}</strong> ({viewingQuotationDoc.po_date || 'N/A'})
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Scope & Itemized Breakdown Table */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                    Scope of Services & Line Items:
                  </span>

                  <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                          <th className="px-3.5 py-2.5 text-center w-10">#</th>
                          <th className="px-4 py-2.5">Service Description & Technical Scope</th>
                          <th className="px-3 py-2.5 text-center w-20">HSN/SAC</th>
                          <th className="px-3 py-2.5 text-center w-16">Qty</th>
                          <th className="px-3 py-2.5 text-right w-24">Rate (₹)</th>
                          <th className="px-3 py-2.5 text-center w-16">Disc</th>
                          <th className="px-4 py-2.5 text-right w-28">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {(viewingQuotationDoc.items || []).map((item, idx) => {
                          const qty = Number(item.qty || item.quantity || 1)
                          const price = Number(item.selling_price || item.price || 0)
                          const disc = Number(item.discount_percentage || item.discount || 0)
                          const lineTotal = Math.round(qty * price * (1 - disc / 100) * 100) / 100

                          return (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                              <td className="px-3.5 py-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <p className="font-extrabold text-slate-900 leading-snug">
                                  {item.product_name || item.name || item.service_name || 'Service Item'}
                                </p>
                                {item.description && (
                                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed whitespace-pre-line">
                                    {item.description}
                                  </p>
                                )}
                              </td>
                              <td className="px-3 py-3 text-center font-mono text-[11px] text-slate-600">
                                {item.hsn || '998314'}
                              </td>
                              <td className="px-3 py-3 text-center font-bold">
                                {qty} <span className="text-[10px] font-normal text-slate-400">{item.unit || 'Unit'}</span>
                              </td>
                              <td className="px-3 py-3 text-right font-medium">
                                ₹{price.toLocaleString('en-IN')}
                              </td>
                              <td className="px-3 py-3 text-center font-medium text-slate-500">
                                {disc > 0 ? `${disc}%` : '—'}
                              </td>
                              <td className="px-4 py-3 text-right font-black text-slate-900">
                                ₹{lineTotal.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Financial Calculations & Amount in Words */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                        Amount in Words:
                      </span>
                      <p className="font-bold text-slate-800 italic leading-relaxed">
                        {numberToIndianWords(viewingQuotationDoc.grand_total)}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs space-y-1.5">
                      <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest block">
                        Bank Transfer & UPI Details:
                      </span>
                      <div className="text-[11px] text-slate-700 space-y-0.5">
                        <p>Bank: <strong>HDFC Bank Ltd</strong> | Account: <strong>Current Account</strong></p>
                        <p>A/C Name: <strong>AIM DIGITALISE PVT LTD</strong></p>
                        <p>A/C No: <strong>50200087654321</strong> | IFSC: <strong>HDFC0001234</strong></p>
                        <p>UPI ID: <strong className="text-blue-700">aimdigitalise@hdfcbank</strong></p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Subtotal:</span>
                      <span className="font-bold text-slate-800">
                        ₹{Number(viewingQuotationDoc.subtotal || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {(viewingQuotationDoc.client?.country_code || 'IN') === 'IN' ? (
                      (viewingQuotationDoc.gst_type || 'Intra-State') === 'Intra-State' ? (
                        <>
                          <div className="flex justify-between text-slate-500 text-[11px]">
                            <span>CGST (9%):</span>
                            <span>₹{Number(viewingQuotationDoc.cgst || (viewingQuotationDoc.tax_total / 2) || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 text-[11px]">
                            <span>SGST (9%):</span>
                            <span>₹{Number(viewingQuotationDoc.sgst || (viewingQuotationDoc.tax_total / 2) || 0).toLocaleString('en-IN')}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>IGST (18%):</span>
                          <span>₹{Number(viewingQuotationDoc.igst || viewingQuotationDoc.tax_total || 0).toLocaleString('en-IN')}</span>
                        </div>
                      )
                    ) : (
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Export Tax (18%):</span>
                        <span>₹{Number(viewingQuotationDoc.tax_total || 0).toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-700 font-bold border-t border-slate-200 pt-2">
                      <span>Total Tax:</span>
                      <span>₹{Number(viewingQuotationDoc.tax_total || 0).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center border-t-2 border-slate-800 pt-3 text-base font-black text-slate-900">
                      <span>Grand Total:</span>
                      <span className="text-xl text-[#38b34a]">
                        ₹{Number(viewingQuotationDoc.grand_total || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Terms & Signature */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-200 text-xs">
                  <div className="sm:col-span-2 space-y-1 text-slate-500 text-[10px]">
                    <span className="font-black text-slate-700 uppercase tracking-wider block">Terms & Conditions:</span>
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>This quotation is valid for 30 days from the date of issuance.</li>
                      <li>Work commences immediately upon receipt of initial confirmation or advance.</li>
                      <li>GST/Taxes are calculated based on registered business jurisdiction.</li>
                      <li>For any inquiries regarding this quotation, contact <strong>support@aimdigitalise.com</strong>.</li>
                    </ol>
                  </div>

                  <div className="text-center sm:text-right space-y-8 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      For AIM Digitalise Pvt. Ltd.
                    </span>
                    <div className="border-t border-slate-400 pt-1 inline-block min-w-[140px] text-center">
                      <span className="font-black text-slate-800 text-xs block">Authorized Signatory</span>
                      <span className="text-[9px] text-slate-400 block font-medium">Digital Signature & Stamp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
              <span className="text-xs text-slate-500 font-medium">
                Official document format for AIM Digitalise clients & accounting audits.
              </span>
              <button
                onClick={() => setShowQuotationDocModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminUsers