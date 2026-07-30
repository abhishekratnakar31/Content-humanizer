"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashApiKey = hashApiKey;
exports.authMiddleware = authMiddleware;
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
// Helper to hash key
function hashApiKey(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
}
async function authMiddleware(req, res, next) {
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
        }
        catch (err) {
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
    }
    catch (error) {
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
//# sourceMappingURL=authMiddleware.js.map