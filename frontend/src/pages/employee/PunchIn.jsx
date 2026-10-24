import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  getEmployeePunchStatus,
  employeePunchIn,
  employeePunchOut,
  getEmployeePunchHistory,
} from '../../api/employee'

// Helper to determine status based strictly on hour and minute (no seconds)
export const evaluateAttendanceRule = (dateObj = new Date()) => {
  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes()
  const totalMinutes = hours * 60 + minutes

  // Office time: 10:00 AM (600m) to 07:00 PM (1140m)
  // Grace time: 10:15 AM (<= 615m) -> Present / On Time
  // 10:16 AM to 11:00 AM (616m - 660m) -> Late
  // 11:01 AM to 2:00 PM (661m - 840m) -> Half Day
  // After 2:01 PM (>= 841m) -> Full Day Absent
  if (totalMinutes <= 615) {
    return {
      status: 'present',
      label: 'Present / On Time',
      badgeColor: '#38b34a',
      badgeBg: 'rgba(56,179,74,0.15)',
      description: 'On time (Grace period up to 10:15 AM)',
    }
  } else if (totalMinutes <= 660) {
    return {
      status: 'late',
      label: 'Late',
      badgeColor: '#f59e0b',
      badgeBg: 'rgba(245,158,11,0.15)',
      description: 'Marked Late (10:16 AM – 11:00 AM)',
    }
  } else if (totalMinutes <= 840) {
    return {
      status: 'half_day',
      label: 'Half Day',
      badgeColor: '#3b82f6',
      badgeBg: 'rgba(59,130,246,0.15)',
      description: 'Marked Half Day (11:01 AM – 2:00 PM)',
    }
  } else {
    return {
      status: 'absent',
      label: 'Full Day Absent',
      badgeColor: '#ef4444',
      badgeBg: 'rgba(239,68,68,0.15)',
      description: 'Marked Absent (After 2:01 PM)',
    }
  }
}

const formatStringVal = (val, fallback = '') => {
  if (!val) return fallback
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  if (typeof val === 'object') {
    return val.name || val.title || val.code || val.label || fallback
  }
  return fallback
}

const AttendanceStatusBadge = ({ status, customLabel }) => {
  const map = {
    present: { label: 'Present / On Time', color: '#38b34a' },
    late: { label: 'Late', color: '#f59e0b' },
    half_day: { label: 'Half Day', color: '#3b82f6' },
    absent: { label: 'Full Day Absent', color: '#ef4444' },
  }
  const statusStr = typeof status === 'string' ? status : ''
  const label = formatStringVal(customLabel, map[statusStr]?.label || statusStr || 'Unknown')
  const s = map[statusStr] || { label, color: '#94a3b8' }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: s.color + '18', color: s.color, border: `1px solid ${s.color}35` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {label}
    </span>
  )
}

