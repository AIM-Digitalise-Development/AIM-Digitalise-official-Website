import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import AdminProposals from './Proposals'
import {
  getAdminLeads as getLeads,
  getAdminLeadStats as getLeadStats,
  createAdminLead as createLead,
  updateAdminLead as updateLead,
  deleteAdminLead as deleteLead,
  scheduleAdminFollowUp as scheduleFollowUp,
  getAdminDemoSlotsAvailable as getAvailableDemoSlots,
  getAdminAvailableDates as getAvailableDates,
  getAdminSlotBookings as getSlotBookings,
  bookAdminDemoSlot as bookDemoSlot,
  cancelAdminBooking as cancelBooking,
  getAdminCategories as getCategories,
  getAdminSubcategories as getSubcategories,
  getAdminProductsDropdown as getProductsDropdown,
  sendAdminDemoEmail as sendDemoEmail,
  updateAdminLeadStatus as updateLeadStatus,
  addAdminLeadActivity as addLeadActivity,
  bulkAssignAdminLeads as bulkAssignLeads
} from '../../api/admin/leads'
import {
  getGeneralClients,
  getGeneralClientById,
  createGeneralClient,
  updateGeneralClient,
  deleteGeneralClient,
  getGeneralServices,
  createQuotation,
  updateQuotation,
  sendQuotation,
  getClientQuotations,
  recordQuotationPayment,
  getAdminInvoiceDownloadUrl
} from '../../api/admin/generalClients'
import { RichAnnexureEditor, numberToIndianWords } from './Users'
import companyLogo from '../../assets/images/logo.png'

export const renderCreatorBadge = (creatorCode, leadObj = null) => {
  const code = String(creatorCode || leadObj?.employee_id || 'Admin')
  const codeLower = code.toLowerCase()
  const isPartner = code.startsWith('PID') || code.startsWith('PTR') || code.startsWith('PAR') || code.startsWith('P-') || codeLower.includes('partner') || Boolean(leadObj?.partner) || leadObj?.category_name === 'Partner'
  if (isPartner) {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-300">
        🤝 Partner ({code})
      </span>
    )
  }
  if (code.startsWith('AIM') || codeLower.includes('employee')) {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-300">
        👔 Employee ({code})
      </span>
    )
  }
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
      🏢 Admin ({code})
    </span>
  )
}

const normalizeService = (srv) => {
  if (!srv || typeof srv !== 'object') return srv
  return {
    ...srv,
    id: srv.id || srv._id || srv.service_id,
    name: srv.service_name || srv.name || srv.title || 'General Service',
    service_name: srv.service_name || srv.name || srv.title || 'General Service',
    service_price: Number(srv.service_price ?? srv.selling_price ?? srv.price ?? 0),
    selling_price: Number(srv.service_price ?? srv.selling_price ?? srv.price ?? 0),
    hsn: srv.hsn || srv.hsn_code || '998314',
    unit: srv.unit || 'Unit',
    description: srv.service_description || srv.description || '',
    is_active: srv.is_active !== undefined ? srv.is_active : true,
  }
}

// Module-level in-memory caches to keep data instantly available across tab/page switches
let cachedAdminLeads = null
let cachedAdminStats = null
let cachedAdminCategories = null
let cachedAdminServices = null
let cachedAdminDemoSlots = null


