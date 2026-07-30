import 'dotenv/config';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import * as path from 'path';

import { authMiddleware } from './authMiddleware';
import { checkoutCreditsHandler } from './checkoutCredits';
import { humanizeContentHandler } from './humanizeContent';
import { detectAiHandler } from './detectAi';
import { createApiKeyHandler } from './createApiKey';
import { recommendVoiceHandler } from './recommendVoice';
import { createVoiceProfileHandler } from './createVoiceProfile';
import { updateVoiceProfileHandler } from './updateVoiceProfile';

import { adminGetModelsHandler } from './adminGetModels';
import { adminUpdateModelsHandler } from './adminUpdateModels';
import { adminGetCostsSummaryHandler } from './adminGetCostsSummary';
import { 
  adminGetUsersHandler, 
  adminUpdateUserCreditsHandler, 
  adminUpdateUserHandler, 
  adminDeleteUserHandler 
} from './adminUsers';

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../../content-humanizer-f9499-firebase-adminsdk-fbsvc-aed388b14d.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
  });
  console.log("Firebase Admin initialized using service account:", serviceAccountPath);
} catch (e: any) {
  console.warn("Fallback to default Admin SDK initialization:", e.message);
  admin.initializeApp();
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Main App Routes
app.post('/api/v1/checkout/credits', authMiddleware, checkoutCreditsHandler);
app.post('/api/v1/humanize', authMiddleware, humanizeContentHandler);
app.post('/api/v1/detect', authMiddleware, detectAiHandler);
app.post('/api/v1/keys', authMiddleware, createApiKeyHandler);
app.post('/api/v1/voice-vault/recommend', authMiddleware, recommendVoiceHandler);
app.post('/api/v1/voice-vault', authMiddleware, createVoiceProfileHandler);
app.put('/api/v1/voice-vault/:voiceProfileId', authMiddleware, updateVoiceProfileHandler);

// Admin Routes
app.get('/api/v1/admin/models', authMiddleware, adminGetModelsHandler);
app.post('/api/v1/admin/models', authMiddleware, adminUpdateModelsHandler);
app.get('/api/v1/admin/costs/summary', authMiddleware, adminGetCostsSummaryHandler);

app.get('/api/v1/admin/users', authMiddleware, adminGetUsersHandler);
app.post('/api/v1/admin/users/:userId/credits', authMiddleware, adminUpdateUserCreditsHandler);
app.post('/api/v1/admin/users/:userId/update', authMiddleware, adminUpdateUserHandler);
app.delete('/api/v1/admin/users/:userId', authMiddleware, adminDeleteUserHandler);

// Standalone Server Listener (if run outside Firebase Cloud Functions environment)
if (!process.env.FUNCTIONS_EMULATOR && !process.env.FIREBASE_CONFIG) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Standalone Express server running on port ${PORT}`);
  });
}

export const apiGateway = functions.https.onRequest({ timeoutSeconds: 540, memory: '1GiB' }, app);
export const humanizerOps = functions.https.onRequest({ timeoutSeconds: 540, memory: '1GiB' }, app);
