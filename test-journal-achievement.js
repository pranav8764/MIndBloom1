/**
 * Manual test script for Task 4.3: Trigger 'First Steps' achievement in journalRoutes.js
 * 
 * This script tests:
 * 1. Creating a journal entry triggers "First Steps" achievement progress
 * 2. stats.totalJournalEntries is incremented
 * 3. isPrivate field is properly stored
 */

const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

// You need to replace this with a valid Clerk token
// To get a token:
// 1. Log in to the app in the browser
// 2. Open browser console
// 3. Run: localStorage.getItem('clerk_token')
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || 'YOUR_TOKEN_HERE';

async function testJournalAchievement() {
  console.log('🧪 Testing Journal Achievement Implementation (Task 4.3)\n');

  try {
    // Step 1: Get user stats before creating journal entry
    console.log('📊 Step 1: Getting user stats before journal entry...');
    const statsBefore = await axios.get(`${API_URL}/auth/stats`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    console.log('✅ Stats before:', {
      totalJournalEntries: statsBefore.data.stats?.totalJournalEntries || 0,
      xp: statsBefore.data.xp
    });

    // Step 2: Get "First Steps" achievement progress before
    console.log('\n🏆 Step 2: Getting "First Steps" achievement before...');
    const achievementsBefore = await axios.get(`${API_URL}/achievements`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    const firstStepsBefore = achievementsBefore.data.find(a => a.title === 'First Steps');
    console.log('✅ First Steps achievement before:', {
      currentValue: firstStepsBefore?.currentValue || 0,
      target: firstStepsBefore?.target,
      isCompleted: firstStepsBefore?.isCompleted
    });

    // Step 3: Create a journal entry
    console.log('\n📝 Step 3: Creating a journal entry...');
    const journalEntry = await axios.post(`${API_URL}/journal`, {
      mood: 8,
      content: 'Test journal entry for achievement testing',
      prompt: 'How are you feeling today?',
      tags: ['test', 'achievement'],
      gratitude: ['Testing the achievement system'],
      activities: ['coding'],
      isPrivate: false
    }, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    console.log('✅ Journal entry created:', {
      id: journalEntry.data.journalEntry._id,
      isPrivate: journalEntry.data.journalEntry.isPrivate,
      mood: journalEntry.data.journalEntry.mood
    });

    // Step 4: Get user stats after creating journal entry
    console.log('\n📊 Step 4: Getting user stats after journal entry...');
    const statsAfter = await axios.get(`${API_URL}/auth/stats`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    console.log('✅ Stats after:', {
      totalJournalEntries: statsAfter.data.stats?.totalJournalEntries || 0,
      xp: statsAfter.data.xp
    });

    // Step 5: Get "First Steps" achievement progress after
    console.log('\n🏆 Step 5: Getting "First Steps" achievement after...');
    const achievementsAfter = await axios.get(`${API_URL}/achievements`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    const firstStepsAfter = achievementsAfter.data.find(a => a.title === 'First Steps');
    console.log('✅ First Steps achievement after:', {
      currentValue: firstStepsAfter?.currentValue || 0,
      target: firstStepsAfter?.target,
      isCompleted: firstStepsAfter?.isCompleted
    });

    // Step 6: Verify the changes
    console.log('\n✨ Step 6: Verification Results:');
    const statsIncremented = (statsAfter.data.stats?.totalJournalEntries || 0) === 
                             (statsBefore.data.stats?.totalJournalEntries || 0) + 1;
    const achievementIncremented = (firstStepsAfter?.currentValue || 0) === 
                                   (firstStepsBefore?.currentValue || 0) + 1;
    const isPrivateStored = journalEntry.data.journalEntry.isPrivate === false;

    console.log(`${statsIncremented ? '✅' : '❌'} stats.totalJournalEntries incremented: ${statsBefore.data.stats?.totalJournalEntries || 0} → ${statsAfter.data.stats?.totalJournalEntries || 0}`);
    console.log(`${achievementIncremented ? '✅' : '❌'} "First Steps" progress incremented: ${firstStepsBefore?.currentValue || 0} → ${firstStepsAfter?.currentValue || 0}`);
    console.log(`${isPrivateStored ? '✅' : '❌'} isPrivate field stored correctly: ${journalEntry.data.journalEntry.isPrivate}`);

    if (statsIncremented && achievementIncremented && isPrivateStored) {
      console.log('\n🎉 All tests passed! Task 4.3 implementation is correct.');
      return true;
    } else {
      console.log('\n❌ Some tests failed. Please review the implementation.');
      return false;
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure to set a valid AUTH_TOKEN. Get it from:');
      console.log('   1. Log in to the app in browser');
      console.log('   2. Open browser console');
      console.log('   3. Run: localStorage.getItem("clerk_token")');
      console.log('   4. Set it as: TEST_AUTH_TOKEN=<token> node test-journal-achievement.js');
    }
    return false;
  }
}

// Run the test
if (require.main === module) {
  testJournalAchievement().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testJournalAchievement };
