'use client';

import { useCart } from '@/lib/cart-context';
import Image from 'next/image';
import { useState } from 'react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(price);
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeItem, totalPrice, clearCart } = useCart();
  const [showOrderPopup, setShowOrderPopup] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            ตะกร้าสินค้า ({items.length} รายการ)
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-zinc-500 dark:text-zinc-400">ตะกร้าว่างเปล่า</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.images?.[0] || item.image || '/images/products/placeholder.jpg'}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.productCode && (
                      <span className="text-xs font-mono bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
                        {item.productCode}
                      </span>
                    )}
                    <h3 className="font-medium text-zinc-900 dark:text-white truncate mt-1">
                      {item.name}
                    </h3>
                    <p className="text-sm font-semibold text-blue-600 mt-1">{formatPrice(item.price)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-600 self-start"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">รวมทั้งหมด</span>
              <span className="text-2xl font-bold text-blue-600">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                ล้างตะกร้า
              </button>
              <button
                onClick={() => setShowOrderPopup(true)}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                สั่งซื้อ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Popup */}
      {showOrderPopup && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 z-[60]"
            onClick={() => setShowOrderPopup(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl z-[60] shadow-2xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.53 5.47 3.92 7.15l-.62 2.31c-.08.3.02.62.26.81.14.11.31.17.48.17.12 0 .24-.03.35-.08l2.86-1.33c.93.23 1.9.35 2.89.35 5.64 0 10-4.13 10-9.7S17.64 2 12 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                วิธีการสั่งซื้อ
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                สั่งซื้อแจ้งหมายเลขสินค้าหรือเซฟหน้าจอสินค้าแล้วส่งมาที่
              </p>
              <a 
                href="https://m.me/airportthai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-4"
              >
                m.me/airportthai
              </a>
              <div className="text-left bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                  <span className="font-semibold">1.</span> ไม่มีบริการเก็บเงินปลายทาง
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="font-semibold">2.</span> ราคารวมค่าส่งแล้ว
                </p>
              </div>
              <button
                onClick={() => setShowOrderPopup(false)}
                className="w-full mt-6 px-4 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-medium"
              >
                ปิด
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
