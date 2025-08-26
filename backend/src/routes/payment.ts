import { Router } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Simular pagamento PIX
router.post('/pix', async (req, res) => {
  try {
    const { sessionId, amount, items } = req.body;

    // Criar pedido simplificado
    const orderId = uuidv4();
    const order = {
      id: orderId,
      sessionId,
      items: items.map((item: any) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      })),
      total: amount,
      status: 'PENDING',
      paymentStatus: 'PAID',
      isExtra: false,
      createdAt: new Date()
    };

    // Salvar pedido
    await db.collection('orders').doc(orderId).set(order);

    res.json({ success: true, orderId });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

export default router;