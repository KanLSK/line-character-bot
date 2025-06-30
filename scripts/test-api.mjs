// Standalone script to test the /api/characters endpoint
// Usage: node scripts/test-api.mjs

import fetch from 'node-fetch';

const apiUrl = process.env.API_URL || 'http://localhost:3000/api/characters';

try {
  const res = await fetch(apiUrl);
  const data = await res.json();
  console.log('GET /api/characters response:', data);
  process.exit(0);
} catch (error) {
  console.error('❌ API test failed:', error);
  process.exit(1);
} 