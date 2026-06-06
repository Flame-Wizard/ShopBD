import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ChevronLeft, Package, Check, Truck, Shield } from 'lucide-react';
import api from '../../api/axios';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import StarRating from '../../components/ui/StarRating';
import ProductCard, { ProductCardSkeleton } from '../../components/ui/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const addLocalItem = useCartStore((s) => s.addLocalItem);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`).then(({ data: d }) => {
      setData(d);
      setLoading(false);
      setSelectedImg(0);
      // Fetch related
      if (d.product?.category?._id) {
        api.get(`/products?category=${d.product.category._id}&limit=4`).then(({ data: rd }) => {
          setRelated(rd.products.filter(p => p.slug !== slug));
        });
      }
    }).catch(() => { setLoading(false); navigate('/shop'); });
  }, [slug]);

  const handleAddToCart = () => {
    if (!data) return;
    const variant = Object.values(selectedVariants).join(' / ');
    if (user) addItem(data.product._id, qty, variant);
    else addLocalItem(data.product, qty, variant);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleSubmitReview = async () => {
    if (!user) { toast.error('Please login to submit a review'); return; }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { product: data.product._id, ...reviewForm });
      toast.success('Review submitted! Pending approval.');
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmittingReview(false);
  };

  if (loading) return (
    <div className="container-page py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="flex gap-2">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton w-20 h-20 rounded-xl" />)}</div>
        </div>
        <div className="space-y-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-6" style={{ width: `${Math.random() * 40 + 60}%` }} />)}
        </div>
      </div>
    </div>
  );

  const { product, reviews = [] } = data || {};
  if (!product) return null;

  const price = product.salePrice || product.price;
  const discount = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  return (
    <div className="container-page py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/" className="hover:text-slate-200">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-slate-200">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-slate-200">{product.category?.name}</Link>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-square">
            <img
              src={product.images[selectedImg] || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 badge bg-emerald-500 text-white font-bold px-3 py-1 text-sm">
                -{discount}% OFF
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${i === selectedImg ? 'border-sky-500' : 'border-slate-600 hover:border-slate-400'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="badge-blue text-xs">{product.category?.name}</span>
              {product.brand && <span className="badge-gray text-xs">{product.brand}</span>}
              {product.sku && <span className="text-xs text-slate-500">SKU: {product.sku}</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={product.averageRating} size={18} />
            <span className="text-slate-400 text-sm">{Number(product.averageRating).toFixed(1)} ({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-emerald-400">৳{price.toLocaleString('en-BD')}</span>
            {product.salePrice && (
              <span className="text-xl text-slate-400 line-through">৳{product.price.toLocaleString('en-BD')}</span>
            )}
          </div>

          {/* Stock */}
          <div className={`flex items-center gap-2 text-sm font-medium ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {product.stock > 0 ? (
              <><Check size={16} /> In Stock ({product.stock} available)</>
            ) : (
              <><Package size={16} /> Out of Stock</>
            )}
          </div>

          {/* Variants */}
          {product.variants?.map((variant) => (
            <div key={variant.name}>
              <label className="label">{variant.name}</label>
              <div className="flex gap-2 flex-wrap">
                {variant.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedVariants(v => ({ ...v, [variant.name]: opt }))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${selectedVariants[variant.name] === opt ? 'border-sky-500 bg-sky-500/20 text-sky-400' : 'border-slate-600 text-slate-400 hover:border-slate-400'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div>
            <label className="label">Quantity</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold transition-colors">-</button>
              <span className="w-12 text-center font-bold text-lg">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold transition-colors">+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary flex items-center gap-2 flex-1">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={product.stock === 0} className="btn-success flex items-center gap-2 flex-1">
              Buy Now
            </button>
          </div>

          {/* Delivery Info */}
          <div className="card p-4 space-y-3">
            {[
              { icon: Truck, text: 'Free delivery on orders above ৳999', color: 'text-sky-400' },
              { icon: Shield, text: '7-day easy return policy', color: 'text-emerald-400' },
              { icon: Check, text: 'Cash on Delivery available', color: 'text-yellow-400' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-3 text-sm">
                <Icon size={16} className={color} />
                <span className="text-slate-300">{text}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {product.tags.map((t) => (
                <span key={t} className="text-xs px-2 py-1 bg-slate-700 text-slate-400 rounded-lg">#{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-10 card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Product Description</h2>
        <p className="text-slate-300 leading-relaxed whitespace-pre-line">{product.description}</p>
      </div>

      {/* Reviews */}
      <div className="mt-8 card p-6">
        <h2 className="text-xl font-bold text-white mb-6">Customer Reviews ({reviews.length})</h2>

        {reviews.length === 0 ? (
          <p className="text-slate-400 text-center py-6">No approved reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4 mb-6">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-slate-700 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {r.user?.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{r.user?.name}</p>
                    <StarRating rating={r.rating} size={12} />
                  </div>
                  <span className="ml-auto text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-300 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Submit Review */}
        <div className="border-t border-slate-700 pt-5">
          <h3 className="font-semibold text-slate-200 mb-3">Write a Review</h3>
          <div className="space-y-3">
            <StarRating rating={reviewForm.rating} interactive onChange={(r) => setReviewForm(f => ({ ...f, rating: r }))} size={24} />
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience with this product..."
              className="input min-h-[100px] resize-none"
            />
            <button onClick={handleSubmitReview} disabled={submittingReview} className="btn-primary">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-white mb-5">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
