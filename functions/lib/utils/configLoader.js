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
exports.getActiveModels = getActiveModels;
exports.saveActiveModels = saveActiveModels;
const admin = __importStar(require("firebase-admin"));
const DEFAULT_CONFIG = {
    analysis_model: 'gemini-2.5-flash',
    rewrite_model: 'gemini-2.5-pro',
    detection_model: 'gemini-2.5-flash',
};
/**
 * Retrieves the active models configuration from Firestore.
 * Falls back to DEFAULT_CONFIG if not found or on error.
 */
async function getActiveModels() {
    try {
        const doc = await admin.firestore().collection('settings').doc('models').get();
        if (doc.exists) {
            const data = doc.data();
            if (data && data.active_models) {
                return data.active_models;
            }
        }
        // Fallback to legacy path if settings/models doesn't have it
        const legacyDoc = await admin.firestore().collection('adminConfig').doc('models_config').get();
        if (legacyDoc.exists) {
            const data = legacyDoc.data();
            return {
                ...DEFAULT_CONFIG,
                ...data
            };
        }
    }
    catch (error) {
        console.error('Failed to load active models from Firestore:', error);
    }
    return DEFAULT_CONFIG;
}
/**
 * Saves the active models configuration to Firestore.
 */
async function saveActiveModels(config) {
    try {
        await admin.firestore().collection('settings').doc('models').set({
            active_models: config
        }, { merge: true });
    }
    catch (error) {
        throw new Error(`Failed to save models configuration: ${error.message}`);
    }
}
//# sourceMappingURL=configLoader.js.map