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
  console.log('PIX payment request received:', req.body);
  
  try {
    const { sessionId, amount } = req.body;
    
    if (!sessionId || !amount) {
      return res.status(400).json({ error: 'SessionId and amount required' });
    }
    
    // Criar pedido simples
    const orderId = uuidv4();
    const order = {
      id: orderId,
      sessionId,
      tableNumber: 1,
      items: [{
        menuItemId: 'test-item',
        quantity: 1,
        price: amount,
        name: 'Pedido Teste'
      }],
      total: amount,
      status: 'PENDING',
      paymentStatus: 'PAID',
      isExtra: false,
      createdAt: new Date().toISOString()
    };

    console.log('Creating order:', order);
    
    // Salvar pedido
    await db.collection('orders').doc(orderId).set(order);
    
    console.log('Order created successfully:', orderId);

    res.json({ success: true, orderId });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment processing failed', details: error.message });
  }
});

export default router;