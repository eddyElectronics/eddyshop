import { put, list, del } from '@vercel/blob';
import { Product } from './products';
import { Category } from './categories';
import fs from 'fs';
import path from 'path';

const PRODUCTS_BLOB = 'products.json';
const CATEGORIES_BLOB = 'categories.json';

// Check if running on Vercel
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// In-memory cache (only for development - not reliable in serverless production)
let productsCache: Product[] | null = null;
let categoriesCache: Category[] | null = null;

// ===== BLOB HELPERS =====

async function readBlobJson<T>(blobName: string): Promise<T | null> {
  try {
    console.log(`Reading blob: ${blobName}`);
    const { blobs } = await list();
    console.log(`Found ${blobs.length} blobs`);
    
    const blob = blobs.find(b => b.pathname === blobName || b.pathname.endsWith(blobName));
    if (!blob) {
      console.log(`Blob ${blobName} not found`);
      return null;
    }
    
    console.log(`Fetching blob from: ${blob.url}`);
    const response = await fetch(blob.url, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`Fetch blob failed: ${response.status}`);
      return null;
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`Read blob ${blobName} error:`, error);
    return null;
  }
}

async function writeBlobJson<T>(blobName: string, data: T): Promise<void> {
  console.log(`Writing blob: ${blobName}`);
  
  try {
    // Delete old blob first
    try {
      const { blobs } = await list();
      const oldBlob = blobs.find(b => b.pathname === blobName || b.pathname.endsWith(blobName));
      if (oldBlob) {
        console.log(`Deleting old blob: ${oldBlob.url}`);
        await del(oldBlob.url);
      }
    } catch (delError) {
      console.warn(`Delete old blob ${blobName} warning:`, delError);
    }
    
    // Write new blob
    const result = await put(blobName, JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
    console.log(`Successfully wrote blob: ${blobName}, url: ${result.url}`);
  } catch (error) {
    console.error(`Write blob ${blobName} error:`, error);
    throw error;
  }
}

// ===== PRODUCTS =====

export async function getProducts(): Promise<Product[]> {
  // In production, always read fresh from Blob (serverless has multiple instances)
  if (isProduction) {
    // Try to read from Blob
    const products = await readBlobJson<Product[]>(PRODUCTS_BLOB);
    if (products) {
      return products;
    }
    
    // Fallback to JSON file (for initial data)
    try {
      const filePath = path.join(process.cwd(), 'data', 'products.json');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const localProducts = JSON.parse(fileContents) as Product[];
      
      // Initialize blob with local data
      await writeBlobJson(PRODUCTS_BLOB, localProducts);
      
      return localProducts;
    } catch {
      return [];
    }
  } else {
    // Development - use JSON file with cache
    if (productsCache !== null) {
      return productsCache;
    }
    try {
      const filePath = path.join(process.cwd(), 'data', 'products.json');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const products = JSON.parse(fileContents) as Product[];
      productsCache = products;
      return products;
    } catch (error) {
      console.error('Read products error:', error);
      return [];
    }
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  // Update cache
  productsCache = products;
  
  if (isProduction) {
    // Save to Blob
    await writeBlobJson(PRODUCTS_BLOB, products);
  } else {
    // Development - save to JSON file
    try {
      const filePath = path.join(process.cwd(), 'data', 'products.json');
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
    } catch (error) {
      console.error('Save products error:', error);
    }
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
  // In production, always read fresh from Blob (serverless has multiple instances)
  if (isProduction) {
    // Try to read from Blob
    const categories = await readBlobJson<Category[]>(CATEGORIES_BLOB);
    if (categories) {
      return categories;
    }
    
    // Fallback to JSON file (for initial data)
    try {
      const filePath = path.join(process.cwd(), 'data', 'categories.json');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const localCategories = JSON.parse(fileContents) as Category[];
      
      // Initialize blob with local data
      await writeBlobJson(CATEGORIES_BLOB, localCategories);
      
      return localCategories;
    } catch {
      return [];
    }
  } else {
    // Development - use JSON file with cache
    if (categoriesCache !== null) {
      return categoriesCache;
    }
    try {
      const filePath = path.join(process.cwd(), 'data', 'categories.json');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const categories = JSON.parse(fileContents) as Category[];
      categoriesCache = categories;
      return categories;
    } catch (error) {
      console.error('Read categories error:', error);
      return [];
    }
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  // Update cache
  categoriesCache = categories;
  
  if (isProduction) {
    // Save to Blob
    await writeBlobJson(CATEGORIES_BLOB, categories);
  } else {
    // Development - save to JSON file
    try {
      const filePath = path.join(process.cwd(), 'data', 'categories.json');
      fs.writeFileSync(filePath, JSON.stringify(categories, null, 2), 'utf8');
    } catch (error) {
      console.error('Save categories error:', error);
    }
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
