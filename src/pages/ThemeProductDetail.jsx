// import { useState, useEffect } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { FaStar, FaTruck, FaShoppingCart, FaShieldAlt, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
// import { ShoppingCart, Star, Truck, Shield } from 'lucide-react';
// import { themeApi } from '../services/themeApi';
// import toast from 'react-hot-toast';
// import SideDrawer from '../components/SideDrawer';
// import { useCart } from '../context/CartContext';
// import { useLogo } from '../context/LogoContext';
// import TopBar from '../components/TopBar';
// import ThemeFooter from '../components/ThemeFooter';
// import '../assets/css/ThemeProductDetail.css';

// const ThemeProductDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { addToCart } = useCart();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [quantity, setQuantity] = useState(1);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [selectedSize, setSelectedSize] = useState('');
//   const [sizes, setSizes] = useState([]);
//   const [reviews, setReviews] = useState([]);
//   const [reviewsLoading, setReviewsLoading] = useState(true);
//   const [reviewForm, setReviewForm] = useState({ name: '', rating: '', comment: '', review_images: [] });
//   const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

//   const themeColor = "#001d3d"; // Navy Blue

//   useEffect(() => {
//     fetchProduct();
//     fetchSizes();
//   }, [id]);

//   const fetchSizes = async () => {
//     try {
//       const sizesData = await themeApi.getSizes();
//       setSizes(sizesData);
//     } catch (error) {
//       setSizes([
//         { id: 1, size: '500ml' }, { id: 2, size: '1L' }, { id: 3, size: '5L' },
//         { id: 4, size: '10L' }, { id: 5, size: '25L' }, { id: 6, size: '50L' }
//       ]);
//     }
//   };

//   useEffect(() => {
//     const fetchReviews = async () => {
//       setReviewsLoading(true);
//       try {
//         const reviewsData = await themeApi.getProductReviews(id);
//         setReviews(reviewsData?.reviews || []);
//       } catch (error) {
//         setReviews([]);
//       } finally {
//         setReviewsLoading(false);
//       }
//     };
//     if (id) fetchReviews();
//   }, [id]);

//   const fetchProduct = async () => {
//     try {
//       setLoading(true);
//       const productData = await themeApi.getProductById(id);
//       setProduct(productData);
      
//       // Set selected image to first image if available
//       if (productData.images && productData.images.length > 0) {
//         setSelectedImage(0);
//       }
//     } catch (error) {
//       toast.error('Failed to load product');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddToCart = () => {
//     // if (!selectedSize) {
//     //   toast.error('Please select a size first');
//     //   return;
//     // }
//     addToCart({ 
//       ...product, 
//       selectedSize, 
//       price: product.discount_price || product.price 
//     }, quantity);
//     toast.success(`${product.name} added to cart!`);
//   };

//   const handleBuyNow = () => {
//     addToCart({ 
//       ...product, 
//       selectedSize, 
//       price: product.discount_price || product.price 
//     }, quantity);
//     navigate('/checkout');
//   };

//   const handleReviewSubmit = async (e) => {
//     e.preventDefault();
    
//     // Debug: Log form data before processing
//     console.log('Review form submitted');
//     console.log('Form elements:', e.target);
    
//     // Get form data
//     const formData = new FormData(e.target);
//     const name = formData.get('name');
//     const rating = formData.get('rating');
//     const comment = formData.get('comment');
    
//     // Debug: Log extracted data
//     console.log('Extracted form data:', { name, rating, comment });
    
//     // Validation
//     if (!name || !rating || !comment) {
//       console.error('Validation failed - Missing fields:', { name: !!name, rating: !!rating, comment: !!comment });
//       toast.error('Please fill in all required fields');
//       return;
//     }
    
//     const ratingValue = parseInt(rating);
//     if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
//       console.error('Validation failed - Invalid rating:', ratingValue);
//       toast.error('Please select a valid rating between 1 and 5');
//       return;
//     }
    
//     try {
//       const reviewData = {
//         customer_name: name.trim(),
//         rating: ratingValue,
//         comment: comment.trim(),
//         product_id: id
//       };
      
