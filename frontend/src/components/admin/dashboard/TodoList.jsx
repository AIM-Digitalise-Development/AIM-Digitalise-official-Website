import TodoItem from './TodoItem'

const TodoList = ({ todos, onAddTask }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-200/35 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-black text-slate-700">To-Do List</h3>
            <button
                onClick={onAddTask}
                className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
            >
                + Add Task
            </button>
        </header>
        {todos.map((todo, index) => (
            <TodoItem
                key={index}
                task={todo.task}
                status={todo.status}
                priority={todo.priority}
            />
        ))}
    </div>
)

export default TodoList