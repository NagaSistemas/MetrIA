import React, { useState, useEffect } from 'react';
import type { Restaurant, Table, Order } from '../../../../shared/types';
import { Plus, Edit, Download, Users, TrendingUp, Clock, DollarSign, ChefHat, Sparkles, BarChart3, FileText, Trash2 } from 'lucide-react';
import MenuManagement from './components/MenuManagement';

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
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tables/${editingTable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: editTableNumber.trim() })
      });
      setEditingTable(null);
      setEditTableNumber('');
      fetchTables();
    } catch (error) {
      console.error('Error updating table:', error);
    }
  };

  const cancelEdit = () => {
    setEditingTable(null);
    setEditTableNumber('');
  };

  const deleteTable = async (table: Table) => {
    if (!confirm(`Tem certeza que deseja deletar a Mesa ${table.number}?`)) return;
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tables/${table.id}`, {
        method: 'DELETE'
      });
      fetchTables();
    } catch (error) {
      console.error('Error deleting table:', error);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ 
                  fontFamily: 'Cinzel, serif',
                  fontSize: '36px', 
                  fontWeight: '700', 
                  color: '#D4AF37',
                  margin: 0,
                  marginBottom: '8px'
                }}>
                  Gerenciar Mesas
                </h2>
                <p style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '16px' }}>
                  Cada mesa possui QR Code único para acesso direto ao cardápio
                </p>
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
                Gerar Mesas
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {tables.map((table) => (
                <div 
                  key={table.id} 
                  style={{
                    backgroundColor: '#2C2C2C',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                    transition: 'all 0.3s ease'
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ 
                        fontFamily: 'Cinzel, serif',
                        fontSize: '24px', 
                        fontWeight: '600', 
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
                        margin: 0
                      }}>
                        ID: {table.id.slice(-6)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => downloadQRCode(table)}
                        style={{
                          backgroundColor: '#D4AF37',
                          color: '#0D0D0D',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Baixar QR Code"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => startEditTable(table)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          color: '#D4AF37',
                          padding: '8px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                          e.currentTarget.style.borderColor = '#D4AF37';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                        }}
                        title="Editar Mesa"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => deleteTable(table)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          padding: '8px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.borderColor = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        }}
                        title="Deletar Mesa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#F5F5F5', opacity: 0.8 }}>Status:</span>
                      <span style={{
                        backgroundColor: table.currentSession 
                          ? 'rgba(16, 185, 129, 0.2)' 
                          : 'rgba(212, 175, 55, 0.2)',
                        color: table.currentSession ? '#10b981' : '#D4AF37',
                        border: `1px solid ${table.currentSession ? 'rgba(16, 185, 129, 0.3)' : 'rgba(212, 175, 55, 0.3)'}`,
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {table.currentSession ? '🟢 Ocupada' : '⚪ Livre'}
                      </span>
                    </div>
                    
                    {table.currentSession && (
                      <>
                        <div style={{ 
                          fontSize: '14px', 
                          color: '#F5F5F5', 
                          opacity: 0.7 
                        }}>
                          Sessão: {table.currentSession.status}
                        </div>
                        <button
                          onClick={() => closeTableSession(table.id)}
                          style={{
                            width: '100%',
                            backgroundColor: 'transparent',
                            border: '2px solid #ef4444',
                            color: '#ef4444',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                            e.currentTarget.style.color = '#F5F5F5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#ef4444';
                          }}
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
        {activeTab === 'menu' && <MenuManagement />}

        {/* Outras abas com placeholder */}
        {(activeTab === 'ai' || activeTab === 'orders') && (
          <div style={{
            backgroundColor: '#2C2C2C',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '16px',
            padding: '64px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              {activeTab === 'ai' && <Sparkles size={64} style={{ color: '#D4AF37', margin: '0 auto' }} />}
              {activeTab === 'orders' && <FileText size={64} style={{ color: '#D4AF37', margin: '0 auto' }} />}
            </div>
            <h3 style={{ 
              fontFamily: 'Cinzel, serif',
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#D4AF37',
              margin: 0,
              marginBottom: '12px'
            }}>
              {activeTab === 'ai' && 'Configuração do Agente IA'}
              {activeTab === 'orders' && 'Histórico de Pedidos'}
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