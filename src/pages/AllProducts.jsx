import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowRight, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import SideDrawer from '../components/SideDrawer';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import FilterBar from '../components/FilterBar';
import { useCart } from '../context/CartContext';
import '../assets/css/AllProducts.css';

const AllProducts = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, sortBy, currentPage, priceRange]);

  useEffect(() => {
    const q = searchParams.get('search') || '';
    if (q !== searchQuery) {
      setSearchQuery(q);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        sortBy,
        search: searchQuery,
        ...(priceRange.min && { minPrice: priceRange.min }),
        ...(priceRange.max && { maxPrice: priceRange.max })
      };
      
      const data = await themeApi.getProducts(params);
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    const q = searchQuery.trim();
    q ? setSearchParams({ search: q }) : setSearchParams({});
  };

  const handleAddToCart = (product) => {
    addToCart({ 
      ...product, 
      price: product.discount_price || product.price
    }, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (product) => {
    addToCart({ 
      ...product, 
      price: product.discount_price || product.price
    }, 1);
    navigate('/checkout');
  };

  const ProductCard = ({ product, viewMode }) => (
    <motion.div
      whileHover={{ y: viewMode === 'grid' ? -12 : 0 }}
      className={`item-card ${viewMode === 'list' ? 'list-card' : ''}`}
    >
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
          <button onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }} className="circle-btn"><ShoppingCart /></button>
          <button onClick={() => navigate(`/product/${product.barcode || product.id}`)} className="circle-btn"><ArrowRight /></button>
        </div>
      </div>
      
      <div className="item-details">
        <div className="item-meta">
          <h5 className="item-name" title={product.name}>{product.name}</h5>
          <div className="item-pricing">
            {product.discount_price && product.discount_price < product.price ? (
              <>
                <span className="price-original">Rs. {product.price}</span>
                <span className="price-now">Rs. {product.discount_price}</span>
              </>
            ) : (
              <span className="price-now">Rs. {product.price}</span>
            )}
          </div>
          <button className="card-buy-btn" onClick={() => handleBuyNow(product)}>Buy Now</button>
        </div>
        <div className="item-inline-actions">
          <button onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }} className="circle-btn item-inline-btn"><ShoppingCart /></button>
          <button onClick={() => navigate(`/product/${product.barcode || product.id}`)} className="circle-btn item-inline-btn"><ArrowRight /></button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="ap-page-wrapper">
      <TopBar 
        onMenuToggle={() => setSideDrawerOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={fetchProducts}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        onApplyFilters={fetchProducts}
      />

      <div className="container py-5">
        {/* Content */}
        {loading ? (
          <div className="text-center py-5">
            <Loader2 className="animate-spin text-navy mx-auto" size={40} />
            <p className="mt-3 fw-bold text-muted">Loading Catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted">No chemical products found</h4>
            <p>Try adjusting your search query</p>
          </div>
        ) : (
          <>
            <div className={`product-grid-modern ${viewMode === 'list' ? 'list-view' : ''}`}>
              {products.map((product) => (
                <ProductCard product={product} viewMode={viewMode} key={product.id} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="ap-pagination-wrap mt-5">
                <button 
                  className="ap-page-nav-btn" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  <ChevronLeft size={20} />
                </button>

                {[...Array(pagination.pages)].map((_, i) => (
                  <button 
                    key={i} 
                    className={`ap-page-num ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  className="ap-page-nav-btn" 
                  disabled={currentPage === pagination.pages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ThemeFooter />
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
    </div>
  );
};

export default AllProducts;