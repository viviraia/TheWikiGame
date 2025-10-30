const fs = require('fs');

// Count pages in app.js
const appContent = fs.readFileSync('app.js', 'utf8');
const appLines = appContent.split('\n');
let inPopularPages = false;
let appPageCount = 0;

for (const line of appLines) {
    if (line.includes('const popularPages = [')) {
        inPopularPages = true;
        continue;
    }
    if (inPopularPages && line.trim() === '];') {
        break;
    }
    if (inPopularPages) {
        // Count quoted strings (pages)
        const matches = line.match(/"[^"]+"/g);
        if (matches) {
            appPageCount += matches.length;
        }
    }
}

console.log('Total pages in app.js popularPages:', appPageCount);

// Count pages in leaderboard.js
const leaderboardContent = fs.readFileSync('leaderboard.js', 'utf8');

// Count all pages in tier structures (both LeaderboardManager and LocalLeaderboard)
const allPageMatches = leaderboardContent.match(/'[a-z][^']*'/g);
const uniquePages = new Set(allPageMatches);

console.log('Total unique page references in leaderboard.js:', uniquePages.size);

// Count by tier in LeaderboardManager
const tierCounts = {
    mega: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0
};

const managerSection = leaderboardContent.match(/class LeaderboardManager[\s\S]*?getWikipediaKnowledge\(\) \{([\s\S]*?)\n    \}\n\n    getPageMetadata/);
if (managerSection) {
    const content = managerSection[1];
    
    // Count mega tier
    const megaMatch = content.match(/mega:[\s\S]*?core: \[([\s\S]*?)\]/);
    if (megaMatch) {
        tierCounts.mega = (megaMatch[1].match(/'[^']+'/g) || []).length;
    }
    
    // Count easy tier
    const easyMatch = content.match(/easy:[\s\S]*?categories: \{([\s\S]*?)\n                    \}/);
    if (easyMatch) {
        tierCounts.easy = (easyMatch[1].match(/'[^']+'/g) || []).length;
    }
    
    // Count medium tier
    const mediumMatch = content.match(/medium:[\s\S]*?categories: \{([\s\S]*?)\n                    \}\n                \},\n                hard:/);
    if (mediumMatch) {
        tierCounts.medium = (mediumMatch[1].match(/'[^']+'/g) || []).length;
    }
    
    // Count hard tier
    const hardMatch = content.match(/hard:[\s\S]*?categories: \{([\s\S]*?)\n                    \}\n                \},\n                expert:/);
    if (hardMatch) {
        tierCounts.hard = (hardMatch[1].match(/'[^']+'/g) || []).length;
    }
    
    // Count expert tier
    const expertMatch = content.match(/expert:[\s\S]*?categories: \{([\s\S]*?)\n                    \}\n                \}/);
    if (expertMatch) {
        tierCounts.expert = (expertMatch[1].match(/'[^']+'/g) || []).length;
    }
}

console.log('\nLeaderboardManager tier distribution:');
console.log('  Mega:', tierCounts.mega);
console.log('  Easy:', tierCounts.easy);
console.log('  Medium:', tierCounts.medium);
console.log('  Hard:', tierCounts.hard);
console.log('  Expert:', tierCounts.expert);
console.log('  Total:', Object.values(tierCounts).reduce((a, b) => a + b, 0));

console.log('\n✅ Page expansion complete!');
