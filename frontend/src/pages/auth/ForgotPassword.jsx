import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending reset email');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
          <p className="text-slate-400 mt-1">Enter your email to receive a reset link</p>
        </div>
        <div className="card p-6">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">📧</p>
              <h2 className="font-bold text-slate-100">Email Sent!</h2>
              <p className="text-slate-400 text-sm mt-2">Check your inbox for the reset link. It expires in 10 minutes.</p>
              <Link to="/auth/login" className="btn-primary inline-block mt-4">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link to="/auth/login" className="block text-center text-sm text-sky-400 hover:text-sky-300">Back to Login</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
