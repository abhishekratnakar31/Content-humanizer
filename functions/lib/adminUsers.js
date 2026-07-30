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
exports.adminDeleteUserHandler = exports.adminUpdateUserHandler = exports.adminUpdateUserCreditsHandler = exports.adminGetUsersHandler = void 0;
const admin = __importStar(require("firebase-admin"));
const adminGetUsersHandler = async (req, res) => {
    try {
        const db = admin.firestore();
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map((doc) => ({
            userId: doc.id,
            ...doc.data(),
        }));
        res.json({ users });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve registered users list' });
    }
};
exports.adminGetUsersHandler = adminGetUsersHandler;
const adminUpdateUserCreditsHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;
        if (typeof amount !== 'number') {
            res.status(400).json({ error: 'amount must be a number' });
            return;
        }
        const db = admin.firestore();
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const currentCredits = userDoc.data()?.credits || 0;
        const newCredits = Math.max(0, currentCredits + amount);
        await userRef.update({ credits: newCredits });
        await db.collection('creditTransactions').add({
            userId,
            type: amount >= 0 ? 'admin_grant' : 'admin_deduction',
            amount,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.json({ success: true, userId, newCredits });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to adjust user credits' });
    }
};
exports.adminUpdateUserCreditsHandler = adminUpdateUserCreditsHandler;
const adminUpdateUserHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role, credits, status, disableApiKeys } = req.body;
        const db = admin.firestore();
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const updates = {};
        if (role !== undefined) {
            if (role !== 'admin' && role !== 'user') {
                res.status(400).json({ error: 'role must be either admin or user' });
                return;
            }
            updates.role = role;
        }
        if (credits !== undefined) {
            if (typeof credits !== 'number') {
                res.status(400).json({ error: 'credits must be a number' });
                return;
            }
            updates.credits = credits;
            const currentCredits = userDoc.data()?.credits || 0;
            const difference = credits - currentCredits;
            if (difference !== 0) {
                await db.collection('creditTransactions').add({
                    userId,
                    type: difference >= 0 ? 'admin_grant' : 'admin_deduction',
                    amount: difference,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        }
        if (status !== undefined) {
            updates.status = status;
        }
        if (Object.keys(updates).length > 0) {
            await userRef.update(updates);
        }
        if (disableApiKeys === true) {
            const keysSnap = await db.collection('apiKeys').where('userId', '==', userId).get();
            const batch = db.batch();
            keysSnap.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            await userRef.update({ hasCreatedKey: false });
        }
        res.json({ success: true, userId, updates });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update user configurations' });
    }
};
exports.adminUpdateUserHandler = adminUpdateUserHandler;
const adminDeleteUserHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        const db = admin.firestore();
        await db.collection('users').doc(userId).delete();
        const keysSnap = await db.collection('apiKeys').where('userId', '==', userId).get();
        const batch = db.batch();
        keysSnap.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        try {
            await admin.auth().deleteUser(userId);
        }
        catch (authErr) {
            console.warn("Failed to delete user from Firebase Auth:", authErr);
        }
        res.json({ success: true, message: 'User and all associated data removed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to remove user' });
    }
};
exports.adminDeleteUserHandler = adminDeleteUserHandler;
//# sourceMappingURL=adminUsers.js.map