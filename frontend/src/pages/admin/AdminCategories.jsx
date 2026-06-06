import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', image: '', description: '', parent: '' });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    const { data } = await api.get('/categories');
    setCategories(data.categories || []);
  };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing}`, form);
        toast.success('Category updated!');
      } else {
        await api.post('/categories', form);
        toast.success('Category created!');
      }
      setForm({ name: '', slug: '', image: '', description: '', parent: '' });
      setEditing(null);
      setShowForm(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setLoading(false);
  };

  const handleEdit = (cat) => {
    setEditing(cat._id);
    setForm({ name: cat.name, slug: cat.slug, image: cat.image || '', description: cat.description || '', parent: cat.parent?._id || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    toast.success('Deleted');
    fetch();
  };

  const roots = categories.filter(c => !c.parent);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', slug: '', image: '', description: '', parent: '' }); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> {showForm ? 'Close' : 'Add Category'}
        </button>
      </div>

      {showForm && (
        <div className="admin-card animate-slide-down">
          <h2 className="font-bold text-slate-100 mb-4">{editing ? 'Edit Category' : 'New Category'}</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" required />
            </div>
            <div>
              <label className="label">Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input" placeholder="auto" />
            </div>
            <div>
              <label className="label">Image URL</label>
              <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="input" placeholder="https://..." />
            </div>
            <div>
              <label className="label">Parent Category</label>
              <select value={form.parent} onChange={e => setForm(f => ({ ...f, parent: e.target.value }))} className="select">
                <option value="">None (Top-level)</option>
                {roots.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-slate-700">
            <tr>
              <th className="admin-th">Category</th>
              <th className="admin-th hidden sm:table-cell">Slug</th>
              <th className="admin-th hidden md:table-cell">Parent</th>
              <th className="admin-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="admin-table-row">
                <td className="admin-td">
                  <div className="flex items-center gap-3">
                    {cat.image && <img src={cat.image} alt="" className="w-9 h-9 rounded-lg object-cover" />}
                    <span className="font-medium text-slate-200">{cat.name}</span>
                  </div>
                </td>
                <td className="admin-td hidden sm:table-cell text-slate-400 text-xs font-mono">{cat.slug}</td>
                <td className="admin-td hidden md:table-cell text-slate-400 text-xs">{cat.parent?.name || '—'}</td>
                <td className="admin-td">
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(cat)} className="btn-icon text-yellow-400 hover:text-yellow-300"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(cat._id)} className="btn-icon text-red-400 hover:text-red-300"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
