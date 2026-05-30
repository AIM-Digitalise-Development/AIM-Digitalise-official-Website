import { Outlet } from 'react-router-dom'

const WebsiteLayout = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}

export default WebsiteLayout