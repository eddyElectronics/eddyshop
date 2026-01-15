import { Product, Category, ProductFilters } from '@/src/types';
import { API_CONFIG } from '@/src/config/constants';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Products
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.featured) params.set('featured', 'true');
    
    const query = params.toString();
    return this.request<Product[]>(`/api/products${query ? `?${query}` : ''}`);
  }

  async getProductById(id: string): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.getProducts({ featured: true });
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.getProducts({ search: query });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories');
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.request<Category>(`/api/categories/${id}`);
  }
}

// Singleton instance
export const apiService = new ApiService();

// Export individual functions for convenience
export const getProducts = (filters?: ProductFilters) => apiService.getProducts(filters);
export const getProductById = (id: string) => apiService.getProductById(id);
export const getFeaturedProducts = () => apiService.getFeaturedProducts();
export const searchProducts = (query: string) => apiService.searchProducts(query);
export const getCategories = () => apiService.getCategories();
export const getCategoryById = (id: string) => apiService.getCategoryById(id);
