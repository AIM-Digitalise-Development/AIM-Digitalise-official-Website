import React from 'react'

const DuePaymentInvoicesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const invoices = [
    { id: 'INV-2026-004', client: 'St. Xavier High School', amount: '₹1,10,000.00', dueDate: '15 May 2026', daysOverdue: 19, contact: 'accounts@stxavier.edu' },
    { id: 'INV-2026-012', client: 'Heritage Academy', amount: '₹2,45,000.00', dueDate: '20 May 2026', daysOverdue: 14, contact: 'billing@heritage.org' },
    { id: 'INV-2026-019', client: 'National Public School', amount: '₹85,000.00', dueDate: '30 May 2026', daysOverdue: 4, contact: 'nps_midland@yahoo.com' },
    { id: 'INV-2026-022', client: 'City Montessori School', amount: '₹2,70,699.00', dueDate: '02 Jun 2026', daysOverdue: 1, contact: 'cms_fin@rediffmail.com' },
  ]

  const handleSendReminder = (client) => {
    alert(`Reminder notification email sent to ${client}`)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Outstanding Invoices (Dues)</h3>
            <p className="text-xs text-orange-100">Overview of pending collections and receivables</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-orange-200 transition-colors text-2xl font-semibold cursor-pointer">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3">Invoice No</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Overdue Days</th>
                  <th className="pb-3 text-right">Amount Due</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-mono text-xs text-slate-800 font-semibold">{inv.id}</td>
                    <td className="py-3.5">{inv.client}</td>
                    <td className="py-3.5 text-slate-500">{inv.dueDate}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        inv.daysOverdue > 10 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inv.daysOverdue} days
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-black text-slate-800">{inv.amount}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleSendReminder(inv.client)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded shadow transition-colors cursor-pointer"
                      >
                        Remind
                      </button>
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

export default DuePaymentInvoicesModal
