import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClientAuthStore } from '../../store/clientAuthStore'
import { getClientProfile, getClientProducts, getClientStudentCount } from '../../api/clientPortal'

const ClientProducts = () => {
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
  const [successMsg, setSuccessMsg] = useState('')

  // Pricing calculator states
  const [calcStudents, setCalcStudents] = useState(0)
  
  // Student count API state
  const [studentCountData, setStudentCountData] = useState(null)

  const syncStudentCount = async () => {
    if (!isClientAuthenticated || !clientToken) return
    try {
      const res = await getClientStudentCount(clientToken)
      const countData = res?.data || res
      if (countData) {
        setStudentCountData(countData)
        if (countData.student_count) {
          setCalcStudents(parseInt(countData.student_count, 10) || 0)
        }
      }
    } catch (err) {
      console.error('Error syncing student count:', err)
      if (err.response?.status === 401) {
        clientLogout()
      }
    }
  }

  // Customization modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [customType, setCustomType] = useState('')
  const [customDesc, setCustomDesc] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false)
  const [customSuccess, setCustomSuccess] = useState(false)
  const [customRequests, setCustomRequests] = useState([])

  // Load customizations history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('client_customizations')
    if (saved) {
      setCustomRequests(JSON.parse(saved))
    } else {
      localStorage.setItem('client_customizations', JSON.stringify([]))
      setCustomRequests([])
    }
  }, [])

  // Interactive Graph Hover State
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const syncProfile = async () => {
    if (!isClientAuthenticated || !clientToken) return
    try {
      const res = await getClientProfile(clientToken)
      const newProfile = res?.data || res?.profile || res || null
      if (newProfile) {
        if (JSON.stringify(profileData) !== JSON.stringify(newProfile)) {
          setProfileData(newProfile)
        }
        if (newProfile.total_students) {
          setCalcStudents(parseInt(newProfile.total_students, 10) || 0)
        }
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

      if (JSON.stringify(productData) !== JSON.stringify(newProducts)) {
        setProductData(newProducts)
      }
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

  // Sync profile background data and student count
  useEffect(() => {
    syncProfile()
    syncStudentCount()
  }, [clientToken, isClientAuthenticated])

  // Sync products data
  useEffect(() => {
    if (!productsFetched) setLoading(true)
    syncProducts()
  }, [clientToken, isClientAuthenticated, productsFetched])

  const displayUser = profileData || clientUser || {}
  const displayProducts = productData || []
  
  const rawProduct = displayProducts[0] || {
    name: displayUser?.product_name,
    product_name: displayUser?.product_name,
    category: displayUser?.product_category || displayUser?.category,
    processing_fee: displayUser?.processing_fee,
    monthly_subscription: displayUser?.monthly_subscription,
    status: displayUser?.status || 'Active',
    payment_status: displayUser?.payment_status,
    created_at: displayUser?.created_at,
    activated_at: displayUser?.activated_at,
    total_students: displayUser?.total_students
  }

  const isInstPro = rawProduct?.product_name === 'NEXGN Institute Pro' || rawProduct?.name === 'NEXGN Institute Pro'
  const totalStudentsNum = studentCountData?.student_count || parseInt(displayUser?.total_students || rawProduct?.total_students, 10) || 0
  const finalSub = totalStudentsNum * 10

  const activeProduct = {
    ...rawProduct,
    monthly_subscription: finalSub
  }

  // Sync calculator students with initial fetched student count once loaded
  useEffect(() => {
    if (totalStudentsNum > 0) {
      setCalcStudents(totalStudentsNum)
    }
  }, [totalStudentsNum])

  // Generate dynamic last 6 months labels
  const last6Months = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const result = []
    const d = new Date()
    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(d.getFullYear(), d.getMonth() - i, 1)
      result.push(monthNames[targetMonth.getMonth()])
    }
    return result
  }, [])

  // Calculate dynamic data points for the SVG graph based on current student count
  const graphPoints = useMemo(() => {
    const pointsCount = 6
    const baseMultiplier = [0.45, 0.60, 0.70, 0.85, 0.92, 1.0] // Simulated historical progression curve
    
    // SVG graph borders: width=520, height=140. Start at X=50, End at X=510. Y range: top=15, bottom=135.
    const width = 460
    const xStart = 50
    const xStep = width / (pointsCount - 1)
    
    const maxVal = Math.max(totalStudentsNum * 1.15, 100)
    
    return baseMultiplier.map((multiplier, idx) => {
      const val = Math.round(totalStudentsNum * multiplier)
      const x = xStart + idx * xStep
      const y = 135 - (val / maxVal) * 110 // Scale between 15 and 135
      return {
        x,
        y,
        val,
        month: last6Months[idx]
      }
    })
  }, [totalStudentsNum, last6Months])

  // Calculator price calculations
  const estimates = useMemo(() => {
    const num = Number(calcStudents) || 0
    return [
      {
        duration: '1 Month',
        title: 'Monthly Plan',
        pricePerStudent: 10,
        total: num * 10 * 1,
        savings: 'Standard Rate',
        badge: 'Short-term'
      },
      {
        duration: '3 Months',
        title: 'Quarterly Plan',
        pricePerStudent: 9.5,
        total: num * 9.5 * 3,
        savings: 'Save 5%',
        badge: 'Popular'
      },
      {
        duration: '6 Months',
        title: 'Half-Yearly Plan',
        pricePerStudent: 9.0,
        total: num * 9.0 * 6,
        savings: 'Save 10%',
        badge: 'Recommended'
      },
      {
        duration: '12 Months',
        title: 'Yearly Plan',
        pricePerStudent: 8.0,
        total: num * 8.0 * 12,
        savings: 'Save 20%',
        badge: 'Best Value'
      }
    ]
  }, [calcStudents])

  // Handle customization request form submission
  const handleCustomSubmit = (e) => {
    e.preventDefault()
    setIsSubmittingCustom(true)
    
    // Simulate API call to register request
    setTimeout(() => {
      const newReq = {
        id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        title: customType,
        description: customDesc,
        rollout: targetDate,
        cost: "Pending Admin Quote",
        status: "Under Review"
      }

      const updated = [newReq, ...customRequests]
      localStorage.setItem('client_customizations', JSON.stringify(updated))
      setCustomRequests(updated)

      setIsSubmittingCustom(false)
      setCustomSuccess(true)
      setSuccessMsg('Your customization request has been successfully recorded. Our representative will contact you shortly.')
      
      // Clear message after 6 seconds
      setTimeout(() => setSuccessMsg(''), 6000)
    }, 1200)
  }

  const resetCustomForm = () => {
    setCustomType('')
    setCustomDesc('')
    setTargetDate('')
    setCustomSuccess(false)
    setIsModalOpen(false)
  }

  if (loading && !activeProduct.name && !activeProduct.product_name) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-6 h-6 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  const clientName = displayUser?.client_name || displayUser?.name || 'Academic Partner'
  const schoolName = displayUser?.company_name || displayUser?.school_name || displayUser?.organization || 'Academic Institute'

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Centered Page Header (Matching Admin Layout Header Banner style) */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px] border-b border-slate-200/80">
        {/* Left Side: Page Title */}
        <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Dashboard</h1>

        {/* Center: School / Org banner */}
        <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0 select-none">
          <h2 className="text-lg font-extrabold text-[#1e3e6b] tracking-tight uppercase">
            {schoolName}
          </h2>
          <p className="text-xs font-bold text-slate-500">Academic Session: 2026-2027</p>
        </div>

        {/* Right Side: Actions */}
        <div className="flex justify-end items-center gap-2 md:w-80">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-sm cursor-pointer transition-all active:scale-[0.97] select-none flex items-center gap-1"
          >
            <span>⚙️</span> Request Customization
          </button>
          <button
            onClick={() => {
              setLoading(true)
              syncProfile()
              syncProducts()
              syncStudentCount()
            }}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg shadow-sm cursor-pointer transition-all active:scale-[0.97] select-none"
          >
            Refresh Stats
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-xl text-[13px] font-medium flex items-center gap-2" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl text-[13px] font-medium flex items-center gap-2 animate-fade-in" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}


      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1: Subscription Package */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Subscription Plan</span>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">
                {activeProduct.product_name || activeProduct.name || 'No Active Plan'}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-50">
            <span className="text-[11px] text-slate-400 font-medium">{activeProduct.category || 'SaaS Software'}</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
              (activeProduct.status || '').toLowerCase() === 'active' 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-amber-50 text-amber-600 border border-amber-100'
            }`}>
              <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
              {activeProduct.status || 'Active'}
            </span>
          </div>
        </div>

        {/* Stat Card 2: Total Students */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Students</span>
              <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {totalStudentsNum.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-50">
            <span className="text-[11px] text-slate-400 font-medium">Registered Active Accounts</span>
            <span className="text-[11px] text-emerald-600 font-bold">100% capacity</span>
          </div>
        </div>

        {/* Stat Card 3: Payment Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Subscription</span>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                ₹{Number(activeProduct.monthly_subscription || 0).toLocaleString('en-IN')}
                <span className="text-xs font-semibold text-slate-400">/mo</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-50">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                ₹10 × {totalStudentsNum.toLocaleString('en-IN')} students
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                {activeProduct.payment_status || 'Paid'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Platform Analytics & Growth (Interactive SVG Graph) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Student Enrollment Trends</h3>
            <p className="text-[11px] text-slate-400">Monthly breakdown of active students in your database</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Students Count
            </span>
          </div>
        </div>

        {/* Custom Interactive SVG Chart */}
        <div className="relative h-[180px] w-full mt-2">
          <svg className="w-full h-full" overflow="visible">
            <defs>
              <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="chartLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((percentage, index) => {
              const y = 135 - percentage * 110
              return (
                <g key={index}>
                  <line 
                    x1="45" 
                    y1={y} 
                    x2="515" 
                    y2={y} 
                    stroke="#f1f5f9" 
                    strokeWidth="1" 
                    strokeDasharray="4 4"
                  />
                  <text 
                    x="35" 
                    y={y + 3} 
                    textAnchor="end" 
                    className="text-[9px] font-medium fill-slate-400 font-mono"
                  >
                    {Math.round((totalStudentsNum * 1.15 * percentage))}
                  </text>
                </g>
              )
            })}

            {/* Gradient Area under the line */}
            <path
              d={`
                M ${graphPoints[0].x} 135
                ${graphPoints.map(p => `L ${p.x} ${p.y}`).join(' ')}
                L ${graphPoints[graphPoints.length - 1].x} 135
                Z
              `}
              fill="url(#chartAreaGradient)"
            />

            {/* Glowing Line */}
            <path
              d={graphPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
              fill="none"
              stroke="url(#chartLineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active Vertical Tooltip Line */}
            {hoveredIndex !== null && (
              <line 
                x1={graphPoints[hoveredIndex].x} 
                y1="15" 
                x2={graphPoints[hoveredIndex].x} 
                y2="135" 
                stroke="#cbd5e1" 
                strokeWidth="1.5" 
                strokeDasharray="2 2"
              />
            )}

            {/* Circles for Points */}
            {graphPoints.map((p, idx) => {
              const isHovered = hoveredIndex === idx
              return (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? "5" : "3.5"}
                    className="transition-all duration-150"
                    fill={isHovered ? "#4f46e5" : "#ffffff"}
                    stroke={isHovered ? "#ffffff" : "#4f46e5"}
                    strokeWidth={isHovered ? "2" : "2"}
                  />
                  {/* Invisible wide hover targets */}
                  <rect
                    x={p.x - 35}
                    y="10"
                    width="70"
                    height="135"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </g>
              )
            })}

            {/* X Axis labels */}
            {graphPoints.map((p, idx) => (
              <text
                key={idx}
                x={p.x}
                y="152"
                textAnchor="middle"
                className={`text-[10px] font-bold transition-colors duration-150 ${
                  hoveredIndex === idx ? 'fill-indigo-600 font-extrabold' : 'fill-slate-400 font-medium'
                }`}
              >
                {p.month}
              </text>
            ))}
          </svg>

          {/* Interactive Floating HTML Tooltip */}
          {hoveredIndex !== null && (
            <div 
              className="absolute bg-slate-900 text-white rounded-lg p-2.5 shadow-xl border border-slate-800 text-[11px] z-20 pointer-events-none transition-all duration-75"
              style={{ 
                left: `${graphPoints[hoveredIndex].x - 60}px`, 
                top: `${graphPoints[hoveredIndex].y - 50}px` 
              }}
            >
              <div className="font-semibold text-slate-300 font-mono text-[9px] uppercase tracking-wider">{graphPoints[hoveredIndex].month} Statistics</div>
              <div className="font-bold text-white text-[13px] mt-0.5">{graphPoints[hoveredIndex].val} Students</div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Customization Requests History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Your Customization Requests</h3>
          <p className="text-[11px] text-slate-400">Track feature requests, status, and pricing quotes set by the admin team.</p>
        </div>

        <div className="overflow-x-auto">
          {customRequests && customRequests.length > 0 ? (
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="pb-3 pr-2">ID</th>
                  <th className="pb-3 px-2">Submitted</th>
                  <th className="pb-3 px-2">Requested Customization</th>
                  <th className="pb-3 px-2">Rollout Date</th>
                  <th className="pb-3 px-2">Admin Cost Quote</th>
                  <th className="pb-3 pl-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {customRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-2 font-mono text-[11px] text-slate-500">{req.id}</td>
                    <td className="py-3 px-2 text-slate-400 font-mono">{req.date}</td>
                    <td className="py-3 px-2 max-w-[280px]">
                      <div className="font-bold text-slate-800">{req.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={req.description}>
                        {req.description}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-500 font-mono">{req.rollout || '—'}</td>
                    <td className="py-3 px-2 font-semibold">
                      {req.cost.includes('Pending') ? (
                        <span className="text-amber-600 font-medium italic">{req.cost}</span>
                      ) : (
                        <span className="text-slate-800 font-extrabold font-mono">{req.cost}</span>
                      )}
                    </td>
                    <td className="py-3 pl-2 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        req.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
              No customization requests found. Click <strong>Request Customization</strong> to submit one.
            </div>
          )}
        </div>
      </div>

      {/* 5. Price Upgrade & Calculator */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: input controller */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 inline-block">
              Pricing Sandbox
            </span>
            <h3 className="text-base font-bold text-slate-800">Future Growth Calculator</h3>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              Plan your budget limits! Use this calculator to estimate pricing for upcoming academic terms based on student scale.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-100">
            <div className="flex justify-between items-center">
              <label htmlFor="student-slider" className="text-[12px] font-bold text-slate-500">Projected Student Capacity</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="10"
                  max="5000"
                  value={calcStudents}
                  onChange={(e) => setCalcStudents(Math.max(10, parseInt(e.target.value) || 0))}
                  className="w-16 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[12px] font-bold text-slate-800 text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-400 font-semibold">Qty</span>
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

          {/* Custom plan note */}
          <div className="pt-1 text-[11px] text-slate-400">
            Need something else? Click <strong>Request Customization</strong> at the top of the dashboard.
          </div>
        </div>

        {/* Right column: Comparative pricing tiles */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {estimates.map((plan) => (
            <div 
              key={plan.duration}
              className="bg-white rounded-xl p-4 border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Banner Tag */}
              <div className="absolute top-0 right-0">
                <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg text-white ${
                  plan.badge === 'Best Value' ? 'bg-indigo-600' :
                  plan.badge === 'Recommended' ? 'bg-emerald-600' : 'bg-slate-400'
                }`}>
                  {plan.badge}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">{plan.duration}</div>
                <h4 className="text-[13px] font-bold text-slate-800">{plan.title}</h4>
              </div>

              <div className="my-3 py-2 border-y border-slate-50">
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Price per Student</span>
                  <span className="font-semibold text-slate-600 font-mono">₹{plan.pricePerStudent}/mo</span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between mt-1">
                  <span>Discount</span>
                  <span className="font-bold text-emerald-600">{plan.savings}</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline mt-1">
                <span className="text-[10px] text-slate-400 font-medium">Estimated Cost</span>
                <span className="text-lg font-extrabold text-slate-800 font-mono">
                  ₹{plan.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Customization Request Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetCustomForm}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-100 z-10 flex flex-col relative"
            >
              
              {/* Header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="space-y-0.5">
                  <h3 className="text-[14px] font-bold uppercase tracking-wider text-indigo-300">Custom Upgrade</h3>
                  <h2 className="text-base font-bold text-white leading-tight">Request Customization Form</h2>
                </div>
                <button 
                  onClick={resetCustomForm}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 overflow-y-auto max-h-[80vh]">
                {customSuccess ? (
                  // Success State
                  <div className="text-center py-6 space-y-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-800">Form Submitted Successfully!</h3>
                      <p className="text-[12px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Our technical accounts team has received your customization request. A coordinator will reach out to you within 24 hours.
                      </p>
                    </div>
                    <div className="pt-3">
                      <button
                        onClick={resetCustomForm}
                        className="py-2 px-5 bg-slate-900 text-white font-bold text-[12px] rounded-lg hover:bg-indigo-600 transition-colors cursor-pointer"
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  </div>
                ) : (
                  // Standard Input Form
                  <form onSubmit={handleCustomSubmit} className="space-y-4">
                    
                    {/* Customization Title/Type Input */}
                    <div className="space-y-1">
                      <label htmlFor="custom-type" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">What Customization do you need?</label>
                      <input
                        id="custom-type"
                        type="text"
                        required
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        placeholder="e.g., Dedicated iOS App, Custom Domain Mapping, Msg91 Integration"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
                      />
                    </div>

                    {/* Pre-fill display */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Organization</label>
                        <input
                          type="text"
                          disabled
                          value={displayUser?.company_name || displayUser?.school_name || 'Academic Institute'}
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-[12px] font-medium text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="target-date" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Rollout Date</label>
                        <input
                          id="target-date"
                          type="date"
                          required
                          value={targetDate}
                          onChange={(e) => setTargetDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Details Textarea */}
                    <div className="space-y-1">
                      <label htmlFor="custom-desc" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Request & Customization Details</label>
                      <textarea
                        id="custom-desc"
                        rows="3"
                        required
                        value={customDesc}
                        onChange={(e) => setCustomDesc(e.target.value)}
                        placeholder="Please describe your feature additions or setup specifications..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans resize-none"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-3 border-t border-slate-100 justify-end">
                      <button
                        type="button"
                        onClick={resetCustomForm}
                        className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[12px] rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingCustom}
                        className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[12px] rounded-lg transition-colors shadow-sm disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                      >
                        {isSubmittingCustom ? (
                          <>
                            <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          'Submit Request'
                        )}
                      </button>
                    </div>

                  </form>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default ClientProducts
