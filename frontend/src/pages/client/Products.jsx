import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useClientAuthStore } from '../../store/clientAuthStore'
import { getClientProfile, getClientProducts } from '../../api/clientPortal'
import ProductActiveCard from '../../components/client/products/ProductActiveCard'
import BillingDetailsCard from '../../components/client/products/BillingDetailsCard'
import PurchaseSummaryCard from '../../components/client/products/PurchaseSummaryCard'

const ClientProducts = () => {
  const {
    clientToken,
    clientUser,
    isClientAuthenticated,
    profileData,
    productData,
    profileFetched,
    productsFetched,
    setProfileData,
    setProductData,
  } = useClientAuthStore()

  const [loading, setLoading] = useState(!productsFetched || !profileFetched)
  const [error, setError] = useState('')

  // Sync profile background data
  useEffect(() => {
    if (!isClientAuthenticated || !clientToken) return

    const syncProfile = async () => {
      try {
        const res = await getClientProfile(clientToken)
        const newProfile = res?.data || res?.profile || res || null
        if (newProfile) {
          if (JSON.stringify(profileData) !== JSON.stringify(newProfile)) {
            setProfileData(newProfile)
          }
        }
      } catch (err) {
        console.error('Error syncing client profile:', err)
      }
    }
    syncProfile()
  }, [clientToken, isClientAuthenticated, profileData, setProfileData])

  // Sync products data
  useEffect(() => {
    if (!isClientAuthenticated || !clientToken) return

    const syncProducts = async () => {
      try {
        const res = await getClientProducts(clientToken)
        const rawProducts = res?.data?.products || res?.products || res?.data || res || []
        const newProducts = Array.isArray(rawProducts) ? rawProducts : []

        if (JSON.stringify(productData) !== JSON.stringify(newProducts)) {
          setProductData(newProducts)
        }
        setError('')
      } catch (err) {
        console.error('Error syncing products:', err)
        if (!productData) {
          setError(err?.response?.data?.message || 'Failed to fetch products list.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (!productsFetched) setLoading(true)
    syncProducts()
  }, [clientToken, isClientAuthenticated, productsFetched, setProductData])

  const displayUser = profileData || clientUser || {}
  const displayProducts = productData || []
  
  const rawProduct = displayProducts[0] || {
    name: displayUser?.product_name,
    product_name: displayUser?.product_name,
    category: displayUser?.product_category || displayUser?.category,
    processing_fee: displayUser?.processing_fee,
    monthly_subscription: displayUser?.monthly_subscription,
    status: displayUser?.status || 'Active',
    payment_status: displayUser?.payment_status,
    created_at: displayUser?.created_at,
    activated_at: displayUser?.activated_at,
    total_students: displayUser?.total_students
  }

  const isInstPro = rawProduct?.product_name === 'NEXGN Institute Pro' || rawProduct?.name === 'NEXGN Institute Pro'
  const totalStudentsNum = parseInt(displayUser?.total_students || rawProduct?.total_students, 10) || 0
  const finalSub = (isInstPro && (!rawProduct?.monthly_subscription || Number(rawProduct.monthly_subscription) === 0))
    ? 10 * totalStudentsNum
    : rawProduct?.monthly_subscription || 0

  const activeProduct = {
    ...rawProduct,
    monthly_subscription: finalSub
  }

  if (loading && !activeProduct.name && !activeProduct.product_name) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-6 h-6 animate-spin text-gray-300" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-5 max-w-5xl mx-auto"
    >
      {error && (
        <div className="p-3 rounded-lg text-[12px] font-medium" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {(!activeProduct.name && !activeProduct.product_name) ? (
        <div className="py-16 text-center text-gray-400 bg-white rounded-xl" style={{ border: '1px solid #ebedf0' }}>
          <span className="text-4xl block">📦</span>
          <p className="font-semibold mt-2 text-[13px]">No active product subscriptions found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <ProductActiveCard activeProduct={activeProduct} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BillingDetailsCard displayUser={displayUser} />
            <PurchaseSummaryCard activeProduct={activeProduct} />
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ClientProducts
