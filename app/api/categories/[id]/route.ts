import { NextRequest, NextResponse } from 'next/server';
import { getCategories, saveCategories, getProducts } from '@/lib/db';
import { Category } from '@/lib/categories';

// GET - ดึงหมวดหมู่ตาม ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categories = await getCategories();
    const category = categories.find(c => c.id === id);
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('GET category error:', error);
    return NextResponse.json({ error: 'Failed to read category' }, { status: 500 });
  }
}

// PUT - แก้ไขหมวดหมู่
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const categories = await getCategories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    // ตรวจสอบว่าชื่อซ้ำหรือไม่ (ยกเว้นตัวเอง)
    if (body.name && categories.some(cat => cat.name === body.name && cat.id !== id)) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }
    
    const existingCategory = categories[index];
    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const updatedCategory: Category = {
      id: existingCategory.id,
      name: body.name ?? existingCategory.name,
      icon: body.icon ?? existingCategory.icon,
      description: body.description ?? existingCategory.description,
    };
    
    categories[index] = updatedCategory;
    await saveCategories(categories);
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('PUT category error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE - ลบหมวดหมู่
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categories = await getCategories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    const categoryToDelete = categories[index];
    if (!categoryToDelete) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    // ตรวจสอบว่ามีสินค้าในหมวดหมู่นี้หรือไม่
    const products = await getProducts();
    const categoryName = categoryToDelete.name;
    const productsInCategory = products.filter(p => p.category === categoryName);
    
    if (productsInCategory.length > 0) {
      return NextResponse.json({ 
        error: `ไม่สามารถลบได้ มีสินค้า ${productsInCategory.length} รายการในหมวดหมู่นี้` 
      }, { status: 400 });
    }
    
    const deletedCategory = categories.splice(index, 1)[0];
    await saveCategories(categories);
    
    return NextResponse.json({ message: 'Category deleted', category: deletedCategory });
  } catch (error) {
    console.error('DELETE category error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
