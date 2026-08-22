import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package, Save, X, Ruler } from 'lucide-react';
import { themeApi } from '../../services/themeApi';
import toast from 'react-hot-toast';

const SizeManagement = () => {
  const [sizes, setSizes] = useState([]);
  const [newSize, setNewSize] = useState({ size: '', description: '' });
  const [editingSize, setEditingSize] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const data = await themeApi.getSizes();
      setSizes(data);
    } catch (error) {
      toast.error('Failed to fetch sizes');
    } finally {
      setLoading(false);
    }
  };

  const addSize = async () => {
    if (!newSize.size.trim()) {
      toast.error('Please enter a size name');
      return;
    }

    try {
      await themeApi.createSize(newSize);
      toast.success('Size added successfully!');
      setNewSize({ size: '', description: '' });
      fetchSizes();
    } catch (error) {
      toast.error('Failed to add size');
    }
  };

  const updateSize = async () => {
    if (!editingSize || !editingSize.size.trim()) {
      toast.error('Please enter a size name');
      return;
    }

    try {
      await themeApi.updateSize(editingSize.id, editingSize);
      toast.success('Size updated successfully!');
      setEditingSize(null);
      fetchSizes();
    } catch (error) {
      toast.error('Failed to update size');
    }
  };

  const deleteSize = async (id) => {
    if (window.confirm('Are you sure you want to delete this size?')) {
      try {
        await themeApi.deleteSize(id);
        toast.success('Size deleted successfully!');
        fetchSizes();
      } catch (error) {
        toast.error('Failed to delete size');
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary mb-2" role="status" style={{ color: '#f26522' }}></div>
        <span className="text-muted small">Loading Sizes...</span>
      </div>
    );
  }

  return (
    <div className="size-management animate__animated animate__fadeIn">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border-start border-4 border-warning">
        <div>
          <h4 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <Ruler size={22} className="text-warning" /> Inventory Sizes
          </h4>
          <p className="text-muted small mb-0">Define product size variations (e.g., 2-3 Years, XL)</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Add Size Form */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
            <div className="card-header bg-dark text-white p-3 border-0">
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Plus size={18} /> {editingSize ? 'Edit Size' : 'Create New Size'}
              </h6>
            </div>
            <div className="card-body p-4">
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">SIZE LABEL</label>
                <input
                  type="text"
                  className="form-control form-control-lg bg-light border-0 shadow-none"
                  placeholder="e.g., 6-12 Months"
                  style={{ fontSize: '0.95rem' }}
                  value={editingSize ? editingSize.size : newSize.size}
                  onChange={(e) => editingSize 
                    ? setEditingSize({ ...editingSize, size: e.target.value })
                    : setNewSize({ ...newSize, size: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">DESCRIPTION</label>
                <textarea
                  className="form-control bg-light border-0 shadow-none"
                  rows="3"
                  placeholder="Age group or specific measurements..."
                  value={editingSize ? editingSize.description : newSize.description}
                  onChange={(e) => editingSize 
                    ? setEditingSize({ ...editingSize, description: e.target.value })
                    : setNewSize({ ...newSize, description: e.target.value })
                  }
                ></textarea>
              </div>

              {editingSize ? (
                <div className="d-flex gap-2">
                  <button className="btn btn-warning flex-grow-1 text-white fw-bold" onClick={updateSize}>
                    <Save size={18} className="me-1" /> Update
                  </button>
                  <button className="btn btn-light border" onClick={() => setEditingSize(null)}>
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button 
                  className="btn btn-primary w-100 fw-bold py-2 shadow-sm" 
                  onClick={addSize}
                  style={{ backgroundColor: '#f26522', border: 'none' }}
                >
                  <Plus size={18} className="me-1" /> Add Size
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sizes List Grid */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 border-0 small text-muted">SIZE</th>
                      <th className="py-3 border-0 small text-muted">DESCRIPTION</th>
                      <th className="py-3 border-0 text-end px-4 small text-muted">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.length > 0 ? (
                      sizes.map((size) => (
                        <tr key={size.id}>
                          <td className="px-4 py-3">
                            <span className="badge bg-soft-primary text-primary px-3 py-2 fs-6" style={{ backgroundColor: '#e3f2fd' }}>
                              {size.size}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="text-muted small">{size.description || '—'}</span>
                          </td>
                          <td className="text-end px-4 py-3">
                            <div className="btn-group shadow-sm rounded-pill overflow-hidden">
                              <button
                                className="btn btn-white btn-sm px-3 border-end"
                                onClick={() => setEditingSize({ ...size })}
                              >
                                <Edit2 size={15} className="text-primary" />
                              </button>
                              <button
                                className="btn btn-white btn-sm px-3"
                                onClick={() => deleteSize(size.id)}
                              >
                                <Trash2 size={15} className="text-danger" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-5">
                          <Package size={40} className="text-muted opacity-25 mb-2" />
                          <p className="text-muted mb-0">No sizes found in database.</p>
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
    </div>
  );
};

export default SizeManagement;