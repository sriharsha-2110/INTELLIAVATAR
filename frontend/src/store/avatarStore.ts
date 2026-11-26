import { create } from 'zustand';
import axios from 'axios';

export interface Avatar {
  id: string;
  _id?: string;
  name: string;
  photoUrl: string;
  modelUrl: string;
  modelFormat: 'glb' | 'gltf' | 'vrm';
  generationProvider: string;
  generationStatus: string;
  voice: string;
  language: string;
  teachingStyle: 'friendly' | 'professional' | 'storytelling' | 'step-by-step';
  createdAt?: string;
  description?: string;
}

interface AvatarState {
  avatars: Avatar[];
  demoAvatars: Avatar[];
  selectedAvatar: Avatar | null;
  loading: boolean;
  error: string | null;
  fetchAvatars: () => Promise<void>;
  selectAvatar: (avatar: Avatar) => void;
  deleteAvatar: (id: string) => Promise<void>;
  createFromDemo: (demoId: string, customName?: string) => Promise<Avatar | null>;
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

export const useAvatarStore = create<AvatarState>((set, get) => ({
  avatars: [],
  demoAvatars: [
    {
      id: 'teacher-michelle',
      name: 'Teacher Michelle (STEM & Computer Science)',
      photoUrl: '/avatars/demo_michelle.jpg',
      modelUrl: '/models/demo/michelle.glb',
      modelFormat: 'glb',
      generationProvider: 'prebuilt-licensed-demo',
      generationStatus: 'READY',
      voice: 'en-US-JennyNeural',
      language: 'en',
      teachingStyle: 'friendly',
      description: 'Professional STEM & Computer Science teacher with full humanoid skeletal rig and natural idle animations.',
    },
    {
      id: 'professor-alex',
      name: 'Professor Alex (Algorithms & Mathematics)',
      photoUrl: '/avatars/demo_alex.jpg',
      modelUrl: '/models/demo/xbot.glb',
      modelFormat: 'glb',
      generationProvider: 'prebuilt-licensed-demo',
      generationStatus: 'READY',
      voice: 'en-US-GuyNeural',
      language: 'en',
      teachingStyle: 'step-by-step',
      description: 'Academic educator with rigged humanoid skeleton and classroom teaching postures.',
    },
    {
      id: 'teacher-vrm',
      name: 'Dr. Akira (VRM Digital Human)',
      photoUrl: '/avatars/demo_vrm.jpg',
      modelUrl: '/models/demo/avatar_vrm.vrm',
      modelFormat: 'vrm',
      generationProvider: 'prebuilt-licensed-demo',
      generationStatus: 'READY',
      voice: 'en-US-AriaNeural',
      language: 'en',
      teachingStyle: 'professional',
      description: 'Next-generation VRM humanoid digital human with standardized facial blendshapes and bone constraints.',
    },
  ],
  selectedAvatar: null,
  loading: false,
  error: null,

  fetchAvatars: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_BASE}/avatars`);
      if (res.data?.avatars) {
        set({
          avatars: res.data.avatars,
          demoAvatars: res.data.demoAvatars?.length ? res.data.demoAvatars : get().demoAvatars,
          selectedAvatar: get().selectedAvatar || res.data.avatars[0] || get().demoAvatars[0],
          loading: false,
        });
        return;
      }
    } catch (err) {
      console.warn('Backend avatars endpoint not reachable, using local licensed demo avatars.');
    }

    // Default to demo avatars
    const demos = get().demoAvatars;
    set({
      avatars: demos,
      selectedAvatar: get().selectedAvatar || demos[0],
      loading: false,
    });
  },

  selectAvatar: (avatar: Avatar) => {
    set({ selectedAvatar: avatar });
  },

  deleteAvatar: async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/avatars/${id}`);
    } catch (err) {
      console.warn('Deleted locally.');
    }

    set((state) => ({
      avatars: state.avatars.filter((a) => a.id !== id && a._id !== id),
      selectedAvatar: state.selectedAvatar?.id === id ? state.avatars[0] || null : state.selectedAvatar,
    }));
  },

  createFromDemo: async (demoId: string, customName?: string) => {
    const demo = get().demoAvatars.find((d) => d.id === demoId);
    if (!demo) return null;

    try {
      const res = await axios.post(`${API_BASE}/avatars/generate`, {
        selectedDemoId: demoId,
        name: customName || demo.name,
      });

      if (res.data?.avatar) {
        const created = res.data.avatar;
        set((state) => ({
          avatars: [created, ...state.avatars],
          selectedAvatar: created,
        }));
        return created;
      }
    } catch (err) {
      console.warn('Backend generate call error, creating client avatar instance.');
    }

    const localCreated: Avatar = {
      ...demo,
      id: `av_${Date.now()}`,
      name: customName || demo.name,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      avatars: [localCreated, ...state.avatars],
      selectedAvatar: localCreated,
    }));
    return localCreated;
  },
}));
