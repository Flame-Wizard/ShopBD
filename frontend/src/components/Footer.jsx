import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Facebook = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Twitter = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Youtube = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="9.7 15 9.7 9 15 12 9.7 15" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
      {/* Newsletter */}
      <div className="bg-gradient-to-r from-sky-900/50 to-emerald-900/50 border-b border-slate-700">
        <div className="container-page py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">Stay in the loop 📬</h3>
              <p className="text-slate-400 text-sm mt-1">Get exclusive deals, new arrivals, and Eid offers straight to your inbox.</p>
            </div>
            <form className="flex gap-3 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="your@email.com" className="input flex-1 md:w-72" />
              <button className="btn-primary whitespace-nowrap">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-page py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center font-bold text-white">S</div>
              <span className="font-bold text-xl text-white">Shop<span className="text-gradient">BD</span></span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Bangladesh's premium online store. Bringing quality products from all corners of BD to your doorstep.
            </p>
            <div className="flex gap-3 mt-4">
              {[
                { icon: Facebook, href: '#', color: 'hover:text-blue-400' },
                { icon: Instagram, href: '#', color: 'hover:text-pink-400' },
                { icon: Twitter, href: '#', color: 'hover:text-sky-400' },
                { icon: Youtube, href: '#', color: 'hover:text-red-400' },
              ].map(({ icon: Icon, href, color }) => (
                <a key={href + Icon.name} href={href} className={`text-slate-500 ${color} transition-colors`}>
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[['Shop', '/shop'], ['About Us', '/about'], ['Contact', '/contact'], ['FAQ', '/faq']].map(([label, to]) => (
                <li key={to}><Link to={to} className="text-slate-400 hover:text-sky-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['Electronics', 'electronics'],
                ['Fashion', 'fashion-clothing'],
                ['Home & Living', 'home-living'],
                ['Beauty', 'beauty-personal-care'],
                ['Handicrafts', 'handicrafts-art'],
              ].map(([label, cat]) => (
                <li key={cat}>
                  <Link to={`/shop?category=${cat}`} className="text-slate-400 hover:text-sky-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="text-sky-400 mt-0.5 flex-shrink-0" />
                123 Gulshan Avenue, Dhaka 1212, Bangladesh
              </li>
              <li className="flex items-center gap-2">
                <Phone size={15} className="text-sky-400 flex-shrink-0" />
                +880 1700-SHOPBD
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-sky-400 flex-shrink-0" />
                support@shopbd.com
              </li>
            </ul>
            <div className="mt-4 flex gap-2 flex-wrap">
              <span className="badge-green text-xs">bKash</span>
              <span className="badge-blue text-xs">Nagad</span>
              <span className="badge-gray text-xs">COD</span>
              <span className="badge-purple text-xs">Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container-page py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© 2024 ShopBD — Made with 🇧🇩 in Bangladesh</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
