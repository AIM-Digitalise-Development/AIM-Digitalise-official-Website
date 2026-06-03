const statusStyles = {
    Overdue: 'bg-rose-50 text-rose-600 border border-rose-100',
    Pending: 'bg-amber-50 text-amber-600 border border-amber-100',
    Completed: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
}

const priorityStyles = {
    High: 'bg-rose-50 text-rose-600 border border-rose-100',
    Medium: 'bg-amber-50 text-amber-600 border border-amber-100',
    Low: 'bg-blue-50 text-blue-600 border border-blue-100',
}

const TodoItem = ({ id, task, status, priority, onToggle, onDelete }) => (
    <div className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors group border-b border-slate-100 last:border-b-0">
        <label className="inline-flex items-center gap-3.5 text-sm cursor-pointer select-none flex-1">
            <input
                type="checkbox"
                checked={status === 'Completed'}
                onChange={() => onToggle(id)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <span className={`font-semibold transition-all ${
                status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-700'
            }`}>
                {task}
            </span>
        </label>
        
        <div className="flex items-center gap-2.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>
                {status}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityStyles[priority] || 'bg-slate-100 text-slate-600'}`}>
                {priority}
            </span>
            
            {/* Delete button (visible on hover) */}
            <button
                onClick={() => onDelete(id)}
                className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-rose-50 cursor-pointer"
                title="Delete Task"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    </div>
)

export default TodoItem