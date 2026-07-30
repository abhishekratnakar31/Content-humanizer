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
exports.checkoutCreditsHandler = checkoutCreditsHandler;
const admin = __importStar(require("firebase-admin"));
async function checkoutCreditsHandler(req, res) {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { credits, tier } = req.body;
        if (typeof credits !== 'number' || credits <= 0) {
            res.status(400).json({ error: 'Invalid credits amount' });
            return;
        }
        const userRef = admin.firestore().collection('users').doc(userId);
        await admin.firestore().runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error('User does not exist');
            }
            const currentCredits = userDoc.data()?.credits || 0;
            transaction.update(userRef, {
                credits: currentCredits + credits,
                tier: tier || userDoc.data()?.tier || 'starter'
            });
        });
        res.json({ success: true, message: 'Credits and tier updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to checkout credits' });
    }
}
//# sourceMappingURL=checkoutCredits.js.map