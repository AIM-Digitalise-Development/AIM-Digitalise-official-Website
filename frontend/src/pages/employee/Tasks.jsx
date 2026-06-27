import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTaskStore } from '../../store/taskStore'
import { useAuth } from '../../hooks/useAuth'
import TaskBoard from '../../components/employee/tasks/TaskBoard'
import CreateTaskModal from '../../components/employee/tasks/CreateTaskModal'

const EmployeeTasks = () => {
  const { user } = useAuth()
  const { tasks, addTask, updateTaskStatus, assignTask, deleteTask } = useTaskStore()

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [assigneeFilter, setAssigneeFilter] = useState(user?.name || 'All') // Default to logged-in user

  const employeeList = [
    'Rohan Verma',
    'Priya Singh',
    'Aman Gupta',
    'Neha Sharma',
    'Vikram Malhotra'
  ]

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter

    let matchesAssignee = true
    if (assigneeFilter === 'Assigned to Me') {
      matchesAssignee = task.assignee?.toLowerCase() === (user?.name || '').toLowerCase()
    } else if (assigneeFilter === 'Unassigned') {
      matchesAssignee = !task.assignee || task.assignee === 'Unassigned'
    } else if (assigneeFilter !== 'All') {
      matchesAssignee = task.assignee?.toLowerCase() === assigneeFilter.toLowerCase()
    }

    return matchesSearch && matchesPriority && matchesAssignee
  })

  const handleCreateTask = (taskData) => {
    addTask({
      ...taskData,
      createdBy: user?.name || 'Employee'
    })
    setIsModalOpen(false)
    alert('Task created successfully!')
  }

  return (
    <>
      <Helmet>
        <title>Task Board | Employee Portal</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 dark:text-slate-200 animate-fade-in">
        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px] border-b border-slate-200/20">
          <div>
            <h1 className="text-3xl font-black text-[#1e3e6b] dark:text-indigo-400 tracking-tight">Work Task Board</h1>
            <p className="text-xs font-bold text-slate-500 mt-1">Manage, update, and assign your development and operational tasks.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer self-start md:self-auto"
          >
            + New Task
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Search */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Search Tasks</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by keyword or task ID..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 dark:focus:border-indigo-500 font-sans"
                />
              </div>
            </div>

            {/* Filter by Assignee */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Filter Assignee</label>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer font-semibold"
              >
                <option value="All">All Employees</option>
                <option value="Assigned to Me">Assigned to Me ({user?.name || 'Me'})</option>
                <option value="Unassigned">Unassigned</option>
                {employeeList.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            {/* Filter by Priority */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Filter Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer font-semibold"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Board */}
        <TaskBoard
          tasks={filteredTasks}
          onUpdateStatus={updateTaskStatus}
          onAssignTask={assignTask}
          onDeleteTask={deleteTask}
        />
      </div>

      {/* Create Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        employeeList={employeeList}
      />
    </>
  )
}

export default EmployeeTasks