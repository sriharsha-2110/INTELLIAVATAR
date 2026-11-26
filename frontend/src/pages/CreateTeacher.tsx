import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AvatarCanvas from '../features/three/AvatarCanvas';
import { useAvatarStore, Avatar } from '../store/avatarStore';
import { 
  UploadCloud, Image as ImageIcon, Sparkles, AlertTriangle, 
  CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, Eye, 
  ShieldCheck, Check, Layers, Sliders, Volume2 
} from 'lucide-react';
import axios from 'axios';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

export default function CreateTeacher() {
  const navigate = useNavigate();
  const { demoAvatars, createFromDemo } = useAvatarStore();

  // Wizard Steps (1 to 5)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Photo Upload
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Generation Provider & Demo Fallback
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  const [providerError, setProviderError] = useState<string | null>(null);
  const [selectedDemoId, setSelectedDemoId] = useState<string>('teacher-michelle');

  // Step 3: Model 3D Preview
  const [previewModelUrl, setPreviewModelUrl] = useState<string>('/models/demo/michelle.glb');
  const [modelFormat, setModelFormat] = useState<'glb' | 'gltf' | 'vrm'>('glb');

  // Step 4: Customization
  const [teacherName, setTeacherName] = useState('Professor Sarah');
  const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [teachingStyle, setTeachingStyle] = useState<'friendly' | 'professional' | 'storytelling' | 'step-by-step'>('professional');

  // Handle Photo selection & drag-and-drop
  const handleFileChange = (file: File) => {
    setUploadError(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid format. Please upload a clear JPG, PNG, or WEBP portrait.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit. Please upload an optimized portrait photograph.');
      return;
    }

    setSelectedImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Step 2 Generation Trigger
  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setProviderError(null);
    setGenerationProgress(15);
    setGenerationStage('Uploading portrait photo to 3D pipeline...');

    try {
      // 1. Upload photo to backend
      let uploadedPhotoUrl = imagePreviewUrl || '';
      if (selectedImageFile) {
        const formData = new FormData();
        formData.append('photo', selectedImageFile);
        const uploadRes = await axios.post(`${API_BASE}/avatars/upload`, formData);
        uploadedPhotoUrl = uploadRes.data?.photoUrl || uploadedPhotoUrl;
      }

      setGenerationProgress(40);
      setGenerationStage('Contacting 3D reconstruction provider adapter...');

      // 2. Request Image-to-3D generation
      await axios.post(`${API_BASE}/avatars/generate`, {
        photoUrl: uploadedPhotoUrl,
        name: teacherName,
      });

      // In the event of a configured provider returning a remote model
      setGenerationProgress(100);
      setGenerationStage('3D Avatar ready!');
      setIsGenerating(false);
      setCurrentStep(3);
    } catch (err: any) {
      setIsGenerating(false);
      // As requested:
      // "If no provider API key is configured:
      // - Do not simulate successful image-to-3D generation.
      // - Offer a Demo Avatar Gallery with real, licensed, prebuilt 3D GLB/VRM models.
      // - Let the user select a demo avatar and continue using the application."
      setProviderError(
        err.response?.data?.message ||
        'Image-to-3D provider API key is not configured in environment. Choose a verified licensed 3D model below to continue.'
      );
    }
  };

  // Pick Demo Avatar & proceed to 3D preview
  const handleSelectDemoAvatar = (demo: any) => {
    setSelectedDemoId(demo.id);
    setPreviewModelUrl(demo.modelUrl);
    setModelFormat(demo.modelFormat);
    setTeacherName(demo.name);
    setCurrentStep(3);
  };

  // Step 5 Save
  const handleSaveAvatar = async () => {
    await createFromDemo(selectedDemoId, teacherName);
    navigate('/teachers');
  };

  return (
    <div className="min-h-screen bg-[#0c0f17] text-white flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-grow space-y-6">
        
        {/* Wizard Progress Stepper */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono">
            {[
              { num: 1, title: 'Upload Photo' },
              { num: 2, title: 'Generate 3D' },
              { num: 3, title: '3D Preview' },
              { num: 4, title: 'Customize' },
              { num: 5, title: 'Save Avatar' },
            ].map((step) => {
              const isPast = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-black'
                        : isCurrent
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {isPast ? <Check className="h-4 w-4" /> : step.num}
                  </div>
                  <span className={`hidden sm:inline ${isCurrent ? 'text-white font-bold' : 'text-neutral-400'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: UPLOAD PHOTO */}
        {currentStep === 1 && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Step 1: Upload Portrait Photograph</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Upload a clear portrait to convert into a 3D digital human teacher.
              </p>
            </div>

            {/* Preparation recommendations */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" /> Best Photo Requirements:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-300">
                <li>Front-facing face with natural lighting.</li>
                <li>Neutral or gentle smiling expression.</li>
                <li>Clear background with visible facial features.</li>
                <li>Formats: JPG, JPEG, PNG, WEBP (Maximum size: 10MB).</li>
              </ul>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/15 hover:border-cyan-500/50 rounded-2xl p-8 text-center cursor-pointer bg-neutral-950/60 hover:bg-neutral-950 transition-all flex flex-col items-center justify-center space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {imagePreviewUrl ? (
                <div className="space-y-3">
                  <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-cyan-400/80 shadow-2xl mx-auto">
                    <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs text-cyan-400 hover:underline block">Click or drop to replace photo</span>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-cyan-400">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">
                      Drag and drop portrait photograph here
                    </span>
                    <span className="text-xs text-neutral-400 block mt-0.5">
                      or click to browse your local files
                    </span>
                  </div>
                </>
              )}
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!imagePreviewUrl) {
                    // Use sample default portrait if none uploaded
                    setImagePreviewUrl('/avatars/aurora_hologram.jpg');
                  }
                  setCurrentStep(2);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-xs font-semibold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GENERATE 3D AVATAR & DEMO GALLERY FALLBACK */}
        {currentStep === 2 && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Step 2: 3D Avatar Generation & Selection</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Process uploaded photograph through the 3D humanoid generator or select from our verified licensed 3D model gallery.
              </p>
            </div>

            {/* Provider Status / Generation Trigger */}
            <div className="p-5 rounded-2xl bg-neutral-950 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                    <img src={imagePreviewUrl || '/avatars/aurora_hologram.jpg'} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Uploaded Portrait</span>
                    <span className="text-[10px] text-neutral-400 font-mono">Ready for 3D Rigging Pipeline</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartGeneration}
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  {isGenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  <span>{isGenerating ? 'Processing 3D Model...' : 'Start 3D Generation'}</span>
                </button>
              </div>

              {/* Progress Bar when generating */}
              {isGenerating && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] font-mono text-neutral-300">
                    <span>{generationStage}</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Honest Provider Status: If no external API key, offer genuine Demo Gallery */}
            {providerError && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Image-to-3D Provider Integration Notice</span>
                </div>
                <p className="leading-relaxed text-neutral-300">
                  {providerError}
                </p>
              </div>
            )}

            {/* Demo 3D Avatar Gallery */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  Licensed 3D Demo Avatars Gallery
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">100% Rigged 3D GLB/VRM</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {demoAvatars.map((demo) => {
                  const isSelected = selectedDemoId === demo.id;
                  return (
                    <div
                      key={demo.id}
                      onClick={() => handleSelectDemoAvatar(demo)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/20'
                          : 'bg-neutral-950/80 border-white/10 hover:border-white/25 hover:bg-neutral-900'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                          <img src={demo.photoUrl || '/avatars/demo_michelle.jpg'} alt={demo.name} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 text-[10px] text-cyan-300 font-mono">
                            {demo.modelFormat?.toUpperCase()} 3D
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{demo.name}</h4>
                          <p className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5">{demo.description}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="w-full py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500 hover:text-black text-xs font-semibold transition-all flex items-center justify-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Inspect in 3D</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: 3D PREVIEW */}
        {currentStep === 3 && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">Step 3: Interactive 3D Character Preview</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Rotate, zoom, test facial visemes, and verify genuine 3D mesh geometry.
                </p>
              </div>

              <span className="text-xs text-cyan-400 font-mono px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                Format: {modelFormat.toUpperCase()}
              </span>
            </div>

            {/* Real Three.js Canvas Viewer */}
            <div className="h-[460px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
              <AvatarCanvas
                modelUrl={previewModelUrl}
                voice={selectedVoice}
                language={selectedLanguage}
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Change Model</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-xs font-semibold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25"
              >
                <span>Continue to Customization</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CUSTOMIZATION */}
        {currentStep === 4 && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Step 4: Teacher Customization</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Configure voice, language, and teaching pedagogy for your 3D virtual teacher.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Teacher Name</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. Professor Sarah"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Preferred Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="en">English (US)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="ml">മലയാളം (Malayalam)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Voice Persona</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="en-US-JennyNeural">Jenny (Natural Educator - Female)</option>
                    <option value="en-US-GuyNeural">Guy (Academic Professor - Male)</option>
                    <option value="en-US-AriaNeural">Aria (Expressive Teacher - Female)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Pedagogical Teaching Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'friendly', title: 'Friendly Teacher' },
                    { id: 'professional', title: 'Professional' },
                    { id: 'storytelling', title: 'Storytelling' },
                    { id: 'step-by-step', title: 'Step-by-Step' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setTeachingStyle(style.id as any)}
                      className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                        teachingStyle === style.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-neutral-950 border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {style.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-xs font-semibold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25"
              >
                <span>Review & Save</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SAVE AVATAR */}
        {currentStep === 5 && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Step 5: Confirm & Save Teacher</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Your 3D virtual teacher is ready to be saved and deployed to the virtual classroom.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-950 border border-white/10 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-neutral-900 border border-cyan-500/40 shrink-0">
                <img src={imagePreviewUrl || '/avatars/demo_michelle.jpg'} alt="Avatar" className="w-full h-full object-cover" />
              </div>

              <div className="space-y-1.5 text-xs text-neutral-300 flex-grow">
                <h4 className="text-base font-bold text-white">{teacherName}</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-400 pt-1">
                  <div>3D Format: <span className="text-cyan-300 uppercase">{modelFormat}</span></div>
                  <div>Teaching Style: <span className="text-cyan-300 capitalize">{teachingStyle}</span></div>
                  <div>Language: <span className="text-cyan-300 uppercase">{selectedLanguage}</span></div>
                  <div>Voice: <span className="text-cyan-300">{selectedVoice.split('-')[2]}</span></div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAvatar}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Save 3D Teacher & Enter Classroom</span>
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
