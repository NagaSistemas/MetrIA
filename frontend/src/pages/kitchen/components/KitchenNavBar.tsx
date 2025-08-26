import React from 'react';
import { ChefHat, ClipboardList, Phone, Plus, LogOut } from 'lucide-react';

interface KitchenNavBarProps {
  activeTab: 'orders' | 'calls' | 'adjustments';
  counts: {
    orders: number;
    calls: number;
    adjustments: number;
  };
  onTabChange: (tab: 'orders' | 'calls' | 'adjustments') => void;
  onLogout: () => void;
}

const KitchenNavBar: React.FC<KitchenNavBarProps> = ({
  activeTab,
  counts,
  onTabChange,
  onLogout
}) => {
  const tabs = [
    { 
      id: 'orders' as const, 
      label: 'Pedidos', 
      icon: ClipboardList, 
      count: counts.orders 
    },
    { 
      id: 'calls' as const, 
      label: 'Chamados', 
      icon: Phone, 
      count: counts.calls 
    },
    { 
      id: 'adjustments' as const, 
      label: 'Complementos', 
      icon: Plus, 
      count: counts.adjustments 
    }
  ];

  return (
    <nav className="bg-metria-gray border-b border-gold/30 px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <ChefHat className="text-gold" size={24} />
          <h1 className="logo-metria text-2xl">MetrIA</h1>
          <span className="text-metria-white/60 text-sm">Cozinha</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gold text-metria-black font-semibold'
                    : 'text-metria-white/70 hover:text-gold hover:bg-metria-black/30'
                }`}
              >
                <Icon size={18} />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? 'bg-metria-black text-gold'
                      : 'bg-gold text-metria-black'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-metria-white/70 hover:text-red-400 transition-all"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </nav>
  );
};

export default KitchenNavBar;