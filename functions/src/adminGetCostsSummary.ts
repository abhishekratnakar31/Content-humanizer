import { Response } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import * as admin from 'firebase-admin';

export const adminGetCostsSummaryHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('jobs').where('status', '==', 'completed').get();

    let totalCreditsUsed = 0;
    let totalLlmCost = 0.0;
    let totalTokens = 0;
    const modelCosts: Record<string, number> = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalCreditsUsed += data.creditsUsed || 0;
      totalLlmCost += data.llmCostUsd || 0;
      totalTokens += data.tokensConsumed || 0;

      const logs = data.agentLogs || [];
      logs.forEach((log: any) => {
        const model = log.llmModel || 'unknown';
        modelCosts[model] = (modelCosts[model] || 0) + (log.costUsd || 0);
      });
    });

    const simulatedRevenue = totalCreditsUsed * 0.015;
    const margin = simulatedRevenue > 0 ? ((simulatedRevenue - totalLlmCost) / simulatedRevenue) * 100 : 100;

    res.json({
      totalJobs: snapshot.size,
      totalCreditsUsed,
      simulatedRevenueUsd: simulatedRevenue,
      totalLlmCostUsd: totalLlmCost,
      grossMarginPercent: margin,
      totalTokensConsumed: totalTokens,
      modelCostsUsd: modelCosts,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate financial cost summary' });
  }
};
