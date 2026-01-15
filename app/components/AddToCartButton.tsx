'use client';

import { useCart } from '@/lib/cart-context';
import { useState } from 'react';

interface AddToCartButtonProps {
  product: {
    id: string;
    productCode?: string;
    name: string;
    price: number;
    image: string;
    category: string;
    isUsed?: boolean;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      productCode: product.productCode || '',
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      isUsed: product.isUsed,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={added}
      className={`flex-1 py-3 px-6 rounded-full font-semibold text-center transition-all flex items-center justify-center gap-2 ${
        added
          ? 'bg-green-600 text-white'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {added ? (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          เพิ่มลงตะกร้าแล้ว!
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          เพิ่มลงตะกร้า
        </>
      )}
    </button>
  );
}
