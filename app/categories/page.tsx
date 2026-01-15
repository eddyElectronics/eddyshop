import { getCategories as getCategoriesFromProducts, getProductsByCategory } from '@/lib/products';
import { getCategories } from '@/lib/categories';
import Link from 'next/link';

export default function CategoriesPage() {
  const categories = getCategories();
  const productCategories = getCategoriesFromProducts();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
          หมวดหมู่สินค้า
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const products = getProductsByCategory(category.name);

            return (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="group bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-zinc-100 dark:border-zinc-800"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                    {category.description}
                  </p>
                )}
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {products.length} รายการ
                </p>
              </Link>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📂</div>
            <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              ยังไม่มีหมวดหมู่
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              กรุณาเพิ่มหมวดหมู่ในหน้าจัดการ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
