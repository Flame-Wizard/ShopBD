import React, { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AccountPassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.put('/users/me/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated successfully');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
    setLoading(false);
  };

  return (
    <div className="container-page py-8 max-w-md">
      <h1 className="text-2xl font-bold text-white mb-6">Change Password</h1>
      <div className="card p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {['currentPassword', 'newPassword', 'confirm'].map((field) => (
            <div key={field}>
              <label className="label">{field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}</label>
              <input
                type="password"
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                className="input"
                required
              />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
