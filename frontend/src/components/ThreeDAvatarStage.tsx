import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Sliders, ShieldCheck, Flag, Volume2, 
  Activity, Eye, Crosshair, RefreshCw, Maximize2, Minimize2 
} from 'lucide-react';

interface ThreeDAvatarStageProps {
  imageUrl: string;
  name: string;
  isSpeaking: boolean;
  isThinking: boolean;
  isRecording: boolean;
  stageMode?: 'hologram' | 'portrait';
  onToggleStageMode?: () => void;
  selectedLanguage?: string;
  emotion?: string;
}

export default function ThreeDAvatarStage({
  imageUrl,
  name,
  isSpeaking,
  isThinking,
  isRecording,
  stageMode = 'hologram',
  onToggleStageMode,
  selectedLanguage = 'en',
  emotion = 'NEUTRAL',
}: ThreeDAvatarStageProps) {
  // 3D Parallax Perspective state
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lip-sync & Facial Animation states
  const [mouthOpen, setMouthOpen] = useState(0); // 0 (closed) to 1 (wide open)
  const [mouthWidth, setMouthWidth] = useState(1); // 0.8 to 1.2
  const [isBlinking, setIsBlinking] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);

  // Mouth/Jaw calibration anchor (percentage of image height/width)
  // Default centered for Aurora-7 and standard portrait photos
  const [mouthPosition, setMouthPosition] = useState<{ x: number; y: number }>({
    x: stageMode === 'hologram' ? 52.8 : 50.0,
    y: stageMode === 'hologram' ? 24.8 : 62.0,
  });
  const [isCalibrating, setIsCalibrating] = useState(false);

  // 1. Natural Eye Blinking cycle (every 3.5 to 5 seconds)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 3800 + Math.random() * 1500);

    return () => clearInterval(blinkInterval);
  }, []);

  // 2. Real-time Lip-Sync Viseme Animation Engine
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      setMouthWidth(1);
      setHeadTilt(0);
      return;
    }

    // Dynamic viseme cadence simulating natural speech phonemes (approx. 9 Visemes/sec)
    let visemeIndex = 0;
    const visemes = [
      { open: 0.85, width: 1.15 }, // 'Ah' / 'A'
      { open: 0.35, width: 1.30 }, // 'Ee' / 'I'
      { open: 0.90, width: 0.85 }, // 'Oh' / 'U'
      { open: 0.15, width: 0.95 }, // 'M' / 'B' / 'P'
      { open: 0.55, width: 1.05 }, // 'Eh' / 'L'
      { open: 0.70, width: 0.90 }, // 'O'
      { open: 0.40, width: 1.20 }, // 'S' / 'T'
      { open: 0.20, width: 1.00 }, // Consonant pause
    ];

    const lipSyncInterval = setInterval(() => {
      visemeIndex = (visemeIndex + 1) % visemes.length;
      const target = visemes[visemeIndex];
      // Introduce micro-jitter for organic realism
      const jitter = (Math.random() - 0.5) * 0.12;
      setMouthOpen(Math.max(0, Math.min(1, target.open + jitter)));
      setMouthWidth(target.width + (Math.random() - 0.5) * 0.08);

      // Subtle talking head nod
      setHeadTilt(Math.sin(Date.now() / 150) * 1.8);
    }, 110);

    return () => clearInterval(lipSyncInterval);
  }, [isSpeaking]);

  // 3. 3D Mouse Parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Smooth 3D tilt angles
    const tiltY = (x / (rect.width / 2)) * 8; // -8 to +8 deg
    const tiltX = -(y / (rect.height / 2)) * 6; // -6 to +6 deg
    setRotateX(tiltX);
    setRotateY(tiltY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Calibration click to adjust mouth position
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCalibrating || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    setMouthPosition({ x: Math.round(clickX * 10) / 10, y: Math.round(clickY * 10) / 10 });
    setIsCalibrating(false);
  };

  return (
    <div className="flex flex-col w-full h-full relative select-none">
      
      {/* 3D Perspective Stage Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleStageClick}
        style={{
          perspective: '1200px',
        }}
        className={`flex-grow bg-black/95 rounded-2xl relative overflow-hidden flex items-center justify-center border transition-all duration-300 ${
          isSpeaking 
            ? 'border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.35)]' 
            : 'border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)]'
        } ${isCalibrating ? 'cursor-crosshair' : 'cursor-default'}`}
      >
        {/* Top HUD Badges */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-950/85 border border-cyan-500/30 text-[10px] text-cyan-300 backdrop-blur-md font-mono shadow-md">
          <ShieldCheck className="h-3 w-3 text-cyan-400" />
          <span>3D NEURAL TALKING HUMAN</span>
        </div>

        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          {/* Active Status Beacon */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-950/85 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono backdrop-blur-md shadow-md">
            <span
              className={`w-2 h-2 rounded-full ${
                isSpeaking 
                  ? 'bg-cyan-400 animate-ping' 
                  : isThinking 
                  ? 'bg-amber-400 animate-spin' 
                  : isRecording 
                  ? 'bg-rose-500 animate-pulse' 
                  : 'bg-emerald-400'
              }`}
            />
            <span>
              {isSpeaking ? 'SPEAKING' : isThinking ? 'THINKING' : isRecording ? 'LISTENING' : 'READY'}
            </span>
          </div>

          {/* Calibrate / Adjust Mouth Anchor Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCalibrating(!isCalibrating);
            }}
            className={`p-1.5 rounded-full border text-xs transition-colors backdrop-blur-md ${
              isCalibrating 
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse' 
                : 'bg-dark-950/80 border-white/10 text-neutral-400 hover:text-cyan-300 hover:border-cyan-500/30'
            }`}
            title="Adjust Lip-Sync Mouth Anchor Position on face"
          >
            <Crosshair className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Futuristic Cybernetic HUD Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none z-20" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none z-20" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none z-20" />

        {/* 3D Parallax Scene Transform Plane */}
        <div
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isSpeaking ? 1.01 : 1})`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.15s ease-out',
          }}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
        >
          {/* Layer 1: Ambient 3D Holographic Backdrop Orb */}
          <div 
            style={{ transform: 'translateZ(-60px)' }}
            className={`absolute w-72 h-72 rounded-full blur-[80px] pointer-events-none transition-colors duration-500 ${
              isSpeaking ? 'bg-cyan-400/35' : 'bg-cyan-500/15'
            }`}
          />

          {/* Layer 2: Holographic Grid Scanlines Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-cyan-500/10 pointer-events-none z-10" />

          {/* Layer 3: The 3D Digital Human Avatar Image */}
          <div
            style={{
              transform: `translateZ(25px) translateY(${isSpeaking ? Math.sin(Date.now() / 200) * 1.5 : 0}px) rotate(${headTilt}deg)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.08s ease-out',
            }}
            className={`relative w-full h-full flex items-center justify-center ${
              stageMode === 'portrait' ? 'p-4' : ''
            }`}
          >
            {stageMode === 'hologram' ? (
              /* Full Scene Holographic Avatar Stage */
              <img
                src={imageUrl || '/avatars/aurora_hologram.jpg'}
                alt={name}
                className={`w-full h-full object-contain pointer-events-none transition-all duration-300 ${
                  isSpeaking ? 'filter brightness-110 drop-shadow-[0_0_35px_rgba(6,182,212,0.5)]' : ''
                }`}
              />
            ) : (
              /* Portrait Talking-Head Focused Circle */
              <div className="relative w-64 h-64 rounded-full border-2 border-cyan-400/80 overflow-hidden flex items-center justify-center bg-dark-950 shadow-[0_0_40px_rgba(6,182,212,0.4)]">
                <img
                  src={imageUrl || '/avatars/aurora_hologram.jpg'}
                  alt={name}
                  className="w-full h-full object-cover object-top scale-150 pointer-events-none"
                />
              </div>
            )}

            {/* Layer 4: Real-Time Dynamic Lip-Sync Mouth Deformation */}
            {/* The mouth aperture opens, widens, and shapes dynamically in sync with audio speech */}
            <div
              style={{
                position: 'absolute',
                left: `${mouthPosition.x}%`,
                top: `${mouthPosition.y}%`,
                transform: `translate(-50%, -50%) scaleX(${mouthWidth}) scaleY(${1 + mouthOpen * 1.6})`,
                opacity: isSpeaking ? 0.95 : 0,
                transformOrigin: 'center center',
                transition: 'opacity 0.2s, transform 0.08s linear',
              }}
              className="pointer-events-none z-20 flex flex-col items-center justify-center"
            >
              {/* Dynamic Animated Viseme Lip Aperture */}
              <div 
                style={{
                  width: stageMode === 'hologram' ? '30px' : '44px',
                  height: `${Math.max(3, mouthOpen * (stageMode === 'hologram' ? 14 : 22))}px`,
                }}
                className="bg-neutral-950/90 border border-cyan-400/70 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)] relative overflow-hidden"
              >
                {/* Upper Teeth Highlight */}
                {mouthOpen > 0.4 && (
                  <div className="w-3/4 h-1 bg-white/70 mx-auto rounded-t-sm" />
                )}
                {/* Tongue / Interior depth */}
                <div className="w-1/2 h-1 bg-rose-400/50 mx-auto mt-auto rounded-full" />
              </div>
            </div>

            {/* Layer 5: Natural Eye Blinking Overlay */}
            {isBlinking && (
              <div
                style={{
                  position: 'absolute',
                  left: `${mouthPosition.x}%`,
                  top: `${mouthPosition.y - (stageMode === 'hologram' ? 3.5 : 8.5)}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="pointer-events-none z-20 flex gap-4 items-center justify-center"
              >
                <div className="w-4 h-1 bg-cyan-400/90 rounded-full shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                <div className="w-4 h-1 bg-cyan-400/90 rounded-full shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
              </div>
            )}

            {/* Calibration Target Indicator */}
            {isCalibrating && (
              <div
                style={{
                  left: `${mouthPosition.x}%`,
                  top: `${mouthPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-40 p-1 rounded-full border-2 border-amber-400 bg-amber-400/20 text-[9px] text-amber-200 font-mono shadow-[0_0_15px_rgba(251,191,36,0.8)] flex items-center gap-1"
              >
                <Crosshair className="h-4 w-4 animate-spin text-amber-300" />
                <span className="bg-black/80 px-1 rounded">MOUTH ANCHOR</span>
              </div>
            )}
          </div>

          {/* Layer 6: Holographic Base Emitter Rings (From Table) */}
          <div 
            style={{ transform: 'translateZ(40px)' }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-10 border border-cyan-400/50 rounded-[100%] shadow-[0_0_20px_rgba(6,182,212,0.5)] pointer-events-none flex items-center justify-center animate-pulse"
          >
            <div className="w-32 h-6 border border-cyan-300/40 rounded-[100%]" />
            <div className="w-16 h-3 bg-cyan-400/20 rounded-[100%] blur-sm" />
          </div>
        </div>

        {/* Audio Waveform Equalizer when speaking */}
        {isSpeaking && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-end gap-1.5 px-4 py-2 bg-dark-950/90 border border-cyan-400/50 rounded-full backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.4)]">
            {[14, 26, 12, 34, 22, 30, 16, 28, 20, 15].map((h, i) => (
              <div
                key={i}
                style={{ 
                  height: `${Math.max(6, (h * (mouthOpen * 0.7 + 0.3)))}px`,
                  transition: 'height 0.08s ease',
                }}
                className="w-1 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-full"
              />
            ))}
            <span className="text-[10px] font-mono font-bold text-cyan-300 ml-2 tracking-wider">
              3D LIP-SYNC ACTIVE
            </span>
          </div>
        )}

        {/* Thinking Overlay */}
        {isThinking && (
          <div className="absolute inset-0 bg-dark-950/75 backdrop-blur-sm flex flex-col items-center justify-center z-40">
            <RefreshCw className="h-9 w-9 text-cyan-400 animate-spin mb-2" />
            <span className="text-xs font-mono text-cyan-300 font-semibold tracking-wider">
              Computing 3D Neural Motion & Visemes...
            </span>
          </div>
        )}

        {/* Calibration instructions banner */}
        {isCalibrating && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-medium backdrop-blur-md text-center shadow-lg">
            Click directly on the avatar's lips/mouth to calibrate speech anchor.
          </div>
        )}

        {/* Bottom Ticker Bar */}
        <div className="absolute bottom-2 left-4 right-4 z-20 flex items-center justify-between text-[9px] font-mono text-neutral-400">
          <span className="flex items-center gap-1 text-cyan-400">
            <Activity className="h-3 w-3" />
            DEPTH: 3D PARALLAX // VISEME LIP-SYNC
          </span>
          <span className="text-neutral-400">
            LANG: {selectedLanguage.toUpperCase()} // EMOTION: {emotion}
          </span>
        </div>
      </div>

      {/* Stage Toolbar */}
      <div className="mt-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {onToggleStageMode && (
            <button
              type="button"
              onClick={onToggleStageMode}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/10 text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              <span>{stageMode === 'hologram' ? 'Switch to Portrait Head' : 'Switch to Full Hologram'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCalibrating(!isCalibrating)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isCalibrating 
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                : 'bg-neutral-900 border-white/10 hover:border-cyan-500/40 text-neutral-400 hover:text-white'
            }`}
          >
            <Crosshair className="h-3.5 w-3.5" />
            <span>{isCalibrating ? 'Click on Lips' : 'Calibrate Lips Anchor'}</span>
          </button>
        </div>

        <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline">
          Interactive: Move mouse to tilt in 3D
        </span>
      </div>

    </div>
  );
}
