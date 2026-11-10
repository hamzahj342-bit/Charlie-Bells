import { useState } from 'react';
import { ShoppingCart, Eye, Package, Truck, CheckCircle, Clock, Ban } from 'lucide-react';
import { themeApi } from '../../services/themeApi';
import toast from 'react-hot-toast';
import '../../assets/css/admin-order-management.css';

const getShippingAddress = (order) => {
  if (!order?.shipping_address) return {};
  const addr =
    typeof order.shipping_address === 'string'
      ? (() => {
          try {
            return JSON.parse(order.shipping_address);
          } catch {
            return {};
          }
        })()
      : order.shipping_address;
  return addr || {};
};

const getProductSnapshot = (item) => {
  if (!item?.product_snapshot) return {};
  const snap =
    typeof item.product_snapshot === 'string'
      ? (() => {
          try {
            return JSON.parse(item.product_snapshot);
          } catch {
            return {};
          }
        })()
      : item.product_snapshot;
  return snap || {};
};

const STATUS_GROUPS = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  { key: 'cancelled', label: 'Cancelled', icon: Ban },
];

const STATUS_STYLES = {
  pending: { color: '#92400e', icon: Clock, bg: '#fef3c7', border: '#f59e0b' },
  processing: { color: '#0e7490', icon: Package, bg: '#cffafe', border: '#06b6d4' },
  shipped: { color: '#1d4ed8', icon: Truck, bg: '#dbeafe', border: '#3b82f6' },
  delivered: { color: '#166534', icon: CheckCircle, bg: '#dcfce7', border: '#22c55e' },
  cancelled: { color: '#991b1b', icon: Ban, bg: '#fee2e2', border: '#ef4444' },
};

const OrderManagement = ({ orders = [], onOrdersChange }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await themeApi.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      onOrdersChange?.();
    } catch {
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

  const customerName = (order) => {
    const addr = getShippingAddress(order);
    return (
      `${addr.firstName || addr.first_name || ''} ${addr.lastName || addr.last_name || ''}`.trim() ||
      'Guest'
    );
  };

  const shippingSummary = (order) => {
    const addr = getShippingAddress(order);
    const cityLine = [addr.city, addr.state, addr.zipCode || addr.zip_code].filter(Boolean).join(', ');
    return cityLine || addr.country || 'No shipping address';
  };

  return (
    <div>
      <div className="sm-listings-header">
        <p className="sm-muted mb-0" style={{ fontSize: '0.9rem' }}>
          Total orders: {orders.length}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="sm-card sm-empty">
          <ShoppingCart size={40} className="mb-2 opacity-50" />
          <p className="mb-0">No orders yet.</p>
        </div>
      ) : (
        STATUS_GROUPS.map((group) => {
          const groupOrders = orders.filter((o) => o.status === group.key);
          if (groupOrders.length === 0) return null;
          const Icon = group.icon;
          return (
            <section key={group.key} className="sm-order-group">
              <div className="sm-order-group-head">
                <Icon size={16} />
                <span>{group.label}</span>
                <span className="sm-order-count">{groupOrders.length}</span>
              </div>
              {groupOrders.map((order) => {
                const items = order.order_items || [];
                return (
                  <article key={order.id} className="sm-order-card">
                    <div>
                      <p className="sm-order-customer">{customerName(order)}</p>
                      <p className="sm-order-id">
                        Order #{order.id} · {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      {items.slice(0, 3).map((item) => {
                        const snap = getProductSnapshot(item);
                        return (
                          <div key={item.id} className="sm-order-item">
                            <img
                              src={snap.image_url || ''}
                              alt={snap.name || 'Product'}
                              onError={(e) => {
                                e.target.style.visibility = 'hidden';
                              }}
                            />
                            <div>
                              <p className="sm-order-item-name">{snap.name || 'Product'}</p>
                              <p className="sm-order-item-meta">
                                Qty {item.quantity} · SKU: {snap.sku || 'N/A'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {items.length > 3 && (
                        <p className="sm-order-item-meta mt-2 mb-0">+{items.length - 3} more items</p>
                      )}
                    </div>

                    <div>
                      <p className="sm-order-meta-line">
                        <strong>${Number(order.total_amount || 0).toFixed(2)}</strong>
                      </p>
                      <p className="sm-order-meta-line sm-muted">{shippingSummary(order)}</p>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    <div className="sm-order-actions">
                      <button
                        type="button"
                        className="sm-btn-outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={14} className="me-1" /> View
                      </button>
                      {group.key === 'pending' && (
                        <button
                          type="button"
                          className="sm-btn-dark"
                          onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                        >
                          Start processing
                        </button>
                      )}
                      {group.key === 'processing' && (
                        <button
                          type="button"
                          className="sm-btn-dark"
                          onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                        >
                          Mark shipped
                        </button>
                      )}
                      {group.key === 'shipped' && (
                        <button
                          type="button"
                          className="sm-btn-dark"
                          onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                        >
                          Mark delivered
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          );
        })
      )}

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
                                  {addr.firstName || addr.first_name || ''}{' '}
                                  {addr.lastName || addr.last_name || 'Guest'}
                                </strong>
                              </div>
                              <div className="text-muted">{addr.address || 'No address'}</div>
                              <div className="text-muted">{cityLine || 'No city'}</div>
                              <div className="text-muted">{addr.country || 'United States'}</div>
                              <div className="mt-2">
                                <span className="om-label">Email:</span> {addr.email || 'N/A'}
                              </div>
                              <div>
                                <span className="om-label">Phone:</span> {addr.phone || 'N/A'}
                              </div>
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
                          <span
                            className={`fw-bold ${
                              selectedOrder.payment_status === 'paid' ? 'text-success' : 'text-danger'
                            }`}
                          >
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
                                      <div className="fw-medium small">
                                        Name: {snap.name || 'Product'}
                                      </div>
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
                  Close
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
