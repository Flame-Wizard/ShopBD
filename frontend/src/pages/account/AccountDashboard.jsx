import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, Heart, Key, User, Clock } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';

export default function AccountDashboard() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data.orders?.slice(0, 3) || []));
  }, []);

  const links = [
    { to: '/account/orders', icon: Package, label: 'My Orders', desc: 'Track and manage your orders' },
    { to: '/account/addresses', icon: MapPin, label: 'Saved Addresses', desc: 'Manage delivery addresses' },
    { to: '/account/wishlist', icon: Heart, label: 'Wishlist', desc: 'Your saved items' },
    { to: '/account/password', icon: Key, label: 'Change Password', desc: 'Update your password' },
  ];

  const statusColor = { Pending: 'badge-yellow', Processing: 'badge-blue', Shipped: 'badge-purple', Delivered: 'badge-green', Cancelled: 'badge-red' };

  return (
    <div className="container-page py-8 max-w-4xl animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">My Account</h1>

      {/* Profile */}
      <div className="card p-5 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">{user?.name}</h2>
          <p className="text-slate-400">{user?.email}</p>
          <span className={`mt-1 inline-block badge ${user?.role === 'customer' ? 'badge-blue' : 'badge-purple'}`}>{user?.role}</span>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {links.map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} className="card card-hover p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
              <Icon size={20} className="text-sky-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-100">Recent Orders</h2>
          <Link to="/account/orders" className="text-sky-400 text-sm hover:text-sky-300">View All</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-slate-400 text-center py-6">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order._id} to={`/account/orders`} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors">
                <Package size={18} className="text-sky-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-200">৳{order.totalPrice.toLocaleString()}</p>
                  <span className={`badge text-xs ${statusColor[order.orderStatus] || 'badge-gray'}`}>{order.orderStatus}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
