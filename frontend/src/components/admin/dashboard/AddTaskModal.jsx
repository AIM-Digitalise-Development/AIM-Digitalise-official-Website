import React, { useState } from 'react'

const AddTaskModal = ({ isOpen, onClose, onAdd }) => {
  const [task, setTask] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [status, setStatus] = useState('Pending')
  const [dueDate, setDueDate] = useState('')
  const [assignee, setAssignee] = useState('Unassigned')

  const employeeList = [
    'Rohan Verma',
    'Priya Singh',
    'Aman Gupta',
    'Neha Sharma',
    'Vikram Malhotra'
  ]

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!task.trim()) {
      alert('Task title is required!')
      return
    }
    onAdd({
      task: task.trim(),
      priority,
      status,
      dueDate: dueDate || 'Today',
      assignee
    })
    // Reset form
    setTask('')
    setPriority('Medium')
    setStatus('Pending')
    setDueDate('')
    setAssignee('Unassigned')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">Add New Task</h3>
            <p className="text-xs text-blue-100">Create a task for the dashboard checklist</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-blue-200 transition-colors text-2xl font-semibold cursor-pointer">
            &times;
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Task Description</label>
              <input
                type="text"
                placeholder="e.g. Follow up with GreenWood for pending AMC signoff"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Assign To Employee</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer font-bold"
              >
                <option value="Unassigned">Unassigned</option>
                {employeeList.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors cursor-pointer text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors cursor-pointer text-sm"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTaskModal
