'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CartItem, CartContextType, Product } from '@/src/types';
import { cartService } from '@/src/services';

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedItems = cartService.getItems();
    setItems(savedItems);
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage when items change
  useEffect(() => {
    if (isLoaded) {
      cartService.saveItems(items);
    }
  }, [items, isLoaded]);

  const addItem = useCallback((product: Product) => {
    setItems(prev => cartService.addItem(prev, product));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => cartService.removeItem(prev, id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems(prev => cartService.updateQuantity(prev, id, quantity));
  }, []);

  const clearCart = useCallback(() => {
    setItems(cartService.clearItems());
  }, []);

  const totalItems = cartService.getTotalItems(items);
  const totalPrice = cartService.getTotalPrice(items);

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
