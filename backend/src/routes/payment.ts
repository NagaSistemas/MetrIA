import { Router } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Simular pagamento PIX
router.post('/pix', async (req, res) => {
  try {
    const { sessionId, amount, items } = req.body;

    // Criar pedido
    const orderId = uuidv4();
    const order = {
      id: orderId,
      sessionId,
      items,
      total: amount,
      status: 'PENDING',
      paymentStatus: 'PAID',
      paymentId: uuidv4(),
      isExtra: false,
      createdAt: new Date()
    };

    // Salvar pedido
    await db.collection('orders').doc(orderId).set(order);

    // Atualizar sessão
    await db.collection('sessions').doc(sessionId).update({
      status: 'PAID',
      orders: [orderId]
    });

    res.json({
      success: true,
      orderId,
      paymentId: order.paymentId
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

export default router;