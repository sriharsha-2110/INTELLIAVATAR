import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import ThreeDHumanoidModel, { TeachingGesture } from './ThreeDHumanoidModel';
import { Loader2, Maximize2, RotateCcw, Video, Eye } from 'lucide-react';

export type CameraPreset = 'front' | 'side' | 'full_body' | 'classroom';
export type LightingTheme = 'warm_studio' | 'cyber_hologram' | 'classroom_natural';

interface ThreeCanvasViewerProps {
  portraitTextureUrl: string;
  isSpeaking?: boolean;
  gesture?: TeachingGesture;
  emotion?: string;
  cameraPreset?: CameraPreset;
  lightingTheme?: LightingTheme;
  wireframe?: boolean;
  gender?: string;
  enableControls?: boolean;
  onCameraChange?: (preset: CameraPreset) => void;
}

function CameraRig({ preset }: { preset: CameraPreset }) {
  // Coordinates based on preset
  let position: [number, number, number] = [0, 0.2, 2.5];
  let target: [number, number, number] = [0, 0.15, 0];

  switch (preset) {
    case 'front':
      position = [0, 0.45, 1.25];
      target = [0, 0.4, 0];
      break;
    case 'side':
      position = [1.1, 0.35, 1.35];
      target = [0, 0.3, 0];
      break;
    case 'full_body':
      position = [0, -0.1, 3.4];
      target = [0, -0.2, 0];
      break;
    case 'classroom':
    default:
      position = [-0.5, 0.1, 2.8];
      target = [0, 0.05, 0];
      break;
  }

  return (
    <>
      <PerspectiveCamera makeDefault position={position} fov={45} />
      <OrbitControls
        target={target}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={0.8}
        maxDistance={6.0}
        dampingFactor={0.08}
        maxPolarAngle={Math.PI / 2 + 0.1}
      />
    </>
  );
}

function StudioLights({ theme }: { theme: LightingTheme }) {
  switch (theme) {
    case 'cyber_hologram':
      return (
        <>
          <ambientLight intensity={0.4} color="#082f49" />
          <directionalLight position={[2, 3, 2]} intensity={1.5} color="#06b6d4" castShadow />
          <directionalLight position={[-2, 2, -2]} intensity={1.2} color="#8b5cf6" />
          <pointLight position={[0, -1, 1]} intensity={0.8} color="#06b6d4" />
        </>
      );
    case 'classroom_natural':
      return (
        <>
          <ambientLight intensity={0.85} color="#ffffff" />
          <directionalLight position={[3, 5, 4]} intensity={1.4} color="#fffbeb" castShadow />
          <directionalLight position={[-3, 3, 2]} intensity={0.6} color="#e0f2fe" />
        </>
      );
    case 'warm_studio':
    default:
      return (
        <>
          <ambientLight intensity={0.6} color="#f8fafc" />
          <directionalLight position={[2.5, 4, 3]} intensity={1.8} color="#fef08a" castShadow />
          <directionalLight position={[-3, 2, 2]} intensity={0.9} color="#bae6fd" />
          <directionalLight position={[0, 4, -3]} intensity={1.0} color="#e2e8f0" />
        </>
      );
  }
}

export default function ThreeCanvasViewer({
  portraitTextureUrl,
  isSpeaking = false,
  gesture = 'idle',
  emotion = 'NEUTRAL',
  cameraPreset = 'classroom',
  lightingTheme = 'warm_studio',
  wireframe = false,
  gender = 'female',
  enableControls = true,
  onCameraChange,
}: ThreeCanvasViewerProps) {
  return (
    <div className="relative w-full h-full min-h-[360px] bg-gradient-to-b from-dark-950 via-neutral-950 to-black rounded-2xl overflow-hidden border border-white/10 select-none">
      
      {/* 3D Scene Viewport */}
      <Canvas
        shadows
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        onCreated={({ gl }) => {
          // Optimization: Clean disposal listeners
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('WebGL Context Lost.');
          });
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <Suspense
          fallback={
            null
          }
        >
          <CameraRig preset={cameraPreset} />
          <StudioLights theme={lightingTheme} />

          {/* 3D Humanoid Digital Human Mesh */}
          <ThreeDHumanoidModel
            portraitTextureUrl={portraitTextureUrl}
            isSpeaking={isSpeaking}
            gesture={gesture}
            emotion={emotion}
            wireframe={wireframe}
            gender={gender}
          />

          {/* Realistic Floor Soft Shadow */}
          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.7}
            scale={6}
            blur={2.4}
            far={4}
          />
        </Suspense>
      </Canvas>

      {/* Camera Presets Selector HUD */}
      {enableControls && onCameraChange && (
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-dark-950/80 backdrop-blur-md border border-white/10 text-[10px] text-neutral-300">
          {(['front', 'side', 'full_body', 'classroom'] as CameraPreset[]).map((cam) => (
            <button
              key={cam}
              type="button"
              onClick={() => onCameraChange(cam)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all capitalize ${
                cameraPreset === cam
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              {cam.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Orbit Tip Badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-950/80 border border-white/10 text-[10px] text-neutral-400 font-mono backdrop-blur-md">
        <RotateCcw className="h-3 w-3 text-cyan-400 animate-spin-slow" />
        <span>Drag to orbit • Scroll to zoom</span>
      </div>

      {/* Speaking Indicator Status */}
      {isSpeaking && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-[10px] text-cyan-300 font-mono backdrop-blur-md animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>3D LIP-SYNC VISMES ACTIVE</span>
        </div>
      )}
    </div>
  );
}
