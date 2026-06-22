import { useState } from 'react'

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  alternate_phone: '',
  dob: '',
  gender: 'male',
  current_address: '',
  permanent_address: '',
  aadhar_number: '',
  bank_name: '',
  account_number: '',
  ifsc_code: '',
  upi_id: '',
  pan_number: '',
  department_id: '',
  designation_id: '',
  joining_date: '',
  confirmation_date: '',
  last_company_name: '',
  last_company_designation: '',
  last_company_joining_date: '',
  last_company_leaving_date: '',
  last_company_remarks: '',
  current_salary: '',
  office_start_time: '09:00',
  office_end_time: '18:00',
}

const SectionHeader = ({ icon, title, isOpen, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between py-2 px-1 cursor-pointer group"
  >
    <div className="flex items-center gap-2">
      <span className="text-base">{icon}</span>
      <span className="text-xs font-black text-[#1e3e6b] uppercase tracking-wider">{title}</span>
    </div>
    <svg
      className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
)

const FormField = ({ label, required, children }) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
)

const inputClass = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-sans'

const EmployeeModal = ({ isOpen, onClose, onSave, editingEmployee, departments, designations, loading }) => {
  const [form, setForm] = useState(() => {
    if (editingEmployee) {
      return {
        first_name: editingEmployee.first_name || '',
        last_name: editingEmployee.last_name || '',
        email: editingEmployee.email || '',
        phone: editingEmployee.phone || '',
        alternate_phone: editingEmployee.alternate_phone || '',
        dob: editingEmployee.dob?.split('T')[0] || '',
        gender: editingEmployee.gender || 'male',
        current_address: editingEmployee.current_address || '',
        permanent_address: editingEmployee.permanent_address || '',
        aadhar_number: editingEmployee.aadhar_number || '',
        bank_name: editingEmployee.bank_name || '',
        account_number: editingEmployee.account_number || '',
        ifsc_code: editingEmployee.ifsc_code || '',
        upi_id: editingEmployee.upi_id || '',
        pan_number: editingEmployee.pan_number || '',
        department_id: editingEmployee.department_id || '',
        designation_id: editingEmployee.designation_id || '',
        joining_date: editingEmployee.joining_date?.split('T')[0] || '',
        confirmation_date: editingEmployee.confirmation_date?.split('T')[0] || '',
        last_company_name: editingEmployee.last_company_name || '',
        last_company_designation: editingEmployee.last_company_designation || '',
        last_company_joining_date: editingEmployee.last_company_joining_date?.split('T')[0] || '',
        last_company_leaving_date: editingEmployee.last_company_leaving_date?.split('T')[0] || '',
        last_company_remarks: editingEmployee.last_company_remarks || '',
        current_salary: editingEmployee.current_salary || '',
        office_start_time: editingEmployee.office_start_time || '09:00',
        office_end_time: editingEmployee.office_end_time || '18:00',
      }
    }
    return { ...EMPTY_FORM }
  })

  const [openSections, setOpenSections] = useState({
    personal: true,
    address: true,
    identity: false,
    employment: true,
    previous: false,
  })

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Filter designations by selected department
  const filteredDesignations = form.department_id
    ? designations.filter((d) => String(d.department_id) === String(form.department_id))
    : designations

  const handleSubmit = (e) => {
    e.preventDefault()

    // Format dates to YYYY-MM-DD
    const payload = { ...form }
    const dateFields = ['dob', 'joining_date', 'confirmation_date', 'last_company_joining_date', 'last_company_leaving_date']
    dateFields.forEach((f) => {
      if (payload[f]) {
        payload[f] = new Date(payload[f]).toISOString().split('T')[0]
      }
    })
    if (payload.current_salary) {
      payload.current_salary = parseFloat(payload.current_salary)
    }

    onSave(payload)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-lg font-black text-[#1e3e6b]">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {editingEmployee ? `Editing: ${editingEmployee.first_name} ${editingEmployee.last_name}` : 'Fill in employee details across all sections'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">

          {/* ═══ Personal Information ═══ */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <SectionHeader icon="👤" title="Personal Information" isOpen={openSections.personal} onToggle={() => toggleSection('personal')} />
            {openSections.personal && (
              <div className="px-3 pb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="First Name" required>
                    <input type="text" required value={form.first_name} onChange={(e) => update('first_name', e.target.value)} placeholder="e.g. Rohan" className={inputClass} />
                  </FormField>
                  <FormField label="Last Name" required>
                    <input type="text" required value={form.last_name} onChange={(e) => update('last_name', e.target.value)} placeholder="e.g. Verma" className={inputClass} />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Email" required>
                    <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="e.g. rohan@aimdigitalise.com" className={inputClass} />
                  </FormField>
                  <FormField label="Phone" required>
                    <input type="text" required value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="e.g. 9876543210" className={inputClass} />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField label="Alternate Phone">
                    <input type="text" value={form.alternate_phone} onChange={(e) => update('alternate_phone', e.target.value)} placeholder="Optional" className={inputClass} />
                  </FormField>
                  <FormField label="Date of Birth" required>
                    <input type="date" required value={form.dob} onChange={(e) => update('dob', e.target.value)} className={inputClass} />
                  </FormField>
                  <FormField label="Gender" required>
                    <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className={inputClass}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FormField>
                </div>
              </div>
            )}
          </div>

          {/* ═══ Address ═══ */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <SectionHeader icon="📍" title="Address Details" isOpen={openSections.address} onToggle={() => toggleSection('address')} />
            {openSections.address && (
              <div className="px-3 pb-4 space-y-3">
                <FormField label="Current Address" required>
                  <textarea required value={form.current_address} onChange={(e) => update('current_address', e.target.value)} placeholder="Current residential address" rows="2" className={`${inputClass} resize-none`} />
                </FormField>
                <FormField label="Permanent Address">
                  <textarea value={form.permanent_address} onChange={(e) => update('permanent_address', e.target.value)} placeholder="Permanent address (if different)" rows="2" className={`${inputClass} resize-none`} />
                </FormField>
              </div>
            )}
          </div>

          {/* ═══ Identity & Bank ═══ */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <SectionHeader icon="🏦" title="Identity & Bank Details" isOpen={openSections.identity} onToggle={() => toggleSection('identity')} />
            {openSections.identity && (
              <div className="px-3 pb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Aadhar Number">
                    <input type="text" value={form.aadhar_number} onChange={(e) => update('aadhar_number', e.target.value)} placeholder="12-digit Aadhar" className={inputClass} />
                  </FormField>
                  <FormField label="PAN Number">
                    <input type="text" value={form.pan_number} onChange={(e) => update('pan_number', e.target.value)} placeholder="e.g. ABCDE1234F" className={inputClass} />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Bank Name">
                    <input type="text" value={form.bank_name} onChange={(e) => update('bank_name', e.target.value)} placeholder="e.g. State Bank of India" className={inputClass} />
                  </FormField>
                  <FormField label="Account Number">
                    <input type="text" value={form.account_number} onChange={(e) => update('account_number', e.target.value)} placeholder="Bank account number" className={inputClass} />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="IFSC Code">
                    <input type="text" value={form.ifsc_code} onChange={(e) => update('ifsc_code', e.target.value)} placeholder="e.g. SBIN0001234" className={inputClass} />
                  </FormField>
                  <FormField label="UPI ID">
                    <input type="text" value={form.upi_id} onChange={(e) => update('upi_id', e.target.value)} placeholder="e.g. name@upi" className={inputClass} />
                  </FormField>
                </div>
              </div>
            )}
          </div>

          {/* ═══ Employment Details ═══ */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <SectionHeader icon="💼" title="Employment Details" isOpen={openSections.employment} onToggle={() => toggleSection('employment')} />
            {openSections.employment && (
              <div className="px-3 pb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Department" required>
                    <select
                      required
                      value={form.department_id}
                      onChange={(e) => update('department_id', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Designation" required>
                    <select
                      required
                      value={form.designation_id}
                      onChange={(e) => update('designation_id', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select Designation</option>
                      {filteredDesignations.map((desig) => (
                        <option key={desig.id} value={desig.id}>{desig.name}</option>
                      ))}
                    </select>
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField label="Joining Date" required>
                    <input type="date" required value={form.joining_date} onChange={(e) => update('joining_date', e.target.value)} className={inputClass} />
                  </FormField>
                  <FormField label="Confirmation Date">
                    <input type="date" value={form.confirmation_date} onChange={(e) => update('confirmation_date', e.target.value)} className={inputClass} />
                  </FormField>
                  <FormField label="Monthly Salary (₹)" required>
                    <input type="number" required value={form.current_salary} onChange={(e) => update('current_salary', e.target.value)} placeholder="e.g. 40000" className={inputClass} />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Office Start Time">
                    <input type="time" value={form.office_start_time} onChange={(e) => update('office_start_time', e.target.value)} className={inputClass} />
                  </FormField>
                  <FormField label="Office End Time">
                    <input type="time" value={form.office_end_time} onChange={(e) => update('office_end_time', e.target.value)} className={inputClass} />
                  </FormField>
                </div>
              </div>
            )}
          </div>

          {/* ═══ Previous Company ═══ */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <SectionHeader icon="🏢" title="Previous Company (Optional)" isOpen={openSections.previous} onToggle={() => toggleSection('previous')} />
            {openSections.previous && (
              <div className="px-3 pb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Company Name">
                    <input type="text" value={form.last_company_name} onChange={(e) => update('last_company_name', e.target.value)} placeholder="Previous employer name" className={inputClass} />
                  </FormField>
                  <FormField label="Designation">
                    <input type="text" value={form.last_company_designation} onChange={(e) => update('last_company_designation', e.target.value)} placeholder="Role at previous company" className={inputClass} />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Joining Date">
                    <input type="date" value={form.last_company_joining_date} onChange={(e) => update('last_company_joining_date', e.target.value)} className={inputClass} />
                  </FormField>
                  <FormField label="Leaving Date">
                    <input type="date" value={form.last_company_leaving_date} onChange={(e) => update('last_company_leaving_date', e.target.value)} className={inputClass} />
                  </FormField>
                </div>
                <FormField label="Remarks">
                  <textarea value={form.last_company_remarks} onChange={(e) => update('last_company_remarks', e.target.value)} placeholder="Any notes about previous employment" rows="2" className={`${inputClass} resize-none`} />
                </FormField>
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions — Sticky */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
          <button
            type="submit"
            form=""
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 px-5 py-3 bg-[#38b34a] hover:bg-[#2e9e3e] disabled:opacity-50 text-white font-bold rounded-xl shadow-md text-xs uppercase tracking-wider cursor-pointer transition-all"
          >
            {loading ? 'Saving...' : (editingEmployee ? 'Update Employee' : 'Create Employee')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmployeeModal
