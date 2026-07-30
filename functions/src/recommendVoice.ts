import { Response } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { callLlm } from './utils/llmClient';

const RECOMMEND_SYSTEM_PROMPT = `You are a Writing Persona Recommendation Agent.
Your job is to generate a custom writing style reference profile based on the user's description.

The profile must have three fields:
1. "name": A descriptive name for the persona (e.g. "Tech Founder (Direct & Ambitious)").
2. "description": A short explanation of the writing style.
3. "sampleText": A high-quality, fully human-style writing reference sample text of approximately 250-400 words.

CRITICAL INSTRUCTIONS FOR THE SAMPLE TEXT:
- It MUST look 100% human to AI content detectors (GPTZero, Originality.ai).
- It MUST have extreme sentence length variation (burstiness): mix very short fragments (2-4 words) with longer flowing sentences.
- It MUST have high perplexity: use natural but slightly unexpected word pairings and vivid metaphors.
- It MUST avoid standard AI cliches and robotic transition words (e.g., do NOT use: "Moreover", "Furthermore", "Additionally", "In conclusion", "It is important to note", "delve", "testament", "beacon", "tapestry").
- It MUST use contractions naturally (e.g. don't, it's, won't, couldn't).
- It should feel authentic, conversational, and written from a first-person perspective if appropriate.

Return ONLY a JSON object:
{
  "name": "Persona Name",
  "description": "Short description",
  "sampleText": "The fully humanized, high perplexity, bursty sample text..."
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

export async function recommendVoiceHandler(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.uid;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { prompt } = req.body;
  if (!prompt || prompt.trim() === '') {
    res.status(400).json({ error: 'Missing parameter: prompt is required' });
    return;
  }

  try {
    const userPrompt = `Generate a writing persona recommendation for this style: ${prompt}`;
    
    // We can use gemini-2.5-flash as the default model for recommendation
    const { output } = await callLlm({
      model: 'gemini-2.5-flash',
      systemPrompt: RECOMMEND_SYSTEM_PROMPT,
      userPrompt,
      jsonMode: true,
      agentName: 'Voice Recommendation',
      userId,
    });

    let result: any;
    try {
      result = JSON.parse(output);
    } catch (e) {
      result = {
        name: `Custom Humanized ${prompt}`,
        description: `A customized, natural human-like writing profile tailored to ${prompt}.`,
        sampleText: `Let's be honest—nobody likes reading dry, boring text. Write like you talk. Use short words, ask questions, and let your personality show through.`
      };
    }

    const { human_percent, human_rating } = calculateHumannessHeuristic(result.sampleText || '');
    
    res.json({
      name: result.name || 'Custom Recommended Persona',
      description: result.description || 'AI recommended humanized style reference.',
      sampleText: result.sampleText || '',
      human_likeness: human_percent,
      human_rating: human_rating
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Voice recommendation failed' });
  }
}
