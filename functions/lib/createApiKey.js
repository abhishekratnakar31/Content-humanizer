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
exports.createApiKeyHandler = createApiKeyHandler;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const crypto = __importStar(require("crypto"));
async function createApiKeyHandler(req, res) {
    const userId = req.user?.uid;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const VALID_MODES = ['standard', 'human', 'expert', 'bypass'];
    const { name = 'Default API Key', scope = 'full', keyType = 'individual', expirationDays = 'never', creditLimit = null, resetLimit = 'N/A', defaultMode = null, defaultVoiceProfileId = null, } = req.body;
    if (defaultMode && !VALID_MODES.includes(defaultMode)) {
        res.status(400).json({ error: `Invalid defaultMode. Must be one of: ${VALID_MODES.join(', ')}` });
        return;
    }
    if (defaultVoiceProfileId && defaultVoiceProfileId !== 'vp_default') {
        const vpSnap = await admin.firestore().collection('voiceProfiles').doc(defaultVoiceProfileId).get();
        if (!vpSnap.exists || vpSnap.data()?.userId !== userId) {
            res.status(400).json({ error: 'Invalid or inaccessible defaultVoiceProfileId' });
            return;
        }
    }
    try {
        const keyToken = 'humanizer_live_' + crypto.randomBytes(32).toString('hex');
        const hashedKey = crypto.createHash('sha256').update(keyToken).digest('hex');
        const apiKeyId = 'key_' + crypto.randomBytes(8).toString('hex');
        let createdByEmail = req.user?.email || 'unknown@humanizer.ai';
        if (createdByEmail === 'unknown@humanizer.ai') {
            try {
                const firebaseUser = await admin.auth().getUser(userId);
                createdByEmail = firebaseUser.email || createdByEmail;
            }
            catch (authErr) {
                console.warn("Failed to fetch creator's email from Firebase Auth:", authErr);
            }
        }
        let expiresAt = null;
        if (expirationDays !== 'never') {
            const days = parseInt(expirationDays, 10);
            if (!isNaN(days)) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + days);
                expiresAt = admin.firestore.Timestamp.fromDate(expiryDate);
            }
        }
        const numericLimit = (creditLimit === '' || creditLimit === null) ? null : Number(creditLimit);
        await admin.firestore().collection('apiKeys').doc(apiKeyId).set({
            userId,
            createdByEmail,
            name,
            hash: hashedKey,
            scope,
            keyType,
            expirationDays,
            expiresAt,
            creditLimit: isNaN(Number(numericLimit)) ? null : numericLimit,
            resetLimit,
            defaultMode: defaultMode || null,
            defaultVoiceProfileId: defaultVoiceProfileId || null,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        const userRef = admin.firestore().collection('users').doc(userId);
        await userRef.update({ hasCreatedKey: true }).catch(async (err) => {
            await userRef.set({ hasCreatedKey: true }, { merge: true });
        });
        res.json({
            apiKeyId,
            name,
            scope,
            keyType,
            expirationDays,
            creditLimit: isNaN(Number(numericLimit)) ? null : numericLimit,
            resetLimit,
            defaultMode: defaultMode || null,
            defaultVoiceProfileId: defaultVoiceProfileId || null,
            apiKey: keyToken,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create API key' });
    }
}
//# sourceMappingURL=createApiKey.js.map