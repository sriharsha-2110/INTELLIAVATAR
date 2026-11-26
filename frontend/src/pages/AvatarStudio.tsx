import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThreeCanvasViewer, { CameraPreset, LightingTheme } from '../components/ThreeCanvasViewer';
import { TeachingGesture } from '../components/ThreeDHumanoidModel';
import { 
  Cpu, ArrowLeft, Volume2, Sparkles, Sliders, 
  RotateCcw, Save, BookOpen, MessageCircle, Check, 
  Layers, Smile, Sun, CheckCircle2, AlertCircle
} from 'lucide-react';
import api from '../services/api';

export default function AvatarStudio() {
  const { avatarId } = useParams<{ avatarId: string }>();
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState<any>(null);
  const [activeGesture, setActiveGesture] = useState<TeachingGesture>('idle');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('classroom');
  const [lightingTheme, setLightingTheme] = useState<LightingTheme>('warm_studio');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load avatar details
  useEffect(() => {
    const loadAvatar = async () => {
      // 1. Check LocalStorage
      const saved = JSON.parse(localStorage.getItem('avatars') || '[]');
      const localFound = saved.find((a: any) => a.id === avatarId);

      if (localFound) {
        setAvatar(localFound);
        setSelectedLanguage(localFound.language || 'en');
        if (localFound.settings_json?.camera_preset) {
          setCameraPreset(localFound.settings_json.camera_preset);
        }
        if (localFound.settings_json?.lighting) {
          setLightingTheme(localFound.settings_json.lighting);
        }
      } else {
        // Fallback default Aurora-7
        const defaultAvatar = {
          id: avatarId || 'aurora-7',
          name: 'Aurora-7 (Neural 3D Teacher)',
          description: 'Multilingual AI Digital Human Teacher with 3D Viseme Lip-Sync and Virtual Classroom',
          gender_presentation: 'Female / Holographic AI',
          image_url: '/avatars/aurora_hologram.jpg',
          avatar_type: '3D',
          language: 'en',
          voice: 'en-US-JennyNeural',
        };
        setAvatar(defaultAvatar);
      }

      // Try fetching from backend
      try {
        const res = await api.get(`/avatars/${avatarId}`);
        if (res.data) {
          setAvatar((prev: any) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.log('Using local avatar state in Avatar Studio.');
      }
    };

    loadAvatar();
  }, [avatarId]);

  // Speech playback & Viseme lip-sync test
  const handleTestSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const samplePhrases: Record<string, string> = {
        en: "Welcome to my 3D Avatar Studio. I am your digital human teacher ready to conduct interactive lessons.",
        kn: "ನನ್ನ 3D ಅವತಾರ್ ಸ್ಟುಡಿಯೋಗೆ ಸುಸ್ವಾಗತ. ನಾನು ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಶಿಕ್ಷಕಿ.",
        te: "నా 3D అవతార్ స్టూడియోకి స్వాగతం. నేను మీ డిజిటల్ హ్యూమన్ టీచర్‌ని.",
        hi: "मेरे 3D अवतार स्टूडियो में आपका स्वागत है। मैं आपकी डिजिटल शिक्षिका हूँ।",
        ta: "எனது 3D அவதார் ஸ்டுடியோவிற்கு வரவேற்கிறோம். நான் உங்கள் டிஜிட்டல் ஆசிரியை.",
        ml: "എന്റെ 3D അവതാർ സ്റ്റുഡിയോയിലേക്ക് സ്വാഗതം. ഞാൻ നിങ്ങളുടെ അധ്യാപികയാണ്.",
      };

      const text = samplePhrases[selectedLanguage] || samplePhrases.en;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'kn' ? 'kn-IN' : selectedLanguage === 'te' ? 'te-IN' : selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'ta' ? 'ta-IN' : selectedLanguage === 'ml' ? 'ml-IN' : 'en-US';
      utterance.rate = 1.0;

      setIsSpeaking(true);
      setActiveGesture('speaking');

      utterance.onend = () => {
        setIsSpeaking(false);
        setActiveGesture('idle');
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setActiveGesture('idle');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Web Speech Synthesis is not supported in this browser.');
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const updatedSettings = {
      camera_preset: cameraPreset,
      lighting: lightingTheme,
      wireframe: wireframe,
      language: selectedLanguage,
    };

    // Update in LocalStorage
    const saved = JSON.parse(localStorage.getItem('avatars') || '[]');
    const idx = saved.findIndex((a: any) => a.id === avatarId);
    if (idx !== -1) {
      saved[idx].settings_json = updatedSettings;
      saved[idx].language = selectedLanguage;
      localStorage.setItem('avatars', JSON.stringify(saved));
    }

    // Call Backend PUT API
    try {
      await api.put(`/avatars/${avatarId}`, {
        settings_json: updatedSettings,
        language_code: selectedLanguage,
      });
    } catch (err) {
      console.log('Saved settings to local storage.');
    }

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  if (!avatar) return null;

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-6 py-6 flex-grow space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-2xl text-white">{avatar.name}</h1>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-400 font-mono">
                  3D RIGGED DIGITAL HUMAN
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Interactive 3D Avatar Studio • Skeletal animations, visemes, and classroom camera rig
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Link
              to={`/teacher/${avatar.id}`}
              className="px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              <BookOpen className="h-4 w-4" />
              <span>Launch AI Teacher Mode</span>
            </Link>
            <Link
              to={`/chat/${avatar.id}`}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Talk Now</span>
            </Link>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main 3D Canvas Viewport (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="h-[560px] rounded-2xl overflow-hidden shadow-2xl relative border border-cyan-500/25">
              <ThreeCanvasViewer
                portraitTextureUrl={avatar.image_url || '/avatars/aurora_hologram.jpg'}
                isSpeaking={isSpeaking}
                gesture={activeGesture}
                cameraPreset={cameraPreset}
                lightingTheme={lightingTheme}
                wireframe={wireframe}
                gender={avatar.gender_presentation || 'female'}
                enableControls={true}
                onCameraChange={(p) => setCameraPreset(p)}
              />
            </div>

            {/* Viewport Control Bar */}
            <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
              
              {/* Lighting Preset */}
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 flex items-center gap-1 font-mono text-[11px]">
                  <Sun className="h-3.5 w-3.5 text-cyan-400" /> Lighting:
                </span>
                <select
                  value={lightingTheme}
                  onChange={(e) => setLightingTheme(e.target.value as LightingTheme)}
                  className="bg-neutral-900 border border-white/10 text-neutral-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="warm_studio">Warm Studio</option>
                  <option value="cyber_hologram">Cyber Hologram</option>
                  <option value="classroom_natural">Classroom Natural</option>
                </select>
              </div>

              {/* Wireframe Toggle */}
              <button
                type="button"
                onClick={() => setWireframe(!wireframe)}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-all ${
                  wireframe
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Wireframe Mesh: {wireframe ? 'ON' : 'OFF'}</span>
              </button>

              {/* Save Settings */}
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save 3D Presets</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Sidebar: Gesture & Viseme Audio Testers (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Gesture Kinematics Tester */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  Teaching Gestures
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 uppercase">Slerp Blended</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'idle', label: 'Idle Stand' },
                  { id: 'speaking', label: 'Conversational' },
                  { id: 'explain_one_hand', label: 'Explain (1 Hand)' },
                  { id: 'explain_two_hands', label: 'Explain (2 Hands)' },
                  { id: 'point_left', label: 'Point Whiteboard' },
                  { id: 'point_right', label: 'Point Right' },
                  { id: 'thinking', label: 'Thinking Pose' },
                  { id: 'nodding', label: 'Affirmative Nod' },
                  { id: 'greeting', label: 'Warm Wave' },
                  { id: 'celebrating', label: 'Celebrate Answer' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveGesture(g.id as TeachingGesture)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                      activeGesture === g.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                        : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Speech & Multilingual Viseme Tester */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-cyan-400" />
                  Multilingual 3D Lip-Sync
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 uppercase">Viseme Rig</span>
              </div>

              <div className="space-y-3">
                <label className="text-xs text-neutral-400 block font-medium">
                  Select Teaching Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'kn', label: 'Kannada' },
                    { code: 'te', label: 'Telugu' },
                    { code: 'hi', label: 'Hindi' },
                    { code: 'ta', label: 'Tamil' },
                    { code: 'ml', label: 'Malayalam' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                        selectedLanguage === lang.code
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleTestSpeech}
                  disabled={isSpeaking}
                  className="w-full py-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 hover:bg-cyan-500/25 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>{isSpeaking ? 'Playing Speech & Lip-Sync...' : 'Test Speech in ' + selectedLanguage.toUpperCase()}</span>
                </button>
              </div>
            </div>

            {/* 3D Model Diagnostics Card */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-xs space-y-2">
              <span className="text-[11px] font-mono text-neutral-400 block uppercase font-semibold">
                Skeletal & Facial Rig Specs
              </span>
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-500">Geometry:</span>
                <span className="font-mono text-cyan-300">GLTF/GLB Rigged Humanoid</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-500">Viseme Blendshapes:</span>
                <span className="font-mono text-emerald-400">viseme_aa, O, E, I, U, jawOpen</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-500">Bones:</span>
                <span className="font-mono text-neutral-300">Head, Neck, Spine, Arms, Hands</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
