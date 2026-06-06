import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const addLocalItem = useCartStore((s) => s.addLocalItem);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (user) {
      addItem(product._id, 1);
    } else {
      addLocalItem(product, 1);
    }
  };

  const discountPct = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <Link to={`/shop/${product.slug}`} className="card card-hover group flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-slate-700">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&q=80'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPct > 0 && (
            <span className="badge bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              -{discountPct}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              Out of Stock
            </span>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <span className="badge bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              Only {product.stock} left!
            </span>
          )}
        </div>
        {/* Quick Add */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="absolute bottom-2 right-2 w-9 h-9 bg-sky-500 hover:bg-sky-400 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-slate-500 mb-1">{product.brand || product.category?.name}</p>
        <h3 className="text-sm font-semibold text-slate-200 truncate-2 leading-snug flex-1">
          {product.name}
        </h3>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-slate-400">
              {Number(product.averageRating).toFixed(1)} ({product.numReviews})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="price-sale text-base">
            ৳{(product.salePrice || product.price).toLocaleString('en-BD')}
          </span>
          {product.salePrice && (
            <span className="price-original">৳{product.price.toLocaleString('en-BD')}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-5 w-24 mt-2" />
      </div>
    </div>
  );
}
