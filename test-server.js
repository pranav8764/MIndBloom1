// Simple test script to verify server functionality
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testServer() {
  console.log('🧪 Testing MindBloom Server...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test user registration
    console.log('\n2. Testing user registration...');
    const testUser = {
      username: 'testuser' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };
    
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    console.log('✅ User registration passed');
    
    const token = registerResponse.data.token;
    const userId = registerResponse.data.user.id;
    
    // Test authentication
    console.log('\n3. Testing authentication...');
    const authHeaders = { Authorization: `Bearer ${token}` };
    
    const meResponse = await axios.get(`${API_BASE}/auth/me`, { headers: authHeaders });
    console.log('✅ Authentication passed');
    
    // Test stats endpoint
    console.log('\n4. Testing stats endpoint...');
    const statsResponse = await axios.get(`${API_BASE}/auth/stats`, { headers: authHeaders });
    console.log('✅ Stats endpoint passed:', statsResponse.data);
    
    // Test journal creation
    console.log('\n5. Testing journal creation...');
    const journalEntry = {
      mood: 8,
      content: 'This is a test journal entry',
      tags: ['test', 'automation'],
      gratitude: ['Testing works!']
    };
    
    const journalResponse = await axios.post(`${API_BASE}/journal`, journalEntry, { headers: authHeaders });
    console.log('✅ Journal creation passed');
    
    // Test journal retrieval
    console.log('\n6. Testing journal retrieval...');
    const journalsResponse = await axios.get(`${API_BASE}/journal`, { headers: authHeaders });
    console.log('✅ Journal retrieval passed, entries:', journalsResponse.data.journalEntries?.length || 0);
    
    // Test achievements initialization
    console.log('\n7. Testing achievements initialization...');
    const achievementsResponse = await axios.post(`${API_BASE}/achievements/initialize`, {}, { headers: authHeaders });
    console.log('✅ Achievements initialization passed, created:', achievementsResponse.data.length);
    
    console.log('\n🎉 All tests passed! Server is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.error('Stack:', error.stack);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testServer();
}

module.exports = testServer;