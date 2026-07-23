import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientAuthStore } from '../../store/clientAuthStore'
import {
  getClientProfile,
  getClientProducts,
  getClientStudentCount,
  calculateSubscription,
  getClientCustomizationRequests,
  getClientPaymentStatus,
  getClientPaymentHistory,
  getClientCustomPaymentHistory,
  getClientAddonHistory,
  getClientPendingCustomizationPayments,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  createCustomizationPaymentOrder,
  verifyCustomizationPayment,
  createAddonPaymentOrder,
  verifyAddonPayment,
  getClientAddonCart,
  createUnifiedOrder,
  verifyUnifiedPayment
} from '../../api/clientPortal'
import { isSaasClient } from '../../utils/subscription'

const ClientProducts = () => {
  const navigate = useNavigate()
  const {
    clientToken,
    clientUser,
    isClientAuthenticated,
    profileData,
    productData,
    profileFetched,
    productsFetched,
    setProfileData,
    setProductData,
    clientLogout,
  } = useClientAuthStore()

  const [loading, setLoading] = useState(!productsFetched || !profileFetched)
  const [error, setError] = useState('')
  const [studentCountData, setStudentCountData] = useState(null)
  const [customRequestsCount, setCustomRequestsCount] = useState(0)
  const [extraStudentsOverdue, setExtraStudentsOverdue] = useState(0)
  const [pendingCustomTotal, setPendingCustomTotal] = useState(0)
  const [pendingCustomRequests, setPendingCustomRequests] = useState([])
  const [paidCustomCount, setPaidCustomCount] = useState(0)
  const [pendingCustomCount, setPendingCustomCount] = useState(0)
  const [paidAddonCount, setPaidAddonCount] = useState(0)
  const [pendingAddonCount, setPendingAddonCount] = useState(0)
  const [pendingAddonTotal, setPendingAddonTotal] = useState(0)
  const [pendingAddonRequests, setPendingAddonRequests] = useState([])

  // Future Growth Calculator states
  const [calcStudents, setCalcStudents] = useState(250)

  // Dynamically fetched cycle rates from API
  const [cycleRates, setCycleRates] = useState({
    monthly: { discount: 0, baseRate: null, multiplier: 1 },
    quarterly: { discount: 5, baseRate: null, multiplier: 3 },
    'half-yearly': { discount: 10, baseRate: null, multiplier: 6 },
    yearly: { discount: 20, baseRate: null, multiplier: 12 }
  })

  // Payment status and unified history
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [rechargeHistory, setRechargeHistory] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [addonServicesCount, setAddonServicesCount] = useState(0)

  // Subscription plan selector states
  const [selectedCycle, setSelectedCycle] = useState('yearly')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Pay Bill Modal states
  const [showPayModal, setShowPayModal] = useState(false)
  const [payProcessing, setPayProcessing] = useState(false)
  const [payError, setPayError] = useState('')
  const [paySuccess, setPaySuccess] = useState('')

  const cycleOptions = [
    { key: 'yearly', label: 'Annual', labelShort: 'Annual' },
    { key: 'half-yearly', label: 'Half Year', labelShort: 'Half Year' },
    { key: 'quarterly', label: 'Quarterly', labelShort: 'Quarterly' },
    { key: 'monthly', label: 'Monthly', labelShort: 'Monthly' }
  ]

  const syncStudentCount = async () => {
    if (!isClientAuthenticated || !clientToken) return
    try {
      const res = await getClientStudentCount(clientToken)
      console.log('[DEBUG] getClientStudentCount response:', res)
      if (res?.success && res?.data) {
        setStudentCountData(res.data)
        if (res.data.student_count) {
          setCalcStudents(parseInt(res.data.student_count, 10) || 250)
        }
      }
    } catch (err) {
      console.error('Error syncing student count:', err)
      if (err.response?.status === 401) {
        clientLogout()
      }
    }
  }

  const syncProfile = async () => {
    if (!isClientAuthenticated || !clientToken) return
    try {
      const res = await getClientProfile(clientToken)
      const newProfile = res?.data || res?.profile || res || null
      if (newProfile) {
        setProfileData(newProfile)
      }
    } catch (err) {
      console.error('Error syncing client profile:', err)
      if (err.response?.status === 401) {
        clientLogout()
      }
    }
  }

  const syncProducts = async () => {
    if (!isClientAuthenticated || !clientToken) return
    try {
      const res = await getClientProducts(clientToken)
      const raw = res?.data?.products || res?.products || res?.data || res
      let newProducts = []
      if (Array.isArray(raw)) {
        newProducts = raw
      } else if (raw && typeof raw === 'object') {
        newProducts = [raw]
      }
      setProductData(newProducts)
      setError('')
    } catch (err) {
      console.error('Error syncing products:', err)
      if (err.response?.status === 401) {
        clientLogout()
      } else if (!productData) {
        setError(err?.response?.data?.message || 'Failed to fetch products list.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch dynamic calculations for the 4 cycles to parse rate & discount percentages set by Admin
  const fetchEstimatesData = async () => {
    if (!isClientAuthenticated || !clientToken) return
    try {
      const cyclesList = ['monthly', 'quarterly', 'half_yearly', 'annual']
      const promises = cyclesList.map(cycle =>
        calculateSubscription(cycle, clientToken).catch(() => null)
      )
      const results = await Promise.all(promises)
      console.log('[DEBUG] calculateSubscription results:', results)

      const newRates = { ...cycleRates }
      let maxExtraStudents = 0
      results.forEach((res, idx) => {
        const cycle = cyclesList[idx]
        if (res?.success && res?.data?.calculation) {
          const calc = res.data.calculation
          const baseRate = calc.student_count > 0 ? (calc.base_monthly_amount / calc.student_count) : 10

          // extra_students_overdue is the dedicated field from backend
          if (calc.extra_students_overdue && calc.extra_students_overdue > maxExtraStudents) {
            maxExtraStudents = calc.extra_students_overdue
          }
          // When is_extra_students_payment=true, calc.student_count IS the new students count
          else if (calc.is_extra_students_payment && calc.student_count > maxExtraStudents) {
            maxExtraStudents = calc.student_count
          }

          // Map backend cycle names to local state keys
          const stateKey = cycle === 'half_yearly' ? 'half-yearly' : (cycle === 'annual' ? 'yearly' : cycle)

          const baseMonthly = Number(calc.base_monthly_amount) || 0
          const carryoverFrac = Number(calc.carryover_fraction) || 0
          const cycleMonths = Number(calc.cycle_months) || 1
          const disc = Number(calc.discount_percentage) || 0
          
          const discountedMonthly = baseMonthly * (1 - disc / 100)
          const carryoverAmt = discountedMonthly * carryoverFrac
          const regularAmt = discountedMonthly * cycleMonths
          
          const computedSubtotal = Number((carryoverAmt + regularAmt).toFixed(2))

          newRates[stateKey] = {
            discount: calc.discount_percentage || 0,
            baseRate: baseRate || 10,
            multiplier: calc.multiplier || (cycle === 'monthly' ? 1 : cycle === 'quarterly' ? 3 : cycle === 'half_yearly' ? 6 : 12),
            totalAmount: computedSubtotal,
            totalAmountWithGst: calc.total_amount || 0,
            gstAmount: calc.gst_amount || 0,
            isExtraStudentsPayment: calc.is_extra_students_payment || false,
            carryoverDays: calc.carryover_days || 0,
            carryoverAmount: Number(carryoverAmt.toFixed(2))
          }
        }
      })
      setExtraStudentsOverdue(maxExtraStudents)
      setCycleRates(newRates)
    } catch (err) {
      console.error('Error fetching cycle rates from API:', err)
    }
  }

  const syncCustomizations = async () => {
    if (!isClientAuthenticated || !clientToken) return
    try {
      const res = await getClientCustomizationRequests(clientToken)
      if (res?.success && res?.data?.requests) {
        setCustomRequestsCount(res.data.requests.length)
      } else {
        const saved = localStorage.getItem('client_customizations')
        if (saved) {
          const list = JSON.parse(saved)
          setCustomRequestsCount(list.length)
        } else {
          setCustomRequestsCount(0)
        }
      }
    } catch (err) {
      console.error('Error syncing customizations:', err)
    }
  }

  const syncAllHistories = async () => {
    if (!isClientAuthenticated || !clientToken) return
    try {
      const statusRes = await getClientPaymentStatus(clientToken).catch(() => null)
      if (statusRes?.success) {
        setPaymentStatus(statusRes.data)
      }

      const [subRes, custRes, addonRes, pendingCustRes, cartRes] = await Promise.all([
        getClientPaymentHistory(clientToken).catch(() => null),
        getClientCustomPaymentHistory(clientToken).catch(() => null),
        getClientAddonHistory(clientToken).catch(() => null),
        getClientPendingCustomizationPayments(clientToken).catch(() => null),
        getClientAddonCart(clientToken).catch(() => null)
      ])

      const subPayments = subRes?.success ? (subRes.data?.payments || []) : []
      const custPayments = custRes?.success ? (custRes.data?.payments || []) : []
      const addonPayments = addonRes?.success ? (addonRes.data || []) : []

      console.log('[Debug] pendingCustRes full response:', JSON.stringify(pendingCustRes, null, 2))
      if (pendingCustRes?.success) {
        // Try multiple possible field names the API may return
        const pendingList =
          pendingCustRes.data?.pending_requests ||
          pendingCustRes.data?.pending_payments ||
          pendingCustRes.data?.items ||
          pendingCustRes.data?.data ||
          (Array.isArray(pendingCustRes.data) ? pendingCustRes.data : null) ||
          []

        const filteredPending = pendingList.filter(req => {
          const inHistory = custPayments.some(p =>
            Number(p.customization_request_id) === Number(req.id) ||
            Number(p.request_id) === Number(req.id) ||
            Number(p.customization_id) === Number(req.id) ||
            (p.customization_text && req.customization_text && p.customization_text === req.customization_text)
          )
          return !inHistory
        })

        if (filteredPending.length > 0) {
          setPendingCustomRequests(filteredPending)
          setPendingCustomCount(filteredPending.length)
          const total = filteredPending.reduce((sum, req) => {
            // Store BASE amount only — GST is added separately in the payment modal
            const baseAmt =
              Number(req.amount) ||
              Number(req.amount_value) ||
              Number(req.base_amount) ||
              Number(req.quote_amount) ||
              Number(req.price) ||
              (Number(req.total_amount) > 0 ? Math.round(Number(req.total_amount) / 1.18) : 0)
            return sum + baseAmt
          }, 0)
          setPendingCustomTotal(Number(total.toFixed(2)))
        } else {
          setPendingCustomRequests([])
          setPendingCustomCount(0)
          setPendingCustomTotal(0)
        }
      } else {
        setPendingCustomRequests([])
        setPendingCustomCount(0)
        setPendingCustomTotal(0)
      }

      const unifiedList = []

      subPayments.forEach(p => {
        unifiedList.push({
          id: p.id,
          invoiceNo: p.razorpay_payment_id || `pay_sub_${p.id}`,
          paymentDate: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '—',
          paymentType: 'Subscription',
          validTill: p.period_end ? new Date(p.period_end).toISOString().split('T')[0] : '—',
          amount: p.amount,
          rawType: 'subscription',
          raw: p
        })
      })

      custPayments.forEach(p => {
        const rawDate = p.created_at || p.payment_date || p.submitted_at || p.date
        unifiedList.push({
          id: p.id,
          invoiceNo: p.razorpay_payment_id || `pay_cust_${p.id}`,
          paymentDate: rawDate ? new Date(rawDate).toISOString().split('T')[0] : '—',
          paymentType: 'Customization',
          validTill: 'One-time',
          amount: p.amount || p.total_amount || 0,
          rawType: 'customization',
          raw: p
        })
      })

      addonPayments.forEach(p => {
        let pDate = '—'
        if (p.payment_date_formatted) {
          try {
            const d = new Date(p.payment_date_formatted)
            if (!isNaN(d.getTime())) {
              pDate = d.toISOString().split('T')[0]
            } else {
              pDate = p.payment_date_formatted
            }
          } catch {
            pDate = p.payment_date_formatted
          }
        } else if (p.created_at) {
          pDate = new Date(p.created_at).toISOString().split('T')[0]
        }

        let eDate = '—'
        if (p.end_date_formatted) {
          try {
            const d = new Date(p.end_date_formatted)
            if (!isNaN(d.getTime())) {
              eDate = d.toISOString().split('T')[0]
            } else {
              eDate = p.end_date_formatted
            }
          } catch {
            eDate = p.end_date_formatted
          }
        }

        unifiedList.push({
          id: p.payment_id || `pay_addon_${p.id || Math.random()}`,
          invoiceNo: p.payment_id || `pay_addon_${p.id || Math.random()}`,
          paymentDate: pDate,
          paymentType: `Add-on: ${p.addon_type}`,
          validTill: eDate,
          amount: p.amount,
          rawType: 'addon',
          raw: p
        })
      })

      unifiedList.sort((a, b) => {
        const dA = new Date(a.paymentDate)
        const dB = new Date(b.paymentDate)
        if (isNaN(dA.getTime())) return 1
        if (isNaN(dB.getTime())) return -1
        return dB - dA
      })

      setRechargeHistory(unifiedList)
      setPaidCustomCount(custPayments.length)

      const paidAddonList = addonPayments.filter(p => p.payment_status === 'paid' || p.payment_status === 'success' || !p.payment_status)
      const cartItems = cartRes?.success ? (cartRes.data?.items || []) : []

      setPaidAddonCount(paidAddonList.length)
      setPendingAddonCount(cartItems.length)
      setPendingAddonRequests(cartItems)

      const addTotal = cartItems.reduce((sum, req) => {
        const baseAmt =
          Number(req.subtotal) ||
          Number(req.base_amount) ||
          Number(req.amount) ||
          Number(req.price) ||
          0
        return sum + baseAmt
      }, 0)

      setPendingAddonTotal(Number(addTotal.toFixed(2)))
      setAddonServicesCount(paidAddonList.length)
    } catch (err) {
      console.error('Error combining histories:', err)
    }
  }

  const downloadInvoice = (item) => {
    const { rawType, raw } = item
    let invoiceTitle = 'AIM Digitalise Invoice'
    let billContent = ''

    const clientName = displayUser?.client_name || displayUser?.name || 'Client Name'
    const clientId = displayUser?.client_id || 'Client ID'
    const schoolName = displayUser?.school_name || displayUser?.company_name || displayUser?.organization || 'Demo School'

    let today = new Date()
    try {
      const d = new Date(item.paymentDate)
      if (!isNaN(d.getTime())) {
        today = d
      }
    } catch (e) {
      console.error(e)
    }
    const invoiceDate = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const invoiceNumber = item.invoiceNo

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

    if (rawType === 'subscription') {
      invoiceTitle = `Subscription Invoice ${invoiceNumber}`
      const baseAmount = item.amount / 1.18
      const gstAmount = item.amount - baseAmount
      const cycleName = raw.cycle || 'Monthly'

      billContent = `
        <div class="bill-container">
          <div class="bill-header">
            <div class="logo-circle">A</div>
            <div class="company-info">
              <h2>AIM Digitalise</h2>
              #139, 3rd Floor, Rajdanga Main Road,<br/>
              Kolkata, West Bangal - 700107<br/>
              GSTIN: 19ABCCA9672L1Z0<br/>
              Email: support@aimdigitalise.com
            </div>
          </div>
          
          <div class="invoice-divider-container">
            <div class="invoice-divider-line"></div>
            <div class="invoice-divider-text">PROFORMA INVOICE</div>
            <div class="invoice-divider-line"></div>
          </div>
          
          <div class="invoice-grid-section">
            <div class="invoice-left-side">
              <div class="address-block">
                <h4>Bill To</h4>
                <div class="client-highlight-name">${clientName}</div>
                <p>
                  <strong>ID:</strong> ${clientId}<br/>
                  <strong>School:</strong> ${schoolName}<br/>
                  Registered Address: Noida, Uttar Pradesh, India
                </p>
              </div>
              <div class="address-block">
                <h4>Ship To</h4>
                <div class="client-highlight-name">${schoolName}</div>
                <p>
                  Noida, Uttar Pradesh, India
                </p>
              </div>
            </div>
            
            <div class="invoice-right-side">
              <table class="meta-table">
                <tr>
                  <td class="meta-label">Invoice#</td>
                  <td class="meta-value" style="font-family: monospace; font-weight: bold; color: #c25e17;">${invoiceNumber}</td>
                </tr>
                <tr>
                  <td class="meta-label">Invoice Date</td>
                  <td class="meta-value">${invoiceDate}</td>
                </tr>
                <tr>
                  <td class="meta-label">Terms</td>
                  <td class="meta-value">Due on Receipt</td>
                </tr>
                <tr>
                  <td class="meta-label">Due Date</td>
                  <td class="meta-value">${invoiceDate}</td>
                </tr>
              </table>
            </div>
          </div>

          <table class="bill-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item & Description</th>
                <th style="text-align: right;">Qty</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="cell-center">1</td>
                <td>
                  <div class="item-title">📆 Subscription Fee</div>
                  <div class="item-desc">
                    Academic portal system subscription.<br/>
                    Billing Period: ${raw.period_start || '—'} to ${raw.period_end || '—'} (Cycle: ${cycleName})
                  </div>
                </td>
                <td class="cell-right">1.00</td>
                <td class="cell-right">₹${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="cell-right" style="font-weight: bold;">₹${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div class="invoice-bottom-section">
            <div class="terms-section">
              <div class="thanks-msg">Thanks for your business.</div>
              <h5>Terms & Conditions</h5>
              <p>All payments must be made in full before the activation of any services.</p>
              <p style="font-size: 10px; color: #cbd5e1; margin-top: 8px;">This is a computer generated invoice and does not require a physical signature.</p>
            </div>
            
            <div class="summary-section">
              <table class="summary-table">
                <tr>
                  <td>Sub Total</td>
                  <td>₹${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td>GST Tax (18%)</td>
                  <td>₹${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr class="total-row">
                  <td>Total</td>
                  <td>₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </table>
              
              <div class="balance-due-bar">
                <span>Balance Due</span>
                <span>₹0.00</span>
              </div>
            </div>
          </div>
        </div>
      `
    } else if (rawType === 'customization') {
      invoiceTitle = `Customization Invoice ${invoiceNumber}`
      const baseAmount = item.amount / 1.18
      const gstAmount = item.amount - baseAmount
      const customizationText = raw.customization_text || 'Custom Upgrade Service'

      billContent = `
        <div class="bill-container">
          <div class="bill-header">
            <div class="logo-circle">A</div>
            <div class="company-info">
              <h2>AIM Digitalise</h2>
              #139, 3rd Floor, Rajdanga Main Road,<br/>
              Kolkata, West Bangal - 700107<br/>
              GSTIN: 19ABCCA9672L1Z0<br/>
              Email: support@aimdigitalise.com
            </div>
          </div>

          <div class="invoice-divider-container">
            <div class="invoice-divider-line"></div>
            <div class="invoice-divider-text">PROFORMA INVOICE</div>
            <div class="invoice-divider-line"></div>
          </div>

          <div class="invoice-grid-section">
            <div class="invoice-left-side">
              <div class="address-block">
                <h4>Bill To</h4>
                <div class="client-highlight-name">${clientName}</div>
                <p>
                  <strong>ID:</strong> ${clientId}<br/>
                  <strong>School:</strong> ${schoolName}<br/>
                  Registered Address: Noida, Uttar Pradesh, India
                </p>
              </div>
              <div class="address-block">
                <h4>Ship To</h4>
                <div class="client-highlight-name">${schoolName}</div>
                <p>
                  Noida, Uttar Pradesh, India
                </p>
              </div>
            </div>
            
            <div class="invoice-right-side">
              <table class="meta-table">
                <tr>
                  <td class="meta-label">Invoice#</td>
                  <td class="meta-value" style="font-family: monospace; font-weight: bold; color: #c25e17;">${invoiceNumber}</td>
                </tr>
                <tr>
                  <td class="meta-label">Invoice Date</td>
                  <td class="meta-value">${invoiceDate}</td>
                </tr>
                <tr>
                  <td class="meta-label">Terms</td>
                  <td class="meta-value">Due on Receipt</td>
                </tr>
                <tr>
                  <td class="meta-label">Due Date</td>
                  <td class="meta-value">${invoiceDate}</td>
                </tr>
              </table>
            </div>
          </div>

          <div style="margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 4px; border: 1px dashed #c25e17; font-size: 13px;">
            <strong style="color: #c25e17;">Customization Description:</strong>
            <p style="color: #475569; margin-top: 6px; line-height: 1.5; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; white-space: pre-wrap;">${customizationText}</p>
          </div>

          <table class="bill-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item & Description</th>
                <th style="text-align: right;">Qty</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="cell-center">1</td>
                <td>
                  <div class="item-title">🎨 Custom Software Feature / Modification</div>
                  <div class="item-desc">Custom software modifications and code rollout as requested.</div>
                </td>
                <td class="cell-right">1.00</td>
                <td class="cell-right">₹${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="cell-right" style="font-weight: bold;">₹${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div class="invoice-bottom-section">
            <div class="terms-section">
              <div class="thanks-msg">Thanks for your business.</div>
              <h5>Terms & Conditions</h5>
              <p>All payments must be made in full before the activation of any services.</p>
              <p style="font-size: 10px; color: #cbd5e1; margin-top: 8px;">This is a computer generated invoice and does not require a physical signature.</p>
            </div>
            
            <div class="summary-section">
              <table class="summary-table">
                <tr>
                  <td>Sub Total</td>
                  <td>₹${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td>GST Tax (18%)</td>
                  <td>₹${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr class="total-row">
                  <td>Total</td>
                  <td>₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </table>
              
              <div class="balance-due-bar">
                <span>Balance Due</span>
                <span>₹0.00</span>
              </div>
            </div>
          </div>
        </div>
      `
    } else if (rawType === 'addon') {
      invoiceTitle = `Add-on Invoice ${invoiceNumber}`
      const baseAmount = raw.subtotal || (item.amount / 1.18)
      const gstAmount = raw.gst_amount || (item.amount - baseAmount)
      const addonType = raw.addon_type || 'Add-on Service'
      const count = raw.student_count || raw.teacher_count || '1'
      const countLabel = raw.recipient_type === 'teacher' ? 'Staff' : 'Students'

      billContent = `
        <div class="bill-container">
          <div class="bill-header">
            <div class="logo-circle">A</div>
            <div class="company-info">
              <h2>AIM Digitalise</h2>
              #139, 3rd Floor, Rajdanga Main Road,<br/>
              Kolkata, West Bangal - 700107<br/>
              GSTIN: 19ABCCA9672L1Z0<br/>
              Email: support@aimdigitalise.com
            </div>
          </div>

          <div class="invoice-divider-container">
            <div class="invoice-divider-line"></div>
            <div class="invoice-divider-text">PROFORMA INVOICE</div>
            <div class="invoice-divider-line"></div>
          </div>

          <div class="invoice-grid-section">
            <div class="invoice-left-side">
              <div class="address-block">
                <h4>Bill To</h4>
                <div class="client-highlight-name">${clientName}</div>
                <p>
                  <strong>ID:</strong> ${clientId}<br/>
                  <strong>School:</strong> ${schoolName}<br/>
                  Registered Address: Noida, Uttar Pradesh, India
                </p>
              </div>
              <div class="address-block">
                <h4>Ship To</h4>
                <div class="client-highlight-name">${schoolName}</div>
                <p>
                  Noida, Uttar Pradesh, India
                </p>
              </div>
            </div>
            
            <div class="invoice-right-side">
              <table class="meta-table">
                <tr>
                  <td class="meta-label">Invoice#</td>
                  <td class="meta-value" style="font-family: monospace; font-weight: bold; color: #c25e17;">${invoiceNumber}</td>
                </tr>
                <tr>
                  <td class="meta-label">Invoice Date</td>
                  <td class="meta-value">${invoiceDate}</td>
                </tr>
                <tr>
                  <td class="meta-label">Terms</td>
                  <td class="meta-value">Due on Receipt</td>
                </tr>
                <tr>
                  <td class="meta-label">Due Date</td>
                  <td class="meta-value">${invoiceDate}</td>
                </tr>
              </table>
            </div>
          </div>

          <table class="bill-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item & Description</th>
                <th style="text-align: right;">Qty</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="cell-center">1</td>
                <td>
                  <div class="item-title">🔌 Add-on: ${addonType}</div>
                  <div class="item-desc">
                    Additional module activation.<br/>
                    Billing Period: ${raw.start_date_formatted || '—'} to ${raw.end_date_formatted || '—'}
                  </div>
                </td>
                <td class="cell-right">${parseFloat(count).toFixed(2)}</td>
                <td class="cell-right">₹${(baseAmount / count).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="cell-right" style="font-weight: bold;">₹${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div class="invoice-bottom-section">
            <div class="terms-section">
              <div class="thanks-msg">Thanks for your business.</div>
              <h5>Terms & Conditions</h5>
              <p>All payments must be made in full before the activation of any services.</p>
              <p style="font-size: 10px; color: #cbd5e1; margin-top: 8px;">This is a computer generated invoice and does not require a physical signature.</p>
            </div>
            
            <div class="summary-section">
              <table class="summary-table">
                <tr>
                  <td>Sub Total</td>
                  <td>₹${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td>GST Tax (18%)</td>
                  <td>₹${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr class="total-row">
                  <td>Total</td>
                  <td>₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </table>
              
              <div class="balance-due-bar">
                <span>Balance Due</span>
                <span>₹0.00</span>
              </div>
            </div>
          </div>
        </div>
      `
    }

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${invoiceTitle}</title>
          ${style}
        </head>
        <body>
          ${billContent}
        </body>
      </html>
    `

    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Invoice_${invoiceNumber}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    syncProfile()
    syncStudentCount()
    syncCustomizations()
    fetchEstimatesData()
    syncAllHistories()
  }, [clientToken, isClientAuthenticated])

  useEffect(() => {
    const latestSub = rechargeHistory.find(p => p.rawType === 'subscription')
    const activeCycle = latestSub?.raw?.cycle || paymentStatus?.delivery_info?.last_payment_cycle
    if (activeCycle) {
      const lastCycle = activeCycle.toLowerCase()
      if (lastCycle === 'annual' || lastCycle === 'yearly') {
        setSelectedCycle('yearly')
      } else if (lastCycle === 'half_yearly' || lastCycle === 'half-yearly') {
        setSelectedCycle('half-yearly')
      } else if (lastCycle === 'quarterly') {
        setSelectedCycle('quarterly')
      } else if (lastCycle === 'monthly') {
        setSelectedCycle('monthly')
      }
    }
  }, [rechargeHistory, paymentStatus])

  useEffect(() => {
    if (isClientAuthenticated && clientToken) {
      const apiCycle = selectedCycle === 'yearly' ? 'annual' : (selectedCycle === 'half-yearly' ? 'half_yearly' : selectedCycle)
      calculateSubscription(apiCycle, clientToken).catch(err => console.error('Error calculating subscription:', err))
    }
  }, [selectedCycle, clientToken, isClientAuthenticated])

  useEffect(() => {
    if (!productsFetched) setLoading(true)
    syncProducts()
  }, [clientToken, isClientAuthenticated, productsFetched])

  // Safe debug log before any conditional early returns
  useEffect(() => {
    console.log('[DEBUG DATES] productData:', productData)
    console.log('[DEBUG DATES] profileData:', profileData)
    console.log('[DEBUG DATES] paymentStatus:', paymentStatus)
  }, [productData, profileData, paymentStatus])

  // Dynamic sandbox price calculations based on slider student volume
  const estimates = useMemo(() => {
    const num = Number(calcStudents) || 0
    
    const localDisplayUser = profileData || clientUser || {}
    const localDisplayProducts = productData || []
    const localActiveProduct = localDisplayProducts[0] || {}
    const localProductName = localActiveProduct?.name || localActiveProduct?.product_name || localDisplayUser?.product_name || 'NEXGN Software'
    const localIsInstitutePro = localProductName.toLowerCase().includes('institute pro') || localProductName.toLowerCase().includes('nexgn')
    const localIsNexgnSaas = isSaasClient(localDisplayUser) || isSaasClient(localActiveProduct) || localProductName.toLowerCase().includes('nexgn')
    const localSubscriptionPrice = localActiveProduct?.monthly_subscription || localDisplayUser?.monthly_subscription || 3299

    const currentStudentRate = (() => {
      if (localIsNexgnSaas || localIsInstitutePro) {
        if (cycleRates[selectedCycle]?.baseRate) {
          return cycleRates[selectedCycle].baseRate
        }
        const totalStudents = studentCountData?.student_count || localActiveProduct?.total_students || 1
        const monthlySub = localActiveProduct?.monthly_subscription || localDisplayUser?.monthly_subscription || 2500
        return totalStudents > 0 ? (Number(monthlySub) / totalStudents) : 10
      }
      return localSubscriptionPrice
    })()

    return [
      {
        duration: '1 Month',
        title: 'Monthly Plan',
        pricePerStudent: cycleRates.monthly.baseRate || currentStudentRate,
        discount: cycleRates.monthly.discount,
        multiplier: cycleRates.monthly.multiplier,
        badge: 'Short-term'
      },
      {
        duration: '3 Months',
        title: 'Quarterly Plan',
        pricePerStudent: (cycleRates.quarterly.baseRate || currentStudentRate) * (1 - cycleRates.quarterly.discount / 100),
        discount: cycleRates.quarterly.discount,
        multiplier: cycleRates.quarterly.multiplier,
        badge: 'Popular'
      },
      {
        duration: '6 Months',
        title: 'Half-Yearly Plan',
        pricePerStudent: (cycleRates['half-yearly'].baseRate || currentStudentRate) * (1 - cycleRates['half-yearly'].discount / 100),
        discount: cycleRates['half-yearly'].discount,
        multiplier: cycleRates['half-yearly'].multiplier,
        badge: 'Recommended'
      },
      {
        duration: '12 Months',
        title: 'Yearly Plan',
        pricePerStudent: (cycleRates.yearly.baseRate || currentStudentRate) * (1 - cycleRates.yearly.discount / 100),
        discount: cycleRates.yearly.discount,
        multiplier: cycleRates.yearly.multiplier,
        badge: 'Best Value'
      }
    ].map(plan => {
      const baseTermCost = num * plan.pricePerStudent * plan.multiplier
      const gstAmount = baseTermCost * 0.18 // 18% GST
      return {
        ...plan,
        total: Math.round(baseTermCost + gstAmount),
        savings: plan.discount > 0 ? `${plan.discount}% Off` : 'Base Rate'
      }
    })
  }, [calcStudents, cycleRates, selectedCycle, studentCountData, profileData, clientUser, productData])

  // Pagination
  const itemsPerPage = 10
  const totalPages = Math.ceil(rechargeHistory.length / itemsPerPage)
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return rechargeHistory.slice(start, start + itemsPerPage)
  }, [rechargeHistory, currentPage])

  if (loading && !profileData && !productData) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  const displayUser = profileData || clientUser || {}
  const displayProducts = productData || []
  const activeProduct = displayProducts[0] || {}

  const companyName = displayUser?.company_name || displayUser?.school_name || displayUser?.organization || 'Demo Pvt.Ltd'
  const productName = activeProduct?.product_name || activeProduct?.name || displayUser?.product_name || 'NEXGN Hotel Pro'
  const isInstitutePro = productName.toLowerCase().includes('institute pro')

  const getOrderField = (obj, field) => {
    if (!obj || typeof obj !== 'object') return null;
    
    // Check client_order or other standard keys directly
    const orderObj = obj.client_order || 
                     (Array.isArray(obj.client_orders) ? obj.client_orders[0] : obj.client_orders) ||
                     obj.order ||
                     (Array.isArray(obj.orders) ? obj.orders[0] : obj.orders);
                     
    if (orderObj && typeof orderObj === 'object' && orderObj[field]) {
      return orderObj[field];
    }
    
    return obj[field] || null;
  };

  const activationDateStr = (() => {
    let rawDate = getOrderField(activeProduct, 'created_at') ||
                  getOrderField(displayUser, 'created_at') ||
                  getOrderField(paymentStatus?.delivery_info, 'created_at');

    if (!rawDate || rawDate === activeProduct?.created_at || rawDate === displayUser?.created_at) {
      rawDate = activeProduct?.activated_at || displayUser?.activated_at || rawDate;
    }

    if (rawDate) {
      try {
        return new Date(rawDate).toISOString().split('T')[0]
      } catch {
        return 'Pending'
      }
    }
    return 'Pending'
  })()

  const deliveryDateStr = (() => {
    const rawDate = getOrderField(activeProduct, 'delivery_date') ||
                    getOrderField(displayUser, 'delivery_date') ||
                    getOrderField(paymentStatus?.delivery_info, 'delivery_date') ||
                    paymentStatus?.delivery_info?.delivery_date;

    if (rawDate) {
      try {
        return new Date(rawDate).toISOString().split('T')[0]
      } catch {
        return 'Pending'
      }
    }
    return 'Pending'
  })()

  const securityDeposit = activeProduct?.processing_fee || displayUser?.processing_fee || 3299
  const subscriptionPrice = activeProduct?.monthly_subscription || displayUser?.monthly_subscription || 3299

  const isNexgnSaas = isSaasClient(displayUser) || isSaasClient(activeProduct) || productName.toLowerCase().includes('nexgn')

  // Calculate student unit rate dynamically (total fee / total students)
  const currentStudentRate = (() => {
    if (isNexgnSaas || isInstitutePro) {
      if (cycleRates[selectedCycle]?.baseRate) {
        return cycleRates[selectedCycle].baseRate
      }
      const totalStudents = studentCountData?.student_count || activeProduct?.total_students || 1
      const monthlySub = activeProduct?.monthly_subscription || displayUser?.monthly_subscription || 2500
      return totalStudents > 0 ? (Number(monthlySub) / totalStudents) : 10
    }
    return subscriptionPrice
  })()

  const hasMadePayment = !!paymentStatus?.delivery_info?.last_payment_date
  const isSubscriptionOverdue = paymentStatus?.show_pay_now === true
  const isPaidAndActive = paymentStatus && !isSubscriptionOverdue && hasMadePayment && pendingCustomTotal === 0 && pendingAddonTotal === 0
  const isOverdue = isSubscriptionOverdue || (pendingCustomTotal > 0) || (pendingAddonTotal > 0)
  const isNeverPaid = !paymentStatus || (!isSubscriptionOverdue && !hasMadePayment)

  // For the 'never paid' fallback, compute using the selected cycle so it updates live when cycle is changed
  const cycleBasedFallback = (() => {
    if (!isInstitutePro) return subscriptionPrice
    const sc = studentCountData?.student_count || 0
    if (sc === 0) return 0
    // Use the already-computed cycleRates for the selected cycle (set from API in fetchEstimatesData)
    const rate = cycleRates[selectedCycle]?.baseRate || currentStudentRate
    const multiplier = cycleRates[selectedCycle]?.multiplier || 1
    const discount = cycleRates[selectedCycle]?.discount || 0
    return Math.round(sc * rate * multiplier * (1 - discount / 100))
  })()

  const subDueAmount = (isSubscriptionOverdue || isNeverPaid)
    ? (cycleRates[selectedCycle]?.totalAmount !== undefined && cycleRates[selectedCycle]?.totalAmount !== null
      ? Number(cycleRates[selectedCycle].totalAmount)
      : (paymentStatus?.delivery_info?.total_due_amount
        ? Number(paymentStatus.delivery_info.total_due_amount)
        : cycleBasedFallback))
    : 0

  const payBillAmount = subDueAmount + pendingCustomTotal + pendingAddonTotal

  const dueBreakdownStr = (() => {
    const parts = []
    if (subDueAmount > 0) parts.push('Subscription')
    if (pendingCustomTotal > 0) parts.push('Customization')
    if (pendingAddonTotal > 0) parts.push('Add-on')
    return parts.length > 0 ? parts.join(' + ') : '—'
  })()

  const rateInfo = cycleRates[selectedCycle] || { discount: 0, multiplier: 1 }
  const currentDiscount = rateInfo.discount
  const currentMultiplier = rateInfo.multiplier
  const students = studentCountData?.student_count || 0
  const priceForSelectedCycle = currentStudentRate * students * currentMultiplier * (1 - currentDiscount / 100)
  // unpaidStudentsCount — how many new students have unpaid subscription fees.
  // Priority 1: from calculateSubscription API (extra_students_overdue)
  // Priority 2: from student-count API delta (student_count - min_students)
  // Priority 3: back-calculate from due amount ÷ per-student rate
  const unpaidStudentsCount = (() => {
    // If fully paid and no overdue — zero new students pending
    if (hasMadePayment && !isSubscriptionOverdue) return 0

    // Priority 1: backend told us explicitly via calculateSubscription
    if (extraStudentsOverdue > 0) return extraStudentsOverdue

    // Priority 2: student-count API has both total and base (min) students
    if (
      studentCountData?.student_count !== undefined &&
      studentCountData?.min_students !== undefined
    ) {
      const diff = studentCountData.student_count - studentCountData.min_students
      if (diff > 0) return diff
    }

    // Priority 3: back-calculate from the due amount using per-student rate
    // subDueAmount = extra_students × perStudentRate × cycleMultiplier × (1-discount) × 1.18 × carryoverFraction(partial period)
    // We don't know carryover fraction, so we use total cycle as upper bound and round to nearest integer
    const baseRate = cycleRates[selectedCycle]?.baseRate || currentStudentRate
    const cycleMultiplier = currentMultiplier || 1
    const discountFactor = 1 - (currentDiscount || 0) / 100
    const gstFactor = 1.18
    // Full-cycle cost per extra student (pre-GST)
    const costPerExtraStudent = baseRate * cycleMultiplier * discountFactor * gstFactor
    if (subDueAmount > 0 && costPerExtraStudent > 0) {
      const derived = Math.round(subDueAmount / costPerExtraStudent)
      if (derived > 0) return derived
    }

    return 0
  })()

  const isCycleDropdownDisabled = hasMadePayment || rechargeHistory.some(p => p.rawType === 'subscription')
  // displayedPlanPrice: always the BASE price (pre-GST). GST is only shown at final payment.
  const displayedPlanPrice = (() => {
    if (hasMadePayment) {
      if (!isSubscriptionOverdue) return 0
      return subDueAmount
    }
    const apiTotal = cycleRates[selectedCycle]?.totalAmount
    if (apiTotal) return apiTotal
    return priceForSelectedCycle
  })()

  // The student count shown in the formula subtitle:
  // - If subscription is overdue for new students → show unpaid student count
  // - Otherwise → show total student count
  const subtitleStudentCount = (isSubscriptionOverdue && unpaidStudentsCount > 0)
    ? unpaidStudentsCount
    : students

  // ─── Razorpay script loader ──────────────────────────────────────────────
  const loadRazorpayScript = () => new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
    document.body.appendChild(script)
  })

  // ─── Auto-download invoice after successful payment ──────────────────────
  const generatePaymentInvoice = (totalPaid, invoiceNo, cycleName) => {
    const baseAmount = Math.round(totalPaid / 1.18)
    const gstAmount = totalPaid - baseAmount
    const clientName = displayUser?.client_name || displayUser?.name || companyName
    const clientId = displayUser?.client_id || '—'
    const invoiceDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

    const html = `<!DOCTYPE html>
<html><head><title>Invoice ${invoiceNo}</title>
<style>
body{font-family:'Segoe UI',sans-serif;background:#f8fafc;padding:20px;color:#1e293b}
.w{max-width:850px;margin:0 auto;padding:40px;background:white;border:1px solid #e2e8f0;border-radius:4px;box-shadow:0 4px 6px rgba(0,0,0,.05)}
.hd{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}
.lc{width:85px;height:85px;background:#c25e17;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:38px;font-weight:800}
.ci{text-align:right;font-size:13px;color:#64748b;line-height:1.5}
.ci h2{font-size:22px;font-weight:700;color:#c25e17;margin:0 0 6px 0}
.dv{display:flex;align-items:center;margin:24px 0}
.dl{flex:1;height:1px;background:#e2e8f0}
.dt{padding:0 16px;font-size:18px;font-weight:700;color:#c25e17;letter-spacing:.05em;text-transform:uppercase}
.gs{display:flex;justify-content:space-between;margin-bottom:30px;gap:30px}
.ab h4{font-size:14px;font-weight:700;color:#64748b;margin:0 0 6px;text-transform:uppercase}
.ab p{font-size:13px;color:#334155;margin:0;line-height:1.5}
.hn{font-size:16px;font-weight:700;color:#c25e17;margin-bottom:4px}
.mt{width:100%;border-collapse:collapse;border:1px solid #e2e8f0;font-size:13px}
.mt td{padding:8px 12px;border:1px solid #e2e8f0}
.ml{background:#c25e17;color:white;font-weight:600;width:45%}
.mv{background:white;color:#475569}
.bt{width:100%;border-collapse:collapse;margin:24px 0;font-size:13px}
.bt th{background:#c25e17;color:white;padding:12px;font-size:12px;font-weight:700;text-transform:uppercase;border:1px solid #c25e17}
.bt td{padding:16px 12px;border:1px solid #e2e8f0;color:#334155;vertical-align:top}
.it{font-weight:700;color:#0f172a;margin-bottom:4px}
.id{font-size:12px;color:#64748b}
.tr{text-align:right}
.bs{display:flex;justify-content:space-between;align-items:flex-start;margin-top:20px;gap:30px}
.ts{width:50%;font-size:12px;line-height:1.6}
.ss{width:45%}
.st{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:13px}
.st td{padding:6px 12px;text-align:right;color:#475569}
.st td:last-child{font-weight:600;color:#0f172a;width:40%}
.tr-total td{font-size:16px;font-weight:800;color:#0f172a;border-top:1px solid #e2e8f0;padding-top:12px}
.bb{background:#c25e17;color:white;display:flex;justify-content:space-between;padding:12px 16px;font-size:15px;font-weight:700;border-radius:2px}
.pb{background:#10b981;color:white;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700}
</style></head>
<body><div class="w">
  <div class="hd"><div class="lc">A</div>
    <div class="ci"><h2>AIM Digitalise</h2>#139, 3rd Floor, Rajdanga Main Road,<br/>Kolkata, West Bengal - 700107<br/>GSTIN: 19ABCCA9672L1Z0<br/>Email: support@aimdigitalise.com</div>
  </div>
  <div class="dv"><div class="dl"></div><div class="dt">TAX INVOICE</div><div class="dl"></div></div>
  <div class="gs">
    <div style="width:55%">
      <div class="ab"><h4>Bill To</h4><div class="hn">${clientName}</div>
        <p><strong>ID:</strong> ${clientId}<br/><strong>School:</strong> ${companyName}<br/>India</p></div>
    </div>
    <div style="width:40%">
      <table class="mt">
        <tr><td class="ml">Invoice#</td><td class="mv" style="font-family:monospace;font-weight:bold;color:#c25e17">${invoiceNo}</td></tr>
        <tr><td class="ml">Invoice Date</td><td class="mv">${invoiceDate}</td></tr>
        <tr><td class="ml">Plan</td><td class="mv">${cycleName}</td></tr>
        <tr><td class="ml">Status</td><td class="mv"><span class="pb">✓ PAID</span></td></tr>
      </table>
    </div>
  </div>
  <table class="bt"><thead><tr>
    <th style="width:5%;text-align:center">#</th>
    <th style="text-align:left">Item &amp; Description</th>
    <th style="text-align:right;width:10%">Qty</th>
    <th style="text-align:right;width:18%">Rate</th>
    <th style="text-align:right;width:18%">Amount</th>
  </tr></thead><tbody><tr>
    <td style="text-align:center">1</td>
    <td><div class="it">📆 Subscription Fee</div>
      <div class="id">Academic portal — ${cycleName} plan · ${subtitleStudentCount} students</div></td>
    <td class="tr">1.00</td>
    <td class="tr">₹${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
    <td class="tr" style="font-weight:bold">₹${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
  </tr></tbody></table>
  <div class="bs">
    <div class="ts">
      <p style="font-style:italic;color:#475569;margin-bottom:12px">Thank you for your payment.</p>
      <h5 style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 6px">Terms &amp; Conditions</h5>
      <p style="color:#64748b">Payments are final and non-refundable as per service agreement.</p>
      <p style="font-size:10px;color:#cbd5e1;margin-top:8px">System-generated invoice. No physical signature required.</p>
    </div>
    <div class="ss">
      <table class="st">
        <tr><td>Sub Total</td><td>₹${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
        <tr><td>GST Tax (18%)</td><td>₹${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
        <tr class="tr-total"><td>Total</td><td>₹${totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
      </table>
      <div class="bb"><span>Balance Due</span><span>₹0.00</span></div>
    </div>
  </div>
</div></body></html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Invoice_${invoiceNo}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ─── Handle Pay Now (Unified checkout flow) ───
  const handlePayNow = async () => {
    setPayProcessing(true)
    setPayError('')
    setPaySuccess('')
    const cycleName = cycleOptions.find(c => c.key === selectedCycle)?.label || selectedCycle
    const apiCycle = selectedCycle === 'yearly' ? 'annual' : (selectedCycle === 'half-yearly' ? 'half_yearly' : selectedCycle)

    try {
      const orderRes = await createUnifiedOrder(apiCycle, clientToken)
      if (!orderRes.success) {
        setPayError(orderRes.message || 'Failed to create unified payment order.')
        setPayProcessing(false)
        return
      }

      // ✅ Build subscription payload from backend response — use subscription-specific amount,
      // NOT the total orderRes.amount (which includes customization + addon too).
      // When backend provides orderRes.subscription, use it directly.
      // When backend doesn't provide it but subscription is due, build from local subDueAmount.
      const unifiedSubscriptionPayload = (() => {
        // Case 1: Backend explicitly returned subscription details
        if (orderRes.subscription) {
          return {
            cycle: orderRes.subscription.cycle || apiCycle,
            amount: orderRes.subscription.amount || orderRes.subscription.total_amount || subDueAmount,
            cycle_months: orderRes.subscription.cycle_months || orderRes.cycle_months || (apiCycle === 'annual' ? 12 : (apiCycle === 'half_yearly' ? 6 : (apiCycle === 'quarterly' ? 3 : 1))),
            is_first_payment: orderRes.subscription.is_first_payment !== undefined
              ? orderRes.subscription.is_first_payment
              : (orderRes.is_first_payment !== undefined ? orderRes.is_first_payment : !hasMadePayment),
            has_carryover: orderRes.subscription.has_carryover !== undefined
              ? orderRes.subscription.has_carryover
              : (orderRes.has_carryover || false),
            carryover_from: orderRes.subscription.carryover_from || orderRes.carryover_from || null,
            carryover_to: orderRes.subscription.carryover_to || orderRes.carryover_to || null,
            carryover_days: orderRes.subscription.carryover_days || orderRes.carryover_days || 0,
            student_count: orderRes.subscription.student_count || orderRes.student_count || (studentCountData?.student_count || null),
            is_extra_students_payment: orderRes.subscription.is_extra_students_payment !== undefined
              ? orderRes.subscription.is_extra_students_payment
              : (orderRes.is_extra_students_payment || false),
          }
        }
        // Case 2: Backend didn't return subscription object but subscription IS due locally
        if (subDueAmount > 0) {
          return {
            cycle: orderRes.cycle || apiCycle,
            amount: subDueAmount,
            cycle_months: orderRes.cycle_months || (apiCycle === 'annual' ? 12 : (apiCycle === 'half_yearly' ? 6 : (apiCycle === 'quarterly' ? 3 : 1))),
            is_first_payment: orderRes.is_first_payment !== undefined ? orderRes.is_first_payment : !hasMadePayment,
            has_carryover: orderRes.has_carryover || false,
            carryover_from: orderRes.carryover_from || null,
            carryover_to: orderRes.carryover_to || null,
            carryover_days: orderRes.carryover_days || 0,
            student_count: orderRes.student_count || (studentCountData?.student_count || null),
            is_extra_students_payment: orderRes.is_extra_students_payment || false,
          }
        }
        // Case 3: No subscription due
        return null
      })()

      if (orderRes.simulated) {
        let msg = `SIMULATION MODE - UNIFIED CHECKOUT\n\nTotal Amount: ₹${orderRes.amount}\n`
        if (orderRes.subscription) {
          msg += `• Subscription (${orderRes.subscription.cycle}): ₹${orderRes.subscription.amount}\n`
        }
        if (orderRes.customization) {
          msg += `• Customizations (${orderRes.customization.request_ids?.length || 0} requests): ₹${orderRes.customization.amount}\n`
        }
        if (orderRes.addon) {
          msg += `• Add-ons (${orderRes.addon.items_count || 0} items): ₹${orderRes.addon.amount}\n`
        }
        msg += `\nClick OK to simulate checkout payment.`

        const ok = window.confirm(msg)
        if (ok) {
          const verifyRes = await verifyUnifiedPayment({
            order_id: orderRes.order_id,
            razorpay_payment_id: 'sim_pay_' + Date.now(),
            subscription: unifiedSubscriptionPayload,
            customization: orderRes.customization,
            addon: orderRes.addon
          }, clientToken)

          if (verifyRes.success) {
            setPaySuccess('✅ Unified payment successful!')
            setTimeout(() => {
              setShowPayModal(false)
              setPaySuccess('')
              syncAllHistories()
              fetchEstimatesData()
              syncProfile()
            }, 2500)
          } else {
            setPayError(verifyRes.message || 'Payment verification failed.')
          }
        }
        setPayProcessing(false)
        return
      }

      // ─── Real Razorpay Payment ───
      await loadRazorpayScript()
      const options = {
        key: orderRes.key,
        amount: Math.round(orderRes.amount * 100),
        currency: orderRes.currency || 'INR',
        name: 'AIM Digitalise',
        description: `Unified Payment - ${cycleName}`,
        order_id: orderRes.order_id,
        handler: async (response) => {
          setPaySuccess('Verifying payment...')
          try {
            const verifyRes = await verifyUnifiedPayment({
              order_id: orderRes.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              subscription: unifiedSubscriptionPayload,
              customization: orderRes.customization,
              addon: orderRes.addon
            }, clientToken)

            if (verifyRes.success) {
              setPaySuccess('✅ Unified payment verified successfully!')
              // Reload all states
              await Promise.all([
                syncProfile(),
                syncAllHistories(),
                fetchEstimatesData(),
                syncStudentCount()
              ]).catch(() => null)
              setTimeout(() => {
                setShowPayModal(false)
                setPaySuccess('')
              }, 2500)
            } else {
              setPayError(verifyRes.message || 'Verification failed.')
            }
          } catch (err) {
            setPayError('Verification error: ' + err.message)
          } finally {
            setPayProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            setPayError('Payment cancelled.')
            setPayProcessing(false)
          }
        },
        prefill: {
          name: displayUser?.client_name || displayUser?.name || '',
          email: displayUser?.email || ''
        },
        theme: {
          color: '#1a3c5e'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (r) => {
        setPayError('Payment failed: ' + (r.error?.description || 'Transaction error'))
        setPayProcessing(false)
      })
      rzp.open()

    } catch (err) {
      setPayError(err?.response?.data?.message || err.message || 'Payment initialization failed.')
      setPayProcessing(false)
    }
  }

  // ─── Pay Bill Modal ───────────────────────────────────────────────────────
  const PayBillModal = () => {
    if (!showPayModal) return null

    // Prioritize backend calculated inclusive total if estimates are loaded
    const subPayTotal = (() => {
      if (cycleRates[selectedCycle]?.totalAmountWithGst !== undefined && cycleRates[selectedCycle]?.totalAmountWithGst !== null) {
        return Number(cycleRates[selectedCycle].totalAmountWithGst)
      }
      return Number((subDueAmount * 1.18).toFixed(2))
    })()
    const subGST = Number((subPayTotal - subDueAmount).toFixed(2))

    const custGST = Math.round(pendingCustomTotal * 0.18 * 100) / 100
    const custPayTotal = Number((pendingCustomTotal + custGST).toFixed(2))

    const addonGST = Math.floor(pendingAddonTotal * 0.18 * 100) / 100
    const addonPayTotal = Number((pendingAddonTotal + addonGST).toFixed(2))

    const grandTotal = Number((subPayTotal + custPayTotal + addonPayTotal).toFixed(2))
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const clientName = displayUser?.client_name || displayUser?.name || companyName
    const clientId = displayUser?.client_id || '—'
    const cycleName = cycleOptions.find(c => c.key === selectedCycle)?.label || selectedCycle

    return (
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto" onClick={() => { setShowPayModal(false); setPayError(''); setPaySuccess('') }}>
        <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl my-8 overflow-hidden" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="px-7 py-5 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Payment Summary</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">{today}</p>
            </div>
            <button onClick={() => { setShowPayModal(false); setPayError(''); setPaySuccess('') }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition-colors cursor-pointer">
              ✕
            </button>
          </div>

          {/* Client / Company Info */}
          <div className="px-7 py-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-3 text-[11px]">
            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">Bill To</span>
              <span className="font-black text-slate-800 text-sm block">{clientName}</span>
              <span className="text-slate-500">ID: {clientId}</span>
              <span className="text-slate-400"> · {companyName}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">From</span>
              <span className="font-black text-slate-800 text-sm block">AIM Digitalise</span>
              <span className="text-slate-500">GSTIN: 19ABCCA9672L1Z0</span>
            </div>
          </div>

          {((subDueAmount > 0 ? 1 : 0) + (pendingCustomTotal > 0 ? 1 : 0) + (pendingAddonTotal > 0 ? 1 : 0)) > 1 && (
            <div className="mx-7 mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-semibold leading-relaxed animate-fade-in flex gap-2">
              <span>ℹ️</span>
              <div>
                <strong>Unified Checkout:</strong> All selected services (Subscription, Customizations, and Add-ons) will be processed together in a single payment window.
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="px-7 py-5">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="text-left pb-3 text-slate-400 font-bold uppercase tracking-wider">Item</th>
                  <th className="text-right pb-3 text-slate-400 font-bold uppercase tracking-wider w-24">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subDueAmount > 0 && (
                  <tr>
                    <td className="py-4">
                      <div className="font-bold text-slate-800">📆 Subscription Renewal</div>
                      <div className="text-slate-400 mt-0.5">{cycleName} plan · {subtitleStudentCount} students</div>
                    </td>
                    <td className="text-right py-4 font-mono font-bold text-slate-700">
                      ₹{subDueAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
                {pendingCustomTotal > 0 && (
                  <tr>
                    <td className="py-4">
                      <div className="font-bold text-slate-800">🎨 Customization Services</div>
                      <div className="text-slate-400 mt-0.5">Pending quote(s) payment</div>
                      {pendingCustomRequests.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1.5 pl-3 border-l-2 border-indigo-100">
                          {pendingCustomRequests.map((req, idx) => {
                            const amt = Number(req.base_amount || req.amount || req.quote_amount || 0)
                            return (
                              <div key={idx} className="text-[10px] text-slate-500 font-medium leading-relaxed flex justify-between pr-4">
                                <span>• Request #{req.id}: {req.customization_text}</span>
                                <span className="font-mono text-slate-400 font-semibold ml-2">₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </td>
                    <td className="text-right py-4 font-mono font-bold text-slate-700">
                      ₹{pendingCustomTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
                {pendingAddonTotal > 0 && (
                  <tr>
                    <td className="py-4">
                      <div className="font-bold text-slate-800">🔌 Add-on Services</div>
                      <div className="text-slate-400 mt-0.5">Pending add-on feature payment(s)</div>
                      {pendingAddonRequests.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1.5 pl-3 border-l-2 border-indigo-100">
                          {pendingAddonRequests.map((req, idx) => {
                            const amt = Number(req.subtotal || req.base_amount || req.amount || req.price || 0)
                            return (
                              <div key={idx} className="text-[10px] text-slate-500 font-medium leading-relaxed flex justify-between pr-4">
                                <span>• {req.addon_type} ({req.recipient_type || 'student'})</span>
                                <span className="font-mono text-slate-400 font-semibold ml-2">₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </td>
                    <td className="text-right py-4 font-mono font-bold text-slate-700">
                      ₹{pendingAddonTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals Summary */}
            <div className="mt-4 pt-4 border-t-2 border-slate-100 space-y-2 text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>Sub Total (excl. GST)</span>
                <span className="font-mono">₹{(subDueAmount + pendingCustomTotal + pendingAddonTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total GST (18%)</span>
                <span className="font-mono">₹{(subGST + custGST + addonGST).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-[15px] font-black text-slate-900 pt-3 border-t-2 border-slate-200 mt-1">
                <span>Amount Payable</span>
                <span className="font-mono text-[#c25e17]">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Error / Success banners */}
          {payError && (
            <div className="mx-7 mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-bold animate-fade-in">
              ❌ {payError}
            </div>
          )}
          {paySuccess && (
            <div className="mx-7 mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-[11px] font-bold animate-fade-in">
              {paySuccess}
            </div>
          )}

          {/* Footer */}
          <div className="px-7 pb-7 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[9.5px] text-slate-400 leading-relaxed">
              GST applicable as per govt. regulations. · Payment is non-refundable. · Kicking off both payments sequentially in a single flow.
            </p>
            <div className="flex gap-2.5 shrink-0">
              <button onClick={() => { setShowPayModal(false); setPayError(''); setPaySuccess('') }}
                className="px-4 py-2.5 text-[11px] font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">
                Cancel
              </button>
              {(isSubscriptionOverdue || isNeverPaid || pendingCustomTotal > 0 || pendingAddonTotal > 0) && (
                <button onClick={handlePayNow} disabled={payProcessing}
                  className="px-6 py-2.5 text-[11px] font-black text-white bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 rounded-xl shadow-lg shadow-rose-200 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5">
                  {payProcessing
                    ? <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Processing...</>
                    : <>⚡ Pay Now (₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 select-none animate-fade-in text-slate-700" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Pay Bill Modal */}
      <PayBillModal />

      {/* 1. Portal Heading & Info Section */}
      <div className="bg-linear-to-r from-purple-100 via-indigo-100 to-violet-200 p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{companyName}</h1>
          <p className="text-sm font-bold text-slate-500">{productName}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 pt-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="text-slate-400">Activation Date:</span>
              <strong className="text-[#2563eb]">{activationDateStr}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-400">Delivery Date:</span>
              <strong className="text-[#10b981]">{deliveryDateStr}</strong>
            </span>
          </div>
        </div>

        {isInstitutePro ? (
          <>
            {/* Middle portion: Session */}
            <div className="md:text-center shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Academic Session</span>
              <span className="text-sm font-black text-slate-800 block mt-1 px-4 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                2026-27
              </span>
            </div>
            {/* Right portion: Student Count */}
            <div className="md:text-right shrink-0 flex flex-col sm:items-end justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Student Enrollment</span>
              <div className="flex items-center gap-1.5 sm:justify-end">
                <span className="text-2xl font-black text-slate-800 font-mono">
                  {studentCountData?.student_count !== undefined ? studentCountData.student_count : '0'}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total</span>
              </div>
              <div className="mt-1 flex gap-1">
                {unpaidStudentsCount > 0 ? (
                  <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full tracking-wide">
                    ⚠️ {unpaidStudentsCount} Unpaid
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full tracking-wide">
                    ✓ All Paid
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow md:max-w-xs" />
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl text-xs font-bold bg-rose-50 border border-rose-200 text-rose-600">
          ⚠️ {error}
        </div>
      )}

      {/* 2. Main Columns: Grid of Cards & Profile Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Columns (Col Span 8) - Cards Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Card 1: Security Deposit */}
          <div className="bg-linear-to-r from-red-100 via-rose-200 to-pink-300  rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.01]">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-[#f97316] text-2xl font-bold shadow-inner">
              💰
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-00 uppercase tracking-wider block">Processing Fee</span>
              <span className="text-lg font-black text-slate-800 block">
                ₹ {Number(securityDeposit).toLocaleString('en-IN')}.00 <span className="text-[10px] font-medium text-slate-400 block mt-0.5"></span>
              </span>
            </div>
          </div>

          {/* Card 2: Subscription Plan Price */}
          <div className="bg-linear-to-r from-amber-100 via-orange-100 to-red-100 rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 relative transition-transform hover:scale-[1.01]">
            {isNexgnSaas ? (
              <div className="absolute top-4 right-4 z-30">
                <button
                  onClick={() => {
                    if (!isCycleDropdownDisabled) {
                      setIsDropdownOpen(!isDropdownOpen)
                    }
                  }}
                  disabled={isCycleDropdownDisabled}
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-indigo-600 flex items-center gap-1 disabled:opacity-85 disabled:cursor-not-allowed transition-colors focus:outline-none"
                >
                  {cycleOptions.find(opt => opt.key === selectedCycle)?.labelShort || 'Annual'}
                  {!isCycleDropdownDisabled && (
                    <svg className={`w-2 h-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute right-0 mt-1.5 w-32 bg-white border border-slate-150 rounded-xl shadow-lg py-1.5 z-20 animate-fade-in-quick">
                      {cycleOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => {
                            setSelectedCycle(opt.key)
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${selectedCycle === opt.key
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <span className="absolute top-4 right-4 bg-slate-55 bg-indigo-50 border border-indigo-100 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full text-indigo-600">
                Monthly
              </span>
            )}

            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-2xl font-bold shadow-inner">
              📝
            </div>
            <div className="space-y-1 ">
              <span className="text-[11px] font-bold text-slate-00 uppercase tracking-wider block">
                {isInstitutePro ? 'Student Plan Price' : 'Subscription Plan Price'}
              </span>
              <span className="text-xl font-black text-slate-800 block">
                ₹{Number(displayedPlanPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {displayedPlanPrice > 0 && (
                  <span className="text-[9px] font-semibold text-slate-00 ml-1">+ GST</span>
                )}
              </span>
              {isNexgnSaas && (
                <>
                  <span className="text-[9.5px] font-bold text-slate-00 block leading-tight">
                    ₹{Number(currentStudentRate).toLocaleString('en-IN')} × {subtitleStudentCount} students × {currentMultiplier} mo
                    {cycleRates[selectedCycle]?.carryoverDays > 0 && (
                      <span className="text-indigo-500 font-bold ml-1">
                        + {cycleRates[selectedCycle].carryoverDays} days carryover
                      </span>
                    )}
                  </span>
                  <div className="mt-2 pt-2 border-t border-slate-100/70 flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-00 uppercase tracking-wider">Unpaid New Students</span>
                    <span className={unpaidStudentsCount > 0 ? "text-rose-500 font-black font-mono text-xs" : "text-emerald-600 font-black font-mono text-xs"}>
                      {unpaidStudentsCount}
                    </span>
                  </div>
                </>
              )}
            </div>

            {isNexgnSaas && currentDiscount > 0 && (
              <div className="absolute bottom-3 right-3 w-14 h-14 rounded-full border-2 border-dashed border-rose-500/50 bg-rose-50/45 flex items-center justify-center rotate-[-10deg] shadow-sm select-none pointer-events-none transition-all duration-300">
                <div className="w-[48px] h-[48px] rounded-full border border-dotted border-rose-500/40 flex flex-col items-center justify-center text-rose-500 font-black">
                  <span className="text-[6.5px] tracking-widest leading-none font-black">SAVE</span>
                  <span className="text-xs font-black tracking-tight leading-none my-0.5">{currentDiscount}%</span>
                  <span className="text-[6.5px] tracking-widest leading-none font-black">OFF</span>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Customization Added */}
          <div className="bg-linear-to-r from-gray-200 via-rose-50 to-orange-200 rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.01]">
            <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center text-violet-500 text-2xl font-bold shadow-inner">
              ⚙️
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-00 uppercase tracking-wider block">Customization Added</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-800 block font-mono">
                  {paidCustomCount}
                </span>
                {pendingCustomCount > 0 && (
                  <span className="text-base font-black text-rose-500 font-mono ml-1">
                    + {pendingCustomCount} customization{pendingCustomCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-00 block leading-tight">
                Pending Amount: ₹{pendingCustomTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Card 5: Total Addon Feature Added */}
          <div className="bg-linear-to-r from-pink-200 via-purple-400 to-indigo-600 rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.01]">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-bold shadow-inner">
              🧩
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-00 uppercase tracking-wider block">Total Addon Feature Added</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-800 block font-mono">
                  {paidAddonCount}
                </span>
                {pendingAddonCount > 0 && (
                  <span className="text-base font-black text-rose-500 font-mono ml-1">
                    + {pendingAddonCount} add-on{pendingAddonCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-00 block leading-tight">
                Pending Amount: ₹{pendingAddonTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Card 4: Pay Current Monthly Bill (Spans 2 columns) */}
          {(() => {
            return (
              <div className={`rounded-3xl p-6 shadow-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-transform hover:scale-[1.01] sm:col-span-2 ${isPaidAndActive
                ? 'bg-emerald-50/30 border-emerald-100'
                : isOverdue
                  ? 'bg-rose-50/40 border-rose-200'
                  : 'bg-amber-50/40 border-amber-200'
                }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner shrink-0 ${isPaidAndActive
                    ? 'bg-emerald-50 text-emerald-600'
                    : isOverdue
                      ? 'bg-rose-100 text-rose-500'
                      : 'bg-amber-100 text-amber-600'
                    }`}>
                    {isPaidAndActive ? '💳' : isOverdue ? '⚠️' : '🔔'}
                  </div>

                  {isPaidAndActive ? (
                    <div className="space-y-1">
                      <span className="bg-emerald-50 text-emerald-700 text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1 border border-emerald-100 capitalize">
                        {paymentStatus?.delivery_info?.last_payment_cycle || 'Active'}
                      </span>
                      <span className="text-2xl font-black text-emerald-600 block">
                        Paid &amp; Active (₹0.00)
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 block leading-tight">
                        Next Payment: {paymentStatus.next_payment_date ? new Date(paymentStatus.next_payment_date).toLocaleDateString('en-IN') : '—'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 block mt-1 leading-tight">
                        Breakdown: <span className="font-mono text-slate-500 font-bold">{dueBreakdownStr}</span>
                      </span>
                    </div>
                  ) : isOverdue ? (
                    <div className="space-y-1">
                      <span className="bg-rose-100 text-rose-700 text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1 border border-rose-200">
                        Payment Due
                      </span>
                      <span className="text-2xl font-black text-rose-600 block font-mono">
                        ₹{payBillAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] font-bold text-rose-450 block leading-tight">
                        {isSubscriptionOverdue && pendingCustomTotal > 0
                          ? 'Subscription renewal & custom feature payments are pending'
                          : isSubscriptionOverdue
                            ? 'Your subscription payment is overdue'
                            : 'Pending customization quote payment'}
                      </span>
                      <span className="text-[11px] font-bold text-rose-400 block mt-1 leading-tight">
                        Breakdown: <span className="font-mono text-rose-500/80 font-bold">{dueBreakdownStr}</span>
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="bg-amber-100 text-amber-700 text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1 border border-amber-200">
                        Not Activated
                      </span>
                      <span className="text-2xl font-black text-amber-700 block font-mono">
                        ₹{payBillAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 block leading-tight">
                        Make your first payment to activate your subscription plan
                      </span>
                      <span className="text-[11px] font-bold text-amber-600/70 block mt-1 leading-tight">
                        Breakdown: <span className="font-mono text-amber-700 font-bold">{dueBreakdownStr}</span>
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (!isPaidAndActive) {
                      setPayError('')
                      setPaySuccess('')
                      setShowPayModal(true)
                    } else {
                      navigate('/client/portal/subscription')
                    }
                  }}
                  className={`px-5 py-3 font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer shrink-0 ${isPaidAndActive
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-none border border-slate-200'
                    : isOverdue
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-rose-200'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-200'
                    }`}
                >
                  {isPaidAndActive ? 'View Subscription' : isOverdue ? '⚡ Pay Now' : '🚀 Activate Now'}
                </button>
              </div>
            )
          })()}

        </div>

        {/* Right Column (Col Span 4) - Profile stats card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">

          <div className="space-y-5">
            {/* Metric 1: Client Profile */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Client Profile</span>
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] border border-indigo-100 font-bold">90%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-indigo-650 h-full rounded-full transition-all duration-500" style={{ width: '90%' }}></div>
              </div>
            </div>

            {/* Metric 2: Website Performance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Website Performance</span>
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] border border-indigo-100 font-bold">70%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-indigo-650 h-full rounded-full transition-all duration-500" style={{ width: '70%' }}></div>
              </div>
            </div>

            {/* Metric 3: Website Customization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Website Customization</span>
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] border border-indigo-100 font-bold">60%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-indigo-650 h-full rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs font-bold text-slate-400">If not completed yet complete your profile</p>
            <button
              onClick={() => navigate('/client/portal/profile')}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black rounded-xl text-xs transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Complete Now
            </button>
          </div>

          {/* Teacher count, Last Payment, Next Payment in the blank portion of this card */}
          <div className="pt-4 border-t border-slate-100 space-y-3.5">
            {isInstitutePro && (
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Total Teacher Count</span>
                <span className="font-black text-slate-800 text-sm font-mono">0</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Last Payment</span>
              <span className="font-black text-slate-800 font-mono">
                ₹{Number(subscriptionPrice).toLocaleString('en-IN')}.00
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Next Payment</span>
              <span className="font-black text-indigo-600 font-mono">
                ₹{Number(subscriptionPrice).toLocaleString('en-IN')}.00
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Estimator Sandbox Bar / Pricing Calculator */}
      {isInstitutePro && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Left column: capacity controller slider */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-md text-[9px] uppercase font-black tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 inline-block">
                Pricing Calculator Sandbox
              </span>
              <h3 className="text-sm font-black text-slate-800">Future Growth Calculator</h3>
              <p className="text-xs text-slate-450 leading-normal">
                Estimate subscription pricing for upcoming academic terms based on student scale. Rates and discounts are fetched dynamically from admin database rules.
              </p>
            </div>

            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/60 space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <label htmlFor="student-slider" className="text-slate-550">Student Capacity</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={calcStudents}
                    onChange={(e) => setCalcStudents(Math.max(10, parseInt(e.target.value) || 0))}
                    className="w-20 px-2 py-0.5 bg-white border border-slate-250 rounded text-xs font-mono font-bold text-slate-800 text-center focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Qty</span>
                </div>
              </div>

              <div className="space-y-1">
                <input
                  id="student-slider"
                  type="range"
                  min="10"
                  max="2000"
                  step="10"
                  value={calcStudents > 2000 ? 2000 : calcStudents}
                  onChange={(e) => setCalcStudents(parseInt(e.target.value) || 250)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono font-medium">
                  <span>10 Students</span>
                  <span>2,000 Students</span>
                </div>
              </div>
            </div>

            <div className="text-[10.5px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-150 leading-relaxed font-semibold">
              💡 Calculated estimates are inclusive of standard 18% GST as per state software regulations.
            </div>
          </div>

          {/* Right column: Dynamic estimates tiles */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {estimates.map((plan) => (
              <div
                key={plan.duration}
                className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Badge Tag */}
                <div className="absolute top-0 right-0">
                  <span className={`text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg text-white ${plan.badge === 'Best Value' ? 'bg-indigo-600' :
                    plan.badge === 'Recommended' ? 'bg-emerald-600' : 'bg-slate-400'
                    }`}>
                    {plan.badge}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">{plan.duration}</div>
                  <h4 className="text-[13px] font-extrabold text-slate-800">{plan.title}</h4>
                </div>

                <div className="my-3 py-2 border-y border-slate-50 text-xs text-slate-450 space-y-1">
                  <div className="flex justify-between">
                    <span>Price per Student</span>
                    <span className="font-bold text-slate-600 font-mono">₹{plan.pricePerStudent.toFixed(2)}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cycle Discount</span>
                    <span className="font-black text-emerald-600">{plan.savings}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-[10px] text-slate-400 font-bold">Est. Cost (inc. GST)</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    ₹{plan.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Bottom Panels: Recharge Summary */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Banner Header */}
        <div className="bg-slate-800 text-white font-black px-6 py-4.5 text-sm flex items-center gap-2">
          <span>💳</span> Recharge Summary
        </div>

        {/* Body Table */}
        <div className="overflow-x-auto">
          {rechargeHistory && rechargeHistory.length > 0 ? (
            <>
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-4">Invoice No</th>
                    <th className="px-6 py-4">Payment Date</th>
                    <th className="px-6 py-4">Payment Type</th>
                    <th className="px-6 py-4">Valid Till</th>
                    <th className="px-6 py-4">Amount (₹)</th>
                    <th className="px-6 py-4 text-center">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedHistory.map((item) => (
                    <tr key={item.invoiceNo} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-500 truncate max-w-[150px]" title={item.invoiceNo}>
                        {item.invoiceNo}
                      </td>
                      <td className="px-6 py-4 font-sans text-slate-500">{item.paymentDate}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[9.5px] uppercase font-sans">
                          {item.paymentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-sans text-slate-500">{item.validTill}</td>
                      <td className="px-6 py-4 font-mono font-black text-slate-800">
                        ₹{Number(item.amount).toLocaleString('en-IN')}.00
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => downloadInvoice(item)}
                          className="text-indigo-600 hover:text-indigo-700 font-black flex items-center justify-center gap-1.5 mx-auto active:scale-95 cursor-pointer"
                        >
                          ⬇️ <span className="underline">Download</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${currentPage === page
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'border border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-slate-400 bg-slate-50/30">
              <span className="text-3xl block">💳</span>
              <p className="font-bold mt-2 text-xs">No billing transactions found.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default ClientProducts
