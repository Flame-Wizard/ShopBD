import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Register() {
  const [showPass, setShowPass] = useState(false);
  const register_ = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  const { register, handleSubmit, setError, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async ({ name, email, password }) => {
    try {
      await register_(name, email, password);
      navigate('/');
    } catch (err) {
      setError('root', { message: err.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center font-bold text-white text-lg">S</div>
            <span className="font-bold text-2xl text-white">Shop<span className="text-gradient">BD</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-1">Join thousands of happy shoppers</p>
        </div>

        <div className="card p-6">
          {errors.root && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 mb-4 text-red-400 text-sm">
              {errors.root.message}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })} className="input" placeholder="Your name" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email Address</label>
              <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} type="email" className="input" placeholder="you@example.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                  type={showPass ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Min 6 characters"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input
                {...register('confirm', { validate: v => v === password || 'Passwords do not match' })}
                type="password"
                className="input"
                placeholder="Repeat password"
              />
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-sky-400 hover:text-sky-300 font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
