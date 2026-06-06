import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import ProductCard from '../../components/ui/ProductCard';

export default function AccountWishlist() {
  const user = useAuthStore((s) => s.user);
  const wishlist = user?.wishlist || [];

  return (
    <div className="container-page py-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-white mb-6">My Wishlist ({wishlist.length})</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">💝</p>
          <h2 className="text-xl font-bold text-slate-300">Your wishlist is empty</h2>
          <Link to="/shop" className="btn-primary inline-block mt-4">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {wishlist.map((product) => <ProductCard key={product._id || product} product={typeof product === 'object' ? product : { _id: product }} />)}
        </div>
      )}
    </div>
  );
}
