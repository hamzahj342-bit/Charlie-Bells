import React, { useState } from 'react';
import { Edit, Trash2, Plus, Tags, Info } from 'lucide-react';
import { themeApi } from '../../services/themeApi';
import toast from 'react-hot-toast';

const CategoryManagement = ({ categories, onCategoriesChange }) => {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ 
    name: '', 
    description: '', 
    image_url: ''
  });

  // --- Functions ---

  const handleAddClick = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '', image_url: '' });
    setShowCategoryForm(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || '',
      description: category.description || '',
      image_url: category.image_url || ''
    });
    setShowCategoryForm(true);
  };

  const handleDeleteClick = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This might affect products linked to it.')) {
      try {
        await themeApi.deleteCategory(categoryId);
        toast.success('Category deleted successfully!');
        onCategoriesChange(); // Refresh list
      } catch (error) {
        toast.error('Failed to delete category');
        console.error(error);
      }
    }
  };

  const handleSave = async () => {
    if (!categoryForm.name.trim()) {
      return toast.error("Category name is required");
    }

    try {
      if (editingCategory) {
        await themeApi.updateCategory(editingCategory.id, categoryForm);
        toast.success('Category updated successfully!');
      } else {
        await themeApi.createCategory(categoryForm);
        toast.success('New category created!');
      }
      setShowCategoryForm(false);
      onCategoriesChange(); // Refresh parent component's list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error saving category');
    }
  };

  return (
    <div className="category-management animate__animated animate__fadeIn">
      {/* Header Area */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm">
        <div>
          <h4 className="fw-bold mb-0 text-dark">Product Categories</h4>
          <span className="badge bg-soft-primary text-primary" style={{ backgroundColor: '#e1f5fe', color: '#039be5' }}>
            Chemical Categories
          </span>
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2" 
          onClick={handleAddClick}
          style={{ backgroundColor: '#f26522', border: 'none' }}
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Guide Card */}
      <div className="card border-0 shadow-sm mb-4 bg-light">
        <div className="card-body d-flex align-items-center gap-3">
          <div className="p-3 bg-white rounded-circle shadow-sm"><Tags className="text-warning" /></div>
          <div>
            <h6 className="mb-1 fw-bold">Simple Categories</h6>
            <p className="small text-muted mb-0">Create categories like: Detergents, Chemicals, Cleaning Solutions, etc.</p>
          </div>
        </div>
      </div>

      {/* Grid List */}
      <div className="row g-3">
        {categories.length > 0 ? (
          categories.map(cat => (
            <div key={cat.id} className="col-md-4 col-sm-6">
              <div className="card h-100 border-0 shadow-sm transition" style={{ borderRadius: '12px' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="p-2 rounded bg-light">
                      <Tags size={16} style={{ color: '#f26522' }} />
                    </div>
                    <span className="badge bg-primary">
                      Active Category
                    </span>
                  </div>
                  <h6 className="fw-bold mb-1 text-capitalize">{cat.name}</h6>
                  <p className="small text-muted mb-3" style={{ height: '40px', overflow: 'hidden' }}>
                    {cat.description || 'No description provided.'}
                  </p>
                  
                  <div className="d-flex gap-2 pt-2 border-top">
                    <button 
                      className="btn btn-sm btn-light flex-grow-1 d-flex align-items-center justify-content-center gap-1" 
                      onClick={() => handleEditClick(cat)}
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={() => handleDeleteClick(cat.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <p className="text-muted">No categories found. Start by adding one!</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showCategoryForm && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold">{editingCategory ? 'Update Category' : 'New Category'}</h5>
                <button className="btn-close" onClick={() => setShowCategoryForm(false)}></button>
              </div>
              <div className="modal-body p-4">
                <label className="form-label small fw-bold text-muted text-uppercase">Category Details</label>
                <input 
                  className="form-control mb-3 shadow-sm" 
                  placeholder="e.g. Detergents, Chemicals, Cleaning Solutions" 
                  value={categoryForm.name} 
                  onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} 
                />
                <textarea 
                  className="form-control shadow-sm mb-3" 
                  rows="2" 
                  placeholder="Brief description of this category..."
                  value={categoryForm.description} 
                  onChange={e => setCategoryForm({...categoryForm, description: e.target.value})}
                ></textarea>
                <input 
                  className="form-control shadow-sm" 
                  placeholder="Image URL (optional)" 
                  value={categoryForm.image_url} 
                  onChange={e => setCategoryForm({...categoryForm, image_url: e.target.value})} 
                />
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light px-4" onClick={() => setShowCategoryForm(false)}>Cancel</button>
                <button 
                  className="btn btn-primary px-4 shadow" 
                  style={{ backgroundColor: '#f26522', border: 'none' }} 
                  onClick={handleSave}
                >
                  {editingCategory ? 'Update Now' : 'Save Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;