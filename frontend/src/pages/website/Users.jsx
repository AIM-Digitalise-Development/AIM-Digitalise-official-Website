const Users = () => {
  return (
    <div className="container-custom py-12 animate-fade-in">
      <h1 className="text-4xl font-black text-aim-copy mb-8">User Directory</h1>
      <div className="card-elevated overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-aim-border">
          <h2 className="text-xl font-semibold text-aim-copy">All Users</h2>
        </div>
        <div className="p-6">
          <p className="text-aim-copy-muted">User list will be displayed here</p>
        </div>
      </div>
    </div>
  )
}

export default Users