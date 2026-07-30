import { Response } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import * as admin from 'firebase-admin';

export const adminGetUsersHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    }));
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve registered users list' });
  }
};

export const adminUpdateUserCreditsHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;
    if (typeof amount !== 'number') {
      res.status(400).json({ error: 'amount must be a number' });
      return;
    }
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId as string);
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
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to adjust user credits' });
  }
};

export const adminUpdateUserHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role, credits, status, disableApiKeys } = req.body;
    
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId as string);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    const updates: any = {};
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
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update user configurations' });
  }
};

export const adminDeleteUserHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const db = admin.firestore();
    
    await db.collection('users').doc(userId as string).delete();
    
    const keysSnap = await db.collection('apiKeys').where('userId', '==', userId).get();
    const batch = db.batch();
    keysSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    try {
      await admin.auth().deleteUser(userId as string);
    } catch (authErr) {
      console.warn("Failed to delete user from Firebase Auth:", authErr);
    }
    
    res.json({ success: true, message: 'User and all associated data removed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to remove user' });
  }
};
