import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  Settings as SettingsIcon, Server, Database, Cloud, 
  Cpu, Mic, ShieldCheck, CheckCircle2, AlertTriangle, Key, ExternalLink 
} from 'lucide-react';
import axios from 'axios';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

export default function Settings() {
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE.replace('/api', '')}/health`)
      .then((res) => setHealthStatus(res.data))
      .catch(() => setHealthStatus({ status: 'offline', service: 'intelliavatar-backend' }));
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0f17] text-white flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-6">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <SettingsIcon className="h-3.5 w-3.5" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">System Settings & Deployment</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Overview of modular backend providers, database connections, and Render deployment parameters.
          </p>
        </div>

        {/* Backend Health Status */}
        <div className="p-5 rounded-2xl bg-neutral-900/70 border border-white/10 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border ${
              healthStatus?.status === 'ok' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              <Server className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Backend Web Service</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  healthStatus?.status === 'ok' 
                    ? 'bg-emerald-500/20 text-emerald-300' 
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {healthStatus?.status === 'ok' ? 'HEALTHY' : 'CONNECTING'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                Version: 2.0.0 • Service: intelliavatar-backend
              </p>
            </div>
          </div>

          <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
            Endpoint: GET /health
          </span>
        </div>

        {/* Modular Provider Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 3D Generation Provider */}
          <div className="p-5 rounded-2xl bg-neutral-900/70 border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <h4 className="font-bold text-xs text-white">Image-to-3D Provider</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-400 text-[10px] font-mono">
                Avatar SDK / MetaPerson
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              When an API key is configured, photographs are converted into rigged 3D models. When unconfigured, the application seamlessly activates the licensed 3D Demo Gallery (Michelle, Alex, VRM).
            </p>
            <div className="text-[10px] text-neutral-500 font-mono">Env: AVATAR_PROVIDER_API_KEY</div>
          </div>

          {/* AI LLM Provider */}
          <div className="p-5 rounded-2xl bg-neutral-900/70 border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-indigo-400" />
                <h4 className="font-bold text-xs text-white">AI Pedagogical Engine</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-400 text-[10px] font-mono">
                Gemini 1.5 Flash / OpenAI
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Synthesizes educational explanations, concept visual demonstrations, and misconception tracking with multilingual technical term preservation.
            </p>
            <div className="text-[10px] text-neutral-500 font-mono">Env: GEMINI_API_KEY or OPENAI_API_KEY</div>
          </div>

          {/* Database */}
          <div className="p-5 rounded-2xl bg-neutral-900/70 border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-400" />
                <h4 className="font-bold text-xs text-white">Database Persistence</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-400 text-[10px] font-mono">
                MongoDB Atlas / Mongoose
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Persists user profiles, created avatars, conversations, documents, and student misconception history across sessions.
            </p>
            <div className="text-[10px] text-neutral-500 font-mono">Env: MONGODB_URI</div>
          </div>

          {/* Storage */}
          <div className="p-5 rounded-2xl bg-neutral-900/70 border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-emerald-400" />
                <h4 className="font-bold text-xs text-white">Media Asset Cloud</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-400 text-[10px] font-mono">
                Cloudinary Storage
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Stores original photographs, thumbnails, and model assets with high availability. Falls back to local static serving when unconfigured.
            </p>
            <div className="text-[10px] text-neutral-500 font-mono">Env: CLOUDINARY_CLOUD_NAME</div>
          </div>

        </div>

        {/* Render Deployment Summary */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Render.com One-Click Deployment Configuration</h3>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            The project includes a root <code className="text-cyan-300 bg-neutral-950 px-2 py-0.5 rounded font-mono">render.yaml</code> blueprint configured for independent deployment:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/5 space-y-1">
              <span className="text-cyan-300 font-bold block">Frontend (Static Site)</span>
              <div className="text-neutral-400 text-[11px]">Build: npm install && npm run build</div>
              <div className="text-neutral-400 text-[11px]">Publish: dist</div>
              <div className="text-neutral-400 text-[11px]">SPA Rewrite: /* → /index.html</div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/5 space-y-1">
              <span className="text-cyan-300 font-bold block">Backend (Web Service)</span>
              <div className="text-neutral-400 text-[11px]">Build: npm install && npm run build</div>
              <div className="text-neutral-400 text-[11px]">Start: npm start</div>
              <div className="text-neutral-400 text-[11px]">Health Check: GET /health</div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
