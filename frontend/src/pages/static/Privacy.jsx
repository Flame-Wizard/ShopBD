import React from 'react';
export default function Privacy() {
  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
      <div className="card p-6 prose prose-invert max-w-none text-slate-300 space-y-4 text-sm leading-relaxed">
        <p>Last updated: June 2024</p>
        <h2 className="text-white font-bold text-base">1. Information We Collect</h2>
        <p>We collect your name, email, phone number, and delivery address when you register or place an order. We also collect browsing data to improve your experience.</p>
        <h2 className="text-white font-bold text-base">2. How We Use Your Information</h2>
        <p>Your information is used to process orders, send order confirmations, and improve our services. We do not sell your personal data to third parties.</p>
        <h2 className="text-white font-bold text-base">3. Data Security</h2>
        <p>All data is encrypted using industry-standard SSL. Passwords are hashed and never stored in plain text.</p>
        <h2 className="text-white font-bold text-base">4. Cookies</h2>
        <p>We use cookies for session management and analytics. You can disable cookies in your browser settings.</p>
        <h2 className="text-white font-bold text-base">5. Contact</h2>
        <p>For privacy concerns, contact: privacy@shopbd.com | ShopBD, 123 Gulshan Avenue, Dhaka 1212, Bangladesh.</p>
      </div>
    </div>
  );
}
