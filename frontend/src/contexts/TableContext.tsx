import React, { createContext, useContext, useState } from 'react';
import type { TableSession, MenuItem, OrderItem } from '../../../shared/types';

interface TableContextType {
  session: TableSession | null;
  menu: MenuItem[];
  cart: OrderItem[];
  addToCart: (item: MenuItem, quantity: number, notes?: string) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
  loadSession: (restaurantId: string, tableId: string, token: string) => Promise<void>;
  loadSessionById: (sessionId: string, token: string) => Promise<void>;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
};

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<TableSession | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);

  const addToCart = (item: MenuItem, quantity: number, notes?: string) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.menuItemId === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.menuItemId === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prev, { menuItemId: item.id, quantity, notes, price: item.price }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const loadSession = async (restaurantId: string, tableId: string, token: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/session/${restaurantId}/${tableId}?token=${token}`);
      const data = await response.json();
      setSession(data.session);
      setMenu(data.menu);
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const loadSessionById = async (sessionId: string, token: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/session/by-id/${sessionId}?token=${token}`);
      const data = await response.json();
      setSession(data.session);
      setMenu(data.menu);
    } catch (error) {
      console.error('Error loading session by ID:', error);
    }
  };

  return (
    <TableContext.Provider value={{
      session,
      menu,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      loadSession,
      loadSessionById
    }}>
      {children}
    </TableContext.Provider>
  );
};