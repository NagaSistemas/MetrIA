import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTable } from '../../contexts/TableContext';
import { Phone, Users, Search } from 'lucide-react';
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
      {/* Header Profissional */}
      <header className="menu-header" style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0D0D0D 100%)',
        borderBottom: '2px solid rgba(212, 175, 55, 0.2)',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        minHeight: '80px'
      }}>
        <div className="header-content" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <img 
              src="/Logo.png" 
              alt="MetrIA" 
              className="logo"
              style={{ 
                height: '56px', 
                width: 'auto',
                filter: 'drop-shadow(0 4px 12px rgba(212, 175, 55, 0.4))'
              }} 
            />
            <div className="table-info" style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid rgba(212, 175, 55, 0.3)'
                }}>
                  <Users size={16} style={{ color: '#D4AF37' }} />
                </div>
                <span style={{ 
                  fontFamily: 'Cinzel, serif', 
                  color: '#D4AF37', 
                  fontWeight: '700',
                  fontSize: '18px'
                }}>
                  Mesa {session?.tableNumber || 'Demo'}
                </span>
              </div>
              {cartItemCount > 0 && (
                <div className="cart-badge" style={{
                  background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                  color: '#0D0D0D',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  width: 'fit-content'
                }}>
                  <Users size={12} /> {cartItemCount} na mesa
                </div>
              )}
            </div>
          </div>
          

        </div>
      </header>

      {/* Search and Filters Profissionais */}
      <div className="filters-section" style={{
        background: 'linear-gradient(135deg, rgba(44, 44, 44, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        padding: '24px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="search-container" style={{ marginBottom: '24px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#D4AF37',
                opacity: 0.7
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar pratos requintados..."
                className="search-input"
                style={{
                  width: '100%',
                  padding: '18px 20px 18px 56px',
                  backgroundColor: 'rgba(13, 13, 13, 0.8)',
                  border: '2px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '16px',
                  fontSize: '16px',
                  color: '#F5F5F5',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#D4AF37';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.1), 0 8px 32px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.backgroundColor = 'rgba(13, 13, 13, 0.95)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.backgroundColor = 'rgba(13, 13, 13, 0.8)';
                }}
              />
            </div>
          </div>
          
          <div className="categories-container" style={{ 
            display: 'flex', 
            gap: '12px', 
            overflowX: 'auto', 
            paddingBottom: '8px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="category-btn"
                style={{
                  padding: '14px 20px',
                  borderRadius: '20px',
                  background: selectedCategory === category 
                    ? 'linear-gradient(135deg, #D4AF37, #B8860B)' 
                    : 'rgba(212, 175, 55, 0.1)',
                  color: selectedCategory === category ? '#0D0D0D' : '#D4AF37',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedCategory === category 
                    ? '0 6px 20px rgba(212, 175, 55, 0.4)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: selectedCategory === category 
                    ? 'none' 
                    : '1px solid rgba(212, 175, 55, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                  }
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {category === 'all' ? '🍽️' : getCategoryIcon(category)}
                  <span>{category === 'all' ? 'Todos' : category}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Profissional */}
      <main className="menu-main" style={{ 
        padding: '40px 20px', 
        paddingBottom: cartItemCount > 0 ? '160px' : '40px',
        background: 'linear-gradient(135deg, #0D0D0D 0%, #1a1a1a 100%)',
        minHeight: '60vh'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
          <div className="menu-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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
                  
                  {(item as any).allergens && (item as any).allergens.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ⚠️ Contém: {(item as any).allergens.join(', ')}
                      </div>
                    </div>
                  )}
                  
                  {item.available ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      padding: '8px',
                      backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      borderRadius: '16px',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentQty = (cart || []).find(cartItem => (cartItem as any).id === item.id)?.quantity || 0;
                          if (currentQty > 0) {
                            addToCart(item, -1);
                          }
                        }}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: '#F5F5F5',
                          fontSize: '20px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                        }}
                      >
                        −
                      </button>
                      
                      <span style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#D4AF37',
                        minWidth: '40px',
                        textAlign: 'center',
                        fontFamily: 'Cinzel, serif'
                      }}>
                        {(cart || []).find(cartItem => (cartItem as any).id === item.id)?.quantity || 0}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item, 1);
                        }}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                          color: '#0D0D0D',
                          fontSize: '20px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
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
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: '#2C2C2C',
                      color: '#F5F5F5',
                      border: '1px solid rgba(245, 245, 245, 0.2)',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      textAlign: 'center',
                      opacity: 0.4
                    }}>
                      Indisponível
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>

      {/* AI Button */}
      <button
        onClick={() => setShowAI(!showAI)}
        style={{
          position: 'fixed',
          bottom: cartItemCount > 0 ? '120px' : '32px',
          right: '32px',
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)',
          zIndex: 50,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
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

      {/* Cart Summary Premium */}
      {cartItemCount > 0 && (
        <div className="cart-summary" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.98) 0%, rgba(13, 13, 13, 0.98) 100%)',
          backdropFilter: 'blur(30px)',
          borderTop: '2px solid rgba(212, 175, 55, 0.3)',
          padding: '20px',
          boxShadow: '0 -12px 40px rgba(0, 0, 0, 0.8)',
          zIndex: 40
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <div className="cart-info" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                  color: '#0D0D0D',
                  padding: '14px',
                  borderRadius: '16px',
                  boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4)'
                }}>
                  <Users size={24} />
                </div>
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#F5F5F5',
                  fontSize: '12px',
                  fontWeight: '700',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  minWidth: '24px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                  animation: 'bounce 2s infinite'
                }}>
                  {cartItemCount}
                </span>
              </div>
              <div className="cart-details">
                <p style={{ 
                  fontSize: '14px', 
                  color: '#F5F5F5', 
                  margin: 0, 
                  fontWeight: '500',
                  opacity: 0.8
                }}>
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'} na mesa
                </p>
                <p style={{ 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  color: '#D4AF37', 
                  margin: 0,
                  fontFamily: 'Cinzel, serif'
                }}>
                  R$ {cartTotal.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              className="checkout-btn"
              onClick={() => navigate(`/tray?sessionId=${sessionId}&token=${token}`)}
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                color: '#0D0D0D',
                border: 'none',
                padding: '16px 28px',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(212, 175, 55, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
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
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .menu-header {
            padding: 16px !important;
          }
          
          .header-content {
            flex-direction: row !important;
            align-items: center !important;
            gap: 16px !important;
          }
          
          .header-left {
            flex: 1 !important;
            gap: 12px !important;
          }
          
          .logo {
            height: 40px !important;
          }
          
          .table-info {
            gap: 4px !important;
          }
          
          .table-info > div:first-child {
            font-size: 16px !important;
          }
          
          .cart-badge {
            font-size: 10px !important;
            padding: 2px 8px !important;
          }
          

          
          .filters-section {
            padding: 16px !important;
          }
          
          .search-input {
            padding: 12px 16px 12px 44px !important;
            font-size: 16px !important;
          }
          
          .categories-container {
            gap: 6px !important;
            padding-bottom: 4px !important;
          }
          
          .category-btn {
            padding: 8px 12px !important;
            font-size: 12px !important;
            white-space: nowrap !important;
          }
          
          .menu-main {
            padding: 16px !important;
            padding-bottom: 140px !important;
          }
          
          .menu-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          .cart-summary {
            padding: 12px 16px !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            border-radius: 0 !important;
          }
          
          .cart-info {
            gap: 12px !important;
          }
          
          .cart-details p:first-child {
            font-size: 12px !important;
          }
          
          .cart-details p:last-child {
            font-size: 16px !important;
          }
          
          .checkout-btn {
            padding: 10px 16px !important;
            font-size: 14px !important;
          }
        }
        
        @media (max-width: 480px) {
          .menu-header {
            padding: 12px !important;
          }
          
          .header-left {
            gap: 8px !important;
          }
          
          .logo {
            height: 36px !important;
          }
          
          .table-info span {
            font-size: 14px !important;
          }
          

          
          .filters-section {
            padding: 12px !important;
          }
          
          .search-input {
            padding: 10px 12px 10px 40px !important;
            font-size: 14px !important;
          }
          
          .category-btn {
            padding: 6px 10px !important;
            font-size: 11px !important;
          }
          
          .menu-main {
            padding: 12px !important;
            padding-bottom: 120px !important;
          }
          
          .cart-summary {
            padding: 10px 12px !important;
          }
          
          .cart-details p:last-child {
            font-size: 14px !important;
          }
          
          .checkout-btn {
            padding: 8px 12px !important;
            font-size: 12px !important;
          }
        }
        
        /* Scrollbar Styling */
        .categories-container::-webkit-scrollbar {
          height: 4px;
        }
        
        .categories-container::-webkit-scrollbar-track {
          background: rgba(212, 175, 55, 0.1);
          border-radius: 2px;
        }
        
        .categories-container::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.4);
          border-radius: 2px;
        }
        
        .categories-container::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.6);
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
    'Bebida': '🍷',
    'Massas': '🍝',
    'Carnes': '🥩',
    'Peixes': '🐟',
    'Vegetariano': '🥬'
  };
  return icons[category] || '🍽️';
};

export default MenuPage;