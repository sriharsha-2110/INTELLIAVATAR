import { useState } from 'react';
import Navbar from '../components/Navbar';
import { BookOpen, Upload, Award, PlayCircle, HelpCircle, FileText, CheckCircle, RefreshCw, BarChart2 } from 'lucide-react';

export default function AITutor() {
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [syllabusName, setSyllabusName] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('Upload syllabus notes to initialize lessons');
  const [tutorMode, setTutorMode] = useState<'lecture' | 'quiz' | 'viva'>('lecture');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  // Simulation topics
  const topics = [
    { name: 'Introduction to CNNs', progress: '100%', completed: true },
    { name: 'Convolutional & Pooling Layers', progress: '60%', completed: false },
    { name: 'Feature Map Dimensions Calculation', progress: '0%', completed: false },
    { name: 'Famous Architectures (AlexNet, ResNet)', progress: '0%', completed: false },
  ];

  const handleUploadSyllabus = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSyllabusName(file.name);
      setCurrentStatus('Syllabus processed. Ready for adaptive learning flow.');
    }
  };

  const handleGenerateQuiz = () => {
    setTutorMode('quiz');
    setCurrentStatus('Quiz generated based on Deep Learning syllabus.');
    setQuizQuestions([
      { q: '1. What is the main purpose of pooling layers in a CNN?', options: ['Reduce resolution and parameters', 'Increase training speed', 'Add non-linearity'], ans: 0 },
      { q: '2. Which activation function is commonly used in hidden layers of CNNs?', options: ['Sigmoid', 'ReLU', 'Tanh'], ans: 1 },
    ]);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Syllabus & Progress (1/3) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Syllabus Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-brand-400">
              <BookOpen className="h-5 w-5" />
              IntelliTutor Configuration
            </h3>

            {/* Syllabus Upload */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Upload Notes / Syllabus (PDF)
              </label>
              <div className="border border-dashed border-white/10 hover:border-brand-500/50 rounded-xl p-4 text-center cursor-pointer relative bg-neutral-900/60 transition-colors">
                <Upload className="h-6 w-6 text-neutral-500 mx-auto mb-2" />
                <span className="text-xs text-neutral-400 block truncate">
                  {syllabusName || 'Click to select PDF notes'}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleUploadSyllabus}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Adaptive Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-xl focus:border-brand-500 text-sm outline-none text-white"
              >
                <option value="beginner">Beginner (Simple summaries & analogies)</option>
                <option value="intermediate">Intermediate (Formulae, architectures)</option>
                <option value="advanced">Advanced (Backpropagation, custom math)</option>
              </select>
            </div>

            {/* Status info */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-400">
              <span className="font-semibold text-neutral-300">Status: </span>
              {currentStatus}
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-display font-semibold text-md flex items-center gap-2">
              <BarChart2 className="h-4.5 w-4.5 text-brand-400" />
              Syllabus Study Path
            </h3>
            <div className="space-y-3">
              {topics.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-neutral-950/40 rounded-xl border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-neutral-200 block">{t.name}</span>
                    <span className="text-[10px] text-neutral-400">Progress: {t.progress}</span>
                  </div>
                  {t.completed ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-white/20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Columns: Interactive Tutoring Hub (2/3) */}
        <div className="lg:col-span-2 flex flex-col bg-neutral-900/30 border border-white/5 rounded-2xl overflow-hidden min-h-[400px]">
          {/* Header Action bar */}
          <div className="p-4 border-b border-white/5 bg-dark-950/40 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => { setTutorMode('lecture'); setCurrentStatus('Lecture mode active.'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  tutorMode === 'lecture' ? 'bg-brand-600 text-white' : 'hover:bg-white/5 text-neutral-400'
                }`}
              >
                <PlayCircle className="h-4 w-4" />
                Lecture Mode
              </button>
              <button
                onClick={handleGenerateQuiz}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  tutorMode === 'quiz' ? 'bg-brand-600 text-white' : 'hover:bg-white/5 text-neutral-400'
                }`}
              >
                <HelpCircle className="h-4 w-4" />
                Adaptive Quiz
              </button>
              <button
                onClick={() => { setTutorMode('viva'); setCurrentStatus('Viva examiner activated.'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  tutorMode === 'viva' ? 'bg-brand-600 text-white' : 'hover:bg-white/5 text-neutral-400'
                }`}
              >
                <Award className="h-4 w-4" />
                Viva Exam
              </button>
            </div>
          </div>

          {/* Main workspace panels */}
          <div className="flex-grow p-6 flex flex-col justify-between">
            {tutorMode === 'lecture' && (
              <div className="space-y-6 my-auto text-center max-w-md mx-auto">
                <BookOpen className="h-12 w-12 text-brand-400 mx-auto" />
                <h4 className="font-display font-semibold text-lg">Study Concept Explanations</h4>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Select a syllabus unit and ask questions. The avatar will adjust explanation difficulty from beginner analogy up to mathematically rigorous advanced level.
                </p>
                <button
                  onClick={() => alert('Launching tutor video chat...')}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold text-sm transition-all"
                >
                  Start Tutoring Session
                </button>
              </div>
            )}

            {tutorMode === 'quiz' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-sm font-semibold text-neutral-300">Adaptive Progress Check</span>
                  <button onClick={handleGenerateQuiz} className="text-xs text-brand-400 flex items-center gap-1 hover:underline">
                    <RefreshCw className="h-3 w-3" /> Regenerate
                  </button>
                </div>
                <div className="space-y-4">
                  {quizQuestions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 bg-neutral-950/40 border border-white/5 rounded-2xl space-y-3">
                      <p className="text-sm font-semibold">{q.q}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {q.options.map((opt: string, optIndex: number) => (
                          <button
                            key={optIndex}
                            onClick={() => alert(`Selected option ${optIndex + 1}`)}
                            className="p-3 bg-neutral-900 border border-white/10 hover:border-brand-500/50 hover:bg-brand-500/5 rounded-xl text-xs text-left transition-colors"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tutorMode === 'viva' && (
              <div className="space-y-6 my-auto text-center max-w-md mx-auto">
                <Award className="h-12 w-12 text-purple-400 mx-auto animate-pulse" />
                <h4 className="font-display font-semibold text-lg">Oral Examination & Mock Interview</h4>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  The avatar will ask oral questions and evaluate your spoken answers. Evaluates conceptual understanding, accuracy, and confidence.
                </p>
                <button
                  onClick={() => alert('Activating mic for viva session...')}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-sm transition-all"
                >
                  Start Viva Session
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
