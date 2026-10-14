import { useEffect, useState } from 'react';
import { Truck, Save, RefreshCw, Info } from 'lucide-react';
import { themeApi } from '../../services/themeApi';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import '../../assets/css/admin-order-management.css';

const ShippingSettings = () => {
  const { refreshShippingSettings } = useCart();
  const [form, setForm] = useState({
    standard_cost: 10,
    free_threshold: 100,
    label: 'Standard Delivery',
    tax_rate_percent: 8.3,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await themeApi.getShippingSettings();
      if (data?.shipping) {
        setForm({
          standard_cost: Number(data.shipping.standard_cost),
          free_threshold: Number(data.shipping.free_threshold),
          label: data.shipping.label || 'Standard Delivery',
          tax_rate_percent: Number(data.shipping.tax_rate_percent ?? 8.3),
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to load shipping settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    const cost = Number(form.standard_cost);
    const threshold = Number(form.free_threshold);
    const taxPercent = Number(form.tax_rate_percent);

    if (!Number.isFinite(cost) || cost < 0) {
      toast.error('Shipping cost must be 0 or greater');
      return;
    }
    if (!Number.isFinite(threshold) || threshold < 0) {
      toast.error('Free shipping threshold must be 0 or greater');
      return;
    }
    if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
      toast.error('Tax percent must be between 0 and 100');
      return;
    }

    setSaving(true);
    try {
      const data = await themeApi.updateShippingSettings({
        standard_cost: cost,
        free_threshold: threshold,
        label: form.label.trim() || 'Standard Delivery',
        tax_rate_percent: taxPercent,
      });
      setForm({
        standard_cost: Number(data.shipping.standard_cost),
        free_threshold: Number(data.shipping.free_threshold),
        label: data.shipping.label,
        tax_rate_percent: Number(data.shipping.tax_rate_percent),
      });
      await refreshShippingSettings();
      toast.success('Shipping & tax saved — cart & checkout will use the new rates');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const previewFree = Number(form.free_threshold) || 0;
  const previewCost = Number(form.standard_cost) || 0;
  const previewTax = Number(form.tax_rate_percent) || 0;
  const sampleSubtotal = 50;
  const sampleTax = Math.round(sampleSubtotal * (previewTax / 100) * 100) / 100;
  const sampleShip = sampleSubtotal >= previewFree ? 0 : previewCost;
  const sampleTotal = Math.round((sampleSubtotal + sampleTax + sampleShip) * 100) / 100;

  return (
    <div className="om-panel">
      <div className="om-header">
        <div className="d-flex align-items-center gap-2">
          <Truck size={22} style={{ color: '#f26522' }} />
          <h4 className="om-title mb-0">Shipping & Tax Settings</h4>
        </div>
        <button className="btn btn-sm btn-outline-dark d-flex align-items-center gap-2" onClick={loadSettings} disabled={loading}>
          <RefreshCw size={14} /> Reload
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card om-card">
            <div className="card-body p-4">
              {loading ? (
                <p className="text-muted mb-0">Loading rates...</p>
              ) : (
                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Delivery Label</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      placeholder="Standard Delivery"
                    />
                    <div className="form-text">Shown to customers on cart / checkout.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Shipping Charge (USD)</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={form.standard_cost}
                        onChange={(e) => setForm({ ...form, standard_cost: e.target.value })}
                      />
                    </div>
                    <div className="form-text">Flat fee when the order is below the free-shipping threshold.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Free Shipping Threshold (USD)</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={form.free_threshold}
                        onChange={(e) => setForm({ ...form, free_threshold: e.target.value })}
                      />
                    </div>
                    <div className="form-text">
                      Orders with subtotal ≥ this amount get <strong>FREE</strong> shipping.
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Sales Tax (%)</label>
                    <div className="input-group">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.001"
                        className="form-control"
                        value={form.tax_rate_percent}
                        onChange={(e) => setForm({ ...form, tax_rate_percent: e.target.value })}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                    <div className="form-text">
                      Applied on product subtotal only (not on shipping). Example: <strong>8.3</strong> = 8.3%. Set <strong>0</strong> for no tax.
                    </div>
                  </div>

                  <button type="submit" className="btn btn-dark d-flex align-items-center gap-2" disabled={saving}>
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Shipping & Tax'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card om-card h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Info size={18} style={{ color: '#f26522' }} />
                <h6 className="fw-bold mb-0">Live Preview</h6>
              </div>
              <div className="p-3 rounded-3 mb-3" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span>Method</span>
                  <strong>{form.label || 'Standard Delivery'}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping below ${previewFree.toFixed(2)}</span>
                  <strong>${previewCost.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping at / above ${previewFree.toFixed(2)}</span>
                  <strong className="text-success">FREE</strong>
                </div>
                <div className="d-flex justify-content-between border-top pt-2 mt-2">
                  <span>Tax rate</span>
                  <strong>{previewTax}%</strong>
                </div>
              </div>

              <div className="p-3 rounded-3 mb-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="small text-muted mb-2">Example cart of ${sampleSubtotal.toFixed(2)}</div>
                <div className="d-flex justify-content-between small mb-1">
                  <span>Subtotal</span><span>${sampleSubtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                  <span>Tax ({previewTax}%)</span><span>${sampleTax.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                  <span>Shipping</span><span>{sampleShip === 0 ? 'FREE' : `$${sampleShip.toFixed(2)}`}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold border-top pt-2 mt-1">
                  <span>Total</span><span>${sampleTotal.toFixed(2)}</span>
                </div>
              </div>

              <p className="small text-muted mb-0">
                Changes apply immediately to new carts, Stripe charges, and order totals.
                Already-paid orders keep the tax/shipping that was charged at checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingSettings;
