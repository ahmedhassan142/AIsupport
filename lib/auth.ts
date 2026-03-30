// lib/auth.ts
import bcrypt from 'bcryptjs';
import { Admin } from '@/models/Admin';
import { connectDB } from '@/lib/db/mongoose';

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  try {
    console.log('🔍 verifyAdmin called with:', username);
    await connectDB();
    console.log('✅ Database connected');
    
    // Try to find by username or email
    const admin = await Admin.findOne({ 
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });
    
    if (!admin) {
      console.log('❌ Admin not found for:', username);
      
      // List all admins for debugging (remove in production)
      const allAdmins = await Admin.find({}, { username: 1, email: 1 });
      console.log('📋 Available admins:', allAdmins.map(a => ({ username: a.username, email: a.email })));
      
      return false;
    }
    
    console.log('✅ Admin found:', admin.username);
    console.log('📝 Stored password hash length:', admin.password.length);
    
    const isValid = await bcrypt.compare(password, admin.password);
    console.log('🔐 Password comparison result:', isValid);
    
    return isValid;
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
}

export async function getAdminUser(identifier: string) {
  try {
    await connectDB();
    
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    
    let admin;
    if (isObjectId) {
      admin = await Admin.findById(identifier).select('-password');
      console.log('🔍 Found admin by ID:', admin ? admin.username : 'No');
    } else {
      admin = await Admin.findOne({ 
        $or: [
          { username: identifier.toLowerCase() },
          { email: identifier.toLowerCase() }
        ]
      }).select('-password');
      console.log('🔍 Found admin by username/email:', admin ? admin.username : 'No');
    }
    
    return admin;
  } catch (error) {
    console.error('Error fetching admin:', error);
    return null;
  }
}

export async function updateAdminLastLogin(adminId: string) {
  try {
    await connectDB();
    await Admin.findByIdAndUpdate(adminId, { 
      lastLogin: new Date() 
    });
    console.log('✅ Last login updated for:', adminId);
    return true;
  } catch (error) {
    console.error('Error updating last login:', error);
    return false;
  }
}