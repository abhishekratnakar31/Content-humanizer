import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface TokenUsage {
  userId?: string;
  jobId?: string;
  agentName: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  thinkingTokens?: number;
  costUsd: number;
  latencyMs: number;
}

/**
 * Logs token usage to Firestore.
 */
export async function logTokenUsage(usage: TokenUsage): Promise<void> {
  try {
    const db = admin.firestore();
    
    // Firestore does not allow undefined values
    const cleanUsage: any = {};
    for (const [key, value] of Object.entries(usage)) {
      if (value !== undefined) {
        cleanUsage[key] = value;
      }
    }

    // Log to a global token usage collection
    await db.collection('tokenUsageLogs').add({
      ...cleanUsage,
      createdAt: FieldValue.serverTimestamp(),
    });

    // We can also aggregate tokens for the user here if needed,
    // but typically we track credits deducted. This is mainly for analytics.
    
  } catch (error) {
    console.error('Failed to log token usage to Firestore:', error);
  }
}
