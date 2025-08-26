import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, ChefHat, Truck, Phone } from 'lucide-react';

interface OrderStatus {
  id: string;
  status: 'PAID' | 'PREPARING' | 'READY' | 'DELIVERED';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  estimatedTime: number;
  createdAt: string;
  tableNumber: string;
}

const OrderStatusPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId');
  const token = searchParams.get('token');
  
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderStatus();
      const interval = setInterval(fetchOrderStatus, 10000); // Update every 10s
      return () => clearInterval(interval);
    }
  }, [orderId]);

  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/order/${orderId}/status`);
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallWaiter = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/call-waiter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId, 
          message: 'Cliente solicitou atendimento - Acompanhamento do pedido' 
        })
      });
      
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
      case 'PAID':
        return { 
          label: 'Pedido Confirmado', 
          icon: CheckCircle, 
          color: 'text-gold',
          bgColor: 'bg-gold/20',
          description: 'Pagamento aprovado'
        };
      case 'PREPARING':
        return { 
          label: 'Em Preparo', 
          icon: ChefHat, 
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20',
          description: 'Nossa equipe está preparando seu pedido'
        };
      case 'READY':
        return { 
          label: 'Pronto!', 
          icon: CheckCircle, 
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          description: 'Seu pedido está pronto'
        };
      case 'DELIVERED':
        return { 
          label: 'Entregue', 
          icon: Truck, 
          color: 'text-metria-emerald',
          bgColor: 'bg-metria-emerald/20',
          description: 'Bom apetite!'
        };
      default:
        return { 
          label: 'Processando', 
          icon: Clock, 
          color: 'text-metria-white',
          bgColor: 'bg-metria-white/20',
          description: 'Aguarde...'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-metria-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="logo-metria text-2xl mb-2">MetrIA</h2>
          <p className="text-metria-white/70">Verificando status do pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-metria-black flex items-center justify-center">
        <div className="card-luxury text-center max-w-md">
          <h2 className="font-serif text-gold text-xl mb-4">Pedido não encontrado</h2>
          <button 
            onClick={() => navigate(`/menu?sessionId=${sessionId}&token=${token}`)}
            className="btn-gold"
          >
            Voltar ao Cardápio
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-metria-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-metria-black/95 backdrop-blur-sm border-b border-gold/20 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/menu?sessionId=${sessionId}&token=${token}`)}
            className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <h1 className="font-serif text-gold text-xl">Status do Pedido</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* Current Status */}
        <div className="card-luxury text-center mb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${statusInfo.bgColor} border-2 border-current mb-4 ${order.status === 'READY' ? 'animate-pulse' : ''}`}>
            <StatusIcon size={32} className={`${statusInfo.color} ${order.status === 'READY' ? 'animate-bounce' : ''}`} />
          </div>
          
          <h2 className={`font-serif text-2xl mb-2 ${statusInfo.color}`}>
            {statusInfo.label}
          </h2>
          <p className="text-metria-white/70 mb-4">
            {statusInfo.description}
          </p>

          {order.status === 'READY' && (
            <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 mb-4">
              <p className="text-gold font-medium">
                ✨ Fique à vontade. O garçom trará sua refeição à mesa.
              </p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="card-luxury mb-6">
          <h3 className="font-serif text-gold text-lg mb-4">Acompanhe seu pedido</h3>
          
          <div className="space-y-4">
            {[
              { status: 'PAID', label: 'Pago', time: '0 min' },
              { status: 'PREPARING', label: 'Em Preparo', time: '5-10 min' },
              { status: 'READY', label: 'Pronto', time: '15-20 min' },
              { status: 'DELIVERED', label: 'Entregue', time: '20-25 min' }
            ].map((step, index) => {
              const isActive = order.status === step.status;
              const isCompleted = ['PAID', 'PREPARING', 'READY', 'DELIVERED'].indexOf(order.status) >= index;
              
              return (
                <div key={step.status} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted 
                      ? 'bg-gold border-gold text-metria-black' 
                      : 'border-metria-white/30 text-metria-white/50'
                  } ${isActive ? 'animate-pulse' : ''}`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`font-medium ${isCompleted ? 'text-gold' : 'text-metria-white/50'}`}>
                      {step.label}
                    </p>
                    <p className="text-metria-white/60 text-sm">
                      Tempo estimado: {step.time}
                    </p>
                  </div>
                  
                  {isActive && (
                    <div className="text-gold text-sm font-medium animate-pulse">
                      Em andamento...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="card-luxury mb-6">
          <h3 className="font-serif text-gold text-lg mb-4">Detalhes do Pedido</h3>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-metria-white/70">Pedido:</span>
              <span className="text-metria-white">#{order.id.slice(-6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-metria-white/70">Mesa:</span>
              <span className="text-metria-white">{order.tableNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-metria-white/70">Horário:</span>
              <span className="text-metria-white">
                {new Date(order.createdAt).toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>

          <div className="border-t border-gold/20 pt-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm mb-2">
                <span className="text-metria-white/80">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-metria-white">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-gold/20 pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span className="text-gold">Total</span>
                <span className="text-gold">R$ {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call Waiter Button */}
        <button
          onClick={handleCallWaiter}
          className="w-full bg-transparent border-2 border-metria-emerald text-metria-emerald py-4 rounded-lg font-semibold hover:bg-metria-emerald hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <Phone size={20} />
          Chamar Garçom
        </button>
      </div>
    </div>
  );
};

export default OrderStatusPage;