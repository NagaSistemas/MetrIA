export interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  tables: Table[];
  menu: MenuItem[];
  aiPrompt: string;
}

export interface Table {
  id: string;
  number: number;
  restaurantId: string;
  qrCode: string;
  currentSession?: TableSession;
}

export interface TableSession {
  id: string;
  tableId: string;
  restaurantId: string;
  status: 'OPEN' | 'ORDERING' | 'PAYING' | 'PAID' | 'CLOSED';
  token: string;
  createdAt: Date;
  orders: Order[];
  waiterCalls: WaiterCall[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryIcon?: string;
  image?: string;
  available: boolean;
}

export interface Order {
  id: string;
  sessionId: string;
  items: OrderItem[];
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentId?: string;
  isExtra: boolean;
  createdAt: Date;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
  price: number;
  name?: string;
  image?: string;
}

export interface WaiterCall {
  id: string;
  sessionId: string;
  tableNumber: number;
  message: string;
  status: 'PENDING' | 'RESOLVED';
  createdAt: Date;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: 'PIX' | 'CARD';
}

export interface PaymentResponse {
  paymentId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  pixCode?: string;
  paymentUrl?: string;
}