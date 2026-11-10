import { Package, Search, Edit, Trash2 } from 'lucide-react';
import { formatMoney, hasDiscount, toMoney } from '../../utils/pricing';

const Products = ({
  products,
  searchTerm,
  setSearchTerm,
  handleEditProduct,
  handleDeleteProduct,
}) => {
  const term = (searchTerm || '').toLowerCase().trim();
  const filteredProducts = (products || []).filter((product) => {
    if (!product) return false;
    if (!term) return true;
    const name = String(product.name || '').toLowerCase();
    const sku = String(product.sku || '').toLowerCase();
    const idSku = `ind-${product.id}`.toLowerCase();
    return name.includes(term) || sku.includes(term) || idSku.includes(term);
  });

  return (
    <div>
      <div className="sm-listings-header">
        <div>
          <p className="sm-muted mb-0" style={{ fontSize: '0.85rem' }}>
            {filteredProducts.length} listing{filteredProducts.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="sm-search">
          <Search size={16} className="sm-muted" />
          <input
            type="search"
            placeholder="Search title or SKU…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search listings"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="sm-card sm-empty">
          <Package size={40} className="mb-2 opacity-50" />
          <p className="mb-0">No listings found.</p>
        </div>
      ) : (
        <div className="sm-listings-grid">
          {filteredProducts.map((product) => {
            const qty = Number(product.stock_quantity || 0);
            const sku = product.sku || `IND-${product.id}`;
            return (
              <article key={product.id} className="sm-listing-card">
                <img
                  src={product.image_url || '/placeholder-chemical.png'}
                  alt={product.name}
                  className="sm-listing-img"
                />
                <div className="sm-listing-body">
                  <h4 className="sm-listing-title">{product.name}</h4>
                  <p className="sm-listing-meta">SKU: {sku}</p>
                  <p className="sm-listing-meta">
                    {qty <= 0 ? 'Sold out' : `${qty} in stock`}
                    {!product.is_active ? ' · Inactive' : ''}
                  </p>
                  {hasDiscount(product) ? (
                    <p className="sm-listing-price">
                      <span className="sm-listing-price-old">{formatMoney(product.price)}</span>
                      <span>{formatMoney(product.discount_price)}</span>
                    </p>
                  ) : (
                    <p className="sm-listing-price">{formatMoney(toMoney(product.price))}</p>
                  )}
                </div>
                <div className="sm-listing-actions">
                  <button
                    type="button"
                    onClick={() => handleEditProduct(product)}
                    title="Edit listing"
                    aria-label={`Edit ${product.name}`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDeleteProduct(product.id)}
                    title="Delete listing"
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;
