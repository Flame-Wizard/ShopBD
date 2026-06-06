import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const handleSubmit = (e) => { e.preventDefault(); toast.success('Message sent! We\'ll reply within 24 hours.'); setForm({ name: '', email: '', subject: '', message: '' }); };

  return (
    <div className="container-page py-12 max-w-4xl animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-3">Contact <span className="text-gradient">Us</span></h1>
        <p className="text-slate-400">We're here to help! Reach us anytime.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[
            { icon: Phone, title: 'Phone / WhatsApp', info: '+880 1700-SHOPBD', sub: 'Mon–Sat, 9am–9pm' },
            { icon: Mail, title: 'Email', info: 'support@shopbd.com', sub: 'Reply within 24 hours' },
            { icon: MapPin, title: 'Office', info: '123 Gulshan Avenue', sub: 'Dhaka 1212, Bangladesh' },
          ].map(({ icon: Icon, title, info, sub }) => (
            <div key={title} className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center"><Icon size={20} className="text-sky-400" /></div>
              <div>
                <p className="font-semibold text-slate-200">{title}</p>
                <p className="text-slate-300 text-sm">{info}</p>
                <p className="text-slate-500 text-xs">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-slate-100 mb-4">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {['name', 'email', 'subject'].map((f) => (
              <div key={f}>
                <label className="label capitalize">{f}</label>
                <input type={f === 'email' ? 'email' : 'text'} value={form[f]} onChange={e => setForm(x => ({ ...x, [f]: e.target.value }))} className="input" required />
              </div>
            ))}
            <div>
              <label className="label">Message</label>
              <textarea value={form.message} onChange={e => setForm(x => ({ ...x, message: e.target.value }))} className="input min-h-[100px] resize-none" required />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2"><Send size={16} /> Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}
