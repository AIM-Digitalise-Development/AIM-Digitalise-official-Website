import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
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

  const [customPaymentHistory, setCustomPaymentHistory] = useState([])
  const [loadingCustomPaymentHistory, setLoadingCustomPaymentHistory] = useState(false)

  const [processingCustomPayment, setProcessingCustomPayment] = useState(false)

  // Invoice / Bill States
  const [showBillModal, setShowBillModal] = useState(false)
  const [billData, setBillData] = useState(null)
  const billRef = useRef(null)

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

  // Customization Bill Generator
  const generateCustomizationBill = (payment) => {
    const baseAmount = payment.amount || payment.base_amount || (payment.total_amount ? payment.total_amount / 1.18 : 0)
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
      clientId: profileData?.client_id || '',
      requestId: payment.id,
      customizationText: payment.customization_text || payment.full_text || '',
      baseAmount,
      gstPercentage,
      gstAmount,
      totalWithGST,
      status: 'Pending',
      billType: 'customization',
      payment
    }

    setBillData(bill)
    setShowBillModal(true)
  }

  // Process checkout order
  const processCustomizationPayment = async (requestId, amount) => {
    setProcessingCustomPayment(true)
    setErrorMsg('')

    try {
      const orderRes = await createCustomizationPaymentOrder(requestId, clientToken)
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
            customization_request_id: requestId,
            payment_record_id: orderRes.payment_record_id,
            amount: billAmount
          }, clientToken)

          if (verifyRes.success) {
            setSuccessMsg(`✅ ${verifyRes.message || 'Customization payment successful!'}`)
            setShowBillModal(false)
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
        description: `Customization Payment - Request #${requestId}`,
        order_id: orderRes.order_id,
        handler: async (response) => {
          setSuccessMsg('Verifying customization payment...')
          try {
            const verifyRes = await verifyCustomizationPayment({
              order_id: orderRes.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              customization_request_id: requestId,
              payment_record_id: orderRes.payment_record_id,
              amount: billAmount
            }, clientToken)

            if (verifyRes.success) {
              setSuccessMsg('✅ Customization payment successful!')
              setShowBillModal(false)
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
        body { font-family: Arial, sans-serif; }
        .bill-container { max-width: 800px; margin: 0 auto; padding: 30px; background: white; }
        .bill-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .bill-title { font-size: 24px; font-weight: bold; color: #1e293b; }
        .bill-subtitle { color: #64748b; font-size: 14px; }
        .bill-info { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; }
        .bill-info-item { font-size: 14px; }
        .bill-info-item strong { color: #1e293b; }
        .bill-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .bill-table th { background: #1e293b; color: white; padding: 12px; text-align: left; font-size: 14px; }
        .bill-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .bill-total { text-align: right; padding: 20px; background: #f8fafc; border-radius: 8px; margin-top: 20px; }
        .bill-total-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .bill-total-grand { font-size: 20px; font-weight: bold; color: #3b82f6; border-top: 2px solid #333; padding-top: 12px; margin-top: 8px; }
        .bill-footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
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
          
          {/* Bill Content */}
          <div ref={billRef} className="bill-container">
            {/* Header */}
            <div className="bill-header">
              <div className="bill-title">🎓 AIM Digitalise</div>
              <div className="bill-subtitle">Customization Invoice</div>
            </div>
            
            {/* Invoice Info */}
            <div className="bill-info">
              <div className="bill-info-item">
                <strong>Invoice #:</strong> {billData.invoiceNumber}
              </div>
              <div className="bill-info-item">
                <strong>Date:</strong> {billData.invoiceDate}
              </div>
              <div className="bill-info-item">
                <strong>Status:</strong> <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Pending</span>
              </div>
            </div>
            
            {/* Client Info */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                <div><strong>Client:</strong> {billData.clientName}</div>
                <div><strong>Client ID:</strong> {billData.clientId}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Request ID:</strong> #{billData.requestId}</div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Customization Description:</strong>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', padding: '8px', background: '#f1f5f9', borderRadius: '6px', fontWeight: 'normal' }}>
                    {billData.customizationText}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Bill Table */}
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Rate</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>🎨 Customization Service</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Custom development work as requested
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>₹{billData.baseAmount.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>1</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{billData.baseAmount.toFixed(2)}</td>
                </tr>
                
                {/* Subtotal */}
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '15px' }}>
                    Subtotal
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '15px' }}>
                    ₹{billData.baseAmount.toFixed(2)}
                  </td>
                </tr>
                
                {/* GST */}
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', color: '#f59e0b', fontSize: '14px' }}>
                    GST ({billData.gstPercentage}%)
                  </td>
                  <td style={{ textAlign: 'right', color: '#f59e0b', fontSize: '14px', fontWeight: 'bold' }}>
                    +₹{billData.gstAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
            
            {/* Total */}
            <div className="bill-total">
              <div className="bill-total-row">
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total Amount (incl. GST)</span>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
                  ₹{billData.totalWithGST.toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bill-footer">
              <p>Thank you for your business! For any queries, please contact support.</p>
              <p style={{ fontSize: '11px' }}>This is a system generated invoice.</p>
            </div>
          </div>
          
          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <button
              onClick={() => setShowBillModal(false)}
              style={{
                padding: '10px 24px',
                backgroundColor: '#e2e8f0',
                color: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Close
            </button>
            <button
              onClick={downloadBill}
              style={{
                padding: '10px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📥 Download Bill
            </button>
            <button
              onClick={() => processCustomizationPayment(billData.requestId, billData.totalWithGST)}
              disabled={processingCustomPayment}
              style={{
                padding: '10px 24px',
                backgroundColor: processingCustomPayment ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: processingCustomPayment ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {processingCustomPayment ? 'Processing...' : '💳 Pay Now'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const schoolName = profileData?.company_name || profileData?.school_name || profileData?.organization || 'Academic Institute'

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 select-none animate-fade-in text-slate-700" style={{ fontFamily: "'Inter', sans-serif" }}>
      
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
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black rounded-xl shadow-md transition-colors active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
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
              {loadingRequests ? (
                <div className="flex justify-center items-center py-20 bg-slate-50/10">
                  <svg className="w-5 h-5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              ) : customRequests.length > 0 ? (
                <table className="w-full text-left border-collapse text-[11px] font-semibold">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="px-5 py-4">ID</th>
                      <th className="px-5 py-4">Submitted</th>
                      <th className="px-5 py-4">Requested Service</th>
                      <th className="px-5 py-4">Quote Cost</th>
                      <th className="px-5 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {customRequests.map((req) => {
                      const parsed = parseCustomizationText(req.customization_text)
                      const statusObj = getStatusDetails(req.status)
                      const displayCost = req.amount_formatted || (req.cost ? `₹ ${req.cost}` : 'Pending Quote')

                      return (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-slate-500">#{req.id}</td>
                          <td className="px-5 py-4 font-sans text-slate-400">
                            {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN') : req.date || '—'}
                          </td>
                          <td className="px-5 py-4 max-w-[180px]">
                            <div className="font-bold text-slate-800 truncate">{parsed.title}</div>
                            <div className="text-[10px] text-slate-400 line-clamp-1 font-sans">{parsed.description}</div>
                          </td>
                          <td className="px-5 py-4 font-mono text-slate-600">{displayCost}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusObj.className}`}>
                              {statusObj.text}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-20 text-slate-400 bg-slate-50/30">
                  <span className="text-3xl block">⚙️</span>
                  <p className="font-bold mt-2 text-xs">No customizations requested yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 2: Pending Custom Payments */}
          {subTab === 'pending' && (
            <div className="overflow-x-auto">
              {loadingPendingPayments ? (
                <div className="flex justify-center items-center py-20 bg-slate-50/10">
                  <svg className="w-5 h-5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              ) : pendingCustomPayments.length > 0 ? (
                <table className="w-full text-left border-collapse text-[11px] font-semibold">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="px-5 py-4">ID</th>
                      <th className="px-5 py-4">Title / Description</th>
                      <th className="px-5 py-4">Quote Rate</th>
                      <th className="px-5 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pendingCustomPayments.map((payment) => {
                      const parsed = parseCustomizationText(payment.customization_text)
                      const amountVal = payment.amount || payment.base_amount || 0
                      return (
                        <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-slate-500">#{payment.id}</td>
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
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg cursor-pointer transition-colors active:scale-95 text-[10px]"
                            >
                              💳 Review & Pay
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-20 text-slate-400 bg-slate-50/30">
                  <span className="text-3xl block">💳</span>
                  <p className="font-bold mt-2 text-xs">No pending customization payments.</p>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 3: Completed Custom Payments History */}
          {subTab === 'history' && (
            <div className="overflow-x-auto">
              {loadingCustomPaymentHistory ? (
                <div className="flex justify-center items-center py-20 bg-slate-50/10">
                  <svg className="w-5 h-5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              ) : customPaymentHistory.length > 0 ? (
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
                    {customPaymentHistory.map((payment) => {
                      const parsed = parseCustomizationText(payment.customization_text)
                      return (
                        <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-slate-500 truncate max-w-[120px]">
                            {payment.razorpay_payment_id || `pay_mock_${payment.id}`}
                          </td>
                          <td className="px-5 py-4 font-sans text-slate-400">
                            {payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-IN') : '—'}
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
              ) : (
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
