"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractVoiceHandler = extractVoiceHandler;
const llmClient_1 = require("./utils/llmClient");
const configLoader_1 = require("./utils/configLoader");
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
function calculateHumannessHeuristic(text) {
    // Simple burstiness heuristic: variance in sentence lengths
    const sentences = text.trim().split(/[.!?]+/).filter(s => s.trim().length > 0);
    let aiScore = 50; // default unknown
    if (sentences.length > 2) {
        const lengths = sentences.map(s => s.trim().split(/\s+/).length);
        const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / lengths.length;
        if (variance > 60) {
            aiScore = Math.floor(Math.random() * (20 - 5 + 1)) + 5; // very bursty
        }
        else if (variance > 25) {
            aiScore = Math.floor(Math.random() * (40 - 20 + 1)) + 20; // somewhat varied
        }
        else {
            aiScore = Math.floor(Math.random() * (65 - 40 + 1)) + 40; // uniform
        }
    }
    else {
        aiScore = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
    }
    const humanPercent = Math.max(0, Math.min(100, 100 - aiScore));
    const humanRating = Math.max(1, Math.min(10, Math.round(humanPercent / 10)));
    return { human_percent: humanPercent, human_rating: humanRating };
}
async function extractVoiceHandler(req, res) {
    const userId = req.user?.uid;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const { text } = req.body;
    if (!text || text.trim() === '') {
        res.status(400).json({ error: 'Missing parameter: text is required' });
        return;
    }
    try {
        const activeModels = await (0, configLoader_1.getActiveModels)();
        const strategyModel = activeModels.analysis_model || 'gemini-2.5-flash';
        const userPrompt = `Extract voice DNA for this content:\n${text}`;
        const { output } = await (0, llmClient_1.callLlm)({
            model: strategyModel,
            systemPrompt: AGENT_1_SYSTEM,
            userPrompt,
            jsonMode: true,
            agentName: 'Intent Extraction',
            userId,
        });
        let fingerprint;
        try {
            fingerprint = JSON.parse(output);
        }
        catch (e) {
            fingerprint = {
                audience: "general",
                tone: "engaging, conversational",
                voice_gap: "more personal pronouns and varying sentence structures"
            };
        }
        const { human_percent, human_rating } = calculateHumannessHeuristic(text);
        fingerprint.human_likeness = human_percent;
        fingerprint.human_rating = human_rating;
        res.json({ fingerprint });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Voice extraction failed' });
    }
}
//# sourceMappingURL=extractVoice.js.map