import React, { useState } from 'react'
import StatCardsGrid from '../../components/admin/dashboard/StatCardsGrid'
import CompanyHeader from '../../components/admin/dashboard/CompanyHeader'
import PaymentCollection from '../../components/admin/dashboard/PaymentCollection'
import SalesAnalytics from '../../components/admin/dashboard/SalesAnalytics'
import TodoList from '../../components/admin/dashboard/TodoList'

// Modals
import ClientGainModal from '../../components/admin/dashboard/ClientGainModal'
import SchoolsListModal from '../../components/admin/dashboard/SchoolsListModal'
import StudentsListModal from '../../components/admin/dashboard/StudentsListModal'
import UndeliveredClientsModal from '../../components/admin/dashboard/UndeliveredClientsModal'
import PaymentCollectionDetailsModal from '../../components/admin/dashboard/PaymentCollectionDetailsModal'
import DuePaymentInvoicesModal from '../../components/admin/dashboard/DuePaymentInvoicesModal'
import AddTaskModal from '../../components/admin/dashboard/AddTaskModal'

const AdminDashboard = () => {
  // Modal state: 'clientGain' | 'schoolsList' | 'studentsList' | 'undeliveredClients' | 'paymentDetails' | 'dueInvoices' | 'addTask' | null
  const [activeModal, setActiveModal] = useState(null)

  // Interactive local checklist state
  const [todos, setTodos] = useState([
    { id: 1, task: 'Follow up with GREENWOOD for subscription AMC signature', status: 'Pending', priority: 'High' },
    { id: 2, task: 'Complete custom offline node backup verification for Bright Minds', status: 'Overdue', priority: 'Medium' },
    { id: 3, task: 'Publish updated play store app for St. Xavier High School', status: 'Completed', priority: 'Low' },
  ])

  const statCards = [
    { 
      label: 'Monthly Client Gain', 
      value: 22, 
      gradient: 'from-blue-400 to-blue-500', 
      icon: 'trend',
      onClick: () => setActiveModal('clientGain')
    },
    { 
      label: 'Total Schools', 
      value: 22, 
      gradient: 'from-emerald-400 to-emerald-500', 
      icon: 'school',
      onClick: () => setActiveModal('schoolsList')
    },
    { 
      label: 'Total Students', 
      value: '4,656', 
      gradient: 'from-orange-400 to-orange-500', 
      icon: 'student',
      onClick: () => setActiveModal('studentsList')
    },
    { 
      label: 'Undelivered Clients', 
      value: 23, 
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
    const newTodo = {
      id: Date.now(),
      ...taskData
    }
    setTodos((prev) => [newTodo, ...prev])
  }

  const handleToggleTask = (id) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' }
          : t
      )
    )
  }

  const handleDeleteTask = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-6">
      
      {/* Refined Header: Title and Company info horizontally aligned */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between select-none border-b border-slate-200/50 pb-4.5 gap-3">
        {/* Left Side: Page Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Dashboard</h1>

        {/* Center: Company Banner */}
        <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
          <CompanyHeader
            companyName="AIM Digitalise pvt. ltd."
            financialYear="2026-2027"
          />
        </div>

        {/* Right Side: date or spacer */}
        <div className="hidden md:block w-24" />
      </div>

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

      {/* Todo Checklist */}
      <TodoList 
        todos={todos} 
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