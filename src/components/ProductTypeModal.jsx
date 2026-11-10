import { useEffect, useMemo, useState } from 'react';
import {
  Save,
  Image as ImageIcon,
  Hash,
  Tag,
  Layers,
  UploadCloud,
  Trash2,
  ClipboardList,
  ExternalLink,
  Ruler,
  Plus,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { productPath } from '../utils/seo';
import { themeApi } from '../services/themeApi';

const TABS = [
  { id: 'photos', label: 'Photos' },
  { id: 'details', label: 'Item details' },
  { id: 'options', label: 'Item options' },
  { id: 'pricing', label: 'Pricing & inventory' },
];

const normalizeSizes = (sizes) =>
  (Array.isArray(sizes) ? sizes : [])
    .map((s) => ({
      size: String(s?.size || s?.name || s || '').trim(),
      quantity: Math.max(0, parseInt(s?.quantity ?? 0, 10) || 0),
    }))
    .filter((s) => s.size);

const ProductModal = ({
  onClose,
  productForm,
  setProductForm,
  editingProduct,
  categories,
  uploadedImages,
  uploadingImages,
  handleImageUpload,
  removeUploadedImage,
  setCoverImage,
  handleSaveProduct,
}) => {
  const [activeSection, setActiveSection] = useState('photos');
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [draftOptions, setDraftOptions] = useState([]);
  const [optionInput, setOptionInput] = useState('');
  const [catalogSizes, setCatalogSizes] = useState([]);

  const isEdit = Boolean(editingProduct);
  const title = isEdit ? productForm.name?.trim() || 'Edit listing' : 'New listing';
  const statusActive = (productForm.status || 'active') === 'active';
  const sizes = normalizeSizes(productForm.sizes);
  const sizeTotal = useMemo(
    () => sizes.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0),
    [sizes]
  );
  const hasSizes = sizes.length > 0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await themeApi.getSizes();
        if (!cancelled) setCatalogSizes(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setCatalogSizes([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openSizeModal = () => {
    setDraftOptions(sizes.map((s) => s.size));
    setOptionInput('');
    setShowSizeModal(true);
  };

  const addDraftOption = (raw) => {
    const value = String(raw || '').trim();
    if (!value) return;
    setDraftOptions((prev) =>
      prev.some((o) => o.toLowerCase() === value.toLowerCase()) ? prev : [...prev, value]
    );
    setOptionInput('');
  };

  const removeDraftOption = (value) => {
    setDraftOptions((prev) => prev.filter((o) => o !== value));
  };

  const applySizeOptions = () => {
    if (draftOptions.length === 0) return;
    const prevMap = Object.fromEntries(sizes.map((s) => [s.size.toLowerCase(), s.quantity]));
    const next = draftOptions.map((name) => ({
      size: name,
      quantity: prevMap[name.toLowerCase()] ?? 0,
    }));
    setProductForm({
      ...productForm,
      sizes: next,
      stock_quantity: next.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0),
    });
    setShowSizeModal(false);
  };

  const updateSizeQty = (index, qty) => {
    const next = sizes.map((s, i) =>
      i === index ? { ...s, quantity: Math.max(0, parseInt(qty, 10) || 0) } : s
    );
    setProductForm({
      ...productForm,
      sizes: next,
      stock_quantity: next.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0),
    });
  };

  const removeSizeRow = (index) => {
    const next = sizes.filter((_, i) => i !== index);
    setProductForm({
      ...productForm,
      sizes: next,
      stock_quantity: next.length
        ? next.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0)
        : productForm.stock_quantity,
    });
  };

  const clearSizes = () => {
    setProductForm({ ...productForm, sizes: [] });
  };

  return (
    <div className="sm-listing-page">
      <div className="sm-listing-page-top">
        <nav className="sm-listing-crumb" aria-label="Breadcrumb">
          <button type="button" className="sm-listing-crumb-link" onClick={onClose}>
            Listings
          </button>
          <span className="sm-listing-crumb-sep">›</span>
          <span>{isEdit ? 'Edit listing' : 'New listing'}</span>
        </nav>

        <div className="sm-listing-page-head">
          <div className="min-w-0">
            <h1 className="sm-listing-page-title">{title}</h1>
            {isEdit && (
              <div className="sm-listing-status-row">
                <span className={`sm-listing-status ${statusActive ? 'active' : 'inactive'}`}>
                  {statusActive ? 'Active' : 'Inactive'}
                </span>
                {editingProduct?.created_at && (
                  <span className="sm-muted small">
                    Listed on{' '}
                    {new Date(editingProduct.created_at).toLocaleDateString(undefined, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            )}
          </div>
          {isEdit && (
            <Link
              to={productPath(editingProduct)}
              className="sm-btn-outline"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={14} /> View on shop
            </Link>
          )}
        </div>

        <div className="sm-listing-tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeSection === tab.id}
              className={`sm-listing-tab ${activeSection === tab.id ? 'active' : ''}`}
              onClick={() => setActiveSection(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sm-listing-page-body">
        {activeSection === 'photos' && (
          <section className="sm-listing-section">
            <h2 className="sm-listing-section-title">
              <ImageIcon size={18} className="me-1" style={{ verticalAlign: '-3px' }} />
              Photos
            </h2>
            <p className="sm-listing-section-desc">
              Show different angles of your product. The first image is used as the cover.
            </p>
            <p className="sm-listing-section-note">Add photos · drag order via Set cover</p>

            <input
              type="file"
              id="imageUpload"
              className="d-none"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              disabled={uploadingImages}
            />
            <label htmlFor="imageUpload" className="sm-listing-dropzone">
              <UploadCloud size={28} className="mb-2" />
              <div className="fw-semibold">
                {uploadingImages ? 'Uploading…' : 'Drag and drop files or'}
              </div>
              <span className="sm-btn-dark mt-2" style={{ pointerEvents: 'none' }}>
                + Upload
              </span>
            </label>

            {uploadedImages.length > 0 && (
              <div className="sm-listing-photo-grid">
                {uploadedImages.map((img, idx) => (
                  <div
                    key={`${img}-${idx}`}
                    className={`sm-listing-photo ${idx === 0 ? 'is-cover' : ''}`}
                  >
                    <img src={img} alt={`Listing ${idx + 1}`} />
                    {idx === 0 && <span className="sm-listing-photo-badge">Featured</span>}
                    <div className="sm-listing-photo-actions">
                      {idx !== 0 && (
                        <button type="button" onClick={() => setCoverImage?.(idx)}>
                          Set cover
                        </button>
                      )}
                      <button
                        type="button"
                        className="danger"
                        onClick={() => removeUploadedImage(idx)}
                        aria-label="Remove photo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === 'details' && (
          <section className="sm-listing-section">
            <h2 className="sm-listing-section-title">
              <ClipboardList size={18} className="me-1" style={{ verticalAlign: '-3px' }} />
              Item details
            </h2>
            <p className="sm-listing-section-desc">
              Title, description, category, and identifiers for this listing.
            </p>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Listing title"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">SKU</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <Hash size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Unique SKU"
                    value={productForm.sku || ''}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  />
                </div>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                  Required — must be unique
                </small>
              </div>
              <div className="col-md-6">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  required
                  value={productForm.category_id}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category_id: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  {(categories || [])
                    .filter((c) => c)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Barcode</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Optional"
                  value={productForm.barcode || ''}
                  onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label">
                  <Layers size={12} className="me-1" />
                  Description
                </label>
                <textarea
                  className="form-control"
                  rows="6"
                  placeholder="Describe your listing…"
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                />
              </div>
            </div>
          </section>
        )}

        {activeSection === 'options' && (
          <section className="sm-listing-section">
            <h2 className="sm-listing-section-title">
              <Ruler size={18} className="me-1" style={{ verticalAlign: '-3px' }} />
              Item options
            </h2>
            <p className="sm-listing-section-desc">
              Add options like size that may affect available inventory quantities.
            </p>

            <div className="sm-variation-block">
              <div className="sm-variation-block-head">
                <div>
                  <h3 className="sm-variation-title">Variations</h3>
                  <p className="sm-muted mb-0" style={{ fontSize: '0.82rem' }}>
                    Size options buyers can choose on the product page.
                  </p>
                </div>
                <button type="button" className="sm-btn-outline" onClick={openSizeModal}>
                  <Plus size={14} /> {hasSizes ? 'Edit size' : 'Add variation'}
                </button>
              </div>

              {!hasSizes ? (
                <p className="sm-muted mb-0 mt-3" style={{ fontSize: '0.85rem' }}>
                  No variations yet. Add a Size variation to track stock per option.
                </p>
              ) : (
                <div className="sm-size-rows mt-3">
                  <div className="sm-size-row sm-size-row-head">
                    <span>Size</span>
                    <span>Quantity</span>
                    <span />
                  </div>
                  {sizes.map((row, index) => (
                    <div key={`${row.size}-${index}`} className="sm-size-row">
                      <span className="fw-semibold">{row.size}</span>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={row.quantity}
                        onChange={(e) => updateSizeQty(index, e.target.value)}
                      />
                      <button
                        type="button"
                        className="sm-icon-btn"
                        onClick={() => removeSizeRow(index)}
                        aria-label={`Remove ${row.size}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <button type="button" className="sm-link-btn p-0" onClick={clearSizes}>
                      Remove size variation
                    </button>
                    <strong>Total stock: {sizeTotal}</strong>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === 'pricing' && (
          <section className="sm-listing-section">
            <h2 className="sm-listing-section-title">
              <Tag size={18} className="me-1" style={{ verticalAlign: '-3px' }} />
              Pricing & inventory
            </h2>
            <p className="sm-listing-section-desc">Set price, stock, and listing status.</p>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Price (USD)</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">$</span>
                  <input
                    type="number"
                    className="form-control"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Discount price</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">$</span>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Optional"
                    value={productForm.discount_price || ''}
                    onChange={(e) =>
                      setProductForm({ ...productForm, discount_price: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Quantity</label>
                {hasSizes ? (
                  <div className="sm-managed-qty">
                    <strong>{sizeTotal}</strong>
                    <span className="sm-muted">Managed per size</span>
                  </div>
                ) : (
                  <input
                    type="number"
                    className="form-control"
                    value={productForm.stock_quantity}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock_quantity: e.target.value })
                    }
                  />
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={productForm.status || 'active'}
                  onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="sm-listing-page-foot">
        <button type="button" className="sm-btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="sm-btn-dark" onClick={handleSaveProduct}>
          <Save size={16} />
          {isEdit ? 'Publish changes' : 'Publish'}
        </button>
      </div>

      {showSizeModal && (
        <div className="sm-size-modal-backdrop" role="presentation">
          <div className="sm-size-modal" role="dialog" aria-modal="true" aria-labelledby="size-modal-title">
            <div className="sm-size-modal-head">
              <div>
                <h3 id="size-modal-title" className="mb-0">
                  Size
                </h3>
                <p className="sm-muted mb-0" style={{ fontSize: '0.8rem' }}>
                  Variation
                </p>
              </div>
              <button
                type="button"
                className="sm-icon-btn"
                onClick={() => setShowSizeModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="sm-size-modal-body">
              <p className="sm-muted" style={{ fontSize: '0.85rem' }}>
                Buyers can choose from the following options. Enter sizes like Small, Medium, 6&quot;,
                or XL.
              </p>

              <label className="form-label">Options</label>
              <div className="sm-size-option-input">
                <input
                  type="text"
                  className="form-control"
                  list="sm-size-suggestions"
                  placeholder="Enter an option…"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDraftOption(optionInput);
                    }
                  }}
                />
                <button
                  type="button"
                  className="sm-btn-outline"
                  onClick={() => addDraftOption(optionInput)}
                >
                  Add
                </button>
              </div>
              <datalist id="sm-size-suggestions">
                {catalogSizes.map((s) => (
                  <option key={s.id || s.size} value={s.size} />
                ))}
              </datalist>

              {draftOptions.length > 0 && (
                <div className="sm-size-chips mt-3">
                  {draftOptions.map((opt) => (
                    <span key={opt} className="sm-size-chip">
                      {opt}
                      <button type="button" onClick={() => removeDraftOption(opt)} aria-label={`Remove ${opt}`}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="sm-size-modal-foot">
              <button type="button" className="sm-link-btn" onClick={() => setShowSizeModal(false)}>
                Cancel
              </button>
              <div className="d-flex align-items-center gap-2">
                {draftOptions.length === 0 && (
                  <span className="sm-muted" style={{ fontSize: '0.78rem' }}>
                    Add at least 1 option
                  </span>
                )}
                <button
                  type="button"
                  className="sm-btn-dark"
                  disabled={draftOptions.length === 0}
                  onClick={applySizeOptions}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductModal;
