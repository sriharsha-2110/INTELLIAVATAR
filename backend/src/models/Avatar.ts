import mongoose, { Schema, Document } from 'mongoose';

export interface IAvatar extends Document {
  userId: string;
  name: string;
  photoUrl: string;
  modelUrl: string;
  modelFormat: 'glb' | 'gltf' | 'vrm';
  generationProvider: string;
  generationJobId?: string;
  generationStatus: 'UPLOADING' | 'PROCESSING' | 'RIGGING' | 'PREPARING' | 'READY' | 'FAILED';
  voice: string;
  language: string;
  teachingStyle: 'friendly' | 'professional' | 'storytelling' | 'step-by-step';
  createdAt: Date;
}

const AvatarSchema = new Schema<IAvatar>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  photoUrl: { type: String, default: '' },
  modelUrl: { type: String, required: true },
  modelFormat: { type: String, enum: ['glb', 'gltf', 'vrm'], default: 'glb' },
  generationProvider: { type: String, default: 'prebuilt-demo' },
  generationJobId: { type: String },
  generationStatus: {
    type: String,
    enum: ['UPLOADING', 'PROCESSING', 'RIGGING', 'PREPARING', 'READY', 'FAILED'],
    default: 'READY',
  },
  voice: { type: String, default: 'en-US-JennyNeural' },
  language: { type: String, default: 'en' },
  teachingStyle: {
    type: String,
    enum: ['friendly', 'professional', 'storytelling', 'step-by-step'],
    default: 'professional',
  },
  createdAt: { type: Date, default: Date.now },
});

export const AvatarModel = mongoose.model<IAvatar>('Avatar', AvatarSchema);
