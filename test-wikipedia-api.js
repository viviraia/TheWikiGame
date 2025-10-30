// Test script to demonstrate Wikipedia API category fetching
// Run this in the browser console on the game page

async function testWikipediaAPI() {
    console.log('🧪 Testing Wikipedia API Integration for Difficulty Calculation\n');
    console.log('=' .repeat(80));
    
    // Create a test leaderboard manager
    const leaderboard = new LeaderboardManager('test-gist-id', null);
    
    // Test cases with pages from different difficulty tiers
    const testPages = [
        // Easy → Hard (different categories)
        ['Albert_Einstein', 'Niels_Bohr'],
        // Easy → Expert (different categories)
        ['France', 'Luxembourg'],
        // Easy → Expert (same category)
        ['World_War_II', 'Seven_Years\'_War'],
        // Expert → Easy (different categories)
        ['Thomas_Aquinas', 'Albert_Einstein']
    ];
    
    for (const [startPage, targetPage] of testPages) {
        console.log(`\n📊 Testing: "${startPage}" → "${targetPage}"`);
        console.log('-'.repeat(80));
        
        try {
            // Test with API enabled
            console.log('\n✅ WITH Wikipedia API (real categories):');
            const difficultyWithAPI = await leaderboard.estimateDifficulty(startPage, targetPage, true);
            
            // Test without API (keyword-based only)
            console.log('\n❌ WITHOUT Wikipedia API (keyword guessing only):');
            const difficultyWithoutAPI = await leaderboard.estimateDifficulty(startPage, targetPage, false);
            
            console.log(`\n🎯 Comparison:`);
            console.log(`   With API: ${difficultyWithAPI.toFixed(2)}x difficulty`);
            console.log(`   Without API: ${difficultyWithoutAPI.toFixed(2)}x difficulty`);
            console.log(`   Difference: ${Math.abs(difficultyWithAPI - difficultyWithoutAPI).toFixed(2)}x`);
            
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
        
        console.log('='.repeat(80));
    }
    
    console.log('\n✨ Test Complete!\n');
    console.log('Key Benefits of Wikipedia API Integration:');
    console.log('  ✅ Real category data from Wikipedia');
    console.log('  ✅ More accurate difficulty calculations');
    console.log('  ✅ Better category relationship detection');
    console.log('  ✅ Handles pages with ambiguous names');
    console.log('  ✅ Falls back to keyword guessing if API fails');
}

// Expose function globally so it can be run from console
window.testWikipediaAPI = testWikipediaAPI;

console.log('📚 Wikipedia API Test Loaded!');
console.log('To run the test, open your game page and run: testWikipediaAPI()');
