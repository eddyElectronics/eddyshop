import { put, list, del } from '@vercel/blob';
import { Product } from './products';
import { Category } from './categories';
import fs from 'fs';
import path from 'path';

const PRODUCTS_BLOB = 'products.json';
const CATEGORIES_BLOB = 'categories.json';

// Check if running on Vercel
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Check if Blob token is available
const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

// In-memory cache for production (since we can't write to blob without token)
let productsCacheProduction: Product[] | null = null;
let categoriesCacheProduction: Category[] | null = null;

// In-memory cache (only for development - not reliable in serverless production)
let productsCache: Product[] | null = null;
let categoriesCache: Category[] | null = null;

// ===== BLOB HELPERS =====

async function readBlobJson<T>(blobName: string): Promise<T | null> {
  if (!hasBlobToken) {
    console.log(`No BLOB_READ_WRITE_TOKEN, skipping blob read for ${blobName}`);
    return null;
  }
  
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

async function writeBlobJson<T>(blobName: string, data: T): Promise<boolean> {
  if (!hasBlobToken) {
    console.log(`No BLOB_READ_WRITE_TOKEN, skipping blob write for ${blobName}`);
    return false;
  }
  
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
    return true;
  } catch (error) {
    console.error(`Write blob ${blobName} error:`, error);
    return false;
  }
}

// ===== PRODUCTS =====

export async function getProducts(): Promise<Product[]> {
  // In production
  if (isProduction) {
    // If we have blob token, try to read from Blob
    if (hasBlobToken) {
      const products = await readBlobJson<Product[]>(PRODUCTS_BLOB);
      if (products) {
        productsCacheProduction = products;
        return products;
      }
    }
    
    // If we have cache (from previous save in this instance), use it
    if (productsCacheProduction !== null) {
      return productsCacheProduction;
    }
    
    // Fallback to JSON file (for initial data)
    try {
      const filePath = path.join(process.cwd(), 'data', 'products.json');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const localProducts = JSON.parse(fileContents) as Product[];
      
      // Try to initialize blob with local data
      if (hasBlobToken) {
        await writeBlobJson(PRODUCTS_BLOB, localProducts);
      }
      
      productsCacheProduction = localProducts;
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
  // Update both caches
  productsCache = products;
  productsCacheProduction = products;
  
  if (isProduction) {
    // Try to save to Blob if token available
    if (hasBlobToken) {
      const success = await writeBlobJson(PRODUCTS_BLOB, products);
      if (!success) {
        console.log('Blob save failed, using in-memory cache only');
      }
    } else {
      console.log('No BLOB_READ_WRITE_TOKEN, using in-memory cache only');
    }
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
  // In production
  if (isProduction) {
    // If we have blob token, try to read from Blob
    if (hasBlobToken) {
      const categories = await readBlobJson<Category[]>(CATEGORIES_BLOB);
      if (categories) {
        categoriesCacheProduction = categories;
        return categories;
      }
    }
    
    // If we have cache (from previous save in this instance), use it
    if (categoriesCacheProduction !== null) {
      return categoriesCacheProduction;
    }
    
    // Fallback to JSON file (for initial data)
    try {
      const filePath = path.join(process.cwd(), 'data', 'categories.json');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const localCategories = JSON.parse(fileContents) as Category[];
      
      // Try to initialize blob with local data
      if (hasBlobToken) {
        await writeBlobJson(CATEGORIES_BLOB, localCategories);
      }
      
      categoriesCacheProduction = localCategories;
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
  console.log('saveCategories called, count:', categories.length);
  
  // Update both caches
  categoriesCache = categories;
  categoriesCacheProduction = categories;
  
  if (isProduction) {
    // Try to save to Blob if token available
    if (hasBlobToken) {
      console.log('Saving to Blob...');
      const success = await writeBlobJson(CATEGORIES_BLOB, categories);
      if (success) {
        console.log('Saved to Blob successfully');
      } else {
        console.log('Blob save failed, using in-memory cache only');
      }
    } else {
      console.log('No BLOB_READ_WRITE_TOKEN, using in-memory cache only');
    }
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
  console.log('addCategory called:', category);
  try {
    const categories = await getCategories();
    console.log('Current categories count:', categories.length);
    categories.push(category);
    await saveCategories(categories);
    console.log('Category saved successfully');
    return category;
  } catch (error) {
    console.error('addCategory error:', error);
    throw error;
  }
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
