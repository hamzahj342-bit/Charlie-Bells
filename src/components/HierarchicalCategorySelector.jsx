import React, { useState, useEffect } from 'react';
import { themeApi } from '../services/themeApi';
import { Tags, Loader2 } from 'lucide-react';

const HierarchicalCategorySelector = ({ onCategorySelect, selectedCategory }) => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    loadCategories(); 
  }, []);

  // Update selected when selectedCategory prop changes
  useEffect(() => {
    if (selectedCategory?.id) {
      setSelected(selectedCategory.id.toString());
    } else {
      setSelected('');
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await themeApi.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value) => {
    setSelected(value);
    
    // Find the actual category object to pass up
    const categoryObj = categories.find(c => c.id === parseInt(value));
    onCategorySelect(categoryObj || null);
  };

  return (
    <div className="p-3 bg-light rounded-3 border">
      <div className="mb-3">
        <label className="form-label small fw-bold text-uppercase text-muted">
          <Tags size={14} className="me-1 text-primary" /> Select Category
        </label>
        <select 
          className="form-select shadow-sm" 
          value={selected} 
          onChange={(e) => handleChange(e.target.value)}
        >
          <option value="">Choose a category...</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center mt-2">
          <Loader2 size={16} className="spinner-border-sm animate-spin" />
        </div>
      )}
    </div>
  );
};

export default HierarchicalCategorySelector;