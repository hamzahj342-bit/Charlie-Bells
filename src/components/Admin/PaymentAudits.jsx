import { Fragment, useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, CreditCard,
  RefreshCw, RotateCcw, Search, ShieldAlert, XCircle
} from 'lucide-react';
import { themeApi } from '../../services/themeApi';
import toast from 'react-hot-toast';
import '../../assets/css/admin-payment-audits.css';

const STATUS_STYLES = {
  succeeded: { label: 'Succeeded', bg: '#dcfce7', color: '#166534', icon: CheckCircle2 },
  failed: { label: 'Failed', bg: '#fee2e2', color: '#991b1b', icon: XCircle },
  canceled: { label: 'Canceled', bg: '#e2e8f0', color: '#334155', icon: XCircle },
  processing: { label: 'Processing', bg: '#dbeafe', color: '#1e40af', icon: RefreshCw },
  refunded: { label: 'Refunded', bg: '#fef3c7', color: '#92400e', icon: RotateCcw },
  order_failed: { label: 'Order Failed', bg: '#ffe4e6', color: '#9f1239', icon: AlertTriangle },
};

const SOURCE_LABELS = {
  checkout: 'Checkout',
  order: 'Order',
  webhook: 'Webhook',
};

const formatPhone = (phone) => {
  if (!phone) return 'No phone';
  const digits = phone.replace(/\D/g, '');
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (local.length !== 10) return phone;
  return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || { label: status, bg: '#e2e8f0', color: '#334155', icon: CreditCard };
  const Icon = style.icon;
  return (
    <span className="pa-status-badge" style={{ background: style.bg, color: style.color }}>
      <Icon size={13} /> {style.label}
    </span>
  );
};

const SummaryCard = ({ title, count, amount, gradient, icon: Icon }) => (
  <div className="col-xl-3 col-md-6 mb-3">
    <div
      className={`card pa-summary-card h-100 ${gradient ? '' : 'pa-summary-card-light'}`}
      style={gradient ? { background: gradient, color: '#fff' } : undefined}
    >
      <div className="card-body d-flex align-items-center justify-content-between">
        <div>
          <p className="pa-summary-label">{title}</p>
          <h3 className="pa-summary-count">{count}</h3>
          {amount !== undefined && (
            <span className="pa-summary-amount">${Number(amount || 0).toFixed(2)}</span>
          )}
        </div>
        <Icon size={28} style={{ opacity: 0.8 }} />
      </div>
    </div>
  </div>
);

const DetailItem = ({ label, children }) => (
  <div className="pa-detail-item">
    <span className="pa-detail-label">{label}</span>
    <div className="pa-detail-value">{children}</div>
  </div>
);

