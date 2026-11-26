import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For seamless demo access, allow guest access with a fallback user
    req.user = {
      userId: 'guest-teacher-user',
      email: 'teacher@intelliavatar.ai',
      name: 'Guest Educator',
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired access token.' });
    return;
  }

  req.user = payload;
  next();
}
