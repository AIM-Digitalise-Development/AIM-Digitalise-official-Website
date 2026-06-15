import React from 'react'
import TaskCard from './TaskCard'

const TaskBoard = ({ tasks, onUpdateStatus, onAssignTask, onDeleteTask }) => {
  const columns = [
    { title: 'To Do / Pending', status: 'Pending', bgClass: 'bg-slate-50 dark:bg-slate-900/30' },
    { title: 'In Progress', status: 'In Progress', bgClass: 'bg-slate-50 dark:bg-slate-900/30' },
    { title: 'Completed', status: 'Completed', bgClass: 'bg-slate-50 dark:bg-slate-900/30' }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status)
        return (
          <div
            key={col.status}
            className={`rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 flex flex-col min-h-[500px] ${col.bgClass}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/50 dark:border-slate-800/50 mb-4">
              <h3 className="font-extrabold text-sm text-[#1e3e6b] dark:text-indigo-400 flex items-center gap-2">
                <span>
                  {col.status === 'Pending' ? '📋' : col.status === 'In Progress' ? '⚙️' : '✅'}
                </span>
                <span>{col.title}</span>
              </h3>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {colTasks.length}
              </span>
            </div>

            {/* Tasks List */}
            <div className="flex-grow space-y-4 overflow-y-auto max-h-[600px] pr-1">
              {colTasks.length > 0 ? (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdateStatus={onUpdateStatus}
                    onAssignTask={onAssignTask}
                    onDeleteTask={onDeleteTask}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                  <span>📁</span>
                  <p className="mt-1">No tasks in this lane</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TaskBoard