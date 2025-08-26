import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Plus, Minus, Wine, Leaf, AlertTriangle } from 'lucide-react';
import { useTable } from '../../contexts/TableContext';

interface ItemDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  ingredients: string[];
  allergens: string[];
  category: string;
  tags: string[];
  rating?: number;
  prepTime: string;
  isAlcoholic?: boolean;
  wineInfo?: {
    region: string;
    grape: string;
    year: number;
  };
  modifiers?: {
    id: string;
    name: string;
    options: { label: string; price: number }[];
    required: boolean;
    multiple: boolean;
  }[];
}

const ItemDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const token = searchParams.get('token');
  
  const { addToCart } = useTable();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedModifiers] = useState<{[key: string]: string[]}>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (itemId) {
      fetchItemDetail();
    }
  }, [itemId]);

  const fetchItemDetail = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menu/item/${itemId}`);
      const data = await response.json();
      setItem(data);
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const calculateTotalPrice = () => {
    if (!item) return 0;
    let total = item.price * quantity;
    
    Object.values(selectedModifiers).flat().forEach(modifierId => {
      item.modifiers?.forEach(modifier => {
        const option = modifier.options.find(opt => opt.label === modifierId);
        if (option) total += option.price * quantity;
      });
    });
    
    return total;
  };

  const handleAddToCart = () => {
    if (!item) return;
    
    addToCart(item as any, quantity, notes);
    
    // Toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-gold text-metria-black px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce-in border border-gold/30';
    toast.innerHTML = '🍽️ Adicionado ao prato!';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
    
    navigate(`/menu?sessionId=${sessionId}&token=${token}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-metria-black">
        <div className="animate-shimmer h-64 bg-metria-gray"></div>
        <div className="p-4 space-y-4">
          <div className="animate-shimmer h-8 bg-metria-gray rounded"></div>
          <div className="animate-shimmer h-4 bg-metria-gray rounded w-3/4"></div>
          <div className="animate-shimmer h-20 bg-metria-gray rounded"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-metria-black flex items-center justify-center">
        <div className="card-luxury text-center">
          <h2 className="font-serif text-gold text-xl mb-4">Item não encontrado</h2>
          <button onClick={() => navigate(-1)} className="btn-gold">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metria-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-metria-black/95 backdrop-blur-sm border-b border-gold/20 p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-video bg-metria-gray overflow-hidden">
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[currentImageIndex]}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-metria-white/50">
              Sem imagem
            </div>
          )}
        </div>
        
        {/* Image indicators */}
        {item.images && item.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {item.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-gold' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Tags */}
        <div className="absolute top-4 left-4 flex gap-2">
          {item.isAlcoholic && (
            <span className="bg-red-500/90 text-white px-2 py-1 rounded text-xs font-medium">
              Alcoólico
            </span>
          )}
          {item.tags?.map(tag => (
            <span key={tag} className="bg-metria-emerald/90 text-white px-2 py-1 rounded text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-32">
        {/* Title and Rating */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="font-serif text-gold text-3xl leading-tight">{item.name}</h1>
            {item.rating && (
              <div className="flex items-center gap-1 text-gold">
                <Star size={16} fill="currentColor" />
                <span className="text-sm font-medium">{item.rating}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <p className="text-gold font-bold text-2xl">R$ {item.price.toFixed(2)}</p>
            <div className="flex items-center gap-1 text-metria-white/60">
              <Clock size={14} />
              <span className="text-sm">{item.prepTime}</span>
            </div>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4 mb-8">
          {/* Description */}
          <div className="card-luxury">
            <button
              onClick={() => toggleSection('description')}
              className="w-full flex justify-between items-center text-left"
            >
              <h3 className="font-serif text-gold text-lg">Descrição</h3>
              <span className="text-gold">{expandedSections.description ? '−' : '+'}</span>
            </button>
            {expandedSections.description && (
              <div className="mt-3 pt-3 border-t border-gold/20">
                <p className="text-metria-white/80 leading-relaxed">{item.description}</p>
              </div>
            )}
          </div>

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="card-luxury">
              <button
                onClick={() => toggleSection('ingredients')}
                className="w-full flex justify-between items-center text-left"
              >
                <h3 className="font-serif text-gold text-lg flex items-center gap-2">
                  <Leaf size={18} />
                  Ingredientes
                </h3>
                <span className="text-gold">{expandedSections.ingredients ? '−' : '+'}</span>
              </button>
              {expandedSections.ingredients && (
                <div className="mt-3 pt-3 border-t border-gold/20">
                  <div className="flex flex-wrap gap-2">
                    {item.ingredients.map(ingredient => (
                      <span key={ingredient} className="bg-metria-black/50 text-metria-white px-3 py-1 rounded-full text-sm">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="card-luxury">
              <button
                onClick={() => toggleSection('allergens')}
                className="w-full flex justify-between items-center text-left"
              >
                <h3 className="font-serif text-gold text-lg flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Alergênicos
                </h3>
                <span className="text-gold">{expandedSections.allergens ? '−' : '+'}</span>
              </button>
              {expandedSections.allergens && (
                <div className="mt-3 pt-3 border-t border-gold/20">
                  <div className="flex flex-wrap gap-2">
                    {item.allergens.map(allergen => (
                      <span key={allergen} className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm border border-red-500/30">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wine Info */}
          {item.wineInfo && (
            <div className="card-luxury">
              <button
                onClick={() => toggleSection('wine')}
                className="w-full flex justify-between items-center text-left"
              >
                <h3 className="font-serif text-gold text-lg flex items-center gap-2">
                  <Wine size={18} />
                  Informações do Vinho
                </h3>
                <span className="text-gold">{expandedSections.wine ? '−' : '+'}</span>
              </button>
              {expandedSections.wine && (
                <div className="mt-3 pt-3 border-t border-gold/20 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-metria-white/60">Região:</span>
                    <span className="text-metria-white">{item.wineInfo.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-metria-white/60">Uva:</span>
                    <span className="text-metria-white">{item.wineInfo.grape}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-metria-white/60">Safra:</span>
                    <span className="text-metria-white">{item.wineInfo.year}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modifiers */}
        {item.modifiers && item.modifiers.map(modifier => (
          <div key={modifier.id} className="card-luxury mb-4">
            <h3 className="font-serif text-gold text-lg mb-3">
              {modifier.name} {modifier.required && <span className="text-red-400">*</span>}
            </h3>
            <div className="space-y-2">
              {modifier.options.map(option => (
                <label key={option.label} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type={modifier.multiple ? 'checkbox' : 'radio'}
                      name={modifier.id}
                      className="text-gold focus:ring-gold"
                    />
                    <span className="text-metria-white">{option.label}</span>
                  </div>
                  {option.price > 0 && (
                    <span className="text-gold font-medium">+R$ {option.price.toFixed(2)}</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Quantity and Notes */}
        <div className="space-y-4 mb-8">
          <div className="card-luxury">
            <h3 className="font-serif text-gold text-lg mb-3">Quantidade</h3>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border-2 border-gold text-gold flex items-center justify-center hover:bg-gold hover:text-metria-black transition-all"
              >
                <Minus size={16} />
              </button>
              <span className="text-2xl font-bold text-gold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full border-2 border-gold text-gold flex items-center justify-center hover:bg-gold hover:text-metria-black transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="card-luxury">
            <h3 className="font-serif text-gold text-lg mb-3">Observações</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma observação especial?"
              className="w-full bg-metria-black border border-gold/30 rounded-lg p-3 text-metria-white placeholder-metria-white/50 focus:border-gold focus:outline-none resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Prep Time Info */}
        <div className="text-center mb-8">
          <p className="text-metria-white/60 text-sm">
            ⏱️ Tempo médio de preparo: {item.prepTime}
          </p>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-metria-gray border-t border-gold/30 p-4">
        <button
          onClick={handleAddToCart}
          className="w-full btn-gold py-4 text-lg font-semibold flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Adicionar ao prato • R$ {calculateTotalPrice().toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default ItemDetailPage;