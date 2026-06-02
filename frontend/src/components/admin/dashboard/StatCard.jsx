const iconMap = {
    trend: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 7-7" />
        </svg>
    ),
    school: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l9-5 9 5-9 5-9-5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12v5a6 6 0 0012 0v-5" />
        </svg>
    ),
    student: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
        </svg>
    ),
    box: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
    ),
}

const StatCard = ({ label, value, gradient, icon }) => (
    <article
        className={`rounded-2xl bg-gradient-to-r ${gradient} p-5 shadow-lg shadow-slate-300/45 text-white border border-white/20`}
    >
        <div className="flex items-center justify-between gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/25 backdrop-blur-md border border-white/25 flex items-center justify-center">
                {iconMap[icon] || iconMap.trend}
            </div>
            <div className="text-right">
                <p className="text-4xl font-black leading-none">{value}</p>
                <p className="text-xs font-semibold mt-1 tracking-wide text-white/90">{label}</p>
            </div>
        </div>
    </article>
)

export default StatCard