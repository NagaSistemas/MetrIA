import { Router } from 'express';
import { aiService } from '../services/aiService';
import { db } from '../config/firebase';

const router = Router();

// Chat com IA
router.post('/chat', async (req, res) => {
  try {
    const { sessionId, message, restaurantId } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    // Buscar dados do restaurante e cardápio
    const restaurantDoc = await db.collection('restaurants').doc(restaurantId || 'default').get();
    const restaurantData = restaurantDoc.data();

    const response = await aiService.chat(
      sessionId,
      message,
      restaurantData?.menu || [],
      restaurantData?.name || 'MetrIA'
    );

    res.json({ response, sessionId });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Limpar sessão de IA
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    aiService.clearSession(sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Clear AI Session Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;