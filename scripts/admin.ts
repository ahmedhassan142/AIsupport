// scripts/setup-admin.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-ai-support';

// Define the Admin schema (same as above)
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️ Admin already exists. Updating...');
      existingAdmin.password = 'admin123';
      existingAdmin.email = 'admin@support.com';
      existingAdmin.name = 'System Administrator';
      await existingAdmin.save();
      console.log('✅ Admin updated successfully!');
    } else {
      // Create new admin
      const admin = new Admin({
        username: 'admin',
        password: 'admin123', // Will be hashed automatically
        email: 'admin@support.com',
        name: 'System Administrator',
        role: 'super_admin',
        isActive: true
      });
      
      await admin.save();
      console.log('✅ Admin created successfully!');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@support.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  Please change password after first login!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();