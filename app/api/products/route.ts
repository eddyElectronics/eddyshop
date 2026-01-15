import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Product } from '@/lib/products';

const dataFilePath = path.join(process.cwd(), 'data', 'products.json');

function readProducts(): Product[] {
  const fileContents = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(fileContents);
}

function writeProducts(products: Product[]): void {
  fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2), 'utf8');
}

// GET - ดึงสินค้าทั้งหมด
export async function GET() {
  try {
    const products = readProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
  }
}

// POST - เพิ่มสินค้าใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const products = readProducts();
    
    // รองรับทั้ง images array และ image เดี่ยว
    const images = body.images || (body.image ? [body.image] : []);
    
    const newProduct: Product = {
      id: Date.now().toString(),
      productCode: body.productCode || '',
      name: body.name,
      description: body.description,
      price: Number(body.price),
      category: body.category,
      image: images[0] || '/images/products/placeholder.jpg',
      images: images.length > 0 ? images : undefined,
      stock: Number(body.stock),
      featured: body.featured || false,
    };
    
    products.push(newProduct);
    writeProducts(products);
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
