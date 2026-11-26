import { Router } from 'express';
import authRoutes from './auth.routes.js';
import avatarRoutes from './avatar.routes.js';
import teachingRoutes from './teaching.routes.js';
import documentRoutes from './document.routes.js';
import learningRoutes from './learning.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/avatars', avatarRoutes);
router.use('/teaching', teachingRoutes);
router.use('/documents', documentRoutes);
router.use('/learning', learningRoutes);

export default router;
