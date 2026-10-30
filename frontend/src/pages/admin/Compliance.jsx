import React, { useState, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { getTdsRecords, getCaWhatsappNumber, updateCaWhatsappNumber, sendInvoiceToCa } from '../../api/admin/generalClients'
import companyLogo from '../../assets/images/logo.png'
import payQrCode from '../../assets/images/payqr.png'

const DUMMY_AUDITS = [
  { id: 1, audit_id: 'AUD-2026-001', title: 'Financial Tax Audit FY 25-26', type: 'Tax & Finance', auditor: 'Singhal & Associates', date: '2026-05-12', status: 'Approved', remarks: 'Fully compliant, minor advice on asset depreciation entries' },
  { id: 2, audit_id: 'AUD-2026-002', title: 'Information Security & Cyber Audit', type: 'Data Security', auditor: 'SecureNet Labs', date: '2026-04-22', status: 'Approved', remarks: 'Vulnerability scan complete. High-priority recommendations resolved' },
  { id: 3, audit_id: 'AUD-2026-003', title: 'ESIC & PF Labor Compliance Audit', type: 'HR & Labor Laws', auditor: 'EPFO Inspectorate', date: '2026-03-10', status: 'Approved', remarks: 'All contributions paid before deadline. Employee records updated' },
  { id: 4, audit_id: 'AUD-2026-004', title: 'ISO 9001:2015 Quality Systems Audit', type: 'Operations', auditor: 'QMS Global Certification', date: '2026-02-05', status: 'Action Required', remarks: '1 minor non-conformity in documentation revision controls' },
]

const DUMMY_GST_FILINGS = [
  { id: 301, period: 'May 2026', return_type: 'GSTR-1 (Outward Supplies)', file_date: '2026-06-10', taxable_value: 1250000, tax_liability: 225000, itc_claimed: 0, status: 'Filed', ack_no: 'ACK-GST-99214' },
  { id: 302, period: 'May 2026', return_type: 'GSTR-3B (Summary Return)', file_date: '2026-06-20', taxable_value: 1250000, tax_liability: 225000, itc_claimed: 85000, status: 'Filed', ack_no: 'ACK-GST-99285' },
  { id: 303, period: 'April 2026', return_type: 'GSTR-1 (Outward Supplies)', file_date: '2026-05-11', taxable_value: 1080000, tax_liability: 194400, itc_claimed: 0, status: 'Filed', ack_no: 'ACK-GST-97810' },
  { id: 304, period: 'April 2026', return_type: 'GSTR-3B (Summary Return)', file_date: '2026-05-20', taxable_value: 1080000, tax_liability: 194400, itc_claimed: 70000, status: 'Filed', ack_no: 'ACK-GST-97892' },
]

// Indian currency number to words helper
const numberToIndianWords = (num) => {
  if (!num || isNaN(Number(num))) return 'Zero Rupees Only'
  const n = Math.round(Number(num))
  if (n === 0) return 'Zero Rupees Only'

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const inWords = (val) => {
    let str = ''
    if (val > 19) {
      str += b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : ' ')
    } else {
      str += a[val]
    }
    return str
  }

  let str = ''
  const crore = Math.floor(n / 10000000)
  const lakh = Math.floor((n % 10000000) / 100000)
  const thousand = Math.floor((n % 100000) / 1000)
  const hundred = Math.floor((n % 1000) / 100)
  const rest = Math.floor(n % 100)

  if (crore > 0) str += inWords(crore) + 'Crore '
  if (lakh > 0) str += inWords(lakh) + 'Lakh '
  if (thousand > 0) str += inWords(thousand) + 'Thousand '
  if (hundred > 0) str += inWords(hundred) + 'Hundred '
  if (rest > 0) str += inWords(rest)

  return `INR ${str.trim()} Only`
}

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return String(dateStr).split('T')[0]
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch (_) {
    return String(dateStr).split('T')[0]
  }
}

const countryFlags = {
  IN: '🇮🇳',
  US: '🇺🇸',
  UK: '🇬🇧',
  AE: '🇦🇪',
  CA: '🇨🇦',
  AU: '🇦🇺',
  SG: '🇸🇬',
  DE: '🇩🇪',
  FR: '🇫🇷',
}

