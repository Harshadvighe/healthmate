import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, HeartPulse } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col text-[#202C2A]">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile sub-header with hamburger */}
          <div className="lg:hidden px-4 py-2.5 bg-white border-b border-[#E5EBE7] flex items-center justify-between">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg border border-[#E5EBE7] text-[#202C2A] hover:bg-[#F2F6F3]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#71807B]">
              Health Navigation
            </span>
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>

          <footer className="border-t border-[#E5EBE7] bg-white px-4 py-3 text-center text-xs text-[#71807B]">
            <p>
              HealthMate AI &bull; Grounded in an evidence-aware Indian Food Catalog &bull; Non-diagnostic wellness education
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

