import axios from 'axios';
import { db } from '../config/firebase';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  throw new Error('DEEPSEEK_API_KEY environment variable is required');
}
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AIService {
  private sessions: Map<string, ChatMessage[]> = new Map();

  async chat(sessionId: string, message: string, menuItems: any[], restaurantName: string = 'MetrIA'): Promise<string> {
    try {
      // Inicializar sessão se não existir
      if (!this.sessions.has(sessionId)) {
        this.sessions.set(sessionId, []);
      }

      const history = this.sessions.get(sessionId)!;
      const isFirstMessage = history.length === 0;

      // Criar contexto detalhado do cardápio
      const menuContext = menuItems.map(item => {
        let itemInfo = `${item.name} - R$ ${item.price.toFixed(2)} - ${item.description} (Categoria: ${item.category})`;
        
        if (item.ingredients) {
          itemInfo += ` - Ingredientes: ${item.ingredients}`;
        }
        
        if (item.preparation) {
          itemInfo += ` - Preparo: ${item.preparation}`;
        }
        
        if (item.allergens && item.allergens.length > 0) {
          itemInfo += ` - Alérgenos: ${item.allergens.join(', ')}`;
        }
        
        if (item.image) {
          itemInfo += ` - Imagem disponível: ${item.image}`;
        }
        
        return itemInfo;
      }).join('\n');

      // Buscar prompt personalizado do banco de dados
      let customPrompt = '';
      try {
        const restaurantSnapshot = await db.collection('restaurants').limit(1).get();
        const restaurant = restaurantSnapshot.docs[0]?.data();
        customPrompt = restaurant?.aiPrompt || '';
      } catch (error) {
        console.error('Error fetching custom prompt:', error);
      }

      // Buscar categorias com ícones
      const categoriesSnapshot = await db.collection('categories').get();
      const categories = categoriesSnapshot.docs.map(doc => {
        const data = doc.data();
        return `${data.name} ${data.icon || '🍽️'}`;
      });
      
      const categoriesContext = categories.length > 0 ? 
        `\n\nCATEGORIAS DISPONÍVEIS:\n${categories.join(', ')}` : '';

      // Usar prompt personalizado ou padrão
      const systemPrompt = customPrompt ? 
        `${customPrompt}

CARDÁPIO DISPONÍVEL:
${menuContext}${categoriesContext}

Contexto: ${isFirstMessage ? 'Esta é a primeira mensagem da conversa.' : 'Continue a conversa normalmente.'}` :
        `Você é o assistente virtual do restaurante ${restaurantName}. 

${isFirstMessage ? 'Na PRIMEIRA mensagem, apresente-se educadamente e ofereça ajuda.' : 'Responda diretamente à pergunta sem se apresentar novamente.'}

CARDÁPIO DISPONÍVEL:
${menuContext}${categoriesContext}

SUAS FUNÇÕES:
- Recomendar pratos baseado no gosto do cliente
- Explicar ingredientes e preparos detalhadamente
- Sugerir combinações
- Tirar dúvidas sobre o cardápio
- Mostrar fotos dos pratos quando solicitado
- Informar sobre alérgenos
- Ser cordial e prestativo

IMPORTANTE: 
- Quando o cliente quiser adicionar um item ao pedido, responda: "Ótima escolha! Para adicionar [NOME DO PRATO] ao seu pedido, clique no botão 'Adicionar ao Prato' na tela do cardápio."
- Quando o cliente pedir para ver uma foto de um prato, responda: "Aqui está a foto do [NOME DO PRATO]: [URL_DA_IMAGEM]" (use a URL da imagem do produto)
- Sempre mencione ingredientes, preparo e alérgenos quando relevante
- Use as informações detalhadas dos produtos para dar recomendações precisas
- Mencione as categorias disponíveis quando apropriado

Use emojis moderadamente e seja natural na conversa.`;

      // Preparar mensagens para a API
      const messages: ChatMessage[] = [
        { role: 'user', content: systemPrompt },
        ...history.slice(-6), // Últimas 6 mensagens
        { role: 'user', content: message }
      ];

      const response = await axios.post(DEEPSEEK_URL, {
        model: 'deepseek-chat',
        messages,
        max_tokens: 500,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = response.data.choices[0].message.content;

      // Salvar no histórico
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: aiResponse });

      // Limitar histórico
      if (history.length > 10) {
        this.sessions.set(sessionId, history.slice(-10));
      }

      return aiResponse;

    } catch (error) {
      console.error('AI Service Error:', error);
      return 'Desculpe, estou com dificuldades técnicas no momento. Posso ajudá-lo de outra forma?';
    }
  }

  clearSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }
}

export const aiService = new AIService();