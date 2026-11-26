import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { DocumentModel } from '../models/Document.js';
import { memoryStore } from '../config/memoryStore.js';
import { isMongoConnected } from '../config/database.js';
import { ragService } from '../services/rag/ragService.js';
import { uploadMedia } from '../services/storage/storageService.js';

export async function uploadDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'Please upload a PDF, TXT, or DOCX document.' });
    return;
  }

  const userId = req.user?.userId || 'guest-teacher-user';
  const { originalname, path: filePath } = req.file;

  try {
    const { fullText } = await ragService.extractTextAndChunk(filePath, originalname);
    const storageResult = await uploadMedia(filePath, 'intelliavatar/documents');

    const docId = `doc_${Date.now()}`;
    const newDoc = {
      id: docId,
      _id: docId,
      userId,
      fileName: originalname,
      fileUrl: storageResult.url,
      extractedTextReference: fullText.substring(0, 5000), // excerpt stored
      processingStatus: 'READY' as const,
      createdAt: new Date(),
    };

    if (isMongoConnected) {
      try {
        await DocumentModel.create(newDoc);
      } catch (err) {}
    }

    memoryStore.documents.set(docId, newDoc);

    res.status(201).json({
      message: 'Document processed & indexed successfully.',
      document: newDoc,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process document text.' });
  }
}

export async function getDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.userId || 'guest-teacher-user';

  if (isMongoConnected) {
    try {
      const docs = await DocumentModel.find({ userId }).sort({ createdAt: -1 });
      res.json({ documents: docs });
      return;
    } catch (err) {}
  }

  const userDocs = Array.from(memoryStore.documents.values()).filter((d) => d.userId === userId);
  res.json({ documents: userDocs });
}

export async function deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (isMongoConnected) {
    try {
      await DocumentModel.findByIdAndDelete(id);
    } catch (err) {}
  }

  memoryStore.documents.delete(id);
  res.json({ message: 'Document deleted successfully.' });
}
