import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useClientAuthStore } from '../../store/clientAuthStore'
import {
  getClientStudentCount,
  getClientPaymentCycles,
  calculateSubscription,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getClientPaymentStatus,
  getClientPaymentHistory
} from '../../api/clientPortal'
import { checkSubscriptionStatus } from '../../utils/subscription'
import ClientPageHeader from '../../components/client/ClientPageHeader'
import StudentCountCard from '../../components/client/subscription/StudentCountCard'
import PaymentCyclesCard from '../../components/client/subscription/PaymentCyclesCard'
import PaymentSummaryCard from '../../components/client/subscription/PaymentSummaryCard'

const cycleDisplayNames = {
  'annual': 'Annual',
  'half_yearly': 'Half Yearly',
  'quarterly': 'Quarterly',
  'monthly': 'Monthly'
}

const ClientSubscription = () => {
  const { clientToken, isClientAuthenticated, profileData, productData, clientLogout } = useClientAuthStore()
  
  // UI states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loadingSubscription, setLoadingSubscription] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Bill/Invoice State
  const [showBillModal, setShowBillModal] = useState(false)
  const [billData, setBillData] = useState(null)
  const billRef = useRef(null)

  // Data states
  const [studentCount, setStudentCount] = useState(null)
  const [paymentCycles, setPaymentCycles] = useState(null)
  const [selectedCycle, setSelectedCycle] = useState('annual')
  const [calculatedAmount, setCalculatedAmount] = useState(null)

  // Product Pricing Info
  const [perPerson, setPerPerson] = useState(1)
  const [monthlySubscription, setMonthlySubscription] = useState(0)

  // Sync profile details
  useEffect(() => {
    if (profileData) {
      if (profileData.per_person !== undefined) {
        setPerPerson(profileData.per_person)
      }
      if (profileData.monthly_subscription !== undefined) {
        setMonthlySubscription(profileData.monthly_subscription)
      }
    }
  }, [profileData])

  // Sync product details
  useEffect(() => {
    if (productData) {
      const product = Array.isArray(productData) ? productData[0] : productData
      if (product) {
        if (product.per_person !== undefined) {
          setPerPerson(product.per_person)
        }
        if (product.monthly_subscription !== undefined) {
          setMonthlySubscription(product.monthly_subscription)
        }
      }
    }
  }, [productData])

  // Backend payment details and error warnings
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [showPayNow, setShowPayNow] = useState(false)
  const [nextPaymentDate, setNextPaymentDate] = useState(null)
  const [deliveryInfo, setDeliveryInfo] = useState(null)
  const [paymentHistory, setPaymentHistory] = useState(null)
  const [studentCountWarning, setStudentCountWarning] = useState(null)
  const [hasZeroStudents, setHasZeroStudents] = useState(false)
  const [unpaidMonths, setUnpaidMonths] = useState([])
  const [totalDueAmount, setTotalDueAmount] = useState(null)

  const fetchData = async () => {
    if (!isClientAuthenticated || !clientToken) return
    setLoading(true)
    setError('')
    try {
      let zeroStudents = false
      
      // 1. Fetch Student Count & Check Zero State
      const studentRes = await getClientStudentCount(clientToken).catch(err => {
        console.error('Failed to load student count:', err)
        return null
      })

      if (studentRes?.success) {
        setStudentCount(studentRes.data)
        const count = studentRes.data.student_count
        if (count === 0) {
          zeroStudents = true
          setHasZeroStudents(true)
          setStudentCountWarning({
            show: true,
            message: 'No students found in your school database. You cannot make subscription payments until student records are added.',
            action_message: 'Please contact your school administrator to add student records to the system.',
            student_count: 0
          })
        } else {
          setHasZeroStudents(false)
          setStudentCountWarning(null)
        }
      }

      // 2. Fetch Payment Status and History in Parallel
      const [statusRes, historyRes] = await Promise.all([
        getClientPaymentStatus(clientToken).catch(err => {
          console.error('Failed to load payment status:', err)
          return null
        }),
        getClientPaymentHistory(clientToken).catch(err => {
          console.error('Failed to load payment history:', err)
          return null
        })
      ])

      if (statusRes?.success) {
        setPaymentStatus(statusRes.data)
        setShowPayNow(statusRes.data.show_pay_now)
        setNextPaymentDate(statusRes.data.next_payment_date)
        setDeliveryInfo(statusRes.data.delivery_info)
        if (statusRes.data.delivery_info) {
          if (statusRes.data.delivery_info.unpaid_months) {
            setUnpaidMonths(statusRes.data.delivery_info.unpaid_months)
          } else {
            setUnpaidMonths([])
          }
          if (statusRes.data.delivery_info.total_due_amount) {
            setTotalDueAmount(statusRes.data.delivery_info.total_due_amount)
          } else {
            setTotalDueAmount(null)
          }
        } else {
          setUnpaidMonths([])
          setTotalDueAmount(null)
        }
      }

      if (historyRes?.success) {
        setPaymentHistory(historyRes.data)
      }

      // 3. Fetch Billing Cycles (only if we have students or if flat rate)
      const activeProduct = Array.isArray(productData) ? productData[0] : productData
      const currentPerPerson = activeProduct?.per_person !== undefined 
        ? activeProduct.per_person 
        : (profileData?.per_person !== undefined ? profileData.per_person : 1)

      if (!zeroStudents || currentPerPerson !== 1) {
        const cyclesRes = await getClientPaymentCycles(clientToken)
        if (cyclesRes?.success) {
          setPaymentCycles(cyclesRes.data)
          if (cyclesRes.data.per_person !== undefined) {
            setPerPerson(cyclesRes.data.per_person)
          }
          if (cyclesRes.data.monthly_subscription !== undefined) {
            setMonthlySubscription(cyclesRes.data.monthly_subscription)
          }
          await calculateSubscriptionForCycle('annual', clientToken)
          setStudentCountWarning(null)
        } else {
          if (cyclesRes?.error_code === 'NO_STUDENTS_FOUND') {
            setHasZeroStudents(true)
            setStudentCountWarning({
              show: true,
              message: cyclesRes.message,
              action_message: cyclesRes.data?.action_message || 'Please add student records to your school management system first.',
              student_count: 0
            })
            setError('') // Warnings are handled in custom block, not as generic page error
          } else {
            setError(cyclesRes?.message || 'Failed to load billing cycle options.')
          }
        }
      }
    } catch (err) {
      console.error('Error fetching subscription init details:', err)
      if (err.response?.status === 401) {
        clientLogout()
      } else {
        setError(err?.response?.data?.message || err?.message || 'Failed to initialize subscription page.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [clientToken, isClientAuthenticated])

  const calculateSubscriptionForCycle = async (cycle, token) => {
    setLoadingSubscription(true)
    setError('')
    try {
      const res = await calculateSubscription(cycle, token)
      if (res.success) {
        setCalculatedAmount(res.data)
        setSelectedCycle(cycle)
        if (res.data.product?.per_person !== undefined) {
          setPerPerson(res.data.product.per_person)
        }
        if (res.data.product?.monthly_subscription !== undefined) {
          setMonthlySubscription(res.data.product.monthly_subscription)
        }
        // Generate bill data when calculation is done
        generateBillData(res.data, cycle)
      } else {
        if (res.error_code === 'NO_STUDENTS_FOUND') {
          setHasZeroStudents(true)
          setStudentCountWarning({
            show: true,
            message: res.message,
            action_message: 'Please add student records to your school management system first.',
            student_count: 0
          })
        } else {
          setError(res.message || 'Failed to calculate subscription rate.')
        }
      }
    } catch (err) {
      console.error('Subscription calculation error:', err)
      if (err.response?.status === 401) {
        clientLogout()
      } else {
        setError('Failed to calculate subscription amount.')
      }
    } finally {
      setLoadingSubscription(false)
    }
  };

  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return null
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return null
    return `₹ ${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Generate Bill Data - COMPLETELY FIXED VERSION
  const generateBillData = (data, cycle) => {
    if (!data || !data.calculation) return

    const calc = data.calculation
    const isFirst = data.is_first_payment

    // Get values from calculation
    const baseMonthlyAmount = calc.base_monthly_amount || 0
    const discountPercentage = calc.discount_percentage || 0
    const cycleMonths = calc.cycle_months || 1
    const carryoverFraction = calc.carryover_fraction || 0
    const carryoverDays = calc.carryover_days || 0
    const daysInMonth = calc.carryover_days_in_month || 30
    const gstPercentage = calc.gst_percentage || 18

    // IMPORTANT: Calculate discounted monthly amount from base + discount
    // This ensures we use the CORRECT discounted rate
    const discountedMonthlyAmount = baseMonthlyAmount * (1 - discountPercentage / 100)

    // Step 1: Calculate carryover amount using DISCOUNTED monthly rate
    const carryoverAmount = discountedMonthlyAmount * carryoverFraction

    // Step 2: Calculate regular months amount using DISCOUNTED monthly rate
    const regularMonthsAmount = discountedMonthlyAmount * cycleMonths

    // Step 3: Total amount (already discounted)
    const totalAmount = carryoverAmount + regularMonthsAmount

    // Step 4: Calculate GST on the discounted total
    const gstAmount = (totalAmount * gstPercentage) / 100
    const totalWithGST = totalAmount + gstAmount

    // Step 5: Calculate original amount (without discount) for savings display
    const baseCarryover = baseMonthlyAmount * carryoverFraction
    const baseRegular = baseMonthlyAmount * cycleMonths
    const baseTotal = baseCarryover + baseRegular
    const originalTotalWithGST = baseTotal + (baseTotal * gstPercentage / 100)

    // Step 6: Calculate savings
    const savings = baseTotal - totalAmount

    // Step 7: Calculate per-day amount for carryover
    const perDayAmount = carryoverDays > 0 ? discountedMonthlyAmount / daysInMonth : 0

    // Get client and product info
    const clientName = data.client?.client_name || profileData?.client_name || profileData?.name || ''
    const clientId = data.client?.client_id || profileData?.client_id || ''
    const schoolName = data.client?.school_name || profileData?.school_name || profileData?.company_name || profileData?.organization || ''
    const productName = data.product?.name || productData?.name || ''

    // Format dates
    const today = new Date()
    const invoiceDate = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Get period details from delivery info or calculation
    let periodStart = ''
    let periodEnd = ''
    let deliveryDate = ''

    if (deliveryInfo) {
      if (deliveryInfo.current_period_start) {
        periodStart = new Date(deliveryInfo.current_period_start).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      }
      if (deliveryInfo.current_period_end) {
        periodEnd = new Date(deliveryInfo.current_period_end).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      }
      if (deliveryInfo.delivery_date) {
        deliveryDate = new Date(deliveryInfo.delivery_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    }

    const perPersonValue = data.product?.per_person !== undefined 
      ? data.product.per_person 
      : (perPerson !== undefined ? perPerson : 1)
    
    const monthlySubscriptionValue = data.product?.monthly_subscription !== undefined
      ? data.product.monthly_subscription
      : (monthlySubscription !== undefined ? monthlySubscription : 0)

    // Build bill data
    const bill = {
      invoiceNumber,
      invoiceDate,
      clientName,
      clientId,
      schoolName,
      productName,
      cycle: cycleDisplayNames[cycle] || cycle,
      isFirstPayment: isFirst,
      periodStart,
      periodEnd,
      deliveryDate,
      studentCount: data.student_count || 0,
      perPerson: perPersonValue,
      monthlySubscription: monthlySubscriptionValue,
      // Base values (without discount) - for reference only
      baseMonthlyAmount,
      baseCarryover,
      baseRegular,
      baseTotal,
      originalTotalWithGST,
      // DISCOUNTED values - THESE ARE THE CORRECT ONES
      discountedMonthlyAmount,
      carryoverFraction,
      carryoverDays,
      daysInMonth,
      carryoverAmount,
      regularMonthsAmount,
      totalAmount,
      // Discount & GST
      discountPercentage,
      savings,
      gstPercentage,
      gstAmount,
      totalWithGST,
      // Per-day for display
      perDayAmount,
      cycleMonths
    }

    setBillData(bill)
  }

  // Download Bill as PDF/HTML
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
        .carryover-section { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
        .regular-section { background: #d1fae5; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge-first { background: #dbeafe; color: #1e40af; }
        .badge-regular { background: #d1fae5; color: #065f46; }
        .badge-per-person { background: #dbeafe; color: #1e40af; }
        .badge-flat { background: #fce7f3; color: #9d174d; }
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

  const handleCycleChange = (cycle) => {
    if (hasZeroStudents && perPerson === 1) {
      setError('Cannot change payment cycle: No students found in your school database.')
      return
    }
    calculateSubscriptionForCycle(cycle, clientToken)
  }

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

  const refreshSubscriptionData = async () => {
    try {
      setLoadingSubscription(true)
      
      const [statusRes, historyRes, studentRes, cyclesRes] = await Promise.all([
        getClientPaymentStatus(clientToken).catch(err => { console.error(err); return null; }),
        getClientPaymentHistory(clientToken).catch(err => { console.error(err); return null; }),
        getClientStudentCount(clientToken).catch(err => { console.error(err); return null; }),
        getClientPaymentCycles(clientToken).catch(err => { console.error(err); return null; })
      ])

      if (studentRes?.success) {
        setStudentCount(studentRes.data)
        const count = studentRes.data.student_count
        setHasZeroStudents(count === 0)
        if (count === 0) {
          setStudentCountWarning({
            show: true,
            message: 'No students found in your school database. You cannot make subscription payments until student records are added.',
            action_message: 'Please contact your school administrator to add student records to the system.',
            student_count: 0
          })
        } else {
          setStudentCountWarning(null)
        }
      }

      if (statusRes?.success) {
        setPaymentStatus(statusRes.data)
        setShowPayNow(statusRes.data.show_pay_now)
        setNextPaymentDate(statusRes.data.next_payment_date)
        setDeliveryInfo(statusRes.data.delivery_info)
        if (statusRes.data.delivery_info) {
          if (statusRes.data.delivery_info.unpaid_months) {
            setUnpaidMonths(statusRes.data.delivery_info.unpaid_months)
          } else {
            setUnpaidMonths([])
          }
          if (statusRes.data.delivery_info.total_due_amount) {
            setTotalDueAmount(statusRes.data.delivery_info.total_due_amount)
          } else {
            setTotalDueAmount(null)
          }
        } else {
          setUnpaidMonths([])
          setTotalDueAmount(null)
        }
      }

      if (historyRes?.success) {
        setPaymentHistory(historyRes.data)
      }

      const activeProduct = Array.isArray(productData) ? productData[0] : productData
      const currentPerPerson = activeProduct?.per_person !== undefined 
        ? activeProduct.per_person 
        : (profileData?.per_person !== undefined ? profileData.per_person : 1)

      if (cyclesRes?.success && (studentRes?.data?.student_count > 0 || currentPerPerson !== 1)) {
        setPaymentCycles(cyclesRes.data)
        if (selectedCycle) {
          await calculateSubscriptionForCycle(selectedCycle, clientToken)
        }
      }
      
      setSuccess('✅ Payment completed successfully! Your records have been updated.')
      setTimeout(() => setSuccess(''), 7000)
    } catch (err) {
      console.error('Error refreshing data:', err)
      setError('Payment completed but error refreshing data. Please refresh the page.')
    } finally {
      setLoadingSubscription(false)
    }
  }

  const handlePaymentSubmit = async () => {
    if (hasZeroStudents && perPerson === 1) {
      setError('Cannot process payment: No students found in your school database. Please add student records first.')
      return
    }

    if (!calculatedAmount) {
      setError('Please calculate subscription amount first')
      return
    }

    setProcessingPayment(true)
    setError('')
    setSuccess('')

    try {
      // Send the pre-calculated integer amount to avoid backend float→integer issues
      const preCalcAmount = Math.round(calculatedAmount?.calculation?.total_amount || 0)
      const orderRes = await createSubscriptionOrder(selectedCycle, clientToken, preCalcAmount)

      if (!orderRes.success) {
        if (orderRes.error_code === 'NO_STUDENTS_FOUND') {
          setHasZeroStudents(true)
          setStudentCountWarning({
            show: true,
            message: orderRes.message,
            action_message: orderRes.data?.action_message,
            student_count: 0
          })
        } else {
          setError(orderRes.message || 'Failed to create subscription order.')
        }
        setProcessingPayment(false)
        return
      }

      if (orderRes.simulated) {
        const confirmPayment = window.confirm(
          `SIMULATION GATEWAY MODE\n\nAmount: ₹${orderRes.amount}\nCycle: ${orderRes.cycle?.toUpperCase()}\n\nClick OK to simulate a successful payment transaction.`
        )

        if (confirmPayment) {
          setSuccess('Simulating verification on API servers...')
          const verifyRes = await verifySubscriptionPayment({
            order_id: orderRes.order_id,
            razorpay_payment_id: 'sim_pay_' + Date.now(),
            razorpay_order_id: orderRes.order_id,
            razorpay_signature: 'sim_signature_' + Date.now(),
            cycle: selectedCycle,
            amount: orderRes.amount,
            cycle_months: orderRes.cycle_months || 1,
            is_first_payment: orderRes.is_first_payment || false,
            has_carryover: orderRes.has_carryover || false,
            carryover_from: orderRes.carryover_from || null,
            carryover_to: orderRes.carryover_to || null,
            carryover_days: orderRes.carryover_days || 0,
            student_count: orderRes.student_count || null,
          }, clientToken)

          if (verifyRes.success) {
            setShowBillModal(false)
            await refreshSubscriptionData()
          } else {
            setError(verifyRes.message || 'Verification simulation rejected by server.')
          }
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
        description: `${orderRes.cycle?.toUpperCase()} Subscription - ${orderRes.client_name}`,
        order_id: orderRes.order_id,
        handler: async (response) => {
          setSuccess('Verifying checkout transaction details on server...')
          try {
            const verifyRes = await verifySubscriptionPayment({
              order_id: orderRes.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              cycle: selectedCycle,
              amount: orderRes.amount,
              cycle_months: orderRes.cycle_months || 1,
              is_first_payment: orderRes.is_first_payment || false,
              has_carryover: orderRes.has_carryover || false,
              carryover_from: orderRes.carryover_from || null,
              carryover_to: orderRes.carryover_to || null,
              carryover_days: orderRes.carryover_days || 0,
              student_count: orderRes.student_count || null,
            }, clientToken)

            if (verifyRes.success) {
              setShowBillModal(false)
              await refreshSubscriptionData()
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
          name: orderRes.client_name,
          email: orderRes.client_email,
        },
        theme: {
          color: '#1a3c5e'
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', (response) => {
        console.error('Payment checkout fail:', response)
        setError('Payment checkout failed: ' + (response.error?.description || 'Transaction error'))
        setProcessingPayment(false)
      })

      razorpay.open()
    } catch (err) {
      console.error('Razorpay process error:', err)
      setError('Checkout failed: ' + (err?.response?.data?.message || err.message))
      setProcessingPayment(false)
    }
  }

  const getRenewalStartDateStr = (planEndDate) => {
    if (!planEndDate) return '—'
    const dateCopy = new Date(planEndDate)
    dateCopy.setDate(dateCopy.getDate() - 3)
    return dateCopy.toLocaleDateString('en-IN')
  }

  // Bill Modal Component
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
        <style dangerouslySetInnerHTML={{ __html: `
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
          .carryover-section { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
          .regular-section { background: #d1fae5; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
          .badge-first { background: #dbeafe; color: #1e40af; }
          .badge-regular { background: #d1fae5; color: #065f46; }
          .badge-per-person { background: #dbeafe; color: #1e40af; }
          .badge-flat { background: #fce7f3; color: #9d174d; }

          .modal-actions-bar { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; border-top: 1px solid #f1f5f9; padding-top: 20px; }
          .btn-modal { padding: 12px 26px; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 13px; transition: all 0.2s; }
          .btn-modal-close { background-color: #f1f5f9; color: #475569; }
          .btn-modal-close:hover { background-color: #e2e8f0; color: #1e293b; }
          .btn-modal-download { background-color: #c25e17; color: white; box-shadow: 0 4px 6px -1px rgb(194 94 23 / 0.2); }
          .btn-modal-download:hover { background-color: #a54b0e; box-shadow: 0 6px 8px -1px rgb(194 94 23 / 0.3); }
          .btn-modal-pay { background-color: #10b981; color: white; box-shadow: 0 4px 6px -1px rgb(16 185 129 / 0.2); }
          .btn-modal-pay:hover:not(:disabled) { background-color: #059669; box-shadow: 0 6px 8px -1px rgb(16 185 129 / 0.3); }
          .btn-modal:disabled { opacity: 0.6; cursor: not-allowed; }
        ` }} />
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
              <div className="logo-circle">A</div>
              <div className="company-info">
                <h2>AIM Digitalise</h2>
#139, 3rd Floor, Rajdanga Main Road<br/>
                Kolkata, West Bengal - 700107<br/>
                GSTIN: 19ABCCA9672L1Z0<br/>
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
                    <strong>ID:</strong> {billData.clientId}<br/>
                    <strong>School:</strong> {billData.schoolName || '-'}<br/>
                    <strong>Product:</strong> {billData.productName || '-'}<br/>
                    <strong>Billing Cycle:</strong> {billData.cycle}
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

            {/* Pricing Formula & Billing Period Info */}
            <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '4px', border: '1px dashed #c25e17', fontSize: '13px' }}>
              <strong style={{ color: '#c25e17', display: 'block', marginBottom: '6px' }}>Pricing & Billing Period Info:</strong>
              <p style={{ color: '#475569', margin: '4px 0', lineHeight: '1.5' }}>
                <strong>Formula:</strong> {billData.perPerson === 1 ? `₹${billData.monthlySubscription || (billData.studentCount > 0 ? (billData.baseMonthlyAmount / billData.studentCount) : 10)} × ${billData.studentCount} students = ₹${billData.baseMonthlyAmount} per month` : `Flat Rate: ₹${billData.monthlySubscription || billData.baseMonthlyAmount} per month`}
              </p>
              {billData.periodStart && billData.periodEnd && (
                <p style={{ color: '#475569', margin: '4px 0', lineHeight: '1.5' }}>
                  <strong>Billing Period:</strong> {billData.periodStart} to {billData.periodEnd}
                  {billData.deliveryDate && ` (Delivery: ${billData.deliveryDate})`}
                </p>
              )}
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
                {/* Carryover Section */}
                {billData.isFirstPayment && billData.carryoverAmount > 0 && (
                  <tr>
                    <td className="cell-center">1</td>
                    <td>
                      <div className="item-title">🔄 Carryover Subscription</div>
                      <div className="item-desc">
                        Prated period: {billData.deliveryDate || 'Delivery'} to month end ({billData.carryoverDays}/{billData.daysInMonth} days)
                        {billData.discountPercentage > 0 && ` (${billData.discountPercentage}% plan discount applied)`}
                      </div>
                    </td>
                    <td className="cell-right">{(billData.carryoverFraction).toFixed(2)}</td>
                    <td className="cell-right">{formatAmount(billData.discountedMonthlyAmount)}</td>
                    <td className="cell-right" style={{ fontWeight: 'bold' }}>{formatAmount(billData.carryoverAmount)}</td>
                  </tr>
                )}
                
                {/* Regular Months Section */}
                <tr>
                  <td className="cell-center">{billData.isFirstPayment && billData.carryoverAmount > 0 ? '2' : '1'}</td>
                  <td>
                    <div className="item-title">📆 {billData.cycle} Subscription Fee</div>
                    <div className="item-desc">
                      Academic management portal system fees for {billData.cycleMonths} month(s).
                      {billData.discountPercentage > 0 && ` (${billData.discountPercentage}% discount applied)`}
                    </div>
                  </td>
                  <td className="cell-right">{(billData.cycleMonths).toFixed(2)}</td>
                  <td className="cell-right">{formatAmount(billData.discountedMonthlyAmount)}</td>
                  <td className="cell-right" style={{ fontWeight: 'bold' }}>{formatAmount(billData.regularMonthsAmount)}</td>
                </tr>
              </tbody>
            </table>

            <div className="invoice-bottom-section">
              <div className="terms-section">
                <div className="thanks-msg">Thanks for your business.</div>
                <h5>Terms & Conditions</h5>
                <p>All payments must be made in full before the activation of any services.</p>
                <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '10px' }}>This is a computer generated invoice and does not require a physical signature.</p>
              </div>
              
              <div className="summary-section">
                <table className="summary-table">
                  <tbody>
                    <tr>
                      <td>Sub Total</td>
                      <td>{formatAmount(billData.totalAmount)}</td>
                    </tr>
                    <tr>
                      <td>GST Tax ({billData.gstPercentage}%)</td>
                      <td>{formatAmount(billData.gstAmount)}</td>
                    </tr>
                    <tr className="total-row">
                      <td>Total</td>
                      <td>{formatAmount(billData.totalWithGST)}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="balance-due-bar">
                  <span>Balance Due</span>
                  <span>{formatAmount(billData.totalWithGST)}</span>
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
              onClick={handlePaymentSubmit}
              disabled={processingPayment}
              className="btn-modal btn-modal-pay"
            >
              {processingPayment ? 'Processing...' : '💳 Pay Now'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading && !paymentCycles && !paymentStatus) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-6 h-6 animate-spin text-gray-300" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  const subStatus = checkSubscriptionStatus(profileData, productData)

  // Determine active expiry date and remaining days based on next payment date or period end
  let activeExpiryDate = subStatus.planEndDate
  if (nextPaymentDate) {
    activeExpiryDate = new Date(nextPaymentDate)
  } else if (deliveryInfo?.current_period_end) {
    activeExpiryDate = new Date(deliveryInfo.current_period_end)
  }

  let activeDaysRemaining = subStatus.daysRemaining
  if (activeExpiryDate) {
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    const expiryCopy = new Date(activeExpiryDate)
    expiryCopy.setHours(0, 0, 0, 0)
    const diffTime = expiryCopy.getTime() - currentDate.getTime()
    activeDaysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  const schoolName = profileData?.company_name || profileData?.school_name || profileData?.organization || 'Academic Institute'
  
  // Decide which screen structure to render
  const canPay = (hasZeroStudents && perPerson === 1) ? false : (showPayNow || (paymentStatus && !paymentStatus.has_previous_payments))

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      <ClientPageHeader title="Subscription" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        {error && (
          <div className="p-3 rounded-lg text-[12px] font-medium text-left bg-rose-50 border border-rose-200 text-rose-600">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg text-[12px] font-medium text-left bg-emerald-50 border border-emerald-200 text-emerald-600 whitespace-pre-line">
            {success}
          </div>
        )}

        {/* Warning Banner when student count is 0 */}
        {studentCountWarning && studentCountWarning.show && perPerson === 1 && (
          <div className="p-5 rounded-2xl bg-amber-50 border-l-4 border-amber-500 text-amber-900 space-y-2.5">
            <div className="flex gap-2.5 items-start">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-800">No Students Found in ERP Database</h3>
                <p className="text-[11px] leading-relaxed text-amber-700 mt-1">{studentCountWarning.message}</p>
                {studentCountWarning.action_message && (
                  <p className="text-[10px] text-slate-500 font-bold mt-1.5">
                    💡 {studentCountWarning.action_message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="pt-2">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-[#1e3e6b] hover:bg-[#152e51] text-white text-[10px] font-black rounded-lg cursor-pointer transition-colors"
              >
                🔄 Refresh Student Records Status
              </button>
            </div>
          </div>
        )}

        {/* Core Billing / Pay Layout */}
        {(hasZeroStudents && perPerson === 1) ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-100 space-y-4">
            <span className="text-4xl block select-none">💳</span>
            <h3 className="text-sm font-black text-slate-800">Payment Gateway Inactive</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Your ERP student registry is completely empty. Subscription pricing is calculated dynamically based on student enrollment. Please populate student records to activate checkout.
            </p>
          </div>
        ) : canPay ? (
          <div className="space-y-4">
            {/* Pay Now Cycle Banner */}
            <div className="p-4 rounded-xl bg-amber-50 border-l-4 border-amber-500 text-amber-800 flex flex-col justify-start text-xs font-semibold space-y-2">
              <div className="flex items-center">
                <span className="text-base mr-1.5">⏰</span>
                {paymentStatus?.message || 'Your subscription period has ended. Please renew your billing cycle.'}
              </div>
              {unpaidMonths && unpaidMonths.length > 0 && (
                <div className="mt-1 bg-amber-100/50 p-2.5 rounded-lg border border-amber-200/60 text-[11px] text-amber-900 space-y-1 w-full">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">📋 Unpaid Months:</span>
                    <span className="font-normal text-amber-950">{unpaidMonths.join(', ')}</span>
                  </div>
                  {totalDueAmount !== null && totalDueAmount !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">Total Due:</span>
                      <span className="text-rose-600 font-black text-xs">
                        ₹{Number(totalDueAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <PaymentCyclesCard
              paymentCycles={paymentCycles}
              selectedCycle={selectedCycle}
              onCycleChange={handleCycleChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {perPerson === 1 && (
                <div className="md:col-span-1">
                  <StudentCountCard studentCount={studentCount} />
                </div>
              )}

              <div className={perPerson === 1 ? "md:col-span-2" : "md:col-span-3"}>
                {loadingSubscription && !calculatedAmount ? (
                  <div className="flex justify-center items-center py-16 bg-white rounded-xl h-full border border-slate-100">
                    <svg className="w-5 h-5 animate-spin text-gray-300" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  </div>
                ) : (
                  <PaymentSummaryCard
                    calculatedAmount={calculatedAmount}
                    processingPayment={processingPayment}
                    onPaymentSubmit={() => setShowBillModal(true)}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Subscription Summary card */}
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200/60">
              <div className="max-w-lg mx-auto space-y-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto bg-[#e8f5f0] border-2 border-[#a7f3d0]">
                  <svg className="w-7 h-7 text-[#1a6b54]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-800">Active Subscription</h3>
                  <p className="text-[12px] text-gray-400 leading-relaxed">
                    {paymentStatus?.message || 'Your platform subscription is fully active. No action is required.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                  <div className="p-3 rounded-lg text-left bg-[#f5f6fa] border border-[#ebedf0]">
                    <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider block">Remaining</span>
                    <span className="text-lg font-bold text-gray-800 block mt-0.5">{activeDaysRemaining} Days</span>
                  </div>
                  <div className="p-3 rounded-lg text-left bg-[#f5f6fa] border border-[#ebedf0]">
                    <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider block">Expires On</span>
                    <span className="text-lg font-bold text-gray-800 block mt-0.5">
                      {activeExpiryDate ? activeExpiryDate.toLocaleDateString('en-IN') : '—'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg text-left text-[11px] text-gray-500 max-w-md mx-auto leading-relaxed bg-blue-50 border border-blue-200">
                  ℹ️ Payment options will automatically appear <strong>3 days before expiration</strong> (on {activeExpiryDate ? getRenewalStartDateStr(activeExpiryDate) : '—'}).
                </div>
              </div>
            </div>

            {perPerson === 1 && (
              <div className="max-w-md mx-auto">
                <StudentCountCard studentCount={studentCount} />
              </div>
            )}
          </div>
        )}

        {/* Detailed Subscription Info (if delivery/payment info exists) */}
        {deliveryInfo && paymentStatus?.has_previous_payments && (
          <div className="bg-white rounded-xl p-5 border border-slate-200/60 space-y-4">
            <h3 className="text-[13px] font-bold text-gray-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <span>📦</span> Subscription Plan Logistics
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">First Payment Date</span>
                <p className="font-semibold text-slate-700">{deliveryInfo.first_payment_date ? new Date(deliveryInfo.first_payment_date).toLocaleDateString('en-IN') : '—'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Latest Payment Date</span>
                <p className="font-semibold text-slate-700">{deliveryInfo.last_payment_date ? new Date(deliveryInfo.last_payment_date).toLocaleDateString('en-IN') : '—'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Cycle Term</span>
                <p className="font-semibold text-slate-700 capitalize">{deliveryInfo.last_payment_cycle || '—'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Payments Made</span>
                <p className="font-semibold text-slate-700">{paymentStatus.total_payments_made || 0} Transactions</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment History Table */}
        {paymentHistory && paymentHistory.payments?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="bg-slate-800 text-white font-black px-5 py-4 text-xs flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span>📜</span> Payment Transaction History
              </div>
              <span className="bg-[#1e3e6b] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Total Paid: {paymentHistory.summary?.total_amount_formatted || '—'}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px] font-semibold">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3">Receipt / Payment ID</th>
                    <th className="px-5 py-3">Billing Cycle</th>
                    <th className="px-5 py-3">Term Period</th>
                    <th className="px-5 py-3 text-right">Amount Paid</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paymentHistory.payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-slate-600">{payment.razorpay_payment_id || 'simulated_pay'}</div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                          Paid on: {new Date(payment.created_at).toLocaleDateString('en-IN')} {new Date(payment.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-5 py-4 capitalize font-sans">{payment.cycle}</td>
                      <td className="px-5 py-4 text-slate-500 font-sans">
                        {payment.period_start && payment.period_end ? (
                          <span>{new Date(payment.period_start).toLocaleDateString('en-IN')} — {new Date(payment.period_end).toLocaleDateString('en-IN')}</span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-slate-800">
                        ₹ {parseFloat(payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          payment.status === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
      <BillModal />
    </div>
  )
}

export default ClientSubscription
