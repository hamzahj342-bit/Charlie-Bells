import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import SideDrawer from '../components/SideDrawer';
import ThemeFooter from '../components/ThemeFooter';
import TopBar from '../components/TopBar';
import FilterBar from '../components/FilterBar';
import './DynamicCategory.css';

const DynamicCategory = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('created_at');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const categoryData = await themeApi.getCategoryById(categorySlug);
        setCategory(categoryData);
      } catch (error) {
        toast.error('Failed to load category');
        navigate('/home');
      }
    };

    if (categorySlug) fetchCategoryData();
  }, [categorySlug]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await themeApi.getProductsByCategory(categorySlug, {
          page: currentPage,
          limit: 12,
          search: searchQuery,
          sort_by: sortBy,
          ...(priceRange.min && { min_price: priceRange.min }),
          ...(priceRange.max && { max_price: priceRange.max })
        });
        
        setFilteredProducts(productsData.products || []);
        setTotalPages(productsData.pagination?.pages || 1);
      } catch (error) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) fetchProducts();
  }, [categorySlug, currentPage, debouncedSearchQuery, sortBy, priceRange]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddToCart = (product) => {
    addToCart({ 
      ...product, 
      selectedSize: "Standard",
      price: product.discount_price || product.price
    }, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (product) => {
    addToCart({ 
      ...product, 
      selectedSize: "Standard",
      price: product.discount_price || product.price
    }, 1);
    navigate('/checkout');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); 
  };

  if (loading) return (
    <div className="ct-loader-wrapper d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-3 fw-bold text-navy">Loading Bells Catalog...</p>
    </div>
  );

  return (
    <div className="ct-category-page-wrapper">
      <TopBar onMenuToggle={() => setSideDrawerOpen(true)} />
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />


      
        {/* Search Bar */}
        {/* Filter Bar */}
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={() => { setCurrentPage(1); }}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          onApplyFilters={() => { setCurrentPage(1); }}
        />

        {/* Products Grid */}
        <div className="container py-5">
        <div className={`product-grid-modern ${viewMode === 'list' ? 'list-view' : ''}`}>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-5 no-results">
              <img src="/empty-box.png" alt="No products" className="mb-3" style={{width: '80px', opacity: 0.5}} />
              <h3>No products found</h3>
              <p>Try adjusting your search filters.</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
                <div key={product.id} className={`item-card ${viewMode === 'list' ? 'list-card' : ''}`}>
                  <div className="item-thumb" onClick={() => navigate(`/product/${product.barcode || product.id}`)}>
                    <img 
                      src={product.images?.[0] || product.image_url || '/placeholder.png'} 
                      alt={product.name} 
                    />
                    {/* Discount Badge on Image */}
                    {product.discount_price && product.discount_price < product.price && (
                      <div className="discount-badge-image">
                        -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                      </div>
                    )}
                    <div className="item-overlay">
                      <button onClick={() => handleAddToCart(product)} className="circle-btn"><FaShoppingCart /></button>
                      <button onClick={() => navigate(`/product/${product.barcode || product.id}`)} className="circle-btn"><FaSearch /></button>
                    </div>
                  </div>
                  
                  <div className="item-details">
                    <div className="item-meta">
                      <h5 className="item-name" title={product.name}>{product.name}</h5>
                      <div className="item-pricing">
                        {product.discount_price && product.discount_price < product.price ? (
                          <>
                            <span className="price-original">${product.price}</span>
                            <span className="price-now">${product.discount_price}</span>
                          </>
                        ) : (
                          <span className="price-now">${product.price}</span>
                        )}
                      </div>
                      <button className="card-buy-btn" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                    </div>
                    <div className="item-inline-actions">
                      <button onClick={() => handleAddToCart(product)} className="circle-btn item-inline-btn"><FaShoppingCart /></button>
                      <button onClick={() => navigate(`/product/${product.barcode || product.id}`)} className="circle-btn item-inline-btn"><FaSearch /></button>
                    </div>
                  </div>
                </div>
            ))
          )}
        </div>

        {/* Professional Pagination */}
        {totalPages > 1 && (
          <div className="ct-pagination-wrapper mt-5">
            <button 
              className="ct-page-nav-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <div className="ct-page-numbers">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`ct-page-num ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              className="ct-page-nav-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <ThemeFooter />
    </div>
  );
};

export default DynamicCategory;