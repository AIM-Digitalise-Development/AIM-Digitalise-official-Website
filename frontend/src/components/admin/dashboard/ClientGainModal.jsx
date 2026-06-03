import React from 'react'

const ClientGainModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const clients = [
    { id: 1, name: 'Bright Minds Academy', contact: 'Rajesh Sharma', date: '02 Jun 2026', plan: 'Enterprise (School MS)', status: 'Active' },
    { id: 2, name: 'Little Flowers Play School', contact: 'Priyanka Das', date: '01 Jun 2026', plan: 'Basic LMS', status: 'Onboarding' },
    { id: 3, name: 'Holy Child Convent', contact: 'Sister Maria', date: '28 May 2026', plan: 'Premium ERP', status: 'Active' },
    { id: 4, name: 'Delhi Public School Branch', contact: 'A. K. Mukherjee', date: '25 May 2026', plan: 'Enterprise (School MS)', status: 'Active' },
    { id: 5, name: 'Greenwood International', contact: 'Sanjay Sen', date: '20 May 2026', plan: 'Basic LMS', status: 'Active' },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Monthly Client Gain</h3>
            <p className="text-xs text-blue-100">Overview of newly onboarded clients</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-blue-200 transition-colors text-2xl font-semibold cursor-pointer">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3">Client Name</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Onboarded</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-semibold text-slate-800">{client.name}</td>
                    <td className="py-3.5">{client.contact}</td>
                    <td className="py-3.5 text-slate-500">{client.date}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
                        {client.plan}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        client.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {client.status}
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

export default ClientGainModal
