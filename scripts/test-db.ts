// Script to test MongoDB connection
// Usage: npx ts-node scripts/test-db.ts

import { connectToDatabase } from '../lib/db-utils';

(async () => {
  try {
    await connectToDatabase();
    console.log('✅ Database connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
})(); 