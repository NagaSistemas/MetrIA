import React, { useState, useEffect } from 'react';
import { Restaurant, Table, Order } from '../../../shared/types';
import { QrCode, Plus, Edit, Trash2, Settings } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'tables' | 'orders' | 'ai' | 'menu'>('tables');

  useEffect(() => {
    fetchRestaurantData();
    fetchTables();
    fetchOrders();
  }, []);

  const fetchRestaurantData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/restaurant`);
      const data = await response.json();
      setRestaurant(data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tables`);
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const generateTables = async (quantity: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tables/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      fetchTables();
    } catch (error) {
      console.error('Error generating tables:', error);
    }
  };

  const closeTableSession = async (tableId: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tables/${tableId}/close-session`, {
        method: 'POST'
      });
      fetchTables();
    } catch (error) {
      console.error('Error closing session:', error);
    }
  };

  const downloadQRCode = (table: Table) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(table.qrCode)}`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `mesa-${table.number}-qr.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('tables')}
                className={`px-4 py-2 rounded ${activeTab === 'tables' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
              >
                Mesas
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded ${activeTab === 'orders' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
              >
                Pedidos
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-2 rounded ${activeTab === 'ai' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
              >
                IA
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2 rounded ${activeTab === 'menu' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
              >
                Cardápio
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'tables' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Gerenciar Mesas</h2>
              <button
                onClick={() => {
                  const quantity = prompt('Quantas mesas gerar?');
                  if (quantity) generateTables(parseInt(quantity));
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Plus size={20} />
                Gerar Mesas
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map(table => (
                <div key={table.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">Mesa {table.number}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadQRCode(table)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <QrCode size={20} />
                      </button>
                      <button className="text-gray-500 hover:text-gray-700">
                        <Edit size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">
                      Status: 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        table.currentSession 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {table.currentSession ? 'Ocupada' : 'Livre'}
                      </span>
                    </p>
                    
                    {table.currentSession && (
                      <>
                        <p className="text-sm">Sessão: {table.currentSession.status}</p>
                        <button
                          onClick={() => closeTableSession(table.id)}
                          className="w-full bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600"
                        >
                          Encerrar Sessão
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Histórico de Pedidos</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mesa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 text-sm">#{order.id.slice(-6)}</td>
                      <td className="px-6 py-4 text-sm">{order.sessionId}</td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">R$ {order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.status === 'READY' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Configuração da IA</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt do Assistente
                </label>
                <textarea
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg"
                  placeholder="Digite o prompt que será usado pelo assistente de IA..."
                  defaultValue={restaurant?.aiPrompt || ''}
                />
              </div>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Salvar Configurações
              </button>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Gerenciar Cardápio</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Funcionalidade de gerenciamento do cardápio será implementada aqui.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;