import { Response } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import * as admin from 'firebase-admin';

export const adminUpdateModelsHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const activeModels = req.body;
    const db = admin.firestore();
    const docRef = db.collection('settings').doc('models');
    
    // Merge updates
    await docRef.set({
      active_models: activeModels
    }, { merge: true });

    const docSnap = await docRef.get();
    res.json(docSnap.data());
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update admin models config' });
  }
};
