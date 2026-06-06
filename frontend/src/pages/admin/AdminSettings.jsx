import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: 'ShopBD',
    storePhone: '+880 1700-SHOPBD',
    storeEmail: 'support@shopbd.com',
    storeAddress: '123 Gulshan Avenue, Dhaka 1212, Bangladesh',
    currency: 'BDT',
    currencySymbol: '৳',
    deliveryCharge: 80,
    freeDeliveryAbove: 999,
    maintenanceMode: false,
    taxPercent: 5,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      if (data.settings) setSettings(data.settings);
    }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving settings');
    }
    setLoading(false);
  };

  const handleChange = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  return (
    <div className="space-y-5 max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Store Settings</h1>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Store Info */}
        <div className="admin-card space-y-4">
          <h2 className="font-bold text-slate-100">Store Information</h2>
          {[
            { key: 'storeName', label: 'Store Name', type: 'text' },
            { key: 'storeEmail', label: 'Store Email', type: 'email' },
            { key: 'storePhone', label: 'Phone Number', type: 'text' },
            { key: 'storeAddress', label: 'Physical Address', type: 'text' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input type={type} value={settings[key] || ''} onChange={e => handleChange(key, e.target.value)} className="input" />
            </div>
          ))}
        </div>

        {/* Shipping */}
        <div className="admin-card space-y-4">
          <h2 className="font-bold text-slate-100">Delivery Settings</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Standard Delivery Charge (৳)</label>
              <input type="number" value={settings.deliveryCharge} onChange={e => handleChange('deliveryCharge', Number(e.target.value))} className="input" />
            </div>
            <div>
              <label className="label">Free Delivery Above (৳)</label>
              <input type="number" value={settings.freeDeliveryAbove} onChange={e => handleChange('freeDeliveryAbove', Number(e.target.value))} className="input" />
            </div>
            <div>
              <label className="label">Tax (%)</label>
              <input type="number" value={settings.taxPercent} onChange={e => handleChange('taxPercent', Number(e.target.value))} className="input" />
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="admin-card">
          <h2 className="font-bold text-slate-100 mb-3">Advanced</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-600'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <span className="text-slate-300 font-medium">Maintenance Mode</span>
            {settings.maintenanceMode && <span className="badge-red text-xs">Site is down for customers</span>}
          </label>
        </div>

        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
