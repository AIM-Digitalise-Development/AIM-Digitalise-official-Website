const statusStyles = {
    Overdue: 'bg-rose-100 text-rose-600',
    Pending: 'bg-amber-100 text-amber-600',
    Completed: 'bg-emerald-100 text-emerald-600',
}

const priorityStyles = {
    High: 'bg-rose-100 text-rose-600',
    Medium: 'bg-amber-100 text-amber-600',
    Low: 'bg-blue-100 text-blue-600',
}

const TodoItem = ({ task, status, priority }) => (
    <div className="px-4 py-3 flex items-center justify-between">
        <label className="inline-flex items-center gap-3 text-sm text-slate-600">
            <input type="checkbox" className="rounded border-slate-300" />
            {task}
        </label>
        <div className="flex gap-2">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>
                {status}
            </span>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${priorityStyles[priority] || 'bg-slate-100 text-slate-600'}`}>
                {priority}
            </span>
        </div>
    </div>
)

export default TodoItem