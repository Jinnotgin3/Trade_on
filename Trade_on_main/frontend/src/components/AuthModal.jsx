import React, { useState } from 'react';
import axios from 'axios';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? 'login' : 'register';
    try {
      const res = await axios.post(`http://localhost:5001/api/${endpoint}`, formData);
      onAuthSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
      >
        {/* Header Decor */}
        <div className={`h-2 w-full bg-gradient-to-r ${isLogin ? 'from-[var(--color-purple-500)] to-[var(--color-pink-400)]' : 'from-[var(--color-gold)] to-[var(--color-purple-500)]'}`} />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900"
        >
          <X size={20} />
        </button>

        <div className="p-10">
          <div className="text-center mb-10">
            <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-3">
              {isLogin ? 'Welcome Back' : 'Join the Network'}
            </h2>
            <p className="text-gray-500 font-medium">
              {isLogin ? 'Log in to manage your trade portfolio' : 'Start your journey to global market expansion'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-[var(--color-purple-500)] focus:ring-4 focus:ring-[var(--color-purple-500)]/10 outline-none transition-all font-medium text-gray-900"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-[var(--color-purple-500)] focus:ring-4 focus:ring-[var(--color-purple-500)]/10 outline-none transition-all font-medium text-gray-900"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 group ${isLogin ? 'bg-gradient-to-r from-[var(--color-purple-500)] to-[var(--color-pink-400)]' : 'bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-purple-500)]'}`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Log In' : 'Create Account'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[var(--color-purple-500)] font-bold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
