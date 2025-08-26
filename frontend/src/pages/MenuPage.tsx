import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTable } from '../contexts/TableContext';
import { MenuItem } from '../../../shared/types';
import { ShoppingCart, MessageCircle, Phone } from 'lucide-react';
import AIChat from '../components/AIChat';

const MenuPage: React.FC = () => {
  const { restaurantId, tableId } = useParams<{ restaurantId: string; tableId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');
  const { session, menu, cart, addToCart, loadSession } = useTable();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    if (restaurantId && tableId && token) {
      loadSession(restaurantId, tableId, token);
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
      alert('Garçom chamado com sucesso!');
    } catch (error) {
      console.error('Error calling waiter:', error);
    }
  };

  if (!session) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Mesa {session.tableId}</h1>
          <p className="text-gray-600">Status: {session.status}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAI(!showAI)}
            className="bg-blue-500 text-white p-2 rounded-full"
          >
            <MessageCircle size={20} />
          </button>
          <button
            onClick={handleCallWaiter}
            className="bg-green-500 text-white p-2 rounded-full"
          >
            <Phone size={20} />
          </button>
          <div className="relative">
            <button className="bg-orange-500 text-white p-2 rounded-full">
              <ShoppingCart size={20} />
            </button>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                {cartItemCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 bg-white border-b">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {category === 'all' ? 'Todos' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-4">
        {filteredMenu.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                <p className="text-green-600 font-bold mt-2">R$ {item.price.toFixed(2)}</p>
              </div>
              {item.image && (
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded ml-4" />
              )}
            </div>
            <button
              onClick={() => addToCart(item, 1)}
              disabled={!item.available}
              className={`mt-3 w-full py-2 rounded ${
                item.available
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {item.available ? 'Adicionar ao Prato' : 'Indisponível'}
            </button>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{cartItemCount} itens</p>
              <p className="text-green-600 font-bold">Total: R$ {cartTotal.toFixed(2)}</p>
            </div>
            <button className="bg-green-500 text-white px-6 py-2 rounded-lg">
              Finalizar Pedido
            </button>
          </div>
        </div>
      )}

      {/* AI Chat */}
      <AIChat
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        sessionId={session?.id || ''}
        restaurantId={restaurantId || ''}
      />
    </div>
  );
};

export default MenuPage;