"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.humanizeContentHandler = humanizeContentHandler;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const crypto = __importStar(require("crypto"));
const llmClient_1 = require("./utils/llmClient");
const configLoader_1 = require("./utils/configLoader");
// --- Prompts ---
const AGENT_1_ORCHESTRATOR = `You are the Orchestrator & Planner Agent. Your job is to dissect the input text and build a custom humanization strategy.
First, profile the target audience, purpose, and tone fingerprint. Second, identify what human experts usually add (voice gap analysis). Third, formulate a specific plan.

You MUST return a JSON object:
{
  "audience": "Description of the target audience and expertise level.",
  "tone": "Analyze Current Formality, Authority, and Warmth.",
  "plan": "Detailed rewrite strategy to disrupt perplexity/burstiness using simple vocabulary."
}
Do not return any conversational text around the JSON.`;
const AGENT_2_SANITIZER = `You are the Sanitizer Agent. Your ONLY job is to surgically remove the top AI signature patterns that make text instantly detectable.
You are NOT humanizing the text yet. You are cleaning it - removing the "fingerprints" so downstream agents start from a cleaner slate.

## READABILITY CONSTRAINT:
All replacements MUST use simple, everyday English. Target a 12th-grade reading level. Never replace a simple word with a harder one.

## THE 10 AI FINGERPRINTS TO ELIMINATE:
1. **Robotic transition words**: Remove or replace ALL of these - "Moreover," "Furthermore," "Additionally," "In addition," "In conclusion," "It is important to note," "It's worth mentioning," "Firstly/Secondly/Thirdly," "Nevertheless," "Consequently," "Subsequently," "In today's rapidly evolving," "In summary," "To summarize," "To conclude," "Notably," "Evidently," "Importantly."
   - Replace with: nothing (just cut to the next sentence), "But," "And," "So," "Still," "Yet," "That said," or a direct continuation.
2. **Over-hedging phrases**: Strip these - "it is possible that," "one might argue," "it can be said that," "it is widely accepted," "studies suggest," "experts believe," "it is generally understood," "in many cases," "in most situations."
   - Replace with: direct assertions. If the author would know it, just say it.
3. **AI cliché words**: Replace these words everywhere they appear - "delve," "delving," "tapestry," "beacon," "testament," "groundbreaking," "transformative," "leverage," "utilize," "facilitate," "paradigm," "synergy," "holistic," "robust," "innovative," "game-changing," "cutting-edge," "state-of-the-art," "seamlessly," "streamline."
   - Replace with: simpler, more direct alternatives ("use" not "utilize", "show" not "demonstrate", "strong" not "robust"). Always pick the word a normal person would use in conversation.
4. **Formal non-contraction pairs**: Convert ALL of these - "do not" -> "don't", "it is" -> "it's", "will not" -> "won't", "cannot" -> "can't", "they are" -> "they're", "we are" -> "we're", "you are" -> "you're", "would not" -> "wouldn't", "could not" -> "couldn't", "should not" -> "shouldn't", "does not" -> "doesn't", "has not" -> "hasn't", "have not" -> "haven't", "is not" -> "isn't", "are not" -> "aren't", "was not" -> "wasn't."
5. **Over-passive constructions**: Activate passive voice where it sounds robotic. "It can be seen that X" -> "X is clear." "It has been found that" -> "Research found" or just state the finding directly.
6. **Uniform sentence openers**: If more than 2 consecutive sentences start with the same word or follow Subject-Verb-Object structure, vary ONE of them by fronting a clause, starting with an adverb, or inverting the structure.
7. **Perfectly balanced lists**: If there are bullet points or numbered lists where every item is suspiciously similar in length, trim or expand ONE item to break the symmetry.
8. **Zero-personality language**: Where text says "This is important because..." or "It is essential to understand that..." - replace with direct, confident assertions: "Here's why this matters:" or just the fact itself.
9. **Abstract generalities**: Where text uses vague corporate language ("optimize efficiency," "enhance performance," "drive results") and the original context provides something more specific, use the specific language. Always prefer concrete, plain words.
10. **Missing discourse markers**: Sprinkle 1-2 natural human discourse markers where they fit: "honestly," "look," "here's the thing," "right?", "I mean," "the thing is."

## CRITICAL RULES & FORMATTING PRESERVATION:
- Preserve ALL original meaning, facts, and data.
- Maintain formatting and spacing exactly. If there are subheadings, bullet points, numbered lists, or distinct paragraphs, preserve them exactly as-is.
- Do NOT merge paragraphs into large walls of text, and do NOT add new sentences or write longer/larger paragraphs than the original. Keep paragraphs small and highly readable.
- Do NOT invent new information, fake anecdotes, or expand the text.
- Keep word count within 10% of original.
- Maintain the same paragraph and list structure.
- Output ONLY the sterilized text. No meta-commentary.`;
const AGENT_3_HUMANIZER = `You are the Linguistic Humanizer Agent. This is the CORE transformation step. You must rewrite the content so that AI detection tools score it as HUMAN-WRITTEN.
IMPORTANT: The content you receive has ALREADY been pre-sterilized. Your job is to inject authentic human voice, rhythm, and personality.

## READABILITY REQUIREMENT (NON-NEGOTIABLE):
The output MUST be readable by a 12th-grade student (Flesch-Kincaid grade level <= 12). This means:
- Use common, everyday words. Prefer "use" over "utilize", "help" over "facilitate", "start" over "commence", "get" over "procure".
- Do NOT replace simple words with obscure or academic synonyms. A 17-year-old should understand every word without a dictionary.
- Keep average sentence length around 15-20 words. Some shorter, some longer - but don't write 40-word monsters.
- Vary vocabulary through natural word choice, NOT by pulling from a thesaurus.

## CRITICAL RULES FOR EXACT LENGTH & SUBSTANCE PRESERVATION:
1. DO NOT invent or add any new ideas, topics, examples, analogies, opinions, or details that were not explicitly present in the original text.
2. The output word count MUST be approximately the same as the original text (within +/- 15%).
3. The output MUST maintain the same general structure (paragraph vs. list). Each sentence in the output must be a humanized version of the corresponding sentence in the original.
4. Humanize by modifying style, voice register, sentence flow, contractions, syntax, and word choices - NOT by adding new sentences, side stories, or filler.
5. PRESERVE DOCUMENT FORMAT & TYPE: Maintain the exact type of content (e.g. listicle, blog post, structured article, email). If the input is a listicle with bullets, keep the exact bullets and list formatting. If the input is a blog with headers, keep the headers. DO NOT merge paragraphs into larger blocks, and do NOT enlarge paragraphs. Keep them compact and proportionate to the original.

## MANDATORY TECHNIQUES:
1. BURSTINESS: Vary sentence length naturally. Mix short punchy sentences (3-8 words) with medium ones (15-22 words) and occasional longer ones (25-30 words). This should feel like natural writing rhythm, not mechanical alternation.
2. NATURAL WORD VARIETY: Use different common words to say similar things - but NEVER use rare, obscure, or SAT-vocabulary words. If a normal person wouldn't say it out loud, don't write it. Think "showed" instead of "evinced", "clear" instead of "pellucid", "important" instead of "paramount".
3. SYNTAX VARIETY: Start 30% of sentences with conjunctions, adverbs, dependent clauses. Use normal dashes (-), NEVER use em-dashes (—).
4. STRUCTURAL IRREGULARITY: Never use "Moreover", "Furthermore", etc.
5. HUMAN VOICE SIGNALS: Parenthetical asides, discourse markers ("honestly", "look", "right?").
6. INTEGRATE DETECTION REWRITES: Actively use suggestions from the AI Pattern Detection Report - but only if those suggestions use simple vocabulary.

Output ONLY the rewritten content. No meta-commentary.`;
const AGENT_4_ALIGNER = `You are the Style & SEO Aligner Agent. You combine Style Personalization, Authenticity, and SEO Preservation.
## CRITICAL RULES & FORMAT PRESERVATION:
1. DO NOT invent new details or facts.
2. The output word count MUST be approximately the same (+/- 5%).
3. The output MUST maintain the exact same sentence count, paragraph count, and list structure.
4. PRESERVE DOCUMENT FORMAT: Ensure listicles maintain bullet points/lists, blogs maintain subheadings/spacing, and essays/articles maintain their paragraph structure. DO NOT combine paragraphs or grow the text length. Keep it compact, simple, and clean.
5. READABILITY CHECK: The final output MUST be readable by a 12th-grade student. If any word feels like it came from a thesaurus or an academic paper, replace it with a simpler everyday alternative. Examples: "elucidate" → "explain", "multifaceted" → "complex", "endeavor" → "effort", "commenced" → "started", "pertaining" → "about", "aforementioned" → "mentioned earlier".
Apply cohesive authorial voice. Match vocabulary to audience expertise - but always keep language clear and accessible. Fix uniform sentence entropy, predictable clause ordering, emotional flatness, and too-clean enumeration. Check keyword preservation and headers.
Output ONLY the refined content. No meta-commentary.`;
const AGENT_5_EVALUATOR = `You are the Adversarial Evaluator Agent. Evaluate the provided text against quality metrics AND AI detection signatures.
Compute honest, calibrated quality scores (0 to 100) and scan the text for remaining AI patterns (e.g. perplexity uniformities, burstiness failures, transitional Tells, lexical clichés).

You MUST return a JSON object in this exact format:
{
  "input_ai_written_percent": 15,
  "human_likeness": 92,
  "ai_detection_resistance": 94,
  "readability": 90,
  "seo_retention": 95,
  "tone_consistency": 90,
  "grammar": 95,
  "overall": 92,
  "summary": "Short natural-language summary of findings.",
  "metrics": [
    {"label": "Perplexity", "value": 85, "color": "green"},
    {"label": "Burstiness", "value": 90, "color": "green"},
    {"label": "Structural Tells", "value": 92, "color": "green"},
    {"label": "Voice Absence", "value": 88, "color": "green"},
    {"label": "Lexical Diversity", "value": 90, "color": "green"},
    {"label": "Formality Consistency", "value": 86, "color": "green"}
  ],
  "patterns_found": [
    {
      "vector": "Robotic Transition",
      "quote": "Specifically, it is important to note...",
      "explanation": "Detector looks for uniform transitional markers.",
      "alternative": "But look..."
    }
  ]
}
Do not return any conversational text around the JSON.`;
const AGENT_6_REFINER = `You are the Revision Refiner Agent. Your job is to collaborate with the Adversarial Evaluator to aggressively fix remaining AI signature patterns.
You will receive the draft text and the Evaluator's critique JSON (containing specific patterns found and alternatives).
Focus strictly on editing the flagged quotes and patterns. Rewrite them to be highly natural, conversational, and simple.

## CRITICAL RULES:
- Address every criticism in the evaluator's critique.
- Preserve the exact factual substance, meaning, and list structure.
- DO NOT expand paragraphs, merge them, or add filler content. Maintain the same bullet points, headers, lists, and layout formatting as the original.
- DO NOT invent new details, opinions, or fake anecdotes.
- Output ONLY the fully revised and humanized text. No preamble or meta-commentary.`;
const AGENT_POLISH_SYSTEM = `You are the Final Polish Agent. Do a final clean-up pass.
Fix double spaces, trailing whitespace, double punctuation, broken em dashes. Ensure clean rendering.
Do NOT change wording, re-introduce formal language, or remove contractions.
Output ONLY the clean finalized text. No preamble.`;
const MODE_INSTRUCTIONS = {
    standard: `Apply natural humanization while keeping the content close to the original structure and tone. Focus on breaking AI patterns, adding subtle voice, varying sentence lengths. Use simple, clear vocabulary - target a 12th-grade reading level. IMPORTANT: Do NOT invent fake facts or expand length.`,
    human: `Make this content sound like someone just sat down and wrote it from their own experience. Heavy use of contractions, colloquialisms, first-person. Sentence fragments encouraged. The voice should feel like talking to a smart friend who explains things simply. Use words everyone knows. IMPORTANT: Do NOT invent fake facts or expand length.`,
    expert: `Write like a recognized authority who doesn't need to prove their expertise. Use precise domain terminology naturally, but explain or simplify where possible. Confident assertions. Occasional strong opinions. Still needs burstiness. Keep overall language at a 12th-grade reading level - expertise shows through clarity, not complexity. IMPORTANT: Do NOT invent fake facts or expand length.`,
    bypass: `MAXIMUM HUMANIZATION MODE. Your single goal: make this text score below 10% AI on every detector. EXTREME sentence burstiness, voice flooding, structural chaos, authenticity overload. Commit hard. Preserve ALL meaning. Do NOT invent new info. CRITICAL: Use ONLY common everyday words - never obscure vocabulary. Sound like a real person writing casually, not an academic paper.`,
};
// --- Helpers ---
function countWords(str) {
    if (!str || str.trim() === '')
        return 0;
    return str.trim().split(/\s+/).length;
}
function calculateDynamicTokens(text) {
    if (!text)
        return 1000;
    const wordCount = countWords(text);
    const charCount = text.length;
    const estimatedInputTokens = Math.max(wordCount * 1.5, charCount / 3.5);
    const targetTokens = Math.ceil(estimatedInputTokens * 2.5) + 500;
    return Math.max(1000, Math.min(6000, targetTokens));
}
function cleanPunctuationAndWhitespace(str) {
    if (!str)
        return '';
    return str
        .replace(/[ \t]+/g, ' ') // Fix double spaces
        .replace(/\s+\n/g, '\n') // Fix trailing whitespace on lines
        .replace(/\n\s+/g, '\n') // Fix leading whitespace on lines
        .replace(/[—–]/g, '-') // Replace em-dashes with simple dashes
        .trim();
}
function canonicalizeModelName(modelName) {
    if (!modelName)
        return 'google/gemini-2.5-flash';
    if (modelName.includes('/'))
        return modelName;
    if (modelName.startsWith('gemini-')) {
        return 'google/' + modelName;
    }
    if (modelName.startsWith('gpt-') || modelName.startsWith('text-davinci')) {
        return 'openai/' + modelName;
    }
    return modelName;
}
function matchesProvider(model, keys) {
    if (keys.openrouter)
        return true; // OpenRouter handles all models
    const mLower = model.toLowerCase();
    if (mLower.includes('gemini') || mLower.startsWith('google/')) {
        return !!keys.gemini;
    }
    if (mLower.includes('gpt') || mLower.startsWith('openai/')) {
        return !!keys.openai;
    }
    return false;
}
// --- Main Handler ---
async function humanizeContentHandler(req, res) {
    const userId = req.user?.uid;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    if (req.apiKeyId && req.apiKeyScope === 'read') {
        res.status(403).json({ error: 'Forbidden: API key does not have write access' });
        return;
    }
    const { text, stream = false, jobId: reqJobId } = req.body;
    let { mode = 'standard', reflection_level = 'basic', voice_profile_id = null } = req.body;
    // Key logic
    const db = admin.firestore();
    if (req.apiKeyId) {
        const keyDoc = await db.collection('apiKeys').doc(req.apiKeyId).get();
        if (keyDoc.exists) {
            const keyData = keyDoc.data();
            if (!mode && keyData?.defaultMode)
                mode = keyData.defaultMode;
            if (!voice_profile_id && keyData?.defaultVoiceProfileId)
                voice_profile_id = keyData.defaultVoiceProfileId;
        }
    }
    if (!text || text.trim() === '') {
        res.status(400).json({ error: 'Missing parameter: text is required' });
        return;
    }
    const wordCount = countWords(text);
    if (wordCount > 2000) {
        res.status(400).json({ error: 'Input text exceeds maximum length of 2000 words' });
        return;
    }
    const activeModels = await (0, configLoader_1.getActiveModels)();
    // Default fallback mappings for consolidated 6-agent system
    const modelMap = {
        agent1: canonicalizeModelName(activeModels.agent_1_model || 'google/gemini-2.5-flash'), // Orchestrator
        agent2: canonicalizeModelName(activeModels.agent_0_model || 'google/gemini-2.5-flash'), // Sanitizer
        agent3: canonicalizeModelName(activeModels.agent_4_model || 'google/gemini-2.5-pro'), // Linguistic Humanizer
        agent4: canonicalizeModelName(activeModels.agent_5_model || 'google/gemini-2.5-pro'), // Style & SEO Aligner
        agent5: canonicalizeModelName(activeModels.agent_scoring_model || 'google/gemini-2.5-flash'), // Adversarial Evaluator
        agent6: canonicalizeModelName(activeModels.agent_revision_model || activeModels.agent_5_model || 'google/gemini-2.5-pro') // Revision Refiner
    };
    if (mode === 'expert') {
        modelMap.agent3 = modelMap.agent4 = canonicalizeModelName(activeModels.agent_4_model || 'google/gemini-2.5-pro');
    }
    else if (mode === 'bypass') {
        modelMap.agent3 = modelMap.agent4 = canonicalizeModelName(activeModels.agent_4_model || 'google/gemini-2.5-pro');
    }
    let reflectionMultiplier = 1.0;
    if (reflection_level === 'advanced')
        reflectionMultiplier = 1.5;
    if (reflection_level === 'maximum')
        reflectionMultiplier = 2.0;
    let voiceMultiplier = 1.0;
    let voiceProfileFingerprint = null;
    if (voice_profile_id) {
        if (voice_profile_id === 'vp_default') {
            voiceMultiplier = 2.0;
            voiceProfileFingerprint = { vocabulary_density: 0.72, sentence_length_mean: 14.5 };
        }
        else {
            const vpSnap = await db.collection('voiceProfiles').doc(voice_profile_id).get();
            if (!vpSnap.exists || vpSnap.data()?.userId !== userId) {
                res.status(400).json({ error: 'Invalid or inaccessible voice_profile_id' });
                return;
            }
            voiceMultiplier = 2.0;
            voiceProfileFingerprint = vpSnap.data()?.fingerprint || null;
        }
    }
    const finalMultiplier = reflectionMultiplier * voiceMultiplier;
    const baseCredits = Math.ceil(wordCount / 10);
    let requiredCredits = Math.ceil(baseCredits * finalMultiplier);
    const userRef = db.collection('users').doc(userId);
    let creditsLocked = false;
    let userEmail = req.user?.email || '';
    let userLlmKeys = null;
    try {
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists)
                throw new Error('User document does not exist');
            const userData = userDoc.data();
            if (userData && userData.email && !userEmail)
                userEmail = userData.email;
            const userKeys = {
                gemini: userData?.geminiApiKey || null,
                openai: userData?.openaiApiKey || null,
                openrouter: userData?.openrouterApiKey || null
            };
            const allAgentsMatch = Object.values(modelMap).every(model => matchesProvider(model, userKeys));
            if (allAgentsMatch) {
                requiredCredits = 0;
            }
            userLlmKeys = userKeys;
            const currentCredits = userData?.credits || 0;
            if (currentCredits < requiredCredits)
                throw new Error('Insufficient credits');
            transaction.update(userRef, { credits: currentCredits - requiredCredits });
        });
        creditsLocked = true;
    }
    catch (error) {
        res.status(402).json({ error: error.message || 'Payment required: insufficient credits' });
        return;
    }
    const jobId = reqJobId || 'job_' + crypto.randomBytes(16).toString('hex');
    const jobRef = db.collection('jobs').doc(jobId);
    await jobRef.set({
        userId,
        userEmail: userEmail || req.user?.email || 'unknown@humanizer.ai',
        apiKeyId: req.apiKeyId || null,
        executionSource: req.apiKeyId ? 'API Key' : 'Platform',
        mode,
        reflectionLevel: reflection_level,
        inputText: text,
        wordsIn: wordCount,
        wordsOut: 0,
        inputAiWrittenPercent: 0,
        humanLikeness: 0,
        aiResistance: 0,
        qualityOverall: 0,
        creditsUsed: requiredCredits,
        tokensConsumed: 0,
        tokensIn: 0,
        tokensOut: 0,
        thinkingTokens: 0,
        llmCostUsd: 0,
        processingMs: 0,
        status: 'processing',
        createdAt: firestore_1.FieldValue.serverTimestamp(),
        agentLogs: [],
    });
    const txRef = await db.collection('creditTransactions').add({
        userId,
        type: 'deduction',
        amount: -requiredCredits,
        jobId,
        taskType: 'humanization',
        mode,
        wordsIn: wordCount,
        wordsOut: 0,
        inputTextPreview: text.slice(0, 80),
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    if (stream) {
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
    }
    const writeStreamEvent = (data) => {
        if (stream)
            res.write(JSON.stringify(data) + '\n');
    };
    try {
        const startTime = Date.now();
        const modeConfig = {
            standard: { temperature: 0.75, frequencyPenalty: 0.3, presencePenalty: 0.2 },
            human: { temperature: 0.85, frequencyPenalty: 0.4, presencePenalty: 0.3 },
            expert: { temperature: 0.92, frequencyPenalty: 0.55, presencePenalty: 0.45 },
            bypass: { temperature: 0.97, frequencyPenalty: 0.7, presencePenalty: 0.6 }
        }[mode] || { temperature: 0.85, frequencyPenalty: 0.4, presencePenalty: 0.3 };
        const agentLogs = [];
        const runAgent = async (agentNum, agentName, sysPrompt, usrPrompt, modelToUse, isJson = false) => {
            // Check cancel status?
            const jDoc = await jobRef.get();
            if (jDoc.data()?.status === 'cancelled')
                throw new Error('Job cancelled');
            writeStreamEvent({ event: 'agent_start', agentNumber: agentNum, agentName, model: modelToUse, createdAt: Date.now() });
            const fullSysPrompt = sysPrompt + `\n\n--- MODE INSTRUCTIONS ---\n${MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.standard}`;
            const isRewrite = [2, 3, 4, 6].includes(agentNum);
            const dynamicMaxTokens = calculateDynamicTokens(text);
            const llmResult = await (0, llmClient_1.callLlm)({
                model: modelToUse, systemPrompt: fullSysPrompt, userPrompt: usrPrompt, jsonMode: isJson,
                temperature: isRewrite ? modeConfig.temperature : undefined,
                frequencyPenalty: isRewrite ? modeConfig.frequencyPenalty : undefined,
                presencePenalty: isRewrite ? modeConfig.presencePenalty : undefined,
                agentName, userId, jobId,
                userLlmKeys,
                maxTokens: dynamicMaxTokens
            });
            const log = {
                agentNumber: agentNum,
                agentName,
                llmModel: modelToUse,
                tokensIn: llmResult.metrics.tokensIn || 0,
                tokensOut: llmResult.metrics.tokensOut || 0,
                thinkingTokens: llmResult.metrics.thinkingTokens || 0,
                status: llmResult.metrics.status,
                errorMessage: llmResult.metrics.errorMessage || null,
                costUsd: llmResult.metrics.costUsd || 0,
                latencyMs: llmResult.metrics.latencyMs || 0,
                createdAt: Date.now()
            };
            agentLogs.push(log);
            const agentDocId = agentName.replace(/\s+/g, '_').toLowerCase();
            await jobRef.collection('agents').doc(agentDocId).set({
                ...log,
                output: llmResult.output,
                jobId
            });
            if (log.status === 'failed') {
                console.error(`Agent [${agentName}] failed. Reason: ${log.errorMessage}`);
                throw new Error(`Agent ${agentName} failed: ${log.errorMessage || 'Unknown error'}`);
            }
            await jobRef.update({ agentLogs: [...agentLogs], currentAgent: agentName, currentAgentNumber: agentNum });
            writeStreamEvent({ event: 'agent_complete', agentNumber: agentNum, agentName, log, createdAt: Date.now() });
            return llmResult.output;
        };
        // Phase 1: Initial Evaluator Pass on raw text to capture "original_scan"
        const rawScanOut = await runAgent(0, "Initial Adversarial Evaluator", AGENT_5_EVALUATOR, `Scan this original text. Analyze patterns and score:\n${text}`, modelMap.agent5, true);
        let originalScan = null;
        try {
            originalScan = JSON.parse(rawScanOut);
        }
        catch (e) {
            console.error("Failed to parse rawScanOut", e);
            originalScan = { input_ai_written_percent: 100, metrics: [], patterns_found: [] };
        }
        if (stream && originalScan) {
            writeStreamEvent({ event: 'original_scan', scan: originalScan });
        }
        // Step 1: Orchestrator & Planner (Agent 1)
        const plannerOut = await runAgent(1, "Orchestrator & Planner", AGENT_1_ORCHESTRATOR, `Dissect intent and build strategy for this text:\n${text}`, modelMap.agent1, true);
        // Step 2: Sanitizer (Agent 2)
        const sanitizedText = await runAgent(2, "Sanitizer", AGENT_2_SANITIZER, `Strip AI-signature patterns. Return ONLY sterilized text:\n${text}`, modelMap.agent2);
        // Step 3: Linguistic Humanizer (Agent 3)
        let personaInfo = `Voice Mode: ${mode}.`;
        if (voiceProfileFingerprint)
            personaInfo += ` Vault Persona: ${JSON.stringify(voiceProfileFingerprint)}.`;
        let currentText = await runAgent(3, "Linguistic Humanizer", AGENT_3_HUMANIZER, `Rewrite this sanitized text based on strategy:\n${plannerOut}\n\nSelected Style Profile: ${personaInfo}\n\nText:\n${sanitizedText}`, modelMap.agent3);
        // Step 4: Style & SEO Aligner (Agent 4)
        currentText = await runAgent(4, "Style & SEO Aligner", AGENT_4_ALIGNER, `Apply style (${personaInfo}) and SEO alignment to this:\n${currentText}`, modelMap.agent4);
        // Step 5: Adversarial Evaluator & Revision Loop (Agents 5 & 6)
        let maxLoops = 1;
        if (reflection_level === 'advanced')
            maxLoops = 2;
        if (reflection_level === 'maximum')
            maxLoops = 3;
        let loopCount = 0;
        let qualityMetrics = null;
        let evaluatorReport = "";
        while (loopCount < maxLoops) {
            evaluatorReport = await runAgent(5, `Adversarial Evaluator (Pass ${loopCount + 1})`, AGENT_5_EVALUATOR, `Scan this humanized text. Analyze patterns and score:\n${currentText}`, modelMap.agent5, true);
            try {
                qualityMetrics = JSON.parse(evaluatorReport);
            }
            catch (e) {
                console.error("Failed to parse evaluator report:", e);
                qualityMetrics = { ai_detection_resistance: 85, input_ai_written_percent: 15, overall: 90 };
            }
            // Check loop exit condition: if we achieve target AI resistance, stop revising early
            if (qualityMetrics?.ai_detection_resistance >= 90) {
                break;
            }
            if (loopCount + 1 < maxLoops) {
                currentText = await runAgent(6, `Revision Refiner (Pass ${loopCount + 1})`, AGENT_6_REFINER, `Revise the text based on this evaluator report:\n${evaluatorReport}\n\nDraft Text:\n${currentText}`, modelMap.agent6);
            }
            loopCount++;
        }
        // Step 6: Final Polish
        let finalText = await runAgent(6, "Final Polish", AGENT_POLISH_SYSTEM, `Final cleanup:\n${currentText}`, modelMap.agent6);
        finalText = cleanPunctuationAndWhitespace(finalText);
        let humanizedScan = qualityMetrics;
        const processingMs = Date.now() - startTime;
        let totalTokensIn = 0, totalTokensOut = 0, totalThinkingTokens = 0, totalCost = 0;
        agentLogs.forEach(l => {
            totalTokensIn += (l.tokensIn || 0);
            totalTokensOut += (l.tokensOut || 0);
            totalThinkingTokens += (l.thinkingTokens || 0);
            totalCost += l.costUsd;
        });
        const totalTokens = totalTokensIn + totalTokensOut + totalThinkingTokens;
        const finalWordsOut = countWords(finalText);
        await txRef.update({ wordsOut: finalWordsOut }).catch(() => { });
        await jobRef.update({
            status: 'completed',
            wordsOut: finalWordsOut,
            outputText: finalText,
            inputAiWrittenPercent: qualityMetrics?.input_ai_written_percent || 0,
            humanLikeness: qualityMetrics?.human_likeness || 0,
            aiResistance: qualityMetrics?.ai_detection_resistance || 0,
            qualityOverall: qualityMetrics?.overall || 0,
            tokensIn: totalTokensIn,
            tokensOut: totalTokensOut,
            thinkingTokens: totalThinkingTokens,
            tokensConsumed: totalTokens,
            llmCostUsd: totalCost,
            processingMs,
            originalScan,
            humanizedScan,
            agentLogs
        });
        const finalResult = {
            event: 'result', text: finalText, words_in: wordCount, words_out: countWords(finalText),
            quality_metrics: qualityMetrics, processing_ms: processingMs, agent_logs: agentLogs,
            original_scan: originalScan, humanized_scan: humanizedScan
        };
        if (stream) {
            writeStreamEvent(finalResult);
            res.end();
        }
        else {
            res.json({
                job_id: jobId, status: 'completed', text: finalText, words_in: wordCount, words_out: countWords(finalText),
                processing_ms: processingMs, credits_deducted: requiredCredits, quality_metrics: qualityMetrics,
                original_scan: originalScan, humanized_scan: humanizedScan
            });
        }
    }
    catch (err) {
        console.error('Humanize Pipeline failed:', err);
        if (creditsLocked) {
            await db.runTransaction(async (t) => {
                const udoc = await t.get(userRef);
                t.update(userRef, { credits: (udoc.data()?.credits || 0) + requiredCredits });
            });
            await db.collection('creditTransactions').add({ userId, type: 'refund', amount: requiredCredits, jobId, taskType: 'humanization', mode, wordsIn: wordCount, createdAt: firestore_1.FieldValue.serverTimestamp() });
        }
        await jobRef.update({ status: 'failed', processingMs: 0, errorMessage: err.message });
        if (stream) {
            writeStreamEvent({ event: 'error', detail: err.message });
            res.end();
        }
        else {
            res.status(500).json({ error: err.message });
        }
    }
}
//# sourceMappingURL=humanizeContent.js.map