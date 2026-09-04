import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getPartnerGeneralClients,
  getPartnerGeneralClientById,
  createPartnerGeneralClient,
  updatePartnerGeneralClient,
  updatePartnerGeneralClientStatus,
  deletePartnerGeneralClient,
  getPartnerGeneralServices,
  createPartnerGeneralService,
  updatePartnerGeneralService,
  deletePartnerGeneralService,
  createPartnerQuotation,
  sendPartnerQuotationEmail,
  getPartnerInvoiceDownloadUrl,
  recordPartnerQuotationPayment,
  getCountryTaxes,
  updateCountryTax,
  setCountryPrice,
  getPublicProductsForCountry,
  getSubscriptionClients,
  createPartnerLead,
} from '../../api/partner'
import { usePartnerAuthStore } from '../../store/partnerAuthStore'
import companyLogo from '../../assets/images/logo.png'
import payQrCode from '../../assets/images/payqr.png'

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

export const numberToIndianWords = (num) => {
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
  AE: '🇦🇪',
  US: '🇺🇸',
  GB: '🇬🇧',
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
  'Direct Enquiry',
  'Other',
]

const STATUS_OPTIONS = [
  'Attended',
  'Quotation Sent',
  'Pursuing to Purchase',
  'Order Closed',
  'Not Interested',
]

const STATUS_STYLES = {
  'Attended': 'bg-sky-500/15 text-sky-400 border-sky-500/30 ring-sky-500/20',
  'Quotation Sent': 'bg-amber-500/15 text-amber-400 border-amber-500/30 ring-amber-500/20',
  'Pursuing to Purchase': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 ring-indigo-500/20',
  'Order Closed': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 ring-emerald-500/20',
  'Not Interested': 'bg-rose-500/15 text-rose-400 border-rose-500/30 ring-rose-500/20',
}

const STATUS_ICONS = {
  'Attended': '👋',
  'Quotation Sent': '📨',
  'Pursuing to Purchase': '🎯',
  'Order Closed': '🎉',
  'Not Interested': '⏸️',
}

