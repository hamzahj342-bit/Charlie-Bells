import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaSearch, FaShoppingCart, FaTruck, FaShieldAlt, 
    FaHeadset, FaArrowRight, FaStar, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';
import { themeApi } from '../services/themeApi';
import websiteSettingsApi from '../services/websiteSettingsApi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SideDrawer from '../components/SideDrawer';
import TopBar from '../components/TopBar'; 
import ThemeFooter from '../components/ThemeFooter';

import '../assets/css/ThemeHome.css';

const ThemeHome = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [heroSlides, setHeroSlides] = useState([]);

    // Fetch hero slides from website settings
    useEffect(() => {
        const fetchHeroSlides = async () => {
            try {
                const response = await websiteSettingsApi.getWebsiteSettings();
                if (response.success && response.data && response.data.hero) {
                    const heroSettings = response.data.hero;
                    
                    // Build slides array from settings
                    const slides = [];
                    for (let i = 1; i <= 4; i++) {
                        const imageSetting = heroSettings.find(s => s.key === `hero_slide_${i}`);
                        const titleSetting = heroSettings.find(s => s.key === `hero_title_${i}`);
                        const descSetting = heroSettings.find(s => s.key === `hero_description_${i}`);
                        
                        if (imageSetting && imageSetting.value) {
                            slides.push({
                                image: imageSetting.value,
                                title: titleSetting?.value || `Slide ${i}`,
                                description: descSetting?.value || ''
                            });
                        }
                    }
                    
                    // Only use defaults if no slides found in settings
                    if (slides.length === 0) {
                        setHeroSlides([
                            {
                                image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxNjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9IjgwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5IZXJvIFNsaWRlIDE8L3RleHQ+Cjx0ZXh0IHg9IjgwMCIgeT0iMzQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Db21lIFNob3AgTm93ITwvdGV4dD4KPHN2Zz4=",
                                title: "Industrial Chemical Supply",
                                description: "Reliable detergents and chemical essentials for business and household needs."
                            },
                            {
                                image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxNjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9IjgwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5IZXJvIFNsaWRlIDI8L3RleHQ+Cjx0ZXh0IHg9IjgwMCIgeT0iMzQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EZWFscyAmIE9mZmVycyE8L3RleHQ+Cjwvc3ZnPg==",
                                title: "Bulk Detergent & Cleaning Range",
                                description: "High-performance detergents and cleaning products for daily use and home care operations."
                            }
                        ]);
                    } else {
                        setHeroSlides(slides);
                    }
                } else {
                    // Fallback to defaults if settings not available
                    setHeroSlides([
                        {
                            image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxNjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9IjgwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5IZXJvIFNsaWRlIDE8L3RleHQ+Cjx0ZXh0IHg9IjgwMCIgeT0iMzQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Db21lIFNob3AgTm93ITwvdGV4dD4KPHN2Zz4=",
                            title: "Industrial Chemical Supply",
                            description: "Trusted detergents and cleaning solutions for every operational need."
                        },
                        {
                            image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxNjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9IjgwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5IZXJvIFNsaWRlIDI8L3RleHQ+Cjx0ZXh0IHg9IjgwMCIgeT0iMzQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EZWFscyAmIE9mZmVycyE8L3RleHQ+Cjwvc3ZnPg==",
                            title: "Bulk Detergent Range",
                            description: "High-performance cleaning products designed for daily use and home care operations."
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching hero slides:', error);
                // Fallback on error
                setHeroSlides([
                    {
                        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxNjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9IjgwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5IZXJvIFNsaWRlIDE8L3RleHQ+Cjx0ZXh0IHg9IjgwMCIgeT0iMzQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Db21lIFNob3AgTm93ITwvdGV4dD4KPHN2Zz4=",
                        title: "Industrial Chemical Supply",
                        description: "Trusted detergents and cleaning solutions for every operational need."
                    },
                    {
                        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxNjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9IjgwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5IZXJvIFNsaWRlIDI8L3RleHQ+Cjx0ZXh0IHg9IjgwMCIgeT0iMzQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EZWFscyAmIE9mZmVycyE8L3RleHQ+Cjwvc3ZnPg==",
                        title: "Bulk Detergent Range",
                        description: "High-performance cleaning products designed for daily use and home care operations."
                    }
                ]);
            }
        };
        
        fetchHeroSlides();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            handleNextSlide();
        }, 6000);
        return () => clearInterval(interval);
    }, [heroSlides.length]);

    const handleNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    };

    const handlePrevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const categoriesData = await themeApi.getCategories();
                if (!categoriesData || !Array.isArray(categoriesData)) return;

                const activeCategories = categoriesData.filter(cat => cat.is_active);
                setCategories(activeCategories);

                const productsData = {};
                for (const category of activeCategories) {
                    const response = await themeApi.getProductsByCategory(category.id);
                    const products = response.products || response || [];
                    productsData[category.id] = products.slice(0, 4);
                }
                setProductsByCategory(productsData);
            } catch (error) {
                console.error('Error:', error);
                toast.error('Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddToCart = (product) => {
        addToCart({
            ...product,
            price: product.discount_price || product.price
        });
        toast.success(`${product.name} added to cart!`);
    };

    const handleBuyNow = (product) => {
        addToCart({
            ...product,
            price: product.discount_price || product.price
        }, 1);
        navigate('/checkout');
    };

    if (loading || heroSlides.length === 0) return (
        <div className="loader-container">
            <div className="theme-loader"></div>
            <p>Loading Charlie Bells...</p>
        </div>
    );

    return (
        <div className="home-modern-layout">
            <TopBar 
                onMenuToggle={() => setSideDrawerOpen(true)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) navigate(`/all-products?search=${searchQuery}`);
                }}
            />

            {/* --- HERO SECTION WITH ARROWS --- */}
            <section className="hero-wrapper">
                <div className="container position-relative">
                    
                    {/* Navigation Arrows */}
                    <button className="slider-arrow prev-arrow" onClick={handlePrevSlide}>
                        <FaChevronLeft />
                    </button>
                    <button className="slider-arrow next-arrow" onClick={handleNextSlide}>
                        <FaChevronRight />
                    </button>

                    <div className="hero-grid">
                        <div className="hero-info-col">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <span className="hero-tag">Premium Quality • Professional Grade</span>
                                    <h1 className="hero-title">{heroSlides[currentSlide].title}</h1>
                                    <p className="hero-desc">{heroSlides[currentSlide].description}</p>
                                    <div className="hero-btns">
                                        <Link to="/all-products" className="btn-main">Shop Now <FaArrowRight /></Link>
                                        <Link to="/all-products" className="btn-sec">View Catalog</Link>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="hero-visual-col">
                            <div className="image-frame">
                                <motion.img 
                                    key={currentSlide}
                                    src={heroSlides[currentSlide].image}
                                    initial={{ scale: 1.1, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.8 }}
                                    className="hero-img"
                                />
                                <div className="floating-badge">
                                    <FaStar /> <span>#1 in U.S</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="hero-dots">
                        {heroSlides.map((_, i) => (
                            <div key={i} className={`dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} />
                        ))}
                    </div>
                </div>
            </section>

            {/* --- PRODUCTS SECTION --- */}
            <section className="content-area container">
                {categories.map((category) => (
                    <div key={category.id} className="category-group">
                        <div className="group-header">
                            <div>
                                <h2 className="group-title">{category.name}</h2>
                                <div className="title-line"></div>
                            </div>
                            <Link to={`/category/${category.id}`} className="view-link">Explore All</Link>
                        </div>

                        <div className="product-grid-modern">
                            {productsByCategory[category.id]?.map((product) => (
                                <div key={product.id} className="item-card">
                                    <div className="item-thumb">
                                        <img src={product.images?.[0] || product.image_url || '/src/assets/images/tshirt-img.png'} alt={product.name} />
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
                                        <h3 className="item-name">{product.name}</h3>
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
                                        <button onClick={() => handleAddToCart(product)} className="card-buy-btn">Add to Cart</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {/* <section className="feature-strip">
                <div className="container">
                    <div className="feature-grid">
                        <div className="feat-box"><FaTruck className="f-icon" /> <div><h6>Fast Delivery</h6><p>Same day dispatch</p></div></div>
                        <div className="feat-box"><FaShieldAlt className="f-icon" /> <div><h6>Tested Products</h6><p>100% Original products</p></div></div>
                        <div className="feat-box"><FaHeadset className="f-icon" /> <div><h6>24/7 Support</h6><p>Professional service</p></div></div>
                    </div>
                </div>
            </section> */}

            <ThemeFooter />
            <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
        </div>
    );
};

export default ThemeHome;