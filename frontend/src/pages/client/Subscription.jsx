import { useEffect, useState } from 'react'
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
import StudentCountCard from '../../components/client/subscription/StudentCountCard'
import PaymentCyclesCard from '../../components/client/subscription/PaymentCyclesCard'
import PaymentSummaryCard from '../../components/client/subscription/PaymentSummaryCard'

const ClientSubscription = () => {
  const { clientToken, isClientAuthenticated, profileData, productData, clientLogout } = useClientAuthStore()
  
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

  // Backend payment details and error warnings
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [showPayNow, setShowPayNow] = useState(false)
  const [nextPaymentDate, setNextPaymentDate] = useState(null)
  const [deliveryInfo, setDeliveryInfo] = useState(null)
  const [paymentHistory, setPaymentHistory] = useState(null)
  const [studentCountWarning, setStudentCountWarning] = useState(null)
  const [hasZeroStudents, setHasZeroStudents] = useState(false)

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
      }

      if (historyRes?.success) {
        setPaymentHistory(historyRes.data)
      }

      // 3. Fetch Billing Cycles (only if we have students)
      if (!zeroStudents) {
        const cyclesRes = await getClientPaymentCycles(clientToken)
        if (cyclesRes?.success) {
          setPaymentCycles(cyclesRes.data)
          await calculateSubscriptionForCycle('quarterly', clientToken)
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

  const handleCycleChange = (cycle) => {
    if (hasZeroStudents) {
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
      }

      if (historyRes?.success) {
        setPaymentHistory(historyRes.data)
      }

      if (cyclesRes?.success && studentRes?.data?.student_count > 0) {
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
    if (hasZeroStudents) {
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
            amount: orderRes.amount
          }, clientToken)

          if (verifyRes.success) {
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
              amount: orderRes.amount
            }, clientToken)

            if (verifyRes.success) {
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
  const schoolName = profileData?.company_name || profileData?.school_name || profileData?.organization || 'Academic Institute'
  
  // Decide which screen structure to render
  const canPay = hasZeroStudents ? false : (showPayNow || (paymentStatus && !paymentStatus.has_previous_payments))

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Centered Page Header */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px] border-b border-slate-200/80">
        <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Subscription</h1>

        <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0 select-none">
          <h2 className="text-lg font-extrabold text-[#1e3e6b] tracking-tight uppercase">
            {schoolName}
          </h2>
          <p className="text-xs font-bold text-slate-500">Academic Session: 2026-2027</p>
        </div>

        <div className="w-48 hidden md:block"></div>
      </div>

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
        {studentCountWarning && studentCountWarning.show && (
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
        {hasZeroStudents ? (
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
            <div className="p-4 rounded-xl bg-amber-50 border-l-4 border-amber-500 text-amber-800 flex justify-between items-center text-xs font-semibold">
              <div>
                <span className="text-base mr-1.5">⏰</span>
                {paymentStatus?.message || 'Your subscription period has ended. Please renew your billing cycle.'}
              </div>
            </div>

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
                    onPaymentSubmit={handlePaymentSubmit}
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
                    <span className="text-lg font-bold text-gray-800 block mt-0.5">{subStatus.daysRemaining} Days</span>
                  </div>
                  <div className="p-3 rounded-lg text-left bg-[#f5f6fa] border border-[#ebedf0]">
                    <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider block">Expires On</span>
                    <span className="text-lg font-bold text-gray-800 block mt-0.5">
                      {subStatus.planEndDate ? subStatus.planEndDate.toLocaleDateString('en-IN') : (nextPaymentDate ? new Date(nextPaymentDate).toLocaleDateString('en-IN') : '—')}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg text-left text-[11px] text-gray-500 max-w-md mx-auto leading-relaxed bg-blue-50 border border-blue-200">
                  ℹ️ Payment options will automatically appear <strong>3 days before expiration</strong> (on {subStatus.planEndDate ? getRenewalStartDateStr(subStatus.planEndDate) : '—'}).
                </div>
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <StudentCountCard studentCount={studentCount} />
            </div>
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
    </div>
  )
}

export default ClientSubscription
