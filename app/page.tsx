'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { Product } from '@/lib/products';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(price);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  const productsRef = useRef<HTMLElement>(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/products');
        const productsData = await res.json();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Log visitor on page load
  useEffect(() => {
    async function logVisit() {
      try {
        // Generate or get session ID from localStorage
        let sessionId = localStorage.getItem('visitor_session_id');
        if (!sessionId) {
          sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('visitor_session_id', sessionId);
        }

        await fetch('/api/visitor-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageUrl: window.location.pathname,
            referrer: document.referrer || null,
            sessionId,
          }),
        });
      } catch (error) {
        // Silently fail - don't impact user experience
        console.debug('Failed to log visit:', error);
      }
    }
    logVisit();
  }, []);

  // Listen for SPA search events from Header
  useEffect(() => {
    const handleSpaSearch = (e: CustomEvent<string>) => {
      setSearchQuery(e.detail);
      productsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    window.addEventListener('spa-search', handleSpaSearch as EventListener);
    return () => window.removeEventListener('spa-search', handleSpaSearch as EventListener);
  }, []);



  // Filter and sort products: new items first, then old items, sold items last
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.productCode?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      // Sold items go to the end
      if (a.sold && !b.sold) return 1;
      if (!a.sold && b.sold) return -1;
      // Sort by id (timestamp) descending - newer items first
      return Number(b.id) - Number(a.id);
    });

  // Product Modal with Image Gallery
  const ProductModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // Check if product has video
    const hasVideo = product.video && product.video.length > 0;
    
    // Get all images (video is handled separately)
    const allImages = product.images && product.images.length > 0 
      ? product.images 
      : [product.image || '/images/products/placeholder.jpg'];
    
    // Total media count (video + images)
    const totalMediaCount = (hasVideo ? 1 : 0) + allImages.length;
    
    // Current media is video if index is 0 and hasVideo
    const isShowingVideo = hasVideo && currentIndex === 0;
    const imageIndex = hasVideo ? currentIndex - 1 : currentIndex;
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev === 0 ? totalMediaCount - 1 : prev - 1));
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev === totalMediaCount - 1 ? 0 : prev + 1));
    }, [isFullscreen, totalMediaCount, onClose]);

    useEffect(() => {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }, [handleKeyDown]);

    const goToPrev = () => setCurrentIndex((prev) => (prev === 0 ? totalMediaCount - 1 : prev - 1));
    const goToNext = () => setCurrentIndex((prev) => (prev === totalMediaCount - 1 ? 0 : prev + 1));
    
    return (
      <>
        {/* Fullscreen Image View */}
        {isFullscreen && (
          <div 
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-50"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {totalMediaCount > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            <div className="relative w-full h-full max-w-5xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
              {isShowingVideo ? (
                <video
                  src={product.video}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image
                  src={allImages[imageIndex] || '/images/products/placeholder.jpg'}
                  alt={`${product.name} - รูปที่ ${imageIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                  sizes="100vw"
                />
              )}
            </div>
            
            {totalMediaCount > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <span className="text-white/80 text-sm">{currentIndex + 1} / {totalMediaCount}</span>
                <div className="flex gap-2">
                  {/* Video thumbnail */}
                  {hasVideo && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setCurrentIndex(0); }}
                      className={`w-12 h-12 rounded overflow-hidden border-2 transition-all relative ${
                        currentIndex === 0 ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <video src={product.video} className="object-cover w-full h-full" muted />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </button>
                  )}
                  {/* Image thumbnails */}
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentIndex(hasVideo ? idx + 1 : idx); }}
                      className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                        (hasVideo ? idx + 1 : idx) === currentIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`รูป ${idx + 1}`} width={48} height={48} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Product Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative aspect-video cursor-zoom-in" onClick={() => !isShowingVideo && setIsFullscreen(true)}>
              {isShowingVideo ? (
                <video
                  src={product.video}
                  controls
                  autoPlay
                  className="w-full h-full object-cover rounded-t-2xl"
                />
              ) : (
                <Image
                  src={allImages[imageIndex] || '/images/products/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover rounded-t-2xl"
                />
              )}
              
              {/* Video badge */}
              {isShowingVideo && (
                <div className="absolute top-4 left-4 bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  วิดีโอ
                </div>
              )}
              
              {/* Navigation Arrows */}
              {totalMediaCount > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* Media Counter */}
              {totalMediaCount > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                  {currentIndex + 1} / {totalMediaCount}
                </div>
              )}
              
              {/* Fullscreen hint (only for images) */}
              {!isShowingVideo && (
                <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  คลิกเพื่อขยาย
                </div>
              )}
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Thumbnails */}
            {totalMediaCount > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto bg-zinc-50 dark:bg-zinc-800">
                {/* Video thumbnail */}
                {hasVideo && (
                  <button
                    onClick={() => setCurrentIndex(0)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative ${
                      currentIndex === 0 ? 'border-purple-600' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <video src={product.video} className="object-cover w-full h-full" muted />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </button>
                )}
                {/* Image thumbnails */}
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(hasVideo ? idx + 1 : idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      (hasVideo ? idx + 1 : idx) === currentIndex ? 'border-blue-600' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`รูป ${idx + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                {product.productCode && (
                  <span className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded font-semibold">
                    {product.productCode}
                  </span>
                )}
                <span className="text-sm text-zinc-500">{product.category}</span>
                {product.sold && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">ขายแล้ว</span>
                )}
                {!product.sold && product.isUsed && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">มือสอง</span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{product.name}</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                {product.sold ? (
                  <span className="flex items-center gap-2 px-6 py-3 bg-zinc-400 text-white rounded-full cursor-not-allowed">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    สินค้าขายแล้ว
                  </span>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Product Card (inline)
  const ProductCard = ({ product }: { product: Product }) => {
    const hasVideo = product.video && product.video.length > 0;
    const imageUrl = product.images?.[0] || product.image || '/images/products/placeholder.jpg';
    const imageCount = product.images?.length || 1;
    const isSold = product.sold === true;

    return (
      <div
        onClick={() => setSelectedProduct(product)}
        className={`group cursor-pointer bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-lg transition-all border border-zinc-100 dark:border-zinc-800 overflow-hidden ${isSold ? 'grayscale opacity-70' : ''}`}
      >
        <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {hasVideo ? (
            <video
              src={product.video}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              muted
              loop
              playsInline
              onMouseOver={(e) => e.currentTarget.play()}
              onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
            />
          ) : (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          {/* Video badge */}
          {hasVideo && (
            <span className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              วิดีโอ
            </span>
          )}
          {imageCount > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              📷 {imageCount}
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
            <span className="text-xs text-zinc-400">{product.category}</span>
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{product.name}</h3>
          <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
            {isSold ? (
              <span className="p-2 bg-zinc-400 text-white rounded-lg cursor-not-allowed" title="สินค้าขายแล้ว">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#403C2A]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Image
              src="/images/logo.svg"
              alt="Eddy Electronics"
              fill
              className="object-contain animate-pulse"
            />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F3EF] min-h-screen">
      {/* All Products Section */}
      <section ref={productsRef} id="products" className="px-4 sm:px-6 lg:px-8 py-16 pt-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#403C2A] mb-8 text-center">
            สินค้าทั้งหมด
          </h2>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-[#EBE8E2] rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-[#A6A08D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-[#58594D] text-lg">ไม่พบสินค้าที่ค้นหา</p>
            </div>
          )}
        </div>
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}