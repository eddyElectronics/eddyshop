'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/lib/categories';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">จัดการหมวดหมู่</h1>
      <div className="grid gap-4">
        {categories.map(category => (
          <div key={category.id} className="bg-white dark:bg-zinc-900 p-4 rounded-lg border flex items-center gap-4">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-sm text-zinc-500">{category.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}