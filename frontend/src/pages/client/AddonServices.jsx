import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientAuthStore } from '../../store/clientAuthStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getClientAddonPreview,
  getClientAddonHistory,
  createAddonPaymentOrder,
  verifyAddonPayment,
  getClientAddonCart,
  addAddonToCart,
  removeAddonFromCart,
  clearAddonCart,
  createCartPaymentOrder,
  verifyCartPayment
} from '../../api/clientPortal'
import ClientPageHeader from '../../components/client/ClientPageHeader'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtCurrency = (v) => {
  if (v === undefined || v === null) return '—'
  const n = typeof v === 'string' ? parseFloat(v) : v
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const ADDON_COLORS = {
  'Transportation': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '🚌' },
  'hostel': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', icon: '🏢' },
  'previous_year': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: '💾' },
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

  // Shopping Cart States
  const [addonCart, setAddonCart] = useState({ items: [], total_amount: 0, item_count: 0 })
  const [loadingCart, setLoadingCart] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [processingCartPayment, setProcessingCartPayment] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)

  // Catalog Previews State (Live count & pricing from backend)
  const [catalogPreviews, setCatalogPreviews] = useState({})
  const [loadingCatalog, setLoadingCatalog] = useState(false)

  // Card Quantities States (Local estimation, initialized dynamically from API)
  const [cardQuantities, setCardQuantities] = useState({
    idCardA: 1,
    idCardB: 1,
    idCardC: 2,
    transportation: 1,
    hostel: 1,
    backup: 1
  })

  // Selected Card for Drawer Checkout
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedRecipientType, setSelectedRecipientType] = useState('student')
  const [addonPreview, setAddonPreview] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Payment Confirmation Invoice Modal States
  const [showBillModal, setShowBillModal] = useState(false)
  const [billData, setBillData] = useState(null)
  const billRef = useRef(null)

  const activeProduct = productData?.[0] || {}
  const productName = activeProduct?.product_name || activeProduct?.name || 'NEXGN Institute Pro'

  // Helper to update card quantities
  const handleQuantityChange = (key, val) => {
    const parsed = Math.max(1, parseInt(val) || 1)
    setCardQuantities(prev => ({
      ...prev,
      [key]: parsed
    }))
  }

  // Helper for quick catalog direct add to cart
  const handleDirectAddToCart = async (addonType, title) => {
    setSuccess('Adding service to cart...')
    setError('')
    try {
      const res = await addAddonToCart(addonType, 'student', clientToken)
      if (res?.success) {
        setSuccess(`🛒 Added ${title} to cart successfully!`)
        await fetchCart()
        setShowCartModal(true) // Open the cart view modal
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(res?.message || 'Failed to add item to cart')
      }
    } catch (err) {
      console.error('Direct add to cart error:', err)
      const backendErr = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || err.message
      setError('Failed to add: ' + backendErr)
    }
  }

  // ── Sync History, Cart, & Catalog Previews ────────────────────────────────
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

  const fetchCart = async () => {
    if (!isClientAuthenticated || !clientToken) return
    setLoadingCart(true)
    try {
      const res = await getClientAddonCart(clientToken)
      if (res?.success) {
        setAddonCart(res.data || { items: [], total_amount: 0, item_count: 0 })
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    } finally {
      setLoadingCart(false)
    }
  }

  const fetchCatalogPreviews = async () => {
    if (!clientToken) return
    setLoadingCatalog(true)
    try {
      const serviceTypes = [
        { addonType: 'Domain Services', recipientType: 'student' },
        { addonType: 'id card Type A', recipientType: 'student' },
        { addonType: 'id card Type B', recipientType: 'student' },
        { addonType: 'id card Type C', recipientType: 'student' },
        { addonType: 'Transportation', recipientType: 'student' },
        { addonType: 'hostel', recipientType: 'student' },
        { addonType: 'previous_year', recipientType: 'student' }
      ]

      const results = await Promise.all(
        serviceTypes.map(async (s) => {
          try {
            const res = await getClientAddonPreview(s.addonType, s.recipientType, clientToken)
            return { type: s.addonType, data: res?.success ? res.data : null }
          } catch {
            return { type: s.addonType, data: null }
          }
        })
      )

      const newPreviews = {}
      results.forEach(r => {
        newPreviews[r.type] = r.data
      })
      setCatalogPreviews(newPreviews)

      // Initialize card quantity inputs dynamically from the fetched backend student/record counts
      setCardQuantities(prev => ({
        ...prev,
        idCardA: newPreviews['id card Type A']?.student_count || prev.idCardA,
        idCardB: newPreviews['id card Type B']?.student_count || prev.idCardB,
        idCardC: newPreviews['id card Type C']?.student_count || prev.idCardC,
        transportation: newPreviews['Transportation']?.student_count || prev.transportation,
        hostel: newPreviews['hostel']?.student_count || prev.hostel,
        backup: newPreviews['previous_year']?.student_count || prev.backup
      }))
    } catch (err) {
      console.error('Failed to load catalog previews:', err)
    } finally {
      setLoadingCatalog(false)
    }
  }

  useEffect(() => {
    if (isClientAuthenticated && clientToken) {
      fetchHistory()
      fetchCart()
      fetchCatalogPreviews()
    }
  }, [clientToken, isClientAuthenticated])

  // Fetch preview when selections change in the drawer
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
      const backendErr = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || err.message
      setError('Pricing error: ' + backendErr)
      setAddonPreview(null)
    } finally {
      setLoadingPreview(false)
    }
  }

  useEffect(() => {
    if (selectedCard && isClientAuthenticated && clientToken) {
      fetchPreview(selectedCard.addonType, selectedRecipientType)
    }
  }, [selectedCard, selectedRecipientType, clientToken, isClientAuthenticated])

  // ── Shopping Cart Logic ────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!selectedCard || !addonPreview) return
    setAddingToCart(true)
    setError('')
    setSuccess('')

    try {
      const res = await addAddonToCart(selectedCard.addonType, selectedRecipientType, clientToken)
      if (res?.success) {
        setSuccess(`🛒 Added ${selectedCard.title} to cart successfully!`)
        await fetchCart()
        setSelectedCard(null)
        setShowCartModal(true) // Automatically open cart modal!
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(res?.message || 'Failed to add item to cart')
      }
    } catch (err) {
      console.error('Add to cart error:', err)
      const backendErr = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || err.message
      setError('Failed to add item to cart: ' + backendErr)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleRemoveFromCart = async (cartItemId) => {
    setError('')
    setSuccess('')
    try {
      const res = await removeAddonFromCart(cartItemId, clientToken)
      if (res?.success) {
        setSuccess('Removed item from cart successfully!')
        await fetchCart()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(res?.message || 'Failed to remove item')
      }
    } catch (err) {
      console.error('Remove cart item error:', err)
      const backendErr = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || err.message
      setError('Error removing item: ' + backendErr)
    }
  }

  const handleClearCart = async () => {
    setError('')
    setSuccess('')
    try {
      const res = await clearAddonCart(clientToken)
      if (res?.success) {
        setSuccess('Cleared cart successfully!')
        await fetchCart()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(res?.message || 'Failed to clear cart')
      }
    } catch (err) {
      console.error('Clear cart error:', err)
      const backendErr = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || err.message
      setError('Error clearing cart: ' + backendErr)
    }
  }

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

  // ── Single Direct Checkout (Proforma invoice & Razorpay) ───────────────────
  const reviewAddonPayment = () => {
    if (!addonPreview || !selectedCard) return

    const today = new Date()
    const invoiceDate = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const invoiceNumber = `ADDON-INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const bill = {
      invoiceNumber,
      invoiceDate,
      clientName: profileData?.company_name || profileData?.school_name || profileData?.organization || 'Academic Institute',
      clientId: profileData?.client_id || '',
      addonType: selectedCard.addonType,
      recipientType: selectedRecipientType,
      rate: addonPreview.rate,
      rateFormatted: addonPreview.rate_formatted || fmtCurrency(addonPreview.rate),
      count: selectedCard.addonType === 'Domain Services' ? 1 : (selectedRecipientType === 'teacher' ? addonPreview.teacher_count || 45 : addonPreview.student_count || 850),
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

  const handlePaymentSubmit = async () => {
    if (!selectedCard || !addonPreview) return
    setProcessingPayment(true)
    setError('')
    setSuccess('')

    try {
      const orderRes = await createAddonPaymentOrder(selectedCard.addonType, selectedRecipientType, clientToken)
      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to initialize transaction order')
      }

      if (orderRes.simulated) {
        const verifyRes = await verifyAddonPayment({
          addon_type: selectedCard.addonType,
          recipient_type: selectedRecipientType,
          order_id: orderRes.order_id,
          razorpay_payment_id: 'sim_pay_' + Date.now(),
          razorpay_order_id: orderRes.order_id,
          razorpay_signature: 'sim_signature_' + Date.now()
        }, clientToken)

        if (verifyRes.success) {
          setSuccess(`✅ ${verifyRes.message || 'Payment successfully processed!'}`)
          setShowBillModal(false)
          setSelectedCard(null)
          fetchHistory()
        } else {
          setError(verifyRes.message || 'Simulation verification rejected by server')
        }
        setProcessingPayment(false)
        return
      }

      await loadRazorpayScript()

      const options = {
        key: orderRes.key,
        amount: Math.round(orderRes.amount * 100),
        currency: orderRes.currency || 'INR',
        name: 'AIM Digitalise',
        description: `${selectedCard.addonType} Add-on Service`,
        order_id: orderRes.order_id,
        handler: async (response) => {
          setSuccess('Verifying checkout transaction details on server...')
          try {
            const verifyRes = await verifyAddonPayment({
              addon_type: selectedCard.addonType,
              recipient_type: selectedRecipientType,
              order_id: orderRes.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }, clientToken)

            if (verifyRes.success) {
              setSuccess(`✅ Payment verified successfully!`)
              setShowBillModal(false)
              setSelectedCard(null)
              fetchHistory()
            } else {
              setError(verifyRes.message || 'Payment verification failed.')
            }
          } catch (err) {
            console.error('Payment verify API error:', err)
            const backendErr = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || err.message
            setError('Verification failed: ' + backendErr)
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
      const backendErr = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || err.message
      setError('Failed to process checkout transaction: ' + backendErr)
      setProcessingPayment(false)
    }
  }

  // ── Cart Payment Checkout ──────────────────────────────────────────────────
  const processCartPayment = async () => {
    if (!addonCart || addonCart.items.length === 0) return
    setProcessingCartPayment(true)
    setError('')
    setSuccess('')

    try {
      const orderRes = await createCartPaymentOrder(clientToken)
      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to create payment order')
      }

      if (orderRes.simulated) {
        const verifyRes = await verifyCartPayment({
          order_id: orderRes.order_id,
          razorpay_payment_id: 'sim_cart_pay_' + Date.now()
        }, clientToken)

        if (verifyRes.success) {
          setSuccess(`✅ Payment of ₹${orderRes.amount} completed and services activated successfully!`)
          await fetchCart()
          await fetchHistory()
          setShowCartModal(false) // Close the cart modal
        } else {
          setError(verifyRes.message || 'Cart payment verification failed')
        }
        setProcessingCartPayment(false)
        return
      }

      await loadRazorpayScript()

      const options = {
        key: orderRes.key,
        amount: Math.round(orderRes.amount * 100),
        currency: orderRes.currency || 'INR',
        name: 'AIM Digitalise',
        description: `Pay for ${orderRes.item_count} Add-on Services`,
        order_id: orderRes.order_id,
        handler: async (response) => {
          setSuccess('Verifying checkout transaction details on server...')
          try {
            const verifyRes = await verifyCartPayment({
              order_id: orderRes.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }, clientToken)

            if (verifyRes.success) {
              setSuccess(`✅ Payment of ₹${orderRes.amount} verified successfully!`)
              await fetchCart()
              await fetchHistory()
              setShowCartModal(false) // Close the cart modal
            } else {
              setError(verifyRes.message || 'Cart payment verification failed')
            }
          } catch (err) {
            const backendErr = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || err.message
            setError('Payment verification error: ' + backendErr)
          } finally {
            setProcessingCartPayment(false)
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled')
            setProcessingCartPayment(false)
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
        setProcessingCartPayment(false)
      })
      rzp.open()

    } catch (err) {
      const backendErr = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || err.message
      setError('Failed to process payment: ' + backendErr)
      setProcessingCartPayment(false)
    }
  }

  // ── Download Invoice ───────────────────────────────────────────────────────
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

  // ── Proforma Invoice Modal Overlay ─────────────────────────────────────────
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

            .modal-actions-bar { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; border-top: 1px solid #f1f5f9; padding-top: 20px; }
            .btn-modal { padding: 12px 26px; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 13px; transition: all 0.2s; }
            .btn-modal-close { background-color: #f1f5f9; color: #475569; }
            .btn-modal-close:hover { background-color: #e2e8f0; color: #1e293b; }
            .btn-modal-download { background-color: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
            .btn-modal-download:hover { background-color: #e2e8f0; }
            .btn-modal-addcart { background-color: #2563eb; color: white; }
            .btn-modal-addcart:hover { background-color: #1d4ed8; }
            .btn-modal-pay { background-color: #10b981; color: white; }
            .btn-modal-pay:hover:not(:disabled) { background-color: #059669; }
            .btn-modal:disabled { opacity: 0.6; cursor: not-allowed; }
          ` }} />

          <div ref={billRef} className="bill-container">
            {/* Header */}
            <div className="bill-header">
              <div className="logo-circle">A</div>
              <div className="company-info">
                <h2>AIM Digitalise</h2>
                #139, 3rd Floor, Rajdanga Main Road,<br />
                Kolkata, West Bengal - 700107<br />
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
                    <strong>Service Recipient:</strong> <span className="capitalize">{billData.recipientType}</span>
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
              onClick={async () => {
                setShowBillModal(false)
                if (selectedCard && addonPreview) {
                  setAddingToCart(true)
                  try {
                    const res = await addAddonToCart(selectedCard.addonType, selectedRecipientType, clientToken)
                    if (res?.success) {
                      setSuccess(`🛒 Added ${selectedCard.title} to cart successfully!`)
                      await fetchCart()
                      setSelectedCard(null)
                      setShowCartModal(true) // Automatically open the cart view modal
                      setTimeout(() => setSuccess(''), 5000)
                    } else {
                      setError(res?.message || 'Failed to add item to cart')
                    }
                  } catch (err) {
                    const backendErr = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || err.message
                    setError('Failed to add to cart: ' + backendErr)
                  } finally {
                    setAddingToCart(false)
                  }
                }
              }}
              disabled={addingToCart}
              className="btn-modal btn-modal-addcart"
            >
              🛒 Add to Cart
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

  // ─── Cart Modal Overlay ────────────────────────────────────────────────────
  const CartModal = () => {
    if (!showCartModal) return null

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9990,
        padding: '20px',
        overflow: 'auto'
      }} onClick={() => setShowCartModal(false)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '24px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-base font-black text-blue-900 flex items-center gap-2">
              🛒 Add-on Shopping Cart ({addonCart.item_count} {addonCart.item_count === 1 ? 'item' : 'items'})
            </h3>
            <div className="flex items-center gap-3">
              {addonCart.items && addonCart.items.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  🗑️ Clear Cart
                </button>
              )}
              <button
                onClick={() => setShowCartModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          {addonCart.items && addonCart.items.length > 0 ? (
            <>
              <div className="space-y-3 mb-5 max-h-[50vh] overflow-y-auto pr-1">
                {addonCart.items.map((item) => {
                  const colors = addonColor(item.addon_type)
                  return (
                    <div key={item.id} className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{colors.icon}</span>
                          <strong className="text-xs font-bold text-slate-800">{item.addon_type}</strong>
                          {item.recipient_type && (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.recipient_type === 'teacher' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                              {item.recipient_type === 'teacher' ? '👨‍🏫 Staff' : '👥 Students'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium font-sans">
                          Applicable Records: <strong className="text-slate-700 font-mono">{item.student_count}</strong> | Period: {new Date(item.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - {new Date(item.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-slate-800 font-mono">₹{parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer text-sm transition-colors"
                          title="Remove service"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Checkout Pricing breakdown */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 p-4.5 bg-slate-50/70 border border-slate-100 rounded-2xl mb-5">
                <div className="text-[11px] text-slate-500 font-medium space-y-1">
                  <div>Cart Subtotal: <strong className="text-slate-800 font-mono">{addonCart.total_subtotal_formatted}</strong></div>
                  <div>GST (18%): <strong className="text-slate-800 font-mono">{addonCart.total_gst_formatted}</strong></div>
                </div>
                <div className="sm:text-right flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grand Total Due</span>
                  <strong className="text-lg font-black text-blue-600 font-mono">{addonCart.total_amount_formatted}</strong>
                </div>
              </div>

              <button
                onClick={processCartPayment}
                disabled={processingCartPayment}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                {processingCartPayment ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Cart Transaction...
                  </>
                ) : (
                  <>💳 Pay for All Cart Items ({addonCart.total_amount_formatted})</>
                )}
              </button>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-medium italic">
              📭 Your shopping cart is empty. Add services from the catalog below.
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative space-y-6 max-w-6xl mx-auto pb-12 select-none animate-fade-in text-slate-700 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* 🛒 Floating Cart Icon in top right corner */}
      <div className="absolute top-1 right-0 md:top-2.5 md:right-0 z-[100]">
        <button
          onClick={() => setShowCartModal(true)}
          className="relative p-2.5 bg-white border border-slate-200 hover:border-blue-400 rounded-full hover:bg-blue-50/50 transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center"
        >
          <span className="text-xl">🛒</span>
          {addonCart.item_count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm font-mono animate-bounce">
              {addonCart.item_count}
            </span>
          )}
        </button>
      </div>

      <ClientPageHeader title="Add-on Services" />

      {/* Info Warning */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4.5 text-xs font-semibold leading-relaxed shadow-sm">
        ℹ️ You are subscribed to <strong>{productName}</strong>. Use this portal to purchase and instantly activate verified add-on services, GPS transit modules, or custom staff & student smart ID card print packages.
      </div>

      {/* Toast Alert */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4.5 py-3 text-xs font-bold shadow-md"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4.5 py-3 text-xs font-bold shadow-md"
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SERVICE CATALOG GRID ────────────────────────────────────────── */}
      {loadingCatalog && Object.keys(catalogPreviews).length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500 font-medium text-xs border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3">
          <span className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Synchronizing institutional student counts and service rates...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 1. Domain Services */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50/80 flex items-center justify-center text-xl">🌐</div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-50 text-orange-600 border border-orange-100">DOMAIN</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug mb-2">Domain Services</h3>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed mb-6">Client's own live domain integration on website & Software. Secure SSL connection setup included.</p>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Cost</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹7,300<span className="text-[10px] font-normal text-slate-500 font-sans">/year</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDirectAddToCart('Domain Services', 'Domain Services')}
                    className="p-2 bg-slate-50 hover:bg-blue-50/80 text-slate-600 hover:text-blue-600 rounded-xl transition-all cursor-pointer border border-slate-200"
                    title="Add directly to cart"
                  >
                    🛒
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRecipientType('student')
                      setSelectedCard({
                        addonType: 'Domain Services',
                        title: 'Domain Services',
                        badge: 'DOMAIN',
                        badgeType: 'Domain Services',
                        unitRate: 7300
                      })
                    }}
                    className="px-4 py-2 bg-[#1b5380] hover:bg-[#154164] text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Order Integration
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. ID Card Type A */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50/80 flex items-center justify-center text-xl">🪪</div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">SUPER PVC</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug mb-2">Students & Teachers ID Card (Type A)</h3>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed mb-4">Ready Card (20 mm Multi color Ribbon, PVC supper Card, Card Holder & clip). High durability gloss finish.</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-4.5 pb-3 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity</span>
                <input
                  type="number"
                  min="1"
                  value={cardQuantities.idCardA}
                  onChange={(e) => handleQuantityChange('idCardA', e.target.value)}
                  className="w-14 px-2 py-0.5 text-center font-bold text-[11px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 font-mono text-slate-700"
                />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Total Est. Cost</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹{(cardQuantities.idCardA * 60).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDirectAddToCart('id card Type A', 'ID Card (Type A)')}
                    className="p-2 bg-slate-50 hover:bg-blue-50/80 text-slate-600 hover:text-blue-600 rounded-xl transition-all cursor-pointer border border-slate-200"
                    title="Add directly to cart"
                  >
                    🛒
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRecipientType('student')
                      setSelectedCard({
                        addonType: 'id card Type A',
                        title: 'Students & Teachers ID Card (Type A)',
                        badge: 'SUPER PVC',
                        badgeType: 'id card Type A',
                        unitRate: 60
                      })
                    }}
                    className="px-4 py-2 bg-[#1b5380] hover:bg-[#154164] text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Order Cards
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ID Card Type B */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50/80 flex items-center justify-center text-xl">🪪</div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-100">REGULAR PVC</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug mb-2">Students & Teachers ID Card (Type B)</h3>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed mb-4">Ready Card (16 mm Single color Ribbon, PVC Regular Card, Card Holder & clip). Quality thermal printing.</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-4.5 pb-3 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity</span>
                <input
                  type="number"
                  min="1"
                  value={cardQuantities.idCardB}
                  onChange={(e) => handleQuantityChange('idCardB', e.target.value)}
                  className="w-14 px-2 py-0.5 text-center font-bold text-[11px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 font-mono text-slate-700"
                />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Total Est. Cost</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹{(cardQuantities.idCardB * 42).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDirectAddToCart('id card Type B', 'ID Card (Type B)')}
                    className="p-2 bg-slate-50 hover:bg-blue-50/80 text-slate-600 hover:text-blue-600 rounded-xl transition-all cursor-pointer border border-slate-200"
                    title="Add directly to cart"
                  >
                    🛒
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRecipientType('student')
                      setSelectedCard({
                        addonType: 'id card Type B',
                        title: 'Students & Teachers ID Card (Type B)',
                        badge: 'REGULAR PVC',
                        badgeType: 'id card Type B',
                        unitRate: 42
                      })
                    }}
                    className="px-4 py-2 bg-[#1b5380] hover:bg-[#154164] text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Order Cards
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. ID Card Type C */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50/80 flex items-center justify-center text-xl">🪪</div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">LAMINATED</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug mb-2">Students & Teachers ID Card (Type C)</h3>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed mb-4">Regular printed Single color Ribbon, Gum Pesting Laminated card with Card Holder & clip.</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-4.5 pb-3 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity</span>
                <input
                  type="number"
                  min="1"
                  value={cardQuantities.idCardC}
                  onChange={(e) => handleQuantityChange('idCardC', e.target.value)}
                  className="w-14 px-2 py-0.5 text-center font-bold text-[11px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 font-mono text-slate-700"
                />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Total Est. Cost</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹{(cardQuantities.idCardC * 37).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDirectAddToCart('id card Type C', 'ID Card (Type C)')}
                    className="p-2 bg-slate-50 hover:bg-blue-50/80 text-slate-600 hover:text-blue-600 rounded-xl transition-all cursor-pointer border border-slate-200"
                    title="Add directly to cart"
                  >
                    🛒
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRecipientType('student')
                      setSelectedCard({
                        addonType: 'id card Type C',
                        title: 'Students & Teachers ID Card (Type C)',
                        badge: 'LAMINATED',
                        badgeType: 'id card Type C',
                        unitRate: 37
                      })
                    }}
                    className="px-4 py-2 bg-[#1b5380] hover:bg-[#154164] text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Order Cards
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Transportation Services */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50/80 flex items-center justify-center text-xl">🚌</div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-teal-50 text-teal-600 border border-teal-100">TRANSIT</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug mb-2">Transportation Services</h3>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed mb-4">GPS-enabled transportation logging, route tracking, dynamic SMS alerts, and fee management integrations.</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-4.5 pb-3 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Availed Students</span>
                <input
                  type="number"
                  min="1"
                  value={cardQuantities.transportation}
                  onChange={(e) => handleQuantityChange('transportation', e.target.value)}
                  className="w-14 px-2 py-0.5 text-center font-bold text-[11px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 font-mono text-slate-700"
                />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Total Cost</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹{(cardQuantities.transportation * 36)}<span className="text-[10px] font-normal text-slate-500 font-sans">/year</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDirectAddToCart('Transportation', 'Transportation Services')}
                    className="p-2 bg-slate-50 hover:bg-blue-50/80 text-slate-600 hover:text-blue-600 rounded-xl transition-all cursor-pointer border border-slate-200"
                    title="Add directly to cart"
                  >
                    🛒
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRecipientType('student')
                      setSelectedCard({
                        addonType: 'Transportation',
                        title: 'Transportation Services',
                        badge: 'TRANSIT',
                        badgeType: 'Transportation',
                        unitRate: 36
                      })
                    }}
                    className="px-4 py-2 bg-[#1b5380] hover:bg-[#154164] text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Avail Services
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Hostel Services */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50/80 flex items-center justify-center text-xl">🏢</div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-violet-50 text-violet-600 border border-violet-100">HOSTEL</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug mb-2">Hostel Services</h3>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed mb-4">Dormitory allocation manager, mess billing integration, warden controls, and entry logs tracking software.</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-4.5 pb-3 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Availed Students</span>
                <input
                  type="number"
                  min="1"
                  value={cardQuantities.hostel}
                  onChange={(e) => handleQuantityChange('hostel', e.target.value)}
                  className="w-14 px-2 py-0.5 text-center font-bold text-[11px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 font-mono text-slate-700"
                />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Total Cost</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹{(cardQuantities.hostel * 60)}<span className="text-[10px] font-normal text-slate-500 font-sans">/year</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDirectAddToCart('hostel', 'Hostel Services')}
                    className="p-2 bg-slate-50 hover:bg-blue-50/80 text-slate-600 hover:text-blue-600 rounded-xl transition-all cursor-pointer border border-slate-200"
                    title="Add directly to cart"
                  >
                    🛒
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRecipientType('student')
                      setSelectedCard({
                        addonType: 'hostel',
                        title: 'Hostel Services',
                        badge: 'HOSTEL',
                        badgeType: 'hostel',
                        unitRate: 60
                      })
                    }}
                    className="px-4 py-2 bg-[#1b5380] hover:bg-[#154164] text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Avail Services
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Previous Year Backup */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50/80 flex items-center justify-center text-xl">💾</div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">ARCHIVES</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug mb-2">Previous Year Backup</h3>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed mb-4">Secure archival backup database hosting. Retrieve historical student records, attendance, and audit logs.</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-4.5 pb-3 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Availed Students</span>
                <input
                  type="number"
                  min="1"
                  value={cardQuantities.backup}
                  onChange={(e) => handleQuantityChange('backup', e.target.value)}
                  className="w-14 px-2 py-0.5 text-center font-bold text-[11px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 font-mono text-slate-700"
                />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Total Cost</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹{(cardQuantities.backup * 36)}<span className="text-[10px] font-normal text-slate-500 font-sans">/year</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDirectAddToCart('previous_year', 'Previous Year Backup')}
                    className="p-2 bg-slate-50 hover:bg-blue-50/80 text-slate-600 hover:text-blue-600 rounded-xl transition-all cursor-pointer border border-slate-200"
                    title="Add directly to cart"
                  >
                    🛒
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRecipientType('student')
                      setSelectedCard({
                        addonType: 'previous_year',
                        title: 'Previous Year Backup',
                        badge: 'ARCHIVES',
                        badgeType: 'previous_year',
                        unitRate: 36
                      })
                    }}
                    className="px-4 py-2 bg-[#1b5380] hover:bg-[#154164] text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Avail Services
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ─── CHECKOUT MODAL/DRAWER OVERLAY ─────────────────────────────────── */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-end z-[990] select-none"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${addonColor(selectedCard.badgeType).bg} ${addonColor(selectedCard.badgeType).text} ${addonColor(selectedCard.badgeType).border}`}>
                      {selectedCard.badge}
                    </span>
                    <h2 className="text-base font-bold text-slate-800 tracking-tight leading-snug">{selectedCard.title}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Recipient Toggles (Only show if not Domain Services, Backup, or Transportation) */}
                {selectedCard.addonType !== 'Domain Services' && selectedCard.addonType !== 'previous_year' && selectedCard.addonType !== 'Transportation' && (
                  <div className="space-y-2 mb-6">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service Recipients</label>
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

                {/* Live Estimator Pricing Box */}
                <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Invoice Calculation</span>
                  {loadingPreview ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-xs font-bold text-slate-500">
                      <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Loading live estimates...
                    </div>
                  ) : addonPreview ? (
                    <div className="space-y-3.5 text-xs text-slate-600 font-medium">
                      <div className="flex justify-between items-center">
                        <span>Base Unit Rate:</span>
                        <strong className="text-slate-800 font-mono">{addonPreview.rate_formatted || fmtCurrency(addonPreview.rate)}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Record Count (Instit.):</span>
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
                      <div className="flex justify-between items-center border-t border-slate-200 pt-3 text-sm font-black text-slate-800">
                        <span className="text-emerald-700">Grand Total Due:</span>
                        <span className="text-emerald-700 font-mono">{addonPreview.amount_formatted || fmtCurrency(addonPreview.amount)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-[10px] italic text-slate-400">
                      Pricing calculations not available.
                    </div>
                  )}
                </div>

                {selectedCard.addonType !== 'Domain Services' && (
                  <p className="text-[10px] text-slate-400 italic mt-3.5 leading-normal">
                    💡 Note: Cart quantity defaults to your total active enrollment counts. Custom orders are pro-rated for your remaining billing cycle.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !addonPreview || loadingPreview}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {addingToCart ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding to Cart...
                    </>
                  ) : (
                    <>🛒 Add to Shopping Cart</>
                  )}
                </button>

                <button
                  onClick={reviewAddonPayment}
                  disabled={processingPayment || !addonPreview || loadingPreview}
                  className="w-full py-3.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  💳 Review Invoice & Pay Direct
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Bill Proforma Modal */}
      <BillModal />

      {/* Shopping Cart Modal */}
      <AnimatePresence>
        {showCartModal && <CartModal />}
      </AnimatePresence>
    </div>
  )
}

export default ClientAddonServices
