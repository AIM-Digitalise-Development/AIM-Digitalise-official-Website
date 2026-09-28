import os

leads_path = r"d:\AIM-Digitalise-official-Website\frontend\src\pages\partner\Leads.jsx"

with open(leads_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Ensure API imports
if "getPartnerClientQuotations" not in content:
    content = content.replace("getPartnerGeneralServices", "getPartnerGeneralServices,\n  getPartnerGeneralClientById,\n  createPartnerQuotation,\n  updatePartnerQuotation,\n  sendPartnerQuotationEmail,\n  getPartnerClientQuotations,\n  recordPartnerQuotationPayment")

if "import companyLogo" not in content:
    content = content.replace("import { usePartnerAuthStore }", "import companyLogo from '../../assets/images/logo.png'\nimport payQrCode from '../../assets/images/payqr.png'\nimport { usePartnerAuthStore }")

# 2. Add numberToIndianWords
words_helper = """
const numberToIndianWords = (num) => {
  if (!num || isNaN(num)) return 'Rupees Zero Only'
  const n = Math.round(Number(num))
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const inWords = (count) => {
    if (count < 20) return a[count]
    return b[Math.floor(count / 10)] + (count % 10 !== 0 ? ' ' + a[count % 10] : '')
  }
  let str = ''
  let crore = Math.floor(n / 10000000)
  let lakh = Math.floor((n % 10000000) / 100000)
  let thousand = Math.floor((n % 100000) / 1000)
  let hundred = Math.floor((n % 1000) / 100)
  let rest = n % 100
  if (crore > 0) str += inWords(crore) + ' Crore '
  if (lakh > 0) str += inWords(lakh) + ' Lakh '
  if (thousand > 0) str += inWords(thousand) + ' Thousand '
  if (hundred > 0) str += inWords(hundred) + ' Hundred '
  if (rest > 0) str += (str !== '' ? 'and ' : '') + inWords(rest) + ' '
  return 'Rupees ' + (str.trim() || 'Zero') + ' Only'
}
"""

if "numberToIndianWords" not in content:
    content = content.replace("export const isGeneralClientLead", words_helper + "\nexport const isGeneralClientLead")

# 3. Add state variables
state_anchor = "  const [loadingGeneralServices, setLoadingGeneralServices] = useState(false)"
new_state_block = """  const [loadingGeneralServices, setLoadingGeneralServices] = useState(false)

  // Quotations List & Document Viewer State
  const [showQuotationsListModal, setShowQuotationsListModal] = useState(false)
  const [selectedClientQuotations, setSelectedClientQuotations] = useState([])
  const [showQuotationDocModal, setShowQuotationDocModal] = useState(false)
  const [viewingQuotationDoc, setViewingQuotationDoc] = useState(null)
  const [copiedPayLink, setCopiedPayLink] = useState(false)
  const [loadingQuotations, setLoadingQuotations] = useState(false)

  // Payment Recording Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentQuotation, setPaymentQuotation] = useState(null)
  const [paymentForm, setPaymentForm] = useState({
    payment_amount: '',
    payment_date: new Date().toISOString().substring(0, 10),
    payment_mode: 'Bank Transfer',
    transaction_reference: '',
    notes: 'Offline payment recorded via Partner Portal'
  })
  const [recordingPayment, setRecordingPayment] = useState(false)

  // Quotation Builder State
  const [showQuotationBuilder, setShowQuotationBuilder] = useState(false)
  const [editingQuotationId, setEditingQuotationId] = useState(null)
  const [savingQuotation, setSavingQuotation] = useState(false)
  const [selectedGenClient, setSelectedGenClient] = useState(null)

  const [quotationForm, setQuotationForm] = useState({
    quotation_number: '',
    quotation_date: new Date().toISOString().split('T')[0],
    po_number: '',
    po_date: '',
    gst_type: 'Intra-State',
    gstin: '',
    payment_terms: 'Full payments in Advanced',
    discount_description: 'Corporate Consideration',
    anexture: 'NO',
    anexture_content: '',
  })
  const [quotationItems, setQuotationItems] = useState([])"""

if "showQuotationDocModal" not in content and state_anchor in content:
    content = content.replace(state_anchor, new_state_block)

# 4. Add Helper functions & quotation handlers
handlers_anchor = "  const fetchGeneralServicesList = async () => {"
new_handlers = """  // Helper to ensure General Client record
  const ensureGenClient = async (lead) => {
    const existingGenId = lead.rawId || lead.converted_to_client_id || lead.general_client_id
    if (existingGenId) {
      try {
        const directRes = await getPartnerGeneralClientById(existingGenId)
        if (directRes?.data?.data) {
          const directMatch = directRes.data.data
          lead.rawId = directMatch.id
          lead.client_id = directMatch.client_id
          lead.is_general_client = true
          return directMatch
        }
      } catch (_) {}
    }

    const cleanLeadPhone = (lead.client_phone || '').replace(/\\D/g, '').slice(-10)
    const leadEmailLower = (lead.client_email || '').toLowerCase().trim()

    try {
      const allClientsRes = await getPartnerGeneralClients()
      const allClients = allClientsRes?.data?.data || allClientsRes?.data?.clients || (Array.isArray(allClientsRes?.data) ? allClientsRes.data : [])
      const match = allClients.find(c => {
        const cPhone = (c.contact_number || '').replace(/\\D/g, '').slice(-10)
        const cEmail = (c.email || '').toLowerCase().trim()
        if (existingGenId && Number(c.id) === Number(existingGenId)) return true
        if (lead.client_id && c.client_id && c.client_id === lead.client_id) return true
        if (cleanLeadPhone && cPhone && cPhone === cleanLeadPhone) return true
        if (leadEmailLower && cEmail && cEmail === leadEmailLower) return true
        return false
      })
      if (match) {
        lead.rawId = match.id
        lead.client_id = match.client_id
        lead.is_general_client = true
        return match
      }
    } catch (_) {}

    try {
      const res = await createPartnerGeneralClient({
        client_name: lead.client_name,
        company_name: lead.company_name || lead.client_name,
        contact_number: lead.client_phone,
        alt_contact_number: lead.client_alternate_phone || null,
        email: lead.client_email || '',
        country_code: lead.country_code || 'IN',
        address: lead.address || '',
        city: lead.city || '',
        state: lead.state || '',
        pin_code: lead.pin_code || '',
        software_requirements: lead.software_requirements || lead.product_name || 'General Client Services',
      })
      if (res?.data?.data) {
        lead.rawId = res.data.data.id
        lead.client_id = res.data.data.client_id
        lead.is_general_client = true
        return res.data.data
      }
    } catch (_) {}
    return lead
  }

  // Open Quotation Builder for a lead
  const handleOpenQuotationBuilder = async (lead) => {
    const clientObj = await ensureGenClient(lead)
    setSelectedGenClient(clientObj)
    setEditingQuotationId(null)
    setShowQuotationBuilder(true)

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
      payment_terms: '',
      gst_type: clientObj.gst_type || 'Intra-State',
      gstin: clientObj.gstin || '',
      anexture: 'NO',
      anexture_content: '',
    })

    const prefilledItems = []
    const rawRequirements = clientObj.software_requirements
      ? clientObj.software_requirements.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    rawRequirements.forEach((reqName, idx) => {
      const matchedSrv = generalServices.find((s) => (s.name || s.service_name || '').toLowerCase() === reqName.toLowerCase())
      if (matchedSrv) {
        prefilledItems.push({
          id: Date.now() + idx,
          product_name: matchedSrv.name || matchedSrv.service_name,
          hsn: matchedSrv.hsn || '998314',
          qty: 1,
          unit: matchedSrv.unit || 'Unit',
          selling_price: Number(matchedSrv.selling_price || 0),
          discount_percentage: 0,
          description: matchedSrv.description || matchedSrv.name || reqName,
        })
      } else {
        prefilledItems.push({
          id: Date.now() + idx,
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

    if (prefilledItems.length === 0) {
      prefilledItems.push({
        id: Date.now(),
        product_name: 'General Client Services',
        hsn: '998314',
        qty: 1,
        unit: 'Unit',
        selling_price: 15000,
        discount_percentage: 0,
        description: 'Scope & specifications for General Client Services',
      })
    }

    setQuotationItems(prefilledItems)
  }

  // View Client Quotations list
  const handleViewClientQuotations = async (lead) => {
    const clientObj = await ensureGenClient(lead)
    setSelectedGenClient(clientObj)
    setShowQuotationsListModal(true)
    setLoadingQuotations(true)
    try {
      const res = await getPartnerClientQuotations(clientObj.rawId || clientObj.id)
      const qList = res.data?.data?.quotations || res.data?.data || res.data?.quotations || (Array.isArray(res.data) ? res.data : [])
      setSelectedClientQuotations(Array.isArray(qList) ? qList : [])
    } catch (err) {
      console.error('Failed to load client quotations:', err)
      setSelectedClientQuotations([])
    } finally {
      setLoadingQuotations(false)
    }
  }

  // Edit Quotation
  const handleEditQuotation = (quotation, client = null) => {
    const targetClient = client || quotation.client || selectedGenClient
    if (targetClient) {
      setSelectedGenClient(targetClient)
    }
    setEditingQuotationId(quotation.id)
    setShowQuotationDocModal(false)
    setShowQuotationsListModal(false)
    setShowQuotationBuilder(true)

    setQuotationForm({
      quotation_date: quotation.quotation_date ? String(quotation.quotation_date).substring(0, 10) : new Date().toISOString().substring(0, 10),
      quotation_number: quotation.quotation_number || '',
      po_number: quotation.po_number || '',
      po_date: quotation.po_date ? String(quotation.po_date).substring(0, 10) : '',
      discount_description: quotation.discount_description || 'Corporate Consideration',
      payment_terms: quotation.payment_terms || '',
      gst_type: quotation.gst_type || (targetClient?.gst_type || 'Intra-State'),
      gstin: quotation.gstin || (targetClient?.gstin || ''),
      anexture: quotation.anexture || 'NO',
      anexture_content: quotation.anexture_content || '',
    })

    const existingItems = (quotation.items || []).map((it, idx) => ({
      id: it.id || (Date.now() + idx),
      product_name: it.product_name || it.name || 'Service Item',
      hsn: it.hsn || it.hsn_code || '998314',
      unit: it.unit || 'Unit',
      qty: Number(it.qty || it.quantity || 1),
      selling_price: Number(it.selling_price || it.price || 0),
      discount_percentage: Number(it.discount_percentage || it.discount || 0),
      description: it.description || '',
    }))

    setQuotationItems(existingItems.length > 0 ? existingItems : [{
      id: Date.now(),
      product_name: 'Service Item',
      hsn: '998314',
      unit: 'Unit',
      qty: 1,
      selling_price: 0,
      discount_percentage: 0,
      description: ''
    }])
  }

  // Open Proforma Invoice Document Modal
  const handleOpenQuotationDoc = (quotation, clientObj = null) => {
    setViewingQuotationDoc({
      ...quotation,
      client: clientObj || quotation.client || selectedGenClient || {}
    })
    setShowQuotationDocModal(true)
  }

  // Quotation Item modifications
  const handleAddQuotationItemFromCatalog = (service) => {
    const newItem = {
      id: Date.now(),
      product_id: service.id,
      product_name: service.name || service.service_name || 'Service Item',
      hsn: service.hsn || '998314',
      qty: 1,
      unit: service.unit || 'Unit',
      selling_price: Number(service.selling_price || 0),
      discount_percentage: 0,
      description: service.description || service.name || '',
    }
    setQuotationItems((prev) => [...prev, newItem])
  }

  const handleAddCustomQuotationItem = () => {
    const newItem = {
      id: Date.now(),
      product_id: null,
      product_name: 'Custom Service / Deliverable',
      hsn: '998314',
      qty: 1,
      unit: 'Unit',
      selling_price: 5000,
      discount_percentage: 0,
      description: '',
    }
    setQuotationItems((prev) => [...prev, newItem])
  }

  const handleUpdateQuotationItem = (index, field, value) => {
    setQuotationItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleRemoveQuotationItem = (index) => {
    setQuotationItems((prev) => prev.filter((_, i) => i !== index))
  }

  // Quotation Totals Calculation
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

  // Save Quotation Handler
  const handleSaveQuotation = async (shouldSendEmail = false) => {
    if (!selectedGenClient?.id && !selectedGenClient?.rawId) {
      alert('Error: Missing General Client reference ID')
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
      anexture: quotationForm.anexture === 'YES' ? 'YES' : 'NO',
      anexture_content: quotationForm.anexture === 'YES' ? quotationForm.anexture_content : '',
      subtotal: totals.subtotal,
      cgst_amount: totals.cgst,
      sgst_amount: totals.sgst,
      igst_amount: totals.igst,
      tax_amount: totals.taxTotal,
      total_amount: totals.grandTotal,
      currency: selectedGenClient?.country_code === 'IN' ? 'INR' : 'USD',
      country_code: selectedGenClient?.country_code || 'IN',
      items: quotationItems.map((it) => ({
        product_name: it.product_name,
        hsn: it.hsn,
        unit: it.unit,
        qty: Number(it.qty || 1),
        selling_price: Number(it.selling_price || 0),
        discount_percentage: Number(it.discount_percentage || 0),
        description: it.description || '',
      })),
    }

    try {
      setSavingQuotation(true)
      let res
      if (editingQuotationId) {
        res = await updatePartnerQuotation(editingQuotationId, payload)
      } else {
        res = await createPartnerQuotation(clientId, payload)
      }

      if (res.data?.success || res.data?.id || res.data?.quotation) {
        const quoData = res.data?.data || res.data?.quotation || res.data || {}
        if (shouldSendEmail && quoData.id) {
          try {
            await sendPartnerQuotationEmail(quoData.id)
          } catch (_) {}
        }

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
      alert(err.response?.data?.message || 'Failed to save quotation')
    } finally {
      setSavingQuotation(false)
    }
  }

  // Print Quotation Document
  const handlePrintQuotation = () => {
    window.print()
  }

  // Open Payment Modal
  const handleOpenPaymentModal = (quotation) => {
    setPaymentQuotation(quotation)
    setPaymentForm({
      payment_amount: quotation.total_amount || quotation.grand_total || '',
      payment_date: new Date().toISOString().substring(0, 10),
      payment_mode: 'Bank Transfer',
      transaction_reference: '',
      notes: 'Offline payment recorded via Partner Portal'
    })
    setShowPaymentModal(true)
  }

  // Handle Record Manual Payment Submit
  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault()
    if (!paymentQuotation?.id) return

    try {
      setRecordingPayment(true)
      const res = await recordPartnerQuotationPayment(paymentQuotation.id, {
        amount: paymentForm.payment_amount,
        payment_method: paymentForm.payment_mode,
        transaction_id: paymentForm.transaction_reference,
        paid_at: paymentForm.payment_date,
        notes: paymentForm.notes
      })

      if (res.data?.success) {
        alert('🎉 Payment recorded successfully! Client order closed & moved to General Clients directory.')
        setShowPaymentModal(false)
        setShowQuotationDocModal(false)
        setShowQuotationsListModal(false)
        loadLeads()
      }
    } catch (err) {
      console.error('Failed to record payment:', err)
      alert(err.response?.data?.message || 'Failed to record payment')
    } finally {
      setRecordingPayment(false)
    }
  }

  const fetchGeneralServicesList = async () => {"""

if "handleOpenQuotationBuilder" not in content and handlers_anchor in content:
    content = content.replace(handlers_anchor, new_handlers)

# 5. Add Modals JSX before end of component
# Find position of slide over drawer or end of component return
drawer_anchor = "{/* ─────────────────────── SLIDE OVER DRAWER: DETAILS ─────────────────────── */}"

modals_jsx = """      {/* ─────────────────────── QUOTATION BUILDER SCREEN ─────────────────────── */}
      {showQuotationBuilder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-[#151722] rounded-3xl border border-white/10 shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden text-gray-200">
            {/* Top Bar */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#1a1e2d]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingQuotationId ? 'Edit Commercial Quotation' : 'Create Commercial Quotation'}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    Client: <strong className="text-white">{selectedGenClient?.client_name || selectedGenClient?.company_name}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuotationBuilder(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingQuotation}
                  onClick={(e) => handleSaveQuotation(false)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingQuotation ? 'Saving...' : '💾 Save Quotation'}
                </button>
                <button
                  type="button"
                  disabled={savingQuotation}
                  onClick={(e) => handleSaveQuotation(true)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingQuotation ? 'Sending...' : '📧 Save & Send Email'}
                </button>
              </div>
            </div>

            {/* Builder Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Quotation Metadata Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#1a1e2d] rounded-2xl border border-white/5">
                <div>
                  <label className="font-bold text-gray-400 block mb-1">Quotation Number *</label>
                  <input
                    type="text"
                    value={quotationForm.quotation_number}
                    onChange={(e) => setQuotationForm({ ...quotationForm, quotation_number: e.target.value })}
                    className="w-full bg-[#13151f] border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white focus:border-[#38b34a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-400 block mb-1">Quotation Date *</label>
                  <input
                    type="date"
                    value={quotationForm.quotation_date}
                    onChange={(e) => setQuotationForm({ ...quotationForm, quotation_date: e.target.value })}
                    className="w-full bg-[#13151f] border border-white/10 rounded-xl px-3 py-2 font-bold text-white focus:border-[#38b34a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-400 block mb-1">GST Tax Type</label>
                  <select
                    value={quotationForm.gst_type}
                    onChange={(e) => setQuotationForm({ ...quotationForm, gst_type: e.target.value })}
                    className="w-full bg-[#13151f] border border-white/10 rounded-xl px-3 py-2 font-bold text-white focus:border-[#38b34a] focus:outline-none"
                  >
                    <option value="Intra-State">Intra-State (CGST 9% + SGST 9%)</option>
                    <option value="Inter-State">Inter-State (IGST 18%)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-400 block mb-1">Client GSTIN</label>
                  <input
                    type="text"
                    placeholder="e.g. 19AAACC12341ZB"
                    value={quotationForm.gstin}
                    onChange={(e) => setQuotationForm({ ...quotationForm, gstin: e.target.value })}
                    className="w-full bg-[#13151f] border border-white/10 rounded-xl px-3 py-2 font-mono text-white focus:border-[#38b34a] focus:outline-none"
                  />
                </div>
              </div>

              {/* Line Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-white uppercase tracking-wider text-xs flex items-center gap-2">
                    <span>📦 Line Items & Services Scope</span>
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddCustomQuotationItem}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      + Add Custom Item
                    </button>
                  </div>
                </div>

                <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#1a1e2d]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#13151f] text-gray-400 text-[10px] font-black uppercase tracking-wider border-b border-white/10">
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">Item / Service Name</th>
                        <th className="p-3 w-24">HSN/SAC</th>
                        <th className="p-3 w-16 text-center">Qty</th>
                        <th className="p-3 w-28 text-right">Price (₹)</th>
                        <th className="p-3 w-20 text-center">Disc %</th>
                        <th className="p-3 w-28 text-right">Total (₹)</th>
                        <th className="p-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {quotationItems.map((item, idx) => {
                        const qty = Number(item.qty || 1)
                        const price = Number(item.selling_price || 0)
                        const disc = Number(item.discount_percentage || 0)
                        const lineTotal = Math.round(qty * price * (1 - disc / 100) * 100) / 100

                        return (
                          <tr key={idx} className="hover:bg-white/[0.02]">
                            <td className="p-3 text-center text-gray-500 font-bold">{idx + 1}</td>
                            <td className="p-3 space-y-1">
                              <input
                                type="text"
                                value={item.product_name}
                                onChange={(e) => handleUpdateQuotationItem(idx, 'product_name', e.target.value)}
                                className="w-full bg-[#13151f] border border-white/10 rounded-lg px-2.5 py-1.5 font-bold text-white focus:border-[#38b34a] focus:outline-none"
                              />
                              <textarea
                                rows={2}
                                placeholder="Service description / scope details..."
                                value={item.description}
                                onChange={(e) => handleUpdateQuotationItem(idx, 'description', e.target.value)}
                                className="w-full bg-[#13151f] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-gray-300 focus:border-[#38b34a] focus:outline-none"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={item.hsn}
                                onChange={(e) => handleUpdateQuotationItem(idx, 'hsn', e.target.value)}
                                className="w-full bg-[#13151f] border border-white/10 rounded-lg px-2 py-1 font-mono text-center text-gray-300"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                min={1}
                                value={item.qty}
                                onChange={(e) => handleUpdateQuotationItem(idx, 'qty', e.target.value)}
                                className="w-full bg-[#13151f] border border-white/10 rounded-lg px-2 py-1 text-center font-bold text-white"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                min={0}
                                value={item.selling_price}
                                onChange={(e) => handleUpdateQuotationItem(idx, 'selling_price', e.target.value)}
                                className="w-full bg-[#13151f] border border-white/10 rounded-lg px-2 py-1 text-right font-bold text-white"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={item.discount_percentage}
                                onChange={(e) => handleUpdateQuotationItem(idx, 'discount_percentage', e.target.value)}
                                className="w-full bg-[#13151f] border border-white/10 rounded-lg px-2 py-1 text-center font-bold text-amber-400"
                              />
                            </td>
                            <td className="p-3 text-right font-black text-white">
                              ₹{lineTotal.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveQuotationItem(idx)}
                                className="text-red-400 hover:text-red-300 font-bold p-1 cursor-pointer"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals & Notes Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 p-4 bg-[#1a1e2d] rounded-2xl border border-white/5">
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Discount Description</label>
                    <input
                      type="text"
                      value={quotationForm.discount_description}
                      onChange={(e) => setQuotationForm({ ...quotationForm, discount_description: e.target.value })}
                      className="w-full bg-[#13151f] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Payment Terms</label>
                    <input
                      type="text"
                      placeholder="e.g. 50% Advance, 50% on Completion"
                      value={quotationForm.payment_terms}
                      onChange={(e) => setQuotationForm({ ...quotationForm, payment_terms: e.target.value })}
                      className="w-full bg-[#13151f] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#1a1e2d] rounded-2xl border border-white/5 space-y-2 text-xs">
                  {(() => {
                    const totals = computeQuotationTotals()
                    return (
                      <>
                        <div className="flex justify-between text-gray-400">
                          <span>Subtotal:</span>
                          <span className="font-bold text-white">₹{totals.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        {quotationForm.gst_type === 'Intra-State' ? (
                          <>
                            <div className="flex justify-between text-gray-400">
                              <span>CGST (9%):</span>
                              <span>₹{totals.cgst.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                              <span>SGST (9%):</span>
                              <span>₹{totals.sgst.toLocaleString('en-IN')}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between text-gray-400">
                            <span>IGST (18%):</span>
                            <span>₹{totals.igst.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-black text-white text-sm border-t border-white/10 pt-2">
                          <span>Grand Total:</span>
                          <span className="text-emerald-400 text-base">₹{totals.grandTotal.toLocaleString('en-IN')}</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────── CLIENT QUOTATIONS LIST MODAL ─────────────────────── */}
      {showQuotationsListModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151722] rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full overflow-hidden text-gray-200">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1a1e2d]">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>📋 Quotations History</span>
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  Client: <strong className="text-white">{selectedGenClient?.client_name || selectedGenClient?.company_name}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowQuotationsListModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3">
              {loadingQuotations ? (
                <div className="text-center py-8 text-gray-400 font-bold">Loading quotations...</div>
              ) : selectedClientQuotations.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-bold">No quotations generated yet for this client.</div>
              ) : (
                selectedClientQuotations.map((quo) => (
                  <div key={quo.id} className="p-4 bg-[#1a1e2d] border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white text-sm">#{quo.quotation_number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          quo.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {quo.status || 'DRAFT'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Date: {quo.quotation_date ? String(quo.quotation_date).substring(0, 10) : 'N/A'}</p>
                      <p className="text-xs font-black text-emerald-400 mt-0.5">₹{Number(quo.total_amount || 0).toLocaleString('en-IN')}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenQuotationDoc(quo, selectedGenClient)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        📄 View Proforma Invoice
                      </button>
                      <button
                        onClick={() => handleEditQuotation(quo, selectedGenClient)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                      {quo.status !== 'paid' && (
                        <button
                          onClick={() => handleOpenPaymentModal(quo)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          💳 Record Payment
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────── PROFORMA INVOICE OFFICIAL DOCUMENT VIEWER MODAL ─────────────────────── */}
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
                  onClick={() => handleEditQuotation(viewingQuotationDoc, viewingQuotationDoc.client)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>✏️</span>
                  <span>Edit Quotation</span>
                </button>

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
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/60 print:p-0 print:bg-white print:overflow-visible font-sans">
              <div
                id="quotation-document-paper"
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 md:p-7 space-y-3 sm:space-y-4 print:border-none print:shadow-none print:p-0 max-w-3xl mx-auto"
              >
                {/* Proforma Invoice Title */}
                <div className="text-center -mt-1 sm:-mt-2 pt-0 pb-0.5">
                  <h1 className="text-xs sm:text-sm font-black text-[#1e3e6b] tracking-[0.25em] uppercase font-sans">
                    PROFORMA INVOICE
                  </h1>
                </div>

                {/* Letterhead & Brand Header with Company Logo */}
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
                        Date: <strong className="text-slate-800">{viewingQuotationDoc.quotation_date ? String(viewingQuotationDoc.quotation_date).substring(0, 10) : 'N/A'}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Client / Billing Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                      QUOTATION FOR (BILL TO):
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {viewingQuotationDoc.client?.company_name || viewingQuotationDoc.client?.client_name || 'Valued Client'}
                    </h3>
                    <p className="text-slate-600">{viewingQuotationDoc.client?.email || '—'}</p>
                    <p className="text-slate-600">{viewingQuotationDoc.client?.contact_number || '—'}</p>
                    {viewingQuotationDoc.client?.address && (
                      <p className="text-slate-500 pt-0.5 leading-snug">
                        {viewingQuotationDoc.client.address}
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
                      Sold / Prepared By: <strong>{viewingQuotationDoc.client?.sold_by || 'Partner Sales Team'}</strong>
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

                {/* Scope & Itemized Breakdown Table */}
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
                                  {item.product_name || item.name || 'Service Item'}
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

                {/* Financial Calculations & Bank Details */}
                <div className="quotation-financials-block grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
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
                        ₹{Number(viewingQuotationDoc.grand_total || viewingQuotationDoc.grandTotal || viewingQuotationDoc.total_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount in Words */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                      Amount in Words:
                    </span>
                    <p className="font-bold text-slate-800 italic leading-relaxed">
                      {numberToIndianWords(viewingQuotationDoc.grand_total || viewingQuotationDoc.grandTotal || viewingQuotationDoc.total_amount)}
                    </p>
                  </div>
                  <div className="border-t border-slate-200/80 pt-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                      Payment Terms:
                    </span>
                    <p className="font-bold text-slate-800 leading-relaxed">
                      {viewingQuotationDoc.payment_terms || 'Full payments in Advanced'}
                    </p>
                  </div>
                </div>

                {/* Terms & Signature */}
                <div className="quotation-terms-signature grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-slate-200 text-xs">
                  <div className="sm:col-span-2 space-y-1 text-slate-500 text-[10px]">
                    <span className="font-black text-slate-700 uppercase tracking-wider block">Terms & Conditions:</span>
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>This quotation is valid for 30 days from the date of issuance.</li>
                      <li>Work commences immediately upon receipt of initial confirmation or advance.</li>
                      <li>GST/Taxes are calculated based on registered business jurisdiction.</li>
                      <li>For any inquiries regarding this quotation, contact <strong>support@aimdigitalise.com</strong>.</li>
                    </ol>
                  </div>

                  <div className="quotation-signature-block text-center sm:text-right space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      For AIM Digitalise Pvt. Ltd.
                    </span>
                    <div className="inline-block text-center space-y-1">
                      <img
                        src="https://api.nexgn.in/public/signature_1.png"
                        alt="Boss Signature"
                        className="h-14 w-auto object-contain mx-auto my-1"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.includes('https://api.nexgn.in/public/signature_1.png')) {
                            target.src = 'https://api.nexgn.in/signature_1.png';
                          } else {
                            target.onerror = null;
                          }
                        }}
                      />
                      <div className="border-t border-slate-400 pt-1 min-w-[140px]">
                        <span className="font-black text-slate-800 text-xs block">Authorized Signatory</span>
                        <span className="text-[9px] text-slate-400 block font-medium">Digital Signature & Stamp</span>
                      </div>
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
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────── RECORD MANUAL PAYMENT MODAL ─────────────────────── */}
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

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4 text-xs">
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
                  disabled={recordingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {recordingPayment ? 'Saving...' : 'Confirm & Close Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────── SLIDE OVER DRAWER: DETAILS ─────────────────────── */}"""

if drawer_anchor in content and "showQuotationBuilder" not in content:
    content = content.replace(drawer_anchor, modals_jsx)

with open(leads_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Full Quotations integration completed in partner Leads.jsx!")
