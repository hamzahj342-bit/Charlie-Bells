import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { themeApi } from '../services/themeApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ProtectedRoute from '../components/ProtectedRoute';
import ProductModal from '../components/ProductTypeModal';
import CategoryManagement from '../components/Admin/CategoryManagement';
import WebsiteSettings from '../components/Admin/WebsiteSettings';
import OrderManagement from '../components/Admin/OrderManagement';
import Dashboard from '../components/Admin/Dashboard';
import Products from '../components/Admin/ProductManagement';
import PaymentAudits from '../components/Admin/PaymentAudits';
import ShippingSettings from '../components/Admin/ShippingSettings';
import OrdersReport from '../components/Admin/OrdersReport';
import FailedEmails from '../components/Admin/FailedEmails';
import { isSuperAdmin } from '../utils/roles';
import '../assets/css/admin-shop-manager.css';

import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  Settings,
  Menu,
  LogOut,
  Store,
  ClipboardList,
  ShieldCheck,
  BarChart3,
  Mail,
} from 'lucide-react';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  products: 'Listings',
  categories: 'Categories',
  orders: 'Orders',
  'orders-report': 'Orders Report',
  'shipping-settings': 'Shipping & Tax',
  'failed-emails': 'Failed Emails',
  'payment-audits': 'Payment Audit',
  'website-settings': 'Settings',
};

