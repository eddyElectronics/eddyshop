import { CartItem, Product } from '@/src/types';
import { STORAGE_KEYS } from '@/src/config/constants';
import { safeJsonParse } from '@/src/utils/helpers';

class CartService {
  private storageKey = STORAGE_KEYS.cart;

  /**
   * Get cart items from localStorage
   */
  getItems(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.storageKey);
    return stored ? safeJsonParse<CartItem[]>(stored, []) : [];
  }

  /**
   * Save cart items to localStorage
   */
  saveItems(items: CartItem[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  /**
   * Add product to cart
   */
  addItem(items: CartItem[], product: Product): CartItem[] {
    const existingItem = items.find(item => item.id === product.id);
    
    if (existingItem) {
      return items.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
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

    return [...items, newItem];
  }

  /**
   * Remove item from cart
   */
  removeItem(items: CartItem[], id: string): CartItem[] {
    return items.filter(item => item.id !== id);
  }

  /**
   * Update item quantity
   */
  updateQuantity(items: CartItem[], id: string, quantity: number): CartItem[] {
    if (quantity <= 0) {
      return this.removeItem(items, id);
    }
    return items.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
  }

  /**
   * Clear all items
   */
  clearItems(): CartItem[] {
    return [];
  }

  /**
   * Calculate total items
   */
  getTotalItems(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Calculate total price
   */
  getTotalPrice(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}

export const cartService = new CartService();
