import { Response } from 'express';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as crypto from 'crypto';
import { AuthenticatedRequest } from './authMiddleware';

export async function createApiKeyHandler(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.uid;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const VALID_MODES = ['standard', 'human', 'expert', 'bypass'];

  const { 
    name = 'Default API Key', 
    scope = 'full', 
    keyType = 'individual', 
    expirationDays = 'never',
    creditLimit = null,
    resetLimit = 'N/A',
    defaultMode = null,
    defaultVoiceProfileId = null,
  } = req.body;

  if (defaultMode && !VALID_MODES.includes(defaultMode)) {
    res.status(400).json({ error: `Invalid defaultMode. Must be one of: ${VALID_MODES.join(', ')}` });
    return;
  }

  if (defaultVoiceProfileId && defaultVoiceProfileId !== 'vp_default') {
    const vpSnap = await admin.firestore().collection('voiceProfiles').doc(defaultVoiceProfileId).get();
    if (!vpSnap.exists || vpSnap.data()?.userId !== userId) {
      res.status(400).json({ error: 'Invalid or inaccessible defaultVoiceProfileId' });
      return;
    }
  }

  try {
    const keyToken = 'humanizer_live_' + crypto.randomBytes(32).toString('hex');
    const hashedKey = crypto.createHash('sha256').update(keyToken).digest('hex');
    const apiKeyId = 'key_' + crypto.randomBytes(8).toString('hex');

    let createdByEmail = req.user?.email || 'unknown@humanizer.ai';
    if (createdByEmail === 'unknown@humanizer.ai') {
      try {
        const firebaseUser = await admin.auth().getUser(userId);
        createdByEmail = firebaseUser.email || createdByEmail;
      } catch (authErr) {
        console.warn("Failed to fetch creator's email from Firebase Auth:", authErr);
      }
    }

    let expiresAt: admin.firestore.Timestamp | null = null;
    if (expirationDays !== 'never') {
      const days = parseInt(expirationDays, 10);
      if (!isNaN(days)) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        expiresAt = admin.firestore.Timestamp.fromDate(expiryDate);
      }
    }

    const numericLimit = (creditLimit === '' || creditLimit === null) ? null : Number(creditLimit);

    await admin.firestore().collection('apiKeys').doc(apiKeyId).set({
      userId,
      createdByEmail,
      name,
      hash: hashedKey,
      scope,
      keyType,
      expirationDays,
      expiresAt,
      creditLimit: isNaN(Number(numericLimit)) ? null : numericLimit,
      resetLimit,
      defaultMode: defaultMode || null,
      defaultVoiceProfileId: defaultVoiceProfileId || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    const userRef = admin.firestore().collection('users').doc(userId);
    await userRef.update({ hasCreatedKey: true }).catch(async (err) => {
      await userRef.set({ hasCreatedKey: true }, { merge: true });
    });

    res.json({
      apiKeyId,
      name,
      scope,
      keyType,
      expirationDays,
      creditLimit: isNaN(Number(numericLimit)) ? null : numericLimit,
      resetLimit,
      defaultMode: defaultMode || null,
      defaultVoiceProfileId: defaultVoiceProfileId || null,
      apiKey: keyToken, 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create API key' });
  }
}
