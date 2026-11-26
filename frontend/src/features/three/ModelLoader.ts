import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM } from '@pixiv/three-vrm';

export interface LoadedModelResult {
  scene: THREE.Group;
  vrm?: VRM;
  animations: THREE.AnimationClip[];
  isRigged: boolean;
  boneCount: number;
  morphTargetNames: string[];
  skinnedMeshes: THREE.SkinnedMesh[];
  format: 'glb' | 'gltf' | 'vrm';
}

export class ModelLoader {
  private gltfLoader: GLTFLoader;

  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.register((parser) => new VRMLoaderPlugin(parser));
  }

  public async load(url: string, onProgress?: (percent: number) => void): Promise<LoadedModelResult> {
    const isVrm = url.toLowerCase().endsWith('.vrm') || url.includes('.vrm');

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          const vrm = gltf.userData.vrm as VRM | undefined;
          const rootScene = vrm ? vrm.scene : gltf.scene;

          // 1. Analyze Rigging & Morph Targets
          let boneCount = 0;
          const morphTargetNames: Set<string> = new Set();
          const skinnedMeshes: THREE.SkinnedMesh[] = [];

          rootScene.traverse((child) => {
            if ((child as THREE.Bone).isBone) {
              boneCount++;
            }
            if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
              skinnedMeshes.push(child as THREE.SkinnedMesh);
            }
            if ((child as THREE.Mesh).morphTargetDictionary) {
              Object.keys((child as THREE.Mesh).morphTargetDictionary!).forEach((name) => {
                morphTargetNames.add(name);
              });
            }
            // Enable shadows
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // 2. Normalize Scale & Center Model
          const box = new THREE.Box3().setFromObject(rootScene);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Standard human avatar is ~1.7 to 1.8 meters tall
          if (size.y > 0) {
            const desiredHeight = 1.75;
            const scale = desiredHeight / size.y;
            rootScene.scale.set(scale, scale, scale);

            // Recompute bounding box after scale
            const newBox = new THREE.Box3().setFromObject(rootScene);
            const newCenter = newBox.getCenter(new THREE.Vector3());
            const newMin = newBox.min;

            // Ground model to y = 0 and center on x, z
            rootScene.position.x = -newCenter.x;
            rootScene.position.y = -newMin.y;
            rootScene.position.z = -newCenter.z;
          }

          resolve({
            scene: rootScene,
            vrm,
            animations: gltf.animations || [],
            isRigged: boneCount > 0 || (vrm?.humanoid !== undefined),
            boneCount,
            morphTargetNames: Array.from(morphTargetNames),
            skinnedMeshes,
            format: isVrm ? 'vrm' : 'glb',
          });
        },
        (progress) => {
          if (progress.total > 0 && onProgress) {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            onProgress(percent);
          }
        },
        (error: any) => {
          console.error('Error loading 3D avatar:', error);
          reject(new Error(`Failed to load 3D model from ${url}. ${error?.message || ''}`));
        }
      );
    });
  }
}

export const modelLoader = new ModelLoader();
