import React, { useEffect, useState } from 'react';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../api/axios';

const statusColor = { Pending: 'badge-yellow', Processing: 'badge-blue', Shipped: 'badge-purple', Delivered: 'badge-green', Cancelled: 'badge-red' };
const paymentColor = { Paid: 'badge-green', Pending: 'badge-yellow', Failed: 'badge-red' };

export default function AccountOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => {
      setOrders(data.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-8 max-w-4xl animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">My Orders</h1>

      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">📦</p>
          <h2 className="text-xl font-bold text-slate-300">No orders yet</h2>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="card overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-700/50 transition-colors"
              >
                <Package size={20} className="text-sky-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })} • {order.items.length} items • {order.paymentMethod}</p>
                </div>
                <div className="text-right flex-shrink-0 mr-2">
                  <p className="font-bold text-slate-100">৳{order.totalPrice.toLocaleString()}</p>
                  <div className="flex gap-1 justify-end mt-1">
                    <span className={`badge text-xs ${statusColor[order.orderStatus] || 'badge-gray'}`}>{order.orderStatus}</span>
                    <span className={`badge text-xs ${paymentColor[order.paymentStatus] || 'badge-gray'}`}>{order.paymentStatus}</span>
                  </div>
                </div>
                {expanded === order._id ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
              </button>

              {expanded === order._id && (
                <div className="border-t border-slate-700 p-4 space-y-3 animate-slide-down">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <img src={item.image || ''} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200">{item.name}</p>
                        <p className="text-xs text-slate-400">Qty: {item.qty} {item.variant && `• ${item.variant}`}</p>
                      </div>
                      <span className="text-sm text-slate-300">৳{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                  {order.trackingNumber && (
                    <div className="bg-sky-900/20 rounded-xl p-3 text-sm text-sky-300">
                      🚚 Tracking: <strong>{order.trackingNumber}</strong>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-400">
                    <div>
                      <p className="font-medium text-slate-300 mb-1">Delivery Address</p>
                      <p>{order.shippingAddress?.fullName} • {order.shippingAddress?.phone}</p>
                      <p>{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
                      <p>{order.shippingAddress?.district} {order.shippingAddress?.postalCode}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-300 mb-1">Order Summary</p>
                      <p>Subtotal: ৳{order.subtotal?.toLocaleString()}</p>
                      <p>Shipping: ৳{order.shippingCost}</p>
                      {order.discount > 0 && <p>Discount: -৳{order.discount}</p>}
                      <p className="font-bold text-slate-100 mt-1">Total: ৳{order.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
