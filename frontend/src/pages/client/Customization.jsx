import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClientAuthStore } from '../../store/clientAuthStore'
import {
  getClientCustomizationRequests,
  submitClientCustomizationRequest,
  getClientPendingCustomizationPayments,
  getClientCustomPaymentHistory,
  createCustomizationPaymentOrder,
  verifyCustomizationPayment
} from '../../api/clientPortal'
import ClientPageHeader from '../../components/client/ClientPageHeader'

const ClientCustomization = () => {
  const { profileData, clientToken, isClientAuthenticated } = useClientAuthStore()

  // Customization Form States
  const [customType, setCustomType] = useState('')
  const [customDesc, setCustomDesc] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // General UI States
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [subTab, setSubTab] = useState('requests') // 'requests' | 'pending' | 'history'

  // Data List States
  const [customRequests, setCustomRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  const [pendingCustomPayments, setPendingCustomPayments] = useState([])
  const [loadingPendingPayments, setLoadingPendingPayments] = useState(false)
  const [selectedRequestIds, setSelectedRequestIds] = useState([])

  const [customPaymentHistory, setCustomPaymentHistory] = useState([])
  const [loadingCustomPaymentHistory, setLoadingCustomPaymentHistory] = useState(false)

  const [processingCustomPayment, setProcessingCustomPayment] = useState(false)

  // Pagination States
  const [requestsPage, setRequestsPage] = useState(1)
  const [pendingPage, setPendingPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const itemsPerPage = 5

  // Invoice / Bill States
  const [showBillModal, setShowBillModal] = useState(false)
  const [billData, setBillData] = useState(null)
  const billRef = useRef(null)

  // Reset page and selection indices when tab changes
  useEffect(() => {
    setRequestsPage(1)
    setPendingPage(1)
    setHistoryPage(1)
    setSelectedRequestIds([])
  }, [subTab])

  // Fetch submitted customization requests
  const fetchRequests = async () => {
    if (!isClientAuthenticated || !clientToken) return
    setLoadingRequests(true)
    setErrorMsg('')
    try {
      const res = await getClientCustomizationRequests(clientToken)
      if (res.success) {
        const processedRequests = (res.data?.requests || []).map(req => {
          let amountValue = null
          if (req.amount) {
            amountValue = typeof req.amount === 'string' ? parseFloat(req.amount) : req.amount
          } else if (req.amount_value) {
            amountValue = typeof req.amount_value === 'string' ? parseFloat(req.amount_value) : req.amount_value
          }

          return {
            ...req,
            amount: amountValue,
            amount_value: amountValue,
            amount_formatted: amountValue ? `₹ ${amountValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null,
          }
        })
        setCustomRequests(processedRequests)
      } else {
        setErrorMsg(res.message || 'Failed to load customization requests.')
      }
    } catch (err) {
      console.error('Failed to load customizations:', err)
      setErrorMsg('Failed to load customization requests.')
    } finally {
      setLoadingRequests(false)
    }
  }

  // Fetch pending quotes/payments
  const fetchPendingPayments = async () => {
    if (!isClientAuthenticated || !clientToken) return
    setLoadingPendingPayments(true)
    try {
      const res = await getClientPendingCustomizationPayments(clientToken)
      if (res.success) {
        setPendingCustomPayments(res.data.pending_requests || [])
      }
    } catch (err) {
      console.error('Failed to fetch pending customization payments:', err)
    } finally {
      setLoadingPendingPayments(false)
    }
  }

  // Fetch custom payment history
  const fetchPaymentHistory = async () => {
    if (!isClientAuthenticated || !clientToken) return
    setLoadingCustomPaymentHistory(true)
    try {
      const res = await getClientCustomPaymentHistory(clientToken)
      if (res.success) {
        setCustomPaymentHistory(res.data.payments || [])
      }
    } catch (err) {
      console.error('Failed to fetch customization payment history:', err)
    } finally {
      setLoadingCustomPaymentHistory(false)
    }
  }

  // Initial Data Fetch
  useEffect(() => {
    if (clientToken && isClientAuthenticated) {
      fetchRequests()
      fetchPendingPayments()
      fetchPaymentHistory()
    }
  }, [clientToken, isClientAuthenticated])

  // Submit new customization ticket
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customDesc.trim() || customDesc.length < 10) {
      setErrorMsg('Please enter at least 10 characters describing your customization needs.')
      return
    }

    setIsSubmitting(true)
    setSuccessMsg('')
    setErrorMsg('')

    // Combine fields into customization_text
    const combinedText = `[${customType}] (Target Rollout: ${targetDate})\n\n${customDesc}`

    try {
      const res = await submitClientCustomizationRequest(combinedText, clientToken)
      if (res.success) {
        setSuccessMsg('Your customization request has been successfully recorded. Our representative will contact you shortly.')
        setCustomType('')
        setCustomDesc('')
        setTargetDate('')
        await fetchRequests()
        setTimeout(() => setSuccessMsg(''), 6000)
      } else {
        setErrorMsg(res.message || 'Failed to submit customization request.')
      }
    } catch (err) {
      console.error('Failed to submit customization:', err)
      setErrorMsg('Failed to submit request: ' + (err?.response?.data?.message || err.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper parsers
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

  const formatDateValue = (val) => {
    if (!val) return '—'
    try {
      const d = new Date(val)
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      }
    } catch (e) {
      console.error(e)
    }
    return val || '—'
  }

  const getStatusDetails = (status) => {
    const details = {
      'pending': { text: 'Under Review', className: 'bg-amber-50 text-amber-600 border border-amber-100' },
      'amount_set': { text: 'Quote Set', className: 'bg-blue-50 text-blue-600 border border-blue-100' },
      'approved': { text: 'Approved', className: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
      'rejected': { text: 'Rejected', className: 'bg-rose-50 text-rose-600 border border-rose-100' }
    }
    return details[status?.toLowerCase()] || { text: status || 'Under Review', className: 'bg-amber-50 text-amber-600 border border-amber-100' }
  }

  // Razorpay Scripts Loader
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

  // Customization Bill Generator for Single or Bulk items
  const generateCustomizationBill = (paymentsArray) => {
    const payments = Array.isArray(paymentsArray) ? paymentsArray : [paymentsArray]
    const baseAmount = payments.reduce((sum, p) => sum + (parseFloat(p.amount || p.base_amount || p.cost || 0) || 0), 0)
    const gstPercentage = 18
    const gstAmount = (baseAmount * gstPercentage) / 100
    const totalWithGST = baseAmount + gstAmount

    const today = new Date()
    const invoiceDate = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const invoiceNumber = `CUST-INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const bill = {
      invoiceNumber,
      invoiceDate,
      clientName: profileData?.company_name || profileData?.school_name || profileData?.organization || 'Academic Institute',
      clientId: profileData?.client_id || profileData?.client_unique_id || 'AIM6590550',
      requestId: payments.length === 1 ? payments[0].id : 'CONSOLIDATED',
      customizationText: payments.length === 1 
        ? (payments[0].customization_text || payments[0].full_text || '') 
        : `Consolidated payment for ${payments.length} customization requests.`,
      baseAmount,
      gstPercentage,
      gstAmount,
      totalWithGST,
      status: 'Pending',
      billType: 'customization',
      customizations: payments,
      isBulk: payments.length > 1
    }

    setBillData(bill)
    setShowBillModal(true)
  }

  // Process checkout order
  const processCustomizationPayment = async (requestId, amount) => {
    setProcessingCustomPayment(true)
    setErrorMsg('')

    try {
      const orderRes = await createCustomizationPaymentOrder(
        requestId === 'CONSOLIDATED' ? null : requestId,
        clientToken,
        amount
      )
      if (!orderRes.success) {
        setErrorMsg(orderRes.message || 'Failed to create payment order.')
        setProcessingCustomPayment(false)
        return
      }

      const billAmount = billData?.totalWithGST || orderRes.amount

      if (orderRes.simulated) {
        const confirmPayment = window.confirm(
          `SIMULATION MODE\n\nAmount: ₹${billAmount.toFixed(2)}\nCustomization Request ID: ${requestId}\n\nClick OK to simulate payment`
        )
        if (confirmPayment) {
          const verifyRes = await verifyCustomizationPayment({
            order_id: orderRes.order_id,
            razorpay_payment_id: 'sim_pay_' + Date.now(),
            razorpay_order_id: orderRes.order_id,
            razorpay_signature: 'sim_signature_' + Date.now(),
            customization_request_id: requestId !== 'CONSOLIDATED' ? requestId : null,
            amount: billAmount
          }, clientToken)

          if (verifyRes.success) {
            setSuccessMsg(`✅ ${verifyRes.message || 'Customization payment successful!'}`)
            setShowBillModal(false)
            setSelectedRequestIds([]) // Clear selection checkboxes
            await Promise.all([
              fetchRequests(),
              fetchPendingPayments(),
              fetchPaymentHistory()
            ])
            setSubTab('history')
            setTimeout(() => setSuccessMsg(''), 6000)
          } else {
            setErrorMsg(verifyRes.message || 'Payment verification failed.')
          }
        }
        setProcessingCustomPayment(false)
        return
      }

      await loadRazorpayScript()

      const options = {
        key: orderRes.key,
        amount: Math.round(billAmount * 100),
        currency: orderRes.currency || 'INR',
        name: 'AIM Digitalise',
        description: requestId === 'CONSOLIDATED' 
          ? `Consolidated Payment - ${billData.customizations?.length} requests` 
          : `Customization Payment - Request #${requestId}`,
        order_id: orderRes.order_id,
        handler: async (response) => {
          setSuccessMsg('Verifying customization payment...')
          try {
            const verifyRes = await verifyCustomizationPayment({
              order_id: orderRes.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              customization_request_id: requestId !== 'CONSOLIDATED' ? requestId : null,
              amount: billAmount
            }, clientToken)

            if (verifyRes.success) {
              setSuccessMsg('✅ Customization payment successful!')
              setShowBillModal(false)
              setSelectedRequestIds([]) // Clear selection checkboxes
              await Promise.all([
                fetchRequests(),
                fetchPendingPayments(),
                fetchPaymentHistory()
              ])
              setSubTab('history')
              setTimeout(() => setSuccessMsg(''), 6000)
            } else {
              setErrorMsg(verifyRes.message || 'Payment verification failed.')
            }
          } catch (err) {
            console.error('Customization payment verify error:', err)
            setErrorMsg('Payment verification failed: ' + err.message)
          } finally {
            setProcessingCustomPayment(false)
          }
        },
        modal: {
          ondismiss: () => {
            setErrorMsg('Payment cancelled')
            setProcessingCustomPayment(false)
          }
        },
        prefill: {
          name: profileData?.client_name || '',
          email: profileData?.email || '',
        },
        theme: {
          color: '#1a3c5e'
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', (response) => {
        console.error('Customization payment checkout fail:', response)
        setErrorMsg('Payment checkout failed: ' + (response.error?.description || 'Transaction error'))
        setProcessingCustomPayment(false)
      })

      razorpay.open()
    } catch (err) {
      console.error('Customization payment error:', err)
      setErrorMsg('Checkout failed: ' + (err?.response?.data?.message || err.message))
      setProcessingCustomPayment(false)
    }
  }

  // Invoice downloader
  const downloadBill = () => {
    if (!billRef.current) return
    const content = billRef.current.innerHTML
    const style = `
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b; }
        .bill-container { max-width: 1000px; margin: 0 auto; padding: 40px; background: white; border: 1px solid #e2e8f0; border-radius: 4px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
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

        .cust-description-box { font-size: 13px; color: #334155; margin-top: 8px; padding: 12px 16px; background: #f1f5f9; border-radius: 8px; font-weight: 400; line-height: 1.5; border-left: 4px solid #c25e17; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; white-space: pre-wrap; }

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
        .bill-footer { text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; font-weight: 500; }
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

  // Customization Invoice Bill Modal Overlay
  const BillModal = () => {
    if (!showBillModal || !billData) return null

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '20px',
        overflow: 'auto'
      }} onClick={() => setShowBillModal(false)}>
        <style dangerouslySetInnerHTML={{
          __html: `
          .bill-container { max-width: 1000px; margin: 0 auto; padding: 40px; background: white; border: 1px solid #e2e8f0; border-radius: 4px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
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
          .cust-description-box { font-size: 13px; color: #334155; margin-top: 8px; padding: 12px 16px; background: #f8fafc; border: 1px dashed #c25e17; border-radius: 4px; font-weight: 400; line-height: 1.5; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; white-space: pre-wrap; }
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
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          maxWidth: '1050px',
          width: '100%',
          maxHeight: '92vh',
          overflow: 'auto',
          padding: '40px',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }} onClick={(e) => e.stopPropagation()}>

          {/* Bill Content */}
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
                    <strong>Request ID:</strong> #{billData.requestId}
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

            <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '4px', border: '1px dashed #c25e17', fontSize: '13px' }}>
              <strong style={{ color: '#c25e17', display: 'block', marginBottom: '6px' }}>Customization Description:</strong>
              <p className="cust-description-box" style={{ margin: 0, border: 'none', padding: 0 }}>
                {billData.customizationText}
              </p>
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
                {billData.customizations && billData.customizations.length > 0 ? (
                  billData.customizations.map((cust, idx) => {
                    const parsed = parseCustomizationText(cust.customization_text || cust.full_text)
                    const costVal = parseFloat(cust.amount || cust.base_amount || cust.cost || 0)
                    return (
                      <tr key={cust.id}>
                        <td className="cell-center">{idx + 1}</td>
                        <td>
                          <div className="item-title">🎨 Customization Request #{cust.id}</div>
                          <div className="item-desc font-sans font-medium text-slate-500" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {parsed.title} - {parsed.description}
                          </div>
                          {cust.admin_notes && (
                            <div style={{ fontSize: '11px', color: '#b45309', marginTop: '4px', fontWeight: 'bold' }}>
                              Note: {cust.admin_notes}
                            </div>
                          )}
                        </td>
                        <td className="cell-right">1.00</td>
                        <td className="cell-right">₹{costVal.toFixed(2)}</td>
                        <td className="cell-right" style={{ fontWeight: 'bold' }}>₹{costVal.toFixed(2)}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td className="cell-center">1</td>
                    <td>
                      <div className="item-title">🎨 Customization Service</div>
                      <div className="item-desc">Custom software modifications and code rollout as requested.</div>
                    </td>
                    <td className="cell-right">1.00</td>
                    <td className="cell-right">₹{billData.baseAmount.toFixed(2)}</td>
                    <td className="cell-right" style={{ fontWeight: 'bold' }}>₹{billData.baseAmount.toFixed(2)}</td>
                  </tr>
                )}
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
                      <td>₹{billData.baseAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>GST Tax ({billData.gstPercentage}%)</td>
                      <td>+₹{billData.gstAmount.toFixed(2)}</td>
                    </tr>
                    <tr className="total-row">
                      <td>Total</td>
                      <td>₹{billData.totalWithGST.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="balance-due-bar">
                  <span>Balance Due</span>
                  <span>₹{billData.totalWithGST.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Buttons */}
          <div className="modal-actions-bar">
            <button onClick={() => setShowBillModal(false)} className="btn-modal btn-modal-close">
              Close
            </button>
            <button onClick={downloadBill} className="btn-modal btn-modal-download">
              📥 Download Bill
            </button>
            <button
              onClick={() => processCustomizationPayment(billData.requestId, billData.totalWithGST)}
              disabled={processingCustomPayment}
              className="btn-modal btn-modal-pay"
            >
              {processingCustomPayment ? 'Processing...' : '💳 Pay Now'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const schoolName = profileData?.company_name || profileData?.school_name || profileData?.organization || 'Academic Institute'

  // Calculate selected items total
  const selectedItemsTotal = pendingCustomPayments
    .filter(p => selectedRequestIds.includes(p.id))
    .reduce((sum, p) => sum + (parseFloat(p.amount || p.base_amount || p.cost || 0) || 0), 0)

  // Paginated Slices
  const paginatedRequests = customRequests.slice((requestsPage - 1) * itemsPerPage, requestsPage * itemsPerPage)
  const paginatedPending = pendingCustomPayments.slice((pendingPage - 1) * itemsPerPage, pendingPage * itemsPerPage)
  const paginatedHistory = customPaymentHistory.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage)

  // Standard Pagination Component
  const PaginationControls = ({ currentPage, totalItems, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    if (totalItems === 0) return null

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100 text-[10.5px] font-bold text-slate-500">
        <div>
          Showing <span className="font-mono text-slate-800">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to{' '}
          <span className="font-mono text-slate-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
          <span className="font-mono text-slate-800">{totalItems}</span> requests
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-all text-[10px] border-none shadow-sm"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 rounded-lg font-mono transition-all border cursor-pointer text-[10px] ${
                  currentPage === pageNum
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-all text-[10px] border-none shadow-sm"
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 select-none animate-fade-in text-slate-700 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>

      <ClientPageHeader title="Customizations" />

      {successMsg && (
        <div className="p-4 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-600 animate-fade-in">
          ✅ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl text-xs font-bold bg-rose-50 border border-rose-200 text-rose-600 animate-fade-in">
          ❌ {errorMsg}
        </div>
      )}

      {/* Customization Invoice Bill Modal Overlay */}
      <BillModal />

      {/* Main Grid: Request form + Sub-Tabbed Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Request Form (Col Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-md border border-slate-100 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Request Custom Upgrade</h3>
            <p className="text-[11px] text-slate-400">Request special website, features, or software additions.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1.5">
              <label className="text-slate-500 uppercase tracking-wide">Customization Title</label>
              <input
                type="text"
                required
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="e.g. Dedicated iOS App, Custom Domain Integration"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-500 uppercase tracking-wide">Expected Rollout Date</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-500 uppercase tracking-wide">Detailed Description</label>
              <textarea
                required
                rows="4"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="Please describe your requirements, layout preferences, and workflow updates..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black rounded-xl shadow-md transition-colors active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border-none"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </form>
        </div>

        {/* Tabbed Overview Container (Col Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
          {/* Header with Sub-Tabs */}
          <div className="bg-slate-800 text-white font-black px-6 py-3.5 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span>⚙️</span> Customization Overview
            </div>

            <div className="flex bg-slate-700/60 p-0.5 rounded-lg text-[10px] font-bold self-start sm:self-auto">
              <button
                onClick={() => setSubTab('requests')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${subTab === 'requests' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                Requests
              </button>
              <button
                onClick={() => setSubTab('pending')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer relative ${subTab === 'pending' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                Pending Payments
                {pendingCustomPayments.length > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black animate-pulse">
                    {pendingCustomPayments.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setSubTab('history')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${subTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                Payment History
              </button>
            </div>
          </div>

          {/* Sub-Tab 1: Requests List */}
          {subTab === 'requests' && (
            <div className="overflow-x-auto">
              {loadingRequests && (
                <div className="flex justify-center items-center py-20 bg-slate-50/10">
                  <svg className="w-5 h-5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              )}
              
              {!loadingRequests && customRequests.length > 0 && (
                <>
                  <table className="w-full text-left border-collapse text-[11px] font-semibold">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="px-5 py-4">S.No.</th>
                        <th className="px-5 py-4">Submitted</th>
                        <th className="px-5 py-4">Requested Service</th>
                        <th className="px-5 py-4">Quote Cost</th>
                        <th className="px-5 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {paginatedRequests.map((req, idx) => {
                        const parsed = parseCustomizationText(req.customization_text)
                        const statusObj = getStatusDetails(req.status)
                        const displayCost = req.amount_formatted || (req.cost ? `₹ ${req.cost}` : 'Pending Quote')

                        return (
                          <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4 font-mono font-bold text-slate-500">{(requestsPage - 1) * itemsPerPage + idx + 1}</td>
                            <td className="px-5 py-4 font-sans text-slate-400">
                               {formatDateValue(req.submitted_at || req.created_at || req.date)}
                            </td>
                            <td className="px-5 py-4 max-w-[180px]">
                              <div className="font-bold text-slate-800 truncate">{parsed.title}</div>
                              <div className="text-[10px] text-slate-400 line-clamp-1 font-sans">{parsed.description}</div>
                            </td>
                            <td className="px-5 py-4 font-mono text-slate-600">{displayCost}</td>
                            <td className="px-5 py-4 text-center">
                              {(() => {
                                const s = req.status?.toLowerCase()
                                const inHistory = customPaymentHistory.some(p => 
                                  Number(p.customization_request_id) === Number(req.id) ||
                                  Number(p.request_id) === Number(req.id) ||
                                  Number(p.customization_id) === Number(req.id) ||
                                  (p.customization_text && req.customization_text && p.customization_text === req.customization_text)
                                )
                                const isPaid = (s === 'success' || s === 'paid') || inHistory

                                if (isPaid) {
                                  return (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                                      PAID
                                    </span>
                                  )
                                }
                                if (s === 'amount_set' || s === 'approved') {
                                  return (
                                    <button
                                      onClick={() => {
                                        setSubTab('pending')
                                        setSelectedRequestIds([req.id])
                                      }}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500 hover:bg-rose-600 text-white cursor-pointer transition-all active:scale-95 shadow-sm shadow-rose-100 border-none"
                                    >
                                      ⚡ Pay Now
                                    </button>
                                  )
                                }
                                return (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusObj.className}`}>
                                    {statusObj.text}
                                  </span>
                                )
                              })()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <PaginationControls
                    currentPage={requestsPage}
                    totalItems={customRequests.length}
                    onPageChange={setRequestsPage}
                  />
                </>
              )}

              {!loadingRequests && customRequests.length === 0 && (
                <div className="text-center py-20 text-slate-400 bg-slate-50/30">
                  <span className="text-3xl block">⚙️</span>
                  <p className="font-bold mt-2 text-xs">No customizations requested yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 2: Pending Custom Payments */}
          {subTab === 'pending' && (
            <div>
              {pendingCustomPayments.length > 0 && (
                <div className="px-6 py-4.5 bg-[#f8fafc] border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Checkout Actions</span>
                    <p className="text-[11px] font-semibold text-slate-600">
                      {selectedRequestIds.length > 0 ? (
                        <>Selected <strong className="text-indigo-600 font-mono text-xs">{selectedRequestIds.length}</strong> items to buy</>
                      ) : (
                        <>Select requests below to check out in bulk</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const selectedItems = pendingCustomPayments.filter(p => selectedRequestIds.includes(p.id))
                        if (selectedItems.length > 0) {
                          generateCustomizationBill(selectedItems)
                        } else {
                          setErrorMsg('Please select at least one request to pay.')
                          setTimeout(() => setErrorMsg(''), 4000)
                        }
                      }}
                      disabled={selectedRequestIds.length === 0}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white disabled:text-slate-400 font-bold text-[10.5px] rounded-xl cursor-pointer disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5 border-none"
                    >
                      💳 Pay Selected ({selectedRequestIds.length > 0 ? `₹${selectedItemsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'})
                    </button>
                    <button
                      onClick={() => {
                        generateCustomizationBill(pendingCustomPayments)
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5 border-none"
                    >
                      💳 Pay All Pending ({`₹${pendingCustomPayments.reduce((sum, p) => sum + (parseFloat(p.amount || p.base_amount || p.cost || 0) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`})
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                {loadingPendingPayments && (
                  <div className="flex justify-center items-center py-20 bg-slate-50/10">
                    <svg className="w-5 h-5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  </div>
                )}
                
                {!loadingPendingPayments && pendingCustomPayments.length > 0 && (
                  <>
                    <table className="w-full text-left border-collapse text-[11px] font-semibold">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="px-5 py-4 text-center w-10">
                            <input
                              type="checkbox"
                              checked={selectedRequestIds.length === pendingCustomPayments.length && pendingCustomPayments.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRequestIds(pendingCustomPayments.map(p => p.id))
                                } else {
                                  setSelectedRequestIds([])
                                }
                              }}
                              className="w-4 h-4 cursor-pointer accent-indigo-600 rounded"
                            />
                          </th>
                          <th className="px-5 py-4">S.No.</th>
                          <th className="px-5 py-4">Title / Description</th>
                          <th className="px-5 py-4">Quote Rate</th>
                          <th className="px-5 py-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {paginatedPending.map((payment, idx) => {
                          const parsed = parseCustomizationText(payment.customization_text)
                          const amountVal = payment.amount || payment.base_amount || payment.cost || 0
                          return (
                            <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedRequestIds.includes(payment.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRequestIds(prev => [...prev, payment.id])
                                    } else {
                                      setSelectedRequestIds(prev => prev.filter(id => id !== payment.id))
                                    }
                                  }}
                                  className="w-4 h-4 cursor-pointer accent-indigo-600 rounded"
                                />
                              </td>
                              <td className="px-5 py-4 font-mono font-bold text-slate-500">{(pendingPage - 1) * itemsPerPage + idx + 1}</td>
                              <td className="px-5 py-4 max-w-[200px]">
                                <div className="font-bold text-slate-800 truncate">{parsed.title}</div>
                                <div className="text-[10px] text-slate-400 line-clamp-1 font-sans">{parsed.description}</div>
                              </td>
                              <td className="px-5 py-4 font-mono text-slate-800 font-bold">
                                ₹{Number(amountVal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <button
                                  onClick={() => generateCustomizationBill(payment)}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg cursor-pointer transition-colors active:scale-95 text-[10px] border-none"
                                >
                                  💳 Review & Pay
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    <PaginationControls
                      currentPage={pendingPage}
                      totalItems={pendingCustomPayments.length}
                      onPageChange={setPendingPage}
                    />
                  </>
                )}
                
                {!loadingPendingPayments && pendingCustomPayments.length === 0 && (
                  <div className="text-center py-20 text-slate-400 bg-slate-50/30">
                    <span className="text-3xl block">💳</span>
                    <p className="font-bold mt-2 text-xs">No pending customization payments.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Completed Custom Payments History */}
          {subTab === 'history' && (
            <div className="overflow-x-auto">
              {loadingCustomPaymentHistory && (
                <div className="flex justify-center items-center py-20 bg-slate-50/10">
                  <svg className="w-5 h-5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              )}
              
              {!loadingCustomPaymentHistory && customPaymentHistory.length > 0 && (
                <>
                  <table className="w-full text-left border-collapse text-[11px] font-semibold">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="px-5 py-4">Payment ID</th>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-5 py-4">Description</th>
                        <th className="px-5 py-4 text-right">Amount</th>
                        <th className="px-5 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {paginatedHistory.map((payment) => {
                        const parsed = parseCustomizationText(payment.customization_text)
                        return (
                          <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4 font-mono font-bold text-slate-500 truncate max-w-[120px]">
                              {payment.razorpay_payment_id || `pay_mock_${payment.id}`}
                            </td>
                            <td className="px-5 py-4 font-sans text-slate-400">
                               {formatDateValue(payment.payment_date || payment.created_at || payment.submitted_at || payment.date)}
                            </td>
                            <td className="px-5 py-4 max-w-[150px]">
                              <div className="font-bold text-slate-800 truncate">{parsed.title}</div>
                            </td>
                            <td className="px-5 py-4 font-mono text-slate-800 font-bold text-right">
                              ₹{Number(payment.amount || payment.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                                {payment.status || 'success'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <PaginationControls
                    currentPage={historyPage}
                    totalItems={customPaymentHistory.length}
                    onPageChange={setHistoryPage}
                  />
                </>
              )}
              
              {!loadingCustomPaymentHistory && customPaymentHistory.length === 0 && (
                <div className="text-center py-20 text-slate-400 bg-slate-50/30">
                  <span className="text-3xl block">📋</span>
                  <p className="font-bold mt-2 text-xs">No customization payments found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClientCustomization
