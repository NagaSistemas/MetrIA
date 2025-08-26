import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, QrCode, Copy, Check, Shield, Timer } from 'lucide-react';
import { useTable } from '../../contexts/TableContext';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const token = searchParams.get('token');
  
  const { cart } = useTable();
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [pixData, setPixData] = useState<{qrCode: string; copyPaste: string; expiresAt: string} | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cardData, setCardData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.1; // +10% service

  useEffect(() => {
    if (paymentMethod === 'pix' && !pixData) {
      generatePixPayment();
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (pixData && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [pixData, timeLeft]);

  const generatePixPayment = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          amount: total,
          items: cart
        })
      });
      
      const data = await response.json();
      setPixData(data);
      setTimeLeft(15 * 60); // 15 minutes
    } catch (error) {
      console.error('Error generating PIX:', error);
    }
  };

  const copyPixCode = async () => {
    if (pixData?.copyPaste) {
      await navigator.clipboard.writeText(pixData.copyPaste);
      
      // Toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-gold text-metria-black px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce-in';
      toast.innerHTML = '✓ Código PIX copiado!';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
    }
  };

  const processCardPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          amount: total,
          items: cart,
          card: cardData
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPaymentStatus('success');
        setTimeout(() => {
          navigate(`/order/${data.orderId}?sessionId=${sessionId}&token=${token}`);
        }, 3000);
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-metria-black flex items-center justify-center p-4">
        <div className="card-luxury text-center max-w-md animate-bounce-in">
          {/* Confetti effect */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto">
              <Check size={40} className="text-metria-black" />
            </div>
            <div className="absolute inset-0 animate-ping">
              <div className="w-20 h-20 bg-gold/30 rounded-full mx-auto"></div>
            </div>
          </div>
          
          <h2 className="font-serif text-gold text-2xl mb-3">Pagamento Confirmado!</h2>
          <p className="text-metria-white/70 mb-6">
            Seu pedido foi enviado à cozinha e será preparado com carinho.
          </p>
          
          <button
            onClick={() => navigate(`/order/${sessionId}?sessionId=${sessionId}&token=${token}`)}
            className="btn-gold w-full"
          >
            Acompanhar Status
          </button>
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
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <button
            onClick={() => navigate(`/tray?sessionId=${sessionId}&token=${token}`)}
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
          }}>Pagamento</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </header>

      <div style={{ padding: '32px 20px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Aviso de Teste */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#ef4444',
            fontSize: '14px',
            fontWeight: '600',
            margin: 0
          }}>
            ⚠️ Módulo de pagamento ainda não integrado, botão para testes.
          </p>
        </div>
        {/* Payment Method Tabs */}
        <div style={{
          display: 'flex',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
          borderRadius: '16px',
          padding: '6px',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <button
            onClick={() => setPaymentMethod('pix')}
            style={{
              flex: 1,
              padding: '16px 24px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer',
              background: paymentMethod === 'pix' 
                ? 'linear-gradient(135deg, #D4AF37, #B8860B)' 
                : 'transparent',
              color: paymentMethod === 'pix' ? '#0D0D0D' : '#F5F5F5',
              boxShadow: paymentMethod === 'pix' ? '0 4px 15px rgba(212, 175, 55, 0.3)' : 'none'
            }}
          >
            PIX
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            style={{
              flex: 1,
              padding: '16px 24px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer',
              background: paymentMethod === 'card' 
                ? 'linear-gradient(135deg, #D4AF37, #B8860B)' 
                : 'transparent',
              color: paymentMethod === 'card' ? '#0D0D0D' : '#F5F5F5',
              boxShadow: paymentMethod === 'card' ? '0 4px 15px rgba(212, 175, 55, 0.3)' : 'none'
            }}
          >
            Cartão
          </button>
        </div>

        {/* PIX Payment */}
        {paymentMethod === 'pix' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {pixData ? (
              <>
                {/* QR Code */}
                <div style={{
                  background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '20px',
                  padding: '32px',
                  textAlign: 'center',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)'
                }}>
                  <div style={{
                    width: '200px',
                    height: '200px',
                    backgroundColor: '#F5F5F5',
                    borderRadius: '16px',
                    margin: '0 auto 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }}>
                    <QrCode size={160} style={{ color: '#0D0D0D' }} />
                  </div>
                  
                  {/* Timer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                    padding: '8px 16px',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderRadius: '20px',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    width: 'fit-content',
                    margin: '0 auto 16px'
                  }}>
                    <Timer size={16} style={{ color: '#D4AF37' }} />
                    <span style={{
                      color: '#D4AF37',
                      fontFamily: 'monospace',
                      fontSize: '18px',
                      fontWeight: '700'
                    }}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  
                  <p style={{
                    color: '#F5F5F5',
                    opacity: 0.8,
                    fontSize: '16px',
                    margin: 0
                  }}>
                    Escaneie o QR Code com seu app do banco
                  </p>
                </div>

                {/* Copy & Paste */}
                <div style={{
                  background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)'
                }}>
                  <h3 style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#D4AF37',
                    marginBottom: '16px'
                  }}>Copia e Cola</h3>
                  <div style={{
                    backgroundColor: '#0D0D0D',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                  }}>
                    <p style={{
                      color: '#F5F5F5',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {pixData.copyPaste}
                    </p>
                  </div>
                  <button
                    onClick={copyPixCode}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                      color: '#0D0D0D',
                      border: 'none',
                      padding: '16px 24px',
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
                    <Copy size={18} />
                    Copiar Código PIX
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '20px',
                padding: '48px',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid #D4AF37',
                  borderTop: '4px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 24px'
                }}></div>
                <p style={{
                  color: '#F5F5F5',
                  opacity: 0.8,
                  fontSize: '16px',
                  margin: 0
                }}>Gerando código PIX...</p>
              </div>
            )}
          </div>
        )}

        {/* Card Payment */}
        {paymentMethod === 'card' && (
          <div className="space-y-4">
            <div className="card-luxury">
              <h3 className="font-serif text-gold text-lg mb-4">Dados do Cartão</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-metria-white/70 text-sm mb-2">Nome no cartão</label>
                  <input
                    type="text"
                    value={cardData.name}
                    onChange={(e) => setCardData(prev => ({...prev, name: e.target.value}))}
                    className="w-full bg-metria-black border border-gold/30 rounded-lg px-3 py-3 text-metria-white placeholder-metria-white/50 focus:border-gold focus:outline-none"
                    placeholder="João Silva"
                  />
                </div>

                <div>
                  <label className="block text-metria-white/70 text-sm mb-2">Número do cartão</label>
                  <input
                    type="text"
                    value={cardData.number}
                    onChange={(e) => setCardData(prev => ({...prev, number: e.target.value}))}
                    className="w-full bg-metria-black border border-gold/30 rounded-lg px-3 py-3 text-metria-white placeholder-metria-white/50 focus:border-gold focus:outline-none"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-metria-white/70 text-sm mb-2">Validade</label>
                    <input
                      type="text"
                      value={cardData.expiry}
                      onChange={(e) => setCardData(prev => ({...prev, expiry: e.target.value}))}
                      className="w-full bg-metria-black border border-gold/30 rounded-lg px-3 py-3 text-metria-white placeholder-metria-white/50 focus:border-gold focus:outline-none"
                      placeholder="MM/AA"
                      maxLength={5}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-metria-white/70 text-sm mb-2">CVV</label>
                    <input
                      type="text"
                      value={cardData.cvv}
                      onChange={(e) => setCardData(prev => ({...prev, cvv: e.target.value}))}
                      className="w-full bg-metria-black border border-gold/30 rounded-lg px-3 py-3 text-metria-white placeholder-metria-white/50 focus:border-gold focus:outline-none"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={processCardPayment}
              disabled={isProcessing || !cardData.name || !cardData.number || !cardData.expiry || !cardData.cvv}
              className="w-full btn-gold py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-metria-black border-t-transparent rounded-full"></div>
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Confirmar Pagamento
                </>
              )}
            </button>
          </div>
        )}

        {/* Order Summary */}
        <div style={{
          background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '20px',
          padding: '24px',
          marginTop: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)'
        }}>
          <h3 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '20px',
            fontWeight: '600',
            color: '#D4AF37',
            marginBottom: '16px'
          }}>Resumo do Pedido</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cart.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#F5F5F5', opacity: 0.8 }}>
                  {item.quantity}x {item.name || `Item ${item.menuItemId}`}
                </span>
                <span style={{ color: '#F5F5F5', fontWeight: '500' }}>
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div style={{
              borderTop: '1px solid rgba(212, 175, 55, 0.2)',
              paddingTop: '12px',
              marginTop: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                <span style={{ color: '#D4AF37', fontSize: '18px', fontFamily: 'Cinzel, serif' }}>Total</span>
                <span style={{ color: '#D4AF37', fontSize: '18px', fontFamily: 'Cinzel, serif' }}>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Teste */}
        <button
          onClick={async () => {
            console.log('=== CHECKOUT DEBUG ===');
            console.log('SessionId:', sessionId);
            console.log('Total:', total);
            console.log('Cart items:', cart);
            console.log('API URL:', import.meta.env.VITE_API_URL);
            
            try {
              const payload = {
                sessionId,
                amount: total,
                items: cart
              };
              
              console.log('Sending payload:', payload);
              
              const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/pix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              
              console.log('Response status:', response.status);
              console.log('Response headers:', response.headers);
              
              const data = await response.json();
              console.log('Response data:', data);
              
              if (data.success) {
                console.log('Payment successful!');
                setPaymentStatus('success');
                localStorage.removeItem('cart');
                setTimeout(() => {
                  navigate(`/order/${data.orderId}?sessionId=${sessionId}&token=${token}`);
                }, 2000);
              } else {
                console.error('Payment failed:', data);
              }
            } catch (error) {
              console.error('Error simulating payment:', error);
              console.log('Full error:', error);
            }
          }}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#F5F5F5',
            border: 'none',
            padding: '16px 24px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            marginBottom: '24px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
          }}
        >
          ✅ Simular pagamento bem sucedido
        </button>

        {/* Security Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px',
          color: '#F5F5F5',
          opacity: 0.6,
          fontSize: '12px'
        }}>
          <Shield size={14} />
          <span>Pagamento seguro. Seus dados não são armazenados.</span>
        </div>

        {/* Processing State */}
        {paymentStatus === 'processing' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="card-luxury text-center max-w-sm">
              <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="font-serif text-gold text-xl mb-2">Processando Pagamento</h3>
              <p className="text-metria-white/70">
                Estamos confirmando seu pagamento...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {paymentStatus === 'error' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="card-luxury text-center max-w-sm">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <h3 className="font-serif text-red-400 text-xl mb-2">Erro no Pagamento</h3>
              <p className="text-metria-white/70 mb-4">
                Não conseguimos confirmar seu pagamento.
              </p>
              <button
                onClick={() => setPaymentStatus('idle')}
                className="btn-gold w-full"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;