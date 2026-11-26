import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThreeDAvatarStage from '../components/ThreeDAvatarStage';
import { 
  Mic, Send, Volume2, VolumeX, ArrowLeft, RefreshCw, Cpu, User, Sliders
} from 'lucide-react';

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [stageMode, setStageMode] = useState<'hologram' | 'portrait'>('hologram');
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

  // Voice synthesis helper
  const speakText = (text: string, langCode: string) => {
    if (voiceMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langTagMap: Record<string, string> = {
      en: 'en-US',
      kn: 'kn-IN',
      hi: 'hi-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      ml: 'ml-IN',
    };
    utterance.lang = langTagMap[langCode] || 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Look up avatar from mock local db or default
    const saved = JSON.parse(localStorage.getItem('avatars') || '[]');
    const found = saved.find((a: any) => a.id === avatarId);
    
    if (found) {
      setAvatar(found);
      setSelectedLanguage(found.language || 'en');
      if (found.framingMode) {
        setStageMode(found.framingMode === 'full' ? 'hologram' : 'portrait');
      }
    } else {
      // Default to the user's uploaded holographic neural avatar (Aurora-7)
      const defaultAvatar = {
        id: avatarId || 'aurora-7',
        name: 'Aurora-7',
        description: 'Holographic Neural Interface - Multilingual AI digital human',
        language: 'en',
        voice: 'en-US-JennyNeural',
        image_url: '/avatars/aurora_hologram.jpg',
        hologramEffect: true,
      };
      setAvatar(defaultAvatar);
    }

    // Default welcome message
    const welcomeMsg = found?.language === 'kn' 
      ? 'ನಮಸ್ಕಾರ, ನಾನು ಅರೋರಾ-7 (Aurora-7). ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?' 
      : 'Greetings. Neural Interface online. I am Aurora-7, your multilingual AI digital human. How can I assist you today?';
    
    setMessages([
      {
        id: 'init',
        role: 'assistant',
        content: welcomeMsg,
        language: found?.language || 'en',
        emotion: 'HAPPY',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Speak initial welcome
    setTimeout(() => {
      speakText(welcomeMsg, found?.language || 'en');
    }, 600);
  }, [avatarId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: userText,
      language: selectedLanguage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    // Simulate backend response with speech synthesis & code-switching
    setTimeout(() => {
      let responseText = `I have received your prompt. As ${avatar?.name || 'Aurora-7'}, I am processing this in ${selectedLanguage.toUpperCase()} mode with LivePortrait reanimation.`;

      // Simulating language ASR & RAG responses
      if (selectedLanguage === 'kn') {
        if (userText.toLowerCase().includes('cnn') || userText.includes('explain')) {
          responseText = 'CNN (Convolutional Neural Network) ಒಂದು ಡೀಪ್ ಲರ್ನಿಂಗ್ ಮಾಡೆಲ್. ಇದು ಇಮೇಜ್ ಪ್ರೊಸೆಸಿಂಗ್ ಮತ್ತು ಕಂಪ್ಯೂಟರ್ ವಿಷನ್ ಕಾರ್ಯಗಳಿಗೆ ಸೂಕ್ತವಾಗಿದೆ.';
        } else {
          responseText = 'ಕನ್ನಡ ಸಂಭಾಷಣೆಗೆ ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ನಾನು ಸಂತೋಷದಿಂದ ಉತ್ತರಿಸುತ್ತೇನೆ.';
        }
      } else if (selectedLanguage === 'hi') {
        responseText = 'नमस्ते! मैंने आपके संदेश को समझ लिया है। यह तंत्रिका इंटरफेस आपके प्रश्नों का उत्तर देने के लिए पूरी तरह सक्रिय है।';
      } else if (selectedLanguage === 'te') {
        responseText = 'నమస్కారం! మీ ప్రశ్నను నేను అర్థం చేసుకున్నాను. న్యూరల్ ఇంటర్‌ఫేస్ మీకు సహాయం చేయడానికి సిద్ధంగా ఉంది.';
      } else if (selectedLanguage === 'ta') {
        responseText = 'வணக்கம்! உங்கள் கேள்வியை நான் புரிந்துகொண்டேன். நான் உங்களுக்கு உதவ தயாராக உள்ளேன்.';
      } else if (selectedLanguage === 'ml') {
        responseText = 'നമസ്കാരം! നിങ്ങളുടെ സന്ദേശം ഞാൻ മനസ്സിലാക്കി. സഹായിക്കാൻ ഞാൻ സദാ സന്നദ്ധയാണ്.';
      } else {
        if (userText.toLowerCase().includes('who are you') || userText.toLowerCase().includes('name')) {
          responseText = `I am ${avatar?.name || 'Aurora-7'}, an AI-powered multilingual conversational digital human generated from your uploaded neural portrait.`;
        }
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: responseText,
        language: selectedLanguage,
        emotion: 'ENCOURAGING',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
      speakText(responseText, selectedLanguage);
    }, 1200);
  };

  const toggleMic = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        const sampleQuery = selectedLanguage === 'kn' 
          ? 'CNN structure explain ಮಾಡಿ.' 
          : 'Explain the neural network architecture in detail.';
        setInputText(sampleQuery);
      }, 2500);
    }
  };

  if (!avatar) return null;

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col h-screen">
      <Navbar />

      <div className="flex-grow flex flex-col md:flex-row overflow-hidden max-w-7xl mx-auto w-full p-4 md:p-6 gap-6">
        
        {/* Left Side: 3D Animated Talking Avatar Viewport */}
        <div className="flex-1 flex flex-col gap-3 min-h-[350px] md:min-h-0">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-3 bg-neutral-900/40 p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="p-2 text-neutral-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-semibold text-base">{avatar.name}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono">
                    3D NEURAL TALKING
                  </span>
                </div>
                <p className="text-xs text-neutral-400 truncate max-w-[280px]">{avatar.description}</p>
              </div>
            </div>

            {/* Audio Mute/Unmute */}
            <button
              onClick={() => {
                if (isSpeaking) {
                  window.speechSynthesis?.cancel();
                  setIsSpeaking(false);
                }
                setVoiceMuted(!voiceMuted);
              }}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                voiceMuted 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-white/5 border-white/10 text-neutral-300 hover:text-cyan-400'
              }`}
              title={voiceMuted ? 'Unmute Avatar Voice' : 'Mute Avatar Voice'}
            >
              {voiceMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          {/* 3D Holographic Stage with Live Viseme Lip-Syncing Engine */}
          <ThreeDAvatarStage
            imageUrl={avatar.image_url || '/avatars/aurora_hologram.jpg'}
            name={avatar.name}
            isSpeaking={isSpeaking}
            isThinking={isThinking}
            isRecording={isRecording}
            stageMode={stageMode}
            onToggleStageMode={() => setStageMode(stageMode === 'hologram' ? 'portrait' : 'hologram')}
            selectedLanguage={selectedLanguage}
            emotion="HAPPY"
          />
        </div>

        {/* Right Side: Conversation Transcript & Real-Time Multilingual Chat */}
        <div className="w-full md:w-[460px] flex flex-col bg-neutral-900/40 border border-white/5 rounded-2xl overflow-hidden h-[50%] md:h-auto">
          
          {/* Transcript Headers / Language & Mode Selectors */}
          <div className="p-3.5 border-b border-white/5 flex items-center justify-between gap-3 bg-dark-950/60">
            {/* Mode Switcher */}
            <div className="flex gap-1 p-1 rounded-lg bg-neutral-950 border border-white/10 text-[10px]">
              {(['general', 'rag_only', 'hybrid'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveMode(mode)}
                  className={`px-2 py-1 rounded font-medium uppercase transition-colors ${
                    activeMode === mode 
                      ? 'bg-cyan-500 text-black font-bold' 
                      : 'text-neutral-400 hover:text-white'
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
              className="bg-neutral-900 border border-white/10 rounded-lg text-xs py-1 px-2.5 text-white outline-none focus:border-cyan-500"
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
                className={`flex gap-3 max-w-[88%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`p-2 rounded-xl text-neutral-400 shrink-0 h-fit ${
                    msg.role === 'user' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-purple-400'
                  }`}
                >
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
                </div>
                
                <div className="space-y-1">
                  <div
                    className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-neutral-800/90 text-neutral-200 rounded-tl-none border border-white/5'
                    }`}
                  >
                    {msg.content}
                  </div>

                  <div className={`flex items-center gap-2 text-[10px] text-neutral-500 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{msg.timestamp}</span>
                    
                    {msg.role === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.content, msg.language)}
                        className="p-1 hover:text-cyan-400 transition-colors"
                        title="Replay Voice Speech"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
                    )}

                    {msg.emotion && (
                      <span className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[8px] font-mono text-cyan-300">
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
          <form onSubmit={handleSendMessage} className="p-3.5 border-t border-white/5 bg-dark-950/60 space-y-2">
            <div className="flex items-center gap-2">
              {/* Mic Toggle Button */}
              <button
                type="button"
                onClick={toggleMic}
                className={`p-3 rounded-xl border transition-all ${
                  isRecording
                    ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                    : 'bg-white/5 border-white/10 hover:border-cyan-400 hover:bg-cyan-500/10 text-neutral-300 hover:text-cyan-300'
                }`}
                title="Speak to Avatar (Microphone)"
              >
                <Mic className="h-4 w-4" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isRecording ? 'Listening for speech input...' : `Ask ${avatar.name} in ${selectedLanguage.toUpperCase()}...`}
                disabled={isRecording}
                className="flex-grow bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-cyan-500 text-sm disabled:opacity-50 text-white"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={isRecording || !inputText.trim()}
                className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-neutral-500 px-1">
              <span>Code-switching supported (e.g. "CNN explain ಮಾಡಿ")</span>
              <span>Edge-TTS + Whisper Active</span>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
