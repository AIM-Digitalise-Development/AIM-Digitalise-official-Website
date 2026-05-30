import UserTable from '../../components/admin/users/UserTable'
import UserFilters from '../../components/admin/users/UserFilters'

const AdminUsers = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
        <button className="btn-primary">Add User</button>
      </div>
      <UserFilters />
      <UserTable />
    </div>
  )
}

export default AdminUsers