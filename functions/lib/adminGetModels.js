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
exports.adminGetModelsHandler = void 0;
const admin = __importStar(require("firebase-admin"));
const adminGetModelsHandler = async (req, res) => {
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
        }
        else {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch admin models config' });
    }
};
exports.adminGetModelsHandler = adminGetModelsHandler;
//# sourceMappingURL=adminGetModels.js.map