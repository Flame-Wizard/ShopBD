import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, CreditCard, Truck, Tag, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const BD_DISTRICTS = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Comilla', 'Mymensingh', 'Gazipur', 'Narayanganj', 'Barishal', 'Tangail', 'Jessore', 'Dinajpur', 'Bogra', 'Rangpur'];

const schema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().min(11, 'Valid phone number required').max(14),
  street: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'District is required'),
  postalCode: z.string().min(4, 'Postal code required').max(6),
});

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [shippingMethod, setShippingMethod] = useState('Standard');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [loading, setLoading] = useState(false);
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.product?.salePrice || item.product?.price || 0) * item.qty;
  }, 0);
  const shippingCost = shippingMethod === 'Express' ? 150 : shippingMethod === 'Standard' && subtotal < 999 ? 80 : 0;
  const total = subtotal + shippingCost - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, orderTotal: subtotal });
      setDiscount(data.discount);
      setCouponApplied(couponCode.toUpperCase());
      toast.success(`Coupon applied! Saved ৳${data.discount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product: item.product._id,
        qty: item.qty,
        variant: item.variant || '',
      }));

      const { data } = await api.post('/orders', {
        items: orderItems,
        shippingAddress: formData,
        paymentMethod,
        shippingMethod,
        coupon: couponApplied,
        discount,
        location: formData.district,
        salesChannel: 'Online Store',
      });

      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setLoading(false);
  };

  return (
    <div className="container-page py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Shipping Address */}
            <div className="card p-5">
              <h2 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-sky-400" /> Delivery Address
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input {...register('fullName')} defaultValue={user?.name} className="input" placeholder="Your full name" />
                  {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input {...register('phone')} className="input" placeholder="+880 1XXX-XXXXXX" />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Street Address</label>
                  <input {...register('street')} className="input" placeholder="House/Flat number, Road name" />
                  {errors.street && <p className="text-red-400 text-xs mt-1">{errors.street.message}</p>}
                </div>
                <div>
                  <label className="label">City/Thana</label>
                  <input {...register('city')} className="input" placeholder="e.g., Gulshan" />
                  {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="label">District</label>
                  <select {...register('district')} className="select">
                    {BD_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.district && <p className="text-red-400 text-xs mt-1">{errors.district.message}</p>}
                </div>
                <div>
                  <label className="label">Postal Code</label>
                  <input {...register('postalCode')} className="input" placeholder="e.g., 1212" />
                  {errors.postalCode && <p className="text-red-400 text-xs mt-1">{errors.postalCode.message}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="card p-5">
              <h2 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Truck size={18} className="text-sky-400" /> Shipping Method
              </h2>
              <div className="space-y-3">
                {[
                  { id: 'Free', label: 'Free Delivery', desc: '5-7 business days', cost: 'FREE', condition: subtotal >= 999 },
                  { id: 'Standard', label: 'Standard Delivery', desc: '3-5 business days', cost: subtotal >= 999 ? 'FREE' : '৳80' },
                  { id: 'Express', label: 'Express Delivery', desc: '1-2 business days', cost: '৳150' },
                ].map(({ id, label, desc, cost, condition }) => (
                  <label key={id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${shippingMethod === id ? 'border-sky-500 bg-sky-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
                    <input type="radio" name="shipping" value={id} checked={shippingMethod === id} onChange={() => setShippingMethod(id)} className="text-sky-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">{cost}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="card p-5">
              <h2 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-sky-400" /> Payment Method
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {['Cash on Delivery', 'bKash', 'Nagad', 'Bank Transfer'].map((method) => (
                  <label key={method} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === method ? 'border-sky-500 bg-sky-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
                    <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                    <span className="text-sm font-medium text-slate-200">{method}</span>
                  </label>
                ))}
              </div>
              {paymentMethod === 'bKash' && (
                <div className="mt-3 p-3 bg-pink-900/20 rounded-xl border border-pink-700/30">
                  <p className="text-sm text-pink-300">Send payment to: <strong>01700-000000</strong> (bKash Merchant)</p>
                  <p className="text-xs text-slate-400 mt-1">Use your order ID as reference</p>
                </div>
              )}
              {paymentMethod === 'Nagad' && (
                <div className="mt-3 p-3 bg-orange-900/20 rounded-xl border border-orange-700/30">
                  <p className="text-sm text-orange-300">Send payment to: <strong>01700-000000</strong> (Nagad Merchant)</p>
                </div>
              )}
              {paymentMethod === 'Bank Transfer' && (
                <div className="mt-3 p-3 bg-blue-900/20 rounded-xl border border-blue-700/30 text-sm text-blue-300">
                  <p><strong>ShopBD Ltd.</strong></p>
                  <p>Account: 1234567890 | BRAC Bank</p>
                  <p>Routing: 060 — Gulshan Branch</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-5 sticky top-24">
              <h2 className="font-bold text-slate-100 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map((item) => {
                  const price = item.product?.salePrice || item.product?.price || 0;
                  return (
                    <div key={item._id} className="flex gap-3 items-center">
                      <img src={item.product?.images?.[0] || ''} alt="" className="w-12 h-12 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 truncate">{item.product?.name}</p>
                        <p className="text-xs text-slate-400">x{item.qty}</p>
                      </div>
                      <span className="text-sm font-medium text-slate-200">৳{(price * item.qty).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="input-sm flex-1"
                />
                <button type="button" onClick={handleApplyCoupon} className="btn-secondary btn-sm whitespace-nowrap">
                  <Tag size={14} />
                </button>
              </div>
              {couponApplied && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm mb-3">
                  <CheckCircle size={14} /> {couponApplied} applied! -৳{discount}
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span><span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? 'text-emerald-400' : ''}>
                    {shippingCost === 0 ? 'FREE' : `৳${shippingCost}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span><span>-৳{discount}</span>
                  </div>
                )}
                <div className="divider pt-1" />
                <div className="flex justify-between font-bold text-base text-slate-100">
                  <span>Total</span><span>৳{total.toLocaleString()}</span>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-success w-full mt-4 flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {loading ? 'Placing Order...' : '✓ Place Order'}
              </button>

              <p className="text-xs text-slate-500 text-center mt-2">By placing an order, you agree to our Terms & Conditions</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
