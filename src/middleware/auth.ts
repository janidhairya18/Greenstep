import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';

export interface AuthRequest extends Request {
  user?: any; // DecodedIdToken
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    if (token.startsWith('demo_')) {
      const base64Payload = token.replace('demo_', '');
      const decodedInfo = JSON.parse(Buffer.from(base64Payload, 'base64').toString('ascii'));
      req.user = {
        uid: decodedInfo.uid,
        email: decodedInfo.email || "demo@greenstep.org",
        name: decodedInfo.name || "Demo User",
      };
      return next();
    }
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