const AdminCompliance = () => {
  const [activePageTab, setActivePageTab] = useState('invoice_records')
  const [audits] = useState(DUMMY_AUDITS)
  const [filings, setFilings] = useState(DUMMY_GST_FILINGS)

  // GST interactive calculator states
  const [selectedMonth, setSelectedMonth] = useState('May 2026')
  const [outwardSales, setOutwardSales] = useState(1250000)
  const [inputTaxCredit, setInputTaxCredit] = useState(85000)
  const [taxRate, setTaxRate] = useState(18)

  // TDS Records State
  const [tdsRecords, setTdsRecords] = useState([])
  const [loadingTds, setLoadingTds] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [recordTypeFilter, setRecordTypeFilter] = useState('all')
  const [showPurchaseDetailsModal, setShowPurchaseDetailsModal] = useState(false)
  const [selectedPurchaseDetail, setSelectedPurchaseDetail] = useState(null)

  // Attached Document Viewer Modal State (for Purchase TDS documents & uploaded invoices)
  const [showAttachedDocModal, setShowAttachedDocModal] = useState(false)
  const [selectedAttachedDoc, setSelectedAttachedDoc] = useState(null)

  // Modals State
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false)
  const [selectedPaymentRecord, setSelectedPaymentRecord] = useState(null)
  const [showInvoiceDocModal, setShowInvoiceDocModal] = useState(false)
  const [viewingInvoiceDoc, setViewingInvoiceDoc] = useState(null)
  const [showQuotationDocModal, setShowQuotationDocModal] = useState(false)
  const [viewingQuotationDoc, setViewingQuotationDoc] = useState(null)

  // CA WhatsApp Dispatch State
  const [caPhoneNumber, setCaPhoneNumber] = useState('9865680538')
  const [showSendCaModal, setShowSendCaModal] = useState(false)
  const [selectedInvoiceForCa, setSelectedInvoiceForCa] = useState(null)
  const [caModalPhone, setCaModalPhone] = useState('9865680538')
  const [sendingToCa, setSendingToCa] = useState(false)
  const [caSendResult, setCaSendResult] = useState(null)
  const [showEditCaPhoneModal, setShowEditCaPhoneModal] = useState(false)
  const [newDefaultPhone, setNewDefaultPhone] = useState('')
  const [updatingDefaultPhone, setUpdatingDefaultPhone] = useState(false)

  // Fetch CA WhatsApp Phone Number
  const fetchCaPhoneNumber = async () => {
    try {
      const res = await getCaWhatsappNumber()
      if (res?.data?.success && res.data.phone) {
        setCaPhoneNumber(String(res.data.phone))
        setCaModalPhone(String(res.data.phone))
      }
    } catch (err) {
      console.error('Error fetching CA WhatsApp number:', err)
    }
  }

  // Fetch TDS / Invoice Records from backend
  const fetchTdsRecords = async () => {
    setLoadingTds(true)
    try {
      const res = await getTdsRecords()
      if (res?.data?.success && Array.isArray(res.data.data)) {
        // Only for compliance: for general client invoice records, show records which are on or after 1 Jan 2026. Hide the ones before that.
        const post2026Records = res.data.data.filter(r => {
          if (r.record_type === 'purchase') return true
          const dateStr = String(r.invoice_date || r.quotation_date || r.created_at || '').slice(0, 10)
          return !dateStr || dateStr >= '2026-01-01'
        })
        setTdsRecords(post2026Records)
      } else {
        setTdsRecords([])
      }
    } catch (err) {
      console.error('Error fetching invoice records:', err)
      setTdsRecords([])
    } finally {
      setLoadingTds(false)
    }
  }

  useEffect(() => {
    fetchTdsRecords()
    fetchCaPhoneNumber()
  }, [])

  // GST calculations
  const calculatedTaxLiability = Math.round(outwardSales * (taxRate / 100))
  const netGstPayable = Math.max(0, calculatedTaxLiability - inputTaxCredit)

  const handleDownloadReport = (title) => {
    alert(`Downloading ${title} PDF report... (Demo feature)`)
  }

  const handleFileReturnMock = () => {
    alert(`Submitting GSTR filing for ${selectedMonth} to GST Portal... (Filing successful! Return receipt added to logs below)`)
    const gstr1Obj = {
      id: Date.now(),
      period: selectedMonth,
      return_type: 'GSTR-1 (Outward Supplies)',
      file_date: new Date().toISOString().split('T')[0],
      taxable_value: outwardSales,
      tax_liability: calculatedTaxLiability,
      itc_claimed: 0,
      status: 'Filed',
      ack_no: `ACK-GST-${Math.floor(10000 + Math.random() * 90000)}`
    }
    const gstr3BObj = {
      id: Date.now() + 1,
      period: selectedMonth,
      return_type: 'GSTR-3B (Summary Return)',
      file_date: new Date().toISOString().split('T')[0],
      taxable_value: outwardSales,
      tax_liability: calculatedTaxLiability,
      itc_claimed: inputTaxCredit,
      status: 'Filed',
      ack_no: `ACK-GST-${Math.floor(10000 + Math.random() * 90000)}`
    }
    setFilings([gstr1Obj, gstr3BObj, ...filings])
  }

  // TDS Helper Functions
  const getPaymentTds = (p) => {
    if (!p) return 0
    if (p.tds_amount !== undefined && p.tds_amount !== null && Number(p.tds_amount) > 0) return Number(p.tds_amount)
    if (p.computed_tds_amount !== undefined && p.computed_tds_amount !== null && Number(p.computed_tds_amount) > 0) return Number(p.computed_tds_amount)
    if (p.notes) {
      try {
        const parsed = typeof p.notes === 'string' ? JSON.parse(p.notes) : p.notes
        if (parsed && parsed.tds_amount !== undefined && parsed.tds_amount !== null && Number(parsed.tds_amount) > 0) {
          return Number(parsed.tds_amount)
        }
      } catch (_) {}
    }
    return Number(p.tds_amount || 0)
  }

  const getPaymentTdsDoc = (p) => {
    if (!p) return null
    if (p.tds_document) return p.tds_document
    if (p.computed_tds_document) return p.computed_tds_document
    if (p.notes) {
      try {
        const parsed = typeof p.notes === 'string' ? JSON.parse(p.notes) : p.notes
        if (parsed && parsed.tds_document) return parsed.tds_document
      } catch (_) {}
    }
    return null
  }

  const getTdsDocUrl = (filePath) => {
    if (!filePath) return ''
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath
    const base = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
    const host = base.replace(/\/api\/?$/, '')
    const cleanPath = filePath.replace(/^storage\//, '').replace(/^\//, '')
    return `${host}/storage/${cleanPath}`
  }

  const printAttachedFile = (fileUrl, title = 'Attached Document') => {
    if (!fileUrl) return
    const isPdf = fileUrl.toLowerCase().endsWith('.pdf') || fileUrl.includes('.pdf?')

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0px'
    iframe.style.height = '0px'
    iframe.style.border = '0px'
    iframe.setAttribute('title', 'Document Print Preview')
    document.body.appendChild(iframe)

    if (isPdf) {
      iframe.src = fileUrl
      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow.focus()
            iframe.contentWindow.print()
          } catch (e) {
            window.open(fileUrl, '_blank')
          } finally {
            setTimeout(() => {
              if (document.body.contains(iframe)) document.body.removeChild(iframe)
            }, 2000)
          }
        }, 500)
      }
    } else {
      const doc = iframe.contentWindow.document
      doc.open()
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              @page { size: auto; margin: 10mm; }
              body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; }
              img { max-width: 100%; max-height: 98vh; object-fit: contain; display: block; }
            </style>
          </head>
          <body>
            <img src="${fileUrl}" onload="window.focus(); window.print();" />
          </body>
        </html>
      `)
      doc.close()

      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
      }, 3000)
    }
  }

  const downloadAttachedFile = async (fileUrl, suggestedFilename = 'Document') => {
    if (!fileUrl) return
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = suggestedFilename || fileUrl.split('/').pop() || 'document'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      const link = document.createElement('a')
      link.href = fileUrl
      link.target = '_blank'
      link.download = suggestedFilename || 'document'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleOpenAttachedDocModal = (record) => {
    const rawUrl = record.tds_document_url || record.tds_document || record.invoice_file_url || record.invoice_file
    if (!rawUrl) return
    const fileUrl = getTdsDocUrl(rawUrl)
    setSelectedAttachedDoc({
      fileUrl,
      title: record.invoice_number ? `Invoice #${record.invoice_number}` : 'Attached Document',
      invoiceNumber: record.invoice_number,
      clientName: record.client_name || record.client?.client_name,
      filename: rawUrl.split('/').pop() || 'document',
      isPurchase: record.record_type === 'purchase',
    })
    setShowAttachedDocModal(true)
  }

  const getPaymentRefNo = (p) => {
    let ref = ''
    if (p.notes) {
      try {
        const parsed = typeof p.notes === 'string' ? JSON.parse(p.notes) : p.notes
        ref = parsed.reference_number || ''
      } catch (_) {}
    }
    if (!ref && p.reference_number) ref = p.reference_number
    if (!ref && p.razorpay_payment_id) ref = p.razorpay_payment_id
    if (ref && (ref.startsWith('MANUAL-') || ref.startsWith('OFFLINE_') || ref === 'MANUAL_ENTRY')) {
      return '—'
    }
    return ref || '—'
  }

  const getPaymentNotes = (p) => {
    let note = ''
    if (p.notes) {
      try {
        const parsed = typeof p.notes === 'string' ? JSON.parse(p.notes) : p.notes
        note = parsed.notes || ''
      } catch (_) {
        note = p.notes
      }
    } else if (p.notes) {
      note = String(p.notes)
    }
    if (note === 'Payment recorded by Admin against Invoice' || note === 'Manual payment recorded by Admin') {
      return '—'
    }
    return note || '—'
  }

  // Filter TDS / Invoice Records
  const filteredTdsRecords = useMemo(() => {
    return tdsRecords.filter(r => {
      // 0. Only show general client invoice records from 1 Jan 2026 onwards
      if (r.record_type !== 'purchase') {
        const d = String(r.invoice_date || r.quotation_date || r.created_at || '').slice(0, 10)
        if (d && d < '2026-01-01') return false
      }

      // 1. Record Type filter (Sales Invoice vs Purchase)
      if (recordTypeFilter !== 'all') {
        if ((r.record_type || 'client_invoice') !== recordTypeFilter) return false
      }

      // 2. Search term match
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        const matchClient = (r.client_name || '').toLowerCase().includes(q) || (r.company_name || '').toLowerCase().includes(q)
        const matchId = (r.client_id || '').toLowerCase().includes(q)
        const matchQuo = (r.quotation_number || '').toLowerCase().includes(q)
        const matchInv = (r.invoice_number || '').toLowerCase().includes(q)
        if (!matchClient && !matchId && !matchQuo && !matchInv) return false
      }

      // 3. Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'paid' && !r.is_paid) return false
        if (statusFilter === 'partially_paid' && (r.is_paid || r.total_received <= 0)) return false
        if (statusFilter === 'purchase' && r.record_type !== 'purchase') return false
      }

      // 4. Date range filter
      if (dateFrom || dateTo) {
        const itemDate = r.invoice_date || r.quotation_date || ''
        const rawDateStr = String(itemDate).split('T')[0]
        if (dateFrom && rawDateStr < dateFrom) return false
        if (dateTo && rawDateStr > dateTo) return false
      }

      return true
    })
  }, [tdsRecords, searchTerm, statusFilter, recordTypeFilter, dateFrom, dateTo])

  // Summary Metrics
  const totalFilteredCount = filteredTdsRecords.length
  const totalFilteredInvoiced = filteredTdsRecords.reduce((sum, r) => sum + Number(r.total_amount || 0), 0)
  const totalFilteredTds = filteredTdsRecords.reduce((sum, r) => sum + Number(r.total_tds || 0), 0)
  const totalFilteredReceived = filteredTdsRecords.reduce((sum, r) => sum + Number(r.total_received || 0), 0)

  // Pagination for Invoice Records
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, recordTypeFilter, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / (pageSize === 'all' ? (totalFilteredCount || 1) : pageSize)))

  const paginatedRecords = useMemo(() => {
    if (pageSize === 'all') return filteredTdsRecords
    const startIdx = (currentPage - 1) * pageSize
    return filteredTdsRecords.slice(startIdx, startIdx + pageSize)
  }, [filteredTdsRecords, currentPage, pageSize])

  const hasActiveFilters = Boolean(searchTerm || dateFrom || dateTo || statusFilter !== 'all')

  const handleResetFilters = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
    setStatusFilter('all')
    setRecordTypeFilter('all')
    setCurrentPage(1)
  }

  // Modal Opener Handlers
  const handleOpenSendCaModal = (record) => {
    setSelectedInvoiceForCa(record)
    setCaModalPhone(caPhoneNumber || '9865680538')
    setCaSendResult(null)
    setShowSendCaModal(true)
  }

  const handleSendInvoiceToCa = async () => {
    if (!selectedInvoiceForCa) return
    const isPurchase = selectedInvoiceForCa.record_type === 'purchase'
    const quotationId = selectedInvoiceForCa.raw_quotation?.id || selectedInvoiceForCa.id
    const purchaseId = selectedInvoiceForCa.purchase_id || selectedInvoiceForCa.raw_purchase?.id

    if (!isPurchase && !quotationId) {
      alert('Quotation ID not found.')
      return
    }
    if (isPurchase && !purchaseId) {
      alert('Purchase ID not found.')
      return
    }

    const cleanPhone = (caModalPhone || '').replace(/[^0-9]/g, '')
    if (cleanPhone.length < 10) {
      alert('Please enter a valid 10-digit WhatsApp phone number.')
      return
    }

    setSendingToCa(true)
    setCaSendResult(null)
    try {
      const payload = {
        phone: cleanPhone,
        record_type: isPurchase ? 'purchase' : 'client_invoice',
        quotation_id: !isPurchase ? quotationId : null,
        purchase_id: isPurchase ? purchaseId : null
      }

      const res = await sendInvoiceToCa(payload)
      if (res?.data?.success) {
        if (res.data.phone) {
          setCaPhoneNumber(String(res.data.phone))
        }
        setCaSendResult({
          success: true,
          message: res.data.message || (isPurchase ? 'Purchase TDS document dispatched via WhatsApp!' : 'Tax Invoice dispatched via WhatsApp!'),
          phone: res.data.phone,
          pdf_url: res.data.pdf_url,
          whatsapp_web_url: res.data.whatsapp_web_url,
          whatsapp_gateway_sent: res.data.whatsapp_gateway_sent
        })
      } else {
        alert(res?.data?.message || 'Failed to send to CA.')
      }
    } catch (err) {
      console.error('Error sending to CA:', err)
      alert(err?.response?.data?.message || 'An error occurred while dispatching via WhatsApp.')
    } finally {
      setSendingToCa(false)
    }
  }

  const handleSaveDefaultCaPhone = async () => {
    const clean = (newDefaultPhone || '').replace(/[^0-9]/g, '')
    if (clean.length < 10) {
      alert('Please enter a valid 10-digit mobile number.')
      return
    }
    setUpdatingDefaultPhone(true)
    try {
      const res = await updateCaWhatsappNumber(clean)
      if (res?.data?.success) {
        setCaPhoneNumber(clean)
        setCaModalPhone(clean)
        setShowEditCaPhoneModal(false)
        alert('Default CA WhatsApp number updated successfully!')
      } else {
        alert(res?.data?.message || 'Failed to update CA phone number.')
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update CA phone number.')
    } finally {
      setUpdatingDefaultPhone(false)
    }
  }

  const handleOpenPurchaseDetails = (record) => {
    setSelectedPurchaseDetail(record)
    setShowPurchaseDetailsModal(true)
  }

  const handleOpenDetails = (record) => {
    setSelectedPaymentRecord(record)
    setShowPaymentDetailsModal(true)
  }

  const handleOpenInvoiceModal = (record) => {
    const isPurchase = record.record_type === 'purchase'
    const rawQ = record.raw_quotation || record.raw_purchase || record
    const mappedItems = (record.items || rawQ.items || []).map(it => {
      const q = Number(it.quantity || it.qty || 1)
      const p = Number(it.rate || it.selling_price || it.price || 0)
      const a = Number(it.amount || (q * p))
      return {
        ...it,
        item_name: it.item_name || it.product_name || it.name || it.service_name || (isPurchase ? 'Purchased Item' : 'Service Item'),
        product_name: it.item_name || it.product_name || it.name || it.service_name || (isPurchase ? 'Purchased Item' : 'Service Item'),
        rate: p,
        price: p,
        selling_price: p,
        quantity: q,
        qty: q,
        amount: a,
        hsn_code: it.hsn_code || it.hsn_sac || it.hsn || (isPurchase ? '—' : '998313'),
        hsn_sac: it.hsn_code || it.hsn_sac || it.hsn || (isPurchase ? '—' : '998313'),
        unit: it.unit || ''
      }
    })

    setViewingInvoiceDoc({
      ...rawQ,
      record_type: record.record_type,
      invoice_number: record.invoice_number,
      quotation_number: record.quotation_number,
      invoice_date: record.invoice_date || record.quotation_date,
      total_amount: record.total_amount,
      subtotal: record.total_amount,
      notes: record.notes,
      items: mappedItems,
      client: record.client || rawQ.client || {
        client_name: record.client_name,
        company_name: record.company_name,
        client_id: record.client_id,
        gstin: record.client_id
      }
    })
    setShowInvoiceDocModal(true)
  }

  const handleOpenQuotationModal = (record) => {
    const rawQ = record.raw_quotation || record
    setViewingQuotationDoc({
      ...rawQ,
      client: record.client || rawQ.client
    })
    setShowQuotationDocModal(true)
  }

  // High Fidelity Print Functions (Clean, no browser header/footer)
  const handlePrintInvoice = () => {
    const printElement = document.getElementById('compliance-invoice-document-paper')
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
    iframe.setAttribute('title', 'Tax Invoice Print Preview')
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
            #compliance-invoice-document-paper {
              box-shadow: none !important;
              border: none !important;
              padding: 6mm 10mm !important;
              margin: 0 auto !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            #compliance-invoice-document-paper.space-y-3 > * + *,
            #compliance-invoice-document-paper.space-y-4 > * + *,
            #compliance-invoice-document-paper > div + div {
              margin-top: 12px !important;
            }
            .invoice-terms-signature,
            .invoice-signature-block,
            .invoice-financials-block {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            table {
              border-collapse: collapse !important;
              width: 100% !important;
            }
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          ${printElement.outerHTML}
        </body>
      </html>
    `)
    doc.close()

    setTimeout(() => {
      try {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
      } catch (err) {
        console.error('Print error:', err)
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe)
          }
        }, 1500)
      }
    }, 450)
  }

  const handlePrintQuotation = () => {
    const printElement = document.getElementById('compliance-quotation-document-paper')
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
            #compliance-quotation-document-paper {
              box-shadow: none !important;
              border: none !important;
              padding: 6mm 10mm !important;
              margin: 0 auto !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            #compliance-quotation-document-paper.space-y-3 > * + *,
            #compliance-quotation-document-paper.space-y-4 > * + *,
            #compliance-quotation-document-paper > div + div {
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
              width: 100% !important;
            }
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          ${printElement.outerHTML}
        </body>
      </html>
    `)
    doc.close()

    setTimeout(() => {
      try {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
      } catch (err) {
        console.error('Print error:', err)
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe)
          }
        }, 1500)
      }
    }, 450)
  }

  return (
    <>
      <Helmet>
        <title>Compliance & Filings | Admin Panel</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          <div>
            <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Compliance & Audits</h1>
            <p className="text-xs text-slate-400 font-bold mt-1">Review invoice registries, internal audit logs, and file monthly/quarterly GST returns</p>
          </div>

          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>

          <div className="w-48 flex justify-end">
            <span className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-[#38b34a] shadow-sm">
              🟢 Live Compliance Portal
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
          
          {/* Tabs Navigation Row */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            {[
              { id: 'invoice_records', label: 'Invoice Records', count: tdsRecords.length },
              { id: 'gst_report', label: 'GST Filings & Returns' },
              { id: 'audit_report', label: 'Corporate Audit Reports' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePageTab(tab.id)}
                className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 flex items-center gap-2 ${
                  (activePageTab === tab.id || (tab.id === 'invoice_records' && activePageTab === 'tds_records'))
                    ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    (activePageTab === tab.id || (tab.id === 'invoice_records' && activePageTab === 'tds_records')) ? 'bg-[#38b34a]/15 text-[#38b34a]' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ============================================================ */}
          {/* TAB 1: INVOICE RECORDS (General Client Invoices & Purchase Records) */}
          {/* ============================================================ */}
          {(activePageTab === 'invoice_records' || activePageTab === 'tds_records') && (
            <div className="space-y-6">
              
              {/* 4 Summary Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Invoices</span>
                    <span className="text-base">📑</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-1">{totalFilteredCount}</p>
                  <span className="text-[10px] text-slate-400">Across all clients</span>
                </div>

                <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">Total TDS Deducted</span>
                    <span className="text-base">🏷️</span>
                  </div>
                  <p className="text-2xl font-black text-purple-700 mt-1">₹{totalFilteredTds.toLocaleString('en-IN')}</p>
                  <span className="text-[10px] text-purple-600">Tax deducted by clients</span>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Total Received</span>
                    <span className="text-base">💰</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-700 mt-1">₹{totalFilteredReceived.toLocaleString('en-IN')}</p>
                  <span className="text-[10px] text-emerald-600">Net cash & bank received</span>
                </div>

                <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">Total Invoiced Amount</span>
                    <span className="text-base">🧾</span>
                  </div>
                  <p className="text-2xl font-black text-blue-900 mt-1">₹{totalFilteredInvoiced.toLocaleString('en-IN')}</p>
                  <span className="text-[10px] text-blue-600">Gross invoice value</span>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-xs">🔍</span>
                    <input
                      type="text"
                      placeholder="Search by Client Name, Client ID, Quotation No, Invoice No..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#38b34a] shadow-xs"
                    />
                  </div>

                  {/* Date Filters & Status */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">From:</span>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">To:</span>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                      />
                    </div>

                    <select
                      value={recordTypeFilter}
                      onChange={e => setRecordTypeFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#38b34a] shadow-xs cursor-pointer"
                    >
                      <option value="all">All Records (Sales &amp; Purchases)</option>
                      <option value="client_invoice">🟢 Sales Invoices Only (Green)</option>
                      <option value="purchase">🔵 Purchase Invoices Only (Blue)</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#38b34a] shadow-xs cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="paid">Fully Paid</option>
                      <option value="partially_paid">Partially Paid</option>
                    </select>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>✕</span>
                        <span>Reset</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={fetchTdsRecords}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                      title="Refresh Invoice Records"
                    >
                      <span>🔄</span>
                    </button>

                    <div className="flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-200/90 text-emerald-900 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-xs">
                      <span className="text-emerald-600 font-bold">📲 CA WhatsApp:</span>
                      <span className="font-mono font-bold text-slate-800">+91 {caPhoneNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewDefaultPhone(caPhoneNumber)
                          setShowEditCaPhoneModal(true)
                        }}
                        className="text-emerald-700 hover:text-emerald-900 underline font-bold text-[11px] ml-1 cursor-pointer"
                        title="Click to edit default CA phone number"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* TDS Records Table */}
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-3 py-3 text-center w-8">#</th>
                        <th className="px-4 py-3">Invoice No.</th>
                        <th className="px-4 py-3">Quotation No.</th>
                        <th className="px-4 py-3">Client Name & ID</th>
                        <th className="px-3 py-3">Invoice Date</th>
                        <th className="px-3 py-3 text-right">Invoice Amount</th>
                        <th className="px-3 py-3 text-right">TDS Deducted</th>
                        <th className="px-3 py-3 text-right">Received Amount</th>
                        <th className="px-3 py-3 text-center">Status</th>
                        <th className="px-3 py-3 text-center">ATTACHED DOC</th>
                        <th className="px-3 py-3 text-center">TAX INVOICE</th>
                        <th className="px-4 py-3 text-center min-w-[260px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {loadingTds ? (
                        <tr>
                          <td colSpan={12} className="py-12 text-center text-slate-400">
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                              <span>Loading invoice records from database...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredTdsRecords.length === 0 ? (
                        <tr>
                          <td colSpan={12} className="py-12 text-center text-slate-400">
                            <span className="text-3xl block mb-2">📭</span>
                            <p className="font-bold text-slate-600">No Invoice Records Found</p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {hasActiveFilters ? 'No records match your search/date filters. Try resetting the filters.' : 'General client invoices (with generated invoices / closed orders) and purchase records will appear here.'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        paginatedRecords.map((r, idx) => {
                          const isPurchase = r.record_type === 'purchase'
                          const isFullyPaid = r.is_paid || r.due_amount <= 0.01
                          const globalIdx = pageSize === 'all' ? idx + 1 : (currentPage - 1) * pageSize + idx + 1

                          return (
                            <tr
                              key={r.id || idx}
                              style={{ backgroundColor: isPurchase ? '#eaf4ff' : '#f0fdf4' }}
                              className={
                                isPurchase
                                  ? 'border-b border-sky-200 transition-colors border-l-4 !border-l-sky-500 hover:brightness-95'
                                  : 'border-b border-emerald-200 transition-colors border-l-4 !border-l-emerald-500 hover:brightness-95'
                              }
                            >
                              <td className="px-3 py-3 text-center font-bold text-slate-400">{globalIdx}</td>

                              {/* Clickable Invoice No. */}
                              <td className="px-4 py-3 font-mono font-bold">
                                <button
                                  type="button"
                                  onClick={() => handleOpenInvoiceModal(r)}
                                  className={
                                    isPurchase
                                      ? 'text-sky-800 hover:text-sky-950 hover:underline flex items-center gap-1.5 cursor-pointer text-left font-black'
                                      : 'text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1.5 cursor-pointer text-left font-black'
                                  }
                                  title="Click to view & print official Tax Invoice"
                                >
                                  <span>{isPurchase ? '📦' : '🧾'}</span>
                                  <span>{r.invoice_number}</span>
                                </button>
                                {isPurchase && r.tds_document_url && (
                                  <a
                                    href={r.tds_document_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-sky-600 hover:text-sky-900 underline font-semibold flex items-center gap-1 mt-0.5"
                                    title="View / Download original uploaded file"
                                  >
                                    <span>📎 View File</span>
                                  </a>
                                )}
                              </td>

                              {/* Quotation / PO No. */}
                              <td className="px-4 py-3 font-mono font-bold">
                                {isPurchase ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInvoiceModal(r)}
                                    className="text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-1.5 cursor-pointer text-left font-bold"
                                    title="Click to view purchase invoice breakdown"
                                  >
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-200 text-sky-800 border border-sky-300">
                                      PO
                                    </span>
                                    <span>{r.quotation_number}</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenQuotationModal(r)}
                                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                                    title="Click to view & print official Quotation"
                                  >
                                    <span>📋</span>
                                    <span>{r.quotation_number}</span>
                                  </button>
                                )}
                              </td>

                              {/* Client / Vendor Info */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  {isPurchase ? (
                                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-sky-200 text-sky-900 border border-sky-400">
                                      PURCHASE
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 border border-emerald-400">
                                      SALES INVOICE
                                    </span>
                                  )}
                                  <p className="font-bold text-slate-900 leading-snug">{r.client_name}</p>
                                </div>
                                {r.company_name && r.company_name !== r.client_name && (
                                  <p className="text-[10.5px] text-slate-500 font-medium pl-1">{r.company_name}</p>
                                )}
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-white/80 text-slate-700 border border-slate-300">
                                  {r.client_id}
                                </span>
                              </td>

                              {/* Date */}
                              <td className="px-3 py-3 text-slate-600 whitespace-nowrap font-medium">
                                {formatDateDisplay(r.invoice_date || r.quotation_date)}
                              </td>

                              {/* Total Amount */}
                              <td className="px-3 py-3 text-right font-black text-slate-900 whitespace-nowrap">
                                ₹{Number(r.total_amount || 0).toLocaleString('en-IN')}
                              </td>

                              {/* TDS Amount / File */}
                              <td className="px-3 py-3 text-right font-black whitespace-nowrap">
                                {isPurchase ? (
                                  r.tds_document_url ? (
                                    <a
                                      href={r.tds_document_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2 py-0.5 rounded-lg bg-sky-200 hover:bg-sky-300 text-sky-900 border border-sky-300 font-bold text-[11px] inline-flex items-center gap-1 transition-all"
                                      title="View uploaded document"
                                    >
                                      <span>📎</span>
                                      <span>Doc</span>
                                    </a>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-600 text-[10px] font-bold">
                                      ₹0
                                    </span>
                                  )
                                ) : (
                                  <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 border border-purple-300 font-bold inline-block">
                                    ₹{Number(r.total_tds || 0).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </td>

                              {/* Received / Cleared Amount */}
                              <td className="px-3 py-3 text-right font-black text-emerald-800 whitespace-nowrap">
                                ₹{Number(isPurchase ? (r.total_amount || 0) : (r.total_received || 0)).toLocaleString('en-IN')}
                              </td>

                              {/* Status */}
                              <td className="px-3 py-3 text-center whitespace-nowrap">
                                {isPurchase ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-sky-100 text-sky-800 border border-sky-300 shadow-xs inline-flex items-center gap-1">
                                    📦 PURCHASE RECORDED
                                  </span>
                                ) : isFullyPaid ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs inline-flex items-center gap-1">
                                    ✅ FULLY PAID
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300 shadow-xs inline-flex items-center gap-1">
                                    ⏳ PARTIALLY PAID (Due: ₹{Number(r.due_amount || 0).toLocaleString('en-IN')})
                                  </span>
                                )}
                              </td>

                              {/* ATTACHED DOC Column */}
                              <td className="px-3 py-3 text-center whitespace-nowrap">
                                {isPurchase ? (
                                  (r.tds_document_url || r.tds_document) ? (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAttachedDocModal(r)}
                                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                                      title="View, Print & Download Attached File"
                                    >
                                      <span>📎</span>
                                      <span>File</span>
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 italic text-[11px]">—</span>
                                  )
                                ) : (
                                  <span className="text-slate-300 italic text-[11px]">—</span>
                                )}
                              </td>

                              {/* TAX INVOICE Column */}
                              <td className="px-3 py-3 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleOpenInvoiceModal(r)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                                  title={isPurchase ? "View & Print Official Purchase Tax Invoice" : "View & Print Official Sales Tax Invoice"}
                                >
                                  <span>🧾</span>
                                  <span>Tax Invoice</span>
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-3 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                  {/* 1. View Details */}
                                  <button
                                    type="button"
                                    onClick={() => isPurchase ? handleOpenPurchaseDetails(r) : handleOpenDetails(r)}
                                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                                    title={isPurchase ? "View purchase breakdown & vendor items" : "View full payment installment breakdown & recorded history"}
                                  >
                                    <span>👁️</span>
                                    <span>View Details</span>
                                  </button>

                                  {/* 2. Send to CA via WhatsApp */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSendCaModal(r)}
                                    className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-emerald-500/20"
                                    title={isPurchase ? "Send official Purchase Invoice PDF to CA via WhatsApp" : "Send official Tax Invoice PDF to CA via WhatsApp"}
                                  >
                                    <span className="text-xs">📲</span>
                                    <span>Send to CA</span>
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

                {/* Pagination Controls */}
                {totalFilteredCount > 0 && (
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 font-semibold">
                      <span>
                        Showing{' '}
                        <strong className="text-slate-900 font-black">
                          {pageSize === 'all'
                            ? `1 - ${totalFilteredCount}`
                            : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalFilteredCount)}`}
                        </strong>{' '}
                        of <strong className="text-slate-900 font-black">{totalFilteredCount}</strong> invoices
                      </span>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Rows:</span>
                        <select
                          value={pageSize}
                          onChange={(e) => {
                            const val = e.target.value === 'all' ? 'all' : Number(e.target.value)
                            setPageSize(val)
                            setCurrentPage(1)
                          }}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-[#38b34a] cursor-pointer"
                        >
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                          <option value={250}>250</option>
                          <option value="all">All</option>
                        </select>
                      </div>
                    </div>

                    {pageSize !== 'all' && totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-600 transition-all cursor-pointer"
                          title="First Page"
                        >
                          «
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-600 transition-all cursor-pointer"
                        >
                          ‹ Prev
                        </button>

                        <div className="flex items-center gap-1 px-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2))
                            .map((p, pIdx, arr) => (
                              <React.Fragment key={p}>
                                {pIdx > 0 && arr[pIdx - 1] !== p - 1 && (
                                  <span className="px-1 text-slate-400 font-bold">...</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setCurrentPage(p)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    currentPage === p
                                      ? 'bg-[#38b34a] text-white shadow-xs'
                                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {p}
                                </button>
                              </React.Fragment>
                            ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-600 transition-all cursor-pointer"
                        >
                          Next ›
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-600 transition-all cursor-pointer"
                          title="Last Page"
                        >
                          »
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: GST Filings & Tax calculation */}
          {/* ============================================================ */}
          {activePageTab === 'gst_report' && (
            <div className="space-y-6">
              
              {/* GST Calc Module */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-5">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <span>📊</span>
                    <span>GST Calculation & Filing Portal</span>
                  </h4>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#ff6600]">GST Portal Simulator</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Filing Month</label>
                    <select
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#38b34a] font-bold font-sans text-slate-700 shadow-sm"
                    >
                      <option value="June 2026">June 2026 (Unfiled)</option>
                      <option value="May 2026">May 2026 (Filed)</option>
                      <option value="April 2026">April 2026 (Filed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Outward Sales Supply (Gross)</label>
                    <input
                      type="number"
                      value={outwardSales}
                      onChange={e => setOutwardSales(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#38b34a] font-bold font-sans text-slate-700 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Eligible Input Tax Credit (ITC)</label>
                    <input
                      type="number"
                      value={inputTaxCredit}
                      onChange={e => setInputTaxCredit(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#38b34a] font-bold font-sans text-slate-700 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tax Rate (IT Services)</label>
                    <select
                      value={taxRate}
                      onChange={e => setTaxRate(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#38b34a] font-bold font-sans text-slate-700 shadow-sm"
                    >
                      <option value={18}>18% (Service Industry)</option>
                      <option value={12}>12% (Goods Plan A)</option>
                      <option value={5}>5% (Essential Goods)</option>
                    </select>
                  </div>
                </div>

                {/* GST Liability results */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-slate-200">
                  <div className="bg-white border p-4 rounded-xl shadow-sm">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Output GST Liability</span>
                    <span className="text-xl font-black text-slate-800 mt-1 block">₹{calculatedTaxLiability.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white border p-4 rounded-xl shadow-sm">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Eligible ITC Offset</span>
                    <span className="text-xl font-black text-blue-600 mt-1 block">₹{inputTaxCredit.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white border-2 border-[#1e3e6b] p-4 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#1e3e6b] font-black uppercase tracking-wider block">Net Cash Payable</span>
                      <span className="text-2xl font-black text-[#1e3e6b] mt-0.5 block">₹{netGstPayable.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      onClick={handleFileReturnMock}
                      className="px-4 py-2 bg-[#ff6600] hover:bg-[#e05500] text-white font-bold rounded-lg text-xs uppercase tracking-wide cursor-pointer transition-all shadow-md active:scale-95"
                    >
                      File Return
                    </button>
                  </div>
                </div>
              </div>

              {/* GST returns filings log */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">GST Filing History Logs</h4>
                  <span className="text-xs text-slate-400 font-medium">Auto-generated return acknowledgements</span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Filing Period</th>
                          <th className="px-6 py-4">GST Return Type</th>
                          <th className="px-6 py-4 text-right">Taxable Outward Sales</th>
                          <th className="px-6 py-4 text-right">Output GST Liability</th>
                          <th className="px-6 py-4 text-right">ITC offset</th>
                          <th className="px-6 py-4">Filing Date</th>
                          <th className="px-6 py-4 font-mono">GST Ack Number</th>
                          <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                        {filings.map(fil => (
                          <tr key={fil.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-slate-800 font-bold">{fil.period}</td>
                            <td className="px-6 py-4 text-slate-500 font-bold">{fil.return_type}</td>
                            <td className="px-6 py-4 text-right font-black">₹{fil.taxable_value.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-4 text-right font-black">₹{fil.tax_liability.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-4 text-right font-black text-blue-600">
                              {fil.itc_claimed > 0 ? `₹${fil.itc_claimed.toLocaleString('en-IN')}` : '—'}
                            </td>
                            <td className="px-6 py-4 text-slate-500">{new Date(fil.file_date).toLocaleDateString('en-IN')}</td>
                            <td className="px-6 py-4 font-mono text-[10px] text-slate-400 font-bold">{fil.ack_no}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[10px] uppercase tracking-wider">
                                {fil.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: Corporate Audit reports */}
          {/* ============================================================ */}
          {activePageTab === 'audit_report' && (
            <div className="space-y-6">
              
              {/* Top Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Audits Completed</span>
                    <span className="text-xl font-black text-slate-800 mt-1 block">{audits.length}</span>
                  </div>
                  <span className="text-xl">✅</span>
                </div>
                <div className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Compliance Health</span>
                    <span className="text-xl font-black text-emerald-600 mt-1 block">96%</span>
                  </div>
                  <span className="text-xl text-emerald-500">🛡️</span>
                </div>
                <div className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Actions</span>
                    <span className="text-xl font-black text-amber-500 mt-1 block">1</span>
                  </div>
                  <span className="text-xl text-amber-500">⏳</span>
                </div>
                <div className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Last Review Date</span>
                    <span className="text-xs font-bold text-slate-700 mt-1.5 block">12 May 2026</span>
                  </div>
                  <span className="text-xl">📅</span>
                </div>
              </div>

              {/* Audit history list */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Audit ID</th>
                        <th className="px-6 py-4">Audit Assessment</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Assigned Auditor</th>
                        <th className="px-6 py-4">Inspection Date</th>
                        <th className="px-6 py-4">Remarks & Findings</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Report</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {audits.map(aud => (
                        <tr key={aud.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-400">{aud.audit_id}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-800">{aud.title}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 font-bold text-[9px] uppercase tracking-wide">
                              {aud.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{aud.auditor}</td>
                          <td className="px-6 py-4 text-slate-500">{new Date(aud.date).toLocaleDateString('en-IN')}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium italic max-w-xs truncate">"{aud.remarks}"</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              aud.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                            }`}>
                              {aud.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDownloadReport(aud.title)}
                              className="text-blue-600 hover:text-blue-800 font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                            >
                              📥 PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: PAYMENT DETAILS / RECORDED BREAKDOWN MODAL */}
      {/* ============================================================ */}
      {showPaymentDetailsModal && selectedPaymentRecord && (() => {
        const r = selectedPaymentRecord
        const paymentsList = Array.isArray(r.payments) ? r.payments : []
        const isSettled = r.is_paid || r.due_amount <= 0.01

        return (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col text-slate-800 overflow-hidden my-auto">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 px-6 py-4 shrink-0 bg-white">
                <div>
                  <h3 className="text-base font-black text-[#1e3e6b] flex items-center gap-1.5">
                    <span>💳</span>
                    <span>Payment &amp; TDS Breakdown</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Invoice: <strong className="font-mono text-purple-700">{r.invoice_number}</strong> | Client: <strong>{r.client_name}</strong> (ID: {r.client_id})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentDetailsModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {/* 3 Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Invoice</span>
                    <p className="text-base font-black text-slate-800 mt-0.5">₹{Number(r.total_amount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-center">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Total Amount Settled</span>
                    <p className="text-base font-black text-emerald-700 mt-0.5">₹{Number(r.total_settled || 0).toLocaleString('en-IN')}</p>
                    <span className="text-[8.5px] text-emerald-600 block mt-0.5 font-medium">
                      Rec: ₹{Number(r.total_received || 0).toLocaleString('en-IN')} | TDS: ₹{Number(r.total_tds || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className={`p-3.5 rounded-2xl text-center border ${r.due_amount > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider block ${r.due_amount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      Remaining Due
                    </span>
                    <p className={`text-base font-black mt-0.5 ${r.due_amount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      ₹{Number(r.due_amount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Settlement Notice */}
                {isSettled ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center gap-2 font-bold text-xs">
                    <span className="text-lg">🎉</span>
                    <span>This invoice is fully settled! Total ₹{Number(r.total_amount || 0).toLocaleString('en-IN')} has been cleared (Received + TDS) with ₹0 remaining due.</span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 flex items-center gap-2 font-bold text-xs">
                    <span className="text-lg">⏳</span>
                    <span>This invoice has an outstanding balance of ₹{Number(r.due_amount || 0).toLocaleString('en-IN')}.</span>
                  </div>
                )}

                {/* Payment Breakdown Table */}
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📋</span>
                    <span>Payment Recorded History &amp; Installments:</span>
                  </h4>

                  {paymentsList.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-slate-400 text-xs">
                      No payment records found for this invoice.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                            <th className="px-3 py-2.5 text-center w-8">#</th>
                            <th className="px-3 py-2.5">Date &amp; Time</th>
                            <th className="px-3 py-2.5 text-right">Received</th>
                            <th className="px-3 py-2.5 text-right">TDS</th>
                            <th className="px-3 py-2.5 text-right">Total Settled</th>
                            <th className="px-3 py-2.5">Mode</th>
                            <th className="px-3 py-2.5 text-center">TDS Doc</th>
                            <th className="px-3 py-2.5">Reference / Transaction No.</th>
                            <th className="px-3 py-2.5">Notes / Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {paymentsList.map((p, pIdx) => {
                            const pTds = getPaymentTds(p)
                            const pDoc = getPaymentTdsDoc(p)
                            const pTotal = Number(p.amount || 0) + pTds
                            const refNoDisplay = getPaymentRefNo(p)
                            const notesDisplay = getPaymentNotes(p)

                            return (
                              <tr key={p.id || pIdx} className="hover:bg-slate-50">
                                <td className="px-3 py-2 text-center font-bold text-slate-400">{pIdx + 1}</td>
                                <td className="px-3 py-2 text-slate-600 font-medium whitespace-nowrap">
                                  <div>
                                    {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (p.paid_at || 'Recorded')}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {p.created_at ? new Date(p.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-right font-black text-emerald-700 whitespace-nowrap">
                                  ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="px-3 py-2 text-right font-bold text-purple-700 whitespace-nowrap">
                                  {pTds > 0 ? (
                                    <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                      ₹{pTds.toLocaleString('en-IN')}
                                    </span>
                                  ) : '—'}
                                </td>
                                <td className="px-3 py-2 text-right font-black text-slate-800 whitespace-nowrap">
                                  ₹{pTotal.toLocaleString('en-IN')}
                                </td>
                                <td className="px-3 py-2 font-bold text-slate-700 whitespace-nowrap">
                                  {p.payment_method || 'Bank Transfer'}
                                </td>
                                <td className="px-3 py-2 text-center whitespace-nowrap">
                                  {pDoc ? (
                                    <a
                                      href={getTdsDocUrl(pDoc)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:text-purple-800 hover:underline px-2 py-0.5 bg-purple-50 rounded-lg border border-purple-200"
                                      title="View / Download TDS Certificate / Document"
                                    >
                                      <span>📄</span>
                                      <span>View</span>
                                    </a>
                                  ) : (
                                    <span className="text-slate-300 font-mono">—</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 font-mono text-[11px] text-slate-700">
                                  {refNoDisplay}
                                </td>
                                <td className="px-3 py-2 text-slate-600 text-[11px] max-w-[200px] truncate" title={notesDisplay !== '—' ? notesDisplay : ''}>
                                  {notesDisplay}
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

              {/* Modal Footer */}
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPaymentDetailsModal(false)}
                  className="px-5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ============================================================ */}
      {/* MODAL 2: HIGH-FIDELITY OFFICIAL TAX INVOICE VIEWER */}
      {/* ============================================================ */}
      {showInvoiceDocModal && viewingInvoiceDoc && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-fade-in print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col text-slate-800 overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
            {/* Modal Controls Top Bar (Hidden on Print) */}
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Official Tax Invoice
                </span>
                <span className="font-mono text-xs font-bold text-slate-300">
                  {viewingInvoiceDoc.invoice_number || `INV-${viewingInvoiceDoc.id}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>🖨️</span>
                  <span>Print / Save PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowInvoiceDocModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition-colors ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Body (A4 Style Paper) */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/60 print:p-0 print:bg-white print:overflow-visible font-sans">
              <div
                id="compliance-invoice-document-paper"
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 md:p-7 space-y-3 sm:space-y-4 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto"
              >
                {/* 1. Tax Invoice Title */}
                <div className="text-center -mt-1 sm:-mt-2 pt-0 pb-0.5">
                  <h1 className="text-xs sm:text-sm font-black text-[#1e3e6b] tracking-[0.25em] uppercase font-sans">
                    TAX INVOICE
                  </h1>
                </div>

                {/* 2. Letterhead & Brand Header with Company Logo */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3 sm:pb-4 border-b-2 border-slate-800">
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
                          INVOICE NO.
                        </span>
                        <p className="font-mono font-black text-[#1e3e6b] text-base">
                          {viewingInvoiceDoc.invoice_number || `INV-${viewingInvoiceDoc.id}`}
                        </p>
                      </div>
                      <p className="text-slate-500 font-medium">
                        Invoice Date: <strong className="text-slate-800">{formatDateDisplay(viewingInvoiceDoc.invoice_date || viewingInvoiceDoc.quotation_date)}</strong>
                      </p>
                      {viewingInvoiceDoc.quotation_number && (
                        <p className="text-slate-500 text-[11px]">
                          Quotation Ref: <strong className="font-mono text-blue-600">{viewingInvoiceDoc.quotation_number}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Billed To & Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                      {viewingInvoiceDoc.record_type === 'purchase' ? 'VENDOR / SUPPLIER:' : 'BILLED TO:'}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {viewingInvoiceDoc.client?.company_name || viewingInvoiceDoc.client?.client_name || viewingInvoiceDoc.client_name || 'Valued Client'}
                    </h3>
                    {viewingInvoiceDoc.client?.contact_person && (
                      <p className="text-slate-600 font-medium">
                        Attn: <strong>{viewingInvoiceDoc.client.contact_person}</strong>
                      </p>
                    )}
                    <p className="text-slate-600">{viewingInvoiceDoc.client?.email || '—'}</p>
                    <p className="text-slate-600">{viewingInvoiceDoc.client?.contact_number || viewingInvoiceDoc.client?.client_phone || '—'}</p>
                    {viewingInvoiceDoc.client?.address && (
                      <p className="text-slate-500 pt-0.5 leading-snug">
                        {viewingInvoiceDoc.client.address}
                        {viewingInvoiceDoc.client.district ? `, ${viewingInvoiceDoc.client.district}` : ''}
                        {viewingInvoiceDoc.client.state ? `, ${viewingInvoiceDoc.client.state}` : ''}
                        {viewingInvoiceDoc.client.pin_code ? ` - ${viewingInvoiceDoc.client.pin_code}` : ''}
                      </p>
                    )}
                    {viewingInvoiceDoc.client?.gstin && (
                      <p className="font-mono text-slate-700 font-bold pt-1">
                        GSTIN: {viewingInvoiceDoc.client.gstin}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                      TAX &amp; METADATA:
                    </span>
                    <p className="text-slate-700">
                      Sold / Prepared By: <strong>{viewingInvoiceDoc.client?.sold_by_name || 'Admin Sales Team'}</strong>
                    </p>
                    <p className="text-slate-700">
                      Branch: <strong>{viewingInvoiceDoc.client?.branch_name || 'Head Office (Kolkata)'}</strong>
                    </p>
                    <p className="text-slate-700">
                      Tax Regime: <strong>{viewingInvoiceDoc.gst_type || viewingInvoiceDoc.client?.gst_type || 'Intra-State'}</strong>
                    </p>
                    <p className="text-slate-700">
                      Country: <strong>{countryFlags[viewingInvoiceDoc.client?.country_code] || '🇮🇳'} {viewingInvoiceDoc.client?.country_code || 'IN'}</strong>
                    </p>
                  </div>
                </div>

                {/* 4. Scope & Items Table */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                    {viewingInvoiceDoc.record_type === 'purchase'
                      ? 'Scope of Items & Purchase Line Items:'
                      : 'Scope of Services & Line Items:'}
                  </span>
                  <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                          <th className="px-3.5 py-2.5 text-center w-10">#</th>
                          <th className="px-4 py-2.5 min-w-[280px]">
                            {viewingInvoiceDoc.record_type === 'purchase'
                              ? 'Item Title & Description'
                              : 'Service Title & Description'}
                          </th>
                          <th className="px-2.5 py-2.5 text-center w-16">HSN/SAC</th>
                          <th className="px-2 py-2.5 text-center w-12">Qty</th>
                          <th className="px-3 py-2.5 text-right w-20">Rate (₹)</th>
                          <th className="px-2 py-2.5 text-center w-12">Disc</th>
                          <th className="px-3.5 py-2.5 text-right w-24">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {(viewingInvoiceDoc.items || []).map((item, idx) => {
                          const isPurchase = viewingInvoiceDoc.record_type === 'purchase'
                          const qty = Number(item.qty || item.quantity || 1)
                          const price = Number(item.rate || item.selling_price || item.price || 0)
                          const disc = Number(item.discount_percentage || item.discount || 0)
                          const lineTotal = Number(item.amount || (Math.round(qty * price * (1 - disc / 100) * 100) / 100))
                          const itemName = item.item_name || item.product_name || item.name || item.service_name || (isPurchase ? 'Purchased Item' : 'Service Item')
                          const hsnCode = item.hsn_code || item.hsn_sac || item.hsn || (isPurchase ? '—' : '998313')

                          return (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                              <td className="px-3.5 py-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <p className="font-extrabold text-slate-900 leading-snug">
                                  {itemName}
                                </p>
                                {item.description && (
                                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5 whitespace-pre-line">
                                    {item.description}
                                  </p>
                                )}
                              </td>
                              <td className="px-2.5 py-3 text-center font-mono text-slate-600">{hsnCode}</td>
                              <td className="px-2 py-3 text-center font-bold text-slate-700">
                                {qty} {item.unit ? <span className="text-[10px] text-slate-400 font-normal">({item.unit})</span> : ''}
                              </td>
                              <td className="px-3 py-3 text-right font-mono text-slate-700">₹{price.toLocaleString('en-IN')}</td>
                              <td className="px-2 py-3 text-center text-slate-500">{disc > 0 ? `${disc}%` : '—'}</td>
                              <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-900">₹{lineTotal.toLocaleString('en-IN')}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 5. Financial Calculations & Bank Details (Ditto as Proforma Invoice) */}
                <div className="invoice-financials-block grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <div className="space-y-4">
                    <div className="p-3.5 sm:p-4 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs space-y-2">
                      <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest block">
                        Bank Transfer &amp; UPI Details:
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
                        ₹{Number(viewingInvoiceDoc.subtotal || viewingInvoiceDoc.total_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {(viewingInvoiceDoc.client?.country_code || 'IN') === 'IN' ? (
                      (viewingInvoiceDoc.gst_type || 'Intra-State') === 'Intra-State' ? (
                        <>
                          <div className="flex justify-between text-slate-500 text-[11px]">
                            <span>CGST (9%):</span>
                            <span>₹{Number(viewingInvoiceDoc.cgst || (viewingInvoiceDoc.tax_total / 2) || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 text-[11px]">
                            <span>SGST (9%):</span>
                            <span>₹{Number(viewingInvoiceDoc.sgst || (viewingInvoiceDoc.tax_total / 2) || 0).toLocaleString('en-IN')}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>IGST (18%):</span>
                          <span>₹{Number(viewingInvoiceDoc.igst || viewingInvoiceDoc.tax_total || 0).toLocaleString('en-IN')}</span>
                        </div>
                      )
                    ) : (
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Export Tax (18%):</span>
                        <span>₹{Number(viewingInvoiceDoc.tax_total || 0).toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-700 font-bold border-t border-slate-200 pt-2">
                      <span>Total Tax:</span>
                      <span>₹{Number(viewingInvoiceDoc.tax_total || 0).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center border-t-2 border-slate-800 pt-2.5 text-base font-black text-slate-900">
                      <span>Invoice Total:</span>
                      <span className="text-xl text-[#38b34a]">
                        ₹{Number(viewingInvoiceDoc.grand_total || viewingInvoiceDoc.total_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. Combined Amount in Words & Payment Terms Box */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Amount in Words:
                    </span>
                    <p className="font-bold text-slate-800 italic leading-relaxed">
                      {numberToIndianWords(viewingInvoiceDoc.grand_total || viewingInvoiceDoc.total_amount)}
                    </p>
                  </div>
                  <div className="border-t border-slate-200/80 pt-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Payment Terms:
                    </span>
                    <p className="font-bold text-slate-800 leading-relaxed">
                      {viewingInvoiceDoc.payment_terms || 'Due on Receipt'}
                    </p>
                  </div>
                </div>

                {/* 7. Terms & Signature */}
                <div className="invoice-terms-signature grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-slate-200 text-xs" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <div className="sm:col-span-2 space-y-1 text-slate-500 text-[10px]">
                    <span className="font-black text-slate-700 uppercase tracking-wider block">Terms &amp; Conditions:</span>
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>Payment is due according to the agreed terms mentioned on this invoice.</li>
                      <li>All cheques / transfers should be drawn in favour of AIM Digitalise Pvt. Ltd.</li>
                      <li>For any billing inquiries, contact <strong>accounts@aimdigitalise.com</strong>.</li>
                    </ol>
                  </div>

                  <div className="invoice-signature-block text-center sm:text-right space-y-1 pt-1" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      For AIM Digitalise Pvt. Ltd.
                    </span>
                    <div className="inline-block text-center space-y-1">
                      <img
                        src="https://api.nexgn.in/public/signature_1.png"
                        alt="Boss Signature"
                        className="h-14 w-auto object-contain mx-auto my-1"
                        onError={(e) => {
                          const target = e.currentTarget
                          if (target.src.includes('https://api.nexgn.in/public/signature_1.png')) {
                            target.src = 'https://api.nexgn.in/signature_1.png'
                          } else {
                            target.onerror = null
                          }
                        }}
                      />
                      <div className="border-t border-slate-400 pt-1 min-w-[140px]">
                        <span className="font-black text-slate-800 text-xs block">Authorized Signatory</span>
                        <span className="text-[9px] text-slate-400 block font-medium">Digital Signature &amp; Stamp</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowInvoiceDocModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
              >
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: HIGH-FIDELITY OFFICIAL QUOTATION DOCUMENT VIEWER */}
      {/* ============================================================ */}
      {showQuotationDocModal && viewingQuotationDoc && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-fade-in print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col text-slate-800 overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
            {/* Modal Controls Top Bar (Hidden on Print) */}
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
                  onClick={handlePrintQuotation}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>🖨️</span>
                  <span>Print / Save PDF</span>
                </button>

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
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/60 print:p-0 print:bg-white print:overflow-visible font-sans">
              <div
                id="compliance-quotation-document-paper"
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 md:p-7 space-y-3 sm:space-y-4 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto"
              >
                {/* 1. Proforma Invoice Title */}
                <div className="text-center -mt-1 sm:-mt-2 pt-0 pb-0.5">
                  <h1 className="text-xs sm:text-sm font-black text-[#1e3e6b] tracking-[0.25em] uppercase font-sans">
                    PROFORMA INVOICE
                  </h1>
                </div>

                {/* 2. Letterhead & Brand Header with Company Logo */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3 sm:pb-4 border-b-2 border-slate-800">
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
                    <p className="text-slate-600">{viewingQuotationDoc.client?.contact_number || viewingQuotationDoc.client?.client_phone || '—'}</p>
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
                      EXECUTIVE &amp; ORDER METADATA:
                    </span>
                    <p className="text-slate-700">
                      Sold / Prepared By: <strong>{viewingQuotationDoc.client?.sold_by_name || 'Admin Sales Team'}</strong>
                    </p>
                    <p className="text-slate-700">
                      Branch: <strong>{viewingQuotationDoc.client?.branch_name || 'Head Office (Kolkata)'}</strong>
                    </p>
                    <p className="text-slate-700">
                      Tax Regime: <strong>{viewingQuotationDoc.gst_type || viewingQuotationDoc.client?.gst_type || 'Intra-State'}</strong>
                    </p>
                    <p className="text-slate-700">
                      Country: <strong>{countryFlags[viewingQuotationDoc.client?.country_code] || '🇮🇳'} {viewingQuotationDoc.client?.country_code || 'IN'}</strong>
                    </p>
                  </div>
                </div>

                {/* 4. Scope & Line Items */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                    Scope of Services &amp; Line Items:
                  </span>
                  <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                          <th className="px-3.5 py-2.5 text-center w-10">#</th>
                          <th className="px-4 py-2.5 min-w-[280px]">Service Title &amp; Description</th>
                          <th className="px-2.5 py-2.5 text-center w-16">HSN/SAC</th>
                          <th className="px-2 py-2.5 text-center w-12">Qty</th>
                          <th className="px-3 py-2.5 text-right w-20">Rate (₹)</th>
                          <th className="px-2 py-2.5 text-center w-12">Disc</th>
                          <th className="px-3.5 py-2.5 text-right w-24">Amount (₹)</th>
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
                                {item.hsn_sac || item.hsn || '998314'}
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
                        Bank Transfer &amp; UPI Details:
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
                        ₹{Number(viewingQuotationDoc.grand_total || viewingQuotationDoc.total_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. Combined Amount in Words & Payment Terms Box */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Amount in Words:
                    </span>
                    <p className="font-bold text-slate-800 italic leading-relaxed">
                      {numberToIndianWords(viewingQuotationDoc.grand_total || viewingQuotationDoc.total_amount)}
                    </p>
                  </div>
                  <div className="border-t border-slate-200/80 pt-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Payment Terms:
                    </span>
                    <p className="font-bold text-slate-800 leading-relaxed">
                      {viewingQuotationDoc.payment_terms || 'Due on Receipt'}
                    </p>
                  </div>
                </div>

                {/* 7. Terms & Signature */}
                <div className="quotation-terms-signature grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-slate-200 text-xs" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <div className="sm:col-span-2 space-y-1 text-slate-500 text-[10px]">
                    <span className="font-black text-slate-700 uppercase tracking-wider block">Terms &amp; Conditions:</span>
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>This quotation is valid for 30 days from the date of issuance.</li>
                      <li>Work commences immediately upon receipt of initial confirmation or advance.</li>
                      <li>GST/Taxes are calculated based on registered business jurisdiction.</li>
                      <li>For any inquiries regarding this quotation, contact <strong>support@aimdigitalise.com</strong>.</li>
                    </ol>
                  </div>

                  <div className="quotation-signature-block text-center sm:text-right space-y-1 pt-1" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      For AIM Digitalise Pvt. Ltd.
                    </span>
                    <div className="inline-block text-center space-y-1">
                      <img
                        src="https://api.nexgn.in/public/signature_1.png"
                        alt="Boss Signature"
                        className="h-14 w-auto object-contain mx-auto my-1"
                        onError={(e) => {
                          const target = e.currentTarget
                          if (target.src.includes('https://api.nexgn.in/public/signature_1.png')) {
                            target.src = 'https://api.nexgn.in/signature_1.png'
                          } else {
                            target.onerror = null
                          }
                        }}
                      />
                      <div className="border-t border-slate-400 pt-1 min-w-[140px]">
                        <span className="font-black text-slate-800 text-xs block">Authorized Signatory</span>
                        <span className="text-[9px] text-slate-400 block font-medium">Digital Signature &amp; Stamp</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowQuotationDocModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
              >
                Close Quotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PURCHASE RECORD DETAILS MODAL */}
      {/* ============================================================ */}
      {showPurchaseDetailsModal && selectedPurchaseDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-sky-800 to-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg shadow-inner">
                  📦
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Purchase Entry &amp; TDS Details</h3>
                  <p className="text-xs text-sky-100/90 font-mono">
                    PO: {selectedPurchaseDetail.quotation_number} | Bill: {selectedPurchaseDetail.invoice_number}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPurchaseDetailsModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Vendor & Bill Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-sky-50/60 border border-sky-200/80 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">Vendor Details</span>
                  <div className="font-bold text-sm text-slate-800">{selectedPurchaseDetail.client_name}</div>
                  <div className="text-slate-600">Contact: {selectedPurchaseDetail.company_name || 'N/A'}</div>
                  <div className="font-mono text-slate-600 font-bold">GSTIN: {selectedPurchaseDetail.client?.gstin || selectedPurchaseDetail.client_id || 'N/A'}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Financial Summary</span>
                  <div className="text-xs text-slate-600">Purchase Date: <strong>{formatDateDisplay(selectedPurchaseDetail.invoice_date || selectedPurchaseDetail.quotation_date)}</strong></div>
                  <div className="text-sm font-black text-slate-900">Total Purchase: ₹{Number(selectedPurchaseDetail.total_amount || 0).toLocaleString('en-IN')}</div>
                  <div className="text-xs text-emerald-700 font-bold">Status: Recorded / Cleared</div>
                </div>
              </div>

              {/* Uploaded TDS / Bill Document Box */}
              <div className="bg-white border-2 border-dashed border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl shrink-0">
                    📎
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-800">Uploaded TDS / Purchase Document</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {selectedPurchaseDetail.tds_document ? String(selectedPurchaseDetail.tds_document).split('/').pop() : 'No document file uploaded'}
                    </div>
                  </div>
                </div>
                {selectedPurchaseDetail.tds_document_url ? (
                  <a
                    href={selectedPurchaseDetail.tds_document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>👁️ View Document</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">No file attached</span>
                )}
              </div>

              {/* Line Items Table */}
              {selectedPurchaseDetail.items && selectedPurchaseDetail.items.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Purchased Line Items:</span>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2 w-8 text-center">#</th>
                          <th className="px-3 py-2">Item Name</th>
                          <th className="px-3 py-2 text-center">HSN</th>
                          <th className="px-3 py-2 text-center">Qty</th>
                          <th className="px-3 py-2 text-right">Rate</th>
                          <th className="px-3 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {selectedPurchaseDetail.items.map((it, idx) => (
                          <tr key={it.id || idx}>
                            <td className="px-3 py-2 text-center text-slate-400">{idx + 1}</td>
                            <td className="px-3 py-2 font-bold text-slate-800">{it.item_name || 'Item'}</td>
                            <td className="px-3 py-2 text-center font-mono text-slate-500">{it.hsn_code || '—'}</td>
                            <td className="px-3 py-2 text-center">{Number(it.quantity || 1)} {it.unit || ''}</td>
                            <td className="px-3 py-2 text-right font-mono">₹{Number(it.rate || 0).toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">₹{Number(it.amount || 0).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedPurchaseDetail.notes && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Notes / Remarks:</span>
                  <p className="text-slate-700 whitespace-pre-line">{selectedPurchaseDetail.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowPurchaseDetailsModal(false)
                  handleOpenSendCaModal(selectedPurchaseDetail)
                }}
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>📲 Send to CA via WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPurchaseDetailsModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SEND TO CA MODAL (WHATSAPP DISPATCH) */}
      {/* ============================================================ */}
      {showSendCaModal && selectedInvoiceForCa && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg shadow-inner">
                  📲
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Send Tax Invoice to CA</h3>
                  <p className="text-xs text-emerald-100/90">Instant WhatsApp dispatch with official Tax Invoice PDF</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSendCaModal(false)
                  setCaSendResult(null)
                }}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Invoice Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invoice Number</span>
                    <span className="font-mono font-bold text-sm text-[#1e3e6b]">{selectedInvoiceForCa.invoice_number}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quotation Ref</span>
                    <span className="font-mono text-xs font-semibold text-slate-600">{selectedInvoiceForCa.quotation_number}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Client Name:</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {selectedInvoiceForCa.client?.client_name || selectedInvoiceForCa.client?.company_name || 'Valued Client'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ID: {selectedInvoiceForCa.client?.client_code || 'N/A'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Financials:</span>
                    <span className="font-bold text-[#38b34a] block">
                      ₹{Number(selectedInvoiceForCa.total_amount || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-purple-600 font-semibold block">
                      TDS: ₹{Number(selectedInvoiceForCa.total_tds_deducted || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {!caSendResult ? (
                <>
                  {/* Phone Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Chartered Accountant (CA) WhatsApp Number: <span className="text-red-500">*</span>
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                      <span className="bg-slate-100 text-slate-700 px-3.5 py-2.5 text-xs font-bold flex items-center border-r border-slate-300">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={caModalPhone}
                        onChange={(e) => setCaModalPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="flex-1 px-3 py-2 text-sm font-mono font-bold text-slate-800 outline-none"
                        placeholder="9865680538"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-start gap-1 pt-0.5">
                      <span className="text-emerald-600 font-bold">ℹ️</span>
                      <span>Default: <strong>9865680538</strong>. Editing this number automatically stores it as the latest CA number for future dispatches.</span>
                    </p>
                  </div>

                  {/* Attachment Info */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm shrink-0">
                      📄
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-emerald-950">Official Tax Invoice Attached</div>
                      <div className="text-[11px] text-emerald-700">Ditto identical to the official print/save PDF layout (SBI Bank details, UPI QR, terms).</div>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Message Content</span>
                    <div className="font-mono text-[11px] text-slate-700 whitespace-pre-line bg-white p-2.5 rounded-lg border border-slate-200/70 max-h-36 overflow-y-auto">
                      <strong>*TAX INVOICE — AIM DIGITALISE PVT. LTD.*</strong>{'\n\n'}
                      Dear CA,{'\n'}
                      Please find the official Tax Invoice for TDS &amp; GST compliance records:{'\n\n'}
                      • Invoice No: {selectedInvoiceForCa.invoice_number}{'\n'}
                      • Client: {selectedInvoiceForCa.client?.client_name || 'Valued Client'} ({selectedInvoiceForCa.client?.client_code || ''}){'\n'}
                      • Invoice Total: ₹{Number(selectedInvoiceForCa.total_amount || 0).toLocaleString('en-IN')}{'\n'}
                      • TDS Deducted: ₹{Number(selectedInvoiceForCa.total_tds_deducted || 0).toLocaleString('en-IN')}{'\n'}
                      • Cleared: ₹{Number(selectedInvoiceForCa.total_cleared || 0).toLocaleString('en-IN')}{'\n\n'}
                      📎 Official Tax Invoice PDF is attached.
                    </div>
                  </div>
                </>
              ) : (
                /* Success & Delivery Info */
                <div className="space-y-4 py-2">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                    <div className="text-3xl">🎉</div>
                    <h4 className="font-bold text-emerald-900 text-sm">{caSendResult.message}</h4>
                    <p className="text-xs text-emerald-700 font-mono">Dispatched to: +91 {caSendResult.phone}</p>
                  </div>

                  {caSendResult.pdf_url && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Generated Tax Invoice PDF</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={caSendResult.pdf_url}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-600 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(caSendResult.pdf_url)
                            alert('PDF URL copied to clipboard!')
                          }}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                        >
                          Copy
                        </button>
                        <a
                          href={caSendResult.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-[#1e3e6b] hover:bg-[#152e50] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                        >
                          View PDF
                        </a>
                      </div>
                    </div>
                  )}

                  {caSendResult.whatsapp_web_url && (
                    <div className="text-center pt-1">
                      <a
                        href={caSendResult.whatsapp_web_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                      >
                        <span>📲</span>
                        <span>Open in WhatsApp Web</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              {!caSendResult ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowSendCaModal(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendInvoiceToCa}
                    disabled={sendingToCa}
                    className="px-5 py-2 bg-[#25D366] hover:bg-[#20ba59] disabled:bg-slate-400 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {sendingToCa ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <span>📲</span>
                        <span>Send to CA Now</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowSendCaModal(false)
                    setCaSendResult(null)
                  }}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EDIT DEFAULT CA WHATSAPP NUMBER MODAL */}
      {/* ============================================================ */}
      {showEditCaPhoneModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 bg-[#1e3e6b] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Edit Default CA WhatsApp Number</h3>
              <button
                type="button"
                onClick={() => setShowEditCaPhoneModal(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Default CA WhatsApp Mobile Number:
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <span className="bg-slate-100 text-slate-700 px-3 py-2 text-xs font-bold flex items-center border-r border-slate-300">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={newDefaultPhone}
                  onChange={(e) => setNewDefaultPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 px-3 py-2 text-sm font-mono font-bold text-slate-800 outline-none"
                  placeholder="9865680538"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                This number will be stored permanently in the system and pre-selected whenever you click "Send to CA".
              </p>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEditCaPhoneModal(false)}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDefaultCaPhone}
                disabled={updatingDefaultPhone}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                {updatingDefaultPhone ? 'Saving...' : 'Save as Default'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ATTACHED DOCUMENT VIEWER MODAL (PRINT & SAVE READY) */}
      {/* ============================================================ */}
      {showAttachedDocModal && selectedAttachedDoc && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col text-slate-800 overflow-hidden">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold">
                  📎
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate text-white leading-tight">
                    {selectedAttachedDoc.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {selectedAttachedDoc.clientName ? `${selectedAttachedDoc.clientName} • ` : ''}
                    {selectedAttachedDoc.filename}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Print, Download, Open, Close */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => printAttachedFile(selectedAttachedDoc.fileUrl, selectedAttachedDoc.title)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Print Document or Save as PDF"
                >
                  <span>🖨️</span>
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadAttachedFile(selectedAttachedDoc.fileUrl, selectedAttachedDoc.filename)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Download File to Computer"
                >
                  <span>💾</span>
                  <span>Save / Download</span>
                </button>

                <a
                  href={selectedAttachedDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors hidden sm:inline-flex items-center gap-1"
                  title="Open file in a fresh browser tab"
                >
                  <span>↗️</span>
                  <span>New Tab</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setShowAttachedDocModal(false)
                    setSelectedAttachedDoc(null)
                  }}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition-colors ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Preview Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/80 flex items-center justify-center min-h-[300px]">
              {selectedAttachedDoc.fileUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={selectedAttachedDoc.fileUrl}
                  title="PDF Preview"
                  className="w-full h-[75vh] rounded-2xl border border-slate-300 bg-white shadow-sm"
                />
              ) : (
                <div className="max-w-full max-h-[75vh] flex items-center justify-center">
                  <img
                    src={selectedAttachedDoc.fileUrl}
                    alt="Attached Document"
                    className="max-h-[74vh] max-w-full object-contain rounded-2xl shadow-lg border border-slate-200 bg-white"
                  />
                </div>
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span className="font-mono text-[11px] truncate max-w-md">
                Source: {selectedAttachedDoc.fileUrl}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowAttachedDocModal(false)
                  setSelectedAttachedDoc(null)
                }}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
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

export default AdminCompliance
