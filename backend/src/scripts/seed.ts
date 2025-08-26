import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

const seedData = async () => {
  try {
    console.log('Seeding database...');

    // Create sample restaurant
    const restaurantId = 'default';
    const restaurant = {
      id: restaurantId,
      name: 'Restaurante Exemplo',
      logo: 'https://via.placeholder.com/200x100',
      aiPrompt: `Você é o assistente virtual do MetrIA. Na PRIMEIRA mensagem, apresente-se como: "Olá! Sou o assistente do MetrIA. Como posso ajudá-lo hoje? 😊"

Nas demais mensagens, responda APENAS à pergunta feita, sem se apresentar novamente. Seja direto, educado e prestativo.

Suas funções:
- Recomendar pratos baseado no gosto do cliente
- Explicar ingredientes e preparos dos pratos
- Sugerir combinações e acompanhamentos
- Tirar dúvidas sobre o cardápio
- Ajudar na escolha de bebidas

IMPORTANTE: Quando o cliente quiser adicionar um item, diga: "Ótima escolha! Para adicionar [NOME DO PRATO] ao seu pedido, clique no botão 'Adicionar ao Prato' na tela do cardápio."

Use emojis moderadamente e seja natural na conversa. Sempre mencione preços quando relevante.`,
      menu: [
        {
          id: uuidv4(),
          name: 'Hambúrguer Artesanal',
          description: 'Pão brioche, carne 180g, queijo cheddar, alface, tomate',
          price: 28.90,
          category: 'Lanches',
          image: 'https://via.placeholder.com/300x200',
          available: true
        },
        {
          id: uuidv4(),
          name: 'Pizza Margherita',
          description: 'Molho de tomate, mussarela, manjericão fresco',
          price: 35.00,
          category: 'Pizzas',
          image: 'https://via.placeholder.com/300x200',
          available: true
        },
        {
          id: uuidv4(),
          name: 'Salada Caesar',
          description: 'Alface romana, croutons, parmesão, molho caesar',
          price: 22.50,
          category: 'Saladas',
          image: 'https://via.placeholder.com/300x200',
          available: true
        },
        {
          id: uuidv4(),
          name: 'Coca-Cola 350ml',
          description: 'Refrigerante gelado',
          price: 6.00,
          category: 'Bebidas',
          available: true
        },
        {
          id: uuidv4(),
          name: 'Suco de Laranja',
          description: 'Suco natural da fruta',
          price: 8.50,
          category: 'Bebidas',
          available: true
        }
      ],
      createdAt: new Date()
    };

    await db.collection('restaurants').doc(restaurantId).set(restaurant);

    // Create sample tables
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      const tableId = uuidv4();
      const table = {
        id: tableId,
        number: i,
        restaurantId,
        qrCode: `https://app.seudominio.com/m/${restaurantId}/${tableId}?t=`,
        currentSession: null,
        createdAt: new Date()
      };
      
      tables.push(table);
      await db.collection('tables').doc(tableId).set(table);
    }

    console.log('✅ Database seeded successfully!');
    console.log(`Created restaurant: ${restaurant.name}`);
    console.log(`Created ${tables.length} tables`);
    console.log(`Created ${restaurant.menu.length} menu items`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  require('../config/firebase').initializeFirebase();
  seedData().then(() => process.exit(0));
}

export default seedData;