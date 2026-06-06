import React from 'react';

export default function About() {
  return (
    <div className="container-page py-12 max-w-4xl animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-3">About <span className="text-gradient">ShopBD</span></h1>
        <p className="text-slate-400 text-lg">Bangladesh's Premier Online Marketplace</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-3">🇧🇩 Our Story</h2>
          <p className="text-slate-300 leading-relaxed">
            ShopBD was founded in 2020 in Dhaka, Bangladesh, with a simple mission: to connect Bangladesh's finest local artisans, brands, and entrepreneurs with customers across the country and beyond. From the handloom weavers of Narayanganj to the electronics shops of Elephant Road, we bring the best of Bangladesh to your doorstep.
          </p>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-3">🎯 Our Mission</h2>
          <p className="text-slate-300 leading-relaxed">
            We believe every Bangladeshi deserves access to quality products at fair prices. We support local businesses, promote Bangladeshi heritage crafts, and ensure fast, reliable delivery across all 64 districts of Bangladesh.
          </p>
        </div>
      </div>

      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">By the Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['50,000+', 'Happy Customers'], ['16+', 'Product Categories'], ['64', 'Districts Served'], ['24/7', 'Customer Support']].map(([num, label]) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-gradient">{num}</p>
              <p className="text-slate-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold text-white mb-4">📍 Our Office</h2>
        <p className="text-slate-300">123 Gulshan Avenue, Gulshan-1, Dhaka 1212, Bangladesh</p>
        <p className="text-slate-400 mt-2">📞 +880 1700-SHOPBD | ✉️ hello@shopbd.com</p>
      </div>
    </div>
  );
}
