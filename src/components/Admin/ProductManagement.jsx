import React from 'react';
import { Package, Plus, Search, Edit, Trash2, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

const Products = ({ 
  products, 
  searchTerm, 
  setSearchTerm, 
  handleAddProduct, 
  handleEditProduct, 
  handleDeleteProduct 
}) => {
  const filteredProducts = (products || []).filter(product =>
    product && product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="row animate__animated animate__fadeIn">
      <div className="col-12">
        {/* Header Card */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <div className="card-header bg-white py-3 border-0">
            <div className="row align-items-center g-3">
              <div className="col-md-4">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                  <Package size={22} className="text-primary" /> 
                  Inventory Stock
                </h5>
                <p className="text-muted small mb-0">Manage chemical and detergent inventory</p>
              </div>
              
              <div className="col-md-8">
                <div className="d-flex flex-wrap justify-content-md-end gap-2">
                  {/* Search Bar */}
                  <div className="input-group" style={{ maxWidth: '350px' }}>
                    <span className="input-group-text bg-light border-0">
                      <Search size={16} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 bg-light shadow-none"
                      placeholder="Search batch or product..."
                      style={{ fontSize: '0.9rem' }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {/* Add Button */}
                  <button 
                    className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm" 
                    style={{ backgroundColor: '#0284c7', border: 'none', borderRadius: '8px' }}
                    onClick={handleAddProduct}
                  >
                    <Plus size={18} />
                    <span>New Entry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    <th className="px-4 py-3 border-0">PRODUCT SPECIFICATIONS</th>
                    <th className="text-center py-3 border-0">CATEGORY</th>
                    <th className="text-center py-3 border-0">UNIT PRICE</th>
                    <th className="text-center py-3 border-0">STOCK LEVEL</th>
                    <th className="text-center py-3 border-0">AVAILABILITY</th>
                    <th className="text-end px-4 py-3 border-0">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id || Math.random()}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded p-1 me-3 border shadow-sm" style={{ width: '50px', height: '50px' }}>
                              <img 
                                src={product.image_url || '/placeholder-chemical.png'} 
                                alt={product.name} 
                                className="w-100 h-100 rounded" 
                                style={{ objectFit: 'contain' }}
                              />
                            </div>
                            <div>
                              <h6 className="mb-0 fw-semibold" style={{ color: '#334155' }}>{product.name}</h6>
                              <code className="text-muted" style={{ fontSize: '0.75rem' }}>SKU-{(product.id || '').toString().padStart(5, '0')}</code>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-soft-info text-info px-3" style={{ backgroundColor: '#e0f2fe' }}>
                            {product.category_relation?.name || 'Bulk'}
                          </span>
                        </td>
                        <td className="text-center fw-medium text-dark">
                          Rs. {Number(product.price || 0).toLocaleString()}
                        </td>
                        <td className="text-center">
                          <div className="d-flex flex-column align-items-center">
                            <span className={`badge ${(product.stock_quantity || 0) > 10 ? 'bg-success' : 'bg-danger'} rounded-pill`} style={{ fontSize: '0.75rem' }}>
                              {product.stock_quantity || 0} units
                            </span>
                            {(product.stock_quantity || 0) <= 10 && (
                              <small className="text-danger mt-1 d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
                                <AlertCircle size={10} /> Low Stock
                              </small>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          {product.is_active ? (
                            <span className="text-success d-flex align-items-center justify-content-center gap-1 small fw-bold">
                              <CheckCircle2 size={14} /> ACTIVE
                            </span>
                          ) : (
                            <span className="text-muted d-flex align-items-center justify-content-center gap-1 small">
                              INACTIVE
                            </span>
                          )}
                        </td>
                        <td className="text-end px-4">
                          <div className="btn-group shadow-sm border rounded">
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="btn btn-white btn-sm border-end px-3"
                              title="Edit Formula"
                            >
                              <Edit size={15} className="text-primary" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="btn btn-white btn-sm px-3"
                              title="Archive Product"
                            >
                              <Trash2 size={15} className="text-danger" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <Package size={48} className="text-muted opacity-25 mb-3" />
                        <h6 className="text-muted">No products found matching your search.</h6>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;