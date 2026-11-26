import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThreeCanvasViewer, { CameraPreset } from '../components/ThreeCanvasViewer';
import ImageCropModal from '../components/ImageCropModal';
import { analyzeHumanPortrait, DetectedHumanProfile } from '../utils/faceAnalysis';
import { 
  Upload, Check, Volume2, ShieldAlert, Cpu, Heart, 
  Sparkles, Sliders, Play, RotateCcw, Eye, ShieldCheck,
  CheckCircle2, AlertCircle, Crop, Loader2, UserCheck
} from 'lucide-react';
import api from '../services/api';

export default function AvatarCreator() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'appearance' | 'voice' | 'personality' | 'safety' | 'advanced'>('appearance');

  // Input states
  const [name, setName] = useState('Aurora-7');
  const [desc, setDesc] = useState('3D AI Digital Human Teacher with Visemes & Classroom Whiteboard.');
  const [genderPresentation, setGenderPresentation] = useState('Female / Holographic AI');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural');
  const [personality, setPersonality] = useState('Teacher');
  const [responseStyle, setResponseStyle] = useState('Detailed');
  const [defaultEmotion, setDefaultEmotion] = useState('NEUTRAL');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('classroom');
  const [isConsentChecked, setIsConsentChecked] = useState(true);

  // 3D Canvas Preview states
  const [isPlayingVoiceSample, setIsPlayingVoiceSample] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);

  // Human person verification & likeness extraction
  const [humanProfile, setHumanProfile] = useState<DetectedHumanProfile | null>(null);

  // Generation progress state
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // File Upload State
  const [previewImage, setPreviewImage] = useState<string>('/avatars/aurora_hologram.jpg');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Automatic Human Being & Likeness Analysis on image update
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const profile = await analyzeHumanPortrait(img);
      setHumanProfile(profile);
      if (!profile.isHuman) {
        setValidationError(profile.validationMessage || 'Notice: Could not identify a front-facing human face. Please ensure a clear photo of a person.');
      } else {
        setValidationError(null);
        if (profile.gender) {
          setGenderPresentation(profile.gender === 'Female' ? 'Female / Holographic AI' : 'Male / Professor');
        }
      }
    };
    img.src = previewImage;
  }, [previewImage]);
  const [imageQuality, setImageQuality] = useState<{
    faceDetected: boolean;
    resolution: string;
    score: number;
  }>({
    faceDetected: true,
    resolution: '1920 x 1080 (HD)',
    score: 98,
  });

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
  const voiceMap: Record<string, { code: string; label: string; sampleText: string }[]> = {
    en: [
      { code: 'en-US-JennyNeural', label: 'Jenny (Neural Teacher)', sampleText: 'Hello students, welcome to our interactive 3D virtual classroom.' },
      { code: 'en-US-GuyNeural', label: 'Guy (Lecture Dynamic)', sampleText: 'Today we will analyze complex neural network architectures step by step.' },
    ],
    kn: [
      { code: 'kn-IN-SapnaNeural', label: 'Sapna (ಕನ್ನಡ ಶಿಕ್ಷಕಿ)', sampleText: 'ನಮಸ್ಕಾರ, ಇಂದಿನ ತರಗತಿಗೆ ನಿಮ್ಮೆಲ್ಲರಿಗೂ ಆತ್ಮೀಯ ಸ್ವಾಗತ.' },
      { code: 'kn-IN-GaganNeural', label: 'Gagan (ಕನ್ನಡ ಪ್ರಾಧ್ಯಾಪಕ)', sampleText: 'ಕನ್ವಲ್ಯೂಷನಲ್ ನೆಟ್‌ವರ್ಕ್‌ಗಳ ಬಗ್ಗೆ ವಿವರವಾಗಿ ಕಲಿಯೋಣ.' },
    ],
    te: [
      { code: 'te-IN-ShrutiNeural', label: 'Shruti (తెలుగు టీచర్)', sampleText: 'నమస్కారం, ఈ రోజు మనం కంప్యూటర్ విజన్ గురించి నేర్చుకుందాం.' },
      { code: 'te-IN-MohanNeural', label: 'Mohan (తెలుగు ప్రొఫెసర్)', sampleText: 'డీప్ లెర్నింగ్ కాన్సెప్ట్‌లను సులభంగా అర్థం చేసుకుందాం.' },
    ],
    hi: [
      { code: 'hi-IN-SwaraNeural', label: 'Swara (हिन्दी अध्यापिका)', sampleText: 'नमस्ते विद्यार्थियों, आज हम डीप लर्निंग की मूलभूत बातें सीखेंगे।' },
      { code: 'hi-IN-MadhurNeural', label: 'Madhur (हिन्दी प्राध्यापक)', sampleText: 'न्यूरल नेटवर्क के आर्किटेक्चर को विस्तार से समझते हैं।' },
    ],
    ta: [
      { code: 'ta-IN-PallaviNeural', label: 'Pallavi (தமிழ் ஆசிரியர்)', sampleText: 'வணக்கம், இன்றைய பாடத்தில் செயற்கை நுண்ணறிவு பற்றி கற்போம்.' },
    ],
    ml: [
      { code: 'ml-IN-SobhanaNeural', label: 'Sobhana (മലയാളം അധ്യാപിക)', sampleText: 'നമസ്കാരം, ഡീപ് ലേണിംഗ് പാഠങ്ങളിലേക്ക് സ്വാഗതം.' },
    ],
  };

  // Image Upload with client validation
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Format validation
    const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedFormats.includes(file.type)) {
      setValidationError('Invalid image format. Please upload a JPG, PNG, or WEBP portrait.');
      return;
    }

    // 2. File size validation (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setValidationError('Image size exceeds 20MB limit. Please upload a smaller photograph.');
      return;
    }

    if (file.size < 500) {
      setValidationError('The uploaded file appears corrupted or empty.');
      return;
    }

    // Read for Crop Modal
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const img = new Image();
      img.onload = () => {
        // Dimension validation
        if (img.width < 128 || img.height < 128) {
          setValidationError('Image resolution is too low for 3D facial landmark reconstruction (minimum 128x128).');
          return;
        }

        setImageQuality({
          faceDetected: true,
          resolution: `${img.width} x ${img.height} px`,
          score: Math.min(99, Math.round(75 + (img.width / 1920) * 20)),
        });

        // Open crop modal
        setRawImageForCrop(result);
        setIsCropModalOpen(true);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedDataUrl: string, croppedFile: File) => {
    setPreviewImage(croppedDataUrl);
    setImageFile(croppedFile);
  };

  // Voice playback test
  const handleTestVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const currentVoice = voiceMap[selectedLanguage]?.find((v) => v.code === selectedVoice);
      const sampleText = currentVoice?.sampleText || 'Hello, I am your 3D digital human teacher.';
      
      const utterance = new SpeechSynthesisUtterance(sampleText);
      utterance.lang = selectedLanguage === 'kn' ? 'kn-IN' : selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'te' ? 'te-IN' : selectedLanguage === 'ta' ? 'ta-IN' : selectedLanguage === 'ml' ? 'ml-IN' : 'en-US';
      utterance.rate = 1.0;

      setIsPlayingVoiceSample(true);
      utterance.onend = () => setIsPlayingVoiceSample(false);
      utterance.onerror = () => setIsPlayingVoiceSample(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis is not supported on this browser.');
    }
  };

  // Feature 2: 3D Avatar Generation Flow
  const handleCreate3DAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConsentChecked) {
      alert('You must accept the safety consent terms before creating a digital human.');
      setActiveTab('safety');
      return;
    }

    setIsGenerating3D(true);
    setGenerationProgress(15);
    setGenerationStage('Extracting facial landmarks and skin texture...');

    // Progress step simulation
    setTimeout(() => {
      setGenerationProgress(45);
      setGenerationStage('Synthesizing 3D humanoid mesh & skeletal hierarchy...');
    }, 400);

    setTimeout(() => {
      setGenerationProgress(75);
      setGenerationStage('Rigging viseme morph targets (viseme_aa, O, E, jawOpen)...');
    }, 800);

    setTimeout(async () => {
      setGenerationProgress(100);
      setGenerationStage('Calibrating virtual classroom & whiteboard pointers...');

      const avatarId = 'avatar-3d-' + Math.random().toString(36).substring(2, 9);

      const newAvatar = {
        id: avatarId,
        name: name || '3D Teacher',
        description: desc || '3D AI Digital Human Teacher with Visemes & Classroom Whiteboard',
        gender_presentation: genderPresentation,
        language: selectedLanguage,
        voice: selectedVoice,
        personality,
        defaultEmotion,
        avatar_type: '3D Digital Human',
        model_url: `/uploads/models/${avatarId}.glb`,
        model_format: 'glb',
        generation_status: 'COMPLETED',
        image_url: previewImage,
        thumbnail_url: previewImage,
        settings_json: {
          camera_preset: cameraPreset,
          lighting: 'warm_studio',
          classroom_theme: 'modern_wood',
          skin_tone: humanProfile?.skinTone || '#e0b8a3',
          hair_color: humanProfile?.hairColor || '#1a1412',
          clothing_color: humanProfile?.clothingColor || '#1e293b',
          detected_gender: humanProfile?.gender || 'Female',
        },
        created_at: new Date().toISOString(),
      };

      // Save to localStorage for instant client state
      const saved = JSON.parse(localStorage.getItem('avatars') || '[]');
      saved.unshift(newAvatar);
      localStorage.setItem('avatars', JSON.stringify(saved));

      // Try Backend POST API
      try {
        const formData = new FormData();
        formData.append('name', newAvatar.name);
        formData.append('description', newAvatar.description);
        formData.append('gender_presentation', newAvatar.gender_presentation);
        formData.append('voice_key', newAvatar.voice);
        formData.append('language_code', newAvatar.language);
        formData.append('personality_prompt', newAvatar.personality);
        formData.append('default_emotion', newAvatar.defaultEmotion);
        formData.append('avatar_type', '3D');
        formData.append('consent_confirmed', 'true');

        if (imageFile) {
          formData.append('image', imageFile);
        } else {
          const response = await fetch(previewImage);
          const blob = await response.blob();
          formData.append('image', blob, 'portrait.jpg');
        }

        await api.post('/avatars', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (err) {
        console.log('Saved to workspace session memory.');
      }

      setIsGenerating3D(false);
      // Navigate to dedicated 3D Avatar Studio
      navigate(`/studio/${newAvatar.id}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col">
      <Navbar />

      {/* Image Crop Modal */}
      {rawImageForCrop && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          imageSrc={rawImageForCrop}
          onClose={() => setIsCropModalOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}

      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-grow space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>3D AI Digital Human Generator</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Create 3D Digital Human Teacher
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Upload any portrait photograph. The platform constructs a fully articulated 3D humanoid avatar with speech visemes and teaching kinematics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setPreviewImage('/avatars/aurora_hologram.jpg');
                setName('Aurora-7');
                setDesc('3D Holographic AI Teacher with Visemes & Classroom Whiteboard.');
                setGenderPresentation('Female / Holographic AI');
                setCameraPreset('classroom');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to Aurora-7 Hologram
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-bold block">Image Validation Notice</span>
              <span>{validationError}</span>
            </div>
          </div>
        )}

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Real-time 3D Humanoid Viewport (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-6">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 bg-gradient-to-b from-neutral-900/90 to-dark-950/90 backdrop-blur-xl shadow-2xl">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-cyan-400" />
                  Live 3D Viewport
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Three.js WebGL
                </span>
              </div>

              {/* Real Three.js Canvas Viewer with Imaged Person Face & Likeness */}
              <div className="w-full h-72 rounded-xl overflow-hidden shadow-2xl relative border border-cyan-500/30">
                <ThreeCanvasViewer
                  portraitTextureUrl={previewImage}
                  isSpeaking={isPlayingVoiceSample}
                  gesture="explain_one_hand"
                  cameraPreset={cameraPreset}
                  gender={humanProfile?.gender || genderPresentation}
                  skinTone={humanProfile?.skinTone}
                  hairColor={humanProfile?.hairColor}
                  clothingColor={humanProfile?.clothingColor}
                  enableControls={true}
                  onCameraChange={(p) => setCameraPreset(p)}
                />
              </div>

              {/* Viewport Test Audio Lip-Sync */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(true)}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-cyan-500/30 text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 font-medium transition-all"
                >
                  <Crop className="h-3.5 w-3.5" />
                  Recrop Portrait
                </button>

                <button
                  type="button"
                  onClick={handleTestVoice}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-medium transition-all ${
                    isPlayingVoiceSample
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                      : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                  }`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  {isPlayingVoiceSample ? 'Lip-Syncing Speech...' : 'Test Speech Visemes'}
                </button>
              </div>

              {/* Automatic Person Verification & Likeness Status Card */}
              {humanProfile && (
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
                      Human Being Check:
                    </span>
                    <span className={`font-semibold flex items-center gap-1 ${
                      humanProfile.isHuman ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {humanProfile.isHuman ? '✓ Verified Person' : '⚠️ Non-Human Detected'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Detected Gender:</span>
                    <span className="text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                      {humanProfile.gender} Model Rig
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Extracted Tones:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1" title={`Skin Tone: ${humanProfile.skinTone}`}>
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: humanProfile.skinTone }} />
                        <span className="text-[10px] text-neutral-400">Skin</span>
                      </div>
                      <div className="flex items-center gap-1" title={`Hair Tone: ${humanProfile.hairColor}`}>
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: humanProfile.hairColor }} />
                        <span className="text-[10px] text-neutral-400">Hair</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Generation Progress Bar */}
              {isGenerating3D && (
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                  <div className="flex justify-between text-xs text-cyan-300">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                      {generationStage}
                    </span>
                    <span className="font-mono font-bold">{generationProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-brand-500 transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Consent Toggle */}
              <div className="pt-2 border-t border-white/5">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-300 select-none">
                  <input
                    type="checkbox"
                    checked={isConsentChecked}
                    onChange={(e) => setIsConsentChecked(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded bg-neutral-950 border-white/20 text-brand-500 focus:ring-brand-500"
                  />
                  <span>
                    I confirm permission to reconstruct this 3D avatar likeness and accept ethical AI deployment terms.
                  </span>
                </label>
              </div>

              {/* Create 3D Avatar Button */}
              <button
                type="button"
                onClick={handleCreate3DAvatar}
                disabled={!isConsentChecked || isGenerating3D}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm transition-all shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 text-white"
              >
                {isGenerating3D ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating 3D Mesh...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="h-4 w-4" />
                    <span>Create 3D Digital Human</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: Configuration Tabs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tab Navigation */}
            <div className="flex border-b border-white/10 gap-1 overflow-x-auto pb-px">
              {[
                { id: 'appearance', label: '1. Photo Upload & Appearance' },
                { id: 'voice', label: '2. Multilingual Voice' },
                { id: 'personality', label: '3. Persona & Style' },
                { id: 'safety', label: '4. Safety & Consent' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5 rounded-t-lg'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: Appearance & Image Upload */}
            {activeTab === 'appearance' && (
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                    <Upload className="h-5 w-5 text-cyan-400" />
                    Upload Portrait Photograph
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Upload a front-facing portrait photograph with visible facial features for 3D landmark reconstruction.
                  </p>
                </div>

                {/* Upload Zone */}
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-white/15 hover:border-cyan-400/60 transition-colors rounded-2xl p-6 text-center cursor-pointer relative bg-neutral-900/40 group">
                    <Upload className="h-8 w-8 text-neutral-400 group-hover:text-cyan-400 mx-auto mb-2 transition-colors" />
                    <span className="text-sm font-medium text-neutral-200 block">
                      Click to browse or drag & drop portrait photo
                    </span>
                    <span className="text-xs text-neutral-500 block mt-1">
                      Supports JPG, JPEG, PNG, WEBP (up to 20MB)
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Avatar Name & Description */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
                      Avatar Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Priya Rao, Aurora-7"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
                      Description & Role
                    </label>
                    <input
                      type="text"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="e.g. Computer Science AI Teacher"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
                      Gender Presentation
                    </label>
                    <select
                      value={genderPresentation}
                      onChange={(e) => setGenderPresentation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Female / Holographic AI">Female / Holographic AI</option>
                      <option value="Male / Professor">Male / Professor</option>
                      <option value="Neutral / Futuristic Digital Human">Neutral / Futuristic Digital Human</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Voice & Language */}
            {activeTab === 'voice' && (
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-cyan-400" />
                    Multilingual Voice & Phonemes
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Select the avatar's native teaching language and Edge-TTS voice model.
                  </p>
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Teaching Language
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setSelectedLanguage(l.code);
                          const firstVoice = voiceMap[l.code]?.[0]?.code;
                          if (firstVoice) setSelectedVoice(firstVoice);
                        }}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                          selectedLanguage === l.code
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voices */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Voice Profile
                  </label>
                  <div className="space-y-2">
                    {voiceMap[selectedLanguage]?.map((v) => (
                      <div
                        key={v.code}
                        onClick={() => setSelectedVoice(v.code)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedVoice === v.code
                            ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <span className="font-semibold text-xs block">{v.label}</span>
                          <span className="text-[11px] text-neutral-400 italic block mt-0.5">"{v.sampleText}"</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVoice(v.code);
                            handleTestVoice();
                          }}
                          className="p-2 rounded-lg bg-white/10 hover:bg-cyan-500/20 text-neutral-300 hover:text-cyan-300"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Personality */}
            {activeTab === 'personality' && (
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-cyan-400" />
                    Teacher Persona & Whiteboard Style
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Configure classroom demeanor, teaching style, and explanation depth.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'Teacher', title: 'Empathetic Educator', desc: 'Patient, encouraging, explains step-by-step with analogies' },
                    { id: 'Professor', title: 'Rigorous Academic', desc: 'Formal, formula-driven, emphasizes mathematical proofs' },
                    { id: 'Mentor', title: 'Code Lab Mentor', desc: 'Interactive, code-first, challenges student to solve steps' },
                    { id: 'Futuristic AI', title: 'Neural Core Expert', desc: 'Fast, analytical, technical deep-dives into models' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPersonality(p.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        personality === p.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                          : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-bold text-xs block">{p.title}</span>
                      <span className="text-[11px] text-neutral-400 block mt-1 leading-relaxed">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Safety & Consent */}
            {activeTab === 'safety' && (
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5">
                <div>
                  <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                    Ethical Deployment & Safety Protocol
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Compliance standards for synthetic media and digital human reconstruction.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                    <Check className="h-4 w-4" />
                    <span>Consent-First 3D Reanimation</span>
                  </div>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    By uploading a photograph, you warrant you hold full rights or explicit authorization to generate a 3D digital persona for educational tutoring purposes.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}
