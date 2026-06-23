import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  getAdminProducts,
  updateProductDiscounts,
  createAdminProduct,
  updateAdminProduct,
  toggleProductStatus,
  deleteAdminProduct,
  getAdminProductCategories,
  createProductCategory,
  updateProductCategory,
  toggleCategoryStatus,
  deleteProductCategory,
  getAdminSubCategories,
  createSubCategory,
  updateSubCategory,
  toggleSubCategoryStatus,
  deleteSubCategory,
} from '../../api/admin/partners'

// ─── Shared style helpers ─────────────────────────────────────────────────────
const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400'
const Field = ({ label, children, hint }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    {children}
    {hint && <p className="text-[10px] text-slate-400 font-medium">{hint}</p>}
  </div>
)

// ─── Empty form templates ─────────────────────────────────────────────────────
const EMPTY_PRODUCT = {
  name: '', category_id: '', sub_category_id: '',
  processing_fee: 0, monthly_subscription: 0, per_person: true,
  description: '', customization: '', complimentary: '', support: '',
  monthly_discount: 0, quarterly_discount: 0, half_yearly_discount: 0, annual_discount: 0,
  is_active: true,
}
const EMPTY_CATEGORY    = { name: '', description: '', is_active: true }
const EMPTY_SUBCATEGORY = { name: '', category_id: '', description: '', is_active: true }
const EMPTY_DISCOUNTS   = { monthly_discount: 0, quarterly_discount: 0, half_yearly_discount: 0, annual_discount: 0 }

