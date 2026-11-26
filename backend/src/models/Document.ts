import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';

export interface IDocument extends MongooseDoc {
  userId: string;
  fileName: string;
  fileUrl: string;
  extractedTextReference?: string;
  processingStatus: 'UPLOADING' | 'INDEXING' | 'READY' | 'FAILED';
  createdAt: Date;
}

const DocumentSchema = new Schema<IDocument>({
  userId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  extractedTextReference: { type: String },
  processingStatus: {
    type: String,
    enum: ['UPLOADING', 'INDEXING', 'READY', 'FAILED'],
    default: 'READY',
  },
  createdAt: { type: Date, default: Date.now },
});

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
