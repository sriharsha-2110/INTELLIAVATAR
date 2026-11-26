import * as THREE from 'three';
import { VRM } from '@pixiv/three-vrm';

export type GestureType =
  | 'idle'
  | 'greeting'
  | 'explaining'
  | 'pointing'
  | 'thinking'
  | 'nodding'
  | 'talking';

export class AnimationController {
  private mixer?: THREE.AnimationMixer;
  private actions: Map<string, THREE.AnimationAction> = new Map();
  private vrm?: VRM;
  private scene?: THREE.Group;
  private bones: Map<string, THREE.Bone> = new Map();

  // Animation states
  private currentGesture: GestureType = 'idle';
  private gestureTime = 0;
  private isSpeaking = false;
  private mouthOpenAmount = 0;

  public setup(scene: THREE.Group, animations: THREE.AnimationClip[], vrm?: VRM): void {
    this.scene = scene;
    this.vrm = vrm;
    this.bones.clear();
    this.actions.clear();

    // 1. Traverse and index bones by name (case-insensitive)
    scene.traverse((child) => {
      if ((child as THREE.Bone).isBone) {
        this.bones.set(child.name.toLowerCase(), child as THREE.Bone);
      }
    });

    // 2. Setup AnimationMixer if clips exist
    if (animations.length > 0) {
      this.mixer = new THREE.AnimationMixer(scene);
      animations.forEach((clip) => {
        const action = this.mixer!.clipAction(clip);
        this.actions.set(clip.name.toLowerCase(), action);
      });

      // Play first idle or default animation if present
      const firstAction = this.actions.values().next().value;
      if (firstAction) {
        firstAction.play();
      }
    }
  }

  public setGesture(gesture: GestureType): void {
    this.currentGesture = gesture;
    this.gestureTime = 0;

    // Check if an embedded clip matches gesture
    const clipAction = this.actions.get(gesture.toLowerCase());
    if (clipAction) {
      this.actions.forEach((a) => a.fadeOut(0.3));
      clipAction.reset().fadeIn(0.3).play();
    }
  }

  public setSpeaking(speaking: boolean, mouthAmount = 0): void {
    this.isSpeaking = speaking;
    this.mouthOpenAmount = mouthAmount;
  }

  public update(delta: number): void {
    this.gestureTime += delta;

    // Update AnimationMixer if running
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Update VRM components
    if (this.vrm) {
      this.vrm.update(delta);
      this.updateVRMExpressions();
    }

    // Procedural skeletal dynamics
    this.updateProceduralMotions(this.gestureTime);
  }

  private updateVRMExpressions(): void {
    if (!this.vrm?.expressionManager) return;

    if (this.isSpeaking) {
      // Animate VRM mouth viseme (aa/oh)
      const mouthShape = Math.sin(this.gestureTime * 14) * 0.5 + 0.5;
      this.vrm.expressionManager.setValue('aa', mouthShape * 0.85);
      this.vrm.expressionManager.setValue('ih', (1 - mouthShape) * 0.3);
    } else {
      this.vrm.expressionManager.setValue('aa', 0);
      this.vrm.expressionManager.setValue('ih', 0);
    }

    // Automatic eye blink every ~4 seconds
    const blinkCycle = Math.sin(this.gestureTime * 1.5);
    if (blinkCycle > 0.96) {
      this.vrm.expressionManager.setValue('blink', 1.0);
    } else {
      this.vrm.expressionManager.setValue('blink', 0.0);
    }
  }

  private updateProceduralMotions(time: number): void {
    // 1. Natural Breathing Motion (Spine / Chest)
    const spine = this.findBone(['spine', 'spine1', 'chest', 'upperchest', 'torso']);
    if (spine) {
      const breath = Math.sin(time * 2.0) * 0.02;
      spine.rotation.x = breath;
    }

    // 2. Natural Head Idle Sway
    const head = this.findBone(['head', 'neck']);
    if (head) {
      if (this.currentGesture === 'nodding' || (this.isSpeaking && Math.sin(time * 3) > 0.6)) {
        // Conversational head nod
        head.rotation.x = Math.sin(time * 6.0) * 0.12;
      } else {
        head.rotation.y = Math.sin(time * 0.8) * 0.05;
        head.rotation.z = Math.sin(time * 0.6) * 0.02;
      }
    }

    // 3. Right Arm Gestures
    const rightArm = this.findBone(['rightarm', 'arm_r', 'upperarm_r', 'rightupperarm']);
    const rightForeArm = this.findBone(['rightforearm', 'forearm_r', 'r_forearm']);
    const leftArm = this.findBone(['leftarm', 'arm_l', 'upperarm_l', 'leftupperarm']);
    const leftForeArm = this.findBone(['leftforearm', 'forearm_l', 'l_forearm']);

    switch (this.currentGesture) {
      case 'greeting':
        if (rightArm) rightArm.rotation.z = -1.2 + Math.sin(time * 8.0) * 0.2;
        if (rightForeArm) rightForeArm.rotation.x = -0.8;
        break;

      case 'pointing':
        if (rightArm) {
          rightArm.rotation.x = -1.1;
          rightArm.rotation.y = -0.4;
        }
        if (rightForeArm) rightForeArm.rotation.x = -0.3;
        break;

      case 'explaining':
        if (rightArm) {
          rightArm.rotation.x = -0.6 + Math.sin(time * 3.0) * 0.1;
          rightArm.rotation.z = -0.3;
        }
        if (leftArm) {
          leftArm.rotation.x = -0.6 + Math.sin(time * 3.0 + 1) * 0.1;
          leftArm.rotation.z = 0.3;
        }
        break;

      case 'thinking':
        if (rightArm) {
          rightArm.rotation.x = -1.3;
          rightArm.rotation.y = -0.5;
        }
        if (rightForeArm) rightForeArm.rotation.x = -1.2;
        if (head) head.rotation.z = 0.15;
        break;

      case 'talking':
        if (rightArm) rightArm.rotation.x = -0.3 + Math.sin(time * 4) * 0.08;
        if (leftArm) leftArm.rotation.x = -0.3 + Math.sin(time * 4 + 1.5) * 0.08;
        break;

      case 'idle':
      default:
        // Gentle resting posture
        if (rightArm) rightArm.rotation.set(0, 0, -0.15);
        if (leftArm) leftArm.rotation.set(0, 0, 0.15);
        break;
    }
  }

  private findBone(candidates: string[]): THREE.Bone | undefined {
    for (const name of candidates) {
      for (const [boneName, bone] of this.bones.entries()) {
        if (boneName.includes(name)) return bone;
      }
    }
    return undefined;
  }
}
