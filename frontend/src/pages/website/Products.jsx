import { useState } from 'react'
import ProductGrid from '../../components/website/products/ProductGrid'
import ProductFilter from '../../components/website/products/ProductFilter'
import ProductSearch from '../../components/website/products/ProductSearch'

const Products = () => {
  const [filters, setFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="container-custom py-12 animate-fade-in">
      <h1 className="text-4xl font-black text-aim-copy mb-8">Our Products</h1>
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ProductSearch onSearch={setSearchQuery} />
          <ProductFilter onFilter={setFilters} />
        </div>
        <div className="lg:col-span-3">
          <ProductGrid filters={{ ...filters, search: searchQuery }} />
        </div>
      </div>
    </div>
  )
}

export default Products