const formatForDateTimeInput = (dateStr) => {
  if (!dateStr) return ''
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    return dateStr.slice(0, 16)
  }
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const formatFollowUpDisplay = (dateStr) => {
  if (!dateStr) return 'Set Date'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

export default function AdminLeads() {
  // Navigation Tabs State
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam && ['leads', 'followup', 'proposal'].includes(tabParam) ? tabParam : 'leads')

  // Follow-up tab specific filter state
  const [followUpFilterType, setFollowUpFilterType] = useState('all') // 'all' | 'today' | 'overdue' | 'upcoming'
  const [followUpSearch, setFollowUpSearch] = useState('')
  const [followUpPriority, setFollowUpPriority] = useState('')

  useEffect(() => {
    const currentTab = searchParams.get('tab')
    if (currentTab && ['leads', 'followup', 'proposal'].includes(currentTab)) {
      setActiveTab(currentTab)
    }
  }, [searchParams])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId }, { replace: true })
  }

  // Stats and Listing State (Pre-populated from cache for 0ms reloads)
  const [stats, setStats] = useState(cachedAdminStats)
  const [leads, setLeads] = useState(cachedAdminLeads || [])
  const [loading, setLoading] = useState(!cachedAdminLeads)
  const [statsLoading, setStatsLoading] = useState(!cachedAdminStats)
  const [isRevalidating, setIsRevalidating] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Query / Filter State
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [broughtByFilter, setBroughtByFilter] = useState('all') // 'all' | 'admin' | 'employee' | 'partner'
  const [sortDir, setSortDir] = useState('desc') // 'desc' | 'asc'
  const [followUpToday, setFollowUpToday] = useState(false)
  const [pendingFollowUp, setPendingFollowUp] = useState(false)
  const [todayDemo, setTodayDemo] = useState(false)
  const [page, setPage] = useState(1)

  // 300ms Debounced search so typing is super snappy and doesn't spam APIs
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Selection state for Bulk Actions
  const [selectedLeadIds, setSelectedLeadIds] = useState([])

  // Category/Subcategory/Product states (Pre-populated from cache)
  const [categories, setCategories] = useState(cachedAdminCategories || [])
  const [subcategories, setSubcategories] = useState([])
  const [products, setProducts] = useState([])
  const [generalServices, setGeneralServices] = useState(cachedAdminServices || [])
  const [loadingGeneralServices, setLoadingGeneralServices] = useState(false)
  const [serviceSearchTerm, setServiceSearchTerm] = useState('')
  const [availableDemoSlots, setAvailableDemoSlots] = useState(cachedAdminDemoSlots || [])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')

  const formatCategoryDisplayName = (name) => {
    if (!name) return ''
    const lower = name.toLowerCase()
    if (lower.includes('saas')) return 'SAAS Based Services'
    if (lower.includes('subscription')) return 'Subscription Based Services'
    if (lower.includes('general')) return 'General Services'
    return name
  }

  const filteredGeneralServices = useMemo(() => {
    if (!serviceSearchTerm.trim()) return generalServices
    const q = serviceSearchTerm.toLowerCase()
    return generalServices.filter(s => {
      const name = (s.service_name || s.name || '').toLowerCase()
      return name.includes(q)
    })
  }, [generalServices, serviceSearchTerm])
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('')

  // Assign Demo Slot states
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedLeadForAssign, setSelectedLeadForAssign] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookingNotes, setBookingNotes] = useState('')
  const [allSlotsData, setAllSlotsData] = useState({})
  const [selectedSlotIdForBooking, setSelectedSlotIdForBooking] = useState(null)
  const [showSlotBookingModal, setShowSlotBookingModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')

  // Modal / Drawer State
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null) // null for create, lead object for edit
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusLead, setStatusLead] = useState(null)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [activityLead, setActivityLead] = useState(null)
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false)
  const [selectedDrawerLead, setSelectedDrawerLead] = useState(null) // Slide-over detail drawer

  // Follow-up Modal State
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false)
  const [followUpLead, setFollowUpLead] = useState(null)
  const [followUpForm, setFollowUpForm] = useState({
    next_date: '',
    status: 'new',
    remark: ''
  })

  // Mail Modal State
  const [isMailModalOpen, setIsMailModalOpen] = useState(false)
  const [mailLead, setMailLead] = useState(null)
  const [mailForm, setMailForm] = useState({
    email: '',
    subject: 'Exclusive Demo: AIM Digitalise School ERP & Management Software'
  })
  const [sendingMail, setSendingMail] = useState(false)

  // ── GENERAL CLIENT QUOTATIONS & PAYMENT MODALS STATE ──
  const [showQuotationBuilder, setShowQuotationBuilder] = useState(false)
  const [selectedGenClient, setSelectedGenClient] = useState(null)
  const [editingQuotationId, setEditingQuotationId] = useState(null)
  const [quotationItems, setQuotationItems] = useState([])
  const [quotationForm, setQuotationForm] = useState({
    quotation_number: '',
    quotation_date: new Date().toISOString().split('T')[0],
    po_number: '',
    po_date: '',
    gst_type: 'Intra-State',
    gstin: '',
    payment_terms: 'Due on Receipt',
    discount_description: '',
    anexture: false,
    anexture_content: '',
  })
  const [sidebarServiceSearch, setSidebarServiceSearch] = useState('')
  const [copiedPayLink, setCopiedPayLink] = useState(false)
  const [savingQuotation, setSavingQuotation] = useState(false)

  // Quotations List Modal State
  const [showQuotationsListModal, setShowQuotationsListModal] = useState(false)
  const [selectedClientQuotations, setSelectedClientQuotations] = useState([])
  const [loadingQuotationsList, setLoadingQuotationsList] = useState(false)

  // Quotation Document Modal State
  const [showQuotationDocModal, setShowQuotationDocModal] = useState(false)
  const [viewingQuotationDoc, setViewingQuotationDoc] = useState(null)

  // Record Manual Payment Modal State
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false)
  const [paymentQuotation, setPaymentQuotation] = useState(null)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'Bank Transfer',
    transaction_id: '',
    reference_number: '',
    paid_at: new Date().toISOString().split('T')[0],
    notes: 'Payment confirmed by Admin'
  })
  const [recordingPayment, setRecordingPayment] = useState(false)

  // Load General Services database on mount for quotation builder sidebar
  useEffect(() => {
    getGeneralServices().then(res => {
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setGeneralServices(res.data.data)
      }
    }).catch(err => console.warn('Could not load general services for quotation builder:', err))
  }, [])

  // Helper to ensure a general client database record exists for standard leads
  const ensureGenClient = async (lead) => {
    if (lead.rawId) {
      return { id: lead.rawId, ...lead }
    }
    try {
      const cleanedPhone = cleanAndFixPhone(lead.client_phone)
      const res = await createGeneralClient({
        client_name: lead.client_name,
        company_name: lead.company_name || lead.client_name,
        contact_number: cleanedPhone,
        alt_contact_number: cleanAndFixPhone(lead.client_alternate_phone) || null,
        email: lead.client_email || '',
        country_code: lead.country_code || 'IN',
        address: lead.address || '',
        city: lead.city || '',
        state: lead.state || '',
        pin_code: lead.pin_code || '',
        software_requirements: lead.software_requirements || lead.product_name || 'General Client Services',
        sold_by: lead.sold_by || 'Admin'
      })
      if (res?.data?.data) {
        lead.rawId = res.data.data.id
        lead.is_general_client = true
        return res.data.data
      }
    } catch (err) {
      console.warn('Auto sync general client record notice:', err)
    }
    return lead
  }

  // Open Quotation Builder
  const handleOpenQuotationBuilder = async (lead) => {
    const clientObj = await ensureGenClient(lead)
    setSelectedGenClient(clientObj)
    setEditingQuotationId(null)
    const randomSuffix = Math.floor(100 + Math.random() * 900)
    const randomMid = Math.floor(100000 + Math.random() * 900000)
    setQuotationForm({
      quotation_date: new Date().toISOString().split('T')[0],
      quotation_number: `AIM-${randomMid}-${randomSuffix}`,
      po_number: '',
      po_date: '',
      gst_type: clientObj.gst_type || 'Intra-State',
      gstin: clientObj.gstin || '',
      payment_terms: 'Full payments in Advanced',
      discount_description: 'Special offer / seasonal discount',
      anexture: 'NO',
      anexture_content: '',
    })

    const reqs = clientObj.software_requirements || clientObj.product_name || ''
    const prefilledItems = reqs ? reqs.split(',').map(s => s.trim()).filter(Boolean).map(s => ({
      product_name: s,
      hsn: '998314',
      unit: 'Unit',
      qty: 1,
      selling_price: 0,
      discount_percentage: 0,
      description: `Scope & specifications for ${s}`
    })) : [{
      product_name: 'General Client Services',
      hsn: '998314',
      unit: 'Unit',
      qty: 1,
      selling_price: 0,
      discount_percentage: 0,
      description: ''
    }]

    setQuotationItems(prefilledItems)
    setShowQuotationBuilder(true)
  }

  // Edit Existing Quotation
  const handleEditQuotation = (quotation, clientObj = null) => {
    setEditingQuotationId(quotation.id)
    if (clientObj) setSelectedGenClient(clientObj)
    setShowQuotationDocModal(false)
    setShowQuotationsListModal(false)
    setShowQuotationBuilder(true)

    setQuotationForm({
      quotation_number: quotation.quotation_number || '',
      quotation_date: quotation.quotation_date ? String(quotation.quotation_date).split('T')[0] : new Date().toISOString().split('T')[0],
      po_number: quotation.po_number || '',
      po_date: quotation.po_date ? String(quotation.po_date).split('T')[0] : '',
      gst_type: quotation.gst_type || 'Intra-State',
      gstin: quotation.gstin || '',
      payment_terms: quotation.payment_terms || 'Full payments in Advanced',
      discount_description: quotation.discount_description || '',
      anexture: quotation.anexture === 'YES' || quotation.anexture === true ? 'YES' : 'NO',
      anexture_content: quotation.anexture_content || '',
    })

    const existingItems = (quotation.items || []).map(it => ({
      product_name: it.product_name || it.name || 'Service Item',
      hsn: it.hsn || it.hsn_code || '998314',
      unit: it.unit || 'Unit',
      qty: Number(it.qty || it.quantity || 1),
      selling_price: Number(it.selling_price || it.price || 0),
      discount_percentage: Number(it.discount_percentage || it.discount || 0),
      description: it.description || '',
    }))

    setQuotationItems(existingItems.length > 0 ? existingItems : [{
      product_name: 'Service Item',
      hsn: '998314',
      unit: 'Unit',
      qty: 1,
      selling_price: 0,
      discount_percentage: 0,
      description: ''
    }])
  }

  const handleAddGeneralServiceToQuotation = (service) => {
    const newItem = {
      product_name: service.service_name || service.name || 'Service Item',
      hsn: service.hsn || '998314',
      unit: service.unit || 'Unit',
      qty: 1,
      selling_price: Number(service.selling_price || service.price || 0),
      discount_percentage: 0,
      description: service.description || '',
    }
    setQuotationItems(prev => [...prev, newItem])
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

  const handleItemChange = (index, field, val) => {
    setQuotationItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: val }
      return updated
    })
  }

  const handleRemoveItem = (index) => {
    setQuotationItems(prev => prev.filter((_, idx) => idx !== index))
  }

  const computeQuotationTotals = () => {
    const subtotal = quotationItems.reduce((sum, item) => {
      const qty = Number(item.qty || 1)
      const price = Number(item.selling_price || 0)
      const disc = Number(item.discount_percentage || 0)
      const lineTotal = qty * price * (1 - disc / 100)
      return sum + lineTotal
    }, 0)

    const roundedSubtotal = Math.round(subtotal * 100) / 100
    const isIndia = (selectedGenClient?.country_code || 'IN') === 'IN'
    const isIntra = quotationForm.gst_type === 'Intra-State'

    let cgst = 0, sgst = 0, igst = 0, taxTotal = 0
    if (isIndia) {
      if (isIntra) {
        cgst = Math.round(roundedSubtotal * 0.09 * 100) / 100
        sgst = Math.round(roundedSubtotal * 0.09 * 100) / 100
        taxTotal = Math.round((cgst + sgst) * 100) / 100
      } else {
        igst = Math.round(roundedSubtotal * 0.18 * 100) / 100
        taxTotal = igst
      }
    } else {
      taxTotal = Math.round(roundedSubtotal * 0.18 * 100) / 100
    }

    const grandTotal = Math.round((roundedSubtotal + taxTotal) * 100) / 100
    return { subtotal: roundedSubtotal, cgst, sgst, igst, taxTotal, grandTotal }
  }

  const handleSaveQuotation = async (e, sendImmediately = false) => {
    e.preventDefault()
    if (!selectedGenClient?.id && !selectedGenClient?.rawId) {
      triggerSuccess('Error: Missing General Client reference ID', 'error')
      return
    }
    const clientId = selectedGenClient.rawId || selectedGenClient.id
    const totals = computeQuotationTotals()

    const payload = {
      quotation_number: quotationForm.quotation_number || undefined,
      quotation_date: quotationForm.quotation_date,
      po_number: quotationForm.po_number || null,
      po_date: quotationForm.po_date || null,
      gst_type: quotationForm.gst_type,
      gstin: quotationForm.gstin || null,
      payment_terms: quotationForm.payment_terms,
      discount_description: quotationForm.discount_description || null,
      anexture: quotationForm.anexture ? 'YES' : 'NO',
      anexture_content: quotationForm.anexture ? quotationForm.anexture_content : '',
      subtotal: totals.subtotal,
      cgst_amount: totals.cgst,
      sgst_amount: totals.sgst,
      igst_amount: totals.igst,
      tax_amount: totals.taxTotal,
      total_amount: totals.grandTotal,
      currency: selectedGenClient?.country_code === 'IN' ? 'INR' : 'USD',
      country_code: selectedGenClient?.country_code || 'IN',
      items: quotationItems.map(it => ({
        product_name: it.product_name,
        hsn: it.hsn,
        unit: it.unit,
        qty: Number(it.qty || 1),
        selling_price: Number(it.selling_price || 0),
        discount_percentage: Number(it.discount_percentage || 0),
        description: it.description || '',
      }))
    }

    try {
      setSavingQuotation(true)
      let res
      if (editingQuotationId) {
        res = await updateQuotation(editingQuotationId, payload)
      } else {
        res = await createQuotation(clientId, payload)
      }

      if (res?.data?.success) {
        const quoData = res.data.data || res.data.quotation || {}
        if (sendImmediately && quoData.id) {
          try {
            await sendQuotation(quoData.id)
          } catch (_) {}
        }

        triggerSuccess(editingQuotationId ? '✅ Quotation updated successfully!' : '✅ Quotation created successfully!')
        handleOpenQuotationDoc({
          ...quoData,
          items: quotationItems,
          subtotal: totals.subtotal,
          tax_total: totals.taxTotal,
          cgst: totals.cgst,
          sgst: totals.sgst,
          igst: totals.igst,
          grand_total: totals.grandTotal
        }, selectedGenClient)

        setShowQuotationBuilder(false)
        setEditingQuotationId(null)
        loadLeads()
      }
    } catch (err) {
      console.error('Error saving quotation:', err)
      triggerSuccess(err.response?.data?.message || 'Failed to save quotation', 'error')
    } finally {
      setSavingQuotation(false)
    }
  }

  // Open Full Official Quotation Document Viewer
  const handleOpenQuotationDoc = (quotation, clientObj = null) => {
    const client = clientObj || selectedGenClient || quotation.client || {}
    const items = (quotation.items || []).map(it => ({
      product_name: it.product_name || it.name || 'Service Item',
      hsn: it.hsn || it.hsn_code || '998314',
      qty: Number(it.qty || it.quantity || 1),
      unit: it.unit || 'Unit',
      selling_price: Number(it.selling_price || it.price || 0),
      discount_percentage: Number(it.discount_percentage || it.discount || 0),
      description: it.description || '',
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

  // High Fidelity Print
  const handlePrintQuotation = () => {
    const printElement = document.getElementById('quotation-document-paper-leads')
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
          ${headElements}
          <style>
            @page { size: A4 portrait; margin: 0 !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; box-sizing: border-box; }
            html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; font-family: 'Inter', sans-serif !important; color: #0f172a !important; width: 100% !important; }
            #quotation-document-paper-leads { box-shadow: none !important; border: none !important; padding: 6mm 10mm !important; margin: 0 auto !important; width: 100% !important; max-width: 100% !important; }
            .quotation-terms-signature, .quotation-signature-block { page-break-inside: avoid !important; break-inside: avoid !important; }
            table { border-collapse: collapse !important; width: 100% !important; }
          </style>
        </head>
        <body>
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
        console.error('Print trigger error:', err)
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe)
          }
        }, 2000)
      }
    }

    const images = iframe.contentWindow.document.querySelectorAll('img')
    let loaded = 0
    const total = images.length
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
        if (images[i].complete) onImgDone()
        else { images[i].onload = onImgDone; images[i].onerror = onImgDone; }
      }
      setTimeout(() => { if (!triggered) { triggered = true; triggerPrint() } }, 1000)
    }
  }

  // View Client's Previous Quotations List Modal
  const handleViewClientQuotations = async (lead) => {
    const clientObj = await ensureGenClient(lead)
    setSelectedGenClient(clientObj)
    setLoadingQuotationsList(true)
    try {
      const res = await getClientQuotations(clientObj.id || clientObj.rawId)
      const result = res.data
      if (result.success && Array.isArray(result.data)) {
        setSelectedClientQuotations(result.data)
        setShowQuotationsListModal(true)
      } else {
        const detailsRes = await getGeneralClientById(clientObj.id || clientObj.rawId)
        if (detailsRes?.data?.data?.quotations) {
          setSelectedClientQuotations(detailsRes.data.data.quotations)
          setShowQuotationsListModal(true)
        }
      }
    } catch (err) {
      console.error('Error fetching client quotations:', err)
    } finally {
      setLoadingQuotationsList(false)
    }
  }

  // Record Manual Payment Handlers
  const handleOpenRecordPayment = (quotation, clientObj = null) => {
    if (clientObj) setSelectedGenClient(clientObj)
    setPaymentQuotation(quotation)
    setPaymentForm({
      amount: quotation.total_amount || quotation.grand_total || quotation.amount || '',
      payment_method: 'Bank Transfer',
      transaction_id: '',
      reference_number: '',
      paid_at: new Date().toISOString().split('T')[0],
      notes: 'Manual payment recorded by Admin'
    })
    setShowRecordPaymentModal(true)
  }

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault()
    if (!paymentQuotation?.id) return
    setRecordingPayment(true)
    try {
      const res = await recordQuotationPayment(paymentQuotation.id, paymentForm)
      if (res?.data?.success) {
        triggerSuccess('🎉 Payment recorded successfully! Client order closed & moved to General Clients directory.')
        setShowRecordPaymentModal(false)
        setShowQuotationsListModal(false)
        setShowQuotationDocModal(false)
        loadLeads()
        loadStats()
      } else {
        triggerSuccess(res?.data?.message || 'Failed to record payment', 'error')
      }
    } catch (err) {
      console.error('Error recording payment:', err)
      triggerSuccess(err.response?.data?.message || 'Error recording payment', 'error')
    } finally {
      setRecordingPayment(false)
    }
  }

  // Form states
  const [leadForm, setLeadForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_alternate_phone: '',
    company_name: '',
    gstin: '',
    address: '',
    city: '',
    state: '',
    pin_code: '',
    country: 'India',
    country_code: 'IN',
    gst_type: 'Intra-State',
    gstin: '',
    referred_by: 'Direct / None',
    lead_source: 'Website',
    lead_status: 'not attended',
    lead_priority: 'medium',
    notes: '',
    budget: '',
    expected_close_date: '',
    category_id: '',
    sub_category_id: '',
    product_id: '',
    product_name: '',
    product_processing_fee: '',
    product_monthly_subscription: '',
    software_requirements: '',
    selected_services: [],
    sold_by: 'Admin'
  })

  const [statusForm, setStatusForm] = useState({
    status: 'new',
    notes: '',
    lost_reason: ''
  })

  const [activityForm, setActivityForm] = useState({
    activity_type: 'call',
    description: '',
    notes: '',
    scheduled_date: ''
  })

  const [bulkAssignForm, setBulkAssignForm] = useState({
    assigned_to: '2', // Defaults to Jane Smith
    notes: ''
  })

  const [saving, setSaving] = useState(false)

  // 1. Fetch Stats & Leads
  const loadStats = async (force = false) => {
    if (!force && cachedAdminStats) {
      setStats(cachedAdminStats)
      setStatsLoading(false)
      return
    }
    try {
      if (!cachedAdminStats) setStatsLoading(true)
      const res = await getLeadStats()
      if (res.data?.success) {
        setStats(res.data.data)
        cachedAdminStats = res.data.data
      }
    } catch (err) {
      console.error('Error fetching lead stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const loadLeads = async (forceSpinner = false) => {
    try {
      if (forceSpinner) {
        cachedAdminLeads = null
      }
      if (forceSpinner || !cachedAdminLeads || cachedAdminLeads.length === 0) {
        setLoading(true)
      } else {
        setIsRevalidating(true)
      }
      setError('')
      const params = {
        page,
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        brought_by: broughtByFilter !== 'all' ? broughtByFilter : undefined,
        sort_dir: sortDir || undefined,
        follow_up_today: followUpToday || undefined,
        pending_follow_up: pendingFollowUp || undefined,
        today_demo: todayDemo || undefined
      }
      const gcParams = {
        sold_by: broughtByFilter !== 'all' ? broughtByFilter : undefined,
        sort_dir: sortDir || undefined,
        search: search || undefined,
        only_unpaid: 1,
      }

      // Parallel execution for 2x faster load time
      const [leadsRes, gcRes] = await Promise.all([
        getLeads(params).catch(err => {
          console.error('Error fetching leads:', err)
          return { data: null }
        }),
        getGeneralClients(gcParams).catch(gcErr => {
          console.warn('Could not load general clients for admin leads view:', gcErr)
          return { data: null }
        })
      ])

      let standardLeads = []
      if (leadsRes?.data?.success) {
        standardLeads = leadsRes.data.data?.data || (Array.isArray(leadsRes.data.data) ? leadsRes.data.data : [])
      } else if (Array.isArray(leadsRes?.data)) {
        standardLeads = leadsRes.data
      }

      let gcList = []
      if (gcRes?.data?.success && Array.isArray(gcRes.data.data)) {
        gcList = gcRes.data.data
      } else if (Array.isArray(gcRes?.data)) {
        gcList = gcRes.data
      }

      const statusMap = {
        'Attended': 'new',
        'Quotation Sent': 'proposal',
        'Pursuing to Purchase': 'negotiation',
        'Order Closed': 'converted',
        'Not Interested': 'lost'
      }

      const formattedGenClients = gcList.map(gc => ({
        id: `gc-${gc.id}`,
        rawId: gc.id,
        is_general_client: true,
        lead_id: gc.client_id || `GC-${gc.id}`,
        client_name: gc.client_name,
        company_name: gc.company_name || gc.client_name,
        client_phone: gc.contact_number,
        client_alternate_phone: gc.alt_contact_number || null,
        client_email: gc.email || '',
        address: gc.address || '',
        city: gc.district || gc.city || '',
        state: gc.state || '',
        pin_code: gc.pin_code || '',
        country: gc.country_code === 'IN' ? 'India' : (gc.country_code || 'India'),
        country_code: gc.country_code || 'IN',
        lead_source: gc.lead_source || 'Direct Enquiry',
        lead_status: statusMap[gc.status] || 'new',
        raw_status: gc.status,
        lead_priority: 'medium',
        category_id: 'general_client',
        category_name: 'General Client',
        product_name: gc.software_requirements || 'General Client Services',
        product_interest: gc.software_requirements || 'General Client Services',
        software_requirements: gc.software_requirements,
        selected_services: gc.software_requirements ? gc.software_requirements.split(',').map(s => s.trim()).filter(Boolean) : [],
        gst_type: gc.gst_type,
        gstin: gc.gstin,
        follow_up_date: gc.next_followup_date || null,
        expected_close_date: gc.next_followup_date || null,
        created_at: gc.created_at || gc.reg_date || new Date().toISOString(),
        notes: `General Client: ${gc.software_requirements || 'Deliverables'}`,
        sold_by: gc.sold_by || gc.sold_by_name || 'Admin',
        employee: { full_name: gc.sold_by || gc.sold_by_name || 'Admin' },
        activities: []
      }))

      let filteredGc = formattedGenClients
      if (search) {
        const q = search.toLowerCase()
        filteredGc = filteredGc.filter(g =>
          g.client_name?.toLowerCase().includes(q) ||
          g.company_name?.toLowerCase().includes(q) ||
          g.client_phone?.includes(q) ||
          g.lead_id?.toLowerCase().includes(q)
        )
      }
      if (statusFilter) {
        filteredGc = filteredGc.filter(g => g.lead_status === statusFilter || g.raw_status === statusFilter)
      }
      if (broughtByFilter !== 'all') {
        filteredGc = filteredGc.filter(g => {
          const sold = (g.sold_by || '').toLowerCase()
          if (broughtByFilter === 'partner') return sold.startsWith('pidin') || sold.includes('partner')
          if (broughtByFilter === 'employee') return sold.startsWith('aim') || sold.includes('employee')
          if (broughtByFilter === 'admin') return !sold.startsWith('pidin') && !sold.startsWith('aim') && !sold.includes('partner') && !sold.includes('employee')
          return true
        })
      }

      const unpaidStandardLeads = standardLeads.filter(l => {
        const isGc = l.category_name === 'General Client' || l.category_id === 'general_client'
        if (isGc && (l.is_converted || l.lead_status === 'converted' || l.lead_status === 'Order Closed' || l.raw_status === 'Order Closed')) {
          return false
        }
        return true
      })

      const combined = [
        ...filteredGc,
        ...unpaidStandardLeads.filter(l => !filteredGc.some(g => g.client_phone && g.client_phone === l.client_phone))
      ]

      if (sortDir === 'asc') {
        combined.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      } else {
        combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }

      setLeads(combined)
      if (!search && !statusFilter && broughtByFilter === 'all' && page === 1 && !followUpToday && !pendingFollowUp && !todayDemo) {
        cachedAdminLeads = combined
      }
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError(err?.response?.data?.message || 'Could not load leads from server.')
    } finally {
      setLoading(false)
      setIsRevalidating(false)
    }
  }

  const fetchGeneralServicesList = async (force = false) => {
    if (!force && cachedAdminServices) {
      setGeneralServices(cachedAdminServices)
      return
    }
    try {
      setLoadingGeneralServices(true)
      const res = await getGeneralServices()
      let list = []
      if (res.data?.success && Array.isArray(res.data.data)) {
        list = res.data.data.map(normalizeService)
      } else if (Array.isArray(res.data)) {
        list = res.data.map(normalizeService)
      }
      setGeneralServices(list)
      cachedAdminServices = list
    } catch (err) {
      console.error('Failed to load general services:', err)
    } finally {
      setLoadingGeneralServices(false)
    }
  }

  const fetchCategories = async (force = false) => {
    if (!force && cachedAdminCategories) {
      setCategories(cachedAdminCategories)
      return
    }
    try {
      const res = await getCategories()
      if (res.data?.success) {
        setCategories(res.data.data)
        cachedAdminCategories = res.data.data
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchSubcategories = async (categoryId) => {
    try {
      const res = await getSubcategories(categoryId)
      if (res.data?.success) {
        setSubcategories(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch subcategories:', err)
    }
  }

  const fetchProducts = async (subCategoryId, categoryId) => {
    try {
      const res = await getProductsDropdown(subCategoryId, categoryId)
      let data = res.data?.data
      if (data && !Array.isArray(data) && Array.isArray(data.products)) {
        data = data.products
      } else if (!data && Array.isArray(res.data)) {
        data = res.data
      }
      if (Array.isArray(data)) {
        setProducts(data)
      } else {
        setProducts([])
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
      setProducts([])
    }
  }

  const fetchAvailableDemoSlots = async (force = false) => {
    if (!force && cachedAdminDemoSlots) {
      setAvailableDemoSlots(cachedAdminDemoSlots)
      return
    }
    try {
      const res = await getAvailableDemoSlots()
      if (res.data?.success) {
        setAvailableDemoSlots(res.data.data)
        cachedAdminDemoSlots = res.data.data
      }
    } catch (err) {
      console.error('Failed to fetch demo slots:', err)
    }
  }

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value
    setSelectedCategoryId(categoryId)
    setLeadForm(prev => ({
      ...prev,
      category_id: categoryId,
      sub_category_id: '',
      product_id: '',
      product_name: categoryId === 'general_client' ? 'General Client Services' : '',
      product_processing_fee: '',
      product_monthly_subscription: ''
    }))
    setSelectedSubCategoryId('')
    if (categoryId === 'general_client') {
      setSubcategories([])
      setProducts([])
      fetchGeneralServicesList()
    } else if (categoryId) {
      fetchSubcategories(categoryId)
    } else {
      setSubcategories([])
      setProducts([])
    }
  }

  const handleSubCategoryChange = (e) => {
    const subCategoryId = e.target.value
    setSelectedSubCategoryId(subCategoryId)
    setLeadForm(prev => ({
      ...prev,
      sub_category_id: subCategoryId,
      product_id: '',
      product_name: '',
      product_processing_fee: '',
      product_monthly_subscription: ''
    }))
    if (subCategoryId) {
      fetchProducts(subCategoryId, selectedCategoryId)
    } else {
      setProducts([])
    }
  }

  const handleProductSelect = (e) => {
    const productId = e.target.value
    const safeProducts = Array.isArray(products) ? products : []
    const selectedProduct = safeProducts.find(p => p.id == productId)
    setLeadForm(prev => ({
      ...prev,
      product_id: productId,
      product_name: selectedProduct?.name || '',
      product_processing_fee: selectedProduct?.processing_fee || '',
      product_monthly_subscription: selectedProduct?.monthly_subscription || ''
    }))
  }

  const fetchAllSlotDataForMonth = async () => {
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth + 1, 0)
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    if (availableDemoSlots.length === 0) {
      setAllSlotsData({})
      return
    }

    try {
      const promises = availableDemoSlots.map(slot =>
        getAvailableDates(slot.id, { start_date: startDateStr, end_date: endDateStr })
          .then(res => ({
            slotId: slot.id,
            slot: slot,
            availableDates: res.data?.success ? (res.data.data?.available_dates || []) : []
          }))
          .catch(err => {
            console.error(`Failed to fetch dates for slot ${slot.id}:`, err)
            return { slotId: slot.id, slot, availableDates: [] }
          })
      )
      const results = await Promise.all(promises)
      const slotData = {}
      results.forEach(res => {
        slotData[res.slotId] = {
          slot: res.slot,
          availableDates: res.availableDates
        }
      })
      setAllSlotsData(slotData)
    } catch (err) {
      console.error('Failed to fetch slots data:', err)
    }
  }

  const handleBookSlot = async (slotId, date) => {
    setSaving(true)
    setError('')
    try {
      const payload = {
        demo_slot_id: slotId,
        booking_date: date,
        notes: bookingNotes
      }
      const res = await bookDemoSlot(selectedLeadForAssign.id, payload)
      if (res.data?.success) {
        triggerSuccess('Demo slot booked successfully!')
        loadLeads()
        loadStats()
        setShowAssignModal(false)
        setShowSlotBookingModal(false)
        setSelectedLeadForAssign(null)
        setSelectedDate('')
        setBookingNotes('')
        setAllSlotsData({})
        setSelectedSlotIdForBooking(null)
      } else {
        setError(res.data?.message || 'Failed to book demo slot')
      }
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to book demo slot: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this demo booking?')) return
    setSaving(true)
    try {
      const res = await cancelBooking(bookingId)
      if (res.data?.success) {
        triggerSuccess('Booking cancelled successfully!')
        loadLeads()
        loadStats()
        if (showAssignModal) {
          fetchAllSlotDataForMonth()
        }
      } else {
        alert(res.data?.message || 'Failed to cancel booking')
      }
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to cancel booking: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const prevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    setCurrentMonth(newMonth)
  }

  const nextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    setCurrentMonth(newMonth)
  }

  const getSlotsForDate = (dateStr) => {
    const slots = []
    for (const [slotId, data] of Object.entries(allSlotsData)) {
      if (!data || !data.availableDates) continue
      const dateData = data.availableDates.find(d => d.date === dateStr)
      if (dateData) {
        slots.push({
          ...data.slot,
          available_attendees: dateData.available_attendees || 0,
          total_attendees: dateData.total_attendees || 10,
          is_fully_booked: dateData.is_fully_booked || false,
          date: dateStr
        })
      }
    }
    return slots
  }

  useEffect(() => {
    loadLeads()
  }, [search, statusFilter, priorityFilter, broughtByFilter, sortDir, followUpToday, pendingFollowUp, todayDemo, page])

  useEffect(() => {
    // Parallel fetch metadata if not already cached
    const tasks = []
    if (!cachedAdminStats) tasks.push(loadStats())
    if (!cachedAdminCategories) tasks.push(fetchCategories())
    if (!cachedAdminServices) tasks.push(fetchGeneralServicesList())
    if (!cachedAdminDemoSlots) tasks.push(fetchAvailableDemoSlots())
    if (tasks.length > 0) {
      Promise.all(tasks)
    }
  }, [])

  useEffect(() => {
    if (availableDemoSlots.length > 0 && showAssignModal) {
      fetchAllSlotDataForMonth()
    }
  }, [currentMonth, availableDemoSlots, showAssignModal])

  // Auto-sync Drawer Lead details if updated
  useEffect(() => {
    if (selectedDrawerLead) {
      const updated = leads.find(l => l.id === selectedDrawerLead.id)
      if (updated) setSelectedDrawerLead(updated)
    }
  }, [leads])

  // Auto-sync Follow-up Lead details if updated
  useEffect(() => {
    if (followUpLead) {
      const updated = leads.find(l => l.id === followUpLead.id)
      if (updated) setFollowUpLead(updated)
    }
  }, [leads])

  // Helper trigger alerts
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // 2. Action Handlers
  const openCreateModal = () => {
    setEditingLead(null)
    setLeadForm({
      client_name: '',
      client_email: '',
      client_phone: '',
      client_alternate_phone: '',
      company_name: '',
      address: '',
      city: '',
      state: '',
      pin_code: '',
      country: 'India',
      country_code: 'IN',
      gst_type: 'Intra-State',
      gstin: '',
      referred_by: 'Direct / None',
      lead_source: 'Website',
      lead_status: 'not attended',
      lead_priority: 'medium',
      notes: '',
      budget: '',
      expected_close_date: '',
      category_id: '',
      sub_category_id: '',
      product_id: '',
      product_name: '',
      product_processing_fee: '',
      product_monthly_subscription: '',
      software_requirements: '',
      selected_services: [],
      sold_by: 'Admin'
    })
    setSelectedCategoryId('')
    setSelectedSubCategoryId('')
    setSubcategories([])
    setProducts([])
    fetchGeneralServicesList()
    setIsCreateEditOpen(true)
  }

  const openEditModal = (lead) => {
    setEditingLead(lead)
    const isGc = lead.is_general_client || lead.category_id === 'general_client'
    const servicesList = lead.selected_services || (lead.software_requirements ? lead.software_requirements.split(',').map(s => s.trim()).filter(Boolean) : [])
    setLeadForm({
      client_name: lead.client_name || '',
      client_email: lead.client_email || '',
      client_phone: lead.client_phone || '',
      client_alternate_phone: lead.client_alternate_phone || '',
      company_name: lead.company_name || '',
      address: lead.address || '',
      city: lead.city || '',
      state: lead.state || '',
      pin_code: lead.pin_code || '',
      country: lead.country || 'India',
      country_code: lead.country_code || 'IN',
      gst_type: lead.gst_type || 'Intra-State',
      gstin: lead.gstin || '',
      referred_by: lead.referred_by || 'Direct / None',
      lead_source: lead.lead_source || 'Website',
      lead_status: lead.lead_status || 'new',
      lead_priority: lead.lead_priority || 'medium',
      notes: lead.notes || '',
      budget: lead.budget || '',
      expected_close_date: formatForDateTimeInput(lead.follow_up_date || lead.expected_close_date),
      category_id: isGc ? 'general_client' : (lead.category_id || ''),
      sub_category_id: lead.sub_category_id || '',
      product_id: lead.product_id || '',
      product_name: isGc ? (lead.software_requirements || 'General Client Services') : (lead.product_name || ''),
      product_processing_fee: lead.product_processing_fee || '',
      product_monthly_subscription: lead.product_monthly_subscription || '',
      software_requirements: lead.software_requirements || '',
      selected_services: servicesList,
      sold_by: lead.sold_by || 'Admin'
    })
    if (isGc) {
      setSelectedCategoryId('general_client')
      fetchGeneralServicesList()
    } else if (lead.category_id) {
      setSelectedCategoryId(lead.category_id)
      fetchSubcategories(lead.category_id)
      if (lead.sub_category_id) {
        setSelectedSubCategoryId(lead.sub_category_id)
        fetchProducts(lead.sub_category_id, lead.category_id)
      }
    } else {
      setSelectedCategoryId('')
      setSelectedSubCategoryId('')
      setSubcategories([])
      setProducts([])
    }
    setIsCreateEditOpen(true)
  }

  const cleanAndFixPhone = (val) => {
    if (!val) return ''
    let cleaned = val.replace(/\+/g, '').replace(/\s+/g, '')
    if (/^\d{10}$/.test(cleaned)) {
      cleaned = '91' + cleaned
    }
    return cleaned
  }

  const handleCreateEditSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const cleanedPhone = cleanAndFixPhone(leadForm.client_phone)
      const cleanedAltPhone = cleanAndFixPhone(leadForm.client_alternate_phone)

      // ── GENERAL CLIENT ROUTING ──
      if (leadForm.category_id === 'general_client') {
        const reqString = Array.isArray(leadForm.selected_services) && leadForm.selected_services.length > 0
          ? leadForm.selected_services.join(', ')
          : (leadForm.software_requirements || 'General Client Services')

        const genClientPayload = {
          client_name: leadForm.client_name,
          email: leadForm.client_email,
          contact_number: cleanedPhone,
          alt_contact_number: cleanedAltPhone || null,
          company_name: leadForm.company_name || leadForm.client_name,
          country_code: leadForm.country_code || 'IN',
          gst_type: leadForm.gst_type || 'Intra-State',
          gstin: leadForm.gstin || '',
          lead_source: leadForm.lead_source || 'Website',
          referred_by: leadForm.referred_by || 'Direct / None',
          software_requirements: reqString,
          sold_by: 'Admin',
          address: leadForm.address || '',
          city: leadForm.city || '',
          state: leadForm.state || '',
          pin_code: leadForm.pin_code || '',
          next_followup_date: leadForm.expected_close_date || null,
          status: 'Attended'
        }

        if (editingLead && editingLead.is_general_client) {
          await updateGeneralClient(editingLead.rawId, genClientPayload)
          triggerSuccess('General Client updated successfully.')
        } else {
          await createGeneralClient(genClientPayload)
          // Safely mirror to leads without 422 blocker
          try {
            await createLead({
              ...leadForm,
              client_phone: cleanedPhone,
              client_alternate_phone: cleanedAltPhone || null,
              category_id: null,
              category_name: 'General Client',
              product_name: reqString,
              product_interest: reqString,
              software_requirements: reqString,
              notes: `General Client: ${reqString}. ${leadForm.notes || ''}`,
              sold_by: 'Admin'
            })
          } catch (leadSyncErr) {
            console.warn('Standard lead mirror notice:', leadSyncErr)
          }
          triggerSuccess('General Client created successfully & reflected in directory.')
        }
        setIsCreateEditOpen(false)
        loadLeads()
        loadStats()
        return
      }

      // ── STANDARD SUBSCRIPTION PRODUCT ROUTING ──
      const payload = {
        ...leadForm,
        client_phone: cleanedPhone,
        client_alternate_phone: cleanedAltPhone || null,
        follow_up_date: leadForm.expected_close_date || null,
        sold_by: 'Admin'
      }
      if (editingLead) {
        await updateLead(editingLead.id, payload)
        triggerSuccess('Lead updated successfully.')
      } else {
        await createLead(payload)
        triggerSuccess('Lead created successfully.')
      }
      setIsCreateEditOpen(false)
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to submit lead form.')
    } finally {
      setSaving(false)
    }
  }

  const openStatusModal = (lead) => {
    setStatusLead(lead)
    setStatusForm({
      status: lead.lead_status || 'new',
      notes: '',
      lost_reason: lead.lost_reason || ''
    })
    setIsStatusModalOpen(true)
  }

  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    if (statusForm.status === 'lost' && !statusForm.lost_reason.trim()) {
      alert('Lost reason is required when marking a lead as lost.')
      return
    }
    try {
      setSaving(true)
      await updateLeadStatus(statusLead.id, statusForm)
      triggerSuccess('Lead status updated successfully.')
      setIsStatusModalOpen(false)
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to update lead status.')
    } finally {
      setSaving(false)
    }
  }

  const openActivityModal = (lead) => {
    setActivityLead(lead)
    setActivityForm({
      activity_type: 'call',
      description: '',
      notes: '',
      scheduled_date: ''
    })
    setIsActivityModalOpen(true)
  }

  const handleActivitySubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await addLeadActivity(activityLead.id, activityForm)
      triggerSuccess('Lead activity logged successfully.')
      setIsActivityModalOpen(false)
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to log lead activity.')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkAssign = async (e) => {
    e.preventDefault()
    if (selectedLeadIds.length === 0) return
    try {
      setSaving(true)
      await bulkAssignLeads({
        lead_ids: selectedLeadIds,
        assigned_to: Number(bulkAssignForm.assigned_to),
        notes: bulkAssignForm.notes
      })
      triggerSuccess(`${selectedLeadIds.length} lead(s) reassigned successfully.`)
      setIsBulkAssignOpen(false)
      setSelectedLeadIds([])
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to perform bulk assignment.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return
    try {
      if (String(id).startsWith('gc-')) {
        const rawId = String(id).replace('gc-', '')
        await deleteGeneralClient(rawId)
        triggerSuccess('General Client deleted successfully.')
      } else {
        await deleteLead(id)
        triggerSuccess('Lead deleted successfully.')
      }
      if (selectedDrawerLead?.id === id) {
        setSelectedDrawerLead(null)
      }
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to delete lead.')
    }
  }

  const getLatestRemark = (lead) => {
    if (lead.activities && lead.activities.length > 0) {
      const sorted = [...lead.activities].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      return sorted[0].notes || sorted[0].description || 'No remark details'
    }
    return lead.notes || 'No remarks logged'
  }

  const openFollowUpModal = (lead) => {
    setFollowUpLead(lead)
    setFollowUpForm({
      next_date: formatForDateTimeInput(lead.follow_up_date || lead.expected_close_date),
      status: lead.lead_status || 'new',
      remark: ''
    })
    setIsFollowUpModalOpen(true)
  }

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault()
    if (!followUpForm.next_date) {
      alert('Next follow-up date is required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        next_date: followUpForm.next_date,
        status: followUpForm.status,
        remark: followUpForm.remark,
        lost_reason: followUpForm.status === 'lost' ? followUpForm.remark : undefined
      }
      
      const res = await scheduleFollowUp(followUpLead.id, payload)
      if (res.data?.success) {
        triggerSuccess('Follow-up scheduled and updated successfully.')
        const newAct = res.data.data?.activity
        if (newAct) {
          setFollowUpLead(prev => prev ? {
            ...prev,
            follow_up_date: followUpForm.next_date,
            lead_status: followUpForm.status,
            activities: [newAct, ...(prev.activities || [])]
          } : null)
        }
        setIsFollowUpModalOpen(false)
        loadLeads()
        loadStats()
      } else {
        alert(res.data?.message || 'Failed to update follow-up details.')
      }
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to update follow-up details: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const openMailModal = (lead) => {
    setMailLead(lead)
    setMailForm({
      email: lead.client_email || '',
      subject: 'Exclusive Demo: AIM Digitalise School ERP & Management Software'
    })
    setIsMailModalOpen(true)
  }

  const handleSendMailSubmit = async (e) => {
    e.preventDefault()
    if (!mailForm.email.trim()) {
      alert('Recipient email address is required.')
      return
    }
    try {
      setSendingMail(true)
      await sendDemoEmail(mailLead.id, mailForm)
      triggerSuccess(`School software demo email sent to ${mailForm.email} successfully.`)
      setIsMailModalOpen(false)
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to send demo email.')
    } finally {
      setSendingMail(false)
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeadIds(leads.map(l => l.id))
    } else {
      setSelectedLeadIds([])
    }
  }

  const handleSelectLead = (id) => {
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const getStatusBadge = (status) => {
    const raw = (status || '').toLowerCase().trim()
    let label = 'NOT ATTENDED'
    let style = 'bg-amber-400/10 text-amber-400 border-amber-400/25'

    if (raw === 'attended' || raw === 'contacted') {
      label = 'ATTENDED'
      style = 'bg-blue-400/10 text-blue-400 border-blue-400/25'
    } else if (raw === 'not attended' || raw === 'not_attended' || raw === 'new') {
      label = 'NOT ATTENDED'
      style = 'bg-amber-400/10 text-amber-400 border-amber-400/25'
    } else if (raw === 'qualified') {
      label = 'QUALIFIED'
      style = 'bg-cyan-400/10 text-cyan-400 border-cyan-400/25'
    } else if (raw === 'qotation send' || raw === 'quotation send' || raw === 'quotation sent' || raw === 'quotation_sent' || raw === 'proposal') {
      label = 'QUOTATION SENT'
      style = 'bg-purple-400/10 text-purple-400 border-purple-400/25'
    } else if (raw === 'persuing to purchase' || raw === 'pursuing to purchase' || raw === 'pursuing_to_purchase' || raw === 'negotiation') {
      label = 'PERSUING TO PURCHASE'
      style = 'bg-orange-400/10 text-orange-400 border-orange-400/25'
    } else if (raw === 'order closed' || raw === 'order_closed' || raw === 'converted' || raw === 'closed') {
      label = 'ORDER CLOSED'
      style = 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25'
    } else if (raw === 'not interested' || raw === 'not_interested' || raw === 'lost' || raw === 'junk') {
      label = 'NOT INTERESTED'
      style = 'bg-rose-400/10 text-rose-400 border-rose-400/25'
    } else if (status) {
      label = status.toUpperCase()
      style = 'bg-gray-400/10 text-gray-400 border-gray-400/25'
    }

    return <span className={`inline-flex text-[9px] font-black uppercase tracking-wider border rounded-md px-2 py-0.5 ${style}`}>{label}</span>
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-500/15 text-red-400 border-red-500/30',
      high: 'bg-orange-400/10 text-orange-400 border-orange-400/25',
      medium: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/25',
      low: 'bg-blue-400/10 text-blue-400 border-blue-400/25'
    }
    const label = priority?.toUpperCase() || 'MEDIUM'
    const c = badges[priority] || badges.medium
    return <span className={`inline-flex text-[9px] font-black uppercase tracking-wider border rounded-md px-2 py-0.5 ${c}`}>{label}</span>
  }

  const getFollowUpStatus = (dateStr) => {
    if (!dateStr) return { type: 'none', label: 'Not Set', badge: 'bg-slate-100 text-slate-500 border-slate-200' }
    const cleanDateStr = dateStr.split(' ')[0]
    const target = new Date(cleanDateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    target.setHours(0, 0, 0, 0)

    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return {
        type: 'overdue',
        diffDays: Math.abs(diffDays),
        label: `Overdue by ${Math.abs(diffDays)}d`,
        formattedDate: cleanDateStr,
        badge: 'bg-red-500/10 text-red-600 border-red-300 font-bold'
      }
    } else if (diffDays === 0) {
      return {
        type: 'today',
        diffDays: 0,
        label: 'Due Today',
        formattedDate: cleanDateStr,
        badge: 'bg-amber-500/15 text-amber-700 border-amber-400 font-black'
      }
    } else if (diffDays <= 7) {
      return {
        type: 'upcoming',
        diffDays,
        label: `In ${diffDays}d`,
        formattedDate: cleanDateStr,
        badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-300 font-bold'
      }
    } else {
      return {
        type: 'future',
        diffDays,
        label: `In ${diffDays}d`,
        formattedDate: cleanDateStr,
        badge: 'bg-blue-500/10 text-blue-700 border-blue-200 font-medium'
      }
    }
  }

  // Follow-up tab filtered leads
  const followUpLeads = leads.filter(lead => {
    const fDate = lead.follow_up_date || lead.expected_close_date
    if (!fDate) return false
    const statusInfo = getFollowUpStatus(fDate)

    if (followUpFilterType === 'today' && statusInfo.type !== 'today') return false
    if (followUpFilterType === 'overdue' && statusInfo.type !== 'overdue') return false
    if (followUpFilterType === 'upcoming' && statusInfo.type !== 'upcoming' && statusInfo.type !== 'today') return false

    if (followUpPriority && lead.lead_priority !== followUpPriority) return false

    if (followUpSearch) {
      const q = followUpSearch.toLowerCase().trim()
      const matches =
        (lead.client_name && lead.client_name.toLowerCase().includes(q)) ||
        (lead.company_name && lead.company_name.toLowerCase().includes(q)) ||
        (lead.client_phone && lead.client_phone.toLowerCase().includes(q)) ||
        (lead.client_email && lead.client_email.toLowerCase().includes(q)) ||
        (lead.city && lead.city.toLowerCase().includes(q))
      if (!matches) return false
    }

    return true
  }).sort((a, b) => {
    const dateA = new Date((a.follow_up_date || a.expected_close_date).split(' ')[0])
    const dateB = new Date((b.follow_up_date || b.expected_close_date).split(' ')[0])
    return dateA - dateB
  })

  const followUpCounts = {
    today: leads.filter(l => getFollowUpStatus(l.follow_up_date || l.expected_close_date).type === 'today').length,
    overdue: leads.filter(l => getFollowUpStatus(l.follow_up_date || l.expected_close_date).type === 'overdue').length,
    upcoming: leads.filter(l => getFollowUpStatus(l.follow_up_date || l.expected_close_date).type === 'upcoming').length,
    total: leads.filter(l => Boolean(l.follow_up_date || l.expected_close_date)).length
  }

  return (
    <>
      <Helmet>
        <title>AIM Admin | Leads Management</title>
      </Helmet>

      {/* Main Container */}
      <div className="space-y-6 text-slate-800 font-sans">
        {/* Banner Alert Success Message */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-[100] bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg border border-emerald-400"
            >
              🎉 {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm px-6 pt-5 pb-3">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
            {[
              { id: 'leads', label: 'Leads' },
              { id: 'followup', label: 'Follow Up' },
              { id: 'proposal', label: 'Proposal' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-2.5 rounded-t-xl text-sm font-bold transition-all cursor-pointer border-t-2 ${activeTab === tab.id
                    ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-transparent'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB 1: LEADS DATABASE ── */}
        {activeTab === 'leads' && (
          <div>
            {!showQuotationBuilder ? (
              <div className="space-y-6">
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/85 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase">Leads Database</h1>
                  {isRevalidating && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full animate-pulse">
                      <span className="animate-spin text-xs">🔄</span> Syncing...
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Filter, track and manage system-wide client leads</p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    cachedAdminLeads = null
                    loadLeads(true)
                    loadStats(true)
                  }}
                  disabled={loading || isRevalidating}
                  title="Force refresh leads from server"
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-4 py-2.5 rounded-full shadow-sm cursor-pointer transition active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span className={loading || isRevalidating ? 'animate-spin inline-block' : ''}>🔄</span>
                  <span>Refresh</span>
                </button>
                {selectedLeadIds.length > 0 && (
                  <button
                    onClick={() => setIsBulkAssignOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs px-4.5 py-2.5 rounded-full shadow-sm cursor-pointer transition active:scale-[0.98]"
                  >
                    Reassign Selected ({selectedLeadIds.length})
                  </button>
                )}
                <button
                  onClick={openCreateModal}
                  className="bg-[#38b34a] hover:bg-[#2d963b] text-white font-black text-xs px-5 py-2.5 rounded-full shadow-sm cursor-pointer transition active:scale-[0.98] uppercase tracking-wider"
                >
                  + Create Lead
                </button>
              </div>
            </div>

            {/* METRICS STATS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Leads', value: statsLoading ? '...' : (stats?.total || 0), icon: '📋', color: 'indigo' },
                { label: 'Active Leads', value: statsLoading ? '...' : (stats?.active || 0), icon: '⚡', color: 'amber' },
                { label: 'Today Follow-up', value: statsLoading ? '...' : (stats?.follow_up_today || 0), icon: '📅', color: 'blue' },
                { label: 'Today Demo', value: statsLoading ? '...' : (stats?.today_demo || 0), icon: '🖥️', color: 'emerald' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200/85 shadow-sm flex items-center gap-4">
                  <span className="text-3xl shrink-0">{item.icon}</span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{item.label}</span>
                    <span className="text-xl font-black text-slate-800 mt-0.5 block">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* FILTERS & SEARCH CONTROL BAR */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/85 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search name, phone, company..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] pr-8"
                  />
                  {searchInput && (
                    <button
                      onClick={() => setSearchInput('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Creator / Brought By Filter */}
                <select
                  value={broughtByFilter}
                  onChange={e => { setBroughtByFilter(e.target.value); setPage(1) }}
                  className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs font-bold text-sky-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">👤 All Creator Types (Everyone)</option>
                  <option value="admin">🏢 Brought by Admin</option>
                  <option value="employee">👔 Brought by Employees</option>
                  <option value="partner">🤝 Brought by Partners</option>
                </select>

                {/* Date Order Filter */}
                <select
                  value={sortDir}
                  onChange={e => { setSortDir(e.target.value); setPage(1) }}
                  className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs font-bold text-blue-700 focus:outline-none cursor-pointer"
                >
                  <option value="desc">📅 Date Descending (Newest First)</option>
                  <option value="asc">📅 Date Ascending (Oldest First)</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                  className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-600 focus:outline-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="attended">Attended</option>
                      <option value="not attended">Not Attended</option>
                      <option value="qualified">Qualified</option>
                      <option value="qotation send">Quotation Sent</option>
                      <option value="persuing to purchase">Pursuing to Purchase</option>
                      <option value="order closed">Order Closed</option>
                      <option value="not interested">Not Interested</option>
                </select>

                {/* Priority Filter */}
                <select
                  value={priorityFilter}
                  onChange={e => { setPriorityFilter(e.target.value); setPage(1) }}
                  className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-600 focus:outline-none cursor-pointer"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-4 pt-1 border-t border-slate-100 text-xs font-bold text-slate-500">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={followUpToday}
                    onChange={e => { setFollowUpToday(e.target.checked); setPage(1) }}
                    className="w-4 h-4 rounded text-[#38b34a] border-slate-350 focus:ring-[#38b34a]"
                  />
                  <span>Follow-up Scheduled Today</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pendingFollowUp}
                    onChange={e => { setPendingFollowUp(e.target.checked); setPage(1) }}
                    className="w-4 h-4 rounded text-[#38b34a] border-slate-350 focus:ring-[#38b34a]"
                  />
                  <span>Pending Follow-ups (Overdue)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={todayDemo}
                    onChange={e => { setTodayDemo(e.target.checked); setPage(1) }}
                    className="w-4 h-4 rounded text-[#38b34a] border-slate-350 focus:ring-[#38b34a]"
                  />
                  <span>Demos Scheduled Today</span>
                </label>
              </div>
            </div>

            {/* MAIN LEADS DATA TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200/85 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-4 py-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={leads.length > 0 && selectedLeadIds.length === leads.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded text-[#38b34a] border-slate-300 focus:ring-[#38b34a]"
                        />
                      </th>
                      <th className="px-5 py-4 min-w-[220px]">Client Detail</th>
                      <th className="px-4 py-4 min-w-[140px] whitespace-nowrap">Status & Priority</th>
                      <th className="px-5 py-4 min-w-[200px]">Product Category</th>
                      <th className="px-4 py-4 min-w-[160px] max-w-xs">Last Logged Remarks</th>
                      <th className="px-4 py-4 text-center whitespace-nowrap min-w-[220px] w-56 sticky right-0 bg-slate-50 z-10 shadow-[-6px_0_12px_rgba(0,0,0,0.06)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-8 h-8 rounded-full border-4 border-slate-100 border-t-[#38b34a] animate-spin" />
                            <span>Loading leads database...</span>
                          </div>
                        </td>
                      </tr>
                    ) : leads.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold">
                          No matching leads found.
                        </td>
                      </tr>
                    ) : (
                      leads.map(lead => {
                        const isSelected = selectedLeadIds.includes(lead.id)
                        return (
                          <tr
                            key={lead.id}
                            className={`group hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-slate-50/90' : 'bg-white'}`}
                          >
                            <td className="px-4 py-4 text-center w-12">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectLead(lead.id)}
                                className="w-4 h-4 rounded text-[#38b34a] border-slate-300 focus:ring-[#38b34a]"
                              />
                            </td>
                            <td className="px-5 py-4 min-w-[220px]">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    onClick={() => setSelectedDrawerLead(lead)}
                                    className="font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer block text-sm transition-colors"
                                  >
                                    {lead.company_name || lead.client_name}
                                  </span>
                                  {lead.is_general_client && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                                      💼 General Client
                                    </span>
                                  )}
                                  {renderCreatorBadge(lead.sold_by || lead.employee?.employee_id || lead.employee?.full_name || lead.employee_id || 'Admin', lead)}
                                </div>
                                <span className="text-slate-400 font-medium block mt-0.5">
                                  {lead.client_name && lead.company_name && lead.client_name !== lead.company_name ? `👤 ${lead.client_name} · ` : ''}
                                  {lead.client_phone}
                                </span>
                                {(lead.is_general_client || lead.category_name === 'General Client' || lead.category_id === 'general_client') && (
                                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenQuotationBuilder(lead)}
                                      className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition shadow-xs"
                                    >
                                      <span>📝</span>
                                      <span>+ Quotation</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleViewClientQuotations(lead)}
                                      className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition shadow-xs"
                                    >
                                      <span>📋</span>
                                      <span>Quotes</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 min-w-[140px] whitespace-nowrap">
                              <div className="flex flex-wrap gap-1.5">
                                {getStatusBadge(lead.lead_status)}
                                {getPriorityBadge(lead.lead_priority)}
                              </div>
                            </td>
                            <td className="px-5 py-4 min-w-[200px]">
                              <div>
                                <span className="font-bold text-slate-700 block">
                                  {lead.is_general_client ? `General Client (${lead.software_requirements || 'Services'})` : (lead.product_name || 'Generic Inquiry')}
                                </span>
                                {lead.follow_up_date && (
                                  <span className="text-[10px] text-amber-500 font-bold mt-0.5 block">
                                    📅 Next F/Up: {formatFollowUpDisplay(lead.follow_up_date)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 min-w-[160px] max-w-xs">
                              <p className="truncate text-slate-400 font-medium" title={getLatestRemark(lead)}>
                                {getLatestRemark(lead)}
                              </p>
                            </td>
                            <td className={`px-4 py-4 text-center whitespace-nowrap min-w-[220px] w-56 sticky right-0 transition-colors shadow-[-6px_0_12px_rgba(0,0,0,0.06)] ${isSelected ? 'bg-slate-50' : 'bg-white group-hover:bg-slate-50'}`}>
                              <div className="flex items-center justify-center gap-1">
                                {(lead.is_general_client || lead.category_name === 'General Client' || lead.category_id === 'general_client') && (
                                  <>
                                    <button
                                      onClick={() => handleOpenQuotationBuilder(lead)}
                                      title="Create Quotation"
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition cursor-pointer font-bold"
                                    >
                                      📝
                                    </button>
                                    <button
                                      onClick={() => handleViewClientQuotations(lead)}
                                      title="View Client Quotations"
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer font-bold"
                                    >
                                      📋
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => openFollowUpModal(lead)}
                                  title="Schedule Follow-up"
                                  className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer"
                                >
                                  📅
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedLeadForAssign(lead)
                                    setShowAssignModal(true)
                                    setSelectedDate('')
                                  }}
                                  title="Book Demo Slot"
                                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                                >
                                  🖥️
                                </button>
                                <button
                                  onClick={() => openMailModal(lead)}
                                  title="Send Demo Email"
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                                >
                                  ✉️
                                </button>
                                <button
                                  onClick={() => openEditModal(lead)}
                                  title="Edit Lead"
                                  className="p-1.5 text-slate-500 hover:text-[#38b34a] hover:bg-green-50 rounded-xl transition cursor-pointer"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => openStatusModal(lead)}
                                  title="Change Status"
                                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                                >
                                  🛡️
                                </button>
                                <button
                                  onClick={() => handleDeleteLead(lead.id)}
                                  title="Delete Lead"
                                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Page {page}</span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    Previous
                  </button>
                  <button
                    disabled={leads.length < 15}
                    onClick={() => setPage(prev => prev + 1)}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
              /* Dynamic Quotation Builder UI (Matching Users.jsx Image 2 Exactly) */
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-6 animate-fade-in">
                {/* Builder Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-200 gap-3">
                  <div>
                    <h2 className="text-xl font-black text-[#1e3e6b] flex items-center gap-2">
                      <span>{selectedGenClient?.company_name || selectedGenClient?.client_name}</span>
                    </h2>
                    <div className="text-xs text-slate-500 font-medium mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>
                        Client: <strong className="text-slate-800">{selectedGenClient?.client_name || selectedGenClient?.company_name}</strong>
                      </span>
                      <span>|</span>
                      <span>
                        ID:{' '}
                        <code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold">
                          {selectedGenClient?.client_id || `GC-${selectedGenClient?.id}`}
                        </code>
                      </span>
                      {(selectedGenClient?.contact_person || selectedGenClient?.client_name) && (
                        <>
                          <span>|</span>
                          <span>Contact Person: <strong className="text-slate-700">{selectedGenClient?.contact_person || selectedGenClient?.client_name}</strong></span>
                        </>
                      )}
                      {selectedGenClient?.contact_number && (
                        <>
                          <span>|</span>
                          <span>Contact: <strong className="text-slate-700">{selectedGenClient?.contact_number}</strong></span>
                        </>
                      )}
                      {selectedGenClient?.email && (
                        <>
                          <span>|</span>
                          <span>Email: <strong className="text-slate-700">{selectedGenClient?.email}</strong></span>
                        </>
                      )}
                      <span>|</span>
                      <span>Executive: <strong className="text-slate-700">{selectedGenClient?.sold_by_name || 'Admin Sales'}</strong></span>
                      <span>|</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Status: {selectedGenClient?.status || 'Attended'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowQuotationBuilder(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    ← Back to Leads Directory
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column (2 Cols): Quotation Details + Line Items */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Box 2: Quotation Parameters Form */}
                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                      <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">QUOTATION PARAMETERS:</h3>
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
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">
                            Payment Terms <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <div className="space-y-1.5">
                            <select
                              value={
                                ['Full payments in Advanced', '60% advanced, 40% on delivery', 'Due on receipt'].includes(quotationForm.payment_terms)
                                  ? quotationForm.payment_terms
                                  : quotationForm.payment_terms
                                  ? 'Custom'
                                  : ''
                              }
                              onChange={(e) => {
                                if (e.target.value !== 'Custom') {
                                  setQuotationForm({ ...quotationForm, payment_terms: e.target.value })
                                }
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:border-[#38b34a] shadow-sm"
                            >
                              <option value="">-- Select Payment Terms --</option>
                              <option value="Full payments in Advanced">Full payments in Advanced</option>
                              <option value="60% advanced, 40% on delivery">60% advanced, 40% on delivery</option>
                              <option value="Due on receipt">Due on receipt</option>
                              <option value="Custom">✏️ Custom / Edit Terms</option>
                            </select>
                            <input
                              type="text"
                              value={quotationForm.payment_terms || ''}
                              onChange={(e) => setQuotationForm({ ...quotationForm, payment_terms: e.target.value })}
                              placeholder="Select or enter payment terms [Mandatory]"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:border-[#38b34a] shadow-sm"
                            />
                          </div>
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
                            className="w-full bg-[#ffffff] border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-[#38b34a]"
                          >
                            <option value="Intra-State">Intra-State (CGST 9% + SGST 9%)</option>
                            <option value="Inter-State">Inter-State (IGST 18%)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Client GSTIN / Tax ID</label>
                          <input
                            type="text"
                            placeholder="e.g. 36AACTM775F1ZP"
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

                    {/* Rich Text Editor for Annexure */}
                    {quotationForm.anexture === 'YES' && (
                      <RichAnnexureEditor
                        value={quotationForm.anexture_content || ''}
                        onChange={(val) => setQuotationForm((prev) => ({ ...prev, anexture_content: val }))}
                        theme="light"
                      />
                    )}

                    {/* Box 3: Line Items Table */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                          QUOTATION LINE ITEMS ({quotationItems.length})
                        </h3>
                        <button
                          type="button"
                          onClick={handleAddEmptyItem}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 shadow-sm transition-all cursor-pointer"
                        >
                          + Add Custom Line Item
                        </button>
                      </div>

                      {quotationItems.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 space-y-2">
                          <span className="text-3xl block">📦</span>
                          <p className="text-xs font-bold">No items added to quotation yet.</p>
                          <p className="text-[11px] text-slate-400">
                            Click any item from the catalog on the right or click "+ Add Custom Line Item" above.
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
                                    className="text-rose-500 hover:text-rose-700 text-xs font-bold hover:underline cursor-pointer"
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
                                      placeholder="e.g. Ref by Prakash Sir / Mobile App"
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
                                    placeholder="Custom specifications and scope for line item..."
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

                  {/* Right Column (1 Col): Services Database Sidebar + Totals */}
                  <div className="space-y-6">
                    {/* Services Database Sidebar */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div>
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <span>🎯</span>
                            <span>SERVICES DATABASE ({generalServices.length})</span>
                          </h3>
                          <p className="text-[10px] text-slate-400 font-medium">Click to add services to line items</p>
                        </div>
                      </div>

                      {/* Search Catalog */}
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

                      {/* Services Catalog Cards List */}
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
                    {(() => {
                      const totals = computeQuotationTotals()
                      return (
                        <div className="bg-white border-2 border-[#1e3e6b]/20 rounded-2xl p-5 shadow-lg space-y-4">
                          <h3 className="text-sm font-black text-[#1e3e6b] uppercase tracking-wider border-b border-slate-100 pb-2">
                            FINANCIAL SUMMARY
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

                          <div className="pt-2">
                            <button
                              type="button"
                              disabled={savingQuotation || quotationItems.length === 0}
                              onClick={(e) => handleSaveQuotation(e, true)}
                              className="w-full py-3.5 bg-gradient-to-r from-[#38b34a] to-emerald-600 hover:from-[#329f42] hover:to-emerald-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>⚡</span>
                              <span>{savingQuotation ? 'Processing...' : 'SAVE & GENERATE PAYMENT LINK'}</span>
                            </button>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: FOLLOWUP PIPELINE ── */}
        {activeTab === 'followup' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/85 shadow-sm">
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase">Follow-up Pipeline</h1>
                <p className="text-xs text-slate-400 mt-0.5">Track and action customer follow-up schedules, overdue timelines, and reminders</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => { loadLeads(); loadStats(); }}
                  disabled={loading}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className={loading ? 'animate-spin inline-block' : ''}>🔄</span>
                  <span>Refresh Pipeline</span>
                </button>
                <button
                  onClick={openCreateModal}
                  className="bg-[#38b34a] hover:bg-[#2d963b] text-white font-black text-xs px-5 py-2.5 rounded-full shadow-sm cursor-pointer transition active:scale-[0.98] uppercase tracking-wider"
                >
                  + Create Lead
                </button>
              </div>
            </div>

            {/* Follow-up Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setFollowUpFilterType('today')}
                className={`bg-white p-5 rounded-3xl border shadow-sm flex items-center gap-4 cursor-pointer transition-all ${followUpFilterType === 'today' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200/85 hover:border-amber-300'}`}
              >
                <span className="text-3xl shrink-0">📅</span>
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">Due Today</span>
                  <span className="text-2xl font-black text-slate-800 mt-0.5 block">{followUpCounts.today}</span>
                </div>
              </div>

              <div
                onClick={() => setFollowUpFilterType('overdue')}
                className={`bg-white p-5 rounded-3xl border shadow-sm flex items-center gap-4 cursor-pointer transition-all ${followUpFilterType === 'overdue' ? 'border-red-400 ring-2 ring-red-400/20' : 'border-slate-200/85 hover:border-red-300'}`}
              >
                <span className="text-3xl shrink-0">⚠️</span>
                <div>
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block">Overdue Follow-ups</span>
                  <span className="text-2xl font-black text-red-600 mt-0.5 block">{followUpCounts.overdue}</span>
                </div>
              </div>

              <div
                onClick={() => setFollowUpFilterType('upcoming')}
                className={`bg-white p-5 rounded-3xl border shadow-sm flex items-center gap-4 cursor-pointer transition-all ${followUpFilterType === 'upcoming' ? 'border-emerald-400 ring-2 ring-emerald-400/20' : 'border-slate-200/85 hover:border-emerald-300'}`}
              >
                <span className="text-3xl shrink-0">⏰</span>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Upcoming (7 Days)</span>
                  <span className="text-2xl font-black text-slate-800 mt-0.5 block">{followUpCounts.upcoming}</span>
                </div>
              </div>

              <div
                onClick={() => setFollowUpFilterType('all')}
                className={`bg-white p-5 rounded-3xl border shadow-sm flex items-center gap-4 cursor-pointer transition-all ${followUpFilterType === 'all' ? 'border-indigo-400 ring-2 ring-indigo-400/20' : 'border-slate-200/85 hover:border-indigo-300'}`}
              >
                <span className="text-3xl shrink-0">📊</span>
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Total Pipeline</span>
                  <span className="text-2xl font-black text-slate-800 mt-0.5 block">{followUpCounts.total}</span>
                </div>
              </div>
            </div>

            {/* Follow-up Sub-Filters */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/85 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Date Quick Filter Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'All Scheduled', count: followUpCounts.total },
                    { id: 'today', label: 'Due Today', count: followUpCounts.today },
                    { id: 'overdue', label: 'Overdue', count: followUpCounts.overdue },
                    { id: 'upcoming', label: 'Next 7 Days', count: followUpCounts.upcoming }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFollowUpFilterType(f.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${followUpFilterType === f.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                    >
                      <span>{f.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${followUpFilterType === f.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-2">
                  <select
                    value={followUpPriority}
                    onChange={e => setFollowUpPriority(e.target.value)}
                    className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-600 focus:outline-none cursor-pointer"
                  >
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Search input */}
              <div>
                <input
                  type="text"
                  placeholder="Search follow-up lead by client name, organization, phone, or email..."
                  value={followUpSearch}
                  onChange={e => setFollowUpSearch(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                />
              </div>
            </div>

            {/* Follow-up Leads List Table */}
            <div className="bg-white rounded-3xl border border-slate-200/85 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1050px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-4 min-w-[200px]">Client / Institution</th>
                      <th className="px-4 py-4 min-w-[140px] whitespace-nowrap">Quick Contact</th>
                      <th className="px-4 py-4 min-w-[140px] whitespace-nowrap">Scheduled Date</th>
                      <th className="px-4 py-4 min-w-[130px] whitespace-nowrap">Status & Priority</th>
                      <th className="px-4 py-4 min-w-[160px] max-w-xs">Discussion / Remarks</th>
                      <th className="px-4 py-4 text-center whitespace-nowrap min-w-[220px] w-56 sticky right-0 bg-slate-50 z-10 shadow-[-6px_0_12px_rgba(0,0,0,0.06)]">Follow-up Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-8 h-8 rounded-full border-4 border-slate-100 border-t-[#38b34a] animate-spin" />
                            <span>Loading follow-up pipeline...</span>
                          </div>
                        </td>
                      </tr>
                    ) : followUpLeads.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold">
                          <div className="flex flex-col items-center justify-center gap-2 py-4">
                            <span className="text-3xl">📞</span>
                            <span className="text-slate-600 font-bold text-sm">No follow-ups matching this filter.</span>
                            <p className="text-slate-400 text-xs max-w-sm">Schedule a follow-up date for any lead in the Leads tab to track them in this pipeline.</p>
                            <button
                              onClick={() => handleTabChange('leads')}
                              className="mt-2 px-4 py-2 bg-[#38b34a] text-white rounded-full text-xs font-bold cursor-pointer"
                            >
                              Go to Leads Database
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      followUpLeads.map(lead => {
                        const fDate = lead.follow_up_date || lead.expected_close_date
                        const statusInfo = getFollowUpStatus(fDate)
                        const rawPhone = lead.client_phone ? cleanAndFixPhone(lead.client_phone) : ''
                        return (
                          <tr key={lead.id} className="group hover:bg-slate-50/70 transition-colors">
                            {/* Client & Organization */}
                            <td className="px-5 py-4 min-w-[200px]">
                              <div>
                                <span
                                  onClick={() => setSelectedDrawerLead(lead)}
                                  className="font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer block text-sm transition-colors"
                                >
                                  {lead.company_name || lead.client_name}
                                </span>
                                <span className="text-slate-400 font-medium block mt-0.5">
                                  {lead.client_name && lead.company_name && lead.client_name !== lead.company_name ? `👤 ${lead.client_name} · ` : ''}
                                  {lead.city ? `${lead.city}, ` : ''}{lead.state || 'India'}
                                </span>
                              </div>
                            </td>

                            {/* Quick Contact buttons */}
                            <td className="px-4 py-4 min-w-[140px] whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                {rawPhone ? (
                                  <>
                                    <a
                                      href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(`Hello ${lead.client_name || lead.company_name || ''}, regarding your inquiry with AIM Digitalise...`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl font-bold transition text-xs flex items-center gap-1 cursor-pointer"
                                      title="Open WhatsApp chat"
                                    >
                                      <span>💬</span>
                                    </a>
                                    <a
                                      href={`tel:${rawPhone}`}
                                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl font-bold transition text-xs flex items-center gap-1 cursor-pointer"
                                      title="Call via softphone / mobile"
                                    >
                                      <span>📞</span>
                                    </a>
                                  </>
                                ) : (
                                  <span className="text-slate-300 italic text-[11px]">No phone</span>
                                )}
                              </div>
                            </td>

                            {/* Scheduled Date */}
                            <td className="px-4 py-4 min-w-[140px] whitespace-nowrap">
                              <div>
                                <span className="font-bold text-slate-800 block">
                                  {formatFollowUpDisplay(fDate)}
                                </span>
                                {statusInfo && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border mt-1 ${statusInfo.badge}`}>
                                    <span>{statusInfo.icon}</span>
                                    <span>{statusInfo.label}</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Status & Priority */}
                            <td className="px-4 py-4 min-w-[130px] whitespace-nowrap">
                              <div className="space-y-1">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200 inline-block uppercase">
                                  {lead.status || 'New'}
                                </span>
                                {lead.priority && (
                                  <div>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${lead.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                                      lead.priority === 'high' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        lead.priority === 'medium' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                          'bg-slate-50 text-slate-600 border-slate-200'
                                      }`}>
                                      {lead.priority}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Discussion / Remarks */}
                            <td className="px-4 py-4 min-w-[160px] max-w-xs">
                              <p className="text-slate-600 text-xs line-clamp-2 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                                "{lead.follow_up_remark || lead.remarks || lead.notes || 'No remarks recorded yet.'}"
                              </p>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4 text-center whitespace-nowrap min-w-[220px] w-56 sticky right-0 bg-white group-hover:bg-slate-50/70 z-10 shadow-[-6px_0_12px_rgba(0,0,0,0.06)]">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => openFollowUpModal(lead)}
                                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
                                >
                                  <span>📅</span>
                                  <span>Log / Reschedule</span>
                                </button>
                                <button
                                  onClick={() => openStatusModal(lead)}
                                  title="Change Status"
                                  className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                                >
                                  🛡️
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedLeadForAssign(lead)
                                    setShowAssignModal(true)
                                    setSelectedDate('')
                                  }}
                                  title="Book Demo Slot"
                                  className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                                >
                                  🖥️
                                </button>
                                <button
                                  onClick={() => openMailModal(lead)}
                                  title="Send Demo Email"
                                  className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                                >
                                  ✉️
                                </button>
                                <button
                                  onClick={() => openEditModal(lead)}
                                  title="Edit Lead"
                                  className="p-1.5 text-slate-400 hover:text-[#38b34a] hover:bg-slate-50 rounded-xl transition cursor-pointer"
                                >
                                  ✏️
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: THE PROPOSAL ── */}
        {activeTab === 'proposal' && (
          <div className="space-y-6">
            <AdminProposals />
          </div>
        )}
      </div>

      {/* CREATE & EDIT LEAD MODAL */}
      <AnimatePresence>
        {isCreateEditOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-250 shadow-2xl w-full max-w-4xl p-6 sm:p-8 text-left text-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <h3 className="text-lg font-black text-slate-850 uppercase">
                  {editingLead ? 'Modify Client Lead' : 'Register New Lead'}
                </h3>
                <button
                  onClick={() => setIsCreateEditOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateEditSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Client Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={leadForm.client_name}
                      onChange={e => setLeadForm(prev => ({ ...prev, client_name: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  {/* Client Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={leadForm.client_phone}
                      onChange={e => setLeadForm(prev => ({ ...prev, client_phone: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  {/* Client Alternate Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Alternative Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543211"
                      value={leadForm.client_alternate_phone}
                      onChange={e => setLeadForm(prev => ({ ...prev, client_alternate_phone: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  {/* Client Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@company.com"
                      value={leadForm.client_email}
                      onChange={e => setLeadForm(prev => ({ ...prev, client_email: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Company / Org. Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={leadForm.company_name}
                      onChange={e => setLeadForm(prev => ({ ...prev, company_name: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  {/* GST Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">GST No. (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 19AAAAA0000A1Z5"
                      value={leadForm.gstin || ''}
                      onChange={e => setLeadForm(prev => ({ ...prev, gstin: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  {/* Address block (RESIDENCE SETUP) */}
                  <div className="md:col-span-2 border-t border-slate-100 pt-3 space-y-3">
                    <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest">RESIDENCE SETUP</h4>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">STREET ADDRESS</label>
                      <input
                        type="text"
                        placeholder="Building, street name"
                        value={leadForm.address}
                        onChange={e => setLeadForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">CITY</label>
                        <input
                          type="text"
                          placeholder="City"
                          value={leadForm.city}
                          onChange={e => setLeadForm(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">STATE</label>
                        <input
                          type="text"
                          placeholder="State"
                          value={leadForm.state}
                          onChange={e => setLeadForm(prev => ({ ...prev, state: e.target.value }))}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">PIN CODE</label>
                        <input
                          type="text"
                          placeholder="Zip"
                          value={leadForm.pin_code}
                          onChange={e => setLeadForm(prev => ({ ...prev, pin_code: e.target.value }))}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category dropdown */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Product Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCategoryId}
                      onChange={handleCategoryChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{formatCategoryDisplayName(c.name)}</option>
                      ))}
                      <option value="general_client">General Services</option>
                    </select>
                  </div>

                  {/* Dynamic Fields based on Category */}
                  {selectedCategoryId === 'general_client' ? (
                    <div className="sm:col-span-2 bg-sky-50/70 border border-sky-200 rounded-2xl p-4 space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-sky-100 flex-wrap gap-2">
                        <h5 className="text-xs font-black text-sky-900 flex items-center gap-1.5">
                          <span>📄 General Client Information (Non-Subscription)</span>
                        </h5>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full">
                          💡 Stored in General Clients & Leads
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Country</label>
                          <select
                            value={leadForm.country_code}
                            onChange={e => setLeadForm(prev => ({ ...prev, country_code: e.target.value, country: e.target.value === 'IN' ? 'India' : (e.target.value === 'NP' ? 'Nepal' : 'Bhutan') }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
                          >
                            <option value="IN">🇮🇳 India (IN)</option>
                            <option value="NP">🇳🇵 Nepal (NP)</option>
                            <option value="BT">🇧🇹 Bhutan (BT)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">GST Supply Type</label>
                          <select
                            value={leadForm.gst_type}
                            onChange={e => setLeadForm(prev => ({ ...prev, gst_type: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
                          >
                            <option value="Intra-State">Intra-State (CGST 9% + SGST 9%)</option>
                            <option value="Inter-State">Inter-State (IGST 18%)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Referred By</label>
                          <select
                            value={leadForm.referred_by}
                            onChange={e => setLeadForm(prev => ({ ...prev, referred_by: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
                          >
                            <option value="Direct / None">Direct / None</option>
                            <option value="Existing Client">Existing Client</option>
                            <option value="Partner / Agent">Partner / Agent</option>
                            <option value="Employee">Employee</option>
                            <option value="Social Media Ad">Social Media Ad</option>
                          </select>
                        </div>
                      </div>

                      {/* Software / Service Requirements Checkboxes */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                          <label className="text-[10px] font-bold text-slate-600">
                            Software / Service Requirements (Select items for custom quotation):
                          </label>
                          <span className="text-[10px] text-sky-700 font-bold">
                            {leadForm.selected_services?.length || 0} selected
                          </span>
                        </div>

                        <div className="relative mb-2">
                          <input
                            type="text"
                            value={serviceSearchTerm}
                            onChange={(e) => setServiceSearchTerm(e.target.value)}
                            placeholder="Search services by name..."
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                          />
                          {serviceSearchTerm && (
                            <button
                              type="button"
                              onClick={() => setServiceSearchTerm('')}
                              className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {loadingGeneralServices ? (
                          <div className="p-3 text-center text-xs text-slate-400">Loading catalog services...</div>
                        ) : filteredGeneralServices.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                            No matching services found. Add services in General Client panel.
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-xl p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                            {filteredGeneralServices.map(srv => {
                              const sName = srv.name || srv.service_name
                              const isSelected = (leadForm.selected_services || []).includes(sName)
                              return (
                                <label
                                  key={srv.id}
                                  className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition ${
                                    isSelected ? 'bg-sky-50 border-sky-300 font-bold text-slate-800' : 'bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={e => {
                                        let list = [...(leadForm.selected_services || [])]
                                        if (e.target.checked) {
                                          if (!list.includes(sName)) list.push(sName)
                                        } else {
                                          list = list.filter(item => item !== sName)
                                        }
                                        setLeadForm(prev => ({
                                          ...prev,
                                          selected_services: list,
                                          software_requirements: list.join(', ')
                                        }))
                                      }}
                                      className="w-3.5 h-3.5 rounded text-sky-600 accent-sky-600"
                                    />
                                    <span className="truncate">{sName}</span>
                                  </div>
                                  <span className="text-emerald-600 font-mono font-bold text-[11px] shrink-0 ml-2">
                                    ₹{Number(srv.selling_price || srv.service_price || 0).toLocaleString('en-IN')}
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Subcategory dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Subcategory</label>
                        <select
                          value={selectedSubCategoryId}
                          onChange={handleSubCategoryChange}
                          disabled={!selectedCategoryId}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none disabled:opacity-50 cursor-pointer"
                        >
                          <option value="">Select Subcategory</option>
                          {subcategories.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Product selection */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Product Package</label>
                        <select
                          value={leadForm.product_id}
                          onChange={handleProductSelect}
                          disabled={!selectedSubCategoryId}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none disabled:opacity-50 cursor-pointer"
                        >
                          <option value="">Select Product Package</option>
                          {(Array.isArray(products) ? products : []).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Budget */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Estimated Budget</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹25,000"
                          value={leadForm.budget}
                          onChange={e => setLeadForm(prev => ({ ...prev, budget: e.target.value }))}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                        />
                      </div>
                    </>
                  )}

                  {/* Lead Source */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Lead Source</label>
                    <select
                      value={leadForm.lead_source || 'website'}
                      onChange={e => setLeadForm(prev => ({ ...prev, lead_source: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer"
                    >
                      <option value="facebook">facebook</option>
                      <option value="google">google</option>
                      <option value="GMB">GMB</option>
                      <option value="indiamart">indiamart</option>
                      <option value="field visit">field visit</option>
                      <option value="cold calling">cold calling</option>
                      <option value="telecalling">telecalling</option>
                      <option value="website">website</option>
                      <option value="referral">referral</option>
                      <option value="others">others</option>
                    </select>
                  </div>

                  {/* Follow-up target date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Initial Follow-up Date</label>
                    <input type="datetime-local" min={new Date().toISOString().slice(0, 10) + 'T00:00'} value={leadForm.expected_close_date}
                      onChange={e => setLeadForm(prev => ({ ...prev, expected_close_date: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-750 focus:outline-none cursor-pointer"
                    />
                  </div>

                                    {/* Lead Status */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Lead Status</label>
                    <select
                      value={leadForm.lead_status || 'new'}
                      onChange={e => setLeadForm(prev => ({ ...prev, lead_status: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer"
                    >
                      <option value="attended">Attended</option>
                      <option value="not attended">Not Attended</option>
                      <option value="qualified">Qualified</option>
                      <option value="qotation send">Quotation Sent</option>
                      <option value="persuing to purchase">Pursuing to Purchase</option>
                      <option value="order closed">Order Closed</option>
                      <option value="not interested">Not Interested</option>
                    </select>
                  </div>

                  {/* Lead Priority */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Lead Priority</label>
                    <select
                      value={leadForm.lead_priority}
                      onChange={e => setLeadForm(prev => ({ ...prev, lead_priority: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Notes/Remarks */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">General Summary / Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Describe details regarding customer's inquiry and context..."
                    value={leadForm.notes}
                    onChange={e => setLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-750 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateEditOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-full bg-[#38b34a] hover:bg-[#2d963b] text-white font-black text-xs cursor-pointer shadow-sm disabled:opacity-50 transition"
                  >
                    {saving ? 'Saving...' : 'Submit Details'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHANGE STATUS MODAL */}
      <AnimatePresence>
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-left text-slate-800"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black uppercase text-slate-800">Update Lead Status</h3>
                <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
              </div>
              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Select Status</label>
                  <select
                    value={statusForm.status}
                    onChange={e => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer"
                  >
                    <option value="attended">Attended</option>
                      <option value="not attended">Not Attended</option>
                      <option value="qualified">Qualified</option>
                      <option value="qotation send">Quotation Sent</option>
                      <option value="persuing to purchase">Pursuing to Purchase</option>
                      <option value="order closed">Order Closed</option>
                      <option value="not interested">Not Interested</option>
                  </select>
                </div>

                {statusForm.status === 'lost' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Reason for Loss <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Why was the lead lost?"
                      value={statusForm.lost_reason}
                      onChange={e => setStatusForm(prev => ({ ...prev, lost_reason: e.target.value }))}
                      required
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Log notes/updates</label>
                  <textarea
                    rows="2.5"
                    placeholder="Log status update details..."
                    value={statusForm.notes}
                    onChange={e => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 bg-[#38b34a] hover:bg-[#2d963b] text-white font-bold text-xs rounded-full cursor-pointer shadow-sm transition">{saving ? 'Updating...' : 'Update Status'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHEDULE FOLLOW-UP MODAL */}
      <AnimatePresence>
        {isFollowUpModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-left text-slate-800"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black uppercase text-slate-800">Schedule Follow-up</h3>
                <button onClick={() => setIsFollowUpModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
              </div>
              <form onSubmit={handleFollowUpSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Next Follow-up Date <span className="text-red-500">*</span></label>
                  <input type="datetime-local" min={new Date().toISOString().slice(0, 10) + 'T00:00'} required value={followUpForm.next_date}
                    onChange={e => setFollowUpForm(prev => ({ ...prev, next_date: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-750 focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Update Status (Optional)</label>
                  <select
                    value={followUpForm.status}
                    onChange={e => setFollowUpForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer"
                  >
                    <option value="attended">Attended</option>
                      <option value="not attended">Not Attended</option>
                      <option value="qualified">Qualified</option>
                      <option value="qotation send">Quotation Sent</option>
                      <option value="persuing to purchase">Pursuing to Purchase</option>
                      <option value="order closed">Order Closed</option>
                      <option value="not interested">Not Interested</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Remarks/Agenda</label>
                  <textarea
                    rows="2.5"
                    placeholder="Log detail updates or follow-up goals..."
                    value={followUpForm.remark}
                    onChange={e => setFollowUpForm(prev => ({ ...prev, remark: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsFollowUpModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 bg-[#38b34a] hover:bg-[#2d963b] text-white font-bold text-xs rounded-full cursor-pointer shadow-sm transition">{saving ? 'Scheduling...' : 'Save Follow-up'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOG ACTIVITY MODAL */}
      <AnimatePresence>
        {isActivityModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-left text-slate-800"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black uppercase text-slate-800">Log Lead Activity</h3>
                <button onClick={() => setIsActivityModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
              </div>
              <form onSubmit={handleActivitySubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Activity Type</label>
                  <select
                    value={activityForm.activity_type}
                    onChange={e => setActivityForm(prev => ({ ...prev, activity_type: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer"
                  >
                    <option value="call">Phone Call 📞</option>
                    <option value="email">Email Sent ✉️</option>
                    <option value="meeting">In-Person Meeting 🤝</option>
                    <option value="follow_up">Scheduled Follow-up 📅</option>
                    <option value="note">General Notes 📝</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Brief Description <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Discussed pricing details..."
                    required
                    value={activityForm.description}
                    onChange={e => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 focus:outline-none focus:border-[#38b34a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Activity Date</label>
                  <input
                    type="date"
                    value={activityForm.scheduled_date}
                    onChange={e => setActivityForm(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-750 focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Remarks/Notes</label>
                  <textarea
                    rows="2.5"
                    placeholder="Log activity details..."
                    value={activityForm.notes}
                    onChange={e => setActivityForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsActivityModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 bg-[#38b34a] hover:bg-[#2d963b] text-white font-bold text-xs rounded-full cursor-pointer shadow-sm transition">{saving ? 'Logging...' : 'Log Activity'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SEND EMAIL MODAL */}
      <AnimatePresence>
        {isMailModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 text-left text-slate-800"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black uppercase text-slate-800">Send Demo Email</h3>
                <button onClick={() => setIsMailModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
              </div>
              <form onSubmit={handleSendMailSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Recipient Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={mailForm.email}
                    onChange={e => setMailForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 focus:outline-none focus:border-[#38b34a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Email Subject</label>
                  <input
                    type="text"
                    required
                    value={mailForm.subject}
                    onChange={e => setMailForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 focus:outline-none focus:border-[#38b34a]"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-slate-400 font-medium">
                  <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Included Attachments & Content</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Complimentary AIM School ERP Brochure & PDF Catalogue</li>
                    <li>SaaS Platform activation agreements & onboarding timelines</li>
                    <li>System requirements & login guidelines</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsMailModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={sendingMail} className="px-5 py-2 bg-[#38b34a] hover:bg-[#2d963b] text-white font-bold text-xs rounded-full cursor-pointer shadow-sm transition">{sendingMail ? 'Sending...' : 'Send Demo Email'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK REASSIGN MODAL */}
      <AnimatePresence>
        {isBulkAssignOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-left text-slate-800"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black uppercase text-slate-800">Reassign {selectedLeadIds.length} Lead(s)</h3>
                <button onClick={() => setIsBulkAssignOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
              </div>
              <form onSubmit={handleBulkAssign} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Select Assignee</label>
                  <select
                    value={bulkAssignForm.assigned_to}
                    onChange={e => setBulkAssignForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer"
                  >
                    <option value="2">Jane Smith (Partner Consultant)</option>
                    <option value="3">Rahul Verma (Senior Executive)</option>
                    <option value="1">John Admin (System Admin)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Reassignment Remarks</label>
                  <textarea
                    rows="2.5"
                    placeholder="Reason for reassignment..."
                    value={bulkAssignForm.notes}
                    onChange={e => setBulkAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsBulkAssignOpen(false)} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 bg-[#38b34a] hover:bg-[#2d963b] text-white font-bold text-xs rounded-full cursor-pointer shadow-sm transition">{saving ? 'Assigning...' : 'Confirm Reassign'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL DRAWER / SLIDE-OVER PANEL */}
      <AnimatePresence>
        {selectedDrawerLead && (
          <div className="fixed inset-0 z-[120] overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDrawerLead(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-default"
              />

              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="pointer-events-auto w-screen max-w-md"
                >
                  <div className="flex h-full flex-col overflow-y-auto bg-white shadow-2xl border-l border-slate-200 text-slate-800 text-xs">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-base font-black text-slate-850 uppercase">{selectedDrawerLead.company_name || selectedDrawerLead.client_name}</h2>
                          {selectedDrawerLead.client_name && selectedDrawerLead.company_name && selectedDrawerLead.client_name !== selectedDrawerLead.company_name && (
                            <span className="text-slate-450 block mt-0.5 font-medium">👤 Contact: {selectedDrawerLead.client_name}</span>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedDrawerLead(null)}
                          className="rounded-md text-slate-400 hover:text-slate-650 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3.5">
                        {getStatusBadge(selectedDrawerLead.lead_status)}
                        {getPriorityBadge(selectedDrawerLead.lead_priority)}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 py-6 px-6 space-y-6">
                      {/* Client Details Section */}
                      <div className="space-y-3.5">
                        <h3 className="text-[10px] font-black uppercase text-slate-450 tracking-widest border-b border-slate-100 pb-1.5">Contact & Package Details</h3>
                        <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Phone</span>
                            <span className="font-semibold text-slate-700 block mt-0.5">{selectedDrawerLead.client_phone}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Email</span>
                            <span className="font-semibold text-slate-700 block mt-0.5 break-all">{selectedDrawerLead.client_email || '--'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Budget</span>
                            <span className="font-semibold text-slate-700 block mt-0.5">{selectedDrawerLead.budget || '--'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Source</span>
                            <span className="font-semibold text-slate-700 block mt-0.5">{selectedDrawerLead.lead_source || 'Website'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Product Package</span>
                            <span className="font-semibold text-slate-700 block mt-0.5">{selectedDrawerLead.product_name || 'Generic Inquiry'}</span>
                          </div>
                          {selectedDrawerLead.address && (
                            <div className="col-span-2">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Address</span>
                              <span className="font-semibold text-slate-600 block mt-0.5 leading-normal">
                                {selectedDrawerLead.address}, {selectedDrawerLead.city}, {selectedDrawerLead.state} - {selectedDrawerLead.pin_code}
                              </span>
                            </div>
                          )}
                          {selectedDrawerLead.notes && (
                            <div className="col-span-2">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Notes Summary</span>
                              <p className="font-semibold text-slate-500 block mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                                {selectedDrawerLead.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Demo slot details if booked */}
                      {selectedDrawerLead.demo_slot && (
                        <div className="space-y-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">🖥️ Demo Session Booked</h4>
                          <div className="text-xs space-y-1 font-semibold">
                            <p>Slot ID: {selectedDrawerLead.demo_slot_id}</p>
                            <p>Schedule: {selectedDrawerLead.demo_slot}</p>
                            {selectedDrawerLead.demo_notes && <p className="text-[11px] mt-1 text-emerald-700 font-medium">Notes: {selectedDrawerLead.demo_notes}</p>}
                          </div>
                          <button
                            onClick={() => handleCancelBooking(selectedDrawerLead.booking_id)}
                            className="mt-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-[10px] uppercase cursor-pointer transition active:scale-95 shadow-sm"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      )}

                      {/* Action Timeline/History logs */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <h3 className="text-[10px] font-black uppercase text-slate-450 tracking-widest">Activity Timeline</h3>
                          <button
                            onClick={() => openActivityModal(selectedDrawerLead)}
                            className="text-[10px] font-bold text-[#38b34a] hover:underline"
                          >
                            + Log Activity
                          </button>
                        </div>

                        {selectedDrawerLead.activities && selectedDrawerLead.activities.length > 0 ? (
                          <div className="relative pl-4 border-l border-slate-150 space-y-4 text-xs">
                            {selectedDrawerLead.activities.map((act, aIdx) => (
                              <div key={act.id || aIdx} className="relative">
                                {/* Bullet indicator */}
                                <span className="absolute -left-[21px] top-0.5 bg-white border border-slate-300 w-2.5 h-2.5 rounded-full flex items-center justify-center text-[7px]" />
                                <div>
                                  <div className="flex items-center gap-1 font-semibold text-slate-800">
                                    <span>{getActivityIcon(act.activity_type)}</span>
                                    <span className="capitalize">{act.activity_type.replace('_', ' ')}</span>
                                    <span className="text-[10px] text-slate-400 font-medium ml-auto">
                                      {act.created_at ? act.created_at.split('T')[0] : ''}
                                    </span>
                                  </div>
                                  <p className="text-slate-500 font-bold mt-1 text-[11px]">{act.description}</p>
                                  {act.notes && (
                                    <p className="text-slate-400 font-medium mt-0.5 text-[10px] leading-relaxed">
                                      {act.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 font-bold text-center py-4">No logged activity logs available.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ASSIGN DEMO SLOT / CALENDAR MODAL */}
      <AnimatePresence>
        {showAssignModal && selectedLeadForAssign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl p-6 sm:p-8 text-left text-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-850 uppercase">Assign Demo Booking Slot</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Book a free product software demo for <strong className="text-slate-700">{selectedLeadForAssign.client_name}</strong></p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedLeadForAssign(null)
                    setSelectedDate('')
                    setAllSlotsData({})
                  }}
                  className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Split Screen Layout: Left side Calendar, Right side Slots selection */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* CALENDAR COLUMN */}
                <div className="lg:col-span-7 bg-slate-50 p-4.5 rounded-3xl border border-slate-150">
                  {/* Month selectors */}
                  <div className="flex justify-between items-center mb-4">
                    <button onClick={prevMonth} className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-black cursor-pointer">
                      ◀ Prev
                    </button>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-750">
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button onClick={nextMonth} className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-black cursor-pointer">
                      Next ▶
                    </button>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="py-1">{d}</div>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs">
                    {(() => {
                      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
                      const totalDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
                      const cells = []

                      // Empty padding for start of month
                      for (let i = 0; i < firstDay; i++) {
                        cells.push(<div key={`empty-${i}`} className="p-3" />)
                      }

                      // Fill in dates
                      for (let day = 1; day <= totalDays; day++) {
                        const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                        const dateString = dateObj.toISOString().split('T')[0]
                        const isSelected = selectedDate === dateString

                        const daySlots = getSlotsForDate(dateString)
                        const hasAvailability = daySlots.length > 0
                        const isFullyBooked = hasAvailability && daySlots.every(s => s.is_fully_booked)

                        let cellClass =
                          'p-3.5 rounded-2xl cursor-pointer hover:bg-slate-200 transition-all relative flex flex-col items-center justify-center '
                        if (isSelected) {
                          cellClass += 'bg-[#38b34a] text-white hover:bg-[#38b34a]/90 shadow-md shadow-[#38b34a]/20 scale-102 z-10'
                        } else if (hasAvailability) {
                          cellClass += isFullyBooked
                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/15'
                            : 'bg-emerald-500/10 text-[#38b34a] hover:bg-emerald-500/15'
                        } else {
                          cellClass += 'text-slate-400 hover:bg-slate-100'
                        }

                        cells.push(
                          <div
                            key={day}
                            onClick={() => setSelectedDate(dateString)}
                            className={cellClass}
                          >
                            <span>{day}</span>
                            {/* Dot Indicators */}
                            {hasAvailability && !isSelected && (
                              <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${isFullyBooked ? 'bg-red-500' : 'bg-[#38b34a]'}`} />
                            )}
                          </div>
                        )
                      }
                      return cells
                    })()}
                  </div>
                </div>

                {/* SLOTS LIST COLUMN */}
                <div className="lg:col-span-5 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                    Available Slots for {selectedDate || 'Select Date'}
                  </h4>

                  {selectedDate ? (
                    (() => {
                      const daySlots = getSlotsForDate(selectedDate)
                      if (daySlots.length === 0) {
                        return <p className="text-slate-400 font-bold text-center py-6">No demo sessions scheduled for this weekday.</p>
                      }

                      return (
                        <div className="space-y-3.5">
                          {daySlots.map(slot => {
                            const isSlotSelected = selectedSlotIdForBooking === slot.id
                            const isFullyBooked = slot.is_fully_booked

                            let cardClass =
                              'p-4 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between '
                            if (isFullyBooked) {
                              cardClass += 'bg-slate-50 border-slate-200 opacity-60'
                            } else if (isSlotSelected) {
                              cardClass += 'bg-slate-80 text-slate-800 border-[#38b34a] ring-2 ring-[#38b34a]/20 scale-101'
                            } else {
                              cardClass += 'bg-white border-slate-200 hover:border-slate-350 cursor-pointer'
                            }

                            return (
                              <div
                                key={slot.id}
                                onClick={() => {
                                  if (!isFullyBooked) {
                                    setSelectedSlotIdForBooking(slot.id)
                                    setShowSlotBookingModal(true)
                                  }
                                }}
                                className={cardClass}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-xs font-black text-slate-800">{slot.title}</span>
                                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">🕐 Time: {slot.start_time} - {slot.end_time}</span>
                                  </div>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isFullyBooked ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-[#38b34a]'}`}>
                                    {isFullyBooked ? 'FULL' : `${slot.available_attendees} Available`}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium mt-2 leading-relaxed">{slot.description}</p>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()
                  ) : (
                    <p className="text-slate-400 font-bold text-center py-6">Select a date on the calendar map to retrieve availability.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOOK SLOT DIALOG MODAL */}
      <AnimatePresence>
        {showSlotBookingModal && selectedSlotIdForBooking && selectedDate && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-left text-slate-800"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black uppercase text-slate-800">Confirm Booking</h3>
                <button onClick={() => setShowSlotBookingModal(false)} className="text-slate-400 hover:text-slate-650 font-bold cursor-pointer">✕</button>
              </div>
              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 text-slate-600">
                  <p>Client: <strong className="text-slate-800">{selectedLeadForAssign?.client_name}</strong></p>
                  <p>Date: <strong className="text-slate-800">{selectedDate}</strong></p>
                  <p>Slot ID: <strong className="text-slate-850">{selectedSlotIdForBooking}</strong></p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Booking Notes / Remarks</label>
                  <textarea
                    rows="3"
                    placeholder="Log onboarding requirements or customer details..."
                    value={bookingNotes}
                    onChange={e => setBookingNotes(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowSlotBookingModal(false)} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-550 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button
                    onClick={() => handleBookSlot(selectedSlotIdForBooking, selectedDate)}
                    disabled={saving}
                    className="px-5 py-2 bg-[#38b34a] hover:bg-[#2d963b] text-white font-bold text-xs rounded-full cursor-pointer shadow-sm transition"
                  >
                    {saving ? 'Confirming...' : 'Confirm Book'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      {/* 2. QUOTATIONS HISTORY LIST MODAL (Matching Image 1) */}
      {showQuotationsListModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl p-6 text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#1e3e6b]">📋 Quotations History</h3>
                <p className="text-xs text-slate-400">
                  Client: <strong>{selectedGenClient?.client_name || selectedGenClient?.company_name}</strong> (ID: {selectedGenClient?.client_id || `GC-${selectedGenClient?.id}`})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuotationsListModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {loadingQuotationsList ? (
              <div className="p-8 text-center text-slate-400 font-bold text-xs">Loading quotations history...</div>
            ) : selectedClientQuotations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-bold">
                No quotations generated for this client yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">QUOTATION NO.</th>
                      <th className="px-4 py-3">DATE</th>
                      <th className="px-4 py-3">STATUS</th>
                      <th className="px-4 py-3">PAYMENT TERMS</th>
                      <th className="px-4 py-3 text-right">GRAND TOTAL</th>
                      <th className="px-4 py-3 text-center">ACTIONS & INVOICE</th>
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
                                ✅ PAID
                              </span>
                            ) : q.status === 'sent' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                                📨 SENT
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

                              <button
                                type="button"
                                onClick={() => {
                                  setShowQuotationsListModal(false)
                                  handleEditQuotation(q, selectedGenClient)
                                }}
                                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
                              >
                                <span>✏️</span>
                                <span>Edit</span>
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

                              {!isPaid && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowQuotationsListModal(false)
                                    handleOpenRecordPayment(q, selectedGenClient)
                                  }}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
                                >
                                  <span>💳</span>
                                  <span>Record Payment</span>
                                </button>
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
                                    } catch (_) { }
                                  }
                                  if (!payUrl) {
                                    const targetUuid = q.uuid || `quotation-uuid-${q.id}`
                                    payUrl = `${window.location.origin}/general-quotation-pay.html?uuid=${targetUuid}`
                                  }
                                  if (navigator.clipboard && navigator.clipboard.writeText) {
                                    await navigator.clipboard.writeText(payUrl)
                                    triggerSuccess(`📋 Payment Link copied to clipboard:\n\n${payUrl}`)
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
          </div>
        </div>
      )}

      {/* 3. PROFORMA INVOICE DOCUMENT VIEWER MODAL */}
      {showQuotationDocModal && viewingQuotationDoc && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-fade-in print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col text-slate-800 overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
            {/* Top Controls Bar */}
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Official Quotation Document
                </span>
                <span className="font-mono text-xs font-bold text-slate-300">
                  {viewingQuotationDoc.quotation_number || `QUO-${viewingQuotationDoc.id}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEditQuotation(viewingQuotationDoc, viewingQuotationDoc.client)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>✏️</span>
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintQuotation}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🖨️</span>
                  <span>Print / Save PDF</span>
                </button>

                {viewingQuotationDoc.status !== 'paid' && (
                  <button
                    type="button"
                    onClick={() => handleOpenRecordPayment(viewingQuotationDoc, viewingQuotationDoc.client)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span>💳</span>
                    <span>Record Payment</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowQuotationDocModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition-colors ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Body Paper */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/60 print:p-0 print:bg-white print:overflow-visible font-sans">
              <div
                id="quotation-document-paper-leads"
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 md:p-7 space-y-3 sm:space-y-4 print:border-none print:shadow-none print:p-0 max-w-3xl mx-auto"
              >
                <div className="text-center -mt-1 sm:-mt-2 pt-0 pb-0.5">
                  <h1 className="text-xs sm:text-sm font-black text-[#1e3e6b] tracking-[0.25em] uppercase font-sans">
                    PROFORMA INVOICE
                  </h1>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3 sm:pb-4 border-b-2 border-slate-800">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3.5">
                      <img src={companyLogo} alt="AIM Digitalise Logo" className="h-13 sm:h-15 w-auto object-contain shrink-0" />
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
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block font-sans">QUOTATION NO.</span>
                        <p className="font-mono font-black text-[#1e3e6b] text-base">
                          {viewingQuotationDoc.quotation_number || `QUO-${viewingQuotationDoc.id}`}
                        </p>
                      </div>
                      <p className="text-slate-500 font-medium">Date: <strong className="text-slate-800">{viewingQuotationDoc.quotation_date ? String(viewingQuotationDoc.quotation_date).split('T')[0] : 'N/A'}</strong></p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">QUOTATION FOR (BILL TO):</span>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {viewingQuotationDoc.client?.company_name || viewingQuotationDoc.client?.client_name || 'Valued Client'}
                    </h3>
                    <p className="text-slate-600">{viewingQuotationDoc.client?.email || '—'}</p>
                    <p className="text-slate-600">{viewingQuotationDoc.client?.contact_number || viewingQuotationDoc.client?.client_phone || '—'}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Scope & Item Description</th>
                        <th className="px-4 py-3 text-center">HSN</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Selling Price</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingQuotationDoc.items?.map((it, idx) => {
                        const lineTotal = Math.round(it.qty * it.selling_price * (1 - (it.discount_percentage || 0) / 100) * 100) / 100
                        return (
                          <tr key={idx}>
                            <td className="px-4 py-3 font-bold text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <p className="font-extrabold text-slate-800">{it.product_name}</p>
                              {it.description && <p className="text-[11px] text-slate-500">{it.description}</p>}
                            </td>
                            <td className="px-4 py-3 text-center font-mono text-slate-500">{it.hsn}</td>
                            <td className="px-4 py-3 text-center font-bold">{it.qty} {it.unit}</td>
                            <td className="px-4 py-3 text-right font-medium">₹{it.selling_price.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">₹{lineTotal.toLocaleString('en-IN')}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Amount in Words:</span>
                    <p className="font-bold text-slate-800 italic leading-relaxed">
                      {numberToIndianWords(viewingQuotationDoc.grand_total || viewingQuotationDoc.grandTotal)}
                    </p>
                  </div>
                  <div className="border-t border-slate-200/80 pt-2 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Payment Terms:</span>
                      <p className="font-bold text-slate-800">{viewingQuotationDoc.payment_terms || 'Due on Receipt'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Grand Total</span>
                      <span className="text-lg font-black text-[#38b34a]">₹{Number(viewingQuotationDoc.grand_total || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Signatory */}
                <div className="quotation-terms-signature flex justify-between items-end pt-4 border-t border-slate-200 text-xs">
                  <div className="text-slate-500 text-[10px] space-y-1">
                    <p className="font-bold text-slate-700">Terms & Conditions:</p>
                    <p>1. Quotation valid for 30 days. 2. GST calculated per regulation.</p>
                  </div>
                  <div className="quotation-signature-block text-right">
                    <span className="text-[10px] font-bold text-slate-400 block">For AIM Digitalise Pvt. Ltd.</span>
                    <img
                      src="https://api.nexgn.in/public/signature_1.png"
                      alt="Boss Signature"
                      className="h-12 w-auto object-contain ml-auto my-1"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/signature_1.png' }}
                    />
                    <span className="font-black text-slate-800 text-xs block border-t border-slate-300 pt-1">Authorized Signatory</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. RECORD MANUAL PAYMENT MODAL */}
      {showRecordPaymentModal && paymentQuotation && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#1e3e6b]">💳 Record Manual / Offline Payment</h3>
                <p className="text-xs text-slate-400">
                  Quotation: <strong>{paymentQuotation.quotation_number || `QUO-${paymentQuotation.id}`}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRecordPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Amount Received (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-black text-base text-emerald-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm(f => ({ ...f, payment_method: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Reference / UTR / Transaction No.</label>
                <input
                  type="text"
                  placeholder="e.g. UTR1234567890"
                  value={paymentForm.reference_number}
                  onChange={(e) => setPaymentForm(f => ({ ...f, reference_number: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.paid_at}
                  onChange={(e) => setPaymentForm(f => ({ ...f, paid_at: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Notes / Remarks</label>
                <textarea
                  rows="2"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecordPaymentModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-[#38b34a] hover:from-emerald-700 hover:to-[#329f42] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                >
                  {recordingPayment ? 'Recording...' : 'Confirm & Mark Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </AnimatePresence>
    </>
  )
}
