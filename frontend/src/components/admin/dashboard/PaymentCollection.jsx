import PaymentRow from './PaymentRow'
import QuickStatsGrid from './QuickStatsGrid'

const PaymentCollection = ({ payments, quickStats }) => (
    <section className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-200/40 overflow-hidden">
        <header className="bg-blue-700 text-white px-4 py-3 text-sm font-black tracking-wider uppercase">
            Payment Collection
        </header>
        <div className="p-4 space-y-3">
            {payments.map((payment, idx) => (
                <PaymentRow
                    key={payment.label}
                    label={payment.label}
                    value={payment.value}
                    meta={payment.meta}
                    showDivider={idx < payments.length - 1}
                />
            ))}
            <QuickStatsGrid stats={quickStats} />
        </div>
    </section>
)

export default PaymentCollection