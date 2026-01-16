import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

// Route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Client upload handler สำหรับ Vercel Blob
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // ตรวจสอบ file type จาก pathname
        const ext = pathname.split('.').pop()?.toLowerCase();
        const videoExtensions = ['mp4', 'webm', 'mov'];
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        const isVideo = videoExtensions.includes(ext || '');
        const isImage = imageExtensions.includes(ext || '');
        
        if (!isVideo && !isImage) {
          throw new Error('ไฟล์ไม่ใช่ประเภทที่รองรับ');
        }

        // กำหนด max size ตามประเภทไฟล์
        const maximumSizeInBytes = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;

        return {
          maximumSizeInBytes,
          allowedContentTypes: isVideo 
            ? ['video/mp4', 'video/webm', 'video/quicktime']
            : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // ทำอะไรหลังอัพโหลดเสร็จ (optional)
        console.log('Upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Client upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
