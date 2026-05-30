import WelcomeBanner from '../../components/employee/dashboard/WelcomeBanner'
import TaskSummary from '../../components/employee/dashboard/TaskSummary'
import ProductivityChart from '../../components/employee/dashboard/ProductivityChart'

const EmployeeDashboard = () => {
  return (
    <div className="space-y-6">
      <WelcomeBanner />
      <div className="grid lg:grid-cols-2 gap-6">
        <TaskSummary />
        <ProductivityChart />
      </div>
    </div>
  )
}

export default EmployeeDashboard