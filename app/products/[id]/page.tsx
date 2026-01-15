import { getProductById, getProducts, formatPrice, getProductImages } from '@/lib/products';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImageGallery from '@/app/components/ImageGallery';
import AddToCartButton from '@/app/components/AddToCartButton';

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
              {product.isUsed ? (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  มือสอง
                </span>
              ) : (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  ของใหม่
                </span>
              )}
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <AddToCartButton 
                product={{
                  id: product.id,
                  productCode: product.productCode,
                  name: product.name,
                  price: product.price,
                  image: images[0] || '/images/products/placeholder.jpg',
                  isUsed: product.isUsed,
                }}
              />
              <Link
                href="/cart"
                className="flex-1 py-3 px-6 rounded-full font-semibold text-center border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                ดูตะกร้าสินค้า
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
                ติดต่อสั่งซื้อ
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                💬 แจ้งรหัสสินค้าหรือเซฟรูปแล้วส่งมาที่{' '}
                <a 
                  href="http://m.me/airportthai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  m.me/airportthai
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
