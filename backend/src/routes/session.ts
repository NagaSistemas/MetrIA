import { Router } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Debug route
router.get('/debug', (req, res) => {
  res.json({ 
    status: 'Session routes active', 
    timestamp: new Date().toISOString(),
    version: '2.0'
  });
});

// Get session by ID - MUST BE BEFORE /:restaurantId/:tableId
router.get('/by-id/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { token } = req.query;

    console.log('SESSION BY ID REQUEST:', sessionId, token);

    // Always create a working session
    const session = {
      id: sessionId,
      tableId: 'demo-table',
      restaurantId: 'default',
      status: 'OPEN',
      token: token as string,
      createdAt: new Date(),
      orders: [],
      waiterCalls: [],
      tableNumber: 1
    };

    // Get menu items
    const menuSnapshot = await db.collection('menuItems')
      .where('available', '==', true)
      .get();

    const menu = menuSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      console.log('Menu item data:', data); // Debug
      return {
        id: doc.id,
        ...data
      };
    });

    console.log('RETURNING SESSION WITH MENU:', menu.length, 'items');

    res.json({ session, menu });
  } catch (error) {
    console.error('Error in by-id route:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

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

    let currentSession = tableData?.currentSession;
    
    // Always create new session for now to fix the issue
    const sessionId = uuidv4();
    const sessionToken = uuidv4();
    
    currentSession = {
      id: sessionId,
      tableId,
      restaurantId,
      status: 'OPEN',
      token: sessionToken,
      createdAt: new Date(),
      orders: [],
      waiterCalls: [],
      tableNumber: tableData?.number
    };

    // Save to both collections
    await Promise.all([
      db.collection('tables').doc(tableId).update({
        currentSession: currentSession
      }),
      db.collection('sessions').doc(sessionId).set(currentSession)
    ]);
    
    console.log('Created new session:', sessionId);

    // Get restaurant menu
    const restaurantDoc = await db.collection('restaurants').doc(restaurantId).get();
    const restaurantData = restaurantDoc.data();

    res.json({
      session: currentSession,
      menu: restaurantData?.menu || []
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



export default router;