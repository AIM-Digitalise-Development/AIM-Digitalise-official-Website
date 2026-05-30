import TaskBoard from '../../components/employee/tasks/TaskBoard'

const EmployeeTasks = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <button className="btn-primary">Create Task</button>
      </div>
      <TaskBoard />
    </div>
  )
}

export default EmployeeTasks