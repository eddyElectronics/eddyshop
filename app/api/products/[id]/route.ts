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

// GET - ดึงสินค้าตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const products = readProducts();
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read product' }, { status: 500 });
  }
}

// PUT - แก้ไขสินค้า
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const products = readProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // รองรับทั้ง images array และ image เดี่ยว
    let images = body.images;
    if (!images && body.image) {
      images = [body.image];
    }
    
    const updatedProduct: Product = {
      ...products[index],
      name: body.name ?? products[index].name,
      description: body.description ?? products[index].description,
      price: body.price !== undefined ? Number(body.price) : products[index].price,
      category: body.category ?? products[index].category,
      image: images ? images[0] : products[index].image,
      images: images ?? products[index].images,
      stock: body.stock !== undefined ? Number(body.stock) : products[index].stock,
      featured: body.featured !== undefined ? body.featured : products[index].featured,
    };
    
    products[index] = updatedProduct;
    writeProducts(products);
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - ลบสินค้า
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const products = readProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    const deletedProduct = products.splice(index, 1)[0];
    writeProducts(products);
    
    return NextResponse.json({ message: 'Product deleted', product: deletedProduct });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
