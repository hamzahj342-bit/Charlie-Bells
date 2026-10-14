import { useState, useEffect, useCallback } from 'react';
import { Mail, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { themeApi } from '../../services/themeApi';
import '../../assets/css/admin-email-retry.css';

const FailedEmails = () => {
  const [failedEmails, setFailedEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const fetchFailedEmails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await themeApi.getFailedEmails();
      setFailedEmails(data.failedEmails || []);
    } catch (error) {
      console.error('Error fetching failed emails:', error);
      toast.error(error.response?.data?.error || 'Unable to load failed emails');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFailedEmails();
  }, [fetchFailedEmails]);

  const handleRetryAll = async () => {
    try {
      setRetrying(true);
      const result = await themeApi.retryFailedEmails();
      toast.success(`Retry completed: ${result.successCount} sent, ${result.failureCount} failed`);
      await fetchFailedEmails();
    } catch (error) {
      console.error('Error retrying emails:', error);
      toast.error(error.response?.data?.error || 'Failed to retry emails');
    } finally {
      setRetrying(false);
    }
  };

  const handleRetrySingle = async (emailId) => {
    try {
      const result = await themeApi.retryFailedEmail(emailId);
      if (result.success) {
        toast.success('Email sent successfully!');
        await fetchFailedEmails();
      } else {
        toast.error(result.error || 'Email still failed');
        await fetchFailedEmails();
      }
    } catch (error) {
      console.error('Error retrying email:', error);
      toast.error(error.response?.data?.error || 'Failed to retry email');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle size={16} className="text-warning" />;
      case 'sent':
        return <CheckCircle size={16} className="text-success" />;
      case 'failed':
        return <XCircle size={16} className="text-danger" />;
      default:
        return <Mail size={16} className="text-muted" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      case 'sent':
        return <span className="badge bg-success">Sent</span>;
      case 'failed':
        return <span className="badge bg-danger">Failed</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading failed emails...</p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
      <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#262626', color: 'white', borderRadius: '16px 16px 0 0' }}>
        <h5 className="mb-0" style={{ color: 'white' }}>
          <Mail size={20} className="me-2" />
          Failed Emails
        </h5>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-success"
            onClick={handleRetryAll}
            disabled={retrying || failedEmails.filter((e) => e.status === 'pending').length === 0}
          >
            <RefreshCw size={16} className={`me-1 ${retrying ? 'spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Retry All Pending'}
          </button>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={fetchFailedEmails}
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="card-body">
        {failedEmails.length === 0 ? (
          <div className="text-center py-5">
            <CheckCircle size={48} className="text-success mb-3" />
            <h5 className="text-success">No Failed Emails</h5>
            <p className="text-muted mb-0">All order emails have been sent successfully.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Retries</th>
                  <th>Error</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {failedEmails.map((email) => (
                  <tr key={email.id}>
                    <td>
                      <strong>{email.order_number}</strong>
                    </td>
                    <td>
                      <div className="fw-semibold">{email.customer_name}</div>
                      <small className="text-muted">Order ID: {email.order_id}</small>
                    </td>
                    <td>
                      <code className="text-break">{email.customer_email}</code>
                    </td>
                    <td>
                      <small className="text-break">{email.email_subject}</small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {getStatusIcon(email.status)}
                        {getStatusBadge(email.status)}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-info">{email.retry_count}/5</span>
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <small className="text-danger text-break" title={email.error_message || ''}>
                        {email.error_message || '—'}
                      </small>
                    </td>
                    <td>
                      {(email.status === 'pending' || email.status === 'failed') && (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleRetrySingle(email.id)}
                          title="Retry this email"
                        >
                          <RefreshCw size={14} className="me-1" />
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {failedEmails.length > 0 && (
          <div className="mt-3 p-3 bg-light rounded">
            <h6 className="text-muted mb-2">Summary</h6>
            <div className="row">
              <div className="col-md-3">
                <div className="text-center">
                  <div className="h4 text-warning mb-0">
                    {failedEmails.filter((e) => e.status === 'pending').length}
                  </div>
                  <small className="text-muted">Pending</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <div className="h4 text-success mb-0">
                    {failedEmails.filter((e) => e.status === 'sent').length}
                  </div>
                  <small className="text-muted">Sent</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <div className="h4 text-danger mb-0">
                    {failedEmails.filter((e) => e.status === 'failed').length}
                  </div>
                  <small className="text-muted">Failed</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <div className="h4 text-info mb-0">{failedEmails.length}</div>
                  <small className="text-muted">Total</small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FailedEmails;
