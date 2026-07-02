import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getPartnerLeads,
  getPartnerLeadStats,
  getPartnerLeadDetails,
  createPartnerLead,
  updatePartnerLead,
  deletePartnerLead,
  assignPartnerDemoSlot,
  removePartnerDemoSlot,
  schedulePartnerFollowUp,
  getPartnerCategories,
  getPartnerSubcategories,
  getPartnerProductsDropdown,
  getPartnerDemoSlotsAvailable,
  getPartnerSlotBookings,
  bookPartnerDemoSlot,
  cancelPartnerBooking
} from '../../api/partner'

// ─── badge styling helpers ───────────────────────────────────────────────────
const statusBadgeMap = {
  new: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  contacted: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  qualified: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  proposal: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  negotiation: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  converted: 'bg-green-500/10 text-green-400 border border-green-500/20',
  lost: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  junk: 'bg-slate-505/10 text-slate-400 border border-slate-500/20',
}

const priorityBadgeMap = {
  low: 'bg-slate-550/10 text-slate-400 border border-slate-500/20',
  medium: 'bg-amber-550/10 text-amber-400 border border-amber-500/20',
  high: 'bg-orange-550/10 text-orange-450 border border-orange-500/20',
  urgent: 'bg-rose-550/10 text-rose-400 border border-rose-500/20',
}

