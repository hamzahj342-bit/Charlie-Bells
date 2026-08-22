import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Save, RefreshCw, Settings, ShieldCheck, Globe } from 'lucide-react';
import websiteSettingsApi from '../../services/websiteSettingsApi';
import toast from 'react-hot-toast';
import { useLogo } from '../../context/LogoContext';

const WebsiteSettings = () => {
  const { updateLogo } = useLogo();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [previewImages, setPreviewImages] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async (silent = false) => {
    try {
      setLoading(true);
      const response = await websiteSettingsApi.getWebsiteSettings();
      const rawData = response?.success && response?.data && typeof response.data === 'object' ? response.data : null;
      // Must have at least one category with a non-empty array of settings
      const validData = rawData && Object.values(rawData).some(arr => Array.isArray(arr) && arr.length > 0) ? rawData : null;

      if (validData) {
        setSettings(validData);
        const previews = {};
        Object.values(validData).flat().forEach(setting => {
          if (setting?.type === 'image' && setting?.value) {
            previews[setting.id] = setting.value;
          }
        });
        setPreviewImages(previews);
      } else {
        if (!silent) {
          console.warn('WebsiteSettings: invalid settings response', response);
        }
        const initResponse = await websiteSettingsApi.initializeSettings();
        if (initResponse?.success) {
          await fetchSettings(silent);
        } else {
          setSettings({});
          setPreviewImages({});
        }
      }
    } catch (error) {
      console.error('WebsiteSettings fetchSettings error:', error);
      if (!silent) {
        toast.error('Failed to fetch website settings');
      }
      setSettings({});
      setPreviewImages({});
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (settingId, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => ({ ...prev, [settingId]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSetting = async (settingId, value, imageFile = null) => {
    try {
      setSaving(prev => ({ ...prev, [settingId]: true }));
      const response = await websiteSettingsApi.updateWebsiteSetting(settingId, value, imageFile);
      console.log('Update response:', response);

      if (response.success) {
        // Handle logo update separately with error catching
        if (String(settingId).includes('logo')) {
          try {
            updateLogo(response.data.value);
          } catch (logoError) {
            console.error('Logo update error:', logoError);
          }
        }

        // Refresh settings
        try {
          await fetchSettings(true);
        } catch (fetchError) {
          console.error('Fetch settings error after update:', fetchError);
          // Don't show error for fetch fail, data already updated
        }

        toast.success('Setting synchronized successfully');
      } else {
        console.error('Update failed:', response.error);
        toast.error(response.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Update failed: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(prev => ({ ...prev, [settingId]: false }));
    }
  };

  const handleTextChange = (settingId, value) => {
    setSettings(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(category => {
        if (Array.isArray(updated[category])) {
          updated[category] = updated[category].map(s => 
            s?.id === settingId ? { ...s, value } : s
          );
        }
      });
      return updated;
    });
  };

  const renderSettingInput = (setting) => {
    const isSaving = saving[setting.id];

    if (setting.type === 'image') {
      return (
        <div className="d-flex flex-column gap-3">
          <div className="d-flex align-items-center gap-4 p-3 bg-white rounded border">
            <div className="position-relative shadow-sm border rounded overflow-hidden" style={{ width: '80px', height: '80px', backgroundColor: '#f8fafc' }}>
              {previewImages[setting.id] ? (
                <img src={previewImages[setting.id]} alt="Preview" className="w-100 h-100" style={{ objectFit: 'contain' }} />
              ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                  <ImageIcon size={20} />
                </div>
              )}
            </div>
            <div className="flex-grow-1">
              <input
                type="file"
                className="form-control form-control-sm border-0 bg-light"
                accept="image/*"
                id={`file-${setting.id}`}
                onChange={(e) => handleImageUpload(setting.id, e.target.files[0])}
                disabled={isSaving}
              />
              <small className="text-muted mt-1 d-block">Recommended: Transparent PNG</small>
            </div>
            <button
              className="btn btn-dark d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: '45px', height: '45px', backgroundColor: '#0f172a' }}
              onClick={() => {
                const file = document.getElementById(`file-${setting.id}`).files[0];
                handleUpdateSetting(setting.id, setting.value, file);
              }}
              disabled={isSaving}
            >
              {isSaving ? <RefreshCw size={18} className="spinner-border spinner-border-sm border-0" /> : <Save size={18} />}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="input-group shadow-sm">
        <input
          type="text"
          className="form-control border-end-0 bg-white"
          value={setting.value || ''}
          onChange={(e) => handleTextChange(setting.id, e.target.value)}
          disabled={isSaving}
          placeholder={`Enter ${setting.description}`}
        />
        <button
          className="btn btn-outline-secondary bg-white border-start-0 text-primary"
          onClick={() => handleUpdateSetting(setting.id, setting.value)}
          disabled={isSaving}
        >
          {isSaving ? <RefreshCw size={16} className="spinner-border spinner-border-sm border-0" /> : <Save size={16} />}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary mb-3" style={{ color: '#0ea5e9' }}></div>
        <span className="text-muted fw-medium">Syncing System Data...</span>
      </div>
    );
  }

  return (
    <div className="website-settings animate__animated animate__fadeIn">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-4 rounded-3 shadow-sm border-bottom border-primary border-3">
        <div>
          <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
            <Settings size={24} className="text-primary" /> Configuration Console
          </h4>
          <p className="text-muted small mb-0">Manage global variables and chemical brand identity</p>
        </div>
        <div className="btn-group shadow-sm">
          <button className="btn btn-outline-primary bg-white px-3" onClick={fetchSettings}>
            <RefreshCw size={16} className="me-2" /> Refresh
          </button>
          <button className="btn btn-primary px-3" style={{ backgroundColor: '#0284c7' }} onClick={fetchSettings}>
            <ShieldCheck size={16} className="me-2" /> System Sync
          </button>
        </div>
      </div>

      <div className="row g-4">
        {Object.entries(settings).map(([category, categorySettings]) => (
          <div key={category} className="col-12">
            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '12px' }}>
              <div className="card-header bg-light py-3 border-0">
                <h6 className="mb-0 fw-bold text-dark text-uppercase d-flex align-items-center gap-2" style={{ letterSpacing: '1px' }}>
                  <Globe size={18} className="text-primary" /> {category} Parameters
                </h6>
              </div>
              <div className="card-body bg-white p-4">
                <div className="row g-4">
                  {Array.isArray(categorySettings)
                    ? categorySettings.map((setting) => (
                        <div key={setting?.id || `${category}-${Math.random()}`} className="col-lg-6">
                          <div className="setting-box p-3 rounded-3 border bg-light bg-opacity-10">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <label className="form-label fw-bold text-dark mb-0">{setting?.description || 'Unnamed setting'}</label>
                                <code className="d-block small text-primary" style={{ fontSize: '0.7rem' }}>
                                  CONFIG_KEY: {setting?.key || 'unknown'}
                                </code>
                              </div>
                            </div>
                            {setting ? renderSettingInput(setting) : null}
                          </div>
                        </div>
                      ))
                    : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-4 p-3 bg-dark rounded-3 text-white-50 small d-flex align-items-center gap-2">
        <ShieldCheck size={14} />
        <span>System running on secure protocol. All changes are logged in the audit trail.</span>
      </div>
    </div>
  );
};

export default WebsiteSettings;