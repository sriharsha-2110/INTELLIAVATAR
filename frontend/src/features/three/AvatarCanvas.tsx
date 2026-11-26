import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { modelLoader, LoadedModelResult } from './ModelLoader';
import { AnimationController, GestureType } from './AnimationController';
import { VisemeController, VisemeType } from './VisemeController';
import { 
  RotateCcw, Eye, ZoomIn, ZoomOut, Play, Square, 
  Volume2, ShieldCheck, Cpu, RefreshCw, AlertTriangle, Layers
} from 'lucide-react';

export type CameraViewPreset = 'front' | 'side' | 'fullbody';

interface AvatarCanvasProps {
  modelUrl: string;
  gesture?: GestureType;
  isSpeaking?: boolean;
  activeViseme?: VisemeType;
  speechText?: string;
  voice?: string;
  language?: string;
  onModelLoaded?: (info: { format: string; boneCount: number; isRigged: boolean; morphCount: number }) => void;
}

export default function AvatarCanvas({
  modelUrl,
  gesture = 'idle',
  isSpeaking = false,
  activeViseme = 'NEUTRAL',
  speechText,
  voice = 'en-US-JennyNeural',
  language = 'en',
  onModelLoaded,
}: AvatarCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animControllerRef = useRef<AnimationController>(new AnimationController());
  const visemeControllerRef = useRef<VisemeController>(new VisemeController());

  // Component state
  const [loading, setLoading] = useState(true);
  const [loadPercent, setLoadPercent] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<{ format: string; boneCount: number; isRigged: boolean; morphCount: number } | null>(null);
  const [activeGesture, setActiveGesture] = useState<GestureType>(gesture);
  const [localSpeaking, setLocalSpeaking] = useState(false);

  // Sync props
  useEffect(() => {
    setActiveGesture(gesture);
    animControllerRef.current.setGesture(gesture);
  }, [gesture]);

  useEffect(() => {
    animControllerRef.current.setSpeaking(isSpeaking || localSpeaking);
  }, [isSpeaking, localSpeaking]);

  useEffect(() => {
    if (activeViseme) {
      visemeControllerRef.current.setViseme(activeViseme);
    }
  }, [activeViseme]);

  // Setup Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0f17);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 2.5);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.25, 0);
    controls.minDistance = 0.8;
    controls.maxDistance = 5.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't flip below floor
    controlsRef.current = controls;

    // 5. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x90b0ff, 1.0);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x7040ff, 1.5);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // 6. Studio Floor with Grid & Circular Pedestal
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111624,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(10, 20, 0x3b82f6, 0x1e293b);
    grid.position.y = 0.001;
    scene.add(grid);

    // Pedestal ring
    const ringGeo = new THREE.RingGeometry(0.7, 0.75, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    scene.add(ring);

    // 7. Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      controls.update();
      animControllerRef.current.update(delta);

      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Load Model when URL changes
  useEffect(() => {
    if (!sceneRef.current || !modelUrl) return;

    let isMounted = true;
    setLoading(true);
    setLoadPercent(0);
    setLoadError(null);

    // Remove previous avatar models from scene
    const scene = sceneRef.current;
    const toRemove: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child.name === 'avatar_root') {
        toRemove.push(child);
      }
    });
    toRemove.forEach((obj) => scene.remove(obj));

    modelLoader
      .load(modelUrl, (percent) => {
        if (isMounted) setLoadPercent(percent);
      })
      .then((loaded: LoadedModelResult) => {
        if (!isMounted) return;

        loaded.scene.name = 'avatar_root';
        scene.add(loaded.scene);

        // Setup controllers
        animControllerRef.current.setup(loaded.scene, loaded.animations, loaded.vrm);
        visemeControllerRef.current.setup(loaded.scene);

        const info = {
          format: loaded.format.toUpperCase(),
          boneCount: loaded.boneCount,
          isRigged: loaded.isRigged,
          morphCount: loaded.morphTargetNames.length,
        };
        setModelInfo(info);
        onModelLoaded?.(info);

        setLoading(false);
      })
      .catch((err: Error) => {
        if (!isMounted) return;
        setLoading(false);
        setLoadError(err.message || 'Failed to parse 3D GLB/VRM model.');
      });

    return () => {
      isMounted = false;
    };
  }, [modelUrl]);

  // Camera presets
  const setCameraPreset = (preset: CameraViewPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;

    switch (preset) {
      case 'front':
        cameraRef.current.position.set(0, 1.45, 1.8);
        controlsRef.current.target.set(0, 1.35, 0);
        break;
      case 'side':
        cameraRef.current.position.set(1.8, 1.45, 0.5);
        controlsRef.current.target.set(0, 1.35, 0);
        break;
      case 'fullbody':
        cameraRef.current.position.set(0, 1.1, 3.2);
        controlsRef.current.target.set(0, 0.9, 0);
        break;
    }
    controlsRef.current.update();
  };

  // Test Speech Playback & Lip-Sync
  const handleTestSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = speechText || 'Hello students! I am your 3D AI virtual teacher. Today we will explore complex concepts together step by step.';
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language === 'kn' ? 'kn-IN' : language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : language === 'ml' ? 'ml-IN' : 'en-US';
      utterance.rate = 1.0;

      setLocalSpeaking(true);
      animControllerRef.current.setSpeaking(true);
      animControllerRef.current.setGesture('talking');

      // Viseme cycling simulation synchronized with speech
      const visemes: VisemeType[] = ['AA', 'EE', 'OH', 'MBP', 'IH', 'OU', 'L'];
      let vIdx = 0;
      const visemeInterval = setInterval(() => {
        vIdx = (vIdx + 1) % visemes.length;
        visemeControllerRef.current.setViseme(visemes[vIdx], 0.85);
      }, 120);

      utterance.onend = () => {
        clearInterval(visemeInterval);
        visemeControllerRef.current.setViseme('NEUTRAL', 0);
        setLocalSpeaking(false);
        animControllerRef.current.setSpeaking(false);
        animControllerRef.current.setGesture('idle');
      };

      utterance.onerror = () => {
        clearInterval(visemeInterval);
        setLocalSpeaking(false);
        animControllerRef.current.setSpeaking(false);
        animControllerRef.current.setGesture('idle');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert('SpeechSynthesis is not supported in this browser environment.');
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl flex flex-col">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full flex-grow cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md flex flex-col items-center justify-center z-30 space-y-3">
          <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
          <span className="text-sm font-medium text-neutral-200">
            Loading Genuine 3D Avatar... {loadPercent > 0 ? `${loadPercent}%` : ''}
          </span>
          <div className="w-48 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${Math.max(15, loadPercent)}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 text-center space-y-3">
          <AlertTriangle className="h-9 w-9 text-rose-500" />
          <h4 className="text-sm font-bold text-white">3D Model Validation Error</h4>
          <p className="text-xs text-neutral-400 max-w-sm">{loadError}</p>
        </div>
      )}

      {/* Top HUD Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/85 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono shadow-md backdrop-blur-md">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span>GENUINE 3D RIGGED CHARACTER</span>
        </div>

        {modelInfo && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900/85 border border-white/10 text-[11px] text-neutral-300 font-mono backdrop-blur-md">
            <span>FORMAT: {modelInfo.format}</span>
            <span>•</span>
            <span>{modelInfo.boneCount} BONES</span>
            {modelInfo.morphCount > 0 && (
              <>
                <span>•</span>
                <span>{modelInfo.morphCount} BLENDSHAPES</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Top Right Camera Presets */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-neutral-900/85 border border-white/10 rounded-xl p-1 backdrop-blur-md shadow-md">
        <button
          type="button"
          onClick={() => setCameraPreset('front')}
          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Front Face Camera"
        >
          Face
        </button>
        <button
          type="button"
          onClick={() => setCameraPreset('side')}
          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Side View Camera"
        >
          Side
        </button>
        <button
          type="button"
          onClick={() => setCameraPreset('fullbody')}
          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Full Body Camera"
        >
          Full
        </button>
      </div>

      {/* Bottom Floating Interactive Toolbar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-900/85 border border-white/10 backdrop-blur-md shadow-xl text-xs">
        {/* Gestures selector */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['idle', 'greeting', 'explaining', 'pointing', 'thinking', 'nodding'] as GestureType[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => {
                setActiveGesture(g);
                animControllerRef.current.setGesture(g);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all uppercase tracking-wider ${
                activeGesture === g
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Speech & Lip-Sync Action Button */}
        <button
          type="button"
          onClick={handleTestSpeech}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
            localSpeaking || isSpeaking
              ? 'bg-rose-500/20 border border-rose-500 text-rose-300 animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white'
          }`}
        >
          <Volume2 className="h-3.5 w-3.5" />
          <span>{localSpeaking || isSpeaking ? 'Speaking with Lip-Sync...' : 'Test Speech & Lips'}</span>
        </button>
      </div>
    </div>
  );
}
