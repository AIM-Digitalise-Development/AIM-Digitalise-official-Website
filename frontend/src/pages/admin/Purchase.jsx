import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import companyLogo from '../../assets/images/logo.png'
import {
  getVendors,
  createVendor,
  deleteVendor,
  getItems,
  createItem,
  deleteItem,
  getPurchases,
  createPurchase,
  deletePurchase,
  recordPurchasePayment,
} from '../../api/admin/purchase'

const ITEM_UNITS = ['unit', 'month', 'account', 'box', 'piece']

const formatCurrency = (val) => {
  return `₹${Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// Convert numbers to Indian Rupees words
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

// Normalize Storage Document URL
const getInvoiceDocUrl = (urlOrPath) => {
  if (!urlOrPath) return ''
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath
  }
  const base = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
  const host = base.replace(/\/api\/?$/, '')
  const cleanPath = urlOrPath.replace(/^storage\//, '').replace(/^\//, '')
  return `${host}/storage/${cleanPath}`
}

// Print Attached File (Image or PDF)
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

// Download Attached File
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

const Purchase = () => {
  // ── Subtabs State (only these 6 subtabs) ──
  const [activeSubtab, setActiveSubtab] = useState('vendor_entry')

  // ── Data States ──
  const [vendors, setVendors] = useState([])
  const [items, setItems] = useState([])
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' })

  // ── Search Filters ──
  const [vendorSearch, setVendorSearch] = useState('')
  const [itemSearch, setItemSearch] = useState('')
  const [purchaseSearch, setPurchaseSearch] = useState('')

  // ── Modals State ──
  // 1. Quick Items Breakdown Modal
  const [viewingPurchase, setViewingPurchase] = useState(null)

  // 2. Attached Document Viewer Modal (for [ 📄 View Invoice ])
  const [showAttachedDocModal, setShowAttachedDocModal] = useState(false)
  const [selectedAttachedDoc, setSelectedAttachedDoc] = useState(null)

  // 3. Record Part Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentPurchase, setPaymentPurchase] = useState(null)
  const [payProcessed, setPayProcessed] = useState('')
  const [payTds, setPayTds] = useState('')
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0])
  const [payMode, setPayMode] = useState('Bank Transfer')
  const [payRef, setPayRef] = useState('')
  const [payNotes, setPayNotes] = useState('')
  const [submittingPayment, setSubmittingPayment] = useState(false)

  // 4. Payment History Modal (All part payment details against a single invoice)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyPurchase, setHistoryPurchase] = useState(null)

  // ── Form States ──

  // 1. Vendor Entry Form
  const [vendorForm, setVendorForm] = useState({
    vendor_name: '',
    contact_person: '',
    gst_no: '',
    gst_type: '',
    phone: '',
    email: '',
    address: '',
  })
  const [submittingVendor, setSubmittingVendor] = useState(false)

  // 2. Item Entry Form
  const [itemForm, setItemForm] = useState({
    item_name: '',
    hsn_code: '',
    description: '',
    unit: 'unit',
  })
  const [submittingItem, setSubmittingItem] = useState(false)

  // 3. Purchase Entry Form
  const [purchaseForm, setPurchaseForm] = useState({
    vendor_id: '',
    invoice_no: '',
    purchase_date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [purchaseItems, setPurchaseItems] = useState([
    { item_id: '', item_name: '', hsn_code: '', unit: '', quantity: 1, rate: 0, amount: 0 },
  ])
  const [invoiceFile, setInvoiceFile] = useState(null)
  const [processedAmount, setProcessedAmount] = useState('')
  const [tdsAmount, setTdsAmount] = useState('')
  const [submittingPurchase, setSubmittingPurchase] = useState(false)
  const fileInputRef = useRef(null)

  // Show status notification
  const showToast = (type, text) => {
    setStatusMsg({ type, text })
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000)
  }

  // ── Load All Data ──
  const loadData = async () => {
    setLoading(true)
    try {
      const [vRes, iRes, pRes] = await Promise.allSettled([
        getVendors(),
        getItems(),
        getPurchases(),
      ])

      if (vRes.status === 'fulfilled' && vRes.value?.data?.data) {
        setVendors(vRes.value.data.data)
      }
      if (iRes.status === 'fulfilled' && iRes.value?.data?.data) {
        setItems(iRes.value.data.data)
      }
      if (pRes.status === 'fulfilled' && pRes.value?.data?.data) {
        setPurchases(pRes.value.data.data)
      }
    } catch (err) {
      console.error('Error loading purchase module data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ── Handle Vendor Submit ──
  const handleVendorSubmit = async (e) => {
    e.preventDefault()

    // Mandatory fields validation (all except email)
    if (!vendorForm.vendor_name?.trim()) {
      showToast('error', 'Vendor Name is required')
      return
    }
    if (!vendorForm.address?.trim()) {
      showToast('error', 'Vendor Address is required')
      return
    }
    if (!vendorForm.contact_person?.trim()) {
      showToast('error', 'Vendor Contact Person is required')
      return
    }
    if (!vendorForm.phone?.trim()) {
      showToast('error', 'Vendor Phone Number is required')
      return
    }
    if (!vendorForm.gst_type?.trim()) {
      showToast('error', 'Please select a GST Type')
      return
    }
    if (!vendorForm.gst_no?.trim()) {
      showToast('error', 'Vendor GST No. is required')
      return
    }

    setSubmittingVendor(true)
    try {
      const res = await createVendor(vendorForm)
      if (res?.data?.success) {
        showToast('success', 'Vendor registered successfully!')
        setVendorForm({
          vendor_name: '',
          contact_person: '',
          gst_no: '',
          gst_type: '',
          phone: '',
          email: '',
          address: '',
        })
        loadData()
      } else {
        showToast('error', res?.data?.message || 'Failed to save vendor')
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Error creating vendor')
    } finally {
      setSubmittingVendor(false)
    }
  }

  const handleDeleteVendor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return
    try {
      await deleteVendor(id)
      showToast('success', 'Vendor deleted successfully')
      setVendors((prev) => prev.filter((v) => v.id !== id))
    } catch (err) {
      showToast('error', 'Failed to delete vendor')
    }
  }

  // ── Handle Item Submit ──
  const handleItemSubmit = async (e) => {
    e.preventDefault()
    if (!itemForm.item_name.trim()) {
      showToast('error', 'Item name is required')
      return
    }

    setSubmittingItem(true)
    try {
      const res = await createItem(itemForm)
      if (res?.data?.success) {
        showToast('success', 'Item saved to catalog successfully!')
        setItemForm({
          item_name: '',
          hsn_code: '',
          description: '',
          unit: 'unit',
        })
        loadData()
      } else {
        showToast('error', res?.data?.message || 'Failed to save item')
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Error creating item')
    } finally {
      setSubmittingItem(false)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      await deleteItem(id)
      showToast('success', 'Item deleted successfully')
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      showToast('error', 'Failed to delete item')
    }
  }

  // ── Purchase Entry Dynamic Item Row Handlers ──
  const handleItemSelectInPurchase = (index, selectedItemId) => {
    const updated = [...purchaseItems]
    const matched = items.find((i) => String(i.id) === String(selectedItemId))

    if (matched) {
      updated[index] = {
        ...updated[index],
        item_id: matched.id,
        item_name: matched.item_name,
        hsn_code: matched.hsn_code || '',
        unit: matched.unit || 'unit',
        amount: Number(updated[index].quantity || 1) * Number(updated[index].rate || 0),
      }
    } else {
      updated[index] = {
        ...updated[index],
        item_id: '',
        item_name: '',
        hsn_code: '',
        unit: '',
        amount: 0,
      }
    }
    setPurchaseItems(updated)
  }

  const handleItemQuantityChange = (index, qty) => {
    const updated = [...purchaseItems]
    const quantity = Math.max(0, parseFloat(qty) || 0)
    updated[index].quantity = quantity
    updated[index].amount = Math.round(quantity * Number(updated[index].rate || 0) * 100) / 100
    setPurchaseItems(updated)
  }

  const handleItemRateChange = (index, rateVal) => {
    const updated = [...purchaseItems]
    const rate = Math.max(0, parseFloat(rateVal) || 0)
    updated[index].rate = rate
    updated[index].amount = Math.round(Number(updated[index].quantity || 0) * rate * 100) / 100
    setPurchaseItems(updated)
  }

  const handleAddPurchaseRow = () => {
    setPurchaseItems([
      ...purchaseItems,
      { item_id: '', item_name: '', hsn_code: '', unit: '', quantity: 1, rate: 0, amount: 0 },
    ])
  }

  const handleRemovePurchaseRow = (index) => {
    if (purchaseItems.length === 1) {
      showToast('error', 'At least one item line is required')
      return
    }
    setPurchaseItems(purchaseItems.filter((_, idx) => idx !== index))
  }

  const selectedPurchaseVendor = useMemo(() => {
    return vendors.find((v) => String(v.id) === String(purchaseForm.vendor_id))
  }, [vendors, purchaseForm.vendor_id])

  const selectedVendorGstType = useMemo(() => {
    return (selectedPurchaseVendor?.gst_type || '').toUpperCase()
  }, [selectedPurchaseVendor])

  const isIgstVendor = selectedVendorGstType.includes('IGST') && !selectedVendorGstType.includes('CGST')
  const isCgstSgstVendor = selectedVendorGstType.includes('CGST') || selectedVendorGstType.includes('SGST')

  const purchaseSubtotal = useMemo(() => {
    return purchaseItems.reduce((acc, row) => acc + (Number(row.amount) || 0), 0)
  }, [purchaseItems])

  const purchaseTaxCalculations = useMemo(() => {
    let cgstAmount = 0
    let sgstAmount = 0
    let igstAmount = 0
    let taxAmount = 0

    if (isIgstVendor) {
      igstAmount = Math.round(((purchaseSubtotal * 18) / 100) * 100) / 100
      taxAmount = igstAmount
    } else if (isCgstSgstVendor) {
      cgstAmount = Math.round(((purchaseSubtotal * 9) / 100) * 100) / 100
      sgstAmount = Math.round(((purchaseSubtotal * 9) / 100) * 100) / 100
      taxAmount = Math.round((cgstAmount + sgstAmount) * 100) / 100
    }

    const grandTotal = Math.round((purchaseSubtotal + taxAmount) * 100) / 100

    return {
      subtotal: purchaseSubtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      taxAmount,
      grandTotal,
      isIgst: isIgstVendor,
      isCgstSgst: isCgstSgstVendor,
    }
  }, [purchaseSubtotal, isIgstVendor, isCgstSgstVendor])

  const grandPurchaseTotal = purchaseTaxCalculations.grandTotal

  // Part Payment & TDS Deduction Calculations
  const numProcessed = Number(processedAmount) || 0
  const numTds = Number(tdsAmount) || 0
  const totalPaidAccounted = Math.round((numProcessed + numTds) * 100) / 100
  const currentOutstanding = Math.max(0, Math.round((grandPurchaseTotal - totalPaidAccounted) * 100) / 100)

  const handleProcessedAmountChange = (e) => {
    setProcessedAmount(e.target.value)
  }

  const handleTdsAmountChange = (e) => {
    const val = e.target.value
    const newTds = Number(val) || 0
    const currentGross = (Number(processedAmount) || 0) + (Number(tdsAmount) || 0)

    if (currentGross > 0) {
      // Adjust processed amount so gross payment and outstanding remain the same
      const adjustedProcessed = Math.max(0, Math.round((currentGross - newTds) * 100) / 100)
      setProcessedAmount(adjustedProcessed === 0 ? '' : String(adjustedProcessed))
    }
    setTdsAmount(val)
  }

  // ── Part Payment Recording & History Modal Handlers ──
  const handleOpenPaymentModal = (purchaseRecord) => {
    setPaymentPurchase(purchaseRecord)
    setPayProcessed('')
    setPayTds('')
    setPayDate(new Date().toISOString().split('T')[0])
    setPayMode('Bank Transfer')
    setPayRef('')
    setPayNotes('')
    setShowPaymentModal(true)
  }

  const handleOpenHistoryModal = (purchaseRecord) => {
    setHistoryPurchase(purchaseRecord)
    setShowHistoryModal(true)
  }

  const modalCurrentInvoiceDue = useMemo(() => {
    if (!paymentPurchase) return 0
    return paymentPurchase.outstanding_amount !== undefined && paymentPurchase.outstanding_amount !== null
      ? Number(paymentPurchase.outstanding_amount)
      : Math.max(0, Number(paymentPurchase.total_amount || 0) - (Number(paymentPurchase.paid_amount) || 0))
  }, [paymentPurchase])

  const modalInstallmentTotal = useMemo(() => {
    const p = Number(payProcessed) || 0
    const t = Number(payTds) || 0
    return Math.round((p + t) * 100) / 100
  }, [payProcessed, payTds])

  const modalCalculatedRemaining = useMemo(() => {
    return Math.max(0, Math.round((modalCurrentInvoiceDue - modalInstallmentTotal) * 100) / 100)
  }, [modalCurrentInvoiceDue, modalInstallmentTotal])

  const handleModalProcessedChange = (e) => {
    setPayProcessed(e.target.value)
  }

  const handleModalTdsChange = (e) => {
    const val = e.target.value
    const newTds = Number(val) || 0
    const currentGross = (Number(payProcessed) || 0) + (Number(payTds) || 0)

    if (currentGross > 0) {
      const adjustedProc = Math.max(0, Math.round((currentGross - newTds) * 100) / 100)
      setPayProcessed(adjustedProc === 0 ? '' : String(adjustedProc))
    }
    setPayTds(val)
  }

  const handleRecordPartPaymentSubmit = async (e) => {
    e.preventDefault()
    if (!paymentPurchase) return

    const numProc = Number(payProcessed) || 0
    const numTdsVal = Number(payTds) || 0
    const totalThisPay = Math.round((numProc + numTdsVal) * 100) / 100

    if (totalThisPay <= 0) {
      showToast('error', 'Please enter a processed or TDS payment amount greater than 0')
      return
    }

    if (totalThisPay > modalCurrentInvoiceDue + 0.01) {
      showToast('error', `Payment amount (${formatCurrency(totalThisPay)}) cannot exceed current balance due (${formatCurrency(modalCurrentInvoiceDue)})`)
      return
    }

    setSubmittingPayment(true)
    try {
      const res = await recordPurchasePayment(paymentPurchase.id, {
        processed_amount: numProc,
        tds_amount: numTdsVal,
        payment_date: payDate,
        payment_mode: payMode,
        reference_no: payRef,
        notes: payNotes,
      })

      if (res?.data?.success) {
        showToast('success', `Payment of ${formatCurrency(totalThisPay)} recorded successfully against Invoice #${paymentPurchase.invoice_no}!`)
        setShowPaymentModal(false)
        setPaymentPurchase(null)

        // Refresh purchases list
        const freshRes = await getPurchases()
        if (freshRes?.data?.data) {
          setPurchases(freshRes.data.data)
          // If history modal is currently open or was open for this purchase, update it
          if (historyPurchase && historyPurchase.id === paymentPurchase.id) {
            const updatedP = freshRes.data.data.find((x) => x.id === paymentPurchase.id)
            if (updatedP) setHistoryPurchase(updatedP)
          }
        }
      } else {
        showToast('error', res?.data?.message || 'Failed to record payment')
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Error recording payment')
    } finally {
      setSubmittingPayment(false)
    }
  }

  // ── Handle Purchase Entry Submit ──
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault()

    if (!purchaseForm.vendor_id) {
      showToast('error', 'Please select a vendor')
      return
    }
    if (!purchaseForm.invoice_no.trim()) {
      showToast('error', 'Please enter invoice number')
      return
    }

    const validItems = purchaseItems.filter((i) => i.item_id && i.quantity > 0)
    if (validItems.length === 0) {
      showToast('error', 'Please select at least one valid item with quantity > 0')
      return
    }

    setSubmittingPurchase(true)
    try {
      const formData = new FormData()
      formData.append('vendor_id', purchaseForm.vendor_id)
      formData.append('invoice_no', purchaseForm.invoice_no)
      formData.append('purchase_date', purchaseForm.purchase_date)
      if (purchaseForm.notes) formData.append('notes', purchaseForm.notes)
      formData.append('items', JSON.stringify(validItems))
      formData.append('subtotal', purchaseTaxCalculations.subtotal)
      formData.append('gst_type', selectedPurchaseVendor?.gst_type || '')
      formData.append('cgst_amount', purchaseTaxCalculations.cgstAmount)
      formData.append('sgst_amount', purchaseTaxCalculations.sgstAmount)
      formData.append('igst_amount', purchaseTaxCalculations.igstAmount)
      formData.append('tax_amount', purchaseTaxCalculations.taxAmount)
      formData.append('total_amount', purchaseTaxCalculations.grandTotal)
      formData.append('processed_amount', numProcessed)
      formData.append('tds_amount', numTds)
      formData.append('paid_amount', totalPaidAccounted)
      formData.append('outstanding_amount', currentOutstanding)

      if (invoiceFile) {
        formData.append('invoice_file', invoiceFile)
      }

      const res = await createPurchase(formData)
      if (res?.data?.success) {
        showToast('success', 'Purchase entry recorded successfully!')
        setPurchaseForm({
          vendor_id: '',
          invoice_no: '',
          purchase_date: new Date().toISOString().split('T')[0],
          notes: '',
        })
        setPurchaseItems([
          { item_id: '', item_name: '', hsn_code: '', unit: '', quantity: 1, rate: 0, amount: 0 },
        ])
        setInvoiceFile(null)
        setProcessedAmount('')
        setTdsAmount('')
        if (fileInputRef.current) fileInputRef.current.value = ''

        loadData()
        setActiveSubtab('purchase_record')
      } else {
        showToast('error', res?.data?.message || 'Failed to record purchase')
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Error recording purchase entry')
    } finally {
      setSubmittingPurchase(false)
    }
  }

  const handleDeletePurchase = async (id) => {
    if (!window.confirm('Are you sure you want to delete this purchase record?')) return
    try {
      await deletePurchase(id)
      showToast('success', 'Purchase record deleted successfully')
      setPurchases((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      showToast('error', 'Failed to delete purchase record')
    }
  }

  // ── Open Attached Document Viewer ([ 📎 File ]) ──
  const handleOpenAttachedDoc = (purchaseRecord) => {
    const rawUrl = purchaseRecord.invoice_file_url || purchaseRecord.invoice_file
    if (!rawUrl) return
    const fileUrl = getInvoiceDocUrl(rawUrl)
    setSelectedAttachedDoc({
      fileUrl,
      title: `Invoice #${purchaseRecord.invoice_no}`,
      invoiceNo: purchaseRecord.invoice_no,
      vendorName: purchaseRecord.vendor?.vendor_name,
      filename: rawUrl.split('/').pop() || 'invoice_document',
    })
    setShowAttachedDocModal(true)
  }

  // ── Filtered Data Lists ──
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const q = vendorSearch.toLowerCase()
      return (
        v.vendor_name?.toLowerCase().includes(q) ||
        v.contact_person?.toLowerCase().includes(q) ||
        v.gst_no?.toLowerCase().includes(q) ||
        v.gst_type?.toLowerCase().includes(q) ||
        v.phone?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q) ||
        v.address?.toLowerCase().includes(q)
      )
    })
  }, [vendors, vendorSearch])

  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      const q = itemSearch.toLowerCase()
      return (
        i.item_name?.toLowerCase().includes(q) ||
        i.hsn_code?.toLowerCase().includes(q) ||
        i.unit?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q)
      )
    })
  }, [items, itemSearch])

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const q = purchaseSearch.toLowerCase()
      const vendorName = p.vendor?.vendor_name || ''
      return (
        p.invoice_no?.toLowerCase().includes(q) ||
        p.purchase_no?.toLowerCase().includes(q) ||
        vendorName.toLowerCase().includes(q)
      )
    })
  }, [purchases, purchaseSearch])

  // Subtabs Definition (Exactly 6 subtabs)
  const subtabs = [
    { id: 'vendor_entry', label: 'Vendor Entry', icon: '📝' },
    { id: 'show_vendor', label: 'Show Vendor', count: vendors.length, icon: '🏢' },
    { id: 'item_entry', label: 'Item Entry', icon: '📦' },
    { id: 'show_item', label: 'Show Item', count: items.length, icon: '📋' },
    { id: 'purchase_entry', label: 'Purchase Entry', icon: '🛒' },
    { id: 'purchase_record', label: 'Purchase Record', count: purchases.length, icon: '📑' },
  ]

  return (
    <>
      <Helmet>
        <title>Purchase & Procurement | Admin Panel</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Toast Alert */}
        {statusMsg.text && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <span>{statusMsg.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-2 gap-3 min-h-[48px]">
          <div>
            <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Purchase Management</h1>
            <p className="text-xs text-slate-400 font-bold mt-1">
              Procurement pipeline: vendor registry, item master catalog, and purchase invoice recording
            </p>
          </div>

          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>

          <div className="w-auto flex items-center gap-2 justify-end">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#38b34a]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Main Card with Navigation Subtabs */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
          
          {/* Subtabs Row: Exactly 6 tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/60 pb-3 mb-6 overflow-x-auto">
            {subtabs.map((tab) => {
              const isActive = activeSubtab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubtab(tab.id)}
                  className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition-all cursor-pointer border-t-2 flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-white border-[#38b34a] text-[#38b34a] shadow-sm -mb-[13px] z-10'
                      : 'bg-slate-50 hover:bg-slate-100/80 text-slate-500 border-transparent'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-[#38b34a]/15 text-[#38b34a]' : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ========================================================================= */}
          {/* SUBTAB 1: VENDOR ENTRY */}
          {/* ========================================================================= */}
          {activeSubtab === 'vendor_entry' && (
            <div className="max-w-2xl mx-auto py-2">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#38b34a] flex items-center justify-center text-sm font-black border border-emerald-100">
                    🏢
                  </span>
                  <span>New Vendor Registration</span>
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Enter vendor details to record in supplier registry for purchase billing.
                </p>
              </div>

              {(() => {
                const isVendorFormValid = Boolean(
                  vendorForm.vendor_name?.trim() &&
                  vendorForm.address?.trim() &&
                  vendorForm.contact_person?.trim() &&
                  vendorForm.phone?.trim() &&
                  vendorForm.gst_type?.trim() &&
                  vendorForm.gst_no?.trim()
                )

                return (
                  <form onSubmit={handleVendorSubmit} className="space-y-4">
                    {/* 1. Vendor Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Vendor Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AWS Cloud Services, Dell Technologies India"
                        value={vendorForm.vendor_name}
                        onChange={(e) => setVendorForm({ ...vendorForm, vendor_name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#38b34a] focus:bg-white transition-all"
                      />
                    </div>

                    {/* 2. Vendor Address */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Vendor Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. 101 Tech Park, Whitefield, Bengaluru, Karnataka - 560066"
                        value={vendorForm.address}
                        onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#38b34a] focus:bg-white transition-all resize-none"
                      />
                    </div>

                    {/* 3 & 4. Vendor Contact Person & Vendor Phone Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Vendor Contact Person <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe / Account Executive"
                          value={vendorForm.contact_person}
                          onChange={(e) => setVendorForm({ ...vendorForm, contact_person: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#38b34a] focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Vendor Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 9876543210"
                          value={vendorForm.phone}
                          onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#38b34a] focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* 5. Vendor Email (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Vendor Email <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. billing@vendor.com"
                        value={vendorForm.email}
                        onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#38b34a] focus:bg-white transition-all"
                      />
                    </div>

                    {/* 6 & 7. GST Type & Vendor GST No. */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          GST Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={vendorForm.gst_type}
                          onChange={(e) => setVendorForm({ ...vendorForm, gst_type: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#38b34a] focus:bg-white transition-all cursor-pointer"
                        >
                          <option value="">Select GST Type</option>
                          <option value="IGST">IGST</option>
                          <option value="CGST+SGST">CGST+SGST</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Vendor GST No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 27AABCU9603R1ZM"
                          value={vendorForm.gst_no}
                          onChange={(e) => setVendorForm({ ...vendorForm, gst_no: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 uppercase focus:outline-none focus:border-[#38b34a] focus:bg-white transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setActiveSubtab('show_vendor')}
                        className="text-xs font-bold text-[#38b34a] hover:underline cursor-pointer"
                      >
                        View All Vendors ({vendors.length}) →
                      </button>

                      <button
                        type="submit"
                        disabled={submittingVendor || !isVendorFormValid}
                        className="px-6 py-2.5 rounded-xl bg-[#38b34a] hover:bg-[#2fa03f] text-white text-xs font-bold shadow-md shadow-[#38b34a]/20 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {submittingVendor ? (
                          <span>Saving Vendor...</span>
                        ) : (
                          <>
                            <span>Save Vendor</span>
                            <span>✓</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )
              })()}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB 2: SHOW VENDOR */}
          {/* ========================================================================= */}
          {activeSubtab === 'show_vendor' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">Registered Vendors Registry</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-[#38b34a]">
                    {vendors.length} Total
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search vendor name, GST, contact..."
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#38b34a] w-64"
                  />
                  <button
                    onClick={() => setActiveSubtab('vendor_entry')}
                    className="px-3 py-2 bg-[#38b34a] text-white text-xs font-bold rounded-xl hover:bg-[#2fa03f] shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    + New Vendor
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-5 py-3.5">#</th>
                      <th className="px-5 py-3.5">Vendor Name</th>
                      <th className="px-5 py-3.5">Contact Person</th>
                      <th className="px-5 py-3.5">GST No.</th>
                      <th className="px-5 py-3.5">GST Type</th>
                      <th className="px-5 py-3.5">Phone No.</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5">Address</th>
                      <th className="px-5 py-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredVendors.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                          {vendorSearch ? 'No vendors match your search.' : 'No vendors registered yet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredVendors.map((v, idx) => (
                        <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="px-5 py-4 font-bold text-slate-800 text-sm">
                            {v.vendor_name}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {v.contact_person || '—'}
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-slate-700">
                            {v.gst_no ? (
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                                {v.gst_no}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {v.gst_type ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${
                                  v.gst_type.toUpperCase().includes('IGST') && !v.gst_type.toUpperCase().includes('CGST')
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}
                              >
                                {v.gst_type.toUpperCase() === 'IGST' || v.gst_type === 'igst'
                                  ? 'IGST'
                                  : 'CGST+SGST'}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-600 font-mono">
                            {v.phone || '—'}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {v.email || '—'}
                          </td>
                          <td className="px-5 py-4 text-slate-600 max-w-xs">
                            <span className="line-clamp-2" title={v.address}>
                              {v.address || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => handleDeleteVendor(v.id)}
                              className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB 3: ITEM ENTRY */}
          {/* ========================================================================= */}
          {activeSubtab === 'item_entry' && (
            <div className="max-w-2xl mx-auto py-2">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black border border-blue-100">
                    📦
                  </span>
                  <span>New Item Master Entry</span>
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Define item catalog, HSN code, and default unit measurement for procurement orders.
                </p>
              </div>

              <form onSubmit={handleItemSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dell Latitude Laptop, Cloud Server Instance, A4 Paper"
                    value={itemForm.item_name}
                    onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#38b34a] focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Item HSN Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 847130, 998313"
                      value={itemForm.hsn_code}
                      onChange={(e) => setItemForm({ ...itemForm, hsn_code: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 font-mono focus:outline-none focus:border-[#38b34a] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Item Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={itemForm.unit}
                      onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#38b34a] focus:bg-white transition-all cursor-pointer"
                    >
                      {ITEM_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Item Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Specification details, model name, warranty, or license description"
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#38b34a] focus:bg-white transition-all"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveSubtab('show_item')}
                    className="text-xs font-bold text-[#38b34a] hover:underline cursor-pointer"
                  >
                    View All Items ({items.length}) →
                  </button>

                  <button
                    type="submit"
                    disabled={submittingItem}
                    className="px-6 py-2.5 rounded-xl bg-[#38b34a] hover:bg-[#2fa03f] text-white text-xs font-bold shadow-md shadow-[#38b34a]/20 cursor-pointer transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submittingItem ? (
                      <span>Saving Item...</span>
                    ) : (
                      <>
                        <span>Save Item</span>
                        <span>✓</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB 4: SHOW ITEM */}
          {/* ========================================================================= */}
          {activeSubtab === 'show_item' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">Master Item Catalog</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                    {items.length} Items
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search item name, HSN, unit..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#38b34a] w-64"
                  />
                  <button
                    onClick={() => setActiveSubtab('item_entry')}
                    className="px-3 py-2 bg-[#38b34a] text-white text-xs font-bold rounded-xl hover:bg-[#2fa03f] shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    + New Item
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-5 py-3.5">#</th>
                      <th className="px-5 py-3.5">Item Name</th>
                      <th className="px-5 py-3.5">HSN Code</th>
                      <th className="px-5 py-3.5">Unit</th>
                      <th className="px-5 py-3.5">Description</th>
                      <th className="px-5 py-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                          {itemSearch ? 'No items match your search.' : 'No items added yet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="px-5 py-4 font-bold text-slate-800 text-sm">
                            {item.item_name}
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-slate-600">
                            {item.hsn_code ? (
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                                {item.hsn_code}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {item.unit}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600 max-w-sm truncate">
                            {item.description || '—'}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB 5: PURCHASE ENTRY */}
          {/* ========================================================================= */}
          {activeSubtab === 'purchase_entry' && (
            <div className="max-w-4xl mx-auto py-2 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#38b34a] flex items-center justify-center text-sm font-black border border-emerald-100">
                    🛒
                  </span>
                  <span>Record Purchase Invoice</span>
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Select vendor, add multiple items with automatic unit population, enter invoice number, and attach invoice document.
                </p>
              </div>

              <form onSubmit={handlePurchaseSubmit} className="space-y-6">
                {/* General Invoice Details Card */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Vendor Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Select Vendor <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={purchaseForm.vendor_id}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, vendor_id: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#38b34a] cursor-pointer"
                      >
                        <option value="">-- Choose Vendor --</option>
                        {vendors.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.vendor_name} {v.gst_no ? `(${v.gst_no})` : ''} {v.gst_type ? `• GST: ${v.gst_type}` : ''}
                          </option>
                        ))}
                      </select>
                      {vendors.length === 0 && (
                        <p className="text-[10px] text-amber-600 font-bold mt-1">
                          No vendors found. Please add a vendor in "Vendor Entry".
                        </p>
                      )}
                    </div>

                    {/* Invoice No. */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Invoice No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. INV-2026-9921"
                        value={purchaseForm.invoice_no}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, invoice_no: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#38b34a]"
                      />
                    </div>

                    {/* Purchase Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        value={purchaseForm.purchase_date}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, purchase_date: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#38b34a]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Invoice File Upload */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Invoice Upload File (PDF / Image)
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        onChange={(e) => setInvoiceFile(e.target.files[0] || null)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#38b34a]/10 file:text-[#38b34a] hover:file:bg-[#38b34a]/20 cursor-pointer"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Notes / Remarks
                      </label>
                      <input
                        type="text"
                        placeholder="Optional remarks or delivery details"
                        value={purchaseForm.notes}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#38b34a]"
                      />
                    </div>
                  </div>
                </div>

                {/* Multi-Item Line Rows: "to one purchase entry many items can be added" */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Purchase Items ({purchaseItems.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddPurchaseRow}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#38b34a] hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>+</span>
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="px-4 py-3 min-w-[200px]">Item (from dropdown) *</th>
                          <th className="px-4 py-3 w-28">Unit (Auto)</th>
                          <th className="px-4 py-3 w-28">Quantity *</th>
                          <th className="px-4 py-3 w-32">Rate (₹) *</th>
                          <th className="px-4 py-3 w-36 text-right">Subtotal</th>
                          <th className="px-3 py-3 w-12 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {purchaseItems.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            {/* Item Select */}
                            <td className="px-4 py-3">
                              <select
                                required
                                value={row.item_id}
                                onChange={(e) => handleItemSelectInPurchase(idx, e.target.value)}
                                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#38b34a] cursor-pointer"
                              >
                                <option value="">-- Select Item --</option>
                                {items.map((itm) => (
                                  <option key={itm.id} value={itm.id}>
                                    {itm.item_name} {itm.hsn_code ? `[HSN: ${itm.hsn_code}]` : ''}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Unit (Locked, set already from item entry) */}
                            <td className="px-4 py-3">
                              {row.unit ? (
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                                  {row.unit}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">—</span>
                              )}
                            </td>

                            {/* Quantity */}
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="1"
                                step="any"
                                required
                                value={row.quantity}
                                onChange={(e) => handleItemQuantityChange(idx, e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#38b34a]"
                              />
                            </td>

                            {/* Rate per unit */}
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                required
                                placeholder="0.00"
                                value={row.rate}
                                onChange={(e) => handleItemRateChange(idx, e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#38b34a]"
                              />
                            </td>

                            {/* Subtotal */}
                            <td className="px-4 py-3 text-right font-black text-slate-900 font-mono">
                              {formatCurrency(row.amount)}
                            </td>

                            {/* Remove row */}
                            <td className="px-3 py-3 text-center">
                              {purchaseItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePurchaseRow(idx)}
                                  className="text-red-500 hover:text-red-700 font-bold p-1 rounded hover:bg-red-50 cursor-pointer"
                                  title="Remove item line"
                                >
                                  ✕
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tax & Total Summary Card */}
                  <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
                    {/* 1. Amount Before Taxes */}
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>
                        Amount Before Taxes ({purchaseItems.length} {purchaseItems.length === 1 ? 'item' : 'items'}):
                      </span>
                      <span className="text-base font-black text-slate-800 font-mono">
                        {formatCurrency(purchaseTaxCalculations.subtotal)}
                      </span>
                    </div>

                    {/* 2. CGST 9% + SGST 9% */}
                    {purchaseTaxCalculations.isCgstSgst && (
                      <div className="pt-2 border-t border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span className="flex items-center gap-2">
                            <span>CGST 9%:</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                              9% of Subtotal
                            </span>
                          </span>
                          <span className="text-sm font-black text-purple-700 font-mono">
                            {formatCurrency(purchaseTaxCalculations.cgstAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span className="flex items-center gap-2">
                            <span>SGST 9%:</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                              9% of Subtotal
                            </span>
                          </span>
                          <span className="text-sm font-black text-purple-700 font-mono">
                            {formatCurrency(purchaseTaxCalculations.sgstAmount)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 3. IGST 18% */}
                    {purchaseTaxCalculations.isIgst && (
                      <div className="pt-2 border-t border-slate-200/70">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span className="flex items-center gap-2">
                            <span>IGST 18%:</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                              18% of Subtotal
                            </span>
                          </span>
                          <span className="text-sm font-black text-blue-700 font-mono">
                            {formatCurrency(purchaseTaxCalculations.igstAmount)}
                          </span>
                        </div>
                      </div>
                    )}

                    {!selectedPurchaseVendor && (
                      <div className="text-[11px] text-amber-700 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>Select a vendor above to apply GST calculation (IGST 18% or CGST 9% + SGST 9%).</span>
                      </div>
                    )}

                    {selectedPurchaseVendor && !purchaseTaxCalculations.isIgst && !purchaseTaxCalculations.isCgstSgst && (
                      <div className="text-[11px] text-slate-500 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
                        ℹ️ Selected vendor does not have a GST type configured.
                      </div>
                    )}

                    {/* 4. Total Amount Summing All */}
                    <div className="flex items-center justify-between pt-3 border-t-2 border-emerald-300 bg-emerald-50/70 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 sm:p-5 rounded-b-2xl">
                      <div>
                        <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider block">
                          Total Amount:
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          {purchaseTaxCalculations.isIgst
                            ? 'Amount Before Taxes + 18% IGST'
                            : purchaseTaxCalculations.isCgstSgst
                            ? 'Amount Before Taxes + 9% CGST + 9% SGST'
                            : 'Sum Total'}
                        </span>
                      </div>
                      <span className="text-xl font-black text-emerald-700 font-mono">
                        {formatCurrency(purchaseTaxCalculations.grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Part Payment & TDS Deduction Section */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <span>💳</span>
                          <span>Part Payment & TDS Deduction</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Specify disbursed payment, applicable TDS deduction, and tracked balance.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setProcessedAmount(String(grandPurchaseTotal))
                            setTdsAmount('0')
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#38b34a] hover:bg-emerald-100 text-[10px] font-bold border border-emerald-200 transition-colors cursor-pointer"
                        >
                          Full Payment
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProcessedAmount('0')
                            setTdsAmount('0')
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Zero / Unpaid
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* 1. Processed Amount Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>Processed Amount (₹)</span>
                          <span className="text-[10px] text-slate-400 font-normal">Net Disbursed</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0"
                          value={processedAmount}
                          onChange={handleProcessedAmountChange}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:outline-none focus:border-[#38b34a] focus:bg-white transition-all"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Net cash/bank payout to vendor
                        </p>
                      </div>

                      {/* 2. TDS Deducted Amount Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>TDS Deducted Amount (₹)</span>
                          <span className="text-[10px] text-blue-600 font-semibold">TDS (IT Act)</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0"
                          value={tdsAmount}
                          onChange={handleTdsAmountChange}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-700 font-mono focus:outline-none focus:border-[#38b34a] focus:bg-white transition-all"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Adjusts against processed payout
                        </p>
                      </div>

                      {/* 3. Outstanding Input (Strictly Read Only) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>Outstanding Amount (₹)</span>
                          <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold">Read Only</span>
                        </label>
                        <input
                          type="number"
                          readOnly
                          placeholder="0"
                          value={currentOutstanding === 0 && processedAmount === '' && grandPurchaseTotal === 0 ? '' : currentOutstanding}
                          className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-amber-900 font-mono cursor-not-allowed select-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Auto-calculated balance remaining
                        </p>
                      </div>
                    </div>

                    {/* Accounting Summary Strip */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Total Paid Accounted:
                          </span>
                          <span className="text-sm font-black text-emerald-700 font-mono">
                            {formatCurrency(totalPaidAccounted)}
                          </span>
                          {numTds > 0 && (
                            <span className="text-[10px] text-slate-500 block">
                              (Net ₹{numProcessed.toLocaleString('en-IN')} + TDS ₹{numTds.toLocaleString('en-IN')})
                            </span>
                          )}
                        </div>

                        <div className="border-l border-slate-200 pl-4">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Payment Settlement:
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-0.5 ${
                              currentOutstanding === 0 && grandPurchaseTotal > 0
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : totalPaidAccounted > 0
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {currentOutstanding === 0 && grandPurchaseTotal > 0
                              ? 'Fully Settled (100%)'
                              : totalPaidAccounted > 0
                              ? `Partially Paid (${Math.min(100, Math.round((totalPaidAccounted / (grandPurchaseTotal || 1)) * 100))}%)`
                              : 'Unpaid / Pending'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Outstanding Balance:
                        </span>
                        <span className="text-sm font-black text-amber-700 font-mono">
                          {formatCurrency(currentOutstanding)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSubtab('purchase_record')}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingPurchase}
                    className="px-7 py-2.5 rounded-xl bg-[#38b34a] hover:bg-[#2fa03f] text-white text-xs font-bold shadow-md shadow-[#38b34a]/20 cursor-pointer transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submittingPurchase ? (
                      <span>Saving Purchase...</span>
                    ) : (
                      <>
                        <span>Record Purchase Entry</span>
                        <span>✓</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB 6: PURCHASE RECORD */}
          {/* ========================================================================= */}
          {activeSubtab === 'purchase_record' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">All Purchase Records</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">
                    {purchases.length} Records
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search invoice#, PO#, vendor..."
                    value={purchaseSearch}
                    onChange={(e) => setPurchaseSearch(e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#38b34a] w-64"
                  />
                  <button
                    onClick={() => setActiveSubtab('purchase_entry')}
                    className="px-3 py-2 bg-[#38b34a] text-white text-xs font-bold rounded-xl hover:bg-[#2fa03f] shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    + New Purchase
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-4 py-3.5">PO & Date</th>
                      <th className="px-4 py-3.5">Invoice No.</th>
                      <th className="px-4 py-3.5">Vendor</th>
                      <th className="px-4 py-3.5">Items Summary</th>
                      <th className="px-4 py-3.5 text-right">Total Amount</th>
                      <th className="px-4 py-3.5 text-right">Paid & TDS</th>
                      <th className="px-4 py-3.5 text-right">Outstanding</th>
                      <th className="px-4 py-3.5 text-center">INVOICE SEE AND DOWNLOAD</th>
                      <th className="px-4 py-3.5 text-center">PART PAYMENTS</th>
                      <th className="px-4 py-3.5 text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredPurchases.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold">
                          {purchaseSearch ? 'No purchases match your search.' : 'No purchases recorded yet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredPurchases.map((p) => {
                        const itemsCount = p.items?.length || 0
                        const firstItemName = p.items?.[0]?.item_name || 'Item'
                        const hasAttachedDoc = Boolean(p.invoice_file_url || p.invoice_file)
                        const paidVal = Number(p.paid_amount) || (Number(p.processed_amount || 0) + Number(p.tds_amount || 0))
                        const outVal = p.outstanding_amount !== undefined && p.outstanding_amount !== null
                          ? Number(p.outstanding_amount)
                          : Math.max(0, (Number(p.total_amount) || 0) - paidVal)
                        const paymentsCount = Math.max(p.payments?.length || 0, paidVal > 0 ? 1 : 0)

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                            {/* PO & Date */}
                            <td className="px-4 py-4 font-mono">
                              <div className="font-bold text-slate-800">{p.purchase_no || `PO-${p.id}`}</div>
                              <div className="text-[10px] text-slate-400">{p.purchase_date}</div>
                            </td>

                            {/* Invoice No. */}
                            <td className="px-4 py-4 font-bold text-slate-800 text-sm font-mono">
                              {p.invoice_no}
                            </td>

                            {/* Vendor */}
                            <td className="px-4 py-4 font-bold text-slate-800">
                              {p.vendor?.vendor_name || '—'}
                              {p.vendor?.contact_person && (
                                <div className="text-[10px] text-slate-400 font-normal">
                                  {p.vendor.contact_person}
                                </div>
                              )}
                            </td>

                            {/* Items Summary */}
                            <td className="px-4 py-4 text-slate-600">
                              <button
                                onClick={() => setViewingPurchase(p)}
                                className="text-left group cursor-pointer"
                              >
                                <span className="font-semibold text-slate-800 group-hover:text-[#38b34a] group-hover:underline">
                                  {firstItemName}
                                </span>
                                {itemsCount > 1 && (
                                  <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">
                                    +{itemsCount - 1} more
                                  </span>
                                )}
                              </button>
                            </td>

                            {/* Total Amount */}
                            <td className="px-4 py-4 text-right font-black text-slate-900 font-mono text-sm">
                              {formatCurrency(p.total_amount)}
                            </td>

                            {/* Paid & TDS */}
                            <td className="px-4 py-4 text-right">
                              <div className="font-mono font-bold text-emerald-700 text-xs">
                                {formatCurrency(paidVal)}
                              </div>
                              {Number(p.tds_amount) > 0 ? (
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  <span>Net: {formatCurrency(p.processed_amount || 0)}</span>
                                  <span className="text-blue-600 block">+ TDS: {formatCurrency(p.tds_amount)}</span>
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-400 font-mono">TDS: ₹0.00</div>
                              )}
                            </td>

                            {/* Outstanding */}
                            <td className="px-4 py-4 text-right">
                              <div className="font-mono font-black text-amber-700 text-xs">
                                {formatCurrency(outVal)}
                              </div>
                              <div className="mt-0.5">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    outVal === 0 && Number(p.total_amount) > 0
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : paidVal > 0
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-700'
                                  }`}
                                >
                                  {outVal === 0 && Number(p.total_amount) > 0
                                    ? 'Paid'
                                    : paidVal > 0
                                    ? 'Partial'
                                    : 'Unpaid'}
                                </span>
                              </div>
                            </td>

                            {/* INVOICE SEE AND DOWNLOAD: Only shows uploaded document */}
                            <td className="px-4 py-4 text-center whitespace-nowrap">
                              {hasAttachedDoc ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenAttachedDoc(p)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                                  title="View, Print & Download Uploaded Vendor Invoice"
                                >
                                  <span>📄</span>
                                  <span>See &amp; Download</span>
                                </button>
                              ) : (
                                <span className="text-slate-400 italic text-[11px] font-medium bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60 inline-block">
                                  No invoice found
                                </span>
                              )}
                            </td>

                            {/* PART PAYMENTS: Record Payment & History */}
                            <td className="px-4 py-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                {outVal > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPaymentModal(p)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                                    title="Record part payment against this invoice"
                                  >
                                    <span>+ Pay</span>
                                  </button>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    ✓ Settled
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleOpenHistoryModal(p)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                                  title="View All Part Payment Records against this invoice"
                                >
                                  <span>📜</span>
                                  <span>{paymentsCount}</span>
                                </button>
                              </div>
                            </td>

                            {/* ACTION: Items & Delete */}
                            <td className="px-4 py-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setViewingPurchase(p)}
                                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold cursor-pointer"
                                  title="Quick Items Breakdown"
                                >
                                  Items
                                </button>
                                <button
                                  onClick={() => handleDeletePurchase(p.id)}
                                  className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  Delete
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
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ATTACHED DOCUMENT VIEWER MODAL (PRINT & SAVE READY) */}
      {/* ========================================================================= */}
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
                    {selectedAttachedDoc.vendorName ? `${selectedAttachedDoc.vendorName} • ` : ''}
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

      {/* ========================================================================= */}
      {/* 2. RECORD PART PAYMENT MODAL */}
      {/* ========================================================================= */}
      {showPaymentModal && paymentPurchase && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl flex flex-col text-slate-800 overflow-hidden">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-base font-bold">
                  💳
                </span>
                <div>
                  <h3 className="font-bold text-sm text-white leading-tight">
                    Record Part Payment against Invoice
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Invoice #{paymentPurchase.invoice_no} • {paymentPurchase.vendor?.vendor_name || 'Vendor'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPaymentModal(false)
                  setPaymentPurchase(null)
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRecordPartPaymentSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
              {/* Invoice Summary Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Invoice Total
                  </span>
                  <span className="text-sm font-black text-slate-800 font-mono">
                    {formatCurrency(paymentPurchase.total_amount)}
                  </span>
                </div>
                <div className="border-x border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Previously Paid
                  </span>
                  <span className="text-sm font-black text-emerald-700 font-mono">
                    {formatCurrency(paymentPurchase.paid_amount || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                    Current Due
                  </span>
                  <span className="text-sm font-black text-amber-700 font-mono">
                    {formatCurrency(modalCurrentInvoiceDue)}
                  </span>
                </div>
              </div>

              {/* 3 Payment Calculation Inputs (Exact logic as Purchase Entry) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Processed Amount Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Processed (₹)</span>
                    <span className="text-[10px] text-slate-400">Net Payout</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={payProcessed}
                    onChange={handleModalProcessedChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Net cash/bank payout
                  </p>
                </div>

                {/* 2. TDS Deducted Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>TDS Deducted (₹)</span>
                    <span className="text-[10px] text-blue-600 font-semibold">TDS</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={payTds}
                    onChange={handleModalTdsChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-700 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Adjusts with processed payout
                  </p>
                </div>

                {/* 3. Outstanding Amount Input (Strictly Read Only) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Outstanding (₹)</span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold">Read Only</span>
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={modalCalculatedRemaining}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-amber-900 font-mono cursor-not-allowed select-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Balance after this payment
                  </p>
                </div>
              </div>

              {/* Date & Payment Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Payment Mode *
                  </label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT / RTGS)</option>
                    <option value="UPI">UPI / Net Banking</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              {/* Reference No & Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reference No. / UTR / Cheque No. (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR-9876543210 / Cheque #004321"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Notes / Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Part payment tranche against supply delivery"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setPaymentPurchase(null)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingPayment || modalInstallmentTotal <= 0}
                  className="px-6 py-2.5 rounded-xl bg-[#38b34a] hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submittingPayment ? 'Recording...' : `Record Payment of ${formatCurrency(modalInstallmentTotal)} ✓`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PAYMENT HISTORY MODAL (ALL PART PAYMENTS FOR A SINGLE INVOICE) */}
      {/* ========================================================================= */}
      {showHistoryModal && historyPurchase && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl flex flex-col text-slate-800 overflow-hidden max-h-[92vh]">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-base font-bold">
                  📜
                </span>
                <div>
                  <h3 className="font-bold text-sm text-white leading-tight">
                    Payment Records for Invoice #{historyPurchase.invoice_no}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Vendor: <strong className="text-slate-200">{historyPurchase.vendor?.vendor_name}</strong> • PO: {historyPurchase.purchase_no || `PO-${historyPurchase.id}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowHistoryModal(false)
                  setHistoryPurchase(null)
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Summary Strip */}
            <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Invoice</span>
                  <span className="text-sm font-black text-slate-900 font-mono">{formatCurrency(historyPurchase.total_amount)}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Disbursed</span>
                  <span className="text-sm font-black text-slate-800 font-mono">{formatCurrency(historyPurchase.processed_amount || 0)}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">TDS Deducted</span>
                  <span className="text-sm font-black text-blue-700 font-mono">{formatCurrency(historyPurchase.tds_amount || 0)}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Outstanding Due</span>
                  <span className="text-sm font-black text-amber-800 font-mono">
                    {formatCurrency(
                      historyPurchase.outstanding_amount !== undefined && historyPurchase.outstanding_amount !== null
                        ? historyPurchase.outstanding_amount
                        : Math.max(0, Number(historyPurchase.total_amount || 0) - (Number(historyPurchase.paid_amount) || 0))
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Table of Installments */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
              {(() => {
                let paymentsList = Array.isArray(historyPurchase.payments) ? [...historyPurchase.payments] : []
                paymentsList.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0))

                const totalPaymentsPaid = paymentsList.reduce((acc, pm) => acc + Number(pm.paid_amount || 0), 0)
                const purchasePaidVal = Number(historyPurchase.paid_amount || 0)

                // If initial payment recorded during purchase entry is missing from payments array:
                if (purchasePaidVal > totalPaymentsPaid && (purchasePaidVal - totalPaymentsPaid) > 0.01) {
                  const initialPaid = Math.round((purchasePaidVal - totalPaymentsPaid) * 100) / 100
                  const initialProc = Math.max(0, Math.round((Number(historyPurchase.processed_amount || 0) - paymentsList.reduce((acc, pm) => acc + Number(pm.processed_amount || 0), 0)) * 100) / 100)
                  const initialTds = Math.max(0, Math.round((Number(historyPurchase.tds_amount || 0) - paymentsList.reduce((acc, pm) => acc + Number(pm.tds_amount || 0), 0)) * 100) / 100)
                  const initialRemOut = Math.max(0, Math.round((Number(historyPurchase.total_amount || 0) - initialPaid) * 100) / 100)

                  paymentsList.unshift({
                    id: 'init_entry',
                    payment_date: historyPurchase.purchase_date,
                    processed_amount: initialProc,
                    tds_amount: initialTds,
                    paid_amount: initialPaid,
                    remaining_outstanding: initialRemOut,
                    payment_mode: 'Bank Transfer',
                    reference_no: 'Initial',
                    notes: 'Initial payment recorded during purchase entry'
                  })
                }

                if (paymentsList.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-sm">No part payments recorded yet for this invoice.</p>
                      <p className="text-xs text-slate-400 mt-1">Record the first payment installment using the button below.</p>
                    </div>
                  )
                }

                return (
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="px-3.5 py-3">#</th>
                          <th className="px-3.5 py-3">Payment Date</th>
                          <th className="px-3.5 py-3 text-right">Net Processed</th>
                          <th className="px-3.5 py-3 text-right">TDS Deducted</th>
                          <th className="px-3.5 py-3 text-right">Total Accounted</th>
                          <th className="px-3.5 py-3 text-right">Remaining Due</th>
                          <th className="px-3.5 py-3">Mode & Ref</th>
                          <th className="px-3.5 py-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {paymentsList.map((pm, idx) => (
                          <tr key={pm.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-3.5 py-3 font-bold text-slate-400">#{idx + 1}</td>
                            <td className="px-3.5 py-3 font-mono font-semibold text-slate-700">{pm.payment_date}</td>
                            <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-800">
                              {formatCurrency(pm.processed_amount)}
                            </td>
                            <td className="px-3.5 py-3 text-right font-mono font-bold text-blue-700">
                              {formatCurrency(pm.tds_amount)}
                            </td>
                            <td className="px-3.5 py-3 text-right font-mono font-black text-emerald-700">
                              {formatCurrency(pm.paid_amount || (Number(pm.processed_amount || 0) + Number(pm.tds_amount || 0)))}
                            </td>
                            <td className="px-3.5 py-3 text-right font-mono font-bold text-amber-700">
                              {pm.remaining_outstanding !== null && pm.remaining_outstanding !== undefined
                                ? formatCurrency(pm.remaining_outstanding)
                                : '—'}
                            </td>
                            <td className="px-3.5 py-3">
                              <span className="font-bold text-slate-800 block">{pm.payment_mode || 'Bank Transfer'}</span>
                              {pm.reference_no && <span className="font-mono text-[10px] text-slate-400 block">{pm.reference_no}</span>}
                            </td>
                            <td className="px-3.5 py-3 text-slate-500 text-[11px] max-w-xs truncate">
                              {pm.notes || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowHistoryModal(false)
                  setHistoryPurchase(null)
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>

              {Number(
                historyPurchase.outstanding_amount !== undefined && historyPurchase.outstanding_amount !== null
                  ? historyPurchase.outstanding_amount
                  : Math.max(0, Number(historyPurchase.total_amount || 0) - (Number(historyPurchase.paid_amount) || 0))
              ) > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const p = historyPurchase
                    setShowHistoryModal(false)
                    setHistoryPurchase(null)
                    handleOpenPaymentModal(p)
                  }}
                  className="px-5 py-2 bg-[#38b34a] hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>+</span>
                  <span>Record Next Part Payment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. QUICK ITEMS BREAKDOWN MODAL */}
      {/* ========================================================================= */}
      {viewingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl p-6 animate-scale-up text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  Purchase Invoice Breakdown
                </h3>
                <p className="text-xs text-slate-400 font-semibold font-mono">
                  {viewingPurchase.purchase_no} • Invoice: {viewingPurchase.invoice_no}
                </p>
              </div>
              <button
                onClick={() => setViewingPurchase(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Vendor & Invoice Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-bold block">Vendor:</span>
                <span className="font-extrabold text-slate-800 text-sm">
                  {viewingPurchase.vendor?.vendor_name || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Purchase Date:</span>
                <span className="font-semibold text-slate-700">
                  {viewingPurchase.purchase_date}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Invoice File:</span>
                {viewingPurchase.invoice_file_url || viewingPurchase.invoice_file ? (
                  <button
                    type="button"
                    onClick={() => {
                      const p = viewingPurchase
                      setViewingPurchase(null)
                      handleOpenAttachedDoc(p)
                    }}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    View File ↗
                  </button>
                ) : (
                  <span className="text-slate-400">None attached</span>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-4 py-2.5">Item Name</th>
                    <th className="px-4 py-2.5">HSN Code</th>
                    <th className="px-4 py-2.5">Unit</th>
                    <th className="px-4 py-2.5 text-right">Qty</th>
                    <th className="px-4 py-2.5 text-right">Rate</th>
                    <th className="px-4 py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingPurchase.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-bold text-slate-800">
                        {item.item_name}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-600">
                        {item.hsn_code || '—'}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-600">
                        {item.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-black text-slate-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {(() => {
                    const itemsSum = viewingPurchase.items?.reduce((acc, i) => acc + (Number(i.amount) || 0), 0) || 0
                    const sub = Number(viewingPurchase.subtotal) || itemsSum || 0
                    const vGst = (viewingPurchase.gst_type || viewingPurchase.vendor?.gst_type || '').toUpperCase()
                    const isIgst = vGst.includes('IGST') && !vGst.includes('CGST')
                    const isCgst = vGst.includes('CGST') || vGst.includes('SGST')
                    const cgst = Number(viewingPurchase.cgst_amount) || (isCgst ? Math.round(((sub * 9) / 100) * 100) / 100 : 0)
                    const sgst = Number(viewingPurchase.sgst_amount) || (isCgst ? Math.round(((sub * 9) / 100) * 100) / 100 : 0)
                    const igst = Number(viewingPurchase.igst_amount) || (isIgst ? Math.round(((sub * 18) / 100) * 100) / 100 : 0)

                    return (
                      <>
                        <tr className="bg-slate-50 border-t border-slate-200">
                          <td colSpan={5} className="px-4 py-2 text-right text-slate-600 font-semibold text-xs">
                            Amount Before Taxes:
                          </td>
                          <td className="px-4 py-2 text-right font-mono font-bold text-xs text-slate-800">
                            {formatCurrency(sub)}
                          </td>
                        </tr>
                        {isCgst && (
                          <>
                            <tr className="bg-slate-50">
                              <td colSpan={5} className="px-4 py-1.5 text-right text-slate-600 font-semibold text-xs">
                                CGST 9%:
                              </td>
                              <td className="px-4 py-1.5 text-right font-mono font-bold text-xs text-purple-700">
                                {formatCurrency(cgst)}
                              </td>
                            </tr>
                            <tr className="bg-slate-50">
                              <td colSpan={5} className="px-4 py-1.5 text-right text-slate-600 font-semibold text-xs">
                                SGST 9%:
                              </td>
                              <td className="px-4 py-1.5 text-right font-mono font-bold text-xs text-purple-700">
                                {formatCurrency(sgst)}
                              </td>
                            </tr>
                          </>
                        )}
                        {isIgst && (
                          <tr className="bg-slate-50">
                            <td colSpan={5} className="px-4 py-1.5 text-right text-slate-600 font-semibold text-xs">
                              IGST 18%:
                            </td>
                            <td className="px-4 py-1.5 text-right font-mono font-bold text-xs text-blue-700">
                              {formatCurrency(igst)}
                            </td>
                          </tr>
                        )}
                        <tr className="bg-emerald-50/70 border-t-2 border-emerald-300 font-bold">
                          <td colSpan={5} className="px-4 py-3 text-right text-emerald-950 uppercase tracking-wider text-xs">
                            Total Amount:
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-black text-sm text-emerald-600">
                            {formatCurrency(viewingPurchase.total_amount)}
                          </td>
                        </tr>
                      </>
                    )
                  })()}
                </tfoot>
              </table>
            </div>

            {viewingPurchase.notes && (
              <p className="text-xs text-slate-500 italic">
                <span className="font-bold text-slate-600">Notes: </span>
                {viewingPurchase.notes}
              </p>
            )}

            {/* Part Payment & TDS Settlement Summary */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2 font-sans">
                Payment Settlement &amp; TDS Record:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-sans font-semibold">Net Disbursed:</span>
                  <span className="font-black text-slate-800 text-sm">{formatCurrency(viewingPurchase.processed_amount || 0)}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-blue-600 block font-sans font-semibold">TDS Deducted:</span>
                  <span className="font-black text-blue-700 text-sm">{formatCurrency(viewingPurchase.tds_amount || 0)}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-emerald-600 block font-sans font-semibold">Total Paid Accounted:</span>
                  <span className="font-black text-emerald-700 text-sm">
                    {formatCurrency(
                      viewingPurchase.paid_amount ||
                      (Number(viewingPurchase.processed_amount || 0) + Number(viewingPurchase.tds_amount || 0))
                    )}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-amber-600 block font-sans font-semibold">Outstanding Balance:</span>
                  <span className="font-black text-amber-700 text-sm">
                    {formatCurrency(
                      viewingPurchase.outstanding_amount !== undefined && viewingPurchase.outstanding_amount !== null
                        ? viewingPurchase.outstanding_amount
                        : Math.max(0, Number(viewingPurchase.total_amount || 0) - (Number(viewingPurchase.paid_amount) || 0))
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const p = viewingPurchase
                  setViewingPurchase(null)
                  handleOpenTaxInvoice(p)
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                🧾 View Tax Invoice
              </button>
              <button
                onClick={() => setViewingPurchase(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
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

export default Purchase
