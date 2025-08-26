import { Router } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Simular pagamento PIX
router.post('/pix', async (req, res) => {
  try {
    const { sessionId, amount, items } = req.body;

    // Buscar dados da sessão
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    const sessionData = sessionDoc.data();
    
    // Criar pedido único
    const orderId = uuidv4();
    const order = {
      id: orderId,
      sessionId,
      tableNumber: sessionData?.tableNumber || 1,
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
      createdAt: new Date().toISOString()
    };

    // Verificar se pedido já existe
    const existingOrder = await db.collection('orders')
      .where('sessionId', '==', sessionId)
      .where('total', '==', amount)
      .where('createdAt', '>', new Date(Date.now() - 30000).toISOString())
      .get();
    
    if (!existingOrder.empty) {
      return res.json({ success: true, orderId: existingOrder.docs[0].id });
    }

    // Salvar pedido
    await db.collection('orders').doc(orderId).set(order);

    res.json({ success: true, orderId });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

export default router;