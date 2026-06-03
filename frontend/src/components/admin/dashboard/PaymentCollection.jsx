import PaymentRow from './PaymentRow'

const PaymentCollection = ({ payments, onDetailsClick, onInvoicesClick }) => (
    <section className="xl:col-span-1 bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/40 overflow-hidden flex flex-col h-full justify-between">
        <div>
            <header className="bg-blue-600 text-white px-5 py-3 text-sm font-black tracking-wider uppercase flex items-center gap-2">
                <span className="text-base">₹</span>
                <span>Payment Collection</span>
            </header>
            <div className="p-4 space-y-4">
                {payments.map((payment, idx) => (
                    <PaymentRow
                        key={payment.label}
                        label={payment.label}
                        value={payment.value}
                        meta={payment.meta}
                        borderColor={payment.borderColor}
                    />
                ))}
            </div>
        </div>
        
        {/* Action Buttons */}
        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
            <button
                onClick={onDetailsClick}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3 rounded-lg shadow-sm transition-all cursor-pointer"
                title="View Collection Details"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </button>
            <button
                onClick={onInvoicesClick}
                className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3 rounded-lg shadow-sm transition-all cursor-pointer"
                title="View Due Invoices"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            </button>
        </div>
    </section>
)

export default PaymentCollection