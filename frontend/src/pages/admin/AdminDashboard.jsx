import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';

const statusColor = { Pending: 'badge-yellow', Processing: 'badge-blue', Shipped: 'badge-purple', Delivered: 'badge-green', Cancelled: 'badge-red' };

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/analytics/revenue-trend?period=daily&days=30'),
      api.get('/orders?limit=8'),
      api.get('/analytics/top-products?limit=5'),
    ]).then(([ov, tr, or_, tp]) => {
      setOverview(ov.data.data);
      setTrend(tr.data.data.map((d) => ({
        date: `${d._id.month}/${d._id.day}`,
        revenue: d.revenue,
        orders: d.orders,
      })));
      setOrders(or_.data.orders || []);
      setTopProducts(tp.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const kpis = overview ? [
    { label: 'Total Revenue', value: `৳${(overview.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { label: 'Total Orders', value: overview.totalOrders, icon: ShoppingCart, color: 'text-sky-400', bg: 'bg-sky-500/20' },
    { label: 'Total Customers', value: overview.totalCustomers, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { label: 'Products', value: overview.totalProducts, icon: Package, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  ] : [];

  const updateStatus = async (orderId, status) => {
    await api.put(`/orders/${orderId}/status`, { orderStatus: status });
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm">Welcome back, Admin! Here's what's happening.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />) :
          kpis.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="admin-card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-slate-400 text-xs">{label}</p>
                <p className="text-2xl font-extrabold text-white">{value?.toLocaleString()}</p>
              </div>
            </div>
          ))
        }
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 admin-card">
          <h2 className="font-bold text-slate-100 mb-4">Revenue Trend (Last 30 Days)</h2>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                  formatter={(v) => [`৳${v?.toLocaleString()}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-400">
              {loading ? <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /> : 'No data yet'}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="admin-card">
          <h2 className="font-bold text-slate-100 mb-4">Top Products</h2>
          <div className="space-y-3">
            {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />) :
              topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-slate-500 text-sm w-4">{i + 1}</span>
                  <img src={p.Image} alt={p.Product_Name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{p.Product_Name}</p>
                    <p className="text-xs text-slate-400">{p.Units_Sold} sold</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">৳{p.Revenue_BDT?.toLocaleString()}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-100">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sky-400 text-sm hover:text-sky-300">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="admin-th">Order ID</th>
                <th className="admin-th">Customer</th>
                <th className="admin-th hidden md:table-cell">Items</th>
                <th className="admin-th">Total</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="admin-td text-center py-8 text-slate-400">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="admin-td text-center py-8 text-slate-400">No orders yet</td></tr>
              ) : orders.map((order) => (
                <tr key={order._id} className="admin-table-row">
                  <td className="admin-td font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="admin-td">{order.user?.name || 'Guest'}</td>
                  <td className="admin-td hidden md:table-cell">{order.items?.length}</td>
                  <td className="admin-td font-bold text-slate-200">৳{order.totalPrice?.toLocaleString()}</td>
                  <td className="admin-td">
                    <span className={`badge text-xs ${statusColor[order.orderStatus] || 'badge-gray'}`}>{order.orderStatus}</span>
                  </td>
                  <td className="admin-td">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className="bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg px-2 py-1"
                    >
                      {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
