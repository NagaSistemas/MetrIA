import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, Edit3, Sparkles } from 'lucide-react';
import { useTable } from '../../contexts/TableContext';

const TrayPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const token = searchParams.get('token');
  
  const { cart, session, removeFromCart, clearCart } = useTable();
  const [voucher, setVoucher] = useState('');
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.1; // 10% service fee
  const taxes = subtotal * taxRate;
  const voucherDiscount = 0; // TODO: Implement voucher logic
  const total = subtotal + taxes - voucherDiscount;

  const updateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(menuItemId);
    } else {
      const item = cart.find(cartItem => cartItem.menuItemId === menuItemId);
      if (item) {
        // TODO: Update quantity logic
        console.log('Update quantity:', menuItemId, newQuantity);
      }
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
            <h1 className="font-serif text-gold text-xl">Meu Prato</h1>
            <div className="w-16"></div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="card-luxury text-center max-w-md">
            <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🍽️</span>
            </div>
            <h2 className="font-serif text-gold text-2xl mb-3">Seu prato está vazio</h2>
            <p className="text-metria-white/70 mb-6">
              Que tal uma sugestão do maître?
            </p>
            <div className="space-y-3">
              <button
                onClick={handleAskSuggestion}
                className="w-full btn-gold flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                Pedir Sugestão
              </button>
              <button
                onClick={() => navigate(`/menu?sessionId=${sessionId}&token=${token}`)}
                className="w-full bg-transparent border border-gold/30 text-gold py-3 rounded-lg hover:border-gold transition-all"
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
          <h1 className="font-serif text-gold text-xl">Meu Prato</h1>
          <button
            onClick={clearCart}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-4 pb-32">
        {/* Items List */}
        <div className="flex-1 space-y-4">
          {cart.map((item, index) => (
            <div key={`${item.menuItemId}-${index}`} className="card-luxury animate-fade-in">
              <div className="flex gap-4">
                {/* Item Image */}
                <div className="w-16 h-16 bg-metria-black rounded-lg overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-gold/20 flex items-center justify-center text-gold">
                    🍽️
                  </div>
                </div>

                {/* Item Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-gold text-lg">Item {item.menuItemId}</h3>
                    <button className="text-metria-white/60 hover:text-gold transition-colors">
                      <Edit3 size={16} />
                    </button>
                  </div>

                  {/* Modifiers */}
                  {item.notes && (
                    <p className="text-metria-white/60 text-sm mb-2">
                      📝 {item.notes}
                    </p>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gold/30 text-gold flex items-center justify-center hover:bg-gold hover:text-metria-black transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-gold font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gold/30 text-gold flex items-center justify-center hover:bg-gold hover:text-metria-black transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-gold font-bold">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-metria-white/60 text-xs">
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
            <div className="card-luxury border-2 border-metria-emerald/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-metria-emerald rounded-full flex items-center justify-center">
                  <Plus size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-metria-emerald text-lg">Pedido Adicional</h3>
                  <p className="text-metria-white/70 text-sm">
                    Sua mesa já tem um pedido confirmado. Este será um complemento.
                  </p>
                </div>
              </div>
              <button className="w-full bg-metria-emerald/20 border border-metria-emerald/30 text-metria-emerald py-2 rounded-lg text-sm">
                Pedir Mais
              </button>
            </div>
          )}
        </div>

        {/* Summary Box */}
        <div className="lg:w-80">
          <div className="card-luxury sticky top-24">
            <h3 className="font-serif text-gold text-xl mb-4">Resumo</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-metria-white/70">Subtotal</span>
                <span className="text-metria-white">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-metria-white/70">Taxa de serviço (10%)</span>
                <span className="text-metria-white">R$ {taxes.toFixed(2)}</span>
              </div>
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Desconto</span>
                  <span>-R$ {voucherDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gold/20 pt-3">
                <div className="flex justify-between">
                  <span className="font-serif text-gold text-lg">Total</span>
                  <span className="font-bold text-gold text-xl">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Voucher */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucher}
                  onChange={(e) => setVoucher(e.target.value)}
                  placeholder="Código do voucher"
                  className="flex-1 bg-metria-black border border-gold/30 rounded-lg px-3 py-2 text-metria-white placeholder-metria-white/50 focus:border-gold focus:outline-none"
                />
                <button
                  onClick={() => setIsApplyingVoucher(true)}
                  disabled={!voucher || isApplyingVoucher}
                  className="bg-transparent border border-gold/30 text-gold px-4 py-2 rounded-lg hover:border-gold transition-all disabled:opacity-50"
                >
                  Aplicar
                </button>
              </div>
            </div>

            {/* Policy Info */}
            <div className="bg-metria-black/30 rounded-lg p-3 mb-6">
              <p className="text-metria-white/60 text-xs leading-relaxed">
                💡 Seu pedido será enviado diretamente à cozinha após a confirmação do pagamento.
              </p>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full btn-gold py-4 text-lg font-semibold"
            >
              Finalizar e Pagar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrayPage;