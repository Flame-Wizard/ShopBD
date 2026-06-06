import React, { useEffect, useState } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetch = async (p = page, kw = keyword) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users?page=${p}&keyword=${kw}&limit=20`);
      setUsers(data.users || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetch(1, keyword); };

  const handleToggleBan = async (id) => {
    const { data } = await api.put(`/users/${id}/toggle-ban`);
    setUsers(u => u.map(x => x._id === id ? { ...x, isActive: data.isActive } : x));
    toast.success(data.message);
  };

  const handleRoleChange = async (id, role) => {
    await api.put(`/users/${id}`, { role });
    setUsers(u => u.map(x => x._id === id ? { ...x, role } : x));
    toast.success('Role updated');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-slate-400 text-sm">{total} total users</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Search by name/email..." className="input text-sm" />
          <button type="submit" className="btn-primary btn-sm flex items-center gap-1"><Search size={16} /></button>
        </form>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-slate-700">
            <tr>
              <th className="admin-th">User</th>
              <th className="admin-th hidden sm:table-cell">Joined</th>
              <th className="admin-th">Role</th>
              <th className="admin-th">Status</th>
              <th className="admin-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="admin-td py-12 text-center"><div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : users.map((user) => (
              <tr key={user._id} className="admin-table-row">
                <td className="admin-td">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="admin-td hidden sm:table-cell text-xs text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="admin-td">
                  <select value={user.role} onChange={e => handleRoleChange(user._id, e.target.value)} className="bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg px-2 py-1">
                    <option value="customer">customer</option>
                    <option value="admin">admin</option>
                    <option value="superadmin">superadmin</option>
                  </select>
                </td>
                <td className="admin-td">
                  <span className={`badge text-xs ${user.isActive ? 'badge-green' : 'badge-red'}`}>{user.isActive ? 'Active' : 'Banned'}</span>
                </td>
                <td className="admin-td">
                  <button onClick={() => handleToggleBan(user._id)} className={`btn-icon ${user.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}>
                    {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
