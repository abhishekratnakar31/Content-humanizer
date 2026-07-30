import * as admin from 'firebase-admin';

export interface ModelsConfig {
  [key: string]: string | undefined;
}

const DEFAULT_CONFIG: ModelsConfig = {
  analysis_model: 'gemini-2.5-flash',
  rewrite_model: 'gemini-2.5-pro',
  detection_model: 'gemini-2.5-flash',
};

/**
 * Retrieves the active models configuration from Firestore.
 * Falls back to DEFAULT_CONFIG if not found or on error.
 */
export async function getActiveModels(): Promise<ModelsConfig> {
  try {
    const doc = await admin.firestore().collection('settings').doc('models').get();
    if (doc.exists) {
      const data = doc.data();
      if (data && data.active_models) {
        return data.active_models as ModelsConfig;
      }
    }
    
    // Fallback to legacy path if settings/models doesn't have it
    const legacyDoc = await admin.firestore().collection('adminConfig').doc('models_config').get();
    if (legacyDoc.exists) {
      const data = legacyDoc.data() as Partial<ModelsConfig>;
      return {
        ...DEFAULT_CONFIG,
        ...data
      };
    }
  } catch (error) {
    console.error('Failed to load active models from Firestore:', error);
  }
  return DEFAULT_CONFIG;
}

/**
 * Saves the active models configuration to Firestore.
 */
export async function saveActiveModels(config: Partial<ModelsConfig>): Promise<void> {
  try {
    await admin.firestore().collection('settings').doc('models').set({
      active_models: config
    }, { merge: true });
  } catch (error: any) {
    throw new Error(`Failed to save models configuration: ${error.message}`);
  }
}
