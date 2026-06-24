import React from 'react'
import { Helmet } from 'react-helmet-async'
import AdminProducts from './Products'

const AdminSettings = () => {
  return (
    <>
      <Helmet>
        <title>Products &amp; Pricing | Admin Panel</title>
      </Helmet>
      <AdminProducts isEmbedded={false} />
    </>
  )
}

export default AdminSettings