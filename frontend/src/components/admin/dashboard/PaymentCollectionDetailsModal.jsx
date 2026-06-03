import React from 'react'

const PaymentCollectionDetailsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const payments = [
    { id: 'TXN-98217', client: 'St. Xavier High School', method: 'Online (NetBanking)', amount: '₹12,500.00', date: '03 Jun 2026 10:45 AM', status: 'Settled' },
    { id: 'TXN-98218', client: 'Heritage Academy', method: 'Cash Deposit', amount: '₹4,360.00', date: '03 Jun 2026 11:15 AM', status: 'Settled' },
    { id: 'TXN-98104', client: 'Greenwood International', method: 'Online (UPI)', amount: '₹18,200.00', date: '01 Jun 2026 04:30 PM', status: 'Settled' },
    { id: 'TXN-98075', client: 'Delhi Public School', method: 'Online (Card)', amount: '₹22,000.00', date: '29 May 2026 01:20 PM', status: 'Settled' },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Payment Collection Details</h3>
            <p className="text-xs text-blue-100">Audit trail of recent client collections</p>
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
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right">Date/Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-mono text-xs text-slate-800 font-semibold">{payment.id}</td>
                    <td className="py-3.5">{payment.client}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
                        {payment.method}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-black text-slate-800">{payment.amount}</td>
                    <td className="py-3.5 text-right text-xs text-slate-500">{payment.date}</td>
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

export default PaymentCollectionDetailsModal
