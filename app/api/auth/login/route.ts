import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'sontaya2007$';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true });
      
      // ตั้ง cookie สำหรับ session (หมดอายุใน 24 ชั่วโมง)
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
      
      return response;
    }
    
    return NextResponse.json({ success: false, error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
