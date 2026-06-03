const iconMap = {
    trend: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    school: (
        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    student: (
        <svg className="w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.08a2 2 0 011.84 0L21 12v3.5a1.5 1.5 0 01-3 0V13M12 14v7M12 21H9m3 0h3" />
        </svg>
    ),
    box: (
        <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
    ),
}

const StatCard = ({ label, value, gradient, icon, onClick }) => (
    <article
        onClick={onClick}
        className={`rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-md text-white border border-white/10 cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 select-none`}
    >
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/10">
                {iconMap[icon] || iconMap.trend}
            </div>
            <div className="flex-1">
                <p className="text-4xl font-extrabold tracking-tight leading-none">{value}</p>
                <p className="text-xs font-semibold mt-1 tracking-wide text-white/90 uppercase">{label}</p>
            </div>
        </div>
    </article>
)

export default StatCard