import React, { useState, useEffect, useMemo } from 'react'
import { getEmployeeLeaves, applyEmployeeLeave } from '../../api/employee'

// Helper to format string values safely
const formatVal = (val, fallback = '') => {
  if (!val) return fallback
  if (typeof val === 'string' || typeof val === 'number') return String(val)
  return val.name || val.title || val.label || fallback
}

// Calculate total leave days considering First Half (FH) and Second Half (SH)
export const calculateLeaveDays = (fromStr, fromHalf, toStr, toHalf) => {
  if (!fromStr || !toStr) return 0
  const from = new Date(fromStr)
  const to = new Date(toStr)
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return 0
  if (from > to) return 0

  // Same day
  if (fromStr === toStr) {
    if (fromHalf === 'fh' || fromHalf === 'sh' || toHalf === 'fh' || toHalf === 'sh') {
      return 0.5
    }
    return 1.0
  }

  // Multi-day
  const diffTime = to.getTime() - from.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1 // inclusive calendar days

  let total = diffDays
  // If starting on second half, morning is worked (subtract 0.5)
  if (fromHalf === 'sh') total -= 0.5
  // If ending on first half, afternoon is worked (subtract 0.5)
  if (toHalf === 'fh') total -= 0.5

  return Math.max(0.5, total)
}

