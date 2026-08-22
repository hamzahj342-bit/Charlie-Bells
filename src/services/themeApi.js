import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (config.url.includes('/orders')) {
        console.log('Orders request - Token being sent:', token.substring(0, 50) + '...');
        console.log('Orders request - Authorization header:', config.headers.Authorization);
      }
    } else {
      if (config.url.includes('/orders')) {
        console.log('Orders request - No token found in localStorage');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on explicit authentication errors
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error || '';
      if (errorMessage.includes('Invalid token') ||
          errorMessage.includes('Token expired') ||
          errorMessage.includes('jwt expired') ||
          errorMessage.includes('malformed jwt')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Theme-specific API calls
export const themeApi = {
  // Authentication
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    // Client-side logout - just remove token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  // Products
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getProductsByCategory: async (category, params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sort_by || params.sortBy) queryParams.append('sort_by', params.sort_by || params.sortBy);
    
    // Add filter parameters
    if (params.min_price || params.minPrice) queryParams.append('min_price', params.min_price || params.minPrice);
    if (params.max_price || params.maxPrice) queryParams.append('max_price', params.max_price || params.maxPrice);
    if (params.search) queryParams.append('search', params.search);
    
    const response = await api.get(`/products/category/${category}?${queryParams.toString()}`);
    return response.data;
  },

  // Reviews
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  getProductReviews: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },

  getAllReviews: async (params = {}) => {
    const response = await api.get('/reviews/admin/all', { params });
    return response.data;
  },

  updateReviewStatus: async (id, status) => {
    const response = await api.put(`/reviews/admin/${id}/status`, { status });
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/admin/${id}`);
    return response.data;
  },

  searchProducts: async (query) => {
    const response = await api.get('/products/search', { params: { q: query } });
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getHierarchicalCategories: async () => {
    const response = await api.get('/categories/hierarchical');
    return response.data;
  },

  getCategoriesByLevel: async (level, parentId = null) => {
    const params = parentId ? { parent_id: parentId } : {};
    const response = await api.get(`/categories/level/${level}`, { params });
    return response.data;
  },

  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Sizes
  getSizes: async () => {
    const response = await api.get('/sizes');
    return response.data;
  },

  // Orders
  createOrder: async (orderData) => {
    const response = await api.post('/orders/guest', orderData);
    return response.data;
  },

  getOrders: async (userId) => {
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  },

  // Admin Orders
  getAllOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  updateOrderStatus: async (orderId, statusData) => {
    const response = await api.put(`/orders/${orderId}/status`, statusData);
    return response.data;
  },

  // Upload Images
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await api.post('/upload/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // User
  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateUserProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Reviews
  getProductReviews: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },

  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Wishlist
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  },

  // Sizes
  getSizes: async () => {
    const response = await api.get('/sizes');
    return response.data;
  },

  createSize: async (sizeData) => {
    const response = await api.post('/sizes', sizeData);
    return response.data;
  },

  updateSize: async (id, sizeData) => {
    const response = await api.put(`/sizes/${id}`, sizeData);
    return response.data;
  },

  deleteSize: async (id) => {
    const response = await api.delete(`/sizes/${id}`);
    return response.data;
  },

  // Product creation methods
  createSingleSizeProduct: async (productData) => {
    const response = await api.post('/products/single-size', productData);
    return response.data;
  },

  createAllSizeProduct: async (productData) => {
    const response = await api.post('/products/all-sizes', productData);
    return response.data;
  },

  // SKU Generation
  getNextSKU: async () => {
    const response = await api.get('/products/next-sku');
    return response.data;
  },
};

export default api;
