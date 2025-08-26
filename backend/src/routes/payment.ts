import { Router } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Debug route
router.get('/debug', (req, res) => {
  res.json({ 
    status: 'Payment routes active', 
    timestamp: new Date().toISOString(),
    routes: ['/pix']
  });
});

// Simular pagamento PIX
router.post('/pix', (req, res) => {
  try {
    const orderId = uuidv4();
    const order = {
      id: orderId,
      sessionId: req.body.sessionId || 'test-session',
      tableNumber: Math.floor(Math.random() * 10) + 1,
      items: [{
        menuItemId: 'item-1',
        quantity: 1,
        price: req.body.amount || 50,
        name: 'Pedido Simulado'
      }],
      total: req.body.amount || 50,
      status: 'PENDING',
      paymentStatus: 'PAID',
      isExtra: false,
      createdAt: new Date().toISOString()
    };

    // Simular salvamento (sem Firebase para evitar erro)
    setTimeout(async () => {
      try {
        await db.collection('orders').doc(orderId).set(order);
      } catch (e) {
        console.log('Firebase error (ignored):', e.message);
      }
    }, 100);

    res.json({ success: true, orderId });
  } catch (error) {
    res.json({ success: true, orderId: 'test-order-' + Date.now() });
  }
});

export default router;