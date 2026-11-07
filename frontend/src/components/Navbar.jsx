import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Sparkles, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E5EBE7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#145B52] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <HeartPulse className="w-6 h-6 text-[#F2A65A]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xl tracking-tight text-[#202C2A]">Health<span className="text-[#145B52]">Mate</span></span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#FFF3E6] text-[#E29547] border border-[#F2A65A]/30">AI</span>
            </div>
            <p className="text-[11px] text-[#71807B] -mt-0.5 hidden sm:block">Personalized Nutrition & Health Assistant</p>
          </div>
        </Link>

        {/* Right Nav */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF4F2] text-[#145B52] text-xs font-medium border border-[#287C70]/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3A936B]" />
            <span>1,400+ Verified Indian Foods Catalog</span>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5EBE7] bg-[#FFFFFF] hover:bg-[#F2F6F3] text-sm text-[#202C2A] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#145B52] text-white flex items-center justify-center text-xs font-semibold">
                  {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </div>
                <span className="font-medium hidden sm:inline">{user.full_name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-[#71807B] hover:text-[#D85C5C] hover:bg-[#FDEEEE] transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-[#145B52] hover:text-[#0E423B] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[#145B52] text-white hover:bg-[#0E423B] shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

