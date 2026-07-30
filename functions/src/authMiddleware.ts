import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    role: string;
    email?: string;
  };
  apiKeyId?: string;
  apiKeyScope?: string;
}

// Helper to hash key
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const isDetectRoute = req.path === '/detect' || req.path === '/api/v1/detect' || req.originalUrl?.endsWith('/detect');

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (isDetectRoute) {
        req.user = {
          uid: 'anonymous',
          role: 'user',
          email: 'anonymous@humanizer.ai',
        };
        return next();
      }
      res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
      return;
    }

    const token = authHeader.split('Bearer ')[1]?.trim();
    if (!token) {
      if (isDetectRoute) {
        req.user = {
          uid: 'anonymous',
          role: 'user',
          email: 'anonymous@humanizer.ai',
        };
        return next();
      }
      res.status(401).json({ error: 'Unauthorized: Token is missing' });
      return;
    }

    // 1. Check if it's an API Key (starts with forzeo_live_ or humanizer_live_)
    if (token.startsWith('forzeo_live_') || token.startsWith('humanizer_live_')) {
      const hashedKey = hashApiKey(token);
      
      const apiKeySnap = await admin
        .firestore()
        .collection('apiKeys')
        .where('hash', '==', hashedKey)
        .limit(1)
        .get();

      if (apiKeySnap.empty) {
        if (isDetectRoute) {
          req.user = {
            uid: 'anonymous',
            role: 'user',
            email: 'anonymous@humanizer.ai',
          };
          return next();
        }
        res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
        return;
      }

      const keyDoc = apiKeySnap.docs[0];
      const keyData = keyDoc.data();

      // Check Expiration
      if (keyData.expiresAt) {
        const expiryTimestamp = keyData.expiresAt;
        const now = admin.firestore.Timestamp.now();
        if (now.toMillis() > expiryTimestamp.toMillis()) {
          res.status(403).json({ 
            error: 'Forbidden: API Key has expired', 
            message: `This API key expired on ${expiryTimestamp.toDate().toUTCString()}. Please provision a new credential.`,
            expiredAt: expiryTimestamp.toDate().toISOString()
          });
          return;
        }
      }

      // Retrieve user role and email from users collection
      const userSnap = await admin.firestore().collection('users').doc(keyData.userId).get();
      const userRole = userSnap.exists ? (userSnap.data()?.role || 'user') : 'user';
      const userEmail = userSnap.exists ? (userSnap.data()?.email || '') : '';

      req.user = {
        uid: keyData.userId,
        role: userRole,
        email: userEmail || keyData.createdByEmail || 'unknown@humanizer.ai',
      };
      req.apiKeyId = keyDoc.id;
      req.apiKeyScope = keyData.scope || 'full';
      return next();
    }

    // 2. Otherwise treat as Firebase ID Token
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Fetch user role
      const userSnap = await admin.firestore().collection('users').doc(decodedToken.uid).get();
      const userRole = userSnap.exists ? (userSnap.data()?.role || 'user') : 'user';

      req.user = {
        uid: decodedToken.uid,
        role: userRole,
        email: decodedToken.email,
      };
      return next();
    } catch (err: any) {
      console.error("Firebase ID Token verification or Firestore read failed:", err);
      if (isDetectRoute) {
        req.user = {
          uid: 'anonymous',
          role: 'user',
          email: 'anonymous@humanizer.ai',
        };
        return next();
      }
      res.status(401).json({ error: 'Unauthorized: Invalid ID Token', details: err.message });
      return;
    }
  } catch (error: any) {
    if (isDetectRoute) {
      req.user = {
        uid: 'anonymous',
        role: 'user',
        email: 'anonymous@humanizer.ai',
      };
      return next();
    }
    res.status(500).json({ error: error.message || 'Internal Server Error during authentication' });
  }
}
