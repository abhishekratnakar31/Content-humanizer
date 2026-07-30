import { Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest } from './authMiddleware';
import { callLlm } from './utils/llmClient';
import { getActiveModels } from './utils/configLoader';
import { AGENT_2_SYSTEM } from './utils/prompts';

export async function detectAiHandler(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.uid || 'anonymous';

  const { text } = req.body;
  if (!text || text.trim() === '') {
    res.status(400).json({ error: 'Missing parameter: text is required' });
    return;
  }

  try {
    const activeModels = await getActiveModels();
    const detectModel = activeModels.detection_model || 'gemini-2.5-flash';

    const startTime = Date.now();
    const userPrompt = `Analyze this text and return a calibrated AI detection score. Score must reflect the actual signals present — do not default to a high score if the text reads naturally:\n${text}`;
    
    const { output, metrics: llmMetrics } = await callLlm({
      model: detectModel,
      systemPrompt: AGENT_2_SYSTEM,
      userPrompt,
      jsonMode: true,
      agentName: 'AI Pattern Detection',
      userId,
    });

    let result;
    try {
      result = JSON.parse(output);
    } catch (e) {
      result = {};
    }

    const input_ai_written_percent = result.input_ai_written_percent || 0;
    const patterns_found = result.patterns_found || [];
    const metrics = result.metrics || [];
    const processing_ms = Date.now() - startTime;

    // Log the detection task
    try {
      await admin.firestore().collection('detections').add({
        userId,
        text,
        score: input_ai_written_percent,
        analysis: {
          patterns_found,
          metrics,
        },
        tokenUsage: {
          tokensIn: llmMetrics.tokensIn,
          tokensOut: llmMetrics.tokensOut,
          thinkingTokens: llmMetrics.thinkingTokens || 0,
          costUsd: llmMetrics.costUsd,
        },
        processingMs: processing_ms,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to log detection task:', err);
    }

    res.json({
      input_ai_written_percent,
      patterns_found,
      metrics,
      processing_ms,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Detection failed' });
  }
}
