const Users = () => {
  return (
    <div className="container-custom py-12 animate-fade-in">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">User Directory</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">All Users</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600">User list will be displayed here</p>
        </div>
      </div>
    </div>
  )
}

export default Users