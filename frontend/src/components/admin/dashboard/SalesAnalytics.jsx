import SalesChart from './SalesChart'

const SalesAnalytics = ({ title, bars, legend }) => (
    <section className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-200/40 p-4">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-black text-slate-700">{title}</h3>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                {legend.map((item, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full bg-${item.color}-500`} />
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
        <SalesChart bars={bars} />
    </section>
)

export default SalesAnalytics