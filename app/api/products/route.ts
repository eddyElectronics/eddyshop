import { NextRequest, NextResponse } from 'next/server';
import { getProducts, addProduct } from '@/lib/db';
import { Product } from '@/lib/products';

// Force dynamic - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - ดึงสินค้าทั้งหมด
export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('GET products error:', error);
    return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
  }
}

// POST - เพิ่มสินค้าใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
      video: body.video || undefined,
      stock: body.stock !== undefined ? Number(body.stock) : undefined,
      featured: body.featured || false,
      isUsed: body.isUsed || false,
      sold: body.sold || false,
    };
    
    await addProduct(newProduct);
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('POST product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
