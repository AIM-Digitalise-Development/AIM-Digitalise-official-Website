const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

const SalesChart = ({ bars }) => (
    <div className="relative h-[300px] rounded-xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="absolute inset-4 flex items-end gap-3">
            {bars.map((height, index) => (
                <div key={index} className="flex-1 flex flex-col justify-end items-center gap-2">
                    <div
                        className="w-full rounded-md border-2 border-blue-300/80 bg-blue-200/35"
                        style={{ height: `${height}px` }}
                    />
                    <span className="text-[10px] font-semibold text-slate-500">{months[index]}</span>
                </div>
            ))}
        </div>
        <svg
            className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.2"
                points="2,68 10,60 18,64 26,54 34,58 42,51 50,61 58,50 66,45 74,56 82,54 90,48"
            />
            <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="1.2"
                points="2,75 10,72 18,73 26,70 34,69 42,66 50,71 58,67 66,66 74,69 82,67 90,64"
            />
        </svg>
    </div>
)

export default SalesChart