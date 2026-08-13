import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Stage 1/2 Mock Signup
    setTimeout(() => {
      if (name && email && password && orgName) {
        localStorage.setItem('token', 'mock-jwt-token-abcd');
        localStorage.setItem('user_email', email);
        localStorage.setItem('organization_name', orgName);
        localStorage.setItem('organization_id', 'mock-org-uuid-1234');
        navigate('/dashboard');
      } else {
        setError('Please fill in all the fields.');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col justify-center items-center px-6 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Branding */}
        <div className="flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <Cpu className="h-8 w-8 text-brand-500" />
            <span className="font-display font-bold text-2xl tracking-wider bg-gradient-to-r from-white to-brand-400 bg-clip-text text-transparent">
              INTELLIAVATAR
            </span>
          </Link>
          <p className="text-sm text-neutral-400">Create your account and organize your workspaces</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400 text-center">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2 bg-neutral-900/60 border border-white/10 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Organization */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Organization Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                  <Cpu className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme University / Support Team"
                  className="w-full pl-10 pr-4 py-2 bg-neutral-900/60 border border-white/10 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-10 pr-4 py-2 bg-neutral-900/60 border border-white/10 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-neutral-900/60 border border-white/10 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-2.5 px-4 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 disabled:cursor-not-allowed font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(59,102,255,0.3)] text-sm"
            >
              {isLoading ? 'Creating Account...' : 'Register'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Prompt */}
          <div className="mt-4 text-center text-xs text-neutral-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        {/* Security disclosure */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500 uppercase tracking-widest">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Organization Data Separation Assured</span>
        </div>
      </div>
    </div>
  );
}
