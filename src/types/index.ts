// Product Types
export interface Product {
  id: string;
  productCode?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  images?: string[];
  stock?: number;
  featured?: boolean;
  isUsed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Cart Types
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

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface CartActions {
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  // Legacy aliases for backwards compatibility
  addToCart?: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart?: (id: string) => void;
}

export type CartContextType = CartState & CartActions;

// View Types
export type ViewType = 'home' | 'products' | 'cart';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Filter Types
export interface ProductFilters {
  category?: string;
  search?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
