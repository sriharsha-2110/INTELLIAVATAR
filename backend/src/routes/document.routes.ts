import { Router } from 'express';
import { uploadDocument, getDocuments, deleteDocument } from '../controllers/document.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { documentUpload } from '../middleware/upload.middleware.js';

const router = Router();

router.post('/upload', authMiddleware as any, documentUpload.single('file'), uploadDocument);
router.get('/', authMiddleware as any, getDocuments);
router.delete('/:id', authMiddleware as any, deleteDocument);

export default router;
