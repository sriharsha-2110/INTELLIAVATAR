import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { User, MessageSquare, BookOpen, Clock, Heart, Users, FileText, PlusCircle, Settings, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { name: 'Total Avatars', value: '2', icon: User, change: '1 created this month' },
    { name: 'Active Conversations', value: '24', icon: MessageSquare, change: '+12% from last week' },
    { name: 'Knowledge Bases', value: '3', icon: FileText, change: '14 documents uploaded' },
    { name: 'Avg. Latency', value: '0.45s', icon: Clock, change: 'Edge-TTS + Mock animation' },
    { name: 'User Satisfaction', value: '94%', icon: Heart, change: 'Feedback-driven rating' },
    { name: 'Supported Languages', value: '6', icon: Users, change: 'EN, KN, TE, HI, TA, ML' },
  ];

  const recentConversations = [
    { id: '1', avatarName: 'Prof. Ananth (DL)', date: 'Today, 2:30 PM', preview: 'CNN layer shapes explanation', language: 'Kannada' },
    { id: '2', avatarName: 'Customer Support Bot', date: 'Yesterday, 11:15 AM', preview: 'Leave policy search response', language: 'English' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-grow space-y-10">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Welcome back to your Workspace
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Select an action to launch or configure your conversational digital avatars.
            </p>
          </div>
          <Link
            to="/creator"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold text-sm transition-all hover:shadow-[0_0_15px_rgba(59,102,255,0.3)] self-start md:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            Create Avatar
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
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

        {/* Dynamic content splits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 lg:col-span-1">
            <h3 className="font-display font-semibold text-lg border-b border-white/5 pb-2">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/creator"
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/35 hover:bg-brand-500/5 transition-colors group"
              >
                <div>
                  <h4 className="font-semibold text-sm">Avatar Studio</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Design a new face and voice</p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-brand-400 transition-colors" />
              </Link>
              <Link
                to="/tutor"
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/35 hover:bg-brand-500/5 transition-colors group"
              >
                <div>
                  <h4 className="font-semibold text-sm">IntelliTutor Mode</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Study with custom DL syllabus</p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-brand-400 transition-colors" />
              </Link>
              <Link
                to="/talk-to-pdf"
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/35 hover:bg-brand-500/5 transition-colors group"
              >
                <div>
                  <h4 className="font-semibold text-sm">Talk to Documents</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Vector query legal and HR docs</p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-brand-400 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 lg:col-span-2">
            <h3 className="font-display font-semibold text-lg border-b border-white/5 pb-2">
              Recent Conversations
            </h3>
            <div className="divide-y divide-white/5 space-y-3">
              {recentConversations.map((chat) => (
                <div key={chat.id} className="flex items-center justify-between pt-3 first:pt-0 group">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm group-hover:text-brand-400 transition-colors">
                      {chat.avatarName}
                    </h4>
                    <p className="text-xs text-neutral-400 italic">
                      "{chat.preview}"
                    </p>
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] bg-brand-500/15 border border-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded">
                        {chat.language}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {chat.date}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/chat/${chat.id}`}
                    className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-brand-500/50 hover:bg-brand-500/5 text-xs font-semibold transition-colors"
                  >
                    Open Chat
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
