import { useState } from 'react';
import { ShoppingCart, Eye, Package, Truck, CheckCircle, Clock, Ban } from 'lucide-react';
import { themeApi } from '../../services/themeApi';
import toast from 'react-hot-toast';
import '../../assets/css/admin-order-management.css';

const getShippingAddress = (order) => {
  if (!order?.shipping_address) return {};
  const addr = typeof order.shipping_address === 'string'
    ? JSON.parse(order.shipping_address)
    : order.shipping_address;
  return addr || {};
};

const getProductSnapshot = (item) => {
  if (!item?.product_snapshot) return {};
  const snap = typeof item.product_snapshot === 'string'
    ? JSON.parse(item.product_snapshot)
    : item.product_snapshot;
  return snap || {};
};

const STATUS_STYLES = {
  pending: { color: '#92400e', icon: Clock, bg: '#fef3c7', border: '#f59e0b' },
  processing: { color: '#0e7490', icon: Package, bg: '#cffafe', border: '#06b6d4' },
  shipped: { color: '#1d4ed8', icon: Truck, bg: '#dbeafe', border: '#3b82f6' },
  delivered: { color: '#166534', icon: CheckCircle, bg: '#dcfce7', border: '#22c55e' },
  cancelled: { color: '#991b1b', icon: Ban, bg: '#fee2e2', border: '#ef4444' },
};

