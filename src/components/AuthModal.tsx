import React, { useState } from 'react';
import { User } from '../types';
import { X, Mail, Lock, User as UserIcon, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { registerUser, loginUser } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
  redirectReason?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  redirectReason,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    city: 'India',
    abhaId: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let user: User;

      if (mode === 'register') {
        // Validation
        if (!formData.name || formData.name.length < 2) {
          throw new Error('Please enter your full name');
        }
        if (!formData.email || !formData.email.includes('@')) {
          throw new Error('Please enter a valid email address');
        }
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (!formData.mobile || formData.mobile.length < 10) {
          throw new Error('Please enter a valid mobile number');
        }

        // Register with Firebase
        user = await registerUser({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          city: formData.city,
          abhaId: formData.abhaId,
        });
      } else {
        // Login
        if (!formData.email || !formData.email.includes('@')) {
          throw new Error('Please enter a valid email address');
        }
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Please enter your password');
        }

        user = await loginUser(formData.email, formData.password);
      }

      onSuccess(user);
      onClose();
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-lg transition"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Sign In' : 'Register New User'}
          </h2>
          <p className="text-slate-400 text-sm">
            {mode === 'login' 
              ? 'Access full policy terms, tax 80D receipts, and security vault.' 
              : 'Create your account to get started'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Mobile (+91)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="9989635520"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password {mode === 'register' && '(min 6 chars)'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none"
                required
                minLength={6}
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Your city"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  ABHA Health ID (Optional)
                </label>
                <input
                  type="text"
                  name="abhaId"
                  value={formData.abhaId}
                  onChange={handleChange}
                  placeholder="14-digit ABHA ID"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold py-3 px-4 rounded-xl hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? 'Loading...' 
              : mode === 'login' 
                ? 'Sign In →' 
                : 'Create Account & Register →'
            }
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition"
          >
            {mode === 'login' 
              ? "Don't have an account? Register" 
              : 'Already have an account? Sign In'}
          </button>
        </div>

        <div className="mt-3 text-center text-[10px] text-slate-500">
          By {mode === 'login' ? 'signing in' : 'registering'}, your account is linked to IRDAI Insurance Repository.
        </div>
      </div>
    </div>
  );
};

export default AuthModal;