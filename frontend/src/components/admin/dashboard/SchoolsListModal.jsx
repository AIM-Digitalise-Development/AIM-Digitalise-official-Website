import React from 'react'

const SchoolsListModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const schools = [
    { id: 1, name: 'St. Xavier High School', location: 'Kolkata, WB', principal: 'Fr. Augustine S.J.', students: 1240, status: 'Active' },
    { id: 2, name: 'Heritage Academy', location: 'Salt Lake, Kolkata', principal: 'Dr. Arundhati Sen', students: 950, status: 'Active' },
    { id: 3, name: 'National Public School', location: 'Midland, Texas', principal: 'John Davis', students: 820, status: 'Active' },
    { id: 4, name: 'City Montessori School', location: 'Lucknow, UP', principal: 'R. K. Sharma', students: 1646, status: 'Active' },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Total Schools</h3>
            <p className="text-xs text-emerald-100">Overview of registered institutions</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-emerald-200 transition-colors text-2xl font-semibold cursor-pointer">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3">School Name</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Principal</th>
                  <th className="pb-3">Students</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-semibold text-slate-800">{school.name}</td>
                    <td className="py-3.5 text-slate-500">{school.location}</td>
                    <td className="py-3.5">{school.principal}</td>
                    <td className="py-3.5 font-mono">{school.students.toLocaleString()}</td>
                    <td className="py-3.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        {school.status}
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

export default SchoolsListModal
