import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

// Mock initial implementation data for SaaS software deployments
const INITIAL_IMPLEMENTATIONS = [
  {
    id: 1,
    client_name: 'St. Xavier High School',
    project_name: 'School Management ERP',
    category: 'Educational SaaS',
    start_date: '2026-06-10',
    target_date: '2026-07-20',
    status: 'In Progress',
    milestone: 'Data Migration',
    progress: 65,
    assigned_lead: 'Jane Smith',
    priority: 'high',
    milestones: [
      { name: 'Server & Database Setup', date: '2026-06-12', completed: true },
      { name: 'Core Modules Configuration', date: '2026-06-20', completed: true },
      { name: 'Data Migration & Validation', date: '2026-07-02', completed: false },
      { name: 'Staff Training & Handover', date: '2026-07-15', completed: false }
    ]
  },
  {
    id: 2,
    client_name: 'Acme Corporates',
    project_name: 'Business ERP & CRM Suite',
    category: 'Corporate CRM',
    start_date: '2026-06-18',
    target_date: '2026-08-05',
    status: 'In Progress',
    milestone: 'UI Theme Customization',
    progress: 40,
    assigned_lead: 'Rahul Verma',
    priority: 'medium',
    milestones: [
      { name: 'Server & Database Setup', date: '2026-06-20', completed: true },
      { name: 'UI Theme Customization', date: '2026-07-10', completed: false },
      { name: 'Custom Integrations', date: '2026-07-25', completed: false },
      { name: 'Client Acceptance Testing', date: '2026-08-02', completed: false }
    ]
  },
  {
    id: 3,
    client_name: 'Global Biotech Labs',
    project_name: 'Pharmacy Billing Inventory System',
    category: 'Healthcare Solutions',
    start_date: '2026-05-01',
    target_date: '2026-06-15',
    status: 'Completed',
    milestone: 'Client Handover',
    progress: 100,
    assigned_lead: 'Rahul Verma',
    priority: 'low',
    milestones: [
      { name: 'Database Architecture Setup', date: '2025-05-05', completed: true },
      { name: 'Billing Modules Testing', date: '2025-05-25', completed: true },
      { name: 'UAT & Staff Handover', date: '2025-06-10', completed: true }
    ]
  },
  {
    id: 4,
    client_name: 'Royal Hospitality Group',
    project_name: 'Hotel Management SaaS',
    category: 'Hospitality ERP',
    start_date: '2026-06-25',
    target_date: '2026-07-28',
    status: 'Not Started',
    milestone: 'Infrastructure Provisioning',
    progress: 10,
    assigned_lead: 'Jane Smith',
    priority: 'urgent',
    milestones: [
      { name: 'Domain & Database Setup', date: '2026-07-01', completed: false },
      { name: 'CRM & Booking Setup', date: '2026-07-12', completed: false },
      { name: 'Staff Training Session', date: '2026-07-22', completed: false }
    ]
  }
]

