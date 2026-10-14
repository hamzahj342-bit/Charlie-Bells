import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3, CalendarRange, Download, DollarSign, Package,
  RefreshCw, ShoppingBag, Truck
} from 'lucide-react';
import { themeApi } from '../../services/themeApi';
import toast from 'react-hot-toast';
import '../../assets/css/admin-orders-report.css';

const toInputDate = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const startOfDayOffset = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return toInputDate(d);
};

const PRESETS = [
  { id: 'today', label: 'Today', from: () => toInputDate(new Date()), to: () => toInputDate(new Date()) },
  { id: '7d', label: 'Last 7 days', from: () => startOfDayOffset(6), to: () => toInputDate(new Date()) },
  { id: '30d', label: 'Last 30 days', from: () => startOfDayOffset(29), to: () => toInputDate(new Date()) },
  { id: 'month', label: 'This month', from: () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }, to: () => toInputDate(new Date()) },
  { id: 'all', label: 'All time', from: () => '', to: () => '' },
];

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#92400e' },
  processing: { bg: '#cffafe', color: '#0e7490' },
  shipped: { bg: '#dbeafe', color: '#1d4ed8' },
  delivered: { bg: '#dcfce7', color: '#166534' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const SummaryCard = ({ title, value, hint, gradient, icon: Icon }) => (
  <div className="col-xl-3 col-md-6 mb-3">
    <div className="card or-summary-card h-100" style={{ background: gradient }}>
      <div className="card-body d-flex align-items-center justify-content-between">
        <div>
          <p className="or-summary-label">{title}</p>
          <h3 className="or-summary-value">{value}</h3>
          {hint && <span className="or-summary-hint">{hint}</span>}
        </div>
        <Icon size={28} style={{ opacity: 0.85 }} />
      </div>
    </div>
  </div>
);

const OrdersReport = () => {
  const [filters, setFilters] = useState({
    from: startOfDayOffset(29),
    to: toInputDate(new Date()),
    status: '',
    payment_status: '',
  });
  const [activePreset, setActivePreset] = useState('30d');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async (nextFilters = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (nextFilters.from) params.from = nextFilters.from;
      if (nextFilters.to) params.to = nextFilters.to;
      if (nextFilters.status) params.status = nextFilters.status;
      if (nextFilters.payment_status) params.payment_status = nextFilters.payment_status;

      const data = await themeApi.getOrdersReport(params);
      setReport(data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to load orders report');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReport();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyPreset = (preset) => {
    const next = {
      ...filters,
      from: preset.from(),
      to: preset.to(),
    };
    setActivePreset(preset.id);
    setFilters(next);
    loadReport(next);
  };

  const applyCustomFilter = (event) => {
    event.preventDefault();
    setActivePreset('custom');
    loadReport(filters);
  };

  const summary = report?.summary || {
    total_orders: 0,
    items_sold: 0,
    revenue: 0,
    paid_revenue: 0,
    tax: 0,
    shipping: 0,
    average_order_value: 0,
    by_status: {},
  };

  const rangeLabel = useMemo(() => {
    if (!filters.from && !filters.to) return 'All time';
    if (filters.from && filters.to) return `${filters.from} → ${filters.to}`;
    if (filters.from) return `From ${filters.from}`;
    return `Until ${filters.to}`;
  }, [filters.from, filters.to]);

  const exportCsv = () => {
    const rows = report?.orders || [];
    if (!rows.length) {
      toast.error('No rows to export for this date range');
      return;
    }

    const headers = [
      'Order Number', 'Date', 'Customer', 'Email', 'Phone', 'Status',
      'Payment Status', 'Items', 'Subtotal', 'Tax', 'Shipping', 'Total', 'Transaction ID'
    ];

    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const lines = [
      headers.join(','),
      ...rows.map((order) => [
        order.order_number,
        new Date(order.created_at).toLocaleString(),
        order.customer_name,
        order.customer_email,
        order.customer_phone,
        order.status,
        order.payment_status,
        order.item_count,
        order.subtotal,
        order.tax_amount,
        order.shipping_amount,
        order.total_amount,
        order.transaction_id,
      ].map(escape).join(',')),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `charlie-bells-orders-${filters.from || 'all'}-to-${filters.to || 'all'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  return (
    <div className="or-panel">
      <div className="or-header">
        <div>
          <h4 className="or-title d-flex align-items-center gap-2">
            <BarChart3 size={22} style={{ color: '#f26522' }} /> Orders Report
          </h4>
          <p className="or-subtitle">Custom date-range performance for Charlie Bells · {rangeLabel}</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-dark d-flex align-items-center gap-2" onClick={() => loadReport()} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-sm btn-dark d-flex align-items-center gap-2" onClick={exportCsv} disabled={loading}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="or-presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`or-preset-btn ${activePreset === preset.id ? 'active' : ''}`}
            onClick={() => applyPreset(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form className="or-filters" onSubmit={applyCustomFilter}>
        <div>
          <label htmlFor="or-from">From</label>
          <input
            id="or-from"
            type="date"
            className="form-control"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="or-to">To</label>
          <input
            id="or-to"
            type="date"
            className="form-control"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="or-status">Order Status</label>
          <select
            id="or-status"
            className="form-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label htmlFor="or-pay">Payment</label>
          <select
            id="or-pay"
            className="form-select"
            value={filters.payment_status}
            onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
          >
            <option value="">All payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <button type="submit" className="btn btn-dark d-flex align-items-center justify-content-center gap-2" disabled={loading}>
          <CalendarRange size={16} /> Apply
        </button>
      </form>

      <div className="row">
        <SummaryCard
          title="Orders"
          value={summary.total_orders}
          hint={`${summary.items_sold || 0} items sold`}
          gradient="linear-gradient(135deg, #111827 0%, #334155 100%)"
          icon={ShoppingBag}
        />
        <SummaryCard
          title="Gross Revenue"
          value={money(summary.revenue)}
          hint={`Paid ${money(summary.paid_revenue)}`}
          gradient="linear-gradient(135deg, #16a34a 0%, #22c55e 100%)"
          icon={DollarSign}
        />
        <SummaryCard
          title="Tax Collected"
          value={money(summary.tax)}
          hint={`Avg order ${money(summary.average_order_value)}`}
          gradient="linear-gradient(135deg, #f26522 0%, #fb923c 100%)"
          icon={Package}
        />
        <SummaryCard
          title="Shipping Collected"
          value={money(summary.shipping)}
          hint="Delivery fees in range"
          gradient="linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)"
          icon={Truck}
        />
      </div>

      {Object.keys(summary.by_status || {}).length > 0 && (
        <div className="card or-card mb-3">
          <div className="or-card-header">
            <h5>Status Breakdown</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {Object.entries(summary.by_status).map(([status, stats]) => {
                const style = STATUS_COLORS[status] || { bg: '#e2e8f0', color: '#334155' };
                return (
                  <div className="col-md-4 col-lg-2" key={status}>
                    <div className="p-3 rounded-3 h-100" style={{ background: style.bg, color: style.color }}>
                      <div className="fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>{status}</div>
                      <div className="fs-4 fw-bold">{stats.count}</div>
                      <div style={{ fontSize: '0.82rem' }}>{money(stats.revenue)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="card or-card">
        <div className="or-card-header">
          <h5>Order Details</h5>
          <small>{loading ? 'Loading...' : `${report?.orders?.length || 0} rows`}</small>
        </div>
        <div className="table-responsive">
          <table className="table or-table table-hover mb-0">
            <thead>
              <tr>
                <th className="px-3 py-3">Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th className="text-center">Items</th>
                <th className="text-end">Subtotal</th>
                <th className="text-end">Tax</th>
                <th className="text-end">Ship</th>
                <th className="text-end">Total</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={10} className="or-empty">Building report...</td>
                </tr>
              )}

              {!loading && (!report?.orders || report.orders.length === 0) && (
                <tr>
                  <td colSpan={10} className="or-empty">No orders found for this date range.</td>
                </tr>
              )}

              {!loading && report?.orders?.map((order) => {
                const style = STATUS_COLORS[order.status] || { bg: '#e2e8f0', color: '#334155' };
                return (
                  <tr key={order.id}>
                    <td className="px-3">
                      <div className="fw-bold">{order.order_number || `#${order.id}`}</div>
                    </td>
                    <td>
                      <small>{new Date(order.created_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}</small>
                    </td>
                    <td>
                      <div className="or-customer-name">{order.customer_name}</div>
                      <div className="or-customer-meta">{order.customer_email || 'No email'}</div>
                      <div className="or-customer-meta">{order.customer_phone || 'No phone'}</div>
                    </td>
                    <td className="text-center">{order.item_count}</td>
                    <td className="text-end or-money">{money(order.subtotal)}</td>
                    <td className="text-end or-money">{money(order.tax_amount)}</td>
                    <td className="text-end or-money">{money(order.shipping_amount)}</td>
                    <td className="text-end or-money">{money(order.total_amount)}</td>
                    <td>
                      <span className="or-status-chip" style={{ background: style.bg, color: style.color }}>
                        {(order.status || 'unknown').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <small className="fw-semibold text-uppercase">{order.payment_status || '—'}</small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersReport;
