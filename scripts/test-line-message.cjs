require('dotenv').config({ path: '.env.local' });

const https = require('https');

// Test sending a simple message
async function testLineMessage(userId, message) {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  
  if (!channelAccessToken) {
    console.error('❌ LINE_CHANNEL_ACCESS_TOKEN not found in environment');
    return;
  }

  if (!userId) {
    console.error('❌ Please provide a userId');
    console.log('Usage: node scripts/test-line-message.cjs <userId> [message]');
    return;
  }

  const data = JSON.stringify({
    to: userId,
    messages: [{
      type: 'text',
      text: message || 'สวัสดีครับ! นี่คือข้อความทดสอบ 😊'
    }]
  });

  const options = {
    hostname: 'api.line.me',
    port: 443,
    path: '/v2/bot/message/push',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}`,
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`📤 Status: ${res.statusCode}`);
        console.log(`📤 Response: ${responseData}`);
        
        if (res.statusCode === 200) {
          console.log('✅ Message sent successfully!');
        } else {
          console.log('❌ Failed to send message');
        }
        
        resolve({ statusCode: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Get command line arguments
const userId = process.argv[2];
const message = process.argv[3];

console.log('🧪 Testing Line Message API...');
console.log(`👤 User ID: ${userId}`);
console.log(`💬 Message: ${message || 'Default test message'}`);
console.log('');

testLineMessage(userId, message)
  .then(() => {
    console.log('\n🎉 Test completed!');
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
  }); 