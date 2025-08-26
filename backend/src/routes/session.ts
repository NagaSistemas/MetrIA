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

// Get session by ID
router.get('/by-id/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { token } = req.query;

    console.log('Looking for session:', sessionId, 'with token:', token);

    // Get session
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      console.log('Session not found in database:', sessionId);
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }
    
    console.log('Session found:', sessionDoc.data());

    const sessionData = sessionDoc.data();
    
    // Validate token
    if (sessionData?.token !== token) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Get menu
    const menuSnapshot = await db.collection('menuItems')
      .where('available', '==', true)
      .get();

    const menu = menuSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    // Update last activity
    await db.collection('sessions').doc(sessionId).update({
      lastActivity: new Date()
    });

    // Get table info for table number
    const tableDoc = await db.collection('tables').doc(sessionData.tableId).get();
    const tableData = tableDoc.data();
    
    res.json({
      session: {
        id: sessionDoc.id,
        ...sessionData,
        tableNumber: tableData?.number
      },
      menu
    });
  } catch (error) {
    console.error('Error getting session by ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;