'use client';

import { useCart } from '@/lib/cart-context';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
              ตะกร้าสินค้าว่างเปล่า
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8">
              ยังไม่มีสินค้าในตะกร้า เลือกซื้อสินค้าได้เลย!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              เลือกซื้อสินค้า
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              ตะกร้าสินค้า
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              {items.length} รายการ
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            ล้างตะกร้า
          </button>
        </div>

        {/* Cart Items */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 sm:p-6 flex gap-4 ${
                index !== items.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''
              }`}
            >
              {/* Image */}
              <Link href={`/products/${item.id}`} className="flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                        {item.productCode}
                      </span>
                      {item.isUsed && (
                        <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 text-xs rounded">
                          มือสอง
                        </span>
                      )}
                    </div>
                    <Link href={`/products/${item.id}`}>
                      <h3 className="font-semibold text-zinc-900 dark:text-white hover:text-blue-600 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-600 dark:text-zinc-400">รวมทั้งหมด</span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">
              {formatPrice(totalPrice)}
            </span>
          </div>
          
          {/* Contact Info */}
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
              ติดต่อสั่งซื้อ
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              💬 แจ้งรหัสสินค้าหรือเซฟรูปแล้วส่งมาที่{' '}
              <a 
                href="http://m.me/airportthai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                m.me/airportthai
              </a>
            </p>
          </div>
          
          <Link
            href="/products"
            className="w-full border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 py-3 rounded-xl font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            เลือกซื้อสินค้าเพิ่ม
          </Link>
        </div>
      </div>
    </div>
  );
}
