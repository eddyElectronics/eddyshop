import { getFeaturedProducts } from '@/lib/products';
import { getCategories } from '@/lib/categories';
import ProductCard from './components/ProductCard';
import Link from 'next/link';

export default function Home() {
  const featuredProducts = getFeaturedProducts();
  const categories = getCategories();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ยินดีต้อนรับสู่ EddyShop
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              ร้านค้าออนไลน์คุณภาพ สินค้าหลากหลาย ราคาดี จัดส่งรวดเร็ว
            </p>
            <Link
              href="/products"
              className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors"
            >
              เลือกซื้อสินค้า
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
          หมวดหมู่สินค้า
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-zinc-100 dark:border-zinc-800"
            >
              <span className="text-4xl mb-2">{category.icon}</span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            สินค้าแนะนำ
          </h2>
          <Link
            href="/products"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-zinc-900 py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                จัดส่งฟรี
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                เมื่อซื้อครบ 1,000 บาท
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">↩️</div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                เปลี่ยนคืนง่าย
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                ภายใน 7 วัน
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                สินค้าคุณภาพ
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                รับประกันของแท้ 100%
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
