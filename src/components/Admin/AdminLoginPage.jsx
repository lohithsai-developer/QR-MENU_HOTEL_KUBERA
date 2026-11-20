import React, { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export const AdminLoginPage = ({ onLoginSuccess, onBackToCustomer }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('kubera@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      } else {
        setError(response.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Connection failed. Please ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('kubera@2026');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <button
          onClick={onBackToCustomer}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-kubera-burgundy bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Customer Menu</span>
        </button>

        <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900">
          Admin Portal
        </span>
      </div>

      {/* Center Login Card */}
      <div className="max-w-md w-full mx-auto my-6 bg-white border border-stone-200 rounded-3xl shadow-xl p-5 sm:p-7">
        {/* Brand Crest */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-kubera-gold to-kubera-burgundy shadow-sm overflow-hidden mb-3">
            <img
              src="/kubera-logo.jpg"
              alt="Hotel Kubera"
              className="w-full h-full object-cover rounded-full bg-stone-100"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          <h1 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
            HOTEL KUBERA
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Staff & Manager Administration Portal
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-kubera-burgundy focus:outline-none text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
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
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-kubera-burgundy focus:outline-none text-slate-900 font-medium"
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

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-kubera-burgundy hover:bg-kubera-maroon text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
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

        {/* Quick Demo Credentials */}
        <div className="mt-5 pt-4 border-t border-stone-100 text-center">
          <p className="text-[11px] text-slate-500 mb-2">
            Demo Credentials: <span className="font-mono font-semibold text-slate-700">admin</span> / <span className="font-mono font-semibold text-slate-700">kubera@2026</span>
          </p>
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full py-2 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Auto-fill Demo Credentials</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400">
        Hotel Kubera (Eluru) • Digital Dining & Kitchen Administration
      </footer>
    </div>
  );
};
