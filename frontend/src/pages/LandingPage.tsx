import { Link } from 'react-router-dom';
import { Cpu, Languages, Heart, Database, ShieldCheck, ArrowRight, Play } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col justify-between overflow-x-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2">
          <Cpu className="h-6 w-6 text-brand-500" />
          <span className="font-display font-bold text-xl tracking-wider bg-gradient-to-r from-white to-brand-400 bg-clip-text text-transparent">
            INTELLIAVATAR
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium hover:text-brand-400 transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-sm font-semibold transition-all hover:shadow-[0_0_15px_rgba(59,102,255,0.4)]"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 md:py-24 flex flex-col lg:flex-row items-center gap-12 relative z-10 flex-grow">
        {/* Left column: Text */}
        <div className="flex-1 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-xs text-brand-400 font-semibold uppercase tracking-wider">
            <span>🚀 Version 1.0 Live</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Meet Your <br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-purple-400 bg-clip-text text-transparent">
              AI Human.
            </span>
          </h1>

          <p className="text-neutral-400 text-lg md:text-xl leading-relaxed max-w-xl">
            Create multilingual, emotion-aware conversational avatars that can see, speak, remember and understand. Optimized for education, support, and coaching.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold flex items-center gap-2 group transition-all hover:shadow-[0_0_20px_rgba(59,102,255,0.4)]"
            >
              Create Avatar
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl border border-white/10 hover:border-brand-500/50 hover:bg-white/5 font-semibold flex items-center gap-2 transition-all"
            >
              <Play className="h-4 w-4 text-brand-400 fill-brand-400/20" />
              Try Demo
            </Link>
          </div>
        </div>

        {/* Right column: Interactive Preview Area */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center">
          <div className="relative w-full aspect-square max-w-[450px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-tr from-brand-950/40 to-purple-950/40 p-4 group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-950/40 to-dark-950 pointer-events-none z-10" />

            {/* Glowing orb backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-brand-500/20 rounded-full blur-[60px] group-hover:bg-brand-500/35 transition-colors duration-700" />

            {/* Simulated Digital Human Frame */}
            <div className="w-full h-full rounded-2xl border border-white/5 bg-neutral-900/60 overflow-hidden flex flex-col items-center justify-center relative">
              {/* Dynamic waveform avatar mockup visual */}
              <div className="w-24 h-24 rounded-full border-2 border-brand-500/50 flex items-center justify-center relative mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <Cpu className="h-10 w-10 text-brand-400" />
              </div>
              <p className="font-display font-medium text-lg tracking-wide text-neutral-200">
                AI Avatar Ready
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-[240px] text-center">
                Supports English, Kannada, Telugu, Hindi, Tamil & Malayalam
              </p>

              {/* Fake speech captions */}
              <div className="absolute bottom-6 left-6 right-6 p-3 rounded-xl bg-dark-950/70 border border-white/5 backdrop-blur-md text-xs text-neutral-300 text-center">
                "Hello, I am your intelligent tutor. How can I help you study today?"
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="border-t border-white/5 bg-dark-950/50 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-brand-500/20 transition-colors">
              <Languages className="h-8 w-8 text-brand-400 mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">Multilingual Speech</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                ASR & TTS support in English, Kannada, Telugu, Hindi, Tamil, and Malayalam with code-switching.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-brand-500/20 transition-colors">
              <Heart className="h-8 w-8 text-purple-400 mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">Emotion Integration</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Avatars adapt facial expressions, speak speeds, and tones dynamically to user emotions.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-brand-500/20 transition-colors">
              <Database className="h-8 w-8 text-emerald-400 mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">Grounded RAG</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Ground the conversations in custom uploaded PDFs/syllabus. Supports detailed doc references.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-brand-500/20 transition-colors">
              <ShieldCheck className="h-8 w-8 text-cyan-400 mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">Abuse Prevention</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Active safety consent, watermarks, data deletion rights, and role-based isolated organizations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-neutral-500 relative z-10">
        <p>&copy; 2026 IntelliAvatar. All rights reserved. CSE Final Year Project.</p>
      </footer>
    </div>
  );
}
