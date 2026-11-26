import React, { useRef, useMemo } from 'react';
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
  gender?: string; // 'Female' | 'Male' | other
  skinTone?: string;
  hairColor?: string;
  clothingColor?: string;
}

export default function ThreeDHumanoidModel({
  portraitTextureUrl,
  isSpeaking,
  gesture = 'idle',
  emotion = 'NEUTRAL',
  wireframe = false,
  gender = 'Female',
  skinTone,
  hairColor,
  clothingColor,
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
  
  // Facial rig references for lip-sync & blinking
  const jawRef = useRef<THREE.Group>(null);
  const upperLipRef = useRef<THREE.Mesh>(null);
  const lowerLipRef = useRef<THREE.Mesh>(null);
  const mouthHoleRef = useRef<THREE.Mesh>(null);
  const teethRef = useRef<THREE.Mesh>(null);
  const leftEyelidRef = useRef<THREE.Mesh>(null);
  const rightEyelidRef = useRef<THREE.Mesh>(null);

  // Load portrait texture for face material projection
  const faceTexture = useLoader(
    THREE.TextureLoader, 
    portraitTextureUrl || '/avatars/aurora_hologram.jpg'
  );
  faceTexture.colorSpace = THREE.SRGBColorSpace;
  faceTexture.wrapS = THREE.ClampToEdgeWrapping;
  faceTexture.wrapT = THREE.ClampToEdgeWrapping;

  // Normalized Gender & Style settings
  const isFemale = (gender || 'Female').toLowerCase().includes('female');
  const baseSkinColor = skinTone || (isFemale ? '#e0b8a3' : '#d2a68a');
  const baseHairColor = hairColor || (isFemale ? '#221510' : '#1a1816');
  const baseClothingColor = clothingColor || (isFemale ? '#1e293b' : '#0f172a');
  const accentColor = '#06b6d4'; // Digital human cyan accent

  // Create curved 3D face mesh geometry so the portrait wraps around the front of the head
  const faceCurvedGeometry = useMemo(() => {
    // Hemisphere curved mask for front of the face
    const geom = new THREE.SphereGeometry(
      0.218, // radius
      32,    // width segments
      32,    // height segments
      -Math.PI / 3.2, // phiStart (curved across the front)
      (2 * Math.PI) / 3.2, // phiLength
      Math.PI / 5.5, // thetaStart
      (Math.PI / 2.1) // thetaLength
    );
    return geom;
  }, []);

  // Lip-sync viseme animation state
  const visemeState = useRef({
    mouthOpen: 0,
    mouthWidth: 1,
    jawDrop: 0,
    blinkFactor: 0,
    nextBlinkTime: 2.2,
  });

  // Animation frame loop with smooth slerp/lerp blending
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Natural Eye Blinking cycle
    if (time > visemeState.current.nextBlinkTime) {
      visemeState.current.blinkFactor = 1;
      visemeState.current.nextBlinkTime = time + 3.2 + Math.random() * 2.2;
    } else {
      visemeState.current.blinkFactor = THREE.MathUtils.lerp(
        visemeState.current.blinkFactor, 
        0, 
        delta * 14
      );
    }

    if (leftEyelidRef.current && rightEyelidRef.current) {
      const lidY = -0.015 + visemeState.current.blinkFactor * 0.025;
      leftEyelidRef.current.position.y = lidY;
      rightEyelidRef.current.position.y = lidY;
    }

    // 2. Realistic 3D Viseme Lip-Syncing
    if (isSpeaking) {
      // Fast, dynamic viseme cadence replicating real speech phonemes (Ah, Oh, Ee, M)
      const primaryPulse = Math.sin(time * 16) * 0.5 + 0.5;
      const secondaryPulse = Math.cos(time * 24) * 0.3;
      const targetMouthOpen = Math.max(0.12, primaryPulse + secondaryPulse * 0.4);
      const targetMouthWidth = 1.0 + Math.sin(time * 10) * 0.22;

      visemeState.current.mouthOpen = THREE.MathUtils.lerp(
        visemeState.current.mouthOpen,
        targetMouthOpen,
        delta * 24
      );
      visemeState.current.mouthWidth = THREE.MathUtils.lerp(
        visemeState.current.mouthWidth,
        targetMouthWidth,
        delta * 20
      );
      visemeState.current.jawDrop = visemeState.current.mouthOpen * 0.038;
    } else {
      visemeState.current.mouthOpen = THREE.MathUtils.lerp(
        visemeState.current.mouthOpen,
        0,
        delta * 16
      );
      visemeState.current.mouthWidth = THREE.MathUtils.lerp(
        visemeState.current.mouthWidth,
        1,
        delta * 16
      );
      visemeState.current.jawDrop = THREE.MathUtils.lerp(
        visemeState.current.jawDrop,
        0,
        delta * 16
      );
    }

    // Apply lip and jaw displacement
    if (jawRef.current) {
      jawRef.current.position.y = -visemeState.current.jawDrop;
    }
    if (lowerLipRef.current) {
      lowerLipRef.current.position.y = -0.076 - visemeState.current.jawDrop * 0.7;
      lowerLipRef.current.scale.x = visemeState.current.mouthWidth;
    }
    if (upperLipRef.current) {
      upperLipRef.current.scale.x = visemeState.current.mouthWidth;
    }
    if (mouthHoleRef.current) {
      mouthHoleRef.current.scale.y = Math.max(0.1, visemeState.current.mouthOpen * 2.2);
      mouthHoleRef.current.scale.x = visemeState.current.mouthWidth;
    }
    if (teethRef.current) {
      teethRef.current.visible = visemeState.current.mouthOpen > 0.25;
    }

    // 3. Subtle breathing & spine sway
    const breathing = Math.sin(time * 1.8) * 0.02;
    if (chestRef.current) {
      chestRef.current.position.y = 1.05 + breathing;
    }

    // 4. Teaching Kinematic Gestures
    let targetHeadRot = { x: 0, y: 0, z: 0 };
    let targetLeftArmRot = { x: 0.1, y: 0, z: 0.2 };
    let targetLeftForearmRot = { x: 0.3, y: 0, z: 0 };
    let targetRightArmRot = { x: 0.1, y: 0, z: -0.2 };
    let targetRightForearmRot = { x: 0.3, y: 0, z: 0 };

    switch (gesture) {
      case 'speaking':
        targetHeadRot = {
          x: Math.sin(time * 3) * 0.04,
          y: Math.cos(time * 2) * 0.05,
          z: Math.sin(time * 1.5) * 0.02,
        };
        targetRightArmRot = {
          x: 0.35 + Math.sin(time * 2.5) * 0.1,
          y: 0.1,
          z: -0.35,
        };
        targetRightForearmRot = {
          x: 0.85 + Math.cos(time * 2.5) * 0.15,
          y: 0.2,
          z: 0,
        };
        break;

      case 'explain_one_hand':
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
        targetHeadRot = { x: -0.18, y: 0.15, z: 0.08 };
        targetRightArmRot = { x: 0.95, y: -0.3, z: -0.4 };
        targetRightForearmRot = { x: 1.6, y: 0.5, z: 0.2 };
        break;

      case 'nodding':
        targetHeadRot = {
          x: Math.sin(time * 5.5) * 0.18,
          y: 0,
          z: 0,
        };
        break;

      case 'greeting':
        targetHeadRot = { x: 0.05, y: 0, z: 0 };
        targetRightArmRot = { x: 1.2, y: 0.1, z: -0.6 };
        targetRightForearmRot = {
          x: 1.0,
          y: 0,
          z: Math.sin(time * 7) * 0.35,
        };
        break;

      case 'celebrating':
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

    const lerpSpeed = delta * 7.0;

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
        <cylinderGeometry args={[isFemale ? 0.21 : 0.24, isFemale ? 0.25 : 0.24, 0.28, 20]} />
        <meshStandardMaterial color={baseClothingColor} roughness={0.7} wireframe={wireframe} />
      </mesh>

      {/* LEGS */}
      <mesh position={[-0.13, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.075, 0.65, 16]} />
        <meshStandardMaterial color={baseClothingColor} roughness={0.8} wireframe={wireframe} />
      </mesh>
      <mesh position={[0.13, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.075, 0.65, 16]} />
        <meshStandardMaterial color={baseClothingColor} roughness={0.8} wireframe={wireframe} />
      </mesh>

      {/* FEET / SHOES */}
      <mesh position={[-0.13, 0.02, 0.05]} castShadow>
        <boxGeometry args={[0.105, 0.055, 0.21]} />
        <meshStandardMaterial color="#0c0d12" roughness={0.3} />
      </mesh>
      <mesh position={[0.13, 0.02, 0.05]} castShadow>
        <boxGeometry args={[0.105, 0.055, 0.21]} />
        <meshStandardMaterial color="#0c0d12" roughness={0.3} />
      </mesh>

      {/* 2. SPINE & TORSO */}
      <group ref={spineRef} position={[0, 0.88, 0]}>
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[isFemale ? 0.22 : 0.26, isFemale ? 0.21 : 0.24, 0.28, 20]} />
          <meshStandardMaterial color={baseClothingColor} roughness={0.6} wireframe={wireframe} />
        </mesh>

        {/* CHEST / TEACHER BLAZER */}
        <group ref={chestRef} position={[0, 0.26, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[isFemale ? 0.27 : 0.33, isFemale ? 0.23 : 0.27, 0.35, 20]} />
            <meshStandardMaterial color={baseClothingColor} roughness={0.5} wireframe={wireframe} />
          </mesh>

          {/* Teacher Shirt / Inner Blouse Collar */}
          <mesh position={[0, 0.12, 0.12]} rotation={[0.2, 0, 0]}>
            <planeGeometry args={[0.14, 0.14]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>

          {/* Teacher Digital Badge */}
          <mesh position={[0.12, 0.09, 0.22]}>
            <boxGeometry args={[0.065, 0.045, 0.01]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.6} />
          </mesh>

          {/* 3. SHOULDERS & ARMS */}
          {/* LEFT ARM */}
          <group ref={leftArmRef} position={[isFemale ? -0.31 : -0.36, 0.12, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color={baseClothingColor} />
            </mesh>
            <mesh position={[-0.04, -0.21, 0]} castShadow>
              <cylinderGeometry args={[0.065, 0.055, 0.36, 16]} />
              <meshStandardMaterial color={baseClothingColor} roughness={0.6} wireframe={wireframe} />
            </mesh>

            {/* Left Forearm & Hand */}
            <group ref={leftForearmRef} position={[-0.05, -0.4, 0]}>
              <mesh position={[0, -0.17, 0]} castShadow>
                <cylinderGeometry args={[0.055, 0.048, 0.3, 16]} />
                <meshStandardMaterial color={baseSkinColor} roughness={0.65} wireframe={wireframe} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.32, 0]} castShadow>
                <boxGeometry args={[0.055, 0.09, 0.028]} />
                <meshStandardMaterial color={baseSkinColor} roughness={0.65} />
              </mesh>
            </group>
          </group>

          {/* RIGHT ARM */}
          <group ref={rightArmRef} position={[isFemale ? 0.31 : 0.36, 0.12, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color={baseClothingColor} />
            </mesh>
            <mesh position={[0.04, -0.21, 0]} castShadow>
              <cylinderGeometry args={[0.065, 0.055, 0.36, 16]} />
              <meshStandardMaterial color={baseClothingColor} roughness={0.6} wireframe={wireframe} />
            </mesh>

            {/* Right Forearm & Hand */}
            <group ref={rightForearmRef} position={[0.05, -0.4, 0]}>
              <mesh position={[0, -0.17, 0]} castShadow>
                <cylinderGeometry args={[0.055, 0.048, 0.3, 16]} />
                <meshStandardMaterial color={baseSkinColor} roughness={0.65} wireframe={wireframe} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.32, 0]} castShadow>
                <boxGeometry args={[0.055, 0.09, 0.028]} />
                <meshStandardMaterial color={baseSkinColor} roughness={0.65} />
              </mesh>
            </group>
          </group>

          {/* 4. NECK */}
          <group ref={neckRef} position={[0, 0.23, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[isFemale ? 0.09 : 0.105, isFemale ? 0.1 : 0.115, 0.15, 20]} />
              <meshStandardMaterial color={baseSkinColor} roughness={0.65} wireframe={wireframe} />
            </mesh>

            {/* 5. ANATOMICAL 3D HEAD OF THE IMAGED PERSON */}
            <group ref={headRef} position={[0, 0.22, 0]}>
              
              {/* Head Cranium & Scalp (Matches exact person skin tone) */}
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.215, 32, 32]} />
                <meshStandardMaterial 
                  color={baseSkinColor} 
                  roughness={0.6} 
                  wireframe={wireframe} 
                />
              </mesh>

              {/* Ears */}
              <mesh position={[-0.205, -0.01, -0.02]} rotation={[0, -0.2, 0]}>
                <boxGeometry args={[0.025, 0.07, 0.045]} />
                <meshStandardMaterial color={baseSkinColor} roughness={0.65} />
              </mesh>
              <mesh position={[0.205, -0.01, -0.02]} rotation={[0, 0.2, 0]}>
                <boxGeometry args={[0.025, 0.07, 0.045]} />
                <meshStandardMaterial color={baseSkinColor} roughness={0.65} />
              </mesh>

              {/* CURVED 3D FACE MASK WITH PERSON'S ACTUAL PHOTO TEXTURE */}
              {/* This seamlessly projects the uploaded face photo onto the 3D curved front of the head */}
              <mesh 
                geometry={faceCurvedGeometry}
                position={[0, 0.005, 0.006]}
                castShadow
              >
                <meshStandardMaterial
                  map={faceTexture}
                  roughness={0.52}
                  metalness={0.04}
                  transparent={false}
                />
              </mesh>

              {/* 3D Nose Bridge Contour for Realistic Depth */}
              <mesh position={[0, 0.005, 0.212]} rotation={[0.1, 0, 0]}>
                <cylinderGeometry args={[0.018, 0.028, 0.075, 12]} />
                <meshStandardMaterial 
                  color={baseSkinColor} 
                  roughness={0.55} 
                  transparent
                  opacity={0.35} 
                />
              </mesh>

              {/* EYE BLINKING LIDS */}
              <group position={[0, 0.045, 0.208]}>
                <mesh ref={leftEyelidRef} position={[-0.062, 0, 0]}>
                  <planeGeometry args={[0.038, 0.018]} />
                  <meshStandardMaterial color={baseSkinColor} roughness={0.6} />
                </mesh>
                <mesh ref={rightEyelidRef} position={[0.062, 0, 0]}>
                  <planeGeometry args={[0.038, 0.018]} />
                  <meshStandardMaterial color={baseSkinColor} roughness={0.6} />
                </mesh>
              </group>

              {/* ARTICULATED 3D JAW & LIP-SYNC RIG */}
              <group ref={jawRef}>
                {/* Chin Contour */}
                <mesh position={[0, -0.155, 0.14]}>
                  <sphereGeometry args={[isFemale ? 0.068 : 0.082, 16, 16]} />
                  <meshStandardMaterial color={baseSkinColor} roughness={0.65} />
                </mesh>
              </group>

              {/* 3D Upper Lip */}
              <mesh ref={upperLipRef} position={[0, -0.052, 0.204]}>
                <boxGeometry args={[0.058, 0.014, 0.018]} />
                <meshStandardMaterial color={baseSkinColor} roughness={0.65} />
              </mesh>

              {/* 3D Lower Lip (moves with speech) */}
              <mesh ref={lowerLipRef} position={[0, -0.076, 0.20]}>
                <boxGeometry args={[0.054, 0.016, 0.018]} />
                <meshStandardMaterial color={baseSkinColor} roughness={0.65} />
              </mesh>

              {/* Dynamic Inner Oral Cavity */}
              <mesh ref={mouthHoleRef} position={[0, -0.064, 0.198]}>
                <boxGeometry args={[0.048, 0.018, 0.02]} />
                <meshStandardMaterial color="#120606" roughness={0.9} />
              </mesh>

              {/* Visible Teeth during speech */}
              <mesh ref={teethRef} position={[0, -0.06, 0.202]} visible={false}>
                <boxGeometry args={[0.038, 0.008, 0.005]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
              </mesh>

              {/* 3D HAIR GEOMETRY (Styled for Gender & Sampled Color) */}
              {isFemale ? (
                /* Female Styled Hair with Volume and Flow */
                <group position={[0, 0.06, 0]}>
                  {/* Top Hair Cap */}
                  <mesh position={[0, 0.04, -0.02]}>
                    <sphereGeometry args={[0.228, 24, 24]} />
                    <meshStandardMaterial color={baseHairColor} roughness={0.75} />
                  </mesh>
                  {/* Side Curls framing face */}
                  <mesh position={[-0.17, -0.1, 0.04]}>
                    <cylinderGeometry args={[0.055, 0.045, 0.28, 12]} />
                    <meshStandardMaterial color={baseHairColor} roughness={0.75} />
                  </mesh>
                  <mesh position={[0.17, -0.1, 0.04]}>
                    <cylinderGeometry args={[0.055, 0.045, 0.28, 12]} />
                    <meshStandardMaterial color={baseHairColor} roughness={0.75} />
                  </mesh>
                  {/* Back Hair Volume */}
                  <mesh position={[0, -0.12, -0.12]}>
                    <cylinderGeometry args={[0.14, 0.18, 0.32, 16]} />
                    <meshStandardMaterial color={baseHairColor} roughness={0.8} />
                  </mesh>
                </group>
              ) : (
                /* Male Styled Short / Parted Professional Haircut */
                <group position={[0, 0.07, 0]}>
                  <mesh position={[0, 0.035, -0.015]}>
                    <sphereGeometry args={[0.224, 24, 24]} />
                    <meshStandardMaterial color={baseHairColor} roughness={0.75} />
                  </mesh>
                  {/* Neat Male Sideburns */}
                  <mesh position={[-0.19, -0.06, 0.02]}>
                    <boxGeometry args={[0.02, 0.09, 0.04]} />
                    <meshStandardMaterial color={baseHairColor} roughness={0.75} />
                  </mesh>
                  <mesh position={[0.19, -0.06, 0.02]}>
                    <boxGeometry args={[0.02, 0.09, 0.04]} />
                    <meshStandardMaterial color={baseHairColor} roughness={0.75} />
                  </mesh>
                </group>
              )}

              {/* Digital Human Neural Aura Halo */}
              <mesh position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.24, 0.007, 16, 32]} />
                <meshStandardMaterial 
                  color={accentColor} 
                  emissive={accentColor} 
                  emissiveIntensity={0.7} 
                  transparent 
                  opacity={0.8} 
                />
              </mesh>

            </group>
          </group>

        </group>
      </group>

      {/* Holographic Floor Emitter */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0.6, 0.72, 32]} />
        <meshStandardMaterial 
          color={accentColor} 
          emissive={accentColor} 
          emissiveIntensity={0.5} 
          transparent 
          opacity={0.5} 
        />
      </mesh>
    </group>
  );
}
