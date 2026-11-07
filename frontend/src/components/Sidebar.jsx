import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  SearchCheck, 
  MessageSquareHeart, 
  CalendarDays, 
  UserCog, 
  Sparkles,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    path: '/food-checker',
    label: 'Food Checker',
    icon: SearchCheck,
    badge: 'Catalog',
  },
  {
    path: '/chat',
    label: 'AI Health Assistant',
    icon: MessageSquareHeart,
    badge: 'Context',
  },
  {
    path: '/weekly-plan',
    label: 'Weekly Plan',
    icon: CalendarDays,
    badge: '7-Day',
  },
  {
    path: '/profile',
    label: 'Profile & Settings',
    icon: UserCog,
    badge: null,
  },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();

  const navContent = (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#E5EBE7] p-4">
      {/* Navigation Links */}
      <div className="space-y-1.5 flex-1 pt-2">
        <p className="px-3 text-[11px] font-semibold text-[#71807B] uppercase tracking-wider mb-2">
          Health Hub
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#145B52] text-white shadow-sm'
                    : 'text-[#202C2A] hover:bg-[#F2F6F3] hover:text-[#145B52]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#F2A65A]' : 'text-[#71807B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#FFF3E6] text-[#E29547]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Profile quick widget at bottom */}
      <div className="pt-4 border-t border-[#E5EBE7]">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F8FAF8] hover:bg-[#EBF4F2] border border-[#E5EBE7] transition-all group"
        >
          <div className="w-9 h-9 rounded-full bg-[#145B52] text-white flex items-center justify-center font-semibold text-sm">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#202C2A] truncate group-hover:text-[#145B52]">
              {user?.full_name || 'My Health Profile'}
            </p>
            <p className="text-[11px] text-[#71807B] truncate">
              {user?.email || 'Active profile'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#71807B] group-hover:translate-x-0.5 transition-transform" />
        </NavLink>

        <div className="mt-3 px-2 py-2 rounded-lg bg-[#FCF5E8] border border-[#D99A35]/20 flex items-start gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-[#D99A35] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#71807B] leading-tight">
            Educational health aid only. Consult a physician for clinical medical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl z-50">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}

