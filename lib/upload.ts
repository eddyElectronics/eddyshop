import { upload } from '@vercel/blob/client';

// Check if running in production (Vercel)
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

interface UploadResult {
  success: boolean;
  paths: string[];
  error?: string;
}

// Upload files - uses Vercel Blob client upload in production, server upload in development
export async function uploadFiles(files: File[]): Promise<UploadResult> {
  if (files.length === 0) {
    return { success: true, paths: [] };
  }

  if (isProduction) {
    // Production - use Vercel Blob client-side upload
    try {
      const uploadedPaths: string[] = [];
      
      for (const file of files) {
        const isVideo = file.type.startsWith('video/');
        const folder = isVideo ? 'videos' : 'products';
        const ext = file.name.split('.').pop();
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        
        const blob = await upload(`${folder}/${uniqueName}`, file, {
          access: 'public',
          handleUploadUrl: '/api/upload-client',
        });
        
        uploadedPaths.push(blob.url);
      }
      
      return { success: true, paths: uploadedPaths };
    } catch (error) {
      console.error('Client upload error:', error);
      return { 
        success: false, 
        paths: [], 
        error: error instanceof Error ? error.message : 'อัพโหลดไม่สำเร็จ' 
      };
    }
  } else {
    // Development - use server-side upload
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        return { success: true, paths: data.paths };
      } else {
        const errorData = await res.json();
        return { success: false, paths: [], error: errorData.error || 'อัพโหลดไม่สำเร็จ' };
      }
    } catch (error) {
      console.error('Server upload error:', error);
      return { 
        success: false, 
        paths: [], 
        error: error instanceof Error ? error.message : 'อัพโหลดไม่สำเร็จ' 
      };
    }
  }
}
