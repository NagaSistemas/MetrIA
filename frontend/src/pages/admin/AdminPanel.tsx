import React, { useState, useEffect } from 'react';
import type { Restaurant, Table, Order } from '../../../../shared/types';
import { Plus, Edit, Download, Users, TrendingUp, Clock, DollarSign, ChefHat, Sparkles, BarChart3, FileText, Trash2, QrCode, Table as TableIcon } from 'lucide-react';
import MenuManagement from './components/MenuManagement';
import AIConfiguration from './components/AIConfiguration';

const AdminPanel: React.FC = () => {
  const [, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tables' | 'menu' | 'ai' | 'orders'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editTableNumber, setEditTableNumber] = useState('');
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

  const startEditTable = (table: Table) => {
    setEditingTable(table);
    setEditTableNumber(table.number.toString());
  };

  const saveTableEdit = async () => {
    if (!editingTable || !editTableNumber.trim()) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tables/${editingTable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: editTableNumber.trim() })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Erro ao atualizar mesa: ${errorData.error || 'Mesa não encontrada'}`);
        return;
      }
      
      setEditingTable(null);
      setEditTableNumber('');
      fetchTables();
    } catch (error) {
      console.error('Error updating table:', error);
      alert('Erro de conexão. Tente novamente.');
    }
  };

  const cancelEdit = () => {
    setEditingTable(null);
    setEditTableNumber('');
  };

  const deleteTable = async (table: Table) => {
    if (!confirm(`Tem certeza que deseja deletar a Mesa ${table.number}?`)) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tables/${table.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Erro ao deletar mesa: ${errorData.error || 'Mesa não encontrada'}`);
        return;
      }
      
      fetchTables();
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('Erro de conexão. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0D0D0D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #D4AF37',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <h2 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#D4AF37', 
            marginBottom: '8px' 
          }}>MetrIA</h2>
          <p style={{ color: '#F5F5F5', opacity: 0.7 }}>Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tables', label: 'Mesas', icon: Users },
    { id: 'menu', label: 'Cardápio', icon: ChefHat },
    { id: 'ai', label: 'Agente IA', icon: Sparkles },
    { id: 'orders', label: 'Pedidos', icon: FileText }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#F5F5F5' }}>
      {/* Header Profissional */}
      <header style={{
        background: 'linear-gradient(135deg, #2C2C2C 0%, #0D0D0D 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          {/* Logo e Título centralizados */}
          <div style={{
            textAlign: 'center',
            padding: '16px 0 8px 0'
          }}>
            <img 
              src="/Logo.png" 
              alt="MetrIA Logo" 
              style={{ 
                height: '92px', 
                width: 'auto',
                filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.3))',
                display: 'block',
                margin: '0 auto 8px auto'
              }} 
            />
            <h1 style={{ 
              fontFamily: 'Cinzel, serif',
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#D4AF37', 
              margin: 0
            }}>
              Painel Administrativo
            </h1>
          </div>
          
          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            paddingBottom: '16px',
            overflowX: 'auto',
            flexWrap: 'wrap'
          }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  minWidth: '140px',
                  justifyContent: 'center',
                  background: activeTab === id 
                    ? 'linear-gradient(135deg, #D4AF37, #B8860B)' 
                    : 'transparent',
                  color: activeTab === id ? '#0D0D0D' : '#D4AF37',
                  border: activeTab === id ? 'none' : '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: activeTab === id ? '0 4px 15px rgba(212, 175, 55, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== id) {
                    e.currentTarget.style.borderColor = '#D4AF37';
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== id) {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h2 style={{ 
                fontFamily: 'Cinzel, serif',
                fontSize: '36px', 
                fontWeight: '700', 
                color: '#D4AF37', 
                margin: 0,
                marginBottom: '8px'
              }}>
                Dashboard
              </h2>
              <p style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '16px' }}>
                Visão geral do seu restaurante em tempo real
              </p>
            </div>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {[
                { 
                  label: 'Total de Mesas', 
                  value: stats.totalTables, 
                  icon: Users, 
                  color: '#3b82f6',
                  bgColor: 'rgba(59, 130, 246, 0.1)'
                },
                { 
                  label: 'Mesas Ativas', 
                  value: stats.activeTables, 
                  icon: TrendingUp, 
                  color: '#10b981',
                  bgColor: 'rgba(16, 185, 129, 0.1)'
                },
                { 
                  label: 'Pedidos Hoje', 
                  value: stats.todayOrders, 
                  icon: Clock, 
                  color: '#f59e0b',
                  bgColor: 'rgba(245, 158, 11, 0.1)'
                },
                { 
                  label: 'Receita Hoje', 
                  value: `R$ ${stats.todayRevenue.toFixed(2)}`, 
                  icon: DollarSign, 
                  color: '#D4AF37',
                  bgColor: 'rgba(212, 175, 55, 0.1)'
                }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  style={{
                    backgroundColor: '#2C2C2C',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.5)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        color: '#F5F5F5', 
                        opacity: 0.7, 
                        fontSize: '14px',
                        margin: 0,
                        marginBottom: '8px'
                      }}>
                        {stat.label}
                      </p>
                      <p style={{ 
                        fontSize: '32px', 
                        fontWeight: '700', 
                        color: stat.color,
                        margin: 0
                      }}>
                        {stat.value}
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: stat.bgColor,
                      padding: '12px',
                      borderRadius: '12px'
                    }}>
                      <stat.icon size={32} style={{ color: stat.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div style={{
              backgroundColor: '#2C2C2C',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
            }}>
              <h3 style={{ 
                fontFamily: 'Cinzel, serif',
                fontSize: '24px', 
                fontWeight: '600', 
                color: '#D4AF37',
                margin: 0,
                marginBottom: '24px'
              }}>
                Pedidos Recentes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.slice(0, 5).map(order => (
                  <div 
                    key={order.id} 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      backgroundColor: 'rgba(13, 13, 13, 0.5)',
                      borderRadius: '12px',
                      border: '1px solid rgba(212, 175, 55, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(13, 13, 13, 0.5)';
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)';
                    }}
                  >
                    <div>
                      <p style={{ 
                        color: '#F5F5F5', 
                        fontWeight: '600',
                        margin: 0,
                        marginBottom: '4px'
                      }}>
                        Pedido #{order.id.slice(-6)}
                      </p>
                      <p style={{ 
                        color: '#F5F5F5', 
                        opacity: 0.6, 
                        fontSize: '14px',
                        margin: 0
                      }}>
                        Mesa {order.sessionId?.slice(-3)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ 
                        color: '#D4AF37', 
                        fontWeight: '700',
                        fontSize: '18px',
                        margin: 0,
                        marginBottom: '4px'
                      }}>
                        R$ {order.total.toFixed(2)}
                      </p>
                      <span style={{
                        backgroundColor: order.status === 'DELIVERED' ? 'rgba(16, 185, 129, 0.2)' :
                                       order.status === 'READY' ? 'rgba(59, 130, 246, 0.2)' :
                                       'rgba(245, 158, 11, 0.2)',
                        color: order.status === 'DELIVERED' ? '#10b981' :
                               order.status === 'READY' ? '#3b82f6' :
                               '#f59e0b',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tables Management */}
        {activeTab === 'tables' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Professional Header */}
            <div style={{
              background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
              }}>
                <TableIcon size={40} style={{ color: '#F5F5F5' }} />
              </div>
              <h2 style={{ 
                fontFamily: 'Cinzel, serif',
                fontSize: '32px', 
                fontWeight: '700', 
                color: '#D4AF37',
                margin: 0,
                marginBottom: '8px'
              }}>
                Gerenciamento de Mesas
              </h2>
              <p style={{ 
                color: '#F5F5F5', 
                opacity: 0.8, 
                fontSize: '16px',
                maxWidth: '600px',
                margin: '0 auto 24px'
              }}>
                Controle completo das mesas do restaurante com QR Codes únicos e monitoramento em tempo real
              </p>
              
              {/* Stats Summary */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '32px',
                marginBottom: '24px',
                flexWrap: 'wrap'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#3b82f6',
                    marginBottom: '4px'
                  }}>
                    {stats.totalTables}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#F5F5F5',
                    opacity: 0.7
                  }}>
                    Total de Mesas
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#10b981',
                    marginBottom: '4px'
                  }}>
                    {stats.activeTables}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#F5F5F5',
                    opacity: 0.7
                  }}>
                    Mesas Ativas
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#D4AF37',
                    marginBottom: '4px'
                  }}>
                    {stats.totalTables - stats.activeTables}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#F5F5F5',
                    opacity: 0.7
                  }}>
                    Mesas Livres
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  const quantity = prompt('Quantas mesas gerar?');
                  if (quantity) generateTables(parseInt(quantity));
                }}
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                  color: '#0D0D0D',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
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
                Gerar Novas Mesas
              </button>
            </div>

            {/* Tables Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '24px'
            }}>
              {tables.map((table) => (
                <div 
                  key={table.id} 
                  style={{
                    background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
                    border: table.currentSession 
                      ? '1px solid rgba(16, 185, 129, 0.3)' 
                      : '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '16px',
                    padding: '28px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.5)';
                  }}
                >
                  {/* Status Indicator */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '4px',
                    height: '100%',
                    background: table.currentSession 
                      ? 'linear-gradient(180deg, #10b981, #059669)' 
                      : 'linear-gradient(180deg, #D4AF37, #B8860B)'
                  }}></div>
                  
                  {/* Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: '24px' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        background: table.currentSession 
                          ? 'linear-gradient(135deg, #10b981, #059669)' 
                          : 'linear-gradient(135deg, #D4AF37, #B8860B)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: table.currentSession 
                          ? '0 4px 15px rgba(16, 185, 129, 0.3)' 
                          : '0 4px 15px rgba(212, 175, 55, 0.3)'
                      }}>
                        <Users size={28} style={{ color: '#F5F5F5' }} />
                      </div>
                      <div>
                        <h3 style={{ 
                          fontFamily: 'Cinzel, serif',
                          fontSize: '24px', 
                          fontWeight: '700', 
                          color: '#D4AF37',
                          margin: 0,
                          marginBottom: '4px'
                        }}>
                          Mesa {table.number}
                        </h3>
                        <p style={{ 
                          color: '#F5F5F5', 
                          opacity: 0.6, 
                          fontSize: '12px',
                          margin: 0,
                          fontFamily: 'monospace'
                        }}>
                          ID: {table.id.slice(-8)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&margin=20&data=${encodeURIComponent(table.qrCode)}`;
                          window.open(qrUrl, '_blank');
                        }}
                        style={{
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          color: '#8b5cf6',
                          padding: '10px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                          e.currentTarget.style.borderColor = '#8b5cf6';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Visualizar QR Code"
                      >
                        <QrCode size={18} />
                      </button>
                      <button
                        onClick={() => downloadQRCode(table)}
                        style={{
                          background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                          color: '#0D0D0D',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 175, 55, 0.3)';
                        }}
                        title="Baixar QR Code"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => startEditTable(table)}
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#3b82f6',
                          padding: '10px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Editar Mesa"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => deleteTable(table)}
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          padding: '10px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                          e.currentTarget.style.borderColor = '#ef4444';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Deletar Mesa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Status Section */}
                  <div style={{
                    backgroundColor: 'rgba(13, 13, 13, 0.5)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    border: '1px solid rgba(212, 175, 55, 0.1)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <span style={{ 
                        color: '#F5F5F5', 
                        fontSize: '16px',
                        fontWeight: '500'
                      }}>
                        Status Atual
                      </span>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: table.currentSession 
                          ? 'rgba(16, 185, 129, 0.2)' 
                          : 'rgba(212, 175, 55, 0.2)',
                        border: `1px solid ${table.currentSession ? 'rgba(16, 185, 129, 0.4)' : 'rgba(212, 175, 55, 0.4)'}`,
                        padding: '8px 16px',
                        borderRadius: '25px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: table.currentSession ? '#10b981' : '#D4AF37',
                          animation: table.currentSession ? 'pulse 2s infinite' : 'none'
                        }}></div>
                        <span style={{
                          color: table.currentSession ? '#10b981' : '#D4AF37',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {table.currentSession ? 'Ocupada' : 'Disponível'}
                        </span>
                      </div>
                    </div>
                    
                    {table.currentSession && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(212, 175, 55, 0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '14px' }}>Sessão:</span>
                          <span style={{ color: '#F5F5F5', fontSize: '14px', fontWeight: '500' }}>
                            {table.currentSession.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '14px' }}>Iniciada:</span>
                          <span style={{ color: '#F5F5F5', fontSize: '14px', fontWeight: '500' }}>
                            {new Date(table.currentSession.createdAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* QR Code Info */}
                  <div style={{
                    backgroundColor: 'rgba(13, 13, 13, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: table.currentSession ? '20px' : '0',
                    border: '1px solid rgba(212, 175, 55, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ 
                          color: '#F5F5F5', 
                          fontSize: '14px',
                          fontWeight: '500',
                          marginBottom: '4px'
                        }}>
                          QR Code Único
                        </div>
                        <div style={{ 
                          color: '#F5F5F5', 
                          opacity: 0.6, 
                          fontSize: '12px',
                          fontFamily: 'monospace'
                        }}>
                          {table.qrCode.slice(-20)}...
                        </div>
                      </div>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '16px' }}>📱</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  {table.currentSession && (
                    <button
                      onClick={() => closeTableSession(table.id)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: '#F5F5F5',
                        border: 'none',
                        padding: '14px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                      }}
                    >
                      🔒 Encerrar Sessão
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Empty State */}
            {tables.length === 0 && (
              <div style={{
                backgroundColor: '#2C2C2C',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '16px',
                padding: '64px',
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <TableIcon size={40} style={{ color: '#D4AF37' }} />
                </div>
                <h3 style={{ 
                  fontFamily: 'Cinzel, serif',
                  fontSize: '24px', 
                  fontWeight: '600', 
                  color: '#D4AF37',
                  margin: 0,
                  marginBottom: '12px'
                }}>
                  Nenhuma Mesa Cadastrada
                </h3>
                <p style={{ 
                  color: '#F5F5F5', 
                  opacity: 0.7,
                  marginBottom: '24px'
                }}>
                  Comece gerando suas primeiras mesas para o restaurante
                </p>
                <button
                  onClick={() => {
                    const quantity = prompt('Quantas mesas gerar?');
                    if (quantity) generateTables(parseInt(quantity));
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                    color: '#0D0D0D',
                    border: 'none',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
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
                  Gerar Primeiras Mesas
                </button>
              </div>
            )}
          </div>
        )}

        {/* Menu Management */}
        {activeTab === 'menu' && <MenuManagement />}

        {/* AI Configuration */}
        {activeTab === 'ai' && <AIConfiguration />}

        {/* Orders placeholder */}
        {activeTab === 'orders' && (
          <div style={{
            backgroundColor: '#2C2C2C',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '16px',
            padding: '64px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <FileText size={64} style={{ color: '#D4AF37', margin: '0 auto' }} />
            </div>
            <h3 style={{ 
              fontFamily: 'Cinzel, serif',
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#D4AF37',
              margin: 0,
              marginBottom: '12px'
            }}>
              Histórico de Pedidos
            </h3>
            <p style={{ color: '#F5F5F5', opacity: 0.7 }}>
              Funcionalidade em desenvolvimento
            </p>
          </div>
        )}
      </main>

      {/* Modal de Edição de Mesa */}
      {editingTable && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#2C2C2C',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)'
          }}>
            <h3 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '24px',
              fontWeight: '600',
              color: '#D4AF37',
              margin: 0,
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              Editar Mesa
            </h3>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: '#F5F5F5',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Número da Mesa
              </label>
              <input
                type="text"
                value={editTableNumber}
                onChange={(e) => setEditTableNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#0D0D0D',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '8px',
                  color: '#F5F5F5',
                  fontSize: '16px',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#D4AF37';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                }}
                autoFocus
              />
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={cancelEdit}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(245, 245, 245, 0.3)',
                  color: '#F5F5F5',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
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
                onClick={saveTableEdit}
                disabled={!editTableNumber.trim()}
                style={{
                  background: editTableNumber.trim() 
                    ? 'linear-gradient(135deg, #D4AF37, #B8860B)' 
                    : '#666',
                  color: editTableNumber.trim() ? '#0D0D0D' : '#999',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: editTableNumber.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  opacity: editTableNumber.trim() ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (editTableNumber.trim()) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (editTableNumber.trim()) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;