export default function AdminImplementation() {
  const [implementations, setImplementations] = useState(INITIAL_IMPLEMENTATIONS)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  // Edit / Milestone Update states
  const [editingProject, setEditingProject] = useState(null)
  const [updateForm, setUpdateForm] = useState({
    status: 'In Progress',
    progress: 0,
    milestone: ''
  })
  const [saving, setSaving] = useState(false)

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleUpdateClick = (project) => {
    setEditingProject(project)
    setUpdateForm({
      status: project.status,
      progress: project.progress,
      milestone: project.milestone
    })
  }

  const handleUpdateSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setImplementations(prev =>
        prev.map(p => {
          if (p.id === editingProject.id) {
            // Update active milestones progress
            const updatedMilestones = p.milestones.map(m => {
              if (updateForm.status === 'Completed') return { ...m, completed: true }
              return m
            })
            return {
              ...p,
              status: updateForm.status,
              progress: Number(updateForm.progress),
              milestone: updateForm.milestone,
              milestones: updatedMilestones
            }
          }
          return p
        })
      )
      triggerSuccess('Project deployment status updated successfully!')
      setEditingProject(null)
      setSaving(false)
    }, 600)
  }

  const filteredProjects = implementations.filter(p => {
    const matchesSearch = p.client_name.toLowerCase().includes(search.toLowerCase()) || p.project_name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus ? p.status === filterStatus : true
    return matchesSearch && matchesStatus
  })

  // Calculations for KPI Cards
  const totalCount = implementations.length
  const inProgressCount = implementations.filter(p => p.status === 'In Progress').length
  const completedCount = implementations.filter(p => p.status === 'Completed').length
  const urgentCount = implementations.filter(p => p.priority === 'urgent' && p.status !== 'Completed').length

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
      high: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
      medium: 'bg-yellow-450/10 text-yellow-500 border-yellow-450/20',
      low: 'bg-blue-400/10 text-blue-400 border-blue-400/20'
    }
    const c = badges[priority] || badges.medium
    return <span className={`inline-flex text-[9px] font-black uppercase tracking-wider border rounded-md px-2 py-0.5 ${c}`}>{priority}</span>
  }

  const getStatusBadge = (status) => {
    const badges = {
      'Not Started': 'bg-gray-400/10 text-gray-500 border-gray-400/20',
      'In Progress': 'bg-blue-400/10 text-blue-500 border-blue-400/20',
      'Completed': 'bg-green-400/10 text-green-550 border-green-400/20'
    }
    const c = badges[status] || badges['Not Started']
    return <span className={`inline-flex text-[9px] font-black uppercase tracking-wider border rounded-md px-2 py-0.5 ${c}`}>{status}</span>
  }

  return (
    <>
      <Helmet>
        <title>AIM Admin | Project Implementation Reports</title>
      </Helmet>

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
            <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase">Implementation Reports</h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Track delivery steps, staging setup and customization milestones for clients</p>
          </div>
        </div>

        {/* KPI metrics cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'SaaS Implementations', value: totalCount, icon: '🚀', color: 'indigo' },
            { label: 'In Execution', value: inProgressCount, icon: '⚙️', color: 'blue' },
            { label: 'Live & Handover', value: completedCount, icon: '✅', color: 'emerald' },
            { label: 'Urgent Action Required', value: urgentCount, icon: '⚠️', color: 'red' }
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

        {/* Filter controls */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/85 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by client or deployment name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer w-full sm:w-48"
          >
            <option value="">All Deployment Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Implementation Listing Table */}
        <div className="bg-white rounded-3xl border border-slate-200/85 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">SaaS Client / Project Details</th>
                  <th className="px-6 py-4">Lead Assignee</th>
                  <th className="px-6 py-4">Delivery Status</th>
                  <th className="px-6 py-4">Custom Milestone</th>
                  <th className="px-6 py-4">Progress Roadmap</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredProjects.map(project => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span
                          onClick={() => setSelectedProject(project)}
                          className="font-bold text-slate-800 hover:text-[#38b34a] cursor-pointer text-sm block"
                        >
                          {project.client_name}
                        </span>
                        <span className="text-slate-400 font-medium block mt-0.5">
                          {project.project_name} · {project.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">
                      👤 {project.assigned_lead}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {getStatusBadge(project.status)}
                        {getPriorityBadge(project.priority)}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      🎯 {project.milestone}
                    </td>
                    <td className="px-6 py-4 w-60">
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-bold text-[10px] text-slate-400">
                          <span>{project.progress}% completed</span>
                          <span>Target: {project.target_date}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-150/40 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            className="bg-gradient-to-r from-emerald-450 to-[#38b34a] h-full rounded-full"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleUpdateClick(project)}
                        className="px-3.5 py-1.5 bg-[#38b34a] hover:bg-[#2d963b] text-white font-black rounded-full cursor-pointer transition active:scale-95 text-[10px]"
                      >
                        UPDATE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-left text-slate-800"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-slate-850">Update Implementation Roadmap</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Deployment status for {editingProject.client_name}</p>
                </div>
                <button onClick={() => setEditingProject(null)} className="text-slate-400 hover:text-slate-650 font-bold cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Deployment Status</label>
                  <select
                    value={updateForm.status}
                    onChange={e => {
                      const statusVal = e.target.value
                      setUpdateForm(prev => ({
                        ...prev,
                        status: statusVal,
                        progress: statusVal === 'Completed' ? 100 : prev.progress
                      }))
                    }}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-650 focus:outline-none cursor-pointer"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Active Milestone Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Setting up Database schemas"
                    value={updateForm.milestone}
                    onChange={e => setUpdateForm(prev => ({ ...prev, milestone: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4.5 py-2.5 text-xs text-slate-705 focus:outline-none focus:border-[#38b34a]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                    <label>Overall Progress (%)</label>
                    <span className="text-[#38b34a] text-xs">{updateForm.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={updateForm.progress}
                    onChange={e => setUpdateForm(prev => ({ ...prev, progress: e.target.value }))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#38b34a]"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setEditingProject(null)} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 bg-[#38b34a] hover:bg-[#2d963b] text-white font-bold text-xs rounded-full cursor-pointer shadow-sm transition">{saving ? 'Updating...' : 'Save Deployment'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW PROJECT DETAIL DRAWER */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[120] overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProject(null)}
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
                          <h2 className="text-base font-black text-slate-850 uppercase">{selectedProject.client_name}</h2>
                          <span className="text-slate-450 block mt-0.5 font-medium">{selectedProject.project_name}</span>
                        </div>
                        <button
                          onClick={() => setSelectedProject(null)}
                          className="rounded-md text-slate-400 hover:text-slate-650 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3.5">
                        {getStatusBadge(selectedProject.status)}
                        {getPriorityBadge(selectedProject.priority)}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 py-6 px-6 space-y-6">
                      {/* Project info card */}
                      <div className="space-y-3.5">
                        <h3 className="text-[10px] font-black uppercase text-slate-450 tracking-widest border-b border-slate-100 pb-1.5 font-sans">Deployment info</h3>
                        <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Product Category</span>
                            <span className="font-semibold text-slate-700 block mt-0.5">{selectedProject.category}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Assigned Consultant</span>
                            <span className="font-semibold text-slate-700 block mt-0.5">👤 {selectedProject.assigned_lead}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Execution Started</span>
                            <span className="font-semibold text-slate-700 block mt-0.5">{selectedProject.start_date}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Target Handover</span>
                            <span className="font-semibold text-slate-700 block mt-0.5 text-indigo-600">{selectedProject.target_date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Milestones list */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase text-slate-450 tracking-widest border-b border-slate-100 pb-1.5">Milestone Checkpoints</h3>
                        <div className="relative pl-4 border-l border-slate-150 space-y-4">
                          {selectedProject.milestones.map((m, mIdx) => (
                            <div key={mIdx} className="relative">
                              {/* Bullet checkpoint indicator */}
                              <span className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border border-slate-350 flex items-center justify-center text-[7px] ${m.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white'}`}>
                                {m.completed ? '✓' : ''}
                              </span>
                              <div>
                                <p className={`font-bold ${m.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{m.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Expected Target: {m.date}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
