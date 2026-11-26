export interface DemoAvatar {
  id: string;
  name: string;
  description: string;
  gender: 'female' | 'male' | 'neutral';
  photoUrl: string;
  modelUrl: string;
  modelFormat: 'glb' | 'gltf' | 'vrm';
  isRigged: boolean;
  hasBlendshapes: boolean;
  defaultVoice: string;
  teachingStyle: 'friendly' | 'professional' | 'storytelling' | 'step-by-step';
  license: string;
}

export const DEMO_AVATARS: DemoAvatar[] = [
  {
    id: 'teacher-michelle',
    name: 'Teacher Michelle',
    description: 'Professional STEM & Computer Science teacher with full humanoid skeletal rig and natural idle animations.',
    gender: 'female',
    photoUrl: '/avatars/demo_michelle.jpg',
    modelUrl: '/models/demo/michelle.glb',
    modelFormat: 'glb',
    isRigged: true,
    hasBlendshapes: true,
    defaultVoice: 'en-US-JennyNeural',
    teachingStyle: 'friendly',
    license: 'Mixamo / Three.js Permissive Sample Model',
  },
  {
    id: 'professor-alex',
    name: 'Professor Alex',
    description: 'Academic Algorithms & Mathematics educator with rigged humanoid skeleton and classroom teaching postures.',
    gender: 'male',
    photoUrl: '/avatars/demo_alex.jpg',
    modelUrl: '/models/demo/xbot.glb',
    modelFormat: 'glb',
    isRigged: true,
    hasBlendshapes: false,
    defaultVoice: 'en-US-GuyNeural',
    teachingStyle: 'step-by-step',
    license: 'Mixamo / Three.js Permissive Sample Model',
  },
  {
    id: 'teacher-vrm',
    name: 'Dr. Akira (VRM)',
    description: 'Next-generation VRM humanoid digital human with bone twist constraints and standardized facial blendshapes.',
    gender: 'female',
    photoUrl: '/avatars/demo_vrm.jpg',
    modelUrl: '/models/demo/avatar_vrm.vrm',
    modelFormat: 'vrm',
    isRigged: true,
    hasBlendshapes: true,
    defaultVoice: 'en-US-AriaNeural',
    teachingStyle: 'professional',
    license: 'Pixiv / three-vrm Open CC Sample Model',
  },
];

export function getDemoAvatars(): DemoAvatar[] {
  return DEMO_AVATARS;
}

export function getDemoAvatarById(id: string): DemoAvatar | undefined {
  return DEMO_AVATARS.find((a) => a.id === id);
}
