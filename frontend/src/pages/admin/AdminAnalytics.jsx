import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../api/axios';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];

export default function AdminAnalytics() {
  const [overview, setOverview] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [byLocation, setByLocation] = useState([]);
  const [byChannel, setByChannel] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/analytics/by-category'),
      api.get('/analytics/by-location'),
      api.get('/analytics/by-channel'),
      api.get('/analytics/revenue-trend?period=daily&days=30'),
    ]).then(([ov, cat, loc, ch, tr]) => {
      setOverview(ov.data.data);
      setByCategory(cat.data.data || []);
      setByLocation(loc.data.data || []);
      setByChannel(ch.data.data || []);
      setTrend(tr.data.data.map(d => ({
        date: `${d._id?.month}/${d._id?.day}`,
        revenue: d.revenue,
        orders: d.orders,
      })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm">Sales data insights for ShopBD</p>
      </div>

      {/* KPIs */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `৳${(overview.totalRevenue || 0).toLocaleString()}`, color: 'text-emerald-400' },
            { label: 'Total Orders', value: overview.totalOrders, color: 'text-sky-400' },
            { label: 'Customers', value: overview.totalCustomers, color: 'text-purple-400' },
            { label: 'Pending Orders', value: overview.pendingOrders, color: 'text-yellow-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="admin-card text-center">
              <p className="text-slate-400 text-xs mb-1">{label}</p>
              <p className={`text-2xl font-extrabold ${color}`}>{value?.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Trend */}
      <div className="admin-card">
        <h2 className="font-bold text-slate-100 mb-4">Revenue Trend (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} labelStyle={{ color: '#f1f5f9' }} formatter={v => [`৳${v?.toLocaleString()}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* By Category */}
        <div className="admin-card">
          <h2 className="font-bold text-slate-100 mb-4">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="Category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={100} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} formatter={v => [`৳${v?.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="Revenue_BDT" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Location */}
        <div className="admin-card">
          <h2 className="font-bold text-slate-100 mb-4">Revenue by Location</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byLocation} dataKey="Revenue_BDT" nameKey="Location" cx="50%" cy="50%" outerRadius={80} label={({ Location, percent }) => `${Location} ${(percent * 100).toFixed(0)}%`}>
                {byLocation.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} formatter={v => [`৳${v?.toLocaleString()}`, 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By Channel */}
        <div className="admin-card lg:col-span-2">
          <h2 className="font-bold text-slate-100 mb-4">Revenue by Sales Channel</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byChannel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="Sales_Channel" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} formatter={v => [`৳${v?.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="Revenue_BDT" fill="#10b981" radius={[4, 4, 0, 0]}>
                {byChannel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
