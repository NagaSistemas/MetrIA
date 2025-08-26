import { Router } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Call waiter
router.post('/', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    // Get session to find table number
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    const sessionData = sessionDoc.data();

    if (!sessionData) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const tableDoc = await db.collection('tables').doc(sessionData.tableId).get();
    const tableData = tableDoc.data();

    const callId = uuidv4();
    const waiterCall = {
      id: callId,
      sessionId,
      tableNumber: tableData?.number || 0,
      message,
      status: 'PENDING',
      createdAt: new Date()
    };

    await db.collection('waiterCalls').doc(callId).set(waiterCall);

    res.json({ success: true, callId });
  } catch (error) {
    console.error('Error calling waiter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;