const OrderManagement = ({ orders, onOrdersChange }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await themeApi.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      onOrdersChange();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const style = STATUS_STYLES[status] || {
      color: '#334155',
      icon: Clock,
      bg: '#f1f5f9',
      border: '#94a3b8',
    };
    const Icon = style.icon;

    return (
      <span
        className="om-status-badge"
        style={{
          color: style.color,
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
        }}
      >
        <Icon size={12} /> {String(status || 'unknown').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="om-panel animate__animated animate__fadeIn">
      <div className="om-header">
        <h4 className="om-title">Order Dashboard</h4>
        <div className="om-total">Total Orders: {orders.length}</div>
      </div>

      <div className="card om-card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-end px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const addr = getShippingAddress(order);
                return (
                  <tr key={order.id}>
                    <td className="px-4">
                      <div className="om-order-id">#{order.id}</div>
                      <div className="om-order-date">{new Date(order.created_at).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div className="om-customer-name">
                        {addr.firstName || addr.first_name || ''} {addr.lastName || addr.last_name || 'Guest'}
                      </div>
                      <div className="om-customer-phone">{addr.phone || 'No Phone'}</div>
                    </td>
                    <td>
                      <span className="om-amount">${Number(order.total_amount || 0).toFixed(2)}</span>
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td className="text-end px-4">
                      <button
                        className="btn btn-sm om-view-btn"
                        onClick={() => setSelectedOrder(order)}
                        aria-label={`View order ${order.id}`}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div
          className="modal d-block shadow-lg om-modal"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-white border-bottom-0 pb-0">
                <h5 className="fw-bold">Order Details #{selectedOrder.id}</h5>
                <button className="btn-close" onClick={() => setSelectedOrder(null)}></button>
              </div>

              <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 bg-light border-start border-4 border-primary om-info-box">
                      <h6 className="fw-bold small text-uppercase text-primary">Shipping Info</h6>
                      <div className="mt-2 om-shipping-lines">
                        {(() => {
                          const addr = getShippingAddress(selectedOrder);
                          const cityLine = [addr.city, addr.state, addr.zipCode || addr.zip_code]
                            .filter(Boolean)
                            .join(', ');
                          return (
                            <>
                              <div>
                                <strong>
                                  {addr.firstName || addr.first_name || ''} {addr.lastName || addr.last_name || 'Guest'}
                                </strong>
                              </div>
                              <div className="text-muted">{addr.address || 'No address'}</div>
                              <div className="text-muted">{cityLine || 'No city'}</div>
                              <div className="text-muted">{addr.country || 'United States'}</div>
                              <div className="mt-2"><span className="om-label">Email:</span> {addr.email || 'N/A'}</div>
                              <div><span className="om-label">Phone:</span> {addr.phone || 'N/A'}</div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 rounded-3 bg-light border-start border-4 border-success om-info-box">
                      <h6 className="fw-bold small text-uppercase text-success">Payment Breakdown</h6>
                      <div className="mt-2 om-payment-lines">
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Method</span>
                          <span className="om-method-badge">
                            {(selectedOrder.payment_method || 'stripe').toUpperCase()}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                          <span>Payment Status</span>
                          <span className={`fw-bold ${selectedOrder.payment_status === 'paid' ? 'text-success' : 'text-danger'}`}>
                            {(selectedOrder.payment_status || 'unknown').toUpperCase()}
                          </span>
                        </div>

                        <div className="om-breakdown mt-3 pt-2 border-top">
                          <div className="d-flex justify-content-between">
                            <span>Subtotal</span>
                            <span>${Number(selectedOrder.subtotal || 0).toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between mt-1">
                            <span>Tax</span>
                            <span>${Number(selectedOrder.tax_amount || 0).toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between mt-1">
                            <span>Shipping / Delivery</span>
                            <span>
                              {Number(selectedOrder.shipping_amount || 0) === 0
                                ? 'FREE'
                                : `$${Number(selectedOrder.shipping_amount || 0).toFixed(2)}`}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mt-2 pt-2 border-top fw-bold om-total-line">
                            <span>Total Paid</span>
                            <span>${Number(selectedOrder.total_amount || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                      <ShoppingCart size={18} /> Items Ordered
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th className="text-center">Qty</th>
                            <th className="text-end">Unit Price</th>
                            <th className="text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.order_items?.map((item) => {
                            const snap = getProductSnapshot(item);
                            return (
                              <tr key={item.id}>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <div
                                      className="rounded border bg-light d-flex align-items-center justify-content-center"
                                      style={{ width: '45px', height: '45px', overflow: 'hidden' }}
                                    >
                                      <img
                                        src={snap.image_url || ''}
                                        alt={snap.name || 'Product'}
                                        className="w-100 h-100"
                                        style={{ objectFit: 'cover' }}
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <div className="fw-medium small">Name: {snap.name || 'Product'}</div>
                                      <small className="text-muted">SKU: {snap.sku || 'N/A'}</small>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center">x{item.quantity}</td>
                                <td className="text-end fw-bold">${item.unit_price}</td>
                                <td className="text-end fw-bold">${item.total_price}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {selectedOrder.payment_method === 'stripe' && selectedOrder.transaction_id && (
                    <div className="col-12">
                      <div className="border rounded p-3 bg-white shadow-sm">
                        <h6 className="fw-bold mb-2">Stripe Payment</h6>
                        <div className="d-flex justify-content-between">
                          <span>Payment Intent</span>
                          <code>{selectedOrder.transaction_id}</code>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="col-12">
                    <h6 className="fw-bold mb-2">Change Delivery Status:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {[
                        { key: 'pending', btn: 'outline-warning', icon: <Clock size={14} /> },
                        { key: 'processing', btn: 'outline-info', icon: <Package size={14} /> },
                        { key: 'shipped', btn: 'outline-primary', icon: <Truck size={14} /> },
                        { key: 'delivered', btn: 'outline-success', icon: <CheckCircle size={14} /> },
                        { key: 'cancelled', btn: 'outline-danger', icon: <Ban size={14} /> },
                      ].map((step) => (
                        <button
                          key={step.key}
                          className={`btn btn-sm d-flex align-items-center gap-1 ${
                            selectedOrder.status === step.key
                              ? `btn-${step.btn.split('-')[1]} text-white shadow-sm`
                              : `btn-${step.btn}`
                          }`}
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
                <button className="btn btn-dark px-4" onClick={() => setSelectedOrder(null)}>
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
