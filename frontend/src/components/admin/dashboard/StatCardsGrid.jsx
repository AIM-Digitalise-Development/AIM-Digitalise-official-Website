import StatCard from './StatCard'

const StatCardsGrid = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => (
            <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                gradient={stat.gradient}
                icon={stat.icon}
                onClick={stat.onClick}
            />
        ))}
    </div>
)

export default StatCardsGrid