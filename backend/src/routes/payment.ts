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
router.post('/pix', async (req, res) => {
  try {
    const { sessionId, amount } = req.body;
    
    const orderId = uuidv4();
    const order = {
      id: orderId,
      sessionId: sessionId || 'test-session',
      tableNumber: Math.floor(Math.random() * 10) + 1,
      items: [{
        menuItemId: 'item-1',
        quantity: 1,
        price: Number(amount) || 50,
        name: 'Pedido Simulado'
      }],
      total: Number(amount) || 50,
      status: 'PENDING',
      paymentStatus: 'PAID',
      isExtra: false,
      createdAt: new Date().toISOString()
    };

    // Salvar no Firebase
    await db.collection('orders').doc(orderId).set(order);
    
    res.json({ success: true, orderId });
  } catch (error: any) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment failed', details: error.message });
  }
});

export default router;