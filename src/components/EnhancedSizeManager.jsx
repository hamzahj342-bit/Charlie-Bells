import { useState, useEffect } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { themeApi } from '../services/themeApi';

const EnhancedSizeManager = ({ productType, sizes, onChange }) => {
  const [newSize, setNewSize] = useState({ size: '' });
  const [availableSizes, setAvailableSizes] = useState([]);

  // Fetch sizes from database
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const sizesData = await themeApi.getSizes();
        setAvailableSizes(sizesData.sizes || sizesData || []);
      } catch (error) {
        console.error('Error fetching sizes:', error);
        // Fallback to common sizes if API fails
        setAvailableSizes(['9-12 months', '12-18 months', '18-24 months', '2-3 years', '3-4 years', '4-5 years', '5-6 years', '6-7 years', '7-8 years', '9-10 years']);
      }
    };

    fetchSizes();
  }, []);

  const addSize = () => {
    if (newSize.size) {
      const updatedSizes = [...sizes, { size: newSize.size }];
      onChange(updatedSizes);
      setNewSize({ size: '' });
    }
  };

  const removeSize = (index) => {
    const updatedSizes = sizes.filter((_, i) => i !== index);
    onChange(updatedSizes);
  };

  const updateSize = (index, field, value) => {
    const updatedSizes = sizes.map((size, i) => 
      i === index ? { ...size, [field]: value } : size
    );
    onChange(updatedSizes);
  };

  const applyToAllSizes = () => {
    const updatedSizes = availableSizes.map(size => ({
      size: typeof size === 'string' ? size : size.size
    }));
    onChange(updatedSizes);
  };

  if (productType === 'all') {
    return (
      <div className="enhanced-size-manager">
        <div className="card">
          <div className="card-header bg-orange text-white" style={{ backgroundColor: '#f26522' }}>
            <h6 className="mb-0">
              <Package size={16} className="me-2" />
              All Size Product - Same Quantity for All Sizes
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Add All Available Sizes</label>
                <p className="text-muted mb-3">
                  This will add all available sizes to the product: {availableSizes.map(s => typeof s === 'string' ? s : s.size).join(', ')}
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={applyToAllSizes}
                  style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                >
                  <Package size={16} className="me-2" />
                  Add All Sizes
                </button>
              </div>
            </div>

            {sizes && sizes.length > 0 && (
              <div className="mt-3">
                <label className="form-label">Current Sizes</label>
                <div className="row">
                  {sizes.map((sizeItem, index) => (
                    <div key={index} className="col-md-6 mb-2">
                      <div className="card">
                        <div className="card-body p-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">{typeof sizeItem.size === 'string' ? sizeItem.size : JSON.stringify(sizeItem.size)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-2">
              <small className="text-muted">
                JSON Preview: {JSON.stringify(sizes || [])}
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single Size Product (original functionality)
  return (
    <div className="enhanced-size-manager">
      <div className="card">
        <div className="card-header bg-orange text-white" style={{ backgroundColor: '#f26522' }}>
          <h6 className="mb-0">
            <Package size={16} className="me-2" />
            Single Size Product - Individual Size Management
          </h6>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Add Sizes</label>
            <div className="row g-2">
              <div className="col-md-8">
                <select
                  className="form-select"
                  value={newSize.size}
                  onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
                >
                  <option value="">Select size</option>
                  {availableSizes.map((size, index) => (
                    <option key={typeof size === 'string' ? size : `size-${index}`} value={typeof size === 'string' ? size : size.size}>{typeof size === 'string' ? size : size.size}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={addSize}
                  disabled={!newSize.size}
                  style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {sizes && sizes.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Current Sizes</label>
              <div className="row">
                {sizes.map((sizeItem, index) => (
                  <div key={index} className="col-md-6 mb-2">
                    <div className="card">
                      <div className="card-body p-2">
                        <div className="row g-2">
                          <div className="col-10">
                            <select
                              className="form-select form-select-sm"
                              value={sizeItem.size}
                              onChange={(e) => updateSize(index, 'size', e.target.value)}
                            >
                              {availableSizes.map((size, index) => (
                                <option key={typeof size === 'string' ? size : `size-${index}`} value={typeof size === 'string' ? size : size.size}>{typeof size === 'string' ? size : size.size}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-2">
                            <button
                              type="button"
                              className="btn btn-danger btn-sm w-100"
                              onClick={() => removeSize(index)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1">
                          <small className="text-muted">
                            Size: {typeof sizeItem.size === 'string' ? sizeItem.size : JSON.stringify(sizeItem.size)}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2">
            <small className="text-muted">
              JSON Preview: {JSON.stringify(sizes || [])}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSizeManager;
