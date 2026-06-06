import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: 10, expiresAt: format(addDays(new Date(), 30), 'yyyy-MM-dd'), usageLimit: 100, minOrderValue: 0 });
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    const { data } = await api.get('/coupons');
    setCoupons(data.coupons || []);
  };
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/coupons', form);
      toast.success('Coupon created!');
      setShowForm(false);
      setForm({ code: '', type: 'percentage', value: 10, expiresAt: format(addDays(new Date(), 30), 'yyyy-MM-dd'), usageLimit: 100, minOrderValue: 0 });
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await api.delete(`/coupons/${id}`);
    toast.success('Coupon deleted');
    fetch();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Coupons & Discounts</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> {showForm ? 'Close' : 'New Coupon'}
        </button>
      </div>

      {showForm && (
        <div className="admin-card animate-slide-down">
          <h2 className="font-bold text-slate-100 mb-4">Create Coupon</h2>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Code</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="input" placeholder="SAVE10" required />
            </div>
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="select">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (৳)</option>
              </select>
            </div>
            <div>
              <label className="label">Value ({form.type === 'percentage' ? '%' : '৳'})</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} className="input" min="1" required />
            </div>
            <div>
              <label className="label">Expires At</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="input" required />
            </div>
            <div>
              <label className="label">Usage Limit</label>
              <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: Number(e.target.value) }))} className="input" />
            </div>
            <div>
              <label className="label">Min Order (৳)</label>
              <input type="number" value={form.minOrderValue} onChange={e => setForm(f => ({ ...f, minOrderValue: Number(e.target.value) }))} className="input" />
            </div>
            <div className="flex gap-3 items-end">
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-slate-700">
            <tr>
              <th className="admin-th">Code</th>
              <th className="admin-th">Type</th>
              <th className="admin-th">Value</th>
              <th className="admin-th hidden sm:table-cell">Expires</th>
              <th className="admin-th">Usage</th>
              <th className="admin-th">Status</th>
              <th className="admin-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} className="admin-table-row">
                <td className="admin-td font-mono font-bold text-slate-200">{c.code}</td>
                <td className="admin-td text-xs capitalize">{c.type}</td>
                <td className="admin-td font-bold text-emerald-400">{c.type === 'percentage' ? `${c.value}%` : `৳${c.value}`}</td>
                <td className="admin-td hidden sm:table-cell text-xs text-slate-400">{new Date(c.expiresAt).toLocaleDateString()}</td>
                <td className="admin-td text-xs">{c.usedCount} / {c.usageLimit}</td>
                <td className="admin-td"><span className={`badge text-xs ${c.isActive && new Date(c.expiresAt) > new Date() ? 'badge-green' : 'badge-red'}`}>{c.isActive && new Date(c.expiresAt) > new Date() ? 'Active' : 'Expired'}</span></td>
                <td className="admin-td">
                  <button onClick={() => handleDelete(c._id)} className="btn-icon text-red-400 hover:text-red-300"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={7} className="admin-td text-center py-8 text-slate-400">No coupons yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
