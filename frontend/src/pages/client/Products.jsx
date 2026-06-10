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

  if (loading && !activeProduct.name && !activeProduct.product_name) {
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
          <span className="bg-purple-500/20 text-purple-400 p-2 rounded-xl border border-purple-500/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </span>
          My Products & Services
        </h2>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {(!activeProduct.name && !activeProduct.product_name) ? (
        <div className="py-16 text-center text-aim-copy-muted border border-white/5 bg-white/5 rounded-2xl">
          <span className="text-4xl block">📦</span>
          <p className="font-bold mt-2 text-sm">No active product subscriptions found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Neon gradient active product card */}
          <ProductActiveCard activeProduct={activeProduct} />

          {/* Client billing details grid */}
          <BillingDetailsCard displayUser={displayUser} />

          {/* Purchase summary transaction card */}
          <PurchaseSummaryCard activeProduct={activeProduct} />
        </div>
      )}
    </motion.div>
  )
}

export default ClientProducts
