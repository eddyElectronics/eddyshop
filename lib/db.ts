import { kv } from '@vercel/kv';
import { Product } from './products';
import { Category } from './categories';
import fs from 'fs';
import path from 'path';

const PRODUCTS_KEY = 'products';
const CATEGORIES_KEY = 'categories';

// ตรวจสอบว่าอยู่ใน production หรือไม่
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// ===== PRODUCTS =====

export async function getProducts(): Promise<Product[]> {
  if (isProduction) {
    try {
      const products = await kv.get<Product[]>(PRODUCTS_KEY);
      return products || [];
    } catch (error) {
      console.error('KV get products error:', error);
      return [];
    }
  } else {
    // Development - ใช้ JSON file
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  if (isProduction) {
    try {
      await kv.set(PRODUCTS_KEY, products);
    } catch (error) {
      console.error('KV set products error:', error);
      throw error;
    }
  } else {
    // Development - ใช้ JSON file
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.id === id) || null;
}

export async function addProduct(product: Product): Promise<Product> {
  const products = await getProducts();
  products.push(product);
  await saveProducts(products);
  return product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const products = await getProducts();
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  products[index] = { ...products[index], ...updates };
  await saveProducts(products);
  return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getProducts();
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) return false;
  
  products.splice(index, 1);
  await saveProducts(products);
  return true;
}

// ===== CATEGORIES =====

export async function getCategories(): Promise<Category[]> {
  if (isProduction) {
    try {
      const categories = await kv.get<Category[]>(CATEGORIES_KEY);
      return categories || [];
    } catch (error) {
      console.error('KV get categories error:', error);
      return [];
    }
  } else {
    // Development - ใช้ JSON file
    const filePath = path.join(process.cwd(), 'data', 'categories.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  if (isProduction) {
    try {
      await kv.set(CATEGORIES_KEY, categories);
    } catch (error) {
      console.error('KV set categories error:', error);
      throw error;
    }
  } else {
    // Development - ใช้ JSON file
    const filePath = path.join(process.cwd(), 'data', 'categories.json');
    fs.writeFileSync(filePath, JSON.stringify(categories, null, 2), 'utf8');
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find(c => c.id === id) || null;
}

export async function addCategory(category: Category): Promise<Category> {
  const categories = await getCategories();
  categories.push(category);
  await saveCategories(categories);
  return category;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const categories = await getCategories();
  const index = categories.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  categories[index] = { ...categories[index], ...updates };
  await saveCategories(categories);
  return categories[index];
}

export async function deleteCategory(id: string): Promise<boolean> {
  const categories = await getCategories();
  const index = categories.findIndex(c => c.id === id);
  
  if (index === -1) return false;
  
  categories.splice(index, 1);
  await saveCategories(categories);
  return true;
}

// ===== INIT DATA =====
// ใช้สำหรับ migrate ข้อมูลจาก JSON ไป KV ครั้งแรก
export async function initializeData(): Promise<void> {
  if (!isProduction) return;
  
  try {
    // ตรวจสอบว่ามีข้อมูลใน KV หรือยัง
    const existingProducts = await kv.get<Product[]>(PRODUCTS_KEY);
    
    if (!existingProducts || existingProducts.length === 0) {
      // อ่านจาก JSON และบันทึกลง KV
      const productsPath = path.join(process.cwd(), 'data', 'products.json');
      const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');
      
      if (fs.existsSync(productsPath)) {
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        await kv.set(PRODUCTS_KEY, products);
        console.log('Initialized products in KV');
      }
      
      if (fs.existsSync(categoriesPath)) {
        const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        await kv.set(CATEGORIES_KEY, categories);
        console.log('Initialized categories in KV');
      }
    }
  } catch (error) {
    console.error('Initialize data error:', error);
  }
}