export default function PartnerGeneralClients() {
  const { partnerUser: user } = usePartnerAuthStore()
  const partnerName = user?.name || user?.full_name || user?.partner_id || 'Partner'

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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Add / Edit Client Form State
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [showEditClientModal, setShowEditClientModal] = useState(false)
  const [showViewClientModal, setShowViewClientModal] = useState(false)
  const [viewingClient, setViewingClient] = useState(null)
  const [editingClientId, setEditingClientId] = useState(null)
  const [dossierTab, setDossierTab] = useState('profile')

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
    gst_type: 'Intra-State',
    gstin: '',
    lead_source: 'Direct Enquiry',
    referred_by: 'Direct / None',
    sold_by_name: partnerName,
    branch_name: 'Head Office (Gurugram)',
    status: 'Attended',
    next_followup_date: '',
    software_requirements: '',
    selected_services: [],
  }

  const [clientForm, setClientForm] = useState(initialClientForm)

  // ============================================================
  // 2. GENERAL SERVICES CATALOG STATE
  // ============================================================
  const [generalServices, setGeneralServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
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

  // Manual Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentQuotation, setPaymentQuotation] = useState(null)
  const [paymentForm, setPaymentForm] = useState({
    payment_amount: '',
    payment_date: new Date().toISOString().substring(0, 10),
    payment_mode: 'Bank Transfer',
    transaction_reference: '',
    remarks: 'Full payment received',
  })

  // ============================================================
  // 3. QUOTATION BUILDER STATE
  // ============================================================
  const [selectedGenClient, setSelectedGenClient] = useState(null)
  const [showQuotationBuilder, setShowQuotationBuilder] = useState(false)
  const [sidebarServiceSearch, setSidebarServiceSearch] = useState('')
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
  const [taxes, setTaxes] = useState([
    { id: 1, country_code: 'IN', country_name: 'India', tax_name: 'GST', tax_rate: 18.0, currency: 'INR', currency_symbol: '₹', tax_id_label: 'GSTIN' },
    { id: 2, country_code: 'NP', country_name: 'Nepal', tax_name: 'VAT', tax_rate: 13.0, currency: 'NPR', currency_symbol: 'Rs', tax_id_label: 'PAN/VAT No' },
    { id: 3, country_code: 'BT', country_name: 'Bhutan', tax_name: 'Sales Tax', tax_rate: 7.0, currency: 'BTN', currency_symbol: 'Nu', tax_id_label: 'Tax No' },
  ])
  const [editingTax, setEditingTax] = useState(null)
  const [taxForm, setTaxForm] = useState({ tax_name: '', tax_rate: '' })

  // Load Primary Initial Data
  useEffect(() => {
    fetchGeneralClientsList()
    fetchGeneralServicesList()
  }, [])

  // Lazy Load Secondary Catalogs only when relevant tabs are accessed
  useEffect(() => {
    if (activeTab === 'pricing') {
      fetchCountryTaxesList()
    }
  }, [activeTab])

  // Fetch General Clients
  const fetchGeneralClientsList = async () => {
    setLoadingGenClients(true)
    try {
      const res = await getPartnerGeneralClients()
      const rawData = res.data?.data || res.data?.clients || (Array.isArray(res.data) ? res.data : [])
      setGeneralClients(Array.isArray(rawData) ? rawData : [])
    } catch (err) {
      console.error('Error fetching general clients:', err)
      setErrorMsg('Failed to load general clients.')
    } finally {
      setLoadingGenClients(false)
    }
  }

  // Fetch General Services with complete normalization
  const fetchGeneralServicesList = async () => {
    setLoadingServices(true)
    try {
      const res = await getPartnerGeneralServices()
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
      if (result.success && result.data) {
        setTaxes(result.data)
      }
    } catch (err) {
      console.warn('Could not load dynamic country taxes, using defaults:', err)
    }
  }

  // Multi-Select Helpers
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

  // Handlers
  const handleOpenAddClientModal = () => {
    setClientForm({
      ...initialClientForm,
      sold_by_name: partnerName,
    })
    setShowAddClientModal(true)
  }

  const handleCreateGeneralClient = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setMessage(null)

    if (!clientForm.client_name.trim()) {
      setErrorMsg('Client Name is required.')
      setLoading(false)
      return
    }

    const payload = {
      ...clientForm,
      sold_by_name: clientForm.sold_by_name || partnerName,
      software_requirements: (clientForm.selected_services || []).join(', ') || clientForm.software_requirements,
    }

    try {
      const res = await createPartnerGeneralClient(payload)
      if (res.data?.success || res.status === 200 || res.status === 201) {
        // Mirror to Leads table so it reflects in both panels
        try {
          await createPartnerLead({
            client_name: payload.client_name,
            company_name: payload.company_name || payload.client_name,
            client_phone: payload.contact_number,
            client_alternate_phone: payload.alt_contact_number || null,
            client_email: payload.email || '',
            address: payload.address || '',
            city: payload.district || '',
            state: payload.state || '',
            pin_code: payload.pin_code || '',
            country: payload.country_code === 'IN' ? 'India' : (payload.country_code || 'India'),
            country_code: payload.country_code || 'IN',
            lead_source: payload.lead_source || 'Direct Enquiry',
            lead_status: 'new',
            lead_priority: 'medium',
            category_id: 'general_client',
            category_name: 'General Client',
            product_name: payload.software_requirements || 'General Client Services',
            product_interest: payload.software_requirements || 'General Client Services',
            software_requirements: payload.software_requirements,
            selected_services: payload.selected_services,
            gst_type: payload.gst_type,
            gstin: payload.gstin,
            expected_close_date: payload.next_followup_date || null,
            follow_up_date: payload.next_followup_date || null,
            notes: `[Created from General Client Panel] Deliverables: ${payload.software_requirements || 'None'}`,
          })
        } catch (leadSyncErr) {
          console.warn('Could not mirror general client into leads:', leadSyncErr)
        }

        setMessage(`✅ General Client "${payload.client_name}" created successfully and reflected in both panels!`)
        setShowAddClientModal(false)
        setClientForm(initialClientForm)
        fetchGeneralClientsList()
      } else {
        setErrorMsg(res.data?.message || 'Failed to create general client')
      }
    } catch (err) {
      setErrorMsg('Error creating client: ' + (err.response?.data?.message || err.message))
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
      contact_person: client.contact_person || '',
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
      lead_source: client.lead_source || 'Direct Enquiry',
      referred_by: client.referred_by || 'Direct / None',
      sold_by_name: client.sold_by_name || client.sold_by || partnerName,
      branch_name: client.branch_name || 'Head Office (Gurugram)',
      status: client.status || 'Attended',
      next_followup_date: client.next_followup_date ? client.next_followup_date.substring(0, 10) : '',
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
      const res = await updatePartnerGeneralClient(editingClientId, payload)
      if (res.data?.success || res.status === 200) {
        setMessage(`✅ Client "${payload.client_name}" updated successfully!`)
        setShowEditClientModal(false)
        fetchGeneralClientsList()
      } else {
        setErrorMsg(res.data?.message || 'Failed to update client')
      }
    } catch (err) {
      setErrorMsg('Error updating client: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleInlineStatusChange = async (client, newStatus) => {
    try {
      const res = await updatePartnerGeneralClient(client.id, newStatus)
      if (res.data?.success || res.status === 200) {
        setMessage(`Status updated to "${newStatus}" for client ${client.client_name}`)
        setGeneralClients((prev) =>
          prev.map((c) => (c.id === client.id ? { ...c, status: newStatus } : c))
        )
      } else {
        setErrorMsg('Failed to update status')
      }
    } catch (err) {
      setErrorMsg('Error updating status: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleOpenViewClientModal = (client) => {
    setViewingClient(client)
    setDossierTab('profile')
    setShowViewClientModal(true)
  }

  const handleDeleteGeneralClient = async (client) => {
    if (!window.confirm(`Are you sure you want to remove client "${client.client_name}" (${client.client_id})?`)) return

    setLoading(true)
    try {
      const res = await deletePartnerGeneralClient(client.id)
      if (res.data?.success || res.status === 200) {
        setMessage(`✅ Client "${client.client_name}" removed.`)
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

  // Services Handlers
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
      hsn: service.hsn || service.hsn_code || '998314',
      unit: service.unit || 'Unit',
      selling_price: service.selling_price || service.price || '',
      category: service.category || 'Web Development',
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
        const res = await updatePartnerGeneralService(editingServiceId, serviceForm)
        if (res.data?.success || res.status === 200) {
          setMessage(`✅ Service "${serviceForm.name}" updated successfully!`)
          setShowAddServiceModal(false)
          fetchGeneralServicesList()
        } else {
          setErrorMsg(res.data?.message || 'Failed to update service')
        }
      } else {
        const res = await createPartnerGeneralService(serviceForm)
        if (res.data?.success || res.status === 200 || res.status === 201) {
          setMessage(`✅ New service "${serviceForm.name}" added to catalog!`)
          setShowAddServiceModal(false)
          fetchGeneralServicesList()
        } else {
          setErrorMsg(res.data?.message || 'Failed to add service')
        }
      }
    } catch (err) {
      setErrorMsg('Error saving service: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteService = async (service) => {
    if (!window.confirm(`Are you sure you want to remove service "${service.name}" from catalog?`)) return
    setLoading(true)
    try {
      const res = await deletePartnerGeneralService(service.id)
      if (res.data?.success || res.status === 200) {
        setMessage(`✅ Service "${service.name}" removed from catalog.`)
        fetchGeneralServicesList()
      } else {
        setErrorMsg(res.data?.message || 'Failed to delete service.')
      }
    } catch (err) {
      setErrorMsg('Error deleting service: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // Taxes Handlers
  const handleEditTaxClick = (tax) => {
    setEditingTax(tax)
    setTaxForm({ tax_name: tax.tax_name, tax_rate: tax.tax_rate })
  }

  const handleUpdateTax = async (e) => {
    e.preventDefault()
    if (!editingTax) return
    setLoading(true)
    try {
      await updateCountryTax(editingTax.id, taxForm)
      setMessage(`✅ Tax rate for ${editingTax.country_name} updated to ${taxForm.tax_rate}%`)
      setEditingTax(null)
      fetchCountryTaxesList()
    } catch (err) {
      setErrorMsg('Failed to update tax: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // Quotation Builder Logic
  const handleOpenQuotationBuilder = (client) => {
    setSelectedGenClient(client)
    setShowQuotationBuilder(true)
    setActiveTab('show_clients')

    const qDate = new Date().toISOString().substring(0, 10)
    const randomSuffix = Math.floor(100 + Math.random() * 900)
    const formattedDate = qDate.replace(/-/g, '')
    const autoQuotationNum = `AIM-${formattedDate}-${randomSuffix}`

    setQuotationForm({
      quotation_date: qDate,
      quotation_number: autoQuotationNum,
      po_number: '',
      po_date: '',
      discount_description: 'Corporate Consideration',
      payment_terms: 'Due on Receipt',
      gst_type: client.gst_type || 'Intra-State',
      gstin: client.gstin || '',
      anexture: 'NO',
    })

    const prefilledItems = []
    const rawRequirements = client.software_requirements
      ? client.software_requirements.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    rawRequirements.forEach((reqName, idx) => {
      const matchedSrv = generalServices.find((s) => s.name.toLowerCase() === reqName.toLowerCase())
      if (matchedSrv) {
        prefilledItems.push({
          id: Date.now() + idx,
          product_id: matchedSrv.id,
          product_name: matchedSrv.name,
          hsn: matchedSrv.hsn,
          qty: 1,
          unit: matchedSrv.unit,
          selling_price: matchedSrv.selling_price,
          discount_percentage: 0,
          description: matchedSrv.description || matchedSrv.name,
        })
      } else {
        prefilledItems.push({
          id: Date.now() + idx,
          product_id: null,
          product_name: reqName,
          hsn: '998314',
          qty: 1,
          unit: 'Unit',
          selling_price: 15000,
          discount_percentage: 0,
          description: `Custom deliverable for ${reqName}`,
        })
      }
    })

    if (prefilledItems.length === 0 && generalServices.length > 0) {
      const defaultSrv = generalServices[0]
      prefilledItems.push({
        id: Date.now(),
        product_id: defaultSrv.id,
        product_name: defaultSrv.name,
        hsn: defaultSrv.hsn,
        qty: 1,
        unit: defaultSrv.unit,
        selling_price: defaultSrv.selling_price,
        discount_percentage: 0,
        description: defaultSrv.description || defaultSrv.name,
      })
    }

    setQuotationItems(prefilledItems)
  }

  const handleAddQuotationItemFromCatalog = (service) => {
    const newItem = {
      id: Date.now() + Math.random(),
      product_id: service.id,
      product_name: service.name,
      hsn: service.hsn,
      qty: 1,
      unit: service.unit,
      selling_price: service.selling_price,
      discount_percentage: 0,
      description: service.description || service.name,
    }
    setQuotationItems((prev) => [...prev, newItem])
    setMessage(`Added "${service.name}" to quotation items.`)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAddCustomQuotationItem = () => {
    const newItem = {
      id: Date.now() + Math.random(),
      product_id: null,
      product_name: '',
      hsn: '998314',
      qty: 1,
      unit: 'Unit',
      selling_price: 0,
      discount_percentage: 0,
      description: '',
    }
    setQuotationItems((prev) => [...prev, newItem])
  }

  const handleUpdateQuotationItem = (index, field, value) => {
    setQuotationItems((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: value,
      }
      return updated
    })
  }

  const handleRemoveQuotationItem = (index) => {
    setQuotationItems((prev) => prev.filter((_, i) => i !== index))
  }

  // Totals Computation
  const quotationFinancials = useMemo(() => {
    let subtotal = 0
    quotationItems.forEach((item) => {
      const qty = parseFloat(item.qty) || 0
      const price = parseFloat(item.selling_price) || 0
      const disc = parseFloat(item.discount_percentage) || 0
      const discountedUnitPrice = price * (1 - disc / 100)
      subtotal += qty * discountedUnitPrice
    })

    subtotal = Math.round(subtotal * 100) / 100

    let cgst = 0, sgst = 0, igst = 0, taxTotal = 0
    const country = selectedGenClient?.country_code || 'IN'

    if (country === 'IN') {
      if (quotationForm.gst_type === 'Intra-State') {
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
    const amountInWords = numberToIndianWords(grandTotal)

    return {
      subtotal,
      cgst,
      sgst,
      igst,
      taxTotal,
      grandTotal,
      amountInWords,
    }
  }, [quotationItems, quotationForm.gst_type, selectedGenClient])

  // Save Quotation Handler
  const handleSaveQuotation = async (shouldSendEmail = false) => {
    if (!selectedGenClient) return
    if (quotationItems.length === 0) {
      setErrorMsg('Please add at least one line item to the quotation.')
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setMessage(null)

    const payload = {
      ...quotationForm,
      subtotal: quotationFinancials.subtotal,
      tax_amount: quotationFinancials.taxTotal,
      cgst: quotationFinancials.cgst,
      sgst: quotationFinancials.sgst,
      igst: quotationFinancials.igst,
      grand_total: quotationFinancials.grandTotal,
      items: quotationItems.map((it) => ({
        product_id: it.product_id,
        product_name: it.product_name,
        hsn: it.hsn,
        qty: Number(it.qty) || 1,
        unit: it.unit,
        selling_price: Number(it.selling_price) || 0,
        discount_percentage: Number(it.discount_percentage) || 0,
        description: it.description,
      })),
    }

    try {
      const res = await createPartnerQuotation(selectedGenClient.id, payload)
      if (res.data?.success || res.status === 200 || res.status === 201) {
        const quotationData = res.data?.data || res.data?.quotation || {
          ...payload,
          id: res.data?.id || Date.now(),
        }

        let paymentUrl = quotationData.payment_url || ''

        if (shouldSendEmail && quotationData.id) {
          try {
            const emailRes = await sendPartnerQuotationEmail(quotationData.id)
            if (emailRes.data?.payment_url) {
              paymentUrl = emailRes.data.payment_url
            }
            setMessage(`✅ Quotation saved & sent to ${selectedGenClient.email || 'client'} with Razorpay payment link!`)
          } catch (e) {
            console.warn('Email sending notice:', e)
            setMessage('✅ Quotation saved successfully!')
          }
        } else {
          setMessage('✅ Quotation created successfully!')
        }

        handleOpenQuotationDoc(
          {
            ...quotationData,
            payment_url: paymentUrl,
          },
          selectedGenClient
        )

        setShowQuotationBuilder(false)
        fetchGeneralClientsList()
      } else {
        setErrorMsg(res.data?.message || 'Failed to save quotation')
      }
    } catch (err) {
      setErrorMsg('Error creating quotation: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // Open Document Viewer
  const handleOpenQuotationDoc = (quotation, client) => {
    const fullClient = client || selectedGenClient || {}
    const items = quotation.items || quotationItems || []

    const subtotal = Number(quotation.subtotal || quotationFinancials.subtotal || 0)
    const cgst = Number(quotation.cgst || quotationFinancials.cgst || 0)
    const sgst = Number(quotation.sgst || quotationFinancials.sgst || 0)
    const igst = Number(quotation.igst || quotationFinancials.igst || 0)
    const grandTotal = Number(quotation.grand_total || quotation.total_amount || quotation.grandTotal || quotationFinancials.grandTotal || 0)
    const amountInWords = numberToIndianWords(grandTotal)

    const targetUuid = quotation.uuid || `quotation-${quotation.id}`
    const payUrl = quotation.payment_url || `${window.location.origin}/general-quotation-pay.html?uuid=${targetUuid}`

    setViewingQuotationDoc({
      ...quotation,
      client: fullClient,
      items,
      subtotal,
      cgst,
      sgst,
      igst,
      tax_total: (cgst + sgst + igst) || (quotation.tax_total || 0),
      grand_total: grandTotal,
      grandTotal,
      amountInWords,
      payment_url: payUrl,
    })
    setShowQuotationDocModal(true)
  }

  // Handle Quotation High-Fidelity Print / Save as PDF
  const handlePrintQuotation = () => {
    const printElement = document.getElementById('quotation-document-paper')
    if (!printElement) {
      window.print()
      return
    }

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0px'
    iframe.style.height = '0px'
    iframe.style.border = '0px'
    iframe.setAttribute('title', 'Quotation Print Preview')
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow.document
    
    // Copy all style sheets and stylesheets from the main document to ensure exact Tailwind rendering
    const headElements = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(node => node.outerHTML)
      .join('\n')

    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title></title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          ${headElements}
          <style>
            @page {
              size: A4 portrait;
              margin: 0 !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background-color: #ffffff !important;
              background: #ffffff !important;
              font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              color: #0f172a !important;
              width: 100% !important;
            }
            #quotation-document-paper {
              box-shadow: none !important;
              border: none !important;
              padding: 6mm 10mm !important;
              margin: 0 auto !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            /* Responsive spacing override for print so single-page quotation fits on 1 page */
            #quotation-document-paper.space-y-5 > * + *,
            #quotation-document-paper.space-y-6 > * + *,
            #quotation-document-paper.space-y-7 > * + *,
            #quotation-document-paper > div + div {
              margin-top: 12px !important;
            }
            .quotation-terms-signature,
            .quotation-signature-block,
            .quotation-financials-block {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            table {
              border-collapse: collapse !important;
            }
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            th, td {
              border-color: #cbd5e1 !important;
            }
          </style>
        </head>
        <body class="bg-white">
          ${printElement.outerHTML}
        </body>
      </html>
    `)
    doc.close()

    const triggerPrint = () => {
      try {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
      } catch (err) {
        console.error('Print error:', err)
      } finally {
        setTimeout(() => {
          try {
            document.body.removeChild(iframe)
          } catch (e) {
            // ignore
          }
        }, 1500)
      }
    }

    const images = iframe.contentWindow.document.images
    let loaded = 0
    const total = images ? images.length : 0

    if (total === 0) {
      setTimeout(triggerPrint, 200)
    } else {
      let triggered = false
      const onImgDone = () => {
        loaded++
        if (loaded >= total && !triggered) {
          triggered = true
          setTimeout(triggerPrint, 200)
        }
      }
      for (let i = 0; i < total; i++) {
        if (images[i].complete) {
          onImgDone()
        } else {
          images[i].onload = onImgDone
          images[i].onerror = onImgDone
        }
      }
      setTimeout(() => {
        if (!triggered) {
          triggered = true
          triggerPrint()
        }
      }, 1000)
    }
  }

  // View Client Quotations
  const handleViewClientQuotations = async (client) => {
    setSelectedGenClient(client)
    try {
      const res = await getPartnerGeneralClientById(client.id)
      const data = res.data?.data || res.data?.client || client
      const quotes = data.quotations || client.quotations || []
      setSelectedClientQuotations(quotes)
      setShowQuotationsListModal(true)
    } catch (err) {
      setSelectedClientQuotations(client.quotations || [])
      setShowQuotationsListModal(true)
    }
  }

  // Send Single Quotation Email from List
  const handleSendSingleQuotationEmail = async (quotation) => {
    setLoading(true)
    try {
      const res = await sendPartnerQuotationEmail(quotation.id)
      if (res.data?.success || res.status === 200) {
        setMessage(`✅ Email and Razorpay payment link sent to client for Quotation #${quotation.quotation_number}`)
      } else {
        setErrorMsg(res.data?.message || 'Failed to send email.')
      }
    } catch (err) {
      setErrorMsg('Error sending email: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // Open Record Manual Payment Modal
  const handleOpenPaymentModal = (quotation) => {
    setPaymentQuotation(quotation)
    setPaymentForm({
      payment_amount: quotation.grand_total || quotation.total_amount || '',
      payment_date: new Date().toISOString().substring(0, 10),
      payment_mode: 'Bank Transfer',
      transaction_reference: '',
      remarks: 'Full payment received',
    })
    setShowPaymentModal(true)
  }

  const handleRecordPayment = async (e) => {
    e.preventDefault()
    if (!paymentQuotation) return
    setLoading(true)
    try {
      const res = await recordPartnerQuotationPayment(paymentQuotation.id, paymentForm)
      if (res.data?.success || res.status === 200) {
        setMessage(`✅ Payment of ₹${paymentForm.payment_amount} recorded successfully for Quotation #${paymentQuotation.quotation_number}`)
        setShowPaymentModal(false)
        fetchGeneralClientsList()
      } else {
        setErrorMsg(res.data?.message || 'Failed to record payment.')
      }
    } catch (err) {
      setErrorMsg('Error recording payment: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // Filtered Clients Computation
  const filteredGeneralClients = useMemo(() => {
    return generalClients.filter((c) => {
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter

      if (!matchesStatus) return false
      if (!genClientSearch.trim()) return true

      const q = genClientSearch.toLowerCase()
      const matchesSearch =
        (c.client_name && c.client_name.toLowerCase().includes(q)) ||
        (c.client_id && c.client_id.toLowerCase().includes(q)) ||
        (c.company_name && c.company_name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.state && c.state.toLowerCase().includes(q)) ||
        (c.district && c.district.toLowerCase().includes(q)) ||
        (c.sold_by_name && c.sold_by_name.toLowerCase().includes(q)) ||
        (c.branch_name && c.branch_name.toLowerCase().includes(q)) ||
        (c.software_requirements && c.software_requirements.toLowerCase().includes(q)) ||
        (c.contact_number && c.contact_number.toLowerCase().includes(q))

      return matchesSearch
    })
  }, [generalClients, statusFilter, genClientSearch])

  // Pagination Logic
  const totalClientsCount = filteredGeneralClients.length
  const totalPages = Math.max(1, Math.ceil(totalClientsCount / pageSize))

  const paginatedGeneralClients = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize
    return filteredGeneralClients.slice(startIdx, startIdx + pageSize)
  }, [filteredGeneralClients, currentPage, pageSize])

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
        <title>General Clients | Partner Portal</title>
      </Helmet>

      <div className="space-y-6 select-none text-gray-300 animate-fade-in font-sans pb-16">
        {/* Page Header */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px] border-b border-white/5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>General Clients Directory</span>
            </h1>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              Client Management, Service Catalog, Quotation Builder, and Razorpay Invoicing Portal.
            </p>
          </div>

          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-base font-extrabold text-white">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-gray-400">Financial Year: 2026-2027</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddServiceModal}
              className="px-3.5 py-2 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl text-xs font-bold text-purple-300 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>📦</span>
              <span>+ Add Service Entry</span>
            </button>

            <button
              onClick={() => {
                fetchGeneralClientsList()
                fetchGeneralServicesList()
              }}
              className="px-4 py-2 border border-white/10 bg-[#1a1d2b] hover:bg-[#22273a] rounded-xl text-xs font-bold text-gray-200 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Global Alert Banners */}
        {message && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-emerald-400 hover:text-white font-extrabold text-sm cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white font-extrabold text-sm cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Main Card Container with Partner Portal Dark Theme */}
        <div className="bg-[#151722] rounded-3xl border border-white/5 shadow-2xl p-6">
          {/* Top Tabs Switcher */}
          <div className="flex flex-wrap items-center gap-1 border-b border-white/10 pb-3 mb-6">
            {/* 1. Show Clients Tab */}
            <button
              onClick={() => {
                setActiveTab('show_clients')
                setShowQuotationBuilder(false)
              }}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'show_clients'
                  ? 'bg-[#1e2337] border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-md'
                  : 'bg-[#1a1d2b]/60 hover:bg-[#1a1d2b] text-gray-400 border-transparent hover:text-white'
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
                  ? 'bg-[#1e2337] border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-md'
                  : 'bg-[#1a1d2b]/60 hover:bg-[#1a1d2b] text-gray-400 border-transparent hover:text-white'
              }`}
            >
              📦 Service Catalog ({generalServices.length})
            </button>

            {/* 3. Country Taxes Tab */}
            <button
              onClick={() => {
                setActiveTab('pricing')
                setShowQuotationBuilder(false)
              }}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'pricing'
                  ? 'bg-[#1e2337] border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-md'
                  : 'bg-[#1a1d2b]/60 hover:bg-[#1a1d2b] text-gray-400 border-transparent hover:text-white'
              }`}
            >
              🌐 Country Taxes & Pricing
            </button>

            {/* 4. Follow Up Tab */}
            <button
              onClick={() => {
                setActiveTab('follow_up')
                setShowQuotationBuilder(false)
              }}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'follow_up'
                  ? 'bg-[#1e2337] border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-md'
                  : 'bg-[#1a1d2b]/60 hover:bg-[#1a1d2b] text-gray-400 border-transparent hover:text-white'
              }`}
            >
              📞 Follow Up Schedule
            </button>

            {/* 5. Due Payment Tab */}
            <button
              onClick={() => {
                setActiveTab('due_payment')
                setShowQuotationBuilder(false)
              }}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'due_payment'
                  ? 'bg-[#1e2337] border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-md'
                  : 'bg-[#1a1d2b]/60 hover:bg-[#1a1d2b] text-gray-400 border-transparent hover:text-white'
              }`}
            >
              ⚠️ Due Payment
            </button>

            {/* 6. Payment Report Tab */}
            <button
              onClick={() => {
                setActiveTab('payment_report')
                setShowQuotationBuilder(false)
              }}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer border-t-2 ${
                activeTab === 'payment_report'
                  ? 'bg-[#1e2337] border-[#38b34a] text-[#38b34a] -mb-[13px] z-10 shadow-md'
                  : 'bg-[#1a1d2b]/60 hover:bg-[#1a1d2b] text-gray-400 border-transparent hover:text-white'
              }`}
            >
              📑 Payment Report
            </button>
          </div>

          {/* TAB 1: SHOW CLIENTS */}
          {activeTab === 'show_clients' && (
            <div>
              {!showQuotationBuilder ? (
                <div className="space-y-6 animate-fade-in">
                  {/* Action Bar & Stats Summary */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>Directory: For General Client</span>
                      </h2>
                      <p className="text-xs text-gray-400 font-medium">
                        Manage general client profiles, service requirements, executive assignments, and generate official quotations.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleOpenAddServiceModal}
                        className="px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-bold rounded-xl border border-purple-500/30 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>📦 + Add Service</span>
                      </button>
                      <button
                        onClick={handleOpenAddClientModal}
                        className="px-4 py-2 bg-[#38b34a] hover:bg-[#38b34a]/85 text-black text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>➕ Add Client</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-[#1a1d2b] to-[#1e2235] rounded-2xl p-4 border border-blue-500/20 shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider block">Total Clients</span>
                        <span className="text-2xl font-black text-white mt-1 block">
                          {loadingGenClients ? '...' : generalClients.length}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-500/20">
                        👥
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#1a1d2b] to-[#1e2235] rounded-2xl p-4 border border-purple-500/20 shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block">Service Catalog</span>
                        <span className="text-2xl font-black text-purple-300 mt-1 block">
                          {generalServices.length} Services
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/20">
                        📦
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#1a1d2b] to-[#1e2235] rounded-2xl p-4 border border-amber-500/20 shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">Quotations Built</span>
                        <span className="text-2xl font-black text-amber-300 mt-1 block">
                          {generalClients.reduce((acc, c) => acc + (c.quotations_count || c.quotations?.length || 0), 0)}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/20">
                        📝
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#1a1d2b] to-[#1e2235] rounded-2xl p-4 border border-emerald-500/20 shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">Closed Orders</span>
                        <span className="text-2xl font-black text-emerald-300 mt-1 block">
                          {generalClients.filter((c) => c.status === 'Order Closed').length} Closed
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/20">
                        🎉
                      </div>
                    </div>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                      <input
                        type="text"
                        placeholder="Search by Client Name, ID, Company, Service, Executive, Branch..."
                        value={genClientSearch}
                        onChange={(e) => setGenClientSearch(e.target.value)}
                        className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-gray-400 whitespace-nowrap">Filter Status:</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-200 focus:outline-none focus:border-[#38b34a]"
                      >
                        <option value="All">All Statuses ({generalClients.length})</option>
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st} className="bg-[#151722] text-gray-200">
                            {st} ({generalClients.filter((c) => c.status === st).length})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* General Clients Table */}
                  <div className="bg-[#151722] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                    <div className="bg-[#1a1e2d]/80 px-6 py-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2">
                        <span>📋 For General Client</span>
                        <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                          {totalClientsCount} Total Found
                        </span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-gray-400">
                          Showing {totalClientsCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalClientsCount)} of {totalClientsCount}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                          <span>Rows:</span>
                          <select
                            value={pageSize}
                            onChange={(e) => {
                              setPageSize(Number(e.target.value))
                              setCurrentPage(1)
                            }}
                            className="bg-[#1a1e2d] border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-gray-200 focus:outline-none"
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
                          <tr className="border-b border-white/5 bg-[#131520] text-gray-400 font-extrabold uppercase tracking-wider text-[11px]">
                            <th className="px-5 py-3.5">
                              <div>Client ID</div>
                              <div className="text-[9px] text-gray-500 font-semibold normal-case">Reg Date</div>
                            </th>
                            <th className="px-5 py-3.5">
                              <div>Client Details</div>
                              <div className="text-[9px] text-gray-500 font-semibold normal-case">Contact Person / Info</div>
                            </th>
                            <th className="px-5 py-3.5">
                              <div>Service Details</div>
                              <div className="text-[9px] text-gray-500 font-semibold normal-case">Requested Services</div>
                            </th>
                            <th className="px-5 py-3.5">
                              <div>Sold By</div>
                              <div className="text-[9px] text-gray-500 font-semibold normal-case">Executive / Branch</div>
                            </th>
                            <th className="px-5 py-3.5 text-center">
                              <div>Status</div>
                              <div className="text-[9px] text-gray-500 font-semibold normal-case">5 Lifecycle ENUMs</div>
                            </th>
                            <th className="px-5 py-3.5 text-center">
                              <div>Next Follow-up Date</div>
                              <div className="text-[9px] text-gray-500 font-semibold normal-case">Schedule Badge</div>
                            </th>
                            <th className="px-5 py-3.5 text-center">
                              <div>Action</div>
                              <div className="text-[9px] text-gray-500 font-semibold normal-case">View / Edit / Quote</div>
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5 text-gray-300">
                          {loadingGenClients ? (
                            <tr>
                              <td colSpan="7" className="text-center py-12 font-bold text-gray-400">
                                <span className="inline-block animate-spin mr-2">🔄</span> Loading General Clients...
                              </td>
                            </tr>
                          ) : paginatedGeneralClients.length > 0 ? (
                            paginatedGeneralClients.map((c) => {
                              const servicesList = c.software_requirements
                                ? c.software_requirements.split(',').map((s) => s.trim()).filter(Boolean)
                                : []

                              return (
                                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                                  {/* Column 1: Client ID & Reg Date */}
                                  <td className="px-5 py-4 align-top">
                                    <span className="font-mono font-extrabold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 block w-fit text-[11px]">
                                      {c.client_id || `AIMGC${c.id}`}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-medium block mt-1.5 flex items-center gap-1">
                                      📅 {formatDateDisplay(c.reg_date || c.created_at || '2026-08-10')}
                                    </span>
                                  </td>

                                  {/* Column 2: Client Details */}
                                  <td className="px-5 py-4 align-top max-w-[200px]">
                                    <p className="font-extrabold text-white text-sm leading-snug">
                                      {c.company_name || c.client_name}
                                    </p>
                                    {(c.contact_person || c.client_name) && (
                                      <p className="text-[11px] text-gray-400 font-medium">
                                        👤 {c.contact_person || c.client_name}
                                      </p>
                                    )}
                                    <div className="text-[10px] text-gray-500 mt-1 space-y-0.5">
                                      {c.contact_number && <p>📞 {c.contact_number}</p>}
                                      {c.email && <p>✉️ {c.email}</p>}
                                    </div>
                                  </td>

                                  {/* Column 3: Service Details */}
                                  <td className="px-5 py-4 align-top max-w-[240px]">
                                    {servicesList.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {servicesList.map((srv, sIdx) => (
                                          <span
                                            key={sIdx}
                                            className="px-2 py-0.5 bg-[#1a1e2d] text-gray-300 rounded-md text-[10px] font-semibold border border-white/5"
                                            title={srv}
                                          >
                                            {srv}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-500 italic text-[11px]">No specific service noted</span>
                                    )}
                                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                      <span>{countryFlags[c.country_code] || '🌐'} {c.country_code || 'IN'}</span>
                                      <span>·</span>
                                      <span>{c.gst_type || 'Intra-State'}</span>
                                    </div>
                                  </td>

                                  {/* Column 4: Sold By */}
                                  <td className="px-5 py-4 align-top">
                                    <p className="font-bold text-gray-200 text-[12px] flex items-center gap-1">
                                      <span>👤</span>
                                      <span>{c.sold_by_name || c.sold_by || partnerName}</span>
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium mt-1 flex items-center gap-1">
                                      <span>🏛️</span>
                                      <span>{c.branch_name || 'Head Office (Gurugram)'}</span>
                                    </p>
                                    <span className="text-[9px] text-gray-500 block mt-0.5">
                                      Source: {c.lead_source || 'Direct Enquiry'}
                                    </span>
                                  </td>

                                  {/* Column 5: Status */}
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
                                          <option key={st} value={st} className="bg-[#151722] text-gray-200 normal-case font-bold">
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
                                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold inline-flex items-center gap-1 shadow-sm">
                                        <span>📅</span>
                                        <span>{formatDateDisplay(c.next_followup_date)}</span>
                                      </span>
                                    ) : (
                                      <span className="text-gray-500 text-[10px] italic">Not scheduled</span>
                                    )}
                                  </td>

                                  {/* Column 7: Action */}
                                  <td className="px-5 py-4 align-top text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => handleOpenViewClientModal(c)}
                                        title="View Client Dossier"
                                        className="p-2 rounded-xl border border-white/10 bg-[#1a1e2d] hover:border-blue-500 hover:text-blue-400 text-gray-300 transition-all font-bold cursor-pointer flex items-center justify-center shadow-sm"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                      </button>

                                      <button
                                        onClick={() => handleOpenEditClientModal(c)}
                                        title="Edit Client"
                                        className="p-2 rounded-xl border border-white/10 bg-[#1a1e2d] hover:border-amber-500 hover:text-amber-400 text-gray-300 transition-all font-bold cursor-pointer flex items-center justify-center shadow-sm"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>

                                      <button
                                        onClick={() => handleOpenQuotationBuilder(c)}
                                        title="Create Quotation"
                                        className="p-2 rounded-xl border border-[#38b34a]/30 bg-[#38b34a]/10 text-[#38b34a] hover:bg-[#38b34a] hover:text-black transition-all font-bold cursor-pointer flex items-center justify-center shadow-sm"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      </button>

                                      <button
                                        onClick={() => handleDeleteGeneralClient(c)}
                                        title="Remove Client"
                                        className="p-2 rounded-xl border border-white/10 bg-[#1a1e2d] hover:border-rose-500 hover:text-rose-400 text-gray-400 transition-all font-bold cursor-pointer flex items-center justify-center shadow-sm"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>

                                    <div className="mt-1.5">
                                      <button
                                        onClick={() => handleViewClientQuotations(c)}
                                        className="text-[10px] text-gray-400 hover:text-blue-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
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
                              <td colSpan="7" className="text-center py-16 text-gray-500">
                                <span className="text-4xl block mb-2">📁</span>
                                <p className="font-bold text-sm text-gray-300">No General Clients found matching your criteria</p>
                                <p className="text-xs text-gray-500 mt-1">General clients are added via the unified Add Client flow.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Toolbar */}
                    {totalPages > 1 && (
                      <div className="bg-[#1a1e2d]/60 px-6 py-3.5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <span className="text-gray-400 font-medium">
                          Page <strong className="text-white font-bold">{currentPage}</strong> of <strong className="text-white font-bold">{totalPages}</strong>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#151722] hover:bg-[#202538] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-gray-300 transition-all shadow-sm cursor-pointer"
                            title="First Page"
                          >
                            ⏮️ First
                          </button>
                          <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#151722] hover:bg-[#202538] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-gray-300 transition-all shadow-sm cursor-pointer"
                          >
                            ◀ Prev
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2))
                            .map((p, idx, arr) => (
                              <React.Fragment key={p}>
                                {idx > 0 && arr[idx - 1] !== p - 1 && (
                                  <span className="px-1 text-gray-500">...</span>
                                )}
                                <button
                                  onClick={() => setCurrentPage(p)}
                                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                    currentPage === p
                                      ? 'bg-[#38b34a] text-black shadow-sm font-black'
                                      : 'bg-[#151722] border border-white/10 text-gray-300 hover:bg-[#202538]'
                                  }`}
                                >
                                  {p}
                                </button>
                              </React.Fragment>
                            ))}

                          <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#151722] hover:bg-[#202538] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-gray-300 transition-all shadow-sm cursor-pointer"
                          >
                            Next ▶
                          </button>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#151722] hover:bg-[#202538] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-gray-300 transition-all shadow-sm cursor-pointer"
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
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-white/10 gap-3">
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <span>📄 Dynamic Quotation Builder for General Client</span>
                      </h2>
                      <p className="text-xs text-gray-400 font-medium mt-1">
                        Client: <strong className="text-white">{selectedGenClient?.client_name}</strong> | ID:{' '}
                        <code className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded font-mono font-bold border border-blue-500/20">
                          {selectedGenClient?.client_id || `AIMGC${selectedGenClient?.id}`}
                        </code>{' '}
                        | Executive: <strong className="text-gray-300">{selectedGenClient?.sold_by_name || selectedGenClient?.sold_by || partnerName}</strong> | Branch:{' '}
                        {selectedGenClient?.branch_name || 'Head Office'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowQuotationBuilder(false)}
                      className="px-4 py-2 border border-white/10 hover:bg-[#1a1e2d] text-gray-300 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      ← Back to Show Clients Directory
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (2 Cols): Client Details + Parameters + Line Items */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Box 1: Client Details Summary */}
                      <div className="bg-[#1a1e2d] border border-white/10 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Client Details:</span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Status: {selectedGenClient?.status || 'Attended'}
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 block mb-1">Client Name & ID</label>
                            <input
                              type="text"
                              readOnly
                              value={`${selectedGenClient?.client_name || ''} | ID: ${selectedGenClient?.client_id || ''}`}
                              className="w-full bg-[#151722] border border-white/10 rounded-lg px-3 py-1.5 font-bold text-gray-200"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 block mb-1">Contact Person</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedGenClient?.contact_person || selectedGenClient?.client_name || ''}
                              className="w-full bg-[#151722] border border-white/10 rounded-lg px-3 py-1.5 font-bold text-gray-200"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 block mb-1">Contact No.</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedGenClient?.contact_number || ''}
                              className="w-full bg-[#151722] border border-white/10 rounded-lg px-3 py-1.5 font-bold text-gray-200"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 block mb-1">Email Address</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedGenClient?.email || ''}
                              className="w-full bg-[#151722] border border-white/10 rounded-lg px-3 py-1.5 font-bold text-gray-200"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 block mb-1">Sold By Executive</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedGenClient?.sold_by_name || selectedGenClient?.sold_by || partnerName}
                              className="w-full bg-[#151722] border border-white/10 rounded-lg px-3 py-1.5 font-bold text-gray-200"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 block mb-1">Branch</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedGenClient?.branch_name || 'Head Office (Gurugram)'}
                              className="w-full bg-[#151722] border border-white/10 rounded-lg px-3 py-1.5 font-bold text-gray-200"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Box 2: Quotation Parameters Form */}
                      <div className="bg-[#1a1e2d] border border-white/10 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Quotation Parameters:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 block mb-1">Quotation Date</label>
                            <input
                              type="date"
                              value={quotationForm.quotation_date}
                              onChange={(e) => setQuotationForm({ ...quotationForm, quotation_date: e.target.value })}
                              className="w-full bg-[#151722] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-200 focus:border-[#38b34a]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 block mb-1">Quotation Number</label>
                            <input
                              type="text"
                              value={quotationForm.quotation_number}
                              onChange={(e) => setQuotationForm({ ...quotationForm, quotation_number: e.target.value })}
                              className="w-full bg-[#151722] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-200 focus:border-[#38b34a]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 block mb-1">Payment Terms</label>
                            <select
                              value={quotationForm.payment_terms}
                              onChange={(e) => setQuotationForm({ ...quotationForm, payment_terms: e.target.value })}
                              className="w-full bg-[#151722] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-200 focus:border-[#38b34a]"
                            >
                              <option value="Due on Receipt">Due on Receipt</option>
                              <option value="50% Advance, 50% Delivery">50% Advance, 50% Delivery</option>
                              <option value="Net 15 Days">Net 15 Days</option>
                              <option value="Net 30 Days">Net 30 Days</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-gray-400 block mb-1">P.O. Number</label>
                            <input
                              type="text"
                              placeholder="Optional PO number"
                              value={quotationForm.po_number}
                              onChange={(e) => setQuotationForm({ ...quotationForm, po_number: e.target.value })}
                              className="w-full bg-[#151722] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-200 focus:border-[#38b34a]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 block mb-1">P.O. Date</label>
                            <input
                              type="date"
                              value={quotationForm.po_date}
                              onChange={(e) => setQuotationForm({ ...quotationForm, po_date: e.target.value })}
                              className="w-full bg-[#151722] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-200 focus:border-[#38b34a]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 block mb-1">GST Tax Supply Type</label>
                            <select
                              value={quotationForm.gst_type}
                              onChange={(e) => setQuotationForm({ ...quotationForm, gst_type: e.target.value })}
                              className="w-full bg-[#151722] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-200 focus:border-[#38b34a]"
                            >
                              <option value="Intra-State">Intra-State (CGST 9% + SGST 9%)</option>
                              <option value="Inter-State">Inter-State (IGST 18%)</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-gray-400 block mb-1">Client GSTIN / Tax ID</label>
                            <input
                              type="text"
                              placeholder="e.g. 07AAAAA0000A1Z5"
                              value={quotationForm.gstin}
                              onChange={(e) => setQuotationForm({ ...quotationForm, gstin: e.target.value })}
                              className="w-full bg-[#151722] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-200 focus:border-[#38b34a]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 block mb-1">Discount Description</label>
                            <input
                              type="text"
                              placeholder="Special offer / seasonal discount"
                              value={quotationForm.discount_description}
                              onChange={(e) => setQuotationForm({ ...quotationForm, discount_description: e.target.value })}
                              className="w-full bg-[#151722] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-200 focus:border-[#38b34a]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 block mb-1">Annexure Included?</label>
                            <select
                              value={quotationForm.anexture}
                              onChange={(e) => setQuotationForm({ ...quotationForm, anexture: e.target.value })}
                              className="w-full bg-[#151722] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-200 focus:border-[#38b34a]"
                            >
                              <option value="NO">NO</option>
                              <option value="YES">YES</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Box 3: Line Items Table */}
                      <div className="bg-[#151722] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-4 bg-[#1a1e2d] border-b border-white/10 flex items-center justify-between">
                          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <span>Quotation Line Items</span>
                            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                              {quotationItems.length} Item(s)
                            </span>
                          </h3>
                          <button
                            onClick={handleAddCustomQuotationItem}
                            className="px-3 py-1.5 bg-[#151722] border border-white/10 hover:bg-[#22273a] rounded-xl text-xs font-bold text-gray-200 shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <span>+ Add Custom Line Item</span>
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#131520] border-b border-white/10 text-gray-400 font-extrabold text-[10px] uppercase">
                              <tr>
                                <th className="px-4 py-3">Item / Service Name</th>
                                <th className="px-3 py-3 w-20">HSN/SAC</th>
                                <th className="px-3 py-3 w-16">Qty</th>
                                <th className="px-3 py-3 w-20">Unit</th>
                                <th className="px-3 py-3 w-28">Std Price (₹)</th>
                                <th className="px-3 py-3 w-20">Disc %</th>
                                <th className="px-3 py-3 w-28 text-right">Taxable (₹)</th>
                                <th className="px-3 py-3 w-12 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {quotationItems.length > 0 ? (
                                quotationItems.map((item, idx) => {
                                  const qty = parseFloat(item.qty) || 0
                                  const price = parseFloat(item.selling_price) || 0
                                  const disc = parseFloat(item.discount_percentage) || 0
                                  const lineTotal = qty * price * (1 - disc / 100)

                                  return (
                                    <tr key={item.id || idx} className="hover:bg-white/[0.02]">
                                      <td className="px-4 py-3">
                                        <input
                                          type="text"
                                          value={item.product_name}
                                          onChange={(e) => handleUpdateQuotationItem(idx, 'product_name', e.target.value)}
                                          placeholder="Enter service name..."
                                          className="w-full bg-[#1a1e2d] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-[#38b34a]"
                                        />
                                        <input
                                          type="text"
                                          value={item.description}
                                          onChange={(e) => handleUpdateQuotationItem(idx, 'description', e.target.value)}
                                          placeholder="Description / scope of work..."
                                          className="w-full bg-transparent text-[11px] text-gray-400 mt-1 placeholder-gray-600 focus:outline-none"
                                        />
                                      </td>
                                      <td className="px-3 py-3">
                                        <input
                                          type="text"
                                          value={item.hsn}
                                          onChange={(e) => handleUpdateQuotationItem(idx, 'hsn', e.target.value)}
                                          className="w-full bg-[#1a1e2d] border border-white/10 rounded-lg px-2 py-1 text-xs font-mono font-bold text-gray-200"
                                        />
                                      </td>
                                      <td className="px-3 py-3">
                                        <input
                                          type="number"
                                          min="1"
                                          value={item.qty}
                                          onChange={(e) => handleUpdateQuotationItem(idx, 'qty', e.target.value)}
                                          className="w-full bg-[#1a1e2d] border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-gray-200 text-center"
                                        />
                                      </td>
                                      <td className="px-3 py-3">
                                        <input
                                          type="text"
                                          value={item.unit}
                                          onChange={(e) => handleUpdateQuotationItem(idx, 'unit', e.target.value)}
                                          className="w-full bg-[#1a1e2d] border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-gray-200 text-center"
                                        />
                                      </td>
                                      <td className="px-3 py-3">
                                        <input
                                          type="number"
                                          value={item.selling_price}
                                          onChange={(e) => handleUpdateQuotationItem(idx, 'selling_price', e.target.value)}
                                          className="w-full bg-[#1a1e2d] border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-gray-200 text-right"
                                        />
                                      </td>
                                      <td className="px-3 py-3">
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={item.discount_percentage}
                                          onChange={(e) => handleUpdateQuotationItem(idx, 'discount_percentage', e.target.value)}
                                          className="w-full bg-[#1a1e2d] border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-gray-200 text-center"
                                        />
                                      </td>
                                      <td className="px-3 py-3 font-mono font-black text-emerald-400 text-right text-sm">
                                        ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-3 py-3 text-center">
                                        <button
                                          onClick={() => handleRemoveQuotationItem(idx)}
                                          className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                                          title="Remove Item"
                                        >
                                          🗑️
                                        </button>
                                      </td>
                                    </tr>
                                  )
                                })
                              ) : (
                                <tr>
                                  <td colSpan="8" className="text-center py-8 text-gray-500 font-semibold">
                                    No line items added yet. Click "+ Add Custom Line Item" or choose from the right sidebar catalog.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (1 Col): Master Service Catalog + Financial Summary */}
                    <div className="space-y-6">
                      {/* Master Catalog Search & Quick Add */}
                      <div className="bg-[#1a1e2d] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                            <span>📦 Service Catalog</span>
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold px-2 py-0.5 rounded-full">
                              {generalServices.length}
                            </span>
                          </h3>
                        </div>

                        <input
                          type="text"
                          placeholder="Search catalog service..."
                          value={sidebarServiceSearch}
                          onChange={(e) => setSidebarServiceSearch(e.target.value)}
                          className="w-full bg-[#151722] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-gray-200 focus:outline-none focus:border-[#38b34a]"
                        />

                        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                          {generalServices
                            .filter((s) => !sidebarServiceSearch || s.name.toLowerCase().includes(sidebarServiceSearch.toLowerCase()))
                            .map((service) => (
                              <div
                                key={service.id}
                                className="p-2.5 bg-[#151722] border border-white/5 rounded-xl hover:border-blue-400/50 hover:shadow-md transition-all flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-extrabold text-white truncate">{service.name}</p>
                                  <p className="text-[10px] text-gray-400 font-mono">
                                    HSN: {service.hsn} · ₹{service.selling_price?.toLocaleString('en-IN')} / {service.unit}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleAddQuotationItemFromCatalog(service)}
                                  className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-600 hover:text-white text-blue-300 text-xs font-bold rounded-lg border border-blue-500/30 transition-all cursor-pointer flex-shrink-0"
                                >
                                  + Add
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Quotation Financial Summary */}
                      <div className="bg-gradient-to-br from-[#10131d] to-[#161a26] border border-[#38b34a]/30 text-white rounded-2xl p-5 shadow-2xl space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-white/10 pb-2 flex items-center justify-between">
                          <span>Financial Summary</span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            {quotationForm.gst_type}
                          </span>
                        </h3>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-gray-300">
                            <span>Subtotal (Taxable Value):</span>
                            <span className="font-mono font-bold text-white">
                              ₹{quotationFinancials.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {quotationForm.gst_type === 'Intra-State' ? (
                            <>
                              <div className="flex justify-between text-gray-300">
                                <span>CGST (9.0%):</span>
                                <span className="font-mono font-bold text-sky-400">
                                  ₹{quotationFinancials.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="flex justify-between text-gray-300">
                                <span>SGST (9.0%):</span>
                                <span className="font-mono font-bold text-sky-400">
                                  ₹{quotationFinancials.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between text-gray-300">
                              <span>IGST (18.0%):</span>
                              <span className="font-mono font-bold text-sky-400">
                                ₹{quotationFinancials.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}

                          <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                            <span className="text-sm font-black text-gray-200">Grand Total:</span>
                            <span className="text-xl font-mono font-black text-emerald-400">
                              ₹{quotationFinancials.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 italic">
                            {quotationFinancials.amountInWords}
                          </div>
                        </div>

                        {/* Save Quotation Actions */}
                        <div className="pt-2 space-y-2.5">
                          <button
                            onClick={() => handleSaveQuotation(false)}
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            <span>💾</span>
                            <span>Save & View Quotation Document</span>
                          </button>

                          <button
                            onClick={() => handleSaveQuotation(true)}
                            disabled={loading}
                            className="w-full py-3 bg-[#38b34a] hover:bg-[#38b34a]/85 text-black font-black text-xs rounded-xl shadow-lg shadow-[#38b34a]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            <span>⚡</span>
                            <span>Save & Generate Payment Link</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SERVICE CATALOG */}
          {activeTab === 'services' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-bold text-white">📦 Master General Service Catalog</h2>
                  <p className="text-xs text-gray-400">
                    Master list of deliverables, standard rates, and HSN codes used to build instant commercial quotations.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddServiceModal}
                  className="px-4 py-2 bg-[#38b34a] hover:bg-[#38b34a]/85 text-black text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>➕ Add New Service</span>
                </button>
              </div>

              {/* Service Catalog Filter & Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generalServices.map((srv) => (
                  <div key={srv.id} className="p-4 bg-[#1a1e2d] border border-white/5 rounded-2xl shadow-sm space-y-2 hover:border-white/15 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{srv.name}</h4>
                        <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full mt-1 inline-block">
                          {srv.category}
                        </span>
                      </div>
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        ₹{srv.selling_price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{srv.description || 'No description added'}</p>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                      <span>HSN/SAC: <strong className="text-gray-300 font-mono">{srv.hsn}</strong></span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditServiceClick(srv)}
                          className="px-2 py-1 text-blue-400 hover:bg-blue-500/10 rounded-lg font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv)}
                          className="px-2 py-1 text-rose-400 hover:bg-rose-500/10 rounded-lg font-bold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COUNTRY TAXES & PRICING */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 animate-fade-in">
              <div className="pb-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">🌐 Country Specific Tax Rates & Currency Rules</h2>
                <p className="text-xs text-gray-400">
                  Manage country tax brackets (GST 18%, VAT 13%, Sales Tax) and national pricing overrides.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {taxes.map((t) => (
                  <div key={t.id || t.country_code} className="p-4 bg-[#1a1e2d] border border-white/5 rounded-2xl shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{countryFlags[t.country_code] || '🌐'}</span>
                      <span className="font-mono font-bold text-xs bg-white/10 px-2 py-0.5 rounded text-gray-200">{t.country_code}</span>
                    </div>
                    <h4 className="font-extrabold text-white text-sm">{t.country_name}</h4>
                    <p className="text-xs text-gray-300 font-semibold">
                      Tax: <strong className="text-blue-400">{t.tax_name} ({t.tax_rate}%)</strong>
                    </p>
                    <p className="text-xs text-gray-300 font-semibold">
                      Currency: <strong className="text-white">{t.currency} ({t.currency_symbol})</strong>
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => handleEditTaxClick(t)}
                        className="w-full py-1.5 bg-[#151722] border border-white/10 hover:bg-[#202538] rounded-xl text-xs font-bold text-gray-200 shadow-sm transition-all cursor-pointer"
                      >
                        ✏️ Edit Tax Rate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FOLLOW UP SCHEDULE */}
          {activeTab === 'follow_up' && (
            <div className="space-y-6 animate-fade-in">
              <div className="pb-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">📞 Client Follow-up Schedule</h2>
                <p className="text-xs text-gray-400">
                  Track upcoming follow-up milestones, scheduled calls, and review timeline commitments.
                </p>
              </div>

              <div className="space-y-3">
                {generalClients
                  .filter((c) => c.next_followup_date)
                  .sort((a, b) => new Date(a.next_followup_date) - new Date(b.next_followup_date))
                  .map((c) => (
                    <div
                      key={c.id}
                      className="p-4 bg-[#1a1e2d] border border-white/5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            {c.client_id || `AIMGC${c.id}`}
                          </span>
                          <h4 className="font-extrabold text-white text-sm">{c.company_name || c.client_name}</h4>
                          {(c.contact_person || c.client_name) && c.company_name && (
                            <span className="text-[10px] text-gray-400">👤 {c.contact_person || c.client_name}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Phone: <strong className="text-gray-200">{c.contact_number}</strong> · Status: <strong className="text-gray-200">{c.status}</strong> · Requirements:{' '}
                          <span className="text-gray-300 font-medium">{c.software_requirements || 'N/A'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm">
                          <span>📅</span>
                          <span>{formatDateDisplay(c.next_followup_date)}</span>
                        </span>

                        <button
                          onClick={() => handleOpenViewClientModal(c)}
                          className="px-3 py-1.5 bg-[#151722] border border-white/10 hover:bg-[#202538] rounded-xl text-xs font-bold text-gray-200 shadow-sm cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}

                {generalClients.filter((c) => c.next_followup_date).length === 0 && (
                  <div className="text-center py-12 text-gray-500 font-semibold">
                    No follow-ups currently scheduled. Set follow-up dates when editing a client profile.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DUE PAYMENT */}
          {activeTab === 'due_payment' && (
            <div className="space-y-6 animate-fade-in">
              <div className="pb-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">⚠️ Due Payments & Invoicing Follow-ups</h2>
                <p className="text-xs text-gray-400">
                  Track pending quotations and accounts with overdue balances.
                </p>
              </div>

              <div className="space-y-3">
                {generalClients
                  .filter((c) => c.status === 'Quotation Sent' || c.status === 'Pursuing to Purchase')
                  .map((c) => (
                    <div
                      key={c.id}
                      className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {c.client_id || `AIMGC${c.id}`}
                          </span>
                          <h4 className="font-extrabold text-white text-sm">{c.client_name}</h4>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Contact: <strong className="text-gray-200">{c.contact_number}</strong> ({c.email}) · Status:{' '}
                          <span className="font-bold text-amber-400">{c.status}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewClientQuotations(c)}
                          className="px-3.5 py-1.5 bg-[#151722] border border-amber-500/30 hover:bg-amber-500/10 text-amber-300 text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                        >
                          View Quotations ({c.quotations_count || c.quotations?.length || 0})
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 6: PAYMENT REPORT */}
          {activeTab === 'payment_report' && (
            <div className="space-y-6 animate-fade-in">
              <div className="pb-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">📑 Payment Logs & Tax Invoices</h2>
                <p className="text-xs text-gray-400">
                  Comprehensive audit archive of processed Razorpay online payments and manual offline payment records.
                </p>
              </div>

              <div className="p-8 text-center bg-[#1a1e2d] border border-white/5 rounded-2xl">
                <span className="text-3xl block mb-2">📑</span>
                <p className="font-bold text-white text-sm">All Payment Transactions Recorded</p>
                <p className="text-xs text-gray-500 mt-1">
                  Tax invoices and receipts are automatically archived when client payments are confirmed.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── ALL MODALS ── */}

        {/* 1. Add General Client Modal */}
        {showAddClientModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151722] rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-gray-200">
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1a1e2d]">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>➕ Add General Client</span>
                </h3>
                <button
                  onClick={() => setShowAddClientModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateGeneralClient} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={clientForm.client_name}
                      onChange={(e) => setClientForm({ ...clientForm, client_name: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={clientForm.company_name}
                      onChange={(e) => setClientForm({ ...clientForm, company_name: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Contact Number *</label>
                    <input
                      type="text"
                      required
                      value={clientForm.contact_number}
                      onChange={(e) => setClientForm({ ...clientForm, contact_number: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Country</label>
                    <select
                      value={clientForm.country_code}
                      onChange={(e) => setClientForm({ ...clientForm, country_code: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    >
                      <option value="IN">🇮🇳 India (GST)</option>
                      <option value="NP">🇳🇵 Nepal (VAT)</option>
                      <option value="BT">🇧🇹 Bhutan (Sales Tax)</option>
                      <option value="AE">🇦🇪 UAE</option>
                      <option value="US">🇺🇸 USA</option>
                      <option value="GB">🇬🇧 UK</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">GST Supply Type</label>
                    <select
                      value={clientForm.gst_type}
                      onChange={(e) => setClientForm({ ...clientForm, gst_type: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    >
                      <option value="Intra-State">Intra-State (CGST + SGST)</option>
                      <option value="Inter-State">Inter-State (IGST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Client GSTIN / Tax No</label>
                    <input
                      type="text"
                      placeholder="e.g. 07AAAAA0000A1Z5"
                      value={clientForm.gstin}
                      onChange={(e) => setClientForm({ ...clientForm, gstin: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Status</label>
                    <select
                      value={clientForm.status}
                      onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Lead Source</label>
                    <select
                      value={clientForm.lead_source}
                      onChange={(e) => setClientForm({ ...clientForm, lead_source: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    >
                      {LEAD_SOURCE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Next Follow-up Date</label>
                    <input
                      type="date"
                      value={clientForm.next_followup_date}
                      onChange={(e) => setClientForm({ ...clientForm, next_followup_date: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Software Requirements Tag Multi-Select */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="font-bold text-gray-300 block">Requested Services / Software Deliverables</label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-[#1a1e2d] border border-white/10 rounded-xl min-h-[42px]">
                    {clientForm.selected_services?.map((srv) => (
                      <span
                        key={srv}
                        className="px-2.5 py-1 bg-[#151722] border border-blue-500/30 text-blue-300 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <span>{srv}</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedService(srv)}
                          className="text-gray-400 hover:text-rose-400 font-black cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-white/10 rounded-xl bg-[#1a1e2d]/50">
                    {generalServices.map((srv) => {
                      const isSelected = clientForm.selected_services?.includes(srv.name)
                      return (
                        <label
                          key={srv.id}
                          className={`p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                              : 'bg-[#151722] border-white/5 text-gray-300 hover:border-white/20'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleServiceSelection(srv.name)}
                            className="rounded text-[#38b34a]"
                          />
                          <span className="truncate">{srv.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddClientModal(false)}
                    className="px-4 py-2 border border-white/10 hover:bg-[#1a1e2d] rounded-xl text-xs font-bold text-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-[#38b34a] hover:bg-[#38b34a]/85 text-black rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create General Client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Edit General Client Modal */}
        {showEditClientModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151722] rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-gray-200">
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1a1e2d]">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>✏️ Edit General Client</span>
                </h3>
                <button
                  onClick={() => setShowEditClientModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateGeneralClient} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={clientForm.client_name}
                      onChange={(e) => setClientForm({ ...clientForm, client_name: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={clientForm.company_name}
                      onChange={(e) => setClientForm({ ...clientForm, company_name: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Contact Number</label>
                    <input
                      type="text"
                      value={clientForm.contact_number}
                      onChange={(e) => setClientForm({ ...clientForm, contact_number: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Country</label>
                    <select
                      value={clientForm.country_code}
                      onChange={(e) => setClientForm({ ...clientForm, country_code: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    >
                      <option value="IN">🇮🇳 India (GST)</option>
                      <option value="NP">🇳🇵 Nepal (VAT)</option>
                      <option value="BT">🇧🇹 Bhutan (Sales Tax)</option>
                      <option value="AE">🇦🇪 UAE</option>
                      <option value="US">🇺🇸 USA</option>
                      <option value="GB">🇬🇧 UK</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">GST Supply Type</label>
                    <select
                      value={clientForm.gst_type}
                      onChange={(e) => setClientForm({ ...clientForm, gst_type: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    >
                      <option value="Intra-State">Intra-State (CGST + SGST)</option>
                      <option value="Inter-State">Inter-State (IGST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Client GSTIN / Tax No</label>
                    <input
                      type="text"
                      value={clientForm.gstin}
                      onChange={(e) => setClientForm({ ...clientForm, gstin: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Status</label>
                    <select
                      value={clientForm.status}
                      onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Next Follow-up Date</label>
                    <input
                      type="date"
                      value={clientForm.next_followup_date}
                      onChange={(e) => setClientForm({ ...clientForm, next_followup_date: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditClientModal(false)}
                    className="px-4 py-2 border border-white/10 hover:bg-[#1a1e2d] rounded-xl text-xs font-bold text-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-[#38b34a] hover:bg-[#38b34a]/85 text-black rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. View Client Dossier Modal */}
        {showViewClientModal && viewingClient && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151722] rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full overflow-hidden text-gray-200">
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1a1e2d]">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Client Dossier: {viewingClient.company_name || viewingClient.client_name}</span>
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {viewingClient.client_id || `AIMGC${viewingClient.id}`}</p>
                </div>
                <button
                  onClick={() => setShowViewClientModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 font-bold block mb-1">Contact Person:</span>
                    <span className="font-bold text-white">{viewingClient.contact_person || viewingClient.client_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block mb-1">Contact Phone:</span>
                    <span className="font-bold text-white">{viewingClient.contact_number || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block mb-1">Email:</span>
                    <span className="font-bold text-white">{viewingClient.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block mb-1">Status:</span>
                    <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {viewingClient.status || 'Attended'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block mb-1">Sold By Executive:</span>
                    <span className="font-bold text-white">{viewingClient.sold_by_name || viewingClient.sold_by || partnerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block mb-1">Branch:</span>
                    <span className="font-bold text-white">{viewingClient.branch_name || 'Head Office'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <span className="text-gray-400 font-bold block mb-1">Software Deliverables / Requirements:</span>
                  <p className="font-semibold text-gray-200 bg-[#1a1e2d] p-3 rounded-xl border border-white/5">
                    {viewingClient.software_requirements || 'None specified'}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => setShowViewClientModal(false)}
                    className="px-5 py-2 bg-[#1a1e2d] hover:bg-[#22273a] text-white rounded-xl text-xs font-bold border border-white/10 cursor-pointer"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Add / Edit General Service Modal */}
        {showAddServiceModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151722] rounded-3xl border border-white/10 shadow-2xl max-w-lg w-full overflow-hidden text-gray-200">
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1a1e2d]">
                <h3 className="text-base font-black text-white">
                  {editingServiceId ? '✏️ Edit Catalog Service' : '➕ Add Catalog Service'}
                </h3>
                <button
                  onClick={() => setShowAddServiceModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveService} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-400 block mb-1">Service Name *</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">HSN / SAC Code</label>
                    <input
                      type="text"
                      value={serviceForm.hsn}
                      onChange={(e) => setServiceForm({ ...serviceForm, hsn: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Standard Rate (₹)</label>
                    <input
                      type="number"
                      value={serviceForm.selling_price}
                      onChange={(e) => setServiceForm({ ...serviceForm, selling_price: e.target.value })}
                      className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Category</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-[#38b34a] focus:outline-none"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Custom Software">Custom Software</option>
                    <option value="Mobile Application">Mobile Application</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="Maintenance & AMC">Maintenance & AMC</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Description / Deliverables Scope</label>
                  <textarea
                    rows="3"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#38b34a] focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddServiceModal(false)}
                    className="px-4 py-2 border border-white/10 hover:bg-[#1a1e2d] rounded-xl text-xs font-bold text-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-[#38b34a] hover:bg-[#38b34a]/85 text-black rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 5. Quotations History List Modal */}
        {showQuotationsListModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151722] rounded-3xl border border-white/10 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden text-gray-200">
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1a1e2d]">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Quotations Built for: {selectedGenClient?.client_name}</span>
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">ID: {selectedGenClient?.client_id || `AIMGC${selectedGenClient?.id}`}</p>
                </div>
                <button
                  onClick={() => setShowQuotationsListModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-3 text-xs">
                {selectedClientQuotations && selectedClientQuotations.length > 0 ? (
                  selectedClientQuotations.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 bg-[#1a1e2d] border border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md hover:border-white/15 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                            #{q.quotation_number}
                          </span>
                          <span className="text-[11px] text-gray-400">📅 {formatDateDisplay(q.quotation_date || q.created_at)}</span>
                        </div>
                        <p className="text-sm font-black text-white mt-1">
                          Grand Total: <span className="text-emerald-400 font-mono">₹{Number(q.grand_total || q.total_amount || 0).toLocaleString('en-IN')}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleOpenQuotationDoc(q, selectedGenClient)}
                          className="px-3 py-1.5 bg-[#151722] border border-white/10 hover:bg-[#202538] rounded-xl font-bold text-gray-200 shadow-sm cursor-pointer"
                        >
                          📄 View Document
                        </button>
                        <button
                          onClick={() => handleSendSingleQuotationEmail(q)}
                          className="px-3 py-1.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl font-bold shadow-sm cursor-pointer"
                        >
                          ✉️ Send Email & Link
                        </button>
                        <button
                          onClick={() => handleOpenPaymentModal(q)}
                          className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl font-bold shadow-sm cursor-pointer"
                        >
                          💰 Record Payment
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500 font-semibold">
                    No quotations generated for this client yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. Commercial Quotation Document Viewer Modal */}
        {showQuotationDocModal && viewingQuotationDoc && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col overflow-hidden text-slate-800 print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none">
              {/* Modal Top Action Bar */}
              <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 shrink-0 print:hidden">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📄</span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Official Quotation Document</h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Ref: #{viewingQuotationDoc.quotation_number || `QUO-${viewingQuotationDoc.id}`}
                    </p>
                  </div>
                  <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                    {viewingQuotationDoc.status || 'DRAFT'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintQuotation}
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
                <div
                  id="quotation-document-paper"
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 md:p-10 space-y-5 sm:space-y-6 print:border-none print:shadow-none print:p-0 max-w-3xl mx-auto"
                >
                  {/* 1. Official Quotation Blue Title at Center */}
                  <div className="text-center pb-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#1e3e6b] tracking-wider uppercase font-sans">
                      OFFICIAL QUOTATION
                    </h1>
                    <div className="w-24 h-1 bg-[#1e3e6b] mx-auto mt-2 rounded-full"></div>
                  </div>

                  {/* 2. Letterhead & Brand Header with Company Logo */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-5 border-b-2 border-slate-800">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={companyLogo}
                          alt="AIM Digitalise Logo"
                          className="h-13 sm:h-15 w-auto object-contain shrink-0"
                        />
                        <div>
                          <h2 className="text-lg sm:text-xl font-black text-[#1e3e6b] tracking-tight uppercase leading-tight">
                            AIM Digitalise Pvt. Ltd.
                          </h2>
                          <p className="text-[11px] font-bold text-slate-500">
                            Digital Nation तो Developed Nation
                          </p>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 leading-relaxed pt-1">
                        <p>Corporate Office: #139, 3rd Floor, Rajdanga Main Road, Kolkata - 700107, India</p>
                        <p>GSTIN: <strong>19ABCCA9672L1Z0</strong> | CIN: <strong>U62013WB2025PTC279684</strong></p>
                        <p>Email: <span className="text-blue-600">support@aimdigitalise.com</span> | Web: <strong>www.aimdigitalise.com</strong></p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right space-y-1.5 bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-none border-slate-200 w-full sm:w-auto shrink-0">
                      <div className="text-xs pt-1 space-y-1">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block font-sans">
                            QUOTATION NO.
                          </span>
                          <p className="font-mono font-black text-[#1e3e6b] text-base">
                            {viewingQuotationDoc.quotation_number || `QUO-${viewingQuotationDoc.id}`}
                          </p>
                        </div>
                        <p className="text-slate-500 font-medium">
                          Date: <strong className="text-slate-800">{formatDateDisplay(viewingQuotationDoc.quotation_date)}</strong>
                        </p>
                        <p className="text-slate-500 font-medium">
                          Payment Terms: <strong className="text-slate-800">{viewingQuotationDoc.payment_terms || 'Due on Receipt'}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Client / Billing Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 text-xs">
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
                        Sold / Prepared By: <strong>{viewingQuotationDoc.client?.sold_by_name || 'Partner Sales Team'}</strong>
                      </p>
                      <p className="text-slate-700">
                        Branch: <strong>{viewingQuotationDoc.client?.branch_name || 'Head Office (Kolkata)'}</strong>
                      </p>
                      <p className="text-slate-700">
                        Tax Regime: <strong>{viewingQuotationDoc.gst_type || viewingQuotationDoc.client?.gst_type || 'Intra-State'}</strong>
                      </p>
                      <p className="text-slate-700">
                        Country: <strong>🇮🇳 {viewingQuotationDoc.client?.country_code || 'IN'}</strong>
                      </p>
                      {viewingQuotationDoc.po_number && (
                        <p className="text-slate-700">
                          PO Number: <strong>{viewingQuotationDoc.po_number}</strong> ({viewingQuotationDoc.po_date || 'N/A'})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4. Scope & Itemized Breakdown Table */}
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

                  {/* 5. Financial Calculations & Bank Details */}
                  <div className="quotation-financials-block grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <div className="space-y-4">
                      <div className="p-3.5 sm:p-4 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs space-y-2">
                        <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest block">
                          Bank Transfer & UPI Details:
                        </span>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="text-[11px] text-slate-700 space-y-1 flex-1">
                            <p>Bank: <strong>State Bank of India</strong></p>
                            <p>Branch: <strong>SPECIALISED TEA BRANCH</strong></p>
                            <p>A/C Name: <strong>AIM DIGITALISE PVT LTD</strong></p>
                            <p>A/C No: <strong>41541042687</strong> | IFSC: <strong>SBIN0015197</strong></p>
                            <p className="pt-0.5">UPI ID: <strong className="text-blue-700 font-bold">91106425507@ybl</strong></p>
                          </div>
                          <div className="flex flex-col items-center p-1.5 bg-white rounded-xl border border-blue-200/80 shadow-xs shrink-0">
                            <img
                              src={payQrCode}
                              alt="UPI Barcode"
                              className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg"
                            />
                            <span className="text-[8px] font-black text-slate-600 mt-0.5 uppercase tracking-wider text-center">
                              Scan to Pay (UPI)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-2 text-xs">
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

                      <div className="flex justify-between items-center border-t-2 border-slate-800 pt-2.5 text-base font-black text-slate-900">
                        <span>Grand Total:</span>
                        <span className="text-xl text-[#38b34a]">
                          ₹{Number(viewingQuotationDoc.grand_total || viewingQuotationDoc.grandTotal || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Amount in Words:
                    </span>
                    <p className="font-bold text-slate-800 italic leading-relaxed">
                      {numberToIndianWords(viewingQuotationDoc.grand_total || viewingQuotationDoc.grandTotal)}
                    </p>
                  </div>

                  {/* 6. Terms & Signature */}
                  <div className="quotation-terms-signature grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-slate-200 text-xs" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <div className="sm:col-span-2 space-y-1 text-slate-500 text-[10px]">
                      <span className="font-black text-slate-700 uppercase tracking-wider block">Terms & Conditions:</span>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>This quotation is valid for 30 days from the date of issuance.</li>
                        <li>Work commences immediately upon receipt of initial confirmation or advance.</li>
                        <li>GST/Taxes are calculated based on registered business jurisdiction.</li>
                        <li>For any inquiries regarding this quotation, contact <strong>support@aimdigitalise.com</strong>.</li>
                      </ol>
                    </div>

                    <div className="quotation-signature-block text-center sm:text-right space-y-5 pt-1" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowQuotationDocModal(false)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                  >
                    Close Document
                  </button>

                  {/* WhatsApp Action Icon */}
                  <button
                    type="button"
                    onClick={() => {
                      const clientPhone = (viewingQuotationDoc.client?.contact_number || '').replace(/\D/g, '')
                      const payUrl = viewingQuotationDoc.payment_url || `${window.location.origin}/general-quotation-pay.html?uuid=${viewingQuotationDoc.uuid || ('quotation-' + viewingQuotationDoc.id)}`
                      const text = encodeURIComponent(
                        `Hello ${viewingQuotationDoc.client?.client_name || 'Valued Client'},\n\nPlease find your Official Quotation (${viewingQuotationDoc.quotation_number || 'AIM Quotation'}) from AIM Digitalise Pvt. Ltd.\n\nTotal Amount: ₹${Number(viewingQuotationDoc.grand_total || viewingQuotationDoc.grandTotal || 0).toLocaleString('en-IN')}\nView & Pay Online: ${payUrl}\n\nThank you!`
                      )
                      const waLink = clientPhone ? `https://wa.me/${clientPhone.length === 10 ? '91' + clientPhone : clientPhone}?text=${text}` : `https://wa.me/?text=${text}`
                      window.open(waLink, '_blank')
                    }}
                    title="Share Quotation via WhatsApp"
                    aria-label="Share Quotation via WhatsApp"
                    className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </button>

                  {/* Email Action Icon */}
                  <button
                    type="button"
                    onClick={() => {
                      const clientEmail = viewingQuotationDoc.client?.email || ''
                      const payUrl = viewingQuotationDoc.payment_url || `${window.location.origin}/general-quotation-pay.html?uuid=${viewingQuotationDoc.uuid || ('quotation-' + viewingQuotationDoc.id)}`
                      const subject = encodeURIComponent(`Official Quotation: ${viewingQuotationDoc.quotation_number || 'AIM Digitalise'}`)
                      const body = encodeURIComponent(
                        `Dear ${viewingQuotationDoc.client?.client_name || 'Client'},\n\nPlease find the details for your quotation ${viewingQuotationDoc.quotation_number || ''}.\n\nTotal Amount: ₹${Number(viewingQuotationDoc.grand_total || viewingQuotationDoc.grandTotal || 0).toLocaleString('en-IN')}\nPayment Terms: ${viewingQuotationDoc.payment_terms || 'Due on Receipt'}\n\nYou can review and pay securely online at:\n${payUrl}\n\nWarm regards,\nAIM Digitalise Pvt. Ltd.\nsupport@aimdigitalise.com`
                      )
                      window.location.href = `mailto:${clientEmail}?subject=${subject}&body=${body}`
                    }}
                    title="Send Quotation via Email"
                    aria-label="Send Quotation via Email"
                    className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. Record Manual Payment Modal */}
        {showPaymentModal && paymentQuotation && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151722] rounded-3xl border border-white/10 shadow-2xl max-w-md w-full overflow-hidden text-gray-200">
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1a1e2d]">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>💰 Record Manual Payment</span>
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-400 block mb-1">Quotation Ref</label>
                  <input
                    type="text"
                    readOnly
                    value={`#${paymentQuotation.quotation_number}`}
                    className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-gray-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Amount Paid (₹) *</label>
                  <input
                    type="number"
                    required
                    value={paymentForm.payment_amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_amount: e.target.value })}
                    className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 font-mono font-black text-emerald-400 text-sm focus:border-[#38b34a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                    className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 font-bold text-white focus:border-[#38b34a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Payment Mode</label>
                  <select
                    value={paymentForm.payment_mode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_mode: e.target.value })}
                    className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 font-bold text-white focus:border-[#38b34a] focus:outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Transaction Ref / UTR No.</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR12345678"
                    value={paymentForm.transaction_reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transaction_reference: e.target.value })}
                    className="w-full bg-[#1a1e2d] border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white focus:border-[#38b34a] focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 border border-white/10 hover:bg-[#1a1e2d] rounded-xl font-bold text-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Recording...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
