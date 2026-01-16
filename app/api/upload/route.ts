import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

// Route segment config - เพิ่ม body size limit เป็น 50MB สำหรับวิดีโอ
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

// Helper function to get the base URL
function getBaseUrl(request: NextRequest): string {
  // Try to get from headers first
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  
  if (host) {
    return `${protocol}://${host}`;
  }
  
  // Fallback to environment variable or localhost
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

// POST - อัพโหลดรูปภาพและวิดีโอ
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadedPaths: string[] = [];
    const baseUrl = getBaseUrl(request);

    for (const file of files) {
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      
      // ตรวจสอบประเภทไฟล์
      if (!isImage && !isVideo) {
        return NextResponse.json({ 
          error: `ไฟล์ ${file.name} ไม่ใช่ไฟล์ที่รองรับ (รองรับ: JPG, PNG, GIF, WebP, MP4, WebM, MOV)` 
        }, { status: 400 });
      }

      // ตรวจสอบขนาดไฟล์ตามประเภท
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      const maxSizeText = isVideo ? '50MB' : '5MB';
      if (file.size > maxSize) {
        return NextResponse.json({ 
          error: `ไฟล์ ${file.name} มีขนาดเกิน ${maxSizeText}` 
        }, { status: 400 });
      }

      // สร้างชื่อไฟล์ unique
      const ext = file.name.split('.').pop();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const folder = isVideo ? 'videos' : 'products';

      if (isProduction) {
        // Production - ใช้ Vercel Blob
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
        }
        
        const blob = await put(`${folder}/${uniqueName}`, file, {
          access: 'public',
        });
        uploadedPaths.push(blob.url);
      } else {
        // Development - ใช้ local file system
        const uploadDir = path.join(process.cwd(), 'public', 'images', folder);
        
        // สร้างโฟลเดอร์ถ้ายังไม่มี
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const filePath = path.join(uploadDir, uniqueName);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        fs.writeFileSync(filePath, buffer);
        
        // เก็บเป็น full URL แทน relative path เพื่อให้ใช้งานบน mobile ได้
        uploadedPaths.push(`${baseUrl}/images/${folder}/${uniqueName}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      paths: uploadedPaths 
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to upload: ${errorMessage}` }, { status: 500 });
  }
}
