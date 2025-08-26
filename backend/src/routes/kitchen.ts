import { Router } from 'express';
import { db } from '../config/firebase';

const router = Router();

// Get all pending orders
router.get('/orders', async (req, res) => {
  try {
    const ordersSnapshot = await db.collection('orders')
      .where('status', 'in', ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'])
      .orderBy('createdAt', 'asc')
      .get();

    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status
router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    await db.collection('orders').doc(orderId).update({
      status,
      updatedAt: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get waiter calls
router.get('/waiter-calls', async (req, res) => {
  try {
    const callsSnapshot = await db.collection('waiterCalls')
      .where('status', '==', 'PENDING')
      .orderBy('createdAt', 'desc')
      .get();

    const calls = callsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(calls);
  } catch (error) {
    console.error('Error fetching waiter calls:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resolve waiter call
router.put('/waiter-calls/:callId/resolve', async (req, res) => {
  try {
    const { callId } = req.params;

    await db.collection('waiterCalls').doc(callId).update({
      status: 'RESOLVED',
      resolvedAt: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error resolving waiter call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;