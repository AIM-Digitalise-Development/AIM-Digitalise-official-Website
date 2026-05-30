import Timer from '../../components/employee/timesheet/Timer'
import TimesheetList from '../../components/employee/timesheet/TimesheetList'

const EmployeeTimesheet = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Timesheet</h1>
      <Timer />
      <TimesheetList />
    </div>
  )
}

export default EmployeeTimesheet