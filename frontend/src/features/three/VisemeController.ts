import * as THREE from 'three';

export type VisemeType = 'AA' | 'EE' | 'IH' | 'OH' | 'OU' | 'FV' | 'MBP' | 'L' | 'TH' | 'NEUTRAL';

export class VisemeController {
  private meshes: THREE.Mesh[] = [];
  private currentViseme: VisemeType = 'NEUTRAL';
  private targetInfluence = 0;

  public setup(scene: THREE.Group): void {
    this.meshes = [];
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).morphTargetDictionary) {
        this.meshes.push(child as THREE.Mesh);
      }
    });
  }

  public setViseme(viseme: VisemeType, weight = 1.0): void {
    this.currentViseme = viseme;
    this.targetInfluence = weight;
    this.applyViseme(viseme, weight);
  }

  public setAudioAmplitude(amplitude: number): void {
    // Fallback when exact phoneme timing is unavailable
    const jawOpen = Math.min(1.0, amplitude * 1.5);
    this.applyMorphTarget(['jawopen', 'mouthopen', 'mouth_open', 'v_aa', 'viseme_aa'], jawOpen);
  }

  private applyViseme(viseme: VisemeType, weight: number): void {
    // Reset mouth visemes
    this.resetVisemes();

    switch (viseme) {
      case 'AA':
        this.applyMorphTarget(['viseme_aa', 'mouthopen', 'jawopen', 'v_aa', 'aa'], weight * 0.9);
        break;
      case 'OH':
      case 'OU':
        this.applyMorphTarget(['viseme_o', 'viseme_u', 'mouthfunnel', 'mouthpucker', 'v_oh', 'oh'], weight * 0.85);
        break;
      case 'EE':
      case 'IH':
        this.applyMorphTarget(['viseme_e', 'viseme_i', 'mouthsmile', 'mouthwide', 'v_ee', 'ee'], weight * 0.7);
        break;
      case 'MBP':
        this.applyMorphTarget(['viseme_pp', 'mouthclose', 'mouthpress', 'v_mbp'], weight * 0.9);
        break;
      case 'FV':
        this.applyMorphTarget(['viseme_ff', 'v_fv'], weight * 0.8);
        break;
      case 'L':
      case 'TH':
        this.applyMorphTarget(['viseme_th', 'tongueout', 'v_th'], weight * 0.6);
        break;
      case 'NEUTRAL':
      default:
        break;
    }
  }

  private applyMorphTarget(targetNames: string[], value: number): void {
    this.meshes.forEach((mesh) => {
      const dict = mesh.morphTargetDictionary;
      const influences = mesh.morphTargetInfluences;
      if (!dict || !influences) return;

      for (const [key, index] of Object.entries(dict)) {
        const lowerKey = key.toLowerCase();
        for (const target of targetNames) {
          if (lowerKey.includes(target)) {
            influences[index] = value;
          }
        }
      }
    });
  }

  private resetVisemes(): void {
    const mouthKeys = ['viseme', 'mouth', 'jaw', 'lip', 'v_'];
    this.meshes.forEach((mesh) => {
      const dict = mesh.morphTargetDictionary;
      const influences = mesh.morphTargetInfluences;
      if (!dict || !influences) return;

      for (const [key, index] of Object.entries(dict)) {
        const lowerKey = key.toLowerCase();
        if (mouthKeys.some((k) => lowerKey.includes(k))) {
          influences[index] = 0;
        }
      }
    });
  }
}
