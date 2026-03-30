// scripts/test-admin.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-ai-support';

const AdminSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  isActive: Boolean
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function testAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find admin
    const admin = await Admin.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('❌ No admin found with username "admin"');
      console.log('\nAll admins in database:');
      const allAdmins = await Admin.find({});
      console.log(allAdmins.map(a => ({ username: a.username, email: a.email })));
      process.exit(1);
    }
    
    console.log('✅ Admin found:', {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      isActive: admin.isActive,
      passwordHashLength: admin.password.length
    });
    
    // Test password
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, admin.password);
    console.log(`\n🔐 Password "${testPassword}" verification:`, isValid ? '✅ VALID' : '❌ INVALID');
    
    if (!isValid) {
      console.log('\n⚠️ Password doesn\'t match. Creating new admin...');
      
      // Create new admin with correct password
      const newHash = await bcrypt.hash(testPassword, 10);
      admin.password = newHash;
      await admin.save();
      console.log('✅ Admin password reset to "admin123"');
      
      // Verify again
      const newVerify = await bcrypt.compare(testPassword, admin.password);
      console.log('🔐 New password verification:', newVerify ? '✅ PASSED' : '❌ FAILED');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testAdmin();