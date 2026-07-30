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
exports.detectAiHandler = detectAiHandler;
const admin = __importStar(require("firebase-admin"));
const llmClient_1 = require("./utils/llmClient");
const configLoader_1 = require("./utils/configLoader");
const prompts_1 = require("./utils/prompts");
async function detectAiHandler(req, res) {
    const userId = req.user?.uid || 'anonymous';
    const { text } = req.body;
    if (!text || text.trim() === '') {
        res.status(400).json({ error: 'Missing parameter: text is required' });
        return;
    }
    try {
        const activeModels = await (0, configLoader_1.getActiveModels)();
        const detectModel = activeModels.detection_model || 'gemini-2.5-flash';
        const startTime = Date.now();
        const userPrompt = `Analyze this text and return a calibrated AI detection score. Score must reflect the actual signals present — do not default to a high score if the text reads naturally:\n${text}`;
        const { output, metrics: llmMetrics } = await (0, llmClient_1.callLlm)({
            model: detectModel,
            systemPrompt: prompts_1.AGENT_2_SYSTEM,
            userPrompt,
            jsonMode: true,
            agentName: 'AI Pattern Detection',
            userId,
        });
        let result;
        try {
            result = JSON.parse(output);
        }
        catch (e) {
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
        }
        catch (err) {
            console.error('Failed to log detection task:', err);
        }
        res.json({
            input_ai_written_percent,
            patterns_found,
            metrics,
            processing_ms,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Detection failed' });
    }
}
//# sourceMappingURL=detectAi.js.map