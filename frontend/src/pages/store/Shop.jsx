import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Grid3X3, List, SlidersHorizontal, X, Search, ChevronDown, Tag } from 'lucide-react';
import api from '../../api/axios';
import ProductCard, { ProductCardSkeleton } from '../../components/ui/ProductCard';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.set('page', '1');
    setSearchParams(p);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '12', page });
      if (keyword) params.set('keyword', keyword);
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch {}
    setLoading(false);
  }, [keyword, category, sort, page, minPrice, maxPrice]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || []));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const clearFilters = () => setSearchParams({});

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Tag size={16} /> Categories
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParam('category', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:bg-slate-700'}`}
          >
            All Categories
          </button>
          {categories.filter(c => !c.parent).map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateParam('category', cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.slug ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:bg-slate-700'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-slate-200 mb-3">Price Range (৳)</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            className="input-sm flex-1"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            className="input-sm flex-1"
          />
        </div>
      </div>

      <button onClick={clearFilters} className="w-full btn-secondary btn-sm flex items-center justify-center gap-2 text-red-400 border-red-700/50 hover:bg-red-900/20">
        <X size={14} /> Clear Filters
      </button>
    </div>
  );



  return (
    <div className="container-page py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <h2 className="font-bold text-slate-100 mb-5 flex items-center gap-2">
              <SlidersHorizontal size={18} /> Filters
            </h2>
            <FilterSidebar />
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                {keyword ? `Results for "${keyword}"` : category ? categories.find(c => c.slug === category)?.name || 'Shop' : 'All Products'}
              </h1>
              <p className="text-slate-400 text-sm">{total} products found</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setFilterOpen(true)} className="lg:hidden btn-secondary btn-sm flex items-center gap-2">
                <Filter size={14} /> Filters
              </button>
              <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="select text-sm py-2 px-3 w-auto">
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array(12).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🛒</p>
              <h3 className="text-xl font-bold text-slate-300">No products found</h3>
              <p className="text-slate-400 mt-2">Try different filters or search terms</p>
              <button onClick={clearFilters} className="btn-primary mt-4">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', i + 1); setSearchParams(p); }}
                  className={`w-10 h-10 rounded-xl font-semibold text-sm transition-colors ${page === i + 1 ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setFilterOpen(false)} />
          <div className="absolute right-0 inset-y-0 w-72 bg-slate-800 p-5 overflow-y-auto animate-slide-down">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-100">Filters</h2>
              <button onClick={() => setFilterOpen(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}
    </div>
  );
}
