import React, { useState, useEffect } from 'react';
import type { Order } from '../../../../../shared/types';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: string) => void;
  onCancelOrder: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus, onCancelOrder }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      try {
        const createdTime = typeof order.createdAt === 'string' 
          ? new Date(order.createdAt).getTime() 
          : new Date(order.createdAt).getTime();
        
        if (!isNaN(createdTime)) {
          setTimeElapsed(Math.floor((Date.now() - createdTime) / 1000));
        }
      } catch (error) {
        console.error('Error calculating time:', error);
        setTimeElapsed(0);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
      if (isNaN(dateObj.getTime())) return 'Data inválida';
      return dateObj.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const handleUpdateStatus = (newStatus: string) => {
    onUpdateStatus(order.id, newStatus);
  };

  const handleCancelOrder = () => {
    if (!confirm(`⚠️ ATENÇÃO: Tem certeza que deseja CANCELAR o Pedido #${order.id.slice(-6)}?\n\nEsta ação irá:\n• Cancelar o pedido\n• Processar estorno se necessário\n• Notificar o cliente\n\nEsta ação é IRREVERSÍVEL.`)) return;
    onCancelOrder(order.id);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%)',
      border: `2px solid ${order.status === 'DELIVERED' ? '#10b981' :
                           order.status === 'READY' ? '#3b82f6' :
                           order.status === 'PREPARING' ? '#f59e0b' :
                           order.status === 'CANCELLED' ? '#ef4444' :
                           '#f59e0b'}`,
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 15px 50px rgba(0, 0, 0, 0.6)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Priority Indicator */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: timeElapsed > 1800 ? 'linear-gradient(90deg, #ef4444, #dc2626)' :
                   timeElapsed > 900 ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                   'linear-gradient(90deg, #10b981, #059669)',
        borderRadius: '20px 20px 0 0'
      }}></div>
      
      {/* Timer Badge */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: timeElapsed > 1800 ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                   timeElapsed > 900 ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                   'linear-gradient(135deg, #10b981, #059669)',
        color: '#F5F5F5',
        padding: '8px 16px',
        borderRadius: '25px',
        fontSize: '14px',
        fontWeight: '700',
        fontFamily: 'monospace',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        animation: timeElapsed > 1800 ? 'pulse 2s infinite' : 'none'
      }}>
        ⏱️ {formatTime(timeElapsed)}
      </div>

      {/* Order Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '24px',
        marginTop: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: order.status === 'DELIVERED' ? 'linear-gradient(135deg, #10b981, #059669)' :
                       order.status === 'READY' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' :
                       order.status === 'PREPARING' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                       order.status === 'CANCELLED' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                       'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
            fontSize: '32px'
          }}>
            {order.status === 'DELIVERED' ? '✅' :
             order.status === 'READY' ? '🍽️' :
             order.status === 'PREPARING' ? '👨‍🍳' :
             order.status === 'CANCELLED' ? '❌' :
             '⏳'}
          </div>
          <div>
            <h3 style={{ 
              fontFamily: 'Cinzel, serif',
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#D4AF37',
              margin: 0,
              marginBottom: '8px'
            }}>
              Pedido #{order.id.slice(-6)}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                color: '#0D0D0D',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700'
              }}>
                🏠 Mesa {order.tableNumber || 'N/A'}
              </span>
              <span style={{
                color: '#F5F5F5',
                opacity: 0.8,
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {formatDate(order.createdAt)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: order.status === 'DELIVERED' ? 'rgba(16, 185, 129, 0.15)' :
                              order.status === 'READY' ? 'rgba(59, 130, 246, 0.15)' :
                              order.status === 'PREPARING' ? 'rgba(245, 158, 11, 0.15)' :
                              order.status === 'CANCELLED' ? 'rgba(239, 68, 68, 0.15)' :
                              'rgba(245, 158, 11, 0.15)',
              border: `2px solid ${order.status === 'DELIVERED' ? '#10b981' :
                                   order.status === 'READY' ? '#3b82f6' :
                                   order.status === 'PREPARING' ? '#f59e0b' :
                                   order.status === 'CANCELLED' ? '#ef4444' :
                                   '#f59e0b'}`,
              padding: '10px 18px',
              borderRadius: '16px',
              width: 'fit-content',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: order.status === 'DELIVERED' ? '#10b981' :
                                order.status === 'READY' ? '#3b82f6' :
                                order.status === 'PREPARING' ? '#f59e0b' :
                                order.status === 'CANCELLED' ? '#ef4444' :
                                '#f59e0b',
                animation: order.status === 'PENDING' ? 'pulse 2s infinite' : 'none'
              }}></div>
              <span style={{
                color: order.status === 'DELIVERED' ? '#10b981' :
                      order.status === 'READY' ? '#3b82f6' :
                      order.status === 'PREPARING' ? '#f59e0b' :
                      order.status === 'CANCELLED' ? '#ef4444' :
                      '#f59e0b',
                fontSize: '16px',
                fontWeight: '700'
              }}>
                {order.status === 'DELIVERED' ? '✅ ENTREGUE' :
                 order.status === 'READY' ? '🍽️ PRONTO PARA SERVIR' :
                 order.status === 'PREPARING' ? '👨‍🍳 PREPARANDO' :
                 order.status === 'CANCELLED' ? '❌ CANCELADO' :
                 '⏳ PENDENTE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div style={{
        backgroundColor: 'rgba(13, 13, 13, 0.5)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid rgba(212, 175, 55, 0.1)'
      }}>
        <h4 style={{
          color: '#F5F5F5',
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '16px',
          margin: 0
        }}>
          Itens do Pedido ({order.items?.length || 0})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {order.items?.map((item: any, index: number) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: 'rgba(212, 175, 55, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(212, 175, 55, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  backgroundColor: '#D4AF37',
                  color: '#0D0D0D',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {item.quantity}x
                </span>
                <span style={{ color: '#F5F5F5', fontWeight: '500' }}>
                  {item.name || `Item ${item.menuItemId}`}
                </span>
              </div>
              <span style={{ color: '#D4AF37', fontWeight: '600' }}>
                R$ {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          )) || (
            <p style={{ color: '#F5F5F5', opacity: 0.6, textAlign: 'center', margin: 0 }}>
              Nenhum item encontrado
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {order.status === 'PENDING' && (
          <button
            onClick={() => handleUpdateStatus('PREPARING')}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#F5F5F5',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
            }}
          >
            👨‍🍳 Iniciar Preparo
          </button>
        )}
        
        {order.status === 'PREPARING' && (
          <button
            onClick={() => handleUpdateStatus('READY')}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#F5F5F5',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}
          >
            🍽️ Marcar como Pronto
          </button>
        )}
        
        {order.status === 'READY' && (
          <button
            onClick={() => handleUpdateStatus('DELIVERED')}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#F5F5F5',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
            }}
          >
            ✅ Marcar como Entregue
          </button>
        )}
        
        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
          <button
            onClick={handleCancelOrder}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#F5F5F5',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
            }}
          >
            ❌ Cancelar Pedido
          </button>
        )}
        
        {order.status === 'CANCELLED' && (
          <button
            onClick={() => {
              if (confirm(`⚠️ ATENÇÃO: Tem certeza que deseja EXCLUIR permanentemente o Pedido #${order.id.slice(-6)}?\n\nEsta ação é IRREVERSÍVEL.`)) {
                onCancelOrder(order.id);
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #6b7280, #4b5563)',
              color: '#F5F5F5',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(107, 114, 128, 0.3)'
            }}
          >
            🗑️ Excluir Pedido
          </button>
        )}
      </div>
      
      {/* Order Summary */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '20px',
        borderTop: '2px solid rgba(212, 175, 55, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '12px', marginBottom: '4px' }}>
              ITENS
            </div>
            <div style={{ color: '#D4AF37', fontSize: '20px', fontWeight: '700' }}>
              {order.items?.length || 0}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '12px', marginBottom: '4px' }}>
              TEMPO
            </div>
            <div style={{ 
              color: timeElapsed > 1800 ? '#ef4444' : timeElapsed > 900 ? '#f59e0b' : '#10b981',
              fontSize: '20px', 
              fontWeight: '700',
              fontFamily: 'monospace'
            }}>
              {formatTime(timeElapsed)}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#F5F5F5', opacity: 0.7, fontSize: '14px', marginBottom: '4px' }}>
            TOTAL DO PEDIDO
          </div>
          <div style={{ 
            color: '#D4AF37', 
            fontSize: '32px', 
            fontWeight: '700',
            fontFamily: 'Cinzel, serif'
          }}>
            R$ {order.total.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;