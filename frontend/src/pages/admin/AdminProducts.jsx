import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);

  const fetch = async (p = page, kw = keyword) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/admin/all?page=${p}&keyword=${kw}&limit=15`);
      setProducts(data.products || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetch(1, keyword); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product deleted');
    fetch();
  };

  const handleTogglePublish = async (id, current) => {
    await api.put(`/products/${id}`, { isPublished: !current });
    setProducts(p => p.map(x => x._id === id ? { ...x, isPublished: !current } : x));
    toast.success(!current ? 'Published' : 'Unpublished');
  };

  const handleBulk = async (action) => {
    if (selected.length === 0) { toast.error('Select products first'); return; }
    await api.post('/products/bulk', { action, ids: selected });
    toast.success(`${action} applied to ${selected.length} products`);
    setSelected([]);
    fetch();
  };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === products.length ? [] : products.map(p => p._id));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-slate-400 text-sm">{total} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* Search + Bulk */}
      <div className="flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Search products..." className="input flex-1" />
          <button type="submit" className="btn-primary btn-sm flex items-center gap-2"><Search size={16} /></button>
        </form>
        {selected.length > 0 && (
          <div className="flex gap-2">
            <button onClick={() => handleBulk('publish')} className="btn-success btn-sm">Publish ({selected.length})</button>
            <button onClick={() => handleBulk('unpublish')} className="btn-secondary btn-sm">Unpublish</button>
            <button onClick={() => handleBulk('delete')} className="btn-danger btn-sm">Delete</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-700">
              <tr>
                <th className="admin-th w-10"><input type="checkbox" checked={selected.length === products.length && products.length > 0} onChange={toggleAll} className="rounded" /></th>
                <th className="admin-th">Product</th>
                <th className="admin-th hidden sm:table-cell">Category</th>
                <th className="admin-th">Price</th>
                <th className="admin-th hidden md:table-cell">Stock</th>
                <th className="admin-th hidden md:table-cell">Sold</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="admin-td text-center py-12">
                  <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : products.map((p) => (
                <tr key={p._id} className="admin-table-row">
                  <td className="admin-td"><input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} /></td>
                  <td className="admin-td">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-200 text-sm truncate max-w-[160px]">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.sku || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="admin-td hidden sm:table-cell text-xs">{p.category?.name || '—'}</td>
                  <td className="admin-td">
                    <p className="font-bold text-emerald-400">৳{(p.salePrice || p.price).toLocaleString()}</p>
                    {p.salePrice && <p className="text-xs text-slate-500 line-through">৳{p.price.toLocaleString()}</p>}
                  </td>
                  <td className="admin-td hidden md:table-cell">
                    <span className={p.stock === 0 ? 'text-red-400 font-bold' : p.stock < 10 ? 'text-yellow-400' : 'text-slate-300'}>{p.stock}</span>
                  </td>
                  <td className="admin-td hidden md:table-cell text-slate-300">{p.unitsSold}</td>
                  <td className="admin-td">
                    <span className={`badge text-xs ${p.isPublished ? 'badge-green' : 'badge-gray'}`}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="admin-td">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleTogglePublish(p._id, p.isPublished)} className="btn-icon text-slate-400 hover:text-sky-400">
                        {p.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <Link to={`/admin/products/${p._id}/edit`} className="btn-icon text-slate-400 hover:text-yellow-400">
                        <Edit2 size={15} />
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="btn-icon text-slate-400 hover:text-red-400">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-700">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-icon disabled:opacity-40"><ChevronLeft size={16} /></button>
            <span className="text-sm text-slate-400">Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-icon disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
