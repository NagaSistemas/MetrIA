import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'PAID':
        return 'bg-gold/20 text-gold';
      case 'PREPARING':
        return 'bg-blue-500/20 text-blue-400';
      case 'READY':
        return 'bg-green-500/20 text-green-400';
      case 'DELIVERED':
        return 'bg-metria-white/20 text-metria-white/70';
      default:
        return 'bg-metria-white/20 text-metria-white/70';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'PAID':
        return 'Pago';
      case 'PREPARING':
        return 'Em Preparo';
      case 'READY':
        return 'Pronto';
      case 'DELIVERED':
        return 'Entregue';
      default:
        return status;
    }
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle()}`}>
      {getStatusText()}
    </span>
  );
};

export default StatusBadge;