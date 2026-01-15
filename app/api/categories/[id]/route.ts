import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Category } from '@/lib/categories';

const dataFilePath = path.join(process.cwd(), 'data', 'categories.json');
const productsFilePath = path.join(process.cwd(), 'data', 'products.json');

function readCategories(): Category[] {
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch {
    return [];
  }
}

function writeCategories(categories: Category[]): void {
  fs.writeFileSync(dataFilePath, JSON.stringify(categories, null, 2), 'utf8');
}

function readProducts(): any[] {
  try {
    const fileContents = fs.readFileSync(productsFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch {
    return [];
  }
}

// GET - ดึงหมวดหมู่ตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categories = readCategories();
    const category = categories.find(c => c.id === id);
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
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
    const categories = readCategories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    // ตรวจสอบว่าชื่อซ้ำหรือไม่ (ยกเว้นตัวเอง)
    if (body.name && categories.some(cat => cat.name === body.name && cat.id !== id)) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }
    
    const updatedCategory: Category = {
      ...categories[index],
      name: body.name ?? categories[index].name,
      icon: body.icon ?? categories[index].icon,
      description: body.description ?? categories[index].description,
    };
    
    categories[index] = updatedCategory;
    writeCategories(categories);
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE - ลบหมวดหมู่
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categories = readCategories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    // ตรวจสอบว่ามีสินค้าในหมวดหมู่นี้หรือไม่
    const products = readProducts();
    const categoryName = categories[index].name;
    const productsInCategory = products.filter(p => p.category === categoryName);
    
    if (productsInCategory.length > 0) {
      return NextResponse.json({ 
        error: `ไม่สามารถลบได้ มีสินค้า ${productsInCategory.length} รายการในหมวดหมู่นี้` 
      }, { status: 400 });
    }
    
    const deletedCategory = categories.splice(index, 1)[0];
    writeCategories(categories);
    
    return NextResponse.json({ message: 'Category deleted', category: deletedCategory });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
