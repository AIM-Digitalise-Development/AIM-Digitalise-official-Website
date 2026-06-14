import { useState, useEffect, useRef } from 'react'

/* ─── Demo Employees ─── */
const DEMO_EMPLOYEES = [
  { id: 'EMP-001', name: 'Rahul Sharma', dept: 'Engineering', avatar: 'R' },
  { id: 'EMP-002', name: 'Priya Mehta', dept: 'Sales', avatar: 'P' },
  { id: 'EMP-003', name: 'Amit Verma', dept: 'Support', avatar: 'A' },
  { id: 'EMP-004', name: 'Sneha Patil', dept: 'Marketing', avatar: 'S' },
  { id: 'EMP-005', name: 'Demo Admin', dept: 'Management', avatar: 'D' },
]

const StatusBadge = ({ status }) => {
  const map = { punched_in: { label: 'Punched In', color: '#38b34a' }, punched_out: { label: 'Punched Out', color: '#ef4444' }, break: { label: 'On Break', color: '#f59e0b' } }
  const s = map[status] || map.punched_out
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: s.color + '18', color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

const DemoEmployeePunchIn = () => {
  const [selectedEmp, setSelectedEmp] = useState(null)
  const [location, setLocation] = useState(null)
  const [locError, setLocError] = useState('')
  const [locLoading, setLocLoading] = useState(false)
  const [punchLog, setPunchLog] = useState([])
  const [empStatus, setEmpStatus] = useState({}) // empId -> 'punched_in' | 'punched_out' | 'break'
  const [now, setNow] = useState(new Date())
  const [showSuccess, setShowSuccess] = useState('')
  const watchRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

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
        setLocation({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
        })
        setLocLoading(false)
      },
      (err) => {
        setLocError(
          err.code === 1 ? 'Location access denied. Please allow location permission.' :
          err.code === 2 ? 'Location unavailable. Check your GPS.' :
          'Location request timed out. Please try again.'
        )
        setLocLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  useEffect(() => {
    fetchLocation()
  }, [])

  const handlePunch = (action) => {
    if (!selectedEmp) return
    const empId = selectedEmp.id
    const newStatus = action === 'punch_in' ? 'punched_in' : action === 'punch_out' ? 'punched_out' : 'break'
    setEmpStatus(prev => ({ ...prev, [empId]: newStatus }))

    const entry = {
      id: Date.now(),
      empId,
      empName: selectedEmp.name,
      dept: selectedEmp.dept,
      action,
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      date: now.toLocaleDateString('en-IN'),
      lat: location?.lat || 'N/A',
      lng: location?.lng || 'N/A',
      accuracy: location?.accuracy || 'N/A',
    }
    setPunchLog(prev => [entry, ...prev])
    setShowSuccess(`${selectedEmp.name} — ${action === 'punch_in' ? 'Punched In' : action === 'punch_out' ? 'Punched Out' : 'Break Started'} successfully!`)
    setTimeout(() => setShowSuccess(''), 3000)
  }

  const currentStatus = selectedEmp ? empStatus[selectedEmp.id] : null

  const actionLabel = (a) => {
    switch(a) { case 'punch_in': return '🟢 Punch In'; case 'punch_out': return '🔴 Punch Out'; case 'break': return '🟡 Break'; default: return a }
  }

  const mapsUrl = location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : '#'

  return (
    <div className="space-y-6 select-none animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-[#38b34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"/></svg>
            Employee Punch In
          </h1>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Track attendance with live GPS location capture</p>
        </div>
        {/* Live Clock */}
        <div className="rounded-2xl px-5 py-3 text-center" style={{ background: 'linear-gradient(135deg,#1a1d2b,#1e2235)', border: '1px solid rgba(56,179,74,0.3)' }}>
          <p className="text-[22px] font-black text-white font-mono tracking-wide">{timeStr}</p>
          <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{dateStr}</p>
        </div>
      </div>

      {/* Success Banner */}
      {showSuccess && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold animate-fade-in" style={{ background: 'rgba(56,179,74,0.15)', border: '1px solid rgba(56,179,74,0.4)', color: '#38b34a' }}>
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          {showSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Employee Selection + Punch */}
        <div className="space-y-4">
          {/* Employee Selector */}
          <div className="rounded-2xl p-5" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-[13px] font-black text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#38b34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="8" r="3.5"/><path d="M5 19c0-3 3-5 7-5s7 2 7 5"/></svg>
              Select Employee
            </h3>
            <div className="space-y-2">
              {DEMO_EMPLOYEES.map(emp => {
                const status = empStatus[emp.id]
                const isSelected = selectedEmp?.id === emp.id
                return (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmp(emp)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer"
                    style={{
                      background: isSelected ? 'rgba(56,179,74,0.12)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? '1px solid rgba(56,179,74,0.4)' : '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0"
                      style={{ background: isSelected ? 'linear-gradient(135deg,#38b34a,#22d3ee)' : 'linear-gradient(135deg,#374151,#4b5563)' }}>
                      {emp.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-white truncate">{emp.name}</p>
                      <p className="text-[10px] text-gray-500">{emp.id} · {emp.dept}</p>
                    </div>
                    {status && <StatusBadge status={status} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Punch Actions */}
          {selectedEmp && (
            <div className="rounded-2xl p-5 space-y-3" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-[13px] font-black text-white mb-1">
                Punch Action for <span className="text-[#38b34a]">{selectedEmp.name}</span>
              </h3>
              {currentStatus && (
                <div className="mb-2"><StatusBadge status={currentStatus} /></div>
              )}
              {!location && (
                <div className="text-[11px] text-yellow-400 font-semibold bg-yellow-400/10 rounded-lg px-3 py-2 mb-2">
                  ⚠️ Location required for punch. {locLoading ? 'Fetching...' : <button onClick={fetchLocation} className="underline cursor-pointer">Retry</button>}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handlePunch('punch_in')}
                  disabled={!location || currentStatus === 'punched_in'}
                  className="py-3 rounded-xl text-[12px] font-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(56,179,74,0.15)', color: '#38b34a', border: '1px solid rgba(56,179,74,0.3)' }}
                >🟢<br/>Punch In</button>
                <button
                  onClick={() => handlePunch('break')}
                  disabled={!location || currentStatus !== 'punched_in'}
                  className="py-3 rounded-xl text-[12px] font-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
                >🟡<br/>Break</button>
                <button
                  onClick={() => handlePunch('punch_out')}
                  disabled={!location || !currentStatus || currentStatus === 'punched_out'}
                  className="py-3 rounded-xl text-[12px] font-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                >🔴<br/>Punch Out</button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Location Panel */}
        <div className="space-y-4">
          {/* Live Location */}
          <div className="rounded-2xl p-5" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-black text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Live Location
              </h3>
              <button onClick={fetchLocation} disabled={locLoading} className="text-[11px] font-bold px-3 py-1 rounded-lg cursor-pointer transition-all disabled:opacity-50" style={{ background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }}>
                {locLoading ? '📡 Fetching...' : '🔄 Refresh'}
              </button>
            </div>

            {locError && (
              <div className="rounded-xl p-4 mb-3 text-[12px] font-semibold" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                ⚠️ {locError}
              </div>
            )}

            {locLoading && !location && (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
                <p className="text-[12px] text-gray-500 font-semibold">Fetching your GPS location...</p>
              </div>
            )}

            {location && (
              <div className="space-y-3">
                {/* Map placeholder with coordinates */}
                <div className="rounded-xl overflow-hidden relative h-40" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {/* Simulated map grid */}
                  <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center animate-ping absolute" style={{ background: 'rgba(56,179,74,0.3)' }} />
                    <div className="w-5 h-5 rounded-full flex items-center justify-center relative z-10" style={{ background: '#38b34a' }}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold font-mono z-10">{location.lat}, {location.lng}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Latitude</p>
                    <p className="text-[13px] font-black text-white font-mono">{location.lat}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Longitude</p>
                    <p className="text-[13px] font-black text-white font-mono">{location.lng}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Accuracy</p>
                    <p className="text-[13px] font-black text-cyan-400">±{location.accuracy}m</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Captured At</p>
                    <p className="text-[12px] font-black text-white">{location.timestamp}</p>
                  </div>
                </div>

                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer"
                  style={{ background: 'rgba(56,179,74,0.12)', color: '#38b34a', border: '1px solid rgba(56,179,74,0.3)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  View on Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Punch Log */}
      {punchLog.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-[13px] font-black text-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            Attendance Log ({punchLog.length} records)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Employee', 'Dept', 'Action', 'Time', 'Latitude', 'Longitude', 'Accuracy'].map(h => (
                    <th key={h} className="px-3 py-2 font-black text-gray-500 uppercase tracking-wider whitespace-nowrap text-[9px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {punchLog.map(r => (
                  <tr key={r.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-3 py-2.5 font-bold text-white whitespace-nowrap">{r.empName}</td>
                    <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{r.dept}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`font-black px-2 py-0.5 rounded-full text-[10px] ${r.action === 'punch_in' ? 'text-green-400 bg-green-400/10' : r.action === 'punch_out' ? 'text-red-400 bg-red-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                        {r.action === 'punch_in' ? 'In' : r.action === 'punch_out' ? 'Out' : 'Break'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-300 font-mono whitespace-nowrap">{r.time}</td>
                    <td className="px-3 py-2.5 text-cyan-400 font-mono text-[10px]">{r.lat}</td>
                    <td className="px-3 py-2.5 text-cyan-400 font-mono text-[10px]">{r.lng}</td>
                    <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">±{r.accuracy}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default DemoEmployeePunchIn
