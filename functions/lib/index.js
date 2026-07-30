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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.humanizerOps = exports.apiGateway = void 0;
require("dotenv/config");
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path = __importStar(require("path"));
const authMiddleware_1 = require("./authMiddleware");
const checkoutCredits_1 = require("./checkoutCredits");
const humanizeContent_1 = require("./humanizeContent");
const detectAi_1 = require("./detectAi");
const createApiKey_1 = require("./createApiKey");
const recommendVoice_1 = require("./recommendVoice");
const createVoiceProfile_1 = require("./createVoiceProfile");
const updateVoiceProfile_1 = require("./updateVoiceProfile");
const adminGetModels_1 = require("./adminGetModels");
const adminUpdateModels_1 = require("./adminUpdateModels");
const adminGetCostsSummary_1 = require("./adminGetCostsSummary");
const adminUsers_1 = require("./adminUsers");
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../../content-humanizer-f9499-firebase-adminsdk-fbsvc-aed388b14d.json');
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath)
    });
    console.log("Firebase Admin initialized using service account:", serviceAccountPath);
}
catch (e) {
    console.warn("Fallback to default Admin SDK initialization:", e.message);
    admin.initializeApp();
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Main App Routes
app.post('/api/v1/checkout/credits', authMiddleware_1.authMiddleware, checkoutCredits_1.checkoutCreditsHandler);
app.post('/api/v1/humanize', authMiddleware_1.authMiddleware, humanizeContent_1.humanizeContentHandler);
app.post('/api/v1/detect', authMiddleware_1.authMiddleware, detectAi_1.detectAiHandler);
app.post('/api/v1/keys', authMiddleware_1.authMiddleware, createApiKey_1.createApiKeyHandler);
app.post('/api/v1/voice-vault/recommend', authMiddleware_1.authMiddleware, recommendVoice_1.recommendVoiceHandler);
app.post('/api/v1/voice-vault', authMiddleware_1.authMiddleware, createVoiceProfile_1.createVoiceProfileHandler);
app.put('/api/v1/voice-vault/:voiceProfileId', authMiddleware_1.authMiddleware, updateVoiceProfile_1.updateVoiceProfileHandler);
// Admin Routes
app.get('/api/v1/admin/models', authMiddleware_1.authMiddleware, adminGetModels_1.adminGetModelsHandler);
app.post('/api/v1/admin/models', authMiddleware_1.authMiddleware, adminUpdateModels_1.adminUpdateModelsHandler);
app.get('/api/v1/admin/costs/summary', authMiddleware_1.authMiddleware, adminGetCostsSummary_1.adminGetCostsSummaryHandler);
app.get('/api/v1/admin/users', authMiddleware_1.authMiddleware, adminUsers_1.adminGetUsersHandler);
app.post('/api/v1/admin/users/:userId/credits', authMiddleware_1.authMiddleware, adminUsers_1.adminUpdateUserCreditsHandler);
app.post('/api/v1/admin/users/:userId/update', authMiddleware_1.authMiddleware, adminUsers_1.adminUpdateUserHandler);
app.delete('/api/v1/admin/users/:userId', authMiddleware_1.authMiddleware, adminUsers_1.adminDeleteUserHandler);
// Standalone Server Listener (if run outside Firebase Cloud Functions environment)
if (!process.env.FUNCTIONS_EMULATOR && !process.env.FIREBASE_CONFIG) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Standalone Express server running on port ${PORT}`);
    });
}
exports.apiGateway = functions.https.onRequest({ timeoutSeconds: 540, memory: '1GiB' }, app);
exports.humanizerOps = functions.https.onRequest({ timeoutSeconds: 540, memory: '1GiB' }, app);
//# sourceMappingURL=index.js.map