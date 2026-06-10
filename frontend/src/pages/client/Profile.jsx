import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useClientAuthStore } from '../../store/clientAuthStore'
import { getClientProfile, getClientProducts } from '../../api/clientPortal'
import BasicInfoCard from '../../components/client/profile/BasicInfoCard'
import OrgDetailsCard from '../../components/client/profile/OrgDetailsCard'
import AddressCard from '../../components/client/profile/AddressCard'
import PurchaseInfoCard from '../../components/client/profile/PurchaseInfoCard'

const ClientProfile = () => {
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

  const [loading, setLoading] = useState(!profileFetched)
  const [error, setError] = useState('')

  // Sync profile details
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
        setError('')
      } catch (err) {
        console.error('Error syncing client profile:', err)
        if (!profileData) {
          setError(err?.response?.data?.message || 'Failed to sync profile details.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (!profileFetched) setLoading(true)
    syncProfile()
  }, [clientToken, isClientAuthenticated, profileFetched, setProfileData])

  // Sync products data in the background
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
      } catch (err) {
        console.error('Error syncing products:', err)
      }
    }
    syncProducts()
  }, [clientToken, isClientAuthenticated, productData, setProductData])

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

  // Calculate fallback monthly subscription fee if plan is Institute Pro and stored value is 0 or null
  const isInstPro = rawProduct?.product_name === 'NEXGN Institute Pro' || rawProduct?.name === 'NEXGN Institute Pro'
  const totalStudentsNum = parseInt(displayUser?.total_students || rawProduct?.total_students, 10) || 0
  const finalSub = (isInstPro && (!rawProduct?.monthly_subscription || Number(rawProduct.monthly_subscription) === 0))
    ? 10 * totalStudentsNum
    : rawProduct?.monthly_subscription || 0

  const activeProduct = {
    ...rawProduct,
    monthly_subscription: finalSub
  }

  if (loading && !displayUser.client_id) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-8 h-8 animate-spin text-aim-gold" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 p-2 rounded-xl border border-blue-500/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          Profile Information
        </h2>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Grid of sub-component cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BasicInfoCard displayUser={displayUser} />
        <OrgDetailsCard displayUser={displayUser} />
        <AddressCard displayUser={displayUser} />
        <PurchaseInfoCard activeProduct={activeProduct} />
      </div>
    </motion.div>
  )
}

export default ClientProfile