//       console.log('Submitting review:', reviewData);
//       await themeApi.createReview(reviewData);
//       toast.success('Review submitted successfully!');
      
//       // Reset form
//       e.target.reset();
      
//       // Refresh reviews
//       const reviewsData = await themeApi.getProductReviews(id);
//       setReviews(reviewsData?.reviews || []);
      
//     } catch (error) {
//       console.error('Review submission error:', error);
//       toast.error('Failed to submit review: ' + (error.response?.data?.error || error.message));
//     }
//   };

//   if (loading) return (
//     <div className="loader-container d-flex justify-content-center align-items-center vh-100">
//       <div className="spinner-border text-primary" role="status"></div>
//     </div>
//   );

//   return (
//     <div className="detail-page-wrapper">
//       <header className="modern-header"><TopBar onMenuToggle={() => setSideDrawerOpen(true)} /></header>
//       <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />

//       <div className="container py-5">
//         <div className="row g-5">
//           {/* Images Section */}
//           <div className="col-lg-6">
//             <div className="image-main-card">
//               <div className="main-view-img">
//                 <img 
//                   src={product.images?.[selectedImage] || product.image_url || '/placeholder.png'} 
//                   alt={product.name} className="img-fluid" 
//                 />
//               </div>
//               <div className="thumb-row mt-3 d-flex gap-2">
//                 {(product.images && product.images.length > 0 ? product.images : [product.image_url]).map((img, i) => (
//                   <img key={i} src={img} className={`thumb-img ${selectedImage === i ? 'active' : ''}`} 
//                   onClick={() => setSelectedImage(i)} />
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Details Section */}
//           <div className="col-lg-6">
//             <div className="product-content-box">
//               <span className="category-badge">Home Care & Cleaning Product</span>
//               <h1 className="product-main-title">{product.name}</h1>
              
//               <div className="d-flex align-items-center gap-2 mb-3">
//                 <div className="star-rating-box">
//                   {[...Array(5)].map((_, s) => (
//                     <FaStar 
//                       key={s} 
//                       className="me-1" 
//                       color={reviews.length > 0 ? (s < Math.round(reviews.reduce((a,b)=>a+b.rating,0)/reviews.length)) ? "#ffc300" : "#e0e0e0" : "#e0e0e0"} 
//                     />
//                   ))}
//                   <span className="ms-2">{reviews.length > 0 ? (reviews.reduce((a,b)=>a+b.rating,0)/reviews.length).toFixed(1) : "N/A"}</span>
//                 </div>
//                 <span className="text-muted">({reviews.length} Verified Reviews)</span>
//               </div>

//               <div className="price-display mb-4">
//                 {product.discount_price && product.discount_price < product.price ? (
//                   <>
//                     <span className="original-price-tag">Rs. {product.price}</span>
//                     <span className="price-tag">Rs. {product.discount_price}</span>
//                     <span className="discount-badge">
//                       {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
//                     </span>
//                   </>
//                 ) : (
//                   <span className="price-tag">Rs. {product.price}</span>
//                 )}
//               </div>

//               <div className="spec-card mb-4">
//                 <p><strong>SKU:</strong> {product.sku || 'IND-786'}</p>
//                 {product.barcode && (
//                   <p><strong>Barcode:</strong> <code style={{ backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>{product.barcode}</code></p>
//                 )}
//                 <p className="description-text">{product.description}</p>
//               </div>

//               {/* <div className="size-selector-wrap mb-4">
//                 <label className="fw-bold mb-2 d-block">SELECT PACKAGING SIZE</label>
//                 <div className="d-flex flex-wrap gap-2">
//                   {(product.sizes?.length > 0 ? product.sizes : sizes).map((s, i) => (
//                     <button 
//                       key={i} 
//                       className={`btn size-btn ${selectedSize === s.size ? 'active' : ''}`}
//                       onClick={() => setSelectedSize(s.size)}
//                     >
//                       {s.size}
//                     </button>
//                   ))}
//                 </div>
//               </div> */}

