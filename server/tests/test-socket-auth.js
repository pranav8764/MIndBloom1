/**
 * Manual test script for Socket.IO authentication
 * 
 * This script tests the Socket.IO authentication middleware by:
 * 1. Attempting to connect without a token (should fail)
 * 2. Attempting to connect with an invalid token (should fail)
 * 
 * To run: node test-socket-auth.js
 */

const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:5001';

console.log('🧪 Testing Socket.IO Authentication\n');

// Test 1: Connection without token
console.log('Test 1: Attempting connection without token...');
const socket1 = io(SERVER_URL, {
  transports: ['websocket'],
  reconnection: false
});

socket1.on('connect', () => {
  console.log('❌ FAIL: Connected without token (should have been rejected)');
  socket1.disconnect();
  runTest2();
});

socket1.on('connect_error', (error) => {
  console.log('✅ PASS: Connection rejected without token');
  console.log('   Error:', error.message);
  socket1.disconnect();
  runTest2();
});

// Test 2: Connection with invalid token
function runTest2() {
  console.log('\nTest 2: Attempting connection with invalid token...');
  const socket2 = io(SERVER_URL, {
    auth: {
      token: 'invalid-token-12345'
    },
    transports: ['websocket'],
    reconnection: false
  });

  socket2.on('connect', () => {
    console.log('❌ FAIL: Connected with invalid token (should have been rejected)');
    socket2.disconnect();
    process.exit(1);
  });

  socket2.on('connect_error', (error) => {
    console.log('✅ PASS: Connection rejected with invalid token');
    console.log('   Error:', error.message);
    socket2.disconnect();
    
    console.log('\n✅ All tests passed! Socket.IO authentication is working correctly.');
    console.log('\nNote: To test with a valid token, you need to:');
    console.log('1. Log in through the frontend');
    console.log('2. Get the Clerk token from localStorage');
    console.log('3. Use that token to connect to Socket.IO');
    process.exit(0);
  });
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test interrupted');
  process.exit(0);
});
