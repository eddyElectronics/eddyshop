'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/products';

export interface CartItem {
  id: string;
  productCode?: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  category: string;
  quantity: number;
  isUsed?: boolean;
}

interface CartContextType {
  items: CartItem[];
  // New API
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  totalItems: number;
  totalPrice: number;
  // Legacy API (for backwards compatibility)
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // โหลด cart จาก localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        setItems([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // บันทึก cart ลง localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // New API: addItem - ไม่เพิ่มซ้ำถ้ามีสินค้าอยู่แล้ว
  const addItem = (product: Product) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.id === product.id);
      if (existingItem) {
        // สินค้านี้มีอยู่แล้วในตะกร้า - ไม่เพิ่มซ้ำ
        return prev;
      }
      const newItem: CartItem = {
        id: product.id,
        productCode: product.productCode,
        name: product.name,
        price: product.price,
        image: product.image,
        images: product.images,
        category: product.category,
        quantity: 1,
        isUsed: product.isUsed,
      };
      return [...prev, newItem];
    });
  };

  // Legacy API: addToCart - ไม่เพิ่มซ้ำถ้ามีสินค้าอยู่แล้ว
  const addToCart = (item: Omit<CartItem, 'quantity'>, _quantity = 1) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        // สินค้านี้มีอยู่แล้วในตะกร้า - ไม่เพิ่มซ้ำ
        return prev;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // New API: removeItem
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Legacy API: removeFromCart
  const removeFromCart = removeItem;

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (id: string) => {
    return items.some(item => item.id === id);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