const LeaveStatusBadge = ({ status }) => {
  const map = {
    pending: { label: 'Pending Approval', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
    approved: { label: 'Approved', color: '#38b34a', bg: 'rgba(56,179,74,0.12)', border: 'rgba(56,179,74,0.3)' },
    rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
  }
  const s = map[status] || map.pending
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

const LeaveTypeBadge = ({ type }) => {
  const map = {
    cl: { label: 'Casual Leave (CL)', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    el: { label: 'Earned Leave (EL)', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    sl: { label: 'Sick Leave (SL)', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    lop: { label: 'Loss of Pay (LOP)', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)' },
  }
  const s = map[type?.toLowerCase()] || { label: type?.toUpperCase(), color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' }
  return (
    <span
      className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-md"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

const LeaveApplyTab = ({ user }) => {
  const now = new Date()
  const currentMonthIdx = now.getMonth() // 0-based: Jan=0, Feb=1, Mar=2, Oct=9
  const completedMonths = currentMonthIdx // completed months in current year (e.g. Feb has 1 completed month: Jan)
  
  // Dynamic Default Balances
  const defaultAccruedCL = Number((completedMonths * 0.5).toFixed(1))
  const defaultAccruedEL = Number((completedMonths * 0.25).toFixed(2))

  const [balances, setBalances] = useState({
    cl: { accrued: defaultAccruedCL, taken: 0, remaining: defaultAccruedCL },
    el: { accrued: defaultAccruedEL, taken: 0, remaining: defaultAccruedEL },
    sl: { total: 6.0, taken: 0, remaining: 6.0 },
    lop: { taken: 0 },
  })

  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form State
  const [leaveType, setLeaveType] = useState('cl') // 'cl' | 'el' | 'sl' | 'lop'
  const [fromDate, setFromDate] = useState('')
  const [fromHalf, setFromHalf] = useState('full') // 'full' | 'fh' | 'sh'
  const [toDate, setToDate] = useState('')
  const [toHalf, setToHalf] = useState('full') // 'full' | 'fh' | 'sh'
  const [reason, setReason] = useState('')
  const [medicalFile, setMedicalFile] = useState(null)
  const [medicalFileName, setMedicalFileName] = useState('')

  // History Pagination
  const [historyPage, setHistoryPage] = useState(1)
  const historyPerPage = 5

  // Fetch balances and history from backend
  const loadLeaveData = async () => {
    setLoading(true)
    try {
      const res = await getEmployeeLeaves()
      if (res?.data?.data) {
        const d = res.data.data
        if (d.balances) {
          setBalances(d.balances)
        }
        if (Array.isArray(d.history)) {
          setHistory(d.history)
        }
      }
    } catch (err) {
      console.warn('Backend leaves endpoint not available or table pending migration:', err)
      // Keep dynamic local calculated balances
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaveData()
  }, [])

  // Calculate live duration
  const totalDays = useMemo(() => {
    return calculateLeaveDays(fromDate, fromHalf, toDate, toHalf)
  }, [fromDate, fromHalf, toDate, toHalf])

  // CL Advance Rule Bounds (5 days ahead to 30 days ahead)
  const { minClDateStr, maxClDateStr, isClDateValid } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const minD = new Date(today)
    minD.setDate(minD.getDate() + 5)
    
    const maxD = new Date(today)
    maxD.setDate(maxD.getDate() + 30)

    const minStr = minD.toISOString().split('T')[0]
    const maxStr = maxD.toISOString().split('T')[0]

    let valid = true
    if (leaveType === 'cl' && fromDate) {
      const f = new Date(fromDate)
      f.setHours(0, 0, 0, 0)
      if (f < minD || f > maxD) {
        valid = false
      }
    }

    return {
      minClDateStr: minStr,
      maxClDateStr: maxStr,
      isClDateValid: valid,
    }
  }, [leaveType, fromDate])

  // Medical certificate requirement: mandatory if SL and totalDays > 3
  const isMedCertMandatory = leaveType === 'sl' && totalDays > 3.0

  // Check remaining quota for selected leave type
  const remainingQuota = useMemo(() => {
    if (leaveType === 'cl') return balances.cl?.remaining ?? defaultAccruedCL
    if (leaveType === 'el') return balances.el?.remaining ?? defaultAccruedEL
    if (leaveType === 'sl') return balances.sl?.remaining ?? 6.0
    return 999 // LOP is unlimited
  }, [leaveType, balances, defaultAccruedCL, defaultAccruedEL])

  const isExceedingQuota = leaveType !== 'lop' && totalDays > remainingQuota

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Medical certificate file size must be less than 5MB.')
        return
      }
      setMedicalFile(file)
      setMedicalFileName(file.name)
      setErrorMsg('')
    }
  }

  const removeFile = () => {
    setMedicalFile(null)
    setMedicalFileName('')
  }

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!fromDate) {
      setErrorMsg('Please select a From Date.')
      return
    }
    if (!toDate) {
      setErrorMsg('Please select a To Date.')
      return
    }
    if (new Date(fromDate) > new Date(toDate)) {
      setErrorMsg('To Date must be equal to or after From Date.')
      return
    }
    if (totalDays <= 0) {
      setErrorMsg('Total leave days must be at least 0.5 days.')
      return
    }
    if (!reason.trim()) {
      setErrorMsg('Please provide a reason for your leave application.')
      return
    }

    // CL advance validation
    if (leaveType === 'cl' && !isClDateValid) {
      setErrorMsg(
        `Casual Leave (CL) can only be applied between 5 and 30 days in advance (Allowed range: ${minClDateStr} to ${maxClDateStr}).`
      )
      return
    }

    // Quota validation
    if (isExceedingQuota) {
      const typeLabel = leaveType.toUpperCase()
      setErrorMsg(
        `You have only ${remainingQuota} days of ${typeLabel} remaining. Please apply for ${remainingQuota} days of ${typeLabel}, and apply the remaining ${(totalDays - remainingQuota).toFixed(1)} days under Loss of Pay (LOP).`
      )
      return
    }

    // Medical certificate validation
    if (isMedCertMandatory && !medicalFile) {
      setErrorMsg('Doctor prescription / medical certificate is mandatory for Sick Leave exceeding 3 days.')
      return
    }

    setSubmitting(true)

    const formData = new FormData()
    formData.append('leave_type', leaveType)
    formData.append('from_date', fromDate)
    formData.append('from_half', fromHalf)
    formData.append('to_date', toDate)
    formData.append('to_half', toHalf)
    formData.append('total_days', totalDays)
    formData.append('reason', reason.trim())
    if (medicalFile) {
      formData.append('medical_certificate', medicalFile)
    }

    try {
      const res = await applyEmployeeLeave(formData)
      setSuccessMsg(
        res?.data?.message ||
          `Leave application for ${totalDays} day(s) submitted successfully! It is currently pending admin review.`
      )
      
      // Reset form
      setFromDate('')
      setToDate('')
      setFromHalf('full')
      setToHalf('full')
      setReason('')
      setMedicalFile(null)
      setMedicalFileName('')

      // Reload live data
      await loadLeaveData()
    } catch (err) {
      console.error('Leave submit error:', err)
      const msg = err.response?.data?.message || err.message || 'Failed to submit leave application on server.'
      setErrorMsg(msg)
    } finally {
      setSubmitting(false)
      setTimeout(() => setSuccessMsg(''), 8000)
    }
  }

  // Pagination calculation for history
  const totalHistoryPages = Math.ceil(history.length / historyPerPage) || 1
  const safeHistoryPage = Math.min(historyPage, totalHistoryPages)
  const startIdx = (safeHistoryPage - 1) * historyPerPage
  const paginatedHistory = history.slice(startIdx, startIdx + historyPerPage)

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* ── 1. Leave Balances Summary Cards ────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-[#38b34a]">📊</span>
              <span>Annual Leave Balances &amp; Rules ({now.getFullYear()})</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Live quota tracking. Earned leaves carry over next year; other unused balances expire on Dec 31.
            </p>
          </div>
          <button
            onClick={loadLeaveData}
            disabled={loading}
            className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-gray-300 hover:text-white cursor-pointer transition-all flex items-center gap-1.5"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>Refresh Balances</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Casual Leave (CL) */}
          <div
            className="rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(22,25,38,0.95) 100%)',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  Casual Leave (CL)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                  0.5 / mo
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">
                  {balances.cl?.remaining ?? defaultAccruedCL}
                </span>
                <span className="text-xs text-gray-400 font-semibold">Days Remaining</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-3 border-t border-white/5 font-medium">
                <span>Accrued so far: <strong className="text-white">{balances.cl?.accrued ?? defaultAccruedCL}d</strong></span>
                <span>Taken: <strong className="text-emerald-400">{balances.cl?.taken ?? 0}d</strong></span>
              </div>
            </div>
            <div className="mt-3 bg-white/5 rounded-xl p-2 text-[10px] text-gray-400 leading-relaxed border border-white/5">
              📌 Apply <strong className="text-emerald-300">5 to 30 days ahead</strong>. Max 6/yr. Does not carry over.
            </div>
          </div>

          {/* 2. Earned Leave (EL) */}
          <div
            className="rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(22,25,38,0.95) 100%)',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                  Earned Leave (EL)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono font-bold">
                  0.25 / mo
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">
                  {balances.el?.remaining ?? defaultAccruedEL}
                </span>
                <span className="text-xs text-gray-400 font-semibold">Days Remaining</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-3 border-t border-white/5 font-medium">
                <span>Accrued so far: <strong className="text-white">{balances.el?.accrued ?? defaultAccruedEL}d</strong></span>
                <span>Taken: <strong className="text-purple-400">{balances.el?.taken ?? 0}d</strong></span>
              </div>
            </div>
            <div className="mt-3 bg-white/5 rounded-xl p-2 text-[10px] text-gray-400 leading-relaxed border border-white/5">
              ✨ <strong className="text-purple-300">Carries over to next year</strong>. Max 3/yr.
            </div>
          </div>

          {/* 3. Sick Leave (SL) */}
          <div
            className="rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(22,25,38,0.95) 100%)',
              border: '1px solid rgba(59,130,246,0.3)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  Sick Leave (SL)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold">
                  6 / yr Upfront
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">
                  {balances.sl?.remaining ?? 6.0}
                </span>
                <span className="text-xs text-gray-400 font-semibold">Days Remaining</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-3 border-t border-white/5 font-medium">
                <span>Yearly quota: <strong className="text-white">{balances.sl?.total ?? 6.0}d</strong></span>
                <span>Taken: <strong className="text-blue-400">{balances.sl?.taken ?? 0}d</strong></span>
              </div>
            </div>
            <div className="mt-3 bg-white/5 rounded-xl p-2 text-[10px] text-gray-400 leading-relaxed border border-white/5">
              🩺 <strong className="text-blue-300">Doctor Certificate required</strong> if leave &gt; 3 days.
            </div>
          </div>

          {/* 4. Loss of Pay (LOP) */}
          <div
            className="rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(22,25,38,0.95) 100%)',
              border: '1px solid rgba(244,63,94,0.3)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                  Loss of Pay (LOP)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono font-bold">
                  Unlimited
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-rose-400 font-mono">
                  {balances.lop?.taken ?? 0}
                </span>
                <span className="text-xs text-gray-400 font-semibold">Days Taken in {now.getFullYear()}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-3 border-t border-white/5 font-medium">
                <span>Quota: <strong className="text-white">Unlimited</strong></span>
                <span>Deduction: <strong className="text-rose-400">Per Day Salary</strong></span>
              </div>
            </div>
            <div className="mt-3 bg-white/5 rounded-xl p-2 text-[10px] text-gray-400 leading-relaxed border border-white/5">
              ⚠️ Apply when other leave quotas are exhausted. Deducted from monthly payslip.
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Apply For Leave Form ────────────────────────── */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #171a29 0%, #1c2136 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#38b34a]/20 text-[#38b34a] flex items-center justify-center font-black">
              📝
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Submit New Leave Request</h3>
              <p className="text-[11px] text-gray-400">
                Choose leave type, select dates, toggle half-days, and attach doctor prescription if needed.
              </p>
            </div>
          </div>

          {/* Live Duration Badge */}
          {totalDays > 0 && (
            <div
              className="px-4 py-2 rounded-xl text-center border shadow-md animate-fade-in"
              style={{
                background: isExceedingQuota ? 'rgba(239,68,68,0.15)' : 'rgba(56,179,74,0.15)',
                borderColor: isExceedingQuota ? 'rgba(239,68,68,0.3)' : 'rgba(56,179,74,0.3)',
              }}
            >
              <span className="text-[9px] uppercase tracking-wider block font-bold text-gray-400">
                Calculated Duration
              </span>
              <span
                className="text-base font-black font-mono block"
                style={{ color: isExceedingQuota ? '#ef4444' : '#38b34a' }}
              >
                {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          )}
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-start gap-2.5 animate-fade-in">
            <span className="text-base shrink-0">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Leave Type Selection */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-gray-300 block mb-2">
              Select Leave Type <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'cl', label: 'Casual Leave (CL)', remaining: balances.cl?.remaining ?? defaultAccruedCL },
                { id: 'el', label: 'Earned Leave (EL)', remaining: balances.el?.remaining ?? defaultAccruedEL },
                { id: 'sl', label: 'Sick Leave (SL)', remaining: balances.sl?.remaining ?? 6.0 },
                { id: 'lop', label: 'Loss of Pay (LOP)', remaining: 'Unlimited' },
              ].map((opt) => {
                const isSelected = leaveType === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setLeaveType(opt.id)
                      setErrorMsg('')
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#38b34a]/15 border-[#38b34a] text-white shadow-lg shadow-[#38b34a]/10'
                        : 'bg-white/3 border-white/5 hover:border-white/20 text-gray-300'
                    }`}
                  >
                    <span className="text-[12px] font-bold block">{opt.label}</span>
                    <span
                      className={`text-[10px] font-mono mt-1 font-semibold ${
                        isSelected ? 'text-[#38b34a]' : 'text-gray-400'
                      }`}
                    >
                      {opt.id === 'lop' ? 'No limit' : `Balance: ${opt.remaining}d`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Rule Notice Banners */}
          {leaveType === 'cl' && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-start gap-2.5">
              <span className="text-sm shrink-0">📅</span>
              <div>
                <strong>Casual Leave (CL) Advance Window:</strong> You must apply at least <strong>5 days</strong> in advance, and at most <strong>30 days</strong> ahead.
                <p className="text-[10px] text-emerald-400/80 mt-0.5">
                  Allowed From Dates for CL today: <strong>{minClDateStr}</strong> to <strong>{maxClDateStr}</strong>.
                </p>
              </div>
            </div>
          )}

          {leaveType === 'sl' && (
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] flex items-start gap-2.5">
              <span className="text-sm shrink-0">🩺</span>
              <div>
                <strong>Sick Leave (SL) Policy:</strong> 6 days credited at the start of the year. If your requested leave exceeds <strong>3.0 days</strong>, a doctor prescription / medical certificate upload is <strong>mandatory</strong>.
              </div>
            </div>
          )}

          {leaveType === 'lop' && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-start gap-2.5">
              <span className="text-sm shrink-0">ℹ️</span>
              <div>
                <strong>Loss of Pay (LOP):</strong> Can be applied anytime without quota limit. Each LOP day will be deducted from your monthly salary based on daily salary rate.
              </div>
            </div>
          )}

          {/* Quota Exceeded Warning */}
          {isExceedingQuota && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-2.5 animate-fade-in">
              <span className="text-base shrink-0">🚫</span>
              <div>
                <strong className="text-rose-400">Available Leave Quota Exceeded!</strong>
                <p className="mt-0.5">
                  You requested <strong>{totalDays} days</strong>, but your remaining {leaveType.toUpperCase()} balance is only <strong>{remainingQuota} days</strong>.
                </p>
                <p className="mt-1 text-[10px] text-gray-300">
                  Please adjust this request to <strong>{remainingQuota} days</strong>, and apply the remaining <strong>{(totalDays - remainingQuota).toFixed(1)} days</strong> as <strong>Loss of Pay (LOP)</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Row 2: Date Pickers & Half-Day Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* From Date Box */}
            <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-300 block">
                From Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  if (!toDate || e.target.value > toDate) {
                    setToDate(e.target.value)
                  }
                  setErrorMsg('')
                }}
                className="w-full bg-[#12141f] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-mono cursor-pointer"
              />

              {/* From Date Half Toggle */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  From Date Session / Half
                </span>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#12141f] rounded-xl border border-white/5">
                  {[
                    { id: 'full', label: 'Full Day' },
                    { id: 'fh', label: 'First Half (FH)' },
                    { id: 'sh', label: 'Second Half (SH)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFromHalf(s.id)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        fromHalf === s.id
                          ? 'bg-[#38b34a] text-white shadow-sm'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* To Date Box */}
            <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-300 block">
                To Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => {
                  setToDate(e.target.value)
                  setErrorMsg('')
                }}
                className="w-full bg-[#12141f] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-mono cursor-pointer"
              />

              {/* To Date Half Toggle */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  To Date Session / Half
                </span>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#12141f] rounded-xl border border-white/5">
                  {[
                    { id: 'full', label: 'Full Day' },
                    { id: 'fh', label: 'First Half (FH)' },
                    { id: 'sh', label: 'Second Half (SH)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setToHalf(s.id)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        toHalf === s.id
                          ? 'bg-[#38b34a] text-white shadow-sm'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Reason Textarea */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-gray-300 block mb-2">
              Reason for Leave <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide details regarding your leave (e.g. personal appointment, family function, viral illness)..."
              className="w-full bg-[#12141f] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#38b34a] transition-all resize-none"
            />
          </div>

          {/* Row 4: Medical Certificate Upload (Only for SL) */}
          {leaveType === 'sl' && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isMedCertMandatory
                  ? 'bg-blue-500/10 border-blue-500/40'
                  : 'bg-white/3 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🩺</span>
                  <label className="text-[11px] font-black uppercase tracking-wider text-white">
                    Medical Certificate / Doctor Prescription
                  </label>
                </div>
                {isMedCertMandatory ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                    Mandatory (&gt; 3 Days)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-gray-400 bg-white/5">
                    Optional (&le; 3 Days)
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-400 mb-3">
                Upload scanned image (JPG, PNG) or PDF copy of the doctor prescription. Max size: 5MB.
              </p>

              {medicalFileName ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="flex items-center gap-2 text-white font-medium truncate">
                    <span>📎</span>
                    <span className="truncate">{medicalFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-rose-400 hover:text-rose-300 font-bold text-xs ml-3 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-5 rounded-xl border border-dashed border-white/20 hover:border-[#38b34a] bg-black/20 hover:bg-black/30 cursor-pointer transition-all">
                  <span className="text-2xl mb-1">📤</span>
                  <span className="text-xs font-bold text-gray-300">Click to Browse Document</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Supports PDF, PNG, JPG (Max 5MB)</span>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={submitting || isExceedingQuota || (leaveType === 'cl' && !isClDateValid)}
              className="px-6 py-3 rounded-xl bg-[#38b34a] hover:bg-[#2fa03f] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#38b34a]/20 cursor-pointer transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin">🔄</span>
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Submit Leave Application ({totalDays} Days)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── 3. My Leave Applications History ───────────────── */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #161926 0%, #1c2136 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base text-[#38b34a]">📂</span>
            <h3 className="text-sm font-black text-white">Leave Application History</h3>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            Total Applications: <strong className="text-white">{history.length}</strong>
          </span>
        </div>

        {history.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">From Date</th>
                    <th className="py-3 px-3">To Date</th>
                    <th className="py-3 px-3 text-center">Duration</th>
                    <th className="py-3 px-3">Reason</th>
                    <th className="py-3 px-3 text-center">Doc</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Applied On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-200">
                  {paginatedHistory.map((item) => {
                    const fromLabel = `${item.from_date || '—'} ${
                      item.from_half === 'fh' ? '(FH)' : item.from_half === 'sh' ? '(SH)' : ''
                    }`
                    const toLabel = `${item.to_date || '—'} ${
                      item.to_half === 'fh' ? '(FH)' : item.to_half === 'sh' ? '(SH)' : ''
                    }`

                    return (
                      <tr key={item.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <LeaveTypeBadge type={item.leave_type} />
                        </td>
                        <td className="py-3.5 px-3 font-mono whitespace-nowrap text-gray-300">
                          {fromLabel}
                        </td>
                        <td className="py-3.5 px-3 font-mono whitespace-nowrap text-gray-300">
                          {toLabel}
                        </td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap font-mono font-bold text-white">
                          {item.total_days} {item.total_days === 1 ? 'day' : 'days'}
                        </td>
                        <td className="py-3.5 px-3 max-w-xs truncate text-gray-400" title={item.reason}>
                          {item.reason}
                        </td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          {item.medical_certificate_path ? (
                            <a
                              href={item.medical_certificate_path}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"
                            >
                              <span>📎</span>
                              <span>View</span>
                            </a>
                          ) : (
                            <span className="text-gray-500 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <LeaveStatusBadge status={item.status} />
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-[11px] text-gray-400 whitespace-nowrap">
                          {item.created_at ? item.created_at.split(' ')[0] : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalHistoryPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 text-xs">
                <span className="text-gray-400">
                  Showing <strong className="text-white">{startIdx + 1}</strong> to{' '}
                  <strong className="text-white">{Math.min(startIdx + historyPerPage, history.length)}</strong> of{' '}
                  <strong className="text-white">{history.length}</strong> applications
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    disabled={safeHistoryPage === 1}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold cursor-pointer"
                  >
                    &larr;
                  </button>
                  {Array.from({ length: totalHistoryPages }).map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setHistoryPage(idx + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        safeHistoryPage === idx + 1
                          ? 'bg-[#38b34a] text-white shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                    disabled={safeHistoryPage >= totalHistoryPages}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold cursor-pointer"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <span className="text-3xl block mb-2">🏖️</span>
            <p className="font-bold text-gray-400">No leave requests submitted yet.</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Use the form above to apply for Casual Leave, Earned Leave, Sick Leave, or Loss of Pay.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaveApplyTab
