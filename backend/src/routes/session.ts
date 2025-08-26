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

    console.log('=== SESSION LOOKUP ===');
    console.log('SessionId:', sessionId);
    console.log('Token:', token);

    // First check if session exists in sessions collection
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    console.log('Session exists in sessions collection:', sessionDoc.exists);
    
    if (!sessionDoc.exists) {
      console.log('Session not found, searching in tables...');
      
      // Search in tables collection
      const tablesSnapshot = await db.collection('tables').get();
      console.log('Total tables found:', tablesSnapshot.docs.length);
      
      let foundTable = null;
      for (const tableDoc of tablesSnapshot.docs) {
        const tableData = tableDoc.data();
        if (tableData.currentSession?.id === sessionId) {
          foundTable = { doc: tableDoc, data: tableData };
          break;
        }
      }
      
      if (foundTable) {
        console.log('Found session in table:', foundTable.doc.id);
        const sessionData = foundTable.data.currentSession;
        
        // Validate token
        if (sessionData.token !== token) {
          console.log('Token mismatch:', sessionData.token, 'vs', token);
          return res.status(401).json({ error: 'Token inválido' });
        }
        
        // Create session document
        await db.collection('sessions').doc(sessionId).set(sessionData);
        console.log('Created session document');
        
        // Get menu
        const menuSnapshot = await db.collection('menuItems')
          .where('available', '==', true)
          .get();

        const menu = menuSnapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Returning session with', menu.length, 'menu items');
        
        return res.json({
          session: {
            id: sessionId,
            ...sessionData,
            tableNumber: foundTable.data.number
          },
          menu
        });
      }
      
      console.log('Session not found anywhere, creating new session');
      
      // Create a new session as fallback
      const newSessionId = sessionId;
      const newToken = token as string;
      
      const newSession = {
        id: newSessionId,
        tableId: 'fallback-table',
        restaurantId: 'default',
        status: 'OPEN',
        token: newToken,
        createdAt: new Date(),
        orders: [],
        waiterCalls: [],
        tableNumber: 1
      };
      
      // Save the new session
      await db.collection('sessions').doc(newSessionId).set(newSession);
      console.log('Created fallback session:', newSessionId);
      
      // Get menu
      const menuSnapshot = await db.collection('menuItems')
        .where('available', '==', true)
        .get();

      const menu = menuSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Returning fallback session with', menu.length, 'menu items');
      
      return res.json({
        session: newSession,
        menu
      });
    }
    
    console.log('Session found in sessions collection');

    const sessionData = sessionDoc.data();
    console.log('Session data:', sessionData);
    
    // Validate token
    if (sessionData?.token !== token) {
      console.log('Token validation failed');
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    console.log('Token validated successfully');

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