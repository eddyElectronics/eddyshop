import fs from 'fs';
import path from 'path';

export interface Product {
  id: string;
  productCode: string;  // รหัสสินค้า 3 หลัก
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;  // รูปหลัก (backward compatible)
  images?: string[];  // รูปภาพหลายรูป
  stock?: number;  // optional - ไม่บังคับ
  featured: boolean;
  isUsed?: boolean;  // true = มือสอง, false/undefined = ของใหม่
}

// Helper function เพื่อดึงรูปทั้งหมดของสินค้า
export function getProductImages(product: Product): string[] {
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  return product.image ? [product.image] : [];
}

const dataFilePath = path.join(process.cwd(), 'data', 'products.json');

export function getProducts(): Product[] {
  const fileContents = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(fileContents);
}

export function getProductById(id: string): Product | undefined {
  const products = getProducts();
  return products.find(product => product.id === id);
}

export function getFeaturedProducts(): Product[] {
  const products = getProducts();
  return products.filter(product => product.featured);
}

export function getProductsByCategory(category: string): Product[] {
  const products = getProducts();
  return products.filter(product => product.category === category);
}

export function getCategories(): string[] {
  const products = getProducts();
  const categories = [...new Set(products.map(product => product.category))];
  return categories;
}

export function searchProducts(query: string): Product[] {
  const products = getProducts();
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    product =>
      product.productCode?.toLowerCase().includes(lowercaseQuery) ||
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
  );
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(price);
}
