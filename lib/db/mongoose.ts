// lib/db/mongoose.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ah770643:2H3IHP4cvAsXzhW8@cluster0.bdbqw.mongodb.net/AIsupport?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable');
}
//@ts-ignore
let cached = global.mongoose;

if (!cached) {
    
//@ts-ignore
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Create default admin if none exists
export async function initAdmin() {
  const { Admin } = await import('@/models/Admin');
  const adminExists = await Admin.findOne({ username: 'admin' });
  
  if (!adminExists) {
    const admin = new Admin({
      username: 'admin',
      password: 'admin123', // Change this on first login
      email: 'admin@yoursite.com'
    });
    await admin.save();
    console.log('✅ Default admin created: username: admin, password: admin123');
  }
}