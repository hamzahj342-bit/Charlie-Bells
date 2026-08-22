import React from 'react';
import { 
  X, Save, Beaker, ClipboardList, 
  Image as ImageIcon, Hash, Tag, 
  Layers, AlertCircle, UploadCloud, Trash2 
} from 'lucide-react';

const ProductModal = ({ 
  onClose, 
  productForm, 
  setProductForm, 
  editingProduct, 
  nextSku, 
  categories, 
  uploadedImages, 
  uploadingImages, 
  handleImageUpload, 
  removeUploadedImage, 
  handleSaveProduct
}) => {
  return (
    <>
      {/* Backdrop with High-End Blur */}
      <div 
        className="modal-backdrop show" 
        style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1040 
        }}
      ></div>

      <div className="modal fade show d-flex align-items-center justify-content-center" 
           style={{ position: 'fixed', top: 0, left: 0, zIndex: 1050, width: '100%', height: '100%' }}>
        
        <div className="modal-dialog modal-lg border-0 shadow-lg" style={{ maxWidth: '850px', width: '95%' }}>
          <div className="modal-content border-0 overflow-hidden" style={{ borderRadius: '24px', maxHeight: '92vh' }}>
            
            {/* Header - Home Care */}
            <div className="modal-header border-0 p-4 align-items-center" style={{ backgroundColor: '#0f172a', color: 'white' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#0284c7' }}>
                  <Beaker size={26} className="text-white" />
                </div>
                <div>
                  <h5 className="modal-title fw-bold mb-0" style={{ fontSize: '1.25rem', letterSpacing: '-0.5px', color: 'white', margin: '10px 0px 0px 15px' }}>
                    {editingProduct ? 'Update Product' : 'Product Registration'}
                  </h5>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <span className="badge bg-soft-info text-info fw-normal" style={{ backgroundColor: 'rgba(2, 132, 199, 0.2)', fontSize: '0.7rem' }}>
                       MOD-2026-V1
                    </span>
                    <span className="text-white-50 small" style={{ fontSize: '0.75rem' }}>Inventory Control Protocol</span>
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-close btn-close-white shadow-none ms-auto" 
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body p-4 bg-light" style={{ overflowY: 'auto' }}>
              <div className="row g-4">
                
                {/* Right Column: Information & Classification */}
                <div className="col-lg-7">
                  <div className="d-flex flex-column gap-4">
                    
                    {/* General Info Card */}
                    <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '16px' }}>
                      <h6 className="text-dark fw-bold mb-3 d-flex align-items-center gap-2">
                        <ClipboardList size={18} className="text-primary" /> Core Details
                      </h6>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label small fw-bold text-muted mb-1">Product Name</label>
                          <input
                            type="text"
                            className="form-control border-0 bg-light p-2 shadow-none"
                            style={{ borderRadius: '8px' }}
                            placeholder="e.g. Detergents, Cleaners, Chemicals ..."
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted mb-1">SKU</label>
                          <div className="input-group">
                            <span className="input-group-text border-0 bg-light text-muted" style={{ borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                              <Hash size={14} />
                            </span>
                            <input
                              type="text"
                              className="form-control border-0 bg-light shadow-none fw-bold"
                              style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
                              value={editingProduct ? editingProduct.sku : nextSku}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted mb-1">Category</label>
                          <select
                            className="form-select border-0 bg-light shadow-none"
                            style={{ borderRadius: '8px' }}
                            value={productForm.category_id}
                            onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                          >
                            <option value="">Select Category</option>
                            {categories.filter(c => c).map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Stock Card */}
                    <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '16px' }}>
                      <h6 className="text-dark fw-bold mb-3 d-flex align-items-center gap-2">
                        <Tag size={18} className="text-primary" /> Inventory Parameters
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted mb-1">Unit Price (PKR)</label>
                          <div className="input-group">
                            <span className="input-group-text border-0 bg-light small fw-bold">Rs.</span>
                            <input
                              type="number"
                              className="form-control border-0 bg-light shadow-none"
                              style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
                              value={productForm.price}
                              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted mb-1">Discount Price (PKR)</label>
                          <div className="input-group">
                            <span className="input-group-text border-0 bg-light small fw-bold">Rs.</span>
                            <input
                              type="number"
                              className="form-control border-0 bg-light shadow-none"
                              style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
                              placeholder="Optional - Leave empty for no discount"
                              value={productForm.discount_price || ''}
                              onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted mb-1">Initial Stock Quantity</label>
                          <input
                            type="number"
                            className="form-control border-0 bg-light shadow-none"
                            style={{ borderRadius: '8px' }}
                            placeholder="0.00"
                            value={productForm.stock_quantity}
                            onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted mb-1">Barcode</label>
                          <input
                            type="text"
                            className="form-control border-0 bg-light shadow-none"
                            style={{ borderRadius: '8px' }}
                            placeholder="e.g. 1234567890123 (Optional)"
                            value={productForm.barcode || ''}
                            onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                          />
                          <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                            Product barcode for inventory tracking
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Left Column: Visuals & Notes */}
                <div className="col-lg-5">
                  <div className="d-flex flex-column h-100 gap-4">
                    
                    {/* Media Card */}
                    <div className="card border-0 shadow-sm p-3 flex-grow-1" style={{ borderRadius: '16px' }}>
                      <h6 className="text-dark fw-bold mb-3 d-flex align-items-center gap-2">
                        <ImageIcon size={18} className="text-primary" /> Product Assets
                      </h6>
                      
                      <div className="bg-light border-2 border-dashed rounded-4 p-4 text-center mb-3" 
                           style={{ borderColor: '#cbd5e1' }}>
                        <input
                          type="file"
                          id="imageUpload"
                          className="d-none"
                          multiple
                          onChange={(e) => handleImageUpload(e.target.files)}
                          disabled={uploadingImages}
                        />
                        <label htmlFor="imageUpload" className="cursor-pointer w-100 mb-0">
                          <div className="bg-white rounded-circle shadow-sm p-3 mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                            <UploadCloud size={24} className="text-primary" />
                          </div>
                          <p className="mb-0 fw-bold small text-dark">Drop images here</p>
                          <p className="text-muted" style={{ fontSize: '0.65rem' }}>PNG or JPG (Max 5MB)</p>
                        </label>
                      </div>

                      {/* Image Preview Grid */}
                      <div className="row g-2">
                        {uploadedImages.map((img, idx) => (
                          <div key={idx} className="col-4">
                            <div className="position-relative rounded overflow-hidden shadow-sm" style={{ height: '70px', border: '1px solid #e2e8f0' }}>
                              <img src={img} alt="Preview" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                              <button 
                                className="btn btn-danger p-0 position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center"
                                onClick={() => removeUploadedImage(idx)}
                                style={{ width: '18px', height: '18px', borderRadius: '4px', fontSize: '10px' }}
                              >×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Batch Instructions Card */}
                    <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '16px', backgroundColor: '#f8fafc' }}>
                      <div className="d-flex gap-2">
                        <AlertCircle size={18} className="text-warning flex-shrink-0" />
                        <div>
                          <p className="small fw-bold text-dark mb-1">Batch Registration Note:</p>
                          <p className="text-muted mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                            Chemical product listings should include concentration or pack size in the title (e.g. <strong>"Cleaner 5 Litre"</strong>). 
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Full Width Description Area */}
                <div className="col-12 mt-0">
                  <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '16px' }}>
                    <label className="form-label small fw-bold text-muted mb-2 d-flex align-items-center gap-2">
                      <Layers size={14} className="text-primary" /> Technical Description & Formulation Notes
                    </label>
                    <textarea
                      className="form-control border-0 bg-light shadow-none"
                      style={{ borderRadius: '8px' }}
                      rows="2"
                      placeholder="Add chemical details, handling warnings, or storage requirements..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer - Solid Action Bar */}
            <div className="modal-footer border-0 p-4 bg-white shadow-lg d-flex justify-content-between align-items-center">
              <button 
                className="btn btn-link text-decoration-none text-muted fw-bold small" 
                onClick={onClose}
              >
                DISCARD CHANGES
              </button>
              
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-primary px-5 py-2 fw-bold d-flex align-items-center gap-2 shadow"
                  style={{ backgroundColor: '#0284c7', border: 'none', borderRadius: '10px' }}
                  onClick={handleSaveProduct}
                >
                  <Save size={18} />
                  {editingProduct ? 'Update Formulation' : 'Finalize Registration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductModal;