const QuickStatItem = ({ label, value, color }) => (
    <div className={`rounded-xl ${color} text-white text-center py-3`}>
        <p className="text-xs uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black">{value}</p>
    </div>
)

const QuickStatsGrid = ({ stats }) => (
    <div className="grid grid-cols-2 gap-3 pt-1">
        {stats.map((stat, index) => (
            <QuickStatItem
                key={index}
                label={stat.label}
                value={stat.value}
                color={stat.color}
            />
        ))}
    </div>
)

export default QuickStatsGrid