import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTable } from '../../contexts/TableContext';
import { ShoppingCart, Phone, Plus, Star, Users, Search } from 'lucide-react';
import AIChat from '../../components/shared/AIChat';

const MenuPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const token = searchParams.get('token');
  const { session, menu, cart, addToCart, loadSessionById } = useTable();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAI, setShowAI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId && token) {
      console.log('Loading session:', sessionId, token);
      loadSessionById(sessionId, token)
        .then(() => {
          console.log('Session loaded:', session);
          console.log('Menu items:', menu);
        })
        .catch(error => {
          console.error('Error loading session:', error);
        })
        .finally(() => setIsLoading(false));
    } else {
      console.log('No sessionId or token provided');
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, [sessionId, token]);

  const categories = ['all', ...new Set((menu || []).map(item => item.category))];
  let filteredMenu = selectedCategory === 'all' 
    ? (menu || []) 
    : (menu || []).filter(item => item.category === selectedCategory);
    
  if (searchQuery) {
    filteredMenu = filteredMenu.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const cartTotal = (cart || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = (cart || []).reduce((sum, item) => sum + item.quantity, 0);

  const handleCallWaiter = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/call-waiter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session?.id, message: 'Cliente solicitou atendimento' })
      });
    } catch (error) {
      console.error('Error calling waiter:', error);
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
            marginBottom: '8px',
            textShadow: '0 2px 10px rgba(212, 175, 55, 0.3)'
          }}>MetrIA</h2>
          <p style={{ color: '#F5F5F5', opacity: 0.7 }}>Preparando sua experiência luxuosa...</p>
        </div>
      </div>
    );
  }

  if (!session && sessionId && !isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0D0D0D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: '#2C2C2C',
          padding: '40px',
          borderRadius: '16px',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ 
            fontFamily: 'Cinzel, serif',
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#D4AF37', 
            marginBottom: '16px' 
          }}>
            Sessão não encontrada
          </h2>
          <p style={{ color: '#F5F5F5', opacity: 0.7, marginBottom: '16px' }}>Verifique o QR Code da mesa</p>
          <div style={{ fontSize: '12px', color: '#F5F5F5', opacity: 0.5 }}>
            Debug: SessionId: {sessionId}<br/>
            Token: {token?.slice(0, 8)}...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#F5F5F5' }}>
      {/* Header Luxuoso */}
      <header style={{
        background: 'linear-gradient(135deg, #2C2C2C 0%, #0D0D0D 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
        padding: '24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img 
              src="/Logo.png" 
              alt="MetrIA Logo" 
              style={{ 
                height: '72px', 
                width: 'auto',
                filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.3))'
              }} 
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#F5F5F5', opacity: 0.8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: '#D4AF37' }} />
                <span style={{ fontFamily: 'Cinzel, serif', color: '#D4AF37', fontWeight: '600' }}>
                  Mesa {session?.tableId?.slice(-3) || 'Demo'}
                </span>
              </div>
              {cartItemCount > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                  color: '#0D0D0D',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                }}>
                  🍽️ {cartItemCount} itens
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleCallWaiter}
            style={{
              background: 'transparent',
              border: '2px solid #046D63',
              color: '#046D63',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#046D63';
              e.currentTarget.style.color = '#F5F5F5';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(4, 109, 99, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#046D63';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Phone size={18} />
            Chamar Garçom
          </button>
        </div>
      </header>

      {/* Search and Filters */}
      <div style={{
        background: 'rgba(44, 44, 44, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        padding: '20px 24px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#F5F5F5',
              opacity: 0.5
            }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pratos requintados..."
              style={{
                width: '100%',
                padding: '16px 16px 16px 52px',
                backgroundColor: '#0D0D0D',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '12px',
                fontSize: '16px',
                color: '#F5F5F5',
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
        
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '12px 24px',
                borderRadius: '25px',
                border: selectedCategory === category ? 'none' : '1px solid rgba(212, 175, 55, 0.3)',
                background: selectedCategory === category 
                  ? 'linear-gradient(135deg, #D4AF37, #B8860B)' 
                  : 'transparent',
                color: selectedCategory === category ? '#0D0D0D' : '#D4AF37',
                fontSize: '14px',
                fontWeight: selectedCategory === category ? '600' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                boxShadow: selectedCategory === category ? '0 4px 15px rgba(212, 175, 55, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.borderColor = '#D4AF37';
                  e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {category === 'all' ? '🍽️ Todos' : `${getCategoryIcon(category)} ${category}`}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <main style={{ padding: '32px 24px', paddingBottom: cartItemCount > 0 ? '140px' : '32px' }}>
        {filteredMenu.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🍽️</div>
            <h3 style={{ 
              fontFamily: 'Cinzel, serif',
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#D4AF37', 
              marginBottom: '12px' 
            }}>
              {menu.length === 0 ? 'Cardápio em preparação' : 'Voltamos já com novidades!'}
            </h3>
            <p style={{ color: '#F5F5F5', opacity: 0.7 }}>
              {menu.length === 0 
                ? 'Nosso chef está preparando deliciosas opções para você.' 
                : 'Não encontramos itens para sua busca.'}
            </p>
            {menu.length === 0 && (
              <div style={{ marginTop: '24px', fontSize: '14px', color: '#F5F5F5', opacity: 0.5 }}>
                Debug: Session ID: {sessionId}<br/>
                Menu items: {menu.length}<br/>
                Categories: {categories.length}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#2C2C2C',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => navigate(`/item/${item.id}?sessionId=${sessionId}&token=${token}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(212, 175, 55, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.5)';
                }}
              >
                {item.image ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '240px',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)'
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      backdropFilter: 'blur(8px)',
                      color: '#F5F5F5',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: '500'
                    }}>
                      <Star size={12} fill="currentColor" style={{ color: '#D4AF37' }} />
                      4.8
                    </div>
                  </div>
                ) : (
                  <div style={{
                    height: '240px',
                    backgroundColor: 'rgba(13, 13, 13, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '64px',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                  }}>
                    🍽️
                  </div>
                )}
                
                <div style={{ padding: '24px' }}>
                  <h3 style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#D4AF37',
                    marginBottom: '12px',
                    lineHeight: '1.3'
                  }}>
                    {item.name}
                  </h3>
                  
                  <p style={{
                    color: '#F5F5F5',
                    opacity: 0.8,
                    fontSize: '14px',
                    lineHeight: '1.6',
                    marginBottom: '20px'
                  }}>
                    {item.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#D4AF37'
                    }}>
                      R$ {item.price.toFixed(2)}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#F5F5F5',
                      opacity: 0.6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      ⏱️ 15-20 min
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <span style={{
                      backgroundColor: 'rgba(4, 109, 99, 0.2)',
                      color: '#046D63',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      Vegano
                    </span>
                    <span style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      color: '#3b82f6',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      Sem Glúten
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item, 1);
                    }}
                    disabled={!item.available}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: item.available 
                        ? 'linear-gradient(135deg, #D4AF37, #B8860B)' 
                        : '#2C2C2C',
                      color: item.available ? '#0D0D0D' : '#F5F5F5',
                      border: item.available ? 'none' : '1px solid rgba(245, 245, 245, 0.2)',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: item.available ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      opacity: item.available ? 1 : 0.4,
                      boxShadow: item.available ? '0 4px 15px rgba(212, 175, 55, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (item.available) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (item.available) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
                      }
                    }}
                  >
                    <Plus size={18} />
                    {item.available ? 'Adicionar ao Prato' : 'Indisponível'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* AI Button */}
      <button
        onClick={() => setShowAI(!showAI)}
        style={{
          position: 'fixed',
          bottom: cartItemCount > 0 ? '120px' : '32px',
          right: '32px',
          background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
          border: 'none',
          padding: '16px',
          borderRadius: '50%',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)',
          zIndex: 50,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 12px 35px rgba(212, 175, 55, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.4)';
        }}
      >
        <img src="/Agent.png" alt="IA" style={{ width: '32px', height: '32px' }} />
        <div style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '12px',
          height: '12px',
          backgroundColor: '#ef4444',
          borderRadius: '50%',
          animation: 'pulse 2s infinite'
        }}></div>
      </button>

      {/* Cart Summary Luxuoso */}
      {cartItemCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #2C2C2C 0%, #0D0D0D 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(212, 175, 55, 0.3)',
          padding: '20px 24px',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.5)',
          zIndex: 40
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  backgroundColor: '#D4AF37',
                  color: '#0D0D0D',
                  padding: '12px',
                  borderRadius: '50%',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                }}>
                  <ShoppingCart size={24} />
                </div>
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#ef4444',
                  color: '#F5F5F5',
                  fontSize: '12px',
                  fontWeight: '700',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  minWidth: '24px',
                  textAlign: 'center',
                  animation: 'bounce 1s infinite'
                }}>
                  {cartItemCount}
                </span>
              </div>
              <div>
                <p style={{ 
                  fontSize: '16px', 
                  color: '#F5F5F5', 
                  margin: 0, 
                  fontWeight: '500' 
                }}>
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'} no prato
                </p>
                <p style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#D4AF37', 
                  margin: 0 
                }}>
                  Total: R$ {cartTotal.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/tray?sessionId=${sessionId}&token=${token}`)}
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                color: '#0D0D0D',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                transition: 'all 0.3s ease'
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
              Finalizar Pedido
            </button>
          </div>
        </div>
      )}

      {/* AI Chat Luxuoso */}
      {showAI && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowAI(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              height: '80vh',
              maxHeight: '600px',
              background: 'linear-gradient(135deg, #2C2C2C 0%, #0D0D0D 100%)',
              borderRadius: '20px',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #2C2C2C, #0D0D0D)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#D4AF37',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img src="/Agent.png" alt="IA" style={{ width: '24px', height: '24px' }} />
                </div>
                <div>
                  <h3 style={{ 
                    fontFamily: 'Cinzel, serif',
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#D4AF37', 
                    margin: 0 
                  }}>
                    Assistente MetrIA
                  </h3>
                  <p style={{ 
                    color: '#F5F5F5', 
                    opacity: 0.6, 
                    fontSize: '12px', 
                    margin: 0 
                  }}>
                    Seu maître digital
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAI(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#F5F5F5',
                  opacity: 0.7,
                  transition: 'all 0.3s ease',
                  padding: '4px',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#D4AF37';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#F5F5F5';
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <AIChat
                isOpen={showAI}
                onClose={() => setShowAI(false)}
                sessionId={session?.id || ''}
                restaurantId={session?.restaurantId || ''}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
          40%, 43% { transform: translateY(-8px); }
          70% { transform: translateY(-4px); }
          90% { transform: translateY(-2px); }
        }
      `}</style>
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