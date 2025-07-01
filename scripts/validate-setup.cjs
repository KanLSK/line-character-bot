require('dotenv').config({ path: '.env.local' });

// Pre-deployment validation script for Line Bot
const fs = require('fs');
const path = require('path');

// List of required files
const requiredFiles = [
  '.env.local',
  'utils/env-validation.ts',
  'lib/line-client.ts',
  'utils/verify-signature.ts',
  'utils/logger.ts',
  'app/api/webhook/line/route.ts',
  'types/line.ts',
];

function checkFiles() {
  let allExist = true;
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(process.cwd(), file))) {
      console.error(`Missing required file: ${file}`);
      allExist = false;
    }
  }
  return allExist;
}

function checkEnvVars() {
  const requiredVars = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET',
    'MONGODB_URI',
    'OPENAI_API_KEY',
  ];
  let allExist = true;
  for (const v of requiredVars) {
    if (!process.env[v]) {
      console.error(`Missing environment variable: ${v}`);
      allExist = false;
    }
  }
  return allExist;
}

async function main() {
  let ok = true;
  // 1. Check required files
  if (!checkFiles()) ok = false;

  // 2. Check environment variables
  if (!checkEnvVars()) ok = false;

  // 3. (Optional) Add DB and API connectivity checks here
  // For full checks, run the healthCheck utility from utils/health-check.ts

  if (ok) {
    console.log('✅ Pre-deployment validation passed.');
    process.exit(0);
  } else {
    console.error('❌ Pre-deployment validation failed.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

// Usage:
// node scripts/validate-setup.js 