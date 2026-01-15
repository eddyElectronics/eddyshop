import { NextRequest, NextResponse } from 'next/server';
import { getProductById, getProducts, saveProducts } from '@/lib/db';
import { Product } from '@/lib/products';

// GET - ดึงสินค้าตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('GET product error:', error);
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
    const products = await getProducts();
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
      productCode: body.productCode ?? products[index].productCode ?? '',
      name: body.name ?? products[index].name,
      description: body.description ?? products[index].description,
      price: body.price !== undefined ? Number(body.price) : products[index].price,
      category: body.category ?? products[index].category,
      image: images ? images[0] : products[index].image,
      images: images ?? products[index].images,
      stock: body.stock !== undefined ? Number(body.stock) : products[index].stock,
      featured: body.featured !== undefined ? body.featured : products[index].featured,
      isUsed: body.isUsed !== undefined ? body.isUsed : products[index].isUsed,
    };
    
    products[index] = updatedProduct;
    await saveProducts(products);
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('PUT product error:', error);
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
    const products = await getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    products.splice(index, 1);
    await saveProducts(products);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
