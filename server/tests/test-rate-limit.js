/**
 * Test script for rate limiting on auth endpoints
 * Makes 21 requests to /api/auth/login to verify rate limiting works
 */

const http = require('http');

const PORT = process.env.PORT || 5001;
const HOST = 'localhost';

function makeRequest(requestNumber) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          requestNumber,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    // Send empty body
    req.write(JSON.stringify({}));
    req.end();
  });
}

async function testRateLimit() {
  console.log('🧪 Testing rate limiting on /api/auth/login endpoint');
  console.log(`📍 Target: http://${HOST}:${PORT}/api/auth/login`);
  console.log('📊 Expected: First 20 requests succeed, 21st request returns 429\n');

  const results = [];

  for (let i = 1; i <= 21; i++) {
    try {
      const result = await makeRequest(i);
      results.push(result);

      const emoji = result.statusCode === 429 ? '🚫' : '✅';
      console.log(
        `${emoji} Request ${i}: Status ${result.statusCode} - ${result.statusMessage}`
      );

      // If we get a 429, show the response body
      if (result.statusCode === 429) {
        try {
          const body = JSON.parse(result.body);
          console.log(`   Message: "${body.message}"`);
        } catch (e) {
          console.log(`   Body: ${result.body}`);
        }
      }

      // Small delay between requests to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`❌ Request ${i} failed:`, error.message);
    }
  }

  // Summary
  console.log('\n📈 Test Summary:');
  const successCount = results.filter((r) => r.statusCode === 200).length;
  const rateLimitedCount = results.filter((r) => r.statusCode === 429).length;

  console.log(`   ✅ Successful requests: ${successCount}`);
  console.log(`   🚫 Rate-limited requests: ${rateLimitedCount}`);

  // Verify expected behavior
  if (successCount === 20 && rateLimitedCount === 1) {
    console.log('\n✅ PASS: Rate limiting is working correctly!');
    console.log('   - First 20 requests succeeded (200 OK)');
    console.log('   - 21st request was rate-limited (429 Too Many Requests)');
    process.exit(0);
  } else {
    console.log('\n❌ FAIL: Rate limiting is not working as expected');
    console.log(`   - Expected: 20 successful, 1 rate-limited`);
    console.log(`   - Actual: ${successCount} successful, ${rateLimitedCount} rate-limited`);
    process.exit(1);
  }
}

// Check if server is running before testing
const checkServer = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/health',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`Server returned status ${res.statusCode}`));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

// Main execution
(async () => {
  try {
    console.log('🔍 Checking if server is running...');
    await checkServer();
    console.log('✅ Server is running\n');
    await testRateLimit();
  } catch (error) {
    console.error('❌ Error: Server is not running or not accessible');
    console.error(`   Make sure the server is running on http://${HOST}:${PORT}`);
    console.error(`   Run: cd server && npm run dev`);
    process.exit(1);
  }
})();
