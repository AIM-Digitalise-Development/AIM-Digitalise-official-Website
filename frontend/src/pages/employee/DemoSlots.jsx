import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  createDemoSlot,
  getDemoSlots,
  updateDemoSlot,
  toggleDemoSlotStatus,
  deleteDemoSlot,
  getDemoStats,
  getSlotBookings
} from '../../api/demoSlots'
import { cancelBooking } from '../../api/leads'

export default function EmployeeDemoSlots() {
  // Lists & Stats state
  const [slots, setSlots] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  // Filters state
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [saving, setSaving] = useState(false)

  // ── Demo Slots Calendar State ──
  const [showDemoCalendarModal, setShowDemoCalendarModal] = useState(false)
  const [demoCalendarMonth, setDemoCalendarMonth] = useState(new Date())
  const [selectedDemoDate, setSelectedDemoDate] = useState('')
  const [demoCalendarSlots, setDemoCalendarSlots] = useState([])
  const [demoCalendarBookings, setDemoCalendarBookings] = useState([])
  const [showDemoSlotPopup, setShowDemoSlotPopup] = useState(false)
  const [selectedDemoSlotId, setSelectedDemoSlotId] = useState(null)
  const [selectedDemoSlotDetail, setSelectedDemoSlotDetail] = useState(null)

  // Form state
  const [formState, setFormState] = useState({
    demo_type: 'client',
    title: '',
    timing_from: '09:00',
    timing_to: '10:00',
    meeting_link: '',
    max_attendees: 10,
    all_days: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  })

  const days = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
  ]

  // 1. Data Fetching
  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const res = await getDemoStats()
      if (res.data?.success) {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error('Error loading demo stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const loadSlots = async () => {
    try {
      setLoading(true)
      setError('')
      const params = {
        search: search || undefined,
        demo_type: typeFilter || undefined,
        is_active: statusFilter || undefined
      }
      const res = await getDemoSlots(params)
      if (res.data?.success) {
        setSlots(res.data.data?.data || [])
      }
    } catch (err) {
      console.error('Error loading demo slots:', err)
      setError(err?.response?.data?.message || 'Could not load demo slots from server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSlots()
  }, [search, typeFilter, statusFilter])

  useEffect(() => {
    loadStats()
  }, [])

  // 2. Action triggers
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleCopyLink = (slotId, link) => {
    if (!link) return
    navigator.clipboard.writeText(link)
    setCopiedId(slotId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // 3. Modal Toggles
  const openCreateModal = () => {
    setIsEditMode(false)
    setSelectedSlot(null)
    setFormState({
      demo_type: 'client',
      title: '',
      timing_from: '09:00',
      timing_to: '10:00',
      meeting_link: '',
      max_attendees: 10,
      all_days: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (slot) => {
    setIsEditMode(true)
    setSelectedSlot(slot)
    setFormState({
      demo_type: slot.demo_type || 'client',
      title: slot.title || '',
      timing_from: slot.timing_from ? slot.timing_from.substring(0, 5) : '09:00',
      timing_to: slot.timing_to ? slot.timing_to.substring(0, 5) : '10:00',
      meeting_link: slot.meeting_link || '',
      max_attendees: slot.max_attendees || 10,
      all_days: !!slot.all_days,
      monday: !!slot.monday,
      tuesday: !!slot.tuesday,
      wednesday: !!slot.wednesday,
      thursday: !!slot.thursday,
      friday: !!slot.friday,
      saturday: !!slot.saturday,
      sunday: !!slot.sunday,
    })
    setIsModalOpen(true)
  }

  // 4. Form Actions
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleDayToggle = (dayKey) => {
    setFormState(prev => {
      const updatedDays = { ...prev, [dayKey]: !prev[dayKey] }
      // Recalculate all_days flag
      const allChecked = days.every(d => d.key === dayKey ? !prev[dayKey] : prev[d.key])
      return {
        ...updatedDays,
        all_days: allChecked
      }
    })
  }

  const handleAllDaysToggle = () => {
    setFormState(prev => {
      const nextAllVal = !prev.all_days
      return {
        ...prev,
        all_days: nextAllVal,
        monday: nextAllVal,
        tuesday: nextAllVal,
        wednesday: nextAllVal,
        thursday: nextAllVal,
        friday: nextAllVal,
        saturday: nextAllVal,
        sunday: nextAllVal,
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formState.title.trim()) {
      alert('Please enter a slot title.')
      return
    }
    if (!formState.meeting_link.trim()) {
      alert('Please enter a meeting link.')
      return
    }
    
    // Check if at least one day is selected
    const anyDaySelected = days.some(d => formState[d.key])
    if (!anyDaySelected) {
      alert('Please select at least one recurring day for this slot.')
      return
    }

    try {
      setSaving(true)
      if (isEditMode && selectedSlot) {
        await updateDemoSlot(selectedSlot.id, formState)
        triggerSuccess('Demo slot updated successfully.')
      } else {
        await createDemoSlot(formState)
        triggerSuccess('Demo slot created successfully.')
      }
      setIsModalOpen(false)
      loadSlots()
      loadStats()
    } catch (err) {
      console.error('Error submitting form:', err)
      alert(err?.response?.data?.message || 'Failed to submit demo slot details.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (slot) => {
    const actionLabel = slot.is_active ? 'deactivate' : 'activate'
    if (!window.confirm(`Are you sure you want to ${actionLabel} the demo slot "${slot.title}"?`)) {
      return
    }
    try {
      const res = await toggleDemoSlotStatus(slot.id)
      triggerSuccess(res.data?.message || `Demo slot successfully ${slot.is_active ? 'deactivated' : 'activated'}.`)
      loadSlots()
      loadStats()
    } catch (err) {
      console.error('Error toggling status:', err)
      alert(err?.response?.data?.message || 'Failed to toggle status.')
    }
  }

  const handleDeleteSlot = async (slot) => {
    if (!window.confirm(`Are you sure you want to delete the demo slot "${slot.title}"? This cannot be undone.`)) {
      return
    }
    try {
      await deleteDemoSlot(slot.id)
      triggerSuccess('Demo slot deleted successfully.')
      loadSlots()
      loadStats()
    } catch (err) {
      console.error('Error deleting slot:', err)
      alert(err?.response?.data?.message || 'Failed to delete demo slot.')
    }
  }

  // ── Demo Slots Calendar Handlers ──
  const openDemoCalendar = () => {
    setShowDemoCalendarModal(true)
    setDemoCalendarMonth(new Date())
    setSelectedDemoDate('')
    setShowDemoSlotPopup(false)
    setSelectedDemoSlotId(null)
    setSelectedDemoSlotDetail(null)
    setDemoCalendarSlots([])
    setDemoCalendarBookings([])
  }

  const demoPrevMonth = () => {
    setDemoCalendarMonth(new Date(demoCalendarMonth.getFullYear(), demoCalendarMonth.getMonth() - 1, 1))
    setSelectedDemoDate('')
    setShowDemoSlotPopup(false)
    setSelectedDemoSlotId(null)
    setSelectedDemoSlotDetail(null)
    setDemoCalendarSlots([])
    setDemoCalendarBookings([])
  }

  const demoNextMonth = () => {
    setDemoCalendarMonth(new Date(demoCalendarMonth.getFullYear(), demoCalendarMonth.getMonth() + 1, 1))
    setSelectedDemoDate('')
    setShowDemoSlotPopup(false)
    setSelectedDemoSlotId(null)
    setSelectedDemoSlotDetail(null)
    setDemoCalendarSlots([])
    setDemoCalendarBookings([])
  }

  const getDemoSlotsForDate = (dateString) => {
    const parts = dateString.split('-')
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
    const dayOfWeek = date.getDay()
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayKey = dayMap[dayOfWeek]

    return slots.filter(slot => {
      if (!slot.is_active) return false
      if (slot.all_days) return true
      return slot[dayKey] === true
    })
  }

  const handleDemoDateSelect = (dateString) => {
    setSelectedDemoDate(dateString)
    setShowDemoSlotPopup(false)
    setSelectedDemoSlotId(null)
    setSelectedDemoSlotDetail(null)

    const slotsForDate = getDemoSlotsForDate(dateString)
    setDemoCalendarSlots(slotsForDate)

    if (slotsForDate.length > 0) {
      setShowDemoSlotPopup(true)
    }
  }

  const handleDemoSlotSelect = async (slotId) => {
    setSelectedDemoSlotId(slotId)
    const slot = demoCalendarSlots.find(s => s.id === slotId)
    if (slot) {
      setSelectedDemoSlotDetail(slot)
      try {
        const res = await getSlotBookings(slotId, selectedDemoDate)
        if (res.data?.success) {
          setDemoCalendarBookings(res.data.data?.bookings || [])
        }
      } catch (e) {
        console.error('Error fetching bookings:', e)
      }
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this slot booking?')) return
    try {
      const res = await cancelBooking(bookingId)
      if (res.data?.success) {
        alert('Booking successfully cancelled!')
        // Refresh bookings for selected slot
        if (selectedDemoSlotId) {
          const bRes = await getSlotBookings(selectedDemoSlotId, selectedDemoDate)
          if (bRes.data?.success) {
            setDemoCalendarBookings(bRes.data.data?.bookings || [])
          }
        }
        loadStats()
      }
    } catch (e) {
      console.error(e)
      alert('Failed to cancel booking.')
    }
  }

  const renderDemoCalendarDays = () => {
    const year = demoCalendarMonth.getFullYear()
    const month = demoCalendarMonth.getMonth()

    const firstDayIndex = new Date(year, month, 1).getDay()
    const lastDay = new Date(year, month + 1, 0).getDate()

    const daysList = []

    for (let i = 0; i < firstDayIndex; i++) {
      daysList.push(<div key={`empty-demo-${i}`} className="p-2 border border-white/5 opacity-10"></div>)
    }

    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const isSelected = selectedDemoDate === dateStr
      const daySlots = getDemoSlotsForDate(dateStr)
      const hasSlots = daySlots.length > 0

      daysList.push(
        <button
          key={`day-demo-${d}`}
          type="button"
          onClick={() => handleDemoDateSelect(dateStr)}
          className={`p-2.5 border border-white/5 text-xs font-bold text-center hover:bg-[#38b34a]/20 hover:text-white transition-all rounded-lg cursor-pointer flex flex-col items-center justify-between min-h-[42px] ${
            isSelected ? 'bg-[#38b34a] text-black border-[#38b34a] font-extrabold' : 'text-gray-300'
          }`}
        >
          <span>{d}</span>
          {hasSlots && (
            <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-black' : 'bg-[#38b34a] animate-pulse'}`} />
          )}
        </button>
      )
    }

    return daysList
  }

  const formatDate = (dStr) => {
    if (!dStr) return '—'
    const date = new Date(dStr)
    if (isNaN(date.getTime())) return dStr
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const fmtTime = (t) => {
    if (!t) return ''
    const parts = t.split(':')
    if (parts.length >= 2) {
      let hours = parseInt(parts[0])
      const minutes = parts[1].split(':')[0]
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12 || 12
      return `${hours}:${minutes} ${ampm}`
    }
    return t
  }

  // 5. Presentation formatting utils
  const getDayBadges = (slot) => {
    if (slot.all_days) {
      return <span className="inline-flex text-[9px] font-black uppercase tracking-wider bg-green-400/10 text-green-450 border border-green-400/25 rounded-md px-2 py-0.5">All Days</span>
    }
    const selected = []
    days.forEach(d => {
      if (slot[d.key]) selected.push(d.label)
    })

    if (selected.length === 0) return <span className="text-[10px] text-gray-600 font-bold">—</span>
    return (
      <div className="flex flex-wrap gap-1">
        {selected.map(label => (
          <span key={label} className="inline-flex text-[9.5px] font-bold bg-white/5 border border-white/10 text-gray-300 rounded px-1.5 py-0.5">
            {label}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 select-none animate-fade-in text-gray-400 font-sans text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Demo Slots Registry</h1>
          <p className="text-xs text-gray-500 mt-1 font-semibold">Manage, schedule, and configure customer and partner video conference demo sessions.</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={openDemoCalendar}
            className="px-4 py-2 border border-white/10 hover:border-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            📅 View Demo Calendar
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#38b34a] hover:bg-[#38b34a]/85 text-black rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            ➕ Add Demo Slot
          </button>
        </div>
      </div>

      {/* Success alert notifications */}
      {successMsg && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-[#38b34a] rounded-xl text-xs font-bold text-center animate-fade-in">
          {successMsg}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Slots */}
        <button
          onClick={() => {
            setTypeFilter('')
            setStatusFilter('')
          }}
          className={`bg-gradient-to-br from-[#1a1d2b] to-[#1e2235] p-4 rounded-2xl flex items-center justify-between border transition-all duration-200 text-left hover:scale-[1.02] active:scale-95 cursor-pointer ${
            !typeFilter && !statusFilter
              ? 'border-cyan-400 shadow-lg shadow-cyan-400/10 scale-[1.02]'
              : 'border-white/5 hover:border-white/10'
          }`}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Total Slots</p>
            <p className="text-2xl font-black text-white mt-1 leading-none">
              {statsLoading ? '...' : stats?.total_slots || 0}
            </p>
          </div>
          <span className="text-2xl">📋</span>
        </button>

        {/* Active Slots */}
        <button
          onClick={() => {
            setStatusFilter(statusFilter === 'true' ? '' : 'true')
          }}
          className={`bg-gradient-to-br from-[#1a1d2b] to-[#1e2235] p-4 rounded-2xl flex items-center justify-between border transition-all duration-200 text-left hover:scale-[1.02] active:scale-95 cursor-pointer ${
            statusFilter === 'true'
              ? 'border-green-500 shadow-lg shadow-green-500/10 scale-[1.02]'
              : 'border-white/5 hover:border-white/10'
          }`}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Active Slots</p>
            <p className="text-2xl font-black text-white mt-1 leading-none">
              {statsLoading ? '...' : stats?.active_slots || 0}
            </p>
          </div>
          <span className="text-2xl">🟢</span>
        </button>

        {/* Partner Slots */}
        <button
          onClick={() => {
            setTypeFilter(typeFilter === 'partner' ? '' : 'partner')
          }}
          className={`bg-gradient-to-br from-[#1a1d2b] to-[#1e2235] p-4 rounded-2xl flex items-center justify-between border transition-all duration-200 text-left hover:scale-[1.02] active:scale-95 cursor-pointer ${
            typeFilter === 'partner'
              ? 'border-blue-400 shadow-lg shadow-blue-400/10 scale-[1.02]'
              : 'border-white/5 hover:border-white/10'
          }`}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Partner Slots</p>
            <p className="text-2xl font-black text-white mt-1 leading-none">
              {statsLoading ? '...' : stats?.partner_slots || 0}
            </p>
          </div>
          <span className="text-2xl">🤝</span>
        </button>

        {/* Client Slots */}
        <button
          onClick={() => {
            setTypeFilter(typeFilter === 'client' ? '' : 'client')
          }}
          className={`bg-gradient-to-br from-[#1a1d2b] to-[#1e2235] p-4 rounded-2xl flex items-center justify-between border transition-all duration-200 text-left hover:scale-[1.02] active:scale-95 cursor-pointer ${
            typeFilter === 'client'
              ? 'border-purple-400 shadow-lg shadow-purple-400/10 scale-[1.02]'
              : 'border-white/5 hover:border-white/10'
          }`}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Client Slots</p>
            <p className="text-2xl font-black text-white mt-1 leading-none">
              {statsLoading ? '...' : stats?.client_slots || 0}
            </p>
          </div>
          <span className="text-2xl">🏫</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1a1d2b] rounded-2xl border border-white/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex-1 max-w-md relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-550">🔍</span>
          <input
            type="text"
            placeholder="Search demo slots by title or meeting link..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/3 border border-white/5 hover:border-white/10 focus:border-[#38b34a] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none placeholder-gray-600 transition-colors"
          />
        </div>

        {/* Filters Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/3 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] cursor-pointer font-bold"
          >
            <option value="" className="bg-[#13151f]">All Types</option>
            <option value="client" className="bg-[#13151f]">Client Demo</option>
            <option value="partner" className="bg-[#13151f]">Partner Training</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/3 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] cursor-pointer font-bold"
          >
            <option value="" className="bg-[#13151f]">All Statuses</option>
            <option value="true" className="bg-[#13151f]">Active Only</option>
            <option value="false" className="bg-[#13151f]">Inactive Only</option>
          </select>

          {typeFilter || statusFilter || search ? (
            <button
              onClick={() => {
                setTypeFilter('')
                setStatusFilter('')
                setSearch('')
              }}
              className="px-3.5 py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Clear Filters ✕
            </button>
          ) : null}
        </div>
      </div>

      {/* Demo Slots Listing Table */}
      <div className="bg-[#1a1d2b] rounded-2xl border border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: '#13151f', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Slot Details</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Demo Type</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Timings</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Active Days</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Max Attendees</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Meeting Link</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Status</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-xs font-black text-gray-500 uppercase tracking-wider animate-pulse">
                    Loading Demo Slots registry...
                  </td>
                </tr>
              ) : slots.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center">
                    <span className="text-2xl block mb-2">📅</span>
                    <p className="text-xs font-bold text-white">No demo slots defined</p>
                    <p className="text-[11px] text-gray-550 mt-1">Add a new demo slot or adjust filters.</p>
                  </td>
                </tr>
              ) : (
                slots.map((slot) => {
                  return (
                    <tr key={slot.id} className="hover:bg-white/1.5 transition-colors">
                      {/* Title & Creation info */}
                      <td className="p-4">
                        <div className="text-left">
                          <p className="font-bold text-white text-xs">{slot.title}</p>
                          {slot.created_at && (
                            <span className="text-[9.5px] text-gray-550 block mt-0.5">
                              Created: {new Date(slot.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="p-4">
                        <div className="text-left">
                          <span className={`inline-flex text-[9px] font-black uppercase tracking-wider border rounded-md px-2 py-0.5 ${
                            slot.demo_type === 'partner'
                              ? 'bg-blue-400/10 text-blue-400 border-blue-400/25'
                              : 'bg-purple-400/10 text-purple-400 border-purple-400/25'
                          }`}>
                            {slot.demo_type}
                          </span>
                        </div>
                      </td>

                      {/* Timings */}
                      <td className="p-4">
                        <div className="text-left font-mono text-[11px] text-gray-300 font-bold">
                          {slot.timing_from} - {slot.timing_to}
                        </div>
                      </td>

                      {/* Recurring Days */}
                      <td className="p-4">
                        <div className="text-left">
                          {getDayBadges(slot)}
                        </div>
                      </td>

                      {/* Max Attendees */}
                      <td className="p-4">
                        <div className="text-left text-xs font-bold text-white">
                          {slot.max_attendees} pax
                        </div>
                      </td>

                      {/* Meeting Link with Copy Button */}
                      <td className="p-4">
                        <div className="text-left flex items-center gap-2 max-w-[150px]">
                          <a
                            href={slot.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#38b34a] hover:text-[#38b34a]/80 font-bold underline truncate"
                            title={slot.meeting_link}
                          >
                            Join Link
                          </a>
                          <button
                            onClick={() => handleCopyLink(slot.id, slot.meeting_link)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer text-[10px]"
                            title="Copy link to clipboard"
                          >
                            {copiedId === slot.id ? '✅' : '📋'}
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div className="text-left">
                          <span className={`inline-flex text-[9px] font-black uppercase tracking-wider border rounded-md px-2 py-0.5 ${
                            slot.is_active
                              ? 'bg-green-400/10 text-green-400 border-green-400/25'
                              : 'bg-red-400/10 text-red-450 border-red-400/25'
                          }`}>
                            {slot.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => openEditModal(slot)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-cyan-400 transition-colors cursor-pointer text-xs font-bold"
                            title="Edit demo slot"
                          >
                            ✏️
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(slot)}
                            className={`p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-colors cursor-pointer text-xs font-bold ${
                              slot.is_active ? 'text-amber-500' : 'text-green-400'
                            }`}
                            title={slot.is_active ? 'Deactivate Slot' : 'Activate Slot'}
                          >
                            {slot.is_active ? '⏸️' : '▶️'}
                          </button>

                          <button
                            onClick={() => handleDeleteSlot(slot)}
                            className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-400 transition-colors cursor-pointer text-xs font-bold"
                            title="Delete demo slot"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation/Edit Animated Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-[3px]"
            />

            {/* Modal Dialog container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#13151f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isEditMode ? '✏️ Edit Demo Slot' : '➕ Create New Demo Slot'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-gray-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Slot Title *</label>
                  <select
                    name="title"
                    value={formState.title}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/3 border border-white/5 focus:border-[#38b34a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#13151f]">Select Slot Title</option>
                    <option value="Morning Slot" className="bg-[#13151f]">Morning Slot</option>
                    <option value="Afternoon Slot" className="bg-[#13151f]">Afternoon Slot</option>
                    <option value="Noon Slot" className="bg-[#13151f]">Noon Slot</option>
                    <option value="Evening Slot" className="bg-[#13151f]">Evening Slot</option>
                    {formState.title && !['Morning Slot', 'Afternoon Slot', 'Noon Slot', 'Evening Slot'].includes(formState.title) && (
                      <option value={formState.title} className="bg-[#13151f]">{formState.title}</option>
                    )}
                  </select>
                </div>

                {/* Demo Type Tabs */}
                <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Demo Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormState(prev => ({ ...prev, demo_type: 'client' }))}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formState.demo_type === 'client'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/35'
                          : 'bg-white/3 text-gray-400 border-white/5 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      🏫 Client Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormState(prev => ({ ...prev, demo_type: 'partner' }))}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formState.demo_type === 'partner'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/35'
                          : 'bg-white/3 text-gray-400 border-white/5 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      🤝 Partner Training
                    </button>
                  </div>
                </div>

                {/* Timings row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Start Time *</label>
                    <input
                      type="time"
                      name="timing_from"
                      value={formState.timing_from}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/3 border border-white/5 focus:border-[#38b34a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">End Time *</label>
                    <input
                      type="time"
                      name="timing_to"
                      value={formState.timing_to}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/3 border border-white/5 focus:border-[#38b34a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors cursor-pointer"
                    />
                  </div>
                </div>

                {/* Meeting Link & Max Attendees */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Meeting Link *</label>
                    <input
                      type="url"
                      name="meeting_link"
                      value={formState.meeting_link}
                      onChange={handleInputChange}
                      placeholder="https://meet.google.com/..."
                      required
                      className="w-full bg-white/3 border border-white/5 focus:border-[#38b34a] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-650 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Max Attendees</label>
                    <input
                      type="number"
                      name="max_attendees"
                      value={formState.max_attendees}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      required
                      className="w-full bg-white/3 border border-white/5 focus:border-[#38b34a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Recurring Days selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider">Recurring Days *</label>
                    <button
                      type="button"
                      onClick={handleAllDaysToggle}
                      className="text-[10px] font-bold text-[#38b34a] hover:underline cursor-pointer"
                    >
                      {formState.all_days ? 'Deselect All' : 'Select All Days'}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {days.map(d => {
                      const isChecked = formState[d.key]
                      return (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => handleDayToggle(d.key)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-[#38b34a]/10 text-[#38b34a] border-[#38b34a]/35'
                              : 'bg-white/3 text-gray-500 border-white/5 hover:text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          {d.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#38b34a] hover:bg-[#38b34a]/85 disabled:bg-[#38b34a]/50 text-black rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Slot'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── VIEW DEMO CALENDAR MODAL ─── */}
      <AnimatePresence>
        {showDemoCalendarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-[3px]"
              onClick={() => setShowDemoCalendarModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#13151f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 text-xs font-semibold text-left flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">
                  📅 Demo Slots Calendar
                </h3>
                <button
                  onClick={() => setShowDemoCalendarModal(false)}
                  className="p-1 text-gray-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Grid layout body */}
              <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Monthly Calendar Picker */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={demoPrevMonth}
                      className="p-1 text-white hover:text-[#38b34a] cursor-pointer font-bold text-sm"
                    >
                      ◀ Prev
                    </button>
                    <span className="text-white font-black text-sm uppercase tracking-wider">
                      {demoCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      type="button"
                      onClick={demoNextMonth}
                      className="p-1 text-white hover:text-[#38b34a] cursor-pointer font-bold text-sm"
                    >
                      Next ▶
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-550 text-[10px] uppercase">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="p-1">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {renderDemoCalendarDays()}
                    </div>
                  </div>
                </div>

                {/* Right: Date specific slots & bookings */}
                <div className="lg:col-span-7 space-y-4 border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
                  {selectedDemoDate ? (
                    <div className="space-y-4">
                      <p className="text-white font-black text-xs uppercase tracking-wider">
                        Slots on: <span className="text-[#38b34a]">{formatDate(selectedDemoDate)}</span>
                      </p>

                      {/* Slots selector */}
                      <div className="space-y-2">
                        <label className="block text-[10px] text-gray-500 uppercase">Select Slot Session</label>
                        {demoCalendarSlots.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {demoCalendarSlots.map(s => {
                              const isSelected = selectedDemoSlotId === s.id
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => handleDemoSlotSelect(s.id)}
                                  className={`p-3 rounded-lg text-xs font-bold transition-all border text-left cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                      ? 'bg-[#38b34a]/15 border-[#38b34a] text-[#38b34a]'
                                      : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                                  }`}
                                >
                                  <span>{s.title}</span>
                                  <span className="text-[10px] text-gray-550 font-mono mt-1">
                                    {fmtTime(s.timing_from)} - {fmtTime(s.timing_to)}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-550 py-2">No active slots scheduled for this day of the week.</p>
                        )}
                      </div>

                      {/* Bookings details */}
                      {selectedDemoSlotId && selectedDemoSlotDetail && (
                        <div className="border-t border-white/5 pt-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-bold">{selectedDemoSlotDetail.title}</p>
                              <a
                                href={selectedDemoSlotDetail.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10.5px] text-[#38b34a] hover:underline font-mono"
                              >
                                Join link: {selectedDemoSlotDetail.meeting_link}
                              </a>
                            </div>
                            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-300 font-mono">
                              Max attendees: {selectedDemoSlotDetail.max_attendees}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] text-gray-550 uppercase">Booked Attendees ({demoCalendarBookings.length})</label>
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {demoCalendarBookings.length > 0 ? (
                                demoCalendarBookings.map((b) => (
                                  <div key={b.id} className="bg-white/3 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                                    <div>
                                      <p className="text-white font-bold">{b.lead?.client_name}</p>
                                      <p className="text-[10px] text-gray-550 font-mono">{b.lead?.client_email} | {b.lead?.client_phone}</p>
                                      {b.notes && <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Note: {b.notes}</p>}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleCancelBooking(b.id)}
                                      className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-450 font-bold rounded text-[10px] transition-colors cursor-pointer"
                                    >
                                      Cancel Booking
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[10.5px] text-gray-550 py-2 text-center">No bookings registered for this session on this date.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="text-center py-20 text-gray-550">
                      <span className="text-3xl block mb-2">👈</span>
                      Select a date on the calendar to view its recurring slot sessions and attendees lists.
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
