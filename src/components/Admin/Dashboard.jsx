import { useEffect, useMemo, useState } from 'react';
import { Package, ShoppingCart, AlertTriangle, Clock, Globe } from 'lucide-react';
import { themeApi } from '../../services/themeApi';

const toInputDate = (d) => d.toISOString().slice(0, 10);

const defaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - 6);
  return { from: toInputDate(from), to: toInputDate(to) };
};

const Dashboard = ({ stats, products, categories, orders, onNavigate }) => {
  const pendingOrders = (orders || []).filter((o) => o.status === 'pending').length;
  const processingOrders = (orders || []).filter((o) => o.status === 'processing').length;
  const soldOut = (products || []).filter((p) => Number(p.stock_quantity || 0) <= 0).length;
  const lowStock = (products || []).filter((p) => {
    const qty = Number(p.stock_quantity || 0);
    return qty > 0 && qty <= 10;
  }).length;

  const recentOrders = [...(orders || [])]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
  const recentProducts = (products || []).slice(0, 5);

  const initial = useMemo(() => defaultRange(), []);
  const [fromDate, setFromDate] = useState(initial.from);
  const [toDate, setToDate] = useState(initial.to);
  const [traffic, setTraffic] = useState(null);
  const [trafficLoading, setTrafficLoading] = useState(true);
  const [trafficError, setTrafficError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setTrafficLoading(true);
      setTrafficError('');
      try {
        const data = await themeApi.getTrafficStats({ from: fromDate, to: toDate });
        if (!cancelled) setTraffic(data);
      } catch {
        if (!cancelled) {
          setTraffic(null);
          setTrafficError('Unable to load traffic');
        }
      } finally {
        if (!cancelled) setTrafficLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fromDate, toDate]);

  const maxDay = Math.max(1, ...(traffic?.days || []).map((d) => d.visitors));

  return (
    <div>
      <div className="sm-tasks">
        <button type="button" className="sm-task-card" onClick={() => onNavigate?.('orders')}>
          <p className="sm-task-title">
            <Clock size={16} className="me-1" style={{ verticalAlign: '-2px' }} />
            Orders needing action
          </p>
          <p className="sm-task-line">
            {pendingOrders} pending · {processingOrders} processing
          </p>
        </button>

        <button type="button" className="sm-task-card" onClick={() => onNavigate?.('products')}>
          <p className="sm-task-title">
            <AlertTriangle size={16} className="me-1" style={{ verticalAlign: '-2px' }} />
            Listings stock
          </p>
          <p className="sm-task-line">
            {soldOut} sold out · {lowStock} low stock
          </p>
        </button>

        <button type="button" className="sm-task-card" onClick={() => onNavigate?.('categories')}>
          <p className="sm-task-title">
            <Package size={16} className="me-1" style={{ verticalAlign: '-2px' }} />
            Catalog
          </p>
          <p className="sm-task-line">
            {(products || []).length} listings · {(categories || []).length} categories
          </p>
        </button>
      </div>

      <div className="sm-stats-card">
        <div className="sm-stat-cell">
          <p className="sm-stat-label">Total Products</p>
          <p className="sm-stat-value">{stats.totalProducts || 0}</p>
        </div>
        <div className="sm-stat-cell">
          <p className="sm-stat-label">Total Orders</p>
          <p className="sm-stat-value">{stats.totalOrders || 0}</p>
        </div>
        <div className="sm-stat-cell">
          <p className="sm-stat-label">Total Revenue</p>
          <p className="sm-stat-value">${Number(stats.totalRevenue || 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="sm-card sm-traffic-card mb-4">
        <div className="sm-traffic-head">
          <div>
            <h3 className="sm-section-title mb-1">
              <Globe size={16} className="me-1" style={{ verticalAlign: '-2px' }} />
              Store visits (outside Pakistan)
            </h3>
            <p className="sm-muted mb-0" style={{ fontSize: '0.82rem' }}>
              Real unique visitors per day · USA and all countries except Pakistan
            </p>
          </div>
          <div className="sm-traffic-filters">
            <label className="sm-traffic-date">
              <span>From</span>
              <input
                type="date"
                value={fromDate}
                max={toDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </label>
            <label className="sm-traffic-date">
              <span>To</span>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                max={toInputDate(new Date())}
                onChange={(e) => setToDate(e.target.value)}
              />
            </label>
          </div>
        </div>

        {trafficLoading ? (
          <p className="sm-muted mb-0">Loading traffic…</p>
        ) : trafficError ? (
          <p className="text-danger mb-0">{trafficError}</p>
        ) : (
          <>
            <div className="sm-traffic-summary">
              <div>
                <p className="sm-stat-label">Today</p>
                <p className="sm-stat-value" style={{ fontSize: '1.5rem' }}>
                  {traffic?.today ?? 0}
                </p>
              </div>
              <div>
                <p className="sm-stat-label">Selected range</p>
                <p className="sm-stat-value" style={{ fontSize: '1.5rem' }}>
                  {traffic?.rangeTotal ?? 0}
                </p>
              </div>
            </div>

            <div className="sm-traffic-bars">
              {(traffic?.days || []).map((day) => (
                <div key={day.date} className="sm-traffic-bar-row">
                  <span className="sm-traffic-bar-date">
                    {new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="sm-traffic-bar-track">
                    <div
                      className="sm-traffic-bar-fill"
                      style={{ width: `${Math.max(4, (day.visitors / maxDay) * 100)}%` }}
                    />
                  </div>
                  <span className="sm-traffic-bar-count">{day.visitors}</span>
                </div>
              ))}
            </div>

            {(traffic?.countries || []).length > 0 && (
              <div className="sm-traffic-countries">
                <p className="sm-stat-label mb-2">Top countries in range</p>
                <div className="d-flex flex-wrap gap-2">
                  {traffic.countries.map((c) => (
                    <span key={c.country} className="sm-traffic-chip">
                      {c.country} · {c.visitors}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="sm-two-col">
        <div className="sm-card">
          <h3 className="sm-section-title">
            <ShoppingCart size={16} className="me-1" style={{ verticalAlign: '-2px' }} />
            Recent orders
          </h3>
          {recentOrders.length === 0 ? (
            <p className="sm-muted mb-0">No orders yet.</p>
          ) : (
            recentOrders.map((order) => {
              const addr =
                typeof order.shipping_address === 'string'
                  ? (() => {
                      try {
                        return JSON.parse(order.shipping_address);
                      } catch {
                        return {};
                      }
                    })()
                  : order.shipping_address || {};
              const name =
                `${addr.firstName || addr.first_name || ''} ${addr.lastName || addr.last_name || ''}`.trim() ||
                'Guest';
              return (
                <div key={order.id} className="sm-list-row">
                  <div className="flex-grow-1 min-w-0">
                    <div className="fw-semibold text-truncate">{name}</div>
                    <small className="sm-muted">
                      #{order.id} · {new Date(order.created_at).toLocaleDateString()} ·{' '}
                      {order.status}
                    </small>
                  </div>
                  <strong>${Number(order.total_amount || 0).toFixed(2)}</strong>
                </div>
              );
            })
          )}
        </div>

        <div className="sm-card">
          <h3 className="sm-section-title">Recent listings</h3>
          {recentProducts.length === 0 ? (
            <p className="sm-muted mb-0">No listings yet.</p>
          ) : (
            recentProducts.map((product) => (
              <div key={product.id} className="sm-list-row">
                <img
                  src={product.image_url || '/src/assets/images/tshirt-img.png'}
                  alt={product.name}
                  className="sm-thumb"
                />
                <div className="flex-grow-1 min-w-0">
                  <div className="fw-semibold text-truncate">{product.name}</div>
                  <small className="sm-muted">
                    {product.sku || `IND-${product.id}`} · {product.stock_quantity || 0} in stock
                  </small>
                </div>
                <strong>
                  {Number(product.discount_price) > 0 &&
                  Number(product.discount_price) < Number(product.price)
                    ? `$${Number(product.discount_price).toFixed(2)}`
                    : `$${Number(product.price || 0).toFixed(2)}`}
                </strong>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
