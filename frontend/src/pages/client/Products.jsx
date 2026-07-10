import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientAuthStore } from '../../store/clientAuthStore'
import { getClientProfile, getClientProducts, getClientStudentCount, calculateSubscription, getClientCustomizationRequests } from '../../api/clientPortal'

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
      const cyclesList = ['monthly', 'quarterly', 'half-yearly', 'yearly']
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
          newRates[cycle] = {
            discount: calc.discount_percentage || 0,
            baseRate: baseRate || 10,
            multiplier: calc.multiplier || (cycle === 'monthly' ? 1 : cycle === 'quarterly' ? 3 : cycle === 'half-yearly' ? 6 : 12)
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

  useEffect(() => {
    syncProfile()
    syncStudentCount()
    syncCustomizations()
    fetchEstimatesData()
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

  // Mock Recharge list
  const rechargeHistory = [
    { invoiceNo: 'INV-1025', paymentDate: '2026-06-01', paymentType: 'Online', validTill: '2026-07-01', amount: subscriptionPrice },
    { invoiceNo: 'INV-1024', paymentDate: '2026-05-01', paymentType: 'Online', validTill: '2026-06-01', amount: subscriptionPrice },
    { invoiceNo: 'INV-1023', paymentDate: '2026-04-01', paymentType: 'Online', validTill: '2026-05-01', amount: subscriptionPrice }
  ]

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
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Security Deposit</span>
              <span className="text-lg font-black text-slate-800 block">
                ₹ {Number(securityDeposit).toLocaleString('en-IN')}.00 <span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Refundable)</span>
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
            </div>
            <button
              onClick={() => navigate('/client/portal/subscription')}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer shrink-0"
            >
              Pay Now
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
                <span className={`text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg text-white ${
                  plan.badge === 'Best Value' ? 'bg-indigo-600' :
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

      {/* 4. Bottom Panels: Recharge Summary */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Banner Header */}
        <div className="bg-slate-800 text-white font-black px-6 py-4.5 text-sm flex items-center gap-2">
          <span>💳</span> Recharge Summary
        </div>
        
        {/* Body Table */}
        <div className="overflow-x-auto">
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
              {rechargeHistory.map((item) => (
                <tr key={item.invoiceNo} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-500">{item.invoiceNo}</td>
                  <td className="px-6 py-4 font-sans text-slate-500">{item.paymentDate}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[9.5px] uppercase">
                      {item.paymentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-sans text-slate-500">{item.validTill}</td>
                  <td className="px-6 py-4 font-mono font-black text-slate-800">
                    ₹{Number(item.amount).toLocaleString('en-IN')}.00
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => alert(`Downloading invoice ${item.invoiceNo}...`)}
                      className="text-indigo-600 hover:text-indigo-700 font-black flex items-center justify-center gap-1.5 mx-auto active:scale-95 cursor-pointer"
                    >
                      ⬇️ <span className="underline">Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default ClientProducts
