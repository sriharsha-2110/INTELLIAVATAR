import { Router } from 'express';
import {
  uploadAvatarPhoto,
  generateAvatar,
  getJobStatus,
  getAvatars,
  getAvatarById,
  updateAvatar,
  deleteAvatar,
  listDemoAvatars,
} from '../controllers/avatar.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { imageUpload } from '../middleware/upload.middleware.js';

const router = Router();

router.post('/upload', authMiddleware as any, imageUpload.single('photo'), uploadAvatarPhoto);
router.post('/generate', authMiddleware as any, generateAvatar);
router.get('/jobs/:jobId', authMiddleware as any, getJobStatus);
router.get('/demo/list', listDemoAvatars);
router.get('/', authMiddleware as any, getAvatars);
router.get('/:id', authMiddleware as any, getAvatarById);
router.put('/:id', authMiddleware as any, updateAvatar);
router.delete('/:id', authMiddleware as any, deleteAvatar);

export default router;
