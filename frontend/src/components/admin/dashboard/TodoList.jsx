import TodoItem from './TodoItem'

const TodoList = ({ todos, onAddTask, onToggleTask, onDeleteTask }) => (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/35 overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>To-Do List</span>
            </h3>
            <button
                onClick={onAddTask}
                className="text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
            >
                + Add Task
            </button>
        </header>
        
        {todos.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm font-semibold">
                No pending tasks. Great job!
            </div>
        ) : (
            <div className="divide-y divide-slate-100">
                {todos.map((todo) => (
                    <TodoItem
                        key={todo.id}
                        {...todo}
                        onToggle={onToggleTask}
                        onDelete={onDeleteTask}
                    />
                ))}
            </div>
        )}
    </div>
)

export default TodoList