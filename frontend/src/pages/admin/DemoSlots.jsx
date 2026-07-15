import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'

const INITIAL_SLOTS = [
  {
    id: 1,
    title: 'Product Walkthrough: Nexgn Institute Pro',
    demo_type: 'client',
    timing_from: '10:00',
    timing_to: '11:00',
    meeting_link: 'https://meet.google.com/abc-defg-hij',
    max_attendees: 10,
    is_active: true,
    bookings_count: 4,
    monday: true,
    tuesday: false,
    wednesday: true,
    thursday: false,
    friday: true,
    saturday: false,
    sunday: false
  },
  {
    id: 2,
    title: 'Marketing Partner Q&A Session',
    demo_type: 'partner',
    timing_from: '14:00',
    timing_to: '15:00',
    meeting_link: 'https://meet.google.com/xyz-uvwx-yza',
    max_attendees: 15,
    is_active: true,
    bookings_count: 8,
    monday: false,
    tuesday: true,
    wednesday: false,
    thursday: true,
    friday: false,
    saturday: false,
    sunday: false
  },
  {
    id: 3,
    title: 'Technical Integration Workshop',
    demo_type: 'client',
    timing_from: '16:00',
    timing_to: '17:00',
    meeting_link: 'https://meet.google.com/mno-pqrs-tuv',
    max_attendees: 5,
    is_active: false,
    bookings_count: 2,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  }
]

