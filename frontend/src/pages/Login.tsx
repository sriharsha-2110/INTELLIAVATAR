import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      if (res.data?.token && res.data?.user) {
        login(res.data.token, res.data.user);
        navigate('/');
        return;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    login('guest_token_123', {
      id: 'guest-teacher-user',
      name: 'Guest Educator',
      email: 'educator@intelliavatar.ai',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0c0f17] text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl space-y-6">
        
        {/* Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.5)]">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Sign in to INTELLIAVATAR 2.0</h2>
          <p className="text-xs text-neutral-400">AI-Powered 3D Virtual Teacher & Learning Platform</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-neutral-300 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.edu"
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-white focus:outline-none focus:border-cyan-400"
              />
              <Mail className="h-4 w-4 text-neutral-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-neutral-300 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-white focus:outline-none focus:border-cyan-400"
              />
              <Lock className="h-4 w-4 text-neutral-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] text-neutral-400 font-mono uppercase absolute">or</span>
        </div>

        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <span>Continue as Guest Educator</span>
        </button>

        <p className="text-[11px] text-center text-neutral-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
