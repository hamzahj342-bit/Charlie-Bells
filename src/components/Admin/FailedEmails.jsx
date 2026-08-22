import React, { useState, useEffect } from 'react';
import { Mail, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../assets/css/admin-email-retry.css';

const FailedEmails = () => {
  const [failedEmails, setFailedEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    fetchFailedEmails();
  }, []);

  const fetchFailedEmails = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching failed emails with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('/api/orders/failed-emails', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        console.error('Received HTML instead of JSON:', text.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Server may be down or route not found.');
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Failed emails data:', data);
        setFailedEmails(data.failedEmails || []);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        toast.error(`Failed to fetch failed emails: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching failed emails:', error);
      toast.error(`Error fetching failed emails: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryAll = async () => {
    try {
      setRetrying(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders/retry-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Retry completed: ${result.successCount} sent, ${result.failureCount} failed`);
        fetchFailedEmails(); // Refresh the list
      } else {
        toast.error('Failed to retry emails');
      }
    } catch (error) {
      console.error('Error retrying emails:', error);
      toast.error('Error retrying emails');
    } finally {
      setRetrying(false);
    }
  };

  const handleRetrySingle = async (emailId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/retry-email/${emailId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('Email sent successfully!');
          fetchFailedEmails(); // Refresh the list
        } else {
          toast.error('Email still failed');
        }
      } else {
        toast.error('Failed to retry email');
      }
    } catch (error) {
      console.error('Error retrying email:', error);
      toast.error('Error retrying email');
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
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#262626', color: 'white' }}>
        <h5 className="mb-0" style={{ color: 'white' }}>
          <Mail size={20} className="me-2" />
          Failed Emails Management
        </h5>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-success"
            onClick={handleRetryAll}
            disabled={retrying || failedEmails.length === 0}
          >
            <RefreshCw size={16} className={`me-1 ${retrying ? 'spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Retry All'}
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
            <p className="text-muted">All emails have been sent successfully!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Retries</th>
                  <th>Last Retry</th>
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
                      <div>
                        <div className="fw-semibold">{email.customer_name}</div>
                        <small className="text-muted">Order ID: {email.order_id}</small>
                      </div>
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
                    <td>
                      {email.last_retry_at ? (
                        <small className="text-muted">
                          {new Date(email.last_retry_at).toLocaleString()}
                        </small>
                      ) : (
                        <span className="text-muted">Never</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        {email.status === 'pending' && (
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleRetrySingle(email.id)}
                            title="Retry this email"
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                        {email.error_message && (
                          <button
                            className="btn btn-outline-secondary"
                            title={`Error: ${email.error_message}`}
                            data-bs-toggle="tooltip"
                          >
                            <AlertTriangle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {failedEmails.length > 0 && (
          <div className="mt-3 p-3 bg-light rounded">
            <h6 className="text-muted mb-2">Summary:</h6>
            <div className="row">
              <div className="col-md-3">
                <div className="text-center">
                  <div className="h4 text-warning mb-0">
                    {failedEmails.filter(e => e.status === 'pending').length}
                  </div>
                  <small className="text-muted">Pending</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <div className="h4 text-success mb-0">
                    {failedEmails.filter(e => e.status === 'sent').length}
                  </div>
                  <small className="text-muted">Sent</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <div className="h4 text-danger mb-0">
                    {failedEmails.filter(e => e.status === 'failed').length}
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