const AdminDemoSlots = () => {
  const [slots, setSlots] = useState(INITIAL_SLOTS)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // Form state
  const [form, setForm] = useState({
    title: '',
    demo_type: 'client',
    timing_from: '09:00',
    timing_to: '10:00',
    meeting_link: '',
    max_attendees: 10,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  })

  // Calendar Modal state
  const [showCalendar, setShowCalendar] = useState(false)

  const handleCopyLink = (link, id) => {
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleToggleStatus = (id) => {
    setSlots(slots.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s))
  }

  const handleDeleteSlot = (id) => {
    if (window.confirm('Are you sure you want to delete this demo slot?')) {
      setSlots(slots.filter(s => s.id !== id))
    }
  }

  const handleOpenCreate = () => {
    setIsEditMode(false)
    setSelectedSlot(null)
    setForm({
      title: '',
      demo_type: 'client',
      timing_from: '09:00',
      timing_to: '10:00',
      meeting_link: '',
      max_attendees: 10,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (slot) => {
    setIsEditMode(true)
    setSelectedSlot(slot)
    setForm({ ...slot })
    setIsModalOpen(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (isEditMode) {
      setSlots(slots.map(s => s.id === selectedSlot.id ? { ...s, ...form } : s))
    } else {
      const newSlot = {
        ...form,
        id: Date.now(),
        bookings_count: 0,
        is_active: true
      }
      setSlots([newSlot, ...slots])
    }
    setIsModalOpen(false)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Filter logic
  const filteredSlots = slots.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || (s.meeting_link || '').toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'All' || s.demo_type === typeFilter
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? s.is_active : !s.is_active)
    return matchesSearch && matchesType && matchesStatus
  })

  // Stats
  const totalSlots = slots.length
  const activeSlots = slots.filter(s => s.is_active).length
  const totalBookings = slots.reduce((acc, curr) => acc + curr.bookings_count, 0)
  const completedSlots = slots.filter(s => s.bookings_count > 5).length // Simulated

  const formatDays = (s) => {
    const daysArr = []
    if (s.monday) daysArr.push('Mon')
    if (s.tuesday) daysArr.push('Tue')
    if (s.wednesday) daysArr.push('Wed')
    if (s.thursday) daysArr.push('Thu')
    if (s.friday) daysArr.push('Fri')
    if (s.saturday) daysArr.push('Sat')
    if (s.sunday) daysArr.push('Sun')
    return daysArr.length === 7 ? 'All Days' : daysArr.join(', ') || 'None'
  }

  return (
    <>
      <Helmet>
        <title>Demo Slots Registry | Admin Panel</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          <div>
            <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Demo Slots Registry</h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">Manage, schedule, and configure customer and partner video conference demo sessions.</p>
          </div>
          <div className="flex gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowCalendar(true)}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 bg-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              📅 View Calendar
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-[#38b34a] hover:bg-[#2d963c] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              ➕ Add Demo Slot
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Total slots</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block font-mono">{totalSlots}</span>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-emerald-500 uppercase block tracking-wider">Active Slots</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">{activeSlots}</span>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-blue-500 uppercase block tracking-wider">Total Booked</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block font-mono">{totalBookings}</span>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-[#c25e17] uppercase block tracking-wider">High Volume</span>
            <span className="text-2xl font-black text-[#c25e17] mt-1 block font-mono">{completedSlots}</span>
          </div>
        </div>

        {/* Filters & Table Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-end mb-6 text-xs font-semibold">
            <div className="flex-1 w-full space-y-1">
              <label className="text-slate-400 block font-bold uppercase tracking-wider">Search Slots</label>
              <input
                type="text"
                placeholder="Search by slot title or link..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-semibold"
              />
            </div>
            <div className="w-full sm:w-44 space-y-1">
              <label className="text-slate-400 block font-bold uppercase tracking-wider">Slot Type</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-semibold"
              >
                <option value="All">All Types</option>
                <option value="client">Client Demo</option>
                <option value="partner">Partner Demo</option>
              </select>
            </div>
            <div className="w-full sm:w-44 space-y-1">
              <label className="text-slate-400 block font-bold uppercase tracking-wider">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-semibold"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Slots Table */}
          {filteredSlots.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-slate-50/20 rounded-2xl border border-slate-100 shadow-inner">
              <span className="text-4xl block">📅</span>
              <p className="font-bold mt-2">No demo slots defined</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-5 py-4">Slot Details</th>
                      <th className="px-5 py-4">Timings</th>
                      <th className="px-5 py-4 text-center">Type</th>
                      <th className="px-5 py-4">Days</th>
                      <th className="px-5 py-4 text-center">Max Seats</th>
                      <th className="px-5 py-4 text-center">Booked</th>
                      <th className="px-5 py-4 text-center">Status</th>
                      <th className="px-5 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredSlots.map(slot => (
                      <tr key={slot.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 text-sm">{slot.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">{slot.meeting_link}</span>
                            <button
                              onClick={() => handleCopyLink(slot.meeting_link, slot.id)}
                              className="text-[9px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded cursor-pointer"
                            >
                              {copiedId === slot.id ? 'Copied! ✓' : 'Copy'}
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-slate-600">{slot.timing_from} - {slot.timing_to}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                            slot.demo_type === 'client'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-purple-50 text-purple-700 border-purple-100'
                          }`}>
                            {slot.demo_type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 font-medium">{formatDays(slot)}</td>
                        <td className="px-5 py-4 text-center font-bold text-slate-600">{slot.max_attendees}</td>
                        <td className="px-5 py-4 text-center font-bold text-slate-800">{slot.bookings_count}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                            slot.is_active
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}>
                            {slot.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleToggleStatus(slot.id)}
                              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-bold cursor-pointer"
                            >
                              {slot.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleOpenEdit(slot)}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 rounded text-[9px] font-bold cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded cursor-pointer"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* CALENDAR MODAL */}
        {showCalendar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-200/80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">📅 Demo Calendar Overview</h3>
                <button onClick={() => setShowCalendar(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-xl cursor-pointer">×</button>
              </div>
              <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
                <div className="bg-slate-50 p-3 font-bold text-center border-b border-slate-100">July 2026</div>
                <div className="grid grid-cols-7 gap-1 p-3 text-center font-bold text-slate-400 border-b border-slate-100 bg-slate-50/50">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 p-3 text-center font-semibold text-slate-700">
                  {/* Mock calendar days */}
                  {Array.from({ length: 31 }).map((_, i) => {
                    const dayNum = i + 1
                    const hasSlots = dayNum % 3 === 0
                    return (
                      <div
                        key={i}
                        onClick={() => hasSlots && alert(`Day ${dayNum} has active demo slots configured.`)}
                        className={`h-8 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all ${
                          hasSlots
                            ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span>{dayNum}</span>
                        {hasSlots && <span className="w-1 h-1 bg-indigo-500 rounded-full mt-0.5"></span>}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="mt-4 text-[10px] text-slate-400 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                🔵 Highlighting days with scheduled demo appointments. Click on highlighted dates to view bookings list.
              </div>
            </div>
          </div>
        )}

        {/* ADD/EDIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 border border-slate-200/80">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black text-slate-800">{isEditMode ? '✏️ Edit Demo Slot' : '➕ Add Demo Slot'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-xl cursor-pointer">×</button>
              </div>
              <form onSubmit={handleSave} className="space-y-4 text-xs font-bold">
                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase block">Slot Title / Topic *</label>
                  <input
                    type="text"
                    required
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="e.g. nexgn institute pro walkthrough"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-1 focus:ring-[#38b34a]/30 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase block">Slot Type *</label>
                    <select
                      name="demo_type"
                      value={form.demo_type}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] font-semibold"
                    >
                      <option value="client">Client Demo</option>
                      <option value="partner">Partner Demo</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase block">Max Attendees *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      name="max_attendees"
                      value={form.max_attendees}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase block">Timing From *</label>
                    <input
                      type="time"
                      required
                      name="timing_from"
                      value={form.timing_from}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase block">Timing To *</label>
                    <input
                      type="time"
                      required
                      name="timing_to"
                      value={form.timing_to}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase block">Meeting Link URL (Google Meet/Zoom) *</label>
                  <input
                    type="url"
                    required
                    name="meeting_link"
                    value={form.meeting_link}
                    onChange={handleInputChange}
                    placeholder="https://meet.google.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] font-semibold"
                  />
                </div>

                {/* Days selection checkboxes */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase block mb-1">Select Active Days</label>
                  <div className="flex flex-wrap gap-2.5">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <label key={day} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl cursor-pointer select-none transition-all ${
                        form[day] ? 'bg-indigo-50 border-indigo-250 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500 font-medium'
                      }`}>
                        <input
                          type="checkbox"
                          name={day}
                          checked={form[day]}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <span className="capitalize text-[10px]">{day.substring(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer">Save Slot</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default AdminDemoSlots
