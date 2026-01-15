import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// POST - อัพโหลดรูปภาพ
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadedPaths: string[] = [];

    for (const file of files) {
      // ตรวจสอบขนาดไฟล์ (< 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: `ไฟล์ ${file.name} มีขนาดเกิน 5MB` }, { status: 400 });
      }

      // ตรวจสอบประเภทไฟล์
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `ไฟล์ ${file.name} ไม่ใช่รูปภาพที่รองรับ` }, { status: 400 });
      }

      // สร้างชื่อไฟล์ unique
      const ext = file.name.split('.').pop();
      const uniqueName = `products/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      
      // อัพโหลดไปยัง Vercel Blob
      const blob = await put(uniqueName, file, {
        access: 'public',
      });
      
      uploadedPaths.push(blob.url);
    }

    return NextResponse.json({ 
      success: true, 
      paths: uploadedPaths 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}
