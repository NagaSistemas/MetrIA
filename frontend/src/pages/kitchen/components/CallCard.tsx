import React from 'react';
import { Phone } from 'lucide-react';
import TimeCounter from './TimeCounter';

interface CallCardProps {
  callId: string;
  tableNumber: string;
  note?: string;
  createdAt: Date;
  status: 'PENDING' | 'ATTENDED';
  onAttend: (callId: string) => void;
}

const CallCard: React.FC<CallCardProps> = ({
  callId,
  tableNumber,
  note,
  createdAt,
  status,
  onAttend
}) => {
  return (
    <div className={`card-luxury transition-all duration-300 ${
      status === 'PENDING' ? 'border-gold animate-pulse-gold' : 'border-metria-white/30'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gold text-2xl font-bold flex items-center gap-2">
          <Phone size={20} />
          Mesa {tableNumber}
        </h3>
        <TimeCounter startTime={createdAt} />
      </div>

      {/* Note */}
      {note && (
        <div className="bg-metria-black/50 rounded p-2 mb-3">
          <p className="text-metria-white/80 text-sm italic">"{note}"</p>
        </div>
      )}

      {/* Status */}
      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          status === 'PENDING' 
            ? 'bg-gold/20 text-gold' 
            : 'bg-green-500/20 text-green-400'
        }`}>
          {status === 'PENDING' ? 'Pendente' : 'Atendido'}
        </span>

        {status === 'PENDING' && (
          <button
            onClick={() => onAttend(callId)}
            className="btn-gold px-4 py-2 text-sm"
          >
            Atender
          </button>
        )}
      </div>
    </div>
  );
};

export default CallCard;