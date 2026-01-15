import { describe, it, expect } from 'vitest';
import { cartService } from '../services/cart';
import { Product, CartItem } from '../types';

const mockProduct: Product = {
  id: '1',
  productCode: 'PROD001',
  name: 'Test Product',
  description: 'Test description',
  price: 100,
  category: 'Test',
  image: '/test.jpg',
};

describe('cartService', () => {
  describe('addItem', () => {
    it('adds new item to empty cart', () => {
      const items: CartItem[] = [];
      const result = cartService.addItem(items, mockProduct);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].quantity).toBe(1);
    });

    it('increments quantity for existing item', () => {
      const items: CartItem[] = [{
        ...mockProduct,
        quantity: 1,
      }];
      const result = cartService.addItem(items, mockProduct);
      
      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(2);
    });
  });

  describe('removeItem', () => {
    it('removes item from cart', () => {
      const items: CartItem[] = [{
        ...mockProduct,
        quantity: 1,
      }];
      const result = cartService.removeItem(items, '1');
      
      expect(result).toHaveLength(0);
    });

    it('does nothing for non-existent item', () => {
      const items: CartItem[] = [{
        ...mockProduct,
        quantity: 1,
      }];
      const result = cartService.removeItem(items, 'non-existent');
      
      expect(result).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('updates item quantity', () => {
      const items: CartItem[] = [{
        ...mockProduct,
        quantity: 1,
      }];
      const result = cartService.updateQuantity(items, '1', 5);
      
      expect(result[0].quantity).toBe(5);
    });

    it('removes item when quantity is 0', () => {
      const items: CartItem[] = [{
        ...mockProduct,
        quantity: 1,
      }];
      const result = cartService.updateQuantity(items, '1', 0);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('getTotalItems', () => {
    it('calculates total items', () => {
      const items: CartItem[] = [
        { ...mockProduct, id: '1', quantity: 2 },
        { ...mockProduct, id: '2', quantity: 3 },
      ];
      
      expect(cartService.getTotalItems(items)).toBe(5);
    });
  });

  describe('getTotalPrice', () => {
    it('calculates total price', () => {
      const items: CartItem[] = [
        { ...mockProduct, id: '1', price: 100, quantity: 2 },
        { ...mockProduct, id: '2', price: 50, quantity: 3 },
      ];
      
      expect(cartService.getTotalPrice(items)).toBe(350);
    });
  });
});
