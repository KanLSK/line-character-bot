// Standalone script to simulate a Line webhook event with valid signature
// Usage: node scripts/test-webhook.mjs

import fetch from 'node-fetch';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log('LINE_CHANNEL_SECRET:', process.env.LINE_CHANNEL_SECRET);

const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhook/line';
const secret = process.env.LINE_CHANNEL_SECRET;
if (!secret) {
  throw new Error('LINE_CHANNEL_SECRET is not set. Check your .env.local and dotenv config.');
}

function sign(body) {
  return crypto.createHmac('SHA256', secret).update(body, 'utf8').digest('base64');
}

async function testValidSignature() {
  const event = {
    events: [
      {
        type: 'message',
        replyToken: 'testtoken',
        source: { userId: 'U1234567890', type: 'user' },
        message: { id: '1', type: 'text', text: 'Hello!' }
      }
    ]
  };
  const body = JSON.stringify(event);
  const signature = sign(body);
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-line-signature': signature },
    body
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = { error: 'Non-JSON or empty response', status: res.status };
  }
  console.log('✅ Valid signature test:', data);
}

async function testInvalidSignature() {
  const event = {
    events: [
      {
        type: 'message',
        replyToken: 'testtoken',
        source: { userId: 'U1234567890', type: 'user' },
        message: { id: '1', type: 'text', text: 'Hello again!' }
      }
    ]
  };
  const body = JSON.stringify(event);
  const signature = 'invalidsignature';
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-line-signature': signature },
    body
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = { error: 'Non-JSON or empty response', status: res.status };
  }
  console.log('✅ Invalid signature test:', data);
}

async function testFollowEvent() {
  const event = {
    events: [
      {
        type: 'follow',
        replyToken: 'testtoken',
        source: { userId: 'U1234567890', type: 'user' }
      }
    ]
  };
  const body = JSON.stringify(event);
  const signature = sign(body);
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-line-signature': signature },
    body
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = { error: 'Non-JSON or empty response', status: res.status };
  }
  console.log('✅ Follow event test:', data);
}

async function testUnfollowEvent() {
  const event = {
    events: [
      {
        type: 'unfollow',
        source: { userId: 'U1234567890', type: 'user' }
      }
    ]
  };
  const body = JSON.stringify(event);
  const signature = sign(body);
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-line-signature': signature },
    body
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = { error: 'Non-JSON or empty response', status: res.status };
  }
  console.log('✅ Unfollow event test:', data);
}

async function testMalformedRequest() {
  const body = '{invalidJson:';
  const signature = sign(body);
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-line-signature': signature },
    body
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = { error: 'Malformed response or non-JSON', status: res.status };
  }
  console.log('✅ Malformed request test:', data);
}

(async () => {
  await testValidSignature();
  await testInvalidSignature();
  await testFollowEvent();
  await testUnfollowEvent();
  await testMalformedRequest();
  process.exit(0);
})(); 