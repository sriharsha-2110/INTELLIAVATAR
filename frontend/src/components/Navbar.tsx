import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, Users, PlusCircle, Video, BookOpen, 
  GraduationCap, Settings, LogOut, Cpu, LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teachers', label: 'My Teachers', icon: Users },
    { to: '/create', label: 'Create Teacher', icon: PlusCircle },
    { to: '/teaching', label: 'Teaching Room', icon: Video },
    { to: '/tutor', label: 'AI Tutor', icon: BookOpen },
    { to: '/learning', label: 'My Learning', icon: GraduationCap },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="w-full bg-[#0c0f17]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">INTELLIAVATAR</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                2.0
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 tracking-wider font-mono">3D VIRTUAL TEACHER</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Session */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-semibold text-white">{user?.name || 'Educator'}</span>
            <span className="text-[10px] text-neutral-400 font-mono">Pro Teacher</span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

      </div>
    </nav>
  );
}
