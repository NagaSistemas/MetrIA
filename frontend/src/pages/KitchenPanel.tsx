import React, { useEffect, useState } from 'react';
import { Order, WaiterCall } from '../../../shared/types';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

const KitchenPanel: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kitchen/orders`);
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    const fetchWaiterCalls = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kitchen/waiter-calls`);
        const data = await response.json();
        setWaiterCalls(data);
      } catch (error) {
        console.error('Error fetching waiter calls:', error);
      }
    };

    fetchOrders();
    fetchWaiterCalls();

    const interval = setInterval(() => {
      fetchOrders();
      fetchWaiterCalls();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 border-yellow-300';
      case 'CONFIRMED': return 'bg-blue-100 border-blue-300';
      case 'PREPARING': return 'bg-orange-100 border-orange-300';
      case 'READY': return 'bg-green-100 border-green-300';
      case 'DELIVERED': return 'bg-gray-100 border-gray-300';
      default: return 'bg-gray-100 border-gray-300';
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Painel da Cozinha</h1>

      {/* Waiter Calls */}
      {waiterCalls.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-red-600">Chamadas de Garçom</h2>
          <div className="grid gap-3">
            {waiterCalls.map(call => (
              <div key={call.id} className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-500" size={24} />
                  <div>
                    <p className="font-semibold">Mesa {call.tableNumber}</p>
                    <p className="text-sm text-gray-600">{call.message}</p>
                    <p className="text-xs text-gray-500">{new Date(call.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => resolveWaiterCall(call.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Resolver
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.map(order => (
          <div key={order.id} className={`rounded-lg border-2 p-4 ${getStatusColor(order.status)}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">
                  Pedido #{order.id.slice(-6)}
                  {order.isExtra && <span className="text-sm text-orange-600 ml-2">(Extra)</span>}
                </h3>
                <p className="text-sm text-gray-600">Mesa {order.sessionId}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock size={16} />
                {new Date(order.createdAt).toLocaleTimeString()}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{item.quantity}x</span> Item {item.menuItemId}
                  {item.notes && <p className="text-gray-600 text-xs ml-4">Obs: {item.notes}</p>}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-green-600">R$ {order.total.toFixed(2)}</span>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                  order.status === 'CONFIRMED' ? 'bg-blue-200 text-blue-800' :
                  order.status === 'PREPARING' ? 'bg-orange-200 text-orange-800' :
                  order.status === 'READY' ? 'bg-green-200 text-green-800' :
                  'bg-gray-200 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>

            {getNextStatus(order.status) && (
              <button
                onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                className="w-full mt-3 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                {getNextStatus(order.status) === 'CONFIRMED' && 'Confirmar'}
                {getNextStatus(order.status) === 'PREPARING' && 'Iniciar Preparo'}
                {getNextStatus(order.status) === 'READY' && 'Marcar como Pronto'}
                {getNextStatus(order.status) === 'DELIVERED' && 'Marcar como Entregue'}
              </button>
            )}
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Nenhum pedido pendente</p>
        </div>
      )}
    </div>
  );
};

export default KitchenPanel;