'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { Product } from '@/lib/products';
import { Category } from '@/lib/categories';

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const { addItem } = useCart();

  const productsRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);

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
      setSelectedCategory('');
      productsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    window.addEventListener('spa-search', handleSpaSearch as EventListener);
    return () => window.removeEventListener('spa-search', handleSpaSearch as EventListener);
  }, []);

  // Intersection Observer for section tracking
  useEffect(() => {
    const sections = [heroRef.current, featuresRef.current, productsRef.current];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sections.findIndex((section) => section === entry.target);
            if (index !== -1) setCurrentSection(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (index: number) => {
    const sections = [heroRef.current, featuresRef.current, productsRef.current];
    sections[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter and sort products: new items first, then old items, sold items last
  const filteredProducts = products
    .filter(product => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.productCode?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
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
    
    // Get all images
    const allImages = product.images && product.images.length > 0 
      ? product.images 
      : [product.image || '/images/products/placeholder.jpg'];
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    }, [isFullscreen, allImages.length, onClose]);

    useEffect(() => {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }, [handleKeyDown]);

    const goToPrev = () => setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    const goToNext = () => setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    
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
            
            {allImages.length > 1 && (
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
              <Image
                src={allImages[currentIndex] || '/images/products/placeholder.jpg'}
                alt={`${product.name} - รูปที่ ${currentIndex + 1}`}
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
            </div>
            
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <span className="text-white/80 text-sm">{currentIndex + 1} / {allImages.length}</span>
                <div className="flex gap-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                      className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                        idx === currentIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
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
            <div className="relative aspect-video cursor-zoom-in" onClick={() => setIsFullscreen(true)}>
              <Image
                src={allImages[currentIndex] || '/images/products/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover rounded-t-2xl"
              />
              
              {/* Navigation Arrows */}
              {allImages.length > 1 && (
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
              
              {/* Image Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                  {currentIndex + 1} / {allImages.length}
                </div>
              )}
              
              {/* Fullscreen hint */}
              <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                คลิกเพื่อขยาย
              </div>
              
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
            {allImages.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto bg-zinc-50 dark:bg-zinc-800">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentIndex ? 'border-blue-600' : 'border-transparent opacity-60 hover:opacity-100'
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
    const imageUrl = product.images?.[0] || product.image || '/images/products/placeholder.jpg';
    const imageCount = product.images?.length || 1;
    const isSold = product.sold === true;

    return (
      <div
        onClick={() => setSelectedProduct(product)}
        className={`group cursor-pointer bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-lg transition-all border border-zinc-100 dark:border-zinc-800 overflow-hidden ${isSold ? 'grayscale opacity-70' : ''}`}
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
    <div className="bg-[#403C2A] overflow-x-hidden">
      {/* Section Navigation Dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSection === index
                ? 'bg-white scale-125'
                : 'bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`ไปยังส่วนที่ ${index + 1}`}
          />
        ))}
      </div>

      {/* Hero Section - Fullscreen */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #BFB595 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#BFB595]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#7a9a8a]/20 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Logo & Brand */}
        <div className="relative z-10 text-center">
          <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8 animate-bounce-slow">
            <Image
              src="/images/logo.svg"
              alt="Eddy Electronics"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            <span className="text-[#7a9a8a] italic">EDDY</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#BFB595] tracking-[0.3em] uppercase mb-8">
            Electronics
          </p>
          
          <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-12 leading-relaxed">
            ร้านอิเล็กทรอนิกส์คุณภาพ<br />
            สินค้าหลากหลาย ราคาดี จัดส่งรวดเร็ว
          </p>

          {/* CTA Button */}
          <button
            onClick={() => scrollToSection(2)}
            className="group px-8 py-4 bg-white text-[#403C2A] rounded-full font-semibold text-lg hover:bg-[#BFB595] transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
              ดูสินค้าทั้งหมด
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/60 text-sm tracking-wider">Scroll Down</span>
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section - Fullscreen */}
      <section
        ref={featuresRef}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#403C2A] to-[#2D2A1E] px-4 py-20"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-4">
            ทำไมต้องเลือกเรา?
          </h2>
          <p className="text-[#BFB595] text-center text-lg mb-16 max-w-2xl mx-auto">
            เราพร้อมให้บริการคุณด้วยสินค้าคุณภาพและบริการที่ดีที่สุด
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#7a9a8a] to-[#5a7a6a] rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">สินค้าคุณภาพ</h3>
              <p className="text-white/70">คัดสรรสินค้าคุณภาพดีเยี่ยม รับประกันความพึงพอใจ</p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#BFB595] to-[#A6A08D] rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                <svg className="w-10 h-10 text-[#403C2A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">ราคาดีที่สุด</h3>
              <p className="text-white/70">ราคาคุ้มค่า เปรียบเทียบได้ ไม่มีบวกเพิ่ม</p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#58594D] to-[#403C2A] rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform border border-white/20">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">จัดส่งรวดเร็ว</h3>
              <p className="text-white/70">ส่งไว ส่งฟรี ทั่วประเทศ พร้อมติดตามพัสดุ</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-[#7a9a8a]">{products.length}+</p>
              <p className="text-white/60 mt-2">สินค้า</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-[#BFB595]">{categories.length}</p>
              <p className="text-white/60 mt-2">หมวดหมู่</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-[#7a9a8a]">24/7</p>
              <p className="text-white/60 mt-2">ให้บริการ</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-[#BFB595]">100%</p>
              <p className="text-white/60 mt-2">รับประกัน</p>
            </div>
          </div>
        </div>
      </section>

      {/* All Products Section - Fullscreen */}
      <section ref={productsRef} id="products" className="min-h-screen bg-[#F5F3EF] px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#403C2A] mb-2 text-center">
            สินค้าทั้งหมด
          </h2>
          <p className="text-[#58594D] text-center mb-10">เลือกชมสินค้าที่คุณสนใจ</p>
        
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${!selectedCategory ? 'bg-[#403C2A] text-white shadow-lg scale-105' : 'bg-white text-[#403C2A] border border-[#D9D5CB] hover:bg-[#EBE8E2]'}`}
            >
              ทั้งหมด
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === cat.name ? 'bg-[#403C2A] text-white shadow-lg scale-105' : 'bg-white text-[#403C2A] border border-[#D9D5CB] hover:bg-[#EBE8E2]'}`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

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

      {/* Footer Section */}
      <footer className="bg-[#2D2A1E] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Brand */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="relative w-12 h-12">
                  <Image src="/images/logo.svg" alt="Eddy Electronics" fill className="object-contain" />
                </div>
                <div>
                  <span className="text-xl font-bold text-[#7a9a8a] italic">EDDY</span>
                  <p className="text-xs text-[#BFB595] tracking-wider">ELECTRONICS</p>
                </div>
              </div>
              <p className="text-white/60 text-sm">ร้านอิเล็กทรอนิกส์คุณภาพ สินค้าหลากหลาย ราคาดี</p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h4 className="font-semibold text-[#BFB595] mb-4">ลิงก์ด่วน</h4>
              <div className="space-y-2">
                <button onClick={() => scrollToSection(0)} className="block w-full text-white/70 hover:text-white transition-colors">หน้าแรก</button>
                <button onClick={() => scrollToSection(1)} className="block w-full text-white/70 hover:text-white transition-colors">เกี่ยวกับเรา</button>
                <button onClick={() => scrollToSection(2)} className="block w-full text-white/70 hover:text-white transition-colors">สินค้า</button>
              </div>
            </div>

            {/* Contact */}
            <div className="text-center md:text-right">
              <h4 className="font-semibold text-[#BFB595] mb-4">ติดต่อเรา</h4>
              <div className="space-y-2 text-white/70 text-sm">
                <p>📧 contact@eddyelectronics.com</p>
                <p>📱 Line: @eddyelectronics</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-white/40 text-sm">© 2025 Eddy Electronics. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}