const AdminProducts = () => {
  // ── Flash ─────────────────────────────────────────────────────────────────
  const [error,      setError]      = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const flashSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3500) }
  const flashError   = (msg) => { setError(msg);      setTimeout(() => setError(null),      4000) }

  // ── Active Tab ─────────────────────────────────────────────────────────────
  const [activePageTab, setActivePageTab] = useState('products')

  // ── PRODUCTS & PRICING STATE ───────────────────────────────────────────────
  const [products,        setProducts]        = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [categories,      setCategories]      = useState([])
  const [subCategories,   setSubCategories]   = useState([])
  const [filteredSubCats, setFilteredSubCats] = useState([])

  // Filters
  const [filters, setFilters] = useState({ active: '', category_id: '', sub_category_id: '', search: '' })

  const fetchProducts = async (overrideFilters) => {
    setProductsLoading(true)
    try {
      const res = await getAdminProducts(overrideFilters ?? filters)
      if (res.data?.success) {
        const d = res.data.data
        const prods = Array.isArray(d?.products) ? d.products : Array.isArray(d) ? d : []
        setProducts(prods)
        if (Array.isArray(d?.filters?.categories))    setCategories(d.filters.categories)
        if (Array.isArray(d?.filters?.sub_categories)) setSubCategories(d.filters.sub_categories)
      } else {
        flashError(res.data?.message || 'Failed to fetch products')
        setProducts([])
      }
    } catch (err) {
      console.error('[fetchProducts]', err)
      flashError(err.message || 'Error loading products')
      setProducts([])
    } finally { setProductsLoading(false) }
  }

  const fetchCategories = async () => {
    try {
      const res = await getAdminProductCategories()
      if (res.data?.success) {
        setCategories(Array.isArray(res.data.data) ? res.data.data : [])
      }
    } catch (err) { console.error('[fetchCategories]', err) }
  }

  const fetchSubCategories = async () => {
    try {
      const res = await getAdminSubCategories()
      if (res.data?.success) {
        setSubCategories(Array.isArray(res.data.data) ? res.data.data : [])
      }
    } catch (err) { console.error('[fetchSubCategories]', err) }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchSubCategories()
  }, [])

  const applyFilters = () => fetchProducts()

  const handleFilterCategoryChange = (catId) => {
    setFilters(f => ({ ...f, category_id: catId, sub_category_id: '' }))
  }

  // ── PRODUCT MODAL ──────────────────────────────────────────────────────────
  const [showProductModal, setShowProductModal] = useState(false)
  const [productForm,      setProductForm]      = useState(EMPTY_PRODUCT)
  const [selectedProduct,  setSelectedProduct]  = useState(null)
  const [isEditMode,       setIsEditMode]       = useState(false)
  const [productSaving,    setProductSaving]    = useState(false)

  const handleProductCategoryChange = (catId) => {
    setProductForm(f => ({ ...f, category_id: catId, sub_category_id: '' }))
    setFilteredSubCats(subCategories.filter(sc => Number(sc.category_id) === Number(catId)))
  }

  const openCreateProduct = () => {
    setSelectedProduct(null); setProductForm(EMPTY_PRODUCT)
    setFilteredSubCats([]); setIsEditMode(false); setShowProductModal(true)
  }

  const openEditProduct = (p) => {
    setSelectedProduct(p)
    setProductForm({
      name:                 p.name                    || '',
      category_id:          p.category_id             || '',
      sub_category_id:      p.sub_category_id         || '',
      processing_fee:       p.processing_fee          ?? 0,
      monthly_subscription: p.monthly_subscription    ?? 0,
      per_person:           p.per_person              ?? true,
      description:          p.description             || '',
      customization:        p.customization           || '',
      complimentary:        p.complimentary           || '',
      support:              p.support                 || '',
      monthly_discount:     p.discounts?.monthly      ?? 0,
      quarterly_discount:   p.discounts?.quarterly    ?? 0,
      half_yearly_discount: p.discounts?.half_yearly  ?? 0,
      annual_discount:      p.discounts?.annual       ?? 0,
      is_active:            p.is_active               ?? true,
    })
    if (p.category_id) setFilteredSubCats(subCategories.filter(sc => Number(sc.category_id) === Number(p.category_id)))
    setIsEditMode(true); setShowProductModal(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!productForm?.name?.trim()) { flashError('Product name is required'); return }
    setProductSaving(true)
    try {
      const res = isEditMode
        ? await updateAdminProduct(selectedProduct.id, productForm)
        : await createAdminProduct(productForm)
      if (res.data?.success) {
        flashSuccess(isEditMode ? 'Product updated!' : 'Product created!')
        setShowProductModal(false); fetchProducts(); fetchCategories(); fetchSubCategories()
      } else {
        const errs = res.data?.errors ? Object.values(res.data.errors).flat().join(', ') : res.data?.message
        flashError(errs || 'Failed to save product')
      }
    } catch (err) { flashError(err?.message || 'Error saving product') }
    finally { setProductSaving(false) }
  }

  const handleToggleProductStatus = async (id) => {
    try {
      const res = await toggleProductStatus(id)
      if (res.data?.success) { flashSuccess(res.data.message || 'Status toggled'); fetchProducts() }
      else flashError(res.data?.message || 'Failed to toggle status')
    } catch (err) { flashError(err.message) }
  }

  const handleDeleteProduct = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    try {
      const res = await deleteAdminProduct(p.id)
      if (res.data?.success) { flashSuccess('Product deleted'); fetchProducts() }
      else flashError(res.data?.message || 'Failed to delete')
    } catch (err) { flashError(err.message) }
  }

  // ── DISCOUNT MODAL ─────────────────────────────────────────────────────────
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [discountForm,      setDiscountForm]      = useState(EMPTY_DISCOUNTS)
  const [discountSaving,    setDiscountSaving]    = useState(false)

  const openDiscountModal = (p) => {
    setSelectedProduct(p)
    setDiscountForm({
      monthly_discount:     p.discounts?.monthly     ?? 0,
      quarterly_discount:   p.discounts?.quarterly   ?? 0,
      half_yearly_discount: p.discounts?.half_yearly ?? 0,
      annual_discount:      p.discounts?.annual      ?? 0,
    })
    setShowDiscountModal(true)
  }

  const handleSaveDiscounts = async (e) => {
    e.preventDefault(); setDiscountSaving(true)
    try {
      const res = await updateProductDiscounts(selectedProduct.id, discountForm)
      if (res.data?.success) { flashSuccess('Discounts updated!'); setShowDiscountModal(false); fetchProducts() }
      else flashError(res.data?.message || 'Failed to update discounts')
    } catch (err) { flashError(err.message) }
    finally { setDiscountSaving(false) }
  }

  // ── CATEGORY MODAL ─────────────────────────────────────────────────────────
  const [showCategoryModal,  setShowCategoryModal]  = useState(false)
  const [categoryForm,       setCategoryForm]       = useState(EMPTY_CATEGORY)
  const [selectedCategory,   setSelectedCategory]   = useState(null)
  const [isCatEditMode,      setIsCatEditMode]      = useState(false)
  const [categorySaving,     setCategorySaving]     = useState(false)

  const openCreateCategory = () => {
    setSelectedCategory(null); setCategoryForm(EMPTY_CATEGORY); setIsCatEditMode(false); setShowCategoryModal(true)
  }
  const openEditCategory = (cat) => {
    setSelectedCategory(cat)
    setCategoryForm({ name: cat.name, description: cat.description || '', is_active: cat.is_active })
    setIsCatEditMode(true); setShowCategoryModal(true)
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault(); setCategorySaving(true)
    try {
      const res = isCatEditMode
        ? await updateProductCategory(selectedCategory.id, categoryForm)
        : await createProductCategory(categoryForm)
      if (res.data?.success) {
        flashSuccess(isCatEditMode ? 'Category updated!' : 'Category created!')
        setShowCategoryModal(false); fetchCategories()
      } else flashError(res.data?.message || 'Failed to save category')
    } catch (err) { flashError(err.message) }
    finally { setCategorySaving(false) }
  }

  const handleToggleCategoryStatus = async (id) => {
    try {
      const res = await toggleCategoryStatus(id)
      if (res.data?.success) { flashSuccess(res.data.message || 'Status toggled'); fetchCategories() }
      else flashError(res.data?.message || 'Failed')
    } catch (err) { flashError(err.message) }
  }

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? This will remove it from all products.`)) return
    try {
      const res = await deleteProductCategory(cat.id)
      if (res.data?.success) { flashSuccess('Category deleted'); fetchCategories() }
      else flashError(res.data?.message || 'Failed to delete')
    } catch (err) { flashError(err.message) }
  }

  // ── SUB-CATEGORY MODAL ─────────────────────────────────────────────────────
  const [showSubCatModal,    setShowSubCatModal]    = useState(false)
  const [subCatForm,         setSubCatForm]         = useState(EMPTY_SUBCATEGORY)
  const [selectedSubCat,     setSelectedSubCat]     = useState(null)
  const [isSubCatEditMode,   setIsSubCatEditMode]   = useState(false)
  const [subCatSaving,       setSubCatSaving]       = useState(false)

  const openCreateSubCat = () => {
    setSelectedSubCat(null); setSubCatForm(EMPTY_SUBCATEGORY); setIsSubCatEditMode(false); setShowSubCatModal(true)
  }
  const openEditSubCat = (sc) => {
    setSelectedSubCat(sc)
    setSubCatForm({ name: sc.name, category_id: sc.category_id || '', description: sc.description || '', is_active: sc.is_active })
    setIsSubCatEditMode(true); setShowSubCatModal(true)
  }

  const handleSaveSubCat = async (e) => {
    e.preventDefault(); setSubCatSaving(true)
    try {
      const res = isSubCatEditMode
        ? await updateSubCategory(selectedSubCat.id, subCatForm)
        : await createSubCategory(subCatForm)
      if (res.data?.success) {
        flashSuccess(isSubCatEditMode ? 'Sub-category updated!' : 'Sub-category created!')
        setShowSubCatModal(false); fetchSubCategories()
      } else flashError(res.data?.message || 'Failed to save sub-category')
    } catch (err) { flashError(err.message) }
    finally { setSubCatSaving(false) }
  }

  const handleToggleSubCatStatus = async (id) => {
    try {
      const res = await toggleSubCategoryStatus(id)
      if (res.data?.success) { flashSuccess(res.data.message || 'Status toggled'); fetchSubCategories() }
      else flashError(res.data?.message || 'Failed')
    } catch (err) { flashError(err.message) }
  }

  const handleDeleteSubCat = async (sc) => {
    if (!window.confirm(`Delete sub-category "${sc.name}"?`)) return
    try {
      const res = await deleteSubCategory(sc.id)
      if (res.data?.success) { flashSuccess('Sub-category deleted'); fetchSubCategories() }
      else flashError(res.data?.message || 'Failed to delete')
    } catch (err) { flashError(err.message) }
  }

  return (
    <>
      <Helmet><title>Products &amp; Pricing | Admin Panel</title></Helmet>

      {/* ══ PRODUCT MODAL ════════════════════════════════════════════════════════ */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 border border-slate-200/80 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2"><span className="text-[#38b34a]">📦</span> {isEditMode ? 'Edit Product' : 'Create Product'}</h3>
              <button onClick={() => setShowProductModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-xl cursor-pointer">×</button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic Info</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Product Name *">
                    <input value={productForm.name} onChange={e => setProductForm(f => ({...f, name: e.target.value}))} required placeholder="e.g. School Management System" className={inputCls} />
                  </Field>
                  <Field label="Category">
                    <select value={productForm.category_id} onChange={e => handleProductCategoryChange(e.target.value)} className={inputCls}>
                      <option value="">— No Category —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Sub Category">
                    <select value={productForm.sub_category_id} onChange={e => setProductForm(f => ({...f, sub_category_id: e.target.value}))} className={inputCls} disabled={!productForm.category_id}>
                      <option value="">— No Sub Category —</option>
                      {(filteredSubCats.length ? filteredSubCats : subCategories.filter(sc => Number(sc.category_id) === Number(productForm.category_id))).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select value={productForm.is_active} onChange={e => setProductForm(f => ({...f, is_active: e.target.value === 'true'}))} className={inputCls}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </Field>
                </div>
                <Field label="Description">
                  <textarea value={productForm.description} onChange={e => setProductForm(f => ({...f, description: e.target.value}))} rows={2} placeholder="Brief product description..." className={`${inputCls} resize-none`} />
                </Field>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-4">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Pricing</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Processing Fee (₹)" hint="One-time setup/registration fee">
                    <input type="number" min="0" value={productForm.processing_fee} onChange={e => setProductForm(f => ({...f, processing_fee: Number(e.target.value)}))} className={inputCls} />
                  </Field>
                  <Field label="Monthly Subscription (₹)" hint="Base monthly recurring price">
                    <input type="number" min="0" value={productForm.monthly_subscription} onChange={e => setProductForm(f => ({...f, monthly_subscription: Number(e.target.value)}))} className={inputCls} />
                  </Field>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="per_person" checked={productForm.per_person} onChange={e => setProductForm(f => ({...f, per_person: e.target.checked}))} className="w-4 h-4 accent-[#38b34a]" />
                  <label htmlFor="per_person" className="text-sm font-semibold text-slate-700 cursor-pointer">Price is per person / per user</label>
                </div>
              </div>

              

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Additional Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Customization">
                    <textarea value={productForm.customization} onChange={e => setProductForm(f => ({...f, customization: e.target.value}))} rows={2} placeholder="Customization options..." className={`${inputCls} resize-none`} />
                  </Field>
                  <Field label="Complimentary">
                    <textarea value={productForm.complimentary} onChange={e => setProductForm(f => ({...f, complimentary: e.target.value}))} rows={2} placeholder="Complimentary services..." className={`${inputCls} resize-none`} />
                  </Field>
                  <Field label="Support">
                    <textarea value={productForm.support} onChange={e => setProductForm(f => ({...f, support: e.target.value}))} rows={2} placeholder="Support details..." className={`${inputCls} resize-none`} />
                  </Field>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={productSaving} className="flex-1 py-2.5 rounded-xl bg-[#38b34a] text-white text-sm font-bold hover:bg-[#2d9a3e] disabled:opacity-50 cursor-pointer">
                  {productSaving ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ DISCOUNT MODAL ═══════════════════════════════════════════════════════ */}
      {showDiscountModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-200/80">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2"><span className="text-violet-500">🏷️</span> Edit Discounts</h3>
              <button onClick={() => setShowDiscountModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-xl cursor-pointer">×</button>
            </div>
            <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-400 font-semibold">Product</p>
              <p className="text-sm font-black text-slate-800">{selectedProduct.name}</p>
              <p className="text-[10px] text-slate-400">₹{selectedProduct.processing_fee} processing · ₹{selectedProduct.monthly_subscription}/mo</p>
            </div>
            <form onSubmit={handleSaveDiscounts} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: '📅 Monthly',     key: 'monthly_discount'     },
                  { label: '📆 Quarterly',   key: 'quarterly_discount'   },
                  { label: '🗓️ Half-Yearly', key: 'half_yearly_discount' },
                  { label: '🎯 Annual',      key: 'annual_discount'      },
                ].map(({ label, key }) => (
                  <Field key={key} label={label}>
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" max="100" value={discountForm[key]} onChange={e => setDiscountForm(f => ({...f, [key]: Number(e.target.value)}))} className={inputCls} />
                      <span className="text-slate-500 font-bold shrink-0">%</span>
                    </div>
                  </Field>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">Discounts applied as % off the total subscription for the chosen billing cycle.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowDiscountModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={discountSaving} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 disabled:opacity-50 cursor-pointer">{discountSaving ? 'Saving...' : 'Save Discounts'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ CATEGORY MODAL ═══════════════════════════════════════════════════════ */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-slate-200/80">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2"><span className="text-indigo-500">🗂️</span> {isCatEditMode ? 'Edit Category' : 'Create Category'}</h3>
              <button onClick={() => setShowCategoryModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-xl cursor-pointer">×</button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <Field label="Category Name *">
                <input value={categoryForm.name} onChange={e => setCategoryForm(f => ({...f, name: e.target.value}))} required placeholder="e.g. SAAS Based Subscriptions" className={inputCls} autoFocus />
              </Field>
              <Field label="Description">
                <textarea value={categoryForm.description} onChange={e => setCategoryForm(f => ({...f, description: e.target.value}))} rows={3} placeholder="Category description..." className={`${inputCls} resize-none`} />
              </Field>
              <Field label="Status">
                <select value={categoryForm.is_active} onChange={e => setCategoryForm(f => ({...f, is_active: e.target.value === 'true'}))} className={inputCls}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </Field>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={categorySaving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">{categorySaving ? 'Saving...' : (isCatEditMode ? 'Update' : 'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ SUB-CATEGORY MODAL ════════════════════════════════════════════════════ */}
      {showSubCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-slate-200/80">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2"><span className="text-violet-500">📂</span> {isSubCatEditMode ? 'Edit Sub-Category' : 'Create Sub-Category'}</h3>
              <button onClick={() => setShowSubCatModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-xl cursor-pointer">×</button>
            </div>
            <form onSubmit={handleSaveSubCat} className="space-y-4">
              <Field label="Sub-Category Name *">
                <input value={subCatForm.name} onChange={e => setSubCatForm(f => ({...f, name: e.target.value}))} required placeholder="e.g. Website Development" className={inputCls} autoFocus />
              </Field>
              <Field label="Parent Category *">
                <select value={subCatForm.category_id} onChange={e => setSubCatForm(f => ({...f, category_id: e.target.value}))} required className={inputCls}>
                  <option value="">Select Category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Description">
                <textarea value={subCatForm.description} onChange={e => setSubCatForm(f => ({...f, description: e.target.value}))} rows={2} placeholder="Sub-category description..." className={`${inputCls} resize-none`} />
              </Field>
              <Field label="Status">
                <select value={subCatForm.is_active} onChange={e => setSubCatForm(f => ({...f, is_active: e.target.value === 'true'}))} className={inputCls}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </Field>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSubCatModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={subCatSaving} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 disabled:opacity-50 cursor-pointer">{subCatSaving ? 'Saving...' : (isSubCatEditMode ? 'Update' : 'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ PAGE BODY ═════════════════════════════════════════════════════════════ */}
      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Header */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Products &amp; Pricing</h1>
          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>
          <div className="w-40 flex justify-end">
            <button onClick={() => { fetchProducts(); fetchCategories(); fetchSubCategories() }} disabled={productsLoading} className="px-4 py-2 border border-slate-200 hover:border-[#38b34a] hover:text-[#38b34a] bg-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-sm">
              {productsLoading ? 'Loading...' : '↺ Refresh All'}
            </button>
          </div>
        </div>

        {/* Flash messages */}
        {error      && <div className="p-3 rounded-xl border border-red-400/20 bg-red-50 text-red-600 text-sm font-semibold flex items-center gap-2">⚠️ {error}</div>}
        {successMsg && <div className="p-3 rounded-xl border border-emerald-400/20 bg-emerald-50 text-emerald-700 text-sm font-semibold flex items-center gap-2">✅ {successMsg}</div>}

        {/* Main card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            {[
              { id: 'products',       label: 'Products & Pricing' },
              { id: 'categories',     label: 'Categories'         },
              { id: 'subcategories',  label: 'Sub-Categories'      },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePageTab(tab.id)}
                className={`px-5 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t-2 ${
                  activePageTab === tab.id
                    ? 'bg-white border-[#ff6600] text-[#ff6600] -mb-[13px] z-10'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB: PRODUCTS ─────────────────────────────────────────────────── */}
          {activePageTab === 'products' && (
            <div className="space-y-6">
              {/* Products filter toolbar */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div className="flex flex-wrap gap-3">
                    <input type="text" placeholder="Search products..." value={filters.search} onChange={e => setFilters(f => ({...f, search: e.target.value}))} onKeyDown={e => e.key === 'Enter' && applyFilters()} className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-1 focus:ring-[#38b34a]/20 min-w-[180px] bg-slate-50" />
                    <select value={filters.active} onChange={e => setFilters(f => ({...f, active: e.target.value}))} className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] bg-slate-50">
                      <option value="">All Status</option>
                      <option value="true">Active Only</option>
                      <option value="false">Inactive Only</option>
                    </select>
                    <select value={filters.category_id} onChange={e => { handleFilterCategoryChange(e.target.value); setFilters(f => ({...f, category_id: e.target.value})) }} className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] bg-slate-50">
                      <option value="">All Categories</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={filters.sub_category_id} onChange={e => setFilters(f => ({...f, sub_category_id: e.target.value}))} className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] bg-slate-50">
                      <option value="">All Sub-Categories</option>
                      {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                    </select>
                    <button onClick={applyFilters} className="px-4 py-2 bg-[#1e3e6b] text-white rounded-xl text-sm font-bold hover:bg-[#152d50] cursor-pointer">Apply Filters</button>
                  </div>
                  <button onClick={openCreateProduct} className="px-4 py-2 bg-[#38b34a] text-white rounded-xl text-sm font-bold hover:bg-[#2d9a3e] cursor-pointer flex items-center gap-1.5">＋ Create Product</button>
                </div>
              </div>

              {/* Products table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-800">Products <span className="text-xs font-bold text-slate-400 ml-1">({products.length})</span></h3>
                  <span className="text-xs text-slate-400 font-semibold">Active: {products.filter(p => p.is_active).length} · Inactive: {products.filter(p => !p.is_active).length}</span>
                </div>
                {productsLoading ? (
                  <div className="text-center py-12 text-slate-400 font-bold"><span className="inline-block animate-spin mr-2">🔄</span>Loading products...</div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 text-slate-400"><span className="text-4xl block">📦</span><p className="font-bold mt-2">No products found. Click "Create Product" to add one.</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="px-5 py-3">ID</th><th className="px-5 py-3">Name</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Sub-Category</th><th className="px-5 py-3 text-right">Processing Fee</th><th className="px-5 py-3 text-right">Monthly</th><th className="px-5 py-3 text-center">Discounts</th><th className="px-5 py-3 text-center">Status</th><th className="px-5 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {products.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3 font-mono font-bold text-slate-500">{p.id}</td>
                            <td className="px-5 py-3">
                              <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                              {p.description && <p className="text-[10px] text-slate-400 max-w-[180px] truncate">{p.description}</p>}
                            </td>
                            <td className="px-5 py-3">
                              {p.category_name ? <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-bold">{p.category_name}</span> : <span className="text-slate-300">—</span>}
                            </td>
                            <td className="px-5 py-3">
                              {p.sub_category_name ? <span className="px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-100 font-bold">{p.sub_category_name}</span> : <span className="text-slate-300">—</span>}
                            </td>
                            <td className="px-5 py-3 text-right font-black text-slate-800">₹{Number(p.processing_fee || 0).toLocaleString('en-IN')}</td>
                            <td className="px-5 py-3 text-right font-black text-slate-700">₹{Number(p.monthly_subscription || 0).toLocaleString('en-IN')}</td>
                            <td className="px-5 py-3 text-center">
                              <div className="text-[10px] text-slate-500 leading-relaxed">
                                <div>M: <strong>{p.discounts?.monthly ?? 0}%</strong></div>
                                <div>Q: <strong>{p.discounts?.quarterly ?? 0}%</strong></div>
                                <div>H: <strong>{p.discounts?.half_yearly ?? 0}%</strong></div>
                                <div>A: <strong>{p.discounts?.annual ?? 0}%</strong></div>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${p.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>{p.is_active ? 'Active' : 'Inactive'}</span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex gap-1.5 flex-wrap justify-center">
                                <button onClick={() => openEditProduct(p)} className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/60 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 text-[10px] cursor-pointer shadow-sm">
                                  📝 Edit
                                </button>
                                <button onClick={() => openDiscountModal(p)} className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200/60 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 text-[10px] cursor-pointer shadow-sm">
                                  🏷️ Discounts
                                </button>
                                <button onClick={() => handleToggleProductStatus(p.id)} className={`px-2.5 py-1.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 text-[10px] cursor-pointer border shadow-sm ${
                                  p.is_active
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200/60'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200/60'
                                }`}>
                                  {p.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                                </button>
                                <button onClick={() => handleDeleteProduct(p)} className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 text-[10px] cursor-pointer shadow-sm">
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: CATEGORIES ───────────────────────────────────────────────── */}
          {activePageTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">🗂️ Product Categories <span className="text-[11px] font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{categories.length}</span></h3>
                <button onClick={openCreateCategory} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-xs font-bold hover:shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer">＋ Add Category</button>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold italic">No categories yet. Click "Add Category" to create one.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="bg-white hover:bg-slate-50/40 border border-slate-200/60 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-black text-slate-800 tracking-tight">{cat.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border ${
                            cat.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                              : 'bg-rose-50 text-rose-700 border-rose-200/60'
                          }`}>{cat.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                        {cat.description && <p className="text-xs text-slate-400 font-semibold mt-2.5 line-clamp-2">{cat.description}</p>}
                        <div className="mt-4 text-[10px] font-bold text-slate-400 bg-slate-100/60 px-2.5 py-1 rounded-lg inline-block">
                          🏷️ Products: <span className="text-[#1e3e6b] font-black">{cat.products_count ?? 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-slate-200/40">
                        <button onClick={() => openEditCategory(cat)} className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/60 rounded-xl font-black text-[10px] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer">
                          📝 Edit
                        </button>
                        <button onClick={() => handleToggleCategoryStatus(cat.id)} className={`flex-1 py-1.5 border rounded-xl font-black text-[10px] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${
                          cat.is_active
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200/60'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200/60'
                        }`}>
                          {cat.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                        </button>
                        <button onClick={() => handleDeleteCategory(cat)} className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 rounded-xl font-black text-[10px] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: SUBCATEGORIES ────────────────────────────────────────────── */}
          {activePageTab === 'subcategories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">📂 Sub-Categories <span className="text-[11px] font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{subCategories.length}</span></h3>
                <button onClick={openCreateSubCat} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-xl text-xs font-bold hover:shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer">＋ Add Sub-Category</button>
              </div>

              {subCategories.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold italic">No sub-categories yet. Click "Add Sub-Category" to create one.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subCategories.map(sc => {
                    const parent = categories.find(c => Number(c.id) === Number(sc.category_id))
                    return (
                      <div key={sc.id} className="bg-white hover:bg-slate-50/40 border border-slate-200/60 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="text-sm font-black text-slate-800 tracking-tight">{sc.name}</h4>
                              <p className="text-[9px] font-extrabold text-slate-400 mt-1.5 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-md inline-block">📁 {parent?.name || '—'}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border ${
                              sc.is_active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                : 'bg-rose-50 text-rose-700 border-rose-200/60'
                            }`}>{sc.is_active ? 'Active' : 'Inactive'}</span>
                          </div>
                          {sc.description && <p className="text-xs text-slate-400 font-semibold mt-2.5 line-clamp-2">{sc.description}</p>}
                          <div className="mt-4 text-[10px] font-bold text-slate-400 bg-slate-100/60 px-2.5 py-1 rounded-lg inline-block">
                            🏷️ Products: <span className="text-[#1e3e6b] font-black">{sc.products_count ?? 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-slate-200/40">
                          <button onClick={() => openEditSubCat(sc)} className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/60 rounded-xl font-black text-[10px] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer">
                            📝 Edit
                          </button>
                          <button onClick={() => handleToggleSubCatStatus(sc.id)} className={`flex-1 py-1.5 border rounded-xl font-black text-[10px] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${
                            sc.is_active
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200/60'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200/60'
                          }`}>
                            {sc.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                          </button>
                          <button onClick={() => handleDeleteSubCat(sc)} className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 rounded-xl font-black text-[10px] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer">
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default AdminProducts