//               <div className="action-row mb-5">
//                 <div className="qty-input">
//                   <button onClick={() => setQuantity(q => Math.max(1, q-1))}>-</button>
//                   <input type="number" value={quantity} readOnly />
//                   <button onClick={() => setQuantity(q => q+1)}>+</button>
//                 </div>
//                 <div className="action-buttons">
//                   <button className="btn btn-add-cart" onClick={handleAddToCart}>
//                     <ShoppingCart className="me-2" size={20} /> ADD TO CART
//                   </button>
//                   <button className="btn btn-buy-now" onClick={handleBuyNow}>
//                     Buy Now
//                   </button>
//                 </div>
//               </div>

//               <div className="trust-grid row g-3">
//                 <div className="col-6"><div className="trust-item"><FaTruck /> <span>Fast Delivery</span></div></div>
//                 <div className="col-6"><div className="trust-item"><FaShieldAlt /> <span>Quality Lab Tested</span></div></div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Reviews Section */}
//         <div className="row mt-5">
//           <div className="col-12">
//             <div className="review-section-card">
//               <h3 className="section-heading mb-4 text-center">Customer Satisfaction</h3>
//               <div className="row g-4">
//                 <div className="col-md-4">
//                   <div className="write-review-card">
//                     <h5>Post a Review</h5>
//                     <form onSubmit={handleReviewSubmit}>
//                       <input type="text" name="name" className="form-control mb-2" placeholder="Your Name" required />
//                       <select name="rating" className="form-control mb-2" required>
//                         <option value="">Select Rating</option>
//                         <option value="5">5 Stars - Excellent</option>
//                         <option value="4">4 Stars - Good</option>
//                         <option value="3">3 Stars - Average</option>
//                         <option value="2">2 Stars - Poor</option>
//                         <option value="1">1 Star - Very Poor</option>
//                       </select>
//                       <textarea name="comment" className="form-control mb-3" placeholder="Share your experience..." rows="3" required></textarea>
//                       <button className="btn btn-submit-review w-100">Submit Review</button>
//                     </form>
//                   </div>
//                 </div>
//                 {/* --- Reviews Display Area --- */}
//                 <div className="col-md-8">
//                   {reviews.length === 0 ? (
//                     <div className="empty-reviews p-5 text-center">
//                       <p className="mb-0 text-muted">No reviews yet. Be the first to rate this product!</p>
//                     </div>
//                   ) : (
//                     <div className="reviews-scroll-area">
//                       {reviews.map((r, i) => (
//                         <div key={i} className="review-card-modern mb-3">
//                           <div className="d-flex justify-content-between align-items-start">
//                             <div className="d-flex align-items-center gap-3">
//                               <div className="user-avatar-circle">
//                                 {r.customer_name.charAt(0).toUpperCase()}
//                               </div>
//                               <div>
//                                 <h6 className="mb-0 fw-bold text-navy">
//                                   {r.customer_name} 
//                                   <span className="verified-badge-text">
//                                     <FaCheckCircle className="ms-1" /> Verified Buyer
//                                   </span>
//                                 </h6>
//                                 <small className="text-muted">Purchased recently</small>
//                               </div>
//                             </div>
//                             <div className="stars-wrapper">
//                               {[...Array(5)].map((_, s) => (
//                                 <FaStar 
//                                   key={s} 
//                                   size={14} 
//                                   color={s < r.rating ? "#ffc300" : "#e0e0e0"} 
//                                 />
//                               ))}
//                             </div>
//                           </div>
//                           <div className="review-content-body mt-3">
//                             <p className="mb-0">{r.comment}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <ThemeFooter />
//     </div>
//   );
// };

// export default ThemeProductDetail;



import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaTruck, FaShoppingCart, FaShieldAlt, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { ShoppingCart, Star, Truck, Shield } from 'lucide-react';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import SideDrawer from '../components/SideDrawer';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import '../assets/css/ThemeProductDetail.css';

