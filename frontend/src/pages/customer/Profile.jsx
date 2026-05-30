import ProfileForm from '../../components/customer/profile/ProfileForm'
import ChangePassword from '../../components/customer/profile/ChangePassword'

const CustomerProfile = () => {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      <ProfileForm />
      <ChangePassword />
    </div>
  )
}

export default CustomerProfile