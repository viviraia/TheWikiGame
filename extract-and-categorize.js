const fs = require('fs');

// Read app.js
const content = fs.readFileSync('app.js', 'utf8');

// Extract arrays
const popularMatch = content.match(/const popularPages = \[([\s\S]*?)\];/);
const obscureMatch = content.match(/const obscurePages = \[([\s\S]*?)\];/);
const ultraObscureMatch = content.match(/const ultraObscurePages = \[([\s\S]*?)\];/);

function extractPages(arrayText) {
    const matches = arrayText.matchAll(/"([^"]+)"/g);
    return Array.from(matches, m => m[1].toLowerCase().replace(/_/g, ' '));
}

const popular = extractPages(popularMatch[1]);
const obscure = extractPages(obscureMatch[1]);
const ultraObscure = extractPages(ultraObscureMatch[1]);

console.log('📊 Page Distribution:');
console.log(`  Popular (Easy): ${popular.length}`);
console.log(`  Obscure (Hard): ${obscure.length}`);
console.log(`  Ultra Obscure (Expert): ${ultraObscure.length}`);
console.log(`  Total: ${popular.length + obscure.length + ultraObscure.length}\n`);

// Categorize by topic
function categorize(pages) {
    const categories = {
        geography: [],
        history: [],
        people: [],
        science: [],
        culture: [],
        space: [],
        technology: [],
        nature: [],
        sports: [],
        food: [],
        media: [],
        landmarks: [],
        mythology: [],
        philosophy: [],
        misc: []
    };

    // Keywords for categorization
    const keywords = {
        geography: ['country', 'city', 'river', 'ocean', 'mountain', 'sea', 'continent', 'island', 'desert', 'forest', 'lake', 'empire', 'kingdom', 'valley', 'region', 'province'],
        history: ['war', 'battle', 'revolution', 'empire', 'ancient', 'medieval', 'civilization', 'age', 'period', 'dynasty', 'siege', 'independence', 'unification', 'rebellion', 'crusade'],
        people: ['scientist', 'philosopher', 'artist', 'writer', 'composer', 'poet', 'physicist', 'mathematician', 'emperor', 'king', 'queen', 'president', 'leader', 'inventor'],
        science: ['physics', 'chemistry', 'biology', 'mathematics', 'atom', 'molecule', 'cell', 'quantum', 'theory', 'principle', 'law', 'equation', 'particle', 'gene', 'protein', 'dna', 'evolution', 'ecology'],
        culture: ['art', 'music', 'religion', 'philosophy', 'literature', 'architecture', 'painting', 'sculpture', 'ism', 'movement', 'style', 'technique'],
        space: ['planet', 'star', 'galaxy', 'solar', 'space', 'nasa', 'moon', 'mars', 'jupiter', 'saturn', 'telescope', 'astronaut', 'apollo'],
        technology: ['computer', 'internet', 'software', 'algorithm', 'programming', 'digital', 'web', 'tech', 'electronic'],
        nature: ['animal', 'plant', 'tree', 'flower', 'bird', 'fish', 'mammal', 'species', 'lion', 'tiger', 'elephant', 'whale', 'dolphin', 'dinosaur'],
        sports: ['olympic', 'football', 'basketball', 'tennis', 'cricket', 'sport', 'athlete', 'championship'],
        food: ['food', 'cuisine', 'pizza', 'pasta', 'sushi', 'bread', 'cheese', 'wine', 'beer', 'coffee', 'tea'],
        media: ['film', 'movie', 'tv', 'series', 'novel', 'book', 'game', 'video'],
        landmarks: ['tower', 'temple', 'cathedral', 'mosque', 'palace', 'monument', 'statue', 'wall', 'pyramid'],
        mythology: ['god', 'goddess', 'myth', 'legend', 'hero', 'zeus', 'odin', 'thor'],
        philosophy: ['ontology', 'epistemology', 'ethics', 'metaphysics', 'logic', 'dialectic', 'phenomenology']
    };

    for (const page of pages) {
        let categorized = false;
        
        // Check keywords
        for (const [category, words] of Object.entries(keywords)) {
            if (words.some(word => page.includes(word))) {
                categories[category].push(page);
                categorized = true;
                break;
            }
        }
        
        // Special cases for people (names)
        if (!categorized) {
            // Check if it's likely a person's name (has spaces and capital letters pattern)
            const originalPage = page;
            const words = page.split(' ');
            
            // Famous people indicators
            const peopleIndicators = ['jr', 'sr', 'ii', 'iii', 'von', 'van', 'de', 'da', 'ibn', 'bin'];
            if (peopleIndicators.some(ind => page.includes(ind)) || 
                (words.length >= 2 && words.length <= 4)) {
                categories.people.push(page);
                categorized = true;
            }
        }
        
        if (!categorized) {
            categories.misc.push(page);
        }
    }
    
    return categories;
}

const popularCats = categorize(popular);
const obscureCats = categorize(obscure);
const ultraObscureCats = categorize(ultraObscure);

console.log('📝 Popular Pages by Category:');
for (const [cat, pages] of Object.entries(popularCats)) {
    if (pages.length > 0) {
        console.log(`  ${cat}: ${pages.length}`);
    }
}

console.log('\n📝 Obscure Pages by Category:');
for (const [cat, pages] of Object.entries(obscureCats)) {
    if (pages.length > 0) {
        console.log(`  ${cat}: ${pages.length}`);
    }
}

console.log('\n📝 Ultra Obscure Pages by Category:');
for (const [cat, pages] of Object.entries(ultraObscureCats)) {
    if (pages.length > 0) {
        console.log(`  ${cat}: ${pages.length}`);
    }
}

// Generate the new knowledge base structure
console.log('\n\n🔧 Generating new knowledge base...\n');

function generateCategoryObject(categories, maxSamples = 30) {
    const result = {};
    for (const [cat, pages] of Object.entries(categories)) {
        if (pages.length > 0) {
            // Take a sample if too many pages
            result[cat] = pages.length > maxSamples ? pages.slice(0, maxSamples) : pages;
        }
    }
    return result;
}

const newKnowledgeBase = {
    tiers: {
        mega: {
            popularity: 100,
            categories: {
                core: ['united states', 'world war ii', 'world war i', 'europe', 'asia', 'earth', 
                       'science', 'history', 'human', 'language', 'country', 'city', 'war']
            }
        },
        easy: {
            popularity: 85,
            categories: generateCategoryObject(popularCats, 50)
        },
        hard: {
            popularity: 35,
            categories: generateCategoryObject(obscureCats, 50)
        },
        expert: {
            popularity: 15,
            categories: generateCategoryObject(ultraObscureCats, 50)
        }
    }
};

// Write to file
fs.writeFileSync('new-knowledge-base.json', JSON.stringify(newKnowledgeBase, null, 2));
console.log('✅ New knowledge base saved to new-knowledge-base.json');
console.log('\nℹ️  This file can be used to update the getWikipediaKnowledge() method in leaderboard.js');