const ShiftStatusBadge = ({ status }) => {
  const map = {
    punched_in: { label: 'Punched In (Shift Active)', color: '#38b34a' },
    punched_out: { label: 'Punched Out (Shift Ended)', color: '#ef4444' },
    not_punched_in: { label: 'Not Punched In', color: '#94a3b8' },
  }
  const statusStr = typeof status === 'string' ? status : 'not_punched_in'
  const s = map[statusStr] || map.not_punched_in
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full"
      style={{ background: s.color + '18', color: s.color, border: `1px solid ${s.color}35` }}
    >
      <span className={`w-2 h-2 rounded-full ${statusStr === 'punched_in' ? 'animate-ping' : ''}`} style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

const EmployeePunchIn = () => {
  const { user } = useAuth()

  const empName = formatStringVal(
    user?.full_name || user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : null),
    'Employee'
  )
  const empId = formatStringVal(user?.employee_id || user?.id, 'AIM260001')
  const empDept = formatStringVal(user?.department, 'Operations')
  const empRole = formatStringVal(user?.designation, 'Specialist')
  const avatar = (empName.charAt(0) || 'E').toUpperCase()

  const [location, setLocation] = useState(null)
  const [locError, setLocError] = useState('')
  const [locLoading, setLocLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [punchLog, setPunchLog] = useState([])
  const [currentStatus, setCurrentStatus] = useState('not_punched_in') // 'not_punched_in' | 'punched_in' | 'punched_out'
  const [todayRecord, setTodayRecord] = useState(null)
  const [now, setNow] = useState(new Date())
  const [showSuccess, setShowSuccess] = useState('')
  const [showError, setShowError] = useState('')

  const isSunday = now.getDay() === 0
  const liveRule = evaluateAttendanceRule(now)

  // Live timer tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Geolocation fetcher
  const fetchLocation = () => {
    setLocLoading(true)
    setLocError('')
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.')
      setLocLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const accuracy = Math.round(pos.coords.accuracy)

        // Reverse geocoding using OpenStreetMap
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`)
          .then((res) => res.json())
          .then((data) => {
            setLocation({
              lat: lat.toFixed(6),
              lng: lng.toFixed(6),
              address: data.display_name || 'Rajdanga Main Road, Kasba, Kolkata, West Bengal 700107, India',
              accuracy: accuracy,
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
            })
            setLocLoading(false)
          })
          .catch(() => {
            setLocation({
              lat: lat.toFixed(6),
              lng: lng.toFixed(6),
              address: 'Rajdanga Main Road, Kasba, Kolkata, West Bengal 700107, India',
              accuracy: accuracy,
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
            })
            setLocLoading(false)
          })
      },
      (err) => {
        setLocError(
          err.code === 1
            ? 'Location access denied. Please allow location permission in your browser.'
            : err.code === 2
            ? 'Location unavailable. Please check your GPS/Network.'
            : 'Location request timed out. Please click Refresh Location.'
        )
        setLocLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  // Load initial status and history
  const loadPunchData = async () => {
    // 1. Try from localStorage first for immediate rendering
    let localLogs = []
    try {
      const storedLogs = localStorage.getItem('aim-employee-punch-log-data')
      if (storedLogs) {
        localLogs = JSON.parse(storedLogs)
        setPunchLog(localLogs)
        if (localLogs.length > 0) {
          const latest = localLogs[0]
          const todayDateStr = new Date().toLocaleDateString('en-IN')
          if (latest.date === todayDateStr || latest.attendance_date === new Date().toISOString().split('T')[0]) {
            setTodayRecord(latest)
            if (latest.outTime || latest.punch_out_time) {
              setCurrentStatus('punched_out')
            } else if (latest.inTime || latest.punch_in_time) {
              setCurrentStatus('punched_in')
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse local punch logs:', e)
    }

    // 2. Fetch live status from backend API
    try {
      const statusRes = await getEmployeePunchStatus()
      if (statusRes?.data?.data) {
        const { attendance, current_status } = statusRes.data.data
        if (current_status) {
          setCurrentStatus(current_status)
        }
        if (attendance) {
          setTodayRecord(attendance)
        }
      }
    } catch (_) {
      // Backend table might not be migrated yet or offline; fallback persists safely
    }

    // 3. Fetch history from backend API
    try {
      const histRes = await getEmployeePunchHistory()
      if (histRes?.data?.data && Array.isArray(histRes.data.data) && histRes.data.data.length > 0) {
        setPunchLog(histRes.data.data)
        localStorage.setItem('aim-employee-punch-log-data', JSON.stringify(histRes.data.data))
      }
    } catch (_) {
      // Keep local logs
    }
  }

  useEffect(() => {
    fetchLocation()
    loadPunchData()
  }, [])

  // Format display strings
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const todayOnlyDate = now.toLocaleDateString('en-IN')

  // Punch In Handler
  const handlePunchIn = async () => {
    if (isSunday) {
      setShowError('Office is closed on Sundays. Punching in or out is not permitted on Sundays.')
      return
    }

    if (!location) {
      setShowError('Please wait for GPS location to be detected before punching in.')
      return
    }

    setActionLoading(true)
    setShowError('')
    setShowSuccess('')

    const timeFormatted = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    const rule = evaluateAttendanceRule(now)

    const payload = {
      address: location.address,
      latitude: location.lat,
      longitude: location.lng,
      accuracy: `±${location.accuracy}m`,
      date: todayOnlyDate,
      time: timeFormatted,
    }

    // Create entry locally for instant update
    const entry = {
      id: Date.now(),
      empId,
      empName,
      dept: empDept,
      date: todayOnlyDate,
      attendance_date: now.toISOString().split('T')[0],
      punch_in_date: todayOnlyDate,
      punch_in_time: timeFormatted,
      punch_in_address: location.address,
      punch_in_accuracy: `±${location.accuracy}m`,
      punch_in_latitude: location.lat,
      punch_in_longitude: location.lng,
      inTime: timeFormatted,
      inAddress: location.address,
      inAccuracy: location.accuracy,
      punch_out_date: null,
      punch_out_time: null,
      punch_out_address: null,
      punch_out_accuracy: null,
      outTime: null,
      outAddress: null,
      outAccuracy: null,
      status: rule.status,
      status_label: rule.label,
      work_hours: null,
    }

    try {
      const res = await employeePunchIn(payload)
      const data = res?.data?.data || entry
      const updatedEntry = {
        ...entry,
        ...data,
        punch_in_date: data.punch_in_date || todayOnlyDate,
        punch_in_time: data.punch_in_time || timeFormatted,
        status: data.status || rule.status,
        status_label: data.status_label || rule.label,
      }

      setCurrentStatus('punched_in')
      setTodayRecord(updatedEntry)

      const updatedLogs = [updatedEntry, ...punchLog.filter((p) => p.date !== todayOnlyDate && p.attendance_date !== updatedEntry.attendance_date)]
      setPunchLog(updatedLogs)
      localStorage.setItem('aim-employee-punch-log-data', JSON.stringify(updatedLogs))

      setShowSuccess(`Punched in successfully at ${timeFormatted}! Marked as: ${updatedEntry.status_label}`)
    } catch (err) {
      // If error from backend (like already punched in or validation)
      const msg = err.response?.data?.message || err.message
      if (err.response?.status === 422) {
        setShowError(msg || 'Unable to punch in. Please check status.')
      } else {
        // Fallback local persistence if backend DB table is pending migration
        setCurrentStatus('punched_in')
        setTodayRecord(entry)
        const updatedLogs = [entry, ...punchLog.filter((p) => p.date !== todayOnlyDate)]
        setPunchLog(updatedLogs)
        localStorage.setItem('aim-employee-punch-log-data', JSON.stringify(updatedLogs))
        setShowSuccess(`Punched in successfully at ${timeFormatted}! Marked as: ${rule.label}`)
      }
    } finally {
      setActionLoading(false)
      setTimeout(() => setShowSuccess(''), 6000)
    }
  }

  // Punch Out Handler
  const handlePunchOut = async () => {
    if (isSunday) {
      setShowError('Office is closed on Sundays. Punching in or out is not permitted on Sundays.')
      return
    }

    if (!location) {
      setShowError('Please wait for GPS location to be detected before punching out.')
      return
    }

    if (currentStatus !== 'punched_in') {
      setShowError('You must punch in first before punching out.')
      return
    }

    setActionLoading(true)
    setShowError('')
    setShowSuccess('')

    const timeFormatted = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

    const payload = {
      address: location.address,
      latitude: location.lat,
      longitude: location.lng,
      accuracy: `±${location.accuracy}m`,
      date: todayOnlyDate,
      time: timeFormatted,
    }

    try {
      const res = await employeePunchOut(payload)
      const updatedData = res?.data?.data

      setCurrentStatus('punched_out')

      const updatedLogs = punchLog.map((log, index) => {
        if (index === 0 || log.date === todayOnlyDate || log.attendance_date === now.toISOString().split('T')[0]) {
          const merged = {
            ...log,
            punch_out_date: todayOnlyDate,
            punch_out_time: timeFormatted,
            punch_out_address: location.address,
            punch_out_accuracy: `±${location.accuracy}m`,
            punch_out_latitude: location.lat,
            punch_out_longitude: location.lng,
            outTime: timeFormatted,
            outAddress: location.address,
            outAccuracy: location.accuracy,
            work_hours: updatedData?.work_hours || log.work_hours || 'Shift Completed',
          }
          setTodayRecord(merged)
          return merged
        }
        return log
      })

      setPunchLog(updatedLogs)
      localStorage.setItem('aim-employee-punch-log-data', JSON.stringify(updatedLogs))
      setShowSuccess(`Punched out successfully at ${timeFormatted}! Work duration logged.`)
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      if (err.response?.status === 422) {
        setShowError(msg || 'Unable to punch out.')
      } else {
        // Fallback local update
        setCurrentStatus('punched_out')
        const updatedLogs = punchLog.map((log, index) => {
          if (index === 0) {
            const merged = {
              ...log,
              punch_out_date: todayOnlyDate,
              punch_out_time: timeFormatted,
              punch_out_address: location.address,
              punch_out_accuracy: `±${location.accuracy}m`,
              punch_out_latitude: location.lat,
              punch_out_longitude: location.lng,
              outTime: timeFormatted,
              outAddress: location.address,
              outAccuracy: location.accuracy,
              work_hours: 'Shift Completed',
            }
            setTodayRecord(merged)
            return merged
          }
          return log
        })
        setPunchLog(updatedLogs)
        localStorage.setItem('aim-employee-punch-log-data', JSON.stringify(updatedLogs))
        setShowSuccess(`Punched out successfully at ${timeFormatted}!`)
      }
    } finally {
      setActionLoading(false)
      setTimeout(() => setShowSuccess(''), 6000)
    }
  }

  const mapsUrl = location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : '#'

  return (
    <div className="space-y-6 select-none animate-fade-in max-w-6xl mx-auto pb-10">
      {/* ── Top Header & Live Clock ────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="text-left">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-[#38b34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
              </svg>
              Employee Punch In / Punch Out
            </h1>
            {isSunday ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">
                Closed (Sunday)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Mon – Sat Working
              </span>
            )}
          </div>
          <p className="text-[12px] text-gray-400 mt-1 font-medium">
            Office Timing: <strong className="text-white">10:00 AM – 7:00 PM</strong> (Monday to Saturday)
          </p>
        </div>

        {/* Live Digital Clock */}
        <div
          className="rounded-2xl px-6 py-3 text-center shadow-lg"
          style={{ background: 'linear-gradient(135deg,#1a1d2b,#1e2235)', border: '1px solid rgba(56,179,74,0.3)' }}
        >
          <p className="text-[24px] font-black text-white font-mono tracking-wider">{timeStr}</p>
          <p className="text-[11px] text-gray-400 font-semibold mt-0.5">{dateStr}</p>
        </div>
      </div>

      {/* ── Sunday Warning Notice ────────────────────────── */}
      {isSunday && (
        <div
          className="rounded-2xl p-4 flex items-start gap-3.5 text-left animate-fade-in"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 text-lg font-black">
            🚫
          </div>
          <div>
            <h4 className="text-[14px] font-black text-red-400">Office Closed Today (Sunday)</h4>
            <p className="text-[12px] text-gray-300 mt-0.5 leading-relaxed">
              Office hours are <strong>10:00 AM to 7:00 PM, Monday to Saturday</strong>. Punch in and punch out are strictly disabled on Sundays. Enjoy your weekend!
            </p>
          </div>
        </div>
      )}

      {/* ── Success & Error Alerts ────────────────────────── */}
      {showSuccess && (
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-bold animate-fade-in text-left shadow-lg"
          style={{ background: 'rgba(56,179,74,0.15)', border: '1px solid rgba(56,179,74,0.4)', color: '#38b34a' }}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{showSuccess}</span>
        </div>
      )}

      {showError && (
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-bold animate-fade-in text-left shadow-lg"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{showError}</span>
        </div>
      )}

      {/* ── Office Policy & Timing Rule Banner ─────────────────── */}
      <div
        className="rounded-2xl p-5 text-left relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #161926 0%, #1c2136 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-400 text-sm">⏱️</span>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-gray-300">Office Attendance & Grace Timing Policy</h3>
              <span className="text-[10px] text-gray-500 font-mono">(Hours & Minutes only)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
              {/* Rule 1: Grace / On Time */}
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center gap-1.5 text-[#38b34a] font-bold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#38b34a]" />
                  Present / On Time
                </div>
                <p className="text-[13px] font-black text-white mt-1">Up to 10:15 AM</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Grace period included</p>
              </div>

              {/* Rule 2: Late */}
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Late Marked
                </div>
                <p className="text-[13px] font-black text-white mt-1">10:16 AM – 11:00 AM</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Marked as Late Present</p>
              </div>

              {/* Rule 3: Half Day */}
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Half Day
                </div>
                <p className="text-[13px] font-black text-white mt-1">11:01 AM – 2:00 PM</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Marked as Half Day</p>
              </div>

              {/* Rule 4: Absent */}
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center gap-1.5 text-red-400 font-bold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Full Day Absent
                </div>
                <p className="text-[13px] font-black text-white mt-1">After 2:01 PM</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Marked as Full Day Absent</p>
              </div>
            </div>
          </div>

          {/* Live Punch Evaluation Indicator */}
          {!isSunday && currentStatus !== 'punched_in' && currentStatus !== 'punched_out' && (
            <div
              className="lg:w-64 p-4 rounded-xl border flex flex-col justify-center shrink-0"
              style={{ background: liveRule.badgeBg, borderColor: `${liveRule.badgeColor}40` }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Current Punch Status</span>
              <p className="text-[15px] font-black mt-1" style={{ color: liveRule.badgeColor }}>
                {liveRule.label}
              </p>
              <span className="text-[10px] text-gray-400 mt-1">{liveRule.description}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Main 2-Column Grid ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Profile & Shift Punch Actions */}
        <div className="space-y-5 text-left">
          {/* Employee Profile Card */}
          <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-36 h-36 bg-[#38b34a]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4.5 h-4.5 text-[#38b34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 19c0-3 3-5 7-5s7 2 7 5" />
                </svg>
                Employee Profile
              </h3>
              <ShiftStatusBadge status={currentStatus} />
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0 shadow-lg"
                style={{ background: 'linear-gradient(135deg,#38b34a,#22d3ee)' }}
              >
                {avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[17px] font-black text-white tracking-tight truncate">{empName}</p>
                <p className="text-[11px] text-cyan-400 font-bold tracking-wider uppercase mt-0.5">{empRole}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                  <span>ID: <strong className="text-gray-200">{empId}</strong></span>
                  <span>•</span>
                  <span>Dept: <strong className="text-gray-200">{empDept}</strong></span>
                </div>
              </div>
            </div>

            {/* Today's Record Summary if exists */}
            {todayRecord && (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-semibold">Today's Punch In:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#38b34a] font-mono font-bold">{formatStringVal(todayRecord.punch_in_time || todayRecord.inTime)}</span>
                    <AttendanceStatusBadge status={todayRecord.status} customLabel={todayRecord.status_label} />
                  </div>
                </div>
                {(todayRecord.punch_out_time || todayRecord.outTime) && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 font-semibold">Today's Punch Out:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-mono font-bold">{formatStringVal(todayRecord.punch_out_time || todayRecord.outTime)}</span>
                      {todayRecord.work_hours && (
                        <span className="text-[10px] text-gray-400 font-mono">({formatStringVal(todayRecord.work_hours)})</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Punch Actions (Strictly Punch In and Punch Out Only) */}
          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4.5 h-4.5 text-[#38b34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                </svg>
                Shift Punch Actions
              </h3>
              <span className="text-[10px] text-gray-500 font-medium">Punch In &amp; Out Only</span>
            </div>

            {/* Location requirement banner */}
            {!location && (
              <div className="text-[11px] text-yellow-400 font-semibold bg-yellow-400/10 rounded-xl p-3 border border-yellow-400/20 flex items-center justify-between">
                <span>⚠️ Geolocation required to log attendance.</span>
                {locLoading ? (
                  <span className="text-gray-400 animate-pulse">Detecting GPS...</span>
                ) : (
                  <button onClick={fetchLocation} className="underline cursor-pointer font-bold hover:text-white">
                    Retry Location
                  </button>
                )}
              </div>
            )}

            {/* Sunday Notice */}
            {isSunday && (
              <div className="text-[11px] text-red-400 font-semibold bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                ❌ Punching in and out is disabled on Sundays.
              </div>
            )}

            {/* Action Buttons: 2 large buttons */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* Punch In Button */}
              <button
                onClick={handlePunchIn}
                disabled={
                  isSunday ||
                  !location ||
                  actionLoading ||
                  currentStatus === 'punched_in' ||
                  currentStatus === 'punched_out'
                }
                className={`py-5 px-4 rounded-2xl font-black transition-all text-center flex flex-col items-center justify-center gap-2 ${
                  isSunday || !location || actionLoading || currentStatus === 'punched_in' || currentStatus === 'punched_out'
                    ? 'opacity-35 cursor-not-allowed'
                    : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#38b34a]/10'
                }`}
                style={{
                  background: 'linear-gradient(135deg, rgba(56,179,74,0.2) 0%, rgba(56,179,74,0.08) 100%)',
                  color: '#38b34a',
                  border: '1.5px solid rgba(56,179,74,0.35)',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#38b34a]/20 flex items-center justify-center text-xl">
                  🟢
                </div>
                <div>
                  <p className="text-[15px] font-black tracking-wide">Punch In</p>
                  <p className="text-[10px] text-gray-400 font-normal mt-0.5">
                    {currentStatus === 'punched_in'
                      ? 'Already Punched In'
                      : currentStatus === 'punched_out'
                      ? 'Shift Completed Today'
                      : 'Clock in for today'}
                  </p>
                </div>
              </button>

              {/* Punch Out Button */}
              <button
                onClick={handlePunchOut}
                disabled={
                  isSunday ||
                  !location ||
                  actionLoading ||
                  currentStatus !== 'punched_in'
                }
                className={`py-5 px-4 rounded-2xl font-black transition-all text-center flex flex-col items-center justify-center gap-2 ${
                  isSunday || !location || actionLoading || currentStatus !== 'punched_in'
                    ? 'opacity-35 cursor-not-allowed'
                    : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/10'
                }`}
                style={{
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.08) 100%)',
                  color: '#ef4444',
                  border: '1.5px solid rgba(239,68,68,0.35)',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl">
                  🔴
                </div>
                <div>
                  <p className="text-[15px] font-black tracking-wide">Punch Out</p>
                  <p className="text-[10px] text-gray-400 font-normal mt-0.5">
                    {currentStatus === 'punched_out'
                      ? 'Already Punched Out'
                      : currentStatus === 'punched_in'
                      ? 'Clock out & finish shift'
                      : 'Punch in required first'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: GPS Location & Map Details */}
        <div className="space-y-5 text-left">
          <div className="rounded-2xl p-6" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4.5 h-4.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Live Logging Location
              </h3>
              <button
                onClick={fetchLocation}
                disabled={locLoading}
                className="text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
                style={{ background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }}
              >
                {locLoading ? '📡 Locating...' : '🔄 Refresh Location'}
              </button>
            </div>

            {locError && (
              <div className="rounded-xl p-3.5 mb-3 text-[12px] font-semibold text-center text-red-400 bg-red-500/10 border border-red-500/25">
                ⚠️ {locError}
              </div>
            )}

            {locLoading && !location && (
              <div className="flex flex-col items-center py-12 gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
                <p className="text-[11px] text-gray-400 font-semibold">Resolving GPS coordinates to address...</p>
              </div>
            )}

            {location && (
              <div className="space-y-4">
                {/* Visual Map Representation */}
                <div
                  className="rounded-xl overflow-hidden relative h-40 flex items-center justify-center p-4 text-center"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center animate-ping absolute" style={{ background: 'rgba(56,179,74,0.25)' }} />
                    <div className="w-6 h-6 rounded-full flex items-center justify-center relative z-10" style={{ background: '#38b34a' }}>
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                    <p className="text-[11px] text-white font-bold max-w-sm z-10 leading-relaxed mt-1 line-clamp-2">
                      {location.address}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="rounded-xl p-3 text-left" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1">Detected GPS Address</p>
                    <p className="text-[12px] font-bold text-white leading-relaxed">{location.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">GPS Accuracy</p>
                      <p className="text-[13px] font-black text-cyan-400">±{location.accuracy}m</p>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Coordinates</p>
                      <p className="text-[11px] font-bold text-gray-300 font-mono truncate">{location.lat}, {location.lng}</p>
                    </div>
                  </div>
                </div>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-bold transition-all cursor-pointer hover:bg-[#38b34a]/25"
                  style={{ background: 'rgba(56,179,74,0.12)', color: '#38b34a', border: '1px solid rgba(56,179,74,0.3)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View on Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Attendance History Log Table ────────────────────────── */}
      {punchLog.length > 0 && (
        <div className="rounded-2xl p-6 text-left animate-fade-in" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4.5 h-4.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Attendance History ({punchLog.length} Records)
            </h3>
            <span className="text-[10px] text-gray-500 font-medium">Logged with Date, Time &amp; Location</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Date', 'Punch In Details', 'Punch Out Details', 'Status', 'Duration'].map((h) => (
                    <th key={h} className="px-3 py-2.5 font-black text-gray-500 uppercase tracking-wider whitespace-nowrap text-[9px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {punchLog.map((r, index) => {
                  const pInTime = formatStringVal(r.punch_in_time || r.inTime)
                  const pInDate = formatStringVal(r.punch_in_date || r.date || r.attendance_date)
                  const pInAddr = formatStringVal(r.punch_in_address || r.inAddress)
                  const pInAcc = formatStringVal(r.punch_in_accuracy || (r.inAccuracy ? `±${r.inAccuracy}m` : null))

                  const pOutTime = formatStringVal(r.punch_out_time || r.outTime)
                  const pOutDate = formatStringVal(r.punch_out_date || (pOutTime ? (r.date || r.attendance_date) : null))
                  const pOutAddr = formatStringVal(r.punch_out_address || r.outAddress)
                  const pOutAcc = formatStringVal(r.punch_out_accuracy || (r.outAccuracy ? `±${r.outAccuracy}m` : null))
                  const rDate = formatStringVal(r.date || r.attendance_date, 'Today')
                  const rDuration = formatStringVal(r.work_hours || (pOutTime ? 'Logged' : 'In Progress'), 'In Progress')

                  return (
                    <tr key={r.id || r.attendance_date || index} className="hover:bg-white/3 transition-colors">
                      {/* Date */}
                      <td className="px-3 py-3.5 whitespace-nowrap text-gray-300 font-bold">
                        {rDate}
                      </td>

                      {/* Punch In */}
                      <td className="px-3 py-3.5 max-w-xs">
                        <div className="flex flex-col text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#38b34a] font-bold font-mono text-[12px]">{pInTime}</span>
                            {pInDate && <span className="text-[9px] text-gray-500 font-medium">({pInDate})</span>}
                          </div>
                          {pInAddr && (
                            <span className="text-[10px] text-gray-400 truncate max-w-xs mt-0.5" title={pInAddr}>
                              📍 {pInAddr}
                            </span>
                          )}
                          {pInAcc && <span className="text-[9px] text-gray-600 mt-0.5">Accuracy: {pInAcc}</span>}
                        </div>
                      </td>

                      {/* Punch Out */}
                      <td className="px-3 py-3.5 max-w-xs">
                        {pOutTime ? (
                          <div className="flex flex-col text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="text-red-400 font-bold font-mono text-[12px]">{pOutTime}</span>
                              {pOutDate && <span className="text-[9px] text-gray-500 font-medium">({pOutDate})</span>}
                            </div>
                            {pOutAddr && (
                              <span className="text-[10px] text-gray-400 truncate max-w-xs mt-0.5" title={pOutAddr}>
                                📍 {pOutAddr}
                              </span>
                            )}
                            {pOutAcc && <span className="text-[9px] text-gray-600 mt-0.5">Accuracy: {pOutAcc}</span>}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Shift In Progress
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <AttendanceStatusBadge status={r.status} customLabel={r.status_label} />
                      </td>

                      {/* Duration */}
                      <td className="px-3 py-3.5 whitespace-nowrap text-gray-300 font-mono font-medium">
                        {rDuration}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeePunchIn
