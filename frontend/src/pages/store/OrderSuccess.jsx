import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => {
      setOrder(data.order);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="container-page py-20 text-center">
      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  const estDelivery = order ? new Date(new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000) : null;

  return (
    <div className="container-page py-12 max-w-2xl animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Order Placed! 🎉</h1>
        <p className="text-slate-400 mt-2">Thank you for shopping with ShopBD</p>
        {order && (
          <p className="text-sky-400 font-mono font-bold mt-3 text-lg">
            #{order._id.slice(-8).toUpperCase()}
          </p>
        )}
      </div>

      {order && (
        <div className="space-y-4">
          {/* Order Info */}
          <div className="card p-5">
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-slate-400 text-xs mb-1">Payment Method</p>
                <p className="font-semibold text-slate-200">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Order Total</p>
                <p className="font-bold text-emerald-400 text-lg">৳{order.totalPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Est. Delivery</p>
                <p className="font-semibold text-slate-200">{estDelivery?.toLocaleDateString('en-BD', { month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card p-5">
            <h2 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Package size={18} className="text-sky-400" /> Your Items
            </h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.image || ''} alt={item.name} className="w-12 h-12 object-cover rounded-xl" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-400">Qty: {item.qty} {item.variant && `• ${item.variant}`}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-300">৳{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="card p-5">
            <h2 className="font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Truck size={18} className="text-sky-400" /> Delivery Address
            </h2>
            <p className="text-slate-300 text-sm">
              {order.shippingAddress?.fullName} • {order.shippingAddress?.phone}<br />
              {order.shippingAddress?.street}, {order.shippingAddress?.city}<br />
              {order.shippingAddress?.district} {order.shippingAddress?.postalCode}
            </p>
          </div>

          {/* Steps */}
          <div className="card p-5">
            <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-3">
              {['Order Placed ✓', 'Processing', 'Shipped', 'Delivered'].map((step, i) => (
                <React.Fragment key={step}>
                  <div className={`flex flex-col items-center gap-1 ${i === 0 ? 'text-emerald-400 font-medium' : ''}`}>
                    <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    {step}
                  </div>
                  {i < 3 && <div className="flex-1 h-px bg-slate-700 min-w-[20px]" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/account/orders" className="btn-secondary flex items-center gap-2 flex-1 justify-center">
              <Package size={16} /> Track Order
            </Link>
            <Link to="/shop" className="btn-primary flex items-center gap-2 flex-1 justify-center">
              <Home size={16} /> Continue Shopping <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
