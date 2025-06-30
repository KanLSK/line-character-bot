// Script to test the /api/characters endpoint
// Usage: node scripts/test-api.js

import fetch from 'node-fetch';

try {
  const res = await fetch('http://localhost:3000/api/characters');
  const data = await res.json();
  console.log('GET /api/characters response:', data);
} catch (error) {
  console.error('❌ API test failed:', error);
} 