const Admin = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [nextSku, setNextSku] = useState('001');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category_id: '',
    stock_quantity: '',
    image_url: '',
    images: [],
    status: 'active',
    barcode: '',
    sku: '',
    sizes: [],
  });

  const superAdmin = isSuperAdmin(user);
  const pendingOrders = (orders || []).filter((o) => o.status === 'pending').length;

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', name: 'Listings', icon: Package },
    { id: 'categories', name: 'Categories', icon: Tags },
    { id: 'orders', name: 'Orders', icon: Truck, badge: pendingOrders || null },
    { id: 'orders-report', name: 'Orders Report', icon: BarChart3 },
    { id: 'shipping-settings', name: 'Shipping & Tax', icon: ClipboardList },
    { id: 'failed-emails', name: 'Failed Emails', icon: Mail },
    ...(superAdmin ? [{ id: 'payment-audits', name: 'Payment Audit', icon: ShieldCheck }] : []),
    { id: 'website-settings', name: 'Settings', icon: Settings },
  ];

  const refreshCatalog = useCallback(async () => {
    const [productsRes, categoriesRes, ordersRes] = await Promise.all([
      themeApi.getProducts(),
      themeApi.getCategories(),
      themeApi.getAllOrders(),
    ]);
    const nextProducts = productsRes.products || [];
    const nextOrders = ordersRes.orders || [];
    setProducts(nextProducts);
    setCategories(categoriesRes || []);
    setOrders(nextOrders);
    setStats({
      totalProducts: nextProducts.length,
      totalOrders: nextOrders.length,
      totalRevenue: nextOrders.reduce(
        (sum, order) => sum + (parseFloat(order.total_amount) || 0),
        0
      ),
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }
      try {
        await refreshCatalog();
      } catch {
        toast.error('System Error: Data sync failed');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isAuthenticated, refreshCatalog]);

  const handleAddProduct = async () => {
    setActiveTab('products');
    setEditingProduct(null);
    let suggestedSku = '';
    try {
      const skuData = await themeApi.getNextSKU();
      suggestedSku = skuData.sku || '';
      setNextSku(suggestedSku || '001');
    } catch {
      setNextSku('001');
    }
    setProductForm({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      category_id: '',
      stock_quantity: '',
      status: 'active',
      barcode: '',
      sku: suggestedSku,
      sizes: [],
    });
    setUploadedImages([]);
    setShowProductForm(true);
  };

  const normalizeProductSizes = (product) => {
    if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
      return product.sizes.map((s) => ({
        size: String(s?.size || s?.name || '').trim(),
        quantity: Math.max(0, parseInt(s?.quantity ?? 0, 10) || 0),
      })).filter((s) => s.size);
    }
    const stockItems = product?.stock_items;
    if (Array.isArray(stockItems) && stockItems.length > 0) {
      return stockItems
        .map((item) => ({
          size: String(item?.size?.size || item?.size_name || '').trim(),
          quantity: Math.max(0, parseInt(item?.quantity ?? 0, 10) || 0),
        }))
        .filter((s) => s.size);
    }
    return [];
  };

  const handleEditProduct = (product) => {
    setActiveTab('products');
    setEditingProduct(product);
    const sizes = normalizeProductSizes(product);
    const stockTotal = sizes.length
      ? sizes.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0)
      : product.stock_quantity;
    setProductForm({
      ...product,
      status: product.is_active ? 'active' : 'inactive',
      sku: product.sku || '',
      discount_price: product.discount_price ?? '',
      sizes,
      stock_quantity: stockTotal,
    });
    const existing =
      Array.isArray(product.images) && product.images.length
        ? [...product.images]
        : product.image_url
          ? [product.image_url]
          : [];
    if (product.image_url && existing.includes(product.image_url)) {
      const rest = existing.filter((url) => url !== product.image_url);
      setUploadedImages([product.image_url, ...rest]);
    } else {
      setUploadedImages(existing);
    }
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await themeApi.deleteProduct(id);
      toast.success('Listing removed');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Delete Error:', error);
      toast.error('Failed to delete listing');
    }
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const result = await themeApi.uploadImages(Array.from(files));
      setUploadedImages((prev) => [...prev, ...result.images]);
      toast.success(`${result.images.length} image(s) uploaded successfully!`);
    } catch {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeUploadedImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setCoverImage = (index) => {
    if (index <= 0) return;
    setUploadedImages((prev) => {
      if (index >= prev.length) return prev;
      const next = [...prev];
      const [cover] = next.splice(index, 1);
      return [cover, ...next];
    });
  };

  const handleSaveProduct = async () => {
    const sku = String(productForm.sku || '').trim();
    if (!sku) {
      toast.error('SKU is required');
      return;
    }
    if (!productForm.category_id) {
      toast.error('Category is required');
      return;
    }
    try {
      const sizes = (Array.isArray(productForm.sizes) ? productForm.sizes : [])
        .map((s) => ({
          size: String(s?.size || '').trim(),
          quantity: Math.max(0, parseInt(s?.quantity ?? 0, 10) || 0),
        }))
        .filter((s) => s.size);
      const stockTotal = sizes.length
        ? sizes.reduce((sum, s) => sum + s.quantity, 0)
        : parseInt(productForm.stock_quantity, 10) || 0;

      const rawDiscount = productForm.discount_price;
      const discountParsed =
        rawDiscount === '' || rawDiscount === null || rawDiscount === undefined
          ? null
          : parseFloat(rawDiscount);
      const productData = {
        ...productForm,
        sku,
        price: parseFloat(productForm.price),
        discount_price:
          discountParsed !== null && Number.isFinite(discountParsed) && discountParsed > 0
            ? discountParsed
            : null,
        stock_quantity: stockTotal,
        sizes,
        image_url: uploadedImages[0] || '',
        images: uploadedImages,
        is_active: productForm.status === 'active',
      };
      if (editingProduct) {
        await themeApi.updateProduct(editingProduct.id, productData);
        toast.success('Listing updated');
      } else {
        await themeApi.createProduct(productData);
        toast.success('Listing published');
      }
      setShowProductForm(false);
      setUploadedImages([]);
      await refreshCatalog();
    } catch (error) {
      toast.error('Save Failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const userLabel =
    `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'Admin';
  const userInitials = userLabel
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'A';

  if (loading) {
    return (
      <div className="sm-loading">
        <div className="text-center">
          <div className="spinner-border text-dark mb-3" role="status" />
          <p className="fw-semibold mb-0">Loading Shop Manager…</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="sm-app">
        <div
          className={`sm-backdrop ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        <div className="sm-layout">
          <aside className={`sm-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sm-sidebar-head">
              <button
                type="button"
                className="sm-icon-btn"
                onClick={() => setSidebarOpen(false)}
                aria-label="Collapse menu"
              >
                <Menu size={18} />
              </button>
              <h1 className="sm-sidebar-title">Shop Manager</h1>
            </div>

            <nav className="sm-nav">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`sm-nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setShowProductForm(false);
                    setActiveTab(item.id);
                    if (window.innerWidth < 992) setSidebarOpen(false);
                  }}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                  {item.badge ? <span className="sm-nav-badge">{item.badge}</span> : null}
                </button>
              ))}
            </nav>

            <div className="sm-sidebar-foot">
              <div className="sm-shop-label">Shop</div>
              <div className="sm-shop-name">Charlie Bells</div>
              <div className="sm-user-row">
                <div className="sm-avatar">{userInitials}</div>
                <div className="sm-user-meta">
                  <p className="sm-user-name">{userLabel}</p>
                  <p className="sm-user-role">{superAdmin ? 'Super Admin' : 'Admin'}</p>
                </div>
                <button
                  type="button"
                  className="sm-icon-btn"
                  onClick={logout}
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </aside>

          <div className="sm-main">
            {!showProductForm && (
              <header className="sm-topbar">
                <div className="sm-topbar-left">
                  {!sidebarOpen && (
                    <button
                      type="button"
                      className="sm-icon-btn"
                      onClick={() => setSidebarOpen(true)}
                      aria-label="Open menu"
                    >
                      <Menu size={18} />
                    </button>
                  )}
                  <h2 className="sm-page-title">{PAGE_TITLES[activeTab] || 'Shop Manager'}</h2>
                </div>
                <div className="sm-topbar-actions">
                  <Link to="/" className="sm-link-btn">
                    <Store size={16} /> View shop
                  </Link>
                  {activeTab === 'products' && (
                    <button type="button" className="sm-btn-dark" onClick={handleAddProduct}>
                      + Add a listing
                    </button>
                  )}
                </div>
              </header>
            )}

            <main className={`sm-content ${showProductForm ? 'sm-content--listing' : ''}`}>
              {showProductForm ? (
                <ProductModal
                  onClose={() => setShowProductForm(false)}
                  productForm={productForm}
                  setProductForm={setProductForm}
                  editingProduct={editingProduct}
                  nextSku={nextSku}
                  categories={categories}
                  uploadedImages={uploadedImages}
                  uploadingImages={uploadingImages}
                  handleImageUpload={handleImageUpload}
                  removeUploadedImage={removeUploadedImage}
                  setCoverImage={setCoverImage}
                  handleSaveProduct={handleSaveProduct}
                />
              ) : (
                <>
                  {activeTab === 'dashboard' && (
                    <Dashboard
                      stats={stats}
                      products={products}
                      categories={categories}
                      orders={orders}
                      onNavigate={setActiveTab}
                    />
                  )}
                  {activeTab === 'products' && (
                    <Products
                      products={products}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      handleEditProduct={handleEditProduct}
                      handleDeleteProduct={handleDeleteProduct}
                    />
                  )}
                  {activeTab === 'categories' && (
                    <div className="sm-panel-wrap">
                      <CategoryManagement
                        categories={categories}
                        onCategoriesChange={refreshCatalog}
                      />
                    </div>
                  )}
                  {activeTab === 'orders' && (
                    <OrderManagement orders={orders} onOrdersChange={refreshCatalog} />
                  )}
                  {activeTab === 'orders-report' && (
                    <div className="sm-panel-wrap">
                      <OrdersReport />
                    </div>
                  )}
                  {activeTab === 'shipping-settings' && (
                    <div className="sm-panel-wrap">
                      <ShippingSettings />
                    </div>
                  )}
                  {activeTab === 'failed-emails' && (
                    <div className="sm-panel-wrap">
                      <FailedEmails />
                    </div>
                  )}
                  {activeTab === 'payment-audits' && superAdmin && (
                    <div className="sm-panel-wrap">
                      <PaymentAudits />
                    </div>
                  )}
                  {activeTab === 'website-settings' && (
                    <div className="sm-panel-wrap">
                      <WebsiteSettings />
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
