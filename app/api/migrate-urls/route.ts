import { NextResponse } from 'next/server';
import { getProducts, saveProducts } from '@/lib/db';

// Force dynamic - no caching
export const dynamic = 'force-dynamic';

// POST - แปลง localhost URLs ให้เป็น relative paths
export async function POST() {
  try {
    const products = await getProducts();
    let updatedCount = 0;
    
    const updatedProducts = products.map(product => {
      let modified = false;
      
      // แปลง image field
      if (product.image && product.image.includes('localhost')) {
        product.image = product.image.replace(/https?:\/\/localhost:\d+/g, '');
        modified = true;
      }
      
      // แปลง images array
      if (product.images && product.images.length > 0) {
        product.images = product.images.map(img => {
          if (img.includes('localhost')) {
            modified = true;
            return img.replace(/https?:\/\/localhost:\d+/g, '');
          }
          return img;
        });
      }
      
      // แปลง video field
      if (product.video && product.video.includes('localhost')) {
        product.video = product.video.replace(/https?:\/\/localhost:\d+/g, '');
        modified = true;
      }
      
      if (modified) updatedCount++;
      return product;
    });
    
    if (updatedCount > 0) {
      await saveProducts(updatedProducts);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `แปลง URL สำเร็จ ${updatedCount} สินค้า`,
      updatedCount 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Failed to migrate URLs' }, { status: 500 });
  }
}

// GET - ตรวจสอบ URLs ที่ต้องแปลง
export async function GET() {
  try {
    const products = await getProducts();
    const productsWithLocalhostUrls = products.filter(product => {
      return (
        (product.image && product.image.includes('localhost')) ||
        (product.images && product.images.some(img => img.includes('localhost'))) ||
        (product.video && product.video.includes('localhost'))
      );
    });
    
    return NextResponse.json({ 
      totalProducts: products.length,
      productsToMigrate: productsWithLocalhostUrls.length,
      products: productsWithLocalhostUrls.map(p => ({
        id: p.id,
        name: p.name,
        image: p.image,
        images: p.images,
        video: p.video
      }))
    });
  } catch (error) {
    console.error('Check error:', error);
    return NextResponse.json({ error: 'Failed to check URLs' }, { status: 500 });
  }
}
