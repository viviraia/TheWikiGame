/**
 * Test script for PageConnectivity API
 * Run with: node scripts/test-connectivity.js
 */

import { PageConnectivity } from '../src/js/modules/PageConnectivity.js';

async function testConnectivity() {
    console.log('Testing PageConnectivity API Integration\n');
    console.log('='.repeat(50));
    
    const connectivity = new PageConnectivity();
    
    // Test pages
    const testPages = [
        { name: 'United_States', expected: 'Very popular, many backlinks' },
        { name: 'Python_(programming_language)', expected: 'Popular, moderate backlinks' },
        { name: 'Quantum_mechanics', expected: 'Moderate popularity' }
    ];
    
    for (const page of testPages) {
        console.log(`\n📄 Testing: ${page.name}`);
        console.log(`Expected: ${page.expected}`);
        console.log('-'.repeat(50));
        
        try {
            // Get views
            const views = await connectivity.getPageViews(page.name, 30);
            console.log(`✓ Page Views (30 days):`);
            console.log(`  Total: ${views.total.toLocaleString()}`);
            console.log(`  Daily Avg: ${views.average.toLocaleString()}`);
            
            // Get backlinks
            const backlinks = await connectivity.getBacklinkCount(page.name);
            console.log(`✓ Backlinks:`);
            console.log(`  Count: ${backlinks.count.toLocaleString()}`);
            console.log(`  Estimated Total: ${backlinks.estimatedTotal.toLocaleString()}`);
            console.log(`  Has More: ${backlinks.hasMore ? 'Yes (500+ backlinks)' : 'No'}`);
            
        } catch (error) {
            console.error(`✗ Error: ${error.message}`);
        }
        
        // Small delay between pages
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Test difficulty calculation
    console.log('\n' + '='.repeat(50));
    console.log('\n🎯 Testing Difficulty Calculation\n');
    
    const routes = [
        { start: 'United_States', target: 'Python_(programming_language)' },
        { start: 'United_States', target: 'Quantum_mechanics' },
    ];
    
    for (const route of routes) {
        console.log(`\nRoute: ${route.start} → ${route.target}`);
        console.log('-'.repeat(50));
        
        try {
            const result = await connectivity.calculateDifficulty(route.start, route.target);
            
            console.log(`✓ Difficulty: ${result.difficulty.toFixed(2)} / 4.0`);
            console.log(`  Rating: ${getDifficultyRating(result.difficulty)}`);
            console.log(`\n  Metrics:`);
            console.log(`    Target Views/day: ${result.metrics.targetViews.toLocaleString()}`);
            console.log(`    Target Backlinks: ${result.metrics.targetBacklinks.toLocaleString()}`);
            console.log(`    Start Backlinks: ${result.metrics.startBacklinks.toLocaleString()}`);
            console.log(`    Popularity Score: ${result.metrics.popularityScore}`);
            console.log(`    Connectivity Score: ${result.metrics.connectivityScore}`);
            
        } catch (error) {
            console.error(`✗ Error: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Testing Complete!\n');
}

function getDifficultyRating(difficulty) {
    if (difficulty >= 3.5) return '⭐⭐⭐⭐ Very Hard';
    if (difficulty >= 2.5) return '⭐⭐⭐ Hard';
    if (difficulty >= 1.5) return '⭐⭐ Medium';
    if (difficulty >= 1.0) return '⭐ Easy';
    return 'Very Easy';
}

// Run tests
testConnectivity().catch(error => {
    console.error('\n❌ Fatal Error:', error);
    process.exit(1);
});