// Helper to format date
const formatDate = (dStr) => {
  if (!dStr) return '—'
  const date = new Date(dStr)
  if (isNaN(date.getTime())) return dStr
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Main Component ───────────────────────────────────────────────────────────
const PartnerLeads = () => {
  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [validationErrors, setValidationErrors] = useState({})

  // ── Leads Data ──
  const [leads, setLeads] = useState([])
  const [leadStats, setLeadStats] = useState(null)
  const [leadPagination, setLeadPagination] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [leadActivities, setLeadActivities] = useState([])
  const [leadFilters, setLeadFilters] = useState({
    status: '', priority: '', search: '', date_from: '', date_to: '',
    follow_up_today: false, pending_follow_up: false, per_page: 20,
  })

  // ── Modals ──
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const emptyLead = {
    client_name: '', client_email: '', client_phone: '',
    client_alternate_phone: '', company_name: '', address: '', city: '',
    state: '', pin_code: '', country: 'India', lead_source: '',
    lead_status: 'new', lead_priority: 'medium', category_id: '',
    sub_category_id: '', product_id: '', follow_up_date: '', notes: '',
    budget: '', expected_close_date: '',
  }
  const [leadFormData, setLeadFormData] = useState(emptyLead)

  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [products, setProducts] = useState([])

  // ── Follow-up Modal ──
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [followUpLead, setFollowUpLead] = useState(null)
  const [followUpForm, setFollowUpForm] = useState({
    next_date: '',
    status: '',
    remark: '',
  })
  const [saving, setSaving] = useState(false)

  // ── Booking Modal State ──
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingLeadId, setBookingLeadId] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState('')
  const [bookingSaving, setBookingSaving] = useState(false)
  const [bookingAvailableSlots, setBookingAvailableSlots] = useState([])
  const [slotBookings, setSlotBookings] = useState([])

  // ── Popup States ──
  const [showTitlePopup, setShowTitlePopup] = useState(false)
  const [showTimePopup, setShowTimePopup] = useState(false)
  const [selectedSlotTitle, setSelectedSlotTitle] = useState('')
  const [selectedSlotIdForBooking, setSelectedSlotIdForBooking] = useState(null)
  const [bookingNotes, setBookingNotes] = useState('')
  const [availableSlotTitles, setAvailableSlotTitles] = useState([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])

  // ── Fetch Initial Data ──
  useEffect(() => {
    fetchLeads()
    fetchLeadStats()
    fetchCategories()
    fetchAvailableDemoSlots()
  }, [])

  // Refetch leads on filter change
  useEffect(() => {
    fetchLeads(1)
  }, [leadFilters])

  // ── API Handlers ──
  const autoErr = (result) => {
    if (result.errors) {
      setValidationErrors(result.errors)
      setError(Object.values(result.errors).flat().join(', '))
    } else {
      setError(result.message || 'Something went wrong')
    }
  }

  const fetchLeads = async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      Object.entries({ ...leadFilters, page }).forEach(([k, v]) => {
        if (v !== '' && v !== false) params[k] = v
      })
      const res = await getPartnerLeads(params)
      if (res.data?.success) {
        setLeads(res.data.data?.data || [])
        setLeadPagination({
          current_page: res.data.data?.current_page,
          last_page: res.data.data?.last_page,
          total: res.data.data?.total
        })
      } else {
        setError(res.data?.message || 'Failed to load leads')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeadStats = async () => {
    try {
      const res = await getPartnerLeadStats()
      if (res.data?.success) setLeadStats(res.data.data)
    } catch {}
  }

  const fetchLeadDetails = async (id) => {
    try {
      const res = await getPartnerLeadDetails(id)
      if (res.data?.success) {
        setSelectedLead(res.data.data?.lead)
        setLeadActivities(res.data.data?.activities || [])
        setShowDetailsModal(true)
      }
    } catch {}
  }

  const fetchCategories = async () => {
    try {
      const res = await getPartnerCategories()
      if (res.data?.success) setCategories(res.data.data || [])
    } catch {}
  }

  const fetchSubcategories = async (catId) => {
    try {
      const res = await getPartnerSubcategories(catId)
      if (res.data?.success) setSubcategories(res.data.data || [])
    } catch {}
  }

  const fetchProducts = async (subCatId) => {
    try {
      const res = await getPartnerProductsDropdown(subCatId)
      if (res.data?.success) setProducts(res.data.data || [])
    } catch {}
  }

  const fetchAvailableDemoSlots = async () => {
    try {
      const res = await getPartnerDemoSlotsAvailable()
      if (res.data?.success) setBookingAvailableSlots(res.data.data || [])
    } catch {}
  }

  const createLead = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setValidationErrors({})
    try {
      const res = await createPartnerLead(leadFormData)
      if (res.data?.success) {
        setSuccess('Lead created successfully!')
        setShowLeadModal(false)
        resetLeadForm()
        fetchLeads()
        fetchLeadStats()
      } else {
        autoErr(res.data)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const updateLead = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setValidationErrors({})
    try {
      const res = await updatePartnerLead(editingLead.id, leadFormData)
      if (res.data?.success) {
        setSuccess('Lead updated successfully!')
        setShowLeadModal(false)
        resetLeadForm()
        fetchLeads()
        fetchLeadStats()
        if (selectedLead?.id === editingLead.id) fetchLeadDetails(editingLead.id)
      } else {
        autoErr(res.data)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteLead = async (id) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    setLoading(true)
    try {
      const res = await deletePartnerLead(id)
      if (res.data?.success) {
        setSuccess('Lead deleted successfully')
        fetchLeads()
        fetchLeadStats()
        if (selectedLead?.id === id) {
          setSelectedLead(null)
          setLeadActivities([])
        }
      } else {
        setError(res.data?.message || 'Failed to delete lead')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Follow-up ──
  const openFollowUpModal = (lead) => {
    setFollowUpLead(lead)
    setFollowUpForm({
      next_date: '',
      status: lead.lead_status || 'new',
      remark: '',
    })
    setShowFollowUpModal(true)
  }

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await schedulePartnerFollowUp(followUpLead.id, {
        next_date: followUpForm.next_date,
        status: followUpForm.status,
        remark: followUpForm.remark,
        lost_reason: followUpForm.status === 'lost' ? followUpForm.remark : undefined,
      })
      if (res.data?.success) {
        setSuccess('Follow-up scheduled successfully!')
        setShowFollowUpModal(false)
        fetchLeads()
        fetchLeadStats()
        if (selectedLead?.id === followUpLead.id) fetchLeadDetails(followUpLead.id)
        setFollowUpForm({ next_date: '', status: '', remark: '' })
        setFollowUpLead(null)
      } else {
        setError(res.data?.message || 'Failed to schedule follow-up')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Booking Slots ──
  const openBookingModal = (leadId) => {
    setBookingLeadId(leadId)
    setShowBookingModal(true)
    setCurrentMonth(new Date())
    setSelectedDate('')
    setSelectedSlotIdForBooking(null)
    setBookingNotes('')
    setShowTitlePopup(false)
    setShowTimePopup(false)
    setAvailableSlotTitles([])
    setAvailableTimeSlots([])
    setSlotBookings([])
    setSelectedSlotTitle('')
    fetchAvailableDemoSlots()
  }

  const fetchSlotBookingsList = async (slotId, date) => {
    try {
      const res = await getPartnerSlotBookings(slotId, date)
      if (res.data?.success) {
        return res.data.data?.bookings || []
      }
    } catch (e) {
      console.error('Error fetching bookings:', e)
    }
    return []
  }

  const handleDateSelect = async (dateString) => {
    setSelectedDate(dateString)
    setSelectedSlotIdForBooking(null)
    setBookingNotes('')
    setShowTitlePopup(false)
    setShowTimePopup(false)

    const date = new Date(dateString)
    const dayOfWeek = date.getDay()
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayKey = dayMap[dayOfWeek]

    const slots = bookingAvailableSlots.filter(slot => {
      if (slot.all_days) return true
      return slot[dayKey] === true
    })

    let allBookings = []
    for (const slot of slots) {
      const bookings = await fetchSlotBookingsList(slot.id, dateString)
      allBookings = [...allBookings, ...bookings]
    }

    setSlotBookings(allBookings)

    const updatedSlots = slots.map(slot => {
      const bookings = allBookings.filter(b => {
        const bookingDate = b.booking_date ? b.booking_date.split(/[T ]/)[0] : ''
        return String(b.demo_slot_id) === String(slot.id) &&
               bookingDate === dateString &&
               b.status === 'scheduled'
      })
      const bookedCount = bookings.length
      const maxAttendees = slot.max_attendees || 10
      const available = maxAttendees - bookedCount
      return {
        ...slot,
        total_attendees: maxAttendees,
        available_attendees: available,
        is_fully_booked: available <= 0,
        bookings: bookings,
        timing_from: slot.timing_from || '00:00:00',
        timing_to: slot.timing_to || '00:00:00'
      }
    })

    const uniqueTitles = [...new Set(updatedSlots.map(s => s.title))]
    setAvailableSlotTitles(uniqueTitles)

    if (uniqueTitles.length > 0) {
      setShowTitlePopup(true)
    } else {
      setShowTitlePopup(false)
      setShowTimePopup(false)
    }
  }

  const handleTitleSelect = (title) => {
    setSelectedSlotTitle(title)
    setShowTitlePopup(false)

    const date = new Date(selectedDate)
    const dayOfWeek = date.getDay()
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayKey = dayMap[dayOfWeek]

    const daySlots = bookingAvailableSlots.filter(slot => {
      if (slot.all_days) return true
      return slot[dayKey] === true
    })

    const slotsWithBookings = daySlots.map(slot => {
      const bookings = slotBookings.filter(b => {
        const bookingDate = b.booking_date ? b.booking_date.split(/[T ]/)[0] : ''
        return String(b.demo_slot_id) === String(slot.id) &&
               bookingDate === selectedDate &&
               b.status === 'scheduled'
      })
      const bookedCount = bookings.length
      const maxAttendees = slot.max_attendees || 10
      const available = maxAttendees - bookedCount
      return {
        ...slot,
        total_attendees: maxAttendees,
        available_attendees: available,
        is_fully_booked: available <= 0,
        bookings: bookings,
        timing_from: slot.timing_from || '00:00:00',
        timing_to: slot.timing_to || '00:00:00'
      }
    })

    const filteredSlots = slotsWithBookings.filter(s => s.title === title && s.available_attendees > 0)
    setAvailableTimeSlots(filteredSlots)

    if (filteredSlots.length > 0) {
      setShowTimePopup(true)
    }
  }

  const handleBookSlot = async (slotId, date) => {
    setBookingSaving(true)
    setError('')
    try {
      const res = await bookPartnerDemoSlot(bookingLeadId, {
        demo_slot_id: slotId,
        booking_date: date,
        notes: bookingNotes
      })
      if (res.data?.success) {
        setSuccess('Demo slot booked successfully!')
        setShowBookingModal(false)
        resetBookingForm()
        fetchLeads()
        if (selectedLead?.id === bookingLeadId) fetchLeadDetails(bookingLeadId)
      } else {
        setError(res.data?.message || 'Failed to book slot')
      }
    } catch (e) {
      setError('Network error: ' + e.message)
    } finally {
      setBookingSaving(false)
    }
  }

  const cancelLeadBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setLoading(true)
    try {
      const res = await cancelPartnerBooking(id)
      if (res.data?.success) {
        setSuccess('Booking cancelled successfully!')
        fetchLeads()
        if (selectedLead) fetchLeadDetails(selectedLead.id)
      } else {
        setError(res.data?.message || 'Failed to cancel booking')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const removeLeadDemoSlot = async (leadId) => {
    if (!confirm('Are you sure you want to remove the assigned demo slot?')) return
    setLoading(true)
    try {
      const res = await removePartnerDemoSlot(leadId)
      if (res.data?.success) {
        setSuccess('Demo slot assignment removed!')
        fetchLeads()
        if (selectedLead) fetchLeadDetails(leadId)
      } else {
        setError(res.data?.message || 'Failed to remove slot')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Helpers ──
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setSelectedDate('')
    setSelectedSlotIdForBooking(null)
    setBookingNotes('')
    setShowTitlePopup(false)
    setShowTimePopup(false)
    setAvailableSlotTitles([])
    setAvailableTimeSlots([])
    setSlotBookings([])
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setSelectedDate('')
    setSelectedSlotIdForBooking(null)
    setBookingNotes('')
    setShowTitlePopup(false)
    setShowTimePopup(false)
    setAvailableSlotTitles([])
    setAvailableTimeSlots([])
    setSlotBookings([])
  }

  const resetLeadForm = () => {
    setLeadFormData(emptyLead)
    setEditingLead(null)
    setValidationErrors({})
    setSubcategories([])
    setProducts([])
  }

  const resetBookingForm = () => {
    setShowBookingModal(false)
    setBookingLeadId(null)
    setCurrentMonth(new Date())
    setSelectedDate('')
    setSelectedSlotIdForBooking(null)
    setBookingNotes('')
    setShowTitlePopup(false)
    setShowTimePopup(false)
    setAvailableSlotTitles([])
    setAvailableTimeSlots([])
    setSlotBookings([])
    setSelectedSlotTitle('')
  }

  const onLeadChange = (e) => {
    const { name, value, type, checked } = e.target
    setLeadFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    if (name === 'category_id') {
      fetchSubcategories(value)
      setLeadFormData(p => ({ ...p, sub_category_id: '', product_id: '' }))
    }
    if (name === 'sub_category_id') {
      fetchProducts(value)
      setLeadFormData(p => ({ ...p, product_id: '' }))
    }
  }

  const openEditLead = (lead) => {
    setEditingLead(lead)
    setLeadFormData({
      client_name: lead.client_name || '',
      client_email: lead.client_email || '',
      client_phone: lead.client_phone || '',
      client_alternate_phone: lead.client_alternate_phone || '',
      company_name: lead.company_name || '',
      address: lead.address || '',
      city: lead.city || '',
      state: lead.state || '',
      pin_code: lead.pin_code || '',
      country: lead.country || 'India',
      lead_source: lead.lead_source || '',
      lead_status: lead.lead_status || 'new',
      lead_priority: lead.lead_priority || 'medium',
      category_id: lead.category_id || '',
      sub_category_id: lead.sub_category_id || '',
      product_id: lead.product_id || '',
      follow_up_date: lead.follow_up_date ? lead.follow_up_date.split(/[T ]/)[0] : '',
      notes: lead.notes || '',
      budget: lead.budget || '',
      expected_close_date: lead.expected_close_date ? lead.expected_close_date.split(/[T ]/)[0] : '',
    })
    setShowLeadModal(true)
    if (lead.category_id) fetchSubcategories(lead.category_id)
    if (lead.sub_category_id) fetchProducts(lead.sub_category_id)
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

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDayIndex = new Date(year, month, 1).getDay()
    const lastDay = new Date(year, month + 1, 0).getDate()

    const days = []

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-white/5 opacity-10"></div>)
    }

    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const isSelected = selectedDate === dateStr

      days.push(
        <button
          key={`day-${d}`}
          type="button"
          onClick={() => handleDateSelect(dateStr)}
          className={`p-2.5 border border-white/5 text-xs font-bold text-center hover:bg-aim-gold/20 hover:text-white transition-all rounded-lg cursor-pointer ${
            isSelected ? 'bg-aim-gold text-[#0B1B3A] border-aim-gold font-extrabold' : 'text-gray-300'
          }`}
        >
          {d}
        </button>
      )
    }

    return days
  }

  return (
    <>
      <Helmet>
        <title>Lead Management | AIM Partner</title>
      </Helmet>

      <div className="space-y-6 text-white text-left font-sans">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Lead Management</h1>
            <p className="text-aim-copy-muted text-xs mt-1 font-medium">
              Create, view, filter, and schedule demo sessions or follow-ups for your leads.
            </p>
          </div>
          <button
            onClick={() => {
              resetLeadForm()
              setShowLeadModal(true)
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-aim-gold to-aim-gold-light hover:brightness-110 text-[#0B1B3A] rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-aim-gold/10"
          >
            ➕ Register New Lead
          </button>
        </div>

        {/* Global messages */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold animate-pulse">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-bold">
            ✅ {success}
          </div>
        )}

        {/* Stats banner */}
        {leadStats && (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Leads', value: leadStats.summary?.total_leads ?? 0, color: 'border-slate-550' },
              { label: 'Active Leads', value: leadStats.summary?.active_leads ?? 0, color: 'border-aim-navy-muted' },
              { label: 'Converted', value: leadStats.summary?.converted_leads ?? 0, color: 'border-green-500' },
              { label: 'Conversion Rate', value: leadStats.summary?.conversion_rate ?? '0%', color: 'border-aim-gold' },
              { label: 'Follow-ups Today', value: leadStats.follow_ups?.today ?? 0, color: 'border-orange-500' },
              { label: 'Pending Follow-ups', value: leadStats.follow_ups?.pending ?? 0, color: 'border-rose-500' },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl border border-white/5 bg-[#0F2248]/40 p-4 border-t-2 ${s.color}`}>
                <div className="text-[10px] text-aim-copy-muted font-bold uppercase tracking-wider">{s.label}</div>
                <div className="text-xl font-black text-white mt-1">{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Workspace */}
        <div className="w-full">
          
          {/* LEFT: Filters + Registry List */}
          <div className="w-full space-y-4">
            
            {/* Filters panel */}
            <div className="bg-[#0F2248]/30 rounded-2xl border border-white/5 p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Search name, email, or alternate phone..."
                  value={leadFilters.search}
                  onChange={e => setLeadFilters(p => ({ ...p, search: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-aim-gold rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none transition-colors"
                />

                <select
                  value={leadFilters.status}
                  onChange={e => setLeadFilters(p => ({ ...p, status: e.target.value }))}
                  className="w-full bg-[#0B1B3A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-aim-gold cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  {['new','contacted','qualified','proposal','negotiation','converted','lost','junk'].map(s => (
                    <option key={s} value={s}>{s.toUpperCase()}</option>
                  ))}
                </select>

                <select
                  value={leadFilters.priority}
                  onChange={e => setLeadFilters(p => ({ ...p, priority: e.target.value }))}
                  className="w-full bg-[#0B1B3A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-aim-gold cursor-pointer"
                >
                  <option value="">All Priorities</option>
                  {['low', 'medium', 'high', 'urgent'].map(p => (
                    <option key={p} value={p}>{p.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input
                    type="checkbox"
                    checked={leadFilters.follow_up_today}
                    onChange={e => setLeadFilters(p => ({ ...p, follow_up_today: e.target.checked }))}
                    className="accent-aim-gold w-4 h-4 rounded"
                  />
                  <span>Follow-up Scheduled Today</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input
                    type="checkbox"
                    checked={leadFilters.pending_follow_up}
                    onChange={e => setLeadFilters(p => ({ ...p, pending_follow_up: e.target.checked }))}
                    className="accent-aim-gold w-4 h-4 rounded"
                  />
                  <span>Overdue / Pending Follow-ups</span>
                </label>
              </div>
            </div>

            {/* Leads registry table */}
            <div className="rounded-2xl border border-white/5 bg-[#0F2248]/20 overflow-hidden shadow-card-depth">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#0B1B3A] text-aim-copy-muted uppercase tracking-wider text-[10px]">
                      <th className="px-5 py-3">Client details</th>
                      <th className="px-5 py-3">Follow-up</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Priority</th>
                      <th className="px-5 py-3 text-right">Est. Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/90">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-10 text-aim-copy-muted animate-pulse">
                          Fetching lead entries...
                        </td>
                      </tr>
                    ) : leads.length > 0 ? (
                      leads.map(lead => {
                        const isSelected = selectedLead?.id === lead.id
                        return (
                          <tr
                            key={lead.id}
                            onClick={() => fetchLeadDetails(lead.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-aim-gold/10' : 'hover:bg-white/5'
                            }`}
                          >
                            <td className="px-5 py-3.5">
                              <p className="font-bold text-white">{lead.client_name}</p>
                              {lead.company_name && (
                                <p className="text-[10px] text-aim-copy-muted font-medium">{lead.company_name}</p>
                              )}
                              <p className="text-[10px] text-aim-copy-muted font-medium font-mono">{lead.client_email} | {lead.client_phone}</p>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-[11px] text-gray-300">
                              {lead.follow_up_date ? formatDate(lead.follow_up_date) : 'Not scheduled'}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                statusBadgeMap[lead.lead_status] || 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {lead.lead_status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                priorityBadgeMap[lead.lead_priority] || 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {lead.lead_priority}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right font-bold text-aim-gold">
                              {lead.budget ? `₹${Number(lead.budget).toLocaleString('en-IN')}` : '—'}
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-aim-copy-muted">
                          <span className="text-3xl block mb-2">📋</span>
                          <p className="font-bold">No leads found matching current filter parameters.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {leadPagination && leadPagination.last_page > 1 && (
                <div className="flex items-center justify-between border-t border-white/5 px-5 py-3 bg-[#0B1B3A]/40 text-xs font-semibold text-aim-copy-muted">
                  <span>
                    Page {leadPagination.current_page} of {leadPagination.last_page} ({leadPagination.total} total)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchLeads(leadPagination.current_page - 1)}
                      disabled={leadPagination.current_page === 1}
                      className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 disabled:opacity-20 text-white font-bold transition-all disabled:cursor-not-allowed"
                    >
                      ◀ Previous
                    </button>
                    <button
                      onClick={() => fetchLeads(leadPagination.current_page + 1)}
                      disabled={leadPagination.current_page === leadPagination.last_page}
                      className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 disabled:opacity-20 text-white font-bold transition-all disabled:cursor-not-allowed"
                    >
                      Next ▶
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* ─── ADD/EDIT LEAD MODAL ─── */}
      <AnimatePresence>
        {showLeadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeadModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-[3px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0B1B3A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">
                  {editingLead ? '✏️ Modify Lead details' : '➕ Register New Lead'}
                </h3>
                <button
                  onClick={() => setShowLeadModal(false)}
                  className="p-1 text-gray-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={editingLead ? updateLead : createLead} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-semibold text-left">
                {/* Contact info grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Client Full Name *</label>
                    <input
                      type="text"
                      name="client_name"
                      required
                      placeholder="e.g. John Doe"
                      value={leadFormData.client_name}
                      onChange={onLeadChange}
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Primary Email *</label>
                    <input
                      type="email"
                      name="client_email"
                      required
                      placeholder="buyer@client.com"
                      value={leadFormData.client_email}
                      onChange={onLeadChange}
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Phone numbers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Primary Phone Number *</label>
                    <input
                      type="text"
                      name="client_phone"
                      required
                      placeholder="+91 98765 43210"
                      value={leadFormData.client_phone}
                      onChange={onLeadChange}
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Alternate Phone</label>
                    <input
                      type="text"
                      name="client_alternate_phone"
                      placeholder="Optional alternate number"
                      value={leadFormData.client_alternate_phone}
                      onChange={onLeadChange}
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Firm details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Company / School Name</label>
                    <input
                      type="text"
                      name="company_name"
                      placeholder="e.g. Zenith Tech Solutions"
                      value={leadFormData.company_name}
                      onChange={onLeadChange}
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Lead Source</label>
                    <input
                      type="text"
                      name="lead_source"
                      placeholder="e.g. LinkedIn, Reference, Google Search"
                      value={leadFormData.lead_source}
                      onChange={onLeadChange}
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Location Address */}
                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Address details</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address, Area..."
                    value={leadFormData.address}
                    onChange={onLeadChange}
                    className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={leadFormData.city}
                      onChange={onLeadChange}
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">State</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={leadFormData.state}
                      onChange={onLeadChange}
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Pin Code</label>
                    <input
                      type="text"
                      name="pin_code"
                      placeholder="Pin code"
                      value={leadFormData.pin_code}
                      onChange={onLeadChange}
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={leadFormData.country}
                      onChange={onLeadChange}
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Categories & Products (Dynamic fetching) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Category *</label>
                    <select
                      name="category_id"
                      required
                      value={leadFormData.category_id}
                      onChange={onLeadChange}
                      className="w-full bg-[#0B1B3A] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-aim-gold cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Sub Category</label>
                    <select
                      name="sub_category_id"
                      value={leadFormData.sub_category_id}
                      onChange={onLeadChange}
                      className="w-full bg-[#0B1B3A] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-aim-gold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={!leadFormData.category_id}
                    >
                      <option value="">Select Sub Category</option>
                      {subcategories.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Product Interest</label>
                    <select
                      name="product_id"
                      value={leadFormData.product_id}
                      onChange={onLeadChange}
                      className="w-full bg-[#0B1B3A] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-aim-gold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={!leadFormData.sub_category_id}
                    >
                      <option value="">Select Product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Priority, status, budget */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Lead Status *</label>
                    <select
                      name="lead_status"
                      value={leadFormData.lead_status}
                      onChange={onLeadChange}
                      className="w-full bg-[#0B1B3A] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-aim-gold cursor-pointer"
                    >
                      {['new','contacted','qualified','proposal','negotiation','converted','lost','junk'].map(s => (
                        <option key={s} value={s}>{s.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Priority *</label>
                    <select
                      name="lead_priority"
                      value={leadFormData.lead_priority}
                      onChange={onLeadChange}
                      className="w-full bg-[#0B1B3A] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-aim-gold cursor-pointer"
                    >
                      {['low', 'medium', 'high', 'urgent'].map(p => (
                        <option key={p} value={p}>{p.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Deal Budget (INR)</label>
                    <input
                      type="number"
                      name="budget"
                      placeholder="e.g. 75000"
                      value={leadFormData.budget}
                      onChange={onLeadChange}
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Follow up dates & notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Expected Close Date</label>
                    <input
                      type="date"
                      name="expected_close_date"
                      value={leadFormData.expected_close_date}
                      onChange={onLeadChange}
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white focus:outline-none transition-colors cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">First Follow-up Date</label>
                    <input
                      type="date"
                      name="follow_up_date"
                      value={leadFormData.follow_up_date}
                      onChange={onLeadChange}
                      className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white focus:outline-none transition-colors cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Notes & Requirements</label>
                  <textarea
                    name="notes"
                    rows="3"
                    placeholder="Enter key customer pain points, remarks, or feature requests..."
                    value={leadFormData.notes}
                    onChange={onLeadChange}
                    className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors"
                  />
                </div>

                {/* Form controls */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowLeadModal(false)}
                    className="px-4 py-2 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-aim-gold to-aim-gold-light text-[#0B1B3A] font-black rounded-xl text-xs uppercase cursor-pointer"
                  >
                    {loading ? 'Saving...' : 'Register Lead'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── FOLLOW-UP / REMARK MODAL ─── */}
      <AnimatePresence>
        {showFollowUpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFollowUpModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-[3px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0B1B3A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 text-xs font-semibold text-left"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">
                  📞 Schedule Lead Follow-Up
                </h3>
                <button
                  onClick={() => setShowFollowUpModal(false)}
                  className="p-1 text-gray-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleFollowUpSubmit} className="p-5 space-y-4">
                <div>
                  <p className="text-[10px] text-aim-copy-muted uppercase">Lead Client</p>
                  <p className="text-white font-bold text-sm mt-0.5">{followUpLead?.client_name}</p>
                </div>

                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Next Contact Date *</label>
                  <input
                    type="date"
                    required
                    value={followUpForm.next_date}
                    onChange={e => setFollowUpForm(p => ({ ...p, next_date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2.5 text-white focus:outline-none transition-colors cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Update Lead Stage</label>
                  <select
                    value={followUpForm.status}
                    onChange={e => setFollowUpForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-[#0B1B3A] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-aim-gold cursor-pointer"
                  >
                    {['new','contacted','qualified','proposal','negotiation','converted','lost','junk'].map(s => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-aim-copy-muted uppercase tracking-wider mb-1.5">Follow-up Remarks / Notes</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Enter call notes or lost reason if marking lead as 'lost'..."
                    value={followUpForm.remark}
                    onChange={e => setFollowUpForm(p => ({ ...p, remark: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors"
                  />
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFollowUpModal(false)}
                    className="px-4 py-2 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-aim-gold to-aim-gold-light text-[#0B1B3A] font-black rounded-xl text-xs uppercase cursor-pointer"
                  >
                    {saving ? 'Scheduling...' : 'Save Follow-up'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── BOOKING / DEMO CALENDAR MODAL ─── */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetBookingForm}
              className="absolute inset-0 bg-black/75 backdrop-blur-[3px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#0B1B3A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 text-xs font-semibold text-left flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">
                  🗓️ Book Video Demo Slot
                </h3>
                <button
                  onClick={resetBookingForm}
                  className="p-1 text-gray-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                
                {/* Month navigation */}
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1 text-white hover:text-aim-gold cursor-pointer font-bold text-sm"
                  >
                    ◀ Previous
                  </button>
                  <span className="text-white font-black text-sm uppercase tracking-wider">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1 text-white hover:text-aim-gold cursor-pointer font-bold text-sm"
                  >
                    Next ▶
                  </button>
                </div>

                {/* Calendar grid */}
                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-aim-copy-muted text-[10px] uppercase">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="p-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {renderCalendarDays()}
                  </div>
                </div>

                {/* Calendar states */}
                {selectedDate && (
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <p className="text-white font-black text-xs uppercase tracking-wider">
                      Selected Date: <span className="text-aim-gold">{formatDate(selectedDate)}</span>
                    </p>

                    {/* Step 2: Slot Title selectors */}
                    {showTitlePopup && (
                      <div className="space-y-2 bg-white/3 p-3 rounded-xl border border-white/5">
                        <label className="block text-[10px] text-aim-copy-muted uppercase">Select Slot Title / Topic</label>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {availableSlotTitles.map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleTitleSelect(t)}
                              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                selectedSlotTitle === t
                                  ? 'bg-aim-gold/15 border-aim-gold text-aim-gold'
                                  : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Slot Time selectors */}
                    {showTimePopup && (
                      <div className="space-y-2 bg-white/3 p-3 rounded-xl border border-white/5">
                        <label className="block text-[10px] text-aim-copy-muted uppercase">Select Slot Timings (Available Seats)</label>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {availableTimeSlots.map(slot => {
                            const isSelected = selectedSlotIdForBooking === slot.id
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => setSelectedSlotIdForBooking(slot.id)}
                                className={`p-2.5 rounded-lg text-xs font-bold transition-all border text-left cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-aim-gold/15 border-aim-gold text-aim-gold'
                                    : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                                }`}
                              >
                                <span className="font-mono">{fmtTime(slot.timing_from)} - {fmtTime(slot.timing_to)}</span>
                                <span className="text-[9px] text-aim-copy-muted font-bold mt-1">
                                  Seats: {slot.available_attendees} / {slot.total_attendees} left
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Step 4: Notes and booking submission */}
                    {selectedSlotIdForBooking && (
                      <div className="space-y-3 bg-white/3 p-3 rounded-xl border border-white/5">
                        <div>
                          <label className="block text-[10px] text-aim-copy-muted uppercase mb-1">Booking Notes / Agenda</label>
                          <textarea
                            rows="2"
                            placeholder="Enter specific points or questions for the discovery meeting..."
                            value={bookingNotes}
                            onChange={e => setBookingNotes(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-aim-gold rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            disabled={bookingSaving}
                            onClick={() => handleBookSlot(selectedSlotIdForBooking, selectedDate)}
                            className="px-5 py-2.5 bg-gradient-to-r from-aim-gold to-aim-gold-light text-[#0B1B3A] font-black rounded-xl text-xs uppercase cursor-pointer flex items-center gap-1.5 shadow-md shadow-aim-gold/10"
                          >
                            {bookingSaving ? 'Booking...' : 'Confirm Demo Session'}
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── LEAD DETAILS MODAL ─── */}
      <AnimatePresence>
        {showDetailsModal && selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowDetailsModal(false)
                setSelectedLead(null)
              }}
              className="absolute inset-0 bg-black/75 backdrop-blur-[3px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0B1B3A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col text-xs font-semibold text-left text-gray-300"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🔎</span>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">
                      Lead Profile Details
                    </h3>
                    <p className="text-[10px] text-aim-copy-muted mt-1 font-medium font-mono">
                      Lead ID: {selectedLead.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedLead(null)
                  }}
                  className="p-1 text-gray-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* LEFT Column: Contact Details, Address, Notes */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white text-lg font-black truncate">{selectedLead.client_name}</h4>
                    <p className="text-xs text-aim-copy-muted mt-0.5">{selectedLead.company_name || 'No company specified'}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        statusBadgeMap[selectedLead.lead_status] || 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {selectedLead.lead_status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        priorityBadgeMap[selectedLead.lead_priority] || 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {selectedLead.lead_priority}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 bg-[#0F2248]/30 border border-white/5 rounded-2xl p-4">
                    <div>
                      <span className="text-[10px] text-aim-copy-muted block uppercase tracking-wider">Contact Number</span>
                      <span className="text-white font-mono text-sm">{selectedLead.client_phone}</span>
                      {selectedLead.client_alternate_phone && (
                        <span className="text-aim-copy-muted font-mono block text-[10px] mt-0.5">Alt: {selectedLead.client_alternate_phone}</span>
                      )}
                    </div>
                    
                    <div>
                      <span className="text-[10px] text-aim-copy-muted block uppercase tracking-wider">Email Address</span>
                      <span className="text-white font-mono text-sm block truncate">{selectedLead.client_email}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-aim-copy-muted block uppercase tracking-wider">Address details</span>
                      <span className="text-white font-medium block">
                        {[selectedLead.address, selectedLead.city, selectedLead.state, selectedLead.pin_code, selectedLead.country].filter(Boolean).join(', ') || 'No address specified'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      <div>
                        <span className="text-[10px] text-aim-copy-muted block uppercase tracking-wider">Lead Source</span>
                        <span className="text-white font-bold">{selectedLead.lead_source || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-aim-copy-muted block uppercase tracking-wider">Expected Close</span>
                        <span className="text-white font-mono font-bold">{selectedLead.expected_close_date ? formatDate(selectedLead.expected_close_date) : '—'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedLead.notes && (
                    <div className="bg-[#0F2248]/30 border border-white/5 rounded-2xl p-4">
                      <span className="text-[10px] text-aim-copy-muted block uppercase tracking-wider mb-1">Notes & Requirements</span>
                      <p className="text-gray-300 font-medium whitespace-pre-line leading-relaxed text-xs">{selectedLead.notes}</p>
                    </div>
                  )}
                </div>

                {/* RIGHT Column: Demo Slot, Log, Actions */}
                <div className="space-y-4">
                  {/* Demo Slot section */}
                  <div className="bg-[#0F2248]/30 border border-white/5 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] text-aim-copy-muted block uppercase tracking-wider font-bold">Assigned Demo Session</span>
                    {selectedLead.demo_slot ? (
                      <div className="bg-[#0B1B3A] p-3 rounded-xl border border-white/5 relative group">
                        <p className="text-white font-black text-sm">{selectedLead.demo_slot.title}</p>
                        <p className="text-[10px] text-aim-copy-muted font-mono mt-1">
                          🕒 {selectedLead.demo_slot.timing_from ? fmtTime(selectedLead.demo_slot.timing_from) : '00:00'} - {selectedLead.demo_slot.timing_to ? fmtTime(selectedLead.demo_slot.timing_to) : '00:00'}
                        </p>
                        {selectedLead.demo_booking ? (
                          <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                            <span className="text-emerald-400 font-bold">📅 Scheduled: {formatDate(selectedLead.demo_booking.booking_date)}</span>
                            <button
                              onClick={() => cancelLeadBooking(selectedLead.demo_booking.id)}
                              className="text-rose-450 hover:underline cursor-pointer font-black"
                            >
                              Cancel Booking
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => removeLeadDemoSlot(selectedLead.id)}
                              className="text-[10.5px] text-rose-450 hover:underline cursor-pointer font-bold"
                            >
                              Unassign Slot
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <button
                          onClick={() => {
                            setShowDetailsModal(false)
                            openBookingModal(selectedLead.id)
                          }}
                          className="w-full px-3 py-2 bg-aim-navy-muted border border-white/10 hover:border-white/20 hover:bg-aim-navy-muted/80 text-white rounded-lg font-black text-xs transition-all cursor-pointer text-center"
                        >
                          🗓️ Book Video Demo Slot (Calendar)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Follow-up Timeline */}
                  <div className="bg-[#0F2248]/30 border border-white/5 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] text-aim-copy-muted block uppercase tracking-wider font-bold">Follow-up Timeline Log</span>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {leadActivities.length > 0 ? (
                        leadActivities.map((act, ai) => (
                          <div key={ai} className="bg-[#0B1B3A]/80 p-2.5 rounded-xl border border-white/5 text-[11px]">
                            <div className="flex justify-between font-bold text-gray-300">
                              <span className="text-aim-gold">{act.activity_type ? act.activity_type.toUpperCase() : 'FOLLOW UP'}</span>
                              <span className="font-mono text-[9px] text-aim-copy-muted">{formatDate(act.created_at)}</span>
                            </div>
                            {act.notes && <p className="text-gray-400 mt-1 leading-relaxed font-medium">{act.notes}</p>}
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-aim-copy-muted text-center py-4">No follow-ups recorded yet.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-white/5 bg-[#0F2248]/20 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      openFollowUpModal(selectedLead)
                    }}
                    className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 text-amber-400 font-black rounded-xl transition-all cursor-pointer text-xs"
                  >
                    📞 Schedule Follow-up
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      openEditLead(selectedLead)
                    }}
                    className="px-4 py-2 bg-sky-500/10 hover:bg-sky-500/25 border border-sky-500/20 text-sky-400 font-black rounded-xl transition-all cursor-pointer text-xs"
                  >
                    ✏️ Edit Lead
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      deleteLead(selectedLead.id)
                    }}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-450 font-black rounded-xl transition-all cursor-pointer text-xs"
                  >
                    🗑️ Delete Lead
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedLead(null)
                  }}
                  className="px-4 py-2 border border-white/10 hover:border-white/20 text-gray-450 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  )
}

export default PartnerLeads
