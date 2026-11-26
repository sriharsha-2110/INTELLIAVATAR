import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export type TeachingGesture = 
  | 'idle' 
  | 'speaking' 
  | 'explain_one_hand' 
  | 'explain_two_hands' 
  | 'point_left' 
  | 'point_right' 
  | 'thinking' 
  | 'nodding' 
  | 'greeting' 
  | 'celebrating';

interface ThreeDHumanoidModelProps {
  portraitTextureUrl: string;
  isSpeaking: boolean;
  gesture?: TeachingGesture;
  emotion?: string;
  wireframe?: boolean;
  gender?: string;
}

export default function ThreeDHumanoidModel({
  portraitTextureUrl,
  isSpeaking,
  gesture = 'idle',
  emotion = 'NEUTRAL',
  wireframe = false,
  gender = 'female',
}: ThreeDHumanoidModelProps) {
  // References to skeletal joints
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const neckRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  // Load portrait texture for face material projection
  const faceTexture = useLoader(
    THREE.TextureLoader, 
    portraitTextureUrl || '/avatars/aurora_hologram.jpg'
  );
  faceTexture.colorSpace = THREE.SRGBColorSpace;

  // Shader / Material properties
  const isFemale = (gender || '').toLowerCase().includes('female');
  const skinColor = isFemale ? '#e0b8a3' : '#d2a68a';
  const clothingColor = isFemale ? '#1e293b' : '#0f172a';
  const accentColor = '#06b6d4'; // Cyber cyan

  // Lip-sync viseme timer
  const visemeState = useRef({
    mouthOpen: 0,
    mouthWidth: 1,
    jawRotation: 0,
    blinkFactor: 0,
    nextBlinkTime: 2.5,
  });

  // Animation frame loop with smooth slerp/lerp blending
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Natural Eye Blinking cycle
    if (time > visemeState.current.nextBlinkTime) {
      visemeState.current.blinkFactor = 1;
      visemeState.current.nextBlinkTime = time + 3.0 + Math.random() * 2.5;
    } else {
      visemeState.current.blinkFactor = THREE.MathUtils.lerp(
        visemeState.current.blinkFactor, 
        0, 
        delta * 14
      );
    }

    if (leftEyeRef.current && rightEyeRef.current) {
      const eyeScaleY = Math.max(0.08, 1 - visemeState.current.blinkFactor);
      leftEyeRef.current.scale.y = eyeScaleY;
      rightEyeRef.current.scale.y = eyeScaleY;
    }

    // 2. Lip-Sync Phoneme Extraction & Mouth blendshapes
    if (isSpeaking) {
      const speechCadence = Math.sin(time * 18) * 0.5 + 0.5;
      const phonemeJitter = Math.cos(time * 26) * 0.3;
      const targetMouthOpen = Math.max(0.1, speechCadence + phonemeJitter * 0.5);
      const targetMouthWidth = 1 + Math.sin(time * 12) * 0.25;

      visemeState.current.mouthOpen = THREE.MathUtils.lerp(
        visemeState.current.mouthOpen,
        targetMouthOpen,
        delta * 22
      );
      visemeState.current.mouthWidth = THREE.MathUtils.lerp(
        visemeState.current.mouthWidth,
        targetMouthWidth,
        delta * 18
      );
      visemeState.current.jawRotation = visemeState.current.mouthOpen * 0.22;
    } else {
      visemeState.current.mouthOpen = THREE.MathUtils.lerp(
        visemeState.current.mouthOpen,
        0,
        delta * 15
      );
      visemeState.current.mouthWidth = THREE.MathUtils.lerp(
        visemeState.current.mouthWidth,
        1,
        delta * 15
      );
      visemeState.current.jawRotation = THREE.MathUtils.lerp(
        visemeState.current.jawRotation,
        0,
        delta * 15
      );
    }

    if (mouthRef.current) {
      mouthRef.current.scale.y = Math.max(0.1, visemeState.current.mouthOpen * 2.0);
      mouthRef.current.scale.x = visemeState.current.mouthWidth;
    }
    if (jawRef.current) {
      jawRef.current.rotation.x = visemeState.current.jawRotation;
    }

    // 3. Subtle breathing & spine sway
    const breathing = Math.sin(time * 1.8) * 0.02;
    if (chestRef.current) {
      chestRef.current.position.y = 1.05 + breathing;
    }

    // 4. Kinematic Teaching Gestures Animation Matrix
    let targetHeadRot = { x: 0, y: 0, z: 0 };
    let targetLeftArmRot = { x: 0.1, y: 0, z: 0.2 };
    let targetLeftForearmRot = { x: 0.3, y: 0, z: 0 };
    let targetRightArmRot = { x: 0.1, y: 0, z: -0.2 };
    let targetRightForearmRot = { x: 0.3, y: 0, z: 0 };

    switch (gesture) {
      case 'speaking':
        targetHeadRot = {
          x: Math.sin(time * 3) * 0.04,
          y: Math.cos(time * 2) * 0.06,
          z: Math.sin(time * 1.5) * 0.02,
        };
        targetRightArmRot = {
          x: 0.3 + Math.sin(time * 2.5) * 0.1,
          y: 0.1,
          z: -0.35,
        };
        targetRightForearmRot = {
          x: 0.8 + Math.cos(time * 2.5) * 0.15,
          y: 0.2,
          z: 0,
        };
        break;

      case 'explain_one_hand':
        // Explaining actively with right arm raised & gesturing
        targetHeadRot = { x: 0.05, y: -0.1, z: 0 };
        targetRightArmRot = {
          x: 0.5 + Math.sin(time * 3) * 0.08,
          y: 0.2,
          z: -0.5,
        };
        targetRightForearmRot = {
          x: 1.1 + Math.cos(time * 3) * 0.12,
          y: 0.4,
          z: 0.1,
        };
        break;

      case 'explain_two_hands':
        // Both hands elevated open to class
        targetHeadRot = { x: -0.05, y: 0, z: 0 };
        targetLeftArmRot = {
          x: 0.45 + Math.sin(time * 2) * 0.06,
          y: -0.2,
          z: 0.5,
        };
        targetLeftForearmRot = {
          x: 1.0 + Math.cos(time * 2) * 0.1,
          y: -0.3,
          z: 0,
        };
        targetRightArmRot = {
          x: 0.45 + Math.sin(time * 2) * 0.06,
          y: 0.2,
          z: -0.5,
        };
        targetRightForearmRot = {
          x: 1.0 + Math.cos(time * 2) * 0.1,
          y: 0.3,
          z: 0,
        };
        break;

      case 'point_left':
        // Turn body slightly and point left arm directly at the digital whiteboard
        targetHeadRot = { x: 0.02, y: 0.45, z: 0 };
        targetLeftArmRot = { x: 0.85, y: 0.4, z: 0.7 };
        targetLeftForearmRot = { x: 0.4, y: 0.1, z: 0.1 };
        targetRightArmRot = { x: 0.1, y: 0, z: -0.2 };
        break;

      case 'point_right':
        targetHeadRot = { x: 0.02, y: -0.45, z: 0 };
        targetRightArmRot = { x: 0.85, y: -0.4, z: -0.7 };
        targetRightForearmRot = { x: 0.4, y: -0.1, z: -0.1 };
        break;

      case 'thinking':
        // Right hand at chin, head tilted up
        targetHeadRot = { x: -0.18, y: 0.15, z: 0.08 };
        targetRightArmRot = { x: 0.95, y: -0.3, z: -0.4 };
        targetRightForearmRot = { x: 1.6, y: 0.5, z: 0.2 };
        break;

      case 'nodding':
        // Head nodding in agreement
        targetHeadRot = {
          x: Math.sin(time * 5.5) * 0.18,
          y: 0,
          z: 0,
        };
        break;

      case 'greeting':
        // Welcoming hand wave
        targetHeadRot = { x: 0.05, y: 0, z: 0 };
        targetRightArmRot = { x: 1.2, y: 0.1, z: -0.6 };
        targetRightForearmRot = {
          x: 1.0,
          y: 0,
          z: Math.sin(time * 7) * 0.35,
        };
        break;

      case 'celebrating':
        // Both arms raised high in thumbs-up / celebration
        targetHeadRot = { x: -0.15, y: 0, z: 0 };
        targetLeftArmRot = { x: 1.4, y: -0.2, z: 0.8 };
        targetLeftForearmRot = { x: 0.6, y: 0, z: 0 };
        targetRightArmRot = { x: 1.4, y: 0.2, z: -0.8 };
        targetRightForearmRot = { x: 0.6, y: 0, z: 0 };
        break;

      case 'idle':
      default:
        targetHeadRot = {
          x: Math.sin(time * 1.2) * 0.03,
          y: Math.cos(time * 0.8) * 0.04,
          z: 0,
        };
        targetRightArmRot = { x: 0.15, y: 0, z: -0.25 };
        targetLeftArmRot = { x: 0.15, y: 0, z: 0.25 };
        break;
    }

    // Smooth blending interpolation using lerp
    const lerpSpeed = delta * 6.5;

    if (headRef.current) {
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetHeadRot.x, lerpSpeed);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetHeadRot.y, lerpSpeed);
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, targetHeadRot.z, lerpSpeed);
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, targetLeftArmRot.x, lerpSpeed);
      leftArmRef.current.rotation.y = THREE.MathUtils.lerp(leftArmRef.current.rotation.y, targetLeftArmRot.y, lerpSpeed);
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, targetLeftArmRot.z, lerpSpeed);
    }

    if (leftForearmRef.current) {
      leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, targetLeftForearmRot.x, lerpSpeed);
      leftForearmRef.current.rotation.y = THREE.MathUtils.lerp(leftForearmRef.current.rotation.y, targetLeftForearmRot.y, lerpSpeed);
      leftForearmRef.current.rotation.z = THREE.MathUtils.lerp(leftForearmRef.current.rotation.z, targetLeftForearmRot.z, lerpSpeed);
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, targetRightArmRot.x, lerpSpeed);
      rightArmRef.current.rotation.y = THREE.MathUtils.lerp(rightArmRef.current.rotation.y, targetRightArmRot.y, lerpSpeed);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, targetRightArmRot.z, lerpSpeed);
    }

    if (rightForearmRef.current) {
      rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(rightForearmRef.current.rotation.x, targetRightForearmRot.x, lerpSpeed);
      rightForearmRef.current.rotation.y = THREE.MathUtils.lerp(rightForearmRef.current.rotation.y, targetRightForearmRot.y, lerpSpeed);
      rightForearmRef.current.rotation.z = THREE.MathUtils.lerp(rightForearmRef.current.rotation.z, targetRightForearmRot.z, lerpSpeed);
    }
  });

  return (
    <group ref={rootRef} position={[0, -1.2, 0]}>
      
      {/* 1. PELVIS & HIPS */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.24, 0.28, 16]} />
        <meshStandardMaterial color={clothingColor} roughness={0.7} wireframe={wireframe} />
      </mesh>

      {/* LEGS */}
      <mesh position={[-0.14, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.08, 0.65, 12]} />
        <meshStandardMaterial color={clothingColor} roughness={0.8} wireframe={wireframe} />
      </mesh>
      <mesh position={[0.14, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.08, 0.65, 12]} />
        <meshStandardMaterial color={clothingColor} roughness={0.8} wireframe={wireframe} />
      </mesh>

      {/* FEET / SHOES */}
      <mesh position={[-0.14, 0.02, 0.05]} castShadow>
        <boxGeometry args={[0.11, 0.06, 0.22]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.4} />
      </mesh>
      <mesh position={[0.14, 0.02, 0.05]} castShadow>
        <boxGeometry args={[0.11, 0.06, 0.22]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.4} />
      </mesh>

      {/* 2. SPINE & CHEST */}
      <group ref={spineRef} position={[0, 0.88, 0]}>
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.22, 0.28, 16]} />
          <meshStandardMaterial color={clothingColor} roughness={0.6} wireframe={wireframe} />
        </mesh>

        <group ref={chestRef} position={[0, 0.26, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.26, 0.34, 16]} />
            <meshStandardMaterial color={clothingColor} roughness={0.5} wireframe={wireframe} />
          </mesh>

          {/* Teacher Badge / Neural Accent Line */}
          <mesh position={[0.12, 0.08, 0.26]}>
            <boxGeometry args={[0.08, 0.05, 0.01]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.6} />
          </mesh>

          {/* 3. SHOULDERS & ARMS */}
          {/* LEFT SHOULDER & ARM */}
          <group ref={leftArmRef} position={[-0.34, 0.12, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.09, 12, 12]} />
              <meshStandardMaterial color={clothingColor} />
            </mesh>
            <mesh position={[-0.04, -0.22, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.06, 0.38, 12]} />
              <meshStandardMaterial color={clothingColor} roughness={0.6} wireframe={wireframe} />
            </mesh>

            {/* Left Forearm & Hand */}
            <group ref={leftForearmRef} position={[-0.05, -0.42, 0]}>
              <mesh position={[0, -0.18, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.05, 0.32, 12]} />
                <meshStandardMaterial color={skinColor} roughness={0.7} wireframe={wireframe} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.34, 0]} castShadow>
                <boxGeometry args={[0.06, 0.1, 0.03]} />
                <meshStandardMaterial color={skinColor} roughness={0.7} />
              </mesh>
            </group>
          </group>

          {/* RIGHT SHOULDER & ARM */}
          <group ref={rightArmRef} position={[0.34, 0.12, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.09, 12, 12]} />
              <meshStandardMaterial color={clothingColor} />
            </mesh>
            <mesh position={[0.04, -0.22, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.06, 0.38, 12]} />
              <meshStandardMaterial color={clothingColor} roughness={0.6} wireframe={wireframe} />
            </mesh>

            {/* Right Forearm & Hand */}
            <group ref={rightForearmRef} position={[0.05, -0.42, 0]}>
              <mesh position={[0, -0.18, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.05, 0.32, 12]} />
                <meshStandardMaterial color={skinColor} roughness={0.7} wireframe={wireframe} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.34, 0]} castShadow>
                <boxGeometry args={[0.06, 0.1, 0.03]} />
                <meshStandardMaterial color={skinColor} roughness={0.7} />
              </mesh>
            </group>
          </group>

          {/* 4. NECK */}
          <group ref={neckRef} position={[0, 0.22, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.1, 0.11, 0.16, 16]} />
              <meshStandardMaterial color={skinColor} roughness={0.7} wireframe={wireframe} />
            </mesh>

            {/* 5. HEAD & FACIAL BLENDSHAPES */}
            <group ref={headRef} position={[0, 0.22, 0]}>
              
              {/* Head Cranium */}
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.22, 24, 24]} />
                <meshStandardMaterial color={skinColor} roughness={0.65} wireframe={wireframe} />
              </mesh>

              {/* Hair Geometry */}
              <mesh position={[0, 0.06, -0.04]}>
                <sphereGeometry args={[0.23, 20, 20]} />
                <meshStandardMaterial color="#1a1412" roughness={0.8} />
              </mesh>

              {/* Front Face Projection Plane with Portrait Texture */}
              <mesh position={[0, 0.01, 0.185]} rotation={[0, 0, 0]}>
                <planeGeometry args={[0.28, 0.28]} />
                <meshStandardMaterial
                  map={faceTexture}
                  roughness={0.5}
                  metalness={0.05}
                  transparent
                  opacity={0.92}
                />
              </mesh>

              {/* Eyes with Blinking Morph Target */}
              <group position={[0, 0.04, 0.20]}>
                <mesh ref={leftEyeRef} position={[-0.065, 0, 0]}>
                  <sphereGeometry args={[0.024, 12, 12]} />
                  <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.3} />
                </mesh>
                <mesh ref={rightEyeRef} position={[0.065, 0, 0]}>
                  <sphereGeometry args={[0.024, 12, 12]} />
                  <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.3} />
                </mesh>
              </group>

              {/* Articulated Jaw with Morph Target Rotation */}
              <mesh ref={jawRef} position={[0, -0.09, 0.17]}>
                <boxGeometry args={[0.11, 0.035, 0.04]} />
                <meshStandardMaterial color={skinColor} roughness={0.7} />
              </mesh>

              {/* Lip-Sync Viseme Aperture */}
              <mesh ref={mouthRef} position={[0, -0.068, 0.205]}>
                <sphereGeometry args={[0.032, 16, 16]} />
                <meshStandardMaterial 
                  color="#1a0a0a" 
                  roughness={0.9} 
                />
              </mesh>

              {/* Holographic Neural Aura Halo for 3D AI Digital Human */}
              <mesh position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.24, 0.008, 16, 32]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} />
              </mesh>

            </group>
          </group>

        </group>
      </group>

      {/* Pedestal Base / Holographic Floor Ring */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0.6, 0.75, 32]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
