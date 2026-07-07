import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  getAdminLeads as getLeads,
  getAdminLeadStats as getLeadStats,
  createAdminLead as createLead,
  updateAdminLead as updateLead,
  deleteAdminLead as deleteLead,
  scheduleAdminFollowUp as scheduleFollowUp,
  getAdminDemoSlotsAvailable as getAvailableDemoSlots,
  getAdminAvailableDates as getAvailableDates,
  getAdminSlotBookings as getSlotBookings,
  bookAdminDemoSlot as bookDemoSlot,
  cancelAdminBooking as cancelBooking,
  getAdminCategories as getCategories,
  getAdminSubcategories as getSubcategories,
  getAdminProductsDropdown as getProductsDropdown,
  sendAdminDemoEmail as sendDemoEmail,
  updateAdminLeadStatus as updateLeadStatus,
  addAdminLeadActivity as addLeadActivity,
  bulkAssignAdminLeads as bulkAssignLeads
} from '../../api/admin/leads'

export default function AdminLeads() {
  // Stats and Listing State
  const [stats, setStats] = useState(null)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Query / Filter State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [followUpToday, setFollowUpToday] = useState(false)
  const [pendingFollowUp, setPendingFollowUp] = useState(false)
  const [todayDemo, setTodayDemo] = useState(false)
  const [page, setPage] = useState(1)

  // Selection state for Bulk Actions
  const [selectedLeadIds, setSelectedLeadIds] = useState([])

  // Category/Subcategory/Product states
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [products, setProducts] = useState([])
  const [availableDemoSlots, setAvailableDemoSlots] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('')

  // Assign Demo Slot states
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedLeadForAssign, setSelectedLeadForAssign] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookingNotes, setBookingNotes] = useState('')
  const [allSlotsData, setAllSlotsData] = useState({})
  const [selectedSlotIdForBooking, setSelectedSlotIdForBooking] = useState(null)
  const [showSlotBookingModal, setShowSlotBookingModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')

  // Modal / Drawer State
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null) // null for create, lead object for edit
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusLead, setStatusLead] = useState(null)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [activityLead, setActivityLead] = useState(null)
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false)
  const [selectedDrawerLead, setSelectedDrawerLead] = useState(null) // Slide-over detail drawer

  // Follow-up Modal State
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false)
  const [followUpLead, setFollowUpLead] = useState(null)
  const [followUpForm, setFollowUpForm] = useState({
    next_date: '',
    status: 'new',
    remark: ''
  })

  // Mail Modal State
  const [isMailModalOpen, setIsMailModalOpen] = useState(false)
  const [mailLead, setMailLead] = useState(null)
  const [mailForm, setMailForm] = useState({
    email: '',
    subject: 'Exclusive Demo: AIM Digitalise School ERP & Management Software'
  })
  const [sendingMail, setSendingMail] = useState(false)

  // Form states
  const [leadForm, setLeadForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_alternate_phone: '',
    company_name: '',
    address: '',
    city: '',
    state: '',
    pin_code: '',
    country: 'India',
    lead_source: 'Website',
    lead_status: 'new',
    lead_priority: 'medium',
    notes: '',
    budget: '',
    expected_close_date: '',
    category_id: '',
    sub_category_id: '',
    product_id: '',
    product_name: '',
    product_processing_fee: '',
    product_monthly_subscription: ''
  })

  const [statusForm, setStatusForm] = useState({
    status: 'new',
    notes: '',
    lost_reason: ''
  })

  const [activityForm, setActivityForm] = useState({
    activity_type: 'call',
    description: '',
    notes: '',
    scheduled_date: ''
  })

  const [bulkAssignForm, setBulkAssignForm] = useState({
    assigned_to: '2', // Defaults to Jane Smith
    notes: ''
  })

  const [saving, setSaving] = useState(false)

  // 1. Fetch Stats & Leads
  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const res = await getLeadStats()
      if (res.data?.success) {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching lead stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const loadLeads = async () => {
    try {
      setLoading(true)
      setError('')
      const params = {
        page,
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        follow_up_today: followUpToday || undefined,
        pending_follow_up: pendingFollowUp || undefined,
        today_demo: todayDemo || undefined
      }
      const res = await getLeads(params)
      if (res.data?.success) {
        setLeads(res.data.data?.data || [])
      }
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError(err?.response?.data?.message || 'Could not load leads from server.')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await getCategories()
      if (res.data?.success) {
        setCategories(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchSubcategories = async (categoryId) => {
    try {
      const res = await getSubcategories(categoryId)
      if (res.data?.success) {
        setSubcategories(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch subcategories:', err)
    }
  }

  const fetchProducts = async (subCategoryId, categoryId) => {
    try {
      const res = await getProductsDropdown(subCategoryId, categoryId)
      if (res.data?.success) {
        setProducts(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }

  const fetchAvailableDemoSlots = async () => {
    try {
      const res = await getAvailableDemoSlots()
      if (res.data?.success) {
        setAvailableDemoSlots(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch demo slots:', err)
    }
  }

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value
    setSelectedCategoryId(categoryId)
    setLeadForm(prev => ({
      ...prev,
      category_id: categoryId,
      sub_category_id: '',
      product_id: '',
      product_name: '',
      product_processing_fee: '',
      product_monthly_subscription: ''
    }))
    setSelectedSubCategoryId('')
    if (categoryId) {
      fetchSubcategories(categoryId)
    } else {
      setSubcategories([])
      setProducts([])
    }
  }

  const handleSubCategoryChange = (e) => {
    const subCategoryId = e.target.value
    setSelectedSubCategoryId(subCategoryId)
    setLeadForm(prev => ({
      ...prev,
      sub_category_id: subCategoryId,
      product_id: '',
      product_name: '',
      product_processing_fee: '',
      product_monthly_subscription: ''
    }))
    if (subCategoryId) {
      fetchProducts(subCategoryId, selectedCategoryId)
    } else {
      setProducts([])
    }
  }

  const handleProductSelect = (e) => {
    const productId = e.target.value
    const selectedProduct = products.find(p => p.id == productId)
    setLeadForm(prev => ({
      ...prev,
      product_id: productId,
      product_name: selectedProduct?.name || '',
      product_processing_fee: selectedProduct?.processing_fee || '',
      product_monthly_subscription: selectedProduct?.monthly_subscription || ''
    }))
  }

  const fetchAllSlotDataForMonth = async () => {
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth + 1, 0)
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    if (availableDemoSlots.length === 0) {
      setAllSlotsData({})
      return
    }

    try {
      const promises = availableDemoSlots.map(slot =>
        getAvailableDates(slot.id, { start_date: startDateStr, end_date: endDateStr })
          .then(res => ({
            slotId: slot.id,
            slot: slot,
            availableDates: res.data?.success ? (res.data.data?.available_dates || []) : []
          }))
          .catch(err => {
            console.error(`Failed to fetch dates for slot ${slot.id}:`, err)
            return { slotId: slot.id, slot, availableDates: [] }
          })
      )
      const results = await Promise.all(promises)
      const slotData = {}
      results.forEach(res => {
        slotData[res.slotId] = {
          slot: res.slot,
          availableDates: res.availableDates
        }
      })
      setAllSlotsData(slotData)
    } catch (err) {
      console.error('Failed to fetch slots data:', err)
    }
  }

  const handleBookSlot = async (slotId, date) => {
    setSaving(true)
    setError('')
    try {
      const payload = {
        demo_slot_id: slotId,
        booking_date: date,
        notes: bookingNotes
      }
      const res = await bookDemoSlot(selectedLeadForAssign.id, payload)
      if (res.data?.success) {
        triggerSuccess('Demo slot booked successfully!')
        loadLeads()
        loadStats()
        setShowAssignModal(false)
        setShowSlotBookingModal(false)
        setSelectedLeadForAssign(null)
        setSelectedDate('')
        setBookingNotes('')
        setAllSlotsData({})
        setSelectedSlotIdForBooking(null)
      } else {
        setError(res.data?.message || 'Failed to book demo slot')
      }
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to book demo slot: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this demo booking?')) return
    setSaving(true)
    try {
      const res = await cancelBooking(bookingId)
      if (res.data?.success) {
        triggerSuccess('Booking cancelled successfully!')
        loadLeads()
        loadStats()
        if (showAssignModal) {
          fetchAllSlotDataForMonth()
        }
      } else {
        alert(res.data?.message || 'Failed to cancel booking')
      }
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to cancel booking: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const prevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    setCurrentMonth(newMonth)
  }

  const nextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    setCurrentMonth(newMonth)
  }

  const getSlotsForDate = (dateStr) => {
    const slots = []
    for (const [slotId, data] of Object.entries(allSlotsData)) {
      if (!data || !data.availableDates) continue
      const dateData = data.availableDates.find(d => d.date === dateStr)
      if (dateData) {
        slots.push({
          ...data.slot,
          available_attendees: dateData.available_attendees || 0,
          total_attendees: dateData.total_attendees || 10,
          is_fully_booked: dateData.is_fully_booked || false,
          date: dateStr
        })
      }
    }
    return slots
  }

  useEffect(() => {
    loadLeads()
  }, [search, statusFilter, priorityFilter, followUpToday, pendingFollowUp, todayDemo, page])

  useEffect(() => {
    loadStats()
    fetchCategories()
    fetchAvailableDemoSlots()
  }, [])

  useEffect(() => {
    if (availableDemoSlots.length > 0 && showAssignModal) {
      fetchAllSlotDataForMonth()
    }
  }, [currentMonth, availableDemoSlots, showAssignModal])

  // Auto-sync Drawer Lead details if updated
  useEffect(() => {
    if (selectedDrawerLead) {
      const updated = leads.find(l => l.id === selectedDrawerLead.id)
      if (updated) setSelectedDrawerLead(updated)
    }
  }, [leads])

  // Auto-sync Follow-up Lead details if updated
  useEffect(() => {
    if (followUpLead) {
      const updated = leads.find(l => l.id === followUpLead.id)
      if (updated) setFollowUpLead(updated)
    }
  }, [leads])

  // Helper trigger alerts
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // 2. Action Handlers
  const openCreateModal = () => {
    setEditingLead(null)
    setLeadForm({
      client_name: '',
      client_email: '',
      client_phone: '',
      client_alternate_phone: '',
      company_name: '',
      address: '',
      city: '',
      state: '',
      pin_code: '',
      country: 'India',
      lead_source: 'Website',
      lead_status: 'new',
      lead_priority: 'medium',
      notes: '',
      budget: '',
      expected_close_date: '',
      category_id: '',
      sub_category_id: '',
      product_id: '',
      product_name: '',
      product_processing_fee: '',
      product_monthly_subscription: ''
    })
    setSelectedCategoryId('')
    setSelectedSubCategoryId('')
    setSubcategories([])
    setProducts([])
    setIsCreateEditOpen(true)
  }

  const openEditModal = (lead) => {
    setEditingLead(lead)
    setLeadForm({
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
      lead_source: lead.lead_source || 'Website',
      lead_status: lead.lead_status || 'new',
      lead_priority: lead.lead_priority || 'medium',
      notes: lead.notes || '',
      budget: lead.budget || '',
      expected_close_date: lead.follow_up_date ? lead.follow_up_date.split(' ')[0] : (lead.expected_close_date || ''),
      category_id: lead.category_id || '',
      sub_category_id: lead.sub_category_id || '',
      product_id: lead.product_id || '',
      product_name: lead.product_name || '',
      product_processing_fee: lead.product_processing_fee || '',
      product_monthly_subscription: lead.product_monthly_subscription || ''
    })
    if (lead.category_id) {
      setSelectedCategoryId(lead.category_id)
      fetchSubcategories(lead.category_id)
      if (lead.sub_category_id) {
        setSelectedSubCategoryId(lead.sub_category_id)
        fetchProducts(lead.sub_category_id, lead.category_id)
      }
    } else {
      setSelectedCategoryId('')
      setSelectedSubCategoryId('')
      setSubcategories([])
      setProducts([])
    }
    setIsCreateEditOpen(true)
  }

  const cleanAndFixPhone = (val) => {
    if (!val) return ''
    let cleaned = val.replace(/\+/g, '').replace(/\s+/g, '')
    if (/^\d{10}$/.test(cleaned)) {
      cleaned = '91' + cleaned
    }
    return cleaned
  }

  const handleCreateEditSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const cleanedPhone = cleanAndFixPhone(leadForm.client_phone)
      const cleanedAltPhone = cleanAndFixPhone(leadForm.client_alternate_phone)
      const payload = {
        ...leadForm,
        client_phone: cleanedPhone,
        client_alternate_phone: cleanedAltPhone || null,
        follow_up_date: leadForm.expected_close_date || null
      }
      if (editingLead) {
        await updateLead(editingLead.id, payload)
        triggerSuccess('Lead updated successfully.')
      } else {
        await createLead(payload)
        triggerSuccess('Lead created successfully.')
      }
      setIsCreateEditOpen(false)
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to submit lead form.')
    } finally {
      setSaving(false)
    }
  }

  const openStatusModal = (lead) => {
    setStatusLead(lead)
    setStatusForm({
      status: lead.lead_status || 'new',
      notes: '',
      lost_reason: lead.lost_reason || ''
    })
    setIsStatusModalOpen(true)
  }

  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    if (statusForm.status === 'lost' && !statusForm.lost_reason.trim()) {
      alert('Lost reason is required when marking a lead as lost.')
      return
    }
    try {
      setSaving(true)
      await updateLeadStatus(statusLead.id, statusForm)
      triggerSuccess('Lead status updated successfully.')
      setIsStatusModalOpen(false)
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to update lead status.')
    } finally {
      setSaving(false)
    }
  }

  const openActivityModal = (lead) => {
    setActivityLead(lead)
    setActivityForm({
      activity_type: 'call',
      description: '',
      notes: '',
      scheduled_date: ''
    })
    setIsActivityModalOpen(true)
  }

  const handleActivitySubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await addLeadActivity(activityLead.id, activityForm)
      triggerSuccess('Lead activity logged successfully.')
      setIsActivityModalOpen(false)
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to log lead activity.')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkAssign = async (e) => {
    e.preventDefault()
    if (selectedLeadIds.length === 0) return
    try {
      setSaving(true)
      await bulkAssignLeads({
        lead_ids: selectedLeadIds,
        assigned_to: Number(bulkAssignForm.assigned_to),
        notes: bulkAssignForm.notes
      })
      triggerSuccess(`${selectedLeadIds.length} lead(s) reassigned successfully.`)
      setIsBulkAssignOpen(false)
      setSelectedLeadIds([])
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to perform bulk assignment.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return
    try {
      await deleteLead(id)
      triggerSuccess('Lead deleted successfully.')
      if (selectedDrawerLead?.id === id) {
        setSelectedDrawerLead(null)
      }
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to delete lead.')
    }
  }

  const getLatestRemark = (lead) => {
    if (lead.activities && lead.activities.length > 0) {
      const sorted = [...lead.activities].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      return sorted[0].notes || sorted[0].description || 'No remark details'
    }
    return lead.notes || 'No remarks logged'
  }

  const openFollowUpModal = (lead) => {
    setFollowUpLead(lead)
    setFollowUpForm({
      next_date: lead.follow_up_date ? lead.follow_up_date.split(' ')[0] : (lead.expected_close_date ? lead.expected_close_date.split(' ')[0] : ''),
      status: lead.lead_status || 'new',
      remark: ''
    })
    setIsFollowUpModalOpen(true)
  }

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault()
    if (!followUpForm.next_date) {
      alert('Next follow-up date is required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        next_date: followUpForm.next_date,
        status: followUpForm.status,
        remark: followUpForm.remark,
        lost_reason: followUpForm.status === 'lost' ? followUpForm.remark : undefined
      }
      
      const res = await scheduleFollowUp(followUpLead.id, payload)
      if (res.data?.success) {
        triggerSuccess('Follow-up scheduled and updated successfully.')
        setIsFollowUpModalOpen(false)
        loadLeads()
        loadStats()
      } else {
        alert(res.data?.message || 'Failed to update follow-up details.')
      }
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to update follow-up details: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const openMailModal = (lead) => {
    setMailLead(lead)
    setMailForm({
      email: lead.client_email || '',
      subject: 'Exclusive Demo: AIM Digitalise School ERP & Management Software'
    })
    setIsMailModalOpen(true)
  }

  const handleSendMailSubmit = async (e) => {
    e.preventDefault()
    if (!mailForm.email.trim()) {
      alert('Recipient email address is required.')
      return
    }
    try {
      setSendingMail(true)
      await sendDemoEmail(mailLead.id, mailForm)
      triggerSuccess(`School software demo email sent to ${mailForm.email} successfully.`)
      setIsMailModalOpen(false)
      loadLeads()
      loadStats()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to send demo email.')
    } finally {
      setSendingMail(false)
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeadIds(leads.map(l => l.id))
    } else {
      setSelectedLeadIds([])
    }
  }

  const handleSelectLead = (id) => {
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const getStatusBadge = (status) => {
    const badges = {
      new: 'bg-gray-400/10 text-gray-400 border-gray-400/25',
      contacted: 'bg-blue-400/10 text-blue-400 border-blue-400/25',
      qualified: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/25',
      proposal: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/25',
      negotiation: 'bg-amber-400/10 text-amber-400 border-amber-400/25',
      converted: 'bg-green-400/10 text-green-450 border-green-400/25',
      lost: 'bg-red-400/10 text-red-450 border-red-400/25',
      junk: 'bg-red-500/10 text-red-300 border-red-550/25'
    }
    const label = status?.toUpperCase() || 'NEW'
    const c = badges[status] || badges.new
    return <span className={`inline-flex text-[9px] font-black uppercase tracking-wider border rounded-md px-2 py-0.5 ${c}`}>{label}</span>
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-500/15 text-red-400 border-red-500/30',
      high: 'bg-orange-400/10 text-orange-400 border-orange-400/25',
      medium: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/25',
      low: 'bg-blue-400/10 text-blue-400 border-blue-400/25'
    }
    const label = priority?.toUpperCase() || 'MEDIUM'
    const c = badges[priority] || badges.medium
    return <span className={`inline-flex text-[9px] font-black uppercase tracking-wider border rounded-md px-2 py-0.5 ${c}`}>{label}</span>
  }

  return (
    <>
      <Helmet>
        <title>AIM Admin | Leads Management</title>
      </Helmet>

      {/* Main Container */}
      <div className="space-y-6 text-slate-800 font-sans">
        {/* Banner Alert Success Message */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-[100] bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg border border-emerald-400"
            >
              🎉 {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/85 shadow-sm">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase">Leads Database</h1>
            <p className="text-xs text-slate-400 mt-0.5">Filter, track and manage system-wide client leads</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {selectedLeadIds.length > 0 && (
              <button
                onClick={() => setIsBulkAssignOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs px-4.5 py-2.5 rounded-full shadow-sm cursor-pointer transition active:scale-[0.98]"
              >
                Reassign Selected ({selectedLeadIds.length})
              </button>
            )}
            <button
              onClick={openCreateModal}
              className="bg-[#38b34a] hover:bg-[#2d963b] text-white font-black text-xs px-5 py-2.5 rounded-full shadow-sm cursor-pointer transition active:scale-[0.98] uppercase tracking-wider"
            >
              + Create Lead
            </button>
          </div>
        </div>

        {/* METRICS STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: statsLoading ? '...' : (stats?.total || 0), icon: '📋', color: 'indigo' },
            { label: 'Active Leads', value: statsLoading ? '...' : (stats?.active || 0), icon: '⚡', color: 'amber' },
            { label: 'Today Follow-up', value: statsLoading ? '...' : (stats?.follow_up_today || 0), icon: '📅', color: 'blue' },
            { label: 'Today Demo', value: statsLoading ? '...' : (stats?.today_demo || 0), icon: '🖥️', color: 'emerald' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200/85 shadow-sm flex items-center gap-4">
              <span className="text-3xl shrink-0">{item.icon}</span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{item.label}</span>
                <span className="text-xl font-black text-slate-800 mt-0.5 block">{item.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* FILTERS & SEARCH CONTROL BAR */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/85 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, phone, company..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
              />
            </div>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
              <option value="junk">Junk</option>
            </select>
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={e => { setPriorityFilter(e.target.value); setPage(1) }}
              className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-4 pt-1 border-t border-slate-100 text-xs font-bold text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={followUpToday}
                onChange={e => { setFollowUpToday(e.target.checked); setPage(1) }}
                className="w-4 h-4 rounded text-[#38b34a] border-slate-350 focus:ring-[#38b34a]"
              />
              <span>Follow-up Scheduled Today</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pendingFollowUp}
                onChange={e => { setPendingFollowUp(e.target.checked); setPage(1) }}
                className="w-4 h-4 rounded text-[#38b34a] border-slate-350 focus:ring-[#38b34a]"
              />
              <span>Pending Follow-ups (Overdue)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={todayDemo}
                onChange={e => { setTodayDemo(e.target.checked); setPage(1) }}
                className="w-4 h-4 rounded text-[#38b34a] border-slate-350 focus:ring-[#38b34a]"
              />
              <span>Demos Scheduled Today</span>
            </label>
          </div>
        </div>

        {/* MAIN LEADS DATA TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200/85 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={leads.length > 0 && selectedLeadIds.length === leads.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-[#38b34a] border-slate-300 focus:ring-[#38b34a]"
                    />
                  </th>
                  <th className="px-6 py-4">Client Detail</th>
                  <th className="px-6 py-4">Status & Priority</th>
                  <th className="px-6 py-4">Product Category</th>
                  <th className="px-6 py-4">Last Logged Remarks</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 rounded-full border-4 border-slate-100 border-t-[#38b34a] animate-spin" />
                        <span>Loading leads database...</span>
                      </div>
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold">
                      No matching leads found.
                    </td>
                  </tr>
                ) : (
                  leads.map(lead => {
                    const isSelected = selectedLeadIds.includes(lead.id)
                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-slate-50/70' : ''}`}
                      >
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectLead(lead.id)}
                            className="w-4 h-4 rounded text-[#38b34a] border-slate-300 focus:ring-[#38b34a]"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span
                              onClick={() => setSelectedDrawerLead(lead)}
                              className="font-bold text-slate-800 hover:text-[#38b34a] cursor-pointer block text-sm"
                            >
                              {lead.client_name}
                            </span>
                            <span className="text-slate-400 font-medium block mt-0.5">
                              {lead.company_name ? `${lead.company_name} · ` : ''}
                              {lead.client_phone}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {getStatusBadge(lead.lead_status)}
                            {getPriorityBadge(lead.lead_priority)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-bold text-slate-700 block">{lead.product_name || 'Generic Inquiry'}</span>
                            {lead.follow_up_date && (
                              <span className="text-[10px] text-amber-500 font-bold mt-0.5 block">
                                📅 Next F/Up: {lead.follow_up_date.split(' ')[0]}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="truncate text-slate-400 font-medium" title={getLatestRemark(lead)}>
                            {getLatestRemark(lead)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openFollowUpModal(lead)}
                              title="Schedule Follow-up"
                              className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                            >
                              📅
                            </button>
                            <button
                              onClick={() => {
                                setSelectedLeadForAssign(lead)
                                setShowAssignModal(true)
                                setSelectedDate('')
                              }}
                              title="Book Demo Slot"
                              className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                            >
                              🖥️
                            </button>
                            <button
                              onClick={() => openMailModal(lead)}
                              title="Send Demo Email"
                              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                            >
                              ✉️
                            </button>
                            <button
                              onClick={() => openEditModal(lead)}
                              title="Edit Lead"
                              className="p-1.5 text-slate-400 hover:text-[#38b34a] hover:bg-slate-50 rounded-xl transition cursor-pointer"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => openStatusModal(lead)}
                              title="Change Status"
                              className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                            >
                              🛡️
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              title="Delete Lead"
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-xl transition cursor-pointer"
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

          {/* Pagination Footer */}
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Page {page}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
              >
                Previous
              </button>
              <button
                disabled={leads.length < 15}
                onClick={() => setPage(prev => prev + 1)}
                className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE & EDIT LEAD MODAL */}
      <AnimatePresence>
        {isCreateEditOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-250 shadow-2xl w-full max-w-4xl p-6 sm:p-8 text-left text-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <h3 className="text-lg font-black text-slate-850 uppercase">
                  {editingLead ? 'Modify Client Lead' : 'Register New Lead'}
                </h3>
                <button
                  onClick={() => setIsCreateEditOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateEditSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Client Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={leadForm.client_name}
                      onChange={e => setLeadForm(prev => ({ ...prev, client_name: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  {/* Client Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={leadForm.client_phone}
                      onChange={e => setLeadForm(prev => ({ ...prev, client_phone: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  {/* Client Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@company.com"
                      value={leadForm.client_email}
                      onChange={e => setLeadForm(prev => ({ ...prev, client_email: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={leadForm.company_name}
                      onChange={e => setLeadForm(prev => ({ ...prev, company_name: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  {/* Category dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Product Category</label>
                    <select
                      value={selectedCategoryId}
                      onChange={handleCategoryChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Subcategory</label>
                    <select
                      value={selectedSubCategoryId}
                      onChange={handleSubCategoryChange}
                      disabled={!selectedCategoryId}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none disabled:opacity-50 cursor-pointer"
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Product selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Product Package</label>
                    <select
                      value={leadForm.product_id}
                      onChange={handleProductSelect}
                      disabled={!selectedSubCategoryId}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none disabled:opacity-50 cursor-pointer"
                    >
                      <option value="">Select Product Package</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Budget */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Estimated Budget</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹25,000"
                      value={leadForm.budget}
                      onChange={e => setLeadForm(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>

                  {/* Follow-up target date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Initial Follow-up Date</label>
                    <input
                      type="date"
                      value={leadForm.expected_close_date}
                      onChange={e => setLeadForm(prev => ({ ...prev, expected_close_date: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-750 focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Lead Priority */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Lead Priority</label>
                    <select
                      value={leadForm.lead_priority}
                      onChange={e => setLeadForm(prev => ({ ...prev, lead_priority: e.target.value }))}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Notes/Remarks */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">General Summary / Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Describe details regarding customer's inquiry and context..."
                    value={leadForm.notes}
                    onChange={e => setLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-750 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] resize-none"
                  />
                </div>

                {/* Address block */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Location details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 sm:col-span-3">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Full Address</label>
                      <input
                        type="text"
                        placeholder="Street details..."
                        value={leadForm.address}
                        onChange={e => setLeadForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai"
                        value={leadForm.city}
                        onChange={e => setLeadForm(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">State</label>
                      <input
                        type="text"
                        placeholder="e.g. Maharashtra"
                        value={leadForm.state}
                        onChange={e => setLeadForm(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">PIN Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 400001"
                        value={leadForm.pin_code}
                        onChange={e => setLeadForm(prev => ({ ...prev, pin_code: e.target.value }))}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateEditOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-full bg-[#38b34a] hover:bg-[#2d963b] text-white font-black text-xs cursor-pointer shadow-sm disabled:opacity-50 transition"
                  >
                    {saving ? 'Saving...' : 'Submit Details'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHANGE STATUS MODAL */}
      <AnimatePresence>
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-left text-slate-800"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black uppercase text-slate-800">Update Lead Status</h3>
                <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
              </div>
              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Select Status</label>
                  <select
                    value={statusForm.status}
                    onChange={e => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                    <option value="junk">Junk</option>
                  </select>
                </div>

                {statusForm.status === 'lost' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Reason for Loss <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Why was the lead lost?"
                      value={statusForm.lost_reason}
                      onChange={e => setStatusForm(prev => ({ ...prev, lost_reason: e.target.value }))}
                      required
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 focus:outline-none focus:border-[#38b34a]"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Log notes/updates</label>
                  <textarea
                    rows="2.5"
                    placeholder="Log status update details..."
                    value={statusForm.notes}
                    onChange={e => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 bg-[#38b34a] hover:bg-[#2d963b] text-white font-bold text-xs rounded-full cursor-pointer shadow-sm transition">{saving ? 'Updating...' : 'Update Status'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHEDULE FOLLOW-UP MODAL */}
      <AnimatePresence>
        {isFollowUpModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-left text-slate-800"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black uppercase text-slate-800">Schedule Follow-up</h3>
                <button onClick={() => setIsFollowUpModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
              </div>
              <form onSubmit={handleFollowUpSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Next Follow-up Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={followUpForm.next_date}
                    onChange={e => setFollowUpForm(prev => ({ ...prev, next_date: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-750 focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Update Status (Optional)</label>
                  <select
                    value={followUpForm.status}
                    onChange={e => setFollowUpForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                    <option value="junk">Junk</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Remarks/Agenda</label>
                  <textarea
                    rows="2.5"
                    placeholder="Log detail updates or follow-up goals..."
                    value={followUpForm.remark}
                    onChange={e => setFollowUpForm(prev => ({ ...prev, remark: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsFollowUpModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 bg-[#38b34a] hover:bg-[#2d963b] text-white font-bold text-xs rounded-full cursor-pointer shadow-sm transition">{saving ? 'Scheduling...' : 'Save Follow-up'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOG ACTIVITY MODAL */}
      <AnimatePresence>
        {isActivityModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-left text-slate-800"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black uppercase text-slate-800">Log Lead Activity</h3>
                <button onClick={() => setIsActivityModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
              </div>
              <form onSubmit={handleActivitySubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Activity Type</label>
                  <select
                    value={activityForm.activity_type}
                    onChange={e => setActivityForm(prev => ({ ...prev, activity_type: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer"
                  >
                    <option value="call">Phone Call 📞</option>
                    <option value="email">Email Sent ✉️</option>
                    <option value="meeting">In-Person Meeting 🤝</option>
                    <option value="follow_up">Scheduled Follow-up 📅</option>
                    <option value="note">General Notes 📝</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Brief Description <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Discussed pricing details..."
                    required
                    value={activityForm.description}
                    onChange={e => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 focus:outline-none focus:border-[#38b34a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Activity Date</label>
                  <input
                    type="date"
                    value={activityForm.scheduled_date}
                    onChange={e => setActivityForm(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-750 focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Remarks/Notes</label>
                  <textarea
                    rows="2.5"
                    placeholder="Log activity details..."
                    value={activityForm.notes}
                    onChange={e => setActivityForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsActivityModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 bg-[#38b34a] hover:bg-[#2d963b] text-white font-bold text-xs rounded-full cursor-pointer shadow-sm transition">{saving ? 'Logging...' : 'Log Activity'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SEND EMAIL MODAL */}
      <AnimatePresence>
        {isMailModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 text-left text-slate-800"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black uppercase text-slate-800">Send Demo Email</h3>
                <button onClick={() => setIsMailModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
              </div>
              <form onSubmit={handleSendMailSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Recipient Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={mailForm.email}
                    onChange={e => setMailForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 focus:outline-none focus:border-[#38b34a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Email Subject</label>
                  <input
                    type="text"
                    required
                    value={mailForm.subject}
                    onChange={e => setMailForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 focus:outline-none focus:border-[#38b34a]"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-slate-400 font-medium">
                  <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Included Attachments & Content</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Complimentary AIM School ERP Brochure & PDF Catalogue</li>
                    <li>SaaS Platform activation agreements & onboarding timelines</li>
                    <li>System requirements & login guidelines</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsMailModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={sendingMail} className="px-5 py-2 bg-[#38b34a] hover:bg-[#2d963b] text-white font-bold text-xs rounded-full cursor-pointer shadow-sm transition">{sendingMail ? 'Sending...' : 'Send Demo Email'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK REASSIGN MODAL */}
      <AnimatePresence>
        {isBulkAssignOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-left text-slate-800"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black uppercase text-slate-800">Reassign {selectedLeadIds.length} Lead(s)</h3>
                <button onClick={() => setIsBulkAssignOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
              </div>
              <form onSubmit={handleBulkAssign} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Select Assignee</label>
                  <select
                    value={bulkAssignForm.assigned_to}
                    onChange={e => setBulkAssignForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer"
                  >
                    <option value="2">Jane Smith (Partner Consultant)</option>
                    <option value="3">Rahul Verma (Senior Executive)</option>
                    <option value="1">John Admin (System Admin)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Reassignment Remarks</label>
                  <textarea
                    rows="2.5"
                    placeholder="Reason for reassignment..."
                    value={bulkAssignForm.notes}
                    onChange={e => setBulkAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsBulkAssignOpen(false)} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 bg-[#38b34a] hover:bg-[#2d963b] text-white font-bold text-xs rounded-full cursor-pointer shadow-sm transition">{saving ? 'Assigning...' : 'Confirm Reassign'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL DRAWER / SLIDE-OVER PANEL */}
      <AnimatePresence>
        {selectedDrawerLead && (
          <div className="fixed inset-0 z-[120] overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDrawerLead(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-default"
              />

              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="pointer-events-auto w-screen max-w-md"
                >
                  <div className="flex h-full flex-col overflow-y-auto bg-white shadow-2xl border-l border-slate-200 text-slate-800 text-xs">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-base font-black text-slate-850 uppercase">{selectedDrawerLead.client_name}</h2>
                          <span className="text-slate-450 block mt-0.5 font-medium">{selectedDrawerLead.company_name || 'No Company'}</span>
                        </div>
                        <button
                          onClick={() => setSelectedDrawerLead(null)}
                          className="rounded-md text-slate-400 hover:text-slate-650 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3.5">
                        {getStatusBadge(selectedDrawerLead.lead_status)}
                        {getPriorityBadge(selectedDrawerLead.lead_priority)}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 py-6 px-6 space-y-6">
                      {/* Client Details Section */}
                      <div className="space-y-3.5">
                        <h3 className="text-[10px] font-black uppercase text-slate-450 tracking-widest border-b border-slate-100 pb-1.5">Contact & Package Details</h3>
                        <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Phone</span>
                            <span className="font-semibold text-slate-700 block mt-0.5">{selectedDrawerLead.client_phone}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Email</span>
                            <span className="font-semibold text-slate-700 block mt-0.5 break-all">{selectedDrawerLead.client_email || '--'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Budget</span>
                            <span className="font-semibold text-slate-700 block mt-0.5">{selectedDrawerLead.budget || '--'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Source</span>
                            <span className="font-semibold text-slate-700 block mt-0.5">{selectedDrawerLead.lead_source || 'Website'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Product Package</span>
                            <span className="font-semibold text-slate-700 block mt-0.5">{selectedDrawerLead.product_name || 'Generic Inquiry'}</span>
                          </div>
                          {selectedDrawerLead.address && (
                            <div className="col-span-2">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Address</span>
                              <span className="font-semibold text-slate-600 block mt-0.5 leading-normal">
                                {selectedDrawerLead.address}, {selectedDrawerLead.city}, {selectedDrawerLead.state} - {selectedDrawerLead.pin_code}
                              </span>
                            </div>
                          )}
                          {selectedDrawerLead.notes && (
                            <div className="col-span-2">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Notes Summary</span>
                              <p className="font-semibold text-slate-500 block mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                                {selectedDrawerLead.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Demo slot details if booked */}
                      {selectedDrawerLead.demo_slot && (
                        <div className="space-y-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">🖥️ Demo Session Booked</h4>
                          <div className="text-xs space-y-1 font-semibold">
                            <p>Slot ID: {selectedDrawerLead.demo_slot_id}</p>
                            <p>Schedule: {selectedDrawerLead.demo_slot}</p>
                            {selectedDrawerLead.demo_notes && <p className="text-[11px] mt-1 text-emerald-700 font-medium">Notes: {selectedDrawerLead.demo_notes}</p>}
                          </div>
                          <button
                            onClick={() => handleCancelBooking(selectedDrawerLead.booking_id)}
                            className="mt-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-[10px] uppercase cursor-pointer transition active:scale-95 shadow-sm"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      )}

                      {/* Action Timeline/History logs */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <h3 className="text-[10px] font-black uppercase text-slate-450 tracking-widest">Activity Timeline</h3>
                          <button
                            onClick={() => openActivityModal(selectedDrawerLead)}
                            className="text-[10px] font-bold text-[#38b34a] hover:underline"
                          >
                            + Log Activity
                          </button>
                        </div>

                        {selectedDrawerLead.activities && selectedDrawerLead.activities.length > 0 ? (
                          <div className="relative pl-4 border-l border-slate-150 space-y-4 text-xs">
                            {selectedDrawerLead.activities.map((act, aIdx) => (
                              <div key={act.id || aIdx} className="relative">
                                {/* Bullet indicator */}
                                <span className="absolute -left-[21px] top-0.5 bg-white border border-slate-300 w-2.5 h-2.5 rounded-full flex items-center justify-center text-[7px]" />
                                <div>
                                  <div className="flex items-center gap-1 font-semibold text-slate-800">
                                    <span>{getActivityIcon(act.activity_type)}</span>
                                    <span className="capitalize">{act.activity_type.replace('_', ' ')}</span>
                                    <span className="text-[10px] text-slate-400 font-medium ml-auto">
                                      {act.created_at ? act.created_at.split('T')[0] : ''}
                                    </span>
                                  </div>
                                  <p className="text-slate-500 font-bold mt-1 text-[11px]">{act.description}</p>
                                  {act.notes && (
                                    <p className="text-slate-400 font-medium mt-0.5 text-[10px] leading-relaxed">
                                      {act.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 font-bold text-center py-4">No logged activity logs available.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ASSIGN DEMO SLOT / CALENDAR MODAL */}
      <AnimatePresence>
        {showAssignModal && selectedLeadForAssign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl p-6 sm:p-8 text-left text-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-850 uppercase">Assign Demo Booking Slot</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Book a free product software demo for <strong className="text-slate-700">{selectedLeadForAssign.client_name}</strong></p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedLeadForAssign(null)
                    setSelectedDate('')
                    setAllSlotsData({})
                  }}
                  className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Split Screen Layout: Left side Calendar, Right side Slots selection */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* CALENDAR COLUMN */}
                <div className="lg:col-span-7 bg-slate-50 p-4.5 rounded-3xl border border-slate-150">
                  {/* Month selectors */}
                  <div className="flex justify-between items-center mb-4">
                    <button onClick={prevMonth} className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-black cursor-pointer">
                      ◀ Prev
                    </button>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-750">
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button onClick={nextMonth} className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-black cursor-pointer">
                      Next ▶
                    </button>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="py-1">{d}</div>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs">
                    {(() => {
                      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
                      const totalDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
                      const cells = []

                      // Empty padding for start of month
                      for (let i = 0; i < firstDay; i++) {
                        cells.push(<div key={`empty-${i}`} className="p-3" />)
                      }

                      // Fill in dates
                      for (let day = 1; day <= totalDays; day++) {
                        const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                        const dateString = dateObj.toISOString().split('T')[0]
                        const isSelected = selectedDate === dateString

                        const daySlots = getSlotsForDate(dateString)
                        const hasAvailability = daySlots.length > 0
                        const isFullyBooked = hasAvailability && daySlots.every(s => s.is_fully_booked)

                        let cellClass =
                          'p-3.5 rounded-2xl cursor-pointer hover:bg-slate-200 transition-all relative flex flex-col items-center justify-center '
                        if (isSelected) {
                          cellClass += 'bg-[#38b34a] text-white hover:bg-[#38b34a]/90 shadow-md shadow-[#38b34a]/20 scale-102 z-10'
                        } else if (hasAvailability) {
                          cellClass += isFullyBooked
                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/15'
                            : 'bg-emerald-500/10 text-[#38b34a] hover:bg-emerald-500/15'
                        } else {
                          cellClass += 'text-slate-400 hover:bg-slate-100'
                        }

                        cells.push(
                          <div
                            key={day}
                            onClick={() => setSelectedDate(dateString)}
                            className={cellClass}
                          >
                            <span>{day}</span>
                            {/* Dot Indicators */}
                            {hasAvailability && !isSelected && (
                              <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${isFullyBooked ? 'bg-red-500' : 'bg-[#38b34a]'}`} />
                            )}
                          </div>
                        )
                      }
                      return cells
                    })()}
                  </div>
                </div>

                {/* SLOTS LIST COLUMN */}
                <div className="lg:col-span-5 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                    Available Slots for {selectedDate || 'Select Date'}
                  </h4>

                  {selectedDate ? (
                    (() => {
                      const daySlots = getSlotsForDate(selectedDate)
                      if (daySlots.length === 0) {
                        return <p className="text-slate-400 font-bold text-center py-6">No demo sessions scheduled for this weekday.</p>
                      }

                      return (
                        <div className="space-y-3.5">
                          {daySlots.map(slot => {
                            const isSlotSelected = selectedSlotIdForBooking === slot.id
                            const isFullyBooked = slot.is_fully_booked

                            let cardClass =
                              'p-4 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between '
                            if (isFullyBooked) {
                              cardClass += 'bg-slate-50 border-slate-200 opacity-60'
                            } else if (isSlotSelected) {
                              cardClass += 'bg-slate-80 text-slate-800 border-[#38b34a] ring-2 ring-[#38b34a]/20 scale-101'
                            } else {
                              cardClass += 'bg-white border-slate-200 hover:border-slate-350 cursor-pointer'
                            }

                            return (
                              <div
                                key={slot.id}
                                onClick={() => {
                                  if (!isFullyBooked) {
                                    setSelectedSlotIdForBooking(slot.id)
                                    setShowSlotBookingModal(true)
                                  }
                                }}
                                className={cardClass}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-xs font-black text-slate-800">{slot.title}</span>
                                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">🕐 Time: {slot.start_time} - {slot.end_time}</span>
                                  </div>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isFullyBooked ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-[#38b34a]'}`}>
                                    {isFullyBooked ? 'FULL' : `${slot.available_attendees} Available`}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium mt-2 leading-relaxed">{slot.description}</p>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()
                  ) : (
                    <p className="text-slate-400 font-bold text-center py-6">Select a date on the calendar map to retrieve availability.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOOK SLOT DIALOG MODAL */}
      <AnimatePresence>
        {showSlotBookingModal && selectedSlotIdForBooking && selectedDate && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-left text-slate-800"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black uppercase text-slate-800">Confirm Booking</h3>
                <button onClick={() => setShowSlotBookingModal(false)} className="text-slate-400 hover:text-slate-650 font-bold cursor-pointer">✕</button>
              </div>
              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 text-slate-600">
                  <p>Client: <strong className="text-slate-800">{selectedLeadForAssign?.client_name}</strong></p>
                  <p>Date: <strong className="text-slate-800">{selectedDate}</strong></p>
                  <p>Slot ID: <strong className="text-slate-850">{selectedSlotIdForBooking}</strong></p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Booking Notes / Remarks</label>
                  <textarea
                    rows="3"
                    placeholder="Log onboarding requirements or customer details..."
                    value={bookingNotes}
                    onChange={e => setBookingNotes(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowSlotBookingModal(false)} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-550 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button
                    onClick={() => handleBookSlot(selectedSlotIdForBooking, selectedDate)}
                    disabled={saving}
                    className="px-5 py-2 bg-[#38b34a] hover:bg-[#2d963b] text-white font-bold text-xs rounded-full cursor-pointer shadow-sm transition"
                  >
                    {saving ? 'Confirming...' : 'Confirm Book'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
