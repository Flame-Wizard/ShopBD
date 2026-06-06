import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Truck, Shield, Star, Zap, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import ProductCard, { ProductCardSkeleton } from '../../components/ui/ProductCard';

const HERO_SLIDES = [
  {
    title: 'Eid Collection 2024',
    subtitle: 'Premium Panjabi, Sarees & Traditional Wear — Now 30% Off!',
    cta: 'Shop Eid Deals',
    link: '/shop?category=fashion-clothing',
    bg: 'from-indigo-900 via-purple-900 to-slate-900',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80',
    badge: '🎉 Eid Special',
  },
  {
    title: 'Latest Electronics',
    subtitle: 'Walton, Samsung, Xiaomi — Bangladesh\'s Best Prices',
    cta: 'Shop Electronics',
    link: '/shop?category=electronics',
    bg: 'from-sky-900 via-blue-900 to-slate-900',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80',
    badge: '⚡ New Arrivals',
  },
  {
    title: 'Handmade Heritage',
    subtitle: 'Authentic Bangladeshi Jamdani, Muslin & Nakshi Kantha',
    cta: 'Explore Crafts',
    link: '/shop?category=handicrafts-art',
    bg: 'from-emerald-900 via-teal-900 to-slate-900',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
    badge: '🇧🇩 Made in Bangladesh',
  },
];

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', emoji: '📱', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80' },
  { name: 'Fashion', slug: 'fashion-clothing', emoji: '👗', img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80' },
  { name: 'Home & Living', slug: 'home-living', emoji: '🏠', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80' },
  { name: 'Beauty', slug: 'beauty-personal-care', emoji: '💄', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80' },
  { name: 'Sports', slug: 'sports-fitness', emoji: '🏏', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
  { name: 'Books', slug: 'books-stationery', emoji: '📚', img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80' },
  { name: 'Food', slug: 'food-groceries', emoji: '🌾', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80' },
  { name: 'Handicrafts', slug: 'handicrafts-art', emoji: '🪔', img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80' },
];

const FEATURES = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above ৳999 nationwide', color: 'text-sky-400' },
  { icon: Shield, title: 'Secure Shopping', desc: '100% safe & encrypted transactions', color: 'text-emerald-400' },
  { icon: Star, title: 'Genuine Products', desc: 'All products verified & authentic', color: 'text-yellow-400' },
  { icon: Zap, title: 'Fast Processing', desc: 'Orders dispatched within 24 hours', color: 'text-purple-400' },
];

export default function Home() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.get('/products?limit=8&sort=-unitsSold').then(({ data }) => {
      setProducts(data.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const slide = HERO_SLIDES[heroIdx];

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <section className={`relative min-h-[500px] md:min-h-[580px] bg-gradient-to-r ${slide.bg} overflow-hidden`}>
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative container-page flex items-center min-h-[500px] md:min-h-[580px]">
          <div className="max-w-2xl animate-slide-up">
            <span className="inline-block badge-blue mb-4 text-sm px-3 py-1">{slide.badge}</span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
              {slide.title}
            </h1>
            <p className="text-lg text-slate-300 mb-8">{slide.subtitle}</p>
            <div className="flex gap-4 flex-wrap">
              <Link to={slide.link} className="btn-primary flex items-center gap-2 text-base">
                <ShoppingBag size={18} />
                {slide.cta}
                <ArrowRight size={18} />
              </Link>
              <Link to="/shop" className="btn-secondary flex items-center gap-2 text-base">
                Browse All
              </Link>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === heroIdx ? 'w-8 bg-sky-400' : 'w-2 bg-slate-500'}`}
            />
          ))}
        </div>
      </section>

      {/* Promo Strip */}
      <div className="bg-gradient-to-r from-emerald-600 to-sky-600 py-2 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {['🇧🇩 Proudly Bangladeshi', '⚡ Fast Delivery Dhaka', '🛡️ 100% Genuine Products', '💰 Best Prices Guaranteed', '📦 Easy Returns', '🎁 Eid Special Offers', '🔥 Flash Sales Daily'].map((t, i) => (
            <span key={i} className="text-white font-medium text-sm mx-8">{t}</span>
          ))}
          {['🇧🇩 Proudly Bangladeshi', '⚡ Fast Delivery Dhaka', '🛡️ 100% Genuine Products', '💰 Best Prices Guaranteed', '📦 Easy Returns', '🎁 Eid Special Offers', '🔥 Flash Sales Daily'].map((t, i) => (
            <span key={`dup-${i}`} className="text-white font-medium text-sm mx-8">{t}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="container-page py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card p-4 text-center hover:border-slate-600 transition-colors">
              <Icon size={28} className={`${color} mx-auto mb-2`} />
              <h3 className="font-semibold text-slate-200 text-sm">{title}</h3>
              <p className="text-slate-400 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Shop by Category</h2>
          <Link to="/shop" className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-sm font-medium">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map(({ name, slug, emoji, img }) => (
            <Link
              key={slug}
              to={`/shop?category=${slug}`}
              className="card card-hover group flex flex-col items-center p-3 text-center"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden mb-2 border border-slate-600 group-hover:border-sky-500 transition-colors">
                <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <span className="text-xs font-medium text-slate-300 group-hover:text-sky-400 transition-colors">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-page pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">🔥 Top Selling Products</h2>
            <p className="text-slate-400 text-sm mt-1">Best picks from across Bangladesh</p>
          </div>
          <Link to="/shop" className="btn-outline btn-sm flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p._id} product={p} />)
          }
        </div>
      </section>

      {/* Sale Banner */}
      <section className="container-page pb-12">
        <div className="rounded-2xl bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-20" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sky-200 text-sm font-medium mb-2">Limited Time Offer</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Eid Mubarak! 🌙</h2>
              <p className="text-slate-200">Use code <span className="font-bold text-yellow-300">EID2024</span> for ৳500 off on orders above ৳2000</p>
            </div>
            <Link to="/shop" className="btn-primary whitespace-nowrap flex items-center gap-2 bg-white text-sky-700 hover:bg-slate-100">
              <ShoppingBag size={18} /> Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Made in Bangladesh */}
      <section className="container-page pb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">🇧🇩 Proudly Bangladeshi</h2>
          <p className="text-slate-400 mt-2">Supporting local artisans, weavers, and entrepreneurs across Bangladesh</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Jamdani Weavers', location: 'Narayanganj', img: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=80' },
            { title: 'Hilsa Fishermen', location: 'Padma River, Khulna', img: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=600&q=80' },
            { title: 'Bamboo Craftsmen', location: 'Sylhet Hills', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
          ].map(({ title, location, img }) => (
            <div key={title} className="card card-hover overflow-hidden group">
              <div className="h-48 overflow-hidden">
                <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-200">{title}</h3>
                <p className="text-slate-400 text-sm mt-1">📍 {location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
