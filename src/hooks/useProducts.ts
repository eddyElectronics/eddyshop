import { useState, useEffect, useCallback } from 'react';
import { Product, Category, ProductFilters } from '@/src/types';
import { getProducts, getCategories } from '@/src/services';

interface UseProductsResult {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseProductsOptions {
  filters?: ProductFilters;
  autoFetch?: boolean;
}

/**
 * Hook for fetching and managing products and categories
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const { filters, autoFetch = true } = options;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsData, categoriesData] = await Promise.all([
        getProducts(filters),
        getCategories(),
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    products,
    categories,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for filtering products
 */
export function useFilteredProducts(
  products: Product[],
  filters: ProductFilters
): Product[] {
  const [filtered, setFiltered] = useState<Product[]>([]);

  useEffect(() => {
    let result = [...products];

    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.productCode?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.featured) {
      result = result.filter(p => p.featured);
    }

    if (filters.minPrice !== undefined) {
      result = result.filter(p => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter(p => p.price <= filters.maxPrice!);
    }

    setFiltered(result);
  }, [products, filters]);

  return filtered;
}

/**
 * Hook for featured products
 */
export function useFeaturedProducts(products: Product[]): Product[] {
  return products.filter(p => p.featured);
}
