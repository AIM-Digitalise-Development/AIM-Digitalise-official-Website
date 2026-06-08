const ProductCard = ({ product }) => (
  <div className="card-elevated p-5 shadow-lg">
    <h3 className="font-semibold text-aim-copy text-lg">{product?.name || 'Product Name'}</h3>
    <p className="text-aim-copy-muted mt-1">${product?.price || '99.99'}</p>
    <button className="btn-primary mt-4 w-full">Add to Cart</button>
  </div>
)
export default ProductCard