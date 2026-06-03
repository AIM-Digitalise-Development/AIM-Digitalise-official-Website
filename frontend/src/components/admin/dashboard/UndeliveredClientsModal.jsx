import React from 'react'

const UndeliveredClientsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const pendingDeliveries = [
    { id: 1, client: 'Apex Group of Schools', project: 'SaaS Mobile App Customization', date: '10 May 2026', deadline: '15 Jun 2026', pendingItem: 'Play Store Publishing', manager: 'Amit Verma' },
    { id: 2, client: 'Skyline Academy', project: 'Offline Server Synchronizer Node', date: '15 May 2026', deadline: '20 Jun 2026', pendingItem: 'Hardware Installation', manager: 'Rohit K.' },
    { id: 3, client: 'Vidya Bharati Institution', project: 'Custom HRMS Integration', date: '01 May 2026', deadline: '10 Jun 2026', pendingItem: 'Biometric API Hooking', manager: 'Sneha Roy' },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Undelivered Clients</h3>
            <p className="text-xs text-violet-100">Details of projects currently in delivery/onboarding phase</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-violet-200 transition-colors text-2xl font-semibold cursor-pointer">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Project / Solution</th>
                  <th className="pb-3">Contract Date</th>
                  <th className="pb-3">Target Date</th>
                  <th className="pb-3">Pending Blockers</th>
                  <th className="pb-3 text-right">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {pendingDeliveries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-semibold text-slate-800">{item.client}</td>
                    <td className="py-3.5 text-slate-500">{item.project}</td>
                    <td className="py-3.5">{item.date}</td>
                    <td className="py-3.5 text-rose-600 font-semibold">{item.deadline}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-100">
                        {item.pendingItem}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-medium">{item.manager}</td>
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

export default UndeliveredClientsModal
