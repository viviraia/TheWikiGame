/**
 * Manual Integration Test Script
 * Run this to see the new difficulty system in action with real examples
 * 
 * Usage: node tests/manual/test-backlink-difficulty.js
 */

// Mock PageConnectivity with realistic data
class MockPageConnectivity {
    constructor() {
        this.cache = new Map();
    }

    async getPageViews(pageTitle) {
        const mockData = {
            'United_States': { total: 1500000, average: 50000 },
            'World_War_II': { total: 750000, average: 25000 },
            'Python_(programming)': { total: 240000, average: 8000 },
            'Albert_Einstein': { total: 360000, average: 12000 },
            'Quantum_mechanics': { total: 60000, average: 2000 },
            'Medieval_poet': { total: 9000, average: 300 },
            'Breaking_News_2025': { total: 1500000, average: 50000 },
            'Obscure_mathematician': { total: 2400, average: 80 },
            'Rare_species': { total: 750, average: 25 }
        };
        return mockData[pageTitle] || { total: 10000, average: 333 };
    }

    async getBacklinkCount(pageTitle) {
        const mockData = {
            'United_States': { count: 500, estimatedTotal: 15000, hasMore: true },
            'World_War_II': { count: 500, estimatedTotal: 8000, hasMore: true },
            'Python_(programming)': { count: 500, estimatedTotal: 3500, hasMore: true },
            'Albert_Einstein': { count: 500, estimatedTotal: 2000, hasMore: true },
            'Quantum_mechanics': { count: 500, estimatedTotal: 800, hasMore: true },
            'Medieval_poet': { count: 150, estimatedTotal: 150, hasMore: false },
            'Breaking_News_2025': { count: 20, estimatedTotal: 20, hasMore: false },
            'Obscure_mathematician': { count: 45, estimatedTotal: 45, hasMore: false },
            'Rare_species': { count: 8, estimatedTotal: 8, hasMore: false }
        };
        return mockData[pageTitle] || { count: 100, estimatedTotal: 100, hasMore: false };
    }

    async calculateDifficulty(startPage, targetPage) {
        const [targetViews, targetBacklinks, startBacklinks] = await Promise.all([
            this.getPageViews(targetPage),
            this.getBacklinkCount(targetPage),
            this.getBacklinkCount(startPage)
        ]);
        
        const backlinksCount = targetBacklinks.estimatedTotal;
        
        // Calculate backlink difficulty on a tiered scale
        let backlinkDifficulty;
        if (backlinksCount >= 5000) {
            backlinkDifficulty = 1.0;
        } else if (backlinksCount >= 1000) {
            backlinkDifficulty = 1.0 + (5000 - backlinksCount) / 4000 * 0.5;
        } else if (backlinksCount >= 100) {
            backlinkDifficulty = 1.5 + (1000 - backlinksCount) / 900 * 1.0;
        } else if (backlinksCount >= 10) {
            backlinkDifficulty = 2.5 + (100 - backlinksCount) / 90 * 1.0;
        } else {
            backlinkDifficulty = 3.5 + (10 - backlinksCount) / 10 * 0.5;
        }
        
        const viewsCount = targetViews.average;
        let popularityModifier;
        if (viewsCount >= 10000) {
            popularityModifier = 0.0;
        } else if (viewsCount >= 1000) {
            popularityModifier = 0.2;
        } else if (viewsCount >= 100) {
            popularityModifier = 0.4;
        } else {
            popularityModifier = 0.6;
        }
        
        const difficulty = Math.max(1.0, Math.min(4.0, backlinkDifficulty + popularityModifier));
        
        return {
            difficulty: Number(difficulty.toFixed(2)),
            metrics: {
                targetViews: targetViews.average,
                targetBacklinks: targetBacklinks.estimatedTotal,
                startBacklinks: startBacklinks.estimatedTotal,
                backlinkDifficulty: backlinkDifficulty.toFixed(2),
                popularityModifier: popularityModifier.toFixed(2)
            }
        };
    }
}

// Test function
async function runTests() {
    const connectivity = new MockPageConnectivity();
    
    console.log('\n🎯 BACKLINK-BASED DIFFICULTY SYSTEM TEST\n');
    console.log('=' .repeat(80));
    
    const testPages = [
        { name: 'United_States', description: 'Hub page - Very Easy' },
        { name: 'Python_(programming)', description: 'Well-connected - Easy' },
        { name: 'Quantum_mechanics', description: 'Moderately connected - Moderate' },
        { name: 'Breaking_News_2025', description: 'Popular but isolated - Hard' },
        { name: 'Medieval_poet', description: 'Limited connectivity - Moderate/Hard' },
        { name: 'Obscure_mathematician', description: 'Poorly connected - Hard' },
        { name: 'Rare_species', description: 'Barely connected - Very Hard' }
    ];
    
    for (const page of testPages) {
        const result = await connectivity.calculateDifficulty('Start_Page', page.name);
        
        console.log(`\n📄 ${page.name}`);
        console.log(`   ${page.description}`);
        console.log(`   ├─ Backlinks: ${result.metrics.targetBacklinks.toLocaleString()}`);
        console.log(`   ├─ Views/day: ${result.metrics.targetViews.toLocaleString()}`);
        console.log(`   ├─ Backlink Difficulty: ${result.metrics.backlinkDifficulty} (70% weight)`);
        console.log(`   ├─ Popularity Modifier: +${result.metrics.popularityModifier} (30% weight)`);
        console.log(`   └─ FINAL DIFFICULTY: ${result.difficulty} ${getDifficultyEmoji(result.difficulty)}`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Key Insight: Backlinks drive difficulty calculation');
    console.log('   - More backlinks = more paths to reach = EASIER');
    console.log('   - Fewer backlinks = fewer paths = HARDER');
    console.log('   - Views provide minor fine-tuning (+0.0 to +0.6)\n');
    
    // Show comparison
    console.log('📊 COMPARISON: Isolated vs Connected\n');
    
    const news = await connectivity.calculateDifficulty('Start', 'Breaking_News_2025');
    const python = await connectivity.calculateDifficulty('Start', 'Python_(programming)');
    
    console.log('Breaking News Article:');
    console.log(`  50,000 views/day, 20 backlinks → Difficulty: ${news.difficulty} ⚠️  HARD`);
    console.log('  (Popular but isolated - few paths to reach it)\n');
    
    console.log('Python Programming:');
    console.log(`  8,000 views/day, 3,500 backlinks → Difficulty: ${python.difficulty} ✅ EASY`);
    console.log('  (Well-connected - many paths to reach it)\n');
    
    console.log('Despite having 6x more views, the news article is HARDER');
    console.log('because it has 175x FEWER backlinks!\n');
}

function getDifficultyEmoji(difficulty) {
    if (difficulty <= 1.5) return '⭐ (Very Easy)';
    if (difficulty <= 2.0) return '⭐⭐ (Easy)';
    if (difficulty <= 2.5) return '⭐⭐⭐ (Moderate)';
    if (difficulty <= 3.0) return '⭐⭐⭐⭐ (Hard)';
    return '⭐⭐⭐⭐⭐ (Very Hard)';
}

// Run the tests
runTests().catch(console.error);
