// Verification script: Check leaderboard.js tier system alignment
// This script verifies that the leaderboard difficulty system correctly matches app.js

const fs = require('fs');

console.log('🔍 Verifying Leaderboard Tier System Alignment\n');

// Read files
const appJsContent = fs.readFileSync('app.js', 'utf-8');
const leaderboardContent = fs.readFileSync('leaderboard.js', 'utf-8');

// Extract tier system from leaderboard.js
const tierSystemRegex = /const tierValues = \{([^}]+)\}/g;
const tierMatches = [...leaderboardContent.matchAll(tierSystemRegex)];

console.log('✅ Found tier systems in leaderboard.js:', tierMatches.length);

tierMatches.forEach((match, index) => {
    const tiers = match[1].trim().split(',').map(t => t.trim());
    console.log(`\nTier System ${index + 1}:`);
    tiers.forEach(tier => {
        console.log(`  - ${tier}`);
    });
});

// Check for "medium" tier references
const mediumReferences = (leaderboardContent.match(/['"]medium['"]/gi) || []).length;
console.log(`\n🔍 References to "medium" tier: ${mediumReferences}`);

if (mediumReferences > 0) {
    console.log('⚠️  WARNING: Found references to removed "medium" tier!');
    console.log('   Please ensure these are intentional (e.g., in comments or old data handling)');
} else {
    console.log('✅ No references to removed "medium" tier found');
}

// Check tier structure in getWikipediaKnowledge methods
const getWikipediaKnowledgeRegex = /getWikipediaKnowledge\(\)\s*\{[\s\S]*?return\s*\{[\s\S]*?tiers:\s*\{([\s\S]*?)\}\s*\}\s*;/g;
const knowledgeMatches = [...leaderboardContent.matchAll(getWikipediaKnowledgeRegex)];

console.log(`\n✅ Found ${knowledgeMatches.length} getWikipediaKnowledge() methods`);

knowledgeMatches.forEach((match, index) => {
    const tiersContent = match[1];
    const hasMega = tiersContent.includes('mega:');
    const hasEasy = tiersContent.includes('easy:');
    const hasMedium = tiersContent.includes('medium:');
    const hasHard = tiersContent.includes('hard:');
    const hasExpert = tiersContent.includes('expert:');
    
    console.log(`\nMethod ${index + 1} tier structure:`);
    console.log(`  - mega: ${hasMega ? '✅' : '❌'}`);
    console.log(`  - easy: ${hasEasy ? '✅' : '❌'}`);
    console.log(`  - medium: ${hasMedium ? '❌ SHOULD NOT EXIST' : '✅'}`);
    console.log(`  - hard: ${hasHard ? '✅' : '❌'}`);
    console.log(`  - expert: ${hasExpert ? '✅' : '❌'}`);
});

// Count pages in app.js arrays
const popularMatch = appJsContent.match(/const popularPages = \[([\s\S]*?)\];/);
const obscureMatch = appJsContent.match(/const obscurePages = \[([\s\S]*?)\];/);
const ultraObscureMatch = appJsContent.match(/const ultraObscurePages = \[([\s\S]*?)\];/);

if (popularMatch && obscureMatch && ultraObscureMatch) {
    const popularCount = (popularMatch[1].match(/'/g) || []).length / 2;
    const obscureCount = (obscureMatch[1].match(/'/g) || []).length / 2;
    const ultraObscureCount = (ultraObscureMatch[1].match(/'/g) || []).length / 2;
    
    console.log('\n📊 Page counts in app.js:');
    console.log(`  - popularPages (Easy): ${popularCount}`);
    console.log(`  - obscurePages (Hard): ${obscureCount}`);
    console.log(`  - ultraObscurePages (Expert): ${ultraObscureCount}`);
    console.log(`  - Total: ${popularCount + obscureCount + ultraObscureCount}`);
}

// Check calculateTierDifficulty methods
const calcDiffRegex = /calculateTierDifficulty\(startTier, targetTier\)\s*\{[\s\S]*?const tierValues = \{([^}]+)\}/g;
const calcMatches = [...leaderboardContent.matchAll(calcDiffRegex)];

console.log(`\n✅ Found ${calcMatches.length} calculateTierDifficulty() methods`);

calcMatches.forEach((match, index) => {
    const tierValues = match[1].trim();
    const tiers = tierValues.split(',').map(t => t.trim().split(':')[0].replace(/'/g, '').trim());
    console.log(`\nMethod ${index + 1} tier values: ${tiers.join(', ')}`);
    
    if (tiers.includes('medium')) {
        console.log('  ❌ ERROR: Contains removed "medium" tier!');
    } else {
        console.log('  ✅ Correct 4-tier system (mega, easy, hard, expert)');
    }
});

console.log('\n✨ Verification Complete!\n');
