import { Router } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get or create session for table
router.get('/:restaurantId/:tableId', async (req, res) => {
  try {
    const { restaurantId, tableId } = req.params;
    const { token } = req.query;

    // Get table info
    const tableDoc = await db.collection('tables').doc(tableId).get();
    if (!tableDoc.exists) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const tableData = tableDoc.data();
    
    // Validate session token if provided
    if (token && tableData?.currentSession?.token !== token) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    // Create new session if none exists
    if (!tableData?.currentSession || tableData.currentSession.status === 'CLOSED') {
      const sessionId = uuidv4();
      const sessionToken = uuidv4();
      
      const newSession = {
        id: sessionId,
        tableId,
        restaurantId,
        status: 'OPEN',
        token: sessionToken,
        createdAt: new Date(),
        orders: [],
        waiterCalls: []
      };

      await db.collection('tables').doc(tableId).update({
        currentSession: newSession
      });

      await db.collection('sessions').doc(sessionId).set(newSession);
    }

    // Get restaurant menu
    const restaurantDoc = await db.collection('restaurants').doc(restaurantId).get();
    const restaurantData = restaurantDoc.data();

    res.json({
      session: tableData?.currentSession,
      menu: restaurantData?.menu || []
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;