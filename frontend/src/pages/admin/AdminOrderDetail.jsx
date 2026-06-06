import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, CreditCard } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const statusColor = { Pending: 'badge-yellow', Processing: 'badge-blue', Shipped: 'badge-purple', Delivered: 'badge-green', Cancelled: 'badge-red' };

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => {
      setOrder(data.order);
      setTracking(data.order?.trackingNumber || '');
      setLoading(false);
    }).catch(() => navigate('/admin/orders'));
  }, [id]);

  const updateStatus = async (field, value) => {
    await api.put(`/orders/${id}/status`, { [field]: value, trackingNumber: tracking });
    setOrder(o => ({ ...o, [field]: value }));
    toast.success('Updated!');
  };

  if (loading || !order) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/orders')} className="btn-secondary btn-sm">← Back</button>
        <h1 className="text-xl font-bold text-white">Order #{order._id.slice(-8).toUpperCase()}</h1>
        <span className={`badge ml-auto ${statusColor[order.orderStatus] || 'badge-gray'}`}>{order.orderStatus}</span>
      </div>

      {/* Status Update */}
      <div className="admin-card space-y-4">
        <h2 className="font-bold text-slate-100">Update Status</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Order Status</label>
            <select value={order.orderStatus} onChange={e => updateStatus('orderStatus', e.target.value)} className="select">
              {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Payment Status</label>
            <select value={order.paymentStatus} onChange={e => updateStatus('paymentStatus', e.target.value)} className="select">
              {['Pending', 'Paid', 'Failed', 'Refunded'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tracking Number</label>
            <div className="flex gap-2">
              <input value={tracking} onChange={e => setTracking(e.target.value)} className="input flex-1 text-sm" placeholder="e.g. TRK123456" />
              <button onClick={() => updateStatus('trackingNumber', tracking)} className="btn-primary btn-sm">Save</button>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="admin-card">
        <h2 className="font-bold text-slate-100 mb-4 flex items-center gap-2"><Package size={18} className="text-sky-400" /> Items</h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img src={item.image || ''} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-medium text-slate-200 text-sm">{item.name}</p>
                <p className="text-xs text-slate-400">Qty: {item.qty} {item.variant && `• ${item.variant}`}</p>
              </div>
              <span className="font-bold text-slate-200">৳{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="divider mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>৳{order.subtotal?.toLocaleString()}</span></div>
          <div className="flex justify-between text-slate-400"><span>Shipping</span><span>৳{order.shippingCost}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-৳{order.discount}</span></div>}
          <div className="flex justify-between font-bold text-base text-slate-100"><span>Total</span><span>৳{order.totalPrice?.toLocaleString()}</span></div>
        </div>
      </div>

      {/* Customer & Shipping */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="admin-card">
          <h2 className="font-bold text-slate-100 mb-3 flex items-center gap-2"><MapPin size={16} className="text-sky-400" /> Shipping Address</h2>
          <p className="text-sm text-slate-300">{order.shippingAddress?.fullName}</p>
          <p className="text-sm text-slate-400">{order.shippingAddress?.phone}</p>
          <p className="text-sm text-slate-400">{order.shippingAddress?.street}</p>
          <p className="text-sm text-slate-400">{order.shippingAddress?.city}, {order.shippingAddress?.district}</p>
        </div>
        <div className="admin-card">
          <h2 className="font-bold text-slate-100 mb-3 flex items-center gap-2"><CreditCard size={16} className="text-sky-400" /> Payment</h2>
          <p className="text-sm text-slate-300">Method: {order.paymentMethod}</p>
          <p className="text-sm text-slate-400">Status: <span className={`badge-${order.paymentStatus === 'Paid' ? 'green' : 'yellow'} text-xs ml-1`}>{order.paymentStatus}</span></p>
          <p className="text-sm text-slate-400">Channel: {order.salesChannel}</p>
          <p className="text-sm text-slate-400">Location: {order.location}</p>
          <p className="text-sm text-slate-400">Customer: {order.user?.name} ({order.user?.email})</p>
        </div>
      </div>
    </div>
  );
}
