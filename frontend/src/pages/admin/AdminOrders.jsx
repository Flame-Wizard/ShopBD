import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const statusColor = { Pending: 'badge-yellow', Processing: 'badge-blue', Shipped: 'badge-purple', Delivered: 'badge-green', Cancelled: 'badge-red' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');

  const fetch = async (p = page, s = status) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders?page=${p}&limit=20${s ? `&status=${s}` : ''}`);
      setOrders(data.orders || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [page, status]);

  const updateStatus = async (orderId, orderStatus) => {
    await api.put(`/orders/${orderId}/status`, { orderStatus });
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus } : o));
    toast.success('Status updated');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-slate-400 text-sm">{total} total orders</p>
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="select w-auto text-sm py-2">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-700">
              <tr>
                <th className="admin-th">Order ID</th>
                <th className="admin-th">Customer</th>
                <th className="admin-th hidden sm:table-cell">Date</th>
                <th className="admin-th hidden md:table-cell">Payment</th>
                <th className="admin-th">Total</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Update</th>
                <th className="admin-th">View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="admin-td text-center py-12"><div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : orders.map((order) => (
                <tr key={order._id} className="admin-table-row">
                  <td className="admin-td font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="admin-td">
                    <p className="text-sm text-slate-200">{order.user?.name || 'Guest'}</p>
                    <p className="text-xs text-slate-400">{order.shippingAddress?.district}</p>
                  </td>
                  <td className="admin-td hidden sm:table-cell text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="admin-td hidden md:table-cell text-xs">{order.paymentMethod}</td>
                  <td className="admin-td font-bold text-slate-200">৳{order.totalPrice?.toLocaleString()}</td>
                  <td className="admin-td"><span className={`badge text-xs ${statusColor[order.orderStatus] || 'badge-gray'}`}>{order.orderStatus}</span></td>
                  <td className="admin-td">
                    <select value={order.orderStatus} onChange={e => updateStatus(order._id, e.target.value)} className="bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg px-2 py-1">
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="admin-td">
                    <Link to={`/admin/orders/${order._id}`} className="text-sky-400 hover:text-sky-300 text-xs font-medium">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-slate-700">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-icon disabled:opacity-40"><ChevronLeft size={16} /></button>
            <span className="text-sm text-slate-400">Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-icon disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
