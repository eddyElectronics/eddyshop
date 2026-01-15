import { NextRequest, NextResponse } from 'next/server';
import { getCategories, addCategory } from '@/lib/db';
import { Category } from '@/lib/categories';

// GET - ดึงหมวดหมู่ทั้งหมด
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('GET categories error:', error);
    return NextResponse.json({ error: 'Failed to read categories' }, { status: 500 });
  }
}

// POST - เพิ่มหมวดหมู่ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const categories = await getCategories();
    
    // ตรวจสอบว่าชื่อซ้ำหรือไม่
    if (categories.some(cat => cat.name === body.name)) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }
    
    const newCategory: Category = {
      id: Date.now().toString(),
      name: body.name,
      icon: body.icon || '📦',
      description: body.description || '',
    };
    
    await addCategory(newCategory);
    
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('POST category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
