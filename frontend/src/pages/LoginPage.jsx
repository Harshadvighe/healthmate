import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.onboarding_completed) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-[#145B52] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6 text-[#F2A65A]" />
          </div>
          <span className="font-bold text-2xl text-[#202C2A]">
            Health<span className="text-[#145B52]">Mate</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-[#202C2A]">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-[#71807B]">
          Sign in to access your personalized health recommendations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#E5EBE7] shadow-sm space-y-6"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-[#FDEEEE] border border-[#D85C5C]/20 flex items-start gap-2.5 text-[#D85C5C] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71807B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] placeholder-[#71807B] focus:outline-none focus:ring-2 focus:ring-[#145B52] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71807B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] placeholder-[#71807B] focus:outline-none focus:ring-2 focus:ring-[#145B52] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#145B52] text-white font-medium text-sm hover:bg-[#0E423B] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#E5EBE7] text-center">
            <p className="text-xs text-[#71807B]">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-[#145B52] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

