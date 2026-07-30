import { Response } from 'express';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { AuthenticatedRequest } from './authMiddleware';
import { callLlm } from './utils/llmClient';
import { getActiveModels } from './utils/configLoader';

const AGENT_1_SYSTEM = `You are an Intent Extraction Agent specializing in deep content analysis.
Your job is to dissect the input text and produce a precise profile:
1. TARGET AUDIENCE
2. PURPOSE
3. TONE FINGERPRINT
4. CONTENT DNA
5. VOICE GAP ANALYSIS

You MUST return a JSON object:
{
  "audience": "Target audience description detailing persona, expertise, and concerns.",
  "tone": "tone fingerprint summary",
  "voice_gap": "specific voice gap analysis"
}
Do not return any conversational text around the JSON.`;

function calculateHumannessHeuristic(text: string): { human_percent: number; human_rating: number } {
  const sentences = text.trim().split(/[.!?]+/).filter(s => s.trim().length > 0);
  let aiScore = 50;
  if (sentences.length > 2) {
    const lengths = sentences.map(s => s.trim().split(/\\s+/).length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / lengths.length;
    if (variance > 60) aiScore = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
    else if (variance > 25) aiScore = Math.floor(Math.random() * (40 - 20 + 1)) + 20;
    else aiScore = Math.floor(Math.random() * (65 - 40 + 1)) + 40;
  } else {
    aiScore = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
  }
  const humanPercent = Math.max(0, Math.min(100, 100 - aiScore));
  const humanRating = Math.max(1, Math.min(10, Math.round(humanPercent / 10)));
  return { human_percent: humanPercent, human_rating: humanRating };
}

export async function createVoiceProfileHandler(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.uid;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { name, sampleText } = req.body;
  if (!name || !sampleText || sampleText.trim().length < 50) {
    res.status(400).json({ error: 'Name and sampleText (minimum 50 chars) are required' });
    return;
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const tier = userDoc.data()?.tier || 'starter';
    let maxProfiles = 3;
    if (tier === 'professional') maxProfiles = 6;
    if (tier === 'enterprise') maxProfiles = 10;

    const existingSnap = await admin.firestore()
      .collection('voiceProfiles')
      .where('userId', '==', userId)
      .get();

    if (existingSnap.size >= maxProfiles) {
      res.status(400).json({ error: `Limit reached: Under your plan (${tier}), you can create a maximum of ${maxProfiles} custom writing personas.` });
      return;
    }

    const activeModels = await getActiveModels();
    const strategyModel = activeModels.analysis_model || 'gemini-2.5-flash';

    const userPrompt = `Extract voice DNA for this content:\n${sampleText}`;
    
    const { output } = await callLlm({
      model: strategyModel,
      systemPrompt: AGENT_1_SYSTEM,
      userPrompt,
      jsonMode: true,
      agentName: 'Intent Extraction (Vault)',
      userId,
    });

    let fingerprint: any;
    try {
      fingerprint = JSON.parse(output);
    } catch (e) {
      fingerprint = {
        audience: "general",
        tone: "engaging, conversational",
        voice_gap: "more personal pronouns and varying sentence structures"
      };
    }

    const { human_percent, human_rating } = calculateHumannessHeuristic(sampleText);
    fingerprint.human_likeness = human_percent;
    fingerprint.human_rating = human_rating;

    const voiceProfileId = 'vp_' + crypto.randomBytes(12).toString('hex');
    await admin.firestore().collection('voiceProfiles').doc(voiceProfileId).set({
      userId,
      name,
      sampleText,
      fingerprint,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, voiceProfileId, fingerprint });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Voice profile creation failed' });
  }
}
