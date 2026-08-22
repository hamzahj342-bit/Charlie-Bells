import { useState } from 'react';
import { ShoppingCart, Eye, X, Package, Truck, CheckCircle, Clock, Ban, DollarSign } from 'lucide-react';
import { themeApi } from '../../services/themeApi';
import toast from 'react-hot-toast';

// Helper: Parse shipping_address (handles both string and object, returns camelCase keys)
const getShippingAddress = (order) => {
  if (!order?.shipping_address) return {};
  const addr = typeof order.shipping_address === 'string'
    ? JSON.parse(order.shipping_address)
    : order.shipping_address;
  return addr || {};
};

// Helper: Parse product_snapshot (handles both string and object)
const getProductSnapshot = (item) => {
  if (!item?.product_snapshot) {
    console.log('No product_snapshot for item:', item?.id);
    return {};
  }
  const snap = typeof item.product_snapshot === 'string'
    ? JSON.parse(item.product_snapshot)
    : item.product_snapshot;
  console.log('Product snapshot parsed:', snap);
  return snap || {};
};

const OrderManagement = ({ orders, onOrdersChange }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await themeApi.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      
      // Local state update if modal is open
      if(selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({...selectedOrder, status: newStatus});
      }
      
      onOrdersChange(); 
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: '#ffc107', icon: <Clock size={12} />, bg: '#fff8e1' },
      processing: { color: '#17a2b8', icon: <Package size={12} />, bg: '#e0f7fa' },
      shipped: { color: '#007bff', icon: <Truck size={12} />, bg: '#e3f2fd' },
      delivered: { color: '#28a745', icon: <CheckCircle size={12} />, bg: '#e8f5e9' },
      cancelled: { color: '#dc3545', icon: <Ban size={12} />, bg: '#fdecea' }
    };
    const s = config[status] || { color: '#6c757d', icon: null, bg: '#f8f9fa' };
    
    return (
      <span className="badge d-inline-flex align-items-center gap-1 px-2 py-1" 
            style={{ color: s.color, backgroundColor: s.bg, border: `1px solid ${s.color}40` }}>
        {s.icon} {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="order-management animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm">
        <h4 className="fw-bold mb-0">Order Dashboard</h4>
        <div className="text-muted small">Total Orders: {orders.length}</div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="bg-light">
              <tr>
                <th className="border-0 px-4 py-3">Order</th>
                <th className="border-0 py-3">Customer</th>
                <th className="border-0 py-3">Amount</th>
                <th className="border-0 py-3">Status</th>
                <th className="border-0 py-3 text-end px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="align-middle">
                  <td className="px-4">
                    <span className="fw-bold">#{order.id}</span>
                    <div className="small text-muted">{new Date(order.created_at).toLocaleDateString()}</div>
                  </td>
                  <td>
                    {(() => {
                      const addr = getShippingAddress(order);
                      return (
                        <>
                          <div className="fw-medium">{addr.firstName || addr.first_name || ''} {addr.lastName || addr.last_name || 'Guest'}</div>
                          <div className="small text-muted">{addr.phone || 'No Phone'}</div>
                        </>
                      );
                    })()}
                  </td>
                  <td><span className="fw-bold text-dark">Rs. {order.total_amount}</span></td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td className="text-end px-4">
                    <button className="btn btn-sm btn-light border" onClick={() => setSelectedOrder(order)}>
                      <Eye size={16} className="text-primary" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Modal */}
      {selectedOrder && (
        <div className="modal d-block shadow-lg" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-white border-bottom-0 pb-0">
                <h5 className="fw-bold">Order Details #{selectedOrder.id}</h5>
                <button className="btn-close" onClick={() => setSelectedOrder(null)}></button>
              </div>
              
              <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="row g-4">
                  {/* Customer & Shipping */}
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 bg-light border-start border-4 border-primary">
                      <h6 className="fw-bold small text-uppercase text-primary">Shipping Info</h6>
                      <div className="mt-2">
                        {(() => {
                          const addr = getShippingAddress(selectedOrder);
                          return (
                            <>
                              <strong>Name: {addr.firstName || addr.first_name || ''} {addr.lastName || addr.last_name || ''}</strong><br/>
                              <span className="text-muted">Address: {addr.address || 'N/A'}</span><br/>
                              <span className="text-muted">City: {addr.city || ''}{addr.city && addr.state ? ', ' : ''}{addr.state || ''}</span><br/>
                              <span className="fw-medium">Phone: {addr.phone || 'N/A'}</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 bg-light border-start border-4 border-success">
                      <h6 className="fw-bold small text-uppercase text-success">Payment Status</h6>
                      <div className="mt-2">
                        <div className="d-flex justify-content-between">
                          <span>Method:</span> <span className="badge bg-dark">{selectedOrder.payment_method?.toUpperCase()}</span>
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                          <span>Status:</span> <span className={`fw-bold ${selectedOrder.payment_status === 'paid' ? 'text-success' : 'text-danger'}`}>{selectedOrder.payment_status}</span>
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                          <span>Subtotal:</span> <span>Rs. {selectedOrder.subtotal}</span>
                        </div>
                        <div className="d-flex justify-content-between mt-1 pt-1 border-top fw-bold text-dark">
                          <span>Total:</span> <span>Rs. {selectedOrder.total_amount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="col-12">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                      <ShoppingCart size={18} /> Items Ordered
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Product</th>
                            {/* <th className="text-center">Size</th> */}
                            <th className="text-center">Qty</th>
                            <th className="text-end">Unit Price</th>
                            <th className="text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.order_items?.map(item => {
                            const snap = getProductSnapshot(item);
                            return (
                              <tr key={item.id}>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <div className="rounded border bg-light d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', overflow: 'hidden' }}>
                                      <img 
                                        src={snap.image_url || ''} 
                                        alt={snap.name || 'Product'} 
                                        className="w-100 h-100" 
                                        style={{ objectFit: 'cover' }}
                                        onError={(e) => {
                                          console.log('Image failed to load:', snap.image_url);
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                      <Package size={20} className="text-muted position-absolute" style={{ display: 'none' }} id={`placeholder-${item.id}`} />
                                    </div>
                                    <div>
                                      <div className="fw-medium small">Name: {snap.name || 'Product'}</div>
                                      <small className="text-muted">SKU: {snap.sku || 'N/A'}</small>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center">x{item.quantity}</td>
                                <td className="text-end fw-bold">Rs. {item.unit_price}</td>
                                <td className="text-end fw-bold">Rs. {item.total_price}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Transaction Screenshot (Only for JazzCash) */}
                  {selectedOrder.payment_method === 'jazzcash' && (
                    <div className="col-12">
                      <div className="border rounded p-3 text-center bg-white shadow-sm">
                        <h6 className="fw-bold mb-2">JazzCash Payment Screenshot</h6>
                        {selectedOrder.payment_screenshot ? (
                          <>
                        <img 
                          src={selectedOrder.payment_screenshot.startsWith('http') ? selectedOrder.payment_screenshot : `http://localhost:3001${selectedOrder.payment_screenshot}`}
                          className="img-fluid rounded cursor-pointer"
                          style={{ maxHeight: '250px', objectFit: 'contain' }}
                              alt="JazzCash Proof"
                          onClick={() => window.open(selectedOrder.payment_screenshot, '_blank')}
                        />
                        <div className="mt-2 small text-muted">Click image to expand</div>
                          </>
                        ) : (
                          <div className="text-muted py-3">
                            <p className="mb-0">No JazzCash payment screenshot uploaded</p>
                            <small className="text-muted">Screenshot URL: {selectedOrder.payment_screenshot || 'null'}</small>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="col-12">
                    <h6 className="fw-bold mb-2">Change Delivery Status:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {[
                        { key: 'pending', btn: 'outline-warning', icon: <Clock size={14}/> },
                        { key: 'processing', btn: 'outline-info', icon: <Package size={14}/> },
                        { key: 'shipped', btn: 'outline-primary', icon: <Truck size={14}/> },
                        { key: 'delivered', btn: 'outline-success', icon: <CheckCircle size={14}/> },
                        { key: 'cancelled', btn: 'outline-danger', icon: <Ban size={14}/> }
                      ].map((step) => (
                        <button 
                          key={step.key}
                          className={`btn btn-sm d-flex align-items-center gap-1 ${selectedOrder.status === step.key ? 'btn-' + step.btn.split('-')[1] + ' text-white shadow-sm' : 'btn-' + step.btn}`}
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, step.key)}
                          disabled={selectedOrder.status === step.key}
                        >
                          {step.icon} {step.key.charAt(0).toUpperCase() + step.key.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-dark px-4" onClick={() => setSelectedOrder(null)}>Close Window</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;