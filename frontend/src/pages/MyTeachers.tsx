import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AvatarCanvas from '../features/three/AvatarCanvas';
import { useAvatarStore, Avatar } from '../store/avatarStore';
import { 
  Users, PlusCircle, Video, Trash2, Edit3, Eye, 
  ShieldCheck, X, Check, AlertTriangle, Sparkles 
} from 'lucide-react';

export default function MyTeachers() {
  const { avatars, fetchAvatars, selectAvatar, deleteAvatar } = useAvatarStore();
  
  // Modals state
  const [previewTarget, setPreviewTarget] = useState<Avatar | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Avatar | null>(null);
  const [editTarget, setEditTarget] = useState<Avatar | null>(null);
  const [editName, setEditName] = useState('');
  const [editStyle, setEditStyle] = useState<'friendly' | 'professional' | 'storytelling' | 'step-by-step'>('professional');

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteAvatar(deleteTarget.id || deleteTarget._id || '');
    setDeleteTarget(null);
  };

  const openEdit = (av: Avatar) => {
    setEditTarget(av);
    setEditName(av.name);
    setEditStyle(av.teachingStyle || 'professional');
  };

  const saveEdit = () => {
    if (!editTarget) return;
    editTarget.name = editName;
    editTarget.teachingStyle = editStyle;
    setEditTarget(null);
  };

  return (
    <div className="min-h-screen bg-[#0c0f17] text-white flex flex-col">
      <Navbar />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Delete 3D Teacher</h3>
                <p className="text-xs text-neutral-400">This will remove the teacher and its 3D avatar configuration.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-white/5 font-mono">
              Confirm deletion of: <span className="text-cyan-300 font-bold">{deleteTarget.name}</span>
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Settings Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white">Edit Teacher Settings</h3>
              <button onClick={() => setEditTarget(null)} className="text-neutral-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Teacher Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Teaching Style</label>
                <select
                  value={editStyle}
                  onChange={(e) => setEditStyle(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="friendly">Friendly Teacher</option>
                  <option value="professional">Professional Teacher</option>
                  <option value="storytelling">Storytelling Teacher</option>
                  <option value="step-by-step">Step-by-Step Teacher</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Model Quick Preview Modal */}
      {previewTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white">{previewTarget.name}</h3>
                <p className="text-[11px] text-neutral-400">Interactive 3D Preview • Rotate & Zoom</p>
              </div>
              <button onClick={() => setPreviewTarget(null)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-[420px] rounded-2xl overflow-hidden border border-white/10">
              <AvatarCanvas
                modelUrl={previewTarget.modelUrl}
                voice={previewTarget.voice}
                language={previewTarget.language}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewTarget(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Users className="h-3.5 w-3.5" />
              <span>Faculty Directory</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">My 3D Virtual Teachers</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select any rigged 3D educator to enter virtual classrooms or customize teaching pedagogical parameters.
            </p>
          </div>

          <Link
            to="/create"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-xs font-semibold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25 self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Teacher</span>
          </Link>
        </div>

        {/* Teachers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {avatars.map((av) => (
            <div
              key={av.id || av._id}
              className="p-5 rounded-3xl bg-neutral-900/70 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-xl space-y-4 group"
            >
              <div className="space-y-3.5">
                {/* Photo Thumbnail */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 group-hover:border-cyan-500/30 transition-colors">
                  <img
                    src={av.photoUrl || '/avatars/demo_michelle.jpg'}
                    alt={av.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-neutral-950/85 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono">
                      {av.modelFormat?.toUpperCase() || 'GLB'} 3D
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-950/85 border border-white/10 text-[10px] text-neutral-300 font-mono uppercase">
                      {av.language || 'EN'}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>READY</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                    {av.name}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {av.description || 'Rigged 3D digital human teacher with skeletal motions, visemes, and whiteboard synchronization.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    to="/teaching"
                    onClick={() => selectAvatar(av)}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600/30 to-cyan-500/30 border border-cyan-400/40 hover:border-cyan-400 text-white font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Video className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Open Teacher</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setPreviewTarget(av)}
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-200 font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>3D Preview</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => openEdit(av)}
                    className="flex-grow py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-center font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit3 className="h-3 w-3 text-neutral-400" />
                    <span>Edit Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(av)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Teacher"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
