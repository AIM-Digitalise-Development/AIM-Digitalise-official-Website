const ProductSearch = ({ onSearch }) => (
  <div className="mb-4">
    <input
      type="text"
      placeholder="Search products..."
      className="input-brand"
      onChange={(e) => onSearch(e.target.value)}
    />
  </div>
)
export default ProductSearch