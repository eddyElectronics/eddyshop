'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  stock?: number;
  featured: boolean;
  isUsed?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    productCode: '',
    name: '',
    description: '',
    price: '',
    category: '',
    images: [] as string[],
    featured: false,
    isUsed: false,
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check');
      if (res.ok) {
        setAuthenticated(true);
        fetchProducts();
        fetchCategories();
      } else {
        router.push('/admin/login');
      }
    } catch {
      router.push('/admin/login');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let uploadedImages = [...formData.images];
    
    // อัพโหลดไฟล์ภาพใหม่ถ้ามี
    if (imageFiles.length > 0) {
      setUploadingImages(true);
      try {
        const uploadFormData = new FormData();
        imageFiles.forEach(file => {
          uploadFormData.append('files', file);
        });
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedImages = [...uploadedImages, ...uploadData.paths];
        } else {
          const errorData = await uploadRes.json();
          alert(errorData.error || 'อัพโหลดรูปภาพไม่สำเร็จ');
          setUploadingImages(false);
          return;
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
        setUploadingImages(false);
        return;
      }
      setUploadingImages(false);
    }
    
    const submitData = {
      productCode: formData.productCode,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
      image: uploadedImages[0] || '/images/products/placeholder.jpg',
      featured: formData.featured,
      isUsed: formData.isUsed,
    };
    
    try {
      if (editingProduct) {
        // แก้ไขสินค้า
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        
        if (res.ok) {
          fetchProducts();
          resetForm();
        }
      } else {
        // เพิ่มสินค้าใหม่
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        
        if (res.ok) {
          fetchProducts();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    // ดึง images array หรือใช้ image เดี่ยว
    const productImages = product.images && product.images.length > 0 
      ? product.images 
      : (product.image ? [product.image] : []);
    
    setFormData({
      productCode: product.productCode || '',
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      images: productImages,
      featured: product.featured,
      isUsed: product.isUsed || false,
    });
    setImageFiles([]);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบสินค้านี้หรือไม่?')) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      productCode: '',
      name: '',
      description: '',
      price: '',
      category: '',
      images: [],
      featured: false,
      isUsed: false,
    });
    setImageFiles([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        alert(`ไฟล์ ${file.name} มีขนาดเกิน 5MB`);
        continue;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        alert(`ไฟล์ ${file.name} ไม่ใช่รูปภาพที่รองรับ`);
        continue;
      }
      validFiles.push(file);
    }
    
    setImageFiles(prev => [...prev, ...validFiles]);
  };

  const removeImageFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-xl text-zinc-600 dark:text-zinc-400">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              จัดการสินค้า
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              เพิ่ม แก้ไข และลบสินค้าในร้านของคุณ
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              href="/"
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden sm:inline">หน้าร้าน</span>
            </Link>
            <Link
              href="/admin/categories"
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="hidden sm:inline">จัดการหมวดหมู่</span>
            </Link>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">เพิ่มสินค้า</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* รหัสสินค้าและชื่อสินค้า */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      รหัสสินค้า *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={3}
                      value={formData.productCode}
                      onChange={(e) => setFormData({ ...formData, productCode: e.target.value.toUpperCase().slice(0, 3) })}
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center text-lg tracking-widest"
                      placeholder="A01"
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">3 ตัวอักษร/ตัวเลข</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      ชื่อสินค้า *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="เช่น เสื้อยืดคอกลม"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    รายละเอียด *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="รายละเอียดสินค้า"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    ราคา (บาท) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    หมวดหมู่ *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  <Link
                    href="/admin/categories"
                    className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-block"
                  >
                    + เพิ่มหมวดหมู่ใหม่
                  </Link>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    รูปภาพสินค้า (ไม่เกิน 5MB ต่อรูป)
                  </label>
                  
                  {/* รูปภาพที่มีอยู่แล้ว */}
                  {formData.images.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">รูปภาพปัจจุบัน:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.images.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`รูปที่ ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] text-center py-0.5 rounded-b-lg">
                                หลัก
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* ไฟล์ที่เลือกใหม่ */}
                  {imageFiles.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">รูปภาพใหม่ที่จะอัพโหลด:</p>
                      <div className="flex flex-wrap gap-2">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-20 h-20 object-cover rounded-lg border-2 border-dashed border-blue-400"
                            />
                            <button
                              type="button"
                              onClick={() => removeImageFile(index)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* ปุ่มเลือกไฟล์ */}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">คลิกเพื่อเลือกรูปภาพ</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    รองรับไฟล์ JPG, PNG, GIF, WebP (ไม่เกิน 5MB ต่อรูป) - รูปแรกจะเป็นรูปหลัก
                  </p>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isUsed"
                      checked={formData.isUsed}
                      onChange={(e) => setFormData({ ...formData, isUsed: e.target.checked })}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="isUsed" className="text-sm text-zinc-700 dark:text-zinc-300">
                      สินค้ามือสอง
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="featured" className="text-sm text-zinc-700 dark:text-zinc-300">
                      สินค้าแนะนำ (แสดงในหน้าแรก)
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    disabled={uploadingImages}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={uploadingImages}
                  >
                    {uploadingImages ? 'กำลังอัพโหลด...' : (editingProduct ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Table - Desktop */}
        <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-900 dark:text-white">
                    รหัส
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                    สินค้า
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                    หมวดหมู่
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                    ราคา
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                    ประเภท
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                    สถานะ
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-white">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {products.map((product) => {
                  const imageCount = product.images?.length || (product.image ? 1 : 0);
                  const displayImage = product.images?.[0] || product.image || '/images/products/placeholder.jpg';
                  
                  return (
                  <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-700 dark:text-zinc-300">
                        {product.productCode || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={displayImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {imageCount > 1 && (
                            <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1 rounded-tl">
                              +{imageCount - 1}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-zinc-900 dark:text-white truncate">
                            {product.name}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[180px]">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs text-zinc-700 dark:text-zinc-300">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-white font-medium text-sm">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      {product.isUsed ? (
                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded text-xs">
                          มือสอง
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
                          ของใหม่
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {product.featured ? (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                          แนะนำ
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded text-xs">
                          ปกติ
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${product.id}`}
                          className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="ดูสินค้า"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="ลบ"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Products Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {products.map((product) => {
            const imageCount = product.images?.length || (product.image ? 1 : 0);
            const displayImage = product.images?.[0] || product.image || '/images/products/placeholder.jpg';
            
            return (
              <div key={product.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex gap-3">
                  <div className="relative w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {imageCount > 1 && (
                      <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1 rounded-tl">
                        +{imageCount - 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
                            {product.productCode || '-'}
                          </span>
                          {product.featured && (
                            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-[10px]">
                              แนะนำ
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-zinc-900 dark:text-white truncate mt-1">
                          {product.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {formatPrice(product.price)}
                      </span>
                      {product.isUsed ? (
                        <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded text-[10px]">
                          มือสอง
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-[10px]">
                          ของใหม่
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] text-zinc-600 dark:text-zinc-400">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    ดู
                  </Link>
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    ลบ
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 text-center py-12">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              ยังไม่มีสินค้า
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              เริ่มต้นเพิ่มสินค้าใหม่ของคุณ
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              เพิ่มสินค้าแรก
            </button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">
              {products.length}
            </div>
            <div className="text-zinc-500 dark:text-zinc-400 text-sm">สินค้าทั้งหมด</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="text-3xl font-bold text-blue-600">
              {products.filter(p => p.featured).length}
            </div>
            <div className="text-zinc-500 dark:text-zinc-400 text-sm">สินค้าแนะนำ</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="text-3xl font-bold text-orange-600">
              {products.filter(p => p.isUsed).length}
            </div>
            <div className="text-zinc-500 dark:text-zinc-400 text-sm">สินค้ามือสอง</div>
          </div>
        </div>
      </div>
    </div>
  );
}
