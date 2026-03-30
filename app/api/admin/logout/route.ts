// app/api/admin/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    
    return NextResponse.json({ 
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

// Optional: Also handle GET requests for logout
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    
    // Redirect to login page
    return NextResponse.redirect(new URL('/login', req.url));
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}