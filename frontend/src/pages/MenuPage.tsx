import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTable } from '../contexts/TableContext';
import { ShoppingCart, MessageCircle, Phone, Plus, Star, Clock, Users, ChefHat } from 'lucide-react';
import AIChat from '../components/AIChat';

const MenuPage: React.FC = () => {
  const { restaurantId, tableId } = useParams<{ restaurantId: string; tableId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');
  const { session, menu, cart, addToCart, loadSession } = useTable();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAI, setShowAI] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (restaurantId && tableId && token) {
      loadSession(restaurantId, tableId, token).finally(() => setIsLoading(false));
    }
  }, [restaurantId, tableId, token]);

  const categories = ['all', ...new Set(menu.map(item => item.category))];
  const filteredMenu = selectedCategory === 'all' 
    ? menu 
    : menu.filter(item => item.category === selectedCategory);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCallWaiter = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/call-waiter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session?.id, message: 'Cliente solicitou atendimento' })
      });
      // Toast notification instead of alert
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-metria-emerald text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce';
      toast.textContent = '✓ Garçom chamado com sucesso!';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } catch (error) {
      console.error('Error calling waiter:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-metria-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="logo-metria text-2xl mb-2">MetrIA</h2>
          <p className="text-metria-white/70">Preparando sua experiência...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-metria-black flex items-center justify-center">
        <div className="card-luxury text-center max-w-md">
          <h2 className="font-serif text-gold text-xl mb-4">Sessão não encontrada</h2>
          <p className="text-metria-white/70">Verifique o QR Code da mesa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metria-black">
      {/* Header Luxuoso com Animação */}
      <div className="bg-gradient-to-b from-metria-gray to-metria-black shadow-2xl p-6 border-b border-gold/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent"></div>
        <div className="relative z-10">
          <div className="text-center mb-4">
            <h1 className="logo-metria text-4xl mb-2 animate-fade-in">MetrIA</h1>
            <div className="flex justify-center items-center gap-4 text-metria-white/80">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gold" />
                <span className="font-serif text-gold">Mesa {session.tableId?.slice(-3) || 'N/A'}</span>
              </div>
              <span className="w-1 h-1 bg-gold rounded-full animate-pulse"></span>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-metria-emerald" />
                <span className="text-sm">{session.status === 'OPEN' ? 'Bem-vindo!' : session.status}</span>
              </div>
            </div>
          </div>
          
          {/* Botão Chamar Garçom Animado */}
          <div className="absolute top-6 right-6">
            <button
              onClick={handleCallWaiter}
              className="group bg-transparent border-2 border-metria-emerald text-metria-emerald p-3 rounded-full hover:bg-metria-emerald hover:text-white transition-all duration-300 shadow-lg hover:shadow-metria-emerald/30 hover:scale-110"
              title="Chamar Garçom"
            >
              <Phone size={20} className="group-hover:animate-bounce" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories com Scroll Horizontal */}
      <div className="sticky top-0 z-30 bg-metria-gray/95 backdrop-blur-sm border-b border-gold/20 p-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {categories.map((category, index) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category
                  ? 'bg-gold text-metria-black font-semibold shadow-lg shadow-gold/30'
                  : 'bg-transparent border border-gold/30 text-gold hover:border-gold hover:shadow-lg'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {category === 'all' ? '🍽️ Todos' : `${getCategoryIcon(category)} ${category}`}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items com Animações */}
      <div className="p-4 pb-32 space-y-6">
        {filteredMenu.map((item, index) => (
          <div 
            key={item.id} 
            className="card-luxury group hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-gold/10"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-serif text-gold text-xl group-hover:text-gold/90 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 text-gold">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm">4.8</span>
                  </div>
                </div>
                
                <p className="text-metria-white/80 text-sm leading-relaxed mb-3">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <p className="text-gold font-bold text-xl">
                      R$ {item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1 text-metria-white/60 text-xs">
                      <Clock size={12} />
                      <span>15-20 min</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {item.image && (
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-24 h-24 object-cover rounded-xl border border-gold/20 group-hover:border-gold/40 transition-all" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => addToCart(item, 1)}
              disabled={!item.available}
              className={`mt-4 w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                item.available
                  ? 'btn-gold hover:shadow-lg hover:shadow-gold/30 active:scale-95'
                  : 'bg-metria-gray border border-metria-white/20 text-metria-white/40 cursor-not-allowed'
              }`}
            >
              <Plus size={18} />
              {item.available ? 'Adicionar ao Prato' : 'Indisponível'}
            </button>
          </div>
        ))}
      </div>

      {/* Botão Flutuante IA com Animação */}
      <button
        onClick={() => setShowAI(!showAI)}
        className="fixed bottom-24 right-6 bg-gradient-to-r from-gold to-yellow-500 text-metria-black p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 animate-pulse hover:animate-none"
        title="Conversar com Assistente IA"
      >
        <MessageCircle size={24} />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
      </button>

      {/* Cart Summary Melhorado */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-metria-gray to-metria-gray/95 backdrop-blur-sm border-t border-gold/30 p-4 shadow-2xl animate-slide-up">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-gold text-metria-black p-3 rounded-full">
                  <ShoppingCart size={20} />
                </div>
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-bounce">
                  {cartItemCount}
                </div>
              </div>
              <div>
                <p className="font-medium text-metria-white">
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'} no prato
                </p>
                <p className="text-gold font-bold text-xl">
                  Total: R$ {cartTotal.toFixed(2)}
                </p>
              </div>
            </div>
            <button 
              className="btn-gold px-8 py-4 text-lg font-semibold hover:scale-105 active:scale-95 transition-all duration-200"
              onClick={() => console.log('Finalizar pedido')}
            >
              Finalizar Pedido
            </button>
          </div>
        </div>
      )}

      {/* AI Chat Overlay Melhorado */}
      {showAI && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" onClick={() => setShowAI(false)}>
          <div 
            className="fixed bottom-0 right-0 w-full md:w-96 h-2/3 bg-metria-gray border-l border-t border-gold/30 rounded-tl-2xl animate-slide-up" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gold/20 flex justify-between items-center bg-gradient-to-r from-metria-gray to-metria-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                  <ChefHat size={20} className="text-metria-black" />
                </div>
                <div>
                  <h3 className="font-serif text-gold text-lg">Assistente MetrIA</h3>
                  <p className="text-metria-white/60 text-xs">Seu maître digital</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAI(false)} 
                className="text-metria-white/70 hover:text-gold text-2xl hover:scale-110 transition-all"
              >
                ×
              </button>
            </div>
            <AIChat
              isOpen={showAI}
              onClose={() => setShowAI(false)}
              sessionId={session?.id || ''}
              restaurantId={restaurantId || ''}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function for category icons
const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    'Entradas': '🥗',
    'Pratos Principais': '🍖',
    'Sobremesas': '🍰',
    'Bebidas': '🍷',
    'Massas': '🍝',
    'Carnes': '🥩',
    'Peixes': '🐟',
    'Vegetariano': '🥬'
  };
  return icons[category] || '🍽️';
};

export default MenuPage;