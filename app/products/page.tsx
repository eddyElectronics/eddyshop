import { getCategories } from '@/lib/categories';
import { getProducts } from '@/lib/db';
import ProductCard from '../components/ProductCard';

// Use dynamic rendering since products are stored in Vercel Blob
export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const searchQuery = params.search;
  const categoryFilter = params.category;

  let products = await getProducts();
  const categories = getCategories();

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    products = products.filter(
      product =>
        product.productCode?.toLowerCase().includes(query) ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  } else if (categoryFilter) {
    products = products.filter(product => product.category === categoryFilter);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            {searchQuery
              ? `ผลการค้นหา "${searchQuery}"`
              : categoryFilter
              ? `หมวดหมู่: ${categoryFilter}`
              : 'สินค้าทั้งหมด'}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            พบ {products.length} รายการ
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <a
            href="/products"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !categoryFilter
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            ทั้งหมด
          </a>
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === category.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {category.icon} {category.name}
            </a>
          ))}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              ไม่พบสินค้า
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              ลองค้นหาด้วยคำค้นอื่น หรือดูสินค้าทั้งหมด
            </p>
            <a
              href="/products"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              ดูสินค้าทั้งหมด
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
