import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientAuthStore } from '../../store/clientAuthStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getClientAddonPreview,
  getClientAddonHistory,
  createAddonPaymentOrder,
  verifyAddonPayment
} from '../../api/clientPortal'
import ClientPageHeader from '../../components/client/ClientPageHeader'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtCurrency = (v) => {
  if (v === undefined || v === null) return '—'
  const n = typeof v === 'string' ? parseFloat(v) : v
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const ADDON_COLORS = {
  Transportation: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '🚌' },
  Hostel: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', icon: '🏢' },
  'Previous Year Backup': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: '💾' },
  'Domain Services': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '🌐' },
  'id card Type A': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '🪪' },
  'id card Type B': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', icon: '🪪' },
  'id card Type C': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: '🪪' },
}

const addonColor = (type) => ADDON_COLORS[type] || { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '🔌' }

const ClientAddonServices = () => {
  const navigate = useNavigate()
  const { profileData, clientToken, isClientAuthenticated, productData, clientLogout } = useClientAuthStore()

  // ── States ─────────────────────────────────────────────────────────────────
  const [addonHistory, setAddonHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Selected addon form states
  const [selectedAddonType, setSelectedAddonType] = useState('Transportation')
  const [selectedIdCardType, setSelectedIdCardType] = useState('Type A')
  const [selectedRecipientType, setSelectedRecipientType] = useState('student')

  const [addonPreview, setAddonPreview] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Payment Confirmation Modal States
  const [showBillModal, setShowBillModal] = useState(false)
  const [billData, setBillData] = useState(null)
  const billRef = useRef(null)

  const reviewAddonPayment = () => {
    if (!addonPreview) return

    const today = new Date()
    const invoiceDate = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const invoiceNumber = `ADDON-INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const bill = {
      invoiceNumber,
      invoiceDate,
      clientName: profileData?.company_name || profileData?.school_name || profileData?.organization || 'Academic Institute',
      clientId: profileData?.client_id || '',
      addonType: getResolvedAddonType(),
      recipientType: selectedRecipientType,
      rate: addonPreview.rate,
      rateFormatted: addonPreview.rate_formatted || fmtCurrency(addonPreview.rate),
      count: selectedAddonType === 'Domain Services' ? 1 : (selectedRecipientType === 'teacher' ? addonPreview.teacher_count || 45 : addonPreview.student_count || 850),
      subtotal: addonPreview.subtotal,
      subtotalFormatted: addonPreview.subtotal_formatted || fmtCurrency(addonPreview.subtotal),
      gstPercentage: addonPreview.gst_percentage || 18,
      gstAmount: addonPreview.gst_amount,
      gstAmountFormatted: addonPreview.gst_amount_formatted || fmtCurrency(addonPreview.gst_amount),
      amount: addonPreview.amount,
      amountFormatted: addonPreview.amount_formatted || fmtCurrency(addonPreview.amount),
      status: 'Pending'
    }

    setBillData(bill)
    setShowBillModal(true)
  }

  const downloadBill = () => {
    if (!billRef.current) return
    const content = billRef.current.innerHTML
    const style = `
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b; }
        .bill-container { max-width: 850px; margin: 0 auto; padding: 40px; background: white; border: 1px solid #e2e8f0; border-radius: 4px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .bill-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .logo-circle { width: 85px; height: 85px; background: #c25e17; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 38px; font-weight: 800; }
        .company-info { text-align: right; font-size: 13px; color: #64748b; line-height: 1.5; }
        .company-info h2 { font-size: 22px; font-weight: 700; color: #c25e17; margin: 0 0 6px 0; }
        
        .invoice-divider-container { display: flex; align-items: center; margin: 24px 0; }
        .invoice-divider-line { flex: 1; height: 1px; background: #e2e8f0; }
        .invoice-divider-text { padding: 0 16px; font-size: 18px; font-weight: 700; color: #c25e17; letter-spacing: 0.05em; text-transform: uppercase; }

        .invoice-grid-section { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 30px; }
        .invoice-left-side { width: 55%; display: flex; flex-direction: column; gap: 20px; }
        .invoice-right-side { width: 40%; }
        
        .address-block h4 { font-size: 14px; font-weight: 700; color: #64748b; margin: 0 0 6px 0; text-transform: uppercase; }
        .address-block p { font-size: 13px; color: #334155; margin: 0; line-height: 1.5; }
        .address-block .client-highlight-name { font-size: 16px; font-weight: 700; color: #c25e17; margin-bottom: 4px; }
        
        .meta-table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; font-size: 13px; }
        .meta-table td { padding: 8px 12px; border: 1px solid #e2e8f0; }
        .meta-table td.meta-label { background: #c25e17; color: white; font-weight: 600; width: 45%; }
        .meta-table td.meta-value { background: white; color: #475569; }

        .bill-table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px; }
        .bill-table th { background: #c25e17; color: white; padding: 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #c25e17; }
        .bill-table th:first-child { text-align: center; width: 5%; }
        .bill-table th:nth-child(2) { text-align: left; width: 50%; }
        .bill-table th:nth-child(3), .bill-table th:nth-child(4), .bill-table th:nth-child(5) { text-align: right; width: 15%; }
        
        .bill-table td { padding: 16px 12px; border: 1px solid #e2e8f0; color: #334155; vertical-align: top; }
        .bill-table td.cell-center { text-align: center; }
        .bill-table td.cell-right { text-align: right; }
        .bill-table tr:nth-child(even) td { background-color: #fafafa; }
        
        .item-title { font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .item-desc { font-size: 12px; color: #64748b; line-height: 1.4; }

        .invoice-bottom-section { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; gap: 30px; }
        .terms-section { width: 50%; font-size: 12px; line-height: 1.6; }
        .terms-section h5 { font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; }
        .terms-section p { color: #64748b; margin: 0 0 8px 0; }
        .thanks-msg { font-size: 13px; font-style: italic; color: #475569; margin-bottom: 20px; }

        .summary-section { width: 45%; }
        .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 13px; }
        .summary-table td { padding: 6px 12px; text-align: right; color: #475569; }
        .summary-table td:last-child { width: 40%; font-weight: 600; color: #0f172a; }
        .summary-table tr.total-row td { font-size: 16px; font-weight: 800; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        
        .balance-due-bar { background: #c25e17; color: white; display: flex; justify-content: space-between; padding: 12px 16px; font-size: 15px; font-weight: 700; border-radius: 2px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
      </style>
    `
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Invoice ${billData?.invoiceNumber || ''}</title>${style}</head>
        <body>${content}</body>
      </html>
    `
    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Invoice_${billData?.invoiceNumber || 'bill'}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const activeProduct = productData?.[0] || {}
  const productName = activeProduct?.product_name || activeProduct?.name || 'NEXGN Institute Pro'

  // ── Sync History ───────────────────────────────────────────────────────────
  const fetchHistory = async () => {
    if (!isClientAuthenticated || !clientToken) return
    setLoadingHistory(true)
    try {
      const res = await getClientAddonHistory(clientToken)
      if (res?.success) {
        setAddonHistory(res.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch addon history:', err)
      if (err.response?.status === 401) {
        clientLogout()
      }
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [clientToken, isClientAuthenticated])

  // ── Resolved Addon Type ────────────────────────────────────────────────────
  const getResolvedAddonType = () => {
    return selectedAddonType === 'id card' ? 'id card ' + selectedIdCardType : selectedAddonType
  }

  // ── Fetch Addon Preview ───────────────────────────────────────────────────
  const fetchPreview = async (addonType, recipientType) => {
    if (!clientToken) return
    setLoadingPreview(true)
    setError('')
    try {
      const res = await getClientAddonPreview(addonType, recipientType, clientToken)
      if (res?.success) {
        setAddonPreview(res.data)
      } else {
        setAddonPreview(null)
        setError(res?.message || 'Failed to calculate pricing preview')
      }
    } catch (err) {
      console.error('Failed to load addon preview:', err)
      setError('Pricing error: ' + (err.response?.data?.message || err.message))
      setAddonPreview(null)
    } finally {
      setLoadingPreview(false)
    }
  }

  // Fetch preview when selections change
  useEffect(() => {
    if (isClientAuthenticated && clientToken) {
      fetchPreview(getResolvedAddonType(), selectedRecipientType)
    }
  }, [selectedAddonType, selectedIdCardType, selectedRecipientType, clientToken, isClientAuthenticated])

  // ── Load Razorpay Script ───────────────────────────────────────────────────
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
      document.body.appendChild(script)
    })
  }

  // ── Process Checkout Payment ───────────────────────────────────────────────
  const handlePaymentSubmit = async () => {
    const finalAddonType = getResolvedAddonType()

    setProcessingPayment(true)
    setError('')
    setSuccess('')

    try {
      // 1. Create order on backend
      const orderRes = await createAddonPaymentOrder(finalAddonType, selectedRecipientType, clientToken)
      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to initialize transaction order')
      }

      // 2. Simulated payment mode
      if (orderRes.simulated) {
        const confirmSim = window.confirm(
          `SIMULATION GATEWAY MODE\n\nAmount: ${addonPreview?.amount_formatted || fmtCurrency(addonPreview?.amount)}\nService: ${finalAddonType}\n\nClick OK to simulate successful transaction.`
        )

        if (confirmSim) {
          setSuccess('Simulating receipt generation...')
          const verifyRes = await verifyAddonPayment({
            addon_type: finalAddonType,
            recipient_type: selectedRecipientType,
            order_id: orderRes.order_id,
            razorpay_payment_id: 'sim_pay_' + Date.now(),
            razorpay_order_id: orderRes.order_id,
            razorpay_signature: 'sim_signature_' + Date.now()
          }, clientToken)

          if (verifyRes.success) {
            setSuccess(`✅ ${verifyRes.message || 'Payment successfully processed!'}`)
            setShowBillModal(false)
            fetchHistory()
          } else {
            setError(verifyRes.message || 'Simulation verification rejected by server')
          }
        }
        setProcessingPayment(false)
        return
      }

      // 3. Real Payment Mode
      await loadRazorpayScript()

      const options = {
        key: orderRes.key,
        amount: Math.round(orderRes.amount * 100),
        currency: orderRes.currency || 'INR',
        name: 'AIM Digitalise',
        description: `${finalAddonType} Add-on Service`,
        order_id: orderRes.order_id,
        handler: async (response) => {
          setSuccess('Verifying checkout transaction details on server...')
          try {
            const verifyRes = await verifyAddonPayment({
              addon_type: finalAddonType,
              recipient_type: selectedRecipientType,
              order_id: orderRes.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }, clientToken)

            if (verifyRes.success) {
              setSuccess(`✅ Payment of ${addonPreview.amount_formatted || fmtCurrency(addonPreview.amount)} verified successfully!`)
              setShowBillModal(false)
              fetchHistory()
            } else {
              setError(verifyRes.message || 'Payment verification failed.')
            }
          } catch (err) {
            console.error('Payment verify API error:', err)
            setError('Verification failed: ' + (err?.response?.data?.message || err.message))
          } finally {
            setProcessingPayment(false)
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled')
            setProcessingPayment(false)
          }
        },
        prefill: {
          name: profileData?.company_name || profileData?.school_name || '',
          email: profileData?.email || '',
        },
        theme: {
          color: '#3b82f6',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        setError('Payment failed: ' + (response.error?.description || 'Unknown error'))
        setProcessingPayment(false)
      })
      rzp.open()

    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.message || 'Failed to process checkout transaction')
      setProcessingPayment(false)
    }
  }

  // Addon Invoice Bill Modal Overlay
  const BillModal = () => {
    if (!showBillModal || !billData) return null

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '20px',
        overflow: 'auto'
      }} onClick={() => setShowBillModal(false)}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '95vh',
          overflow: 'auto',
          padding: '30px',
          position: 'relative'
        }} onClick={(e) => e.stopPropagation()}>

          <style dangerouslySetInnerHTML={{
            __html: `
            .bill-container { max-width: 850px; margin: 0 auto; padding: 40px; background: white; border: 1px solid #e2e8f0; border-radius: 4px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .bill-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
            .logo-circle { width: 85px; height: 85px; background: #c25e17; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 38px; font-weight: 800; }
            .company-info { text-align: right; font-size: 13px; color: #64748b; line-height: 1.5; }
            .company-info h2 { font-size: 22px; font-weight: 700; color: #c25e17; margin: 0 0 6px 0; }
            
            .invoice-divider-container { display: flex; align-items: center; margin: 24px 0; }
            .invoice-divider-line { flex: 1; height: 1px; background: #e2e8f0; }
            .invoice-divider-text { padding: 0 16px; font-size: 18px; font-weight: 700; color: #c25e17; letter-spacing: 0.05em; text-transform: uppercase; }

            .invoice-grid-section { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 30px; }
            .invoice-left-side { width: 55%; display: flex; flex-direction: column; gap: 20px; }
            .invoice-right-side { width: 40%; }
            
            .address-block h4 { font-size: 14px; font-weight: 700; color: #64748b; margin: 0 0 6px 0; text-transform: uppercase; }
            .address-block p { font-size: 13px; color: #334155; margin: 0; line-height: 1.5; }
            .address-block .client-highlight-name { font-size: 16px; font-weight: 700; color: #c25e17; margin-bottom: 4px; }
            
            .meta-table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; font-size: 13px; }
            .meta-table td { padding: 8px 12px; border: 1px solid #e2e8f0; }
            .meta-table td.meta-label { background: #c25e17; color: white; font-weight: 600; width: 45%; }
            .meta-table td.meta-value { background: white; color: #475569; }

            .bill-table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px; }
            .bill-table th { background: #c25e17; color: white; padding: 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #c25e17; }
            .bill-table th:first-child { text-align: center; width: 5%; }
            .bill-table th:nth-child(2) { text-align: left; width: 50%; }
            .bill-table th:nth-child(3), .bill-table th:nth-child(4), .bill-table th:nth-child(5) { text-align: right; width: 15%; }
            
            .bill-table td { padding: 16px 12px; border: 1px solid #e2e8f0; color: #334155; vertical-align: top; }
            .bill-table td.cell-center { text-align: center; }
            .bill-table td.cell-right { text-align: right; }
            .bill-table tr:nth-child(even) td { background-color: #fafafa; }
            
            .item-title { font-weight: 700; color: #0f172a; margin-bottom: 4px; }
            .item-desc { font-size: 12px; color: #64748b; line-height: 1.4; }

            .invoice-bottom-section { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; gap: 30px; }
            .terms-section { width: 50%; font-size: 12px; line-height: 1.6; }
            .terms-section h5 { font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; }
            .terms-section p { color: #64748b; margin: 0 0 8px 0; }
            .thanks-msg { font-size: 13px; font-style: italic; color: #475569; margin-bottom: 20px; }

            .summary-section { width: 45%; }
            .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 13px; }
            .summary-table td { padding: 6px 12px; text-align: right; color: #475569; }
            .summary-table td:last-child { width: 40%; font-weight: 600; color: #0f172a; }
            .summary-table tr.total-row td { font-size: 16px; font-weight: 800; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            
            .balance-due-bar { background: #c25e17; color: white; display: flex; justify-content: space-between; padding: 12px 16px; font-size: 15px; font-weight: 700; border-radius: 2px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }

            .modal-actions-bar { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; border-top: 1px solid #f1f5f9; padding-top: 20px; }
            .btn-modal { padding: 12px 26px; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 13px; transition: all 0.2s; }
            .btn-modal-close { background-color: #f1f5f9; color: #475569; }
            .btn-modal-close:hover { background-color: #e2e8f0; color: #1e293b; }
            .btn-modal-download { background-color: #4f46e5; color: white; box-shadow: 0 4px 6px -1px rgb(79 70 229 / 0.2); }
            .btn-modal-download:hover { background-color: #4338ca; box-shadow: 0 6px 8px -1px rgb(79 70 229 / 0.3); }
            .btn-modal-pay { background-color: #10b981; color: white; box-shadow: 0 4px 6px -1px rgb(16 185 129 / 0.2); }
            .btn-modal-pay:hover:not(:disabled) { background-color: #059669; box-shadow: 0 6px 8px -1px rgb(16 185 129 / 0.3); }
            .btn-modal:disabled { opacity: 0.6; cursor: not-allowed; }
          ` }} />

          <div ref={billRef} className="bill-container">
            {/* Header */}
            <div className="bill-header">
              <div className="logo-circle">A</div>
              <div className="company-info">
                <h2>AIM Digitalise</h2>
                #139, 3rd Floor, Rajdanga Main Road,<br />
                Kolkata, West Bangal - 700107<br />
                GSTIN: 19ABCCA9672L1Z0<br />
                Email: support@aimdigitalise.com
              </div>
            </div>

            <div className="invoice-divider-container">
              <div className="invoice-divider-line"></div>
              <div className="invoice-divider-text">PROFORMA INVOICE</div>
              <div className="invoice-divider-line"></div>
            </div>

            <div className="invoice-grid-section">
              <div className="invoice-left-side">
                <div className="address-block">
                  <h4>Bill To</h4>
                  <div className="client-highlight-name">{billData.clientName}</div>
                  <p>
                    <strong>ID:</strong> {billData.clientId}<br />
                    <strong>School:</strong> {billData.schoolName || '-'}<br />
                    <strong>Service Recipient:</strong> <span className="capitalize">{billData.recipientType}</span>
                  </p>
                </div>
                <div className="address-block">
                  <h4>Ship To</h4>
                  <div className="client-highlight-name">{billData.schoolName || '-'}</div>
                  <p>
                    Noida, Uttar Pradesh, India
                  </p>
                </div>
              </div>

              <div className="invoice-right-side">
                <table className="meta-table">
                  <tbody>
                    <tr>
                      <td className="meta-label">Invoice#</td>
                      <td className="meta-value" style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#c25e17' }}>{billData.invoiceNumber}</td>
                    </tr>
                    <tr>
                      <td className="meta-label">Invoice Date</td>
                      <td className="meta-value">{billData.invoiceDate}</td>
                    </tr>
                    <tr>
                      <td className="meta-label">Terms</td>
                      <td className="meta-value">Due on Receipt</td>
                    </tr>
                    <tr>
                      <td className="meta-label">Due Date</td>
                      <td className="meta-value">{billData.invoiceDate}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <table className="bill-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item & Description</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Rate</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="cell-center">1</td>
                  <td>
                    <div className="item-title">🔌 Add-on: {billData.addonType}</div>
                    <div className="item-desc">Additional service activation and module deployment.</div>
                  </td>
                  <td className="cell-right">{parseFloat(billData.count).toFixed(2)}</td>
                  <td className="cell-right">{billData.rateFormatted}</td>
                  <td className="cell-right" style={{ fontWeight: 'bold' }}>{billData.subtotalFormatted}</td>
                </tr>
              </tbody>
            </table>

            <div className="invoice-bottom-section">
              <div className="terms-section">
                <div className="thanks-msg">Thanks for your business.</div>
                <h5>Terms & Conditions</h5>
                <p>All payments must be made in full before the activation of any services.</p>
                <p style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '8px' }}>This is a computer generated invoice and does not require a physical signature.</p>
              </div>

              <div className="summary-section">
                <table className="summary-table">
                  <tbody>
                    <tr>
                      <td>Sub Total</td>
                      <td>{billData.subtotalFormatted}</td>
                    </tr>
                    <tr>
                      <td>GST Tax ({billData.gstPercentage}%)</td>
                      <td>+{billData.gstAmountFormatted}</td>
                    </tr>
                    <tr className="total-row">
                      <td>Total</td>
                      <td>{billData.amountFormatted}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="balance-due-bar">
                  <span>Balance Due</span>
                  <span>{billData.amountFormatted}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions-bar">
            <button onClick={() => setShowBillModal(false)} className="btn-modal btn-modal-close">
              Close
            </button>
            <button onClick={downloadBill} className="btn-modal btn-modal-download">
              📥 Download Bill
            </button>
            <button
              onClick={handlePaymentSubmit}
              disabled={processingPayment}
              className="btn-modal btn-modal-pay"
            >
              {processingPayment ? 'Processing...' : '💳 Pay & Activate'}
            </button>
          </div>

        </div>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none animate-fade-in text-slate-700" style={{ fontFamily: "'Inter', sans-serif" }}>

      <ClientPageHeader title="Add-on Services" />

      {/* Info Warning */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4.5 text-xs font-semibold leading-relaxed shadow-sm">
        ℹ️ You are subscribed to <strong>{productName}</strong>. Use this portal to purchase and instantly activate verified add-on services, GPS transit modules, or custom staff & student smart ID card print packages.
      </div>

      {/* Toast Alert */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4.5 py-3 text-xs font-bold shadow-md">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4.5 py-3 text-xs font-bold shadow-md">
          ⚠️ {error}
        </div>
      )}

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Form / Checkout (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-5">
            <h2 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <span>💳</span> Add-on Checkout Form
            </h2>

            {/* 1. Add-on Type Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Select Service Module</label>
              <select
                value={selectedAddonType}
                onChange={(e) => setSelectedAddonType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-400 font-bold"
              >
                <option value="Transportation">🚌 Transportation Transit Services</option>
                <option value="Hostel">🏢 Hostel Dormitory Allocation</option>
                <option value="Previous Year Backup">💾 Previous Year Data Backup</option>
                <option value="Domain Services">🌐 Domain Services (Client Own Domain)</option>
                <option value="id card">🪪 Students & Teachers ID Card</option>
              </select>
            </div>

            {/* 2. Sub-options (ID Card Types) */}
            {selectedAddonType === 'id card' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Select ID Card Printing Type</label>
                <select
                  value={selectedIdCardType}
                  onChange={(e) => setSelectedIdCardType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-400 font-bold"
                >
                  <option value="Type A">Super PVC (20mm Multi-color ribbon, gloss finish) — ₹60 / card</option>
                  <option value="Type B">Regular PVC (16mm Single-color ribbon, thermal) — ₹42 / card</option>
                  <option value="Type C">Laminated PVC (Single-color ribbon, gum pasting) — ₹37 / card</option>
                </select>
              </div>
            )}

            {/* 3. Recipient Type Selection */}
            {['Transportation', 'Hostel', 'id card'].includes(selectedAddonType) && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {selectedAddonType === 'id card' ? '3. Card Recipients' : '2. Service Recipients'}
                </label>
                <div className="flex gap-2">
                  {[
                    { label: '👥 Students', value: 'student' },
                    { label: '👨‍🏫 Staff Members', value: 'teacher' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setSelectedRecipientType(item.value)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${selectedRecipientType === item.value
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Live Pricing Estimate Box */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Billing Preview</span>
              {loadingPreview ? (
                <div className="flex items-center justify-center py-6 gap-2 text-xs font-bold text-slate-500">
                  <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Requesting live estimate...
                </div>
              ) : addonPreview ? (
                <div className="space-y-2.5 text-xs font-sans text-slate-600 font-medium">
                  <div className="flex justify-between items-center">
                    <span>Base Unit Rate:</span>
                    <strong className="text-slate-800 font-mono">{addonPreview.rate_formatted || fmtCurrency(addonPreview.rate)}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Applicable Records Count:</span>
                    <strong className="text-slate-800 font-mono">
                      {addonPreview.student_count !== null
                        ? `${addonPreview.student_count} students`
                        : (addonPreview.teacher_count !== null ? `${addonPreview.teacher_count} staff` : '1 flat')}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Subtotal:</span>
                    <strong className="text-slate-800 font-mono">{addonPreview.subtotal_formatted || fmtCurrency(addonPreview.subtotal)}</strong>
                  </div>
                  <div className="flex justify-between items-center text-amber-700">
                    <span>GST ({addonPreview.gst_percentage || 18}%):</span>
                    <strong className="font-mono">+{addonPreview.gst_amount_formatted || fmtCurrency(addonPreview.gst_amount)}</strong>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-2.5 text-sm font-black text-slate-800">
                    <span className="text-emerald-700">Grand Total Due:</span>
                    <span className="text-emerald-700 font-mono">{addonPreview.amount_formatted || fmtCurrency(addonPreview.amount)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-[10px] italic text-slate-400">
                  Fill selection options to view calculations.
                </div>
              )}
            </div>

            {/* Pay Button */}
            <button
              onClick={reviewAddonPayment}
              disabled={processingPayment || !addonPreview || loadingPreview}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg"
            >
              {processingPayment ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing checkout payment...
                </>
              ) : (
                <>💳 Pay & Activate Service</>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Catalog List (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-4">
            <h2 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <span>📋</span> Service Catalog Descriptions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">🚌 Transportation Transit</span>
                  <span className="text-[9px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">Transit</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-sans font-medium">GPS-enabled transportation logging, route tracking, dynamic SMS alerts, and fee management integrations.</p>
              </div>

              <div className="p-3.5 bg-violet-50/50 border border-violet-100 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">🏢 Hostel allocation</span>
                  <span className="text-[9px] font-black text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full border border-violet-200">Hostel</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-sans font-medium">Dormitory allocation manager, mess billing integration, warden controls, and entry logs tracking software.</p>
              </div>

              <div className="p-3.5 bg-orange-50/50 border border-orange-100 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">🌐 Domain Services</span>
                  <span className="text-[9px] font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">Domain</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-sans font-medium">Client's own live domain integration on website & Software. Secure SSL connection setup included.</p>
              </div>

              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">💾 Previous Year Backup</span>
                  <span className="text-[9px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">Archives</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-sans font-medium">Secure archival backup database hosting. Retrieve historical student records, attendance, and audit logs.</p>
              </div>

              <div className="col-span-1 md:col-span-2 p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">🪪 Students & Teachers Smart ID Cards</span>
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">ID Cards</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 text-[10px] text-slate-500 leading-relaxed font-sans font-medium">
                  <div className="border border-emerald-100/60 p-2 rounded-xl bg-white">
                    <span className="font-black text-slate-700 block">Type A (Super PVC)</span>
                    20mm Ribbon, PVC Super Card, Card Holder & clip. gloss finish.
                  </div>
                  <div className="border border-emerald-100/60 p-2 rounded-xl bg-white">
                    <span className="font-black text-slate-700 block">Type B (Regular PVC)</span>
                    16mm Ribbon, PVC Regular Card, Card Holder & clip. thermal print.
                  </div>
                  <div className="border border-emerald-100/60 p-2 rounded-xl bg-white">
                    <span className="font-black text-slate-700 block">Type C (Laminated)</span>
                    Single color Ribbon, Gum Pasting Laminated card with Holder & clip.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ─── ADD-ON PAYMENT HISTORY ────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 mt-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
          <span className="text-lg">🧾</span>
          <h2 className="text-base font-black text-slate-800">Add-on Services Billing History</h2>
          {loadingHistory && <span className="text-xs text-slate-400 font-bold ml-2">Refreshing...</span>}
        </div>

        {loadingHistory && addonHistory.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs font-bold">
            ⏳ Loading billing records...
          </div>
        ) : addonHistory.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium italic">
            📭 No add-on service transactions recorded for your organization yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-black uppercase tracking-wider text-[9px] bg-slate-50">
                  <th className="px-4 py-2.5">Add-on Type</th>
                  <th className="px-4 py-2.5 text-center">Unit Count</th>
                  <th className="px-4 py-2.5">Billing Period</th>
                  <th className="px-4 py-2.5 text-right">Subtotal</th>
                  <th className="px-4 py-2.5 text-right">GST</th>
                  <th className="px-4 py-2.5 text-right">Paid Amount</th>
                  <th className="px-4 py-2.5">Date Paid</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {addonHistory.map((p, idx) => {
                  const col = addonColor(p.addon_type)
                  return (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black border ${col.bg} ${col.text} ${col.border}`}>
                          <span>{col.icon}</span>
                          {p.addon_type}
                        </span>
                        {p.recipient_type && (
                          <span className={`ml-2 inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold ${p.recipient_type === 'teacher' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>{p.recipient_type === 'teacher' ? '👨‍🏫 Staff' : '👥 Students'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center font-black text-blue-600 font-mono">
                        {p.recipient_type === 'teacher'
                          ? p.teacher_count || p.student_count || '—'
                          : p.student_count || '—'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-[10px]">
                        <span className="font-semibold text-slate-700 font-mono">{p.start_date_formatted || '—'}</span>
                        <span className="text-slate-300 mx-1">→</span>
                        <span className="font-semibold text-slate-700 font-mono">{p.end_date_formatted || '—'}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-500 font-semibold font-mono">
                        {p.subtotal_formatted || fmtCurrency(p.subtotal)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-amber-600 font-semibold font-mono">
                        +{p.gst_amount_formatted || fmtCurrency(p.gst_amount)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-emerald-600 font-mono">
                        {p.amount_formatted || fmtCurrency(p.amount)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 font-semibold font-mono">
                        {p.payment_date_formatted || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                          ✓ Paid
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add-on Bill Modal Overlay */}
      <BillModal />
    </div>
  )
}

export default ClientAddonServices
