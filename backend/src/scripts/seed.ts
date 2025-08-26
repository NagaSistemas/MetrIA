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

    // Create sample categories
    const categories = [
      { id: uuidv4(), name: 'Entradas', icon: '🥗', createdAt: new Date() },
      { id: uuidv4(), name: 'Pratos Principais', icon: '🍖', createdAt: new Date() },
      { id: uuidv4(), name: 'Massas', icon: '🍝', createdAt: new Date() },
      { id: uuidv4(), name: 'Pizzas', icon: '🍕', createdAt: new Date() },
      { id: uuidv4(), name: 'Sobremesas', icon: '🍰', createdAt: new Date() },
      { id: uuidv4(), name: 'Bebidas', icon: '🍷', createdAt: new Date() }
    ];

    for (const category of categories) {
      await db.collection('categories').doc(category.id).set(category);
    }

    // Create sample menu items
    const menuItems = [
      {
        id: uuidv4(),
        name: 'Bruschetta Italiana',
        description: 'Pão italiano tostado com tomate, manjericão e azeite extra virgem',
        price: 18.90,
        category: 'Entradas',
        categoryIcon: '🥗',
        image: '',
        ingredients: 'Pão italiano, tomate, manjericão, alho, azeite extra virgem',
        preparation: 'Tostar o pão, esfregar com alho e cobrir com a mistura de tomate',
        allergens: ['Glúten'],
        available: true,
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Filé Mignon Grelhado',
        description: 'Filé mignon grelhado com batatas rústicas e legumes salteados',
        price: 65.90,
        category: 'Pratos Principais',
        categoryIcon: '🍖',
        image: '',
        ingredients: 'Filé mignon, batatas, brócolis, cenoura, abobrinha',
        preparation: 'Grelhar a carne no ponto desejado, saltear os legumes',
        allergens: [],
        available: true,
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Spaghetti Carbonara',
        description: 'Massa italiana com molho cremoso, bacon e parmesão',
        price: 42.50,
        category: 'Massas',
        categoryIcon: '🍝',
        image: '',
        ingredients: 'Spaghetti, bacon, ovos, parmesão, pimenta do reino',
        preparation: 'Cozinhar a massa al dente, misturar com molho cremoso',
        allergens: ['Glúten', 'Lactose', 'Ovos'],
        available: true,
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Pizza Quattro Stagioni',
        description: 'Pizza com quatro sabores: presunto, cogumelos, alcachofra e azeitonas',
        price: 48.00,
        category: 'Pizzas',
        categoryIcon: '🍕',
        image: '',
        ingredients: 'Massa de pizza, molho de tomate, mussarela, presunto, cogumelos, alcachofra, azeitonas',
        preparation: 'Assar em forno a lenha por 8-10 minutos',
        allergens: ['Glúten', 'Lactose'],
        available: true,
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Tiramisu',
        description: 'Sobremesa italiana com café, mascarpone e cacau',
        price: 16.90,
        category: 'Sobremesas',
        categoryIcon: '🍰',
        image: '',
        ingredients: 'Biscoito champagne, café, mascarpone, ovos, açúcar, cacau',
        preparation: 'Montar em camadas e refrigerar por 4 horas',
        allergens: ['Glúten', 'Lactose', 'Ovos'],
        available: true,
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Vinho Tinto Reserva',
        description: 'Vinho tinto seco, corpo médio, ideal para carnes',
        price: 85.00,
        category: 'Bebidas',
        categoryIcon: '🍷',
        image: '',
        ingredients: 'Uvas tintas selecionadas',
        preparation: 'Servir à temperatura ambiente',
        allergens: ['Sulfitos'],
        available: true,
        createdAt: new Date()
      }
    ];

    for (const item of menuItems) {
      await db.collection('menuItems').doc(item.id).set(item);
    }

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
    console.log(`Created ${categories.length} categories`);
    console.log(`Created ${menuItems.length} menu items`);
    console.log(`Created ${tables.length} tables`);

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