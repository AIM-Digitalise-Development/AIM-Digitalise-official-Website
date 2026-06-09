import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'

const DUMMY_EMPLOYEES = [
  { id: 1, emp_id: 'EMP-2026-001', name: 'Rohan Verma', email: 'rohan.v@aimdigitalise.com', phone: '+91 98765 43210', department: 'IT / Development', role: 'Software Engineer', joining_date: '2024-03-15', salary: 45000, is_active: true },
  { id: 2, emp_id: 'EMP-2026-002', name: 'Priya Singh', email: 'priya.s@aimdigitalise.com', phone: '+91 91234 56789', department: 'HR & Operations', role: 'Senior HR Specialist', joining_date: '2023-08-10', salary: 38000, is_active: true },
  { id: 3, emp_id: 'EMP-2026-003', name: 'Aman Gupta', email: 'aman.g@aimdigitalise.com', phone: '+91 87654 32109', department: 'Digital Marketing', role: 'SEO Team Lead', joining_date: '2025-01-05', salary: 32000, is_active: true },
  { id: 4, emp_id: 'EMP-2026-004', name: 'Neha Sharma', email: 'neha.s@aimdigitalise.com', phone: '+91 76543 21098', department: 'UI/UX Design', role: 'Creative Director', joining_date: '2024-11-20', salary: 42000, is_active: true },
  { id: 5, emp_id: 'EMP-2026-005', name: 'Vikram Malhotra', email: 'vikram.m@aimdigitalise.com', phone: '+91 65432 10987', department: 'Finance & Accounts', role: 'Accounts Manager', joining_date: '2022-05-12', salary: 50000, is_active: true },
]

const DUMMY_LEFTOUT_EMPLOYEES = [
  { id: 101, emp_id: 'EMP-2024-098', name: 'Sunil Kumar', email: 'sunil.k@gmail.com', department: 'IT / Development', role: 'Frontend Intern', exit_date: '2026-04-30', reason: 'Higher Studies', ff_status: 'Settled' },
  { id: 102, emp_id: 'EMP-2023-042', name: 'Aarav Shah', email: 'aarav.shah@yahoo.com', department: 'Digital Marketing', role: 'Content Writer', exit_date: '2026-02-15', reason: 'Better Opportunities', ff_status: 'Processing' },
]

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

