import SalesChart from './SalesChart'

const SalesAnalytics = ({ title }) => (
    <section className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/40 p-5 flex flex-col justify-between">
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                    <span>{title}</span>
                </h3>
                
                {/* Visual Legend matching the screenshot symbols */}
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-4 h-2.5 rounded-sm bg-blue-500" />
                        Total Sales (₹)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shadow-sm" />
                        School MS
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-sm" />
                        Other Products
                    </span>
                </div>
            </div>

            <SalesChart />
        </div>
    </section>
)

export default SalesAnalytics