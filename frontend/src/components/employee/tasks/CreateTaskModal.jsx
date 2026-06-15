import React, { useState } from 'react'

const CreateTaskModal = ({ isOpen, onClose, onSubmit, employeeList }) => {
  const [task, setTask] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [assignee, setAssignee] = useState('Unassigned')
  const [dueDate, setDueDate] = useState('')

  if (!isOpen) return null

  const handleSubmitForm = (e) => {
    e.preventDefault()
    if (!task.trim()) {
      alert('Task title is required!')
      return
    }
    onSubmit({
      task: task.trim(),
      description: description.trim(),
      priority,
      status: 'Pending',
      assignee,
      dueDate: dueDate || new Date().toISOString().split('T')[0]
    })
    // Reset
    setTask('')
    setDescription('')
    setPriority('Medium')
    setAssignee('Unassigned')
    setDueDate('')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Modal Box */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-fade-in text-slate-700 dark:text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
          <div>
            <h3 className="text-base font-black text-slate-805 dark:text-white">Create New Task</h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Assign tasks to yourself or other team members.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmitForm} className="p-6 space-y-4 font-semibold text-xs text-slate-600 dark:text-slate-400">
          {/* Task Title */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1.5">Task Title / Brief</label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. Test reporting module grand totals"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 dark:focus:border-indigo-500 text-slate-700 dark:text-slate-200 font-sans"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1.5">Detailed Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              placeholder="Details on what needs to be solved, steps, or goals..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 dark:focus:border-indigo-500 text-slate-700 dark:text-slate-200 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority Select */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer font-bold"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>
          </div>

          {/* Assignee Selection */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1.5">Assign Task To</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer font-bold"
            >
              <option value="Unassigned">Unassigned</option>
              {employeeList.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal