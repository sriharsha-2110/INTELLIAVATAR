import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThreeCanvasViewer, { CameraPreset } from '../components/ThreeCanvasViewer';
import DigitalWhiteboard, { LessonStep } from '../components/DigitalWhiteboard';
import { TeachingGesture } from '../components/ThreeDHumanoidModel';
import { 
  BookOpen, ArrowLeft, Send, Sparkles, Volume2, 
  VolumeX, Play, Pause, RotateCcw, CheckCircle, 
  HelpCircle, MessageSquare, Layers, Maximize2
} from 'lucide-react';
import api from '../services/api';

// Curriculum Lesson Definitions
const DEEP_LEARNING_LESSON: LessonStep[] = [
  {
    title: '1. Fundamentals of Convolutional Neural Networks',
    bulletPoints: [
      'CNNs are specialized neural architectures designed to process spatial and visual grid data.',
      'Unlike dense fully-connected layers, convolutional layers exploit local spatial correlation.',
      'Parameter sharing and translation equivariance dramatically reduce total weight count.',
    ],
    formula: 'S(i, j) = (I * K)(i, j) = \\sum_m \\sum_n I(i - m, j - n) K(m, n)',
    diagramTitle: 'Spatial Filter Convolution',
    diagramDetails: 'A 3x3 weight kernel slides across input channels with stride s and padding p.',
    teacherPrompt: 'Welcome to class! Today we explore Convolutional Neural Networks. Notice how filters sweep across pixel tensors to extract fundamental spatial features.',
    gesture: 'explain_two_hands',
  },
  {
    title: '2. Feature Map Extraction & Activation Functions',
    bulletPoints: [
      'Convolving filters against input images creates high-dimensional Feature Maps.',
      'Non-linear activation functions (ReLU: f(x) = max(0, x)) introduce decision boundaries.',
      'Lower layers learn basic edges and corners; deeper layers assemble semantic objects.',
    ],
    codeSnippet: `import torch.nn as nn\n\nclass ConvBlock(nn.Module):\n    def __init__(self, in_c, out_c):\n        super().__init__()\n        self.conv = nn.Conv2d(in_c, out_c, kernel_size=3, padding=1)\n        self.relu = nn.ReLU(inplace=True)\n    def forward(self, x):\n        return self.relu(self.conv(x))`,
    teacherPrompt: 'Look at the digital whiteboard. After linear convolution, non-linear activation like ReLU is crucial to learn complex boundaries without vanishing gradients.',
    gesture: 'point_left',
  },
  {
    title: '3. Spatial Downsampling via Pooling Layers',
    bulletPoints: [
      'MaxPooling extracts the dominant activation over a 2x2 local window.',
      'Downsampling provides spatial invariance and reduces memory computation.',
      'Output dimensions decrease according to: Floor((W - F + 2P)/S) + 1.',
    ],
    formula: 'Output_{dim} = \\left\\lfloor \\frac{W - K + 2P}{S} \\right\\rfloor + 1',
    diagramTitle: 'MaxPooling Operation (Stride = 2)',
    diagramDetails: 'Selects the maximum value from each non-overlapping quadrant window.',
    teacherPrompt: 'Observe this dimension formula on the whiteboard. When we apply pooling, we compress spatial resolution while preserving key activations.',
    gesture: 'point_left',
  },
  {
    title: '4. Knowledge Check: CNN Reasoning',
    bulletPoints: [
      'Why do CNNs outperform standard Multi-Layer Perceptrons on high-resolution image tasks?',
      'Type your answer or select from the student response options below.',
    ],
    teacherPrompt: 'Now, let us verify your understanding. Why are convolutional layers vastly superior to dense fully-connected layers for visual data? Please answer below.',
    gesture: 'thinking',
  },
];

