import React from 'react';
import { AlertTriangle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import TimeCounter from './TimeCounter';

interface OrderCardProps {
  orderId: string;
  tableNumber: string;
  status: string;
  items: Array<{ name: string; quantity: number }>;
  createdAt: Date;
  slaExceeded: boolean;
  onStatusChange: (orderId: string, newStatus: string) => void;
  onClick: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  orderId,
  tableNumber,
  status,
  items,
  createdAt,
  slaExceeded,
  onStatusChange,
  onClick
}) => {
  const displayItems = items.slice(0, 3);
  const remainingCount = items.length - 3;

  const getNextStatus = () => {
    const statusFlow = ['PAID', 'PREPARING', 'READY', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(status);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  const getPrevStatus = () => {
    const statusFlow = ['PAID', 'PREPARING', 'READY', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(status);
    return currentIndex > 0 ? statusFlow[currentIndex - 1] : null;
  };

  return (
    <div 
      className={`card-luxury cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
        slaExceeded ? 'border-red-500 border-2' : ''
      } ${status === 'PAID' ? 'animate-pulse-gold' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gold text-2xl font-bold">Mesa {tableNumber}</h3>
        <TimeCounter startTime={createdAt} slaExceeded={slaExceeded} />
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {displayItems.map((item, index) => (
          <div key={index} className="text-metria-white/80 text-sm">
            {item.quantity}x {item.name}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-metria-white/60 text-sm">
            ...+{remainingCount} itens
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex gap-2 mb-3">
        <StatusBadge status={status} />
        {slaExceeded && (
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs flex items-center gap-1">
            <AlertTriangle size={12} />
            Atrasado
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-2">
        {getPrevStatus() && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(orderId, getPrevStatus()!);
            }}
            className="flex-1 py-2 px-3 border border-metria-white/30 text-metria-white/70 rounded text-sm hover:border-metria-white/50 transition-all"
          >
            Voltar
          </button>
        )}
        {getNextStatus() && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(orderId, getNextStatus()!);
            }}
            className="flex-1 py-2 px-3 border border-gold text-gold rounded text-sm hover:bg-gold hover:text-metria-black transition-all"
          >
            Avançar
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;