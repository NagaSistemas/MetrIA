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
    const { sessionId, amount, items } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'SessionId is required' });
    }

    // Verificar se já existe um pedido para esta sessão para evitar duplicatas
    const existingOrdersSnapshot = await db.collection('orders')
      .where('sessionId', '==', sessionId)
      .where('paymentStatus', '==', 'PAID')
      .get();
    
    if (!existingOrdersSnapshot.empty) {
      const existingOrder = existingOrdersSnapshot.docs[0];
      return res.json({ success: true, orderId: existingOrder.id });
    }

    // Buscar dados da sessão para obter o número da mesa
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    const sessionData = sessionDoc.data();
    
    let tableNumber = 1; // Default
    if (sessionData?.tableId) {
      const tableDoc = await db.collection('tables').doc(sessionData.tableId).get();
      const tableData = tableDoc.data();
      tableNumber = tableData?.number || 1;
    }
    
    const orderId = uuidv4();
    const order = {
      id: orderId,
      sessionId,
      tableNumber,
      items: Array.isArray(items) ? items : [],
      total: Number(amount) || 0,
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