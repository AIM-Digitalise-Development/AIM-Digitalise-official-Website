import React from 'react'

const StudentsListModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const schoolBreakdown = [
    { school: 'St. Xavier High School', students: 1240, activeLMS: 1100, status: 'Synced' },
    { school: 'Heritage Academy', students: 950, activeLMS: 890, status: 'Synced' },
    { school: 'National Public School', students: 820, activeLMS: 780, status: 'Synced' },
    { school: 'City Montessori School', students: 1646, activeLMS: 1590, status: 'Synced' },
  ]

  const total = schoolBreakdown.reduce((sum, item) => sum + item.students, 0)
  const totalLMS = schoolBreakdown.reduce((sum, item) => sum + item.activeLMS, 0)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Total Students Overview</h3>
            <p className="text-xs text-orange-100">Enrollment analytics and LMS logins</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-orange-200 transition-colors text-2xl font-semibold cursor-pointer">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-orange-700">Total Enrolled</p>
              <p className="text-3xl font-black text-orange-600 font-mono mt-1">{total.toLocaleString()}</p>
            </div>
            <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-amber-700">Active LMS Accounts</p>
              <p className="text-3xl font-black text-amber-600 font-mono mt-1">{totalLMS.toLocaleString()}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3">Institution Name</th>
                  <th className="pb-3">Total Students</th>
                  <th className="pb-3">Active LMS Users</th>
                  <th className="pb-3 text-right">Database Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {schoolBreakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-semibold text-slate-800">{item.school}</td>
                    <td className="py-3.5 font-mono text-slate-700">{item.students.toLocaleString()}</td>
                    <td className="py-3.5 font-mono text-slate-500">{item.activeLMS.toLocaleString()}</td>
                    <td className="py-3.5 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors cursor-pointer text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentsListModal
