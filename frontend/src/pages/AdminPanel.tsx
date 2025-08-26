import React, { useState, useEffect } from 'react';
import type { Restaurant, Table, Order } from '../../../shared/types';
import { Plus, Edit, Download, Settings, Users, TrendingUp, Clock, DollarSign, ChefHat, Sparkles } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tables' | 'menu' | 'ai' | 'orders'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTables: 0,
    activeTables: 0,
    todayOrders: 0,
    todayRevenue: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchRestaurantData(),
        fetchTables(),
        fetchOrders()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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
      setStats(prev => ({
        ...prev,
        totalTables: data.length,
        activeTables: data.filter((t: Table) => t.currentSession).length
      }));
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders`);
      const data = await response.json();
      setOrders(data);
      
      const today = new Date().toDateString();
      const todayOrders = data.filter((order: Order) => 
        new Date(order.createdAt).toDateString() === today
      );
      
      setStats(prev => ({
        ...prev,
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum: number, order: Order) => sum + order.total, 0)
      }));
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
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&margin=20&data=${encodeURIComponent(table.qrCode)}`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `MetrIA-Mesa-${table.number}-QR.png`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-metria-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="logo-metria text-2xl mb-2">MetrIA</h2>
          <p className="text-metria-white/70">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metria-black">
      {/* Header Luxuoso */}
      <div className="bg-gradient-to-r from-metria-gray to-metria-black shadow-2xl border-b border-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                <Settings size={24} className="text-metria-black" />
              </div>
              <div>
                <h1 className="logo-metria text-3xl">MetrIA</h1>
                <p className="text-metria-white/70 text-sm">Painel Administrativo</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
                { id: 'tables', label: 'Mesas', icon: Users },
                { id: 'menu', label: 'Cardápio', icon: ChefHat },
                { id: 'ai', label: 'Agente IA', icon: Sparkles },
                { id: 'orders', label: 'Pedidos', icon: Clock }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === id 
                      ? 'bg-gold text-metria-black shadow-lg' 
                      : 'bg-transparent border border-gold/30 text-gold hover:border-gold hover:scale-105'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-gold text-3xl mb-2">Dashboard</h2>
              <p className="text-metria-white/70">Visão geral do seu restaurante</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total de Mesas', value: stats.totalTables, icon: Users, color: 'text-blue-400' },
                { label: 'Mesas Ativas', value: stats.activeTables, icon: TrendingUp, color: 'text-green-400' },
                { label: 'Pedidos Hoje', value: stats.todayOrders, icon: Clock, color: 'text-orange-400' },
                { label: 'Receita Hoje', value: `R$ ${stats.todayRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-gold' }
              ].map((stat, index) => (
                <div key={index} className="card-luxury hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-metria-white/60 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-gold mt-1">{stat.value}</p>
                    </div>
                    <stat.icon size={32} className={stat.color} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="card-luxury">
              <h3 className="font-serif text-gold text-xl mb-4">Pedidos Recentes</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-metria-black/30 rounded-lg">
                    <div>
                      <p className="text-metria-white font-medium">Pedido #{order.id.slice(-6)}</p>
                      <p className="text-metria-white/60 text-sm">Mesa {order.sessionId?.slice(-3)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-bold">R$ {order.total.toFixed(2)}</p>
                      <p className="text-metria-white/60 text-sm">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tables Management */}
        {activeTab === 'tables' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-gold text-3xl mb-2">Gerenciar Mesas</h2>
                <p className="text-metria-white/70">Cada mesa possui QR Code único para acesso direto</p>
              </div>
              <button
                onClick={() => {
                  const quantity = prompt('Quantas mesas gerar?');
                  if (quantity) generateTables(parseInt(quantity));
                }}
                className="btn-gold flex items-center gap-2 hover:scale-105 transition-all"
              >
                <Plus size={20} />
                Gerar Mesas
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tables.map((table, index) => (
                <div 
                  key={table.id} 
                  className="card-luxury hover:scale-105 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-gold text-xl">Mesa {table.number}</h3>
                      <p className="text-metria-white/60 text-sm">ID: {table.id.slice(-6)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadQRCode(table)}
                        className="bg-gold text-metria-black p-2 rounded-lg hover:scale-110 transition-all group"
                        title="Baixar QR Code"
                      >
                        <Download size={18} className="group-hover:animate-bounce" />
                      </button>
                      <button className="bg-transparent border border-gold/30 text-gold p-2 rounded-lg hover:border-gold transition-all">
                        <Edit size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-metria-white/80">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        table.currentSession 
                          ? 'bg-metria-emerald/20 text-metria-emerald border border-metria-emerald/30' 
                          : 'bg-gold/20 text-gold border border-gold/30'
                      }`}>
                        {table.currentSession ? '🟢 Ocupada' : '⚪ Livre'}
                      </span>
                    </div>
                    
                    {table.currentSession && (
                      <>
                        <div className="text-sm text-metria-white/70">
                          Sessão: {table.currentSession.status}
                        </div>
                        <button
                          onClick={() => closeTableSession(table.id)}
                          className="w-full bg-transparent border-2 border-red-500 text-red-500 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition-all"
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

        {/* Menu Management */}
        {activeTab === 'menu' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-gold text-3xl mb-2">Gerenciar Cardápio</h2>
                <p className="text-metria-white/70">Configure pratos, preços e disponibilidade</p>
              </div>
              <button className="btn-gold flex items-center gap-2">
                <Plus size={20} />
                Adicionar Prato
              </button>
            </div>

            <div className="card-luxury">
              <div className="text-center py-12">
                <ChefHat size={64} className="mx-auto text-gold mb-4" />
                <h3 className="font-serif text-gold text-xl mb-2">Gerenciamento de Cardápio</h3>
                <p className="text-metria-white/70">Funcionalidade em desenvolvimento</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Configuration */}
        {activeTab === 'ai' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-gold text-3xl mb-2">Configuração do Agente IA</h2>
              <p className="text-metria-white/70">Personalize o comportamento do seu assistente virtual</p>
            </div>

            <div className="card-luxury">
              <div className="mb-6">
                <label className="block text-gold font-medium mb-3">
                  Prompt do Assistente
                </label>
                <textarea
                  className="w-full h-40 p-4 bg-metria-black border border-gold/30 rounded-lg text-metria-white placeholder-metria-white/50 focus:border-gold focus:outline-none transition-all"
                  placeholder="Digite o prompt que será usado pelo assistente de IA..."
                  defaultValue={restaurant?.aiPrompt || ''}
                />
              </div>
              <button className="btn-gold hover:scale-105 transition-all">
                Salvar Configurações
              </button>
            </div>
          </div>
        )}

        {/* Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-gold text-3xl mb-2">Histórico de Pedidos</h2>
              <p className="text-metria-white/70">Acompanhe todos os pedidos realizados</p>
            </div>

            <div className="card-luxury overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-metria-black/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Mesa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/20">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-metria-black/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-metria-white">#{order.id.slice(-6)}</td>
                        <td className="px-6 py-4 text-sm text-metria-white">{order.sessionId?.slice(-3)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gold">R$ {order.total.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'READY' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-metria-white/70">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;