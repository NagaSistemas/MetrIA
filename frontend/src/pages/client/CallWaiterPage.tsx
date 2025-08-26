import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Clock, X, CheckCircle } from 'lucide-react';

const CallWaiterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId');
  const token = searchParams.get('token');
  
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'sent' | 'cancelled'>('idle');
  const [waitTime, setWaitTime] = useState(0);
  const [callId, setCallId] = useState<string | null>(null);

  useEffect(() => {
    if (callStatus === 'sent' && waitTime > 0) {
      const timer = setInterval(() => {
        setWaitTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [callStatus, waitTime]);

  const handleCallWaiter = async () => {
    setCallStatus('calling');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/call-waiter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId, 
          message: 'Cliente solicitou atendimento',
          priority: 'normal'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCallId(data.callId);
        setCallStatus('sent');
        setWaitTime(300); // 5 minutes estimated wait time
      }
    } catch (error) {
      console.error('Error calling waiter:', error);
      setCallStatus('idle');
    }
  };

  const handleCancelCall = async () => {
    if (!callId) return;
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/call-waiter/${callId}/cancel`, {
        method: 'PUT'
      });
      
      setCallStatus('cancelled');
      setTimeout(() => {
        setCallStatus('idle');
        setCallId(null);
        setWaitTime(0);
      }, 2000);
    } catch (error) {
      console.error('Error cancelling call:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          <h1 className="font-serif text-gold text-xl">Chamar Garçom</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          
          {/* Idle State */}
          {callStatus === 'idle' && (
            <div className="card-luxury text-center animate-fade-in">
              <div className="w-24 h-24 bg-metria-emerald/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone size={48} className="text-metria-emerald" />
              </div>
              
              <h2 className="font-serif text-gold text-2xl mb-3">Precisa de Atendimento?</h2>
              <p className="text-metria-white/70 mb-8 leading-relaxed">
                Nossa equipe estará à sua disposição em instantes. 
                Clique no botão abaixo para solicitar atendimento.
              </p>
              
              <button
                onClick={handleCallWaiter}
                className="w-full bg-metria-emerald text-white py-4 rounded-xl font-semibold text-lg hover:bg-metria-emerald/90 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
              >
                <Phone size={24} />
                Chamar Garçom
              </button>
              
              <p className="text-metria-white/50 text-sm mt-4">
                Tempo médio de atendimento: 2-3 minutos
              </p>
            </div>
          )}

          {/* Calling State */}
          {callStatus === 'calling' && (
            <div className="card-luxury text-center animate-bounce-in">
              <div className="w-24 h-24 bg-metria-emerald/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Phone size={48} className="text-metria-emerald animate-bounce" />
              </div>
              
              <h2 className="font-serif text-gold text-2xl mb-3">Enviando Chamada...</h2>
              <p className="text-metria-white/70">
                Aguarde um momento enquanto notificamos nossa equipe.
              </p>
              
              <div className="flex justify-center mt-6">
                <div className="animate-spin w-8 h-8 border-4 border-metria-emerald border-t-transparent rounded-full"></div>
              </div>
            </div>
          )}

          {/* Sent State */}
          {callStatus === 'sent' && (
            <div className="card-luxury text-center animate-fade-in">
              <div className="w-24 h-24 bg-metria-emerald rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <CheckCircle size={48} className="text-white" />
              </div>
              
              <h2 className="font-serif text-metria-emerald text-2xl mb-3">Chamado Enviado!</h2>
              <p className="text-metria-white/70 mb-6">
                Seu chamado foi enviado à equipe. Um garçom estará com você em breve.
              </p>
              
              {/* Wait Time Counter */}
              <div className="bg-metria-black/30 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock size={20} className="text-gold" />
                  <span className="text-gold font-mono text-2xl font-bold">
                    {formatTime(waitTime)}
                  </span>
                </div>
                <p className="text-metria-white/60 text-sm">
                  Tempo estimado de espera
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="bg-metria-emerald/10 border border-metria-emerald/30 rounded-lg p-3">
                  <p className="text-metria-emerald text-sm font-medium">
                    💡 Fique à vontade! Você será atendido em sua mesa.
                  </p>
                </div>
                
                <button
                  onClick={handleCancelCall}
                  className="w-full bg-transparent border-2 border-red-500/50 text-red-400 py-3 rounded-lg font-medium hover:border-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancelar Chamada
                </button>
              </div>
            </div>
          )}

          {/* Cancelled State */}
          {callStatus === 'cancelled' && (
            <div className="card-luxury text-center animate-fade-in">
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <X size={48} className="text-red-400" />
              </div>
              
              <h2 className="font-serif text-red-400 text-2xl mb-3">Chamada Cancelada</h2>
              <p className="text-metria-white/70">
                Sua chamada foi cancelada com sucesso.
              </p>
            </div>
          )}

          {/* Quick Actions */}
          {callStatus === 'idle' && (
            <div className="mt-6 space-y-3">
              <div className="text-center">
                <p className="text-metria-white/60 text-sm mb-4">Ou acesse rapidamente:</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate(`/menu?sessionId=${sessionId}&token=${token}`)}
                  className="bg-transparent border border-gold/30 text-gold py-3 rounded-lg text-sm hover:border-gold transition-all"
                >
                  📋 Cardápio
                </button>
                <button
                  onClick={() => navigate(`/tray?sessionId=${sessionId}&token=${token}`)}
                  className="bg-transparent border border-gold/30 text-gold py-3 rounded-lg text-sm hover:border-gold transition-all"
                >
                  🍽️ Meu Prato
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallWaiterPage;