import React, { useState } from 'react';
import { Edit, Trash2, Plus, Tags } from 'lucide-react';
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
    <div className="category-management">
      <div className="sm-card d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-0" style={{ fontSize: '1.05rem' }}>Categories</h4>
          <p className="sm-muted mb-0 small">{categories.length} categories</p>
        </div>
        <button type="button" className="sm-btn-dark" onClick={handleAddClick}>
          <Plus size={16} /> Add category
        </button>
      </div>

      <div className="row g-3">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div key={cat.id} className="col-md-4 col-sm-6">
              <div className="sm-card h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="p-2 rounded" style={{ background: '#f3f0eb' }}>
                    <Tags size={16} />
                  </div>
                </div>
                <h6 className="fw-bold mb-1 text-capitalize">{cat.name}</h6>
                <p className="small sm-muted mb-3" style={{ minHeight: '40px' }}>
                  {cat.description || 'No description'}
                </p>
                <div className="d-flex gap-2 pt-2" style={{ borderTop: '1px solid #e5e0d8' }}>
                  <button
                    type="button"
                    className="sm-btn-outline flex-grow-1"
                    onClick={() => handleEditClick(cat)}
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteClick(cat.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 sm-card sm-empty">
            <p className="mb-0">No categories yet. Add one to get started.</p>
          </div>
        )}
      </div>

      {showCategoryForm && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0" style={{ borderRadius: '12px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold">{editingCategory ? 'Edit category' : 'New category'}</h5>
                <button className="btn-close" onClick={() => setShowCategoryForm(false)}></button>
              </div>
              <div className="modal-body p-4">
                <label className="form-label small fw-bold text-muted">Name</label>
                <input
                  className="form-control mb-3"
                  placeholder="Category name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                />
                <label className="form-label small fw-bold text-muted">Description</label>
                <textarea
                  className="form-control mb-3"
                  rows="2"
                  placeholder="Brief description…"
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                ></textarea>
                <label className="form-label small fw-bold text-muted">Image URL</label>
                <input
                  className="form-control"
                  placeholder="Optional"
                  value={categoryForm.image_url}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, image_url: e.target.value })
                  }
                />
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="sm-btn-outline"
                  onClick={() => setShowCategoryForm(false)}
                >
                  Cancel
                </button>
                <button type="button" className="sm-btn-dark" onClick={handleSave}>
                  {editingCategory ? 'Save changes' : 'Save category'}
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