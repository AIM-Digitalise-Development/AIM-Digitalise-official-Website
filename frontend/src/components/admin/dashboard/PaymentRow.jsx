const PaymentRow = ({ label, value, meta, borderColor = 'border-l-slate-300' }) => (
    <div className={`rounded-lg border border-slate-100 bg-white pl-4 pr-5 py-3 shadow-sm border-l-4 ${borderColor} flex justify-between items-center transition-all hover:shadow-md`}>
        <div>
            <p className="text-sm font-bold text-slate-700">{label}</p>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{meta}</p>
        </div>
        <p className="text-lg font-extrabold text-slate-800 tracking-tight font-mono">{value}</p>
    </div>
)

export default PaymentRow