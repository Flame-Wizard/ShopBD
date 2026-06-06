import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, Heart, ChevronDown, LogOut, Package, LayoutDashboard } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const navigate = useNavigate();
  const userRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(keyword.trim())}`);
      setSearchOpen(false);
      setKeyword('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-2xl border-b border-slate-700/50' : 'bg-slate-900 border-b border-slate-800'}`}>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white text-xs py-1.5 text-center font-medium">
        🇧🇩 Free delivery on orders above ৳999 | Cash on Delivery available nationwide
      </div>

      <div className="container-page">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center font-bold text-white">S</div>
            <div>
              <span className="font-bold text-xl text-white">Shop</span>
              <span className="font-bold text-xl text-gradient">BD</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-sky-400 bg-sky-500/10' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Search */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2 animate-scale-in">
                <input
                  autoFocus
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search products..."
                  className="input-sm w-52 md:w-72"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="btn-icon text-slate-400">
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="btn-icon text-slate-400 hover:text-slate-100">
                <Search size={20} />
              </button>
            )}

            {/* Cart */}
            <Link to="/cart" className="btn-icon relative text-slate-400 hover:text-slate-100">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-scale-in">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button onClick={() => setUserOpen(!userOpen)} className="flex items-center gap-2 btn-icon text-slate-400 hover:text-slate-100">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 card shadow-xl animate-slide-down py-2">
                    <div className="px-4 py-2 border-b border-slate-700">
                      <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link to="/account" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                      <User size={15} /> My Account
                    </Link>
                    <Link to="/account/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                      <Package size={15} /> My Orders
                    </Link>
                    <Link to="/account/wishlist" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                      <Heart size={15} /> Wishlist
                    </Link>
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-sky-400 hover:bg-slate-700 transition-colors">
                        <LayoutDashboard size={15} /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors">
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth/login" className="btn-primary btn-sm">
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden btn-icon text-slate-400">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-700 py-3 animate-slide-down">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'text-sky-400' : 'text-slate-400'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