const ThemeProductDetail = () => {
  const { barcode } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizes, setSizes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: '', comment: '', review_images: [] });
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  const themeColor = "#001d3d"; // Navy Blue

  useEffect(() => {
    fetchProduct();
    fetchSizes();
  }, [barcode]);

  const fetchSizes = async () => {
    try {
      const sizesData = await themeApi.getSizes();
      setSizes(sizesData);
    } catch (error) {
      setSizes([
        { id: 1, size: '500ml' }, { id: 2, size: '1L' }, { id: 3, size: '5L' },
        { id: 4, size: '10L' }, { id: 5, size: '25L' }, { id: 6, size: '50L' }
      ]);
    }
  };

  // Reviews are loaded after product is fetched (so we have the numeric product id)

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productData = await themeApi.getProductById(barcode);
      setProduct(productData);

      // Set selected image to first image if available
      if (productData?.images && productData.images.length > 0) {
        setSelectedImage(0);
      }

      // Fetch reviews using the actual numeric product id when available
      try {
        if (productData && productData.id) {
          setReviewsLoading(true);
          const reviewsData = await themeApi.getProductReviews(productData.id);
          setReviews(reviewsData?.reviews || []);
        }
      } catch (err) {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart({ 
      ...product, 
      selectedSize, 
      price: product.discount_price || product.price 
    }, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart({ 
      ...product, 
      selectedSize, 
      price: product.discount_price || product.price 
    }, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const rating = formData.get('rating');
    const comment = formData.get('comment');
    
    if (!name || !rating || !comment) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const ratingValue = parseInt(rating);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      toast.error('Please select a valid rating between 1 and 5');
      return;
    }
    
    try {
      const reviewData = {
        customer_name: name.trim(),
        rating: ratingValue,
        comment: comment.trim(),
        product_id: product?.id || null
      };
      
      await themeApi.createReview(reviewData);
      toast.success('Review submitted successfully!');
      e.target.reset();
      
      if (product && product.id) {
        const reviewsData = await themeApi.getProductReviews(product.id);
        setReviews(reviewsData?.reviews || []);
      }
      
    } catch (error) {
      toast.error('Failed to submit review: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return (
    <div className="loader-container d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  // Generate Structured Data (JSON-LD Schema) for Google Search Console & Indexing
  const schemaMarkup = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images && product.images.length > 0 ? product.images : [product.image_url],
    "description": product.description,
    "sku": product.sku || `SKU-${product.id}`,
    // Map barcode to gtin13 if available for accurate barcode lookup on Google
    ...(product.barcode && { "gtin13": product.barcode }),
    "brand": {
      "@type": "Brand",
      "name": "Grace Plus"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "PKR",
      "price": product.discount_price || product.price,
      "availability": "https://schema.org/InStock"
    }
  } : null;

  return (
    <div className="detail-page-wrapper">
      {/* Dynamic Injection of JSON-LD Schema Markup */}
      {schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      )}

      <header className="modern-header"><TopBar onMenuToggle={() => setSideDrawerOpen(true)} /></header>
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />

      <div className="container py-5">
        <div className="row g-5">
          {/* Images Section */}
          <div className="col-lg-6">
            <div className="image-main-card">
              <div className="main-view-img">
                <img 
                  src={product.images?.[selectedImage] || product.image_url || '/placeholder.png'} 
                  alt={product.name} className="img-fluid" 
                />
              </div>
              <div className="thumb-row mt-3 d-flex gap-2">
                {(product.images && product.images.length > 0 ? product.images : [product.image_url]).map((img, i) => (
                  <img key={i} src={img} className={`thumb-img ${selectedImage === i ? 'active' : ''}`} 
                  onClick={() => setSelectedImage(i)} />
                ))}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="col-lg-6">
            <div className="product-content-box">
              <span className="category-badge">Bike Bells & Horns</span>
              <h1 className="product-main-title">{product.name}</h1>
              
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="star-rating-box">
                  {[...Array(5)].map((_, s) => (
                    <FaStar 
                      key={s} 
                      className="me-1" 
                      color={reviews.length > 0 ? (s < Math.round(reviews.reduce((a,b)=>a+b.rating,0)/reviews.length)) ? "#ffc300" : "#e0e0e0" : "#e0e0e0"} 
                    />
                  ))}
                  <span className="ms-2">{reviews.length > 0 ? (reviews.reduce((a,b)=>a+b.rating,0)/reviews.length).toFixed(1) : "N/A"}</span>
                </div>
                <span className="text-muted">({reviews.length} Verified Reviews)</span>
              </div>

              <div className="price-display mb-4">
                {product.discount_price && product.discount_price < product.price ? (
                  <>
                    <span className="original-price-tag">Rs. {product.price}</span>
                    <span className="price-tag">Rs. {product.discount_price}</span>
                    <span className="discount-badge">
                      -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="price-tag">Rs. {product.price}</span>
                )}
              </div>

              <div className="spec-card mb-4">
                <p><strong>SKU:</strong> {product.sku || 'IND-786'}</p>
                {product.barcode && (
                  <p><strong>Barcode:</strong> <code style={{ backgroundColor: 'transparent', color: "#ecc66dfb", borderRadius: '4px', fontFamily: 'monospace' }}>{product.barcode}</code></p>
                )}
                <p className="description-text">{product.description}</p>
              </div>

              <div className="action-row mb-5">
                <div className="qty-input">
                  <button onClick={() => setQuantity(q => Math.max(1, q-1))}>-</button>
                  <input type="number" value={quantity} readOnly />
                  <button onClick={() => setQuantity(q => q+1)}>+</button>
                </div>
                <div className="action-buttons">
                  <button className="btn btn-add-cart" onClick={handleAddToCart}>
                    <ShoppingCart className="me-2" size={20} /> ADD TO CART
                  </button>
                  <button className="btn btn-buy-now" onClick={handleBuyNow}>
                    Buy Now
                  </button>
                </div>
              </div>

              {/* <div className="trust-grid row g-3">
                <div className="col-6"><div className="trust-item"><FaTruck /> <span>Fast Delivery</span></div></div>
                <div className="col-6"><div className="trust-item"><FaShieldAlt /> <span>Quality Lab Tested</span></div></div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="row">
          <div className="col-12">
            <div className="review-section-card">
              <h3 className="section-heading mb-4 text-center">Customer Satisfaction</h3>
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="write-review-card">
                    <h5>Post a Review</h5>
                    <form onSubmit={handleReviewSubmit}>
                      <input type="text" name="name" className="form-control mb-2" placeholder="Your Name" required />
                      <select name="rating" className="form-control mb-2" required>
                        <option value="">Select Rating</option>
                        <option value="5">5 Stars - Excellent</option>
                        <option value="4">4 Stars - Good</option>
                        <option value="3">3 Stars - Average</option>
                        <option value="2">2 Stars - Poor</option>
                        <option value="1">1 Star - Very Poor</option>
                      </select>
                      <textarea name="comment" className="form-control mb-3" placeholder="Share your experience..." rows="3" required></textarea>
                      <button className="btn btn-submit-review w-100">Submit Review</button>
                    </form>
                  </div>
                </div>

                <div className="col-md-8">
                  {reviews.length === 0 ? (
                    <div className="empty-reviews p-5 text-center">
                      <p className="mb-0 text-muted">No reviews yet. Be the first to rate this product!</p>
                    </div>
                  ) : (
                    <div className="reviews-scroll-area">
                      {reviews.map((r, i) => (
                        <div key={i} className="review-card-modern mb-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="d-flex align-items-center gap-3">
                              <div className="user-avatar-circle">
                                {r.customer_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold ml-2 text-white">
                                  {r.customer_name} 
                                  <span className="verified-badge-text">
                                    <FaCheckCircle className="ms-1" /> Verified Buyer
                                  </span>
                                </h6>
                                <small className="text-secondary ml-2">Purchased recently</small>
                              </div>
                            </div>
                            <div className="stars-wrapper">
                              {[...Array(5)].map((_, s) => (
                                <FaStar 
                                  key={s} 
                                  size={14} 
                                  color={s < r.rating ? "#ffc300" : "#e0e0e0"} 
                                />
                              ))}
                            </div>
                          </div>
                          <div className="review-content-body mt-3">
                            <p className="mb-0">{r.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ThemeFooter />
    </div>
  );
};

export default ThemeProductDetail;