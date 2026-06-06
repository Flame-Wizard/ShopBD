import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.salePrice || item.product?.price || 0;
    return sum + price * item.qty;
  }, 0);
  const shipping = subtotal >= 999 ? 0 : 80;
  const total = subtotal + shipping;

  if (items.length === 0) return (
    <div className="container-page py-20 text-center">
      <p className="text-6xl mb-4">🛒</p>
      <h2 className="text-2xl font-bold text-slate-200">Your cart is empty</h2>
      <p className="text-slate-400 mt-2">Add some products to get started</p>
      <Link to="/shop" className="btn-primary inline-flex items-center gap-2 mt-6">
        <ShoppingBag size={18} /> Continue Shopping
      </Link>
    </div>
  );

  return (
    <div className="container-page py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Shopping Cart ({items.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            const price = product.salePrice || product.price;
            return (
              <div key={item._id} className="card p-4 flex gap-4 items-start">
                <Link to={`/shop/${product.slug}`}>
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&q=80'}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0 hover:opacity-80 transition-opacity"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/shop/${product.slug}`} className="font-semibold text-slate-200 hover:text-sky-400 transition-colors line-clamp-2">
                    {product.name}
                  </Link>
                  {item.variant && <p className="text-xs text-slate-400 mt-0.5">{item.variant}</p>}
                  <p className="text-emerald-400 font-bold mt-1">৳{price.toLocaleString('en-BD')}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => item._id?.startsWith('local') ? null : updateItem(item._id, Math.max(1, item.qty - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-sm font-bold transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center font-bold">{item.qty}</span>
                    <button
                      onClick={() => item._id?.startsWith('local') ? null : updateItem(item._id, item.qty + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-sm font-bold transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                    <span className="text-slate-400 text-sm ml-2">= ৳{(price * item.qty).toLocaleString('en-BD')}</span>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="ml-auto text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-5 sticky top-24">
            <h2 className="font-bold text-slate-100 mb-4 text-lg">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-emerald-400' : ''}>
                  {shipping === 0 ? 'FREE' : `৳${shipping}`}
                </span>
              </div>
              {shipping === 0 && <p className="text-xs text-emerald-400">🎉 You qualify for free delivery!</p>}
              {shipping > 0 && (
                <p className="text-xs text-slate-500">Add ৳{(999 - subtotal).toLocaleString('en-BD')} more for free delivery</p>
              )}
              <div className="divider pt-2" />
              <div className="flex justify-between font-bold text-base text-slate-100">
                <span>Total</span>
                <span>৳{total.toLocaleString('en-BD')}</span>
              </div>
            </div>
            <button
              onClick={() => user ? navigate('/checkout') : navigate('/auth/login?redirect=/checkout')}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            <Link to="/shop" className="btn-secondary w-full mt-2 flex items-center justify-center gap-2">
              <ShoppingBag size={16} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
