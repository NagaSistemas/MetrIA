import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Users, Clock, CheckCircle, AlertCircle, ChefHat } from 'lucide-react';

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
      const url = token 
        ? `${import.meta.env.VITE_API_URL}/api/session/${restaurantId}/${tableId}?t=${token}`
        : `${import.meta.env.VITE_API_URL}/api/session/${restaurantId}/${tableId}`;
        
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar sessão');
      }

      setSession(data.session);
    } catch (err: any) {
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
          label: 'Mesa Disponível', 
          color: 'text-green-400', 
          bgColor: 'bg-green-500/20 border-green-500/30',
          icon: CheckCircle,
          description: 'Pronto para receber seu pedido'
        };
      case 'ORDERING':
        return { 
          label: 'Fazendo Pedido', 
          color: 'text-blue-400', 
          bgColor: 'bg-blue-500/20 border-blue-500/30',
          icon: Clock,
          description: 'Sessão ativa - Continue seu pedido'
        };
      case 'PAYING':
        return { 
          label: 'Processando Pagamento', 
          color: 'text-yellow-400', 
          bgColor: 'bg-yellow-500/20 border-yellow-500/30',
          icon: Clock,
          description: 'Aguardando confirmação do pagamento'
        };
      case 'PAID':
        return { 
          label: 'Pedido Confirmado', 
          color: 'text-gold', 
          bgColor: 'bg-gold/20 border-gold/30',
          icon: ChefHat,
          description: 'Seu pedido está sendo preparado'
        };
      default:
        return { 
          label: 'Mesa Fechada', 
          color: 'text-red-400', 
          bgColor: 'bg-red-500/20 border-red-500/30',
          icon: AlertCircle,
          description: 'Sessão encerrada'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-metria-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-gold border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="logo-metria text-3xl mb-2">MetrIA</h2>
          <p className="text-metria-white/70">Validando mesa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-metria-black flex items-center justify-center p-4">
        <div className="card-luxury max-w-md w-full text-center">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="font-serif text-red-400 text-xl mb-3">QR Code Inválido</h2>
          <p className="text-metria-white/70 mb-6">{error}</p>
          <button
            onClick={handleCallWaiter}
            className="btn-gold w-full mb-3"
          >
            Chamar Garçom
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-transparent border border-metria-white/30 text-metria-white/70 py-3 rounded-lg hover:border-metria-white/50 transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-metria-black flex items-center justify-center p-4">
        <div className="card-luxury max-w-md w-full text-center">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="font-serif text-red-400 text-xl mb-3">Mesa não encontrada</h2>
          <p className="text-metria-white/70 mb-6">Não foi possível localizar esta mesa</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(session.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-metria-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Elegante */}
        <div className="text-center mb-8">
          <h1 className="logo-metria text-4xl mb-3 animate-fade-in">MetrIA</h1>
          <div className="flex items-center justify-center gap-3 text-metria-white/80">
            <Users size={20} className="text-gold" />
            <span className="font-serif text-gold text-xl">Mesa {session.tableNumber}</span>
          </div>
          <p className="text-metria-white/60 text-sm mt-2">Seu maître digital está pronto</p>
        </div>

        {/* Card Principal */}
        <div className="card-luxury text-center animate-bounce-in">
          <div className="mb-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${statusInfo.bgColor} border mb-4`}>
              <StatusIcon size={32} className={statusInfo.color} />
            </div>
            
            <h2 className="font-serif text-gold text-2xl mb-2">{statusInfo.label}</h2>
            <p className="text-metria-white/70">{statusInfo.description}</p>
          </div>

          {/* Informações da Sessão */}
          <div className="bg-metria-black/30 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-metria-white/60">Sessão:</span>
              <span className="text-metria-white font-medium">#{session.id.slice(-6)}</span>
            </div>
            {session.lastActivity && (
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-metria-white/60">Última atividade:</span>
                <span className="text-metria-white/80">
                  {new Date(session.lastActivity).toLocaleTimeString('pt-BR')}
                </span>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="space-y-3">
            {(session.status === 'OPEN' || session.status === 'ORDERING') && (
              <button
                onClick={handleStartSession}
                className="btn-gold w-full py-4 text-lg font-semibold hover:scale-105 transition-all"
              >
                {session.status === 'OPEN' ? 'Iniciar Pedido' : 'Continuar Pedido'}
              </button>
            )}

            {session.status === 'PAID' && (
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/order/${session.id}?token=${session.token}`)}
                  className="btn-gold w-full py-4 text-lg font-semibold"
                >
                  Acompanhar Pedido
                </button>
                <button
                  onClick={handleStartSession}
                  className="w-full bg-transparent border border-gold/30 text-gold py-3 rounded-lg hover:border-gold transition-all"
                >
                  Pedir Mais
                </button>
              </div>
            )}

            <button
              onClick={handleCallWaiter}
              className="w-full bg-transparent border border-metria-emerald/30 text-metria-emerald py-3 rounded-lg hover:border-metria-emerald hover:bg-metria-emerald/10 transition-all"
            >
              Chamar Garçom
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-metria-white/50 text-xs">
            Experiência digital exclusiva para sua mesa
          </p>
        </div>
      </div>
    </div>
  );
};

export default TableSessionPage;