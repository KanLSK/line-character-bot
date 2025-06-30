// Script to test MongoDB connection
// Usage: node scripts/test-db.js
import { connectToDatabase } from '../dist/lib/db-utils.js';

(async () => {
  try {
    // Dynamically import the ES module utility
    await connectToDatabase();
    console.log('✅ Database connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
})(); 