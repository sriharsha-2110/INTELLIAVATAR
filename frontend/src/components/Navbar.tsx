import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Cpu, LayoutDashboard, UserPlus, BookOpen, FileText, FlaskConical, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = localStorage.getItem('user_email') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('organization_id');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Create 3D Avatar', path: '/creator', icon: UserPlus },
    { name: '3D Classroom', path: '/teacher/aurora-7', icon: BookOpen },
    { name: 'Talk-To-PDF', path: '/talk-to-pdf', icon: FileText },
    { name: 'Research Lab', path: '/research', icon: FlaskConical },
    { name: 'Admin', path: '/admin', icon: ShieldAlert },
  ];

  return (
    <nav className="border-b border-white/5 bg-dark-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <Cpu className="h-6 w-6 text-brand-500 animate-pulse" />
          <span className="font-display font-bold text-lg tracking-wider bg-gradient-to-r from-white to-brand-400 bg-clip-text text-transparent">
            INTELLIAVATAR
          </span>
        </Link>

        {/* Navigation links */}
        <div className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-brand-400 ${
                  isActive ? 'text-brand-500' : 'text-neutral-400'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User profile dropdown & logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <User className="h-4 w-4 text-brand-400" />
            <span className="text-xs font-medium text-neutral-300 max-w-[120px] truncate">
              {email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-neutral-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
