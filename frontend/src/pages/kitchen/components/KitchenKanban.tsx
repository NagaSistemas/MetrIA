import React from 'react';
import OrderCard from './OrderCard';

interface Order {
  id: string;
  tableId: string;
  status: string;
  items: Array<{ name: string; quantity: number }>;
  createdAt: Date;
  slaExceeded: boolean;
}

interface KitchenKanbanProps {
  orders: Order[];
  onMoveOrder: (orderId: string, newStatus: string) => void;
  onOrderClick: (order: Order) => void;
}

const KitchenKanban: React.FC<KitchenKanbanProps> = ({
  orders,
  onMoveOrder,
  onOrderClick
}) => {
  const columns = [
    { status: 'PAID', title: 'Pago', color: 'border-gold' },
    { status: 'PREPARING', title: 'Em Preparo', color: 'border-blue-500' },
    { status: 'READY', title: 'Pronto', color: 'border-green-500' },
    { status: 'DELIVERED', title: 'Entregue', color: 'border-metria-white/30' }
  ];

  const getOrdersByStatus = (status: string) => 
    orders.filter(order => order.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
      {columns.map(column => {
        const columnOrders = getOrdersByStatus(column.status);
        
        return (
          <div key={column.status} className={`bg-metria-gray/50 rounded-lg border-t-4 ${column.color} p-4`}>
            {/* Column Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-gold text-lg">{column.title}</h3>
              <span className="bg-gold text-metria-black px-2 py-1 rounded-full text-sm font-bold">
                {columnOrders.length}
              </span>
            </div>

            {/* Orders */}
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {columnOrders.map(order => (
                <OrderCard
                  key={order.id}
                  orderId={order.id}
                  tableNumber={order.tableId}
                  status={order.status}
                  items={order.items}
                  createdAt={order.createdAt}
                  slaExceeded={order.slaExceeded}
                  onStatusChange={onMoveOrder}
                  onClick={() => onOrderClick(order)}
                />
              ))}
              
              {columnOrders.length === 0 && (
                <div className="text-center py-8 text-metria-white/50">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p>Nenhum pedido</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KitchenKanban;