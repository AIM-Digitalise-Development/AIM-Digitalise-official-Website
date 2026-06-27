const DetailRow = ({ label, value }) => {
  if (!value && value !== 0) return null
  return (
    <div className="flex justify-between items-start py-2 border-b border-slate-50 last:border-b-0">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 w-36">{label}</span>
      <span className="text-xs font-semibold text-slate-700 text-right">{value}</span>
    </div>
  )
}

const SectionBlock = ({ icon, title, children }) => (
  <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100">
    <h4 className="text-xs font-black text-[#1e3e6b] uppercase tracking-wider mb-3 flex items-center gap-2">
      <span>{icon}</span> {title}
    </h4>
    <div className="space-y-0">{children}</div>
  </div>
)

const getStatusStyle = (status) => {
  const map = {
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    inactive: 'bg-rose-100 text-rose-800 border-rose-200',
    terminated: 'bg-amber-100 text-amber-800 border-amber-200',
    resigned: 'bg-amber-100 text-amber-800 border-amber-200',
  }
  return map[status] || map.inactive
}

const EmployeeDetailsDrawer = ({ employee, onClose }) => {
  if (!employee) return null

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative bg-white w-full max-w-xl shadow-2xl border-l border-slate-200 flex flex-col h-full animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-lg font-black text-[#1e3e6b]">Employee Details</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {employee.employee_id || `ID: ${employee.id}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(employee.employment_status)}`}>
              {employee.employment_status || 'active'}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {/* Name Banner */}
          <div className="bg-gradient-to-r from-[#1e3e6b] to-[#2a5594] rounded-xl p-5 text-white">
            <h2 className="text-xl font-black">{employee.first_name} {employee.last_name}</h2>
            <p className="text-xs text-blue-200 font-bold mt-1">{employee.designation?.name || '—'} • {employee.department?.name || '—'}</p>
            <p className="text-xs text-blue-300 font-medium mt-0.5">{employee.email}</p>
          </div>

          {/* Personal Information */}
          <SectionBlock icon="👤" title="Personal Information">
            <DetailRow label="Phone" value={employee.phone} />
            <DetailRow label="Alt. Phone" value={employee.alternate_phone} />
            <DetailRow label="Date of Birth" value={formatDate(employee.dob)} />
            <DetailRow label="Gender" value={employee.gender ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1) : '—'} />
          </SectionBlock>

          {/* Address */}
          <SectionBlock icon="📍" title="Address">
            <DetailRow label="Current" value={employee.current_address} />
            <DetailRow label="Permanent" value={employee.permanent_address} />
          </SectionBlock>

          {/* Identity & Bank */}
          <SectionBlock icon="🏦" title="Identity & Bank">
            <DetailRow label="Aadhar" value={employee.aadhar_number} />
            <DetailRow label="PAN" value={employee.pan_number} />
            <DetailRow label="Bank" value={employee.bank_name} />
            <DetailRow label="Account No." value={employee.account_number} />
            <DetailRow label="IFSC" value={employee.ifsc_code} />
            <DetailRow label="UPI ID" value={employee.upi_id} />
          </SectionBlock>

          {/* Employment */}
          <SectionBlock icon="💼" title="Employment">
            <DetailRow label="Department" value={employee.department?.name} />
            <DetailRow label="Designation" value={employee.designation?.name} />
            <DetailRow label="Employment Type" value={
              employee.employment_type === 'full_time' ? 'Full Time' :
              employee.employment_type === 'part_time' ? 'Part Time' :
              employee.employment_type === 'contractual' ? 'Contractual' :
              employee.employment_type || '—'
            } />
            <DetailRow label="Joining Date" value={formatDate(employee.joining_date)} />
            <DetailRow label="Confirmation" value={formatDate(employee.confirmation_date)} />
            <DetailRow label="Salary" value={employee.current_salary ? `₹${Number(employee.current_salary).toLocaleString('en-IN')}` : '—'} />
            <DetailRow label="Office Hours" value={`${employee.office_start_time || '09:00'} — ${employee.office_end_time || '18:00'}`} />
          </SectionBlock>


          {/* Previous Company */}
          {employee.last_company_name && (
            <SectionBlock icon="🏢" title="Previous Company">
              <DetailRow label="Company" value={employee.last_company_name} />
              <DetailRow label="Designation" value={employee.last_company_designation} />
              <DetailRow label="From" value={formatDate(employee.last_company_joining_date)} />
              <DetailRow label="To" value={formatDate(employee.last_company_leaving_date)} />
              <DetailRow label="Remarks" value={employee.last_company_remarks} />
            </SectionBlock>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetailsDrawer
