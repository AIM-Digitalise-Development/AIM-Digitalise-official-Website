import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useClientAuthStore } from '../../store/clientAuthStore'
import {
  getClientStudentCount,
  getClientPaymentCycles,
  calculateSubscription,
  createSubscriptionOrder,
  verifySubscriptionPayment
} from '../../api/clientPortal'
import { checkSubscriptionStatus } from '../../utils/subscription'
import StudentCountCard from '../../components/client/subscription/StudentCountCard'
import PaymentCyclesCard from '../../components/client/subscription/PaymentCyclesCard'
import PaymentSummaryCard from '../../components/client/subscription/PaymentSummaryCard'

const ClientSubscription = () => {
  const { clientToken, isClientAuthenticated, profileData, productData } = useClientAuthStore()
  
  // UI states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loadingSubscription, setLoadingSubscription] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Data states
  const [studentCount, setStudentCount] = useState(null)
  const [paymentCycles, setPaymentCycles] = useState(null)
  const [selectedCycle, setSelectedCycle] = useState('quarterly')
  const [calculatedAmount, setCalculatedAmount] = useState(null)

  useEffect(() => {
    if (!isClientAuthenticated || !clientToken) return

    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [studentRes, cyclesRes] = await Promise.all([
          getClientStudentCount(clientToken).catch(err => {
            console.error('Failed to load student count:', err)
            return null
          }),
          getClientPaymentCycles(clientToken)
        ])

        if (studentRes?.success) {
          setStudentCount(studentRes.data)
        }

        if (cyclesRes?.success) {
          setPaymentCycles(cyclesRes.data)
          await calculateSubscriptionForCycle('quarterly', clientToken)
        } else {
          setError(cyclesRes?.message || 'Failed to load billing cycle options.')
        }
      } catch (err) {
        console.error('Error fetching subscription init details:', err)
        setError(err?.response?.data?.message || err?.message || 'Failed to initialize subscription page.')
      } finally {
        setLoading(false)
      }
    }

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
      } else {
        setError(res.message || 'Failed to calculate subscription rate.')
      }
    } catch (err) {
      console.error('Subscription calculation error:', err)
      setError('Failed to calculate subscription amount.')
    } finally {
      setLoadingSubscription(false)
    }
  };

  const handleCycleChange = (cycle) => {
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

  const handlePaymentSubmit = async () => {
    if (!calculatedAmount) {
      setError('Please calculate subscription amount first')
      return
    }

    setProcessingPayment(true)
    setError('')
    setSuccess('')

    try {
      const orderRes = await createSubscriptionOrder(selectedCycle, clientToken)

      if (!orderRes.success) {
        setError(orderRes.message || 'Failed to create subscription order.')
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
            amount: orderRes.amount
          }, clientToken)

          if (verifyRes.success) {
            setSuccess(`✅ Payment simulated successfully!\n${verifyRes.message}\nTotal Charged: ₹${orderRes.amount}`)
            setTimeout(() => setSuccess(''), 7000)
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
              amount: orderRes.amount
            }, clientToken)

            if (verifyRes.success) {
              setSuccess(`✅ Payment successful!\n${verifyRes.message}`)
              setTimeout(() => setSuccess(''), 7000)
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

  if (loading && !paymentCycles) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4 max-w-5xl mx-auto"
    >
      {error && (
        <div className="p-3 rounded-lg text-[12px] font-medium text-left" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg text-[12px] font-medium text-left whitespace-pre-line" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
          {success}
        </div>
      )}

      {/* Active Subscription */}
      {!subStatus.canPay ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-8 text-center" style={{ border: '1px solid #ebedf0' }}>
            <div className="max-w-lg mx-auto space-y-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: '#e8f5f0', border: '2px solid #a7f3d0' }}>
                <svg className="w-7 h-7" style={{ color: '#1a6b54' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-800">Active Subscription</h3>
                <p className="text-[12px] text-gray-400 leading-relaxed">
                  Your platform subscription is fully active. No action is required.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                <div className="p-3 rounded-lg text-left" style={{ background: '#f5f6fa', border: '1px solid #ebedf0' }}>
                  <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider block">Remaining</span>
                  <span className="text-lg font-bold text-gray-800 block mt-0.5">{subStatus.daysRemaining} Days</span>
                </div>
                <div className="p-3 rounded-lg text-left" style={{ background: '#f5f6fa', border: '1px solid #ebedf0' }}>
                  <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider block">Expires On</span>
                  <span className="text-lg font-bold text-gray-800 block mt-0.5">
                    {subStatus.planEndDate ? subStatus.planEndDate.toLocaleDateString('en-IN') : '—'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg text-left text-[11px] text-gray-500 max-w-md mx-auto leading-relaxed" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                ℹ️ Payment options appear <strong>3 days before expiration</strong> (from {subStatus.planEndDate ? getRenewalStartDateStr(subStatus.planEndDate) : '—'}).
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <StudentCountCard studentCount={studentCount} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <PaymentCyclesCard
            paymentCycles={paymentCycles}
            selectedCycle={selectedCycle}
            onCycleChange={handleCycleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <StudentCountCard studentCount={studentCount} />
            </div>

            <div className="md:col-span-2">
              {loadingSubscription && !calculatedAmount ? (
                <div className="flex justify-center items-center py-16 bg-white rounded-xl h-full" style={{ border: '1px solid #ebedf0' }}>
                  <svg className="w-5 h-5 animate-spin text-gray-300" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              ) : (
                <PaymentSummaryCard
                  calculatedAmount={calculatedAmount}
                  processingPayment={processingPayment}
                  onPaymentSubmit={handlePaymentSubmit}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ClientSubscription
