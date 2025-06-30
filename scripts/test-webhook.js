// Script to simulate a Line webhook event
// Usage: node scripts/test-webhook.js

import fetch from 'node-fetch';

const webhookUrl = 'http://localhost:3000/api/webhook/line';
const sampleEvent = {
  events: [
    {
      type: 'message',
      replyToken: 'testtoken',
      source: { userId: 'U1234567890', type: 'user' },
      message: { id: '1', type: 'text', text: 'Hello!' }
    }
  ]
};

try {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sampleEvent)
  });
  const data = await res.json();
  console.log('Webhook response:', data);
} catch (error) {
  console.error('❌ Webhook test failed:', error);
} 