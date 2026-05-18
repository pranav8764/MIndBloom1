/**
 * Test script for the Leaderboard endpoint (Task 11)
 * 
 * Verifies:
 * 1. GET /api/auth/leaderboard requires authentication (returns 401/403)
 * 2. Route implementation in userRoutes.js conforms to all specifications:
 *    - Parses limit query parameter (default 10)
 *    - Queries User collection and selects public fields only
 *    - Sorts by xp descending
 *    - Applies limit
 *    - Handles errors with 500 status
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5001;
const HOST = 'localhost';

function checkUnauthenticated() {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/auth/leaderboard',
      method: 'GET',
    };

    console.log(`📡 Sending GET request to http://${HOST}:${PORT}/api/auth/leaderboard without auth header...`);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({ statusCode: null, error: err.message });
    });

    req.end();
  });
}

function verifyImplementation() {
  console.log('\n🔍 Performing static code analysis on server/routes/userRoutes.js...');
  
  try {
    const userRoutesPath = path.join(__dirname, '..', 'routes', 'userRoutes.js');
    const code = fs.readFileSync(userRoutesPath, 'utf8');
    
    const checks = [
      {
        name: 'Leaderboard route definition',
        pattern: /router\.get\(\s*["']\/leaderboard["']\s*,\s*auth/,
        description: 'GET /leaderboard endpoint registered with auth middleware'
      },
      {
        name: 'Limit query parameter parsing',
        pattern: /parseInt\(\s*req\.query\.limit\s*\)\s*\|\|\s*10/,
        description: 'Parses req.query.limit with a default value of 10'
      },
      {
        name: 'User collection query',
        pattern: /User\.find\(\s*\{\s*\}\s*\)/,
        description: 'Queries all users in MongoDB'
      },
      {
        name: 'Public field selection',
        pattern: /\.select\(\s*["']username\s+firstName\s+lastName\s+avatar\s+xp\s+level["']\s*\)/,
        description: 'Selects username, firstName, lastName, avatar, xp, and level fields only'
      },
      {
        name: 'Sort by XP descending',
        pattern: /\.sort\(\s*\{\s*xp\s*:\s*-1\s*\}\s*\)/,
        description: 'Sorts results by XP in descending order'
      },
      {
        name: 'Result limit application',
        pattern: /\.limit\(\s*limit\s*\)/,
        description: 'Applies limit parameter'
      },
      {
        name: 'Error handling',
        pattern: /res\.status\(\s*500\s*\)\.json\s*\(\s*\{\s*message\s*:\s*["']Server error["']/,
        description: 'Returns 500 Server error JSON on failure'
      }
    ];

    let passed = 0;
    checks.forEach(check => {
      if (check.pattern.test(code)) {
        console.log(`   ✅ PASS: ${check.name}`);
        console.log(`      ↳ ${check.description}`);
        passed++;
      } else {
        console.log(`   ❌ FAIL: ${check.name}`);
        console.log(`      ↳ Expected pattern not found: ${check.pattern.toString()}`);
      }
    });

    return passed === checks.length;
  } catch (err) {
    console.error('❌ FAIL: Could not read userRoutes.js', err.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Leaderboard Endpoint (Task 11)\n');
  
  // 1. Dynamic Check
  const response = await checkUnauthenticated();
  let dynamicPass = false;
  
  if (response.statusCode === 401) {
    console.log('   ✅ PASS: Request rejected with 401 Unauthorized (Clerk auth required)');
    dynamicPass = true;
  } else if (response.statusCode === 403) {
    console.log('   ✅ PASS: Request rejected with 403 Forbidden (Auth required)');
    dynamicPass = true;
  } else if (response.statusCode === 302 || response.statusCode === 307) {
    console.log(`   ✅ PASS: Request redirected with ${response.statusCode} (Clerk redirecting signed-out user)`);
    dynamicPass = true;
  } else {
    console.log(`   ❌ FAIL: Expected 401/403/302 but got status ${response.statusCode || 'ERROR'}`);
    if (response.error) console.log(`      Error: ${response.error}`);
  }
  
  // 2. Static Check
  const staticPass = verifyImplementation();
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Dynamic Auth Check:  ${dynamicPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Implementation Spec: ${staticPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(60));
  
  if (dynamicPass && staticPass) {
    console.log('\n🎉 SUCCESS: All leaderboard tests passed! Requirement 6.4, 6.5 satisfied.');
    process.exit(0);
  } else {
    console.log('\n⚠️  FAILURE: Some leaderboard checks failed.');
    process.exit(1);
  }
}

runTests();