const AdminEmployee = () => {
  const [activePageTab, setActivePageTab] = useState('show_employee')
  
  // Interactive lists states
  const [employees, setEmployees] = useState(DUMMY_EMPLOYEES)
  const [leftouts, setLeftouts] = useState(DUMMY_LEFTOUT_EMPLOYEES)
  const [leaves, setLeaves] = useState(DUMMY_LEAVES)
  const [attendance, setAttendance] = useState(DUMMY_ATTENDANCE)
  
  // Forms & Selections states
  const [search, setSearch] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  
  // New employee form state
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'IT / Development',
    joining_date: '',
    salary: '',
  })

  // Payslip generator states
  const [selectedEmpId, setSelectedEmpId] = useState(DUMMY_EMPLOYEES[0]?.emp_id || '')
  const [payslipMonth, setPayslipMonth] = useState('June')
  const [payslipYear, setPayslipYear] = useState('2026')
  const [lopDays, setLopDays] = useState(0)
  const [generatedPayslip, setGeneratedPayslip] = useState(null)

  // Filter active employees
  const filteredEmployees = employees.filter((emp) => {
    return (
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.emp_id.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase())
    )
  })

  // Handle Add Employee Form Submit
  const handleAddEmployee = (e) => {
    e.preventDefault()
    if (!newEmp.name || !newEmp.email || !newEmp.role || !newEmp.salary) return

    const nextId = employees.length + leftouts.length + 1
    const padId = String(nextId).padStart(3, '0')
    const empObj = {
      id: Date.now(),
      emp_id: `EMP-2026-${padId}`,
      name: newEmp.name,
      email: newEmp.email,
      phone: newEmp.phone || '+91 XXXXX XXXXX',
      department: newEmp.department,
      role: newEmp.role,
      joining_date: newEmp.joining_date || new Date().toISOString().split('T')[0],
      salary: Number(newEmp.salary),
      is_active: true,
    }

    setEmployees([empObj, ...employees])
    
    // Add default attendance entry for today
    const newAtt = {
      emp_id: empObj.emp_id,
      name: empObj.name,
      date: new Date().toISOString().split('T')[0],
      clock_in: '—',
      clock_out: '—',
      status: 'Absent',
      hours: 0,
    }
    setAttendance([newAtt, ...attendance])

    setSuccessMsg(`Employee ${newEmp.name} added successfully with ID: ${empObj.emp_id}!`)
    setNewEmp({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: 'IT / Development',
      joining_date: '',
      salary: '',
    })

    setTimeout(() => setSuccessMsg(''), 5000)
    // Switch to show employee tab to see the change
    setActivePageTab('show_employee')
  }

  // Handle Deactivate / Leftout Action
  const handleDeactivateEmployee = (emp) => {
    if (window.confirm(`Are you sure you want to terminate/deactivate ${emp.name}?`)) {
      setEmployees(employees.filter(e => e.id !== emp.id))
      const leftObj = {
        id: emp.id,
        emp_id: emp.emp_id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        role: emp.role,
        exit_date: new Date().toISOString().split('T')[0],
        reason: 'Resigned / Released',
        ff_status: 'Processing'
      }
      setLeftouts([leftObj, ...leftouts])
      setAttendance(attendance.filter(a => a.emp_id !== emp.emp_id))
    }
  }

  // Handle Leave Status Update
  const handleLeaveAction = (id, newStatus) => {
    setLeaves(leaves.map(req => req.id === id ? { ...req, status: newStatus } : req))
  }

  // Handle Attendance Change
  const handleAttendanceChange = (empId, newStatus) => {
    let clockIn = '—'
    let clockOut = '—'
    let hours = 0

    if (newStatus === 'Present') {
      clockIn = '09:00 AM'
      clockOut = '06:00 PM'
      hours = 9.0
    } else if (newStatus === 'Late') {
      clockIn = '09:45 AM'
      clockOut = '06:00 PM'
      hours = 8.25
    }

    setAttendance(attendance.map(a => a.emp_id === empId ? { ...a, status: newStatus, clock_in: clockIn, clock_out: clockOut, hours } : a))
  }

  // Generate Payslip Calculation
  const handleGeneratePayslip = () => {
    const emp = employees.find(e => e.emp_id === selectedEmpId)
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
      // Basic translation for demo presentation
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
            <p className="text-xs text-slate-400 font-bold mt-1">Configure staff directory, leave status, attendance and generate pay records</p>
          </div>

          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>

          <div className="w-48 flex justify-end">
            <span className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-[#38b34a] shadow-sm">
              🟢 Live Demo Data
            </span>
          </div>
        </div>

        {/* System Messages */}
        {successMsg && (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center justify-between shadow-sm animate-pulse">
            <span className="flex items-center gap-2">✅ {successMsg}</span>
          </div>
        )}

        {/* Main Workspace Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
          
          {/* Tabs Navigation Row */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            {[
              { id: 'show_employee', label: 'Show Employees' },
              { id: 'add_employee', label: 'Add Employee' },
              { id: 'leftout_employee', label: 'Leftout Employees' },
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

          {/* TAB 1: Show Employee list */}
          {activePageTab === 'show_employee' && (
            <div className="space-y-6">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Employees</span>
                    <span className="text-3xl font-black text-slate-800 mt-1.5 block">{employees.length}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 text-lg border border-blue-100">💻</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Departments</span>
                    <span className="text-3xl font-black text-purple-500 mt-1.5 block">5</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 text-lg border border-purple-100">🏢</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Monthly Payroll</span>
                    <span className="text-3xl font-black text-[#ff6600] mt-1.5 block">
                      ₹{employees.reduce((acc, curr) => acc + curr.salary, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 text-lg border border-orange-100">💰</div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by Employee ID, name, email, department, or role..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Table wrapper */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Emp ID</th>
                        <th className="px-6 py-4">Name & Contact</th>
                        <th className="px-6 py-4">Department & Role</th>
                        <th className="px-6 py-4">Joining Date</th>
                        <th className="px-6 py-4 text-right">Gross Salary (Monthly)</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-slate-500">{emp.emp_id}</td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800 text-sm">{emp.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{emp.email}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{emp.phone}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase tracking-wide block w-fit mb-1">
                                {emp.department}
                              </span>
                              <p className="text-slate-500 font-bold text-xs">{emp.role}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{new Date(emp.joining_date).toLocaleDateString('en-IN')}</td>
                            <td className="px-6 py-4 text-right font-black text-slate-800 text-sm">₹{emp.salary.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider bg-emerald-100 text-emerald-800 border-emerald-200">
                                Active
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleDeactivateEmployee(emp)}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-lg font-bold transition-all text-[11px] cursor-pointer"
                              >
                                Release / Exit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-12 text-slate-400">
                            <span className="text-3xl block">👥</span>
                            <p className="font-bold mt-2">No active employees found matching search</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Add Employee */}
          {activePageTab === 'add_employee' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-800">Add New Employee Profile</h3>
                <span className="text-xs text-slate-400 font-medium">Create user record in corporate registry</span>
              </div>

              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Employee Name *</label>
                    <input
                      type="text"
                      required
                      value={newEmp.name}
                      onChange={e => setNewEmp({...newEmp, name: e.target.value})}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#38b34a] font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Corporate Email *</label>
                    <input
                      type="email"
                      required
                      value={newEmp.email}
                      onChange={e => setNewEmp({...newEmp, email: e.target.value})}
                      placeholder="e.g. rahul.s@aimdigitalise.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#38b34a] font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={newEmp.phone}
                      onChange={e => setNewEmp({...newEmp, phone: e.target.value})}
                      placeholder="e.g. +91 99887 76655"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#38b34a] font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Designation Role *</label>
                    <input
                      type="text"
                      required
                      value={newEmp.role}
                      onChange={e => setNewEmp({...newEmp, role: e.target.value})}
                      placeholder="e.g. Frontend Developer"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#38b34a] font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
                    <select
                      value={newEmp.department}
                      onChange={e => setNewEmp({...newEmp, department: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#38b34a] font-sans"
                    >
                      <option value="IT / Development">IT / Development</option>
                      <option value="HR & Operations">HR & Operations</option>
                      <option value="Digital Marketing">Digital Marketing</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Finance & Accounts">Finance & Accounts</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Joining Date</label>
                    <input
                      type="date"
                      value={newEmp.joining_date}
                      onChange={e => setNewEmp({...newEmp, joining_date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#38b34a] font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gross Salary (Monthly) *</label>
                    <input
                      type="number"
                      required
                      value={newEmp.salary}
                      onChange={e => setNewEmp({...newEmp, salary: e.target.value})}
                      placeholder="INR Amount (e.g. 40000)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#38b34a] font-sans"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#38b34a] hover:bg-[#2e9e3e] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-xs uppercase cursor-pointer"
                  >
                    Submit Record
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Leftout Employees */}
          {activePageTab === 'leftout_employee' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Exit registry / Former Employees</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Staff members who resigned, completed tenure, or exited the company</p>
                </div>
                <span className="text-xs bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-500 font-bold">
                  Exited Staff: {leftouts.length}
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Emp ID</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Exit Department & Role</th>
                        <th className="px-6 py-4">Exit Date</th>
                        <th className="px-6 py-4">Reason for Leaving</th>
                        <th className="px-6 py-4 text-center">F&F Settlement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {leftouts.length > 0 ? (
                        leftouts.map((emp) => (
                          <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-slate-400">{emp.emp_id}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-800">{emp.name}</td>
                            <td className="px-6 py-4">
                              <p className="text-slate-600 font-bold">{emp.role}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{emp.department}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{new Date(emp.exit_date).toLocaleDateString('en-IN')}</td>
                            <td className="px-6 py-4 text-slate-600 font-medium italic">"{emp.reason}"</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                emp.ff_status === 'Settled'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-200'
                              }`}>
                                {emp.ff_status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-12 text-slate-400">
                            <p className="font-bold">No former employees recorded in exit registry</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Leave Requests */}
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

          {/* TAB 5: Attendance Roster */}
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

          {/* TAB 6: Generate Payslip */}
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
                      {employees.map(emp => (
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
                        <div className="flex justify-between py-1">
                          <span>Basic Salary</span>
                          <span>₹{generatedPayslip.earnings.basic.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>House Rent Allowance (HRA)</span>
                          <span>₹{generatedPayslip.earnings.hra.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Conveyance Allowance</span>
                          <span>₹{generatedPayslip.earnings.allowance.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Special Allowance</span>
                          <span>₹{generatedPayslip.earnings.special.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Deductions */}
                    <div>
                      <div className="bg-slate-50 border-b border-slate-300 px-4 py-2 font-black uppercase text-slate-500 tracking-wider">Deductions</div>
                      <div className="divide-y divide-slate-100 px-4 py-2 space-y-2 text-slate-700">
                        <div className="flex justify-between py-1">
                          <span>Provident Fund (PF)</span>
                          <span>₹{generatedPayslip.deductions.pf.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Professional Tax (PT)</span>
                          <span>₹{generatedPayslip.deductions.pt.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-1 text-rose-600">
                          <span>LOP Deductions</span>
                          <span>₹{generatedPayslip.deductions.lopDeduction.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-400">
                          <span>Other / TDS</span>
                          <span>₹0</span>
                        </div>
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
    </>
  )
}

export default AdminEmployee
