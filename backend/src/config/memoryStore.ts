// Resilient in-memory fallback store when MongoDB Atlas is connecting or offline
export interface StoredItem {
  id: string;
  [key: string]: any;
}

class MemoryStore {
  public users: Map<string, any> = new Map();
  public avatars: Map<string, any> = new Map();
  public conversations: Map<string, any> = new Map();
  public documents: Map<string, any> = new Map();
  public learningProfiles: Map<string, any> = new Map();
  public quizzes: Map<string, any> = new Map();

  constructor() {
    // Seed default demo avatars
    this.avatars.set('teacher-michelle', {
      _id: 'teacher-michelle',
      id: 'teacher-michelle',
      userId: 'system-demo',
      name: 'Teacher Michelle (STEM & Computer Science)',
      photoUrl: '/avatars/demo_michelle.jpg',
      modelUrl: '/models/demo/michelle.glb',
      modelFormat: 'glb',
      generationProvider: 'prebuilt-licensed-demo',
      generationStatus: 'READY',
      voice: 'en-US-JennyNeural',
      language: 'en',
      teachingStyle: 'friendly',
      createdAt: new Date(),
    });

    this.avatars.set('professor-alex', {
      _id: 'professor-alex',
      id: 'professor-alex',
      userId: 'system-demo',
      name: 'Professor Alex (Algorithms & Mathematics)',
      photoUrl: '/avatars/demo_alex.jpg',
      modelUrl: '/models/demo/xbot.glb',
      modelFormat: 'glb',
      generationProvider: 'prebuilt-licensed-demo',
      generationStatus: 'READY',
      voice: 'en-US-GuyNeural',
      language: 'en',
      teachingStyle: 'step-by-step',
      createdAt: new Date(),
    });

    this.avatars.set('teacher-vrm', {
      _id: 'teacher-vrm',
      id: 'teacher-vrm',
      userId: 'system-demo',
      name: 'Dr. Akira (VRM Digital Human)',
      photoUrl: '/avatars/demo_vrm.jpg',
      modelUrl: '/models/demo/avatar_vrm.vrm',
      modelFormat: 'vrm',
      generationProvider: 'prebuilt-licensed-demo',
      generationStatus: 'READY',
      voice: 'en-US-AriaNeural',
      language: 'en',
      teachingStyle: 'professional',
      createdAt: new Date(),
    });
  }
}

export const memoryStore = new MemoryStore();
