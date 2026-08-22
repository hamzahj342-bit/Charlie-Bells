import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const SizeManager = ({ sizes, onChange }) => {
  const [newSize, setNewSize] = useState({ size: '', quantity: 1 });

  const addSize = () => {
    if (newSize.size && newSize.quantity > 0) {
      const updatedSizes = [...sizes, { ...newSize }];
      onChange(updatedSizes);
      setNewSize({ size: '', quantity: 1 });
    }
  };

  const removeSize = (index) => {
    const updatedSizes = sizes.filter((_, i) => i !== index);
    onChange(updatedSizes);
  };

  const updateSize = (index, field, value) => {
    const updatedSizes = sizes.map((size, i) => 
      i === index ? { ...size, [field]: field === 'quantity' ? parseInt(value) || 0 : value } : size
    );
    onChange(updatedSizes);
  };

  const commonSizes = ['9-12 months', '12-18 months', '18-24 months', '2-3 years', '3-4 years', '4-5 years', '5-6 years', '6-7 years', '7-8 years', '9-10 years'];

  return (
    <div className="size-manager">
      <div className="mb-3">
        <label className="form-label">Add Sizes</label>
        <div className="row g-2">
          <div className="col-md-4">
            <select
              className="form-select"
              value={newSize.size}
              onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
            >
              <option value="">Select size</option>
              {commonSizes.map((size, index) => (
                <option key={typeof size === 'string' ? size : `size-${index}`} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <input
              type="number"
              className="form-control"
              placeholder="Quantity"
              min="1"
              value={newSize.quantity}
              onChange={(e) => setNewSize({ ...newSize, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div className="col-md-4">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={addSize}
              disabled={!newSize.size || newSize.quantity <= 0}
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
                      <div className="col-6">
                        <select
                          className="form-select form-select-sm"
                          value={sizeItem.size}
                          onChange={(e) => updateSize(index, 'size', e.target.value)}
                        >
                          {commonSizes.map((size, index) => (
                            <option key={typeof size === 'string' ? size : `size-${index}`} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-4">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          min="0"
                          value={sizeItem.quantity}
                          onChange={(e) => updateSize(index, 'quantity', e.target.value)}
                        />
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
                        Size: {typeof sizeItem.size === 'string' ? sizeItem.size : JSON.stringify(sizeItem.size)} | Quantity: {sizeItem.quantity}
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
  );
};

export default SizeManager;
