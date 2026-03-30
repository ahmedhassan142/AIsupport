// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, updateAdminLastLogin, getAdminUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    console.log('🔐 Login attempt for:', username);
    console.log('📝 Password provided:', password ? 'Yes' : 'No');
    
    // Validate input
    if (!username || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Verify credentials
    console.log('🔍 Verifying credentials...');
    const isValid = await verifyAdmin(username, password);
    console.log('✅ Verification result:', isValid);
    
    if (!isValid) {
      console.log('❌ Invalid credentials for:', username);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Get admin user details
    console.log('👤 Fetching admin details...');
    const admin = await getAdminUser(username);
    console.log('📋 Admin found:', admin ? admin.username : 'No');
    
    if (!admin || !admin.isActive) {
      console.log('❌ Account disabled or not found');
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 401 }
      );
    }
    
    // Update last login
    console.log('⏰ Updating last login...');
    await updateAdminLastLogin(admin._id);
    
    // Create session token
    const sessionToken = Buffer.from(`${admin._id}:${admin.username}:${Date.now()}`).toString('base64');
    console.log('🔑 Session token created');
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'strict'
    });
    console.log('🍪 Cookie set successfully');
    
    // Return success
    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    
    if (!session) {
      return NextResponse.json({ authenticated: false });
    }
    
    const decoded = Buffer.from(session.value, 'base64').toString();
    const [adminId] = decoded.split(':');
    
    const admin = await getAdminUser(adminId);
    
    if (!admin || !admin.isActive) {
      return NextResponse.json({ authenticated: false });
    }
    
    return NextResponse.json({ 
      authenticated: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}