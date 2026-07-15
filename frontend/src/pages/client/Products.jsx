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
  getClientAddonHistory
} from '../../api/clientPortal'

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
  const [customRequestsCount, setCustomRequestsCount] = useState(199)

  // Future Growth Calculator states
  const [calcStudents, setCalcStudents] = useState(250)

  // Dynamically fetched cycle rates from API
  const [cycleRates, setCycleRates] = useState({
    monthly: { discount: 0, baseRate: 10, multiplier: 1 },
    quarterly: { discount: 5, baseRate: 10, multiplier: 3 },
    'half-yearly': { discount: 10, baseRate: 10, multiplier: 6 },
    yearly: { discount: 20, baseRate: 10, multiplier: 12 }
  })

  // Payment status and unified history
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [rechargeHistory, setRechargeHistory] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const syncStudentCount = async () => {
    if (!isClientAuthenticated || !clientToken) return
    try {
      const res = await getClientStudentCount(clientToken)
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

      const newRates = { ...cycleRates }
      results.forEach((res, idx) => {
        const cycle = cyclesList[idx]
        if (res?.success && res?.data?.calculation) {
          const calc = res.data.calculation
          const baseRate = calc.student_count > 0 ? (calc.base_monthly_amount / calc.student_count) : 10

          // Map backend cycle names to local state keys
          const stateKey = cycle === 'half_yearly' ? 'half-yearly' : (cycle === 'annual' ? 'yearly' : cycle)

          newRates[stateKey] = {
            discount: calc.discount_percentage || 0,
            baseRate: baseRate || 10,
            multiplier: calc.multiplier || (cycle === 'monthly' ? 1 : cycle === 'quarterly' ? 3 : cycle === 'half_yearly' ? 6 : 12)
          }
        }
      })
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

      const [subRes, custRes, addonRes] = await Promise.all([
        getClientPaymentHistory(clientToken).catch(() => null),
        getClientCustomPaymentHistory(clientToken).catch(() => null),
        getClientAddonHistory(clientToken).catch(() => null)
      ])

      const subPayments = subRes?.success ? (subRes.data?.payments || []) : []
      const custPayments = custRes?.success ? (custRes.data?.payments || []) : []
      const addonPayments = addonRes?.success ? (addonRes.data || []) : []

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
        unifiedList.push({
          id: p.id,
          invoiceNo: p.razorpay_payment_id || `pay_cust_${p.id}`,
          paymentDate: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '—',
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
    if (!productsFetched) setLoading(true)
    syncProducts()
  }, [clientToken, isClientAuthenticated, productsFetched])

  // Dynamic sandbox price calculations based on slider student volume
  const estimates = useMemo(() => {
    const num = Number(calcStudents) || 0
    return [
      {
        duration: '1 Month',
        title: 'Monthly Plan',
        pricePerStudent: cycleRates.monthly.baseRate,
        discount: cycleRates.monthly.discount,
        multiplier: cycleRates.monthly.multiplier,
        badge: 'Short-term'
      },
      {
        duration: '3 Months',
        title: 'Quarterly Plan',
        pricePerStudent: cycleRates.quarterly.baseRate * (1 - cycleRates.quarterly.discount / 100),
        discount: cycleRates.quarterly.discount,
        multiplier: cycleRates.quarterly.multiplier,
        badge: 'Popular'
      },
      {
        duration: '6 Months',
        title: 'Half-Yearly Plan',
        pricePerStudent: cycleRates['half-yearly'].baseRate * (1 - cycleRates['half-yearly'].discount / 100),
        discount: cycleRates['half-yearly'].discount,
        multiplier: cycleRates['half-yearly'].multiplier,
        badge: 'Recommended'
      },
      {
        duration: '12 Months',
        title: 'Yearly Plan',
        pricePerStudent: cycleRates.yearly.baseRate * (1 - cycleRates.yearly.discount / 100),
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
        savings: plan.discount > 0 ? `Save ${plan.discount}%` : 'Standard Rate'
      }
    })
  }, [calcStudents, cycleRates])

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

  const activationDateStr = (() => {
    const rawDate = activeProduct?.activated_at || displayUser?.activated_at
    if (rawDate) {
      try {
        return new Date(rawDate).toISOString().split('T')[0]
      } catch {
        return '2025-03-28'
      }
    }
    return '2025-03-28'
  })()

  const deliveryDateStr = '2025-07-31'

  const securityDeposit = activeProduct?.processing_fee || displayUser?.processing_fee || 3299
  const subscriptionPrice = activeProduct?.monthly_subscription || displayUser?.monthly_subscription || 3299
  const payBillAmount = isInstitutePro
    ? (studentCountData?.student_count ? studentCountData.student_count * 10 : 0)
    : subscriptionPrice

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 select-none animate-fade-in text-slate-700" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* 1. Portal Heading & Info Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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
            <div className="md:text-right shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Student Count</span>
              <span className="text-2xl font-black text-[#2563eb] block mt-1 font-mono">
                {studentCountData?.student_count !== undefined ? studentCountData.student_count : '0'}
              </span>
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
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.01]">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-[#f97316] text-2xl font-bold shadow-inner">
              💰
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Processing Fee</span>
              <span className="text-lg font-black text-slate-800 block">
                ₹ {Number(securityDeposit).toLocaleString('en-IN')}.00 <span className="text-[10px] font-medium text-slate-400 block mt-0.5"></span>
              </span>
            </div>
          </div>

          {/* Card 2: Subscription Plan Price */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 relative transition-transform hover:scale-[1.01]">
            <span className="absolute top-4 right-4 bg-slate-55 bg-indigo-50 border border-indigo-100 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full text-indigo-600">
              Monthly
            </span>
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-2xl font-bold shadow-inner">
              📝
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Subscription Plan Price</span>
              <span className="text-xl font-black text-slate-800 block">
                ₹{Number(subscriptionPrice).toLocaleString('en-IN')}.00
              </span>
            </div>
          </div>

          {/* Card 3: Customization Added */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.01]">
            <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center text-violet-500 text-2xl font-bold shadow-inner">
              ⚙️
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Customization Added</span>
              <span className="text-3xl font-black text-slate-800 block font-mono">
                {customRequestsCount}
              </span>
            </div>
          </div>

          {/* Card 5: Total Addon Feature Added */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.01]">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-bold shadow-inner">
              🧩
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Addon Feature Added</span>
              <span className="text-3xl font-black text-slate-800 block font-mono">
                0
              </span>
            </div>
          </div>

          {/* Card 4: Pay Current Monthly Bill (Spans 2 columns) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-transform hover:scale-[1.01] sm:col-span-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-2xl font-bold shadow-inner shrink-0">
                💳
              </div>
              {paymentStatus && !paymentStatus.show_pay_now ? (
                <div className="space-y-1">
                  <span className="bg-emerald-50 text-emerald-700 text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1 border border-emerald-100 capitalize">
                    {paymentStatus.delivery_info?.last_payment_cycle || 'Active'}
                  </span>
                  <span className="text-2xl font-black text-emerald-600 block">
                    Paid & Active
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 block">
                    Next Payment: {paymentStatus.next_payment_date ? new Date(paymentStatus.next_payment_date).toLocaleDateString('en-IN') : '—'}
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="bg-emerald-50 text-emerald-700 text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1 border border-emerald-100">
                    Monthly
                  </span>
                  <span className="text-2xl font-black text-slate-800 block font-mono">
                    ₹{payBillAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 block">
                    Pay Current Monthly Bill
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/client/portal/subscription')}
              className={`px-5 py-3 font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer shrink-0 ${paymentStatus && !paymentStatus.show_pay_now
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-none border border-slate-200'
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white'
                }`}
            >
              {paymentStatus && !paymentStatus.show_pay_now ? 'View Subscription' : 'Pay Now'}
            </button>
          </div>

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
