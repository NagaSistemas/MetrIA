import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, AlertTriangle, Upload, Image } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
  createdAt: Date;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  ingredients?: string;
  preparation?: string;
  allergens?: string[];
  available: boolean;
  createdAt: Date;
}

const CATEGORY_ICONS = [
  '🍽️', '🥗', '🍖', '🍰', '🍷', '🍝', '🥩', '🐟', '🥬', '🍕', 
  '🍔', '🌮', '🍜', '🍱', '🥘', '🍲', '🥙', '🧀', '🥖', '🍞',
  '☕', '🥤', '🍺', '🍸', '🥂', '🍾', '🧊', '🍯', '🥜', '🍓'
];

const MenuManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('categories');
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Category states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🍽️');
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  // Menu item states
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    ingredients: '',
    preparation: '',
    allergens: '',
    image: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchCategories(), fetchMenuItems()]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/menu-items`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuItems([]);
    }
  };

  // Image handling
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload-image`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    return data.imageUrl;
  };

  // Category functions
  const saveCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const url = editingCategory 
        ? `${import.meta.env.VITE_API_URL}/api/admin/categories/${editingCategory.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/categories`;
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          icon: newCategoryIcon
        })
      });

      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryIcon('🍽️');
      setShowIconPicker(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const deleteCategory = async (category: Category) => {
    if (!confirm(`Deletar categoria "${category.name}"? Todos os produtos desta categoria serão removidos.`)) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/categories/${category.id}`, {
        method: 'DELETE'
      });
      fetchCategories();
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Menu item functions
  const saveMenuItem = async () => {
    if (!itemForm.name.trim() || !itemForm.price || !itemForm.category) return;

    try {
      let imageUrl = itemForm.image;
      
      // Upload image if file is selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const url = editingItem 
        ? `${import.meta.env.VITE_API_URL}/api/admin/menu-items/${editingItem.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/menu-items`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemForm,
          image: imageUrl,
          price: parseFloat(itemForm.price),
          allergens: itemForm.allergens ? itemForm.allergens.split(',').map(a => a.trim()) : []
        })
      });

      resetItemForm();
      fetchMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const deleteMenuItem = async (item: MenuItem) => {
    if (!confirm(`Deletar "${item.name}"?`)) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/menu-items/${item.id}`, {
        method: 'DELETE'
      });
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const startEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      ingredients: item.ingredients || '',
      preparation: item.preparation || '',
      allergens: item.allergens?.join(', ') || '',
      image: item.image || ''
    });
    setImagePreview(item.image || '');
    setShowItemForm(true);
  };

  const resetItemForm = () => {
    setEditingItem(null);
    setShowItemForm(false);
    setItemForm({
      name: '', description: '', price: '', category: '',
      ingredients: '', preparation: '', allergens: '', image: ''
    });
    setImageFile(null);
    setImagePreview('');
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '80px',
        backgroundColor: '#2C2C2C',
        borderRadius: '16px',
        border: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          border: '4px solid #D4AF37',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '24px'
        }}></div>
        <h3 style={{ 
          fontFamily: 'Cinzel, serif',
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#D4AF37',
          margin: 0,
          marginBottom: '8px'
        }}>
          Carregando Cardápio
        </h3>
        <p style={{ color: '#F5F5F5', opacity: 0.7 }}>Preparando interface de gerenciamento...</p>
      </div>
    );
  }

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Professional Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 25px rgba(212, 175, 55, 0.3)'
          }}>
            <Edit size={32} style={{ color: '#0D0D0D' }} />
          </div>
        </div>
        <h2 style={{ 
          fontFamily: 'Cinzel, serif',
          fontSize: '32px', 
          fontWeight: '700', 
          color: '#D4AF37',
          margin: 0,
          marginBottom: '8px'
        }}>
          Gerenciamento de Cardápio
        </h2>
        <p style={{ 
          color: '#F5F5F5', 
          opacity: 0.8, 
          fontSize: '16px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Configure categorias e produtos do seu cardápio com elegância e profissionalismo
        </p>
      </div>

      {/* Enhanced Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        backgroundColor: '#2C2C2C',
        padding: '8px',
        borderRadius: '12px',
        border: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        {[
          { id: 'categories', label: 'Categorias', icon: '📂' },
          { id: 'items', label: 'Produtos', icon: '🍽️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '16px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, #D4AF37, #B8860B)' 
                : 'transparent',
              color: activeTab === tab.id ? '#0D0D0D' : '#F5F5F5',
              border: 'none',
              boxShadow: activeTab === tab.id ? '0 4px 15px rgba(212, 175, 55, 0.3)' : 'none'
            }}
          >
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Enhanced Category Form */}
          <div style={{
            background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#D4AF37',
              margin: 0,
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Plus size={20} />
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>
            
            <div className="category-form-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr auto auto auto', 
              gap: '16px', 
              alignItems: 'end' 
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#F5F5F5', 
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Bebidas, Sobremesas, Entradas..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#0D0D0D',
                    border: '2px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    color: '#F5F5F5',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#D4AF37';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div style={{ position: 'relative' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#F5F5F5', 
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Ícone
                </label>
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  style={{
                    width: '60px',
                    height: '52px',
                    backgroundColor: '#0D0D0D',
                    border: '2px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    color: '#F5F5F5',
                    fontSize: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#D4AF37';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                  }}
                >
                  {newCategoryIcon}
                </button>
                
                {/* Icon Picker */}
                {showIconPicker && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 1000,
                    backgroundColor: '#2C2C2C',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '8px',
                    width: '280px',
                    marginTop: '8px'
                  }}>
                    {CATEGORY_ICONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => {
                          setNewCategoryIcon(icon);
                          setShowIconPicker(false);
                        }}
                        style={{
                          width: '36px',
                          height: '36px',
                          backgroundColor: newCategoryIcon === icon ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                          border: newCategoryIcon === icon ? '1px solid #D4AF37' : '1px solid transparent',
                          borderRadius: '8px',
                          fontSize: '18px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (newCategoryIcon !== icon) {
                            e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (newCategoryIcon !== icon) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={saveCategory}
                disabled={!newCategoryName.trim()}
                style={{
                  background: newCategoryName.trim() 
                    ? 'linear-gradient(135deg, #D4AF37, #B8860B)' 
                    : 'rgba(102, 102, 102, 0.5)',
                  color: newCategoryName.trim() ? '#0D0D0D' : '#999',
                  border: 'none',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: newCategoryName.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: newCategoryName.trim() ? '0 4px 15px rgba(212, 175, 55, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (newCategoryName.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (newCategoryName.trim()) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
                  }
                }}
              >
                <Save size={18} />
                {editingCategory ? 'Salvar' : 'Criar'}
              </button>
              
              {editingCategory && (
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategoryName('');
                    setNewCategoryIcon('🍽️');
                    setShowIconPicker(false);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '2px solid rgba(245, 245, 245, 0.3)',
                    color: '#F5F5F5',
                    padding: '14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(245, 245, 245, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Enhanced Categories Grid */}
          <div className="categories-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {categories.map(category => (
              <div
                key={category.id}
                style={{
                  background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    {category.icon}
                  </div>
                  <div>
                    <h4 style={{ 
                      color: '#F5F5F5', 
                      fontWeight: '600',
                      fontSize: '18px',
                      margin: 0,
                      marginBottom: '4px'
                    }}>
                      {category.name}
                    </h4>
                    <p style={{
                      color: '#F5F5F5',
                      opacity: 0.6,
                      fontSize: '12px',
                      margin: 0
                    }}>
                      {menuItems.filter(item => item.category === category.name).length} produtos
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategory(category);
                      setNewCategoryName(category.name);
                      setNewCategoryIcon(category.icon);
                    }}
                    style={{
                      backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#D4AF37',
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.2)';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(category);
                    }}
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items Tab */}
      {activeTab === 'items' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Enhanced Add Item Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#D4AF37',
                margin: 0,
                marginBottom: '4px'
              }}>
                Produtos do Cardápio
              </h3>
              <p style={{ color: '#F5F5F5', opacity: 0.7, margin: 0 }}>
                {menuItems.length} produtos cadastrados
              </p>
            </div>
            <button
              onClick={() => {
                setShowItemForm(true);
                setEditingItem(null);
                setItemForm({
                  name: '', description: '', price: '', category: '',
                  ingredients: '', preparation: '', allergens: '', image: ''
                });
                setImageFile(null);
                setImagePreview('');
              }}
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                color: '#0D0D0D',
                border: 'none',
                padding: '16px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
              }}
            >
              <Plus size={20} />
              Novo Produto
            </button>
          </div>

          {/* Enhanced Menu Items Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {menuItems.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                }}
              >
                {/* Enhanced Item Image */}
                <div style={{ position: 'relative' }}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '200px',
                      background: 'linear-gradient(135deg, #0D0D0D 0%, #1a1a1a 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed rgba(212, 175, 55, 0.3)'
                    }}>
                      <Image size={48} style={{ color: '#D4AF37', marginBottom: '8px' }} />
                      <span style={{ color: '#F5F5F5', opacity: 0.6, fontSize: '14px' }}>
                        Sem imagem
                      </span>
                    </div>
                  )}
                  
                  {/* Price Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                    color: '#0D0D0D',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '16px',
                    fontWeight: '700',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                  }}>
                    R$ {item.price.toFixed(2)}
                  </div>
                </div>
                
                {/* Enhanced Item Content */}
                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#D4AF37',
                        margin: 0,
                        lineHeight: '1.2'
                      }}>
                        {item.name}
                      </h4>
                      <span style={{
                        backgroundColor: 'rgba(212, 175, 55, 0.2)',
                        color: '#D4AF37',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {item.category}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#F5F5F5',
                      opacity: 0.8,
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Enhanced Allergens */}
                  {item.allergens && item.allergens.length > 0 && (
                    <div style={{ 
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>
                          Contém Alérgenos:
                        </span>
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: '#F5F5F5',
                        opacity: 0.8,
                        margin: 0
                      }}>
                        {item.allergens.join(', ')}
                      </p>
                    </div>
                  )}
                  
                  {/* Enhanced Actions */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditItem(item);
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: '#D4AF37',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMenuItem(item);
                      }}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Item Form Modal */}
      {showItemForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(12px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#D4AF37',
                margin: 0,
                fontFamily: 'Cinzel, serif'
              }}>
                {editingItem ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={() => setShowItemForm(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(245, 245, 245, 0.3)',
                  color: '#F5F5F5',
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Image Upload Section */}
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#F5F5F5', 
                  fontSize: '16px', 
                  fontWeight: '500',
                  marginBottom: '12px' 
                }}>
                  Imagem do Produto
                </label>
                <div style={{
                  border: '2px dashed rgba(212, 175, 55, 0.3)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(13, 13, 13, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D4AF37';
                  e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                  e.currentTarget.style.backgroundColor = 'rgba(13, 13, 13, 0.5)';
                }}
                >
                  {imagePreview ? (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '150px',
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }}
                      />
                      <p style={{ color: '#D4AF37', fontSize: '14px', marginTop: '8px' }}>
                        Clique para alterar a imagem
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload size={48} style={{ color: '#D4AF37', marginBottom: '12px' }} />
                      <p style={{ color: '#F5F5F5', fontSize: '16px', marginBottom: '4px' }}>
                        Clique para selecionar uma imagem
                      </p>
                      <p style={{ color: '#F5F5F5', opacity: 0.6, fontSize: '12px' }}>
                        PNG, JPG até 5MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#F5F5F5', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    placeholder="Ex: Risotto de Camarão"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: '#0D0D0D',
                      border: '2px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '12px',
                      color: '#F5F5F5',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#D4AF37';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#F5F5F5', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                    placeholder="0,00"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: '#0D0D0D',
                      border: '2px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '12px',
                      color: '#F5F5F5',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#D4AF37';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              
              {/* Category */}
              <div>
                <label style={{ display: 'block', color: '#F5F5F5', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                  Categoria *
                </label>
                <select
                  value={itemForm.category}
                  onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#0D0D0D',
                    border: '2px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    color: '#F5F5F5',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#D4AF37';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Description */}
              <div>
                <label style={{ display: 'block', color: '#F5F5F5', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                  Descrição
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                  rows={3}
                  placeholder="Descreva o prato de forma atrativa..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#0D0D0D',
                    border: '2px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    color: '#F5F5F5',
                    fontSize: '16px',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#D4AF37';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              {/* Optional Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#F5F5F5', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                    Ingredientes (Opcional)
                  </label>
                  <textarea
                    value={itemForm.ingredients}
                    onChange={(e) => setItemForm({...itemForm, ingredients: e.target.value})}
                    rows={3}
                    placeholder="Liste os principais ingredientes..."
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: '#0D0D0D',
                      border: '2px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '12px',
                      color: '#F5F5F5',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#D4AF37';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#F5F5F5', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                    Modo de Preparo (Opcional)
                  </label>
                  <textarea
                    value={itemForm.preparation}
                    onChange={(e) => setItemForm({...itemForm, preparation: e.target.value})}
                    rows={3}
                    placeholder="Descreva o modo de preparo..."
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: '#0D0D0D',
                      border: '2px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '12px',
                      color: '#F5F5F5',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#D4AF37';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              
              {/* Allergens */}
              <div>
                <label style={{ display: 'block', color: '#F5F5F5', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                  <AlertTriangle size={16} style={{ color: '#f59e0b', marginRight: '6px' }} />
                  Alérgenos (Opcional)
                </label>
                <input
                  type="text"
                  value={itemForm.allergens}
                  onChange={(e) => setItemForm({...itemForm, allergens: e.target.value})}
                  placeholder="Ex: Glúten, Lactose, Amendoim (separados por vírgula)"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#0D0D0D',
                    border: '2px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '12px',
                    color: '#F5F5F5',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#f59e0b';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
            
            {/* Enhanced Actions */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'flex-end',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(212, 175, 55, 0.2)'
            }}>
              <button
                onClick={() => setShowItemForm(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid rgba(245, 245, 245, 0.3)',
                  color: '#F5F5F5',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(245, 245, 245, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={saveMenuItem}
                disabled={!itemForm.name.trim() || !itemForm.price || !itemForm.category}
                style={{
                  background: (itemForm.name.trim() && itemForm.price && itemForm.category)
                    ? 'linear-gradient(135deg, #D4AF37, #B8860B)' 
                    : 'rgba(102, 102, 102, 0.5)',
                  color: (itemForm.name.trim() && itemForm.price && itemForm.category) ? '#0D0D0D' : '#999',
                  border: 'none',
                  padding: '14px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: (itemForm.name.trim() && itemForm.price && itemForm.category) ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: (itemForm.name.trim() && itemForm.price && itemForm.category) ? '0 4px 15px rgba(212, 175, 55, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (itemForm.name.trim() && itemForm.price && itemForm.category) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (itemForm.name.trim() && itemForm.price && itemForm.category) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
                  }
                }}
              >
                <Save size={18} />
                {editingItem ? 'Salvar Alterações' : 'Criar Produto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
    <style>{`
      /* Mobile Responsive Styles for Category Form */
      @media (max-width: 768px) {
        .category-form-grid {
          grid-template-columns: 1fr !important;
          gap: 20px !important;
          align-items: stretch !important;
        }
        
        .categories-grid {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
        }
      }
      
      @media (max-width: 480px) {
        .category-form-grid {
          gap: 16px !important;
        }
        
        .category-form-grid > div:nth-child(2) {
          order: 2;
        }
        
        .category-form-grid > button:nth-child(3) {
          order: 3;
          width: 100% !important;
        }
        
        .category-form-grid > button:nth-child(4) {
          order: 4;
          width: 100% !important;
        }
      }
    `}</style>
    </>
  );
};

export default MenuManagement;