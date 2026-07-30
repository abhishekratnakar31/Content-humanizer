import { Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest } from './authMiddleware';

export async function checkoutCreditsHandler(req: AuthenticatedRequest, res: Response) {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to checkout credits' });
  }
}
