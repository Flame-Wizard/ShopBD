import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  { q: 'How do I place an order?', a: 'Browse products, add to cart, proceed to checkout, fill in your address, choose payment method (Cash on Delivery, bKash, Nagad, or Bank Transfer), and place your order.' },
  { q: 'What payment methods are accepted?', a: 'We accept Cash on Delivery (COD), bKash, Nagad, and Bank Transfer. COD is available across all 64 districts of Bangladesh.' },
  { q: 'How long does delivery take?', a: 'Dhaka City: 1-2 days. Other Dhaka Division areas: 2-3 days. Outside Dhaka: 3-5 business days. Express delivery is also available.' },
  { q: 'What is the return policy?', a: 'We offer a 7-day return policy for all products. Items must be unused and in original packaging. Contact support@shopbd.com to initiate a return.' },
  { q: 'Is Cash on Delivery available everywhere?', a: 'Yes! Cash on Delivery is available across all 64 districts of Bangladesh through our delivery partners.' },
  { q: 'How can I track my order?', a: 'After your order is shipped, you will receive a tracking number via email (if configured). You can also check your order status in My Account > My Orders.' },
  { q: 'Are the products genuine?', a: 'Yes, 100%. All products on ShopBD are verified and genuine. We have a strict quality check process for all sellers and suppliers.' },
  { q: 'How do I contact customer support?', a: 'Email us at support@shopbd.com or call +880 1700-SHOPBD (Mon–Sat, 9am–9pm). We also respond on Facebook: facebook.com/shopbd' },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="container-page py-12 max-w-3xl animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-3">Frequently Asked <span className="text-gradient">Questions</span></h1>
        <p className="text-slate-400">Everything you need to know about ShopBD</p>
      </div>
      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-700/50 transition-colors">
              <span className="font-semibold text-slate-200">{faq.q}</span>
              {open === i ? <ChevronUp size={18} className="text-sky-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-slate-300 text-sm leading-relaxed animate-slide-down border-t border-slate-700 pt-4">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
