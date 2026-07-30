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
exports.adminGetCostsSummaryHandler = void 0;
const admin = __importStar(require("firebase-admin"));
const adminGetCostsSummaryHandler = async (req, res) => {
    try {
        const db = admin.firestore();
        const snapshot = await db.collection('jobs').where('status', '==', 'completed').get();
        let totalCreditsUsed = 0;
        let totalLlmCost = 0.0;
        let totalTokens = 0;
        const modelCosts = {};
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            totalCreditsUsed += data.creditsUsed || 0;
            totalLlmCost += data.llmCostUsd || 0;
            totalTokens += data.tokensConsumed || 0;
            const logs = data.agentLogs || [];
            logs.forEach((log) => {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to generate financial cost summary' });
    }
};
exports.adminGetCostsSummaryHandler = adminGetCostsSummaryHandler;
//# sourceMappingURL=adminGetCostsSummary.js.map