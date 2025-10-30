/**
 * Manual Test Script for Difficulty System
 * Run with: node test-difficulty.js
 */

const { LeaderboardManager, LocalLeaderboard } = require('./leaderboard.js');

console.log('🎯 Testing New Difficulty System\n');
console.log('='.repeat(60));

// Create a test instance
const leaderboard = new LocalLeaderboard();

// Test cases with expected difficulty ranges
const testCases = [
    // Mega hub to mega hub (should be very easy)
    { start: 'United_States', target: 'World_War_II', expected: '0.7-0.9 (Very Easy)' },
    
    // Easy tier (same category)
    { start: 'France', target: 'Germany', expected: '0.7-1.0 (Easy)' },
    { start: 'Physics', target: 'Chemistry', expected: '0.7-1.0 (Easy)' },
    
    // Medium tier (same category)
    { start: 'Albert_Einstein', target: 'Isaac_Newton', expected: '1.0-1.5 (Medium)' },
    { start: 'Napoleon', target: 'Julius_Caesar', expected: '1.0-1.5 (Medium)' },
    
    // Hard tier
    { start: 'Nikola_Tesla', target: 'Marie_Curie', expected: '1.5-2.5 (Hard)' },
    { start: 'Jazz', target: 'Opera', expected: '1.5-2.5 (Hard)' },
    
    // Mixed tiers
    { start: 'United_States', target: 'France', expected: '0.7-1.0 (Easy)' },
    { start: 'France', target: 'Albert_Einstein', expected: '1.0-1.5 (Medium)' },
    { start: 'France', target: 'Mars', expected: '1.2-1.8 (Medium-Hard)' },
    
    // Very different categories
    { start: 'Mars', target: 'Jazz', expected: '1.5-2.5 (Hard)' },
    
    // Unknown pages (default to medium)
    { start: 'Unknown_Page_1', target: 'Unknown_Page_2', expected: '1.0-1.5 (Medium Default)' },
];

console.log('\n📊 Running Test Cases:\n');

testCases.forEach((testCase, index) => {
    const difficulty = leaderboard.estimateDifficulty(testCase.start, testCase.target);
    
    console.log(`\nTest ${index + 1}:`);
    console.log(`  Route: "${testCase.start}" → "${testCase.target}"`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  Actual: ${difficulty.toFixed(2)}x`);
    
    // Visual indicator
    const stars = difficulty >= 2.5 ? '⭐⭐⭐⭐' :
                  difficulty >= 2.0 ? '⭐⭐⭐' :
                  difficulty >= 1.5 ? '⭐⭐' :
                  difficulty >= 1.0 ? '⭐' : '✓';
    console.log(`  Difficulty: ${stars}`);
});

console.log('\n' + '='.repeat(60));

// Test score calculation with different scenarios
console.log('\n💯 Testing Score Calculation:\n');

const scoreTests = [
    { name: 'Perfect Run', clicks: 3, time: 45, start: 'France', target: 'Germany' },
    { name: 'Good Run', clicks: 5, time: 75, start: 'France', target: 'Germany' },
    { name: 'Average Run', clicks: 10, time: 150, start: 'France', target: 'Germany' },
    { name: 'Slow Run', clicks: 15, time: 300, start: 'France', target: 'Germany' },
    { name: 'Hard Route - Fast', clicks: 5, time: 60, start: 'Mars', target: 'Jazz' },
    { name: 'Easy Route - Slow', clicks: 10, time: 200, start: 'United_States', target: 'France' },
];

scoreTests.forEach(test => {
    const score = leaderboard.calculateScore(test.clicks, test.time, test.start, test.target);
    const difficulty = leaderboard.estimateDifficulty(test.start, test.target);
    
    console.log(`\n${test.name}:`);
    console.log(`  Route: "${test.start}" → "${test.target}"`);
    console.log(`  Clicks: ${test.clicks} | Time: ${test.time}s`);
    console.log(`  Difficulty: ${difficulty.toFixed(2)}x`);
    console.log(`  Score: ${score} points`);
});

console.log('\n' + '='.repeat(60));
console.log('\n✅ Difficulty System Test Complete!\n');

// Test metadata retrieval
console.log('📋 Testing Page Metadata:\n');

const metadataTests = [
    'United_States',
    'France',
    'Albert_Einstein',
    'Nikola_Tesla',
    'Unknown_Page'
];

metadataTests.forEach(page => {
    const normalizedPage = page.toLowerCase().replace(/_/g, ' ');
    const metadata = leaderboard.getPageMetadata(normalizedPage);
    
    console.log(`\n${page}:`);
    console.log(`  Tier: ${metadata.tier}`);
    console.log(`  Category: ${metadata.category}`);
    console.log(`  Popularity: ${metadata.popularity}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n🎮 All tests completed successfully!');
