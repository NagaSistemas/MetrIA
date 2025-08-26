import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, ChefHat } from 'lucide-react';

interface TableSession {
  id: string;
  tableId: string;
  tableNumber: number;
  restaurantId: string;
  status: 'OPEN' | 'ORDERING' | 'PAYING' | 'PAID' | 'CLOSED';
  token: string;
  createdAt: string;
  lastActivity?: string;
}

const TableSessionPage: React.FC = () => {
  const { restaurantId, tableId } = useParams<{ restaurantId: string; tableId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('t');
  
  const [session, setSession] = useState<TableSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId && tableId) {
      validateAndLoadSession();
    }
  }, [restaurantId, tableId, token]);

  const validateAndLoadSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/session/${restaurantId}/${tableId}`;
        
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Mesa não encontrada');
      }
      
      const data = await response.json();
      setSession(data.session);
    } catch (err: any) {
      console.error('Session validation error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = () => {
    if (session) {
      navigate(`/menu?sessionId=${session.id}&token=${session.token}`);
    }
  };

  const handleCallWaiter = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/call-waiter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: session?.id, 
          tableId,
          message: 'Cliente solicitou atendimento - QR Code' 
        })
      });
      
      // Toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-metria-emerald text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce-in';
      toast.textContent = '✓ Garçom chamado com sucesso!';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } catch (error) {
      console.error('Error calling waiter:', error);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { 
          label: `Mesa ${session?.tableNumber} Disponível`, 
          color: 'text-green-400', 
          bgColor: 'bg-green-500/20 border-green-500/30',
          icon: CheckCircle,
          description: 'Pronto para receber seu pedido'
        };
      case 'ORDERING':
        return { 
          label: `Mesa ${session?.tableNumber} - Fazendo Pedido`, 
          color: 'text-blue-400', 
          bgColor: 'bg-blue-500/20 border-blue-500/30',
          icon: Clock,
          description: 'Sessão ativa - Continue seu pedido'
        };
      case 'PAYING':
        return { 
          label: `Mesa ${session?.tableNumber} - Processando Pagamento`, 
          color: 'text-yellow-400', 
          bgColor: 'bg-yellow-500/20 border-yellow-500/30',
          icon: Clock,
          description: 'Aguardando confirmação do pagamento'
        };
      case 'PAID':
        return { 
          label: `Mesa ${session?.tableNumber} - Pedido Confirmado`, 
          color: 'text-gold', 
          bgColor: 'bg-gold/20 border-gold/30',
          icon: ChefHat,
          description: 'Seu pedido está sendo preparado'
        };
      default:
        return { 
          label: `Mesa ${session?.tableNumber} - Fechada`, 
          color: 'text-red-400', 
          bgColor: 'bg-red-500/20 border-red-500/30',
          icon: AlertCircle,
          description: 'Sessão encerrada'
        };
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0D0D0D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <img 
            src="/Logo.png" 
            alt="MetrIA Logo" 
            style={{ 
              height: '120px', 
              width: 'auto',
              filter: 'drop-shadow(0 4px 12px rgba(212, 175, 55, 0.4))',
              marginBottom: '32px'
            }} 
          />
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
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#D4AF37', 
            marginBottom: '8px',
            textShadow: '0 2px 10px rgba(212, 175, 55, 0.3)'
          }}>MetrIA</h2>
          <p style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '16px' }}>Validando sua mesa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0D0D0D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)'
        }}>
          <img 
            src="/Logo.png" 
            alt="MetrIA Logo" 
            style={{ 
              height: '80px', 
              width: 'auto',
              filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.3))',
              marginBottom: '24px'
            }} 
          />
          <AlertCircle size={64} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            color: '#ef4444',
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>QR Code Inválido</h2>
          <p style={{ color: '#F5F5F5', opacity: 0.7, marginBottom: '24px', fontSize: '16px' }}>{error}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleCallWaiter}
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                color: '#0D0D0D',
                border: 'none',
                padding: '16px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
              }}
            >
              Chamar Garçom
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(245, 245, 245, 0.3)',
                color: '#F5F5F5',
                padding: '16px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0D0D0D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)'
        }}>
          <img 
            src="/Logo.png" 
            alt="MetrIA Logo" 
            style={{ 
              height: '80px', 
              width: 'auto',
              filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.3))',
              marginBottom: '24px'
            }} 
          />
          <AlertCircle size={64} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            color: '#ef4444',
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>Mesa não encontrada</h2>
          <p style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '16px' }}>Não foi possível localizar esta mesa</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(session.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0D0D0D',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        {/* Header Profissional */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img 
            src="/Logo.png" 
            alt="MetrIA Logo" 
            style={{ 
              height: '140px', 
              width: 'auto',
              filter: 'drop-shadow(0 4px 12px rgba(212, 175, 55, 0.4))',
              marginBottom: '24px'
            }} 
          />
        </div>

        {/* Card Principal */}
        <div style={{
          background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '60px',
            height: '60px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          <div style={{ marginBottom: '32px', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: statusInfo.bgColor.replace('bg-', '').replace('/20', ', 0.2)').replace('/30', ', 0.3)'),
              border: `2px solid ${statusInfo.color.replace('text-', '')}`,
              marginBottom: '20px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
            }}>
              <StatusIcon size={36} style={{ color: statusInfo.color.replace('text-', '') }} />
            </div>
            
            <h2 style={{
              fontFamily: 'Cinzel, serif',
              color: '#D4AF37',
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '12px',
              textShadow: '0 2px 10px rgba(212, 175, 55, 0.3)'
            }}>{statusInfo.label}</h2>
            <p style={{ 
              color: '#F5F5F5', 
              opacity: 0.8, 
              fontSize: '16px',
              lineHeight: '1.5'
            }}>{statusInfo.description}</p>
          </div>

          {/* Informações da Sessão */}
          <div style={{
            backgroundColor: 'rgba(13, 13, 13, 0.5)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '32px',
            border: '1px solid rgba(212, 175, 55, 0.1)',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '14px' }}>Sessão:</span>
              <span style={{ 
                color: '#D4AF37', 
                fontWeight: '600',
                fontFamily: 'monospace',
                fontSize: '14px'
              }}>#{session.id.slice(-6)}</span>
            </div>
            {session.lastActivity && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <span style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '14px' }}>Última atividade:</span>
                <span style={{ color: '#F5F5F5', opacity: 0.9, fontSize: '14px' }}>
                  {new Date(session.lastActivity).toLocaleTimeString('pt-BR')}
                </span>
              </div>
            )}
            {session.createdAt && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(212, 175, 55, 0.1)'
              }}>
                <span style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '14px' }}>Criada em:</span>
                <span style={{ color: '#F5F5F5', opacity: 0.9, fontSize: '14px' }}>
                  {new Date(session.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
            )}
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}>
            {(session.status === 'OPEN' || session.status === 'ORDERING') && (
              <button
                onClick={handleStartSession}
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                  color: '#0D0D0D',
                  border: 'none',
                  padding: '20px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(212, 175, 55, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
                }}
              >
                {session.status === 'OPEN' ? '🍽️ Iniciar Pedido' : '📋 Continuar Pedido'}
              </button>
            )}

            {session.status === 'PAID' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => navigate(`/order/${session.id}?token=${session.token}`)}
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                    color: '#0D0D0D',
                    border: 'none',
                    padding: '20px 32px',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4)'
                  }}
                >
                  👨‍🍳 Acompanhar Pedido
                </button>
                <button
                  onClick={handleStartSession}
                  style={{
                    backgroundColor: 'transparent',
                    border: '2px solid rgba(212, 175, 55, 0.3)',
                    color: '#D4AF37',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#D4AF37';
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  🍽️ Pedir Mais
                </button>
              </div>
            )}


          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <p style={{ 
            color: '#F5F5F5', 
            opacity: 0.5, 
            fontSize: '14px',
            fontStyle: 'italic'
          }}>
            ✨ Experiência digital exclusiva para sua mesa ✨
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TableSessionPage;