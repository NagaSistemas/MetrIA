import React, { useEffect, useState } from 'react';
import type { Order, WaiterCall } from '../../../../shared/types';
import { Clock, AlertCircle, CheckCircle, ChefHat, Bell, Users, Timer, Flame } from 'lucide-react';

const KitchenPanel: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, callsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/kitchen/orders`),
          fetch(`${import.meta.env.VITE_API_URL}/api/kitchen/waiter-calls`)
        ]);
        
        const ordersData = await ordersRes.json();
        const callsData = await callsRes.json();
        
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setWaiterCalls(Array.isArray(callsData) ? callsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setOrders([]);
        setWaiterCalls([]);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  // Play sound for new waiter calls
  useEffect(() => {
    if (waiterCalls.length > 0 && soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.play().catch(() => {}); // Ignore autoplay restrictions
    }
  }, [waiterCalls.length, soundEnabled]);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/kitchen/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const resolveWaiterCall = async (callId: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/kitchen/waiter-calls/${callId}/resolve`, {
        method: 'PUT'
      });
      setWaiterCalls(prev => prev.filter(call => call.id !== callId));
    } catch (error) {
      console.error('Error resolving waiter call:', error);
    }
  };

  const getNextStatus = (status: Order['status']): Order['status'] | null => {
    switch (status) {
      case 'PENDING': return 'CONFIRMED';
      case 'CONFIRMED': return 'PREPARING';
      case 'PREPARING': return 'READY';
      case 'READY': return 'DELIVERED';
      default: return null;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return 'border-yellow-500 bg-yellow-500/10';
      case 'CONFIRMED': return 'border-blue-500 bg-blue-500/10';
      case 'PREPARING': return 'border-orange-500 bg-orange-500/10';
      case 'READY': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getOrderPriority = (order: Order) => {
    const now = new Date();
    const orderTime = new Date(order.createdAt);
    const minutesAgo = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (minutesAgo > 30) return 'high';
    if (minutesAgo > 15) return 'medium';
    return 'low';
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[getOrderPriority(a)];
    const bPriority = priorityOrder[getOrderPriority(b)];
    
    if (aPriority !== bPriority) return bPriority - aPriority;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-metria-black p-6">
      {/* Header Luxuoso */}
      <div className="bg-gradient-to-r from-metria-gray to-metria-black rounded-2xl p-6 mb-8 border border-gold/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center">
                <ChefHat size={32} className="text-metria-black" />
              </div>
              <div>
                <h1 className="logo-metria text-4xl mb-1">MetrIA</h1>
                <p className="text-metria-white/70">Painel da Cozinha</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-gold font-bold text-2xl">
                  {currentTime.toLocaleTimeString('pt-BR')}
                </p>
                <p className="text-metria-white/70 text-sm">
                  {currentTime.toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-3 rounded-full transition-all ${
                  soundEnabled 
                    ? 'bg-gold text-metria-black' 
                    : 'bg-metria-gray border border-gold/30 text-gold'
                }`}
                title={soundEnabled ? 'Desativar Som' : 'Ativar Som'}
              >
                <Bell size={20} />
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Pedidos Pendentes', value: orders.filter(o => o.status === 'PENDING').length, color: 'text-yellow-400' },
              { label: 'Em Preparo', value: orders.filter(o => o.status === 'PREPARING').length, color: 'text-orange-400' },
              { label: 'Prontos', value: orders.filter(o => o.status === 'READY').length, color: 'text-green-400' },
              { label: 'Chamadas', value: waiterCalls.length, color: 'text-red-400' }
            ].map((stat, index) => (
              <div key={index} className="bg-metria-black/30 rounded-lg p-3 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-metria-white/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas de Garçom */}
      {waiterCalls.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-500 animate-pulse" size={28} />
            <h2 className="font-serif text-red-500 text-2xl">Chamadas Urgentes</h2>
            <div className="flex-1 h-px bg-red-500/30"></div>
          </div>
          
          <div className="grid gap-4">
            {waiterCalls.map((call, index) => (
              <div 
                key={call.id} 
                className="bg-red-900/20 border-2 border-red-500 rounded-xl p-6 flex justify-between items-center animate-bounce-in pulse-gold"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-red-500 p-4 rounded-full animate-pulse">
                    <Users size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-serif text-red-400 text-xl">Mesa {call.tableNumber}</p>
                    <p className="text-metria-white/90 text-lg">{call.message}</p>
                    <div className="flex items-center gap-2 text-metria-white/60 text-sm mt-1">
                      <Timer size={14} />
                      <span>{new Date(call.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => resolveWaiterCall(call.id)}
                  className="bg-red-500 text-white px-8 py-4 rounded-lg hover:bg-red-600 font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  Resolver
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedOrders.map((order, index) => {
          const priority = getOrderPriority(order);
          const minutesAgo = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60));
          
          return (
            <div 
              key={order.id} 
              className={`card-luxury border-2 ${getStatusColor(order.status)} hover:scale-105 transition-all duration-300 ${
                priority === 'high' ? 'ring-2 ring-red-500 ring-opacity-50' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header do Pedido */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-gold text-lg">
                      Pedido #{order.id.slice(-6)}
                    </h3>
                    {order.isExtra && (
                      <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-medium">
                        Extra
                      </span>
                    )}
                    {priority === 'high' && (
                      <Flame size={16} className="text-red-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-metria-white/70">Mesa {order.sessionId?.slice(-3)}</p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 text-metria-white/60 text-sm">
                    <Clock size={14} />
                    <span className={minutesAgo > 30 ? 'text-red-400 font-bold' : ''}>
                      {minutesAgo}min
                    </span>
                  </div>
                  <p className="text-xs text-metria-white/50">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Itens do Pedido */}
              <div className="space-y-3 mb-4">
                {order.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="bg-metria-black/40 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-gold text-metria-black px-3 py-1 rounded-full text-sm font-bold min-w-[2rem] text-center">
                        {item.quantity}x
                      </div>
                      <div className="flex-1">
                        <p className="text-metria-white font-medium">Item {item.menuItemId}</p>
                        {item.notes && (
                          <p className="text-metria-white/60 text-sm mt-1">
                            📝 {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer do Pedido */}
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gold text-xl">
                  R$ {order.total.toFixed(2)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  order.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  order.status === 'PREPARING' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                  order.status === 'READY' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  'bg-metria-white/20 text-metria-white border-metria-white/30'
                }`}>
                  {order.status}
                </span>
              </div>

              {/* Botão de Ação */}
              {getNextStatus(order.status) && (
                <button
                  onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                  className="w-full btn-gold py-3 text-lg font-semibold hover:scale-105 active:scale-95 transition-all"
                >
                  {getNextStatus(order.status) === 'CONFIRMED' && '✓ Confirmar Pedido'}
                  {getNextStatus(order.status) === 'PREPARING' && '🔥 Iniciar Preparo'}
                  {getNextStatus(order.status) === 'READY' && '✅ Marcar como Pronto'}
                  {getNextStatus(order.status) === 'DELIVERED' && '🚀 Marcar como Entregue'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Estado Vazio */}
      {orders.length === 0 && (
        <div className="text-center py-16">
          <div className="card-luxury max-w-md mx-auto">
            <CheckCircle size={80} className="mx-auto text-gold mb-6 animate-bounce-in" />
            <h3 className="font-serif text-gold text-2xl mb-3">Tudo em Ordem!</h3>
            <p className="text-metria-white/70 text-lg">
              Nenhum pedido pendente no momento
            </p>
            <div className="mt-6 flex justify-center">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-gold rounded-full"></div>
                <div className="w-2 h-2 bg-gold rounded-full" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gold rounded-full" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenPanel;