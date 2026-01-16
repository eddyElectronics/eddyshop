import { NextResponse } from 'next/server';
import { getProducts, saveProducts } from '@/lib/db';

// Force dynamic - no caching
export const dynamic = 'force-dynamic';

// DELETE - ลบสินค้าที่มี local path (ไม่มีไฟล์จริงบน production)
export async function DELETE() {
  try {
    const products = await getProducts();
    
    // กรองเอาเฉพาะสินค้าที่มี Vercel Blob URL หรือไม่มีรูป
    const validProducts = products.filter(product => {
      const hasLocalImage = product.image && product.image.startsWith('/images/');
      const hasLocalVideo = product.video && product.video.startsWith('/images/');
      
      // เก็บสินค้าที่มี Vercel Blob URL เท่านั้น
      return !hasLocalImage && !hasLocalVideo;
    });
    
    const removedCount = products.length - validProducts.length;
    
    if (removedCount > 0) {
      await saveProducts(validProducts);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `ลบสินค้าที่มี local path ${removedCount} รายการ`,
      removedCount,
      remainingProducts: validProducts.length
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Failed to cleanup products' }, { status: 500 });
  }
}

// GET - ตรวจสอบสินค้าที่มี local path
export async function GET() {
  try {
    const products = await getProducts();
    
    const productsWithLocalPaths = products.filter(product => {
      const hasLocalImage = product.image && product.image.startsWith('/images/');
      const hasLocalVideo = product.video && product.video.startsWith('/images/');
      return hasLocalImage || hasLocalVideo;
    });
    
    return NextResponse.json({ 
      totalProducts: products.length,
      productsWithLocalPaths: productsWithLocalPaths.length,
      products: productsWithLocalPaths.map(p => ({
        id: p.id,
        name: p.name,
        image: p.image,
        video: p.video
      }))
    });
  } catch (error) {
    console.error('Check error:', error);
    return NextResponse.json({ error: 'Failed to check products' }, { status: 500 });
  }
}
