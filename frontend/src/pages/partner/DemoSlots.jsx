import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getPartnerDemoSlots,
  getPartnerDemoSlotStats,
  togglePartnerDemoSlotStatus,
  deletePartnerDemoSlot,
  createPartnerDemoSlot,
  updatePartnerDemoSlot,
  getPartnerSlotBookings,
  cancelPartnerBooking
} from '../../api/partner'

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

const formatDate = (dStr) => {
  if (!dStr) return '—'
  const date = new Date(dStr)
  if (isNaN(date.getTime())) return dStr
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const DemoSlots = () => {
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
  const [pagination, setPagination] = useState(null)

  // Edit/Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const getDefaultSlotForm = () => ({
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

  const [formState, setFormState] = useState(getDefaultSlotForm())

  const days = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
  ]

  // ── Demo Slots Calendar Modal State ──
  const [showDemoCalendarModal, setShowDemoCalendarModal] = useState(false)
  const [demoCalendarMonth, setDemoCalendarMonth] = useState(new Date())
  const [selectedDemoDate, setSelectedDemoDate] = useState('')
  const [demoCalendarSlots, setDemoCalendarSlots] = useState([])
  const [demoCalendarBookings, setDemoCalendarBookings] = useState([])
  const [showDemoSlotPopup, setShowDemoSlotPopup] = useState(false)
  const [selectedDemoSlotId, setSelectedDemoSlotId] = useState(null)
  const [selectedDemoSlotDetail, setSelectedDemoSlotDetail] = useState(null)

  // 1. Data Fetching
  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const res = await getPartnerDemoSlotStats()
      if (res.data?.success) {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error('Error loading stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const loadSlots = async (page = 1) => {
    try {
      setLoading(true)
      setError('')
      const params = {
        page,
        search: search || undefined,
        demo_type: typeFilter || undefined,
        is_active: statusFilter || undefined,
        per_page: 20
      }
      const res = await getPartnerDemoSlots(params)
      if (res.data?.success) {
        setSlots(res.data.data?.data || [])
        setPagination({
          current_page: res.data.data?.current_page,
          last_page: res.data.data?.last_page,
          total: res.data.data?.total
        })
      }
    } catch (err) {
      console.error('Error loading slots:', err)
      setError(err?.message || 'Could not load slots from server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSlots(1)
  }, [search, typeFilter, statusFilter])

  useEffect(() => {
    loadStats()
  }, [])

  // Action triggers
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

  // Modals Toggles
  const openCreateModal = () => {
    setIsEditMode(false)
    setSelectedSlot(null)
    setFormState(getDefaultSlotForm())
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
    const anyDaySelected = days.some(d => formState[d.key])
    if (!anyDaySelected) {
      alert('Please select at least one day for this slot.')
      return
    }

    try {
      setSaving(true)
      if (isEditMode && selectedSlot) {
        const res = await updatePartnerDemoSlot(selectedSlot.id, formState)
        if (res.data?.success) triggerSuccess('Demo slot updated successfully.')
      } else {
        const res = await createPartnerDemoSlot(formState)
        if (res.data?.success) triggerSuccess('Demo slot created successfully.')
      }
      setIsModalOpen(false)
      loadSlots()
      loadStats()
    } catch (err) {
      console.error('Error submitting form:', err)
      alert(err?.message || 'Failed to submit demo slot details.')
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
      const res = await togglePartnerDemoSlotStatus(slot.id)
      if (res.data?.success) {
        triggerSuccess(res.data?.message || `Demo slot successfully ${slot.is_active ? 'deactivated' : 'activated'}.`)
        loadSlots()
        loadStats()
      }
    } catch (err) {
      console.error('Error toggling status:', err)
      alert(err?.message || 'Failed to toggle status.')
    }
  }

  const handleDeleteSlot = async (slot) => {
    if (!window.confirm(`Are you sure you want to delete the demo slot "${slot.title}"? This cannot be undone.`)) {
      return
    }
    try {
      const res = await deletePartnerDemoSlot(slot.id)
      if (res.data?.success) {
        triggerSuccess('Demo slot deleted successfully.')
        loadSlots()
        loadStats()
      }
    } catch (err) {
      console.error('Error deleting slot:', err)
      alert(err?.message || 'Failed to delete demo slot.')
    }
  }

  // Formatting recurring days display
  const getDayBadges = (slot) => {
    if (slot.all_days) {
      return <span className="inline-flex text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/25 rounded px-2 py-0.5">All Days</span>
    }
    const selected = []
    days.forEach(d => {
      if (slot[d.key]) selected.push(d.label)
    })
    if (selected.length === 0) return <span className="text-[10px] text-gray-500 font-bold">—</span>
    return (
      <div className="flex flex-wrap gap-1">
        {selected.map(label => (
          <span key={label} className="inline-flex text-[9px] font-bold bg-white/5 border border-white/10 text-gray-300 rounded px-1.5 py-0.5">
            {label}
          </span>
        ))}
      </div>
    )
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
    const date = new Date(dateString)
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
        const res = await getPartnerSlotBookings(slotId, selectedDemoDate)
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
      const res = await cancelPartnerBooking(bookingId)
      if (res.data?.success) {
        alert('Booking successfully cancelled!')
        // Refresh bookings for selected slot
        if (selectedDemoSlotId) {
          const bRes = await getPartnerSlotBookings(selectedDemoSlotId, selectedDemoDate)
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

      daysList.push(
        <button
          key={`day-demo-${d}`}
          type="button"
          onClick={() => handleDemoDateSelect(dateStr)}
          className={`p-2.5 border border-white/5 text-xs font-bold text-center hover:bg-aim-gold/20 hover:text-white transition-all rounded-lg cursor-pointer ${
            isSelected ? 'bg-aim-gold text-[#0B1B3A] border-aim-gold font-extrabold' : 'text-gray-300'
          }`}
        >
          {d}
        </button>
      )
    }

    return daysList
  }

  return (
    <>
      <Helmet>
        <title>Demo Slots Registry | AIM Partner</title>
      </Helmet>

      <div className="space-y-6 text-white text-left font-sans select-none">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Demo Slots Registry</h1>
            <p className="text-xs text-aim-copy-muted mt-1 font-medium">
              Configure, schedule, and view discovery meetings and client demo slots.
            </p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <button
              onClick={openDemoCalendar}
              className="px-4 py-2.5 bg-aim-navy-muted border border-white/10 hover:border-white/20 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
            >
              📅 View Demo Calendar
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-gradient-to-r from-aim-gold to-aim-gold-light hover:brightness-110 text-[#0B1B3A] rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-aim-gold/10"
            >
              ➕ Create Slot
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-bold text-center">
            {successMsg}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Slots', value: stats?.total_slots ?? 0, loading: statsLoading, color: 'border-slate-550' },
            { label: 'Active Slots', value: stats?.active_slots ?? 0, loading: statsLoading, color: 'border-green-500' },
            { label: 'Partner Slots', value: stats?.partner_slots ?? 0, loading: statsLoading, color: 'border-aim-navy-muted' },
            { label: 'Client Slots', value: stats?.client_slots ?? 0, loading: statsLoading, color: 'border-aim-gold' },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl border border-white/5 bg-[#0F2248]/40 p-4 border-t-2 ${s.color}`}>
              <span className="text-[10px] text-aim-copy-muted font-bold uppercase tracking-wider block">{s.label}</span>
              <p className="text-2xl font-black text-white mt-1 leading-none">
                {s.loading ? '...' : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters and search */}
        <div className="bg-[#0F2248]/30 rounded-2xl border border-white/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search slots by title or meeting link..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-aim-gold rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#0B1B3A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-aim-gold cursor-pointer font-bold"
            >
              <option value="">All Types</option>
              <option value="client">Client Demo</option>
              <option value="partner">Partner Training</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0B1B3A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-aim-gold cursor-pointer font-bold"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Demo slots list registry */}
        <div className="bg-[#0F2248]/20 rounded-2xl border border-white/5 shadow-card-depth overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs font-semibold text-left">
              <thead>
                <tr className="border-b border-white/10 bg-[#0B1B3A] text-aim-copy-muted uppercase tracking-wider text-[10px]">
                  <th className="p-4">Slot details</th>
                  <th className="p-4">Demo Type</th>
                  <th className="p-4">Timings</th>
                  <th className="p-4">Active Days</th>
                  <th className="p-4">Max Attendees</th>
                  <th className="p-4">Meeting Link</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/90">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-10 text-center text-aim-copy-muted animate-pulse">
                      Fetching demo slots configurations...
                    </td>
                  </tr>
                ) : slots.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-12 text-center text-aim-copy-muted">
                      <span className="text-3xl block mb-2">📅</span>
                      <p className="font-bold">No demo slot schedules defined.</p>
                    </td>
                  </tr>
                ) : (
                  slots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-white text-xs">{slot.title}</p>
                        {slot.created_at && (
                          <span className="text-[9px] text-aim-copy-muted font-medium block mt-0.5">
                            Created: {formatDate(slot.created_at)}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex text-[9px] font-black uppercase tracking-wider border rounded px-2 py-0.5 ${
                          slot.demo_type === 'partner'
                            ? 'bg-aim-navy-muted/30 text-sky-400 border-sky-400/20'
                            : 'bg-aim-gold/15 text-aim-gold border-aim-gold/20'
                        }`}>
                          {slot.demo_type}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-gray-300">
                        {fmtTime(slot.timing_from)} - {fmtTime(slot.timing_to)}
                      </td>
                      <td className="p-4">
                        {getDayBadges(slot)}
                      </td>
                      <td className="p-4 text-white text-xs font-mono">
                        {slot.max_attendees} pax
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 max-w-[150px]">
                          <a
                            href={slot.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-aim-gold hover:underline font-bold truncate"
                            title={slot.meeting_link}
                          >
                            Join Link
                          </a>
                          <button
                            onClick={() => handleCopyLink(slot.id, slot.meeting_link)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer text-[10px]"
                            title="Copy Link"
                          >
                            {copiedId === slot.id ? '✅' : '📋'}
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          slot.is_active
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {slot.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(slot)}
                            className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition-all cursor-pointer text-[11px]"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleToggleStatus(slot)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer text-[11px] ${
                              slot.is_active
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                                : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                            }`}
                            title={slot.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {slot.is_active ? '⏸️' : '▶️'}
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot)}
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer text-[11px]"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── CREATE/EDIT DEMO SLOT MODAL ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-[3px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0B1B3A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col text-xs font-semibold text-left"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">
                  {isEditMode ? '✏️ Edit Demo Slot configuration' : '➕ Create New Demo Slot'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-gray-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Slot Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formState.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Discovery Meeting - school Suite ERP"
                    required
                    className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Demo Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormState(prev => ({ ...prev, demo_type: 'client' }))}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formState.demo_type === 'client'
                          ? 'bg-aim-gold/15 text-aim-gold border-aim-gold/25'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                      }`}
                    >
                      🏫 Client Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormState(prev => ({ ...prev, demo_type: 'partner' }))}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formState.demo_type === 'partner'
                          ? 'bg-aim-navy-muted/40 text-sky-400 border-sky-400/25'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                      }`}
                    >
                      🤝 Partner Training
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Start Time *</label>
                    <input
                      type="time"
                      name="timing_from"
                      value={formState.timing_from}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white focus:outline-none transition-colors cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">End Time *</label>
                    <input
                      type="time"
                      name="timing_to"
                      value={formState.timing_to}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/5 border border-white/10 focus:border-[#F5A623] rounded-xl px-3 py-2 text-white focus:outline-none transition-colors cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Meeting Link *</label>
                    <input
                      type="url"
                      name="meeting_link"
                      value={formState.meeting_link}
                      onChange={handleInputChange}
                      placeholder="https://meet.google.com/..."
                      required
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Max Attendees</label>
                    <input
                      type="number"
                      name="max_attendees"
                      value={formState.max_attendees}
                      onChange={handleInputChange}
                      min="1"
                      required
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider">Recurring Days *</label>
                    <button
                      type="button"
                      onClick={handleAllDaysToggle}
                      className="text-[10px] font-bold text-aim-gold hover:underline cursor-pointer"
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
                              ? 'bg-aim-gold/15 text-aim-gold border-aim-gold/30'
                              : 'bg-white/5 text-gray-500 border-white/10 hover:text-gray-300'
                          }`}
                        >
                          {d.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
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
                    className="px-5 py-2.5 bg-gradient-to-r from-aim-gold to-aim-gold-light text-[#0B1B3A] font-black rounded-xl text-xs uppercase cursor-pointer"
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
              onClick={() => setShowDemoCalendarModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-[3px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0B1B3A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 text-xs font-semibold text-left flex flex-col max-h-[90vh]"
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
                      onClick={demoPrevMonth}
                      className="p-1 text-white hover:text-aim-gold cursor-pointer font-bold text-sm"
                    >
                      ◀ Prev
                    </button>
                    <span className="text-white font-black text-sm uppercase tracking-wider">
                      {demoCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={demoNextMonth}
                      className="p-1 text-white hover:text-aim-gold cursor-pointer font-bold text-sm"
                    >
                      Next ▶
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-aim-copy-muted text-[10px] uppercase">
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
                        Slots on: <span className="text-aim-gold">{formatDate(selectedDemoDate)}</span>
                      </p>

                      {/* Slots selector */}
                      <div className="space-y-2">
                        <label className="block text-[10px] text-aim-copy-muted uppercase">Select Slot Session</label>
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
                                      ? 'bg-aim-gold/15 border-aim-gold text-aim-gold'
                                      : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                                  }`}
                                >
                                  <span>{s.title}</span>
                                  <span className="text-[10px] text-aim-copy-muted font-mono mt-1">
                                    {fmtTime(s.timing_from)} - {fmtTime(s.timing_to)}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-[10px] text-aim-copy-muted py-2">No active slots scheduled for this day of the week.</p>
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
                                className="text-[10.5px] text-aim-gold hover:underline font-mono"
                              >
                                Join link: {selectedDemoSlotDetail.meeting_link}
                              </a>
                            </div>
                            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-300 font-mono">
                              Max attendees: {selectedDemoSlotDetail.max_attendees}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] text-aim-copy-muted uppercase">Booked Attendees ({demoCalendarBookings.length})</label>
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {demoCalendarBookings.length > 0 ? (
                                demoCalendarBookings.map((b) => (
                                  <div key={b.id} className="bg-white/3 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                                    <div>
                                      <p className="text-white font-bold">{b.lead?.client_name}</p>
                                      <p className="text-[10px] text-aim-copy-muted font-mono">{b.lead?.client_email} | {b.lead?.client_phone}</p>
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
                                <p className="text-[10.5px] text-aim-copy-muted py-2 text-center">No bookings registered for this session on this date.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="text-center py-20 text-aim-copy-muted">
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

    </>
  )
}

export default DemoSlots