const PaymentAudits = () => {
  const [audits, setAudits] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 25 });
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [filters, setFilters] = useState({ status: '', source: '', days: '', search: '' });
  const [searchDraft, setSearchDraft] = useState('');
  const [page, setPage] = useState(1);

  const loadAudits = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: pagination.limit };
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const data = await themeApi.getPaymentAudits(params);
      setAudits(data.audits || []);
      setSummary(data.summary || {});
      setPagination((prev) => ({ ...prev, ...data.pagination }));
      setForbidden(false);
    } catch (error) {
      if (error.response?.status === 403) {
        setForbidden(true);
      } else {
        toast.error(error.response?.data?.error || 'Unable to load payment audits');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, page, pagination.limit]);

  useEffect(() => {
    loadAudits();
  }, [loadAudits]);

  const applyFilter = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const submitSearch = (event) => {
    event.preventDefault();
    applyFilter('search', searchDraft.trim());
  };

  const resetFilters = () => {
    setSearchDraft('');
    setPage(1);
    setFilters({ status: '', source: '', days: '', search: '' });
  };

  if (forbidden) {
    return (
      <div className="card pa-audit-panel pa-main-card">
        <div className="card-body text-center py-5">
          <ShieldAlert size={42} style={{ color: '#f26522' }} className="mb-3" />
          <h5 className="fw-bold">Super Admin Access Required</h5>
          <p className="text-muted mb-0">The payment audit trail is restricted to super admin accounts.</p>
        </div>
      </div>
    );
  }

  const failedCount = (summary.failed?.count || 0) + (summary.order_failed?.count || 0);

  return (
    <div className="pa-audit-panel">
      <div className="row pa-summary-row">
        <SummaryCard
          title="Successful Payments"
          count={summary.succeeded?.count || 0}
          amount={summary.succeeded?.amount}
          gradient="linear-gradient(135deg, #16a34a 0%, #22c55e 100%)"
          icon={CheckCircle2}
        />
        <SummaryCard
          title="Failed Attempts"
          count={failedCount}
          amount={summary.failed?.amount}
          gradient="linear-gradient(135deg, #dc2626 0%, #f87171 100%)"
          icon={XCircle}
        />
        <SummaryCard
          title="Refunded"
          count={summary.refunded?.count || 0}
          amount={summary.refunded?.amount}
          gradient="linear-gradient(135deg, #f26522 0%, #fb923c 100%)"
          icon={RotateCcw}
        />
        <SummaryCard
          title="Total Logged"
          count={pagination.total || 0}
          icon={CreditCard}
        />
      </div>

      <div className="card pa-main-card">
        <div className="pa-main-header">
          <h5>Payment Audit Trail</h5>
          <button
            className="btn btn-sm btn-light d-flex align-items-center gap-2 fw-semibold"
            onClick={loadAudits}
            disabled={loading}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div className="pa-main-body">
          <div className="pa-filters">
            <select
              className="form-select form-select-sm"
              value={filters.status}
              onChange={(e) => applyFilter('status', e.target.value)}
            >
              <option value="">All statuses</option>
              {Object.entries(STATUS_STYLES).map(([value, meta]) => (
                <option key={value} value={value}>{meta.label}</option>
              ))}
            </select>

            <select
              className="form-select form-select-sm"
              value={filters.source}
              onChange={(e) => applyFilter('source', e.target.value)}
            >
              <option value="">All sources</option>
              {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <select
              className="form-select form-select-sm"
              value={filters.days}
              onChange={(e) => applyFilter('days', e.target.value)}
            >
              <option value="">All time</option>
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>

            <form className="pa-search-form" onSubmit={submitSearch}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white"><Search size={14} /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Intent, order, email, phone, last4"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-sm btn-dark fw-semibold">Go</button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={resetFilters}>Clear</button>
            </form>
          </div>

          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th className="pa-col-time">Time</th>
                  <th className="pa-col-status">Status</th>
                  <th className="pa-col-source">Source</th>
                  <th className="pa-col-attempt">Attempt</th>
                  <th className="pa-col-amount">Amount</th>
                  <th className="pa-col-card">Card</th>
                  <th className="pa-col-customer">Customer</th>
                  <th className="pa-col-order">Order</th>
                  <th className="pa-col-details">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="text-center pa-empty py-4">Loading audit entries...</td>
                  </tr>
                )}

                {!loading && audits.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center pa-empty py-4">No payment attempts recorded yet.</td>
                  </tr>
                )}

                {!loading && audits.map((audit) => (
                  <Fragment key={audit.id}>
                    <tr>
                      <td className="pa-cell-time">
                        {new Date(audit.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                        })}
                      </td>
                      <td><StatusBadge status={audit.status} /></td>
                      <td className="pa-cell-source">{SOURCE_LABELS[audit.source] || audit.source}</td>
                      <td className="pa-cell-attempt">{audit.attempt_number ?? '—'}</td>
                      <td className="pa-cell-amount">
                        {audit.amount ? `$${Number(audit.amount).toFixed(2)}` : '—'}
                      </td>
                      <td className="pa-cell-card">
                        {audit.card_brand
                          ? `${audit.card_brand.toUpperCase()} ••${audit.card_last4 || '????'}`
                          : audit.payment_method_type || '—'}
                      </td>
                      <td>
                        <div className="pa-customer">
                          <span className="pa-customer-name">{audit.customer_name || 'Unknown name'}</span>
                          <span className="pa-customer-email">{audit.customer_email || 'No email'}</span>
                          <span className="pa-customer-phone">{formatPhone(audit.customer_phone)}</span>
                        </div>
                      </td>
                      <td className="pa-cell-order">{audit.order_number || '—'}</td>
                      <td className="pa-col-details">
                        <button
                          className="btn btn-sm btn-outline-dark pa-view-btn"
                          onClick={() => setExpandedId(expandedId === audit.id ? null : audit.id)}
                        >
                          {expandedId === audit.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          View
                        </button>
                      </td>
                    </tr>

                    {expandedId === audit.id && (
                      <tr className="pa-details-row">
                        <td colSpan={9}>
                          <div className="pa-details-grid">
                            <DetailItem label="Customer">{audit.customer_name || '—'}</DetailItem>
                            <DetailItem label="Error Code">{audit.error_code || '—'}</DetailItem>
                            <DetailItem label="Email">{audit.customer_email || '—'}</DetailItem>
                            <DetailItem label="Error Message">{audit.error_message || '—'}</DetailItem>
                            <DetailItem label="Phone">{audit.customer_phone || '—'}</DetailItem>
                            <DetailItem label="Currency">{audit.currency || '—'}</DetailItem>
                            <DetailItem label="Payment Intent">
                              <code>{audit.payment_intent_id || '—'}</code>
                            </DetailItem>
                            <DetailItem label="Stripe Event">
                              <code>{audit.stripe_event_id || '—'}</code>
                            </DetailItem>
                            {audit.details && (
                              <DetailItem label="Extra">
                                {Object.entries(audit.details)
                                  .filter(([, value]) => value !== null && value !== undefined)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(' | ') || '—'}
                              </DetailItem>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="pa-pagination">
              <span className="pa-pagination-meta">
                Page {pagination.page} of {pagination.pages} · {pagination.total} entries
              </span>
              <div className="btn-group">
                <button
                  className="btn btn-sm btn-outline-dark"
                  disabled={loading || page <= 1}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                >
                  Previous
                </button>
                <button
                  className="btn btn-sm btn-outline-dark"
                  disabled={loading || page >= pagination.pages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentAudits;
