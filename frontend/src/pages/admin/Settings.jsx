import GeneralSettings from '../../components/admin/settings/GeneralSettings'
import SecuritySettings from '../../components/admin/settings/SecuritySettings'

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      <GeneralSettings />
      <SecuritySettings />
    </div>
  )
}

export default AdminSettings