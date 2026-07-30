import { Response } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import * as admin from 'firebase-admin';

export const adminGetModelsHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = admin.firestore();
    const docRef = db.collection('settings').doc('models');
    const docSnap = await docRef.get();

    let data = docSnap.data();
    if (!data) {
      data = {
        active_models: {
          agent_0_model: 'gemini-2.5-flash',
          agent_1_model: 'gemini-2.5-flash',
          agent_2_model: 'gemini-2.5-flash',
          agent_3_model: 'gemini-2.5-flash',
          agent_4_model: 'gemini-2.5-pro',
          agent_5_model: 'gemini-2.5-pro',
          agent_reflection_model: 'gemini-2.5-flash',
          agent_revision_model: 'gemini-2.5-pro',
          agent_scoring_model: 'gemini-2.5-flash',
          agent_polish_model: 'gemini-2.5-flash'
        },
        available_gemini_models: [
          'gemini-2.5-flash',
          'gemini-2.5-pro',
          'gemini-1.5-pro'
        ],
        has_gemini_key: !!process.env.GEMINI_API_KEY
      };
      await docRef.set(data);
    } else {
      // Migrate old data structure to new one if needed
      if (!data.active_models.agent_0_model) {
        data.active_models = {
          agent_0_model: data.active_models.analysis_model || 'gemini-2.5-flash',
          agent_1_model: data.active_models.analysis_model || 'gemini-2.5-flash',
          agent_2_model: data.active_models.detection_model || 'gemini-2.5-flash',
          agent_3_model: data.active_models.analysis_model || 'gemini-2.5-flash',
          agent_4_model: data.active_models.rewrite_model || 'gemini-2.5-pro',
          agent_5_model: data.active_models.rewrite_model || 'gemini-2.5-pro',
          agent_reflection_model: data.active_models.detection_model || 'gemini-2.5-flash',
          agent_revision_model: data.active_models.rewrite_model || 'gemini-2.5-pro',
          agent_scoring_model: data.active_models.detection_model || 'gemini-2.5-flash',
          agent_polish_model: data.active_models.detection_model || 'gemini-2.5-flash'
        };
        await docRef.set(data);
      }
      
      // Refresh API key status on read
      data.has_gemini_key = !!process.env.GEMINI_API_KEY;
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch admin models config' });
  }
};
