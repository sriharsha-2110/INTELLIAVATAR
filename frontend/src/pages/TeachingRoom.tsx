import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import AvatarCanvas from '../features/three/AvatarCanvas';
import ConceptVisualizer from '../components/ConceptVisualizer';
import { useAvatarStore } from '../store/avatarStore';
import { GestureType } from '../features/three/AnimationController';
import { VisemeType } from '../features/three/VisemeController';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Pause, Play, 
  RotateCcw, Sparkles, Trash2, Cpu, MessageSquare, 
  ArrowRight, Layers, Bot, User as UserIcon 
} from 'lucide-react';
import axios from 'axios';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

export default function TeachingRoom() {
  const { selectedAvatar, avatars, fetchAvatars } = useAvatarStore();
  const avatar = selectedAvatar || avatars[0];

  // Conversation state
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'init-1',
      sender: 'teacher',
      text: 'Hello students! Welcome to our interactive 3D virtual classroom. What topic would you like to explore today? (Try asking: "Explain Java inheritance", "How does Bubble sort work?", or "Explain computer networks")',
      timestamp: new Date(),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(avatar?.language || 'en');

  // 3D Teacher Animation & Speech state
  const [activeGesture, setActiveGesture] = useState<GestureType>('greeting');
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [activeConceptDemo, setActiveConceptDemo] = useState<any>({
    type: 'java_inheritance',
    title: 'Class Hierarchy & Polymorphic Inheritance',
    description: 'Visualization of superclass members inherited by subclasses with method overriding and dynamic dispatch.',
    visualData: {
      parent: { name: 'Vehicle', members: ['speed: int', 'brand: String'], methods: ['accelerate()', 'brake()'] },
      children: [
        { name: 'Car', extraMembers: ['numDoors: int'], overrides: ['accelerate()'] },
        { name: 'ElectricCar', extraMembers: ['batteryLevel: int'], overrides: ['charge()', 'accelerate()'] },
      ],
    },
  });

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLanguage === 'kn' ? 'kn-IN' : selectedLanguage === 'te' ? 'te-IN' : selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'ta' ? 'ta-IN' : selectedLanguage === 'ml' ? 'ml-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuestion(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Speak Teacher text using Web SpeechSynthesis
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage === 'kn' ? 'kn-IN' : selectedLanguage === 'te' ? 'te-IN' : selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'ta' ? 'ta-IN' : selectedLanguage === 'ml' ? 'ml-IN' : 'en-US';
    utterance.rate = 1.0;

    setIsTeacherSpeaking(true);
    setIsAudioPaused(false);

    utterance.onend = () => {
      setIsTeacherSpeaking(false);
      setIsAudioPaused(false);
      setActiveGesture('idle');
    };

    utterance.onerror = () => {
      setIsTeacherSpeaking(false);
      setIsAudioPaused(false);
      setActiveGesture('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if ('speechSynthesis' in window && isTeacherSpeaking) {
      window.speechSynthesis.pause();
      setIsAudioPaused(true);
    }
  };

  const resumeSpeech = () => {
    if ('speechSynthesis' in window && isAudioPaused) {
      window.speechSynthesis.resume();
      setIsAudioPaused(false);
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsTeacherSpeaking(false);
      setIsAudioPaused(false);
      setActiveGesture('idle');
    }
  };

  // Submit Question
  const handleSendQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuestion.trim() || isLoading) return;

    const userQ = inputQuestion.trim();
    setInputQuestion('');

    const newMsg = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: userQ,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/teaching/chat`, {
        avatarId: avatar?.id || avatar?._id || 'teacher-michelle',
        question: userQ,
        language: selectedLanguage,
        teachingStyle: avatar?.teachingStyle || 'professional',
      });

      const teacherMsg = res.data?.teacherMessage;
      if (teacherMsg) {
        setMessages((prev) => [...prev, teacherMsg]);
        if (teacherMsg.gesture) setActiveGesture(teacherMsg.gesture);
        if (teacherMsg.conceptDemo) setActiveConceptDemo(teacherMsg.conceptDemo);

        speakText(teacherMsg.text);
      }
    } catch (err) {
      // Fallback pedagogical response
      const fallbackText = `When analyzing "${userQ}", we decompose the concept into its essential principles. Notice how each component connects directly with our problem specification.`;
      const fallbackTeacher = {
        id: `msg_${Date.now()}_t`,
        sender: 'teacher',
        text: fallbackText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackTeacher]);
      setActiveGesture('explaining');
      speakText(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0f17] text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex-grow flex flex-col space-y-4">
        
        {/* Top Room Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-black border border-cyan-500/30 shrink-0">
              <img src={avatar?.photoUrl || '/avatars/demo_michelle.jpg'} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-white">{avatar?.name || 'Teacher Michelle'}</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-mono">
                  ACTIVE 3D
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                Multilingual AI Teaching Engine • {avatar?.teachingStyle?.toUpperCase() || 'PROFESSIONAL'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-neutral-950 border border-white/10 text-neutral-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-cyan-400"
            >
              <option value="en">English (US)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
            </select>

            {/* Audio Controls */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-white/10 text-xs">
              {isTeacherSpeaking && (
                isAudioPaused ? (
                  <button onClick={resumeSpeech} className="p-1.5 rounded-lg text-emerald-400 hover:bg-white/5" title="Resume Speech">
                    <Play className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={pauseSpeech} className="p-1.5 rounded-lg text-amber-400 hover:bg-white/5" title="Pause Speech">
                    <Pause className="h-4 w-4" />
                  </button>
                )
              )}

              <button
                type="button"
                onClick={stopSpeech}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-white/5"
                title="Stop Teacher Voice"
              >
                <VolumeX className="h-4 w-4" />
              </button>
            </div>

            {/* Clear Chat */}
            <button
              type="button"
              onClick={() => setMessages([])}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10"
              title="Clear Conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Teaching Room Grid (7 Cols 3D Teacher & Whiteboard / 5 Cols Chat Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-grow min-h-[580px]">
          
          {/* LEFT: 3D Teacher Virtual Stage & Whiteboard (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* 3D Teacher Stage */}
            <div className="h-[380px] rounded-2xl overflow-hidden shadow-2xl relative border border-white/10">
              <AvatarCanvas
                modelUrl={avatar?.modelUrl || '/models/demo/michelle.glb'}
                gesture={activeGesture}
                isSpeaking={isTeacherSpeaking}
                voice={avatar?.voice}
                language={selectedLanguage}
              />
            </div>

            {/* Interactive Concept Visual Whiteboard */}
            <div className="flex-grow">
              <ConceptVisualizer demo={activeConceptDemo} />
            </div>
          </div>

          {/* RIGHT: Conversation & Student Q&A Panel (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-neutral-900/70 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            {/* Chat Messages Log */}
            <div className="p-4 space-y-3.5 overflow-y-auto flex-grow max-h-[500px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'teacher' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                        : 'bg-neutral-950 border border-white/10 text-neutral-200 rounded-tl-none shadow-md'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="text-[9px] text-neutral-400 font-mono block mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-300 shrink-0 mt-0.5">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono animate-pulse p-2">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Teacher is formulating pedagogical explanation...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendQuestion} className="p-3 bg-neutral-950 border-t border-white/10 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMic}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500 border-rose-400 text-white animate-pulse'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
                title={isListening ? 'Listening...' : 'Voice Input'}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask your 3D teacher any question..."
                className="flex-grow bg-neutral-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
              />

              <button
                type="submit"
                disabled={isLoading || !inputQuestion.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white disabled:opacity-40 shadow-md transition-all"
                title="Send Question"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>

      </main>
    </div>
  );
}
