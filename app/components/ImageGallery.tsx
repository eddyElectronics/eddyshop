'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isFullscreen) return;
    if (e.key === 'Escape') setIsFullscreen(false);
    if (e.key === 'ArrowLeft') setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    if (e.key === 'ArrowRight') setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [isFullscreen, images.length]);

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

  if (images.length === 0) {
    return (
      <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
        <span className="text-6xl">📷</span>
      </div>
    );
  }

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
          
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
            aria-label="รูปก่อนหน้า"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="relative w-full h-full max-w-5xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[selectedIndex] || '/images/products/placeholder.jpg'}
              alt={`${productName} - รูปที่ ${selectedIndex + 1}`}
              fill
              className="object-contain"
              priority
              sizes="100vw"
            />
          </div>
          
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
            aria-label="รูปถัดไป"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Main Image */}
        <div 
          className="relative aspect-square bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm cursor-zoom-in"
          onClick={() => setIsFullscreen(true)}
        >
          <Image
            src={images[selectedIndex] || '/images/products/placeholder.jpg'}
            alt={`${productName} - รูปที่ ${selectedIndex + 1}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black p-2 rounded-full shadow-lg transition-colors"
                aria-label="รูปก่อนหน้า"
              >
                <svg className="w-5 h-5 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black p-2 rounded-full shadow-lg transition-colors"
                aria-label="รูปถัดไป"
              >
                <svg className="w-5 h-5 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === index
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-300'
                }`}
              >
                <Image
                  src={image}
                  alt={`${productName} - thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
