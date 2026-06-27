import React from 'react'

const priorityStyles = {
  Critical: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30',
  High: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30',
  Medium: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30',
  Low: 'bg-blue-50 dark:bg-blue-955/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30'
}

const TaskCard = ({ task, onUpdateStatus, onAssignTask, onDeleteTask }) => {
  const employeeList = [
    'Rohan Verma',
    'Priya Singh',
    'Aman Gupta',
    'Neha Sharma',
    'Vikram Malhotra'
  ]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between text-[10px] font-bold">
        <span className="font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
          {task.id}
        </span>
        <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${priorityStyles[task.priority] || 'bg-slate-100 text-slate-600'}`}>
          {task.priority} Priority
        </span>
      </div>

      {/* Task Content */}
      <div className="space-y-1">
        <h4 className="text-xs font-extrabold text-[#1e3e6b] dark:text-indigo-400 leading-snug">
          {task.task}
        </h4>
        {task.description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium font-sans leading-normal">
            {task.description}
          </p>
        )}
      </div>

      {/* Metadata */}
      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between font-sans">
          <span>📅 Due: <strong className="text-slate-600 dark:text-slate-350">{task.dueDate}</strong></span>
          <span>👤 By: <strong className="text-slate-600 dark:text-slate-350">{task.createdBy}</strong></span>
        </div>

        {/* Assignee Dropdown */}
        <div className="flex items-center gap-1.5 py-0.5">
          <span>👤 Assign To:</span>
          <select
            value={task.assignee || 'Unassigned'}
            onChange={(e) => onAssignTask(task.id, e.target.value)}
            className="flex-grow bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[9.5px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="Unassigned">Unassigned</option>
            {employeeList.map((emp) => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this task?')) {
              onDeleteTask(task.id)
            }
          }}
          className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
          title="Delete Task"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <div className="flex gap-1.5">
          {task.status === 'Pending' && (
            <button
              onClick={() => onUpdateStatus(task.id, 'In Progress')}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
            >
              Start Work
            </button>
          )}
          {task.status === 'In Progress' && (
            <button
              onClick={() => onUpdateStatus(task.id, 'Completed')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
            >
              Mark Done
            </button>
          )}
          {task.status === 'Completed' && (
            <button
              onClick={() => onUpdateStatus(task.id, 'Pending')}
              className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-lg text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
            >
              Reopen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard