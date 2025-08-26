import { Router } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get restaurant data
router.get('/restaurant', async (req, res) => {
  try {
    const restaurantSnapshot = await db.collection('restaurants').limit(1).get();
    const restaurant = restaurantSnapshot.docs[0]?.data();
    res.json(restaurant || {});
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all tables
router.get('/tables', async (req, res) => {
  try {
    const tablesSnapshot = await db.collection('tables').orderBy('number', 'asc').get();
    const tables = tablesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate tables
router.post('/tables/generate', async (req, res) => {
  try {
    const { quantity } = req.body;
    const restaurantId = 'default'; // You might want to get this from auth

    const batch = db.batch();
    
    for (let i = 1; i <= quantity; i++) {
      const tableId = uuidv4();
      const qrCode = `https://app.seudominio.com/m/${restaurantId}/${tableId}?t=`;
      
      const tableRef = db.collection('tables').doc(tableId);
      batch.set(tableRef, {
        id: tableId,
        number: i,
        restaurantId,
        qrCode,
        currentSession: null,
        createdAt: new Date()
      });
    }

    await batch.commit();
    res.json({ success: true, message: `${quantity} tables generated` });
  } catch (error) {
    console.error('Error generating tables:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Close table session
router.post('/tables/:tableId/close-session', async (req, res) => {
  try {
    const { tableId } = req.params;

    const tableDoc = await db.collection('tables').doc(tableId).get();
    const tableData = tableDoc.data();

    if (tableData?.currentSession) {
      // Update session status to CLOSED
      await db.collection('sessions').doc(tableData.currentSession.id).update({
        status: 'CLOSED',
        closedAt: new Date()
      });

      // Remove current session from table
      await db.collection('tables').doc(tableId).update({
        currentSession: null
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error closing session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const ordersSnapshot = await db.collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const orders = ordersSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;