import React, { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import * as employeeApi from '../../api/admin/employee'
import DepartmentModal from '../../components/admin/employee/DepartmentModal'
import DesignationModal from '../../components/admin/employee/DesignationModal'
import EmployeeModal from '../../components/admin/employee/EmployeeModal'
import EmployeeDetailsDrawer from '../../components/admin/employee/EmployeeDetailsDrawer'

// ═══════════════════════════════════════════════════════════════════════════════
// Demo data preserved for tabs without API endpoints (Leave, Attendance, Payslip)
// ═══════════════════════════════════════════════════════════════════════════════

const DUMMY_LEAVES = [
  { id: 201, emp_id: 'EMP-2026-001', name: 'Rohan Verma', type: 'Casual Leave', dates: '12 Jun 2026 to 14 Jun 2026', days: 3, reason: 'Family function at home town', status: 'Pending' },
  { id: 202, emp_id: 'EMP-2026-003', name: 'Aman Gupta', type: 'Sick Leave', dates: '15 Jun 2026', days: 1, reason: 'Severe viral fever and flu', status: 'Approved' },
  { id: 203, emp_id: 'EMP-2026-004', name: 'Neha Sharma', type: 'Earned Leave', dates: '22 Jun 2026 to 25 Jun 2026', days: 4, reason: 'Personal holiday trip', status: 'Pending' },
]

const DUMMY_ATTENDANCE = [
  { emp_id: 'EMP-2026-001', name: 'Rohan Verma', date: '2026-06-09', clock_in: '09:15 AM', clock_out: '06:30 PM', status: 'Present', hours: 9.25 },
  { emp_id: 'EMP-2026-002', name: 'Priya Singh', date: '2026-06-09', clock_in: '09:05 AM', clock_out: '06:00 PM', status: 'Present', hours: 8.92 },
  { emp_id: 'EMP-2026-003', name: 'Aman Gupta', date: '2026-06-09', clock_in: '09:45 AM', clock_out: '06:15 PM', status: 'Late', hours: 8.5 },
  { emp_id: 'EMP-2026-004', name: 'Neha Sharma', date: '2026-06-09', clock_in: '—', clock_out: '—', status: 'Absent', hours: 0 },
  { emp_id: 'EMP-2026-005', name: 'Vikram Malhotra', date: '2026-06-09', clock_in: '—', clock_out: '—', status: 'On Leave', hours: 0 },
]

const DUMMY_EMPLOYEES_FOR_PAYSLIP = [
  { id: 1, emp_id: 'EMP-2026-001', name: 'Rohan Verma', department: 'IT / Development', role: 'Software Engineer', joining_date: '2024-03-15', salary: 45000 },
  { id: 2, emp_id: 'EMP-2026-002', name: 'Priya Singh', department: 'HR & Operations', role: 'Senior HR Specialist', joining_date: '2023-08-10', salary: 38000 },
  { id: 3, emp_id: 'EMP-2026-003', name: 'Aman Gupta', department: 'Digital Marketing', role: 'SEO Team Lead', joining_date: '2025-01-05', salary: 32000 },
  { id: 4, emp_id: 'EMP-2026-004', name: 'Neha Sharma', department: 'UI/UX Design', role: 'Creative Director', joining_date: '2024-11-20', salary: 42000 },
  { id: 5, emp_id: 'EMP-2026-005', name: 'Vikram Malhotra', department: 'Finance & Accounts', role: 'Accounts Manager', joining_date: '2022-05-12', salary: 50000 },
]

// ═══════════════════════════════════════════════════════════════════════════════

const AdminEmployee = () => {
  const [activePageTab, setActivePageTab] = useState('emp_dashboard')

  // API-driven data
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [employees, setEmployees] = useState([])
  const [employeeStats, setEmployeeStats] = useState(null)

  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal states
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [editingDept, setEditingDept] = useState(null)
  const [showDesigModal, setShowDesigModal] = useState(false)
  const [editingDesig, setEditingDesig] = useState(null)
  const [showEmpModal, setShowEmpModal] = useState(false)
  const [editingEmp, setEditingEmp] = useState(null)
  const [viewingEmp, setViewingEmp] = useState(null)

  // Employee filters
  const [filters, setFilters] = useState({
    search: '',
    department_id: '',
    designation_id: '',
    employment_status: '',
  })

  // Demo data states (preserved)
  const [leaves, setLeaves] = useState(DUMMY_LEAVES)
  const [attendance, setAttendance] = useState(DUMMY_ATTENDANCE)

  // Payslip states (preserved)
  const [selectedEmpId, setSelectedEmpId] = useState(DUMMY_EMPLOYEES_FOR_PAYSLIP[0]?.emp_id || '')
  const [payslipMonth, setPayslipMonth] = useState('June')
  const [payslipYear, setPayslipYear] = useState('2026')
  const [lopDays, setLopDays] = useState(0)
  const [generatedPayslip, setGeneratedPayslip] = useState(null)

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════════════════════════════════

  const loadDepartments = useCallback(async () => {
    try {
      const res = await employeeApi.fetchDepartments()
      setDepartments(res.data || [])
    } catch (err) {
      console.error('Departments fetch error:', err)
    }
  }, [])

  const loadDesignations = useCallback(async () => {
    try {
      const res = await employeeApi.fetchDesignations()
      setDesignations(res.data || [])
    } catch (err) {
      console.error('Designations fetch error:', err)
    }
  }, [])

  const loadEmployees = useCallback(async (overrideFilters) => {
    try {
      const res = await employeeApi.fetchEmployees(overrideFilters || filters)
      setEmployees(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Employees fetch error:', err)
    }
  }, [filters])

  const loadEmployeeStats = useCallback(async () => {
    try {
      const res = await employeeApi.fetchEmployeeStats()
      setEmployeeStats(res.data || null)
    } catch (err) {
      console.error('Employee stats fetch error:', err)
    }
  }, [])

  // Initial data load
  useEffect(() => {
    loadDepartments()
    loadDesignations()
    loadEmployees()
    loadEmployeeStats()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss messages
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 5000)
      return () => clearTimeout(t)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 8000)
      return () => clearTimeout(t)
    }
  }, [error])

  // ═══════════════════════════════════════════════════════════════════════════
  // DEPARTMENT CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSaveDepartment = async (formData) => {
    setLoading(true)
    setError('')
    try {
      if (editingDept) {
        await employeeApi.updateDepartment(editingDept.id, formData)
        setSuccess('Department updated successfully!')
      } else {
        await employeeApi.createDepartment(formData)
        setSuccess('Department created successfully!')
      }
      setShowDeptModal(false)
      setEditingDept(null)
      loadDepartments()
      loadDesignations()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save department')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Delete this department? This will also delete all associated designations.')) return
    setLoading(true)
    try {
      await employeeApi.deleteDepartment(id)
      setSuccess('Department deleted!')
      loadDepartments()
      loadDesignations()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete department')
    } finally {
      setLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DESIGNATION CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSaveDesignation = async (formData) => {
    setLoading(true)
    setError('')
    try {
      if (editingDesig) {
        await employeeApi.updateDesignation(editingDesig.id, formData)
        setSuccess('Designation updated successfully!')
      } else {
        await employeeApi.createDesignation(formData)
        setSuccess('Designation created successfully!')
      }
      setShowDesigModal(false)
      setEditingDesig(null)
      loadDesignations()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save designation')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDesignation = async (id) => {
    if (!window.confirm('Delete this designation?')) return
    setLoading(true)
    try {
      await employeeApi.deleteDesignation(id)
      setSuccess('Designation deleted!')
      loadDesignations()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete designation')
    } finally {
      setLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPLOYEE CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSaveEmployee = async (formData) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (editingEmp) {
        await employeeApi.updateEmployee(editingEmp.id, formData)
        setSuccess('Employee updated successfully!')
      } else {
        const res = await employeeApi.createEmployee(formData)
        setSuccess(`Employee created! ID: ${res.data?.employee_id || ''}`)
      }
      setShowEmpModal(false)
      setEditingEmp(null)
      loadEmployees()
      loadEmployeeStats()
    } catch (err) {
      const errData = err.response?.data
      if (errData?.errors) {
        const msgs = Object.values(errData.errors).flat().join('\n')
        setError(`Validation failed:\n${msgs}`)
      } else {
        setError(errData?.message || err.message || 'Failed to save employee')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Delete this employee?')) return
    setLoading(true)
    try {
      await employeeApi.deleteEmployee(id)
      setSuccess('Employee deleted!')
      loadEmployees()
      loadEmployeeStats()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete employee')
    } finally {
      setLoading(false)
    }
  }

  const handleViewEmployee = async (id) => {
    try {
      const res = await employeeApi.fetchEmployeeById(id)
      setViewingEmp(res.data || null)
    } catch (err) {
      setError('Failed to fetch employee details')
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRESERVED DEMO HANDLERS (Leave, Attendance, Payslip)
  // ═══════════════════════════════════════════════════════════════════════════

  const handleLeaveAction = (id, newStatus) => {
    setLeaves(leaves.map(req => req.id === id ? { ...req, status: newStatus } : req))
  }

  const handleAttendanceChange = (empId, newStatus) => {
    let clockIn = '—'
    let clockOut = '—'
    let hours = 0
    if (newStatus === 'Present') { clockIn = '09:00 AM'; clockOut = '06:00 PM'; hours = 9.0 }
    else if (newStatus === 'Late') { clockIn = '09:45 AM'; clockOut = '06:00 PM'; hours = 8.25 }
    setAttendance(attendance.map(a => a.emp_id === empId ? { ...a, status: newStatus, clock_in: clockIn, clock_out: clockOut, hours } : a))
  }

  const handleGeneratePayslip = () => {
    const emp = DUMMY_EMPLOYEES_FOR_PAYSLIP.find(e => e.emp_id === selectedEmpId)
    if (!emp) return

    const basic = Math.round(emp.salary * 0.50)
    const hra = Math.round(emp.salary * 0.25)
    const allowance = Math.round(emp.salary * 0.15)
    const special = emp.salary - (basic + hra + allowance)
    const totalDays = 30
    const payableDays = Math.max(0, totalDays - Number(lopDays))
    const lopDeduction = Math.round((emp.salary / totalDays) * Number(lopDays))
    const pf = Math.min(1800, Math.round(basic * 0.12))
    const pt = emp.salary > 20000 ? 200 : 0
    const totalDeductions = pf + pt + lopDeduction
    const netPay = emp.salary - totalDeductions

    const netPayInWords = (num) => {
      const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ']
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
      if ((num = num.toString()).length > 9) return 'overflow'
      let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/)
      if (!n) return ''
      let str = ''
      str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : ''
      str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : ''
      str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : ''
      str += (Number(n[4]) !== 0) ? a[Number(n[4])] + 'Hundred ' : ''
      str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only'
      return str
    }

    setGeneratedPayslip({
      emp,
      month: payslipMonth,
      year: payslipYear,
      payableDays,
      lopDays,
      earnings: { basic, hra, allowance, special, total: emp.salary },
      deductions: { pf, pt, lopDeduction, total: totalDeductions },
      netPay,
      netPayInWords: netPayInWords(netPay)
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const getStatusStyle = (status) => {
    const map = {
      active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      inactive: 'bg-rose-100 text-rose-800 border-rose-200',
      terminated: 'bg-amber-100 text-amber-800 border-amber-200',
      resigned: 'bg-amber-100 text-amber-800 border-amber-200',
    }
    return map[status] || map.active
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <>
      <Helmet>
        <title>Employee Management | Admin Panel</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          <div>
            <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Employee Management</h1>
            <p className="text-xs text-slate-400 font-bold mt-1">Departments, designations, employee records, attendance and payroll</p>
          </div>

          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>

          <div className="w-48 flex justify-end">
            <span className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-[#38b34a] shadow-sm">
              🟢 Live API
            </span>
          </div>
        </div>

        {/* System Messages */}
        {success && (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-2">✅ {success}</span>
            <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-600 cursor-pointer text-lg">×</button>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-50 text-rose-700 text-sm font-bold flex items-center justify-between shadow-sm whitespace-pre-line">
            <span className="flex items-center gap-2">❌ {error}</span>
            <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-600 cursor-pointer text-lg">×</button>
          </div>
        )}

        {/* Main Workspace Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">

          {/* Tabs Navigation Row */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            {[
              { id: 'emp_dashboard', label: 'Dashboard' },
              { id: 'departments', label: 'Departments' },
              { id: 'designations', label: 'Designations' },
              { id: 'show_employee', label: 'Employees' },
              { id: 'employee_leave', label: 'Leave Requests' },
              { id: 'employee_attendance', label: 'Attendance Roster' },
              { id: 'payslip', label: 'Generate Payslip' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePageTab(tab.id)}
                className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                  activePageTab === tab.id
                    ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ═══════════ TAB: Dashboard ═══════════ */}
          {activePageTab === 'emp_dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Employees</span>
                    <span className="text-3xl font-black text-slate-800 mt-1.5 block">{employeeStats?.summary?.total_employees || 0}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 text-lg border border-blue-100">👥</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Employees</span>
                    <span className="text-3xl font-black text-emerald-600 mt-1.5 block">{employeeStats?.summary?.active_employees || 0}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{employeeStats?.summary?.active_percentage || 0}% of total</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 text-lg border border-emerald-100">✅</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Inactive</span>
                    <span className="text-3xl font-black text-rose-600 mt-1.5 block">{employeeStats?.summary?.inactive_employees || 0}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 text-lg border border-rose-100">⛔</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Departments</span>
                    <span className="text-3xl font-black text-purple-600 mt-1.5 block">{departments.length}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 text-lg border border-purple-100">🏢</div>
                </div>
              </div>

              {/* Department-wise Distribution */}
              {employeeStats?.by_department?.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                  <h3 className="text-sm font-black text-[#1e3e6b] mb-4">Employees by Department</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {employeeStats.by_department.map(dept => (
                      <div key={dept.id} className="p-3 bg-slate-50 rounded-xl border-l-4 border-blue-500">
                        <div className="text-xl font-black text-slate-800">{dept.employees_count}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{dept.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Joiners */}
              {employeeStats?.recent_joinees?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-black text-[#1e3e6b]">Recent Joiners</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="px-6 py-3">Employee ID</th>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Department</th>
                          <th className="px-6 py-3">Designation</th>
                          <th className="px-6 py-3">Joining Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                        {employeeStats.recent_joinees.map(emp => (
                          <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-3 font-mono font-bold text-slate-500">{emp.employee_id}</td>
                            <td className="px-6 py-3 font-bold text-slate-800">{emp.first_name} {emp.last_name}</td>
                            <td className="px-6 py-3">{emp.department?.name || '—'}</td>
                            <td className="px-6 py-3">{emp.designation?.name || '—'}</td>
                            <td className="px-6 py-3">{new Date(emp.joining_date).toLocaleDateString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!employeeStats && (
                <div className="text-center py-16 text-slate-400">
                  <span className="text-4xl block">📊</span>
                  <p className="font-bold mt-3">Loading dashboard data...</p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TAB: Departments ═══════════ */}
          {activePageTab === 'departments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-800">Departments ({departments.length})</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Organizational departments for employee classification</p>
                </div>
                <button
                  onClick={() => { setEditingDept(null); setShowDeptModal(true) }}
                  className="px-5 py-2.5 bg-[#38b34a] hover:bg-[#2e9e3e] text-white font-bold rounded-xl shadow-md text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add Department
                </button>
              </div>

              {departments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map(dept => (
                    <div key={dept.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-black text-slate-800 text-sm">{dept.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">Code: {dept.code || '—'}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          dept.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}>
                          {dept.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {dept.description && <p className="text-xs text-slate-500 font-medium mb-3 line-clamp-2">{dept.description}</p>}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400">
                          👥 {dept.employees_count || 0} Employees
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingDept(dept); setShowDeptModal(true) }}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 rounded-lg font-bold text-[10px] cursor-pointer transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(dept.id)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-lg font-bold text-[10px] cursor-pointer transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                  <span className="text-4xl block">🏢</span>
                  <p className="font-bold mt-3">No departments yet. Create your first department to get started.</p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TAB: Designations ═══════════ */}
          {activePageTab === 'designations' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-800">Designations ({designations.length})</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Role titles assigned under departments</p>
                </div>
                <button
                  onClick={() => { setEditingDesig(null); setShowDesigModal(true) }}
                  className="px-5 py-2.5 bg-[#38b34a] hover:bg-[#2e9e3e] text-white font-bold rounded-xl shadow-md text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add Designation
                </button>
              </div>

              {designations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {designations.map(desig => (
                    <div key={desig.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-black text-slate-800 text-sm">{desig.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">Code: {desig.code || '—'}</p>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold uppercase tracking-wide inline-block mt-1">
                            {desig.department?.name || '—'}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          desig.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}>
                          {desig.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {desig.description && <p className="text-xs text-slate-500 font-medium mb-3 line-clamp-2">{desig.description}</p>}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400">
                          👥 {desig.employees_count || 0} Employees
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingDesig(desig)
                              setShowDesigModal(true)
                            }}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 rounded-lg font-bold text-[10px] cursor-pointer transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDesignation(desig.id)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-lg font-bold text-[10px] cursor-pointer transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                  <span className="text-4xl block">🏷️</span>
                  <p className="font-bold mt-3">No designations yet. Create departments first, then add designations.</p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TAB: Show Employees ═══════════ */}
          {activePageTab === 'show_employee' && (
            <div className="space-y-6">
              {/* Top bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-800">Employees ({employees.length})</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">All employee records with CRUD operations</p>
                </div>
                <button
                  onClick={() => { setEditingEmp(null); setShowEmpModal(true) }}
                  className="px-5 py-2.5 bg-[#38b34a] hover:bg-[#2e9e3e] text-white font-bold rounded-xl shadow-md text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add Employee
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-grow w-full">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Search by name, ID, email..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-sans"
                  />
                </div>
                <select
                  value={filters.department_id}
                  onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#38b34a] font-sans min-w-[140px]"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                </select>
                <select
                  value={filters.designation_id}
                  onChange={(e) => setFilters({ ...filters, designation_id: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#38b34a] font-sans min-w-[140px]"
                >
                  <option value="">All Designations</option>
                  {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select
                  value={filters.employment_status}
                  onChange={(e) => setFilters({ ...filters, employment_status: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#38b34a] font-sans min-w-[120px]"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="terminated">Terminated</option>
                  <option value="resigned">Resigned</option>
                </select>
                <button
                  onClick={() => loadEmployees()}
                  className="px-5 py-2.5 bg-[#1e3e6b] hover:bg-[#152e52] text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shrink-0"
                >
                  Apply
                </button>
              </div>

              {/* Employee Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Emp ID</th>
                        <th className="px-6 py-4">Name & Contact</th>
                        <th className="px-6 py-4">Department & Role</th>
                        <th className="px-6 py-4">Joining Date</th>
                        <th className="px-6 py-4 text-right">Salary</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {employees.length > 0 ? (
                        employees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-slate-500">{emp.employee_id || `#${emp.id}`}</td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800 text-sm">{emp.first_name} {emp.last_name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{emp.email}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{emp.phone}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase tracking-wide block w-fit mb-1">
                                {emp.department?.name || '—'}
                              </span>
                              <p className="text-slate-500 font-bold text-xs">{emp.designation?.name || '—'}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td className="px-6 py-4 text-right font-black text-slate-800 text-sm">
                              {emp.current_salary ? `₹${Number(emp.current_salary).toLocaleString('en-IN')}` : '—'}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${getStatusStyle(emp.employment_status)}`}>
                                {emp.employment_status || 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex gap-1.5 justify-center">
                                <button
                                  onClick={() => handleViewEmployee(emp.id)}
                                  className="px-2.5 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-bold text-[10px] cursor-pointer transition-all"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => { setEditingEmp(emp); setShowEmpModal(true) }}
                                  className="px-2.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 rounded-lg font-bold text-[10px] cursor-pointer transition-all"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteEmployee(emp.id)}
                                  className="px-2.5 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-lg font-bold text-[10px] cursor-pointer transition-all"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-12 text-slate-400">
                            <span className="text-3xl block">👥</span>
                            <p className="font-bold mt-2">No employees found. Add your first employee or adjust filters.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB: Leave Requests (Demo Data — Preserved) ═══════════ */}
          {activePageTab === 'employee_leave' && (
            <div className="space-y-6">
              {/* Leave request status widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Requests</span>
                    <span className="text-3xl font-black text-amber-500 mt-1.5 block">
                      {leaves.filter(l => l.status === 'Pending').length}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 text-lg border border-amber-100">⏳</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Approved leaves</span>
                    <span className="text-3xl font-black text-emerald-500 mt-1.5 block">
                      {leaves.filter(l => l.status === 'Approved').length}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 text-lg border border-emerald-100">✅</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Rejected leaves</span>
                    <span className="text-3xl font-black text-rose-500 mt-1.5 block">
                      {leaves.filter(l => l.status === 'Rejected').length}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 text-lg border border-rose-100">❌</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Leave Type</th>
                        <th className="px-6 py-4">Dates</th>
                        <th className="px-6 py-4 text-center">Days</th>
                        <th className="px-6 py-4">Reason</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {leaves.length > 0 ? (
                        leaves.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800 text-sm">{req.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{req.emp_id}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-700 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] border ${
                                req.type === 'Sick Leave' ? 'bg-red-50 text-red-600 border-red-100' :
                                req.type === 'Casual Leave' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                'bg-teal-50 text-teal-600 border-teal-100'
                              }`}>
                                {req.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium">{req.dates}</td>
                            <td className="px-6 py-4 text-center font-black">{req.days}</td>
                            <td className="px-6 py-4 text-slate-500 font-medium max-w-xs truncate">"{req.reason}"</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                req.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                                'bg-amber-100 text-amber-800 border-amber-200'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {req.status === 'Pending' ? (
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleLeaveAction(req.id, 'Approved')}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer text-[10px]"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleLeaveAction(req.id, 'Rejected')}
                                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold cursor-pointer text-[10px]"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[10px]">Actioned</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-12 text-slate-400">
                            <p className="font-bold">No leave requests found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB: Attendance Roster (Demo Data — Preserved) ═══════════ */}
          {activePageTab === 'employee_attendance' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Attendance Register</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Review clock logs and adjust daily active presence codes</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 border rounded-lg px-3 py-1.5 shadow-sm">
                  📅 Today: {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Emp ID</th>
                        <th className="px-6 py-4">Employee Name</th>
                        <th className="px-6 py-4">Clock In</th>
                        <th className="px-6 py-4">Clock Out</th>
                        <th className="px-6 py-4 text-center">Hours Worked</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Set Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {attendance.map((record) => (
                        <tr key={record.emp_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-500">{record.emp_id}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-800">{record.name}</td>
                          <td className="px-6 py-4 font-mono text-slate-500 font-medium">{record.clock_in}</td>
                          <td className="px-6 py-4 font-mono text-slate-500 font-medium">{record.clock_out}</td>
                          <td className="px-6 py-4 text-center font-black text-slate-800">
                            {record.hours > 0 ? `${record.hours} hrs` : '—'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              record.status === 'Present' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                              record.status === 'Late' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                              record.status === 'Absent' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                              'bg-blue-100 text-blue-800 border-blue-200'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex rounded-md shadow-sm border border-slate-200 p-0.5 bg-slate-50">
                              {['Present', 'Late', 'Absent', 'On Leave'].map(st => (
                                <button
                                  key={st}
                                  onClick={() => handleAttendanceChange(record.emp_id, st)}
                                  className={`px-2 py-1 text-[9px] font-black rounded cursor-pointer transition-all ${
                                    record.status === st
                                      ? 'bg-[#1e3e6b] text-white shadow-sm'
                                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB: Generate Payslip (Demo Data — Preserved) ═══════════ */}
          {activePageTab === 'payslip' && (
            <div className="space-y-6">
              {/* Payslip Config form */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <span>💳</span>
                    <span>Payslip Generator Parameters</span>
                  </h4>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#ff6600]">Salary calculator</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Staff Employee</label>
                    <select
                      value={selectedEmpId}
                      onChange={e => setSelectedEmpId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#38b34a] font-sans font-bold text-slate-700"
                    >
                      {DUMMY_EMPLOYEES_FOR_PAYSLIP.map(emp => (
                        <option key={emp.emp_id} value={emp.emp_id}>
                          {emp.name} ({emp.emp_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Salary Month</label>
                    <select
                      value={payslipMonth}
                      onChange={e => setPayslipMonth(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#38b34a] font-sans font-bold text-slate-700"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Loss of Pay (LOP) Days</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={lopDays}
                      onChange={e => setLopDays(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#38b34a] font-sans font-bold text-slate-700"
                    />
                  </div>

                  <div>
                    <button
                      onClick={handleGeneratePayslip}
                      className="w-full py-2 bg-[#1e3e6b] text-white hover:bg-[#152e52] rounded-xl font-bold transition-all text-xs uppercase cursor-pointer"
                    >
                      Generate Slip
                    </button>
                  </div>
                </div>
              </div>

              {/* Printable Payslip Render */}
              {generatedPayslip ? (
                <div className="bg-white border border-slate-300 rounded-2xl shadow-lg p-8 max-w-3xl mx-auto font-sans text-slate-800 relative select-text" id="payslip-print-area">
                  
                  {/* Decorative badge print trigger */}
                  <div className="absolute top-5 right-5 print:hidden">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      🖨️ Print Slip
                    </button>
                  </div>

                  {/* Corporate Header */}
                  <div className="text-center pb-6 border-b-2 border-slate-300">
                    <h2 className="text-2xl font-black text-[#1e3e6b] tracking-wider">AIM DIGITALISE PVT. LTD.</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">2nd Floor, Technopolis Tower, Sector V, Salt Lake, Kolkata - 700091</p>
                    <h3 className="text-xs font-black bg-slate-100 text-[#ff6600] py-1 px-4 rounded-full w-fit mx-auto mt-4 tracking-widest uppercase">
                      Salary Slip for the Month of {generatedPayslip.month} {generatedPayslip.year}
                    </h3>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-2 gap-x-12 gap-y-3 py-6 border-b border-slate-200 text-xs font-semibold">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400 uppercase text-[10px]">Employee Name:</span>
                      <span className="text-slate-800 font-black">{generatedPayslip.emp.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400 uppercase text-[10px]">Employee ID:</span>
                      <span className="text-slate-800 font-black">{generatedPayslip.emp.emp_id}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400 uppercase text-[10px]">Designation:</span>
                      <span className="text-slate-600">{generatedPayslip.emp.role}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400 uppercase text-[10px]">Department:</span>
                      <span className="text-slate-600">{generatedPayslip.emp.department}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400 uppercase text-[10px]">Joining Date:</span>
                      <span className="text-slate-600">{new Date(generatedPayslip.emp.joining_date).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400 uppercase text-[10px]">LOP / Payable Days:</span>
                      <span className="text-slate-800 font-black">{generatedPayslip.lopDays} Days / {generatedPayslip.payableDays} Days</span>
                    </div>
                  </div>

                  {/* Calculations Table */}
                  <div className="grid grid-cols-2 border border-slate-300 mt-4 text-xs font-semibold">
                    {/* Column 1: Earnings */}
                    <div className="border-r border-slate-300">
                      <div className="bg-slate-50 border-b border-slate-300 px-4 py-2 font-black uppercase text-slate-500 tracking-wider">Earnings</div>
                      <div className="divide-y divide-slate-100 px-4 py-2 space-y-2 text-slate-700">
                        <div className="flex justify-between py-1"><span>Basic Salary</span><span>₹{generatedPayslip.earnings.basic.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between py-1"><span>House Rent Allowance (HRA)</span><span>₹{generatedPayslip.earnings.hra.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between py-1"><span>Conveyance Allowance</span><span>₹{generatedPayslip.earnings.allowance.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between py-1"><span>Special Allowance</span><span>₹{generatedPayslip.earnings.special.toLocaleString('en-IN')}</span></div>
                      </div>
                    </div>
                    {/* Column 2: Deductions */}
                    <div>
                      <div className="bg-slate-50 border-b border-slate-300 px-4 py-2 font-black uppercase text-slate-500 tracking-wider">Deductions</div>
                      <div className="divide-y divide-slate-100 px-4 py-2 space-y-2 text-slate-700">
                        <div className="flex justify-between py-1"><span>Provident Fund (PF)</span><span>₹{generatedPayslip.deductions.pf.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between py-1"><span>Professional Tax (PT)</span><span>₹{generatedPayslip.deductions.pt.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between py-1 text-rose-600"><span>LOP Deductions</span><span>₹{generatedPayslip.deductions.lopDeduction.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between py-1 text-slate-400"><span>Other / TDS</span><span>₹0</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Totals Row */}
                  <div className="grid grid-cols-2 border-x border-b border-slate-300 text-xs font-black bg-slate-50">
                    <div className="border-r border-slate-300 px-4 py-2.5 flex justify-between text-[#1e3e6b]">
                      <span>Gross Earnings</span>
                      <span>₹{generatedPayslip.earnings.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="px-4 py-2.5 flex justify-between text-rose-600">
                      <span>Total Deductions</span>
                      <span>₹{generatedPayslip.deductions.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Net Pay Box */}
                  <div className="mt-6 border-2 border-[#1e3e6b] bg-blue-50/50 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Net Payable Salary (In Words)</span>
                      <p className="text-xs text-slate-700 font-bold capitalize mt-1 italic">
                        {generatedPayslip.netPayInWords}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Net Take-Home Pay</span>
                      <p className="text-2xl font-black text-[#1e3e6b] mt-0.5">
                        ₹{generatedPayslip.netPay.toLocaleString('en-IN')}.00
                      </p>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="mt-12 flex justify-between items-end text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <div>
                      <div className="w-40 border-b border-slate-300 pb-12 mb-2"></div>
                      <span>Employee Signature</span>
                    </div>
                    <div>
                      <div className="w-40 border-b border-slate-300 pb-12 mb-2 font-mono text-[9px] text-slate-500 italic flex items-center justify-center">
                        AIM Operations Team
                      </div>
                      <span>Authorised HR Signatory</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl max-w-md mx-auto">
                  <span className="text-5xl block">💳</span>
                  <p className="font-bold mt-3">Select employee parameters above and click "Generate Slip" to render printable PDF payroll receipt.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ═══════════ MODALS & DRAWERS ═══════════ */}

      {/* Department Modal */}
      {showDeptModal && (
        <DepartmentModal
          isOpen={showDeptModal}
          onClose={() => { setShowDeptModal(false); setEditingDept(null) }}
          onSave={handleSaveDepartment}
          editingDepartment={editingDept}
          loading={loading}
        />
      )}

      {/* Designation Modal */}
      {showDesigModal && (
        <DesignationModal
          isOpen={showDesigModal}
          onClose={() => { setShowDesigModal(false); setEditingDesig(null) }}
          onSave={handleSaveDesignation}
          editingDesignation={editingDesig}
          departments={departments}
          loading={loading}
        />
      )}

      {/* Employee Modal */}
      {showEmpModal && (
        <EmployeeModal
          isOpen={showEmpModal}
          onClose={() => { setShowEmpModal(false); setEditingEmp(null) }}
          onSave={handleSaveEmployee}
          editingEmployee={editingEmp}
          departments={departments}
          designations={designations}
          loading={loading}
        />
      )}

      {/* Employee Details Drawer */}
      {viewingEmp && (
        <EmployeeDetailsDrawer
          employee={viewingEmp}
          onClose={() => setViewingEmp(null)}
        />
      )}
    </>
  )
}

export default AdminEmployee
