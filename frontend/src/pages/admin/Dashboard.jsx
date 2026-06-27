import React, { useState, useEffect } from 'react'
import StatCardsGrid from '../../components/admin/dashboard/StatCardsGrid'
import CompanyHeader from '../../components/admin/dashboard/CompanyHeader'
import PaymentCollection from '../../components/admin/dashboard/PaymentCollection'
import SalesAnalytics from '../../components/admin/dashboard/SalesAnalytics'
import TodoList from '../../components/admin/dashboard/TodoList'
import { getAdminDashboard } from '../../api/admin/partners'

// Modals
import ClientGainModal from '../../components/admin/dashboard/ClientGainModal'
import SchoolsListModal from '../../components/admin/dashboard/SchoolsListModal'
import StudentsListModal from '../../components/admin/dashboard/StudentsListModal'
import UndeliveredClientsModal from '../../components/admin/dashboard/UndeliveredClientsModal'
import PaymentCollectionDetailsModal from '../../components/admin/dashboard/PaymentCollectionDetailsModal'
import DuePaymentInvoicesModal from '../../components/admin/dashboard/DuePaymentInvoicesModal'
import AddTaskModal from '../../components/admin/dashboard/AddTaskModal'

import { useTaskStore } from '../../store/taskStore'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal state: 'clientGain' | 'schoolsList' | 'studentsList' | 'undeliveredClients' | 'paymentDetails' | 'dueInvoices' | 'addTask' | null
  const [activeModal, setActiveModal] = useState(null)

  const { tasks, addTask, updateTaskStatus, deleteTask } = useTaskStore()

  const fetchDashboardStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAdminDashboard()
      if (res.data?.success) {
        setStats(res.data.data)
      } else {
        setError(res.data?.message || 'Failed to fetch dashboard statistics')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while connecting to the server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const statCards = [
    { 
      label: 'Total Clients', 
      value: loading ? '...' : (stats?.clients?.total ?? 0), 
      gradient: 'from-blue-400 to-blue-500', 
      icon: 'student',
      onClick: () => setActiveModal('clientGain')
    },
    { 
      label: 'Total Revenue', 
      value: loading ? '...' : `₹${(stats?.revenue?.total ?? 0).toLocaleString('en-IN')}`, 
      gradient: 'from-emerald-400 to-emerald-500', 
      icon: 'trend',
      onClick: () => setActiveModal('schoolsList')
    },
    { 
      label: 'Total Partners', 
      value: loading ? '...' : (stats?.partners?.total ?? 0), 
      gradient: 'from-orange-400 to-orange-500', 
      icon: 'school',
      onClick: () => setActiveModal('studentsList')
    },
    { 
      label: 'Active Partners', 
      value: loading ? '...' : (stats?.partners?.active ?? 0), 
      gradient: 'from-purple-400 to-purple-500', 
      icon: 'box',
      onClick: () => setActiveModal('undeliveredClients')
    },
  ]

  const payments = [
    { label: 'Cash Received', value: '₹16,860.00', meta: 'As on 03/06/2026', borderColor: 'border-l-emerald-500' },
    { label: 'Online Received', value: '₹0.00', meta: 'As on 03/06/2026', borderColor: 'border-l-blue-500' },
    { label: 'Total Received', value: '₹16,860.00', meta: 'As on 03/06/2026', borderColor: 'border-l-purple-500' },
    { label: 'This Year Due', value: '₹710,699.00', meta: 'FY 2026-2027', borderColor: 'border-l-orange-500' },
  ]

  // Task Actions
  const handleAddTask = (taskData) => {
    addTask({
      task: taskData.task,
      priority: taskData.priority,
      status: taskData.status,
      dueDate: taskData.dueDate,
      assignee: taskData.assignee || 'Unassigned',
      createdBy: 'Admin'
    })
  }

  const handleToggleTask = (id) => {
    const task = tasks.find((t) => t.id === id)
    if (task) {
      updateTaskStatus(id, task.status === 'Completed' ? 'Pending' : 'Completed')
    }
  }

  const handleDeleteTask = (id) => {
    deleteTask(id)
  }

  return (
    <div className="space-y-6 select-none text-slate-700 animate-fade-in">
      
      {/* Refined Header: Title and Company info horizontally aligned */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/50 pb-4.5 gap-3">
        {/* Left Side: Page Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Dashboard</h1>

        {/* Center: Company Banner */}
        <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
          <CompanyHeader
            companyName="AIM Digitalise pvt. ltd."
            financialYear="2026-2027"
          />
        </div>

        {/* Right Side: Refresh Button */}
        <button
          onClick={fetchDashboardStats}
          disabled={loading}
          className="px-4 py-2 border border-slate-200 hover:border-[#38b34a] hover:bg-[#38b34a]/5 hover:text-[#38b34a] bg-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer text-slate-600 shadow-sm"
        >
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDashboardStats} className="text-xs font-bold underline hover:no-underline">Try Again</button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <StatCardsGrid stats={statCards} />

      {/* Payment and Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <PaymentCollection 
          payments={payments} 
          onDetailsClick={() => setActiveModal('paymentDetails')}
          onInvoicesClick={() => setActiveModal('dueInvoices')}
        />
        <SalesAnalytics
          title="Sales Analytics — FY 2025-26"
        />
      </div>

      {/* Top Products & Recent Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/35 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Top Selling Products</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Units Sold</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-slate-400">
                        Loading products...
                      </td>
                    </tr>
                  ) : stats?.top_products?.length > 0 ? (
                    stats.top_products.map((product, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-800">{product.product_name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold border border-blue-100 uppercase tracking-wider text-[9px]">
                            {product.product_category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{product.total_sold}</td>
                        <td className="px-4 py-3 text-right font-black text-[#38b34a]">
                          ₹{Number(product.total_revenue || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-slate-400 font-semibold">
                        No product sales recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activities Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/35 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Recent Activities</span>
            </h3>

            <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center py-6 text-slate-400">
                  Loading activity timeline...
                </div>
              ) : stats?.recent_activities?.length > 0 ? (
                stats.recent_activities.map((activity, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-start gap-4 hover:bg-slate-50/50 transition-colors rounded-lg px-2">
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <span>{activity.type === 'new_order' ? '📦 New Order' : '👤 New Partner'}</span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 rounded px-1 uppercase">
                          {activity.type === 'new_order' ? 'Order' : 'Partner'}
                        </span>
                      </p>
                      <p className="text-slate-500 text-[11px] font-medium leading-relaxed font-sans">
                        {activity.type === 'new_order' 
                          ? <><strong className="text-slate-700">{activity.client_name}</strong> purchased {activity.product_name}</>
                          : <><strong className="text-slate-700">{activity.partner_name}</strong> joined the network</>
                        }
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0 mt-0.5">
                      {new Date(activity.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 font-semibold text-xs">
                  No recent activities recorded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Todo Checklist */}
      <TodoList 
        todos={tasks} 
        onAddTask={() => setActiveModal('addTask')}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Modals Portals */}
      <ClientGainModal
        isOpen={activeModal === 'clientGain'}
        onClose={() => setActiveModal(null)}
      />
      <SchoolsListModal
        isOpen={activeModal === 'schoolsList'}
        onClose={() => setActiveModal(null)}
      />
      <StudentsListModal
        isOpen={activeModal === 'studentsList'}
        onClose={() => setActiveModal(null)}
      />
      <UndeliveredClientsModal
        isOpen={activeModal === 'undeliveredClients'}
        onClose={() => setActiveModal(null)}
      />
      <PaymentCollectionDetailsModal
        isOpen={activeModal === 'paymentDetails'}
        onClose={() => setActiveModal(null)}
      />
      <DuePaymentInvoicesModal
        isOpen={activeModal === 'dueInvoices'}
        onClose={() => setActiveModal(null)}
      />
      <AddTaskModal
        isOpen={activeModal === 'addTask'}
        onClose={() => setActiveModal(null)}
        onAdd={handleAddTask}
      />
    </div>
  )
}

export default AdminDashboard