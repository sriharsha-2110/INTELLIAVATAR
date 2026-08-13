import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mic, Send, Volume2, ShieldCheck, Flag, Settings, ArrowLeft, RefreshCw, Cpu, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  language: string;
  emotion?: string;
  timestamp: string;
}

export default function ChatInterface() {
  const { avatarId } = useParams<{ avatarId: string }>();
  const [avatar, setAvatar] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [activeMode, setActiveMode] = useState<'general' | 'rag_only' | 'hybrid'>('general');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Six Supported Languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' },
  ];

  useEffect(() => {
    // Look up avatar from mock local db or default
    const saved = JSON.parse(localStorage.getItem('avatars') || '[]');
    const found = saved.find((a: any) => a.id === avatarId);
    if (found) {
      setAvatar(found);
      setSelectedLanguage(found.language);
    } else {
      setAvatar({
        id: avatarId,
        name: 'Default Avatar',
        description: 'AI Conversational Assistant',
        language: 'en',
        voice: 'en-US-JennyNeural',
        image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      });
    }

    // Default message
    setMessages([
      {
        id: 'init',
        role: 'assistant',
        content: found?.language === 'kn' ? 'ನಮಸ್ಕಾರ, ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?' : 'Hello, how can I help you today?',
        language: found?.language || 'en',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [avatarId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: inputText,
      language: selectedLanguage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    // Simulate backend response with speech synthesis
    setTimeout(() => {
      let responseText = `I processed your request in language [${selectedLanguage}] and mode [${activeMode}]. This is a simulated response.`;

      // Simulating language ASR & RAG responses
      if (selectedLanguage === 'kn') {
        responseText = 'ಕನ್ನಡ ಸಂಭಾಷಣೆಗೆ ಧನ್ಯವಾದಗಳು. ಇದು ಡೆಮೊ ವ್ಯವಸ್ಥೆಯ ಪ್ರತಿಕ್ರಿಯೆಯಾಗಿದೆ.';
      } else if (selectedLanguage === 'hi') {
        responseText = 'हिंदी वार्तालाप में आपका स्वागत है। यह डेमो संदेश है।';
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: responseText,
        language: selectedLanguage,
        emotion: 'HAPPY',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
    }, 1500);
  };

  const toggleMic = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate speaking completion after 3s
      setTimeout(() => {
        setIsRecording(false);
        setInputText(selectedLanguage === 'kn' ? 'CNN layer shape explain ಮಾಡಿ' : 'Explain this CNN model');
      }, 3000);
    }
  };

  if (!avatar) return null;

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col h-screen">
      <Navbar />

      <div className="flex-grow flex flex-col md:flex-row overflow-hidden max-w-7xl mx-auto w-full p-4 md:p-6 gap-6">
        {/* Left Side: Avatar Viewport */}
        <div className="flex-1 flex flex-col gap-4 min-h-[300px] md:min-h-0">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 text-neutral-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h2 className="font-display font-semibold text-lg">{avatar.name}</h2>
              <p className="text-xs text-neutral-400 truncate max-w-[250px]">{avatar.description}</p>
            </div>
          </div>

          <div className="flex-grow bg-neutral-900/60 border border-white/10 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-4">
            {/* Watermark/Disclosure (Mandatory Safety) */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-950/80 border border-white/10 text-[10px] text-neutral-400 font-medium">
              <ShieldCheck className="h-3 w-3 text-brand-400" />
              <span>AI-Generated Avatar</span>
            </div>

            {/* Report Button (Mandatory Safety) */}
            <button
              onClick={() => alert('Avatar reported to administrators for auditing.')}
              className="absolute top-4 right-4 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/30 border border-rose-500/20 text-[10px] text-rose-400 font-medium hover:bg-rose-500/20 transition-colors"
            >
              <Flag className="h-3 w-3" />
              <span>Report</span>
            </button>

            {/* Glowing avatar background */}
            <div className="absolute w-[200px] h-[200px] bg-brand-500/10 rounded-full blur-[40px] pointer-events-none" />

            {/* Mock Portrait Video Display */}
            <div className="relative w-56 h-56 rounded-full border-2 border-brand-500/50 overflow-hidden flex items-center justify-center bg-dark-950 shadow-2xl">
              <img
                src={avatar.image_url}
                alt={avatar.name}
                className="w-full h-full object-cover"
              />
              {isThinking && (
                <div className="absolute inset-0 bg-dark-950/60 backdrop-blur-xs flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-brand-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Animation state text */}
            <div className="mt-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest animate-pulse">
              {isThinking ? 'Thinking...' : isRecording ? 'Listening...' : 'Ready'}
            </div>
          </div>
        </div>

        {/* Right Side: Conversation Transcript & Inputs */}
        <div className="w-full md:w-[450px] flex flex-col bg-neutral-900/40 border border-white/5 rounded-2xl overflow-hidden h-[50%] md:h-auto">
          {/* Transcript Headers / Settings */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4 bg-dark-950/40">
            {/* RAG Mode Switcher */}
            <div className="flex gap-1.5 p-1 rounded-lg bg-neutral-950/80 border border-white/5 text-[10px]">
              {(['general', 'rag_only', 'hybrid'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveMode(mode)}
                  className={`px-2 py-1 rounded-md font-medium uppercase transition-colors ${
                    activeMode === mode ? 'bg-brand-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {mode.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-neutral-900 border border-white/10 rounded-lg text-xs py-1 px-2 text-white outline-none focus:border-brand-500"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`p-2 rounded-xl text-neutral-400 shrink-0 ${
                    msg.role === 'user' ? 'bg-brand-500/10' : 'bg-white/5'
                  }`}
                >
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
                </div>
                <div className="space-y-1">
                  <div
                    className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-neutral-800 text-neutral-200 rounded-tl-none border border-white/5'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-1.5 text-[9px] text-neutral-500 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {msg.emotion && (
                      <span className="bg-white/5 border border-white/10 rounded px-1 text-[8px] uppercase">
                        {msg.emotion}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-dark-950/40 space-y-3">
            <div className="flex items-center gap-3">
              {/* Mic Toggle Button */}
              <button
                type="button"
                onClick={toggleMic}
                className={`p-3 rounded-xl border transition-all ${
                  isRecording
                    ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                    : 'bg-white/5 border-white/10 hover:border-brand-500 hover:bg-brand-500/5 text-neutral-300 hover:text-brand-400'
                }`}
              >
                <Mic className="h-4 w-4" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isRecording ? 'Listening for audio...' : 'Type your message...'}
                disabled={isRecording}
                className="flex-grow bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 text-sm disabled:opacity-50"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={isRecording || !inputText.trim()}
                className="p-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
