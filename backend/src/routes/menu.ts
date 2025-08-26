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
    menuItemsSnapshot.docs.forEach(doc => {
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
      .orderBy('category', 'asc')
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