import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AvatarCanvas from '../features/three/AvatarCanvas';
import { useAvatarStore } from '../store/avatarStore';
import { useAuthStore } from '../store/authStore';
import { 
  PlusCircle, Video, Users, BookOpen, GraduationCap, 
  Sparkles, ArrowRight, ShieldCheck, Cpu, Play
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { avatars, selectedAvatar, fetchAvatars, selectAvatar } = useAvatarStore();

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  const active = selectedAvatar || avatars[0];

  return (
    <div className="min-h-screen bg-[#0c0f17] text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-8">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>INTELLIAVATAR 2.0 • 3D DIGITAL HUMAN TEACHER PLATFORM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Educator'}!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
              Conduct immersive interactive lectures with genuine rigged 3D human teachers, real-time viseme lip synchronization, and synchronized concept visual demonstrations.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <Link
              to="/create"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 font-semibold text-xs text-white flex items-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create New Teacher</span>
            </Link>
            <Link
              to="/teaching"
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-xs text-neutral-200 flex items-center gap-2 transition-all"
            >
              <Video className="h-4 w-4 text-cyan-400" />
              <span>Enter Teaching Room</span>
            </Link>
          </div>

          {/* Decorative ambient background orb */}
          <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active 3D Teachers', value: avatars.length || 3, icon: Users, color: 'text-indigo-400' },
            { label: 'Supported Languages', value: '6 Indian & Global', icon: Cpu, color: 'text-cyan-400' },
            { label: 'Interactive Whiteboards', value: '5 Live Concept Demos', icon: Sparkles, color: 'text-purple-400' },
            { label: 'Pedagogical Accuracy', value: '100% Rigged 3D', icon: ShieldCheck, color: 'text-emerald-400' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 flex items-center gap-3.5 shadow-lg">
                <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 uppercase font-mono tracking-wider block">{stat.label}</span>
                  <span className="text-lg font-bold text-white block mt-0.5">{stat.value}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Stage & Teacher Showcase (7 Cols 3D Stage / 5 Cols Roster & Quick Launch) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* 3D Interactive Stage Preview (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Live 3D Teacher Studio</h3>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">
                Click & drag to rotate in 3D • Scroll to zoom
              </span>
            </div>

            <div className="h-[440px] rounded-2xl overflow-hidden shadow-2xl relative border border-white/10">
              {active ? (
                <AvatarCanvas
                  key={active.id || active._id}
                  modelUrl={active.modelUrl}
                  gesture="idle"
                  voice={active.voice}
                  language={active.language}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                  Loading 3D Teacher Canvas...
                </div>
              )}
            </div>
          </div>

          {/* Teacher Selector & Fast Launch (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-white">Available 3D Teachers</h3>
                <Link to="/teachers" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                  <span>View All</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {avatars.slice(0, 3).map((av) => {
                  const isSelected = (active?.id === av.id || active?._id === av._id);
                  return (
                    <div
                      key={av.id || av._id}
                      onClick={() => selectAvatar(av)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-950/70 to-slate-900 border-cyan-400/60 shadow-lg shadow-cyan-500/10'
                          : 'bg-neutral-900/60 border-white/5 hover:border-white/20 hover:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-950 border border-white/10 shrink-0">
                          <img
                            src={av.photoUrl || '/avatars/demo_michelle.jpg'}
                            alt={av.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{av.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400 font-mono">
                            <span className="text-cyan-300 uppercase">{av.modelFormat || 'GLB'} 3D</span>
                            <span>•</span>
                            <span className="capitalize">{av.teachingStyle || 'Professional'}</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/teaching"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAvatar(av);
                        }}
                        className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500 hover:text-black border border-cyan-500/30 transition-all"
                        title="Start Teaching Session"
                      >
                        <Video className="h-4 w-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Teaching Room Quick Action Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-purple-950/30 to-slate-900 border border-indigo-500/30 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Full Teaching Room</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Live student Q&A, interactive whiteboard, speech synthesis, and 5 visual concepts.
                  </p>
                </div>
                <Link
                  to="/teaching"
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-400 transition-colors shadow-md"
                >
                  <Play className="h-3 w-3 fill-black" />
                  <span>Launch</span>
                </Link>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
