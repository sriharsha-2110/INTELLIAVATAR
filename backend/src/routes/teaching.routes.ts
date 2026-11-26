import { Router } from 'express';
import {
  chatWithTeacher,
  synthesizeTeacherSpeech,
  getConversationHistory,
  clearConversationHistory,
} from '../controllers/teaching.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/chat', authMiddleware as any, chatWithTeacher);
router.post('/speech', authMiddleware as any, synthesizeTeacherSpeech);
router.get('/history/:avatarId', authMiddleware as any, getConversationHistory);
router.delete('/history/:avatarId', authMiddleware as any, clearConversationHistory);

export default router;
