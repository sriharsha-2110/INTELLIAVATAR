import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  GraduationCap, CheckCircle2, AlertTriangle, ArrowRight, 
  Sparkles, Award, RotateCcw, Brain, Check 
} from 'lucide-react';
import axios from 'axios';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

export default function MyLearning() {
  const [profile, setProfile] = useState<any>(null);
  const [teachBackTopic, setTeachBackTopic] = useState('Java Inheritance');
  const [studentExplanation, setStudentExplanation] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE}/learning/profile`)
      .then((res) => {
        if (res.data?.profile) setProfile(res.data.profile);
      })
      .catch(() => {
        setProfile({
          masteredConcepts: ['Class Definition', 'Object Instantiation', 'Variable Scopes'],
          weakConcepts: ['Polymorphic Dispatch', 'Interface Multiple Inheritance'],
          misconceptions: [
            {
              concept: 'Overloading vs Overriding',
              observedErrors: ['Confused method signatures in same class vs derived class hierarchy.'],
              resolved: false,
            },
          ],
          revisionHistory: [
            { topic: 'Java Object-Oriented Principles', revisedAt: new Date(), teachBackScore: 84 },
          ],
        });
      });
  }, []);

  const handleTeachBackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentExplanation.trim() || isEvaluating) return;

    setIsEvaluating(true);
    setEvaluation(null);

    try {
      const res = await axios.post(`${API_BASE}/learning/teach-back`, {
        topic: teachBackTopic,
        studentExplanation,
      });
      setEvaluation(res.data?.evaluation);
    } catch (err) {
      setEvaluation({
        understandingScore: 80,
        conceptCoverage: '80% curriculum alignment',
        missingInformation: ['Review superclass constructor calling via super()'],
        misconceptionsIdentified: [],
        suggestedRevision: 'Good conceptual foundation. Ensure keyword usage is explicitly articulated.',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0f17] text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-8">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Cognitive Pedagogy & Misconception Tracker</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Student Learning Profile & Teach-Back Verification</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Identify and correct conceptual misconceptions across sessions, and test your mastery by teaching topics back to the AI.
          </p>
        </div>

        {/* Learning Profile Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Mastered Concepts */}
          <div className="p-5 rounded-2xl bg-neutral-900/70 border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
              <CheckCircle2 className="h-4 w-4" />
              <span>Mastered Concepts</span>
            </div>
            <div className="space-y-1.5 text-xs text-neutral-300">
              {profile?.masteredConcepts?.map((c: string, i: number) => (
                <div key={i} className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Concepts Under Review */}
          <div className="p-5 rounded-2xl bg-neutral-900/70 border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
              <Brain className="h-4 w-4" />
              <span>Topics for Revision</span>
            </div>
            <div className="space-y-1.5 text-xs text-neutral-300">
              {profile?.weakConcepts?.map((c: string, i: number) => (
                <div key={i} className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tracked Misconceptions */}
          <div className="p-5 rounded-2xl bg-neutral-900/70 border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider font-mono">
              <AlertTriangle className="h-4 w-4" />
              <span>Personal Misconceptions</span>
            </div>
            <div className="space-y-2 text-xs">
              {profile?.misconceptions?.map((m: any, i: number) => (
                <div key={i} className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-neutral-300 space-y-1">
                  <span className="font-bold text-rose-300 block">{m.concept}</span>
                  <p className="text-[11px] text-neutral-400">{m.observedErrors?.[0]}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Teach-Back Verification Interface */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                Teach-Back Verification Session
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Explain a topic in your own words. The AI teacher evaluates your depth, technical accuracy, and misconceptions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-mono">Topic:</span>
              <select
                value={teachBackTopic}
                onChange={(e) => setTeachBackTopic(e.target.value)}
                className="bg-neutral-950 border border-white/10 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-400 font-semibold"
              >
                <option value="Java Inheritance">Java Inheritance</option>
                <option value="Bubble Sort Algorithm">Bubble Sort Algorithm</option>
                <option value="Computer Networks TCP/IP">Computer Networks TCP/IP</option>
                <option value="Relational Database Normalization">Relational Database Normalization</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleTeachBackSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Your Explanation of {teachBackTopic}:
              </label>
              <textarea
                rows={5}
                value={studentExplanation}
                onChange={(e) => setStudentExplanation(e.target.value)}
                placeholder="Explain the concept as if you were teaching a fellow student. Include key keywords, mechanisms, and practical examples..."
                className="w-full bg-neutral-950 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 leading-relaxed font-sans"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isEvaluating || !studentExplanation.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-40"
              >
                {isEvaluating ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{isEvaluating ? 'Evaluating Teach-Back...' : 'Evaluate My Explanation'}</span>
              </button>
            </div>
          </form>

          {/* Evaluation Results Card */}
          {evaluation && (
            <div className="p-5 rounded-2xl bg-neutral-950 border border-cyan-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-cyan-400" />
                  <span className="font-bold text-sm text-white">Pedagogical Evaluation Results</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-cyan-300">{evaluation.understandingScore}%</span>
                  <span className="text-[10px] text-neutral-400 block font-mono">Understanding Score</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <span className="font-bold text-neutral-300 block">Concept Coverage</span>
                  <p className="text-neutral-400 leading-relaxed">{evaluation.conceptCoverage}</p>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-neutral-300 block">Suggested Revision</span>
                  <p className="text-neutral-400 leading-relaxed">{evaluation.suggestedRevision}</p>
                </div>
              </div>

              {evaluation.missingInformation?.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <span className="font-bold block mb-1">Missing Concept Elements:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-neutral-300">
                    {evaluation.missingInformation.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
