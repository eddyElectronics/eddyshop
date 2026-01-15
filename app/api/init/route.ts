import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

// POST - Initialize data from JSON to KV (one-time migration)
export async function POST() {
  try {
    // อ่านข้อมูลจาก JSON files
    const productsPath = path.join(process.cwd(), 'data', 'products.json');
    const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');
    
    let productsInitialized = false;
    let categoriesInitialized = false;
    
    if (fs.existsSync(productsPath)) {
      const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      await kv.set('products', products);
      productsInitialized = true;
    }
    
    if (fs.existsSync(categoriesPath)) {
      const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
      await kv.set('categories', categories);
      categoriesInitialized = true;
    }
    
    return NextResponse.json({ 
      success: true,
      productsInitialized,
      categoriesInitialized,
      message: 'Data initialized to KV successfully'
    });
  } catch (error) {
    console.error('Init error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to initialize: ${errorMessage}` }, { status: 500 });
  }
}

// GET - Check current KV data status
export async function GET() {
  try {
    const products = await kv.get('products');
    const categories = await kv.get('categories');
    
    return NextResponse.json({
      hasProducts: Array.isArray(products) && products.length > 0,
      productsCount: Array.isArray(products) ? products.length : 0,
      hasCategories: Array.isArray(categories) && categories.length > 0,
      categoriesCount: Array.isArray(categories) ? categories.length : 0,
    });
  } catch (error) {
    console.error('Check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to check: ${errorMessage}` }, { status: 500 });
  }
}
