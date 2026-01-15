import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Category } from '@/lib/categories';

const dataFilePath = path.join(process.cwd(), 'data', 'categories.json');

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

// GET - ดึงหมวดหมู่ทั้งหมด
export async function GET() {
  try {
    const categories = readCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read categories' }, { status: 500 });
  }
}

// POST - เพิ่มหมวดหมู่ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const categories = readCategories();
    
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
    
    categories.push(newCategory);
    writeCategories(categories);
    
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
