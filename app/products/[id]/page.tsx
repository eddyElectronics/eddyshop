import { getProductById, getProducts, formatPrice, getProductImages } from '@/lib/products';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImageGallery from '@/app/components/ImageGallery';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const products = getProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const images = getProductImages(product);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <li>
              <Link href="/" className="hover:text-blue-600">
                หน้าแรก
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-blue-600">
                สินค้า
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="hover:text-blue-600"
              >
                {product.category}
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-900 dark:text-zinc-100 font-medium truncate max-w-[150px]">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images Gallery */}
          <div>
            <ImageGallery images={images} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {product.productCode && (
                <span className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400">
                  รหัส: {product.productCode}
                </span>
              )}
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {product.category}
              </span>
              {product.featured && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  แนะนำ
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              {product.name}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 10 ? (
                <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  มีสินค้า ({product.stock} ชิ้น)
                </span>
              ) : product.stock > 0 ? (
                <span className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  เหลือน้อย ({product.stock} ชิ้น)
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-red-600 dark:text-red-400">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  สินค้าหมด
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button
                className={`flex-1 py-3 px-6 rounded-full font-semibold text-center transition-colors ${
                  product.stock > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                }`}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'เพิ่มลงตะกร้า' : 'สินค้าหมด'}
              </button>
              <Link
                href="/products"
                className="flex-1 py-3 px-6 rounded-full font-semibold text-center border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-600 hover:text-blue-600 transition-colors"
              >
                ดูสินค้าอื่น
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
                ข้อมูลเพิ่มเติม
              </h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <span>🚚</span> จัดส่งฟรีเมื่อซื้อครบ 1,000 บาท
                </li>
                <li className="flex items-center gap-2">
                  <span>↩️</span> เปลี่ยนคืนได้ภายใน 7 วัน
                </li>
                <li className="flex items-center gap-2">
                  <span>✅</span> รับประกันสินค้าแท้ 100%
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
