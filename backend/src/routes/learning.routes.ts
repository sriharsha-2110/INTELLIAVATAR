import { Router } from 'express';
import {
  getLearningProfile,
  logMisconception,
  evaluateTeachBack,
  createQuiz,
} from '../controllers/learning.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/profile', authMiddleware as any, getLearningProfile);
router.post('/misconceptions', authMiddleware as any, logMisconception);
router.post('/teach-back', authMiddleware as any, evaluateTeachBack);
router.post('/quiz', authMiddleware as any, createQuiz);

export default router;
