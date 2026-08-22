import React from 'react';
import { Package, ShoppingCart, DollarSign, Tags } from 'lucide-react';

const Dashboard = ({ stats, products, categories }) => {
  return (
    <div className="row">
      {/* Stats Cards - Charlie Bells Theme */}
      <div className="col-xl-4 col-lg-6 col-md-6 col-sm-6 mb-4">
        <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #f26522 0%, #fb923c 100%)', color: 'white', borderRadius: '18px' }}>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col">
                <h5 className="card-title mb-0 fw-semibold">Total Products</h5>
                <h2 className="mb-0 fw-bold">{stats.totalProducts || 0}</h2>
              </div>
              <div className="col-auto">
                <Package size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-4 col-lg-6 col-md-6 col-sm-6 mb-4">
        <div className="card border-0 shadow-sm" style={{ borderRadius: '18px' }}>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col">
                <h5 className="card-title mb-0 fw-semibold">Total Orders</h5>
                <h2 className="mb-0 fw-bold">{stats.totalOrders || 0}</h2>
              </div>
              <div className="col-auto">
                <ShoppingCart size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-4 col-lg-6 col-md-6 col-sm-6 mb-4">
        <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)', color: 'white', borderRadius: '18px' }}>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col">
                <h5 className="card-title mb-0 fw-semibold">Total Revenue</h5>
                <h2 className="mb-0 fw-bold">{(stats.totalRevenue || 0).toFixed(2)}</h2>
              </div>
              <div className="col-auto">
                <DollarSign size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="col-lg-6 mb-4">
        <div className="card border-0 shadow-sm" style={{ borderRadius: '18px' }}>
          <div className="card-header border-0" style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', color: 'white', borderTopLeftRadius: '18px', borderTopRightRadius: '18px' }}>
            <h5 className="mb-0 fw-semibold" style={{ color: 'white' }}>Top Products</h5>
          </div>
          <div className="card-body">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom"
              >
                <div className="d-flex align-items-center flex-grow-1">
                  <img
                    src={product.image_url || '/src/assets/images/tshirt-img.png'}
                    alt={product.name}
                    className="rounded"
                    style={{ width: '48px', height: '48px', objectFit: 'cover', marginRight: '14px' }}
                  />
                  <div className="overflow-hidden">
                    <h6 className="mb-1 text-truncate" style={{ maxWidth: '220px' }}>
                      {product.name}
                    </h6>
                    <small className="text-muted d-block">
                      Rs. {Number(product.price || 0).toFixed(2)}
                    </small>
                  </div>
                </div>
                <span
                  className="ms-3"
                  style={{ color: '#f26522', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                >
                  {product.stock_quantity || 0} in stock
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="col-lg-6 mb-4">
        <div className="card border-0 shadow-sm" style={{ borderRadius: '18px' }}>
          <div className="card-header border-0" style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', color: 'white', borderTopLeftRadius: '18px', borderTopRightRadius: '18px' }}>
            <h5 className="mb-0 fw-semibold" style={{ color: 'white' }}>Categories</h5>
          </div>
          <div className="card-body">
            {categories.map((category) => (
              <div key={category.id} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                <div className="d-flex align-items-center">
                  <Tags size={20} className="me-3" style={{ color: '#f26522' }} />
                  <div>
                    <h6 className="mb-1">{category.name}</h6>
                    <small className="text-muted">{category.description || 'No description'}</small>
                  </div>
                </div>
                <span className="badge" style={{ backgroundColor: '#f26522', color: 'white', padding: '0.45rem 0.7rem', borderRadius: '999px' }}>{category.product_count || 0} products</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
