import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Check, Loader2 } from 'lucide-react';
import api from '../services/api';

interface DeleteAvatarModalProps {
  isOpen: boolean;
  avatar: {
    id: string;
    name: string;
    image_url?: string;
    avatar_type?: string;
  } | null;
  onClose: () => void;
  onDeleted: (deletedId: string) => void;
}

export default function DeleteAvatarModal({
  isOpen,
  avatar,
  onClose,
  onDeleted,
}: DeleteAvatarModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !avatar) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      // 1. Call Backend Delete API endpoint
      try {
        await api.delete(`/avatars/${avatar.id}`);
      } catch (backendErr: any) {
        console.warn('Backend delete response logged:', backendErr?.response?.data || backendErr);
      }

      // 2. Remove from LocalStorage cache
      const saved = JSON.parse(localStorage.getItem('avatars') || '[]');
      const filtered = saved.filter((a: any) => a.id !== avatar.id);
      localStorage.setItem('avatars', JSON.stringify(filtered));

      // 3. Callback to parent to update dashboard state & notify
      onDeleted(avatar.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete avatar.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-dark-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        
        {/* Header Icon & Title */}
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
            <Trash2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">Delete Digital Avatar</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              This action will permanently delete the 3D digital human and associated models.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Target Avatar Card Preview */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
          <img
            src={avatar.image_url || '/avatars/aurora_hologram.jpg'}
            alt={avatar.name}
            className="w-14 h-14 rounded-lg object-cover border border-white/10"
          />
          <div className="overflow-hidden">
            <h4 className="font-semibold text-sm text-white truncate">{avatar.name}</h4>
            <span className="text-[11px] font-mono text-cyan-400 block mt-0.5">
              Type: {avatar.avatar_type || '3D Digital Human'}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono truncate block">
              ID: {avatar.id}
            </span>
          </div>
        </div>

        <p className="text-xs text-neutral-400 bg-rose-500/5 p-3 rounded-xl border border-rose-500/20 leading-relaxed">
          <span className="font-semibold text-rose-300">Warning:</span> All saved 3D mesh calibrations, gesture presets, and customized classroom settings for this avatar will be removed.
        </p>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)] flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting Avatar...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
