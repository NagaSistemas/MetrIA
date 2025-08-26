import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimeCounterProps {
  startTime: Date;
  slaExceeded?: boolean;
}

const TimeCounter: React.FC<TimeCounterProps> = ({ startTime, slaExceeded }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const getTimeColor = () => {
    if (slaExceeded || elapsed >= 20) return 'text-red-500 animate-pulse';
    if (elapsed >= 10) return 'text-yellow-500';
    return 'text-green-500';
  };

  const formatTime = () => {
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}h` : `${minutes}min`;
  };

  return (
    <div className={`flex items-center gap-1 text-sm font-mono ${getTimeColor()}`}>
      <Clock size={12} />
      {formatTime()}
    </div>
  );
};

export default TimeCounter;