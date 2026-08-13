import { useState } from 'react';
import Navbar from '../components/Navbar';
import { ShieldCheck, ToggleLeft, ToggleRight, List, Cpu, FileSpreadsheet, Lock } from 'lucide-react';

export default function AdminPanel() {
  // Feature flags
  const [flags, setFlags] = useState<any>({
    ENABLE_RAG: true,
    ENABLE_MEMORY: true,
    ENABLE_VISION: false,
    ENABLE_AVATAR_TO_AVATAR: false,
    ENABLE_SIGN_LANGUAGE: false,
    ENABLE_ENTERPRISE: true,
    ENABLE_ANALYTICS: true,
  });

  const toggleFlag = (flagName: string) => {
    setFlags((prev: any) => ({
      ...prev,
      [flagName]: !prev[flagName],
    }));
  };

  const auditLogs = [
    { id: '1', user: 'admin@school.edu', action: 'CREATE_AVATAR', resource: 'Prof. Ananth', ip: '192.168.1.45', time: '10 mins ago' },
    { id: '2', user: 'editor@support.com', action: 'UPLOAD_RAG_DOC', resource: 'Policy_Leave.pdf', ip: '10.0.0.12', time: '1 hour ago' },
    { id: '3', user: 'admin@school.edu', action: 'DELETE_MEMORY', resource: 'User preferences', ip: '192.168.1.45', time: '3 hours ago' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-grow space-y-10">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-brand-500" />
            Administration & Governance
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage system-wide feature flags, model settings, security settings, and inspect organization audit logs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feature Flags Configuration */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 lg:col-span-1">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2 border-b border-white/5 pb-2">
              <Cpu className="h-5 w-5 text-brand-400" />
              Feature Flags Configuration
            </h3>
            <div className="space-y-4">
              {Object.keys(flags).map((flag) => (
                <div key={flag} className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-semibold block">{flag}</span>
                    <span className="text-[10px] text-neutral-500">
                      {flag === 'ENABLE_RAG' ? 'Allow document indexing retrieval' : 'Control system availability'}
                    </span>
                  </div>
                  <button onClick={() => toggleFlag(flag)} className="text-neutral-400 hover:text-white transition-colors">
                    {flags[flag] ? (
                      <ToggleRight className="h-8 w-8 text-brand-500" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-neutral-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* System Audit Logs & Data Security */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 lg:col-span-2">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2 border-b border-white/5 pb-2">
              <FileSpreadsheet className="h-5 w-5 text-purple-400" />
              Security Audit Trails
            </h3>

            {/* Security Isolation Alert */}
            <div className="flex gap-3 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl text-xs text-neutral-300">
              <Lock className="h-5 w-5 text-purple-400 shrink-0" />
              <div>
                <strong>Strict Tenant Isolation:</strong> Every query, message log, and file chunk is scoped by <code>organization_id</code> and hashed keys. Unauthorized cross-tenant data requests trigger automatic session invalidation.
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3.5 bg-neutral-950/40 border border-white/5 rounded-xl text-xs">
                  <div className="space-y-1">
                    <span className="font-semibold text-neutral-200 block">
                      {log.action} : {log.resource}
                    </span>
                    <div className="flex gap-2 text-[10px] text-neutral-400 font-mono">
                      <span>By: {log.user}</span>
                      <span>•</span>
                      <span>IP: {log.ip}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-500">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
