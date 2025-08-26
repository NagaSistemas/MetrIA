import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, Users, Sparkles } from 'lucide-react';
import { useTable } from '../../contexts/TableContext';

const TrayPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const token = searchParams.get('token');
  
  const { cart, session, removeFromCart, clearCart, setCart } = useTable();
  const [voucher, setVoucher] = useState('');
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.1; // 10% service fee
  const taxes = subtotal * taxRate;
  const voucherDiscount = 0; // TODO: Implement voucher logic
  const total = subtotal + taxes - voucherDiscount;

  const updateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(menuItemId);
    } else {
      setCart(prev => prev.map(cartItem =>
        cartItem.menuItemId === menuItemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      ));
    }
  };

  const handleCheckout = () => {
    navigate(`/checkout?sessionId=${sessionId}&token=${token}`);
  };

  const handleAskSuggestion = async () => {
    // TODO: Integrate with AI service
    console.log('Ask AI for suggestion');
  };

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#F5F5F5' }}>
        {/* Header Profissional */}
        <header style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0D0D0D 100%)',
          borderBottom: '2px solid rgba(212, 175, 55, 0.2)',
          padding: '16px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <button
              onClick={() => navigate(`/menu?sessionId=${sessionId}&token=${token}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                color: '#D4AF37',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#F5F5F5';
                e.currentTarget.style.transform = 'translateX(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#D4AF37';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <h1 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '24px',
              fontWeight: '700',
              color: '#D4AF37',
              margin: 0
            }}>Minha Mesa</h1>
            <div style={{ width: '80px' }}></div>
          </div>
        </header>

        {/* Empty State */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 100px)',
          padding: '40px 20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '20px',
            padding: '48px',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 25px rgba(212, 175, 55, 0.3)'
            }}>
              <Users size={40} style={{ color: '#0D0D0D' }} />
            </div>
            <h2 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '28px',
              fontWeight: '700',
              color: '#D4AF37',
              margin: '0 0 16px 0'
            }}>Sua mesa está vazia</h2>
            <p style={{
              color: '#F5F5F5',
              opacity: 0.8,
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '32px'
            }}>
              Que tal uma sugestão do nosso maître digital?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={handleAskSuggestion}
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                  color: '#0D0D0D',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                <Sparkles size={18} />
                Pedir Sugestão
              </button>
              <button
                onClick={() => navigate(`/menu?sessionId=${sessionId}&token=${token}`)}
                style={{
                  background: 'transparent',
                  border: '2px solid rgba(212, 175, 55, 0.3)',
                  color: '#D4AF37',
                  padding: '14px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D4AF37';
                  e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Ver Cardápio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#F5F5F5' }}>
      {/* Header Profissional */}
      <header style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0D0D0D 100%)',
        borderBottom: '2px solid rgba(212, 175, 55, 0.2)',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <button
            onClick={() => navigate(`/menu?sessionId=${sessionId}&token=${token}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              color: '#D4AF37',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#F5F5F5';
              e.currentTarget.style.transform = 'translateX(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#D4AF37';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <h1 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '24px',
            fontWeight: '700',
            color: '#D4AF37',
            margin: 0
          }}>Minha Mesa</h1>
          <button
            onClick={clearCart}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      <div className="tray-container" style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '32px',
        padding: '32px 20px',
        paddingBottom: '160px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Items List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cart.map((item, index) => (
            <div key={`${item.menuItemId}-${index}`} className="item-card" style={{
              background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.3s ease'
            }}>
              <div className="item-content" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {/* Item Image */}
                <div className="item-image" style={{
                  width: '60px',
                  height: '60px',
                  background: item.image ? `url(${item.image})` : 'linear-gradient(135deg, #D4AF37, #B8860B)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0,
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                }}>
                  {!item.image && '🍽️'}
                </div>

                {/* Item Details */}
                <div className="item-details" style={{ flex: 1 }}>
                  <div style={{ marginBottom: '12px' }}>
                    <h3 className="item-title" style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#D4AF37',
                      margin: 0,
                      lineHeight: '1.3'
                    }}>{item.name || `Item ${item.menuItemId}`}</h3>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <p style={{
                      color: '#F5F5F5',
                      opacity: 0.7,
                      fontSize: '14px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      📝 {item.notes}
                    </p>
                  )}

                  {/* Quantity Controls */}
                  <div className="quantity-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: '#F5F5F5',
                          fontSize: '16px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                        }}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="quantity-display" style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#D4AF37',
                        minWidth: '36px',
                        textAlign: 'center',
                        fontFamily: 'Cinzel, serif'
                      }}>{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                          color: '#0D0D0D',
                          fontSize: '16px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="price-section" style={{ textAlign: 'right' }}>
                      <p className="item-price" style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#D4AF37',
                        margin: 0,
                        fontFamily: 'Cinzel, serif'
                      }}>
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p style={{
                          color: '#F5F5F5',
                          opacity: 0.6,
                          fontSize: '11px',
                          margin: 0
                        }}>
                          R$ {item.price.toFixed(2)} cada
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Additional Order Info */}
          {session?.status === 'PAID' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}>
                  <Plus size={20} style={{ color: '#F5F5F5' }} />
                </div>
                <div>
                  <h3 style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#10b981',
                    margin: 0,
                    marginBottom: '4px'
                  }}>Pedido Adicional</h3>
                  <p style={{
                    color: '#F5F5F5',
                    opacity: 0.7,
                    fontSize: '14px',
                    margin: 0
                  }}>
                    Sua mesa já tem um pedido confirmado. Este será um complemento.
                  </p>
                </div>
              </div>
              <button style={{
                width: '100%',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                Pedir Mais
              </button>
            </div>
          )}
        </div>

        {/* Summary Box */}
        <div style={{ width: window.innerWidth >= 1024 ? '380px' : '100%' }}>
          <div className="summary-box" style={{
            background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
            position: 'sticky',
            top: '120px'
          }}>
            <h3 className="summary-title" style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '22px',
              fontWeight: '700',
              color: '#D4AF37',
              margin: '0 0 20px 0'
            }}>Resumo do Pedido</h3>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#F5F5F5', opacity: 0.7 }}>Subtotal</span>
                <span style={{ color: '#F5F5F5', fontWeight: '500' }}>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#F5F5F5', opacity: 0.7 }}>Taxa de serviço (10%)</span>
                <span style={{ color: '#F5F5F5', fontWeight: '500' }}>R$ {taxes.toFixed(2)}</span>
              </div>
              {voucherDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#10b981' }}>Desconto</span>
                  <span style={{ color: '#10b981', fontWeight: '500' }}>-R$ {voucherDiscount.toFixed(2)}</span>
                </div>
              )}
              <div style={{
                borderTop: '1px solid rgba(212, 175, 55, 0.2)',
                paddingTop: '16px',
                marginTop: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#D4AF37'
                  }}>Total</span>
                  <span style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#D4AF37'
                  }}>R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Voucher */}
            <div style={{ marginBottom: '24px' }}>
              <input
                className="voucher-input"
                type="text"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                placeholder="Código do voucher"
                style={{
                  width: '100%',
                  backgroundColor: '#0D0D0D',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#F5F5F5',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  marginBottom: '12px'
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
              <button
                className="voucher-btn"
                onClick={() => setIsApplyingVoucher(true)}
                disabled={!voucher || isApplyingVoucher}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#D4AF37',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: voucher && !isApplyingVoucher ? 'pointer' : 'not-allowed',
                  opacity: voucher && !isApplyingVoucher ? 1 : 0.5,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (voucher && !isApplyingVoucher) {
                    e.currentTarget.style.borderColor = '#D4AF37';
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (voucher && !isApplyingVoucher) {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Aplicar
              </button>
            </div>

            {/* Policy Info */}
            <div style={{
              backgroundColor: 'rgba(13, 13, 13, 0.5)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid rgba(212, 175, 55, 0.1)'
            }}>
              <p style={{
                color: '#F5F5F5',
                opacity: 0.7,
                fontSize: '12px',
                lineHeight: '1.5',
                margin: 0,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                💡 Seu pedido será enviado diretamente à cozinha após a confirmação do pagamento.
              </p>
            </div>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                color: '#0D0D0D',
                border: 'none',
                padding: '16px 28px',
                borderRadius: '14px',
                fontSize: '17px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4)'
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
              Finalizar e Pagar
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @media (max-width: 1024px) {
          .tray-container {
            flex-direction: column !important;
          }
          .summary-box {
            width: 100% !important;
            position: static !important;
          }
        }
        
        @media (max-width: 768px) {
          .tray-container {
            padding: 16px !important;
            gap: 16px !important;
          }
          .item-card {
            padding: 16px !important;
            border-radius: 12px !important;
          }
          .item-image {
            width: 50px !important;
            height: 50px !important;
            font-size: 20px !important;
          }
          .item-title {
            font-size: 16px !important;
          }
          .quantity-btn {
            width: 32px !important;
            height: 32px !important;
            font-size: 14px !important;
          }
          .quantity-display {
            font-size: 16px !important;
            min-width: 32px !important;
          }
          .item-price {
            font-size: 18px !important;
          }
          .summary-box {
            padding: 20px !important;
            border-radius: 16px !important;
          }
          .summary-title {
            font-size: 20px !important;
          }
          .checkout-btn {
            padding: 14px 24px !important;
            font-size: 16px !important;
          }
        }
        
        @media (max-width: 480px) {
          .tray-container {
            padding: 12px !important;
            gap: 12px !important;
          }
          .item-card {
            padding: 12px !important;
          }
          .item-content {
            gap: 12px !important;
          }
          .item-details {
            gap: 8px !important;
          }
          .quantity-controls {
            gap: 12px !important;
          }
          .summary-box {
            padding: 16px !important;
          }
          .voucher-input {
            padding: 10px 12px !important;
            font-size: 14px !important;
          }
          .voucher-btn {
            padding: 10px 16px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TrayPage;