import React, { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('kubera@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.login(username, password);
      if (response.success && response.token) {
        localStorage.setItem('kubera_admin_token', response.token);
        localStorage.setItem('kubera_admin_user', JSON.stringify(response.admin));
        if (onLoginSuccess) {
          onLoginSuccess(response.admin);
        }
        onClose();
      } else {
        setError(response.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Connection to auth server failed. Please check backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillDemo = () => {
    setUsername('admin');
    setPassword('kubera@2026');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      {/* Login Box */}
      <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-3xl shadow-2xl p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-stone-100"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Crest */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 mx-auto rounded-full p-0.5 bg-gradient-to-tr from-kubera-gold via-amber-300 to-kubera-burgundy shadow-xs overflow-hidden mb-3">
            <img
              src="/kubera-logo.jpg"
              alt="Hotel Kubera Crest"
              className="w-full h-full object-cover rounded-full bg-stone-100"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900">
            Manager & Kitchen Portal
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Hotel Kubera (Eluru) Management System
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Administrator Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-kubera-burgundy focus:outline-none text-slate-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-kubera-burgundy focus:outline-none text-slate-900 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-kubera-burgundy hover:bg-kubera-maroon text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-4 h-4 text-amber-200" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper Pill */}
        <div className="mt-4 pt-3 border-t border-stone-100 text-center">
          <p className="text-[11px] text-slate-500 mb-1.5 font-medium">
            Default Credentials: <span className="text-slate-900 font-mono font-bold">admin</span> / <span className="text-slate-900 font-mono font-bold">kubera@2026</span>
          </p>
          <button
            type="button"
            onClick={autofillDemo}
            className="text-[11px] text-kubera-burgundy hover:underline font-semibold"
          >
            Auto-fill credentials
          </button>
        </div>
      </div>
    </div>
  );
};
