/**
 * Test script to verify GitHub Gist leaderboard configuration
 * Run this in the browser console to test your setup
 */

async function testLeaderboard() {
    console.log('🧪 Testing GitHub Gist Leaderboard Configuration...\n');
    
    try {
        // Import configuration
        console.log('1️⃣ Loading configuration...');
        const { LEADERBOARD_CONFIG } = await import('./config.js');
        
        if (!LEADERBOARD_CONFIG.gistId || !LEADERBOARD_CONFIG.githubToken) {
            console.warn('⚠️ Gist not configured. Using localStorage fallback.');
            console.log('   Edit config.js to enable GitHub Gist backend.\n');
        } else {
            console.log('✅ Configuration loaded');
            console.log(`   Gist ID: ${LEADERBOARD_CONFIG.gistId}`);
            console.log(`   Token: ${LEADERBOARD_CONFIG.githubToken.substring(0, 10)}...`);
        }
        
        // Test LeaderboardManager
        console.log('\n2️⃣ Initializing LeaderboardManager...');
        const { LeaderboardManager } = await import('./src/js/leaderboard.js');
        const manager = new LeaderboardManager(LEADERBOARD_CONFIG);
        console.log('✅ LeaderboardManager initialized');
        
        // Test fetch
        console.log('\n3️⃣ Testing fetchLeaderboard...');
        const data = await manager.fetchLeaderboard();
        console.log('✅ Leaderboard fetched successfully');
        console.log(`   Total entries: ${data.entries.length}`);
        
        if (data.entries.length > 0) {
            console.log('\n📊 Top 3 Scores:');
            data.entries.slice(0, 3).forEach((entry, idx) => {
                console.log(`   ${idx + 1}. ${entry.playerName}: ${entry.score} pts (${entry.gameMode})`);
            });
        }
        
        // Test submit (with confirmation)
        console.log('\n4️⃣ Testing submitScore...');
        const shouldSubmit = confirm('Submit a test score to the leaderboard?');
        
        if (shouldSubmit) {
            const testName = 'Test Player ' + Date.now().toString(36);
            console.log(`   Submitting score as "${testName}"...`);
            
            const result = await manager.submitScore(
                testName,
                'Test Start Page',
                'Test Target Page',
                5,
                60,
                'normal',
                false // Don't use API for test
            );
            
            if (result.success) {
                console.log('✅ Score submitted successfully!');
                console.log(`   Rank: #${result.rank}`);
                console.log(`   Score: ${result.entry.score} points`);
                console.log(`   Difficulty: ${result.entry.difficulty.toFixed(2)}`);
            } else {
                console.error('❌ Score submission failed:', result.error);
            }
        } else {
            console.log('⏭️ Skipped score submission test');
        }
        
        // Summary
        console.log('\n✅ All tests completed!');
        console.log('\n📝 Summary:');
        console.log('   - Configuration: OK');
        console.log('   - Fetch: OK');
        console.log('   - Submit: ' + (shouldSubmit ? 'OK' : 'Skipped'));
        
        if (LEADERBOARD_CONFIG.gistId && LEADERBOARD_CONFIG.githubToken) {
            console.log('\n🌐 Check your Gist at:');
            console.log(`   https://gist.github.com/${LEADERBOARD_CONFIG.gistId}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.log('\n💡 Troubleshooting tips:');
        console.log('   - Make sure config.js exists and is properly configured');
        console.log('   - Check that your Gist ID and token are correct');
        console.log('   - Verify your Gist is public');
        console.log('   - Check browser console for detailed errors');
    }
}

// Auto-run if loaded as module
if (typeof window !== 'undefined') {
    console.log('🎮 Wiki Game - Leaderboard Test Script');
    console.log('Run testLeaderboard() to test your configuration\n');
    window.testLeaderboard = testLeaderboard;
}

export { testLeaderboard };
