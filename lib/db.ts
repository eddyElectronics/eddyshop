import { Product } from './products';
import { Category } from './categories';
import fs from 'fs';
import path from 'path';

// In-memory storage for production (since Vercel serverless doesn't persist files)
let productsCache: Product[] | null = null;
let categoriesCache: Category[] | null = null;

// ===== PRODUCTS =====

export async function getProducts(): Promise<Product[]> {
  // Return from cache if available
  if (productsCache !== null) {
    return productsCache;
  }
  
  try {
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const products = JSON.parse(fileContents);
    productsCache = products;
    return products;
  } catch (error) {
    console.error('Read products error:', error);
    return [];
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  // Update cache
  productsCache = products;
  
  try {
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
  } catch (error) {
    console.error('Save products error:', error);
    // In serverless, file write may fail but cache still works
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
  
  const existingProduct = products[index];
  if (!existingProduct) return null;
  
  const updatedProduct: Product = { ...existingProduct, ...updates, id: existingProduct.id };
  products[index] = updatedProduct;
  await saveProducts(products);
  return updatedProduct;
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
  // Return from cache if available
  if (categoriesCache !== null) {
    return categoriesCache;
  }
  
  try {
    const filePath = path.join(process.cwd(), 'data', 'categories.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const categories = JSON.parse(fileContents);
    categoriesCache = categories;
    return categories;
  } catch (error) {
    console.error('Read categories error:', error);
    return [];
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  // Update cache
  categoriesCache = categories;
  
  try {
    const filePath = path.join(process.cwd(), 'data', 'categories.json');
    fs.writeFileSync(filePath, JSON.stringify(categories, null, 2), 'utf8');
  } catch (error) {
    console.error('Save categories error:', error);
    // In serverless, file write may fail but cache still works
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
  
  const existingCategory = categories[index];
  if (!existingCategory) return null;
  
  const updatedCategory: Category = { ...existingCategory, ...updates, id: existingCategory.id };
  categories[index] = updatedCategory;
  await saveCategories(categories);
  return updatedCategory;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const categories = await getCategories();
  const index = categories.findIndex(c => c.id === id);
  
  if (index === -1) return false;
  
  categories.splice(index, 1);
  await saveCategories(categories);
  return true;
}
