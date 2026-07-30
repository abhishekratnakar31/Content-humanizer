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
exports.logTokenUsage = logTokenUsage;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
/**
 * Logs token usage to Firestore.
 */
async function logTokenUsage(usage) {
    try {
        const db = admin.firestore();
        // Firestore does not allow undefined values
        const cleanUsage = {};
        for (const [key, value] of Object.entries(usage)) {
            if (value !== undefined) {
                cleanUsage[key] = value;
            }
        }
        // Log to a global token usage collection
        await db.collection('tokenUsageLogs').add({
            ...cleanUsage,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // We can also aggregate tokens for the user here if needed,
        // but typically we track credits deducted. This is mainly for analytics.
    }
    catch (error) {
        console.error('Failed to log token usage to Firestore:', error);
    }
}
//# sourceMappingURL=tokenLogger.js.map