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
    <div className="min-h-screen bg-metria-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-metria-black/95 backdrop-blur-sm border-b border-gold/20 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/tray?sessionId=${sessionId}&token=${token}`)}
            className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <h1 className="font-serif text-gold text-xl">Pagamento</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* Payment Method Tabs */}
        <div className="flex mb-6 bg-metria-gray rounded-lg p-1">
          <button
            onClick={() => setPaymentMethod('pix')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              paymentMethod === 'pix'
                ? 'bg-gold text-metria-black'
                : 'text-metria-white/70 hover:text-metria-white'
            }`}
          >
            PIX
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              paymentMethod === 'card'
                ? 'bg-gold text-metria-black'
                : 'text-metria-white/70 hover:text-metria-white'
            }`}
          >
            Cartão
          </button>
        </div>

        {/* PIX Payment */}
        {paymentMethod === 'pix' && (
          <div className="space-y-6">
            {pixData ? (
              <>
                {/* QR Code */}
                <div className="card-luxury text-center">
                  <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <QrCode size={180} className="text-metria-black" />
                  </div>
                  
                  {/* Timer */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Timer size={16} className="text-gold" />
                    <span className="text-gold font-mono text-lg">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  
                  <p className="text-metria-white/70 text-sm mb-4">
                    Escaneie o QR Code com seu app do banco
                  </p>
                </div>

                {/* Copy & Paste */}
                <div className="card-luxury">
                  <h3 className="font-serif text-gold text-lg mb-3">Copia e Cola</h3>
                  <div className="bg-metria-black rounded-lg p-3 mb-3">
                    <p className="text-metria-white/80 text-sm font-mono break-all">
                      {pixData.copyPaste}
                    </p>
                  </div>
                  <button
                    onClick={copyPixCode}
                    className="w-full btn-gold flex items-center justify-center gap-2"
                  >
                    <Copy size={18} />
                    Copiar Código PIX
                  </button>
                </div>
              </>
            ) : (
              <div className="card-luxury text-center">
                <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-metria-white/70">Gerando código PIX...</p>
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
        <div className="card-luxury mt-6">
          <h3 className="font-serif text-gold text-lg mb-3">Resumo do Pedido</h3>
          <div className="space-y-2 text-sm">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-metria-white/70">
                  {item.quantity}x Item {item.menuItemId}
                </span>
                <span className="text-metria-white">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-gold/20 pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span className="text-gold">Total</span>
                <span className="text-gold">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="flex items-center justify-center gap-2 mt-6 text-metria-white/60 text-xs">
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