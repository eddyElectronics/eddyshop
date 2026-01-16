'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { useCart } from '@/lib/cart-context';

interface ProductCardProps {
  product: Product;
}

// Helper function เพื่อดึงรูปแรกของสินค้า
function getFirstImage(product: Product): string {
  if (product.images && product.images.length > 0) {
    return product.images[0] || '/images/products/placeholder.jpg';
  }
  return product.image || '/images/products/placeholder.jpg';
}

// Helper function เพื่อดึงรูปทั้งหมดของสินค้า
function getAllImages(product: Product): string[] {
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  return product.image ? [product.image] : ['/images/products/placeholder.jpg'];
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const allImages = getAllImages(product);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isFullscreen) return;
    if (e.key === 'Escape') setIsFullscreen(false);
    if (e.key === 'ArrowLeft') setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    if (e.key === 'ArrowRight') setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  }, [isFullscreen, allImages.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown, isFullscreen]);

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFullscreen(true);
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      productCode: product.productCode || '',
      name: product.name,
      price: product.price,
      image: getFirstImage(product),
      category: product.category,
      isUsed: product.isUsed,
    });
  };

  const imageUrl = getFirstImage(product);
  const imageCount = product.images?.length || (product.image ? 1 : 0);

  const isSold = product.sold === true;

  return (
    <>
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-50"
            aria-label="ปิด"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {allImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1)); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
              aria-label="รูปก่อนหน้า"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <div className="relative w-full h-full max-w-5xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={allImages[selectedIndex] || '/images/products/placeholder.jpg'}
              alt={`${product.name} - รูปที่ ${selectedIndex + 1}`}
              fill
              className="object-contain"
              priority
              sizes="100vw"
            />
          </div>
          
          {allImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1)); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
              aria-label="รูปถัดไป"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-white/80 text-sm">
              {allImages.length > 1 ? `${selectedIndex + 1} / ${allImages.length}` : ''}
            </span>
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setSelectedIndex(idx); }}
                    className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                      idx === selectedIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`รูป ${idx + 1}`}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Link href={`/products/${product.id}`}>
        <div className={`group bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-zinc-100 dark:border-zinc-800 ${isSold ? 'grayscale opacity-70' : ''}`}>
          <div 
            className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-zoom-in"
            onClick={handleImageClick}
          >
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {imageCount > 1 && (
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {imageCount}
              </span>
            )}
            {isSold && (
              <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full z-10">
                ขายแล้ว
              </span>
            )}
            {!isSold && product.isUsed && (
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
                <span className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-300 font-semibold">
                  {product.productCode}
                </span>
              )}
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {product.category}
              </span>
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {product.name}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(product.price)}
              </span>
              {isSold ? (
                <span className="p-2 bg-zinc-400 text-white rounded-lg cursor-not-allowed" title="สินค้าขายแล้ว">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="เพิ่มลงตะกร้า"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
