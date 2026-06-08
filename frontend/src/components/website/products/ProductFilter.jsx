const ProductFilter = ({ onFilter }) => (
  <div className="card-elevated p-5 shadow-lg">
    <h3 className="font-semibold mb-3 text-aim-copy text-lg">Filters</h3>
    <select className="input-brand py-2.5 px-3">
      <option className="bg-aim-navy text-aim-copy">Category 1</option>
      <option className="bg-aim-navy text-aim-copy">Category 2</option>
    </select>
  </div>
)
export default ProductFilter