export default function AITeacherMode() {
  const { avatarId } = useParams<{ avatarId: string }>();

  const [avatar, setAvatar] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeGesture, setActiveGesture] = useState<TeachingGesture>('explain_two_hands');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [layoutMode, setLayoutMode] = useState<'split' | 'teacher_wide' | 'conversation'>('split');
  
  // Student interaction
  const [studentInput, setStudentInput] = useState('');
  const [interactionHistory, setInteractionHistory] = useState<any[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Load avatar
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('avatars') || '[]');
    const found = saved.find((a: any) => a.id === avatarId);
    if (found) {
      setAvatar(found);
      setSelectedLanguage(found.language || 'en');
    } else {
      setAvatar({
        id: avatarId || 'aurora-7',
        name: 'Aurora-7 (Neural 3D Teacher)',
        image_url: '/avatars/aurora_hologram.jpg',
        gender_presentation: 'Female / Holographic AI',
        language: 'en',
      });
    }
  }, [avatarId]);

  const currentStep = DEEP_LEARNING_LESSON[currentStepIndex];

  // Speak teacher lesson
  const speakTeacher = (text: string, gesture: TeachingGesture = 'speaking') => {
    if (isMuted) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'kn' ? 'kn-IN' : selectedLanguage === 'te' ? 'te-IN' : selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'ta' ? 'ta-IN' : selectedLanguage === 'ml' ? 'ml-IN' : 'en-US';
      utterance.rate = 0.98;

      setIsSpeaking(true);
      setActiveGesture(gesture);

      utterance.onend = () => {
        setIsSpeaking(false);
        setActiveGesture(currentStep.gesture || 'idle');
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setActiveGesture('idle');
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Trigger speech on step change
  useEffect(() => {
    if (avatar && currentStep) {
      setActiveGesture(currentStep.gesture);
      speakTeacher(currentStep.teacherPrompt, currentStep.gesture);
    }
  }, [currentStepIndex, avatar]);

  // Handle student answering
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInput.trim()) return;

    const answer = studentInput;
    setStudentInput('');
    setIsEvaluating(true);

    const isCorrect = 
      answer.toLowerCase().includes('spatial') || 
      answer.toLowerCase().includes('parameter') || 
      answer.toLowerCase().includes('weight') || 
      answer.toLowerCase().includes('sharing');

    setTimeout(() => {
      setIsEvaluating(false);
      let feedback = '';
      if (isCorrect) {
        feedback = 'Brilliant deduction! Parameter sharing and spatial translation equivariance allow CNNs to process images efficiently without parameter explosion.';
        setActiveGesture('celebrating');
        speakTeacher(feedback, 'celebrating');
      } else {
        feedback = 'Good attempt. Remember that standard dense layers require millions of weights and destroy 2D spatial relationships, whereas CNNs share convolutional weights.';
        setActiveGesture('nodding');
        speakTeacher(feedback, 'nodding');
      }

      setInteractionHistory((prev) => [
        ...prev,
        { role: 'student', content: answer },
        { role: 'teacher', content: feedback, isCorrect },
      ]);
    }, 800);
  };

  if (!avatar) return null;

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-6 py-5 flex-grow flex flex-col space-y-4">
        
        {/* Top Classroom Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="font-display font-bold text-xl text-white">
                  Virtual AI Classroom • {avatar.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-400 font-mono">
                  ACTIVE LECTURE
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Interactive 3D Digital Human Teacher with Whiteboard & Pedagogical Animations
              </p>
            </div>
          </div>

          {/* Classroom Controls */}
          <div className="flex items-center gap-2.5">
            {/* Language Picker */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-neutral-900 border border-white/10 text-neutral-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-cyan-400"
            >
              <option value="en">English (US)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
            </select>

            {/* Layout Switcher */}
            <div className="flex rounded-xl bg-white/5 border border-white/10 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setLayoutMode('split')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  layoutMode === 'split' ? 'bg-cyan-500/20 text-cyan-300' : 'text-neutral-400'
                }`}
              >
                Teacher + Whiteboard
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('teacher_wide')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  layoutMode === 'teacher_wide' ? 'bg-cyan-500/20 text-cyan-300' : 'text-neutral-400'
                }`}
              >
                Full Teacher
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('conversation')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  layoutMode === 'conversation' ? 'bg-cyan-500/20 text-cyan-300' : 'text-neutral-400'
                }`}
              >
                Conversation Dock
              </button>
            </div>

            {/* Audio Mute */}
            <button
              type="button"
              onClick={() => {
                if (isSpeaking) window.speechSynthesis?.cancel();
                setIsMuted(!isMuted);
              }}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isMuted
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-white/5 border-white/10 text-neutral-300 hover:text-cyan-400'
              }`}
              title={isMuted ? 'Unmute Teacher Voice' : 'Mute Teacher Voice'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Classroom Center Arena */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[580px]">
          
          {/* LEFT: 3D Teacher Virtual Classroom Stage */}
          <div className={`${
            layoutMode === 'teacher_wide' 
              ? 'lg:col-span-12' 
              : layoutMode === 'conversation'
              ? 'lg:col-span-6'
              : 'lg:col-span-5'
          } rounded-2xl overflow-hidden shadow-2xl relative border border-cyan-500/30 flex flex-col`}>
            
            <ThreeCanvasViewer
              portraitTextureUrl={avatar.image_url || '/avatars/aurora_hologram.jpg'}
              isSpeaking={isSpeaking}
              gesture={activeGesture}
              cameraPreset="classroom"
              lightingTheme="classroom_natural"
              gender={avatar.gender_presentation || 'female'}
              enableControls={true}
            />

            {/* Teacher Speech Transcript Caption Box */}
            <div className="absolute bottom-3 left-3 right-3 z-30 p-3 rounded-xl bg-dark-950/85 backdrop-blur-md border border-cyan-500/30 text-xs text-neutral-200 flex items-start gap-2.5 shadow-xl">
              <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-300 shrink-0 mt-0.5">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-cyan-300 font-mono text-[11px]">
                    TEACHER EXPLANATION • {activeGesture.toUpperCase().replace('_', ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => speakTeacher(currentStep.teacherPrompt, currentStep.gesture)}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Replay Voice
                  </button>
                </div>
                <p className="leading-relaxed line-clamp-3">
                  {currentStep.teacherPrompt}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Digital Whiteboard & Interactive Student Panel */}
          {layoutMode !== 'teacher_wide' && (
            <div className={`${
              layoutMode === 'conversation' ? 'lg:col-span-6' : 'lg:col-span-7'
            } flex flex-col space-y-4`}>
              
              {/* The Whiteboard Component */}
              <div className="flex-grow min-h-[380px]">
                <DigitalWhiteboard
                  lessonTitle="Module 3: Deep Learning Architectures"
                  topicCategory="Computer Vision / Deep Neural Networks"
                  steps={DEEP_LEARNING_LESSON}
                  currentStepIndex={currentStepIndex}
                  onSelectStep={(idx) => setCurrentStepIndex(idx)}
                  isTeachingSpeaking={isSpeaking}
                />
              </div>

              {/* Interactive Student Q&A Response Bar */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3 bg-dark-950/90 shadow-xl">
                
                {/* Recent Teacher / Student Feedback History */}
                {interactionHistory.length > 0 && (
                  <div className="max-h-28 overflow-y-auto space-y-1.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                    {interactionHistory.slice(-2).map((item, i) => (
                      <div key={i} className={`flex items-start gap-2 ${
                        item.role === 'student' ? 'text-neutral-300' : item.isCorrect ? 'text-emerald-300' : 'text-cyan-300'
                      }`}>
                        <span className="font-mono text-[10px] uppercase font-bold shrink-0">
                          {item.role === 'student' ? 'You:' : 'Teacher:'}
                        </span>
                        <span>{item.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleStudentSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={studentInput}
                    onChange={(e) => setStudentInput(e.target.value)}
                    placeholder="Type your question or answer for the 3D Teacher..."
                    className="flex-grow px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    disabled={isEvaluating || !studentInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 text-white text-xs font-semibold transition-all shadow-md disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit</span>
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
