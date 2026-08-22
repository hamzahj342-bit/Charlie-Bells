import { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, List, X, ChevronDown } from 'lucide-react';
import '../assets/css/FilterBar.css';

const FilterBar = ({ 
  searchQuery, 
  setSearchQuery, 
  onSearch, 
  sortBy, 
  setSortBy, 
  viewMode,
  setViewMode,
  priceRange,
  setPriceRange,
  onApplyFilters
}) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempPriceRange, setTempPriceRange] = useState(priceRange || { min: '', max: '' });
  
  const sortDropdownRef = useRef(null);
  const filterModalRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
      if (filterModalRef.current && !filterModalRef.current.contains(e.target) && 
          !e.target.closest('.fb-filter-btn')) {
        setShowFilterModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = [
    { value: 'created_at', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A-Z' },
    { value: 'name_desc', label: 'Name: Z-A' }
  ];

  const handleSortSelect = (value) => {
    setSortBy(value);
    setShowSortDropdown(false);
  };

  const handleApplyFilters = () => {
    setPriceRange(tempPriceRange);
    setShowFilterModal(false);
    if (onApplyFilters) onApplyFilters();
  };

  const handleClearFilters = () => {
    setTempPriceRange({ min: '', max: '' });
    setPriceRange({ min: '', max: '' });
    setShowFilterModal(false);
    if (onApplyFilters) onApplyFilters();
  };

  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option ? option.label : 'Sort By';
  };

  const hasActiveFilters = priceRange?.min || priceRange?.max;

  return (
    <div className="fb-filter-bar">
      <div className="fb-container">
        {/* Desktop Search */}
        <div className="fb-search-desktop">
          <div className="fb-search-box">
            <Search size={18} className="fb-search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            />
            {searchQuery && (
              <button 
                className="fb-clear-search" 
                onClick={() => { setSearchQuery(''); onSearch(); }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Icon */}
        <button 
          className="fb-mobile-search-btn"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
        >
          <Search size={20} />
        </button>

        {/* Right Side Controls */}
        <div className="fb-controls">
          {/* Sort Dropdown */}
          <div className="fb-sort-wrapper" ref={sortDropdownRef}>
            <button 
              className="fb-sort-btn"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              <ArrowUpDown size={16} />
              <span className="fb-btn-text">{getSortLabel()}</span>
              <ChevronDown size={14} className={`fb-chevron ${showSortDropdown ? 'open' : ''}`} />
            </button>
            
            {showSortDropdown && (
              <div className="fb-sort-dropdown">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`fb-sort-option ${sortBy === option.value ? 'active' : ''}`}
                    onClick={() => handleSortSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Button */}
          <button 
            className={`fb-filter-btn ${hasActiveFilters ? 'has-filters' : ''}`}
            onClick={() => setShowFilterModal(true)}
          >
            <SlidersHorizontal size={16} />
            <span className="fb-btn-text">Filters</span>
            {hasActiveFilters && <span className="fb-filter-badge">!</span>}
          </button>

          <div className="fb-view-toggle fb-view-toggle-mobile">
            <button
              className={`fb-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              className={`fb-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Search Expandable */}
      {showMobileSearch && (
        <div className="fb-mobile-search-expand">
          <div className="fb-search-box mobile">
            <Search size={18} className="fb-search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              autoFocus
            />
            <button className="fb-search-action" onClick={onSearch}>
              Search
            </button>
          </div>
        </div>
      )}

      {/* Filter Modal/Overlay */}
      {showFilterModal && (
        <div className="fb-filter-overlay">
          <div className="fb-filter-modal" ref={filterModalRef}>
            <div className="fb-filter-header">
              <h4>Filter Products</h4>
              <button 
                className="fb-close-modal"
                onClick={() => setShowFilterModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="fb-filter-body">
              {/* Price Range Filter */}
              <div className="fb-filter-section">
                <label className="fb-filter-label">Price Range</label>
                <div className="fb-price-inputs">
                  <div className="fb-price-field">
                    <span className="fb-price-prefix">Rs.</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={tempPriceRange.min}
                      onChange={(e) => setTempPriceRange({...tempPriceRange, min: e.target.value})}
                    />
                  </div>
                  <span className="fb-price-separator">-</span>
                  <div className="fb-price-field">
                    <span className="fb-price-prefix">Rs.</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={tempPriceRange.max}
                      onChange={(e) => setTempPriceRange({...tempPriceRange, max: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Price Presets */}
              <div className="fb-filter-section">
                <label className="fb-filter-label">Quick Select</label>
                <div className="fb-price-presets">
                  <button 
                    className="fb-preset-btn"
                    onClick={() => setTempPriceRange({ min: '', max: '1000' })}
                  >
                    Under Rs. 1000
                  </button>
                  <button 
                    className="fb-preset-btn"
                    onClick={() => setTempPriceRange({ min: '1000', max: '5000' })}
                  >
                    Rs. 1000 - 5000
                  </button>
                  <button 
                    className="fb-preset-btn"
                    onClick={() => setTempPriceRange({ min: '5000', max: '10000' })}
                  >
                    Rs. 5000 - 10000
                  </button>
                  <button 
                    className="fb-preset-btn"
                    onClick={() => setTempPriceRange({ min: '10000', max: '' })}
                  >
                    Above Rs. 10000
                  </button>
                </div>
              </div>
            </div>
            
            <div className="fb-filter-footer">
              <button className="fb-clear-filters" onClick={handleClearFilters}>
                Clear All
              </button>
              <button className="fb-apply-filters" onClick={handleApplyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
