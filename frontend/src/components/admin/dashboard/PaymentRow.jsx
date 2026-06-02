const PaymentRow = ({ label, value, meta, showDivider = true }) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2">
        <div className="flex justify-between items-start gap-2">
            <div>
                <p className="text-sm font-semibold text-slate-700">{label}</p>
                <p className="text-xs text-slate-400">{meta}</p>
            </div>
            <p className="text-lg font-black text-slate-800">{value}</p>
        </div>
        {showDivider && <div className="mt-2 h-0.5 rounded bg-slate-100" />}
    </div>
)

export default PaymentRow