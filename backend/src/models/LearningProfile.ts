import mongoose, { Schema, Document } from 'mongoose';

export interface IMisconception {
  concept: string;
  observedErrors: string[];
  lastOccurred: Date;
  resolved: boolean;
}

export interface ILearningProfile extends Document {
  userId: string;
  masteredConcepts: string[];
  weakConcepts: string[];
  misconceptions: IMisconception[];
  revisionHistory: {
    topic: string;
    revisedAt: Date;
    teachBackScore?: number;
  }[];
}

const LearningProfileSchema = new Schema<ILearningProfile>({
  userId: { type: String, required: true, unique: true, index: true },
  masteredConcepts: [{ type: String }],
  weakConcepts: [{ type: String }],
  misconceptions: [
    {
      concept: { type: String, required: true },
      observedErrors: [{ type: String }],
      lastOccurred: { type: Date, default: Date.now },
      resolved: { type: Boolean, default: false },
    },
  ],
  revisionHistory: [
    {
      topic: { type: String, required: true },
      revisedAt: { type: Date, default: Date.now },
      teachBackScore: { type: Number },
    },
  ],
});

export const LearningProfileModel = mongoose.model<ILearningProfile>('LearningProfile', LearningProfileSchema);
