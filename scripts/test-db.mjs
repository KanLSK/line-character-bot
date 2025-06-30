// Standalone script to test MongoDB connection
// Usage: node scripts/test-db.mjs

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI environment variable is not set.');
  process.exit(1);
}

try {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  console.log('✅ Database connection successful!');
  await client.close();
  process.exit(0);
} catch (error) {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
} 