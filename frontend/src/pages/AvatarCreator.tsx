import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Upload, Check, Volume2, ShieldAlert, Cpu, Heart, Database, Settings } from 'lucide-react';

export default function AvatarCreator() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'appearance' | 'voice' | 'personality' | 'safety' | 'advanced'>('appearance');

  // Input states
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [genderPresentation, setGenderPresentation] = useState('Neutral');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural');
  const [personality, setPersonality] = useState('Teacher');
  const [responseStyle, setResponseStyle] = useState('Detailed');
  const [defaultEmotion, setDefaultEmotion] = useState('NEUTRAL');
  const [avatarEngine, setAvatarEngine] = useState('mock');
  const [lipsyncEngine, setLipsyncEngine] = useState('mock');
  const [isMemoryEnabled, setIsMemoryEnabled] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(false);

  // File Upload State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Six Supported Languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' },
  ];

  // Map voices based on language selection
  const voiceMap: Record<string, { code: string; label: string }[]> = {
    en: [
      { code: 'en-US-JennyNeural', label: 'Jenny (Female, Friendly)' },
      { code: 'en-US-GuyNeural', label: 'Guy (Male, Professional)' },
    ],
    kn: [
      { code: 'kn-IN-SapnaNeural', label: 'Sapna (Female, Clear)' },
      { code: 'kn-IN-GaganNeural', label: 'Gagan (Male, Deep)' },
    ],
    te: [
      { code: 'te-IN-ShrutiNeural', label: 'Shruti (Female, Warm)' },
      { code: 'te-IN-MohanNeural', label: 'Mohan (Male, Clear)' },
    ],
    hi: [
      { code: 'hi-IN-SwaraNeural', label: 'Swara (Female, Expressive)' },
      { code: 'hi-IN-MadhurNeural', label: 'Madhur (Male, Formal)' },
    ],
    ta: [
      { code: 'ta-IN-PallaviNeural', label: 'Pallavi (Female, Gentle)' },
      { code: 'ta-IN-ValluvarNeural', label: 'Valluvar (Male, Strong)' },
    ],
    ml: [
      { code: 'ml-IN-SobhanaNeural', label: 'Sobhana (Female, Warm)' },
      { code: 'ml-IN-MidhunNeural', label: 'Midhun (Male, Soft)' },
    ],
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConsentChecked) {
      alert('You must accept the safety consent terms before creating a digital human.');
      return;
    }

    // Save avatar mockup in localStorage to query/simulate database storage
    const newAvatar = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || 'Custom Avatar',
      description: desc,
      gender_presentation: genderPresentation,
      language: selectedLanguage,
      voice: selectedVoice,
      personality,
      defaultEmotion,
      avatarEngine,
      lipsyncEngine,
      image_url: previewImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    };

    const saved = JSON.parse(localStorage.getItem('avatars') || '[]');
    saved.push(newAvatar);
    localStorage.setItem('avatars', JSON.stringify(saved));

    navigate(`/chat/${newAvatar.id}`);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-6 py-10 flex-grow space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Avatar Creation Studio
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Build and customize a digital human. Setup its visual representation, voice adapters, and conversational parameters.
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-px">
          {(['appearance', 'voice', 'personality', 'safety', 'advanced'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form Container */}
        <form onSubmit={handleCreate} className="space-y-8">
          {/* Tab 1: Appearance */}
          {activeTab === 'appearance' && (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
              <h3 className="font-display font-semibold text-lg">Portrait Configuration</h3>
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="w-48 h-48 rounded-2xl border border-white/10 bg-neutral-900 overflow-hidden flex flex-col items-center justify-center relative">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-neutral-500">
                      <Upload className="h-8 w-8 mb-2" />
                      <span className="text-xs">Upload Portrait</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                      Avatar Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Professor Smith"
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm outline-none text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                      Description / Role
                    </label>
                    <textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="e.g. An AI tutor for teaching Computer Science and neural networks."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm outline-none text-white resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                      Identity Presentation (Optional)
                    </label>
                    <input
                      type="text"
                      value={genderPresentation}
                      onChange={(e) => setGenderPresentation(e.target.value)}
                      placeholder="e.g. Female, Male, Non-binary, Neutral"
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm outline-none text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Voice & Language */}
          {activeTab === 'voice' && (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-brand-400" />
                Speech Synthesis Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language Select */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Target Language
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      setSelectedLanguage(e.target.value);
                      setSelectedVoice(voiceMap[e.target.value][0].code);
                    }}
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm outline-none text-white"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Voice Select */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Voice Actor Node
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm outline-none text-white"
                  >
                    {voiceMap[selectedLanguage]?.map((voice) => (
                      <option key={voice.code} value={voice.code}>
                        {voice.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Personality */}
          {activeTab === 'personality' && (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
              <h3 className="font-display font-semibold text-lg">Behavior & AI Prompt</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Agent Persona
                  </label>
                  <select
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm outline-none text-white"
                  >
                    <option value="Professional">Professional Specialist (Concise, technical)</option>
                    <option value="Teacher">Tutor & Instructor (Step-by-step, detailed)</option>
                    <option value="Encouraging">Motivational Mentor (Empathetic, structured)</option>
                    <option value="Support">Customer Helpdesk (FAQ grounded, friendly)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Default Emotion State
                  </label>
                  <select
                    value={defaultEmotion}
                    onChange={(e) => setDefaultEmotion(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm outline-none text-white"
                  >
                    <option value="NEUTRAL">Neutral</option>
                    <option value="HAPPY">Happy / Smiling</option>
                    <option value="SAD">Empathetic / Soft</option>
                    <option value="ENCOURAGING">Encouraging / Bright</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Safety & Consent */}
          {activeTab === 'safety' && (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-rose-400">
                <ShieldAlert className="h-5 w-5" />
                Ethical Deployment & Safety Verification
              </h3>
              <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl space-y-3">
                <p className="text-xs text-neutral-300 leading-relaxed">
                  IntelliAvatar enforces strict policies against impersonation, deepfakes, and non-consensual digital replicas. By creating this talking avatar, you certify that:
                </p>
                <ul className="text-xs text-neutral-400 list-disc list-inside space-y-1">
                  <li>You hold explicit rights or permissions to use the uploaded image.</li>
                  <li>The synthesized voice output will not be used for malicious impersonation.</li>
                  <li>An automatic watermark disclosure "AI-generated avatar" will be displayed during interaction.</li>
                </ul>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={isConsentChecked}
                  onChange={(e) => setIsConsentChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 bg-neutral-950 border border-white/20 rounded focus:ring-brand-500 text-brand-500"
                />
                <span className="text-xs text-neutral-300 leading-normal">
                  I confirm that I have permission to use this person's image/voice and accept terms of service.
                </span>
              </label>
            </div>
          )}

          {/* Tab 5: Advanced */}
          {activeTab === 'advanced' && (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
              <h3 className="font-display font-semibold text-lg">Inference Engine Selections</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Facial Animation Engine
                  </label>
                  <select
                    value={avatarEngine}
                    onChange={(e) => setAvatarEngine(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm outline-none text-white"
                  >
                    <option value="mock">Mock/Demo Adapter (Pre-rendered fallbacks)</option>
                    <option value="liveportrait">LivePortrait Adapter (CUDA Local)</option>
                    <option value="sadtalker">SadTalker Adapter (CUDA Local)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Lip Sync Engine
                  </label>
                  <select
                    value={lipsyncEngine}
                    onChange={(e) => setLipsyncEngine(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm outline-none text-white"
                  >
                    <option value="mock">Mock/Demo Adapter (Pre-rendered sync)</option>
                    <option value="wav2lip">Wav2Lip Adapter</option>
                    <option value="musetalk">MuseTalk Adapter</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 font-semibold text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={activeTab !== 'safety' || !isConsentChecked}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed font-semibold text-sm transition-all hover:shadow-[0_0_15px_rgba(59,102,255,0.3)]"
            >
              Build Digital Human
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
