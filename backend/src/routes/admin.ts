import { Router } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get restaurant data
router.get('/restaurant', async (req, res) => {
  try {
    const restaurantSnapshot = await db.collection('restaurants').limit(1).get();
    const restaurant = restaurantSnapshot.docs[0]?.data();
    res.json(restaurant || {});
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all tables
router.get('/tables', async (req, res) => {
  try {
    const tablesSnapshot = await db.collection('tables').orderBy('number', 'asc').get();
    const tables = tablesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update existing tables with correct domain
router.post('/tables/update-domains', async (req, res) => {
  try {
    const tablesSnapshot = await db.collection('tables').get();
    const batch = db.batch();
    
    tablesSnapshot.docs.forEach(doc => {
      const tableData = doc.data();
      const newQrCode = `https://metria.nagasistemas.com/m/${tableData.restaurantId}/${doc.id}?t=`;
      
      batch.update(doc.ref, {
        qrCode: newQrCode,
        updatedAt: new Date()
      });
    });
    
    await batch.commit();
    res.json({ success: true, message: `Updated ${tablesSnapshot.docs.length} tables with correct domain` });
  } catch (error) {
    console.error('Error updating table domains:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate tables
router.post('/tables/generate', async (req, res) => {
  try {
    const { quantity } = req.body;
    const restaurantId = 'default'; // You might want to get this from auth

    const batch = db.batch();
    
    for (let i = 1; i <= quantity; i++) {
      const tableId = uuidv4();
      const qrCode = `https://metria.nagasistemas.com/m/${restaurantId}/${tableId}?t=`;
      
      const tableRef = db.collection('tables').doc(tableId);
      batch.set(tableRef, {
        id: tableId,
        number: i,
        restaurantId,
        qrCode,
        currentSession: null,
        createdAt: new Date()
      });
    }

    await batch.commit();
    res.json({ success: true, message: `${quantity} tables generated` });
  } catch (error) {
    console.error('Error generating tables:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Close table session
router.post('/tables/:tableId/close-session', async (req, res) => {
  try {
    const { tableId } = req.params;

    const tableDoc = await db.collection('tables').doc(tableId).get();
    const tableData = tableDoc.data();

    if (tableData?.currentSession) {
      // Update session status to CLOSED
      await db.collection('sessions').doc(tableData.currentSession.id).update({
        status: 'CLOSED',
        closedAt: new Date()
      });

      // Remove current session from table
      await db.collection('tables').doc(tableId).update({
        currentSession: null
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error closing session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update table
router.put('/tables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { number } = req.body;
    
    if (!number) {
      return res.status(400).json({ error: 'Table number is required' });
    }

    const tableRef = db.collection('tables').doc(id);
    const tableDoc = await tableRef.get();
    
    if (!tableDoc.exists) {
      return res.status(404).json({ error: 'Table not found' });
    }

    await tableRef.update({ 
      number: parseInt(number),
      updatedAt: new Date()
    });
    
    res.json({ success: true, message: 'Table updated successfully' });
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete table
router.delete('/tables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const tableRef = db.collection('tables').doc(id);
    const tableDoc = await tableRef.get();
    
    if (!tableDoc.exists) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const tableData = tableDoc.data();
    
    // Check if table has active session
    if (tableData?.currentSession) {
      return res.status(400).json({ error: 'Cannot delete table with active session' });
    }

    await tableRef.delete();
    
    res.json({ success: true, message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const ordersSnapshot = await db.collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const orders = ordersSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI PROMPT MANAGEMENT

// Get AI prompt
router.get('/ai-prompt', async (req, res) => {
  try {
    const restaurantSnapshot = await db.collection('restaurants').limit(1).get();
    const restaurant = restaurantSnapshot.docs[0]?.data();
    
    const defaultPrompt = `Você é o assistente virtual do MetrIA. Na PRIMEIRA mensagem, apresente-se como: "Olá! Sou o assistente do MetrIA. Como posso ajudá-lo hoje? 😊"

Nas demais mensagens, responda APENAS à pergunta feita, sem se apresentar novamente. Seja direto, educado e prestativo.

Suas funções:
- Recomendar pratos baseado no gosto do cliente
- Explicar ingredientes e preparos dos pratos
- Sugerir combinações e acompanhamentos
- Tirar dúvidas sobre o cardápio
- Ajudar na escolha de bebidas

IMPORTANTE: Quando o cliente quiser adicionar um item, diga: "Ótima escolha! Para adicionar [NOME DO PRATO] ao seu pedido, clique no botão 'Adicionar ao Prato' na tela do cardápio."

Use emojis moderadamente e seja natural na conversa. Sempre mencione preços quando relevante.`;
    
    res.json({ prompt: restaurant?.aiPrompt || defaultPrompt });
  } catch (error) {
    console.error('Error fetching AI prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update AI prompt
router.post('/ai-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get or create restaurant document
    const restaurantSnapshot = await db.collection('restaurants').limit(1).get();
    
    if (restaurantSnapshot.empty) {
      // Create new restaurant document
      const restaurantId = 'default';
      await db.collection('restaurants').doc(restaurantId).set({
        id: restaurantId,
        name: 'MetrIA Restaurant',
        aiPrompt: prompt.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // Update existing restaurant
      const restaurantDoc = restaurantSnapshot.docs[0];
      await restaurantDoc.ref.update({
        aiPrompt: prompt.trim(),
        updatedAt: new Date()
      });
    }
    
    res.json({ success: true, message: 'AI prompt updated successfully' });
  } catch (error) {
    console.error('Error updating AI prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CATEGORIES ROUTES

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categoriesSnapshot = await db.collection('categories').orderBy('name', 'asc').get();
    const categories = categoriesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  try {
    const { name, icon } = req.body;
    
    if (!name || !icon) {
      return res.status(400).json({ error: 'Name and icon are required' });
    }

    const categoryId = uuidv4();
    const categoryData = {
      id: categoryId,
      name: name.trim(),
      icon,
      createdAt: new Date()
    };

    await db.collection('categories').doc(categoryId).set(categoryData);
    
    res.json({ success: true, category: categoryData });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;
    
    if (!name || !icon) {
      return res.status(400).json({ error: 'Name and icon are required' });
    }

    const categoryRef = db.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();
    
    if (!categoryDoc.exists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await categoryRef.update({
      name: name.trim(),
      icon,
      updatedAt: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const categoryRef = db.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();
    
    if (!categoryDoc.exists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const categoryData = categoryDoc.data();
    
    // Delete all menu items in this category
    const menuItemsSnapshot = await db.collection('menuItems')
      .where('category', '==', categoryData?.name)
      .get();
    
    const batch = db.batch();
    menuItemsSnapshot.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });
    
    // Delete the category
    batch.delete(categoryRef);
    
    await batch.commit();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// MENU ITEMS ROUTES

// Get all menu items
router.get('/menu-items', async (req, res) => {
  try {
    const menuItemsSnapshot = await db.collection('menuItems')
      .orderBy('name', 'asc')
      .get();
    
    const menuItems = menuItemsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create menu item
router.post('/menu-items', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      image, 
      ingredients, 
      preparation, 
      allergens 
    } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const menuItemId = uuidv4();
    const menuItemData = {
      id: menuItemId,
      name: name.trim(),
      description: description?.trim() || '',
      price: parseFloat(price),
      category: category.trim(),
      image: image || '',
      ingredients: ingredients?.trim() || '',
      preparation: preparation?.trim() || '',
      allergens: allergens || [],
      available: true,
      createdAt: new Date()
    };

    await db.collection('menuItems').doc(menuItemId).set(menuItemData);
    
    res.json({ success: true, menuItem: menuItemData });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update menu item
router.put('/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      category, 
      image, 
      ingredients, 
      preparation, 
      allergens 
    } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const menuItemRef = db.collection('menuItems').doc(id);
    const menuItemDoc = await menuItemRef.get();
    
    if (!menuItemDoc.exists) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await menuItemRef.update({
      name: name.trim(),
      description: description?.trim() || '',
      price: parseFloat(price),
      category: category.trim(),
      image: image || '',
      ingredients: ingredients?.trim() || '',
      preparation: preparation?.trim() || '',
      allergens: allergens || [],
      updatedAt: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete menu item
router.delete('/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuItemRef = db.collection('menuItems').doc(id);
    const menuItemDoc = await menuItemRef.get();
    
    if (!menuItemDoc.exists) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await menuItemRef.delete();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// IMAGE UPLOAD ROUTE

// Upload image
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // In production, you would upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
    // For now, we'll return a local URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      imageUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;