import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import DeleteAvatarModal from '../components/DeleteAvatarModal';
import { 
  User, MessageSquare, BookOpen, Clock, Heart, Users, 
  FileText, PlusCircle, Settings, ChevronRight, Sparkles, 
  MessageCircle, Trash2, Edit3, Eye, Cpu, CheckCircle2, AlertCircle 
} from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const [avatars, setAvatars] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Modal State
  const [editingAvatar, setEditingAvatar] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const loadAvatars = async () => {
    // 1. Load from local cache first
    const saved = JSON.parse(localStorage.getItem('avatars') || '[]');
    
    // Ensure default 3D Aurora-7 exists if empty
    if (saved.length === 0) {
      const defaultAvatars = [
        {
          id: 'aurora-7',
          name: 'Aurora-7 (Neural 3D Teacher)',
          description: 'Multilingual AI Digital Human Teacher with 3D Viseme Lip-Sync and Virtual Classroom',
          language: 'en',
          image_url: '/avatars/aurora_hologram.jpg',
          avatar_type: '3D Digital Human',
          generation_status: 'COMPLETED',
          created_at: new Date().toISOString(),
        },
      ];
      localStorage.setItem('avatars', JSON.stringify(defaultAvatars));
      setAvatars(defaultAvatars);
    } else {
      setAvatars(saved);
    }

    // 2. Fetch from Backend GET /api/v1/avatars
    try {
      const res = await api.get('/avatars');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        // Merge backend list with local storage
        const backendAvatars = res.data.map((b: any) => ({
          ...b,
          avatar_type: b.avatar_type || '3D Digital Human',
          generation_status: b.generation_status || 'COMPLETED',
        }));
        setAvatars(backendAvatars);
      }
    } catch (err) {
      console.log('Using local workspace avatars.');
    }
  };

  useEffect(() => {
    loadAvatars();
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAvatarDeleted = (deletedId: string) => {
    setAvatars((prev) => prev.filter((a) => a.id !== deletedId));
    showNotification('Avatar and 3D assets permanently deleted.');
  };

  const handleSaveEdit = async () => {
    if (!editingAvatar) return;
    const updated = avatars.map((a) => {
      if (a.id === editingAvatar.id) {
        return { ...a, name: editName, description: editDesc };
      }
      return a;
    });

    setAvatars(updated);
    localStorage.setItem('avatars', JSON.stringify(updated));

    try {
      await api.put(`/avatars/${editingAvatar.id}`, {
        name: editName,
        description: editDesc,
      });
    } catch (e) {
      console.log('Updated in local session.');
    }

    setEditingAvatar(null);
    showNotification('Avatar details updated.');
  };

  const stats = [
    { name: 'Total 3D Avatars', value: `${avatars.length}`, icon: Cpu, change: 'Rigged humanoid digital teachers' },
    { name: 'AI Teacher Sessions', value: '18', icon: BookOpen, change: 'Interactive whiteboard lessons' },
    { name: 'Knowledge Bases', value: '3', icon: FileText, change: 'RAG vector embeddings' },
    { name: 'Phoneme Latency', value: '42ms', icon: Clock, change: 'Viseme blendshape lip-sync' },
    { name: 'Supported Languages', value: '6', icon: Users, change: 'EN, KN, TE, HI, TA, ML' },
    { name: 'Teacher Animations', value: '10', icon: Sparkles, change: 'Slerp-blended kinematic gestures' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col">
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-200 text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteAvatarModal
        isOpen={Boolean(deleteTarget)}
        avatar={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleAvatarDeleted}
      />

      {/* Edit Avatar Details Modal */}
      {editingAvatar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-dark-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-white">Edit Avatar Details</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Avatar Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingAvatar(null)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-grow space-y-10">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>3D Digital Human Ecosystem</span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              3D AI Teacher Dashboard
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Manage your created 3D digital human teachers, enter virtual classrooms, or inspect in 3D Avatar Studio.
            </p>
          </div>
          <Link
            to="/creator"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] self-start md:self-auto text-white"
          >
            <PlusCircle className="h-4 w-4" />
            Create 3D Avatar
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                    {stat.name}
                  </span>
                  <span className="text-3xl font-display font-extrabold block">
                    {stat.value}
                  </span>
                  <span className="text-xs text-neutral-500 block">
                    {stat.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Created Avatars Showcase Grid (Feature 7 & Feature 8) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-xl flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-400" />
              Created 3D Digital Humans & Teachers
            </h3>
            <Link to="/creator" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              Upload New Portrait Photo
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {avatars.map((av) => (
              <div
                key={av.id}
                className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all bg-gradient-to-b from-neutral-900/80 to-dark-950/80 group flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-4">
                  
                  {/* Avatar Thumbnail Image with Badges */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 group-hover:border-cyan-500/30 transition-colors">
                    <img
                      src={av.image_url || av.thumbnail_url || '/avatars/aurora_hologram.jpg'}
                      alt={av.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-dark-950/85 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono">
                        3D RIGGED
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-dark-950/85 border border-white/10 text-[10px] text-neutral-300 font-mono uppercase">
                        {av.language || av.language_code || 'EN'}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {av.generation_status || 'READY'}
                    </div>

                    {/* Date Badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] text-neutral-400 font-mono">
                      {av.created_at ? new Date(av.created_at).toLocaleDateString() : 'Active'}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                        {av.name}
                      </h4>
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAvatar(av);
                          setEditName(av.name);
                          setEditDesc(av.description || '');
                        }}
                        className="p-1 rounded-lg text-neutral-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
                        title="Edit Details"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {av.description || '3D Digital Human Teacher with Visemes & Classroom Animations'}
                    </p>
                  </div>
                </div>

                {/* Working Action Buttons (Feature 7 & Feature 8) */}
                <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    
                    {/* Action 1: Open 3D Studio */}
                    <Link
                      to={`/studio/${av.id}`}
                      className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>3D Studio</span>
                    </Link>

                    {/* Action 2: AI Teacher Mode */}
                    <Link
                      to={`/teacher/${av.id}`}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-brand-600/20 border border-cyan-400/40 hover:border-cyan-400 text-white font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                      <span>AI Teacher</span>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                    {/* Action 3: Talk Now */}
                    <Link
                      to={`/chat/${av.id}`}
                      className="flex-grow py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-300 text-center font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="h-3 w-3 text-neutral-400" />
                      <span>Talk Now</span>
                    </Link>

                    {/* Action 4: Delete Avatar (Feature 8) */}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(av)}
                      className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title={`Delete ${av.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Navigation Splits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 lg:col-span-1">
            <h3 className="font-display font-semibold text-lg border-b border-white/5 pb-2">
              Teaching Hub
            </h3>
            <div className="space-y-3">
              <Link
                to="/creator"
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/35 hover:bg-cyan-500/5 transition-colors group"
              >
                <div>
                  <h4 className="font-semibold text-sm">Create New 3D Teacher</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Upload portrait and generate 3D mesh</p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-cyan-400 transition-colors" />
              </Link>
              <Link
                to="/teacher/aurora-7"
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/35 hover:bg-cyan-500/5 transition-colors group"
              >
                <div>
                  <h4 className="font-semibold text-sm">Virtual Classroom</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Whiteboard teaching & 10 gesture animations</p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-cyan-400 transition-colors" />
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
