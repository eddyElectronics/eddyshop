'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { Product } from '@/lib/products';
import { Category } from '@/lib/categories';

type View = 'home' | 'products' | 'cart';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(price);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { items, addItem, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

  const productsRef = useRef<HTMLElement>(null);
  const cartRef = useRef<HTMLElement>(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productCode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredProducts = products.filter(p => p.featured);

  // Navigation
  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewProducts = (category?: string) => {
    if (category) setSelectedCategory(category);
    setCurrentView('products');
    setTimeout(() => scrollToSection(productsRef), 100);
  };

  const handleViewCart = () => {
    setCurrentView('cart');
    setTimeout(() => scrollToSection(cartRef), 100);
  };

  // Product Modal
  const ProductModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
    const imageUrl = product.images?.[0] || product.image || '/images/products/placeholder.jpg';
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="relative aspect-video">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover rounded-t-2xl"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              {product.productCode && (
                <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                  {product.productCode}
                </span>
              )}
              <span className="text-sm text-zinc-500">{product.category}</span>
              {product.isUsed && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">มือสอง</span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{product.name}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</span>
              <button
                onClick={() => {
                  addItem(product);
                  onClose();
                }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                เพิ่มลงตะกร้า
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Product Card (inline)
  const ProductCard = ({ product }: { product: Product }) => {
    const imageUrl = product.images?.[0] || product.image || '/images/products/placeholder.jpg';
    const imageCount = product.images?.length || 1;

    return (
      <div
        onClick={() => setSelectedProduct(product)}
        className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-lg transition-all border border-zinc-100 dark:border-zinc-800 overflow-hidden"
      >
        <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {imageCount > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              📷 {imageCount}
            </span>
          )}
          {product.isUsed && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              มือสอง
            </span>
          )}
          {product.featured && (
            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              แนะนำ
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            {product.productCode && (
              <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                {product.productCode}
              </span>
            )}
            <span className="text-xs text-zinc-400">{product.category}</span>
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{product.name}</h3>
          <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addItem(product);
              }}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="เพิ่มลงตะกร้า"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Floating Cart Button - Top Right */}
      <button
        onClick={handleViewCart}
        className="fixed top-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </div>
      </button>

      {/* Floating Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-zinc-900 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 px-2 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${currentView === 'home' ? 'bg-blue-600 text-white' : 'text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            🏠 หน้าหลัก
          </button>
          <button
            onClick={() => handleViewProducts()}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${currentView === 'products' ? 'bg-blue-600 text-white' : 'text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            📦 สินค้า
          </button>
          <button
            onClick={handleViewCart}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors relative ${currentView === 'cart' ? 'bg-blue-600 text-white' : 'text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            🛒 ตะกร้า
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
          หมวดหมู่สินค้า
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleViewProducts(category.name)}
              className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-zinc-100 dark:border-zinc-800"
            >
              <span className="text-4xl mb-2">{category.icon}</span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            สินค้าแนะนำ
          </h2>
          <button
            onClick={() => handleViewProducts()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ดูทั้งหมด →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* All Products Section */}
      <section ref={productsRef} id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
          สินค้าทั้งหมด
        </h2>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'}`}
            >
              ทั้งหมด
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.name ? 'bg-blue-600 text-white' : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'}`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400">ไม่พบสินค้าที่ค้นหา</p>
          </div>
        )}
      </section>

      {/* Cart Section */}
      <section ref={cartRef} id="cart" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
          🛒 ตะกร้าสินค้า
        </h2>
        
        {items.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-12 text-center border border-zinc-200 dark:border-zinc-700">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">ตะกร้าของคุณว่างเปล่า</p>
            <button
              onClick={() => handleViewProducts()}
              className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              เลือกซื้อสินค้า
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const imageUrl = item.images?.[0] || item.image || '/images/products/placeholder.jpg';
                return (
                  <div key={item.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 flex gap-4 border border-zinc-200 dark:border-zinc-700">
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100">
                      <Image src={imageUrl} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-zinc-500">{item.category}</p>
                      <p className="text-blue-600 font-bold mt-1">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Summary */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 h-fit border border-zinc-200 dark:border-zinc-700 sticky top-4">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">สรุปคำสั่งซื้อ</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>สินค้า ({totalItems} ชิ้น)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>ค่าจัดส่ง</span>
                  <span>{totalPrice >= 1000 ? 'ฟรี' : formatPrice(50)}</span>
                </div>
                <hr className="border-zinc-200 dark:border-zinc-700" />
                <div className="flex justify-between text-lg font-bold text-zinc-900 dark:text-white">
                  <span>รวมทั้งหมด</span>
                  <span className="text-blue-600">{formatPrice(totalPrice + (totalPrice >= 1000 ? 0 : 50))}</span>
                </div>
              </div>
              <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                ดำเนินการสั่งซื้อ
              </button>
              {totalPrice < 1000 && (
                <p className="text-sm text-zinc-500 text-center mt-3">
                  ซื้อเพิ่มอีก {formatPrice(1000 - totalPrice)} เพื่อรับส่งฟรี!
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
      {/* Footer spacer for floating nav */}
      <div className="h-24"></div>
    </div>
  );
}