import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { IoSettingsOutline } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSettings();
      setSettings(res.data.data.settings || []);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (index, value) => {
    const updated = [...settings];
    updated[index].value = value;
    setSettings(updated);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.updateSettings({ settings });
      toast.success('System configuration parameters saved successfully!');
      fetchSettings();
    } catch (err) {
      toast.error('Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-settings">
      <div className="settings-header-bar glass">
        <h3>System Configuration Editor</h3>
        <p>Edit global operational constraints, tax structures, cancellation penalties, and check-in/out timers.</p>
      </div>

      {loading ? (
        <div className="settings-loading">
          <Spinner size="lg" />
          <p>Connecting to system settings registry...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="settings-form glass animate-fade-in-up">
          <h3 className="section-heading font-heading">
            <IoSettingsOutline /> Global Resort Settings
          </h3>
          
          <div className="settings-grid-list">
            {settings.map((s, idx) => (
              <div key={s._id} className="setting-input-row">
                <div className="setting-meta-info">
                  <strong className="setting-key-name">{s.key.replace(/_/g, ' ')}</strong>
                  <p className="setting-description">{s.description || 'Global configuration parameter'}</p>
                </div>
                <div className="setting-value-field">
                  {typeof s.value === 'number' ? (
                    <Input
                      type="number"
                      value={s.value}
                      onChange={(e) => handleSettingChange(idx, parseFloat(e.target.value) || 0)}
                      required
                    />
                  ) : (
                    <Input
                      value={s.value}
                      onChange={(e) => handleSettingChange(idx, e.target.value)}
                      required
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="settings-actions">
            <Button type="submit" variant="accent" loading={saving} className="settings-save-btn">
              Apply Changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
